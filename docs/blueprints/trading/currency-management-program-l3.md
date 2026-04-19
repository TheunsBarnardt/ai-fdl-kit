---
title: "Currency Management Program L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Active currency management strategies — fundamentals, technical, carry trade, volatility trading, forward/option instruments, exotic options, and EM currency ma"
---

# Currency Management Program L3 Blueprint

> Active currency management strategies — fundamentals, technical, carry trade, volatility trading, forward/option instruments, exotic options, and EM currency management

| | |
|---|---|
| **Feature** | `currency-management-program-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, currency-management, carry-trade, currency-overlay, fx-options, emerging-market-currency, cross-hedge, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/currency-management-program-l3.blueprint.yaml) |
| **JSON API** | [currency-management-program-l3.json]({{ site.baseurl }}/api/blueprints/trading/currency-management-program-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `currency_overlay_manager` | Currency Overlay Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `program_id` | text | Yes | Currency program identifier |  |
| `strategy_type` | select | Yes | fundamentals \| technical \| carry_trade \| volatility \| options_based \| em_currency |  |

## Rules

- **fundamental_currency:**
  - **ppp:** Long-run FX determined by relative inflation; short-run deviations exploitable
  - **current_account:** CA surplus → currency appreciates; deficit → depreciates
  - **real_rates:** Higher real interest rates attract capital → currency appreciation
  - **valuation_models:** BEER, FEER, PEER; identify under/over-valued currencies vs fundamentals
- **technical_currency:**
  - **trend_following:** Momentum strategies; buy recent winners, sell losers; exploits FX trends
  - **mean_reversion:** Buy extreme oversold; sell extreme overbought; shorter-term
  - **support_resistance:** Key price levels; chart patterns; filter for entries and exits
- **carry_trade:**
  - **definition:** Borrow low-yield currency, invest in high-yield currency; profit = interest differential
  - **uip_violation:** UIP predicts carry trade earns zero; empirically carry earns positive return on average
  - **crash_risk:** Carry unwinds rapidly during risk-off; skewness of return distribution is negative
  - **diversified_carry:** Diversify across many currency pairs; reduces crash risk; smoother returns
- **volatility_trading:**
  - **long_vol:** Buy straddles/strangles; profit from large FX moves
  - **short_vol:** Sell options; earn premium in range-bound markets
  - **vol_surface:** Exploit mispricings on volatility surface (skew, term structure)
- **options_based_strategies:**
  - **over_under_hedge:** Use OTM options to hedge beyond/below forward rate; pay for asymmetry
  - **protective_put:** Buy OTM put to hedge FX downside; retain upside; costs premium
  - **risk_reversal:** Buy OTM put, sell OTM call; limits both; can be zero cost
  - **put_spread:** Buy ATM put, sell OTM put; cheaper downside hedge; limited protection below lower strike
  - **seagull_spread:** Buy put spread + sell call; zero or low cost; common for exporters
  - **exotic_options:** Barrier, average rate, basket options; cheaper but complex payoffs
- **multiple_currency_hedging:**
  - **cross_hedge:** Hedge one currency using correlated but more liquid proxy currency
  - **macro_hedge:** Single instrument to hedge aggregate FX exposure of diversified portfolio
  - **minimum_variance_hedge:** Minimize portfolio variance; hedge ratio = ρ(portfolio, FX) × σ_portfolio / σ_FX
  - **basis_risk:** Residual risk when hedged and proxy currency are imperfectly correlated
- **em_currency:**
  - **special_risks:** Higher volatility; capital controls; convertibility risk; thinner markets
  - **ndf:** Non-deliverable forward; settled in hard currency; used when local FX market is restricted
  - **liquidity:** EM FX markets less liquid; larger bid-ask; concentration of activity near month-end
  - **political_risk:** Sudden devaluations, capital controls, forced conversion at off-market rates
- **validation:**
  - **program_required:** program_id present
  - **valid_strategy:** strategy_type in [fundamentals, technical, carry_trade, volatility, options_based, em_currency]

## Outcomes

### Implement_currency_program (Priority: 1)

_Implement active currency management strategy_

**Given:**
- `program_id` (input) exists
- `strategy_type` (input) in `fundamentals,technical,carry_trade,volatility,options_based,em_currency`

**Then:**
- **call_service** target: `currency_overlay_manager`
- **emit_event** event: `currency.program.implemented`

### Invalid_strategy (Priority: 10) — Error: `CURRENCY_PROGRAM_INVALID_STRATEGY`

_Unsupported currency strategy type_

**Given:**
- `strategy_type` (input) not_in `fundamentals,technical,carry_trade,volatility,options_based,em_currency`

**Then:**
- **emit_event** event: `currency.program.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURRENCY_PROGRAM_INVALID_STRATEGY` | 400 | strategy_type must be one of the supported currency management strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `currency.program.implemented` |  | `program_id`, `strategy_type`, `hedge_ratio`, `expected_carry`, `options_premium` |
| `currency.program.rejected` |  | `program_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| currency-management-intro-l3 | required |  |
| swaps-forwards-futures-strategies-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Management Program L3 Blueprint",
  "description": "Active currency management strategies — fundamentals, technical, carry trade, volatility trading, forward/option instruments, exotic options, and EM currency ma",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, currency-management, carry-trade, currency-overlay, fx-options, emerging-market-currency, cross-hedge, cfa-level-3"
}
</script>
