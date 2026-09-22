import type { ImageMetadata } from 'astro';

/**
 * Las imágenes que se pintan en la página viven en src/assets para que Astro
 * las convierta a AVIF/WebP y a los anchos que se muestran. El contenido
 * (frontmatter de servicios y blog) las sigue nombrando con su ruta pública
 * de siempre, "/images/...", y aquí se traduce esa ruta al archivo importado.
 */
const IMAGENES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
  { eager: true }
);

export function imagenLocal(ruta: string): ImageMetadata {
  const modulo = IMAGENES[`/src/assets${ruta}`];
  if (!modulo) {
    throw new Error(
      `La imagen ${ruta} no está en src/assets${ruta}; muévala allí para que se optimice.`
    );
  }
  return modulo.default;
}
