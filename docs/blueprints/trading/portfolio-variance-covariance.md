---
title: "Portfolio Variance Covariance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and dive"
---

# Portfolio Variance Covariance Blueprint

> Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and diversification

| | |
|---|---|
| **Feature** | `portfolio-variance-covariance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, portfolio-mathematics, portfolio-variance, covariance-matrix, markowitz, diversification, mpt, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-variance-covariance.blueprint.yaml) |
| **JSON API** | [portfolio-variance-covariance.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-variance-covariance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_engine` | Portfolio Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `weights` | json | Yes | Array of portfolio weights w_i (sum to 1) |  |
| `covariance_matrix` | json | Yes | n x n covariance matrix of returns; diagonal entries are variances |  |
| `correlation_matrix` | json | No | Optional correlation matrix (used with stdevs to derive covariances) |  |
| `std_devs` | json | No | Vector of asset standard deviations (required if using correlation_matrix) |  |

## Rules

- **core_formulas:**
  - **two_asset_variance:** Var(Rp) = w1^2 * Var(R1) + w2^2 * Var(R2) + 2 * w1 * w2 * Cov(R1, R2)
  - **three_asset_variance:** Var(Rp) = sum_i[w_i^2 * Var(R_i)] + 2 * sum_{i<j}[w_i * w_j * Cov(R_i, R_j)]
  - **n_asset_variance:** Var(Rp) = sum_i sum_j [ w_i * w_j * Cov(R_i, R_j) ]
  - **standard_deviation:** sigma(Rp) = sqrt(Var(Rp))
  - **covariance_from_correlation:** Cov(R_i, R_j) = rho_ij * sigma_i * sigma_j
- **matrix_properties:**
  - **symmetric:** Cov(R_i, R_j) = Cov(R_j, R_i); covariance matrix is symmetric
  - **diagonal_is_variance:** Cov(R_i, R_i) = Var(R_i)
  - **positive_semi_definite:** A valid covariance matrix is PSD: w'Sw >= 0 for all w
  - **distinct_covariances:** For n assets, there are n variances and n(n-1)/2 distinct off-diagonal covariances
- **diversification_insight:**
  - **principle:** Portfolio variance is less than the weighted sum of asset variances when correlations < 1
  - **no_benefit:** rho = +1 → no diversification benefit; portfolio stdev = weighted stdev
  - **max_benefit:** rho = -1 → full hedging possible; portfolio variance can reach 0
  - **diversification_dominates_at_scale:** As n grows, covariance terms dominate variance terms; off-diagonal count is n(n-1)
- **worked_example:**
  - **weights:** 0.5, 0.25, 0.25
  - **variances_pct_sq:** 400, 81, 441
  - **covariances:**
    - **sp500_ltbond:** 45
    - **sp500_eafe:** 189
    - **ltbond_eafe:** 38
  - **portfolio_variance:** 195.875
  - **portfolio_std_dev_pct:** 14
- **investment_applications:**
  - **efficient_frontier:** Minimise Var(Rp) for each target E(Rp); trace out efficient frontier
  - **risk_parity:** Weight assets so each contributes equally to portfolio variance
  - **stress_scenarios:** Apply crisis covariance matrices to gauge tail portfolio risk
- **validation:**
  - **matrix_square:** covariance_matrix must be n x n
  - **matrix_symmetric:** |Cov[i][j] - Cov[j][i]| <= 1e-8 for all i, j
  - **weights_length_match:** length(weights) = n (matrix dimension)
  - **weights_sum_to_one:** |sum(weights) - 1| <= 1e-6

## Outcomes

### Compute_variance (Priority: 1)

_Bilinear form w' Sigma w over the covariance matrix_

**Given:**
- `weights` (input) exists
- `covariance_matrix` (input) exists
- `inputs_valid` (computed) eq `true`

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.variance_calculated`

### Compute_from_correlation (Priority: 2)

_Derive covariance matrix from correlation matrix + std devs, then compute variance_

**Given:**
- `correlation_matrix` (input) exists
- `std_devs` (input) exists

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.variance_calculated`

### Matrix_malformed (Priority: 10) — Error: `PORT_VAR_MATRIX_MALFORMED`

_Covariance matrix is not square or not symmetric_

**Given:**
- `inputs_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.variance_rejected`

### Dimension_mismatch (Priority: 11) — Error: `PORT_VAR_DIMENSION_MISMATCH`

_Weight vector length does not match matrix dimension_

**Given:**
- `dimensions_match` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.variance_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORT_VAR_MATRIX_MALFORMED` | 400 | Covariance matrix must be square and symmetric | No |
| `PORT_VAR_DIMENSION_MISMATCH` | 400 | Weights length must match covariance matrix dimension | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.variance_calculated` |  | `portfolio_id`, `variance`, `std_dev`, `asset_count`, `diversification_ratio` |
| `portfolio.variance_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-expected-return-variance | recommended | Portfolio-level expected return and variance calculations depend on the covariance inputs defined here |
| portfolio-expected-return | required |  |
| covariance-correlation | required |  |
| measures-of-dispersion | recommended |  |
| joint-probability-covariance | recommended |  |

## AGI Readiness

### Goals

#### Reliable Portfolio Variance Covariance

Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and diversification

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `portfolio_expected_return` | portfolio-expected-return | fail |
| `covariance_correlation` | covariance-correlation | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_variance | `autonomous` | - | - |
| compute_from_correlation | `autonomous` | - | - |
| matrix_malformed | `autonomous` | - | - |
| dimension_mismatch | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
diversification_ratio:
  formula: DR = sum_i[w_i * sigma_i] / sigma_p
  interpretation: DR > 1 indicates diversification benefit; DR = 1 means all
    assets perfectly correlated
two_asset_example:
  weights:
    - 0.6
    - 0.4
  std_devs:
    - 0.2
    - 0.15
  correlation: 0.3
  variance: 0.60^2*0.20^2 + 0.40^2*0.15^2 + 2*0.60*0.40*0.30*0.20*0.15 = 0.02172
  std_dev: 0.1474
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Variance Covariance Blueprint",
  "description": "Compute portfolio variance and standard deviation from asset weights and the covariance matrix — the foundation of Markowitz mean-variance optimisation and dive",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, portfolio-mathematics, portfolio-variance, covariance-matrix, markowitz, diversification, mpt, cfa-level-1"
}
</script>
