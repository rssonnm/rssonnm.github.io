---
title: "The Zeta Function, and Why the Primes Hide Inside It"
date: 2026-06-18
description: "From a convergent series to Euler's product, and the analytic continuation that turns a function of a real variable into a window on the primes."
topic: mathematics
tags: [number-theory, analysis, riemann-hypothesis]
featured: false
draft: false
---

The distribution of the prime numbers is one of the most stubborn mysteries in mathematics. Yet a single function — the Riemann zeta function — encodes the primes so faithfully that its zeros, if only we understood them, would pin the primes down completely.

## A series that was once a function of a real variable

For a real exponent $s > 1$ the series

$$
\label{eq:zeta}
\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s}
$$

converges absolutely, because $\zeta(s) \le 1 + \int_1^{\infty} x^{-s}\,dx = \frac{s}{s-1}$. The genius of Euler was to see the multiplicative structure hiding inside this additive sum. Since every integer factors uniquely into primes, expanding the geometric series $1 + p^{-s} + p^{-2s} + \cdots$ for each prime and multiplying gives

$$
\label{eq:euler}
\zeta(s) = \prod_{p}\left(1 - \frac{1}{p^s}\right)^{-1}, \qquad \Re(s) > 1.
$$

This product is a sledgehammer. It turns analytic statements about $\zeta$ into arithmetic statements about primes. Because $\zeta(s) \to \infty$ as $s \to 1^+$, the product must diverge at $s = 1$ — which proves, in one line, a theorem Euclid already knew:

```theorem[Euclid]
There are infinitely many prime numbers.
```

```proof
If the primes were finite, the product over them in $\eqref{eq:euler}$ would be a finite product of finite factors — hence finite. But $\zeta(s) \to \infty$ as $s \to 1^+$, while $\zeta(s) = \prod_p (1 - p^{-s})^{-1}$ for $\Re(s) > 1$; so the product over all primes diverges, and there must be infinitely many of them.
```

## The analytic continuation

The series $\eqref{eq:zeta}$ only makes sense for $\Re(s) > 1$, but the function is far too important to leave there. Using summation by parts one obtains

$$
\zeta(s) = \frac{s}{s-1} - s \int_1^{\infty} \frac{\{x\}}{x^{s+1}}\,dx,
$$

where $\{x\}$ is the fractional part of $x$; the integral converges for $\Re(s) > 0$, providing a meromorphic continuation with a single simple pole at $s = 1$ with residue $1$. Repeatedly applying the functional equation

$$
\zeta(s) = 2^s \pi^{s-1} \sin\left(\frac{\pi s}{2}\right) \Gamma(1-s)\, \zeta(1-s)
$$

carries $\zeta$ to the whole plane, exposing the *trivial zeros* at the negative even integers $s = -2, -4, -6, \dots$.

## The connection to primes

Riemann's 1859 memoir[^1] derived an exact formula: the prime-counting function $\pi(x)$ can be written as a sum over the nontrivial zeros $\rho = \beta + i\gamma$ of $\zeta$,

$$
\pi(x) = \operatorname{li}(x) - \sum_{\rho} \operatorname{li}(x^{\rho}) - \log 2 + \int_x^{\infty} \frac{dt}{t(t^2 - 1)\log t},
$$

where $\operatorname{li}(x) = \int_2^x dt / \log t$. Each term $\operatorname{li}(x^{\rho})$ oscillates with amplitude $\sqrt{x}/|\gamma|$, so the growth of the error term in the prime number theorem is governed entirely by the real parts $\beta$ of the zeros. If every nontrivial zero lies on the critical line $\Re(s) = \tfrac{1}{2}$ — the **Riemann hypothesis** — then

$$
\pi(x) = \operatorname{li}(x) + O\big(\sqrt{x}\log x\big).
$$

The primes, scattered and inscrutable, become visible through the zeros of one function. That the hypothesis remains open after a century and a half is precisely what makes the subject so alive.

[^1]: B. Riemann, *Ueber die Anzahl der Primzahlen unter einer gegebenen Grösse*, 1859.
