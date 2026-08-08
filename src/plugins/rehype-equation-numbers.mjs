// ─────────────────────────────────────────────────────────────────────────
//  Paper-style equation numbers + cross-references.
//
//  - Every display equation ($$…$$) gets a running tag (1), (2), … pinned
//    to the right, exactly like a journal article.
//  - `\label{eq:name}` inside a display equation records that number.
//  - `$\eqref{eq:name}$` / `$\ref{eq:name}$` become links back to it.
//  - Forward references work: labels are collected in a first pass, then
//    equations are wrapped and references rewritten.
//
//  Must run BEFORE rehype-katex: at this point math lives in
//  <span class="math math-inline"> / <div class="math math-display"> nodes
//  holding the raw TeX as text. KaTeX later renders the inner node, which
//  keeps the .eqn wrapper and the .eqn-no tag untouched.
// ─────────────────────────────────────────────────────────────────────────

const slug = (s) =>
  String(s).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const classNameOf = (node) =>
  Array.isArray(node?.properties?.className) ? node.properties.className : [];

const texOf = (node) => (node?.children?.[0]?.value ?? '').trim();

// Single-line $$…$$ is parsed by remark-math as inline math; a `\label`
// inside it is the tell that the author meant a numbered display equation.
const hasLabel = (tex) => /\\label\{/.test(tex);

// `\tag{X}` is rendered natively by KaTeX — don't add a second number.
const hasTag = (tex) => /\\tag\{/.test(tex);

const isDisplay = (cls) => cls.includes('math-display');
const isInlineWithLabel = (cls, tex) => cls.includes('math-inline') && hasLabel(tex);

export default function rehypeEquationNumbers() {
  return (tree) => {
    // ── pass 1: collect label → number in document order ────────────────
    const labels = new Map();
    {
      let n = 0;
      const scan = (node) => {
        if (!node || typeof node !== 'object') return;
        const cls = classNameOf(node);
        if (cls.includes('footnotes')) return; // never numbered
        const tex = texOf(node);
        if ((isDisplay(cls) || isInlineWithLabel(cls, tex)) && !hasTag(tex)) {
          n += 1;
          const m = tex.match(/\\label\{([^}]+)\}/);
          if (m && !labels.has(m[1])) labels.set(m[1], n);
          return;
        }
        if (Array.isArray(node.children)) node.children.forEach(scan);
      };
      scan(tree);
    }

    // ── pass 2: wrap equations, rewrite \eqref / \ref ────────────────────
    let n = 0;
    const walk = (node, parent, index, gparent) => {
      if (!node || typeof node !== 'object') return;
      const cls = classNameOf(node);

      if (cls.includes('footnotes')) return;

      const tex = texOf(node);
      if ((isDisplay(cls) || isInlineWithLabel(cls, tex)) && !hasTag(tex)) {
        n += 1;
        const labelMatch = tex.match(/\\label\{([^}]+)\}/);
        const clean = tex.replace(/\\label\{[^}]+\}/g, '');
        node.children = [{ type: 'text', value: clean }];

        // promote single-line $$…$$ (parsed as inline) to display math
        if (!isDisplay(cls)) {
          node.properties = {
            ...node.properties,
            className: [...cls.filter((c) => c !== 'math-inline'), 'math-display'],
          };
        }

        // only the first occurrence of a label owns the anchor id
        const isFirst = labelMatch && labels.get(labelMatch[1]) === n;
        const id = isFirst ? `eqn-${slug(labelMatch[1])}` : undefined;
        const eqn = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['eqn'],
            // the LaTeX source, so readers can copy the equation
            dataLatex: clean,
            ...(id ? { id } : {}),
          },
          children: [
            node,
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['eqn-no'], 'aria-hidden': 'true' },
              children: [{ type: 'text', value: `(${n})` }],
            },
          ],
        };

        // block math arrives as <pre><code class="language-math math-display">…
        // (remark-rehype treats the $$ fence like a code fence). Replace the
        // whole <pre>, not just the <code>, so equations never sit inside a
        // code-styled box.
        if (parent?.type === 'element' && parent.tagName === 'pre' && gparent && Array.isArray(gparent.children)) {
          const idx = gparent.children.indexOf(parent);
          if (idx !== -1) {
            gparent.children[idx] = eqn;
            return;
          }
        }
        parent.children[index] = eqn;
        return;
      }

      if (cls.includes('math-inline')) {
        // only rewrite when the reference is the entire inline math
        const m = tex.match(/^\\(eqref|ref)\{([^}]+)\}$/);
        if (m && labels.has(m[2])) {
          const name = m[2];
          const num = labels.get(name);
          if (num != null) {
            parent.children[index] = {
              type: 'element',
              tagName: 'a',
              properties: { className: ['eqref'], href: `#eqn-${slug(name)}` },
              children: [
                {
                  type: 'text',
                  value: m[1] === 'eqref' ? `(${num})` : String(num),
                },
              ],
            };
            return;
          }
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child, i) => walk(child, node, i, parent));
      }
    };

    walk(tree, null, null, null);
  };
}
