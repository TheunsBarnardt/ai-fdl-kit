---
title: "Bond Pricing Models Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Bond pricing and valuation methodologies for conventional, floating-rate, inflation-indexed bonds and MTM revaluation. 9 fields. 4 outcomes. 2 error codes. rule"
---

# Bond Pricing Models Blueprint

> Bond pricing and valuation methodologies for conventional, floating-rate, inflation-indexed bonds and MTM revaluation

| | |
|---|---|
| **Feature** | `bond-pricing-models` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | bonds, pricing, valuation, mtm, frn, inflation-indexed, yield |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bond-pricing-models.blueprint.yaml) |
| **JSON API** | [bond-pricing-models.json]({{ site.baseurl }}/api/blueprints/trading/bond-pricing-models.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `bond_trader` | Bond Trader | human |  |
| `pricing_engine` | Pricing and Valuation Engine | system |  |
| `risk_system` | Risk Management System | system |  |
| `settlement_system` | Settlement System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_isin` | text | Yes | Bond ISIN |  |
| `bond_type` | select | Yes | Bond Type (Conventional, FRN, InflationIndexed, ZeroCoupon) |  |
| `face_value` | number | Yes | Face Value |  |
| `coupon_rate` | number | No | Coupon Rate (% per annum) |  |
| `maturity_date` | date | Yes | Maturity Date |  |
| `last_coupon_date` | date | No | Last Coupon Payment Date |  |
| `market_price` | number | Yes | Market Price (% of par or absolute) |  |
| `accrued_interest` | number | No | Accrued Interest Since Last Coupon |  |
| `yield_to_maturity` | number | No | Yield To Maturity (YTM) |  |

## Rules

- **conventional_bond:**
  - **bond_math:** Price = Sum of (coupon / (1+ytm)^t) + Face Value / (1+ytm)^n
  - **accrued_interest:** Buyer pays seller accrued interest since last coupon date
  - **dirty_price:** Settlement price = clean price + accrued interest
- **floating_rate_note:**
  - **coupon_reset:** Coupon resets quarterly/semi-annually to index (JIBAR, SOFR) + spread
  - **margin_fixed:** Margin (spread) is fixed for life of bond; index component floats
  - **price_convergence:** Price converges to par on each reset date (barring credit deterioration)
- **inflation_indexed_bond:**
  - **principal_indexed:** Principal amount adjusted by inflation rate; coupon applied to indexed principal
  - **inflation_rate_source:** Inflation rate typically from CPI official publication
  - **floor_protection:** Some bonds have principal floor (no deflation loss)
- **mtm_revaluation:**
  - **daily_mtm:** Bond portfolio revalued daily at market prices (MTM=Mark To Market)
  - **curve_shift_sensitivity:** Price change ~duration * yield change (duration approximation)
  - **interest_rate_risk:** Rising rates → falling prices; falling rates → rising prices

## Outcomes

### Calculate_conventional_price (Priority: 1)

_Calculate conventional bond price from yield_

**Given:**
- `bond_type` (input) eq `conventional`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `bond.price_calculated`

### Price_frn (Priority: 2)

_Price floating-rate note (with coupon reset)_

**Given:**
- `bond_type` (input) eq `frn`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `frn.priced`

### Price_inflation_bond (Priority: 3)

_Calculate inflation-indexed bond price (principal-adjusted)_

**Given:**
- `bond_type` (input) eq `inflation_indexed`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `inflation_bond.priced`

### Mtm_revalue (Priority: 4) — Error: `MTM_CALCULATION_FAILED`

_Daily mark-to-market revaluation of bond holdings_

**Given:**
- `market_price` (input) exists

**Then:**
- **call_service** target: `risk_system`
- **emit_event** event: `mtm.revalued`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MTM_CALCULATION_FAILED` | 500 | MTM revaluation calculation failed | No |
| `INVALID_YIELD_CURVE` | 400 | Yield curve data invalid or incomplete | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bond.price_calculated` |  | `bond_isin`, `clean_price`, `dirty_price`, `yield` |
| `frn.priced` |  | `bond_isin`, `next_coupon_rate`, `next_reset_date` |
| `inflation_bond.priced` |  | `bond_isin`, `indexed_principal`, `coupon_on_indexed` |
| `mtm.revalued` |  | `bond_isin`, `market_value`, `prior_value`, `change_pct` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| post-trade-gateway-fix | recommended |  |
| reference-data-management | required |  |

## AGI Readiness

### Goals

#### Reliable Bond Pricing Models

Bond pricing and valuation methodologies for conventional, floating-rate, inflation-indexed bonds and MTM revaluation

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `reference_data_management` | reference-data-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| calculate_conventional_price | `autonomous` | - | - |
| price_frn | `autonomous` | - | - |
| price_inflation_bond | `autonomous` | - | - |
| mtm_revalue | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
pricing_models:
  conventional:
    formula: P = Sum(C/(1+y)^t) + FV/(1+y)^n
    inputs:
      - coupon
      - yield_to_maturity
      - face_value
      - years_to_maturity
    outputs:
      - clean_price
      - dirty_price
      - duration
      - convexity
    description: Standard bond pricing using discounted cash flows
  frn:
    formula: P = (Notional * (Index + Spread)) / (1 + Discount Rate)
    inputs:
      - notional
      - reference_index
      - spread
      - discount_rate
      - reset_frequency
    outputs:
      - price_at_reset
      - price_between_resets
    description: Floating rate note pricing with quarterly/semi-annual coupon reset
  inflation_indexed:
    formula: P_adj = FV * (1 + Cumulative Inflation), Coupon = Coupon Rate * P_adj
    inputs:
      - face_value
      - coupon_rate
      - inflation_rate
      - years_to_maturity
    outputs:
      - indexed_principal
      - coupon_on_indexed
      - ytm_real
      - ytm_nominal
    description: Inflation-linked bond with principal and coupon adjustments
day_count_conventions:
  - name: Actual/365
    description: Use actual days in period / 365
  - name: Actual/360
    description: Use actual days in period / 360 (money market)
  - name: 30/360
    description: Assume 30-day months, 360-day year
  - name: Actual/Actual
    description: Actual days; handle leap years
curve_data:
  - maturity: 2Y
    yield_rate: 0.025
  - maturity: 5Y
    yield_rate: 0.035
  - maturity: 10Y
    yield_rate: 0.045
  - maturity: 20Y
    yield_rate: 0.05
mtm_adjustment_triggers:
  - trigger: daily_market_close
    frequency: once_per_day
  - trigger: corporate_action
    frequency: on_event
  - trigger: rating_change
    frequency: on_event
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bond Pricing Models Blueprint",
  "description": "Bond pricing and valuation methodologies for conventional, floating-rate, inflation-indexed bonds and MTM revaluation. 9 fields. 4 outcomes. 2 error codes. rule",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bonds, pricing, valuation, mtm, frn, inflation-indexed, yield"
}
</script>
