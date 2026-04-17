---
title: "Harmonic Mean Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the harmonic mean — used specifically for averaging ratios such as cost-per-share under dollar-cost averaging (DCA). 2 fields. 3 outcomes. 2 error codes"
---

# Harmonic Mean Return Blueprint

> Compute the harmonic mean — used specifically for averaging ratios such as cost-per-share under dollar-cost averaging (DCA)

| | |
|---|---|
| **Feature** | `harmonic-mean-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, mean, harmonic, dollar-cost-averaging, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/harmonic-mean-return.blueprint.yaml) |
| **JSON API** | [harmonic-mean-return.json]({{ site.baseurl }}/api/blueprints/trading/harmonic-mean-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `values` | json | Yes | Array of strictly positive values (e.g., prices paid per share in each purchase) |  |
| `application` | select | No | Application context (dca_average_cost, pe_ratio_averaging, other) |  |

## Rules

- **core_formula:**
  - **harmonic_mean:** H = T / sum(1/x_t) for t=1..T
- **properties:**
  - **inequality:** Harmonic Mean <= Geometric Mean <= Arithmetic Mean (all positive values)
  - **equality:** All three equal only when all x_t identical
- **dca_application:**
  - **description:** When an investor buys a fixed dollar amount each period at varying prices, the average cost per share equals the harmonic mean of the purchase prices
  - **formula:** average_cost_per_share = T / sum(1/P_t)
- **domain_constraints:**
  - **strictly_positive:** All x_t must be > 0; zero or negative values make the harmonic mean undefined
- **appropriate_use:**
  - **ratio_averaging:** Use when averaging rates/ratios where numerators are constant across periods
  - **not_for_returns:** Do NOT use harmonic mean directly on return series — use arithmetic or geometric mean

## Outcomes

### Compute_harmonic (Priority: 1)

_Calculate harmonic mean for positive input series_

**Given:**
- `values` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.harmonic_mean_calculated`

### Non_positive_value (Priority: 10) — Error: `HARMONIC_NON_POSITIVE_VALUE`

_One or more values not strictly positive_

**Given:**
- `values` (input) exists

**Then:**
- **emit_event** event: `return.harmonic_rejected`

### Empty_values (Priority: 11) — Error: `HARMONIC_EMPTY_VALUES`

_Empty array_

**Given:**
- `values` (input) not_exists

**Then:**
- **emit_event** event: `return.harmonic_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HARMONIC_NON_POSITIVE_VALUE` | 400 | Harmonic mean requires strictly positive values | No |
| `HARMONIC_EMPTY_VALUES` | 400 | Values array must contain at least one observation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.harmonic_mean_calculated` |  | `series_id`, `harmonic_mean`, `observation_count`, `application` |
| `return.harmonic_rejected` |  | `series_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arithmetic-mean-return | recommended |  |
| geometric-mean-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_dca:
  scenario: Investor buys ,000 of a stock each month at prices 10, 15, 20
  prices:
    - 10
    - 15
    - 20
  harmonic_mean: 3 / (1/10 + 1/15 + 1/20) = 3 / 0.2167 ≈ 13.85
  arithmetic_mean_comparison: 15
  interpretation: Average cost per share under DCA is 13.85, less than arithmetic
    mean of prices
relationship:
  ordering: HM <= GM <= AM for positive values
  when_to_use: >
    - Arithmetic: forecast single-period expected return

    - Geometric: realised compound growth

    - Harmonic: average of ratios with fixed numerators (DCA cost, P/E
    aggregation)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Harmonic Mean Return Blueprint",
  "description": "Compute the harmonic mean — used specifically for averaging ratios such as cost-per-share under dollar-cost averaging (DCA). 2 fields. 3 outcomes. 2 error codes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, mean, harmonic, dollar-cost-averaging, cfa-level-1"
}
</script>
