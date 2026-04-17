---
title: "Regression Functional Forms Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Transform variables in a simple linear regression to capture non-linear relationships using log-lin, lin-log, log-log, and reciprocal functional forms. 3 fields"
---

# Regression Functional Forms Blueprint

> Transform variables in a simple linear regression to capture non-linear relationships using log-lin, lin-log, log-log, and reciprocal functional forms

| | |
|---|---|
| **Feature** | `regression-functional-forms` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, functional-forms, log-linear, elasticity, transformations, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-functional-forms.blueprint.yaml) |
| **JSON API** | [regression-functional-forms.json]({{ site.baseurl }}/api/blueprints/trading/regression-functional-forms.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine` | Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `y_observations` | json | Yes | Array of dependent variable values |  |
| `x_observations` | json | Yes | Array of independent variable values |  |
| `functional_form` | select | Yes | linear \| log_lin \| lin_log \| log_log \| reciprocal |  |

## Rules

- **linear:**
  - **model:** Y = b0 + b1 * X
  - **slope_meaning:** Unit change in Y per unit change in X
- **log_lin:**
  - **model:** ln(Y) = b0 + b1 * X
  - **slope_meaning:** Relative (percent) change in Y per unit change in X
  - **use_when:** Y grows exponentially in X (e.g., compounded returns)
  - **back_transform:** Y_hat = exp(b0_hat + b1_hat * X)
- **lin_log:**
  - **model:** Y = b0 + b1 * ln(X)
  - **slope_meaning:** Unit change in Y per percent change in X
  - **use_when:** Diminishing marginal effect of X on Y
- **log_log:**
  - **model:** ln(Y) = b0 + b1 * ln(X)
  - **slope_meaning:** Elasticity — percent change in Y per percent change in X
  - **use_when:** Both variables span wide ranges; constant elasticity expected
- **reciprocal:**
  - **model:** Y = b0 + b1 * (1/X)
  - **use_when:** Y asymptotes as X grows
- **selection_guidance:**
  - **use_r_squared:** Prefer the form with higher R^2 — but only when dependent variable is the same
  - **use_residual_plots:** Choose the form with the most random-looking residuals
  - **use_se:** Lower standard error of estimate implies better fit (same Y scale)
  - **economic_theory:** Let theory guide — elasticities -> log-log; growth -> log-lin
- **r_squared_comparability:**
  - **warning:** R^2 values are NOT comparable across models with different Y transformations — compare only within same Y scale
- **applications:**
  - **volatility_modeling:** Log-log regression of variance on option moneyness (volatility smile)
  - **earnings_to_size:** Log-log regression of earnings on market cap -> size elasticity
  - **interest_rate_level:** Log-lin regression of rate level on time -> exponential growth
  - **demand_curves:** Log-log of quantity on price -> demand elasticity
- **validation:**
  - **non_negative_for_log_y:** For log_lin/log_log, all Y > 0
  - **non_negative_for_log_x:** For lin_log/log_log, all X > 0
  - **functional_form_known:** functional_form must be one of supported values

## Outcomes

### Fit_functional_form (Priority: 1)

_Transform variables and fit linear regression in transformed space_

**Given:**
- `functional_form` (input) in `linear,log_lin,lin_log,log_log,reciprocal`
- `transform_valid` (computed) eq `true`

**Then:**
- **call_service** target: `regression_engine`
- **emit_event** event: `regression.transformed_fit_completed`

### Non_positive_values_for_log (Priority: 10) — Error: `FUNC_FORM_NON_POSITIVE`

_Log transformation requested on non-positive data_

**Given:**
- `transform_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `regression.transformed_fit_rejected`

### Invalid_functional_form (Priority: 11) — Error: `FUNC_FORM_INVALID`

_Functional form not supported_

**Given:**
- `functional_form` (input) not_in `linear,log_lin,lin_log,log_log,reciprocal`

**Then:**
- **emit_event** event: `regression.transformed_fit_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FUNC_FORM_NON_POSITIVE` | 400 | Log transformation requires all values to be strictly positive | No |
| `FUNC_FORM_INVALID` | 400 | Functional form must be one of linear, log_lin, lin_log, log_log, reciprocal | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.transformed_fit_completed` |  | `model_id`, `functional_form`, `b0_hat`, `b1_hat`, `r_squared`, `se`, `interpretation` |
| `regression.transformed_fit_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| regression-goodness-of-fit | recommended |  |
| continuously-compounded-returns | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
interpretation_cheat_sheet:
  linear: b1 unit change in Y per unit change in X
  log_lin: 100 * b1 percent change in Y per unit change in X
  lin_log: b1 / 100 unit change in Y per 1 percent change in X
  log_log: b1 percent change in Y per 1 percent change in X (elasticity)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Functional Forms Blueprint",
  "description": "Transform variables in a simple linear regression to capture non-linear relationships using log-lin, lin-log, log-log, and reciprocal functional forms. 3 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, functional-forms, log-linear, elasticity, transformations, cfa-level-1"
}
</script>
