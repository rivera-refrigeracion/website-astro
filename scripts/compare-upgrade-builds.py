#!/usr/bin/env python3
"""Compare generated page SEO and deployment contracts across two builds."""

from __future__ import annotations

import argparse
import hashlib
import html.parser
import json
import re
import tomllib
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any


EXPECTED_PAGES = 12
PAGE_FIELDS = (
    "title",
    "h1",
    "metas",
    "og",
    "canonical",
    "jsonld",
    "anchors",
    "headings",
    "images",
)
GTM_FILES = (
    "src/lib/gtm-diferido.js",
    "src/lib/medicion.ts",
    "src/components/Analytics.astro",
    "src/components/AnalyticsBody.astro",
)


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.captures: list[dict[str, Any]] = []
        self.titles: list[str] = []
        self.headings: list[dict[str, str]] = []
        self.metas: list[dict[str, str]] = []
        self.canonicals: list[str] = []
        self.jsonld: list[str] = []
        self.anchors: list[str] = []
        self.images: list[dict[str, str]] = []
        self.script_capture: list[str] | None = None

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attrs_map = {key: value or "" for key, value in attrs}
        if tag == "title" or re.fullmatch(r"h[1-6]", tag):
            self.captures.append(
                {
                    "tag": tag,
                    "attrs": attrs_map,
                    "chunks": [],
                }
            )
        elif tag == "meta":
            self.metas.append(dict(sorted(attrs_map.items())))
        elif tag == "link" and "canonical" in attrs_map.get("rel", "").split():
            self.canonicals.append(attrs_map.get("href", ""))
        elif tag == "script" and attrs_map.get("type", "").lower() == (
            "application/ld+json"
        ):
            self.script_capture = []
        elif tag == "a" and "href" in attrs_map:
            self.anchors.append(attrs_map["href"])
        elif tag == "img":
            self.images.append(
                {
                    key: attrs_map.get(key, "")
                    for key in ("alt", "width", "height")
                }
            )

    def handle_endtag(self, tag: str) -> None:
        if self.captures and self.captures[-1]["tag"] == tag:
            capture = self.captures.pop()
            value = normalized_text("".join(capture["chunks"]))
            if tag == "title":
                self.titles.append(value)
            else:
                self.headings.append(
                    {
                        "tag": tag,
                        "id": capture["attrs"].get("id", ""),
                        "text": value,
                    }
                )
        elif tag == "script" and self.script_capture is not None:
            raw = "".join(self.script_capture).strip()
            if raw:
                self.jsonld.append(canonical_json(json.loads(raw)))
            self.script_capture = None

    def handle_data(self, data: str) -> None:
        for capture in self.captures:
            capture["chunks"].append(data)
        if self.script_capture is not None:
            self.script_capture.append(data)

    def result(self) -> dict[str, Any]:
        ordered_metas = sorted(canonical_json(meta) for meta in self.metas)
        og = sorted(
            canonical_json(meta)
            for meta in self.metas
            if meta.get("property", "").lower().startswith("og:")
        )
        return {
            "title": self.titles,
            "h1": [heading["text"] for heading in self.headings if heading["tag"] == "h1"],
            "metas": ordered_metas,
            "og": og,
            "canonical": self.canonicals,
            "jsonld": self.jsonld,
            "anchors": self.anchors,
            "headings": self.headings,
            "images": self.images,
        }


def route_for(path: Path, root: Path) -> str:
    relative = path.relative_to(root).as_posix()
    if relative == "404.html":
        return "/404"
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[: -len("index.html")]
    return "/" + relative


def read_pages(root: Path) -> dict[str, dict[str, Any]]:
    pages: dict[str, dict[str, Any]] = {}
    for path in sorted(root.rglob("*.html")):
        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        pages[route_for(path, root)] = parser.result()
    return pages


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()[:12]


def sitemap_records(root: Path) -> tuple[list[str], dict[str, Any]]:
    urls: list[str] = []
    records: dict[str, Any] = {}
    for path in sorted(root.glob("sitemap*.xml")):
        tree = ET.parse(path)
        for url in tree.iter():
            if url.tag.endswith("}url"):
                fields: dict[str, str] = {}
                for child in url:
                    name = child.tag.rsplit("}", 1)[-1]
                    value = child.text or ""
                    if name == "loc":
                        urls.append(value)
                    elif name != "lastmod":
                        fields[name] = value
                location = next(
                    (child.text or "" for child in url if child.tag.endswith("}loc")),
                    "",
                )
                records[location] = fields
            elif url.tag.endswith("}sitemap"):
                location = next(
                    (child.text or "" for child in url if child.tag.endswith("}loc")),
                    "",
                )
                urls.append(location)
    return sorted(urls), records


def static_file_hash(root: Path, relative: str) -> str:
    content = (root / relative).read_bytes()
    return hashlib.sha256(content).hexdigest()


def deployment_contract(root: Path) -> dict[str, Any]:
    config = tomllib.loads((root / "netlify.toml").read_text(encoding="utf-8"))
    return {
        "build_command": config.get("build", {}).get("command"),
        "publish": config.get("build", {}).get("publish"),
        "redirects": config.get("redirects", []),
        "headers": config.get("headers", []),
    }


