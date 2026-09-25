# Comparación automática de salida de Astro

- Base: `5.16.6`
- Candidato: `7.3.5`
- Páginas HTML: 12 antes / 12 después
- Resultado: **PARIDAD**

## Metadatos, enlaces y encabezados por página

| Ruta                                                          | title | H1    |      metas |         OG | canonical |   JSON-LD |    enlaces |
| ------------------------------------------------------------- | ----- | ----- | ---------: | ---------: | --------- | --------: | ---------: |
| `/`                                                           | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 37 iguales |
| `/404`                                                        | igual | igual | 26 iguales | 10 iguales | igual     | 0 iguales | 32 iguales |
| `/blog/`                                                      | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 36 iguales |
| `/blog/5-errores-comunes-al-usar-lavadoras-y-como-evitarlos/` | igual | igual | 32 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/blog/como-saber-si-tu-nevera-necesita-mantenimiento/`       | igual | igual | 32 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/blog/por-que-tu-aire-acondicionado-no-enfria-bien/`         | igual | igual | 32 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/politica-de-privacidad/`                                    | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/servicios/aire-acondicionado/`                              | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/servicios/calentadores/`                                    | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 32 iguales |
| `/servicios/instalacion-aire-acondicionado/`                  | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |
| `/servicios/lavadoras/`                                       | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 32 iguales |
| `/servicios/neveras/`                                         | igual | igual | 25 iguales | 10 iguales | igual     | 1 iguales | 33 iguales |

## Contratos del sitio

- Sitemap: igual (12 ubicaciones antes / 12 después).
  Se comparan ubicaciones y campos por URL; `lastmod` cambia por la marca de tiempo de build existente en `astro.config.mjs`.
- `robots.txt`: idéntico.
- `llms.txt`: idéntico.
- Redirecciones, cabeceras y comando de Netlify: idénticos.
- Guard de host, carga de GTM y eventos: archivos idénticos.

## Lighthouse

Mediana de corridas locales con Lighthouse 13.5.0 y Chromium 153.0.8010.12.
La portada móvil y neveras móvil usan 5 corridas por build; las demás usan 3.

| Página      | Dispositivo | Astro 5 | Astro 7 |   Δ | Accesibilidad | Prácticas | SEO |   n |
| ----------- | ----------- | ------: | ------: | --: | ------------: | --------: | --: | --: |
| Portada     | Móvil       |      99 |     100 |  +1 |           100 |       100 | 100 |   5 |
| Portada     | Escritorio  |     100 |     100 |   0 |           100 |       100 | 100 |   3 |
| Neveras     | Móvil       |      97 |      99 |  +2 |           100 |       100 | 100 |   5 |
| Neveras     | Escritorio  |     100 |     100 |   0 |           100 |       100 | 100 |   3 |
| Instalación | Móvil       |      99 |      99 |   0 |           100 |       100 | 100 |   3 |
| Instalación | Escritorio  |     100 |     100 |   0 |           100 |       100 | 100 |   3 |

## Comparación visual y movimiento

Las capturas de página completa conservan dimensiones idénticas en ambas builds.
Los píxeles distintos representan entre 0,32 % y 0,87 % por vista; ningún canal
RGB difiere más de 12/255. Los valores son compatibles con diferencias de
rasterización. Las propiedades computadas de animación y transición (nombre,
duración, demora, temporización, iteraciones y modo de relleno) coinciden en las
tres rutas.

| Página      |  Móvil | Escritorio |
| ----------- | -----: | ---------: |
| Portada     | 0,87 % |     0,32 % |
| Neveras     | 0,39 % |     0,38 % |
| Instalación | 0,54 % |     0,47 % |
