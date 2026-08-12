---
title: "Attention Is All You Need"
date: 2026-08-10
description: "Published at NeurIPS 2017, \"Attention Is All You Need\" by Vaswani et al. introduced the Transformer, a sequence model built entirely on attention and free of recurrence and convolution. This post reads the paper from a mathematician's perspective: every formula and design choice — the √d_k scaling, positional encodings, normalization, training — is analyzed and proved, before moving on to the theory the paper seeded: expressive power, generalization, and the dynamical systems view of the residual stream."
topic: ai
tags: [deep-learning, transformers, attention, kernel-methods, information-theory, mathematics]
lang: en
translationOf: attention-is-all-you-need
featured: false
draft: false
---

In 2017, Vaswani and co-authors published "Attention Is All You Need" at NeurIPS [^1], proposing the Transformer — a sequence-processing architecture based entirely on attention mechanisms, dispensing with recurrence and convolutions. The architecture became the foundation of most modern large language models and vision models.

The paper is short but dense: four numbered equations, one table of complexity analyses, and a string of design choices — the scaling factor $\sqrt{d_k}$, sinusoidal positional encodings, label smoothing, a peculiar learning-rate schedule — that are usually absorbed as engineering practice rather than theory. This post is a mathematician's reading of the paper: every formula gets a definition, every design choice gets a lemma or a theorem, and the paper's heuristics — "the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients" — are turned into statements that can be proved. The tools needed are linear algebra, probability, and a little information theory.

## A map of this post: four tiers of knowledge

The post is organized into four tiers, each ending at a distinct level of understanding:

- **Tier 0 — The mathematical toolbox.** Linear algebra, probability, multivariable calculus, the softmax function, information theory, and a little kernel theory, presented in exactly the amount needed for the rest. Readers who are already comfortable can skip it; newcomers should read it carefully, because every claim in the later tiers uses exactly these tools.
- **Tier 1 — The mechanism.** Equations (1) and (2) of the paper: scaled dot-product attention, the variance lemma behind $\sqrt{d_k}$, and multi-head attention as an ensemble of low-rank smoothers.
- **Tier 2 — The architecture.** Self-attention and permutation equivariance, positional encodings, the feed-forward network, residual connections and normalization, training — the whole model as a complete system.
- **Tier 3 — Advanced.** Six theory threads at the graduate level: expressive power (universal approximation, Turing completeness, limitations), generalization theory (Rademacher complexity), information geometry (Legendre duality, Gibbs distributions, entropic optimal transport), the spectral theory of attention Markov chains (Perron–Frobenius, the Dobrushin coefficient), kernels and reproducing kernel Hilbert spaces (random features, linear attention), and the dynamical systems view of the residual stream.

Each tier is relatively independent: a reader who knows the mathematics can enter at Tier 1; a reader who wants to understand why transformers train should read all four. The **Definition / Lemma / Theorem / Proposition / Remark / Proof** blocks are the working language of the post: each block is a checkable claim, and every proof is written out to the level of line-by-line verification.

## Tier 0 — The mathematical toolbox

### Linear algebra

Every computation in a transformer is an operation on vectors and matrices. The concepts below are used throughout.

```definition[Vector, linear combination, independence]
A vector $x \in \mathbb{R}^d$ is an ordered $d$-tuple of reals. A linear combination of $v_1, \dots, v_k$ is a vector $\sum_i c_i v_i$ with $c_i \in \mathbb{R}$. The vectors are linearly independent if none is a linear combination of the others; their span $\operatorname{span}\{v_1,\dots,v_k\}$ is the set of all linear combinations — a subspace.
```

```definition[Inner product, norm, angle]
The standard inner product on $\mathbb{R}^d$ is $\langle x, y \rangle = \sum_{i=1}^d x_i y_i = x^\top y$. The Euclidean norm is $\|x\| = \sqrt{\langle x, x \rangle}$. The angle $\theta$ between two vectors satisfies
$$\cos\theta = \frac{\langle x, y\rangle}{\|x\|\,\|y\|}.$$
```

```theorem[Cauchy–Schwarz inequality]
For all $x, y \in \mathbb{R}^d$: $|\langle x, y\rangle| \le \|x\|\,\|y\|$, with equality if and only if $x$ and $y$ are linearly dependent.
```

```proof
For every $t \in \mathbb{R}$, $\|x - t y\|^2 = \|x\|^2 - 2t\langle x,y\rangle + t^2\|y\|^2 \ge 0$. Choosing $t = \langle x,y\rangle/\|y\|^2$ (if $y \ne 0$) gives $\|x\|^2 - \langle x,y\rangle^2/\|y\|^2 \ge 0$, i.e. $\langle x,y\rangle^2 \le \|x\|^2\|y\|^2$.
```

```example[Why the dot product measures "fit"]
In attention, the logit between a query $q$ and a key $k$ is $q^\top k = \|q\|\|k\|\cos\theta$: it is large when the two vectors point in the same direction. If vectors encode the meaning of a token, a large dot product means the two tokens "are related in the direction the model has learned." Cauchy–Schwarz bounds the logit by the product of norms — a fact that returns in the variance lemma (Tier 1).
```

```definition[Matrices and their operations]
A matrix $A \in \mathbb{R}^{n \times m}$ is an $n \times m$ array of reals. The product $AB$ (for $A \in \mathbb{R}^{n\times m}$, $B \in \mathbb{R}^{m\times p}$) has entries $(AB)_{ij} = \sum_{k} A_{ik}B_{kj}$. The transpose $A^\top$ swaps rows and columns. A square matrix $A$ has trace $\operatorname{tr}(A) = \sum_i A_{ii}$.
```

```definition[Eigenvalues, eigenvectors]
For a square matrix $A$, the number $\lambda$ is an eigenvalue with eigenvector $v \ne 0$ if $Av = \lambda v$. A symmetric matrix ($A = A^\top$) has all real eigenvalues.
```

```theorem[Spectral theorem for symmetric matrices]
Every symmetric matrix $A \in \mathbb{R}^{d\times d}$ can be written $A = U\Lambda U^\top$ with $U$ orthogonal ($U^\top U = I$) and $\Lambda$ diagonal holding the eigenvalues. In particular, the eigenvectors of a symmetric matrix are mutually orthogonal and form a basis.
```

```definition[Positive semidefinite matrices and Gram matrices]
A symmetric matrix $M$ is positive semidefinite if $x^\top M x \ge 0$ for all $x$ (positive definite if the inequality is strict for $x \ne 0$); equivalently, all eigenvalues are nonnegative (positive). For any matrix $X \in \mathbb{R}^{n\times d}$, the Gram matrix $XX^\top$ is positive semidefinite and $\operatorname{rank}(XX^\top) \le d$.
```

```remark
The entry $(QK^\top)_{ij} = q_i^\top k_j$ in attention is a matrix of cross dot products (queries against keys, two different families); $XX^\top$ with $X$ the token representations is a genuine Gram matrix: positive semidefinite, of rank at most the feature dimension. This rank observation is the key to the proposition "multi-head costs nothing extra": a full-rank-$d_{\text{model}}$ interaction is replaced by $h$ rank-$d_k$ interactions running in parallel.
```

### Probability

Attention is an averaging operation over probability distributions; the whole $\sqrt{d_k}$ argument is a probabilistic one.

```definition[Random variables, expectation, variance]
A random variable $Z$ takes values according to a probability distribution. The expectation $\mathbb{E}[Z]$ is its average value; the variance $\operatorname{Var}(Z) = \mathbb{E}[(Z - \mathbb{E}[Z])^2] = \mathbb{E}[Z^2] - \mathbb{E}[Z]^2$ measures dispersion; the standard deviation is $\sqrt{\operatorname{Var}(Z)}$. Two variables $X, Y$ are independent when the joint distribution factors into the product of the marginals; then $\mathbb{E}[XY] = \mathbb{E}[X]\mathbb{E}[Y]$ and $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$.
```

```theorem[Central limit theorem]
Let $Z_1, \dots, Z_n$ be independent and identically distributed with mean $\mu$ and variance $\sigma^2$. As $n \to \infty$,
$$\frac{1}{\sqrt{n}}\sum_{i=1}^{n}(Z_i - \mu) \;\xrightarrow{d}\; \mathcal{N}(0, \sigma^2),$$
the normal distribution with mean $0$ and variance $\sigma^2$: a sum of many independent variables "self-normalizes" into a bell curve.
```

```theorem[Chebyshev's inequality]
For a random variable $X$ with mean $\mu$ and variance $\sigma^2$, for every $t > 0$:
$$\mathbb{P}(|X - \mu| \ge t) \le \frac{\sigma^2}{t^2}.$$
```

```proof
This follows from Markov's inequality: $\mathbb{P}(|X-\mu| \ge t) = \mathbb{P}((X-\mu)^2 \ge t^2) \le \mathbb{E}[(X-\mu)^2]/t^2 = \sigma^2/t^2$.
```

```remark[Concentration underlies the $\sqrt{d_k}$ argument]
The central limit theorem says a sum of $d_k$ independent terms has dispersion of order $\sqrt{d_k}$; Chebyshev says the probability of deviating by more than a few standard deviations is small. Together they pin down how large the logits $q_i^\top k_j$ are and how far apart — the two numbers that decide whether softmax saturates (Tier 1). Convergence in probability ($X_n \xrightarrow{p} X$ when $\mathbb{P}(|X_n - X| \ge \varepsilon) \to 0$) is the language of the saturation proposition.
```

### Multivariable calculus

```definition[Gradient, Jacobian, chain rule]
For $f: \mathbb{R}^d \to \mathbb{R}$, the gradient $\nabla f(x)$ is the vector of partial derivatives $(\partial f/\partial x_1, \dots, \partial f/\partial x_d)$; it points in the direction of steepest ascent and is normal to level sets. For $f: \mathbb{R}^d \to \mathbb{R}^m$, the Jacobian $J_f(x) \in \mathbb{R}^{m\times d}$ has entries $(J_f)_{ij} = \partial f_i/\partial x_j$. The chain rule: $J_{g \circ f}(x) = J_g(f(x))\, J_f(x)$ — gradients propagate through compositions by multiplying Jacobians.
```

```remark[Backpropagation is the chain rule]
A neural network is a composition $f = f_L \circ \cdots \circ f_1$; the derivative of the loss with respect to every parameter is a chain of Jacobian products computed backward from the output — the chain rule executed on a computation graph. "Vanishing gradients" means the product of Jacobians contracts to zero with depth; "exploding gradients" means it blows up. Every design in the paper — the factor $\sqrt{d_k}$, residual connections, normalization — aims to keep these Jacobian products at a usable scale (Tier 2).
```

### Softmax and the exponential

