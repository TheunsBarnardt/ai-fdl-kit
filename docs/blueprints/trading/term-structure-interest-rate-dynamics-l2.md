---
title: "Term Structure Interest Rate Dynamics L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse term structure — spot, forward, par yields, swap curve, traditional theories (expectations, liquidity, segmented, preferred habitat), yield curve factor"
---

# Term Structure Interest Rate Dynamics L2 Blueprint

> Analyse term structure — spot, forward, par yields, swap curve, traditional theories (expectations, liquidity, segmented, preferred habitat), yield curve factor models, key rate duration

| | |
|---|---|
| **Feature** | `term-structure-interest-rate-dynamics-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, term-structure, yield-curve, swap-rate, key-rate-duration, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/term-structure-interest-rate-dynamics-l2.blueprint.yaml) |
| **JSON API** | [term-structure-interest-rate-dynamics-l2.json]({{ site.baseurl }}/api/blueprints/trading/term-structure-interest-rate-dynamics-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `yield_curve_analyst` | Yield Curve Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `curve_id` | text | Yes | Curve identifier |  |
| `analysis_type` | select | Yes | spot_forward \| swap_spread \| theory \| factor_model \| key_rate_duration |  |

## Rules

- **spot_forward_relationships:**
  - **spot_rate:** Yield on zero-coupon bond maturing at time t
  - **forward_rate:** Implied future spot rate from no-arbitrage
  - **forward_rate_model:** (1+s_T)^T = (1+s_t)^t × (1+f_{t,T-t})^(T-t)
  - **ytm_relationship:** YTM is complex average of spots over coupon dates
- **yield_curve_movement:**
  - **forward_curve:** Realised future rates differ from forwards if expectations or premia change
  - **rolling_yield:** Total return = coupon + roll-down + price change
- **active_management:**
  - **riding_yield_curve:** Buy long, hold as it rolls down
  - **bullet_barbell_ladder:** Convexity vs yield trade-off
- **swap_rate_curve:**
  - **definition:** Fixed rate on par swap; benchmark vs treasuries
  - **why_used:** More liquid in many markets; reflects bank credit
  - **spread_to_treasury:** Swap spread; widened during crises
  - **quotation:** Z-spread, I-spread, OAS conventions
- **traditional_theories:**
  - **expectations:** Forward rates equal expected future spots; no premium
  - **liquidity_preference:** Forwards = expected spot + positive liquidity premium increasing with maturity
  - **segmented_markets:** Yields determined within maturity segments by supply/demand
  - **preferred_habitat:** Investors leave preferred maturity only for sufficient premium
- **yield_curve_factor_models:**
  - **level:** Parallel shifts; ~75% of variation
  - **slope:** Steepening/flattening; ~15%
  - **curvature:** Butterfly twists; ~5%
  - **factor_loadings:** Each maturity has factor sensitivity
- **yield_curve_volatility:**
  - **short_end_higher:** Short-rate volatility usually exceeds long-rate
  - **term_structure_of_volatility:** Volatility differs by maturity
- **key_rate_duration:**
  - **definition:** Sensitivity to a single key rate, holding others constant
  - **use_for_non_parallel_shift:** Decompose curve risk by maturity bucket
- **macro_drivers:**
  - **inflation_expectations:** Push nominal rates up
  - **growth_expectations:** Real rates co-move with growth
  - **fiscal_policy:** Supply effect on long end
  - **monetary_policy:** Anchors short end
- **validation:**
  - **curve_required:** curve_id present
  - **valid_analysis:** analysis_type in allowed set

## Outcomes

### Analyse_term_structure (Priority: 1)

_Perform term-structure analysis_

**Given:**
- `curve_id` (input) exists
- `analysis_type` (input) in `spot_forward,swap_spread,theory,factor_model,key_rate_duration`

**Then:**
- **call_service** target: `yield_curve_analyst`
- **emit_event** event: `term_structure.analysed`

### Invalid_analysis (Priority: 10) — Error: `TERM_STRUCTURE_INVALID_ANALYSIS`

_Unsupported analysis type_

**Given:**
- `analysis_type` (input) not_in `spot_forward,swap_spread,theory,factor_model,key_rate_duration`

**Then:**
- **emit_event** event: `term_structure.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TERM_STRUCTURE_INVALID_ANALYSIS` | 400 | analysis_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `term_structure.analysed` |  | `curve_id`, `analysis_type`, `key_outputs`, `factor_loadings` |
| `term_structure.rejected` |  | `curve_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arbitrage-free-valuation-framework-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Term Structure Interest Rate Dynamics L2 Blueprint",
  "description": "Analyse term structure — spot, forward, par yields, swap curve, traditional theories (expectations, liquidity, segmented, preferred habitat), yield curve factor",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, term-structure, yield-curve, swap-rate, key-rate-duration, cfa-level-2"
}
</script>
