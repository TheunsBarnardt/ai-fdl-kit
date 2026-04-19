---
title: "Yield Curve Strategies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Active fixed-income yield curve strategies — duration positioning, curve shape trades, key rate durations, multi-currency fixed income, and strategy evaluation "
---

# Yield Curve Strategies L3 Blueprint

> Active fixed-income yield curve strategies — duration positioning, curve shape trades, key rate durations, multi-currency fixed income, and strategy evaluation framework

| | |
|---|---|
| **Feature** | `yield-curve-strategies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, fixed-income, yield-curve, duration, convexity, butterfly-trade, curve-steepener, key-rate-duration, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/yield-curve-strategies-l3.blueprint.yaml) |
| **JSON API** | [yield-curve-strategies-l3.json]({{ site.baseurl }}/api/blueprints/trading/yield-curve-strategies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `strategy_id` | text | Yes | Strategy identifier |  |
| `curve_view` | select | Yes | duration_bet \| steepener \| flattener \| butterfly \| multi_currency |  |

## Rules

- **yield_curve_dynamics:**
  - **parallel_shift:** All maturities move by same amount; modified duration captures P&L
  - **twist:** Short and long rates diverge; steepening or flattening; key rate durations needed
  - **butterfly:** Belly moves relative to wings; requires barbells vs bullets to exploit
  - **static_curve:** No change anticipated; earn rolldown return as bonds age toward shorter maturity
  - **dynamic_curve:** Rates move; profit from anticipating shift correctly
- **duration_convexity:**
  - **modified_duration:** Price sensitivity per 1% parallel yield change
  - **macaulay_duration:** Weighted average time to receipt of cash flows; equals modified × (1+y)
  - **convexity:** Second-order effect; positive convexity beneficial; portfolio gains more than it loses
  - **dollar_duration:** Modified duration × price; absolute rate sensitivity; additive across portfolio
- **static_strategies:**
  - **buy_hold:** Earn YTM + rolldown; no trading; lowest cost
  - **ride_yield_curve:** Buy longer maturity, sell before maturity; earn rolldown as bond ages
  - **rolldown_return:** Bond rolls down curve to lower yield → capital gain; positive when curve is steep
- **dynamic_strategies:**
  - **duration_increase:** Long duration if rates expected to fall; buy longer bonds or futures
  - **duration_decrease:** Short duration if rates expected to rise; sell long bonds; use pay-fixed swap
  - **steepener:** Long long-term rates + short short-term rates; profit if curve steepens
  - **flattener:** Long short-term + short long-term; profit if curve flattens
  - **bullet:** Concentrate in single maturity; low dispersion; most exposed to rate at that point
  - **barbell:** Concentrate at short and long ends; high convexity; profits from curve twist
  - **butterfly:** Long belly + short wings (barbell vs bullet); profit from hump change
  - **reverse_butterfly:** Short belly + long wings; profit from flattening of hump
- **key_rate_duration:**
  - **definition:** Sensitivity of portfolio value to 1% shift in yield at specific maturity
  - **portfolio_krd:** Weighted average of individual bond KRDs; allows precise exposure mapping
  - **target_profile:** Match KRD profile to liability duration profile or to curve view
  - **isolate_exposure:** Use KRD to position specifically on expected curve segment movements
- **multi_currency_fi:**
  - **cross_currency:** Exploit rate differential across countries; hedge or leave currency unhedged
  - **currency_hedged_carry:** Earn rate differential net of forward premium; hedged return ≈ domestic yield
  - **active_currency_fi:** Take selective FX exposure alongside rate view; amplifies or dampens fi return
  - **country_selection:** Allocate to markets with best risk-adjusted return; consider duration and spread risk
- **evaluation_framework:**
  - **horizon_return:** Project total return over investment horizon for each scenario
  - **breakeven_analysis:** How much must rates change to eliminate advantage of current positioning
  - **scenario_analysis:** Bull, base, bear rate scenarios; weighted return vs benchmark
  - **risk_attribution:** Decompose return into duration, curve, spread, currency contributions
- **validation:**
  - **strategy_required:** strategy_id present
  - **valid_view:** curve_view in [duration_bet, steepener, flattener, butterfly, multi_currency]

## Outcomes

### Implement_curve_strategy (Priority: 1)

_Implement yield curve strategy based on specified market view_

**Given:**
- `strategy_id` (input) exists
- `curve_view` (input) in `duration_bet,steepener,flattener,butterfly,multi_currency`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `yield_curve.strategy.implemented`

### Invalid_view (Priority: 10) — Error: `CURVE_INVALID_VIEW`

_Unsupported curve view_

**Given:**
- `curve_view` (input) not_in `duration_bet,steepener,flattener,butterfly,multi_currency`

**Then:**
- **emit_event** event: `yield_curve.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURVE_INVALID_VIEW` | 400 | curve_view must be one of duration_bet, steepener, flattener, butterfly, multi_currency | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `yield_curve.strategy.implemented` |  | `strategy_id`, `curve_view`, `duration`, `convexity`, `expected_horizon_return` |
| `yield_curve.strategy.rejected` |  | `strategy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-portfolio-management-l3 | required |  |
| fi-active-credit-strategies-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Yield Curve Strategies L3 Blueprint",
  "description": "Active fixed-income yield curve strategies — duration positioning, curve shape trades, key rate durations, multi-currency fixed income, and strategy evaluation ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, fixed-income, yield-curve, duration, convexity, butterfly-trade, curve-steepener, key-rate-duration, cfa-level-3"
}
</script>
