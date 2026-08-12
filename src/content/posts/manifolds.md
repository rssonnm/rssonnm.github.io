---
title: "Manifolds: The Spaces That Look Locally Like ℝⁿ"
date: 2026-08-10
description: "A full graduate-style tour of smooth manifolds — charts, atlases and partitions of unity; tangent and cotangent spaces, flows and the Frobenius theorem; Lie groups; differential forms, de Rham cohomology, Mayer–Vietoris and Poincaré duality; bundles, connections and curvature; Riemannian geometry and the Gauss–Bonnet theorem — and why every field that needs a notion of 'space' ends up here."
topic: mathematics
tags: [geometry, topology, manifolds, differential-geometry, lie-groups]
featured: false
draft: false
---

We do calculus on $\mathbb{R}^n$. Every theorem we learned — the chain rule, Taylor expansion, the fundamental theorem — lives there, on flat coordinate space. And yet almost nothing in the physical world *is* $\mathbb{R}^n$: the Earth's surface is not a plane, spacetime is not Minkowski space everywhere, and the configuration space of a robot arm is not a box. The solution the nineteenth century found — and the twentieth century turned into a definition — is the manifold: a space that is *locally* like $\mathbb{R}^n$, with the local pieces stitched together smoothly enough that calculus still works, but whose global shape can be a sphere, a torus, a pretzel, or anything else.

Gauss saw in 1827 that the curvature of a surface can be measured from within the surface itself (the *Theorema Egregium*), and Riemann's 1854 habilitation[^1] proposed doing geometry on exactly such "manifolds" (*Mannigfaltigkeiten*) — spaces whose points can be labeled locally by $n$ coordinates, with no assumption that the whole space fits in a single chart. The modern definition distilled from that vision is astonishingly short. Its consequences are not. This post follows the standard route — topology, then smooth structure, then the infinitesimal machinery, then global integration and geometry — and pushes it far enough to reach the theorems that power modern mathematics and physics.

## Topological manifolds: the definition

```definition[Topological manifold]
An $n$-dimensional topological manifold is a second-countable Hausdorff topological space $M$ such that every point has a neighbourhood homeomorphic to an open subset of $\mathbb{R}^n$.
```

A **chart** is a pair $(U, \varphi)$ where $U \subseteq M$ is open and $\varphi : U \to \mathbb{R}^n$ is a homeomorphism onto its image; the coordinate functions $\varphi(p) = (x^1(p), \dots, x^n(p))$ turn the neighbourhood $U$ into a piece of $\mathbb{R}^n$. A collection of charts covering $M$ is an **atlas**. That is the entire definition, and every piece of it is load-bearing:

- *Locally homeomorphic to $\mathbb{R}^n$* — not homeomorphic to $\mathbb{R}^n$. The sphere $S^n$ is a manifold but is never homeomorphic to any $\mathbb{R}^m$: it is compact, Euclidean spaces are not. The word "locally" is what lets a space bend, close up, and knot while remaining tractable.
- *Hausdorff* — distinct points have disjoint neighbourhoods. This guarantees that limits, when they exist, are unique. Drop it and calculus collapses: glue two copies of $\mathbb{R}$ together along $\mathbb{R} \setminus \{0\}$ to get the *line with doubled origin*; the sequence $1/n$ then converges to both origins at once.
- *Second-countable* — the topology has a countable basis. This is the quietly indispensable axiom: together with local compactness it makes $M$ **paracompact**, which is what guarantees the existence of **partitions of unity** — the tool that lets us glue local constructions into global ones. Without partitions of unity there is no integration on manifolds and no Whitney embedding theorem, and the subject never gets off the ground.

```example
The sphere $S^n = \{x \in \mathbb{R}^{n+1} : \|x\| = 1\}$ is a manifold: stereographic projection from any point is a homeomorphism from the sphere minus that point onto $\mathbb{R}^n$. The $n$-torus $T^n = S^1 \times \cdots \times S^1$ is a manifold — the surface of a donut is $T^2$. Real projective space $\mathbb{RP}^n = S^n / \{x \sim -x\}$ is a manifold, as is complex projective space $\mathbb{CP}^n$. The closed disk and the Möbius band are manifolds *with boundary*.
```

Note what the definition does *not* mention: an ambient space. A manifold is not assumed to sit inside any $\mathbb{R}^N$. This is the philosophical heart of the subject — the Earth's surface needs no sky to be a surface — and also the technical crux: without an outside world, what does "differentiable" even mean? That is the problem Section "The tangent space" answers.

## Smooth structures: stitching charts together

A chart makes $U$ look like $\mathbb{R}^n$, but a point in the overlap $U \cap V$ of two charts is described by two different coordinate systems, related by the **transition map**

$$
\varphi \circ \psi^{-1} : \psi(U \cap V) \longrightarrow \varphi(U \cap V),
$$

a map between open subsets of $\mathbb{R}^n$. The charts are **$C^\infty$-compatible** when every transition map is smooth in the ordinary multivariable sense — infinitely differentiable, all partial derivatives of all orders existing. Since "differentiable" is only meaningful *in coordinates*, this is exactly the right test: differentiability of objects on $M$ will be defined by checking it in charts, and compatibility is precisely what makes the answer independent of which chart you check it in.

