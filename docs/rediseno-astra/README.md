# Rediseño ASTRA

La portada pasa a una composición editorial con azul profundo, superficies claras, naranja de marca y los equipos existentes. Se conservan el contenido de las páginas y el SEO de `main`.

## Cambios

- Hero con composición de equipos, sello de experiencia y CTA más visible.
- Tarjetas de servicios numeradas y compactas en móvil; bloque de experiencia sin fotografías de Rubén; testimonios y cierre con nueva jerarquía visual.
- Montserrat, Open Sans y logo existentes. Paleta basada en la variante A: `#071f47`, `#0d47a1`, azules claros y naranja.
- Entrada de tarjetas con IntersectionObserver y transiciones nativas entre documentos, sin dependencias de animación. El movimiento nuevo usa exclusivamente transform y opacity. Contenido visible sin JavaScript.
- Movimiento reducido respetado, incluso al cambiar la preferencia en vivo. Foco visible, menú móvil superpuesto sin mover el contenido y cierre mediante Escape con retorno del foco.
- Ajustes visuales de servicios mediante CSS, sin modificar su plantilla ni sus archivos de contenido.
- Puerto E2E configurable para separar sesiones concurrentes. Scripts de Sharp/esbuild autorizados explícitamente para pnpm 11; Netlify conserva pnpm 9.

## Validación

Build de producción (`pnpm build` y `pnpm preview`), Lighthouse CLI, sin bloquear recursos ni modificar sus pesos o umbrales. Informes completos comprimidos y resumen de métricas en `docs/rediseno-astra/`.

| Página                | Perfil     | Rendimiento | Accesibilidad | Buenas prácticas | SEO | CLS |
| --------------------- | ---------- | ----------- | ------------- | ---------------- | --- | --- |
| `/`                   | Móvil      | 100         | 100           | 100              | 100 | 0   |
| `/`                   | Escritorio | 100         | 100           | 100              | 100 | 0   |
| `/servicios/neveras/` | Móvil      | 100         | 100           | 100              | 100 | 0   |
| `/servicios/neveras/` | Escritorio | 100         | 100           | 100              | 100 | 0   |

- `pnpm lint`: verde; permanece una advertencia preexistente de `any` en `tests/e2e/seo.spec.ts`.
- `pnpm check`: 0 errores, 0 advertencias, 0 hints.
- `pnpm test`: 86 pruebas en verde.
- `PLAYWRIGHT_PORT=4541 pnpm test:e2e --workers=2`: 141 pruebas en verde.
- `pnpm test:schema`: datos estructurados válidos en las 11 páginas.
- Pre-commit real ejecutado sin omitir hooks: lint-staged, unitarias y schema:check en verde.
- E2E añadido para movimiento reducido en portada y neveras, móvil y escritorio; preferencia en vivo; teclado, Escape, foco y ausencia de desbordamiento horizontal.
- Comparación del HTML de las 11 páginas contra el build base `ba6f014`: metas, canonical, JSON-LD y encabezados H1–H6 idénticos. Sin cambios en URLs, sitemap, robots, CSP ni archivos de contenido. El sitemap mantiene la fecha de generación dinámica ya existente.
- Las pruebas existentes solo cambian por el CTA y el nuevo tratamiento decorativo del logo: su enlace mantiene el nombre accesible; las imágenes de contenido siguen requiriendo alt no vacío.

## Textos visibles cambiados

- CTA del hero y del cierre: «Agenda tu cita» → «Agende su visita».
- Nuevos microtextos: «Servicio técnico en Cali», «30+», «Años de experiencia», «Hogares y negocios · Cali».
- Etiquetas reutilizadas en nuevas ubicaciones: «Rivera Refrigeración», «Aire acondicionado», «Neveras», «Lavadoras», «Calentadores».
- Numeración decorativa añadida: «R / 01», «01», «02», «03», «04»; signos decorativos «+» y «↗».
- Los títulos, encabezados y párrafos originales se conservan, incluidos aquellos cuyo tono podrá revisar #33. No se reescribió contenido para este rediseño.

## Cruces con otros PR

- **#33**: `src/components/sections/Hero.astro`, `src/components/sections/Services.astro`, `src/components/sections/About.astro`, `tests/e2e/homepage.spec.ts`, `tests/e2e/service-pages.spec.ts`. Al rebasar, conservar el contenido SEO de #33 y las clases/estructura visual de este PR; trasladar los selectores de CTA/logo de las pruebas.
- **#34**: ningún archivo modificado en común. Sus páginas reciben los estilos compartidos, pero sus plantillas y contenido no se tocaron.

## Vistas previas

- Local Tailscale: http://100.83.15.72:4401/ — build de producción en tmux `preview-rediseno-astra`.
- Netlify: el enlace verificado se publica en el PR.

## Reproducir Lighthouse

Lighthouse 12.8.2 con Chrome 138, perfiles estándar móvil y desktop, throttling simulado. Los informes conservan configuración, tiempos y resultados completos.

```sh
pnpm build
pnpm preview --host 0.0.0.0 --port 4401
lighthouse http://localhost:4401/ --chrome-flags="--headless --no-sandbox" --output=json --output-path=home-mobile.json
lighthouse http://localhost:4401/ --preset=desktop --chrome-flags="--headless --no-sandbox" --output=json --output-path=home-desktop.json
# Repetir ambas mediciones para /servicios/neveras/.
gzip -dc docs/rediseno-astra/home-mobile.json.gz > /tmp/home-mobile.json
```

Los informes válidos corresponden al build estable del commit `b917ad7`. Una medición intermedia coincidió con la reconstrucción de `dist` y registró dos 404 de prefetch (96 en buenas prácticas); se descartó por medir un build incompleto y se repitió después de terminar el build.

## Capturas

Capturas completas y del primer viewport, tomadas a 1440×1000 y 390×844. Reproducibles con `node scripts/capturar-rediseno.mjs URL ETIQUETA`.

|            | Antes                                                                                                                                                  | Después                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escritorio | ![Antes escritorio](https://raw.githubusercontent.com/rivera-refrigeracion/website-astro/rediseno/astra/docs/rediseno-astra/antes-desktop-portada.png) | ![Después escritorio](https://raw.githubusercontent.com/rivera-refrigeracion/website-astro/rediseno/astra/docs/rediseno-astra/despues-desktop-portada.png) |
| Móvil      | ![Antes móvil](https://raw.githubusercontent.com/rivera-refrigeracion/website-astro/rediseno/astra/docs/rediseno-astra/antes-mobile-portada.png)       | ![Después móvil](https://raw.githubusercontent.com/rivera-refrigeracion/website-astro/rediseno/astra/docs/rediseno-astra/despues-mobile-portada.png)       |

[Capturas completas e informes](https://github.com/rivera-refrigeracion/website-astro/tree/rediseno/astra/docs/rediseno-astra).

Sin merge ni despliegue de producción.
