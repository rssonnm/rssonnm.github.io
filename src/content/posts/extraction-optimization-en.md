---
title: "Optimizing Extraction Conditions for Medicinal Plants"
date: 2026-08-11T14:00:00
description: "A complete workflow for optimizing the extraction of bioactive compounds from medicinal plants: modeling yield with a quadratic response surface (RSM), estimating coefficients by least squares, solving the constrained problem with KKT conditions including a full proof of sufficiency, reading the result with the envelope theorem and a numerical check of the shadow prices, classifying the surface by canonical analysis (eigenvalues of B), and the theory of central composite designs (CCD) with orthogonality and coefficient variance. Full worked example: maximizing flavonoid yield in three variables — temperature, ethanol concentration, and time — optimal solution (73.4 °C; 70%; 90 min) with yield 14.64 mg/g, shadow prices 0.057 for ethanol and 0.040 for time, eigenvalues of B, standard errors of the fitted coefficients, and a Monte Carlo sensitivity analysis for confidence intervals of the optimal solution."
topic: mathematics
tags: [optimization, response-surface-methodology, kkt, design-of-experiments, shadow-price, extraction, phytochemistry, tutorial]
lang: en
translationOf: extraction-optimization
featured: false
draft: false
---

Extraction is a typical engineering decision: choose temperature, solvent, and time to recover as much bioactive compound as possible within the limits of the equipment, the cost, and the stability of the compound itself. This is a constrained optimization problem, and every tool needed can be worked by hand when the number of variables is small. This post walks a complete workflow: modeling yield with a response surface, estimating the coefficients, solving the constrained problem with KKT conditions (with a full proof), verifying the solution, reading the result through shadow prices via the envelope theorem, classifying the surface by canonical analysis, and confirming experimentally on a central composite design. Every number below is the solution of the stated problem, and every calculation can be done by hand.

## Section A — Modeling the extraction problem

```definition[The extraction problem]
A batch extraction is determined by $n$ decision variables $x \in \mathbb{R}^n$: temperature, solvent concentration, time, solvent-to-material ratio. The recovery yield $Y(x)$ is the response to be maximized, and the constraints $g_i(x) \le 0$ describe operating limits: the maximum temperature before the compound degrades, solvent cost, the time budget, equipment capacity. The problem:
$$\max_x \; Y(x) \quad \text{s.t.} \quad g_i(x) \le 0 \ (i = 1, \ldots, m), \quad x_{\min} \le x \le x_{\max}.$$
```

```definition[Quadratic response surface]
Experiments show that extraction yield usually has a peak inside the feasible region: raising temperature speeds up mass transfer but degrades the compound past a threshold; more solvent improves dissolution but is less selective and more expensive. The standard model for capturing that peak is the quadratic polynomial:
$$Y(x) = \beta_0 + \sum_i \beta_i x_i + \sum_i \beta_{ii} x_i^2 + \sum_{i<j} \beta_{ij} x_i x_j,$$
called the **response surface**. The coefficients are estimated from an experimental design, usually a central composite design: axial points, center points, and factorial points.
```

The quadratic model was proposed by Box and Wilson [^1] together with the method of steepest ascent in experimentation; a full treatment of response surface methodology is Myers, Montgomery and Anderson-Cook [^2], and the theory of experimental design is in Montgomery [^6].

```example[Specific model: flavonoid extraction]
Consider extracting flavonoids from a medicinal plant with three variables: temperature $T$ (°C), ethanol concentration $C$ (%), time $t$ (min). Using the centered coordinates $u = T - 60$, $v = C - 55$, $w = t - 75$, the estimated model is
$$Y = 9.2 + 0.30u + 0.26v + 0.10w - 0.014u^2 - 0.009v^2 - 0.002w^2 + 0.005uv,$$
with $Y$ in mg/g. Constraints: $T \le 75$ (above this the flavonoids degrade), $C \le 70$ (solvent cost limit), $t \le 90$ (the time budget of one extraction run), plus the physical bounds $T \in [40, 80]$, $C \in [30, 80]$, $t \in [30, 120]$.
```

Two remarks on the model. First, it is concave around the peak (the squared coefficients are negative), the correct structure for "yield has a peak inside the region." Second, it is an estimate: the coefficients carry experimental error, and this determines the confirmation workflow in Section D.

```definition[Matrix form of the quadratic model]
Collect the coefficients into a vector $b = (\beta_1, \ldots, \beta_k)^\top$ and a symmetric matrix $B$ with $B_{ii} = \beta_{ii}$, $B_{ij} = \beta_{ij}/2$ for $i \neq j$; the quadratic model becomes
$$Y(u) = \beta_0 + b^\top u + u^\top B u, \qquad u \in \mathbb{R}^k.$$
Since $u^\top B u = \sum_i B_{ii} u_i^2 + 2\sum_{i<j} B_{ij} u_i u_j$, the gradient and Hessian have the closed forms
$$\nabla Y(u) = b + 2Bu, \qquad \nabla^2 Y(u) = 2B.$$
The partial derivative of $u^\top B u$ with respect to $u_i$ gives $2B_{ii}u_i + 2\sum_{j\neq i} B_{ij}u_j$ — exactly row $i$ of $2Bu$. The stationarity condition $\nabla Y = 0$ is the linear system $Bu = -b/2$: when $B$ is negative definite it has a unique solution, the stationary point, and since $u^\top B u < 0$ for $u \neq 0$ when $B$ is negative definite, the stationary point is a global maximum. In the flavonoid example, $B$ has a non-diagonal $(u, v)$ block due to the interaction coefficient — details in Section G.
```

```definition[Least squares estimation]
For $n$ experiments with design matrix $X$ ($n \times p$, each row holding the basis functions: constant, linear, quadratic, interactions) and response vector $y$. The model is $y = X\beta + \varepsilon$ with $\mathbb{E}[\varepsilon] = 0$, $\mathrm{Cov}(\varepsilon) = \sigma^2 I$. The least squares estimate minimizes the sum of squared errors
$$\hat\beta = \arg\min_\beta \|y - X\beta\|^2.$$
If $X$ has full rank ($\mathrm{rank}\, X = p$), the unique solution is $\hat\beta = (X^\top X)^{-1} X^\top y$, with $\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$.
```

```proof[Normal equations from projection]
Expand $\|y - X\beta\|^2 = y^\top y - 2\beta^\top X^\top y + \beta^\top X^\top X \beta$. The gradient with respect to $\beta$: $-2X^\top y + 2X^\top X\beta$. Setting it to zero gives the **normal equations** $X^\top X\beta = X^\top y$. The matrix $X^\top X$ is symmetric positive semidefinite, and positive definite when $X$ has full rank, so $\hat\beta = (X^\top X)^{-1}X^\top y$ is the unique stationary point; the quadratic objective is convex, so it is the global minimum. Unbiasedness: $\mathbb{E}[\hat\beta] = (X^\top X)^{-1}X^\top \mathbb{E}[y] = \beta$. Variance: $\mathrm{Var}(\hat\beta) = (X^\top X)^{-1}X^\top \cdot \sigma^2 I \cdot X(X^\top X)^{-1} = \sigma^2(X^\top X)^{-1}$. The coefficients of the flavonoid model in Section A are the result of this projection onto the data of a CCD design — the structure of $X^\top X$ and its effect on standard errors in Section H.
```

