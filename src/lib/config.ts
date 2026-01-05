export const SITE = {
  name: 'Rivera Refrigeración',
  title:
    'Rivera Refrigeración - Expertos en Aire Acondicionado y Electrodomésticos',
  description:
    'Más de 30 años de experiencia en instalación, mantenimiento y reparación de aire acondicionado, neveras, lavadoras y calentadores en Cali, Colombia.',
  url: 'https://rivera-refrigeracion.com',
  author: 'Rivera Refrigeración',
  locale: 'es_CO',
  language: 'es',
} as const;

export const CONTACT = {
  phone: '+573173095159',
  whatsapp: '573016963313',
  whatsappLink: 'https://api.whatsapp.com/send?phone=573016963313',
  appointmentLink: 'https://bit.ly/3XomYEV',
  location: 'Cali, Valle del Cauca, Colombia',
  email: 'ruben@rivera-refrigeracion.com',
} as const;

export const SOCIAL = {
  whatsapp: 'https://api.whatsapp.com/send?phone=573016963313',
  facebook: 'https://www.facebook.com/profile.php?id=61564032905797',
  instagram: 'https://instagram.com/rivera.refrigeracion',
} as const;

export const NAVIGATION = [
  { name: 'Inicio', href: '/' },
  { name: 'Servicios', href: '/#services' },
  { name: 'Sobre nosotros', href: '/#about' },
  { name: 'Testimonios', href: '/#reviews' },
  { name: '¿Por qué nosotros?', href: '/#whyus' },
  { name: 'Blog', href: '/blog' },
] as const;

export const SERVICES = [
  {
    id: 'aire-acondicionado',
    title: 'Aire Acondicionado',
    description:
      'Instalamos y reparamos unidades de aire acondicionado para mantener tu hogar u oficina a la temperatura perfecta durante todo el año.',
    icon: 'air-conditioner',
  },
  {
    id: 'neveras',
    title: 'Neveras',
    description:
      'Mantenemos tus alimentos frescos con nuestros servicios de reparación y mantenimiento de refrigeradores de todas las marcas y modelos.',
    icon: 'refrigerator',
  },
  {
    id: 'lavadoras',
    title: 'Lavadoras',
    description:
      'Ofrecemos reparación y mantenimiento para asegurarte que tu lavadora funcione de manera eficiente, ahorrándote tiempo y esfuerzo.',
    icon: 'washing-machine',
  },
  {
    id: 'calentadores',
    title: 'Calentadores',
    description:
      'Instalación, mantenimiento y reparación de calentadores de agua de gas y eléctricos para garantizar agua caliente cuando la necesites.',
    icon: 'flame',
  },
] as const;

export const WHY_US = [
  {
    title: 'Experiencia y Confiabilidad',
    description:
      'Con décadas de experiencia, Rubén Darío Rivera ha construido una reputación de confianza y calidad en cada trabajo realizado.',
    icon: 'shield-check',
  },
  {
    title: 'Atención Personalizada',
    description:
      'Nos enorgullece ofrecer un servicio personalizado y adaptado a las necesidades específicas de cada cliente.',
    icon: 'users',
  },
  {
    title: 'Soluciones Rápidas y Efectivas',
    description:
      'Entendemos la importancia de tus electrodomésticos en el día a día, por lo que trabajamos con rapidez y eficiencia para minimizar las molestias.',
    icon: 'clock',
  },
] as const;

export const TESTIMONIALS = [
  {
    text: 'Excelente servicio y profesionalismo. El señor Rubén Darío Rivera solucionó el problema de mi aire acondicionado de manera rápida y eficiente. Su experiencia y atención al cliente son inigualables. Sin duda, lo recomiendo en Cali.',
    author: 'Santiago Martínez',
  },
] as const;
