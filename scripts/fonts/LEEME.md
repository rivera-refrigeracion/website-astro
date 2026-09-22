# Fuentes para la generación de imágenes sociales

`Montserrat-latin.woff2` y `OpenSans-latin.woff2` son los subconjuntos latinos
(U+0000–00FF, que cubre tildes y eñes) de las familias que ya usa el sitio.
Están aquí, y no descargados en cada ejecución, para que
`scripts/generar-og.mjs` produzca exactamente la misma imagen hoy y dentro de
dos años, sin depender de la red ni de las fuentes instaladas en la máquina.

Ambas se distribuyen bajo la SIL Open Font License 1.1, que permite
redistribuirlas embebidas: <https://openfontlicense.org>.

No se sirven al navegador: sólo las lee el script de generación.