The model $Y = 9.2 + 0.30u + 0.26v + 0.10w - \ldots$ in Section A is not a true function to be discovered — it is $\hat\beta = (X^\top X)^{-1}X^\top y$ fitted to the data of a CCD. The example below reconstructs the full lifecycle from 17 measurements to the estimated function.

First, the mechanism. If the data are noise-free ($y = X\beta$ exactly), the fit recovers the true function:
$$\hat\beta = (X^\top X)^{-1}X^\top y = (X^\top X)^{-1}X^\top X \beta = \beta.$$
The seventeen points of the CCD (10 parameters, full rank) contain enough information to "invert" the 10 coefficients — this is the meaning of the condition $\mathrm{rank}\, X = p$ in Section A. With real noise, $\hat\beta$ deviates from $\beta$ by an amount of the order of the standard error; the table below is one simulated data set (the true function plus noise $\sigma = 0.05$):

| (u; v; w) | Y (mg/g) | (u; v; w) | Y (mg/g) |
|---|---|---|---|
| (−1; −1; −1) | 8.456 | (1.68; 0; 0) | 9.625 |
| (−1; −1; 1) | 8.690 | (−1.68; 0; 0) | 8.599 |
| (−1; 1; −1) | 9.046 | (0; 1.68; 0) | 9.482 |
| (−1; 1; 1) | 9.193 | (0; −1.68; 0) | 8.735 |
| (1; −1; −1) | 9.049 | (0; 0; 1.68) | 9.309 |
| (1; −1; 1) | 9.224 | (0; 0; −1.68) | 9.017 |
| (1; 1; −1) | 9.667 | (0; 0; 0) | 9.267 |
| (1; 1; 1) | 9.823 | (0; 0; 0) | 9.175 |
| | | (0; 0; 0) | 9.186 |

Solving the normal equations for the table above:

| Coefficient | $\hat\beta$ | True $\beta$ | SE |
|---|---|---|---|
| 1 | 9.2081 | 9.200 | 0.0288 |
| u | 0.3004 | 0.300 | 0.0135 |
| v | 0.2612 | 0.260 | 0.0135 |
| w | 0.0881 | 0.100 | 0.0135 |
| u² | −0.0298 | −0.014 | 0.0149 |
| v² | −0.0312 | −0.009 | 0.0149 |
| w² | −0.0119 | −0.002 | 0.0149 |
| uv | 0.0153 | 0.005 | 0.0177 |
| uw | −0.0062 | 0.000 | 0.0177 |
| vw | −0.0133 | 0.000 | 0.0177 |

```example[Reading the fit]
The estimated function from the data above:
$$Y = 9.208 + 0.3004u + 0.2612v + 0.0881w - 0.0298u^2 - 0.0312v^2 - 0.0119w^2 + 0.0153uv - 0.0062uw - 0.0133vw.$$
Three remarks. First, every coefficient falls within 2 SE of the true value (largest 1.5 SE) — the fit is unbiased, and a different data set gives a slightly different function, as governed by $\hat\beta \sim N(\beta, \sigma^2(X^\top X)^{-1})$. Second, the most biased coefficients are all in the quadratic block: $u^2 = -0.0298$ is double the true value, $v^2 = -0.0312$ is 3.5 times — curvature is the least well-determined part of the data, exactly the conclusion of Section I. Third, the consequence: at the optimum, the quadratic coordinates are around 200 (u² ≈ 179, v² = w² = 225), so an error of 0.01 in a curvature coefficient amplifies into an error of about 2 mg/g in the peak value — the mechanism behind the wide confidence interval of Y* (Section I), and the reason the confirmation workflow of Section D cannot be skipped.
```

## Section B — Solving with KKT conditions

```theorem[KKT conditions for the extraction problem]
Consider maximizing $Y$ with $Y$ concave and the constraints $g_i \le 0$ convex. A point $x^*$ is optimal if and only if there exist $\lambda_i \ge 0$ such that
$$\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*), \qquad \lambda_i g_i(x^*) = 0 \ \forall i, \qquad g_i(x^*) \le 0 \ \forall i.$$
The condition $\lambda_i g_i(x^*) = 0$ is **complementary slackness**: either constraint $i$ is active ($g_i = 0$), or its multiplier is zero. The multiplier $\lambda_i$ is the **shadow price** of constraint $i$: the extra yield obtained by relaxing that constraint by one unit.

*Sketch.* This is the maximization form of the standard KKT conditions: at the solution, the gradient of the objective lies in the cone generated by the gradients of the active constraints. For a concave–convex problem the condition is both necessary and sufficient, and the solution is a global maximum.
```

Full proofs and general cases in Boyd and Vandenberghe [^3]; the history of the conditions goes back to Karush (1939) and Kuhn–Tucker (1951) [^4].

```remark[Constraint qualifications and the converse direction]
The "if and only if" in the theorem needs two assumptions. The forward direction (a solution implies $\lambda$ exists): a constraint qualification is needed — for inequality constraints, the standard one is that the gradients of the active constraints are linearly independent (LICQ), or Slater's condition in the convex case: a point satisfying all inequality constraints strictly. Without a constraint qualification, an optimal point may fail KKT — the classical example is three constraints meeting exactly at the solution. The converse direction (if $\lambda$ exists then optimal): in general only true for convex problems — precisely the case here, $Y$ concave and the $g_i$ convex. The extraction problem satisfies Slater trivially (the center point $(0, 0, 0)$ lies strictly inside every constraint), so KKT is necessary and sufficient.
```

```proof[Sufficiency of KKT for the concave problem]
Suppose $Y$ is concave, $g_i$ convex, and there exist $\lambda_i \ge 0$ satisfying the three KKT conditions at $x^*$. Take any feasible $x$. Since $g_i$ is convex, $g_i(x) \ge g_i(x^*) + \nabla g_i(x^*)^\top (x - x^*)$, so $\nabla g_i(x^*)^\top (x - x^*) \le g_i(x) - g_i(x^*)$. For an active constraint ($g_i(x^*) = 0$), the right side is $g_i(x) \le 0$, hence $\lambda_i \nabla g_i(x^*)^\top (x - x^*) \le 0$ for all $i$ (the $\lambda_i = 0$ contribute nothing). Summing over $i$ and using the stationarity condition $\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*)$:
$$\nabla Y(x^*)^\top (x - x^*) \le 0.$$
Since $Y$ is concave, $Y(x) \le Y(x^*) + \nabla Y(x^*)^\top (x - x^*) \le Y(x^*)$. Hence $x^*$ is a global maximum. $\blacksquare$
```

