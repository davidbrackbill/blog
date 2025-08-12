import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    demo: z.string().optional(),
    github: z.string().optional(),
    image: z.string().optional(),
    priority: z.number().optional(),
  }),
});

export const collections = {
  projects,
};
