---
title: "Regression Goodness Of Fit Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Measure how well a simple linear regression explains the dependent variable using R-squared, the standard error of estimate, and the overall F-test. 5 fields. 3"
---

# Regression Goodness Of Fit Blueprint

> Measure how well a simple linear regression explains the dependent variable using R-squared, the standard error of estimate, and the overall F-test

| | |
|---|---|
| **Feature** | `regression-goodness-of-fit` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, r-squared, standard-error-estimate, f-test, goodness-of-fit, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-goodness-of-fit.blueprint.yaml) |
| **JSON API** | [regression-goodness-of-fit.json]({{ site.baseurl }}/api/blueprints/trading/regression-goodness-of-fit.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine` | Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sst` | number | Yes | Total sum of squares (SST) |  |
| `ssr` | number | No | Regression sum of squares (SSR) — explained |  |
| `sse` | number | No | Error sum of squares (SSE) — unexplained |  |
| `sample_size` | number | Yes | n — number of observations |  |
| `parameters` | number | No | k — number of estimated regression coefficients excluding intercept (default 1 for SLR) |  |

## Rules

- **variance_decomposition:**
  - **sst_formula:** SST = sum_i (Y_i - Y_bar)^2
  - **ssr_formula:** SSR = sum_i (Y_hat_i - Y_bar)^2
  - **sse_formula:** SSE = sum_i (Y_i - Y_hat_i)^2
  - **identity:** SST = SSR + SSE
- **r_squared:**
  - **formula:** R^2 = SSR / SST = 1 - SSE / SST
  - **interpretation:** Proportion of variation in Y explained by variation in X
  - **range:** 0 <= R^2 <= 1
  - **slr_equivalence:** In SLR, R^2 equals the square of the sample correlation between X and Y
- **standard_error_of_estimate:**
  - **formula:** se = sqrt(SSE / (n - 2))
  - **interpretation:** Average distance between observed Y and fitted Y_hat; in same units as Y
  - **smaller_better:** A lower se implies the regression line sits closer to the observations
- **f_test_overall:**
  - **statistic:** F = (SSR / k) / (SSE / (n - k - 1))
  - **slr_case:** In SLR, k = 1, so F = SSR / (SSE / (n - 2)) with (1, n - 2) df
  - **hypothesis:** H0: all slopes = 0 vs Ha: at least one slope != 0
  - **relation_to_t:** In SLR, F = t^2 on slope coefficient
- **applications:**
  - **factor_strength:** R^2 of asset return on market return gauges market beta's explanatory power
  - **model_selection:** Higher R^2 among nested models of same dependent variable signals better fit
  - **residual_risk:** se quantifies residual volatility around the predicted Y
- **validation:**
  - **sst_positive:** SST > 0 — Y must vary
  - **sum_of_squares_non_negative:** SSR, SSE >= 0
  - **n_above_parameters:** n > k + 1 for valid degrees of freedom

## Outcomes

### Compute_fit_metrics (Priority: 1)

_Compute R^2, standard error of estimate, and F-statistic_

**Given:**
- `sst` (input) gt `0`
- `sample_size` (input) gt `2`

**Then:**
- **call_service** target: `regression_engine`
- **emit_event** event: `regression.fit_metrics_completed`

### Invalid_sst (Priority: 10) — Error: `FIT_SST_INVALID`

_SST non-positive_

**Given:**
- `sst` (input) lte `0`

**Then:**
- **emit_event** event: `regression.fit_metrics_rejected`

### Insufficient_n (Priority: 11) — Error: `FIT_INSUFFICIENT_N`

_Sample size too small for df_

**Given:**
- `sample_size` (input) lte `2`

**Then:**
- **emit_event** event: `regression.fit_metrics_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FIT_SST_INVALID` | 400 | SST must be strictly positive (Y must have variation) | No |
| `FIT_INSUFFICIENT_N` | 400 | Need n > 2 for valid SLR degrees of freedom | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.fit_metrics_completed` |  | `model_id`, `r_squared`, `standard_error_of_estimate`, `f_statistic`, `f_p_value` |
| `regression.fit_metrics_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| regression-anova-table | recommended |  |
| regression-coefficient-hypothesis-tests | recommended |  |

## AGI Readiness

### Goals

#### Reliable Regression Goodness Of Fit

Measure how well a simple linear regression explains the dependent variable using R-squared, the standard error of estimate, and the overall F-test

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
| `simple_linear_regression_ols` | simple-linear-regression-ols | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_fit_metrics | `autonomous` | - | - |
| invalid_sst | `autonomous` | - | - |
| insufficient_n | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  sst: 212.5
  ssr: 185.1
  sse: 27.4
  n: 6
  r_squared: 185.1 / 212.5 = 0.871
  see: sqrt(27.4 / 4) = 2.617
  f: 185.1 / (27.4 / 4) = 27.02
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Goodness Of Fit Blueprint",
  "description": "Measure how well a simple linear regression explains the dependent variable using R-squared, the standard error of estimate, and the overall F-test. 5 fields. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, r-squared, standard-error-estimate, f-test, goodness-of-fit, cfa-level-1"
}
</script>
