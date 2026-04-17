---
title: "Joint Probability Covariance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the covariance of returns between two assets from a joint probability function — the forward-looking covariance used when historical data is unavailable"
---

# Joint Probability Covariance Blueprint

> Compute the covariance of returns between two assets from a joint probability function — the forward-looking covariance used when historical data is unavailable or unrepresentative

| | |
|---|---|
| **Feature** | `joint-probability-covariance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, portfolio-mathematics, joint-probability, covariance, forward-looking, independence, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/joint-probability-covariance.blueprint.yaml) |
| **JSON API** | [joint-probability-covariance.json]({{ site.baseurl }}/api/blueprints/trading/joint-probability-covariance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_engine` | Portfolio Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `joint_distribution` | json | Yes | Array of {r_a, r_b, probability} — joint probability mass over returns of assets A and B |  |
| `expected_returns` | json | No | Optional precomputed {e_r_a, e_r_b}; else derived from marginals |  |
| `assume_independence` | boolean | No | If true, assert Cov = 0 and verify P(A,B) = P(A)*P(B) |  |

## Rules

- **core_formulas:**
  - **joint_covariance:** Cov(R_A, R_B) = sum_i sum_j [ P(R_A=i, R_B=j) * (R_A_i - E(R_A)) * (R_B_j - E(R_B)) ]
  - **marginal_a:** P(R_A = i) = sum_j P(R_A=i, R_B=j)
  - **marginal_b:** P(R_B = j) = sum_i P(R_A=i, R_B=j)
  - **independence_test:** P(R_A=i, R_B=j) = P(R_A=i) * P(R_B=j) for all i, j
  - **expected_product_independent:** E(X*Y) = E(X) * E(Y) when X, Y are independent
- **interpretation:**
  - **joint_cov_is_scenario_weighted:** Probability-weighted sum of cross-deviation products; the ex-ante analog of sample covariance
  - **independence_implies_zero_cov:** Independent variables have covariance 0; converse is NOT true (zero cov does not imply independence except for joint normals)
  - **linear_vs_dependence:** Covariance captures linear co-movement; non-linear dependencies may have Cov = 0 while still dependent
- **properties:**
  - **symmetry:** Cov(A, B) = Cov(B, A)
  - **self_covariance:** Cov(A, A) = Var(A)
  - **linearity:** Cov(aX + b, cY + d) = a*c*Cov(X, Y)
- **applications:**
  - **scenario_analysis:** Build covariance from expert-elicited joint scenarios (recession/normal/boom co-movements)
  - **forward_covariance:** When historical correlations are non-stationary, forecast via joint probabilities
  - **stress_testing:** Elicit crisis-state joint distribution to derive stressed covariance
- **validation:**
  - **probabilities_sum_to_one:** |sum(P_ij) - 1| <= 1e-8
  - **non_negative_probabilities:** All joint probabilities >= 0
  - **grid_complete:** Every (r_a, r_b) combination in the support has a defined probability

## Outcomes

### Compute_joint_covariance (Priority: 1)

_Probability-weighted sum over joint distribution_

**Given:**
- `joint_distribution` (input) exists
- `distribution_valid` (computed) eq `true`

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.joint_covariance_calculated`

### Verify_independence (Priority: 2)

_Assert independence and verify factorisation_

**Given:**
- `assume_independence` (input) eq `true`

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.independence_verified`

### Distribution_invalid (Priority: 10) — Error: `JOINT_COV_DISTRIBUTION_INVALID`

_Joint probabilities do not sum to 1 or are negative_

**Given:**
- `distribution_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.joint_covariance_rejected`

### Independence_violated (Priority: 11) — Error: `JOINT_COV_INDEPENDENCE_VIOLATED`

_Independence assumed but factorisation fails_

**Given:**
- `independence_holds` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.joint_covariance_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `JOINT_COV_DISTRIBUTION_INVALID` | 400 | Joint probabilities must be non-negative and sum to 1 | No |
| `JOINT_COV_INDEPENDENCE_VIOLATED` | 422 | Independence assumption violated — P(A,B) does not factor as P(A)*P(B) | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.joint_covariance_calculated` |  | `pair_id`, `covariance`, `correlation`, `expected_r_a`, `expected_r_b` |
| `portfolio.independence_verified` |  | `pair_id`, `is_independent`, `max_factorisation_error` |
| `portfolio.joint_covariance_rejected` |  | `pair_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-variance-covariance | required |  |
| covariance-correlation | required |  |
| expected-value-variance | required |  |
| probability-tree-conditional-expectation | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  joint_distribution:
    - r_a: 0.2
      r_b: 0.15
      probability: 0.3
    - r_a: 0.1
      r_b: 0.05
      probability: 0.5
    - r_a: -0.05
      r_b: -0.1
      probability: 0.2
  e_r_a: 0.1
  e_r_b: 0.065
  covariance_formula: 0.30*(0.20-0.10)*(0.15-0.065) +
    0.50*(0.10-0.10)*(0.05-0.065) + 0.20*(-0.05-0.10)*(-0.10-0.065)
  positive_comovement: All deviation cross-products have the same sign → strong positive covariance
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Joint Probability Covariance Blueprint",
  "description": "Compute the covariance of returns between two assets from a joint probability function — the forward-looking covariance used when historical data is unavailable",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, portfolio-mathematics, joint-probability, covariance, forward-looking, independence, cfa-level-1"
}
</script>
