# IndexNow

IndexNow avisa a Bing y a otros buscadores cuando cambian las URLs del sitio, sin esperar a que rastreen el sitemap.

## Piezas

- `public/37f1ea6c4640e0433ea7471bfc0db947.txt`: clave de verificación; su contenido es la propia clave. Se sirve en `https://rivera-refrigeracion.com/37f1ea6c4640e0433ea7471bfc0db947.txt`.
- `scripts/indexnow.mjs`: lee `dist/sitemap-*.xml` y envía las URLs a `https://api.indexnow.org/indexnow`. Si la red falla, avisa por consola y termina con código 0, así nunca rompe un build.

## Uso manual

```bash
pnpm build
pnpm indexnow -- --dry-run   # muestra el cuerpo sin enviarlo
pnpm indexnow                # envía de verdad
```

Ejecútalo solo después de que el deploy de producción esté publicado: IndexNow verifica la clave pidiendo el .txt al sitio en vivo.

## Automatizarlo tras el deploy (NO activado)

Netlify no tiene un paso "después del deploy publicado" que corra un script del repo sin configuración extra:

- Un plugin de build (`onSuccess`) corre cuando el build termina, **antes** de que el deploy esté en vivo, así que IndexNow no encontraría aún la clave nueva ni las páginas nuevas. Además exige instalar un plugin desde el panel.
- Un _deploy-succeeded webhook_ o una Netlify Function disparada por ese evento se configura en el panel (Site settings › Build & deploy › Deploy notifications) y necesita una URL receptora.
- Alternativa en GitHub: un workflow que, tras un push a `main`, espere el deploy y ejecute `pnpm build && pnpm indexnow`. Hay que decidir cómo esperar el deploy y no requiere secretos (la clave de IndexNow es pública).

Pendiente de decisión de Juan; no se activó ninguna.