```definition[Smooth manifold]
A smooth atlas is a maximal collection of pairwise $C^\infty$-compatible charts. A smooth structure on a topological manifold is a choice of smooth atlas, and a smooth manifold is a topological manifold equipped with one. A map $F : M \to N$ between smooth manifolds is smooth if it is smooth in every pair of charts, and a diffeomorphism is a smooth bijection with smooth inverse.
```

```example
The circle $S^1$ becomes a smooth manifold via the two stereographic charts obtained by deleting the north and south poles; their transition map is $t \mapsto 1/t$, which is smooth away from $t = 0$. More generally, the charts exhibiting $S^n$ as a manifold can be chosen so that every transition map is smooth, giving the standard smooth structure.
```

That the choice of smooth structure is *genuine extra data* — not automatically determined by the topology — was one of the shocks of twentieth-century mathematics. The celebrated Milnor spheres show it starkly:

```theorem[Milnor, 1956]
The topological sphere $S^7$ admits 28 pairwise non-diffeomorphic smooth structures.[^2]
```

```remark
The situation in dimension $4$ is wilder still: $\mathbb{R}^4$ admits uncountably many pairwise non-diffeomorphic smooth structures, while every other $\mathbb{R}^n$ has, up to diffeomorphism, exactly one.[^3] Topology and differential geometry are therefore not the same subject: the smooth structure is additional information, invisible to the topologist's eyes, that decides whether two spaces are "the same" for the purposes of calculus.
```

### Bump functions and partitions of unity

Before going further we need the analytical engine that makes every global construction below possible. On $\mathbb{R}^n$ there exist smooth functions that are $1$ on one ball and $0$ outside a larger one: the function $t \mapsto e^{-1/t}$ (with value $0$ at $t = 0$) is smooth with all derivatives vanishing at $0$, so $x \mapsto e^{-1/(1 - \|x\|^2)}$ is a smooth bump supported in the closed unit ball.

```definition[Bump function]
A bump function on $M$ is a smooth $\rho : M \to [0, 1]$ with compact support. The support of $\rho$ is the closure of the set where $\rho \neq 0$.
```

```theorem[Existence of partitions of unity]
For every open cover $\{U_\alpha\}$ of $M$ there exists a partition of unity subordinate to it: a family of bump functions $\{\rho_\alpha\}$ with $\operatorname{supp} \rho_\alpha \subseteq U_\alpha$, locally finite (each point meets only finitely many supports), and
$$\sum_\alpha \rho_\alpha = 1 \qquad \text{pointwise on } M.$$
```

The theorem is a direct dividend of paracompactness. It is the universal gluing tool: to construct a global object, construct it locally on each chart and average the local pieces with the weights $\rho_\alpha$ — the sum is locally finite, so it is a genuine smooth function. Smooth Urysohn-type statements follow: disjoint closed subsets of a manifold can be separated by a smooth function. Below, partitions of unity will define integration on manifolds, prove Stokes' theorem, and enter the modern proofs of the embedding theorems.

## The tangent space: derivatives without coordinates

Here is the difficulty hiding in the definition. A curve $\gamma : (-\epsilon, \epsilon) \to M$ has no velocity $\gamma'(0)$ — a velocity vector needs a vector space, and $M$ is not one. In a chart $(U, \varphi)$ one could take the derivative of $\varphi \circ \gamma$, a curve in $\mathbb{R}^n$. But in another chart the answer differs, and the two answers are related by the differential of the transition map — a *linear* map. This suggests the fix: a tangent vector is not a single coordinate derivative but the equivalence class of "a curve through $p$ up to first order", which transforms linearly between charts. There is, however, a cleaner definition that needs no charts at all.

```definition[Tangent vector]
A tangent vector to $M$ at $p$ is a linear map $v : C^\infty(M) \to \mathbb{R}$ satisfying the Leibniz rule
$$v(fg) = f(p)\,v(g) + g(p)\,v(f) \qquad \text{for all } f, g \in C^\infty(M).$$
The set of all such is the tangent space $T_p M$.
```

The definition is deliberately algebraic: a tangent vector *is* a directional derivative operator, the thing that eats a function and returns its rate of change in some direction. In a chart $(x^1, \dots, x^n)$ the partial derivative operators

$$
\frac{\partial}{\partial x^i}\bigg|_p : f \longmapsto \frac{\partial f}{\partial x^i}(p)
$$

are plainly tangent vectors, and Taylor expansion shows they span: every derivation is a linear combination of them. Hence $\dim T_p M = n$, and the "velocity" of a curve $\gamma$ is the tangent vector $f \mapsto (f \circ \gamma)'(0)$ — intrinsically defined, chart-independent, correct.

```proposition[Pushforward]
A smooth map $F : M \to N$ induces a linear map $dF_p : T_p M \to T_{F(p)} N$, the pushforward, by
$$(dF_p\, v)(g) = v(g \circ F).$$
It satisfies the chain rule $d(G \circ F) = dG \circ dF$; in particular a diffeomorphism induces a linear isomorphism of tangent spaces, so diffeomorphic manifolds have the same dimension.
```

```proof
Linearity is immediate. For the chain rule, compute $(d(G\circ F)_p\, v)(h) = v(h \circ G \circ F) = (dF_p\, v)(h \circ G) = (dG_{F(p)} \circ dF_p\, v)(h)$. If $F$ is a diffeomorphism, $dF_p \circ d(F^{-1})_{F(p)} = d(\mathrm{id}) = \mathrm{id}$, so $dF_p$ is invertible.
```

