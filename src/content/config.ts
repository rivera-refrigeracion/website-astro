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
    relatedService: z
      .enum([
        'aire-acondicionado',
        'instalacion-aire-acondicionado',
        'calentadores',
        'neveras',
        'lavadoras',
      ])
      .optional(),
    draft: z.boolean().default(false),
  }),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic info
    /** Rótulo editorial del servicio para tarjetas, menús y enlaces. */
    title: z.string(),
    /**
     * Encabezado amplio de la página de servicio, con las distintas labores
     * que atiende Rivera Refrigeración.
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
