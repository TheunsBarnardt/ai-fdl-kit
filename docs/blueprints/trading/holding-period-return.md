---
title: "Holding Period Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the holding period return (HPR) for a single investment over a specified holding period, combining price appreciation and income yield. 5 fields. 4 outc"
---

# Holding Period Return Blueprint

> Compute the holding period return (HPR) for a single investment over a specified holding period, combining price appreciation and income yield

| | |
|---|---|
| **Feature** | `holding-period-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, hpr, cfa-level-1, performance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/holding-period-return.blueprint.yaml) |
| **JSON API** | [holding-period-return.json]({{ site.baseurl }}/api/blueprints/trading/holding-period-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `analyst` | Investment Analyst | human |  |
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `beginning_price` | number | Yes | Beginning Price (P0) |  |
| `ending_price` | number | Yes | Ending Price (P1) |  |
| `income` | number | No | Cash Income Received During Period (dividends, coupons, distributions) |  |
| `holding_period_days` | number | No | Holding Period (days) — for annualization downstream |  |
| `currency` | text | No | Currency ISO Code (e.g., USD, ZAR) |  |

## Rules

- **core_formula:**
  - **hpr:** R = (P1 - P0 + I1) / P0
  - **equivalent_form:** R = (P1 + I1) / P0 - 1
  - **decomposition:** R = capital_gain_yield + income_yield where capital_gain_yield = (P1 - P0)/P0 and income_yield = I1/P0
- **sign_conventions:**
  - **positive_return:** R > 0 indicates gain
  - **negative_return:** R < 0 indicates loss
  - **total_loss:** R = -1.0 (-100%) indicates complete loss of principal
- **units:**
  - **expression:** Return expressed as decimal (0.05) and convertible to percentage (5.00%)
- **validation:**
  - **beginning_price_positive:** P0 must be > 0 — cannot compute return on zero-cost position
  - **income_nonneg:** Income I1 must be >= 0; negative income is a fee, not income
  - **ending_price_floor:** P1 must be >= 0 for long positions (bankruptcy floor)

## Outcomes

### Compute_hpr (Priority: 1)

_Calculate HPR when all inputs valid_

**Given:**
- `beginning_price` (input) gt `0`
- `ending_price` (input) gte `0`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.hpr_calculated`

### Invalid_beginning_price (Priority: 10) — Error: `HPR_INVALID_BEGINNING_PRICE`

_Beginning price missing, zero, or negative_

**Given:**
- ANY: `beginning_price` (input) not_exists OR `beginning_price` (input) lte `0`

**Then:**
- **emit_event** event: `return.hpr_rejected`

### Invalid_ending_price (Priority: 11) — Error: `HPR_INVALID_ENDING_PRICE`

_Ending price negative_

**Given:**
- `ending_price` (input) lt `0`

**Then:**
- **emit_event** event: `return.hpr_rejected`

### Invalid_income (Priority: 12) — Error: `HPR_INVALID_INCOME`

_Income value is negative_

**Given:**
- `income` (input) lt `0`

**Then:**
- **emit_event** event: `return.hpr_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HPR_INVALID_BEGINNING_PRICE` | 400 | Beginning price must be greater than zero | No |
| `HPR_INVALID_ENDING_PRICE` | 400 | Ending price cannot be negative | No |
| `HPR_INVALID_INCOME` | 400 | Income must be non-negative; fees are handled separately | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.hpr_calculated` |  | `instrument_id`, `hpr`, `capital_gain_yield`, `income_yield`, `beginning_price`, `ending_price`, `income` |
| `return.hpr_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arithmetic-mean-return | recommended |  |
| geometric-mean-return | recommended |  |
| time-weighted-return | recommended |  |
| annualized-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  inputs:
    beginning_price: 100
    ending_price: 105
    income: 2
  computation: (105 - 100 + 2) / 100 = 0.07
  hpr: 0.07
  interpretation: "7% total return: 5% capital gain + 2% income yield"
numerical_precision:
  decimal_places: 6
  rounding_mode: half_even
use_cases:
  - Single-period performance attribution
  - Building block for multi-period return chaining
  - Input to arithmetic, geometric, and harmonic mean calculations
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Holding Period Return Blueprint",
  "description": "Compute the holding period return (HPR) for a single investment over a specified holding period, combining price appreciation and income yield. 5 fields. 4 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, hpr, cfa-level-1, performance"
}
</script>
