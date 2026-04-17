---
title: "Alt Investments Ownership Compensation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Describe limited-partnership structures, management fees, incentive fees, hurdle rates, high-water marks, clawbacks, and distribution waterfalls used in alterna"
---

# Alt Investments Ownership Compensation Blueprint

> Describe limited-partnership structures, management fees, incentive fees, hurdle rates, high-water marks, clawbacks, and distribution waterfalls used in alternative funds

| | |
|---|---|
| **Feature** | `alt-investments-ownership-compensation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternatives, fee-structure, gp-lp, waterfall, carried-interest, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/alt-investments-ownership-compensation.blueprint.yaml) |
| **JSON API** | [alt-investments-ownership-compensation.json]({{ site.baseurl }}/api/blueprints/trading/alt-investments-ownership-compensation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fee_engine` | Alt Fund Fee Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fee_calc_id` | text | Yes | Fee calc identifier |  |
| `management_fee_rate` | number | Yes | Management fee (decimal annual) |  |
| `incentive_fee_rate` | number | Yes | Performance fee rate (decimal) |  |
| `hurdle_rate` | number | No | Hurdle rate (decimal, may be zero) |  |
| `waterfall_type` | select | Yes | american \| european |  |

## Rules

- **limited_partnership:**
  - **gp:** General partner manages the fund, unlimited liability
  - **lps:** Limited partners provide capital, liability capped at commitment
- **management_fees:**
  - **typical:** 1.5%-2% of committed or invested capital
  - **post_investment_period:** May step down to invested-only basis
- **incentive_fees:**
  - **typical:** 20% of profits above hurdle
  - **catch_up:** GP receives 100% of returns above hurdle until catch-up achieved
- **hurdle_rate:**
  - **hard_hurdle:** Fee only on returns above hurdle
  - **soft_hurdle:** Once hurdle met, fee on all profits
- **high_water_mark:**
  - **rule:** Incentive fees only charged on new highs; losses must be recovered first
- **clawback:**
  - **rule:** GP returns excess carry if later performance disappoints
- **waterfalls:**
  - **european:** Whole-of-fund — LPs get all committed capital plus hurdle before GP carry
  - **american:** Deal-by-deal — GP collects carry on each profitable exit
- **validation:**
  - **calc_required:** fee_calc_id present
  - **valid_waterfall:** waterfall_type in [american, european]
  - **non_negative_rates:** management_fee_rate >= 0 and incentive_fee_rate >= 0

## Outcomes

### Compute_fees (Priority: 1)

_Compute management and incentive fees with waterfall_

**Given:**
- `fee_calc_id` (input) exists
- `waterfall_type` (input) in `american,european`
- `management_fee_rate` (input) gte `0`

**Then:**
- **call_service** target: `fee_engine`
- **emit_event** event: `alt.fees_computed`

### Invalid_waterfall (Priority: 10) — Error: `FEE_INVALID_WATERFALL`

_Unknown waterfall type_

**Given:**
- `waterfall_type` (input) not_in `american,european`

**Then:**
- **emit_event** event: `alt.fee_calc_rejected`

### Invalid_rates (Priority: 11) — Error: `FEE_INVALID_RATES`

_Negative fee rates_

**Given:**
- ANY: `management_fee_rate` (input) lt `0` OR `incentive_fee_rate` (input) lt `0`

**Then:**
- **emit_event** event: `alt.fee_calc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FEE_INVALID_WATERFALL` | 400 | waterfall_type must be american or european | No |
| `FEE_INVALID_RATES` | 400 | fee rates must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alt.fees_computed` |  | `fee_calc_id`, `gross_return`, `net_return`, `gp_carry`, `lp_distributions` |
| `alt.fee_calc_rejected` |  | `fee_calc_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-features-categories | required |  |
| alt-investments-methods | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Alt Investments Ownership Compensation Blueprint",
  "description": "Describe limited-partnership structures, management fees, incentive fees, hurdle rates, high-water marks, clawbacks, and distribution waterfalls used in alterna",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternatives, fee-structure, gp-lp, waterfall, carried-interest, cfa-level-1"
}
</script>
