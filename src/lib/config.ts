import type { ServiceId, IconName } from '@/types';

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
  /** Direct WhatsApp API link for initiating conversations */
  whatsappLink: 'https://api.whatsapp.com/send?phone=573016963313',
  /** URL for booking appointments */
  appointmentLink: 'https://bit.ly/3XomYEV',
  /** Business location displayed in footer and NAP schema */
  location: 'Cali, Valle del Cauca, Colombia',
  /** Contact email address */
  email: 'ruben@rivera-refrigeracion.com',
} as const;

/**
 * Social media links for Rivera Refrigeración.
 * Used in the footer and for social sharing.
 */
export const SOCIAL = {
  /** WhatsApp contact link */
  whatsapp: 'https://api.whatsapp.com/send?phone=573016963313',
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
  { name: 'Sobre nosotros', href: '/#about' },
  { name: 'Testimonios', href: '/#reviews' },
  { name: '¿Por qué nosotros?', href: '/#whyus' },
  { name: 'Blog', href: '/blog' },
] as const;

/**
 * Core services offered by Rivera Refrigeración.
 * Each service appears as a card on the homepage services section.
 * The id matches the slug used in dedicated service pages.
 * Icons reference Lucide icon names from the icon component.
 */
export const SERVICES = [
  {
    id: 'aire-acondicionado' as ServiceId,
    title: 'Aire Acondicionado',
    description:
      'Instalamos y reparamos unidades de aire acondicionado para mantener tu hogar u oficina a la temperatura perfecta durante todo el año.',
    icon: 'air-conditioner' as IconName,
  },
  {
    id: 'neveras' as ServiceId,
    title: 'Neveras',
    description:
      'Mantenemos tus alimentos frescos con nuestros servicios de reparación y mantenimiento de refrigeradores de todas las marcas y modelos.',
    icon: 'refrigerator' as IconName,
  },
  {
    id: 'lavadoras' as ServiceId,
    title: 'Lavadoras',
    description:
      'Ofrecemos reparación y mantenimiento para asegurarte que tu lavadora funcione de manera eficiente, ahorrándote tiempo y esfuerzo.',
    icon: 'washing-machine' as IconName,
  },
  {
    id: 'calentadores' as ServiceId,
    title: 'Calentadores',
    description:
      'Instalación, mantenimiento y reparación de calentadores de agua de gas y eléctricos para garantizar agua caliente cuando la necesites.',
    icon: 'flame' as IconName,
  },
] as const;

/**
 * Key value propositions and differentiators.
 * Displayed in the "Why Choose Us" section on the homepage.
 * Icons reference Lucide icon names.
 */
export const WHY_US = [
  {
    title: 'Experiencia y Confiabilidad',
    description:
      'Con décadas de experiencia, Rubén Darío Rivera ha construido una reputación de confianza y calidad en cada trabajo realizado.',
    icon: 'shield-check' as IconName,
  },
  {
    title: 'Atención Personalizada',
    description:
      'Nos enorgullece ofrecer un servicio personalizado y adaptado a las necesidades específicas de cada cliente.',
    icon: 'users' as IconName,
  },
  {
    title: 'Soluciones Rápidas y Efectivas',
    description:
      'Entendemos la importancia de tus electrodomésticos en el día a día, por lo que trabajamos con rapidez y eficiencia para minimizar las molestias.',
    icon: 'clock' as IconName,
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