```example[Numerical solution]
The unconstrained stationarity conditions: $\partial Y/\partial u = 0.30 - 0.028u + 0.005v = 0$; $\partial Y/\partial v = 0.26 - 0.018v + 0.005u = 0$; $\partial Y/\partial w = 0.10 - 0.004w = 0$. Solution: $u = 13.99$ ($T = 74.0$), $v = 18.33$ ($C = 73.3$), $w = 25$ ($t = 100$). This point violates $C \le 70$ and $t \le 90$: the unconstrained maximum is not feasible.

Clamp the two active constraints: $v = 15$ ($C = 70$) and $w = 15$ ($t = 90$). The remaining equation in $u$: $0.30 - 0.028u + 0.005 \cdot 15 = 0$, giving $u = 13.39$ ($T = 73.4$). Check: $T = 73.4 \le 75$ — satisfied. Optimal solution: $(73.4°C;\ 70\%;\ 90\ \text{min})$, yield $Y^* = 14.64$ mg/g (Figure 1).

KKT multipliers: $\lambda_C = \partial Y/\partial v = 0.26 - 0.018 \cdot 15 + 0.005 \cdot 13.39 \approx 0.057$; $\lambda_t = \partial Y/\partial w = 0.10 - 0.004 \cdot 15 = 0.040$; $\partial Y/\partial u = 0$ at the solution — temperature is not an active constraint. The Hessian of $Y$ in $(u,v,w)$ is negative definite (determinant $4.79 \times 10^{-4} > 0$ on the $(u,v)$ plane, negative diagonal entries), so the stationary point is a global maximum.
```

```remark[Second-order condition for the constrained problem]
With active constraints $v = 15$, $w = 15$, the correct second-order condition must be examined on the tangent space of the constraints, not on all of $\mathbb{R}^3$. Eliminating $v, w$ by substitution: the problem reduces to a single variable $u$, and the second derivative of the reduced function is $d^2Y/du^2 = -0.028 < 0$ — negative on the tangent space. The general criterion uses the **bordered Hessian**: with $m$ active constraints $h_j(u) = 0$, consider
$$\begin{pmatrix} 0 & \nabla h^\top \\ \nabla h & \nabla^2 L \end{pmatrix}, \qquad L = Y + \sum_j \lambda_j h_j,$$
and require the leading principal minors from order $2m+1$ to $m+k$ to alternate in sign according to the rule for a maximum on the tangent space. The two checks are equivalent; substitution is simpler with few constraints, the bordered Hessian is needed for nonlinear constraints. In this problem the substitution confirms what is known: the point $(13.39; 15; 15)$ is the maximum of the reduced function, hence a local maximum of the original problem, and by concavity — a global maximum.
```

```theorem[Envelope theorem]
Consider the parametric problem $Y^*(b) = \max_x \{Y(x) : g_j(x) \le b_j\}$, with the solution $x^*(b)$ smooth in $b$. If constraint $j$ is active at the solution then
$$\frac{\partial Y^*}{\partial b_j} = \lambda_j(b),$$
where $\lambda_j$ is the KKT multiplier of constraint $j$: **the shadow price is exactly the derivative of the value function**.

*Proof.* $Y^*(b) = Y(x^*(b))$, so $\partial Y^*/\partial b_j = \nabla Y(x^*) \cdot \partial x^*/\partial b_j$. From the stationarity condition, $\nabla Y(x^*) = \sum_i \lambda_i \nabla g_i(x^*)$, hence $\partial Y^*/\partial b_j = \sum_i \lambda_i \nabla g_i(x^*) \cdot \partial x^*/\partial b_j$. For an active constraint, $g_i(x^*(b)) = b_i$ for all $b$ in a neighborhood; differentiating both sides with respect to $b_j$: $\nabla g_i(x^*) \cdot \partial x^*/\partial b_j = \delta_{ij}$. Only the term $i = j$ survives: $\partial Y^*/\partial b_j = \lambda_j$. $\blacksquare$
```

<figure style="margin:1.8em 0;"><img src="/img/opt/extraction.svg" alt="Response surface of herbal extraction" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Figure 1 — Response surface Y(T, C) at t = 90 min. The feasible region (shaded blue) is bounded by C = 70 and T = 75; the optimum (73.4 ; 70) lies on the boundary C = 70. The unconstrained maximum (74.0 ; 73.3) lies outside the region.</figcaption></figure>

## Section C — Verification and sensitivity

The KKT solution should be verified by comparing with nearby points (table below, at $t = 90$ except the last row):

| Conditions (T; C; t) | Y (mg/g) | Note |
|---|---|---|
| (60; 55; 90) | 10.25 | design center point |
| **(73.4; 70; 90)** | **14.64** | optimal solution |
| (75; 70; 90) | 14.60 | touches the temperature boundary — worse |
| (70; 70; 90) | 14.48 | below the optimal temperature |
| (73.4; 70; 100) | 14.84 | violates the time budget |

Three conclusions from the table. The solution $(73.4; 70; 90)$ gives the highest yield among the feasible points. Touching the temperature boundary $T = 75$ does not help ($14.60 < 14.64$) — the temperature constraint is not active; keeping 73–74 °C is enough. Extending the time to 100 minutes raises the yield to 14.84 but violates the extraction-run budget.

<figure style="margin:1.8em 0;"><img src="/img/opt/extraction-check.svg" alt="Solution verification and shadow prices" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Figure 2 — (a) Yield at the candidate points: the optimum (teal) is the highest in the feasible region; the point (73.4 ; 70 ; 100) is higher but violates the time constraint (red). (b) Shadow prices: relaxing ethanol by one percentage point raises yield by 0.057; adding one minute raises it by 0.040; temperature has shadow price 0.</figcaption></figure>

```remark[Shadow prices and decisions]
The two active constraints have positive shadow prices; the temperature constraint has shadow price 0 (Figure 2b). How to read it: buying 10 extra minutes for a run raises yield by $14.84 - 14.64 = 0.20$ mg/g — the decision is comparing the operating cost of 10 minutes with 0.20 mg/g. Raising the ethanol limit from 70 to 71% raises yield by approximately 0.057 mg/g — the quantitative basis for negotiating the solvent price. Note the diminishing marginal gain: the surface is concave, so the shadow price is only valid near the solution; to know the value of a large change one must re-solve the problem.
```

```example[Numerical check of the envelope theorem]
Re-solve the problem with the limit $C \le b$ for $b = 70, 71, 72, 73, 73.33$ (i.e. $v \le 15, 16, 17, 18, 18.33$), optimizing over $u$ each time; the results are in the table below.
```

| Limit b = C (%) | u* | Y* (mg/g) | dY*/db = λ(b) |
|---|---|---|---|
| 70 | 13.39 | 14.636 | 0.057 |
| 71 | 13.57 | 14.685 | 0.040 |
| 72 | 13.75 | 14.716 | 0.023 |
| 73 | 13.93 | 14.730 | 0.006 |
| 73.33 | 13.99 | 14.731 | 0.000 |

```remark[Three remarks from the table]
First, the actual increment $Y^*(71) - Y^*(70) = 0.048$ lies between $\lambda(70) = 0.057$ and $\lambda(71) = 0.040$: $\lambda$ is the instantaneous derivative, while the increment over an interval is its integral. Second, $\lambda(b)$ decreases linearly and vanishes at $b = 73.33$ — exactly the unconstrained maximum, where the ethanol constraint stops being active; the solution of the linear system in Section B is precisely this crossing point. Third, the total gain from relaxing 70 to 73.33 is $14.731 - 14.636 = 0.095$, exactly the area of the triangle under the curve $\lambda(b)$: $\tfrac{1}{2} \cdot 0.057 \cdot 3.33 \approx 0.095$. The value of a large change is the integral of the shadow price — the integral form of the envelope theorem, and the precise reason to "re-solve the problem" rather than multiply $\lambda$ by the size of the change.
```

