---
title: "Regression Anova Table Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Construct and interpret the ANOVA table for a simple linear regression — decomposing total variation into regression and error components and computing the over"
---

# Regression Anova Table Blueprint

> Construct and interpret the ANOVA table for a simple linear regression — decomposing total variation into regression and error components and computing the overall F-test

| | |
|---|---|
| **Feature** | `regression-anova-table` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, anova, variance-decomposition, f-test, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-anova-table.blueprint.yaml) |
| **JSON API** | [regression-anova-table.json]({{ site.baseurl }}/api/blueprints/trading/regression-anova-table.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine` | Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ssr` | number | Yes | Sum of squares regression (explained) |  |
| `sse` | number | Yes | Sum of squares error (unexplained) |  |
| `sample_size` | number | Yes | n — number of observations |  |
| `parameters` | number | No | k — number of slope coefficients (1 in SLR) |  |

## Rules

- **anova_table:**
  - **regression_row:** SS=SSR, df=k, MS=MSR=SSR/k
  - **error_row:** SS=SSE, df=n-k-1, MS=MSE=SSE/(n-k-1)
  - **total_row:** SS=SST, df=n-1
  - **sst_identity:** SST = SSR + SSE
- **mean_squares:**
  - **msr:** MSR = SSR / k
  - **mse:** MSE = SSE / (n - k - 1)
  - **slr_df_error:** n - 2 in simple linear regression (k = 1)
- **f_statistic:**
  - **formula:** F = MSR / MSE
  - **distribution:** F with (k, n - k - 1) degrees of freedom
  - **slr_case:** F with (1, n - 2) degrees of freedom
  - **relation_to_t_and_r_squared:**
    - **t_squared:** In SLR, F = t_slope^2
    - **from_r_squared:** F = (R^2 / k) / ((1 - R^2) / (n - k - 1))
- **standard_error_of_estimate:**
  - **formula:** se = sqrt(MSE)
  - **interpretation:** Residual standard deviation — units of Y
- **interpretation:**
  - **large_f:** Reject H0 of no linear relationship
  - **small_f:** Fail to reject — model explains little incremental variation
- **applications:**
  - **factor_model_strength:** F-test of whether the factor significantly explains returns
  - **model_comparison:** F-ratios allow nested-model comparisons
  - **reporting_standard:** ANOVA table is the standard output format for statistical software
- **validation:**
  - **ss_non_negative:** SSR, SSE >= 0
  - **n_above_parameters:** n > k + 1

## Outcomes

### Build_anova_table (Priority: 1)

_Construct ANOVA table and F-statistic_

**Given:**
- `ssr` (input) gte `0`
- `sse` (input) gte `0`
- `sample_size` (input) gt `2`

**Then:**
- **call_service** target: `regression_engine`
- **emit_event** event: `regression.anova_completed`

### Degenerate_sse (Priority: 10)

_SSE is zero or near-zero (perfect fit) — F undefined_

**Given:**
- `sse` (input) eq `0`

**Then:**
- **emit_event** event: `regression.anova_warning`

### Insufficient_n (Priority: 11) — Error: `ANOVA_INSUFFICIENT_N`

_n too small for valid df_

**Given:**
- `sample_size` (input) lte `2`

**Then:**
- **emit_event** event: `regression.anova_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ANOVA_INSUFFICIENT_N` | 400 | Sample size must exceed k + 1 for valid ANOVA degrees of freedom | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.anova_completed` |  | `model_id`, `msr`, `mse`, `f_statistic`, `f_p_value`, `r_squared`, `se` |
| `regression.anova_warning` |  | `model_id`, `warning_message` |
| `regression.anova_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| regression-goodness-of-fit | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  ssr: 185.1
  sse: 27.4
  sst: 212.5
  n: 6
  k: 1
  msr: 185.1
  mse: 6.85
  f: 27.02
  df:
    - 1
    - 4
  r_squared: 0.871
  se: 2.617
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Anova Table Blueprint",
  "description": "Construct and interpret the ANOVA table for a simple linear regression — decomposing total variation into regression and error components and computing the over",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, anova, variance-decomposition, f-test, cfa-level-1"
}
</script>
