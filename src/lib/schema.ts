/**
 * Datos estructurados (schema.org) del sitio.
 *
 * Es la única fuente: cada página emite un solo bloque JSON-LD con un @graph
 * cuyos nodos se enlazan por @id. Antes convivían tres LocalBusiness por
 * página (publisher en el <head>, provider en los servicios y microdata en el
 * pie) con datos distintos, y el microdata tomaba el href "mailto:" como valor
 * del email, que validator.schema.org rechaza.
 *
 * Lo valida `pnpm test:schema` sobre el build (scripts/validar-schema.mjs).
 */
import type {
  AdministrativeArea,
  BlogPosting,
  BreadcrumbList,
  City,
  Graph,
  IdReference,
  LocalBusiness,
  Place,
  Question,
  Service,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';
import { ADDRESS, CONTACT, GEO, HOURS, SITE, SOCIAL } from '@/lib/config';

export const NEGOCIO_ID = `${SITE.url}/#negocio`;
export const SITIO_ID = `${SITE.url}/#sitio`;
const IDIOMA = 'es-CO';

export const ref = (id: string): IdReference => ({ '@id': id });
export const urlAbsoluta = (ruta: string) => new URL(ruta, SITE.url).toString();

export const idPagina = (url: string) => `${url}#pagina`;
export const idMigas = (url: string) => `${url}#migas`;
export const idArticulo = (url: string) => `${url}#articulo`;
export const idServicio = (url: string) => `${url}#servicio`;

export const OFERTAS_CATALOGO = [
  {
    slug: 'aire-acondicionado',
    fragmento: 'servicio',
    nombre: 'Reparación de aire acondicionado',
    tipo: 'Reparación de aire acondicionado',
    descripcion:
      'Diagnóstico, presupuesto previo, reparación acordada y prueba final del equipo.',
  },
  {
    slug: 'instalacion-aire-acondicionado',
    fragmento: 'servicio',
    nombre: 'Instalación de aire acondicionado',
    tipo: 'Instalación de aire acondicionado',
    descripcion:
      'Revisión del equipo y el espacio, alcance y presupuesto antes de empezar.',
  },
  {
    slug: 'aire-acondicionado',
    fragmento: 'servicio-mantenimiento',
    nombre: 'Mantenimiento de aire acondicionado',
    tipo: 'Mantenimiento de aire acondicionado',
    descripcion:
      'Visita para revisar el equipo y confirmar el trabajo de mantenimiento requerido.',
  },
  {
    slug: 'neveras',
    fragmento: 'servicio',
    nombre: 'Reparación de neveras y refrigeradores',
    tipo: 'Reparación de neveras y refrigeradores',
    descripcion:
      'Revisión para identificar la falla, presupuestar la reparación y probar el equipo.',
  },
  {
    slug: 'lavadoras',
    fragmento: 'servicio',
    nombre: 'Reparación de lavadoras',
    tipo: 'Reparación de lavadoras',
    descripcion:
      'Diagnóstico a domicilio, presupuesto previo y prueba de funcionamiento.',
  },
  {
    slug: 'calentadores',
    fragmento: 'servicio',
    nombre: 'Instalación de calentadores',
    tipo: 'Instalación de calentadores',
    descripcion:
      'Revisión del equipo y del lugar para confirmar el alcance de la instalación.',
  },
  {
    slug: 'calentadores',
    fragmento: 'servicio-reparacion',
    nombre: 'Reparación de calentadores',
    tipo: 'Reparación de calentadores',
    descripcion:
      'Revisión del equipo para identificar la falla y definir si procede una reparación.',
  },
] as const;

export type OfertaCatalogo = (typeof OFERTAS_CATALOGO)[number];

export const idOferta = (oferta: OfertaCatalogo) =>
  `${urlAbsoluta(`/servicios/${oferta.slug}/`)}#${oferta.fragmento}`;

// --- Zonas de cobertura -----------------------------------------------------

const VALLE: AdministrativeArea = {
  '@type': 'AdministrativeArea',
  name: ADDRESS.region,
};
const CALI: City = {
  '@type': 'City',
  name: ADDRESS.locality,
  containedInPlace: VALLE,
};

/** Rótulos del frontmatter que significan "toda Cali", no un barrio. */
const TODA_CALI = new Set([
  'Toda la ciudad de Cali',
  'Todo Cali',
  'Cali y alrededores',
]);
/** Municipios vecinos: son ciudades del Valle, no barrios de Cali. */
const MUNICIPIOS = new Set(['Jamundí', 'Yumbo', 'Palmira']);

const municipio = (nombre: string): City => ({
  '@type': 'City',
  name: nombre,
  containedInPlace: VALLE,
});

/**
 * Convierte un rótulo de `serviceAreas` en un lugar de schema.org. La lista
 * mezcla la ciudad, municipios vecinos y barrios o zonas de Cali; declarar
 * Yumbo o Palmira como "lugar dentro de Cali" sería falso.
 */
export function zonaAtendida(zona: string): City | Place {
  if (TODA_CALI.has(zona)) return CALI;
  if (MUNICIPIOS.has(zona)) return municipio(zona);
  return { '@type': 'Place', name: zona, containedInPlace: CALI };
}

/** Cali y los municipios de todas las zonas, sin barrios ni repetidos. */
export function ciudadesAtendidas(zonas: readonly string[]): City[] {
  const municipios = new Set(zonas.filter((z) => MUNICIPIOS.has(z)));
  return [CALI, ...[...municipios].map(municipio)];
}

// --- Nodos ------------------------------------------------------------------

export interface ServicioResumen {
  slug: string;
  title: string;
  serviceAreas: readonly string[];
}

/**
 * `logo` es una URL absoluta: el archivo lo genera Astro desde src/assets y su
 * nombre lleva hash, así que no se puede escribir aquí a mano.
 */
export function negocio(
  servicios: readonly ServicioResumen[],
  logo: string
): LocalBusiness {
  return {
    '@type': 'LocalBusiness',
    '@id': NEGOCIO_ID,
    name: SITE.name,
    description: SITE.description,
    url: `${SITE.url}/`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    image: urlAbsoluta('/images/og-default.jpg'),
    logo,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    areaServed: ciudadesAtendidas(servicios.flatMap((s) => s.serviceAreas)),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: HOURS.dayOfWeek.map(
        (dia) => `https://schema.org/${dia}` as const
      ),
      opens: HOURS.opens,
      closes: HOURS.closes,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: CONTACT.phone,
        email: CONTACT.email,
        availableLanguage: 'es',
      },
      {
        // El pie lo rotula "WhatsApp (Agendamiento)": es el canal de citas.
        '@type': 'ContactPoint',
        contactType: 'reservations',
        telephone: `+${CONTACT.whatsapp}`,
        url: CONTACT.whatsappLink,
        availableLanguage: 'es',
      },
    ],
    sameAs: [SOCIAL.facebook, SOCIAL.instagram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios',
      itemListElement: OFERTAS_CATALOGO.map((oferta) => ({
        '@type': 'Offer',
        '@id': `${SITE.url}/#oferta-${oferta.slug}-${oferta.fragmento}`,
        itemOffered: ref(idOferta(oferta)),
      })),
    },
  };
}