```definition[The simplex, softmax, log-sum-exp]
The standard simplex $\Delta^{m-1} = \{p \in \mathbb{R}^m : p_j \ge 0,\; \sum_j p_j = 1\}$ is the set of discrete probability distributions on $m$ points — the convex hull of the $m$ basis vectors, with the one-hot distributions as vertices. Softmax is the map
$$\operatorname{softmax}(z)_j = \frac{e^{z_j}}{\sum_{l} e^{z_l}},$$
and log-sum-exp is $\operatorname{LSE}(z) = \log \sum_j e^{z_j}$. These three objects are faces of one coin: $p = \operatorname{softmax}(z)$ entails $z_j = \log p_j + \operatorname{LSE}(z)$.
```

```lemma[Translation invariance: numerical stability]
For every $c \in \mathbb{R}$: $\operatorname{softmax}(z + c\mathbf{1}) = \operatorname{softmax}(z)$ and $\operatorname{LSE}(z + c\mathbf{1}) = \operatorname{LSE}(z) + c$. Hence compute $\operatorname{LSE}(z)$ by first subtracting $\max_j z_j$ — avoiding overflow of the exponentials.
```

```proof
Every $e^{z_j}$ is multiplied by $e^c$: numerator and denominator share the factor, which cancels; the logarithm of $e^c$ is $c$.
```

```lemma[Softmax solves a maximum-entropy problem]
For every vector $z \in \mathbb{R}^m$,
$$\operatorname{softmax}(z) = \operatorname*{arg\,max}_{p \in \Delta^{m-1}} \left\{ z \cdot p + H(p) \right\},$$
where $H(p) = -\sum_j p_j \log p_j$ is the entropy (defined below). Softmax is a "soft $\arg\max$": it selects the point of the simplex maximizing the linear score $z \cdot p$ while keeping the entropy — the result always lies in the interior of the simplex, never on a vertex.
```

```proof
With a Lagrange multiplier: $L(p) = z\cdot p - \sum_j p_j\log p_j + \lambda(\sum_j p_j - 1)$. Differentiating in $p_j$: $z_j - \log p_j - 1 + \lambda = 0$, so $p_j = e^{z_j + \lambda - 1}$ — proportional to $e^{z_j}$. Normalizing gives $p = \operatorname{softmax}(z)$. Strict convexity of the entropy gives uniqueness.
```

```remark
This lemma is the first piece of the picture "attention is thermal equilibrium": softmax appears inevitably whenever one maximizes a linear score under an entropy penalty. In Tier 3 we meet the same structure under the names Gibbs distribution and entropic optimal transport.
```

### Information theory

```definition[Entropy, cross-entropy, KL divergence]
For a distribution $p$ on $m$ points, the entropy $H(p) = -\sum_j p_j \log p_j$ measures uncertainty ($H = \log m$ for uniform $p$, $H = 0$ for one-hot $p$). The cross-entropy $H(p, q) = -\sum_j p_j \log q_j$ measures the average cost of encoding data from $p$ with the model $q$. The Kullback–Leibler divergence
$$D_{\mathrm{KL}}(p \,\|\, q) = \sum_j p_j \log \frac{p_j}{q_j} = H(p,q) - H(p)$$
measures the (asymmetric) "distance" from $q$ to $p$.
```

```theorem[Gibbs inequality]
$D_{\mathrm{KL}}(p \,\|\, q) \ge 0$, with equality if and only if $p = q$.
```

```proof
Since $-\log$ is strictly convex, Jensen's inequality gives $-D_{\mathrm{KL}}(p\|q) = \sum_j p_j \log(q_j/p_j) \le \log \sum_j p_j (q_j/p_j) = \log 1 = 0$.
```

```example[Cross-entropy is the paper's loss]
The training loss $L = -\sum_j y_j \log p_j$ with $y$ one-hot at the correct class $c$ is exactly $-\log p_c = H(y, p)$ — the cross-entropy between the label and the prediction. Label smoothing (Tier 2) replaces $y$ by a mixture with the uniform distribution, adding a term $D_{\mathrm{KL}}(u \,\|\, p)$ to the loss — a penalty pulling $p$ toward uniform.
```

```remark[Entropy and information]
The entropy of an attention row measures how much information the readout actually uses: $H = \log m$ is "read everything equally", $H = 0$ is "read exactly one position". Entropy collapse — a key diagnostic of deep transformers — is $H$ approaching $0$ on a few positions; the Tier 3 section explains it via Markov chain theory.
```

### Kernels and feature maps

```definition[Positive definite kernels]
A function $k: X \times X \to \mathbb{R}$ is a positive definite kernel if for every finite set $x_1, \dots, x_n$, the Gram matrix $[k(x_i, x_j)]_{ij}$ is positive semidefinite. Then there exists a Hilbert space $H$ (the reproducing kernel Hilbert space, RKHS) and a feature map $\varphi: X \to H$ such that
$$k(x, y) = \langle \varphi(x), \varphi(y) \rangle_H.$$
```

```example[The exponential kernel of attention]
For $X = \mathbb{R}^{d_k}$, the function $k(q, k) = e^{q^\top k / \sqrt{d_k}}$ is a positive definite kernel — precisely the numerator of the attention weights before normalization. Reading attention as Nadaraya–Watson regression (Tier 1) is reading it as kernel smoothing; replacing the kernel by a finite-dimensional feature map is the road to linear attention (Tier 3).
```

The toolbox is complete. A reader who has absorbed the five blocks above can follow every argument of the post; now we enter the mechanism.

## Sequence transduction and the case against recurrence

The problem the paper solves: map an input sequence $(x_1, \dots, x_n)$ to an output sequence $(y_1, \dots, y_m)$ — machine translation, summarization, and ultimately language modeling. The pre-2017 paradigm, which had dominated sequence modeling, was the recurrent network: a hidden state updated one position at a time,

$$
h_t = f(h_{t-1}, x_t),
$$

so that information about the *past* is carried forward only through the chain of hidden states. Attention entered as a refinement: instead of compressing the whole input into one final state, the decoder reads a soft mixture of all encoder states, with weights learned by a compatibility function [^2].

From a structural standpoint, recurrence has three defects:

1. **It is sequential.** The state $h_t$ cannot be computed before $h_{t-1}$. Computation over $n$ positions takes $n$ time steps, no matter how many processors you have. The paper's word for this is *sequential operations*: $O(n)$ of them.
2. **Distant positions communicate slowly.** A signal from position $1$ must survive $n-1$ hidden-state updates to reach position $n$. The *maximum path length* — the number of operations a piece of information must traverse — is $O(n)$. Long paths mean vanishing gradients and lost information; this is the mathematical content of the "long-term dependency problem."
3. **The additive attention of Bahdanau et al. is not factorizable.** Its compatibility score is $a(q,k) = v^\top \tanh(W_1 q + W_2 k)$, a nonlinear function of a pair of vectors. It cannot be written as a single matrix product, so the $n \times m$ matrix of all pairwise scores cannot be computed with one efficient matrix multiplication.

The paper's counterproposal: compute *all* pairwise compatibility scores between positions, normalize them into probability distributions, and use those distributions to average the data. That is attention. The rest of the paper is the discipline of making that one idea deep enough, parallel enough, and trainable enough to replace everything else.

## The attention mechanism, dismantled

```definition[Scaled dot-product attention]
Let $Q \in \mathbb{R}^{n \times d_k}$ be a matrix of $n$ queries, $K \in \mathbb{R}^{m \times d_k}$ a matrix of $m$ keys, and $V \in \mathbb{R}^{m \times d_v}$ a matrix of $m$ values. Scaled dot-product attention is
$$\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V, \qquad (1)$$
where $\operatorname{softmax}$ is applied row-wise: for a row vector $z \in \mathbb{R}^m$,
$$\operatorname{softmax}(z)_j = \frac{e^{z_j}}{\sum_{l=1}^{m} e^{z_l}}.$$
```

Equation (1) is the paper's equation (1), and it is the whole mechanism. Let us examine it piece by piece.

**The bilinear form.** The product $QK^\top$ is the $n \times m$ matrix of pairwise dot products $(QK^\top)_{ij} = q_i \cdot k_j$, where $q_i$ is the $i$-th row of $Q$ and $k_j$ the $j$-th row of $K$. It is a *bilinear* compatibility function — the bilinear form $q^\top k$ — evaluated at every pair. This is the cheap, factorizable replacement for the additive attention above: the full matrix of scores is one matrix multiplication. The rows of $QK^\top$ are the *logits*: unnormalized scores measuring how well query $i$ matches key $j$.

**The softmax.** Applied row-wise, softmax converts the $i$-th row of logits into a categorical distribution $p_i \in \Delta^{m-1}$ over the $m$ positions:

$$
p_{ij} = \frac{e^{q_i \cdot k_j / \sqrt{d_k}}}{\sum_{l} e^{q_i \cdot k_l / \sqrt{d_k}}}.
$$

Each output position therefore carries a full probability distribution over input positions — the model's *belief* about relevance. Attention does not select; it *distributes*: the output is never forced to commit to a single key.

**The multiplication by $V$.** The output row $i$ is

$$
(\operatorname{Attention}(Q,K,V))_{i\cdot} = \sum_{j=1}^{m} p_{ij}\, V_{j\cdot},
$$

a weighted average of the value rows. Since the attention weights form a probability vector, this is a **convex combination** — a point in the convex hull of the value rows. If we denote the row-stochastic attention matrix by $A = \operatorname{softmax}(QK^\top/\sqrt{d_k})$, with $A \ge 0$ and $A \mathbf{1} = \mathbf{1}$, then the whole computation is the linear map

$$
O = A V.
$$

Every row of $O$ is the *expectation* of the value rows under the categorical distribution $p_i$: $O_{i\cdot} = \mathbb{E}_{j \sim p_i}[V_{j\cdot}]$. Three readings of this single equation organize everything that follows. Reading 2 uses the Nadaraya–Watson estimator [^3] and the kernel view of Tsai et al. [^4].

```remark[Reading 1 — differentiable memory]
The triple $(Q, K, V)$ is a content-addressable memory: the query $q_i$ is a probe, the keys are the addresses, and the values are the contents. Exact retrieval would set $p_i = e_{\arg\max_j q_i \cdot k_j}$ — a hard selection. Attention replaces the $\arg\max$ with a soft address: it reads a *blend* of values weighted by similarity. The map from $Q$ to $O$ is smooth, so gradients flow through the entire retrieval process, and both the contents *and* the addressing scheme can be learned. This is what makes attention usable as a differentiable component in a deep network.
```

