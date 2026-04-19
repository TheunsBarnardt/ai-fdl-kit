---
title: "Hedge Fund Strategies L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate hedge fund strategies — equity L/S, dedicated short, market neutral, merger arb, distressed, relative value, global macro, managed futures, and conditi"
---

# Hedge Fund Strategies L2 Blueprint

> Evaluate hedge fund strategies — equity L/S, dedicated short, market neutral, merger arb, distressed, relative value, global macro, managed futures, and conditional factor risk model analysis

| | |
|---|---|
| **Feature** | `hedge-fund-strategies-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternative-investments, hedge-funds, long-short-equity, merger-arbitrage, relative-value, global-macro, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/hedge-fund-strategies-l2.blueprint.yaml) |
| **JSON API** | [hedge-fund-strategies-l2.json]({{ site.baseurl }}/api/blueprints/trading/hedge-fund-strategies-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `hedge_fund_analyst` | Hedge Fund Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fund_id` | text | Yes | Fund identifier |  |
| `strategy_type` | select | Yes | long_short_equity \| dedicated_short \| market_neutral \| merger_arb \| distressed \| fi_arbitrage \| convertible_arb \| global_macro \| managed_futures \| volatility \| multistrategy |  |

## Rules

- **equity_strategies:**
  - **long_short_equity:** Long alpha stocks, short overvalued; net long bias typical
  - **dedicated_short:** Net short; profits from market declines; contrarian vs consensus
  - **market_neutral:** Zero net exposure; profits from stock-picking alpha
- **event_driven:**
  - **merger_arbitrage:** Long target, short acquirer; capture spread; risk = deal break
  - **distressed:** Deep value in stressed/defaulted securities; illiquid; catalysts needed
- **relative_value:**
  - **fi_arbitrage:** Exploit yield curve, credit spread, or liquidity mispricings; high leverage
  - **convertible_arb:** Long convertible, short equity; delta-neutral; earn yield + credit spread
- **opportunistic:**
  - **global_macro:** Top-down macro views in FX, rates, equities, commodities
  - **managed_futures:** Systematic trend-following (CTA); long vol, negative skew in reversals
- **specialist:**
  - **volatility_trading:** Long gamma via options; short vol via variance swaps
  - **reinsurance:** Cat bonds, life settlements; uncorrelated insurance risk
- **multi_manager:**
  - **fund_of_funds:** Diversified exposure; double fee layer; due diligence outsourced
  - **multi_strategy:** Single fund with multiple desks; capital allocated dynamically
- **classification_keys:**
  - **return_drivers:** Alpha source — model, information, structural
  - **risk_exposures:** Equity beta, credit beta, duration, vol, macro
  - **liquidity:** Capital lock-up, redemption terms, asset liquidity mismatch
- **conditional_factor_risk_model:**
  - **unconditional:** Single set of factor loadings regardless of market
  - **conditional:** Factor exposures change with market regime
  - **up_market_beta:** β when market is positive
  - **down_market_beta:** β when market is negative
  - **portfolio_contribution:** Marginal contribution to Sharpe of 60/40 portfolio
- **validation:**
  - **fund_required:** fund_id present
  - **valid_strategy:** strategy_type in allowed set

## Outcomes

### Evaluate_hedge_fund (Priority: 1)

_Evaluate hedge fund strategy_

**Given:**
- `fund_id` (input) exists
- `strategy_type` (input) in `long_short_equity,dedicated_short,market_neutral,merger_arb,distressed,fi_arbitrage,convertible_arb,global_macro,managed_futures,volatility,multistrategy`

**Then:**
- **call_service** target: `hedge_fund_analyst`
- **emit_event** event: `hedge_fund.evaluated`

### Invalid_strategy (Priority: 10) — Error: `HEDGE_INVALID_STRATEGY`

_Unsupported strategy type_

**Given:**
- `strategy_type` (input) not_in `long_short_equity,dedicated_short,market_neutral,merger_arb,distressed,fi_arbitrage,convertible_arb,global_macro,managed_futures,volatility,multistrategy`

**Then:**
- **emit_event** event: `hedge_fund.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HEDGE_INVALID_STRATEGY` | 400 | strategy_type must be one of the supported hedge fund strategies | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `hedge_fund.evaluated` |  | `fund_id`, `strategy_type`, `up_beta`, `down_beta`, `sharpe`, `portfolio_contribution` |
| `hedge_fund.rejected` |  | `fund_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multifactor-models-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Hedge Fund Strategies L2 Blueprint",
  "description": "Evaluate hedge fund strategies — equity L/S, dedicated short, market neutral, merger arb, distressed, relative value, global macro, managed futures, and conditi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternative-investments, hedge-funds, long-short-equity, merger-arbitrage, relative-value, global-macro, cfa-level-2"
}
</script>
