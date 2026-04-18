---
title: "Multiple Regression Evaluation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate MLR fit using R-squared, adjusted R-squared, AIC, BIC, F-test for joint hypotheses, and generate forecasts with prediction intervals. 2 fields. 2 outco"
---

# Multiple Regression Evaluation L2 Blueprint

> Evaluate MLR fit using R-squared, adjusted R-squared, AIC, BIC, F-test for joint hypotheses, and generate forecasts with prediction intervals

| | |
|---|---|
| **Feature** | `multiple-regression-evaluation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quant, mlr-evaluation, goodness-of-fit, f-test, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/multiple-regression-evaluation-l2.blueprint.yaml) |
| **JSON API** | [multiple-regression-evaluation-l2.json]({{ site.baseurl }}/api/blueprints/trading/multiple-regression-evaluation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `mlr_evaluator` | MLR Fit Evaluator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model identifier |  |
| `hypothesis_type` | select | Yes | single \| joint \| nested |  |

## Rules

- **goodness_of_fit:**
  - **r_squared:** SSR/SST = 1 - SSE/SST; always increases when adding regressors
  - **adjusted_r_squared:** 1 - [(n-1)/(n-k-1)] * (1 - R²); penalises adding non-informative regressors
  - **aic:** n*ln(SSE/n) + 2k; lower is better; rewards parsimony
  - **bic:** n*ln(SSE/n) + k*ln(n); stricter penalty than AIC for large samples
- **joint_hypothesis_tests:**
  - **f_test_statistic:** F = [(SSR_R - SSR_UR)/q] / [SSR_UR/(n-k-1)]
  - **nested_models:** Compare unrestricted model to restricted model with q coefficients set to zero
  - **general_linear_f:** F = (R²/k) / [(1-R²)/(n-k-1)] tests all slopes simultaneously zero
- **forecasting:**
  - **point_forecast:** Plug X values into fitted equation
  - **prediction_interval:** ŷ ± t_critical * SE(forecast); accounts for both regression uncertainty and residual variance
- **validation:**
  - **model_required:** model_id present
  - **valid_hypothesis:** hypothesis_type in [single, joint, nested]

## Outcomes

### Evaluate_mlr (Priority: 1)

_Evaluate MLR goodness of fit and joint hypotheses_

**Given:**
- `model_id` (input) exists
- `hypothesis_type` (input) in `single,joint,nested`

**Then:**
- **call_service** target: `mlr_evaluator`
- **emit_event** event: `mlr.evaluated`

### Invalid_hypothesis (Priority: 10) — Error: `MLR_EVAL_INVALID_HYPOTHESIS`

_Unsupported hypothesis type_

**Given:**
- `hypothesis_type` (input) not_in `single,joint,nested`

**Then:**
- **emit_event** event: `mlr.evaluation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MLR_EVAL_INVALID_HYPOTHESIS` | 400 | hypothesis_type must be single, joint, or nested | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mlr.evaluated` |  | `model_id`, `r_squared`, `adjusted_r_squared`, `aic`, `bic`, `f_statistic`, `p_value` |
| `mlr.evaluation_rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multiple-regression-basics-l2 | required |  |
| regression-goodness-of-fit | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multiple Regression Evaluation L2 Blueprint",
  "description": "Evaluate MLR fit using R-squared, adjusted R-squared, AIC, BIC, F-test for joint hypotheses, and generate forecasts with prediction intervals. 2 fields. 2 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quant, mlr-evaluation, goodness-of-fit, f-test, cfa-level-2"
}
</script>