```remark[Reading 2 — kernel regression]
Attention is the Nadaraya–Watson estimator of nonparametric statistics. Given data $\{(k_j, v_j)\}_{j=1}^{m}$, the Nadaraya–Watson estimate of the regression function $k \mapsto v$ at the point $q$ is
$$\hat{v}(q) = \frac{\sum_j K(q, k_j)\, v_j}{\sum_j K(q, k_j)}$$
for a kernel $K$. With the exponential kernel $K(q,k) = e^{q \cdot k / \sqrt{d_k}}$, the normalized weights are exactly the softmax weights $p_j$. Attention is therefore kernel smoothing — data-adaptive, learned-kernel regression — evaluated at $n$ query points simultaneously, with the bandwidth fixed by $\sqrt{d_k}$. Tsai et al. showed that attention is precisely a kernel smoother and that the choice of kernel (Gaussian, Laplacian, linear) interpolates between attention variants. We return to this in the final section, because it is the key to breaking the quadratic bottleneck.
```

```remark[Reading 3 — an expectation and an operator]
On the sequence axis, attention is a *linear averaging operator*: $A$ is a row-stochastic matrix, so $V \mapsto AV$ is a convex-combination smoothing of the sequence — but with coefficients that depend on $Q$ and $K$, hence on the *data*. Contrast with a fixed smoothing filter: attention is a data-dependent filter, and the "shape" of the filter is learned. Since each output row is an expectation $\mathbb{E}_{j \sim p_i}[V_{j\cdot}]$, the entropy of $p_i$ — see below — measures how much information the readout actually uses.
```

### Why the $\sqrt{d_k}$? The variance lemma

The paper's footnote gives the reason in one sentence: *assume the components of $q$ and $k$ are independent random variables with mean $0$ and variance $1$; then their dot product has mean $0$ and variance $d_k$.* Let us prove that statement and then push it to its conclusion.

```lemma[Variance of a dot product]
Let $q, k \in \mathbb{R}^{d_k}$ be independent random vectors whose entries are i.i.d. with mean $0$ and variance $\sigma^2$. Then
$$\mathbb{E}[q \cdot k] = 0, \qquad \operatorname{Var}(q \cdot k) = d_k\, \sigma^4.$$
In particular, for entries of variance $1$, the dot product has standard deviation $\sqrt{d_k}$.
```

```proof
By independence, $\mathbb{E}[q_i k_i] = \mathbb{E}[q_i]\mathbb{E}[k_i] = 0$, and the summands $q_i k_i$ are independent, so
$$\operatorname{Var}(q \cdot k) = \sum_{i=1}^{d_k} \operatorname{Var}(q_i k_i) = \sum_{i=1}^{d_k} \mathbb{E}[q_i^2 k_i^2] = \sum_{i=1}^{d_k} \mathbb{E}[q_i^2]\,\mathbb{E}[k_i^2] = d_k \sigma^4.$$
```

The queries and keys in the paper are outputs of linear projections followed by normalization, so their entries are roughly unit scale. The lemma says the *unscaled* logits $q_i \cdot k_j$ have standard deviation $\sqrt{d_k}$ — and $d_k = 64$ in the base model. What goes wrong with logits of size $\sqrt{d_k}$?

```proposition[Saturation without scaling]
Fix the number of keys $m$ and let the entries of $q$ and of each $k_j$ be i.i.d. with mean $0$ and variance $1$. Let $z_j = q \cdot k_j$ be the unscaled logits. Then, as $d_k \to \infty$,
$$\max_j z_j - \max_{j \neq j^*} z_j \;\xrightarrow{p}\; \infty$$
where $j^*$ is the index of the maximum: the gap between the largest and second-largest logit is of order $\sqrt{d_k}$ (the top spacing of $m$ standard Gaussians is $\Theta(1)$, so it grows with the standard deviation $\sqrt{d_k}$). Consequently $\operatorname{softmax}(z)$ converges in probability to a one-hot vector, and the derivative of the softmax vanishes: the gradient of any loss through the attention weights decays to zero.
```

```proof
Each $z_j$ is approximately $\mathcal{N}(0, d_k)$ by the central limit theorem, and the $z_j$ are independent. The gap between the two largest of $m$ i.i.d. Gaussians with standard deviation $\sqrt{d_k}$ equals $\sqrt{d_k}$ times the top spacing of $m$ standard Gaussians, which is $\Theta(1)$ — asymptotically exponential, with mean tending to $\sqrt{2\pi}$ — by the classical extreme-value theory of Gaussian order statistics. For fixed $m$, this gap therefore diverges as $d_k \to \infty$. The softmax of a vector with a divergent top gap concentrates: the largest entry $p_{j^*} \to 1$ in probability, all others $\to 0$. Finally, the Jacobian of the softmax has entries $p_i(\delta_{ij} - p_j)$, which vanish as $p$ degenerates to a one-hot vector — the gradients are killed.
```

The scaling $1/\sqrt{d_k}$ is therefore a *temperature normalization*: $\operatorname{softmax}(z / \sqrt{d_k})$ keeps the effective logit scale at $O(1)$ no matter how large $d_k$ is, so the softmax operates in the regime where its derivative is appreciable and gradients flow. This is precisely what the paper asserts: *"we suspect that for large values of $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients."* The scaling factor is not a detail; it is what makes attention trainable at all.

```remark[Fisher information = the softmax Jacobian]
There is an information-theoretic way to see the same phenomenon. The softmax is the canonical link of the categorical exponential family, and the Jacobian of the map $z \mapsto p(z)$ is
$$\frac{\partial p_i}{\partial z_j} = p_i(\delta_{ij} - p_j) = \left(\operatorname{diag}(p) - pp^\top\right)_{ij},$$
which is exactly the **Fisher information matrix** of the categorical distribution with probabilities $p$. As $p$ approaches a vertex of the simplex — as attention saturates — the Fisher information degenerates (the multinomial model approaches a boundary of the family), and the gradients vanish. "Extremely small gradients" and "degenerate Fisher information" are the same statement in two languages. The scaling $\sqrt{d_k}$ keeps the attention distributions in the *interior* of the simplex, where the geometry of the family is non-degenerate.
```

```remark[Entropy as a diagnostic]
The entropy $H(p_i) = -\sum_j p_{ij} \log p_{ij}$ of an attention row measures how much the readout spreads its information: $H = \log m$ means uniform attention (attending to everything, learning nothing about relevance); $H = 0$ means a one-hot selection (a confident retrieval). Training sharpens attention from a nearly uniform initialization toward structured, low-entropy distributions — the model is learning a memory. Observing entropy across heads and layers is one of the most informative diagnostics in modern transformer interpretability, and we will meet its failure mode — *entropy collapse* — in the final section.
```

## Multi-head attention: an ensemble of smoothers

A single attention distribution is one "aspect" of the input — one way of weighting positions. The paper's second equation multiplies the aspects:

```definition[Multi-head attention]
$$\operatorname{MultiHead}(Q,K,V) = \operatorname{Concat}(\mathrm{head}_1, \dots, \mathrm{head}_h)\, W^O, \qquad (2)$$
where
$$\mathrm{head}_i = \operatorname{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$
with parameter matrices $W_i^Q, W_i^K \in \mathbb{R}^{d_{\text{model}} \times d_k}$, $W_i^V \in \mathbb{R}^{d_{\text{model}} \times d_v}$, and $W^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$. In the base model, $h = 8$, $d_k = d_v = 64$, and $d_{\text{model}} = 512$, so that $d_k = d_v = d_{\text{model}} / h$.
```

Each head is a kernel smoother on a *$d_k$-dimensional subspace* of the feature space: the projection $W_i^Q$ (resp. $W_i^K$) selects which $d_k$ coordinates of each query (resp. key) participate in the compatibility score. The attention matrix of head $i$ is

$$
A_i = \operatorname{softmax}\!\left(\frac{QW_i^Q\, (KW_i^K)^\top}{\sqrt{d_k}}\right),
$$

the Gram matrix of the *projected* queries against the projected keys. Writing $W^O$ in blocks $W^O = [W_1^O \cdots W_h^O]$, the output is

$$
\operatorname{MultiHead}(Q,K,V) = \sum_{i=1}^{h} \left(A_i\, V W_i^V\right) W_i^O,
$$

a sum over heads of (row-stochastic kernel smoother $\circ$ linear map). Multi-head attention is an **ensemble of $h$ kernel smoothers**, each with its own learned subspace and its own attention distribution, recombined by a final linear map.

```proposition[Multi-head costs nothing extra]
Multi-head attention with $h$ heads and $d_k = d_v = d_{\text{model}}/h$ uses the same number of parameters and the same asymptotic computation as single-head attention with full dimension $d_{\text{model}}$.
```

```proof
Each head has projection matrices of total size $3 \cdot d_{\text{model}} \cdot d_k = 3 d_{\text{model}}^2 / h$; across $h$ heads this is $3 d_{\text{model}}^2$. The output matrix $W^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$ contributes $h d_v d_{\text{model}} = d_{\text{model}}^2$. Total: $4 d_{\text{model}}^2$ — identical to a single head with $d_k = d_v = d_{\text{model}}$. For computation, each head computes a score matrix of size $n \times m$ at cost $n m d_k$; summed over heads, $h \cdot n m d_k = n m d_{\text{model}}$, the same as one full-dimensional head. The benefit of splitting is therefore purely *representational*: instead of one rank-$d_{\text{model}}$ bilinear form, the model learns $h$ rank-$d_k$ bilinear forms in parallel.
```

Why would $h$ low-rank interactions beat one full-rank interaction? Because a single softmax distribution must commit to one weighting of positions; $h$ independent distributions allow the model to attend *differently along different axes*. The paper's analysis of the trained heads shows precisely this: individual heads specialize in distinguishable relations — positions that are adjacent in the output (the "positional" heads), relations of syntactic dependency, and coreference (a pronoun attending to its antecedent several positions earlier). Each head is a different learned kernel on a different subspace, and the linear recombination $W^O$ decides how the aspects combine.

```remark
The scaling in Eq. (1) uses the *per-head* dimension $d_k = 64$, not $d_{\text{model}} = 512$ — consistent with the variance lemma: each head's dot products live in $\mathbb{R}^{d_k}$, and it is $d_k$ that must be normalized away. A common implementation error is to scale by $\sqrt{d_{\text{model}}}$; the lemma explains why that is wrong: it over-normalizes the logits of each head by a factor $\sqrt{8}$, flattening the attention distribution toward uniformity.
```

## Self-attention: the all-pairs operator

In the encoder, the three matrices are all derived from the same sequence by learned projections:

$$
Q = XW_Q, \qquad K = XW_K, \qquad V = XW_V, \qquad X \in \mathbb{R}^{n \times d_{\text{model}}}.
$$

Self-attention is then a map $X \mapsto \operatorname{softmax}(XW_Q W_K^\top X^\top / \sqrt{d_k}) X W_V$ from the representation of a sequence to a new representation of the same sequence. Two structural facts about this map organize everything.

