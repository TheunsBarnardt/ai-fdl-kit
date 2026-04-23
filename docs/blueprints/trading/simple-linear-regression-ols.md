---
title: "Simple Linear Regression Ols Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Estimate the intercept and slope of a simple linear regression of Y on X using ordinary least squares — minimising the sum of squared vertical residuals. 3 fiel"
---

# Simple Linear Regression Ols Blueprint

> Estimate the intercept and slope of a simple linear regression of Y on X using ordinary least squares — minimising the sum of squared vertical residuals

| | |
|---|---|
| **Feature** | `simple-linear-regression-ols` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, ols, least-squares, slr, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/simple-linear-regression-ols.blueprint.yaml) |
| **JSON API** | [simple-linear-regression-ols.json]({{ site.baseurl }}/api/blueprints/trading/simple-linear-regression-ols.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine` | Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `y_observations` | json | Yes | Array of dependent variable values |  |
| `x_observations` | json | Yes | Array of independent variable values (same length as y) |  |
| `include_intercept` | boolean | No | Include intercept (default true) |  |

## Rules

- **model_specification:**
  - **population_model:** Y_i = b0 + b1 * X_i + epsilon_i
  - **estimated_line:** Y_hat_i = b0_hat + b1_hat * X_i
  - **residual:** e_i = Y_i - Y_hat_i
- **ols_estimators:**
  - **slope:** b1_hat = sum_i [(X_i - X_bar)(Y_i - Y_bar)] / sum_i [(X_i - X_bar)^2] = Cov(X,Y) / Var(X)
  - **intercept:** b0_hat = Y_bar - b1_hat * X_bar
  - **regression_line_passes_through_means:** The fitted line always passes through the point (X_bar, Y_bar)
- **interpretation:**
  - **slope:** b1_hat estimates the average change in Y for a one-unit change in X
  - **intercept:** b0_hat estimates the expected Y when X = 0 (may be economically meaningless if X = 0 is outside the sample)
  - **residual_sum_zero:** Sum of OLS residuals equals zero when an intercept is included
- **applications:**
  - **factor_model:** Regress stock excess return on market excess return to estimate alpha (b0) and beta (b1)
  - **earnings_model:** Regress ROA on CAPEX intensity
  - **growth_relationship:** Regress market value on earnings or cash flow
  - **cost_of_equity:** Slope of return vs market = CAPM beta
- **validation:**
  - **equal_length:** x_observations and y_observations must have the same length
  - **sample_size:** n >= 2 required to fit a line; n >= 10 preferred for inference
  - **x_variation_positive:** Var(X) > 0 — constant X cannot explain variation in Y

## Outcomes

### Fit_regression (Priority: 1)

_Compute OLS estimates_

**Given:**
- `y_observations` (input) exists
- `x_observations` (input) exists
- `x_variance_positive` (computed) eq `true`

**Then:**
- **call_service** target: `regression_engine`
- **emit_event** event: `regression.fit_completed`

### Zero_variance_x (Priority: 10) — Error: `SLR_X_ZERO_VARIANCE`

_Independent variable has no variation_

**Given:**
- `x_variance_positive` (computed) eq `false`

**Then:**
- **emit_event** event: `regression.fit_rejected`

### Length_mismatch (Priority: 11) — Error: `SLR_LENGTH_MISMATCH`

_x and y arrays differ in length_

**Given:**
- `lengths_match` (computed) eq `false`

**Then:**
- **emit_event** event: `regression.fit_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLR_X_ZERO_VARIANCE` | 400 | Independent variable has zero variance; regression cannot be estimated | No |
| `SLR_LENGTH_MISMATCH` | 400 | X and Y arrays must have the same length | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.fit_completed` |  | `model_id`, `b0_hat`, `b1_hat`, `n`, `x_bar`, `y_bar` |
| `regression.fit_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| covariance-correlation | required |  |
| regression-assumptions | required |  |
| regression-goodness-of-fit | recommended |  |
| regression-coefficient-hypothesis-tests | recommended |  |

## AGI Readiness

### Goals

#### Reliable Simple Linear Regression Ols

Estimate the intercept and slope of a simple linear regression of Y on X using ordinary least squares — minimising the sum of squared vertical residuals

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
| `covariance_correlation` | covariance-correlation | fail |
| `regression_assumptions` | regression-assumptions | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| fit_regression | `autonomous` | - | - |
| zero_variance_x | `autonomous` | - | - |
| length_mismatch | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  x_capex:
    - 0.7
    - 0.4
    - 5
    - 10
    - 8
    - 12.5
  y_roa:
    - 6
    - 4
    - 15
    - 20
    - 10
    - 20
  x_bar: 6.1
  y_bar: 12.5
  b1_hat: approximately 1.25
  b0_hat: approximately 4.875
  fitted_line: ROA_hat = 4.875 + 1.25 * CAPEX
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Simple Linear Regression Ols Blueprint",
  "description": "Estimate the intercept and slope of a simple linear regression of Y on X using ordinary least squares — minimising the sum of squared vertical residuals. 3 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, ols, least-squares, slr, cfa-level-1"
}
</script>