```remark[Why a negative-definite Hessian is a sufficient condition]
For a concave function, a stationary point is a global maximum: no need to try many starting points. The negative-definite Hessian in Section B asserts that $Y$ is concave around the solution. If the model has a large interaction term or positive squared coefficients, the surface may have a saddle or two peaks — then one must plot the surface and use many starting points, not trust a single stationary point.
```

## Section D — Practical workflow

```remark[Two-stage workflow]
The solution $(73.4; 70; 90)$ is the optimum of an estimated model, not of reality. The standard workflow has two stages. Stage one: optimize on the model as in Section B. Stage two: run experiments at the optimum and around it (e.g. a grid $73.4 \pm 2$ °C, $70 \pm 2$ %, $90 \pm 10$ min) to confirm the predicted yield; if the experiments deviate significantly from the prediction, add points to the design, re-estimate the model and re-solve. This two-stage structure is the general rule for optimization on an estimated model.
```

Five common mistakes when using a response surface model for decisions. Each is analyzed with the same structure — mechanism, quantitative numbers from this problem, and treatment.

```remark[Pitfall 1 — extrapolation]
The quadratic model is fitted on the design region $[-\alpha, \alpha]^3 \approx [-1.68; 1.68]^3$ (coded coordinates) — a small cube around the center. The solution $(13.4; 15; 15)$ is $\|x^*\| = \sqrt{13.4^2 + 15^2 + 15^2} = 25.1$ units from the center — about 15 times the design radius. Using the model there is extrapolation, not interpolation, and the price has two components, both measurable.

**Variance.** From $\hat Y(x) = x^\top \hat\beta$ and $\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$:
$$\mathrm{Var}(\hat Y(x)) = x^\top \mathrm{Var}(\hat\beta)\, x = \sigma^2 x^\top (X^\top X)^{-1} x.$$
At the center, $x = (1, 0, \ldots, 0)$: $\mathrm{Var} = \sigma^2 (X^\top X)^{-1}_{11} = 0.00083$, SD 0.029 mg/g. At the solution, the design vector contains $u^2 = 179.6$, $v^2 = w^2 = 225$ and the cross products: $\mathrm{Var} = 87.6$, SD 9.36 — 325 times larger. Block decomposition: 99.9% of the variance at the solution comes from the quadratic block (46.8 from the columns $u^2, v^2, w^2$ plus 40.7 from their covariance with the constant). The variance explodes because $x^*$ lies far from the center, where the functions $u^2, v^2, w^2$ amplify every uncertainty of the curvature coefficients.

A 95% confidence interval for the predicted mean at the solution: $14.64 \pm t_{7;\,0.975} \cdot 9.36 = 14.64 \pm 2.365 \cdot 9.36 = 14.64 \pm 22.1$, i.e. $[-7.5;\, 36.8]$. The prediction interval for a single new observation differs negligibly: the factor $\sqrt{1 + x^\top(X^\top X)^{-1}x}$ versus $\sqrt{x^\top(X^\top X)^{-1}x}$ differs by 0.001% because the design term (35 060) dominates the 1. An interval three times wider than the estimate itself — "the solution gives $Y^* = 14.6$" without an interval is a meaningless number.

**Bias.** Beyond the variance, the cubic Taylor remainder (Section F) grows like $\|x\|^3$ away from the center; this bias does not shrink with sample size. The two components add: the farther from the center, the more the prediction error is dominated by bias.

**Signs and treatment.** Three warning signs: the solution lies on the boundary of the feasible region (here $C = 70$ — the decision is sensitive to the constraint itself, Section C); $\|x^*\|$ far exceeds the design radius; and $Y^* = 14.6$ exceeds every observed value (largest 9.84). Treatment: shift the center and shrink the design scale around the promising region, then run stage two (Section D); ridge analysis to keep the solution within a trustworthy radius; or if one must go far — accept and report the width of the interval.
```

```remark[Pitfall 2 — correlated variables]
A coefficient $\hat\beta_j$ is estimated independently only when the columns of $X$ are orthogonal. When they are not, the variance of $\hat\beta_j$ grows with how well column $j$ is explained by the others. Measured by the variance inflation factor (VIF): regress column $j$ on the remaining columns (including the constant), take $R^2_j$, set
$$\mathrm{VIF}_j = \frac{1}{1 - R^2_j}, \qquad \mathrm{Var}(\hat\beta_j) = \frac{\sigma^2 \cdot \mathrm{VIF}_j}{SXX_j}, \qquad SXX_j = \sum_i (x_{ij} - \bar x_j)^2.$$
VIF = 1: fully orthogonal; the larger the VIF, the more unstable the coefficient.

The CCD avoids this thanks to its block-diagonal structure (Section H): the linear block $\{u, v, w\}$ and the interaction block $\{uv, uw, vw\}$ have VIF = 1.000 — fully orthogonal to every other column. Only the quadratic block $\{1, u^2, v^2, w^2\}$ is slightly correlated, because $u^2, v^2, w^2$ are all positive at the factorial points. The level of this correlation is set by the number of center points.
```

| Block | VIF (n_c = 3) | VIF (n_c = 1) | VIF (n_c = 5) |
|---|---|---|---|
| linear u, v, w | 1.000 | 1.000 | 1.000 |
| interactions uv, uw, vw | 1.000 | 1.000 | 1.000 |
| quadratic u², v², w² | 1.156 | 1.911 | 1.039 |

With n_c = 3, the quadratic VIF is only 1.156 ($R^2 = 0.135$); n_c = 1 pushes it to 1.911 — the standard error of the curvature coefficients is multiplied by $\sqrt{1.911} = 1.38$; n_c = 5 lowers it to 1.039 (×1.02). The center points "mix" the quadratic columns with the constant, making them less collinear — another reason to choose n_c ≥ 3, not only to estimate pure error (Pitfall 4).

An arbitrary design is far more dangerous. With only 8 factorial points and no axial points: at every point $u^2 = v^2 = w^2 = 1$, the three columns coincide — $X^\top X$ has three zero eigenvalues, rank 8 < 10, VIF infinite, and $\beta_{uu}, \beta_{vv}, \beta_{ww}$ cannot be estimated separately (Section H). The full CCD has $\mathrm{cond}(X^\top X) = 24.9$ (eigenvalues from 2.20 to 54.8) — healthy.

```remark[Pitfall 2 — consequences for decisions]
The gradient $\nabla\hat Y = \hat b + 2\hat B u$ is built from the estimated coefficients; if the coefficients are correlated, the ascent direction is noisy and each re-estimation gives a different direction. Check before trusting the result: the VIF of every column (practical thresholds: VIF > 5 suspicious, > 10 serious — see the series *Basic Statistics for the Life Sciences*, Part 6) and $\mathrm{cond}(X^\top X)$.
```

```remark[Pitfall 3 — a single response]
High yield usually comes with high impurity content: a strong solvent and high temperature extract more flavonoids but also more impurities. With two responses $Y_1$ (yield) and $Y_2$ (impurity), there is no single "best solution" — only the Pareto frontier: the set of points where one response cannot be improved without worsening the other. Choosing a point on the frontier is the practitioner's decision, not the algorithm's.

A quantitative example: suppose the impurity is $Y_2 = 2.0 + 0.02(T-60) + 0.03(C-55)$ (mg/g), increasing in both temperature and ethanol. Cutting ethanol from 70 to 65 at $T = 73.4$: yield drops $14.64 \to 14.13$ (−0.51) but impurity drops $2.72 \to 2.57$ (−0.15). If the temperature is re-optimized after each ethanol cut, the frontier is traced:
```