```theorem[Permutation equivariance]
Let $\pi$ be a permutation of the $n$ positions, acting on a matrix by permuting its rows. Self-attention is equivariant: for all $Q, K, V$,
$$\operatorname{Attention}(\pi Q, \pi K, \pi V) = \pi\, \operatorname{Attention}(Q, K, V).$$
```

```proof
Since $\pi$ acts by permuting rows, $(\pi Q)(\pi K)^\top = \pi (QK^\top) \pi^\top$. For any matrix $M$, the row-wise softmax of $\pi M \pi^\top$ has entries $(\operatorname{softmax}(\pi M \pi^\top))_{ij} = \operatorname{softmax}(M)_{\pi^{-1}(i), \pi^{-1}(j)}$, because row $i$ of the permuted matrix is row $\pi^{-1}(i)$ of $M$ with columns permuted by $\pi^{-1}$, and softmax of a permuted vector is the permuted softmax. Hence $A' = \pi A \pi^\top$, and
$$A' (\pi V) = \pi A \pi^\top \pi V = \pi (A V).$$
```

```corollary[Position must be injected]
Pure self-attention treats the sequence as a *set*: it cannot distinguish order. Any order information in the model must be injected separately — which is exactly why the paper adds positional encodings (Section "Positional encodings: time as a torus"). In other words, attention alone is permutation-equivariant, so the architecture must break the equivariance by hand.
```

The attention matrix $A = \operatorname{softmax}(QK^\top/\sqrt{d_k})$ has another life: it is a **row-stochastic matrix**, the transition matrix of a Markov chain on the $n$ positions. Self-attention computes one step of message passing along a *complete directed graph* whose edge weights $A_{ij}$ are learned, data-dependent transition probabilities: each node aggregates its neighbors' values with weights $A_{ij}$. Stacking layers composes these stochastic operators (interleaved with the pointwise nonlinearities), so deep transformers iteratively diffuse information through the sequence. This Markovian reading becomes predictive in the final section, where the empirically observed failure modes of deep attention are literally the phenomena of Markov chains — convergence to absorbing states.

### Masked attention: causality as a truncated distribution

The decoder's self-attention must be *causal*: the prediction at position $i$ may depend only on positions $j \le i$. The paper implements this with a mask added to the logits: an additive matrix $M$ with

$$
M_{ij} = \begin{cases} 0 & j \le i, \\ -\infty & j > i, \end{cases}
$$

so that

$$
\operatorname{softmax}(z + M)_j = \begin{cases} \dfrac{e^{z_j}}{\sum_{l \le i} e^{z_l}} & j \le i, \\[1em] 0 & j > i, \end{cases}
$$

a **truncated categorical distribution** — the softmax of the logits restricted to the prefix $\{1, \dots, i\}$. The masked attention matrix is lower-triangular and row-stochastic, each row's support being a prefix of positions. This single device reconciles two requirements that seem contradictory: the model must be trained on all positions *in parallel* (teacher forcing, where the correct previous outputs are fed in), and yet generate *autoregressively* at inference (each token conditioned only on its predecessors). The mask makes both true at once. The cross-attention in the decoder — where $Q$ comes from the decoder and $K, V$ from the encoder — carries no mask: every decoder position may attend to every encoder position.

### The complexity ledger

The paper's Table 1 is the quantitative case for attention. For a layer processing $n$ positions of dimension $d$, with convolutional kernel width $k$ and attention window $r$:

- **Self-attention:** complexity $O(n^2 d)$, sequential operations $O(1)$, maximum path length $O(1)$.
- **Recurrent:** complexity $O(n d^2)$, sequential operations $O(n)$, maximum path length $O(n)$.
- **Convolutional:** complexity $O(k n d^2)$, sequential operations $O(1)$, maximum path length $O(\log_k n)$.
- **Restricted attention** (window $r$): complexity $O(r n d)$, sequential operations $O(1)$, maximum path length $O(n/r)$.

The *maximum path length* is the mathematical measure of long-range dependence: how many operations a signal must traverse to travel between two distant positions. Recurrence has path length $O(n)$ — position $1$ reaches position $n$ only through the hidden-state chain. Convolution grows its receptive field by a factor $k$ per layer, so the path length is $O(\log_k n)$ — better, but still logarithmic. Self-attention connects *every pair of positions directly*: path length $O(1)$ in a single layer. Information never has to travel; it is already everywhere.

The quadratic term $O(n^2 d)$ is the price of all-pairs connectivity. The paper's defense is the regime: in machine translation, $n$ is the sentence length (tens of tokens) and $d = 512$, so $n^2 d < n d^2$ — attention is *cheaper* than recurrence in exactly the regime that matters. (The restricted-attention variant, from the Image Transformer, interpolates: an $r$-window trades path length for $O(r n d)$ cost.) Two of the three defects of recurrence are eliminated outright — parallelism and path length — and the third, complexity, is turned into a regime question.

## Positional encodings: time as a torus

Permutation equivariance is a bug and a feature: it guarantees order cannot leak in accidentally, but order must enter somehow. The paper's solution is equation (4):

```definition[Sinusoidal positional encoding]
For position $\mathrm{pos} \ge 0$ and dimension index $i = 0, \dots, d_{\text{model}}/2 - 1$,
$$\mathrm{PE}_{(\mathrm{pos}, 2i)} = \sin\!\left(\frac{\mathrm{pos}}{10000^{2i/d_{\text{model}}}}\right), \qquad \mathrm{PE}_{(\mathrm{pos}, 2i+1)} = \cos\!\left(\frac{\mathrm{pos}}{10000^{2i/d_{\text{model}}}}\right). \qquad (4)$$
```

Write $\omega_i = 10000^{-2i/d_{\text{model}}}$. The frequencies $\omega_i$ form a **geometric progression** from $1$ down to $10000^{-1}$ as $i$ ranges from $0$ to $d_{\text{model}}/2 - 1$: a stack of oscillators at exponentially spaced frequencies. The encoding of position $\mathrm{pos}$ is the vector

$$
\mathrm{PE}(\mathrm{pos}) = \big(\sin(\omega_0 \mathrm{pos}), \cos(\omega_0 \mathrm{pos}), \dots, \sin(\omega_{d/2-1} \mathrm{pos}), \cos(\omega_{d/2-1} \mathrm{pos})\big)^\top,
$$

a point on the **torus** $(S^1)^{d/2}$: each coordinate pair $(2i, 2i+1)$ is a point on the unit circle at phase $\omega_i \mathrm{pos}$. The map $\mathrm{pos} \mapsto \mathrm{PE}(\mathrm{pos})$ is a linear flow on the torus with frequency vector $(\omega_0, \dots, \omega_{d/2-1})$, and the whole encoding is bounded: every entry lies in $[-1, 1]$.

The reason the paper chose *this* encoding over learned embeddings is a linear-algebra fact:

```theorem[Position shift = rotation]
Let $\mathrm{PE}(\mathrm{pos}) \in \mathbb{R}^d$ be the sinusoidal encoding above. For any integer shift $k$,
$$\mathrm{PE}(\mathrm{pos} + k) = R_k\, \mathrm{PE}(\mathrm{pos}),$$
where $R_k$ is the block-diagonal orthogonal matrix whose $2 \times 2$ blocks are the rotations
$$R(\omega_i k) = \begin{pmatrix} \cos(\omega_i k) & \sin(\omega_i k) \\ -\sin(\omega_i k) & \cos(\omega_i k) \end{pmatrix}.$$
```

```proof
The coordinate pair of $\mathrm{PE}(\mathrm{pos})$ is $(\sin \phi, \cos \phi)$ with $\phi = \omega_i \mathrm{pos}$. By the addition formulas,
$$\sin(\phi + \theta) = \sin\phi\cos\theta + \cos\phi\sin\theta, \qquad \cos(\phi + \theta) = \cos\phi\cos\theta - \sin\phi\sin\theta,$$
which is exactly the action of the rotation matrix $R(\theta)$ on $(\sin\phi, \cos\phi)$ with $\theta = \omega_i k$. Assembling the blocks over $i$ gives $R_k$; it is orthogonal (a block diagonal of rotations) and independent of $\mathrm{pos}$.
```

The consequence is the paper's claim, made precise: *"the model can easily learn to attend by relative positions."* A relative displacement is not a complicated nonlinear function of the encoding — it is a **linear map** (a rotation) applied to the encoding. Whatever linear machinery the network uses to combine positions can represent "position $j$ is $k$ steps after position $i$" by a single learned matrix acting on the encodings. The same fact has a second, subtler corollary:

```corollary[Translation-invariant positional kernel]
The inner product of positional encodings depends only on the *relative* distance:
$$\mathrm{PE}(p)^\top \mathrm{PE}(q) = \sum_{i} \cos(\omega_i (p - q)).$$
```

```proof
Expand $\sin\omega_i p \sin\omega_i q + \cos\omega_i p \cos\omega_i q = \cos(\omega_i(p-q))$ by the cosine difference identity, and sum over $i$.
```

The positional encoding is thus a *feature map for a shift-invariant (stationary) kernel* over positions — a deterministic cousin of the random Fourier features of Rahimi and Recht, which approximate translation-invariant kernels by trigonometric feature maps via Bochner's theorem [^5]. Attention between positions $p$ and $q$ built from these features sees a similarity that depends only on $p - q$ — exactly the inductive bias that relative positional encodings later made explicit by parameterizing attention scores directly by the offset $j - i$ [^6].

Two further design details deserve comment. First, the *geometric* frequency schedule is a multiscale decomposition: the low-frequency coordinates ($\omega_i$ near $1$) vary slowly and encode coarse position, while the high-frequency coordinates resolve fine offsets — a Fourier/wavelet decomposition of the position signal, giving the encoding both long-range and short-range resolution. Second, the paper multiplies the learned token embeddings by $\sqrt{d_{\text{model}}}$ before adding the encoding: the learned embeddings have entries of unit scale and hence norm $\approx \sqrt{d_{\text{model}}}$, while the encoding is bounded entrywise by $1$; the scaling puts the two contributions on comparable footing so that neither drowns the other in the sum.

## The feed-forward network: nonlinearity in the feature axis

```definition[Position-wise feed-forward network]
$$\mathrm{FFN}(x) = \max(0,\, xW_1 + b_1)\, W_2 + b_2, \qquad (3)$$
with $W_1 \in \mathbb{R}^{d_{\text{model}} \times 4 d_{\text{model}}}$, $W_2 \in \mathbb{R}^{4 d_{\text{model}} \times d_{\text{model}}}$, and the same weights applied independently at every position.
```

Equation (3) is the paper's equation (3): a two-layer perceptron with a hidden layer of width $4 d_{\text{model}}$ and the ReLU nonlinearity $\max(0, \cdot)$. Its mathematical role in the block is precise, and it is complementary to attention's:

