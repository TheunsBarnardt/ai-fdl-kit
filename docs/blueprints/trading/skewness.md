---
title: "Skewness Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute skewness — the standardised third central moment — measuring the asymmetry of a return distribution around its mean. 2 fields. 5 outcomes. 3 error codes"
---

# Skewness Blueprint

> Compute skewness — the standardised third central moment — measuring the asymmetry of a return distribution around its mean

| | |
|---|---|
| **Feature** | `skewness` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, skewness, higher-moments, distribution-shape, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/skewness.blueprint.yaml) |
| **JSON API** | [skewness.json]({{ site.baseurl }}/api/blueprints/trading/skewness.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `statistics_engine` | Statistical Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of numeric observations (returns) |  |
| `population_or_sample` | select | No | sample (default) \| population |  |

## Rules

- **core_formula:**
  - **sample_skewness:** S_k = [ n / ((n-1)(n-2)) ] * sum( (X_i - X_bar)^3 ) / s^3
  - **population_skewness:** gamma_1 = (1/N) * sum( (X_i - mu)^3 ) / sigma^3
  - **large_n_approximation:** S_k ≈ (1/n) * sum( (X_i - X_bar)^3 ) / s^3 for large n
- **interpretation:**
  - **zero:** Symmetric distribution (normal-like)
  - **positive:** Right tail longer; mean > median > mode; frequent small losses, occasional large gains
  - **negative:** Left tail longer; mean < median < mode; frequent small gains, occasional large losses
  - **threshold_of_significance:** |S_k| > 0.5 is generally considered economically meaningful; > 1.0 is substantial
- **return_distribution_implications:**
  - **equities:** Daily equity returns are typically negatively skewed (crash risk)
  - **hedge_funds:** Many hedge fund strategies exhibit negative skew (short vol, merger arb)
  - **lottery_ticket_assets:** OOTM options, venture capital — positive skew
- **empirical_relations:**
  - **mean_median_mode:**
    - **positive_skew:** Mean > Median > Mode (approximate relation)
    - **negative_skew:** Mean < Median < Mode (approximate relation)
  - **normal_baseline:** Normal distribution has S_k = 0
- **validation:**
  - **minimum_sample:** n >= 3 for sample skewness (denominators (n-1)(n-2))
  - **non_zero_std_dev:** s > 0 (skewness undefined for constant series)

## Outcomes

### Compute_sample_skewness (Priority: 1)

_Sample skewness_

**Given:**
- `observations` (input) exists
- `sample_size` (computed) gte `3`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.skewness_calculated`

### Compute_population_skewness (Priority: 2)

_Population skewness_

**Given:**
- `population_or_sample` (input) eq `population`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.skewness_calculated`

### Insufficient_sample (Priority: 10) — Error: `SKEWNESS_INSUFFICIENT_SAMPLE`

_Fewer than 3 observations_

**Given:**
- `sample_size` (computed) lt `3`

**Then:**
- **emit_event** event: `stats.skewness_rejected`

### Constant_series (Priority: 11) — Error: `SKEWNESS_UNDEFINED`

_Standard deviation is zero_

**Given:**
- `std_dev` (computed) eq `0`

**Then:**
- **emit_event** event: `stats.skewness_rejected`

### Empty_observations (Priority: 12) — Error: `SKEWNESS_EMPTY`

_Empty dataset_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `stats.skewness_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SKEWNESS_EMPTY` | 400 | Observations array must not be empty | No |
| `SKEWNESS_INSUFFICIENT_SAMPLE` | 400 | Sample skewness requires at least 3 observations | No |
| `SKEWNESS_UNDEFINED` | 422 | Skewness is undefined when standard deviation is zero | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stats.skewness_calculated` |  | `dataset_id`, `skewness`, `sample_size`, `interpretation` |
| `stats.skewness_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| measures-of-dispersion | recommended |  |
| kurtosis | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: EAA Equity Index daily returns
  skewness: -0.54
  interpretation: Negative skew — frequent small gains and occasional large losses (crash risk)
asset_class_typical_skew:
  - asset: US equity daily
    typical_skew: -0.5
    note: crash risk
  - asset: US equity monthly
    typical_skew: -0.3
    note: less pronounced
  - asset: long OOTM calls
    typical_skew: "+2.0"
    note: lottery-like payoff
  - asset: merger arbitrage
    typical_skew: -1.5
    note: deal-break risk
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Skewness Blueprint",
  "description": "Compute skewness — the standardised third central moment — measuring the asymmetry of a return distribution around its mean. 2 fields. 5 outcomes. 3 error codes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, skewness, higher-moments, distribution-shape, cfa-level-1"
}
</script>
