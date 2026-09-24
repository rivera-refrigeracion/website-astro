/**
 * Site-wide configuration and metadata.
 * Used for SEO, Open Graph tags, and general site information.
 */
export const SITE = {
  /** Business name displayed throughout the site */
  name: 'Rivera Refrigeración',
  /** Full page title used as default for meta tags */
  title:
    'Rivera Refrigeración - Expertos en Aire Acondicionado y Electrodomésticos',
  /** Site description for meta tags and SEO */
  description:
    'Más de 30 años de experiencia en instalación, mantenimiento y reparación de aire acondicionado, neveras, lavadoras y calentadores en Cali, Colombia.',
  /** Production site URL (no trailing slash) */
  url: 'https://rivera-refrigeracion.com',
  /** Default author name for articles */
  author: 'Rivera Refrigeración',
  /** Locale code for Open Graph (Spanish - Colombia) */
  locale: 'es_CO',
  /** Language code for HTML lang attribute */
  language: 'es',
} as const;

/**
 * Contact information for Rivera Refrigeración.
 * Used in the header, footer, and contact sections.
 */
export const CONTACT = {
  /** Primary phone number with country code (+57) */
  phone: '+573173095159',
  /** WhatsApp number (without + or country code prefix) */
  whatsapp: '573016963313',
  /**
   * Enlace canónico de WhatsApp, sin mensaje. Para los botones usa
   * `whatsappUrl()` de `@/lib/utils`, que añade el mensaje y el origen.
   *
   * Todo el sitio usa el formato `wa.me`: antes convivían
   * `api.whatsapp.com/send`, `wa.me` y un acortador de bit.ly, y el disparador
   * de `whatsapp_click` en GTM sólo reconocía el primero.
   */
  whatsappLink: 'https://wa.me/573016963313',
  /**
   * Mensaje con el que arranca la conversación desde los botones de "Agenda
   * tu cita". Es el texto al que ya redirigía el acortador bit.ly/3XomYEV.
   */
  whatsappMessage: '¡Hola! Quiero contratar sus servicios.',
  /** Business location displayed in footer and NAP schema */
  location: 'Cali, Valle del Cauca, Colombia',
  /** Contact email address */
  email: 'ruben@rivera-refrigeracion.com',
} as const;

/**
 * Dirección pública del negocio. No hay dirección de calle porque el servicio
 * es a domicilio; la ciudad es lo que se muestra en el pie y lo que declara el
 * schema.
 */
export const ADDRESS = {
  locality: 'Cali',
  region: 'Valle del Cauca',
  /** ISO 3166-1 alfa-2, el formato que pide Google en addressCountry */
  country: 'CO',
  /** ISO 3166-2, para la meta geo.region */
  regionCode: 'CO-VAC',
} as const;

/** Coordenadas del centro de Cali, las mismas de las metas geo.* */
export const GEO = {
  latitude: 3.4516467,
  longitude: -76.5319854,
} as const;

/**
 * Horario de atención. El pie lo muestra y el schema lo declara: sale de aquí
 * para que lo visible y lo estructurado no se separen.
 */
export const HOURS = {
  days: 'Lunes - Viernes',
  time: '8:00 AM - 6:00 PM',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  opens: '08:00',
  closes: '18:00',
} as const;

/**
 * Social media links for Rivera Refrigeración.
 * Used in the footer and for social sharing.
 */
export const SOCIAL = {
  /** WhatsApp contact link */
  whatsapp: 'https://wa.me/573016963313',
  /** Facebook business page URL */
  facebook: 'https://www.facebook.com/profile.php?id=61564032905797',
  /** Instagram profile URL */
  instagram: 'https://instagram.com/rivera.refrigeracion',
} as const;

/**
 * Main navigation menu items.
 * Used in the header navigation bar and mobile menu.
 * Order determines display order in the navigation.
 */
export const NAVIGATION = [
  { name: 'Inicio', href: '/' },
  { name: 'Servicios', href: '/#services' },
  {
    name: 'Instalación de aire',
    href: '/servicios/instalacion-aire-acondicionado/',
  },
  { name: 'Sobre nosotros', href: '/#about' },
  { name: 'Testimonios', href: '/#reviews' },
  { name: '¿Por qué nosotros?', href: '/#whyus' },
  { name: 'Blog', href: '/blog/' },
] as const;

/**
 * Core services offered by Rivera Refrigeración.
 * Each service appears as a card on the homepage services section.
 * The id matches the slug used in dedicated service pages.
 * Icons reference Lucide icon names from the icon component.
 */
export const SERVICES = [
  {
    id: 'aire-acondicionado',
    title: 'Aire Acondicionado',
    anchorText: 'Reparación de aire acondicionado en Cali',
    description:
      'Diagnóstico a domicilio, presupuesto antes de empezar y prueba final del equipo.',
    icon: 'air-conditioner',
  },
  {
    id: 'neveras',
    title: 'Neveras',
    anchorText: 'Reparación de neveras y refrigeradores en Cali',
    description:
      'Revisión del equipo, presupuesto previo y comprobación de funcionamiento.',
    icon: 'refrigerator',
  },
  {
    id: 'lavadoras',
    title: 'Lavadoras',
    anchorText: 'Reparación de lavadoras en Cali',
    description:
      'Atención a domicilio para identificar fallas de llenado, drenaje, centrifugado y más.',
    icon: 'washing-machine',
  },
  {
    id: 'calentadores',
    title: 'Calentadores',
    anchorText: 'Instalación y reparación de calentadores en Cali',
    description:
      'Revisión del equipo y del lugar, con alcance y presupuesto antes de empezar.',
    icon: 'flame',
  },
  {
    id: 'instalacion-aire-acondicionado',
    title: 'Instalación de aire acondicionado en Cali',
    anchorText: 'Instalación de aire acondicionado en Cali',
    description:
      'Evaluación del equipo y el espacio, cotización previa y prueba final.',
    icon: 'air-conditioner',
  },
] as const;

/**
 * Key value propositions and differentiators.
 * Displayed in the "Why Choose Us" section on the homepage.
 * Icons reference Lucide icon names.
 */
export const WHY_US = [
  {
    title: 'Servicio técnico en Cali',
    description:
      'Rivera Refrigeración cuenta con más de treinta años de servicio en Cali.',
    icon: 'shield-check',
  },
  {
    title: 'Presupuesto antes de empezar',
    description:
      'Se explica el trabajo y su costo para que usted decida si continúa.',
    icon: 'users',
  },
  {
    title: 'Prueba al terminar',
    description:
      'El funcionamiento del equipo se comprueba al finalizar el trabajo acordado.',
    icon: 'clock',
  },
] as const;

/**
 * Customer testimonials and reviews.
 * Displayed in the testimonials section on the homepage.
 * Add new testimonials to this array to feature them on the site.
 */
export const TESTIMONIALS = [
  {
    text: 'Excelente servicio y profesionalismo. El señor Rubén Darío Rivera solucionó el problema de mi aire acondicionado de manera rápida y eficiente. Su experiencia y atención al cliente son inigualables. Sin duda, lo recomiendo en Cali.',
    author: 'Santiago Martínez',
  },
] as const;
