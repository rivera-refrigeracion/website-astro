#!/usr/bin/env node
/**
 * Avisa a IndexNow de las URLs del sitio leyendo los sitemaps de dist/.
 *
 * Uso manual, después de `pnpm build`:  node scripts/indexnow.mjs
 * Con --dry-run solo imprime lo que enviaría.
 *
 * Nunca falla el proceso por problemas de red: avisar a IndexNow es
 * opcional y no debe tumbar un build ni un deploy.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const HOST = 'rivera-refrigeracion.com';
const KEY = '37f1ea6c4640e0433ea7471bfc0db947';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DIST = new URL('../dist/', import.meta.url).pathname;
const DRY_RUN = process.argv.includes('--dry-run');

async function leerUrls() {
  const archivos = (await readdir(DIST)).filter(
    (f) => /^sitemap-.*\.xml$/.test(f) && f !== 'sitemap-index.xml'
  );
  const urls = new Set();
  for (const archivo of archivos) {
    const xml = await readFile(join(DIST, archivo), 'utf8');
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(loc.trim());
    }
  }
  return [...urls];
}

async function main() {
  const urlList = await leerUrls();
  if (urlList.length === 0) {
    console.warn(
      'IndexNow: no hay URLs en dist/sitemap-*.xml; nada que enviar.'
    );
    return;
  }
  const cuerpo = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  if (DRY_RUN) {
    console.log(JSON.stringify(cuerpo, null, 2));
    return;
  }
  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(15_000),
  });
  console.log(
    `IndexNow: ${urlList.length} URLs enviadas, HTTP ${respuesta.status}`
  );
}

try {
  await main();
} catch (error) {
  console.warn('IndexNow: no se pudo avisar:', error.message);
}
