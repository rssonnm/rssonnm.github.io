import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collection: every file in `src/content/posts/*.md` becomes a note.
 *
 * Frontmatter fields:
 *   title       — required, shown as heading + in lists
 *   date        — required, ISO date, used for ordering
 *   description — required, one-line summary
 *   topic       — required: 'mathematics' | 'quantum' | 'ai' | 'meta'
 *   tags        — optional array of strings
 *   featured    — optional boolean, pins the note on the homepage
 *   draft       — optional boolean, hides the note from the public site
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    topic: z.enum(['mathematics', 'quantum', 'ai', 'meta']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
