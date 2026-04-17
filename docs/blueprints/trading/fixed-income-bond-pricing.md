---
title: "Fixed Income Bond Pricing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price bonds using discounted cash flow with spot or constant-yield discounting, reconcile full (dirty) vs flat (clean) price via accrued interest, and explain p"
---

# Fixed Income Bond Pricing Blueprint

> Price bonds using discounted cash flow with spot or constant-yield discounting, reconcile full (dirty) vs flat (clean) price via accrued interest, and explain price-yield relationships

| | |
|---|---|
| **Feature** | `fixed-income-bond-pricing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, bond-pricing, present-value, accrued-interest, clean-dirty-price, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-bond-pricing.blueprint.yaml) |
| **JSON API** | [fixed-income-bond-pricing.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-bond-pricing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_pricer` | Fixed-Income Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `coupon_rate` | number | Yes | Annual coupon rate (decimal) |  |
| `ytm` | number | Yes | Yield to maturity (decimal) |  |
| `years_to_maturity` | number | Yes | Years to maturity |  |
| `periods_per_year` | number | No | Coupon periods per year (default 2) |  |

## Rules

- **bond_price_formula:**
  - **constant_yield:** Price = sum(Coupon/(1+r/m)^t) + Face/(1+r/m)^n
  - **spot_rate:** Price = sum(Coupon/(1+z_t)^t) + Face/(1+z_n)^n
- **price_yield_relationship:**
  - **inverse:** Yield up -> price down
  - **convex:** Price-yield curve bows above tangent line (positive convexity)
  - **par:** Coupon = market rate -> price = par
  - **premium:** Coupon > market -> price > par
  - **discount:** Coupon < market -> price < par
- **full_vs_flat:**
  - **full_price:** PV as of settlement date including accrued
  - **flat_price:** Full price - accrued interest (quoted price)
  - **accrued_interest:** Coupon * (days since last coupon / days in period)
- **matrix_pricing:**
  - **definition:** Infer yield for infrequently traded bond from comparable liquid bonds
  - **use_case:** Benchmark spreads and new-issue pricing
- **day_count_conventions:**
  - **actual_actual:** Treasuries — true days / true days
  - **thirty_360:** Corporate / muni — 30-day months
  - **actual_360:** Money market — true days / 360
- **validation:**
  - **bond_required:** bond_id present
  - **valid_ytm:** ytm >= 0
  - **positive_maturity:** years_to_maturity > 0

## Outcomes

### Price_bond (Priority: 1)

_Compute full and flat price from cash flows and yield_

**Given:**
- `bond_id` (input) exists
- `ytm` (input) gte `0`
- `years_to_maturity` (input) gt `0`

**Then:**
- **call_service** target: `fi_pricer`
- **emit_event** event: `bond.priced`

### Invalid_maturity (Priority: 10) — Error: `PRICE_INVALID_MATURITY`

_Non-positive maturity_

**Given:**
- `years_to_maturity` (input) lte `0`

**Then:**
- **emit_event** event: `bond.pricing_rejected`

### Invalid_ytm (Priority: 11) — Error: `PRICE_INVALID_YTM`

_Negative YTM_

**Given:**
- `ytm` (input) lt `0`

**Then:**
- **emit_event** event: `bond.pricing_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRICE_INVALID_MATURITY` | 400 | years_to_maturity must be positive | No |
| `PRICE_INVALID_YTM` | 400 | ytm must be non-negative | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bond.priced` |  | `pricing_id`, `bond_id`, `full_price`, `flat_price`, `accrued_interest` |
| `bond.pricing_rejected` |  | `pricing_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-yield-measures | required |  |
| fixed-income-spot-forward-rates | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Bond Pricing Blueprint",
  "description": "Price bonds using discounted cash flow with spot or constant-yield discounting, reconcile full (dirty) vs flat (clean) price via accrued interest, and explain p",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, bond-pricing, present-value, accrued-interest, clean-dirty-price, cfa-level-1"
}
</script>
