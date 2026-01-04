import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().default('Rivera Refrigeracion'),
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
    title: z.string(),
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

    // Pricing
    pricing: z.object({
      inspection: z.string(),
      hourlyRate: z.string().optional(),
      notes: z.string().optional(),
    }),
  }),
});

export const collections = { blog, services };