def differences(left: Any, right: Any) -> dict[str, tuple[Any, Any]]:
    found: dict[str, tuple[Any, Any]] = {}
    for route in sorted(set(left) | set(right)):
        if route not in left or route not in right:
            found[route] = (left.get(route), right.get(route))
            continue
        for field in PAGE_FIELDS:
            if left[route][field] != right[route][field]:
                found[f"{route} · {field}"] = (left[route][field], right[route][field])
    return found


def compare_pages(left: dict[str, Any], right: dict[str, Any]) -> list[str]:
    lines = [
        "| Ruta | title | H1 | metas | OG | canonical | JSON-LD | enlaces |",
        "|---|---|---|---:|---:|---|---:|---:|",
    ]
    for route in sorted(set(left) | set(right)):
        before = left.get(route)
        after = right.get(route)
        if before is None or after is None:
            lines.append(f"| `{route}` | CAMBIO | CAMBIO | — | — | CAMBIO | — | — |")
            continue
        status = lambda field: "igual" if before[field] == after[field] else "CAMBIO"
        metas = f"{len(before['metas'])} iguales" if status("metas") == "igual" else "CAMBIO"
        og = f"{len(before['og'])} iguales" if status("og") == "igual" else "CAMBIO"
        canonical = "igual" if status("canonical") == "igual" else "CAMBIO"
        jsonld = f"{len(before['jsonld'])} iguales" if status("jsonld") == "igual" else "CAMBIO"
        anchors = f"{len(before['anchors'])} iguales" if status("anchors") == "igual" else "CAMBIO"
        lines.append(
            f"| `{route}` | {status('title')} | {status('h1')} | {metas} | {og} | "
            f"{canonical} | {jsonld} | {anchors} |"
        )
    return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--base-repo", type=Path, required=True)
    parser.add_argument("--candidate-repo", type=Path, required=True)
    parser.add_argument("--base-version", required=True)
    parser.add_argument("--candidate-version", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    before = read_pages(args.before)
    after = read_pages(args.after)
    page_diffs = differences(before, after)
    sitemap_before = sitemap_records(args.before)
    sitemap_after = sitemap_records(args.after)
    sitemap_equal = sitemap_before == sitemap_after
    aux_files = ("robots.txt", "llms.txt")
    static_equal = {
        name: static_file_hash(args.base_repo / "public", name)
        == static_file_hash(args.candidate_repo / "public", name)
        for name in aux_files
    }
    netlify_equal = deployment_contract(args.base_repo) == deployment_contract(
        args.candidate_repo
    )
    gtm_equal = all(
        (args.base_repo / name).read_bytes()
        == (args.candidate_repo / name).read_bytes()
        for name in GTM_FILES
    )
    page_count_equal = len(before) == len(after) == EXPECTED_PAGES
    passes = (
        page_count_equal
        and not page_diffs
        and sitemap_equal
        and all(static_equal.values())
        and netlify_equal
        and gtm_equal
    )

    lines = [
        "# Comparación automática de salida de Astro",
        "",
        f"- Base: `{args.base_version}`",
        f"- Candidato: `{args.candidate_version}`",
        f"- Páginas HTML: {len(before)} antes / {len(after)} después",
        f"- Resultado: **{'PARIDAD' if passes else 'DIFERENCIAS'}**",
        "",
        "## Metadatos, enlaces y encabezados por página",
        "",
        *compare_pages(before, after),
        "",
        "## Contratos del sitio",
        "",
        f"- Sitemap: {'igual' if sitemap_equal else 'CAMBIO'} "
        f"({len(sitemap_before[0])} ubicaciones antes / {len(sitemap_after[0])} después).",
        "  Se comparan ubicaciones y campos por URL; `lastmod` cambia por la "
        "marca de tiempo de build existente en `astro.config.mjs`.",
        f"- `robots.txt`: {'idéntico' if static_equal['robots.txt'] else 'CAMBIO'}.",
        f"- `llms.txt`: {'idéntico' if static_equal['llms.txt'] else 'CAMBIO'}.",
        f"- Redirecciones, cabeceras y comando de Netlify: "
        f"{'idénticos' if netlify_equal else 'CAMBIO'}.",
        f"- Guard de host, carga de GTM y eventos: "
        f"{'archivos idénticos' if gtm_equal else 'CAMBIO'}.",
        "",
    ]
    if page_diffs:
        lines.extend(["## Diferencias detectadas", ""])
        for name, (old, new) in page_diffs.items():
            lines.append(f"### {name}")
            lines.extend(
                [
                    "",
                    "```json",
                    json.dumps(
                        {"antes": old, "después": new},
                        ensure_ascii=False,
                        indent=2,
                    ),
                    "```",
                    "",
                ]
            )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(lines), encoding="utf-8")
    print(
        f"{len(before)} before / {len(after)} after; "
        f"{len(page_diffs)} page-field differences; "
        f"sitemap={'same' if sitemap_equal else 'different'}; "
        f"deployment={'same' if netlify_equal else 'different'}; "
        f"gtm={'same' if gtm_equal else 'different'}"
    )
    return 0 if passes else 1


if __name__ == "__main__":
    raise SystemExit(main())
