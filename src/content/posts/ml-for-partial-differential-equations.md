---
title: "Teaching a Neural Network the Laws of Physics"
date: 2026-05-24
description: "Physics-informed neural networks solve partial differential equations by turning the residual into a loss — a short tour with the heat equation."
topic: ai
tags: [neural-networks, pdes, scientific-machine-learning]
featured: false
draft: false
---

Classical numerical methods solve partial differential equations by discretising space and time. Physics-informed neural networks (PINNs) do something stranger: they treat the PDE itself as the loss function, and let gradient descent discover the solution.

## The idea

Suppose we want $u(x,t)$ satisfying the heat equation on a domain $\Omega$,

$$
\frac{\partial u}{\partial t} - \alpha \frac{\partial^2 u}{\partial x^2} = 0, \qquad (x,t) \in \Omega,
$$

with initial data $u(x,0) = u_0(x)$ and boundary conditions $u = g$ on $\partial\Omega$. Approximate $u$ by a neural network $u_\theta(x,t)$ with weights $\theta$. Define the *residual*

$$
\mathcal{R}_\theta(x,t) = \frac{\partial u_\theta}{\partial t} - \alpha \frac{\partial^2 u_\theta}{\partial x^2},
$$

where the derivatives are computed exactly by **automatic differentiation** — no grid, no stencil, no truncation error. Then minimise

$$
\mathcal{L}(\theta) = \frac{1}{N_f}\sum_{i=1}^{N_f} \left|\mathcal{R}_\theta(x_i, t_i)\right|^2
+ \lambda_u \frac{1}{N_u} \sum_{j=1}^{N_u} \left| u_\theta(x_j, 0) - u_0(x_j) \right|^2
+ \lambda_g \frac{1}{N_g} \sum_{k=1}^{N_g} \left| u_\theta(x_k, t_k) - g(x_k, t_k) \right|^2.
$$

The first term asks the network to satisfy the equation in the interior; the others pin it to the data. With enough capacity, the minimiser of $\mathcal{L}$ is a solution of the PDE.

## Why it works (and when it struggles)

The loss is a sum of *squares of residuals*, so it behaves like a least-squares problem — and like all least-squares problems it is only as well-conditioned as the residual spectrum allows. Stiff equations and sharp fronts defeat vanilla PINNs, which is why modern practice adds adaptive collocation weights and domain decomposition. Still, the appeal is genuine:

- It is **mesh-free**: point clouds instead of grids, which is a gift in high dimensions.
- It handles **inverse problems** natively: make $\alpha$ a trainable parameter, and the same loss recovers the diffusivity from data.
- The same code solves the forward problem $u(\alpha) \to u$ and the inverse problem $u \to \alpha$, because both are just optimisation.

For the forward problem the trained network gives a cheap surrogate: once $u_\theta$ is found, evaluating the solution anywhere costs one forward pass, so Monte Carlo sampling over $\Omega$ becomes nearly free.

$$
\mathbb{E}\big[\hat{u}\big] \approx \frac{1}{M}\sum_{m=1}^{M} u_\theta(x_m, t_m), \qquad (x_m, t_m) \sim \mathcal{U}(\Omega)
$$

PINNs are not a replacement for finite elements — they are a different philosophy. One discretises the equation; the other *asks a universal approximator to obey it*. For inverse problems, high-dimensional PDEs, and parameterised families, that bet increasingly pays off.