export function sitio(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': SITIO_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: IDIOMA,
    publisher: ref(NEGOCIO_ID),
  };
}

export type TipoDePagina = 'WebPage' | 'CollectionPage' | 'FAQPage';

export function pagina(opciones: {
  url: string;
  tipo?: TipoDePagina;
  nombre: string;
  descripcion: string;
  imagen: string;
  conMigas: boolean;
  extra?: Record<string, unknown>;
}): WebPage {
  return {
    '@type': opciones.tipo ?? 'WebPage',
    '@id': idPagina(opciones.url),
    url: opciones.url,
    name: opciones.nombre,
    description: opciones.descripcion,
    inLanguage: IDIOMA,
    isPartOf: ref(SITIO_ID),
    primaryImageOfPage: { '@type': 'ImageObject', url: opciones.imagen },
    ...(opciones.conMigas && { breadcrumb: ref(idMigas(opciones.url)) }),
    ...opciones.extra,
  } as WebPage;
}

export interface Miga {
  name: string;
  /** Ruta con barra final, como las URLs reales del sitio. */
  path: string;
}

export function migas(url: string, items: readonly Miga[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': idMigas(url),
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: urlAbsoluta(item.path),
    })),
  };
}

export function articulo(opciones: {
  url: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  publicado: string;
  modificado?: string;
  autor: string;
  seccion?: string;
  etiquetas?: readonly string[];
}): BlogPosting {
  // Los artículos los firma el negocio: se enlaza la entidad en lugar de
  // inventar una Person llamada "Rivera Refrigeración".
  const autor =
    opciones.autor === SITE.name
      ? ref(NEGOCIO_ID)
      : { '@type': 'Person' as const, name: opciones.autor };
  return {
    '@type': 'BlogPosting',
    '@id': idArticulo(opciones.url),
    headline: opciones.titulo,
    description: opciones.descripcion,
    image: opciones.imagen,
    datePublished: opciones.publicado,
    dateModified: opciones.modificado ?? opciones.publicado,
    author: autor,
    publisher: ref(NEGOCIO_ID),
    mainEntityOfPage: ref(idPagina(opciones.url)),
    isPartOf: ref(SITIO_ID),
    inLanguage: IDIOMA,
    ...(opciones.seccion && { articleSection: opciones.seccion }),
    ...(opciones.etiquetas?.length && {
      keywords: opciones.etiquetas.join(', '),
    }),
  };
}

export function servicio(opciones: {
  id?: string;
  url: string;
  nombre: string;
  tipo?: string;
  descripcion: string;
  imagen?: string;
  zonas: readonly string[];
}): Service {
  return {
    '@type': 'Service',
    '@id': opciones.id ?? idServicio(opciones.url),
    name: opciones.nombre,
    serviceType: opciones.tipo ?? opciones.nombre,
    description: opciones.descripcion,
    url: opciones.url,
    ...(opciones.imagen && { image: opciones.imagen }),
    provider: ref(NEGOCIO_ID),
    areaServed: opciones.zonas.map(zonaAtendida),
  };
}

export function preguntas(
  faqs: readonly { question: string; answer: string }[]
): Question[] {
  return faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  }));
}

export function grafo(nodos: readonly Thing[]): Graph {
  return { '@context': 'https://schema.org', '@graph': nodos };
}
