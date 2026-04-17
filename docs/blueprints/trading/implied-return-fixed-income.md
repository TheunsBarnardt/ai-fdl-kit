---
title: "Implied Return Fixed Income Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Solve for the implied return (yield-to-maturity, YTM) of a fixed-income instrument given its current price and promised cash flows. 8 fields. 5 outcomes. 3 erro"
---

# Implied Return Fixed Income Blueprint

> Solve for the implied return (yield-to-maturity, YTM) of a fixed-income instrument given its current price and promised cash flows

| | |
|---|---|
| **Feature** | `implied-return-fixed-income` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, fixed-income, ytm, implied-return, root-finding, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/implied-return-fixed-income.blueprint.yaml) |
| **JSON API** | [implied-return-fixed-income.json]({{ site.baseurl }}/api/blueprints/trading/implied-return-fixed-income.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Fixed-Income Pricing Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_type` | select | Yes | discount \| coupon \| level_payment |  |
| `present_value` | number | Yes | Observed market price (PV) |  |
| `face_value` | number | No | Face / par value (FV) |  |
| `coupon_payment` | number | No | Periodic coupon PMT |  |
| `level_payment` | number | No | Level periodic payment |  |
| `periods` | number | Yes | Number of remaining periods |  |
| `initial_guess` | number | No | Optional starting estimate for root-finder (default 0.05) |  |
| `tolerance` | number | No | Convergence tolerance (default 1e-8) |  |

## Rules

- **core_formulas:**
  - **discount_bond_closed_form:** r = (FV / PV)^(1/t) - 1
  - **coupon_bond_solve:** Solve numerically: PV = sum_{i=1..N}[ PMT / (1+r)^i ] + FV / (1+r)^N
  - **level_payment_solve:** Solve numerically: PV = A * [1 - (1+r)^(-t)] / r
- **root_finding:**
  - **methods:** {"name":"Newton-Raphson","rationale":"Quadratic convergence; well-behaved for monotonic PV(r)"}, {"name":"bisection","rationale":"Guaranteed convergence; use when derivative unstable"}, {"name":"secant","rationale":"Derivative-free; widely used in spreadsheet RATE() implementations"}
  - **monotonicity:** PV is strictly decreasing in r — a unique positive solution exists when PV < sum of undiscounted cash flows
- **rate_conversion:**
  - **semiannual_to_annual_bey:** Bond-equivalent yield (BEY) = periodic rate * 2 (US Treasury convention)
  - **effective_annual:** EAY = (1 + periodic_rate)^periods_per_year - 1
- **interpretation:**
  - **premium_coupon_gt_ytm:** Bond priced above par → coupon rate > YTM
  - **discount_coupon_lt_ytm:** Bond priced below par → coupon rate < YTM
- **validation:**
  - **positive_pv:** present_value > 0
  - **positive_periods:** periods > 0
  - **cash_flow_sanity:** If face_value + sum(coupons) < price, no positive YTM exists

## Outcomes

### Implied_discount_yield (Priority: 1)

_Closed-form for discount bond_

**Given:**
- `bond_type` (input) eq `discount`
- `present_value` (input) gt `0`
- `face_value` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_ytm_calculated`

### Implied_coupon_yield (Priority: 2)

_Numeric solve for coupon bond_

**Given:**
- `bond_type` (input) eq `coupon`
- `present_value` (input) gt `0`
- `coupon_payment` (input) gte `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_ytm_calculated`

### Implied_level_payment_rate (Priority: 3)

_Numeric solve for amortising loan rate_

**Given:**
- `bond_type` (input) eq `level_payment`
- `level_payment` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.fi_ytm_calculated`

### Solver_non_convergence (Priority: 10) — Error: `FI_YTM_SOLVER_FAILED`

_Root finder failed to converge_

**Given:**
- `solver_status` (computed) eq `diverged`

**Then:**
- **emit_event** event: `pricing.fi_ytm_rejected`

### Invalid_inputs (Priority: 11) — Error: `FI_YTM_INVALID_INPUTS`

_Price or periods missing / invalid_

**Given:**
- ANY: `present_value` (input) lte `0` OR `periods` (input) lte `0`

**Then:**
- **emit_event** event: `pricing.fi_ytm_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_YTM_SOLVER_FAILED` | 422 | Implied yield solver failed to converge within tolerance | No |
| `FI_YTM_INVALID_INPUTS` | 400 | Price and periods must be strictly positive | No |
| `FI_YTM_NO_SOLUTION` | 422 | No real YTM exists for the given cash flows and price | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.fi_ytm_calculated` |  | `instrument_id`, `bond_type`, `present_value`, `ytm`, `iterations` |
| `pricing.fi_ytm_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-present-value | required |  |
| implied-return-implied-growth-equity | recommended |  |
| money-weighted-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_discount:
  scenario: PV = INR22.68224, FV = INR100, t = 20
  computation: (100/22.68224)^(1/20) - 1 = 0.077 = 7.70%
  ytm: 0.077
worked_example_coupon:
  scenario: PV = 93.091, FV = 100, PMT = 5, t = 5
  ytm_approx: 0.069
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Implied Return Fixed Income Blueprint",
  "description": "Solve for the implied return (yield-to-maturity, YTM) of a fixed-income instrument given its current price and promised cash flows. 8 fields. 5 outcomes. 3 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, fixed-income, ytm, implied-return, root-finding, cfa-level-1"
}
</script>