| C (%) | T* (°C) | Y₁ (mg/g) | Y₂ (mg/g) |
|---|---|---|---|
| 70 | 73.4 | 14.64 | 2.72 |
| 65 | 72.5 | 14.14 | 2.55 |
| 60 | 71.6 | 13.21 | 2.38 |
| 55 | 70.7 | 11.86 | 2.21 |

The slope of the frontier — yield lost per unit of impurity saved — increases 3.0 → 5.5 → 7.9 as the impurity is pulled down: the frontier is convex, with diminishing returns. The point on the frontier depends on the relative value of flavonoids and impurities. With an impurity threshold (e.g. $Y_2 \le 2.5$), the problem becomes single-objective again: the solution is the intersection of the frontier with the threshold, here $C \approx 63.5$, $T \approx 72.2$, $Y_1 \approx 13.9$ — below the "yield maximum" of 14.6 because impurities must be paid for.

Solving multi-response problems: maximizing $Y_1$ with the constraint $Y_2 \le \varepsilon$ (the $\varepsilon$-constraint method) traces the whole frontier including concave parts; maximizing the weighted sum $w_1 Y_1 + w_2 Y_2$ traces only the convex part (Section E). This is not a technical detail: if the frontier is concave, the weighted sum misses exactly the segment the practitioner may care about.

```remark[Pitfall 4 — too few degrees of freedom]
The three-variable CCD has $n = 17$ experiments for $p = 10$ parameters: $df = n - p = 7$ error degrees of freedom. The error sum of squares splits into two parts:
$$SS_{res} = SS_{PE} + SS_{LOF},$$
where $SS_{PE}$ (pure error) is estimated from the $n_c$ replicated center points — $df_{PE} = n_c - 1 = 2$ — and $SS_{LOF}$ (lack of fit) is the part the model fails to explain, $df_{LOF} = 5$. The lack-of-fit test uses the ratio
$$F = \frac{SS_{LOF}/5}{SS_{PE}/2} \sim F(5, 2).$$

With $df_{PE} = 2$ the test is nearly blind: the rejection threshold $F_{0.05;\,5,2} = 19.30$ — $SS_{LOF}$ must be about 48 times $SS_{PE}$ to raise suspicion. Adding center points lowers the threshold immediately: $n_c = 10$ gives $F_{0.05;\,5,9} = 3.48$. Quantify with power — suppose the true function has a cubic term $c u^3$ with $\sigma = 0.05$; the noncentrality parameter $\lambda = SS_{LOF}/\sigma^2$ equals 11.1 ($c = 0.05$) or 44.3 ($c = 0.1$), independent of $n_c$ because the design outside the center is the same. Simulating 1500 times:
```

| λ | Power (n_c = 3) | Power (n_c = 10) |
|---|---|---|
| 11.1 | 16% | 46% |
| 44.3 | 41% | 98% |

For the same level of misspecification, raising the center points from 3 to 10 turns the test from nearly blind to nearly certain.

The consequence of missing lack of fit is structured bias, not noise: the term $c u^3$ projects onto the column $u$ ($\sum_i u_i \cdot u_i^3 = 24 \neq 0$), so the quadratic model "absorbs" it into the linear coefficient. With $c = 0.1$ (a deviation of about 0.5 mg/g at the axial point, about 10σ), $\hat\beta_u$ fitted from noise-free data is 0.48 instead of 0.30 — a 59% bias in exactly the coefficient that decides the ascent direction.

Practical consequence: increasing $n_c$ is the cheapest way to add degrees of freedom — each center point adds 1 df without changing the orthogonal structure, while also lowering the quadratic-block VIF (Pitfall 2) and tightening the estimate of $\sigma$.

```remark[Pitfall 5 — reporting without uncertainty]
"$Y^* = 14.64$ mg/g" without uncertainty is almost a meaningless number. Section I gave three numbers, each telling a different story: the 95% range of $Y^*$ of about $[5.5;\, 16.6]$ (Monte Carlo with 20 000 draws, conditioning on concavity) — the height; SD 5.5 °C of $T^*$ — the location; and the confidence interval of the predicted mean at the solution $[-7.5;\, 36.8]$ (Pitfall 1) — the reliability of the prediction. All three belong in the report.

Writing rules: (1) report the solution with the dispersion of each coordinate; (2) report $Y^*$ with an interval, never a single number; (3) state the design region in which the model is trustworthy (Pitfall 1); (4) end with the two-stage experimental confirmation (Section D). A complete report looks like:

> Proposed conditions: $T = 73.4 \pm 5.5$ °C, $C = 70$ (constraint boundary), $t = 90$ min. Predicted yield 14.6 mg/g, 95% range [5.5; 16.6]. Run 3–5 batches at this point to confirm before publication.

Every report ends with the two-stage experimental confirmation: the model locates, the experiment quantifies.
```

```example[Lack-of-fit test on the CCD data]
Use exactly the 17-point data set of Section A (the table "From 17 measurements to the estimated function"); the model fitted from it:
$$\hat y = 9.2081 + 0.3004u + 0.2612v + 0.0881w - 0.0298u^2 - 0.0312v^2 - 0.0119w^2 + 0.0153uv - 0.0062uw - 0.0133vw.$$
Question: is the quadratic model good enough on the design region, or is there structure left out? The lack-of-fit test answers by splitting the error into two parts.

**Step 1 — pure error from the three center points.** The three observations at $(0,0,0)$: 9.267; 9.175; 9.186, mean 9.2094:
$$SS_{PE} = (9.267-9.2094)^2 + (9.175-9.2094)^2 + (9.186-9.2094)^2 = 0.00497, \qquad df_{PE} = 2$$
(by hand with rounded numbers one gets 0.0050). $MS_{PE} = 0.00497/2 = 0.00248$, so $\hat\sigma = \sqrt{0.00248} = 0.0498$ — matching the $\sigma = 0.05$ used for simulation: a sanity check.

**Step 2 — residuals of the model.** Two hand computations. At $(1;1;1)$: $\hat y = 9.2081 + 0.3004 + 0.2612 + 0.0881 - 0.0298 - 0.0312 - 0.0119 + 0.0153 - 0.0062 - 0.0133 = 9.781$, residual $9.823 - 9.781 = +0.042$. At $(-1;-1;-1)$: $\hat y = 8.481$, residual $8.456 - 8.481 = -0.025$. Summing the squared residuals over all 17 points: $SS_{res} = 0.02184$, $df = 7$.

**Step 3 — lack of fit.** $SS_{LOF} = SS_{res} - SS_{PE} = 0.02184 - 0.00497 = 0.01687$, $df_{LOF} = 7 - 2 = 5$. The results are summarized in the table below.
```

