---
title: "Measures Of Central Tendency Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute measures of central tendency — arithmetic mean, weighted mean, median, mode, trimmed mean, and winsorized mean — to summarise where a return distributio"
---

# Measures Of Central Tendency Blueprint

> Compute measures of central tendency — arithmetic mean, weighted mean, median, mode, trimmed mean, and winsorized mean — to summarise where a return distribution is centred

| | |
|---|---|
| **Feature** | `measures-of-central-tendency` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, central-tendency, mean, median, mode, trimmed-mean, winsorized-mean, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/measures-of-central-tendency.blueprint.yaml) |
| **JSON API** | [measures-of-central-tendency.json]({{ site.baseurl }}/api/blueprints/trading/measures-of-central-tendency.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `statistics_engine` | Statistical Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of numeric observations (returns or values) |  |
| `measure` | select | Yes | mean \| weighted_mean \| median \| mode \| trimmed_mean \| winsorized_mean |  |
| `weights` | json | No | Array of weights for weighted_mean (must match length and sum to 1) |  |
| `trim_percentage` | number | No | Percentage trimmed from each tail for trimmed_mean (e.g., 0.025 = 5% trimmed) |  |
| `winsorize_percentage` | number | No | Percentage winsorized from each tail for winsorized_mean |  |

## Rules

- **core_formulas:**
  - **sample_mean:** X_bar = (1/n) * sum(X_i)
  - **population_mean:** mu = (1/N) * sum(X_i)
  - **weighted_mean:** X_bar_w = sum(w_i * X_i), where sum(w_i) = 1
  - **median_odd_n:** Middle value after sorting when n is odd
  - **median_even_n:** Average of two middle values when n is even
  - **mode:** Most frequently occurring value; may be unimodal, bimodal, or multimodal
  - **trimmed_mean:** Arithmetic mean after removing lowest and highest p% of observations
  - **winsorized_mean:** Arithmetic mean after replacing lowest p% with p-th percentile and highest p% with (100-p)-th percentile
- **properties:**
  - **mean_deviations_sum_to_zero:** sum(X_i - X_bar) = 0
  - **median_minimises_MAD:** Median minimises sum of absolute deviations
  - **mean_minimises_SSD:** Mean minimises sum of squared deviations
- **when_to_use:**
  - **arithmetic_mean:** Symmetric distributions; default measure when outliers are not a concern
  - **weighted_mean:** Portfolio returns where weights represent asset allocation
  - **median:** Skewed distributions; robust to outliers (e.g., CEO pay, home prices)
  - **mode:** Categorical/nominal data or identifying most common outcome
  - **trimmed_mean:** Distributions with suspected data errors in tails
  - **winsorized_mean:** Capping tail values without discarding observations
- **validation:**
  - **non_empty:** observations array must be non-empty
  - **weights_match_length:** weights array length equals observations length
  - **weights_sum_to_one:** |sum(weights) - 1| < 1e-8 tolerance
  - **trim_range:** 0 < trim_percentage < 0.5

## Outcomes

### Compute_mean (Priority: 1)

_Arithmetic mean_

**Given:**
- `measure` (input) eq `mean`
- `observations` (input) exists

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Compute_weighted_mean (Priority: 2)

_Weighted mean_

**Given:**
- `measure` (input) eq `weighted_mean`
- `weights` (input) exists

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Compute_median (Priority: 3)

_Median_

**Given:**
- `measure` (input) eq `median`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Compute_mode (Priority: 4)

_Mode (may be multimodal)_

**Given:**
- `measure` (input) eq `mode`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Compute_trimmed (Priority: 5)

_Trimmed mean_

**Given:**
- `measure` (input) eq `trimmed_mean`
- `trim_percentage` (input) gt `0`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Compute_winsorized (Priority: 6)

_Winsorized mean_

**Given:**
- `measure` (input) eq `winsorized_mean`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.central_tendency_calculated`

### Empty_observations (Priority: 10) — Error: `CENTRAL_TENDENCY_EMPTY`

_Empty observations_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `stats.central_tendency_rejected`

### Invalid_weights (Priority: 11) — Error: `CENTRAL_TENDENCY_INVALID_WEIGHTS`

_Weights do not sum to 1 or wrong length_

**Given:**
- `weights_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `stats.central_tendency_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CENTRAL_TENDENCY_EMPTY` | 400 | Observations array must not be empty | No |
| `CENTRAL_TENDENCY_INVALID_WEIGHTS` | 400 | Weights must match observations length and sum to 1 | No |
| `CENTRAL_TENDENCY_INVALID_TRIM` | 400 | Trim/winsorize percentage must be in (0, 0.5) | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stats.central_tendency_calculated` |  | `dataset_id`, `measure`, `value`, `sample_size` |
| `stats.central_tendency_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arithmetic-mean-return | recommended |  |
| geometric-mean-return | recommended |  |
| quantiles-and-location | recommended |  |
| measures-of-dispersion | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: EAA Equity Index daily returns, n=1259; arithmetic mean vs trimmed vs
    winsorized
  arithmetic_mean: 0.0004
  trimmed_mean_5pct: 0.0006
  winsorized_mean_5pct: 0.0005
  interpretation: Trimmed and winsorized means higher than arithmetic mean → left-skewed tail
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Measures Of Central Tendency Blueprint",
  "description": "Compute measures of central tendency — arithmetic mean, weighted mean, median, mode, trimmed mean, and winsorized mean — to summarise where a return distributio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, central-tendency, mean, median, mode, trimmed-mean, winsorized-mean, cfa-level-1"
}
</script>