- **Attention mixes across positions** — it is a linear operator on the sequence axis (a row-stochastic matrix applied to $V$), leaving each row's *feature* structure untouched except through the learned values.
- **The FFN mixes across features** — it is a nonlinear map on the feature axis, applied identically at every position (a $1 \times 1$ convolution, in convolutional language).

The transformer block alternates the two directions of mixing: an attention sublayer exchanges information *horizontally* (across positions), then an FFN transforms it *vertically* (across features). This separation is what makes the architecture simultaneously parallel (attention is a fixed, position-independent sequence of matrix operations) and expressive (the FFN injects the nonlinearity that attention alone lacks — attention is linear in $V$ with data-dependent coefficients, and a stack of linear maps with no pointwise nonlinearity would collapse to a single linear map).

The ReLU is worth a second look: it is piecewise linear, and the hidden activation

$$
h = \max(0, xW_1 + b_1)
$$

is *sparse* — the fraction of active units depends on the input. Writing $D(x) = \operatorname{diag}(\mathbf{1}_{\{xW_1 + b_1 > 0\}})$, the FFN acts as a data-dependent gate:

$$
\mathrm{FFN}(x) = W_2\, D(x)\,(xW_1 + b_1) + b_2,
$$

a learned linear map whose effective weight matrix is *switched on and off* by the data. The width factor $4$ expands the representation into a higher-dimensional feature space before projecting back — the same expansion-contraction pattern as a random-feature or kernel-style embedding, and the place where the model stores the bulk of its parameters (the two FFN matrices per block dominate the attention matrices by a factor of two). There is also a memory reading: the rows of $W_1$ act as keys and the columns of $W_2$ as values, making each FFN a key–value memory in its own right [^12]. Attention is the memory that *mixes positions*; the FFN is the memory that *mixes features*.

## Residual connections and LayerNorm: the training algebra

Every sublayer in the paper is wrapped as

$$
\operatorname{LayerNorm}\!\big(x + \operatorname{Sublayer}(x)\big),
$$

the **post-norm** configuration: the residual connection adds the input back to the sublayer output, and LayerNorm normalizes the sum. Two pieces of mathematics make this the right wrapper.

**The residual connection.** Writing $h = x + f(x)$, the map is a perturbation of the identity, and its derivative is

$$
\frac{\partial h}{\partial x} = I + \frac{\partial f}{\partial x}.
$$

Backpropagation through $L$ layers multiplies the Jacobians $\prod_{t} (I + J_t)$. The identity term is the crucial one: gradients can *skip* every nonlinearity and flow backward along the identity path, so the product does not shrink exponentially in depth the way a chain $\prod_t J_t$ of Jacobians typically does. Equivalently, expanding the recurrence,

$$
x_L = x_0 + \sum_{t=1}^{L} f_t(x_{t-1}),
$$

the final representation is an *accumulated sum of corrections*: each layer adds a refinement to a stream that is never discarded. This is the **residual stream** view, and it has a dynamical-systems reading: $x_{t+1} - x_t = f_t(x_t)$ is an Euler step for the ordinary differential equation

$$
\frac{dx}{ds} = F(x),
$$

so a deep residual network is a discretization of a continuous flow on the space of token representations — depth is integration time, and "going deeper" is integrating longer. (The modern pre-norm variant, applying LayerNorm to the sublayer output *before* the residual addition, makes the residual stream literally unnormalized — a detail that only sharpens this picture, and which is why pre-norm has become the standard for very deep transformers.)

**LayerNorm.** Given a token's feature vector $x \in \mathbb{R}^d$, LayerNorm computes the mean $\mu = \frac{1}{d}\sum_i x_i$ and variance $\sigma^2 = \frac{1}{d}\sum_i (x_i - \mu)^2$ over the feature axis, then applies

$$
\operatorname{LN}(x) = \gamma \odot \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} + \beta,
$$

with learnable scale $\gamma \in \mathbb{R}^d$ and shift $\beta \in \mathbb{R}^d$ [^13]. Its defining property is a small lemma:

```lemma[LayerNorm invariance]
For any $c > 0$ and any $b \in \mathbb{R}$, $\operatorname{LN}(cx + b\mathbf{1}) = \operatorname{LN}(x)$: LayerNorm is invariant to rescaling and to additive constants of its input.
```

```proof
The normalized vector $(x - \mu)/\sqrt{\sigma^2}$ is invariant: subtracting $b\mathbf{1}$ cancels in $x - \mu$, and scaling multiplies both numerator and denominator by $c$. The learnable $\gamma, \beta$ then re-introduce scale and shift as free parameters.
```

This invariance is the mathematical content of "normalization stabilizes training": intermediate representations in a deep network drift in magnitude, and without normalization the later layers are at the mercy of that drift. LayerNorm removes both the scale and the mean of each token's representation, so the network's effective computation is invariant to the size of intermediate activations — the drift is normalized away at every step. It is applied *per token* (over the feature axis), which makes it independent of the batch statistics and usable in autoregressive decoding, unlike BatchNorm. (The normalization also has a geometric reading: $(x - \mu)/\sigma$ is the projection of $x$ onto the sphere of radius $\sqrt{d}$ in the hyperplane orthogonal to $\mathbf{1}$ — representations live on a sphere, which recent analyses of transformer geometry exploit directly.)

The paper's training recipe is the rest of the algebra: dropout at rate $0.1$ applied to each sublayer output before the residual addition, and to the sum of embeddings and positional encodings; the residual, normalization, and dropout together are what make deep stacks of attention trainable. (Attention-weight dropout — dropping entries of the stochastic matrix $A$ — is a later standard addition, not in the original paper.)

## Why attention is all you need: the architecture

The full model assembles the pieces. The **encoder** is $N = 6$ identical blocks, each a multi-head self-attention sublayer and an FFN sublayer, each wrapped in Add & Norm. The **decoder** is $N = 6$ blocks, each with a *masked* multi-head self-attention sublayer (causality), a multi-head *cross-attention* sublayer in which the queries come from the decoder and the keys and values from the encoder output (conditioning on the source), and an FFN sublayer. The decoder ends in a learned linear map and a softmax over the vocabulary. The token embeddings are shared between the encoder, the decoder, and the pre-softmax projection (weight tying), and the positional encodings are added to the embeddings at the bottom of both stacks.

Every component that previous architectures used for sequence modeling has been replaced: recurrence by self-attention (the causal mask handles order), encoder–decoder attention by cross-attention, and the position-by-position computation by the FFN. The paper's claim is architectural: the three operations a transduction model needs — mixing information across positions, transforming features, and conditioning the output on the input — are all implemented with attention, feed-forward maps, and the residual/normalization wrapper, with *no* recurrence and *no* convolution. The empirical payload: the big model reaches 28.4 BLEU on English-to-German (2 BLEU above the previous best) and 41.8 on English-to-French, trained in 3.5 days on 8 GPUs — where the recurrent baselines required weeks. Parallelism and short paths are not just theory; they are wall-clock time.

## Training, mathematically

The paper's training section is as mathematical as its architecture, and three choices deserve formula-level treatment.

**Label smoothing.** The training objective is cross-entropy against the one-hot target $y$: $L = -\sum_j y_j \log p_j = -\log p_{\text{correct}}$. Label smoothing replaces the target with a mixture of the one-hot distribution and the uniform distribution over the vocabulary of size $K$:

$$
y' = (1 - \varepsilon) y + \frac{\varepsilon}{K}\mathbf{1}, \qquad \varepsilon = 0.1.
$$

The loss becomes

$$
L = -\sum_j y'_j \log p_j = (1-\varepsilon)(-\log p_c) - \frac{\varepsilon}{K}\sum_{j} \log p_j,
$$

where the second term is minimized when $p$ is uniform — it is a penalty on overconfidence, a regularizer pulling the predictive distribution away from the simplex vertex. (Equivalently, $- \frac{1}{K}\sum_j \log p_j = \mathrm{KL}(u \,\|\, p) + H(u)$, where $u$ is the uniform distribution: smoothing adds a divergence-to-uniform term.) The paper's report that smoothing "hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU" is exactly what the mathematics predicts: the model becomes less certain (perplexity rises) and less overfit (accuracy rises). In information-theoretic terms, smoothing caps the model's capacity to concentrate probability mass — it keeps the predictive distributions in the interior of the simplex, the same philosophy as the $\sqrt{d_k}$ scaling.

**Adam with warmup.** The optimizer is Adam with $\beta_1 = 0.9$, $\beta_2 = 0.98$, $\varepsilon = 10^{-9}$, and a learning rate that varies over training as

$$
\mathrm{lrate} = d_{\text{model}}^{-1/2} \cdot \min\!\left(\mathrm{step}^{-1/2},\; \mathrm{step} \cdot \mathrm{warmup}^{-3/2}\right), \qquad \mathrm{warmup} = 4000.
$$

For $\mathrm{step} < 4000$ this is a linear ramp from zero with slope $d_{\text{model}}^{-1/2}\,\mathrm{warmup}^{-3/2}$; for $\mathrm{step} \ge 4000$ it decays as $\mathrm{step}^{-1/2}$. The warmup is not a convenience: Adam's variance estimate $\hat{v}_t$ is a moving average of squared gradients, unreliable when it has seen only a few samples, and a large step size in the first thousands of steps destabilizes the estimate; the linear ramp lets the adaptive scales settle before the decay regime. The prefactor $d_{\text{model}}^{-1/2}$ is the same square-root scaling as attention's — larger models get proportionally smaller learning rates — and the choice $\beta_2 = 0.98$ (rather than the usual $0.999$) is a shorter-memory average of squared gradients, making the adaptive scale more responsive — appropriate when gradient magnitudes fluctuate.

**Dropout placement.** Dropout at rate $0.1$ is applied to the output of each sublayer before the residual addition and to the embedding-plus-positional sum. Since the residual stream is an accumulated sum of corrections, dropout acts as noise injected into the corrections — a regularizer on the identity-residual structure itself, preventing any single layer from becoming indispensable and forcing the model to distribute its computation across the depth.

## Advanced I — Expressive power: universal approximation, Turing completeness, limitations

Tiers 1 and 2 answer the question *what this architecture computes*; this tier answers *what functions it can represent*. Three results, in increasing order of subtlety [^14][^15][^16][^17].

```theorem[Universal approximation (Yun, Bhojanapalli, Rawat, Reddi, Kumar 2020)]
(i) With positional encodings, a transformer uniformly approximates every continuous function $f: K \to \mathbb{R}^{n \times d}$ on a compact set $K \subseteq \mathbb{R}^{n \times d}$: for every $\varepsilon > 0$ there is a transformer $T$ (with a constant number of layers, independent of $n, d$) such that $\sup_{X \in K} \|f(X) - T(X)\|_{\infty} < \varepsilon$.\\
(ii) Without positional encodings, a transformer uniformly approximates exactly the class of *permutation-equivariant* functions — the natural class of functions on sequences viewed as sets.
```