Gathering all tangent spaces produces the **tangent bundle**

$$
TM = \bigsqcup_{p \in M} T_p M,
$$

which is itself a smooth manifold of dimension $2n$. The charts on $M$ induce charts on $TM$: a chart $(x^1, \dots, x^n)$ around $p$ and a tangent vector $v = \sum v^i \partial/\partial x^i|_p$ give local coordinates $(x^1, \dots, x^n, v^1, \dots, v^n)$ on $TM$, and a change of coordinates on $M$ transforms the fibre coordinates linearly, $v'^i = \sum_j \frac{\partial y^i}{\partial x^j} v^j$. The projection $\pi : TM \to M$ is then a smooth submersion. A **vector field** is a smooth section $X : M \to TM$, a smooth choice of one tangent vector per point.

The linear-algebraic content of the pushforward organizes the local structure of smooth maps:

```definition[Immersion, submersion, embedding]
A smooth map $F : M \to N$ is an immersion if $dF_p$ is injective at every $p$, a submersion if $dF_p$ is surjective at every $p$, and an embedding if it is an immersion and a homeomorphism onto its image $F(M)$.
```

```theorem[Rank theorem]
If $F : M^m \to N^n$ has constant rank $r$ on a neighbourhood of $p$, then there are charts around $p$ and $F(p)$ in which $F$ takes the local form
$$(x^1, \dots, x^r, x^{r+1}, \dots, x^m) \longmapsto (x^1, \dots, x^r, 0, \dots, 0).$$
```

So, locally, an immersion looks like the inclusion $\mathbb{R}^r \hookrightarrow \mathbb{R}^n$ and a submersion like a projection $\mathbb{R}^m \twoheadrightarrow \mathbb{R}^n$. Consequences: the image of an immersion is locally an embedded submanifold; the fibres of a submersion are submanifolds of dimension $m - n$. Sard's theorem upgrades "locally" to "almost everywhere":

```theorem[Sard]
The set of critical values of a smooth map $F : M \to N$ — values $q$ for which $dF_p$ fails to be surjective at some $p \in F^{-1}(q)$ — has measure zero in $N$. In particular the regular values are dense.
```

By the preimage theorem, the fibre $F^{-1}(q)$ over a regular value $q$ is a smooth submanifold of dimension $m - n$ — which is why "a generic level set of a smooth function is a smooth hypersurface", and why generic intersections of submanifolds are again submanifolds.

The definition of a manifold is intrinsic, yet the abstract spaces are not condemned to abstraction:

```theorem[Whitney embedding theorem, 1936]
Every smooth $n$-manifold admits a proper smooth embedding into $\mathbb{R}^{2n}$, and, for $n \ge 2$, a smooth immersion into $\mathbb{R}^{2n-1}$.[^4]
```

Every manifold secretly sits inside a Euclidean space of at most twice its dimension. The theorem is a vindication of the definition (the intrinsic notion is not more general than the embedded one, at least smoothly), yet the intrinsic viewpoint remains the right one: embeddings are highly non-unique — the flat torus $T^2$ and the donut-shaped surface in $\mathbb{R}^3$ are the same manifold — and the intrinsic machinery (tangent spaces, forms, $d$, Stokes) is what is actually invariant.

## Vector fields, flows, and the Frobenius theorem

A vector field $X$ is the velocity field of a flow, the prescription "at each point, move this way". An **integral curve** of $X$ is a curve $\gamma$ with $\dot\gamma(t) = X_{\gamma(t)}$; existence and uniqueness of integral curves is the Picard–Lindelöf theorem applied in charts.

```theorem[Flow]
A vector field $X$ on $M$ generates a local flow: smooth maps $\Phi_t : U_t \to M$, defined on open sets $U_t \subseteq M$, satisfying
$$\Phi_{t+s} = \Phi_t \circ \Phi_s, \qquad \frac{d}{dt}\Phi_t(p) = X_{\Phi_t(p)}, \qquad \Phi_0 = \mathrm{id}.$$
If $X$ has compact support — in particular if $M$ is compact — the flow is complete: the maps $\Phi_t : M \to M$ are diffeomorphisms for all $t \in \mathbb{R}$.
```

Two vector fields $X, Y$ give an operator $[X, Y](f) = X(Yf) - Y(Xf)$. The second derivatives cancel — this is a derivation, hence a vector field, and it measures exactly the failure of the flows of $X$ and $Y$ to commute: travel along $X$ for time $t$, then along $Y$ for time $t$, then reverse both, and you return to a point displaced by approximately $t^2 [X, Y]$.

```proposition[Lie bracket]
The bracket is bilinear, skew-symmetric, and satisfies the Jacobi identity
$$[X, [Y, Z]] + [Y, [Z, X]] + [Z, [X, Y]] = 0.$$
Moreover $[X, Y] = 0$ if and only if the flows of $X$ and $Y$ commute. The bracket equips the space of vector fields $\mathfrak{X}(M)$ with the structure of an (infinite-dimensional) Lie algebra.
```

The **Lie derivative** formalizes "the rate of change of a tensor along a flow": for functions, $\mathcal{L}_X f = X(f)$; for vector fields, $\mathcal{L}_X Y = [X, Y]$, the pullback of $Y$ along the flow of $X$ differentiated at $t = 0$.

