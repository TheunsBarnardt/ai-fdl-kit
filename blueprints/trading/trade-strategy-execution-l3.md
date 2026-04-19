<!-- AUTO-GENERATED FROM trade-strategy-execution-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Trade Strategy Execution L3

> Trade strategy and execution — motivations to trade, trade strategy selection, reference prices, algorithmic trading, implementation shortfall, trade cost measurement, and governance

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · trade-execution · implementation-shortfall · algorithmic-trading · best-execution · market-impact · vwap · twap · cfa-level-3

## What this does

Trade strategy and execution — motivations to trade, trade strategy selection, reference prices, algorithmic trading, implementation shortfall, trade cost measurement, and governance

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **trade_id** *(text, required)* — Trade identifier
- **trade_type** *(select, required)* — short_term_alpha | long_term_alpha | risk_rebalance | client_redemption | new_mandate

## What must be true

- **motivations_to_trade → profit_seeking:** Alpha idea; buy undervalued, sell overvalued; urgency depends on alpha decay speed
- **motivations_to_trade → risk_management:** Rebalance to target; hedge; reduce concentration; less urgency
- **motivations_to_trade → cash_flow:** Client redemption; contribution; coupon/dividend reinvestment; often known in advance
- **motivations_to_trade → corporate_actions:** Index reconstitution; mandatory tender; margin call; often urgent
- **trade_strategy_inputs → security_characteristics:** Liquidity, volatility, market cap; determines execution complexity
- **trade_strategy_inputs → order_size:** As % of ADV; large orders require more time; higher market impact
- **trade_strategy_inputs → urgency:** Urgency of trade depends on alpha decay rate and risk exposure
- **trade_strategy_inputs → risk_aversion:** Higher risk aversion → more aggressive execution; accept more market impact
- **reference_prices → pretrade:** Decision price; arrival price; reflects value at trade initiation
- **reference_prices → intraday:** VWAP (volume-weighted average); TWAP (time-weighted average)
- **reference_prices → posttrade:** Closing price; market on close (MOC); settle at EOD
- **reference_prices → price_target:** Analyst-derived fair value; relevant for long-term alpha trades
- **trading_strategies → short_term_alpha:** Execute quickly; minimize market impact accepts timing risk; arrival price benchmark
- **trading_strategies → long_term_alpha:** Slower execution; minimize market impact; VWAP benchmark typical
- **trading_strategies → risk_rebalance:** Moderate urgency; risk of continued mis-hedge more important than IS cost
- **trading_strategies → client_redemption:** Must complete by deadline; MOC or aggressive algo; full execution guaranteed
- **trading_strategies → new_mandate:** Transition trade; multiple assets simultaneously; minimize tracking error vs target
- **algorithmic_trading → vwap_algo:** Slice order in proportion to expected volume profile; tracks VWAP; medium urgency
- **algorithmic_trading → twap_algo:** Slice order evenly over time; simple; good for illiquid or volatile stocks
- **algorithmic_trading → pov:** Participate at fixed % of market volume; good for large orders; avoids front-running
- **algorithmic_trading → is_algo:** Implementation shortfall algo; balance urgency vs market impact; optimal for alpha trades
- **algorithmic_trading → iceberg:** Hide large order; show only small visible quantity; reduce signaling risk
- **market_comparison → equities:** Transparent; lit exchanges and dark pools; algo execution dominant; high liquidity
- **market_comparison → fixed_income:** OTC; dealer-to-client; electronic platforms (MarketAxess, Bloomberg); less liquid
- **market_comparison → derivatives:** Exchange (futures) or OTC (swaps, options); clearing reduces counterparty risk
- **market_comparison → fx:** OTC; 24-hour; electronic platforms; tight spreads for majors
- **implementation_shortfall → definition:** IS = paper portfolio return − actual portfolio return; true cost of execution
- **implementation_shortfall → components:** Delay cost + realized market impact + missed trade opportunity cost + commissions
- **implementation_shortfall → arrival_price:** Midpoint at time of decision; baseline for measuring IS
- **implementation_shortfall → realized_impact:** Price movement during execution; driven by order size and urgency
- **implementation_shortfall → opportunity_cost:** Alpha lost on shares not executed; especially relevant for partial fills
- **trade_cost_benchmarks → arrival_price_benchmark:** Midpoint at time of trade decision; measures IS
- **trade_cost_benchmarks → vwap:** Volume-weighted average price over day; measures execution quality for passive strategies
- **trade_cost_benchmarks → twap:** Time-weighted average price; simpler; less sensitive to volume distribution
- **trade_cost_benchmarks → moc:** Market on close; benchmarks to closing auction; eliminates intraday timing risk
- **trade_cost_benchmarks → market_adjusted_cost:** Adjusts benchmark for general market move during execution; isolates stock-specific impact
- **trade_cost_benchmarks → added_value:** Compare actual IS to estimated optimal IS from pre-trade model
- **trade_governance → best_execution:** Execute client orders in their best interests considering all relevant factors
- **trade_governance → factors:** Price, speed, cost, likelihood of execution, size, nature, other relevant factors
- **trade_governance → broker_list:** Maintain list of eligible brokers; review periodically for quality and conflicts
- **trade_governance → monitoring:** Post-trade analysis of execution quality; TCA (transaction cost analysis)
- **validation → trade_required:** trade_id present
- **validation → valid_type:** trade_type in [short_term_alpha, long_term_alpha, risk_rebalance, client_redemption, new_mandate]

## Success & failure scenarios

**✅ Success paths**

- **Execute Trade Strategy** — when trade_id exists; trade_type in ["short_term_alpha","long_term_alpha","risk_rebalance","client_redemption","new_mandate"], then call service; emit trade.strategy.executed. _Why: Select and implement trade strategy for specified trade type._

**❌ Failure paths**

- **Invalid Type** — when trade_type not_in ["short_term_alpha","long_term_alpha","risk_rebalance","client_redemption","new_mandate"], then emit trade.strategy.rejected. _Why: Unsupported trade type._ *(error: `TRADE_INVALID_TYPE`)*

## Errors it can return

- `TRADE_INVALID_TYPE` — trade_type must be one of short_term_alpha, long_term_alpha, risk_rebalance, client_redemption, new_mandate

## Events

**`trade.strategy.executed`**
  Payload: `trade_id`, `trade_type`, `implementation_shortfall`, `market_impact`, `commission`

**`trade.strategy.rejected`**
  Payload: `trade_id`, `reason_code`

## Connects to

- **portfolio-performance-evaluation-l3** *(recommended)*

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/trade-strategy-execution-l3/) · **Spec source:** [`trade-strategy-execution-l3.blueprint.yaml`](./trade-strategy-execution-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
