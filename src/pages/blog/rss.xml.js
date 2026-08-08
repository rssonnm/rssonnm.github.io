import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../site.config';

export async function GET() {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const site = new URL(SITE.url);
  // Respect `base` from astro.config.mjs so feed links survive project-page deploys.
  const base = import.meta.env.BASE_URL;

  return rss({
    title: `${SITE.mark} ${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: new URL(`${base}blog/${post.id.replace(/\.mdx?$/, '')}/`, site).toString(),
    })),
  });
}