This is remarkable because transformers share parameters heavily (the same weights act at every position): representational power is not lost to weight sharing. The proof has four steps, each tied to an architectural component:

```proof[Proof sketch]
1. **Discretization.** $f$ continuous on compact $K$ is uniformly continuous: within any tolerance, $K$ admits a finite partition into small pieces on which $f$ is nearly constant. It suffices for the transformer to recognize which piece contains the input $X$ and output the value of $f$ on that piece.
2. **Contextual mapping.** This is the real role of self-attention in the proof: for two distinct sequences $X \ne Y$, there exist attention layers (softmax, fixed width, temperature tending to $0$) mapping them to representations that differ *at every position* — each sequence receives a unique "code" depending on the whole context, not on individual tokens.
3. **Gathering the code.** A second attention layer, together with positional encodings, reads the code of the piece into a fixed position (say the first) — a pure key–value lookup.
4. **Lookup table.** A final (wide enough) feed-forward network implements the piecewise-constant map: piece code to the value of $f$ on that piece. The classical approximation result: a two-layer ReLU network interpolates any piecewise-constant function on a finite point set. Fine enough pieces push the error below $\varepsilon$.
```

```remark
The four steps assign precise roles: attention does *context mixing* (steps 2–3), the FFN does *feature transformation* (step 4) — exactly the two roles analyzed in Tier 2, now proved sufficient and necessary. Note that real softmax is not hard attention; modern variants of the theorem (universal approximation with smooth softmax, with bounded width) are ongoing refinements of this line.
```

Universal approximation is an *existence* result: it says nothing about whether gradient descent finds the parameters. The second result concerns *computational* power:

```theorem[Turing completeness (Pérez, Barceló, Marinkovic 2021)]
A transformer with hard attention, unbounded numerical precision, and unbounded context simulates every Turing machine: for each Turing machine $M$ there is a transformer that takes the code of $M$ and an input, simulates each state transition, and halts exactly when $M$ halts.
```

```proof[Idea]
Three architectural components suffice: the residual stream acts as the tape (each position is a tape cell, written by projections); attention acts as *shift* and *read* — one attention head can move content between adjacent positions, simulating the movement of the tape head; the FFN acts as the machine's transition function. With hard attention every selection is exact, so the layer sequence replicates the Turing machine's loop.
```

The two results above assume unbounded precision. The third shows what happens when arithmetic is bounded — as in real transformers:

```theorem[The log-precision limit (Hahn 2020; Liu, Ash, Goel, Krishnamurthy, Zhang 2022)]
(i) (Hahn) With average-hard attention and unbounded precision, each output position depends only on a fixed window around it; hence the transformer cannot recognize the language PARITY — the parity of the number of $1$'s — which requires global information.\\
(ii) (Liu et al.) A log-precision transformer with constant depth is equivalent to a constant-depth threshold circuit ($\mathrm{TC}^0$): it computes exactly the functions of that complexity class, no more.
```

```remark[Three results, three regimes]
The three theorems are not in conflict: they concern three regimes — unbounded precision with softmax/hard attention (approximate every continuous function), unbounded precision with hard attention (compute every recursive function), and bounded precision with constant depth (compute only $\mathrm{TC}^0$). Real transformers live in the third regime, so their practical power comes from *combining* the sequentiality of inference (chain-of-thought, successive decoding steps) with the representational power of each step — an observation later confirmed empirically by reasoning models.
```

## Advanced II — Generalization theory: why the model learns

Universal approximation answers "can represent"; statistical learning theory answers "learns, without overfitting". The standard framework: data $\{(x_i, y_i)\}$ i.i.d. from an unknown $\mathcal{D}$; the model picks $h$ from a class $\mathcal{H}$ to minimize the empirical error. The two bounds below are classical results of statistical learning: the Rademacher bound of Bartlett–Mendelson [^18], and the self-attention-specific bounds of Edelman et al. [^19].

```definition[Expected and empirical error]
For a loss $\ell$ and hypothesis $h \in \mathcal{H}$: the expected error $R(h) = \mathbb{E}_{(x,y)\sim\mathcal{D}}[\ell(h(x), y)]$ and the empirical error $\hat{R}(h) = \tfrac{1}{n}\sum_i \ell(h(x_i), y_i)$. The generalization gap is $R(h) - \hat{R}(h)$: the excess error on unseen data over seen data.
```

```definition[Rademacher complexity]
For a function class $\mathcal{F} \subseteq \{f: X \to [0,1]\}$,
$$\mathcal{R}_n(\mathcal{F}) = \mathbb{E}_{\sigma, x}\left[ \sup_{f \in \mathcal{F}} \frac{1}{n} \sum_{i=1}^{n} \sigma_i f(x_i) \right],$$
where $\sigma_i \in \{\pm 1\}$ are independent Rademacher variables. This measures the class's ability to "fit noise": if the class can fit arbitrary random signs $\sigma_i$, the complexity is large.
```

```theorem[Rademacher bound (Bartlett–Mendelson 2002)]
With probability at least $1 - \delta$ over an i.i.d. sample of size $n$,
$$\sup_{f \in \mathcal{F}} \bigl(R(f) - \hat{R}(f)\bigr) \;\le\; 2\,\mathcal{R}_n(\mathcal{F}) + \sqrt{\frac{\ln(1/\delta)}{2n}}.$$
The generalization gap is bounded by the Rademacher complexity plus a term decaying in $n$.
```

To apply this to transformers we need a simple but crucial observation about attention:

```lemma[Attention is a contraction in $\ell_\infty$]
Let $A$ be a row-stochastic matrix. For all $V, V'$:
$$\|AV - AV'\|_{\infty} \;\le\; \|V - V'\|_{\infty}.$$
Row-wise smoothing never increases the $\ell_\infty$ distance between sequences.
```

```proof
Row $i$ of $AV$ is a convex combination $\sum_j A_{ij}\, V_{j\cdot}$, so $|(AV - AV')_{i\cdot}| \le \sum_j A_{ij} |V_{j\cdot} - V'_{j\cdot}| \le \max_j |V_{j\cdot} - V'_{j\cdot}|$, row-wise $\ell_\infty$ norm.
```

```remark
This contraction is why transformer generalization bounds do not explode with depth: each attention layer contributes a factor $\le 1$ to the $\ell_\infty$ norm, so the depth $L$ enters the bounds only *linearly* (a sum over layers of norm-dependent quantities divided by $\sqrt{n}$), not exponentially — exactly the form of the self-attention Rademacher bounds. The qualitative answer to "why do hundred-billion-parameter models generalize": the Rademacher complexity of their function class is controlled by weight norms, not by parameter count.
```

The *double descent* phenomenon, documented by Belkin et al. [^20], shows the test error falling again in the overparameterized regime:

```remark[The overparameterized, interpolating regime]
When the parameter count exceeds the sample count, the model interpolates the data (empirical error $\to 0$) yet still generalizes — something the classical bias–variance trade-off does not predict. Modern transformers live in this regime; Rademacher bounds explain part of it (norms, not parameter count, control complexity) and leave the rest — the structure of natural data — to incomplete theories.
```

## Advanced III — The information geometry of attention

Softmax is not merely an activation function: it is the *exponential map* of the discrete exponential family, and through that lens many phenomena of attention — saturation, entropy collapse, temperature — are the geometry of a manifold.

```definition[The discrete exponential family and natural parameters]
A categorical distribution $p$ on $\{1, \dots, m\}$ can be written
$$p_j = \frac{e^{z_j}}{Z}, \qquad Z = \sum_j e^{z_j},$$
with natural parameter $z \in \mathbb{R}^m$ (defined up to an additive constant). The log-partition function is $A(z) = \log \sum_j e^{z_j} = \operatorname{LSE}(z)$.
```

```lemma[Softmax is the gradient of the log-partition function]
$$\frac{\partial A}{\partial z_j}(z) = \frac{e^{z_j}}{Z} = p_j, \qquad \frac{\partial^2 A}{\partial z_j \partial z_k}(z) = p_j(\delta_{jk} - p_k),$$
i.e. $p = \nabla A(z)$, and the Hessian of $A$ is simultaneously the covariance matrix of $p$ and the Fisher information matrix — exactly the softmax Jacobian met in Tier 1.
```

```proof
Direct differentiation: $\partial A/\partial z_j = e^{z_j}/Z$; the second derivative follows from the quotient rule, or by noting that the Jacobian of $z \mapsto \nabla A(z)$ is $\operatorname{diag}(p) - pp^\top$.
```

```theorem[Legendre duality: entropy is the convex conjugate of $A$]
The function $A$ is convex, and its Legendre transform on the interior of the simplex is
$$A^{*}(p) = \sup_{z}\left\{ z \cdot p - A(z) \right\} = \sum_j p_j \log p_j = -H(p).$$
The dual pair recovers each other: $p = \nabla A(z)$ and $z = \nabla A^{*}(p)$ (up to a constant).
```

```proof
The supremum is attained at $z$ with $p = \nabla A(z) = \operatorname{softmax}(z)$, i.e. $z_j = \log p_j + c$; taking $c = 0$ gives $z \cdot p - A(z) = \sum p_j \log p_j - \log\!\sum_j p_j = \sum p_j \log p_j$.
```

This duality upgrades the lemma "softmax solves a maximum-entropy problem" (Tier 0) into a complete story: softmax and entropy are two faces of one convex transform, the Fisher information is the curvature of that convex function itself, and the Legendre duality between log-partition and entropy is the standard result of exponential-family theory [^21]. Its most important consequence is reading attention as *thermal equilibrium*:

```proposition[Attention is a Gibbs distribution]
Fix a query $q$, keys $k_j$, and costs $c_j = -q^\top k_j/\sqrt{d_k}$. The attention row $p = \operatorname{softmax}(q^\top k/\sqrt{d_k})$ is the unique solution of the free-energy minimization
$$\min_{p \in \Delta^{m-1}}\; \left\{ \langle p, c\rangle - H(p) \right\},$$
i.e. minimizing expected cost under an entropy penalty — a Gibbs distribution at temperature $1$. With a temperature parameter $\beta$, $p_j \propto e^{-\beta c_j}$: the paper's scaling factor $1/\sqrt{d_k}$ is precisely the *temperature* of the system.
```

```proof
With a Lagrange multiplier for $\min_p \{ \langle p,c\rangle + \sum_j p_j\log p_j \}$ subject to $\sum_j p_j = 1$: differentiating in $p_j$ gives $c_j + \log p_j + 1 + \lambda = 0$, hence $p_j \propto e^{-c_j} = e^{q^\top k_j/\sqrt{d_k}}$.
```

This Gibbs structure has a name in optimal transport [^22]:

