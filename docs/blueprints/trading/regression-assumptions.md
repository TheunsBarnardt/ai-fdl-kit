---
title: "Regression Assumptions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Verify the four classical assumptions of simple linear regression — linearity, homoskedasticity, independence, and normality — using residual diagnostics and pl"
---

# Regression Assumptions Blueprint

> Verify the four classical assumptions of simple linear regression — linearity, homoskedasticity, independence, and normality — using residual diagnostics and plots

| | |
|---|---|
| **Feature** | `regression-assumptions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, assumptions, diagnostics, residual-analysis, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-assumptions.blueprint.yaml) |
| **JSON API** | [regression-assumptions.json]({{ site.baseurl }}/api/blueprints/trading/regression-assumptions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `diagnostics_engine` | Regression Diagnostics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `residuals` | json | Yes | Array of regression residuals e_i = Y_i - Y_hat_i |  |
| `fitted_values` | json | Yes | Array of fitted values Y_hat_i |  |
| `independent_variable` | json | No | Array of X values for plotting residuals against X |  |

## Rules

- **four_assumptions:**
  - **linearity:** E[Y|X] is linear in X; residuals should be random, not form a systematic pattern
  - **homoskedasticity:** Var(epsilon_i) = sigma^2, constant across all observations
  - **independence:** Cov(epsilon_i, epsilon_j) = 0 for i != j; observations are independent
  - **normality:** epsilon_i ~ N(0, sigma^2) — needed for inference but relaxable for large n by CLT
- **diagnostics:**
  - **residual_vs_x_plot:** No pattern expected; curvature => non-linearity; fan shape => heteroskedasticity
  - **residual_vs_fitted_plot:** Same — cluster or trend signals misspecification or non-constant variance
  - **qq_plot:** Normality check — points should lie on the 45-degree line
  - **durbin_watson:** Test for first-order autocorrelation of residuals
- **violations_and_fixes:**
  - **non_linearity:** Transform variables (log, sqrt); add polynomial term; use non-linear model
  - **heteroskedasticity:** Weighted least squares; use White/robust standard errors
  - **autocorrelation:** Add lagged regressors; use Newey-West HAC standard errors
  - **non_normality:** Increase sample size (CLT); use bootstrap inference; robust regression
- **small_sample_note:**
  - **normality_matters_more:** For n < 30, non-normality severely distorts t and F inferences
  - **large_sample_relaxation:** For n >= 100 with finite variance, CLT makes t and F robust to non-normality
- **applications:**
  - **volatility_clustering:** Financial returns exhibit heteroskedasticity — use robust SE or GARCH
  - **autocorrelated_returns:** Daily returns may show serial correlation — diagnose with DW or LM test
  - **non_linear_relation:** Returns vs size often need log transformation
- **validation:**
  - **residual_length_matches:** residuals and fitted_values have same length
  - **residuals_numeric:** All residual entries are finite numbers

## Outcomes

### Run_diagnostics (Priority: 1)

_Perform full residual diagnostic suite_

**Given:**
- `residuals` (input) exists
- `fitted_values` (input) exists

**Then:**
- **call_service** target: `diagnostics_engine`
- **emit_event** event: `regression.diagnostics_completed`

### Heteroskedasticity_detected (Priority: 5)

_Breusch-Pagan or fan-pattern test signals non-constant variance_

**Given:**
- `heteroskedasticity_p_value` (computed) lt `0.05`

**Then:**
- **emit_event** event: `regression.assumption_violated`

### Autocorrelation_detected (Priority: 6)

_Durbin-Watson outside [1.5, 2.5]_

**Given:**
- ANY: `durbin_watson` (computed) lt `1.5` OR `durbin_watson` (computed) gt `2.5`

**Then:**
- **emit_event** event: `regression.assumption_violated`

### Missing_residuals (Priority: 10) — Error: `DIAG_RESIDUALS_MISSING`

_Residuals not provided_

**Given:**
- `residuals` (input) not_exists

**Then:**
- **emit_event** event: `regression.diagnostics_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DIAG_RESIDUALS_MISSING` | 400 | Residuals array is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.diagnostics_completed` |  | `model_id`, `linearity_ok`, `homoskedasticity_ok`, `independence_ok`, `normality_ok` |
| `regression.assumption_violated` |  | `model_id`, `assumption`, `severity`, `recommended_fix` |
| `regression.diagnostics_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| hypothesis-testing-framework | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
residual_plot_interpretations:
  random_cloud: Assumptions likely OK
  curved_pattern: Non-linearity — transform X or Y
  fan_shape: Heteroskedasticity — use robust SEs
  wave_pattern: Autocorrelation — add lags or use HAC SEs
  clustered_groups: Missing regime indicator — add dummy variable
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Assumptions Blueprint",
  "description": "Verify the four classical assumptions of simple linear regression — linearity, homoskedasticity, independence, and normality — using residual diagnostics and pl",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, assumptions, diagnostics, residual-analysis, cfa-level-1"
}
</script>
