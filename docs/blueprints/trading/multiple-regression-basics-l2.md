---
title: "Multiple Regression Basics L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Multiple linear regression — formulate model with multiple independent variables, interpret coefficients and intercept, and validate the six classical OLS assum"
---

# Multiple Regression Basics L2 Blueprint

> Multiple linear regression — formulate model with multiple independent variables, interpret coefficients and intercept, and validate the six classical OLS assumptions

| | |
|---|---|
| **Feature** | `multiple-regression-basics-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quant, multiple-regression, ols, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/multiple-regression-basics-l2.blueprint.yaml) |
| **JSON API** | [multiple-regression-basics-l2.json]({{ site.baseurl }}/api/blueprints/trading/multiple-regression-basics-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_engine_l2` | Multiple Regression Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model identifier |  |
| `dependent_variable` | text | Yes | Y variable name |  |
| `independent_variables` | json | Yes | Array of X variable names |  |

## Rules

- **model_form:**
  - **equation:** Y_i = b0 + b1*X1_i + b2*X2_i + ... + bk*Xk_i + e_i
  - **coefficient_interpretation:** Slope b_j = expected change in Y for one-unit change in X_j holding all other Xs constant
- **six_assumptions:**
  - **linearity:** Relationship between Y and Xs is linear in coefficients
  - **independence:** Independent variables are not random and no exact linear relation between two or more Xs
  - **homoskedasticity:** Variance of residuals is constant across observations
  - **independence_of_errors:** Residuals are uncorrelated across observations
  - **normality:** Residuals are normally distributed
  - **no_multicollinearity:** Independent variables are not perfectly correlated
- **uses:**
  - **explanation:** Identify which Xs explain Y
  - **forecasting:** Predict Y from new X values
  - **estimation:** Quantify economic relationships
- **validation:**
  - **model_required:** model_id present
  - **variables_required:** dependent_variable and independent_variables present

## Outcomes

### Fit_mlr (Priority: 1)

_Fit multiple linear regression model_

**Given:**
- `model_id` (input) exists
- `dependent_variable` (input) exists
- `independent_variables` (input) exists

**Then:**
- **call_service** target: `regression_engine_l2`
- **emit_event** event: `mlr.fitted`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MLR_MISSING_INPUTS` | 400 | model_id, dependent_variable and independent_variables required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mlr.fitted` |  | `model_id`, `coefficients`, `r_squared`, `adjusted_r_squared`, `n_observations` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| simple-linear-regression-ols | required |  |
| regression-assumptions | required |  |
| multiple-regression-evaluation-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multiple Regression Basics L2 Blueprint",
  "description": "Multiple linear regression — formulate model with multiple independent variables, interpret coefficients and intercept, and validate the six classical OLS assum",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quant, multiple-regression, ols, cfa-level-2"
}
</script>