The bracket condition governs a genuinely geometric question: when do vector fields assemble into a family of submanifolds?

```definition[Distribution]
A smooth distribution of rank $k$ on $M$ is a smoothly varying choice of a $k$-dimensional subspace $D_p \subseteq T_p M$ at each point — equivalently, a smooth sub-bundle $D \subset TM$. The distribution is involutive if $[X, Y]$ is a section of $D$ whenever $X$ and $Y$ are. It is integrable if through every point of $M$ there passes an integral submanifold — a submanifold tangent to $D$ at every one of its points.
```

```theorem[Frobenius]
A smooth distribution is integrable if and only if it is involutive.
```

```proof
Involutivity is necessary: any vector fields tangent to an integral submanifold remain tangent to it, and the bracket of two sections of $D$ is again a section. For sufficiency one proves that around each point there is a chart $(x^1, \dots, x^k, y^1, \dots, y^{n-k})$ in which $D$ is spanned by $\partial/\partial x^1, \dots, \partial/\partial x^k$: the involutivity hypothesis is exactly the integrability condition of the overdetermined PDE system $\partial u/\partial x^i = F_i$, i.e. the requirement that mixed partial derivatives commute. The level sets $y = \text{const}$ are then the integral submanifolds.
```

For rank $k = 1$ the theorem is the classical existence theorem for ODEs (every line field has integral curves); the content of Frobenius is that for $k \ge 2$ the bracket condition is precisely what makes a system of first-order PDEs solvable. This is the theorem underlying the local structure of foliations, the integrability of Hamiltonian systems, and the geometric formulation of "the fields of a distribution are the derivatives of a family of surfaces".

## Lie groups: symmetry as a manifold

```definition[Lie group]
A Lie group is a smooth manifold $G$ equipped with a group structure for which multiplication $\mu : G \times G \to G$ and inversion $G \to G$ are smooth maps.
```

```example
$(\mathbb{R}^n, +)$, $(\mathbb{R}^{\times}, \cdot)$, and the circle $S^1 = U(1)$ are abelian Lie groups. The general linear group $\mathrm{GL}(n, \mathbb{R})$ is an open subset of the matrix space $\mathbb{R}^{n^2}$, hence a manifold, and the orthogonal, unitary, and special groups $\mathrm{O}(n)$, $\mathrm{U}(n)$, $\mathrm{SO}(n)$, $\mathrm{SU}(n)$ are closed subgroups of it — submanifolds cut out by the equations $A^\top A = I$, $A^\dagger A = I$.
```

A Lie group acts on itself by left translation $L_g(h) = gh$, a diffeomorphism. A vector field $X$ is **left-invariant** if $(L_g)_* X = X$ for all $g$; such a field is determined entirely by its value at the identity, $X = (L_g)_* X_e$. The left-invariant fields therefore form a *finite-dimensional* subspace of $\mathfrak{X}(G)$, closed under the bracket:

```definition[Lie algebra of a Lie group]
The Lie algebra of $G$ is
$$\mathfrak{g} = T_e G,$$
the tangent space at the identity, equipped with the bracket $[X_e, Y_e] = [X, Y]_e$ of the corresponding left-invariant vector fields. It is a finite-dimensional Lie algebra with $\dim \mathfrak{g} = \dim G$.
```

Every element $X \in \mathfrak{g}$ generates a one-parameter subgroup: the flow of its left-invariant field through $e$ is a homomorphism $\mathbb{R} \to G$. Evaluating it at $t = 1$ defines the **exponential map**

$$
\exp : \mathfrak{g} \longrightarrow G,
$$

a smooth map that is a local diffeomorphism near $0$ (its differential at $0$ is the identity). For matrix groups it is the matrix exponential $\exp(A) = \sum_{k \ge 0} A^k / k!$.

```example[SU(2) and the Bloch sphere]
The Lie algebra $\mathfrak{su}(2)$ is the real span of $i$ times the Pauli matrices
$$\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad \sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad \sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix},$$
with brackets $[\sigma_x, \sigma_y] = 2i\,\sigma_z$ cyclically. The exponential map sends the line $\mathbb{R} \cdot \sigma_z$ to the subgroup of rotations about the $z$-axis, and the one-qubit rotations of quantum mechanics are precisely $\exp(i\theta\, n \cdot \sigma / 2)$. The states of a qubit form the manifold $S^2$ — the Bloch sphere of an earlier post — and $\mathrm{SU}(2) \cong S^3$ is the double cover of $\mathrm{SO}(3)$. Lie groups are the place where geometry and algebra fuse, and they are the backbone of the gauge theories in Section "Bundles, connections, and curvature".
```

## Differential forms and de Rham cohomology

The dual space $T_p^* M$ — the **cotangent space** — is where derivatives of functions live: the differential of $f$ at $p$ is the covector $df_p(v) = v(f)$. Wedging covectors gives alternating multilinear forms, and a smooth **$k$-form** $\omega$ is a smooth assignment to each $p$ of an element of $\bigwedge^k T_p^* M$, written locally as

$$
\omega = \sum_{i_1 < \cdots < i_k} \omega_{i_1 \cdots i_k}\; dx^{i_1} \wedge \cdots \wedge dx^{i_k}.
$$