```remark[Entropic optimal transport]
The problem $\min_{P} \{ \langle P, C\rangle - H(P) \}$ with boundary constraints has as solution the Gibbs plans $P_{ij} \propto e^{-C_{ij}}$ (Sinkhorn normalization). Attention is the "one-sided" version: each row is its own Gibbs distribution, with no shared boundary constraint; doubly-stochastic attention variants (Sinkformer) add exactly the missing constraints, making attention a full optimal transport map.
```

```remark[Geometry: the Fisher metric and entropy collapse]
On the simplex, the Fisher metric $ds^2 = \sum_j dp_j^2/p_j$ makes the simplex a manifold of negative curvature; the entropy is strictly convex and maximized at the center. Entropy collapse is the flow of attention distributions toward the boundary of the simplex — where the metric degenerates (Fisher information $\to 0$, as seen in Tier 1) — and the scaling $\sqrt{d_k}$ is the force keeping the system in the interior, where the geometry is non-degenerate. "Saturation", "vanishing gradients", "decreasing entropy", "degenerate Fisher information" are four names for one geometric phenomenon.
```

## Advanced IV — The spectral theory of attention Markov chains

In Tier 1, the attention matrix $A$ was read as the transition matrix of a Markov chain on $n$ positions. We now push that reading to its conclusion: spectral theory tells us exactly when and how fast deep attention converges to a common distribution. The theorems of this section are standard results of Markov chain theory [^23][^24].

```definition[Finite Markov chains]
A Markov chain with transition matrix $P$ (row-stochastic): $\mathbb{P}(X_{t+1} = j \mid X_t = i) = P_{ij}$. An invariant distribution $\pi$ satisfies $\pi P = \pi$. The chain is irreducible (every state reaches every state) and aperiodic if and only if there is a unique $\pi > 0$ and $P^t \to \mathbf{1}\pi$ row-wise.
```

```theorem[Perron–Frobenius]
Let $P$ be row-stochastic, irreducible, aperiodic. The number $\lambda = 1$ is a simple eigenvalue with right eigenvector $\mathbf{1}$ and left eigenvector $\pi > 0$ (the invariant distribution); every other eigenvalue satisfies $|\lambda| < 1$. The convergence rate is governed by the spectral gap $\gamma = 1 - \max\{|\lambda| : \lambda \ne 1\}$:
$$\|P^t(x,\cdot) - \pi\|_{\mathrm{TV}} \;\le\; C\, (1-\gamma)^t,$$
with $C = \tfrac{1}{2}\sqrt{1/\pi_{\min}}$ for reversible chains. The mixing time $\tau_{\mathrm{mix}}(\varepsilon) \asymp \tfrac{1}{\gamma}\log\tfrac{1}{\varepsilon}$.
```

```lemma[The Dobrushin ergodicity coefficient]
The Dobrushin coefficient of $P$ is the maximal total-variation distance between two rows:
$$\delta(P) = \max_{i,j} \; d_{\mathrm{TV}}(P_{i\cdot}, P_{j\cdot}) \in [0,1].$$
For all distributions $\mu, \nu$: $d_{\mathrm{TV}}(\mu P, \nu P) \le \delta(P)\, d_{\mathrm{TV}}(\mu, \nu)$, and for two matrices $\delta(PQ) \le \delta(P)\delta(Q)$.
```

```proof
The total-variation distance between $\mu P$ and $\nu P$ is $\tfrac{1}{2}\sum_j |\sum_i (\mu_i - \nu_i) P_{ij}| = \tfrac{1}{2}\sum_j |(\mu-\nu) P_{\cdot j}|$. This is the $\ell_1$ norm of the action of $P$ on the row vector $\mu - \nu$; the $\ell_1$-to-$\ell_1$ operator norm of $P$ is exactly $\max_{i,j} \tfrac{1}{2}\sum_k |P_{ik} - P_{jk}| = \delta(P)$ — the classical Dobrushin result on the operator norm of stochastic matrices.
```

```theorem[Composed attention homogenizes]
Let $A_1, \dots, A_L$ be attention matrices (row-stochastic) of $L$ layers and $\Pi = A_L \cdots A_1$. If the product of Dobrushin coefficients contracts uniformly, $\delta(A_1)\cdots\delta(A_L) \to 0$ as $L \to \infty$, then the rows of $\Pi$ converge to a common distribution: $\Pi \to \mathbf{1}\pi$ with $\pi = \mu A_1 \cdots A_L$ for any $\mu$ — every position ends up reading the same mixture of input positions.
```

```proof
From $\delta(\Pi) \le \prod_t \delta(A_t) \to 0$, the total-variation distance between any two rows of $\Pi$ tends to $0$: all rows converge to one distribution; it is $\pi$ because every row is $\mu A_1 \cdots A_L$ with $\mu$ a row of $A_1$.
```

The two empirical phenomena — entropy collapse [^9] and attention sinks [^10] — read precisely in this framework:

```remark[Entropy collapse and attention sinks as consequences]
While attention stays soft ($\delta(A_t) < 1$), stacking layers drives the rows toward a common distribution — row entropies decrease, exactly the observed *entropy collapse*. The position on which the common distribution $\pi$ concentrates its mass is the *attention sink*: eventually every position reads mostly from a few fixed tokens. A subtlety: when attention saturates to one-hot, $\delta(A_t) \to 1$ — different rows point to different places, and contraction slows; the observed sink phenomenon requires coordination across layers driving all rows toward a common set of positions. The theorem gives a precise sufficient condition; a full characterization on *learned* attention operators remains open.
```

```remark[Empirical interventions are spectral interventions]
The practical fixes for entropy collapse — sharpness regularization, fixed sink tokens, renormalization — are all interventions on the spectrum of a stochastic operator: widening the spectral gap, keeping $\delta$ below $1$, or pinning the invariant distribution to a fixed position. Markov theory turns "engineering tricks" into operations on the spectrum.
```

## Advanced V — Kernels, RKHS, and linear attention

Tier 1 read attention as Nadaraya–Watson regression. This tier takes the kernel reading to its full toolkit — reproducing kernel Hilbert spaces — and uses it to break the quadratic barrier. The theorems of Mercer and Bochner are standard results of RKHS theory [^27], and random Fourier features are due to Rahimi–Recht [^5].

```theorem[Mercer]
Let $k$ be a continuous, symmetric, positive definite kernel on a compact space $X$ with a finite measure $\rho$. There exist orthonormal eigenfunctions $\varphi_1, \varphi_2, \dots$ and eigenvalues $\lambda_1 \ge \lambda_2 \ge \dots \ge 0$ such that
$$k(x,y) = \sum_{r \ge 1} \lambda_r\, \varphi_r(x)\varphi_r(y),$$
with absolute and uniform convergence.
```

```theorem[Bochner]
A translation-invariant kernel $k(x,y) = k(x-y)$ is continuous and positive definite if and only if there exists a probability measure $\mu$ on $\mathbb{R}^d$ such that
$$k(x-y) = \int_{\mathbb{R}^d} e^{i\omega \cdot (x-y)}\, d\mu(\omega)$$
— a translation-invariant kernel is the inverse Fourier transform of a probability measure, called its spectrum.
```

The practical consequence of Bochner: if the kernel has spectrum $\mu$, sample $m$ frequencies $\omega_1, \dots, \omega_m$ from $\mu$ and set $\varphi(x) = \sqrt{2/m}\,(\cos(\omega_1\cdot x + b_1), \dots, \cos(\omega_m\cdot x + b_m))$ with $b_i$ uniform on $[0, 2\pi]$; then $k(x,y) \approx \langle \varphi(x), \varphi(y)\rangle$ — the *random Fourier features* of Rahimi–Recht, with uniform error $O(m^{-1/2})$ on compact sets (an error proportional to the complexity of the function class, by the Rademacher bounds of Advanced II). For the exponential kernel of attention there is an even more direct random feature — the FAVOR+ feature of Performer [^8]:

```lemma[Random features for the exponential kernel (FAVOR+)]
For $w \sim \mathcal{N}(0, I_d)$,
$$\mathbb{E}_w\left[ e^{w\cdot q - \|q\|^2/2}\, e^{w\cdot k - \|k\|^2/2} \right] = e^{q\cdot k}.$$
Hence $\varphi(q) = e^{w\cdot q - \|q\|^2/2}$ is a random feature map estimating the exponential kernel $e^{q\cdot k}$ without bias — the foundation of Performer.
```

```proof
The expectation $\mathbb{E}_w[e^{w\cdot (q+k)}]$ is the moment generating function of the normal distribution: $e^{\|q+k\|^2/2}$. Multiplying by $e^{-(\|q\|^2+\|k\|^2)/2}$ gives $e^{q\cdot k}$.
```

The structural consequence of a finite-dimensional feature map is the factorization of the sum — linear attention [^7][^8]:

```theorem[Linear attention]
If the exponential kernel is approximated by a finite-dimensional feature map $\langle \varphi(q), \varphi(k)\rangle \approx e^{q^\top k/\sqrt{d_k}}$, the attention output factorizes:
$$(AV)_{i\cdot} \approx \frac{\varphi(q_i)^\top \sum_j \varphi(k_j)\, V_{j\cdot}}{\varphi(q_i)^\top \sum_j \varphi(k_j)},$$
and the sums $\sum_j \varphi(k_j) V_{j\cdot}^\top$ and $\sum_j \varphi(k_j)$ are computed *once*, at cost $O(n)$ — linear attention, $O(n)$ instead of $O(n^2)$.
```

```remark[Why $O(n^2)$ is a claim about information]
Exact attention forces every pair $(i,j)$ to meet in a dot product — $O(n^2)$ is the inevitable cost of all-pairs information flow. Approximating the kernel by features is the only way out: it replaces "every pair meets" by "every query meets every key through an intermediate projection". Advanced II gives the exact price — approximation error of order $m^{-1/2}$ in the number of features $m$ — and multi-head attention (Tier 1) is an ensemble of $h$ such kernels, each on its own subspace.
```

## Advanced VI — The dynamical systems view and the geometry of representations

Tier 2 read residual connections as an Euler step of a differential equation. This tier pushes that reading to dynamical systems and to the geometry of representation space. The ODE reading was formalized into continuous-depth models by Chen et al. [^25].

```definition[A residual network is a discretized flow]
$\\frac{x_{t+1} - x_t}{1} = f_t(x_t)$ is an Euler step (step size $1$) of the ordinary differential equation
$$\\frac{dx}{ds} = F_s(x),$$
with $F_s$ an interpolation of the $f_t$. A deep transformer is a numerical integrator of a continuous flow on the space of token representations: depth is integration time.
```

