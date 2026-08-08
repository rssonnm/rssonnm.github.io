// ─────────────────────────────────────────────────────────────────────────
//  LaTeX-style environments for prose:  ```theorem, lemma, corollary,
//  proposition, definition, conjecture, axiom, remark, example, proof.
//
//  Syntax (fenced code block — the info string carries an optional title):
//
//    ```theorem[Euler's identity]
//    For every real number $x$, $e^{ix} = \cos x + i \sin x$.
//    ```
//
//  Numbered statement environments share a single counter, paper-style
//  (Definition 1, Theorem 2, …); remark/example/proof are unnumbered and a
//  proof closes with the ∎ tombstone (added in CSS, not here).
//
//  Must run AFTER remark-math (the block content is re-parsed with math
//  support so $…$ / $$…$$ inside an environment still typesets).
// ─────────────────────────────────────────────────────────────────────────

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';

// statement environments share one counter; the rest are unnumbered
const STATEMENTS = new Set([
  'theorem',
  'lemma',
  'corollary',
  'proposition',
  'definition',
  'conjecture',
  'axiom',
]);
const ENVIRONMENTS = new Set([
  ...STATEMENTS,
  'remark',
  'example',
  'proof',
]);

const LABEL = {
  theorem: 'Theorem',
  lemma: 'Lemma',
  corollary: 'Corollary',
  proposition: 'Proposition',
  definition: 'Definition',
  conjecture: 'Conjecture',
  axiom: 'Axiom',
  remark: 'Remark',
  example: 'Example',
  proof: 'Proof',
};

// a fresh mini-pipeline that turns an environment's inner Markdown into an
// mdast tree with math support — separate from the main pipeline, and built
// once per file (inside the transformer) so concurrent processing of
// multiple files can never share a mutable processor instance
const buildParser = () => unified().use(remarkParse).use(remarkMath);

const parseTitle = (meta) => {
  if (!meta) return '';
  const m = String(meta).match(/\[([^\]]+)\]/);
  return m ? m[1].trim() : '';
};

// CommonMark puts the whole info string in `lang` when there is no space
// (```theorem[Title]), so pull the environment name out of the front and
// accept the title from either the info string or `meta` (```theorem [Title]).
const parseLang = (lang) => {
  const m = String(lang).match(/^([a-z]+)/i);
  return m ? m[1].toLowerCase() : String(lang);
};

const titleFromInfo = (lang) => {
  const m = String(lang).match(/\[([^\]]+)\]/);
  return m ? m[1].trim() : '';
};

export default function remarkEnvironments() {
  return (tree) => {
    const parse = buildParser();
    const counter = { n: 0 };
    const out = [];

    for (const node of tree.children) {
      const envLang = parseLang(node.lang);
      if (node.type === 'code' && ENVIRONMENTS.has(envLang)) {
        const numbered = STATEMENTS.has(envLang);
        let name = LABEL[envLang];
        if (numbered) {
          counter.n += 1;
          name = `${name} ${counter.n}`;
        }

        const title = parseTitle(node.meta) || titleFromInfo(node.lang);

        const titleChildren = [
          {
            type: 'strong',
            data: { hProperties: { className: ['env-name'] } },
            children: [{ type: 'text', value: name }],
          },
        ];
        if (title) {
          titleChildren.push({ type: 'text', value: ' — ' });
          titleChildren.push({
            type: 'emphasis',
            data: { hProperties: { className: ['env-sub'] } },
            children: [{ type: 'text', value: title }],
          });
        }

        // parse() gives the mdast tree, runSync() applies remark-math to it
        // — no compiler needed, unlike processSync()
        const body = parse.runSync(parse.parse(node.value));

        out.push({
          type: 'environment',
          data: {
            hName: 'div',
            hProperties: { className: ['env', `env-${envLang}`] },
          },
          children: [
            {
              type: 'paragraph',
              data: { hName: 'div', hProperties: { className: ['env-title'] } },
              children: titleChildren,
            },
            ...body.children,
          ],
        });
      } else {
        out.push(node);
      }
    }

    tree.children = out;
  };
}