The **exterior derivative** $d : \Omega^k(M) \to \Omega^{k+1}(M)$ is the unique operator that agrees with $df = \sum \frac{\partial f}{\partial x^i} dx^i$ on functions, satisfies the graded Leibniz rule $d(\alpha \wedge \beta) = d\alpha \wedge \beta + (-1)^k \alpha \wedge d\beta$, and squares to zero:

```proposition
$d^2 = 0$.
```

```proof
On functions this is Clairaut's theorem: $\frac{\partial^2 f}{\partial x^i \partial x^j} = \frac{\partial^2 f}{\partial x^j \partial x^i}$, so the antisymmetry of $\wedge$ kills the double partials. The graded Leibniz rule then extends $d^2 = 0$ from functions to all forms.
```

There is a coordinate-free formula for $d$ — the reason the operator is canonical: for vector fields $X_0, \dots, X_k$,

$$
(d\omega)(X_0, \dots, X_k) = \sum_{i=0}^{k} (-1)^i\, X_i\big(\omega(X_0, \dots, \widehat{X_i}, \dots, X_k)\big) + \sum_{i<j} (-1)^{i+j}\, \omega\big([X_i, X_j], X_0, \dots, \widehat{X_i}, \dots, \widehat{X_j}, \dots, X_k\big),
$$

an expression built only from differentiation of functions and the Lie bracket — both intrinsic. This makes $d$ functorial: a smooth map $F : M \to N$ pulls forms back, $F^*\omega(v_1, \dots, v_k) = \omega(dF\, v_1, \dots, dF\, v_k)$, and the pullback commutes with $d$,

$$F^*(d\omega) = d(F^*\omega),$$

so $F^*$ descends to a map on cohomology. Cohomology is a contravariant functor from smooth manifolds to graded vector spaces.

The identity $d^2 = 0$ looks like a triviality and is one of the deepest facts in mathematics. It is the algebraic shadow of the geometric truth "the boundary of a boundary is empty", $\partial^2 = 0$. A form with $d\omega = 0$ is **closed**; a form $\omega = d\eta$ is **exact**. Since $d^2 = 0$, exact forms are closed. The converse fails — and the failure is a measurement of the shape of $M$:

```definition[de Rham cohomology]
$$H^k_{\mathrm{dR}}(M) = \frac{\ker(d : \Omega^k \to \Omega^{k+1})}{\operatorname{im}(d : \Omega^{k-1} \to \Omega^k)}$$
```

```example
On $S^1$ — or on the punctured plane $\mathbb{R}^2 \setminus \{0\}$ — the angle form
$$\omega = \frac{x\,dy - y\,dx}{x^2 + y^2}$$
is closed but not exact: its integral around the unit circle is $2\pi$, while by Stokes' theorem an exact form integrates to $0$ over a closed curve. Thus $H^1_{\mathrm{dR}}(S^1) = \mathbb{R}$, generated by $[\omega]$, and $H^1_{\mathrm{dR}}(\mathbb{R}^2 \setminus \{0\}) = \mathbb{R}$ as well — the punctured plane "remembers" the hole that the origin leaves behind.
```

```theorem[Poincaré lemma]
On any star-shaped open set of $\mathbb{R}^n$ — in particular on any chart diffeomorphic to a ball — every closed form of degree $k \ge 1$ is exact. Hence $H^k_{\mathrm{dR}}(\text{ball}) = 0$ for $k \ge 1$.
```

So closedness implies exactness *locally*, on every chart; the obstruction is purely global. This is the point where local calculus meets global topology, and de Rham's theorem[^5] makes the meeting precise:

```theorem[de Rham, 1931]
For every smooth manifold $M$,
$$H^k_{\mathrm{dR}}(M) \cong H^k(M; \mathbb{R}),$$
the singular cohomology of $M$ with real coefficients. In particular the de Rham groups are *topological invariants*: diffeomorphic — indeed homeomorphic — manifolds have isomorphic de Rham cohomology, and the dimensions $\dim H^k_{\mathrm{dR}}(M)$, the Betti numbers, depend only on the topology of $M$.
```

```example
$H^0(S^n) = \mathbb{R}$ (a function with $df = 0$ is locally constant; there is one such per connected component, so $H^0(M) = \mathbb{R}^{\pi_0(M)}$ in general), $H^k(S^n) = 0$ for $0 < k < n$, and $H^n(S^n) = \mathbb{R}$ — the sphere has exactly one "hole" in dimension $n$, detected by the volume form, which is closed (any top form is) but not exact.
```

## Computing cohomology: Mayer–Vietoris and projective spaces

The Poincaré lemma says cohomology is trivial on balls; the Mayer–Vietoris theorem says how it assembles from a cover — the cohomological version of the partition-of-unity glueing.

```theorem[Mayer–Vietoris]
If $M = U \cup V$ with $U, V$ open, then there is a long exact sequence
$$\cdots \longrightarrow H^k(M) \longrightarrow H^k(U) \oplus H^k(V) \longrightarrow H^k(U \cap V) \longrightarrow H^{k+1}(M) \longrightarrow \cdots$$
```

