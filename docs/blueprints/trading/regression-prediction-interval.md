---
title: "Regression Prediction Interval Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Generate point forecasts and prediction intervals for a new observation of Y given a value of X using an estimated simple linear regression. 8 fields. 3 outcome"
---

# Regression Prediction Interval Blueprint

> Generate point forecasts and prediction intervals for a new observation of Y given a value of X using an estimated simple linear regression

| | |
|---|---|
| **Feature** | `regression-prediction-interval` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, regression, prediction, forecast, prediction-interval, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-prediction-interval.blueprint.yaml) |
| **JSON API** | [regression-prediction-interval.json]({{ site.baseurl }}/api/blueprints/trading/regression-prediction-interval.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine` | Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `b0_hat` | number | Yes | Estimated intercept |  |
| `b1_hat` | number | Yes | Estimated slope |  |
| `x_new` | number | Yes | Value of X at which to forecast Y |  |
| `standard_error_estimate` | number | Yes | se — residual standard error from fit |  |
| `sample_size` | number | Yes | n |  |
| `x_mean` | number | Yes | Sample mean of X |  |
| `x_variance` | number | Yes | Sample variance of X (s_X^2) |  |
| `significance_level` | number | No | alpha (default 0.05) |  |

## Rules

- **point_forecast:**
  - **formula:** Y_hat_new = b0_hat + b1_hat * X_new
- **forecast_standard_error:**
  - **formula:** SE(Y_hat_new) = se * sqrt(1 + 1/n + (X_new - X_bar)^2 / ((n - 1) * s_X^2))
  - **interpretation:** Uncertainty widens as X_new moves away from X_bar — 'fan' shape
- **prediction_interval:**
  - **formula:** Y_hat_new +/- t_{alpha/2, n-2} * SE(Y_hat_new)
  - **contrast_with_confidence_interval:** Prediction interval includes both coefficient uncertainty AND residual noise; CI on mean response uses sqrt(1/n + ...) only
- **interpretation:**
  - **width_drivers:** Wider at extreme X, smaller n, larger residual variance
  - **extrapolation_caution:** Forecasting well outside observed X range inflates interval and assumes linearity continues
- **applications:**
  - **return_forecast:** Given next-period CAPEX guidance, forecast ROA with interval
  - **earnings_forecast:** Forecast EPS given sales growth assumption
  - **capm_return_forecast:** Forecast asset return given expected market return
  - **stress_testing:** Forecast loan-default rate given hypothetical GDP shock
- **validation:**
  - **positive_se:** se > 0
  - **positive_x_variance:** x_variance > 0
  - **valid_n:** n > 2
  - **valid_alpha:** 0 < alpha < 1

## Outcomes

### Compute_forecast (Priority: 1)

_Point forecast + prediction interval_

**Given:**
- `x_new` (input) exists
- `b0_hat` (input) exists
- `b1_hat` (input) exists
- `standard_error_estimate` (input) gt `0`
- `sample_size` (input) gt `2`

**Then:**
- **call_service** target: `regression_engine`
- **emit_event** event: `regression.forecast_completed`

### Extrapolation_warning (Priority: 5)

_X_new is far outside observed X range_

**Given:**
- `extrapolation_detected` (computed) eq `true`

**Then:**
- **emit_event** event: `regression.forecast_warning`

### Invalid_inputs (Priority: 10) — Error: `FORECAST_INPUT_INVALID`

_Missing or invalid required inputs_

**Given:**
- ANY: `standard_error_estimate` (input) lte `0` OR `sample_size` (input) lte `2` OR `x_variance` (input) lte `0`

**Then:**
- **emit_event** event: `regression.forecast_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FORECAST_INPUT_INVALID` | 400 | Forecast requires positive se, n > 2, and positive X variance | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression.forecast_completed` |  | `forecast_id`, `y_hat_new`, `prediction_interval`, `forecast_se`, `degrees_of_freedom` |
| `regression.forecast_warning` |  | `forecast_id`, `warning_message` |
| `regression.forecast_rejected` |  | `forecast_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| regression-goodness-of-fit | required |  |
| regression-assumptions | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  b0_hat: 4.875
  b1_hat: 1.25
  x_new: 8
  x_bar: 6.1
  y_hat_new: 14.875
  se: 2.617
  n: 6
  s_X_squared: 24.02
  forecast_se: 2.617 * sqrt(1 + 1/6 + (8 - 6.1)^2 / (5 * 24.02)) = approximately 2.872
  critical_t_0_025: 2.776
  prediction_interval: "[14.875 - 7.974, 14.875 + 7.974] = [6.90, 22.85]"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Prediction Interval Blueprint",
  "description": "Generate point forecasts and prediction intervals for a new observation of Y given a value of X using an estimated simple linear regression. 8 fields. 3 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, regression, prediction, forecast, prediction-interval, cfa-level-1"
}
</script>