| Source | SS | df | MS | F | p |
|---|---|---|---|---|---|
| Regression (quadratic model) | 2.2894 | 9 | 0.2544 | 81.5 | < 0.001 |
| Error | 0.02184 | 7 | 0.00312 | | |
| — Lack of fit | 0.01687 | 5 | 0.00337 | 1.36 | 0.48 |
| — Pure error | 0.00497 | 2 | 0.00248 | | |
| Total | 2.3113 | 16 | | | |

```remark[Reading the result]
$F = 1.36 < F_{0.05;\,5,2} = 19.30$ ($p = 0.48$) — no lack of fit detected; the quadratic model is good enough on the design region. As expected: the data were generated from exactly the quadratic function plus noise $\sigma = 0.05$, and the test does not raise a false alarm.

Two remarks. First, two independent estimates of $\sigma$ — $\hat\sigma_{PE} = 0.0498$ (from the 3 center points) and $\hat\sigma_{LOF} = 0.0581$ (from the lack-of-fit part) — are close, a sign that no structure is missing; if $\hat\sigma_{LOF} \gg \hat\sigma_{PE}$, the model is missing terms, and their ratio is precisely the root of $F$. Second, the threshold 19.30 is high because $df_{PE} = 2$ (Pitfall 4): the test only catches gross lack of fit — a moderate cubic term can slip through (Section F shows the mechanism). Check with more than one number: plot the residuals against each variable and against run order; if there is a visible trend even with large $p$, treat it.
```

## Section E — Extensions

```remark[Multiple responses and the Pareto frontier]
When two responses must be balanced, for example flavonoid yield $Y_1$ and impurity content $Y_2$, there is no single "best" solution but a Pareto frontier: the set of conditions where one response cannot be improved without worsening the other. Two standard techniques: maximizing the weighted sum $w_1 Y_1 + w_2 Y_2$ with $w > 0$, and maximizing $Y_1$ with the constraint $Y_2 \le \epsilon$. The second traces the whole Pareto frontier including concave parts; the first does not.
```

```remark[Robust version]
The coefficients of an RSM model are estimates with confidence intervals; with a small experimental budget this uncertainty is substantial. The robust version asks for the best solution in the worst case over an acceptable set of coefficients: $\max_x \min_{\beta \in B} Y(x; \beta)$ with the corresponding constraints. The difference between the nominal optimal yield and the robust yield is the **price of robustness** — the yield paid to guarantee the threshold under every acceptable scenario.
```

The theoretical framework and how to measure this quantity in Bertsimas and Sim [^5].

```remark[Sequential optimization and experimental design]
With a wide region and the peak location unknown, the efficient procedure is steepest ascent on a first-order model (Box–Wilson), switching to a quadratic model near the peak, then optimizing as in Section B. Each experimental round adds data and shrinks the search region; the experimental design decides the quality of each round.
```

The steepest ascent method and the response surface procedure are due to Box and Wilson [^1]; the principles of experimental design in Montgomery [^6].

## Section F — When the true function is not quadratic

The quadratic model is a second-order Taylor approximation of the true function around the experimental center:
$$f(x) = f(x_0) + \nabla f(x_0)^\top (x - x_0) + \tfrac12 (x-x_0)^\top H(x_0)(x-x_0) + O(\|x-x_0\|^3).$$
The right question is not "is the true function quadratic" but "is the cubic error significant on the feasible region." This section analyzes the error mechanism with a one-variable example, then gives detection and treatment.

```example[Peak shift with a cubic term]
Consider a reduced variable $x$ (for example $x = (T-60)/5$ along the temperature direction) and the true function $f(x) = x^2 - 0.1 x^3$: near the origin, $f$ grows like $x^2$; far from it, the term $-0.1x^3$ bends the curve down. Experiments at $x = 0, 1, 2$ give $0$; $0.9$; $3.2$. Fitting a quadratic through the three points gives $\hat y = 0.2x + 0.7x^2$, passing exactly through them — from these three points there is no way to detect the cubic term.

The true maximum: $f'(x) = 2x - 0.3x^2 = 0$, $x^* = 20/3 \approx 6.67$, $f^* \approx 14.81$, and $f''(x^*) = -2 < 0$. The fitted model is convex ($0.7 > 0$), increasing on $[0, 8]$, so KKT pushes the solution to the boundary $x = 8$: the prediction $\hat y(8) = 46.4$, while the true value there is $12.8$ — 13.6% below the true peak. Climbing further is worse: $f(9) = 8.1$. The cubic error is small in the sampled region ($|{-}0.1x^3| \le 0.8$ at $x \le 2$) but accumulates into a large error when the model is used outside it.
```

```remark[The Taylor remainder: what the error really is]
The Taylor expansion of a smooth function $f$ around $0$ to second order has the Lagrange remainder:
$$f(x) = f(0) + f'(0)x + \tfrac{1}{2}f''(0)x^2 + \frac{f'''(\xi)}{6}x^3, \qquad \xi \in (0, x).$$
For $f(x) = x^2 - 0.1x^3$, all derivatives beyond order three vanish and $f'''(\xi) = -0.6$ is constant, so the remainder is exactly $-0.1x^3$: at $x = 8$ it is $-51.2$, and the quadratic model predicts $x^2 = 64$ while the true value is $12.8$. The peak-location error is therefore not random noise — it is a structured Taylor remainder, and the ratio $|f'''|/|f''|$ decides its severity. For a truly quadratic function ($f''' = 0$) the model has no systematic error, only noise; for a function with $f''' \neq 0$, the systematic error grows like $x^3$ away from the center. The lack-of-fit test is essentially testing whether $f'''$ and the higher derivatives are significant on the feasible region.
```

```remark[KKT is only a local condition]
A quadratic model with negative-definite $B$ has exactly one peak; if the true function has two peaks or a saddle in the feasible region, the KKT solution of the model only sees the peak nearest the design center. KKT and shadow prices remain true theorems for any smooth function — the issue is that we are solving the model's problem, not reality's, so $\lambda$ measures the constraint value in the model world. With a multimodal function: plot the surface, try many starting points, or use global methods (simulated annealing, differential evolution).
```

```remark[Detection and four directions]
Fitting a quadratic through points at different levels cannot detect the cubic: one needs replicates at the center to estimate pure error, then run the lack-of-fit test; if the lack of fit is significant, the quadratic is not sufficient on this region.

Then there are four directions. A cubic model, with an augmented design (extended CCD or higher-order Box–Behnken). Shrink the feasible region so the higher-order terms are small on it — exactly this problem's situation: the bounds $T \le 75$, $C \le 70$, $t \le 90$ keep the solution near the design center, where the quadratic approximation is trustworthy. Nonparametric: Bayesian optimization with a Gaussian process — no functional form assumed, the posterior updated from each measurement, an acquisition function balancing exploitation and exploration; suited to expensive experiments and possibly multimodal functions. Mechanistic models: if the kinetics or thermodynamics of the extraction process are known, use a physical model instead of an empirical one — fewer parameters and better extrapolation.
```

## Section G — Quadratic geometry: canonical analysis

The matrix $B$ in the quadratic form carries all information about the shape of the surface. Since $B$ is symmetric, it can be orthogonally diagonalized: $B = Q\Lambda Q^\top$ with $Q$ orthogonal and $\Lambda = \mathrm{diag}(\lambda_1, \ldots, \lambda_k)$. This is the framework of canonical analysis in response surface theory [^7].