```example[Cohomology of spheres]
Take $U, V$ to be slightly enlarged open hemispheres of $S^n$: each is contractible, and $U \cap V$ deformation retracts onto the equator $S^{n-1}$. The Mayer–Vietoris sequence collapses to isomorphisms $H^k(S^n) \cong H^{k-1}(S^{n-1})$ for $k \ge 2$, together with $H^1(S^n) = 0$ for $n \ge 2$. Induction from $S^1$ recovers $H^k(S^n) = \mathbb{R}$ for $k = 0, n$ and $0$ otherwise — one line, where a direct computation with forms would be a slog.
```

The real power of the sequence appears when the pieces are simple and the gluing complicated. Complex projective space is the paradigm:

```example[$H^*(\mathbb{CP}^n)$]
$\mathbb{CP}^n$ has a cell decomposition with exactly one cell in each even dimension $0, 2, \dots, 2n$, so
$$H^k(\mathbb{CP}^n) = \begin{cases} \mathbb{R} & k \text{ even}, \; 0 \le k \le 2n, \\ 0 & \text{otherwise}. \end{cases}$$
The class $\omega \in H^2(\mathbb{CP}^n)$ of the Fubini–Study form generates the whole ring: $\omega^n$ is a nonzero class in $H^{2n}$, and
$$H^*(\mathbb{CP}^n) \cong \mathbb{R}[\omega] / (\omega^{n+1}),$$
a truncated polynomial ring. The cup product — the ring structure on cohomology — is completely determined by this single class.
```

```remark
Real projective space behaves differently: $H^k(\mathbb{RP}^n; \mathbb{R}) = \mathbb{R}$ only in degree $0$, and in degree $n$ when $n$ is odd; all other groups vanish. The $\mathbb{Z}/2$ torsion of $\mathbb{RP}^n$ is invisible to real coefficients — de Rham cohomology sees only the free part of the topology.
```

Cohomology is not just a list of vector spaces; it carries the structure of a graded-commutative ring under the cup product $\smile$, and the deepest structural theorem relates it to its own dual:

```theorem[Poincaré duality]
If $M$ is a closed oriented $n$-manifold, the cup-product pairing
$$H^k(M) \times H^{n-k}(M) \longrightarrow \mathbb{R}, \qquad (\alpha, \beta) \longmapsto \int_M \alpha \wedge \beta,$$
is non-degenerate; in particular $H^k(M) \cong (H^{n-k}(M))^*$.
```

The pairing uses the integral from the next section, and it is the source of the symmetry of Betti numbers, $b_k = b_{n-k}$, for closed oriented manifolds — the reason $\chi(S^4) = \chi(S^{100}) = 2$ while a genus-2 surface has $\chi = -2$: topology is highly constrained by dimension and orientation.

## Integration and Stokes' theorem

Why are the integrands of the theory differential forms rather than functions? Under a change of coordinates, an $n$-fold integral must transform by the determinant of the Jacobian — the change-of-variables formula. A top form $\omega = f\, dx^1 \wedge \cdots \wedge dx^n$ transforms by exactly that rule, and forms are *the* objects with this transformation law. A choice of **orientation** — a nowhere-vanishing top form up to positive multiples, equivalently a consistent choice of ordered basis for each tangent space — makes $\int_M \omega$ well-defined for compactly supported top forms: split $\omega$ by a partition of unity into pieces supported in single charts, integrate each in coordinates, and sum; compatibility of transition maps makes the answer independent of every choice. This is where the second-countability axiom pays its dividend.

```theorem[Stokes]
Let $M$ be an oriented smooth $n$-manifold with boundary $\partial M$, and let $\omega$ be a compactly supported smooth $(n-1)$-form. Then
$$\int_M d\omega = \int_{\partial M} \omega .$$
```

```proof
Cut $\omega$ into finitely many pieces supported in charts by a partition of unity. On a chart identified with a half-space of $\mathbb{R}^n$, the claim reduces to iterated integration and the fundamental theorem of calculus in one variable — the terms at infinity vanish by compact support, and the surviving boundary terms assemble into $\int_{\partial M} \omega$, independent of the charts chosen.
```

Every classical theorem of vector calculus is Stokes' theorem in disguise: the fundamental theorem of calculus ($n = 1$), Green's theorem ($n = 2$), and the divergence theorem ($n = 3$). The abstract version is what the classical ones always wanted to be. Two consequences are worth stating: if $M$ is closed (compact, without boundary), then $\int_M d\omega = 0$; and more generally the pairing $\omega \mapsto \int_M \omega$ descends to a well-defined pairing between cohomology classes of closed forms and homology classes of cycles — the pairing of Poincaré duality, which is perfect: cohomology and homology are dual. The gradient, divergence, and curl of vector calculus, scattered across three theorems, are one operator $d$; the fundamental theorem of calculus, one formula.

## Bundles, connections, and curvature

The tangent bundle is the first example of a general phenomenon: geometry routinely needs, at each point of $M$, an additional piece of linear or group data.

```definition[Vector bundle]
A real vector bundle of rank $k$ over $M$ is a smooth manifold $E$ with a surjective submersion $\pi : E \to M$ such that each fibre $E_p = \pi^{-1}(p)$ is a $k$-dimensional real vector space and each point of $M$ has a neighbourhood $U$ admitting a trivialization $\pi^{-1}(U) \cong U \times \mathbb{R}^k$ mapping fibres to fibres linearly.
```

