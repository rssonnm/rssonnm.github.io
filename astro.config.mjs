// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeEquationNumbers from './src/plugins/rehype-equation-numbers.mjs';
import rehypeLatexSource from './src/plugins/rehype-latex-source.mjs';
import remarkEnvironments from './src/plugins/remark-environments.mjs';

// ─────────────────────────────────────────────────────────────────────────
//  GitHub Pages deployment
//
//  → User / organization page : https://<username>.github.io/
//      site: 'https://<username>.github.io'
//      base: '/'
//
//  → Project page              : https://<username>.github.io/<repo>/
//      site: 'https://<username>.github.io'
//      base: '/<repo>/'
// ─────────────────────────────────────────────────────────────────────────
export default defineConfig({
  site: 'https://sonmanhng.github.io',
  base: '/',                          // TODO: use '/<repo>/' for a project page
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    // order matters: math first, then theorem/proof environments (they
    // re-parse their block content with math support internally)
    remarkPlugins: [remarkMath, remarkEnvironments],
    // numbers + \eqref rewriting run BEFORE KaTeX so the raw TeX is
    // still accessible; KaTeX then typesets the wrapped equation
    rehypePlugins: [rehypeEquationNumbers, rehypeLatexSource, rehypeKatex],
    // colors come from CSS variables (--astro-code-*) so syntax highlighting
    // follows the site's data-theme — see the token blocks in global.css
    shikiConfig: {
      theme: 'css-variables',
      wrap: false,
    },
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
