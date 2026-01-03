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

export const collections = { blog };
