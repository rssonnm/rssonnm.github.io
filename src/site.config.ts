// ─────────────────────────────────────────────────────────────────────────
//  Site configuration — edit this one file to personalise the whole site.
// ─────────────────────────────────────────────────────────────────────────

export const SITE = {
  /** Site title shown in the header, footer and <title>. */
  title: 'Nguyen Son',
  /** Bra–ket mark drawn before the wordmark. */
  mark: '⟨Ψ⟩',
  /** Short poetic tagline. */
  tagline: 'AI for Sciences — a research notebook',
  /** Long description (meta + feed). */
  description:
    'Nguyen Manh Son — AI researcher at the intersection of quantum machine learning, graph machine learning, computational chemistry and chemometrics. Notes on mathematics, quantum theory, and machine learning as instruments of discovery.',
  /** Author name, used in the footer and RSS feed. */
  author: 'Nguyen Manh Son',
  /** Short name for casual contexts. */
  shortName: 'Son Nguyen',
  /** Academic affiliation. */
  affiliation: 'University of Science, Vietnam National University, Hanoi',
  /** Role / position line. */
  role: 'AI Researcher · Quantum ML · Chemometrics',
  /** Public URL — must match `site` in astro.config.mjs. */
  url: 'https://sonmanhng.github.io',
  /** Link to your GitHub profile / source repository. */
  github: 'https://github.com/rssonnm',
  /** X (Twitter) profile. */
  x: 'https://x.com/sonmchems',
  /** Google Scholar profile. */
  scholar: 'https://scholar.google.com/citations?user=RpLurfYAAAAJ&hl=vi',
  /** Public contact email. */
  email: 'research.nguyenmson276@gmail.com',
  /** CV (relative to /public/files/). */
  cv: '/files/resume_sonnguyen.pdf',
  /** Research areas shown on the homepage. key → { label, hint }. */
  researchAreas: [
    { label: 'Quantum ML', hint: 'quantum computing', sym: '⟨Ψ|' },
    { label: 'Graph ML', hint: 'graph learning', sym: 'G(V,E)' },
    { label: 'AI for Science', hint: 'ai for science', sym: '∑' },
    { label: 'Chemometrics', hint: 'statistics + chem.', sym: '∂x' },
    { label: 'Applied Math', hint: 'applied mathematics', sym: '∇·F' },
  ],
  /** Topics used to colour-code the notes. key → { label, hint }. */
  topics: {
    mathematics: { label: 'MATH', hint: 'pure mathematics' },
    quantum: { label: 'QUANTUM', hint: 'quantum theory' },
    ai: { label: 'AI·SCI', hint: 'ai for science' },
    meta: { label: 'NOTE', hint: 'about this notebook' },
  },
} as const;

export type Topic = keyof typeof SITE.topics;
