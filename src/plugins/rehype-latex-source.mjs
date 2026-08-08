// ─────────────────────────────────────────────────────────────────────────
//  Keep the raw LaTeX source reachable from the rendered math.
//
//  rehype-katex REPLACES every math node with KaTeX's HTML, so the original
//  `$…$` / `$$…$$` source is lost by the time the page reaches the browser.
//  This plugin runs between rehype-equation-numbers and rehype-katex and
//  wraps each math node in a holder that carries the source:
//
//    <span class="math-wrap" data-latex="\frac{1}{n^s}">
//      <span class="math math-inline">…</span>   ← katex replaces this
//    </span>
//
//  Numbered display equations are already wrapped in a `.eqn` div by
//  rehype-equation-numbers, which now carries `data-latex` itself; this
//  plugin only wraps the math nodes that live OUTSIDE an `.eqn`
//  (inline math, \tag'd equations, unnumbered display math).
// ─────────────────────────────────────────────────────────────────────────

const classNameOf = (node) =>
  Array.isArray(node?.properties?.className) ? node.properties.className : [];

export default function rehypeLatexSource() {
  return (tree) => {
    const walk = (node, parent, index) => {
      if (!node || typeof node !== 'object') return;
      const cls = classNameOf(node);
      const parentCls = classNameOf(parent);

      const isInline = cls.includes('math-inline');
      // \tag'd display math stays in its <pre> until rehype-katex replaces the
      // whole <pre> — wrapping it here would leave the box behind
      const isLooseDisplay =
        cls.includes('math-display') &&
        !parentCls.includes('eqn') &&
        parent?.tagName !== 'pre';

      if (isInline || isLooseDisplay) {
        const tex = node?.children?.[0]?.value ?? '';
        // a span with display:block behaves as a block for display math and
        // stays valid phrasing inside <p> for inline math
        const holder = {
          type: 'element',
          tagName: 'span',
          properties: {
            className: [
              'math-wrap',
              ...(isLooseDisplay ? ['math-wrap-display'] : []),
            ],
            dataLatex: tex,
          },
          children: [node],
        };
        parent.children[index] = holder;
        return; // KaTeX will replace the child; don't walk into it
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child, i) => walk(child, node, i));
      }
    };

    walk(tree, null, null);
  };
}
