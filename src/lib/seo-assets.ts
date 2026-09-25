// Estas rutas ya están publicadas en metadatos que consumen buscadores y redes.
// Sus archivos viven en public/_astro para conservarlas al regenerar assets.
const RUTAS_IMAGENES_SEO = {
  logo: '/_astro/logo.BOHm7OPF_2qbu4H.png',
  blog: {
    '5-errores-comunes-al-usar-lavadoras-y-como-evitarlos':
      '/_astro/errores-lavadora.BlcArfJE_19h3N0.jpg',
    'como-saber-si-tu-nevera-necesita-mantenimiento':
      '/_astro/nevera-mantenimiento.Bz6ASWb9_4UczS.jpg',
    'por-que-tu-aire-acondicionado-no-enfria-bien':
      '/_astro/aire-acondicionado-no-enfria.CJE6nkZy_Z1ITJrW.jpg',
  },
  servicios: {
    'aire-acondicionado': '/_astro/aire-acondicionado.WGjFK7lm_1ogqQU.jpg',
    calentadores: '/_astro/calentadores.C_fizLKW_Z1BA3R5.jpg',
    'instalacion-aire-acondicionado':
      '/_astro/aire-acondicionado.WGjFK7lm_1ogqQU.jpg',
    lavadoras: '/_astro/lavadora.DavURGIK_19NaUd.jpg',
    neveras: '/_astro/nevera.DPs7C7lx_ZvelY6.jpg',
  },
} as const;

export const LOGO_NEGOCIO_SEO = RUTAS_IMAGENES_SEO.logo;

export function imagenSeoArticulo(id: string): string | undefined {
  return RUTAS_IMAGENES_SEO.blog[id as keyof typeof RUTAS_IMAGENES_SEO.blog];
}

export function imagenSeoServicio(id: string): string | undefined {
  return RUTAS_IMAGENES_SEO.servicios[
    id as keyof typeof RUTAS_IMAGENES_SEO.servicios
  ];
}
