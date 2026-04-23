---
title: "Quantiles And Location Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute quantiles (quartiles, quintiles, deciles, percentiles) and location measures such as the interquartile range and box-and-whisker summary to describe dis"
---

# Quantiles And Location Blueprint

> Compute quantiles (quartiles, quintiles, deciles, percentiles) and location measures such as the interquartile range and box-and-whisker summary to describe distribution shape

| | |
|---|---|
| **Feature** | `quantiles-and-location` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, quantiles, percentiles, quartiles, box-plot, interquartile-range, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/quantiles-and-location.blueprint.yaml) |
| **JSON API** | [quantiles-and-location.json]({{ site.baseurl }}/api/blueprints/trading/quantiles-and-location.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `statistics_engine` | Statistical Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of numeric observations |  |
| `quantile_type` | select | Yes | percentile \| quartile \| quintile \| decile \| custom |  |
| `quantile_level` | number | No | Level in (0, 100) for percentile, 1-3 for quartile, 1-4 for quintile, 1-9 for decile |  |
| `interpolation` | select | No | linear \| nearest \| lower \| higher (default linear) |  |

## Rules

- **core_formulas:**
  - **position_formula:** L_y = (n + 1) * y / 100, where y is the percentile level
  - **interpolation:** If L_y is not integer, interpolate linearly between floor and ceil positions
  - **quartile_q1:** Q1 = 25th percentile
  - **quartile_q2:** Q2 = median = 50th percentile
  - **quartile_q3:** Q3 = 75th percentile
  - **iqr:** IQR = Q3 - Q1
- **box_plot_anatomy:**
  - **box:** Spans Q1 to Q3; central line at Q2 (median)
  - **whiskers:** Extend to min and max (or to 1.5*IQR boundary)
  - **outliers:** Points beyond 1.5*IQR from Q1/Q3 typically plotted individually
- **tukey_outlier_test:**
  - **lower_inner:** Q1 - 1.5 * IQR
  - **upper_inner:** Q3 + 1.5 * IQR
  - **lower_outer:** Q1 - 3.0 * IQR
  - **upper_outer:** Q3 + 3.0 * IQR
- **applications:**
  - **risk_management:** 5th percentile ≈ historical VaR
  - **performance_quartiles:** Managers commonly ranked by quartile of peer group
  - **contract_milestones:** Percentile-based performance bonuses
- **validation:**
  - **non_empty:** observations array must be non-empty
  - **level_in_range:** 0 < level < 100 for percentile; appropriate integer ranges for others

## Outcomes

### Compute_percentile (Priority: 1)

_Arbitrary percentile_

**Given:**
- `quantile_type` (input) eq `percentile`
- `quantile_level` (input) gt `0`
- `quantile_level` (input) lt `100`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.quantile_calculated`

### Compute_quartiles (Priority: 2)

_Q1, Q2, Q3, IQR_

**Given:**
- `quantile_type` (input) eq `quartile`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.quantile_calculated`

### Compute_decile (Priority: 3)

_Decile_

**Given:**
- `quantile_type` (input) eq `decile`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.quantile_calculated`

### Invalid_level (Priority: 10) — Error: `QUANTILE_INVALID_LEVEL`

_Level out of range_

**Given:**
- ANY: `quantile_level` (input) lte `0` OR `quantile_level` (input) gte `100`

**Then:**
- **emit_event** event: `stats.quantile_rejected`

### Empty_observations (Priority: 11) — Error: `QUANTILE_EMPTY`

_Empty dataset_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `stats.quantile_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QUANTILE_INVALID_LEVEL` | 400 | Quantile level must be in (0, 100) for percentile or valid range for other types | No |
| `QUANTILE_EMPTY` | 400 | Observations array must not be empty | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stats.quantile_calculated` |  | `dataset_id`, `quantile_type`, `quantile_level`, `value`, `sample_size` |
| `stats.quantile_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| measures-of-central-tendency | recommended |  |
| measures-of-dispersion | recommended |  |

## AGI Readiness

### Goals

#### Reliable Quantiles And Location

Compute quantiles (quartiles, quintiles, deciles, percentiles) and location measures such as the interquartile range and box-and-whisker summary to describe distribution shape

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
| compute_percentile | `autonomous` | - | - |
| compute_quartiles | `autonomous` | - | - |
| compute_decile | `autonomous` | - | - |
| invalid_level | `autonomous` | - | - |
| empty_observations | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: EAA Equity Index daily returns
  q1: -0.00487
  q2: 0.00043
  q3: 0.00583
  iqr: 0.0107
  p10: -0.00876
  p90: 0.00921
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Quantiles And Location Blueprint",
  "description": "Compute quantiles (quartiles, quintiles, deciles, percentiles) and location measures such as the interquartile range and box-and-whisker summary to describe dis",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, quantiles, percentiles, quartiles, box-plot, interquartile-range, cfa-level-1"
}
</script>
