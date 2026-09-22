import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().default('Rivera Refrigeración'),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    imagePosition: z.enum(['top', 'inline']).default('top'),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic info
    /** Nombre corto del servicio: navegación, pie y tarjetas de la home. */
    title: z.string(),
    /**
     * Encabezado de la página de servicio. Va aparte de `title` porque el H1
     * es la señal de tema más fuerte que tiene la página y necesita intención
     * local ("Reparación de neveras en Cali a domicilio"), mientras que en una
     * tarjeta o en el menú eso sobra (auditoría 2026-09-22, A8).
     */
    h1: z.string(),
    shortDescription: z.string(),
    icon: z.string(),

    // SEO
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),

    // Images
    heroImage: z.object({
      url: z.string(),
      alt: z.string(),
    }),

    // Imagen de previsualización social. Va separada de heroImage porque las
    // dos tienen requisitos distintos: el hero es cuadrado y en WebP, y
    // WhatsApp —el canal por el que cierra este negocio— necesita JPEG de
    // 1200x630 (auditoría 2026-09-22, A5).
    ogImage: z.object({
      url: z.string(),
      alt: z.string(),
    }),

    // Brands serviced
    brands: z.array(
      z.object({
        name: z.string(),
        logo: z.string().optional(),
      })
    ),

    // Process/methodology (4 steps)
    process: z.array(
      z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
      })
    ),

    // FAQs
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),

    // Service areas
    serviceAreas: z.array(z.string()),
  }),
});

export const collections = { blog, services };
