---
title: "Standard Error Sample Mean Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the standard error of the sample mean — the dispersion of the sampling distribution — using known or estimated population standard deviation divided by "
---

# Standard Error Sample Mean Blueprint

> Compute the standard error of the sample mean — the dispersion of the sampling distribution — using known or estimated population standard deviation divided by the square root of the sample size

| | |
|---|---|
| **Feature** | `standard-error-sample-mean` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, standard-error, sampling-distribution, inference, sample-mean, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-error-sample-mean.blueprint.yaml) |
| **JSON API** | [standard-error-sample-mean.json]({{ site.baseurl }}/api/blueprints/trading/standard-error-sample-mean.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `population_std_dev` | number | No | sigma - population standard deviation (if known) |  |
| `sample_std_dev` | number | No | s - sample standard deviation (Bessel-corrected, used when sigma unknown) |  |
| `sample_size` | number | Yes | n - number of observations in the sample |  |

## Rules

- **core_formulas:**
  - **known_sigma:** SE(X_bar) = sigma / sqrt(n)
  - **unknown_sigma:** SE_hat(X_bar) = s / sqrt(n), where s^2 = sum((X_i - X_bar)^2) / (n - 1)
- **distinctions:**
  - **standard_deviation_vs_error:**
    - **std_dev:** Dispersion of INDIVIDUAL observations around the population mean
    - **std_error:** Dispersion of the SAMPLE MEAN around the population mean
  - **ratio:** SE = sigma / sqrt(n); SE is always smaller than sigma for n > 1
- **convergence_properties:**
  - **sqrt_n_shrinkage:** SE halves when n quadruples
  - **consistency:** As n -> infinity, SE -> 0 and X_bar -> mu
- **when_to_use_which:**
  - **known_sigma:** Rare in practice; applies when population parameters are pre-specified (e.g., by theoretical model)
  - **unknown_sigma:** Standard case; use s instead of sigma. For small n, use t-distribution instead of z
- **applications:**
  - **confidence_intervals:** X_bar +/- z_alpha/2 * SE(X_bar) for large n with known sigma
  - **hypothesis_tests:** t = (X_bar - mu_0) / SE(X_bar)
  - **precision_reporting:** Research papers report SE alongside point estimate
  - **power_analysis:** Required n for target precision: n = (sigma * z / margin)^2
- **validation:**
  - **sample_size_positive:** n >= 2 (n = 1 gives undefined or zero SE)
  - **std_dev_non_negative:** Both sigma and s must be >= 0
  - **at_least_one_std_dev:** Either population_std_dev or sample_std_dev must be provided

## Outcomes

### Compute_known_sigma (Priority: 1)

_SE = sigma / sqrt(n)_

**Given:**
- `population_std_dev` (input) exists
- `sample_size` (input) gte `2`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.standard_error_calculated`

### Compute_estimated (Priority: 2)

_SE_hat = s / sqrt(n)_

**Given:**
- `sample_std_dev` (input) exists
- `sample_size` (input) gte `2`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.standard_error_calculated`

### Insufficient_sample (Priority: 10) — Error: `SE_INSUFFICIENT_SAMPLE`

_n < 2 — SE undefined_

**Given:**
- `sample_size` (input) lt `2`

**Then:**
- **emit_event** event: `inference.standard_error_rejected`

### Missing_std_dev (Priority: 11) — Error: `SE_MISSING_STDDEV`

_Neither population nor sample std dev provided_

**Given:**
- ALL: `population_std_dev` (input) not_exists AND `sample_std_dev` (input) not_exists

**Then:**
- **emit_event** event: `inference.standard_error_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SE_INSUFFICIENT_SAMPLE` | 400 | Sample size must be at least 2 | No |
| `SE_MISSING_STDDEV` | 400 | Either population or sample standard deviation is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.standard_error_calculated` |  | `sample_id`, `standard_error`, `sample_size`, `std_dev_source` |
| `inference.standard_error_rejected` |  | `sample_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| central-limit-theorem | required |  |
| measures-of-dispersion | required |  |
| sampling-methods | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  sample_std_dev: 0.15
  sample_size: 36
  standard_error: 0.15 / sqrt(36) = 0.025
  interpretation: Sample mean return has estimated SE of 2.5 percentage points
power_analysis:
  target_margin: 0.01
  known_sigma: 0.2
  z_95: 1.96
  required_n: n = (1.96 * 0.20 / 0.01)^2 = 1537
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Error Sample Mean Blueprint",
  "description": "Compute the standard error of the sample mean — the dispersion of the sampling distribution — using known or estimated population standard deviation divided by ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, standard-error, sampling-distribution, inference, sample-mean, cfa-level-1"
}
</script>
