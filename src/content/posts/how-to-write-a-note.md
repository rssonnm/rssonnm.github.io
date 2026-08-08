---
title: "How to Write a Note: Markdown & LaTeX in This Notebook"
date: 2026-08-01
description: "A short guide to the syntax of this blog — frontmatter, Markdown, inline and display math, code, and citations."
topic: meta
tags: [guide, markdown, latex]
featured: true
draft: false
---

Every note on this site is a plain Markdown file inside `src/content/posts/`. The filename becomes the URL slug, and the frontmatter at the top declares everything the index needs. The body is rendered with [KaTeX](https://katex.org/) — meaning every `$…$` becomes *real typeset mathematics* at build time, with no JavaScript on the reader's side.

## Frontmatter

Every note begins with a YAML block between two `---` lines:

```yaml
---
title: "A Catchy Title"
date: 2026-08-01
description: "One sentence that will appear in the index."
topic: mathematics        # mathematics | quantum | ai | meta
tags: [analysis, primes]
featured: false           # pin it to the homepage
draft: false              # true hides it from the public site
---
```

The `topic` value drives the colour code — violet for mathematics, cyan for quantum, gold for AI-for-science — and `draft: true` keeps a half-written note invisible until it is ready.

## Mathematics

Inline math is wrapped in single dollar signs, display math in doubled ones:

```md
The map $x \mapsto x^2$ sends integers to squares.
```

The map $x \mapsto x^2$ sends integers to squares.

```md
$$
e^{i\pi} + 1 = 0
$$
```

$$
e^{i\pi} + 1 = 0
$$

Any LaTeX that KaTeX supports works: align-style environments, matrices, Greek, operators, `\frac`, `\sqrt`, `\sum`, and so on.

$$
\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s}
= \prod_{p\ \text{prime}} \left( 1 - p^{-s} \right)^{-1}, \qquad \Re(s) > 1.
$$

For long equations, KaTeX wraps the display so nothing ever overflows the page.

Display equations render as centered math, **unnumbered** — plain, like the rest of the text. To *point back* to an equation from anywhere else in the note, give it a `\label` and reference it with `\eqref` — the reference becomes a clickable link that jumps straight to the equation:

```md
$$\label{eq:phi} \varphi = \frac{1 + \sqrt{5}}{2}$$
The ratio $\eqref{eq:phi}$ is irrational.
```

$$\label{eq:phi} \varphi = \frac{1 + \sqrt{5}}{2}$$

By identity $\eqref{eq:phi}$ the golden ratio is irrational. **Forward references work too**: `\label` may appear after its `\eqref`.

## Theorems and proofs

Fenced code blocks whose language is a theorem-environment name become numbered statements rendered as plain text — a bold label, then the statement, no box. An optional title goes in square brackets:

````md
```theorem[Euler's identity]
For every real number $x$,
$$e^{ix} = \cos x + i \sin x.$$
```
````

```theorem[Euler's identity]
For every real number $x$,
$$e^{ix} = \cos x + i \sin x.$$
```

Available environments: `theorem`, `lemma`, `corollary`, `proposition`, `definition`, `conjecture`, `axiom`, `remark`, `example`, `proof`. Statements share one running counter; `proof` closes with the ∎ tombstone automatically, and any `$…$` / `$$…$$` / `\eqref` inside an environment works exactly as in the surrounding text:

````md
```proof
Differentiate $f(x) = e^{-ix}(\cos x + i \sin x)$ and observe $f'(x) = 0$, while $f(0) = 1$; hence $f \equiv 1$.
```
````

```proof
Differentiate $f(x) = e^{-ix}(\cos x + i \sin x)$ and observe $f'(x) = 0$, while $f(0) = 1$; hence $f \equiv 1$.
```

## Code

Fenced code blocks with a language tag get syntax highlighting (Shiki, following the site's light/dark theme):

````md
```python
def golden_ratio(n: int) -> int:
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```
````

```python
def golden_ratio(n: int) -> int:
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Structure and extras

- Use `##` for sections — the table of contents and the numbered section markers are generated automatically.
- Use `> ` for block quotes, which are styled as margin notes with a violet rule.
- Use `![caption](/path/to/image.png)` for figures.
- Use `*emphasised*`, `**bold**`, and `` `inline code` `` as usual.
- Every note ends with a ∎ — the end-of-proof tombstone, rendered automatically.

> “Mathematics is the art of giving the same name to different things.”
>
> <footer>— Henri Poincaré</footer>

Every note is a file. Edit, rebuild, and the index, the RSS feed, and the table of contents all update themselves.
