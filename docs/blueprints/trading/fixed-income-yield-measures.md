---
title: "Fixed Income Yield Measures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute yield measures — YTM, current yield, yield to call, yield to worst, discount yield, bond-equivalent yield — and convert between quoting conventions. 3 f"
---

# Fixed Income Yield Measures Blueprint

> Compute yield measures — YTM, current yield, yield to call, yield to worst, discount yield, bond-equivalent yield — and convert between quoting conventions

| | |
|---|---|
| **Feature** | `fixed-income-yield-measures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, ytm, yield-to-call, yield-to-worst, current-yield, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-yield-measures.blueprint.yaml) |
| **JSON API** | [fixed-income-yield-measures.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-yield-measures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `yield_engine` | Yield Measure Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `yield_measure` | select | Yes | ytm \| ytc \| ytw \| current \| discount \| bey |  |
| `periods_per_year` | number | No | Coupon periods per year |  |

## Rules

- **ytm:**
  - **definition:** IRR of bond cash flows held to maturity
  - **assumptions:** Held to maturity, coupons reinvested at YTM, no default, no call
- **current_yield:**
  - **formula:** Annual coupon / flat price
  - **use:** Quick read; ignores capital gain/loss
- **ytc_ytp:**
  - **ytc:** IRR to call date and call price
  - **ytp:** IRR to put date and put price
  - **ytw:** Min of YTM and all YTC/YTP scenarios
- **money_market_yields:**
  - **discount_yield:** (Face - Price)/Face * 360/days
  - **money_market_yield:** (Face - Price)/Price * 360/days
  - **bey:** Money market yield * 365/360 adjusted to semi-annual bond basis
- **conversion:**
  - **semi_to_annual:** (1 + r/2)^2 - 1
  - **annual_to_semi:** 2 * ((1+r)^0.5 - 1)
- **floater_yields:**
  - **discount_margin:** Spread that equates PV to price
  - **quoted_margin:** Contractual spread over reference
- **validation:**
  - **bond_required:** bond_id present
  - **valid_measure:** yield_measure in allowed set

## Outcomes

### Compute_yield (Priority: 1)

_Compute specified yield measure_

**Given:**
- `bond_id` (input) exists
- `yield_measure` (input) in `ytm,ytc,ytw,current,discount,bey`

**Then:**
- **call_service** target: `yield_engine`
- **emit_event** event: `yield.computed`

### Invalid_measure (Priority: 10) — Error: `YIELD_INVALID_MEASURE`

_Unsupported yield measure_

**Given:**
- `yield_measure` (input) not_in `ytm,ytc,ytw,current,discount,bey`

**Then:**
- **emit_event** event: `yield.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `YIELD_INVALID_MEASURE` | 400 | yield_measure must be one of the supported measures | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `yield.computed` |  | `computation_id`, `bond_id`, `measure`, `value` |
| `yield.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-bond-pricing | required |  |
| fixed-income-yield-spreads | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Yield Measures Blueprint",
  "description": "Compute yield measures — YTM, current yield, yield to call, yield to worst, discount yield, bond-equivalent yield — and convert between quoting conventions. 3 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, ytm, yield-to-call, yield-to-worst, current-yield, cfa-level-1"
}
</script>
