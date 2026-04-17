---
title: "Fixed Income Present Value Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the present value of a fixed-income instrument (discount bond, coupon bond, level-payment/annuity loan) given its promised cash flows and market discoun"
---

# Fixed Income Present Value Blueprint

> Compute the present value of a fixed-income instrument (discount bond, coupon bond, level-payment/annuity loan) given its promised cash flows and market discount rate

| | |
|---|---|
| **Feature** | `fixed-income-present-value` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, fixed-income, bond-pricing, present-value, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-present-value.blueprint.yaml) |
| **JSON API** | [fixed-income-present-value.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-present-value.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Fixed-Income Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_type` | select | Yes | discount \| coupon \| level_payment (annuity) \| perpetuity |  |
| `face_value` | number | No | Face / par value (FV) — required for discount and coupon bonds |  |
| `coupon_payment` | number | No | Periodic coupon PMT — required for coupon bonds |  |
| `level_payment` | number | No | Level periodic payment A — required for level-payment loans |  |
| `periods` | number | No | Number of compounding periods t (integer) — not required for perpetuity |  |
| `discount_rate` | number | Yes | Market discount rate per period (decimal) |  |
| `periodicity` | select | No | annual \| semiannual \| quarterly \| monthly (default annual) |  |
| `compounding` | select | No | discrete \| continuous (default discrete) |  |

## Rules

- **core_formulas:**
  - **future_to_present_discrete:** PV = FV / (1 + r)^t
  - **future_to_present_continuous:** PV = FV * e^(-r*t)
  - **discount_bond:** PV = FV / (1 + r)^t
  - **coupon_bond:** PV = sum_{i=1..N}[ PMT / (1+r)^i ] + FV / (1+r)^N
  - **level_payment_loan:** PV = A * [1 - (1+r)^(-t)] / r
  - **perpetuity:** PV = PMT / r
  - **growing_perpetuity:** PV = PMT1 / (r - g), requires r > g
- **periodicity_adjustment:**
  - **rule:** Periodic rate = annual_ytm / periods_per_year; number of periods = years * periods_per_year
  - **example:** 5% semi-annual YTM, 4-year bond: r_period = 0.025, t = 8
- **price_yield_inverse:**
  - **principle:** Bond price and YTM move inversely; higher r reduces PV
- **premium_discount_par:**
  - **par:** PV = FV when coupon rate = market discount rate
  - **premium:** PV > FV when coupon rate > market discount rate
  - **discount:** PV < FV when coupon rate < market discount rate
- **accretion_pull_to_par:**
  - **rule:** If interest rate is positive, PV accretes toward FV as time passes (t → 0)
- **validation:**
  - **non_negative_face:** face_value >= 0
  - **positive_periods:** periods > 0 (except perpetuity)
  - **rate_above_negative_one:** discount_rate > -1
  - **perpetuity_positive_rate:** discount_rate > 0 for perpetuity (else PV unbounded)

## Outcomes

### Price_discount_bond (Priority: 1)

_Discount (zero-coupon) bond present value_

**Given:**
- `bond_type` (input) eq `discount`
- `face_value` (input) gt `0`
- `periods` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_pv_calculated`

### Price_coupon_bond (Priority: 2)

_Coupon bond present value_

**Given:**
- `bond_type` (input) eq `coupon`
- `coupon_payment` (input) gte `0`
- `periods` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_pv_calculated`

### Price_level_payment (Priority: 3)

_Level-payment (amortising) loan present value_

**Given:**
- `bond_type` (input) eq `level_payment`
- `level_payment` (input) gt `0`
- `periods` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_pv_calculated`

### Price_perpetuity (Priority: 4)

_Perpetuity present value_

**Given:**
- `bond_type` (input) eq `perpetuity`
- `coupon_payment` (input) gt `0`
- `discount_rate` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_pv_calculated`

### Invalid_rate (Priority: 10) — Error: `FI_PV_INVALID_RATE`

_Discount rate <= -100%_

**Given:**
- `discount_rate` (input) lte `-1`

**Then:**
- **emit_event** event: `pricing.fi_pv_rejected`

### Missing_inputs (Priority: 11) — Error: `FI_PV_MISSING_INPUTS`

_Required inputs missing for bond type_

**Given:**
- ANY: `bond_type` (input) not_exists OR `discount_rate` (input) not_exists

**Then:**
- **emit_event** event: `pricing.fi_pv_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_PV_INVALID_RATE` | 400 | Discount rate must be greater than -100% | No |
| `FI_PV_MISSING_INPUTS` | 400 | Bond type and discount rate are required | No |
| `FI_PV_INVALID_BOND_TYPE` | 400 | Unknown bond_type; must be discount, coupon, level_payment, or perpetuity | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.fi_pv_calculated` |  | `instrument_id`, `bond_type`, `face_value`, `coupon_payment`, `periods`, `discount_rate`, `present_value` |
| `pricing.fi_pv_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-present-value | recommended |  |
| implied-return-fixed-income | recommended |  |
| holding-period-return | recommended |  |
| bond-pricing-models | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_discount:
  scenario: Indian government STRIP, FV INR100, YTM 6.70%, t=20
  computation: 100 / 1.067^20 = 27.33
  pv: 27.33
worked_example_coupon:
  scenario: EUR100 par, 2% annual coupon, 5 years, r=2%
  pv: 100
  interpretation: Priced at par when coupon = discount rate
worked_example_level_payment:
  scenario: 30-year mortgage, PV=USD200k, annual r=5.25%, monthly payments (t=360)
  periodic_rate: 0.004375
  A_formula: A = PV * r / [1 - (1+r)^(-t)]
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Present Value Blueprint",
  "description": "Compute the present value of a fixed-income instrument (discount bond, coupon bond, level-payment/annuity loan) given its promised cash flows and market discoun",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, fixed-income, bond-pricing, present-value, cfa-level-1"
}
</script>
