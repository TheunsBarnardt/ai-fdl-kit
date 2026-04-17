---
title: "Fixed Income Yield Spreads Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute nominal, G-, I-, Z-, and option-adjusted spreads to isolate credit, liquidity, and optionality components of yield relative to a risk-free benchmark. 4 "
---

# Fixed Income Yield Spreads Blueprint

> Compute nominal, G-, I-, Z-, and option-adjusted spreads to isolate credit, liquidity, and optionality components of yield relative to a risk-free benchmark

| | |
|---|---|
| **Feature** | `fixed-income-yield-spreads` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, yield-spread, g-spread, z-spread, oas, swap-spread, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-yield-spreads.blueprint.yaml) |
| **JSON API** | [fixed-income-yield-spreads.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-yield-spreads.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `spread_engine` | Yield Spread Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `spread_type` | select | Yes | nominal \| g \| i \| z \| oas \| swap |  |
| `benchmark_curve` | select | No | treasury \| swap \| sovereign |  |
| `option_features` | select | No | none \| callable \| putable \| convertible |  |

## Rules

- **spread_definitions:**
  - **nominal:** YTM(bond) - YTM(on-the-run treasury at same maturity)
  - **g_spread:** Bond YTM - interpolated treasury yield
  - **i_spread:** Bond YTM - interpolated swap rate
  - **z_spread:** Constant spread added to spot curve so PV equals price
  - **oas:** Z-spread minus option cost; isolates credit/liquidity
  - **swap_spread:** Swap rate - treasury yield at same tenor
- **when_to_use:**
  - **nominal:** Quick comparison; not rigorous
  - **g_spread:** Corporate bonds vs treasury curve
  - **z_spread:** More accurate for unusual coupons
  - **oas:** Required for callable / putable / MBS
  - **swap_spread:** Bank and financial sector benchmarking
- **interpretation:**
  - **credit_component:** Compensation for default risk
  - **liquidity_component:** Premium for bid-ask and market impact
  - **optionality_component:** Value of embedded option to issuer/holder
- **spread_duration:**
  - **definition:** Sensitivity of price to spread change
  - **use:** Isolate credit risk from rate risk
- **validation:**
  - **bond_required:** bond_id present
  - **valid_spread:** spread_type in allowed set

## Outcomes

### Compute_spread (Priority: 1)

_Compute requested spread for the bond_

**Given:**
- `bond_id` (input) exists
- `spread_type` (input) in `nominal,g,i,z,oas,swap`

**Then:**
- **call_service** target: `spread_engine`
- **emit_event** event: `spread.computed`

### Invalid_spread (Priority: 10) — Error: `SPREAD_INVALID_TYPE`

_Unsupported spread_

**Given:**
- `spread_type` (input) not_in `nominal,g,i,z,oas,swap`

**Then:**
- **emit_event** event: `spread.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SPREAD_INVALID_TYPE` | 400 | spread_type must be nominal, g, i, z, oas, or swap | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `spread.computed` |  | `computation_id`, `bond_id`, `spread_type`, `value_bps` |
| `spread.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-spot-forward-rates | required |  |
| fixed-income-credit-risk-spreads | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Yield Spreads Blueprint",
  "description": "Compute nominal, G-, I-, Z-, and option-adjusted spreads to isolate credit, liquidity, and optionality components of yield relative to a risk-free benchmark. 4 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, yield-spread, g-spread, z-spread, oas, swap-spread, cfa-level-1"
}
</script>
