---
title: "Trade Strategy Execution L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Trade strategy and execution — motivations to trade, trade strategy selection, reference prices, algorithmic trading, implementation shortfall, trade cost measu"
---

# Trade Strategy Execution L3 Blueprint

> Trade strategy and execution — motivations to trade, trade strategy selection, reference prices, algorithmic trading, implementation shortfall, trade cost measurement, and governance

| | |
|---|---|
| **Feature** | `trade-strategy-execution-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, trade-execution, implementation-shortfall, algorithmic-trading, best-execution, market-impact, vwap, twap, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/trade-strategy-execution-l3.blueprint.yaml) |
| **JSON API** | [trade-strategy-execution-l3.json]({{ site.baseurl }}/api/blueprints/trading/trade-strategy-execution-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `trader` | Trader | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_id` | text | Yes | Trade identifier |  |
| `trade_type` | select | Yes | short_term_alpha \| long_term_alpha \| risk_rebalance \| client_redemption \| new_mandate |  |

## Rules

- **motivations_to_trade:**
  - **profit_seeking:** Alpha idea; buy undervalued, sell overvalued; urgency depends on alpha decay speed
  - **risk_management:** Rebalance to target; hedge; reduce concentration; less urgency
  - **cash_flow:** Client redemption; contribution; coupon/dividend reinvestment; often known in advance
  - **corporate_actions:** Index reconstitution; mandatory tender; margin call; often urgent
- **trade_strategy_inputs:**
  - **security_characteristics:** Liquidity, volatility, market cap; determines execution complexity
  - **order_size:** As % of ADV; large orders require more time; higher market impact
  - **urgency:** Urgency of trade depends on alpha decay rate and risk exposure
  - **risk_aversion:** Higher risk aversion → more aggressive execution; accept more market impact
- **reference_prices:**
  - **pretrade:** Decision price; arrival price; reflects value at trade initiation
  - **intraday:** VWAP (volume-weighted average); TWAP (time-weighted average)
  - **posttrade:** Closing price; market on close (MOC); settle at EOD
  - **price_target:** Analyst-derived fair value; relevant for long-term alpha trades
- **trading_strategies:**
  - **short_term_alpha:** Execute quickly; minimize market impact accepts timing risk; arrival price benchmark
  - **long_term_alpha:** Slower execution; minimize market impact; VWAP benchmark typical
  - **risk_rebalance:** Moderate urgency; risk of continued mis-hedge more important than IS cost
  - **client_redemption:** Must complete by deadline; MOC or aggressive algo; full execution guaranteed
  - **new_mandate:** Transition trade; multiple assets simultaneously; minimize tracking error vs target
- **algorithmic_trading:**
  - **vwap_algo:** Slice order in proportion to expected volume profile; tracks VWAP; medium urgency
  - **twap_algo:** Slice order evenly over time; simple; good for illiquid or volatile stocks
  - **pov:** Participate at fixed % of market volume; good for large orders; avoids front-running
  - **is_algo:** Implementation shortfall algo; balance urgency vs market impact; optimal for alpha trades
  - **iceberg:** Hide large order; show only small visible quantity; reduce signaling risk
- **market_comparison:**
  - **equities:** Transparent; lit exchanges and dark pools; algo execution dominant; high liquidity
  - **fixed_income:** OTC; dealer-to-client; electronic platforms (MarketAxess, Bloomberg); less liquid
  - **derivatives:** Exchange (futures) or OTC (swaps, options); clearing reduces counterparty risk
  - **fx:** OTC; 24-hour; electronic platforms; tight spreads for majors
- **implementation_shortfall:**
  - **definition:** IS = paper portfolio return − actual portfolio return; true cost of execution
  - **components:** Delay cost + realized market impact + missed trade opportunity cost + commissions
  - **arrival_price:** Midpoint at time of decision; baseline for measuring IS
  - **realized_impact:** Price movement during execution; driven by order size and urgency
  - **opportunity_cost:** Alpha lost on shares not executed; especially relevant for partial fills
- **trade_cost_benchmarks:**
  - **arrival_price_benchmark:** Midpoint at time of trade decision; measures IS
  - **vwap:** Volume-weighted average price over day; measures execution quality for passive strategies
  - **twap:** Time-weighted average price; simpler; less sensitive to volume distribution
  - **moc:** Market on close; benchmarks to closing auction; eliminates intraday timing risk
  - **market_adjusted_cost:** Adjusts benchmark for general market move during execution; isolates stock-specific impact
  - **added_value:** Compare actual IS to estimated optimal IS from pre-trade model
- **trade_governance:**
  - **best_execution:** Execute client orders in their best interests considering all relevant factors
  - **factors:** Price, speed, cost, likelihood of execution, size, nature, other relevant factors
  - **broker_list:** Maintain list of eligible brokers; review periodically for quality and conflicts
  - **monitoring:** Post-trade analysis of execution quality; TCA (transaction cost analysis)
- **validation:**
  - **trade_required:** trade_id present
  - **valid_type:** trade_type in [short_term_alpha, long_term_alpha, risk_rebalance, client_redemption, new_mandate]

## Outcomes

### Execute_trade_strategy (Priority: 1)

_Select and implement trade strategy for specified trade type_

**Given:**
- `trade_id` (input) exists
- `trade_type` (input) in `short_term_alpha,long_term_alpha,risk_rebalance,client_redemption,new_mandate`

**Then:**
- **call_service** target: `trader`
- **emit_event** event: `trade.strategy.executed`

### Invalid_type (Priority: 10) — Error: `TRADE_INVALID_TYPE`

_Unsupported trade type_

**Given:**
- `trade_type` (input) not_in `short_term_alpha,long_term_alpha,risk_rebalance,client_redemption,new_mandate`

**Then:**
- **emit_event** event: `trade.strategy.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRADE_INVALID_TYPE` | 400 | trade_type must be one of short_term_alpha, long_term_alpha, risk_rebalance, client_redemption, new_mandate | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trade.strategy.executed` |  | `trade_id`, `trade_type`, `implementation_shortfall`, `market_impact`, `commission` |
| `trade.strategy.rejected` |  | `trade_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-performance-evaluation-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trade Strategy Execution L3 Blueprint",
  "description": "Trade strategy and execution — motivations to trade, trade strategy selection, reference prices, algorithmic trading, implementation shortfall, trade cost measu",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, trade-execution, implementation-shortfall, algorithmic-trading, best-execution, market-impact, vwap, twap, cfa-level-3"
}
</script>