```definition[Canonical analysis]
Let $u^*$ be the stationary point ($Bu^* = -b/2$) and $w = Q^\top (u - u^*)$ the coordinates along the principal axes. The quadratic model becomes the canonical form
$$Y = Y(u^*) + \sum_{i=1}^k \lambda_i w_i^2,$$
because $u^\top B u - u^{*\top} B u^* = (u - u^*)^\top B (u - u^*) = w^\top \Lambda w$. Classify the stationary point by the signs of the $\lambda_i$: all negative — maximum; all positive — minimum; mixed signs — saddle; some $\lambda_i = 0$ — a ridge system along axis $i$. This is the complete classification criterion of a quadratic surface, with no plotting needed.
```

```example[Eigenvalues of B in this problem]
For the flavonoid model, $B$ has a non-diagonal $(u, v)$ block due to the interaction coefficient:
$$B = \begin{pmatrix} -0.014 & 0.0025 & 0 \\ 0.0025 & -0.009 & 0 \\ 0 & 0 & -0.002 \end{pmatrix}.$$
The eigenvalues of the $(u,v)$ block are the roots of $\lambda^2 + 0.023\lambda + 0.00011975 = 0$ (sum $-0.023$, product $0.00011975$):
$$\lambda_1 = -0.00796, \qquad \lambda_2 = -0.01504,$$
together with $\lambda_3 = -0.002$. All three negative — the stationary point is a maximum; the product $4\lambda_1\lambda_2 = 4.79 \times 10^{-4}$ is exactly the determinant of the Hessian on the $(u,v)$ plane used in Section B. The eigenvector for $\lambda_1$ is $(0.38; 0.92)$: the long axis of the level ellipses, making an angle of $67.5°$ with the $u$ axis; the eigenvector for $\lambda_2$ is $(0.92; -0.38)$, perpendicular to it, angle $-22.5°$ (Figure 5). The interaction coefficient $uv$ does not change the signs of the $\lambda_i$ but rotates the principal axes away from the coordinate axes: if $\beta_{uv} = 0$, the $(u,v)$ block is already diagonal and the principal axes coincide with the coordinate axes.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/canonical.svg" alt="Canonical analysis of the response surface" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Figure 5 — Level curves of Y(u, v) at w = 25. Concentric ellipses at the unconstrained maximum (14.0; 18.3), long axis tilted 67.5° (direction (0.38; 0.92), λ = −0.0080), short axis perpendicular (λ = −0.0150). The red line is the boundary C = 70; the constrained optimum (13.4; 15.0) lies on it.</figcaption></figure>

```remark[Reading canonical analysis]
The long axis (for $\lambda_1$ closest to 0) is the direction where the surface is "flattest": moving away from the peak along this direction loses yield the slowest. For practical decisions: around the optimal solution, changes along the direction $(0.38; 0.92)$ in the $(T, C)$ plane are less risky than changes perpendicular to it; if the confirmation stage deviates from the prediction, knowing the sensitive direction helps choose test points. When some $\lambda_i$ is close to 0, the surface is nearly degenerate: many combinations give nearly the same yield and the "solution" is poorly determined — beware of claiming a unique solution. In this problem every $\lambda_i$ is far enough from 0, so the peak is well determined.
```

## Section H — Experimental design for the quadratic model

The three-variable quadratic model has $p = 1 + 3 + 3 + 3 = 10$ parameters; the design must provide enough information to estimate them and to check the model. The structure and properties of the central composite design are presented in Montgomery [^6] and Box–Draper [^7].

```definition[Central composite design (CCD)]
A **central composite design** consists of three blocks: $2^3 = 8$ factorial points $(\pm 1)^3$, $2k = 6$ axial points $(\pm\alpha, 0, 0)$, $(0, \pm\alpha, 0)$, $(0, 0, \pm\alpha)$, and $n_c$ replicated center points. The axial distance $\alpha$ is chosen by rotatability: the prediction variance of $\hat Y(x)$ depends only on $\|x\|$, not on direction, when
$$\alpha = 2^{k/4}, \qquad \text{here } \alpha = 2^{3/4} = 1.682, \qquad \alpha^4 = 2^k = 8.$$
For $k = 3$ and $n_c = 3$: 17 experiments in total for 10 parameters — 7 degrees of freedom for error (Figure 6).
```

<figure style="margin:1.8em 0;"><img src="/img/opt/ccd-design.svg" alt="Three-variable central composite design" style="display:block;width:100%;max-width:640px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Figure 6 — CCD for three variables: 8 factorial points (teal) at the corners of the cube (±1)³, 6 axial points (yellow) at ±α = ±1.682 on the axes, and the center replicated 3 times (blue). Rotatability: α⁴ = 2³ = 8.</figcaption></figure>

```remark[Orthogonality and coefficient variance]
With $\alpha = 2^{k/4}$, the matrix $X^\top X$ of the CCD has a block-diagonal structure: the linear block $\{u, v, w\}$, the interaction block $\{uv, uw, vw\}$, and the block $\{1, u^2, v^2, w^2\}$. Every cross product between two different blocks is zero: $\sum u_i = 0$, $\sum u_i v_i = 0$, $\sum u_i^2 v_i = 0$, $\sum u_i v_i w_i = 0$ — so coefficients in different blocks are estimated independently. The linear block is diagonal, with $\sum u_i^2 = 8 + 2\alpha^2 = 13.66$ (8 factorial points plus 2 axial points on the $u$ axis):
$$\mathrm{Var}(\hat\beta_u) = \frac{\sigma^2}{\sum u_i^2}, \qquad \mathrm{SE}(\hat\beta_u) = \frac{\sigma}{\sqrt{13.66}} = 0.0135 \ \text{with } \sigma = 0.05.$$
The standard error is below 5% of the coefficient value $0.30$: the data can distinguish the coefficients. The role of the axial block: with only the 8 factorial points and the center, $u^2 = v^2 = w^2$ at every design point — the three columns coincide, $X^\top X$ is singular, and $\beta_{uu}, \beta_{vv}, \beta_{ww}$ cannot be estimated separately. The axial points separate the directions: at $(\pm\alpha, 0, 0)$ only $u^2 \neq 0$, at $(0, \pm\alpha, 0)$ only $v^2 \neq 0$. Curvature along each direction is measurable only thanks to this block — the reason the CCD needs axial points even though they lie outside the factorial cube.
```

## Section I — Monte Carlo sensitivity and confidence intervals of the solution

Every number in the previous sections — the coefficients, the solution $(73.4; 70; 90)$, $Y^* = 14.64$ — is a function of the estimated vector $\hat\beta$, and $\hat\beta$ is a random vector with covariance $\sigma^2(X^\top X)^{-1}$ (Sections A and H). The question of this section: how does the estimation error of the coefficients propagate into the optimal solution? Answered in two ways — first-order via the envelope theorem, and exactly via Monte Carlo.

With $\sigma = 0.05$ and a 17-experiment CCD, the standard errors of all coefficients follow from the diagonal of $(X^\top X)^{-1}$:

| Coefficient | Estimate | SE | t |
|---|---|---|---|
| $\beta_0$ | 9.20 | 0.029 | 319 |
| $b_u$ | 0.30 | 0.0135 | 22.2 |
| $b_v$ | 0.26 | 0.0135 | 19.2 |
| $b_w$ | 0.10 | 0.0135 | 7.4 |
| $B_{uu}$ | −0.014 | 0.0149 | −0.94 |
| $B_{vv}$ | −0.009 | 0.0149 | −0.60 |
| $B_{ww}$ | −0.002 | 0.0149 | −0.13 |
| $B_{uv}$ | 0.005 | 0.0177 | 0.28 |

```remark[Reading the table: good slope, poor curvature]
With $df = 17 - 10 = 7$, the two-sided 5% t threshold is 2.37. The three linear coefficients ($t = 22.2$; $19.2$; $7.4$) far exceed the threshold; no curvature coefficient ($|t| \le 0.94$) is significant. Consequence: the ascent direction is tightly determined, but the curvature — the thing that decides the location and height of the peak — is not. This is the quantitative version of the extrapolation pitfall of Section D: the peak lies about 25.1 coded units from the design center, and the value there is predicted by exactly the least reliable coefficients.
```

```remark[First-order variance of the optimal value]
With a fixed set of active constraints, the envelope theorem gives $\partial Y^*/\partial\beta_i = x^*_i$ — the derivative of $Y$ with respect to coefficient $\beta_i$ at the solution, because $x^*$ is the optimal point so the terms containing the movement of $x^*$ vanish. Hence, to first order:
$$\mathrm{Var}(Y^*) = \sum_{i,j} \mathrm{Cov}(\beta_i, \beta_j)\, x^*_i x^*_j = \sigma^2 x^{*\top}(X^\top X)^{-1} x^*.$$
With $x^* = (1; 13.39; 15; 15; 179.3; 225; 225; 200.9; 200.9; 225)$ (the monomials of the solution in each column of $X$), one computes $\mathrm{Var}(Y^*) = 87.8$, i.e. $\mathrm{SD}(Y^*) = 9.4$ mg/g. The quadratic block contributes $87.8/87.95 \approx 99.9\%$ of the variance: the uncertainty of the peak value is almost entirely due to curvature, not slope. The number 9.4 is the first-order scale; the Monte Carlo below confirms this order.
```

```example[Monte Carlo: 20 000 coefficient draws]
Draw 20 000 vectors $\beta$ from $N(\hat\beta, \sigma^2(X^\top X)^{-1})$ and re-solve the constrained problem for each. The results come in three tiers. First, only $19\%$ of the draws keep $B$ negative definite — the surface still concave; for the remaining 81% the model can no longer be used for optimization (the peak slides outside the design region or becomes a saddle). The 19% frequency is a quantitative measure of the warning in Section F: the current data are insufficient to assert that a peak exists in the region. Second, over the 3771 concave draws, the peak yield $Y^*$ has mean 11.1, SD 7.8, 95% range [5.5; 16.6] (Figure 7a) — a range wider than the point estimate itself. Third, the location is more stable than the value: among the draws with the same active-constraint structure ($v = 15$, $w = 15$), the optimal temperature $T^*$ has SD 5.5 °C and 95% range [58; 75] (Figure 7b). The model locates the peak within a few degrees; the peak height cannot be quantified.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/mc-sensitivity.svg" alt="Monte Carlo sensitivity of the optimal solution" style="display:block;width:100%;max-width:840px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Figure 7 — (a) Y* over the 3771 draws that keep the surface concave; the dashed yellow curve is a normal with the same mean 11.1 and SD 7.8 — the distribution is skewed with a heavy tail; the red line is the point estimate 14.64. (b) T* over the 865 draws with the same active-constraint structure v = 15, w = 15; SD 5.5 °C, point estimate 73.4.</figcaption></figure>

