---
title: "Arithmetic Mean Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the arithmetic mean return of a return series — the simple average of periodic returns, used as an estimator of expected single-period return. 3 fields."
---

# Arithmetic Mean Return Blueprint

> Compute the arithmetic mean return of a return series — the simple average of periodic returns, used as an estimator of expected single-period return

| | |
|---|---|
| **Feature** | `arithmetic-mean-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, mean-return, cfa-level-1, performance, statistics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/arithmetic-mean-return.blueprint.yaml) |
| **JSON API** | [arithmetic-mean-return.json]({{ site.baseurl }}/api/blueprints/trading/arithmetic-mean-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `analyst` | Investment Analyst | human |  |
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `returns` | json | Yes | Array of periodic returns (decimals, e.g., [0.05, -0.02, 0.03]) |  |
| `return_frequency` | select | No | Frequency of observations (daily, monthly, quarterly, annual) |  |
| `data_quality_flags` | json | No | Optional per-observation flags (e.g., adjusted, synthetic, stale) |  |

## Rules

- **core_formula:**
  - **arithmetic_mean:** R_bar = (1/T) * sum(R_t) for t = 1..T
  - **equal_weighting:** Each observation is weighted equally at 1/T
- **properties:**
  - **unbiased_estimator:** Under i.i.d. assumption, arithmetic mean is unbiased estimator of single-period expected return
  - **upward_bias_multiperiod:** Overstates compound growth over multiple periods; use geometric mean for compound growth
  - **sensitivity_to_outliers:** Highly sensitive to extreme values; consider trimmed or winsorized mean for robustness
- **appropriate_use:**
  - **forward_looking:** Use arithmetic mean when estimating expected return for a single future period
  - **sample_size:** Requires T >= 1; statistical reliability improves with larger T
- **validation:**
  - **non_empty:** returns array must contain at least 1 observation
  - **numeric:** All entries must be finite numbers; reject NaN/Infinity
  - **reasonable_bounds:** Flag entries < -1.0 for long positions (loss > 100% impossible without leverage)

## Outcomes

### Compute_mean (Priority: 1)

_Calculate arithmetic mean when inputs valid_

**Given:**
- `returns` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.arithmetic_mean_calculated`

### Empty_returns (Priority: 10) — Error: `MEAN_EMPTY_RETURNS`

_Returns array missing or empty_

**Given:**
- ANY: `returns` (input) not_exists

**Then:**
- **emit_event** event: `return.mean_rejected`

### Invalid_return_value (Priority: 11) — Error: `MEAN_INVALID_OBSERVATION`

_Contains non-finite value (NaN, Infinity)_

**Given:**
- `returns` (input) exists

**Then:**
- **emit_event** event: `return.mean_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MEAN_EMPTY_RETURNS` | 400 | Returns array must contain at least one observation | No |
| `MEAN_INVALID_OBSERVATION` | 400 | Returns must be finite numeric values | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.arithmetic_mean_calculated` |  | `series_id`, `arithmetic_mean`, `observation_count`, `frequency` |
| `return.mean_rejected` |  | `series_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| geometric-mean-return | recommended |  |
| harmonic-mean-return | recommended |  |
| annualized-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  inputs:
    returns:
      - 0.15
      - -0.05
      - 0.1
      - 0.2
      - -0.1
  computation: (0.15 - 0.05 + 0.10 + 0.20 - 0.10) / 5 = 0.06
  arithmetic_mean: 0.06
  interpretation: 6% simple average per period
relationship_to_other_means:
  inequality: Arithmetic Mean >= Geometric Mean >= Harmonic Mean (when all values positive)
  equality_condition: Equality holds only when all observations are identical
numerical_precision:
  decimal_places: 6
  rounding_mode: half_even
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Arithmetic Mean Return Blueprint",
  "description": "Compute the arithmetic mean return of a return series — the simple average of periodic returns, used as an estimator of expected single-period return. 3 fields.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, mean-return, cfa-level-1, performance, statistics"
}
</script>