```remark[Stability: depth is time, training is flow stability]
In this frame, "why do deep transformers train" is a question about the stability of the discretized flow. Residual connections keep the Jacobian near $I$ (Tier 2), so the flow is nearly isometric: it neither contracts to zero (vanishing gradients) nor blows up (exploding gradients) with depth. The quantities of dynamical systems — Lyapunov exponents, spectral norms of Jacobians — are the precise instruments for "how deep is too deep". This research direction produced continuous-depth models (Neural ODE) and the same discretization underlies score-based diffusion models.
```

The framework of *geometric deep learning* of Bronstein et al. [^26] places these architectures in a unified picture:

```remark[Geometry of the representation space]
Three geometric observations from the post now cohere: LayerNorm projects each token onto a sphere of radius $\\sqrt{d}$ (Tier 2); attention is smoothing along the edges of a complete graph with learned weights — precisely the geometric deep learning frame, in which architectures are equivariant operations on structured objects (grids, groups, graphs, manifolds); and the residual stream defines a flat background connection on representation space. The empirical observations — learned representations have clean linear structure (linear probes, steering vectors), high-dimensional data lives near a low-dimensional manifold (the manifold hypothesis), deep layers "phase-separate" semantics — are fragments of a geometric theory of deep learning still being formed.
```

```remark[Connections to modern mathematics]
Positional encodings are a linear flow on a torus (Tier 2); the rotary embeddings of later models are the same idea with the rotation group $SO(2)$ replacing time-dependent rotations; attention as smoothing on a complete graph is a case of message passing on graphs; and the Gibbs distribution (Advanced III) connects attention to statistical mechanics and optimal transport. The transformer, from this vantage, is a meeting point of four branches of mathematics: probability, geometry, combinatorics, and numerical analysis.
```

## Open questions

The advanced sections answer many "yes or no" questions — yes to universal approximation, yes to Turing completeness, yes to Dobrushin contraction — but leave questions the research community has not closed:

- **Why is the learned kernel $q^\top k$ so good?** Universal approximation says a transformer *can* represent any continuous function; it says nothing about why *gradient descent* finds a good one, or why the trained $W_Q W_K^\top$ is a good compatibility function. The gap between "can represent" and "is learned" is the central question of modern deep learning theory.
- **When does composed attention keep mixing?** The Dobrushin coefficient gives a sufficient condition (uniform contraction) for entropy collapse; a full characterization — necessary and sufficient, on *learned* attention operators — remains an open theorem.
- **Is attention interpretable as explanation?** The rows of $A$ are conditional distributions describing the model's computation, not a causal account of its prediction; the widely noted pitfalls of attention-based explanations [^11] are statistical confounds, and the precise boundary between "description" and "explanation" has no theory.
- **Geometry.** LayerNorm places representations on a sphere, the residual stream defines a flat background connection, softmax is the exponential map of the simplex, attention is smoothing on a complete graph — the architecture is full of geometric structure that a geometric theory of learning has only begun to name. The background question: why do learned representations have such clean linear structure (linear probes, steering vectors) when the whole architecture is nonlinear?
- **Cost.** Linear attention pays for speed with kernel-approximation error; the open question is the optimal cost–fidelity trade-off, and whether structured variants (sparse, hierarchical, windowed, graph-based) beat both.

## A reading path

The post stops at the frontier of provable knowledge. A staged reading list:

1. **Foundations (deepening Tier 0):** *Linear Algebra Done Right* (Axler) for linear algebra; *Probability: Theory and Examples* (Durrett) or *Probability and Random Processes* (Grimmett–Stirzaker) for probability; *Information Theory, Inference, and Learning Algorithms* (MacKay) for information theory.
2. **Statistical learning:** *Foundations of Machine Learning* (Mohri, Rostamizadeh, Talwalkar) — Rademacher, PAC, sample complexity at textbook level.
3. **Markov chains:** *Markov Chains and Mixing Times* (Levin–Peres) — spectral theory and mixing times at the standard of the probability community.
4. **Kernels and RKHS:** *Reproducing Kernel Hilbert Spaces in Probability and Statistics* (Berlinet–Thomas-Agnan) — Mercer, Bochner, RKHS.
5. **Information geometry:** *Information Geometry and Its Applications* (Amari) — exponential families, the Fisher metric, projections.
6. **The primary sources** cited in the post — read in order of appearance, from Vaswani et al. (2017) to the advanced references at the end.

The goal of the path: after Tier 3 of this post and the first four books, you can read theoretical papers on transformers directly — the "research-level reading" of a mathematics graduate student.

## The paper in one paragraph

"Attention Is All You Need" is four equations and one claim. The equations: a row-stochastic kernel smoother (scaled dot-product attention), an ensemble of low-rank smoothers (multi-head), a position-wise nonlinear map (the FFN), and a linear flow on a torus (positional encoding) — wrapped in a residual stream that is a discretized dynamical system, trained with an objective that keeps every probability distribution in the interior of its simplex. The claim: sequence transduction does not need recurrence or convolution — mixing positions, mixing features, and conditioning on the source can all be done with parallel, all-pairs, data-dependent linear operators and pointwise nonlinearities. Every subsequent advance in large-scale AI — every language model, every vision transformer — is an elaboration of those four equations. Each design choice of the paper — the scaling factor, positional encoding, label smoothing, learning-rate schedule — has a mathematical content: variance, kernels, Markov chains, information geometry, and dynamical systems.

The four tiers of the post reflect four levels of understanding of one architecture. Tier 0 supplies exactly the tools — linear algebra, probability, calculus, softmax, information theory, kernels — so that every claim that follows is an argument, not an act of faith. Tiers 1 and 2 read each formula of the paper as a small theorem: attention is a row-stochastic kernel smoother, $\sqrt{d_k}$ is the temperature keeping softmax from saturation, positional encodings are a flow on a torus, the residual stream is a numerical integrator. Tier 3 connects these observations to four mature branches of mathematics: approximation theory and complexity (universal approximation, Turing completeness, the $\mathrm{TC}^0$ limit), statistical learning theory (Rademacher, $\ell_\infty$ contraction), information geometry (Legendre duality, Gibbs distributions, entropic optimal transport), and the spectral theory of Markov chains (Perron–Frobenius, Dobrushin). Having read all four tiers, a practical question — "why does the transformer train and generalize?" — becomes a mathematical question with a partially known answer and an open remainder.

[^1]: A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, I. Polosukhin, *Attention Is All You Need*, NeurIPS 2017, arXiv:1706.03762.
[^2]: D. Bahdanau, K. Cho, Y. Bengio, *Neural Machine Translation by Jointly Learning to Align and Translate*, ICLR 2015, arXiv:1409.0473.
[^3]: E. A. Nadaraya, *On estimating regression*, Theory Probab. Appl. 9 (1964), 141–142; G. S. Watson, *Smooth regression analysis*, Sankhyā A 26 (1964), 359–372.
[^4]: Y.-H. H. Tsai, S. Bai, M. Yamada, T. Morency, R. Salakhutdinov, *Transformer Dissection: A Unified Understanding of Transformer's Attention via the Lens of Kernel*, EMNLP 2019.
[^5]: A. Rahimi, B. Recht, *Random Features for Large-Scale Kernel Machines*, NeurIPS 2007.
[^6]: P. Shaw, J. Uszkoreit, A. Vaswani, *Self-Attention with Relative Position Representations*, NAACL 2018.
[^7]: A. Katharopoulos, A. Vyas, N. Pappas, F. Fleuret, *Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention*, ICML 2020.
[^8]: K. Choromanski, V. Likhosherstov, D. Dohan, X. Song, A. Gane, T. Sarlós, P. Hawkins, J. Davis, A. Mohiuddin, L. Kaiser, D. Belanger, L. Colwell, A. Weller, *Rethinking Attention with Performers*, ICLR 2021.
[^9]: S. Zhai, T. Likhomanenko, E. Littwin, D. Busbridge, J. Ramapuram, Y. Ji, J. M. Susskind, *Stabilizing Transformer Training by Preventing Attention Entropy Collapse*, ICML 2023.
[^10]: G. Xiao, Y. Tian, B. Chen, T. Han, M. Lewis, *Efficient Streaming Language Models with Attention Sinks*, ICLR 2024.
[^11]: S. Jain, B. C. Wallace, *Attention is not Explanation*, NAACL 2019.
[^12]: M. Geva, R. Schuster, J. Berant, O. Levy, *Transformer Feed-Forward Layers Are Key-Value Memories*, EMNLP 2021.
[^13]: J. L. Ba, J. R. Kiros, G. E. Hinton, *Layer Normalization*, arXiv:1607.06450, 2016.
[^14]: C. Yun, S. Bhojanapalli, A. S. Rawat, S. J. Reddi, S. Kumar, *Are Transformers Universal Approximators of Sequence-to-Sequence Functions?*, ICLR 2020, arXiv:1912.10077.
[^15]: J. Pérez, P. Barceló, J. Marinkovic, *Attention is Turing-Complete*, JMLR 22 (2021), arXiv:1909.04458.
[^16]: M. Hahn, *Theoretical Limitations of Self-Attention in Neural Sequence Models*, TACL 8 (2020), 156–171.
[^17]: B. Liu, J. T. Ash, S. Goel, A. Krishnamurthy, C. Zhang, *Transformers Learn Shortcuts to Automata*, ICLR 2023, arXiv:2210.10749.
[^18]: P. L. Bartlett, S. Mendelson, *Rademacher and Gaussian Complexities: Risk Bounds and Structural Results*, JMLR 3 (2002), 463–482.
[^19]: B. L. Edelman, S. Goel, S. Kakade, C. Zhang, *Inductive Biases and Variable Creation in Self-Attention Architectures*, ICML 2022, arXiv:2110.05789.
[^20]: M. Belkin, D. Hsu, S. Ma, S. Mandal, *Reconciling Modern Machine-Learning Practice and the Classical Bias–Variance Trade-off*, PNAS 116 (2019), 15849–15854.
[^21]: M. J. Wainwright, M. I. Jordan, *Graphical Models, Exponential Families, and Variational Inference*, Found. Trends Mach. Learn. 1 (2008), 1–305.
[^22]: M. Cuturi, *Sinkhorn Distances: Lightspeed Computation of Optimal Transport*, NeurIPS 2013.
[^23]: E. Seneta, *Non-negative Matrices and Markov Chains*, 2nd ed., Springer, 1981.
[^24]: D. A. Levin, Y. Peres, *Markov Chains and Mixing Times*, 2nd ed., AMS, 2017.
[^25]: R. T. Q. Chen, Y. Rubanova, J. Bettencourt, D. Duvenaud, *Neural Ordinary Differential Equations*, NeurIPS 2018.
[^26]: M. M. Bronstein, J. Bruna, T. Cohen, P. Veličković, *Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges*, 2021, arXiv:2104.13478.
[^27]: A. Berlinet, C. Thomas-Agnan, *Reproducing Kernel Hilbert Spaces in Probability and Statistics*, Kluwer, 2004.
