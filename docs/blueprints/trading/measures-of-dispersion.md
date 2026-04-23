---
title: "Measures Of Dispersion Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of o"
---

# Measures Of Dispersion Blueprint

> Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of observations around their mean

| | |
|---|---|
| **Feature** | `measures-of-dispersion` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, dispersion, variance, standard-deviation, mad, coefficient-of-variation, volatility, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/measures-of-dispersion.blueprint.yaml) |
| **JSON API** | [measures-of-dispersion.json]({{ site.baseurl }}/api/blueprints/trading/measures-of-dispersion.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `statistics_engine` | Statistical Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of numeric observations |  |
| `measure` | select | Yes | range \| mad \| variance \| std_dev \| cv |  |
| `population_or_sample` | select | No | sample (default, uses n-1) \| population (uses N) |  |
| `annualise` | boolean | No | Annualise std_dev by multiplying by sqrt(periods_per_year) |  |
| `periods_per_year` | number | No | For annualisation (252 trading days, 12 months, 4 quarters) |  |

## Rules

- **core_formulas:**
  - **range:** max(X) - min(X)
  - **mad:** MAD = (1/n) * sum(|X_i - X_bar|)
  - **sample_variance:** s^2 = (1/(n-1)) * sum((X_i - X_bar)^2)
  - **population_variance:** sigma^2 = (1/N) * sum((X_i - mu)^2)
  - **sample_std_dev:** s = sqrt(s^2)
  - **coefficient_of_variation:** CV = s / X_bar
  - **annualisation:** sigma_annual = sigma_period * sqrt(periods_per_year)
- **bessel_correction:**
  - **rule:** Sample variance uses n-1 (Bessel's correction) to produce an unbiased estimator; population variance uses N
  - **why:** Using n biases variance downward because X_bar is itself estimated from the sample
- **properties:**
  - **units:**
    - **variance:** Square of the data units (e.g., return² )
    - **std_dev:** Same units as the data (e.g., decimal return)
    - **mad:** Same units as the data
    - **cv:** Unit-free (scale-invariant)
  - **relationships:**
    - **sd_gte_mad:** Standard deviation >= MAD for any dataset
    - **cv_comparison:** CV allows comparison of dispersion across different-magnitude datasets
- **applications:**
  - **volatility:** Annualised standard deviation is the industry-standard volatility measure
  - **risk_adjusted_return:** CV of returns compares risk per unit of return; lower = more efficient
- **validation:**
  - **non_empty:** observations array must be non-empty
  - **sufficient_for_sample:** n >= 2 for sample variance (n-1 denominator)
  - **cv_mean_nonzero:** Mean must be non-zero (and typically positive) for CV to be meaningful

## Outcomes

### Compute_range (Priority: 1)

_Range_

**Given:**
- `measure` (input) eq `range`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.dispersion_calculated`

### Compute_mad (Priority: 2)

_Mean absolute deviation_

**Given:**
- `measure` (input) eq `mad`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.dispersion_calculated`

### Compute_variance (Priority: 3)

_Variance (sample or population)_

**Given:**
- `measure` (input) eq `variance`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.dispersion_calculated`

### Compute_std_dev (Priority: 4)

_Standard deviation (optionally annualised)_

**Given:**
- `measure` (input) eq `std_dev`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.dispersion_calculated`

### Compute_cv (Priority: 5)

_Coefficient of variation_

**Given:**
- `measure` (input) eq `cv`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.dispersion_calculated`

### Insufficient_sample (Priority: 10) — Error: `DISPERSION_INSUFFICIENT_SAMPLE`

_Fewer than 2 observations for sample variance_

**Given:**
- ALL: `measure` (input) in `variance,std_dev` AND `sample_size` (computed) lt `2`

**Then:**
- **emit_event** event: `stats.dispersion_rejected`

### Cv_mean_zero (Priority: 11) — Error: `DISPERSION_CV_MEAN_ZERO`

_CV undefined when mean is zero_

**Given:**
- ALL: `measure` (input) eq `cv` AND `mean` (computed) eq `0`

**Then:**
- **emit_event** event: `stats.dispersion_rejected`

### Empty_observations (Priority: 12) — Error: `DISPERSION_EMPTY`

_Empty dataset_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `stats.dispersion_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISPERSION_EMPTY` | 400 | Observations array must not be empty | No |
| `DISPERSION_INSUFFICIENT_SAMPLE` | 400 | Sample variance requires at least 2 observations | No |
| `DISPERSION_CV_MEAN_ZERO` | 422 | Coefficient of variation is undefined when the mean is zero | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stats.dispersion_calculated` |  | `dataset_id`, `measure`, `value`, `sample_size`, `annualised` |
| `stats.dispersion_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| measures-of-central-tendency | recommended |  |
| target-downside-deviation | recommended |  |
| skewness | recommended |  |
| kurtosis | recommended |  |

## AGI Readiness

### Goals

#### Reliable Measures Of Dispersion

Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of observations around their mean

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_range | `autonomous` | - | - |
| compute_mad | `autonomous` | - | - |
| compute_variance | `autonomous` | - | - |
| compute_std_dev | `autonomous` | - | - |
| compute_cv | `autonomous` | - | - |
| insufficient_sample | `autonomous` | - | - |
| cv_mean_zero | `autonomous` | - | - |
| empty_observations | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Monthly returns of a fund
  mean: 0.012
  sample_variance: 0.0009
  sample_std_dev: 0.03
  annualised_std_dev: 0.1039
  coefficient_of_variation: 2.5
scale_comparison:
  note: CV allows comparing dispersion of equity volatility (30%) vs short-term
    Treasury rate volatility (2%) on a like-for-like basis
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Measures Of Dispersion Blueprint",
  "description": "Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, dispersion, variance, standard-deviation, mad, coefficient-of-variation, volatility, cfa-level-1"
}
</script>
