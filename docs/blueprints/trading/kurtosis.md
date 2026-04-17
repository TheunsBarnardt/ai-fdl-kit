---
title: "Kurtosis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute kurtosis — the standardised fourth central moment — measuring the combined weight of the tails of a return distribution relative to its centre. 3 fields"
---

# Kurtosis Blueprint

> Compute kurtosis — the standardised fourth central moment — measuring the combined weight of the tails of a return distribution relative to its centre

| | |
|---|---|
| **Feature** | `kurtosis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, kurtosis, excess-kurtosis, tail-risk, fat-tails, leptokurtic, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/kurtosis.blueprint.yaml) |
| **JSON API** | [kurtosis.json]({{ site.baseurl }}/api/blueprints/trading/kurtosis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `statistics_engine` | Statistical Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of numeric observations (returns) |  |
| `population_or_sample` | select | No | sample (default) \| population |  |
| `report_excess` | boolean | No | Return excess kurtosis (= K - 3) rather than raw K (default true) |  |

## Rules

- **core_formula:**
  - **sample_kurtosis:** K_s = [ n(n+1) / ((n-1)(n-2)(n-3)) ] * sum( (X_i - X_bar)^4 / s^4 ) - [ 3(n-1)^2 / ((n-2)(n-3)) ]
  - **raw_kurtosis:** K = (1/n) * sum( (X_i - X_bar)^4 ) / s^4
  - **excess_kurtosis:** K_E = K - 3 (normal distribution has K=3, K_E=0)
- **interpretation:**
  - **mesokurtic:** K_E ≈ 0 — normal-like tails
  - **leptokurtic:** K_E > 0 — fat tails, higher peak; more extreme events than normal
  - **platykurtic:** K_E < 0 — thin tails, flatter peak; fewer extreme events than normal
  - **thresholds:**
    - **significant:** K_E > 1.0 is economically meaningful; K_E > 3.0 is substantial
- **market_realities:**
  - **equity_returns:** Daily equity returns are strongly leptokurtic (K_E often 3-10)
  - **monthly_returns:** Monthly returns less fat-tailed due to aggregation (central limit effect)
  - **hedge_funds:** Many strategies exhibit both negative skew AND high kurtosis
- **practical_implications:**
  - **normal_var_understates_tail:** Using normal VaR with leptokurtic data underestimates tail loss probability
  - **risk_management:** Fat tails motivate CVaR, extreme value theory, stress testing
  - **options_pricing:** Black-Scholes assumes normality; empirical kurtosis → volatility smile/skew
- **validation:**
  - **minimum_sample:** n >= 4 for sample kurtosis (formula denominators (n-2)(n-3))
  - **non_zero_std_dev:** s > 0

## Outcomes

### Compute_sample_kurtosis (Priority: 1)

_Sample (excess) kurtosis_

**Given:**
- `observations` (input) exists
- `sample_size` (computed) gte `4`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.kurtosis_calculated`

### Compute_population_kurtosis (Priority: 2)

_Population kurtosis_

**Given:**
- `population_or_sample` (input) eq `population`

**Then:**
- **call_service** target: `statistics_engine`
- **emit_event** event: `stats.kurtosis_calculated`

### Insufficient_sample (Priority: 10) — Error: `KURTOSIS_INSUFFICIENT_SAMPLE`

_Fewer than 4 observations_

**Given:**
- `sample_size` (computed) lt `4`

**Then:**
- **emit_event** event: `stats.kurtosis_rejected`

### Constant_series (Priority: 11) — Error: `KURTOSIS_UNDEFINED`

_Standard deviation is zero_

**Given:**
- `std_dev` (computed) eq `0`

**Then:**
- **emit_event** event: `stats.kurtosis_rejected`

### Empty_observations (Priority: 12) — Error: `KURTOSIS_EMPTY`

_Empty dataset_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `stats.kurtosis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `KURTOSIS_EMPTY` | 400 | Observations array must not be empty | No |
| `KURTOSIS_INSUFFICIENT_SAMPLE` | 400 | Sample kurtosis requires at least 4 observations | No |
| `KURTOSIS_UNDEFINED` | 422 | Kurtosis is undefined when standard deviation is zero | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stats.kurtosis_calculated` |  | `dataset_id`, `kurtosis`, `excess_kurtosis`, `sample_size`, `interpretation` |
| `stats.kurtosis_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| measures-of-dispersion | recommended |  |
| skewness | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: EAA Equity Index daily returns
  kurtosis: 5.63
  excess_kurtosis: 2.63
  interpretation: Leptokurtic — fat tails; normal model understates tail risk
asset_class_typical_kurtosis:
  - asset: US equity daily
    typical_excess_K: 3-6
    note: strongly leptokurtic
  - asset: US equity monthly
    typical_excess_K: 1-2
    note: thinner tails
  - asset: Treasury returns
    typical_excess_K: 0-1
    note: near-normal
  - asset: HF monthly returns
    typical_excess_K: 2-8
    note: extreme tail risk
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Kurtosis Blueprint",
  "description": "Compute kurtosis — the standardised fourth central moment — measuring the combined weight of the tails of a return distribution relative to its centre. 3 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, kurtosis, excess-kurtosis, tail-risk, fat-tails, leptokurtic, cfa-level-1"
}
</script>
