---
title: "Central Limit Theorem Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the Central Limit Theorem — the sampling distribution of the sample mean is approximately normal with mean mu and variance sigma^2 / n for large n, regard"
---

# Central Limit Theorem Blueprint

> Apply the Central Limit Theorem — the sampling distribution of the sample mean is approximately normal with mean mu and variance sigma^2 / n for large n, regardless of population shape

| | |
|---|---|
| **Feature** | `central-limit-theorem` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, clt, central-limit-theorem, sampling-distribution, standard-error, inference, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/central-limit-theorem.blueprint.yaml) |
| **JSON API** | [central-limit-theorem.json]({{ site.baseurl }}/api/blueprints/trading/central-limit-theorem.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sample_mean` | number | No | Observed sample mean x_bar |  |
| `sample_std_dev` | number | No | Sample standard deviation s |  |
| `population_std_dev` | number | No | Population standard deviation sigma (if known) |  |
| `sample_size` | number | Yes | n - sample size |  |
| `compute` | select | No | standard_error \| sampling_distribution \| z_statistic \| confidence_interval |  |

## Rules

- **core_theorem:**
  - **statement:** Given population with mean mu and finite variance sigma^2, the sampling distribution of X_bar from random samples of size n is approximately Normal(mu, sigma^2 / n) for large n
  - **distributional_assumption:** No distributional assumption on the population — only finite variance
  - **large_n_threshold:** Typically n >= 30 is considered sufficient for CLT to apply (convention, not theorem)
- **sampling_distribution_properties:**
  - **mean_of_sample_mean:** E(X_bar) = mu (unbiased)
  - **variance_of_sample_mean:** Var(X_bar) = sigma^2 / n
  - **standard_error:** SE(X_bar) = sigma / sqrt(n) — known sigma; s / sqrt(n) when estimated
  - **convergence_rate:** Standard error shrinks as 1/sqrt(n); halving error requires 4x sample size
- **implications:**
  - **consistent_estimator:** X_bar converges to mu as n -> infinity
  - **normal_approximation:** Allows z-statistic inference for large n even if population is non-normal
  - **finite_variance_caveat:** CLT fails if population variance is infinite (e.g., Cauchy distribution)
- **z_statistic:**
  - **known_sigma:** Z = (X_bar - mu) / (sigma / sqrt(n)) ~ N(0, 1)
  - **unknown_sigma_large_n:** Z_approx = (X_bar - mu) / (s / sqrt(n)) ~ N(0, 1) when n is large
- **investment_applications:**
  - **return_forecasting:** Average realized return has SE = sigma / sqrt(T); tighter for longer history
  - **performance_attribution:** Test whether manager alpha differs from zero
  - **risk_factor_testing:** Large-sample inference on factor premia
- **validation:**
  - **sample_size_large_enough:** n >= 30 for reliable CLT approximation; smaller n requires known normality
  - **variance_finite:** Population must have finite variance
  - **independence:** Observations must be independent (or at least uncorrelated)

## Outcomes

### Compute_standard_error (Priority: 1)

_SE = sigma/sqrt(n) or s/sqrt(n)_

**Given:**
- `sample_size` (input) exists
- ANY: `sample_std_dev` (input) exists OR `population_std_dev` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.standard_error_calculated`

### Apply_clt_approximation (Priority: 2)

_Construct sampling distribution under CLT_

**Given:**
- `sample_size` (input) gte `30`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.clt_applied`

### Small_sample_warning (Priority: 3)

_n < 30 — CLT may not hold; flag for t-distribution or distributional check_

**Given:**
- `sample_size` (input) lt `30`

**Then:**
- **emit_event** event: `inference.small_sample_warned`

### Insufficient_sample (Priority: 10) — Error: `CLT_INSUFFICIENT_SAMPLE`

_n < 2 — sampling distribution undefined_

**Given:**
- `sample_size` (input) lt `2`

**Then:**
- **emit_event** event: `inference.clt_rejected`

### Missing_inputs (Priority: 11) — Error: `CLT_MISSING_INPUTS`

_Required inputs missing_

**Given:**
- `sample_size` (input) not_exists

**Then:**
- **emit_event** event: `inference.clt_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CLT_INSUFFICIENT_SAMPLE` | 400 | Sample size must be at least 2 for the CLT to be applicable | No |
| `CLT_MISSING_INPUTS` | 400 | Sample size is required; std dev (population or sample) needed for standard error | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.standard_error_calculated` |  | `sample_id`, `standard_error`, `sample_size`, `std_dev_source` |
| `inference.clt_applied` |  | `sample_id`, `sample_mean`, `standard_error`, `sampling_distribution_mean`, `sampling_distribution_variance` |
| `inference.small_sample_warned` |  | `sample_id`, `sample_size`, `warning` |
| `inference.clt_rejected` |  | `sample_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| standard-error-sample-mean | recommended |  |
| sampling-methods | recommended |  |
| bootstrap-resampling | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  population_mean: 0.08
  population_std_dev: 0.2
  sample_size: 100
  standard_error: 0.20 / sqrt(100) = 0.02
  interpretation: Sample mean is approximately Normal(0.08, 0.02^2); 95% CI
    half-width ~ 1.96 * 0.02 = 3.92%
convergence_illustration:
  n_30: SE = 0.0365
  n_100: SE = 0.0200
  n_400: SE = 0.0100
  rule: To halve SE, quadruple n
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Central Limit Theorem Blueprint",
  "description": "Apply the Central Limit Theorem — the sampling distribution of the sample mean is approximately normal with mean mu and variance sigma^2 / n for large n, regard",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, clt, central-limit-theorem, sampling-distribution, standard-error, inference, cfa-level-1"
}
</script>
