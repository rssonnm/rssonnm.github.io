---
title: "The Bloch Sphere: Where a Quantum Bit Becomes Geometry"
date: 2026-07-02
description: "Superpositions, measurement, and one-qubit unitaries — all a sphere's worth of geometry, with a little 2×2 linear algebra."
topic: quantum
tags: [qubits, geometry, linear-algebra]
featured: true
draft: false
---

A classical bit is a coin: heads or tails. A qubit is a coin *spinning in the air* — a superposition that only collapses when you catch it. And unlike the classical case, the full state of a qubit can be drawn on a sphere.

## Superposition

The state of a qubit is a unit vector in $\mathbb{C}^2$, written in the computational basis as

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle, \qquad |\alpha|^2 + |\beta|^2 = 1, \quad \alpha, \beta \in \mathbb{C}.
$$

Measuring in the computational basis returns $0$ with probability $|\alpha|^2$ and $1$ with probability $|\beta|^2$, collapsing the state onto the outcome. This is why amplitudes — not probabilities — are the currency of quantum mechanics: they interfere.

$$
\frac{1}{\sqrt{2}}\big(|0\rangle + |1\rangle\big)
\quad \text{versus} \quad
\frac{1}{\sqrt{2}}\big(|0\rangle - |1\rangle\big)
$$

Both look identical to a measurement, yet they behave completely differently under interference. Only the complex phases distinguish them.

## The sphere

The overall phase of $|\psi\rangle$ is unobservable, so we may write

$$
|\psi\rangle = e^{i\gamma}\left( \cos\frac{\theta}{2}\,|0\rangle + e^{i\varphi}\sin\frac{\theta}{2}\,|1\rangle \right), \qquad 0 \le \theta \le \pi,\ 0 \le \varphi < 2\pi.
$$

The pair $(\theta, \varphi)$ are spherical coordinates: every qubit state — up to global phase — is a point on a sphere of radius $1$. The poles are the computational basis states, the equator is the equally weighted superpositions, and the azimuth $\varphi$ is the relative phase.

$$
\begin{array}{c|c}
\text{State} & \text{Point on the Bloch sphere} \\ \hline
|0\rangle & \text{north pole} \\
|1\rangle & \text{south pole} \\
(|0\rangle + |1\rangle)/\sqrt{2} & +x\text{-axis} \\
(|0\rangle + i|1\rangle)/\sqrt{2} & +y\text{-axis}
\end{array}
$$

## Evolution is rotation

A closed quantum system evolves by a unitary $U \in U(2)$. Up to the unobservable global phase, one-qubit unitaries are precisely the rotations of the sphere: any $U$ can be written as

$$
U = e^{i\alpha} R_{\hat{n}}(\theta), \qquad
R_{\hat{n}}(\theta) = \exp\!\left(-i \frac{\theta}{2}\, \hat{n}\cdot\vec{\sigma}\right),
$$

where $\vec{\sigma} = (\sigma_x, \sigma_y, \sigma_z)$ are the Pauli matrices. So a quantum gate is never "computation in a box" — it is a definite geometric rotation of a definite axis by a definite angle. For the Hadamard gate,

$$
H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} = R_{\hat{y}}(\pi/2)\, R_{\hat{z}}(\pi),
$$

which flips the sphere so that the poles travel to the equator. A classical NOT gate swaps two states; a Hadamard gate maps one state to a *continuum* of superpositions. That is the difference a sphere makes.

> The Bloch sphere is the kind of object physicists love: a hard computational fact rendered as an intuition you can hold in your hand.
