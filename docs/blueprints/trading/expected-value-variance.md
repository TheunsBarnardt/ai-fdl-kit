---
title: "Expected Value Variance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the expected value, variance, and standard deviation of a discrete random variable — probability-weighted summaries used in forecasting and risk measure"
---

# Expected Value Variance Blueprint

> Compute the expected value, variance, and standard deviation of a discrete random variable — probability-weighted summaries used in forecasting and risk measurement

| | |
|---|---|
| **Feature** | `expected-value-variance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, probability, expected-value, variance, random-variable, forecasting, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/expected-value-variance.blueprint.yaml) |
| **JSON API** | [expected-value-variance.json]({{ site.baseurl }}/api/blueprints/trading/expected-value-variance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `probability_engine` | Probability / Forecasting Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `outcomes` | json | Yes | Array of {value, probability} pairs defining the discrete distribution |  |
| `variable_type` | select | No | discrete (default) \| continuous |  |
| `compute` | select | No | expected_value \| variance \| std_dev \| all (default all) |  |

## Rules

- **core_formulas:**
  - **expected_value:** E(X) = sum_{i=1..n}[ P(X_i) * X_i ]
  - **variance:** Var(X) = E[(X - E(X))^2] = sum_{i=1..n}[ P(X_i) * (X_i - E(X))^2 ]
  - **std_dev:** sigma(X) = sqrt(Var(X))
  - **computational_variance:** Var(X) = E(X^2) - [E(X)]^2
- **probability_axioms:**
  - **non_negative:** P(X_i) >= 0 for all i
  - **sum_to_one:** sum(P(X_i)) = 1
- **interpretation:**
  - **expected_value:** Probability-weighted forecast; 'best single-number' estimate of X
  - **variance:** Measure of dispersion in squared units of X; zero means X is deterministic
  - **std_dev:** Dispersion in same units as X; interpretable as 'typical' deviation from E(X)
- **contrast_with_sample:**
  - **expected_value_vs_sample_mean:** E(X) is forward-looking (population parameter); sample mean is historical average
  - **equal_weights_vs_probability_weights:** Sample mean weights observations equally; E(X) weights by probability
- **applications:**
  - **eps_forecasting:** Probability-weighted EPS across scenarios produces the point forecast
  - **scenario_analysis:** Compute E(return), sigma(return) under weighted bull/base/bear outcomes
  - **capital_budgeting:** Expected NPV under uncertain cash flow outcomes
- **validation:**
  - **non_empty:** outcomes array must be non-empty
  - **non_negative_probabilities:** All probabilities >= 0
  - **sum_to_one:** |sum(probabilities) - 1| <= 1e-8 tolerance

## Outcomes

### Compute_all (Priority: 1)

_Compute E(X), Var(X), sigma(X)_

**Given:**
- `outcomes` (input) exists
- `probabilities_valid` (computed) eq `true`

**Then:**
- **call_service** target: `probability_engine`
- **emit_event** event: `probability.moments_calculated`

### Probabilities_dont_sum (Priority: 10) — Error: `EV_PROB_NOT_SUM_ONE`

_Probabilities do not sum to 1 within tolerance_

**Given:**
- `probabilities_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `probability.moments_rejected`

### Negative_probability (Priority: 11) — Error: `EV_NEGATIVE_PROBABILITY`

_A probability is negative_

**Given:**
- `min_probability` (computed) lt `0`

**Then:**
- **emit_event** event: `probability.moments_rejected`

### Empty_outcomes (Priority: 12) — Error: `EV_EMPTY`

_Outcomes empty or missing_

**Given:**
- `outcomes` (input) not_exists

**Then:**
- **emit_event** event: `probability.moments_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EV_EMPTY` | 400 | Outcomes array must not be empty | No |
| `EV_PROB_NOT_SUM_ONE` | 400 | Probabilities must sum to 1 within tolerance | No |
| `EV_NEGATIVE_PROBABILITY` | 400 | Probabilities must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `probability.moments_calculated` |  | `dataset_id`, `expected_value`, `variance`, `std_dev`, `outcome_count` |
| `probability.moments_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arithmetic-mean-return | recommended |  |
| measures-of-dispersion | recommended |  |
| probability-tree-conditional-expectation | recommended |  |
| bayes-formula | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Discrete EPS distribution
  outcomes:
    - probability: 0.15
      value: 2.6
    - probability: 0.45
      value: 2.45
    - probability: 0.24
      value: 2.2
    - probability: 0.16
      value: 2
  expected_value: 2.3405
  variance: 0.0369
  std_dev: 0.192
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Expected Value Variance Blueprint",
  "description": "Compute the expected value, variance, and standard deviation of a discrete random variable — probability-weighted summaries used in forecasting and risk measure",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, probability, expected-value, variance, random-variable, forecasting, cfa-level-1"
}
</script>