```remark[Why the conditional mean is below the point estimate]
The conditional mean of $Y^*$ (11.1) is below the point estimate (14.64) — not a discrepancy. The condition "B negative definite" selects draws with stronger negative curvature, and at the solution $v^2 = w^2 = 225$, so stronger negative curvature lowers the predicted peak. This is a selection effect of the conditioning itself: the range [5.5; 16.6] is a conditional range, not an unconditional confidence interval of $Y^*$.
```

```remark[Practical lesson: the model locates, the experiment quantifies]
Three conclusions for decisions. First, the range [5.5; 16.6] of $Y^*$ explains why the two-stage workflow of Section D is not optional: stage two measures $Y$ directly at $(73.4; 70; 90)$, and this measurement does not depend on the poorly estimated curvature — it is the only way to certify the peak height. Second, design improvement directions: increase the number of center points $n_c$ (more degrees of freedom, better $\sigma$ estimate), increase $\alpha$ (the lever of curvature), or reduce $\sigma$ (more precise measurement); the standard error of the curvature coefficients is proportional to $\sigma/\sqrt{\Sigma u^4 - (\Sigma u^2)^2/n}$, with $\Sigma u^4 = 24$, $\Sigma u^2 = 13.66$, $n = 17$ for this design giving the denominator $\sqrt{13.0}$. Third, methods: first-order error propagation in the series *Basic Statistics for the Life Sciences* (Part 4), confidence intervals (Part 1), and Monte Carlo as global sensitivity analysis, with the full framework in Saltelli et al.
```

The global sensitivity framework and the variance-based indices — Sobol, total effects — are presented in Saltelli et al. [^8].

## Where to go next

This post walks the complete workflow for three variables. With more variables, the KKT solution still holds but hand computation gives way to a numerical solver; the full theory of the tools here — modeling, KKT, shadow prices, robust optimization, multi-objective — is in the overview post *Optimization for Decisions*. For the reader connecting to statistics: multiple regression in the series *Basic Statistics for the Life Sciences* (Part 6) covers estimating and testing the coefficients of a quadratic model, while spectral data analysis and chemometrics (Part 11) opens the way to responses measured by instruments. Section F raises the question of when the quadratic approximation is insufficient; when each experiment is expensive and the response function has no known form, the natural next step is Bayesian optimization with a Gaussian process.

[^1]: G. E. P. Box and K. B. Wilson, "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society B* 13(1): 1–45, 1951.
[^2]: R. H. Myers, D. C. Montgomery and C. M. Anderson-Cook, *Response Surface Methodology: Process and Product Optimization Using Designed Experiments*, 4th ed., Wiley, 2016.
[^3]: S. Boyd and L. Vandenberghe, *Convex Optimization*, Cambridge University Press, 2004.
[^4]: W. Karush, "Minima of functions of several variables with inequalities as side conditions," PhD thesis, University of Chicago, 1939; H. W. Kuhn and A. W. Tucker, "Nonlinear programming," *Proceedings of the Second Berkeley Symposium on Mathematical Statistics and Probability*, 481–492, 1951.
[^5]: D. Bertsimas and M. Sim, "The price of robustness," *Operations Research* 52(1): 35–53, 2004.
[^6]: D. C. Montgomery, *Design and Analysis of Experiments*, 9th ed., Wiley, 2017.
[^7]: G. E. P. Box and N. R. Draper, *Response Surfaces, Mixtures, and Ridge Analyses*, 2nd ed., Wiley, 2007.
[^8]: A. Saltelli, M. Ratto, T. Andres, F. Campolongo, J. Cariboni, D. Gatelli, M. Saisana and S. Tarantola, *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