```example
The tangent bundle $TM$ is a rank-$n$ vector bundle, and a vector field is a section of it. The Möbius band is a nontrivial line bundle over $S^1$: a trivialization would force the band to be an annulus. In fact the line bundles over $S^1$ are classified by the sign $\pm 1$ of the clutching function — there are exactly two, the cylinder and the Möbius band. Nontriviality is a genuinely global phenomenon, invisible in any single chart.
```

The most famous obstruction to finding nowhere-vanishing sections is topological:

```theorem[Poincaré–Hopf]
Let $X$ be a vector field on a closed manifold $M$ with only isolated zeros. If $p$ is a zero of $X$ and $\deg_p X$ is the local degree of the map $x \mapsto X(x)/\|X(x)\|$ on a small sphere around $p$, then
$$\sum_{p : X(p) = 0} \deg_p X = \chi(M).$$
```

```example[Hairy ball]
Since $\chi(S^{2m}) = 2 \neq 0$, every vector field on an even-dimensional sphere vanishes somewhere: you cannot comb the hair on a sphere. Odd spheres, with $\chi(S^{2m+1}) = 0$, admit nowhere-vanishing fields — on $S^1$ the rotation field, on $S^3$ the three fields from the quaternionic structure, which is exactly the parallelism of $\mathrm{SU}(2)$.
```

```definition[Principal bundle and connection]
A principal $G$-bundle over $M$ is a bundle $P \to M$ whose fibre is a Lie group $G$ acting freely and transitively on the right, with $M = P / G$; it is locally trivial, $P|_U \cong U \times G$. A connection on $P$ is a smooth choice of horizontal complement to the vertical tangent spaces, equivariant under $G$; equivalently, a $\mathfrak{g}$-valued 1-form $A$ on $P$ satisfying $R_g^* A = \operatorname{Ad}(g^{-1}) A$ and $A$ of the Maurer–Cartan type on vertical vectors.
```

The connection is the rule that lets one compare fibres at different points — parallel transport — and its failure to be integrable is curvature:

$$
F = dA + A \wedge A,
$$

where $A \wedge A$ means wedge product together with the Lie bracket (matrix multiplication, for matrix groups). The curvature satisfies the **Bianchi identity**

$$
dF + A \wedge F - F \wedge A = 0,
$$

the structural equation of Cartan, and it is a $\mathfrak{g}$-valued 2-form on $P$ that descends to a well-defined 2-form on $M$ (the field strength).

```remark[Gauge theory]
For the abelian group $G = U(1)$ the quadratic term vanishes, $A \wedge A = 0$, and $F = dA$ is the electromagnetic field strength of Maxwell's theory; the connection $A$ is the vector potential. For non-abelian groups — $SU(2)$ for the weak force, $SU(3)$ for the strong — the term $A \wedge A$ survives, and the theory is Yang–Mills: the gauge bosons carry charge and interact with one another. The Standard Model of particle physics is, geometrically, the theory of connections on principal bundles over spacetime. Donaldson used exactly these equations in 1983 to prove that $\mathbb{R}^4$ carries exotic smooth structures — the same phenomenon as Milnor's spheres, in dimension four, via physics.
```

## Riemannian geometry: metrics, geodesics, and curvature

A manifold with a smooth structure is still a "soft" space — no distances, angles, or volumes. Geometry begins with a metric.

```definition[Riemannian metric]
A Riemannian metric on $M$ is a smoothly varying inner product $g_p$ on each tangent space $T_p M$. A Riemannian manifold is a pair $(M, g)$.
```

A metric determines everything one might want to measure: the length of a curve $\gamma : [a,b] \to M$ is

$$
L(\gamma) = \int_a^b \sqrt{g_{\gamma(t)}(\dot\gamma(t), \dot\gamma(t))}\; dt,
$$

the distance between points is the infimum of lengths of curves joining them, and the volume form is $d\mu = \sqrt{\det(g_{ij})}\; dx^1 \wedge \cdots \wedge dx^n$. In local coordinates the metric is the symmetric matrix $g_{ij} = g(\partial_i, \partial_j)$, usually written $ds^2 = g_{ij}\, dx^i dx^j$.

To differentiate vector fields along curves one needs a rule for comparing tangent spaces at nearby points — a connection — and the metric singles out a canonical one:

```theorem[Fundamental theorem of Riemannian geometry]
For every Riemannian manifold $(M, g)$ there exists a unique connection $\nabla$ — the Levi-Civita connection — that is torsion-free,
$$\nabla_X Y - \nabla_Y X = [X, Y],$$
and metric-compatible,
$$X\, g(Y, Z) = g(\nabla_X Y, Z) + g(Y, \nabla_X Z).$$
```

In coordinates the connection is encoded in the Christoffel symbols,

$$
\nabla_{\partial_i} \partial_j = \Gamma^k_{ij}\, \partial_k, \qquad
\Gamma^k_{ij} = \tfrac{1}{2} g^{kl}\left( \partial_i g_{jl} + \partial_j g_{il} - \partial_l g_{ij} \right),
$$

and the **geodesics** — the straightest possible curves, those whose velocity is parallel transported along themselves — solve

$$
\ddot{x}^k + \Gamma^k_{ij}\, \dot{x}^i \dot{x}^j = 0.
$$

The **exponential map** $\exp_p : T_p M \to M$ sends tangent vectors to the endpoints of geodesics, and on a neighbourhood of $0$ it is a diffeomorphism — giving normal coordinates in which the metric is Euclidean up to second order. The curvature is the failure of parallel transport to be path-independent:

```definition[Riemann curvature tensor]
$$R(X, Y)Z = \nabla_X \nabla_Y Z - \nabla_Y \nabla_X Z - \nabla_{[X,Y]} Z.$$
```

Parallel-transporting a vector $Z$ around an infinitesimal loop spanned by $X$ and $Y$ rotates it by an amount controlled by $R(X,Y)Z$; the rotation that survives after going around a finite loop is the **holonomy** of the connection. Traces of $R$ give the **Ricci tensor** $R_{ij} = R^k_{\ ikj}$ — the averaged curvature, which controls the volume growth of small geodesic balls — and the **scalar curvature** $R = g^{ij} R_{ij}$.

```theorem[Gauss–Bonnet]
If $M$ is a compact oriented surface with Gaussian curvature $K$ and area form $dA$, then
$$\int_M K \, dA = 2\pi \chi(M),$$
where $\chi(M)$ is the Euler characteristic — a purely topological number.
```

Integrating a local geometric quantity over the whole surface yields a topological invariant. The theorem is the template for the entire modern subject: Chern classes, the Hirzebruch–Riemann–Roch theorem, Atiyah–Singer index theory — all are statements that a curvature integral computes a topological invariant. And in physics, the same geometry organizes gravity: a Lorentzian metric on a four-manifold, with geodesics as the worldlines of free particles and the Einstein equations

$$
R_{\mu\nu} - \tfrac{1}{2} R\, g_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}
$$

declaring that the curvature of spacetime is sourced by the stress-energy of matter. General relativity is the statement that gravity *is* geometry.

## The modern view

There is a cleaner way to package everything above. A manifold can be defined as a **locally ringed space** $(M, C^\infty_M)$: a topological space together with, for each open set $U$, the ring $C^\infty_M(U)$ of smooth functions on $U$, subject to the requirement that $(M, C^\infty_M)$ be locally isomorphic to $(\mathbb{R}^n, C^\infty_{\mathbb{R}^n})$. This reformulation sounds formal, but it is the key that unlocked the twentieth century's generalizations: the same sentence, with "smooth functions" replaced by "regular functions" or "holomorphic functions", defines schemes in algebraic geometry and complex manifolds in analytic geometry. Geometry, in this view, is the study of spaces equipped with their rings of functions, and every construction above — tangent spaces, differential forms, cohomology — is secretly a construction about the sheaf of functions.

```remark[Hodge theory]
On a compact oriented Riemannian manifold there is an even more analytic characterization: every de Rham cohomology class has a unique harmonic representative — a form $\omega$ with $d\omega = 0$ and $d^*\omega = 0$, where $d^*$ is the adjoint of $d$. Thus
$$H^k_{\mathrm{dR}}(M) \cong \{\text{harmonic } k\text{-forms}\},$$
and cohomology can be *computed* by solving linear PDEs. The dimensions of these harmonic-form spaces, the Betti numbers, are metric-invariant despite being defined from a metric — one of the most striking rigidity phenomena in mathematics.
```

This is also the point where the subject connects to the rest of this blog. The Bloch sphere of a qubit is the manifold $S^2$, and the state spaces of quantum systems are generally manifolds (indeed symplectic and Kähler ones). The phase space of a classical mechanical system is the cotangent bundle $T^*M$ — a symplectic manifold whose geometry organizes dynamics and, through geometric quantization, the passage to quantum mechanics. Gauge theories — the Standard Model — are connections on principal bundles over spacetime, and their field strengths are curvatures, exactly as in Section "Bundles, connections, and curvature". And in machine learning, the **manifold hypothesis** asserts that high-dimensional data — spectra, molecular geometries, images — concentrate near low-dimensional manifolds embedded in the ambient space; dimensionality reduction, graph neural networks, and most of chemometrics are, knowingly or not, attempts to find and exploit those manifolds. When the blog's theme is "AI for Sciences", the manifold is the mathematical object that makes the slogan precise: science is the study of data living on manifolds, and mathematics is the study of the manifolds themselves.

The definition of a manifold takes one sentence: *a space that looks locally like $\mathbb{R}^n$*. Everything else — atlases, smooth structures, partitions of unity, tangent bundles, the Frobenius theorem, Lie groups, de Rham cohomology, Stokes' theorem, bundles and curvature, the Gauss–Bonnet theorem — is the discipline of taking that sentence seriously: making "locally" precise, making the stitching smooth, and then watching local truths (the Leibniz rule, the Poincaré lemma, the fundamental theorem of calculus) become global theorems about the shape of space.

[^1]: B. Riemann, *Über die Hypothesen, welche der Geometrie zu Grunde liegen*, 1854.
[^2]: J. Milnor, *On manifolds homeomorphic to the 7-sphere*, Ann. of Math. 64 (1956), 399–405.
[^3]: M. Freedman, *The topology of four-dimensional manifolds*, J. Diff. Geom. 17 (1982), 357–453; S. Donaldson, *An application of gauge theory to four-dimensional topology*, J. Diff. Geom. 18 (1983), 269–316.
[^4]: H. Whitney, *Differentiable manifolds*, Ann. of Math. 37 (1936), 645–680.
[^5]: G. de Rham, *Sur l'analysis situs des variétés à n dimensions*, J. Math. Pures Appl. 10 (1931), 115–200.
