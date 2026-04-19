<!-- AUTO-GENERATED FROM hedge-fund-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Hedge Fund Strategies L3

> Hedge fund strategy classification and analysis — long/short equity, event-driven, relative value, global macro, managed futures, and multi-manager structures with conditional factor risk models

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · hedge-funds · long-short-equity · merger-arbitrage · convertible-bond-arb · global-macro · managed-futures · multi-manager · cfa-level-3

## What this does

Hedge fund strategy classification and analysis — long/short equity, event-driven, relative value, global macro, managed futures, and multi-manager structures with conditional factor risk models

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **hedge_fund_type** *(select, required)* — long_short_equity | dedicated_short | equity_market_neutral | merger_arb | distressed | fi_arb | convertible_arb | global_macro | managed_futures | multi_manager

## What must be true

- **strategy_classification → equity:** Long/short equity, dedicated short, equity market neutral
- **strategy_classification → event_driven:** Merger arbitrage, distressed securities
- **strategy_classification → relative_value:** Fixed-income arbitrage, convertible bond arbitrage
- **strategy_classification → opportunistic:** Global macro, managed futures
- **strategy_classification → specialist:** Volatility trading, reinsurance/life settlements
- **strategy_classification → multi_manager:** Fund-of-funds, multi-strategy
- **long_short_equity → approach:** Long undervalued + short overvalued; net long bias typical; 130/30 to 0/100
- **long_short_equity → alpha_sources:** Stock selection, factor tilts, sector rotation
- **long_short_equity → risk:** Factor exposure, short squeeze, crowding
- **dedicated_short → approach:** Primarily short equities; profits in bear markets; rare strategy
- **dedicated_short → characteristics:** High correlation with bear markets; natural hedge for long-only portfolios
- **dedicated_short → challenges:** Unlimited loss potential; borrowing costs; hostile market sentiment long-term
- **equity_market_neutral → approach:** Equal long and short; near-zero beta; isolates stock selection alpha
- **equity_market_neutral → implementation:** Pairs trading; statistical arbitrage; factor-neutral
- **equity_market_neutral → risk:** Model risk; crowding; sudden correlation breaks
- **merger_arbitrage → approach:** Long target, short acquirer (stock deals); earn spread = deal premium × completion prob
- **merger_arbitrage → risk:** Deal break risk; regulatory rejection; market move risk on reopened bids
- **merger_arbitrage → return_distribution:** Positive skew most deals; occasional catastrophic loss on deal break
- **distressed_securities → approach:** Buy debt or equity of firms in distress or bankruptcy at steep discount
- **distressed_securities → alpha_source:** Price dislocation; complexity premium; active engagement in restructuring
- **distressed_securities → risk:** Illiquidity; legal complexity; extended workout period; uncertain recovery
- **fi_arbitrage → approach:** Exploit small yield/price discrepancies between related fixed-income instruments
- **fi_arbitrage → types:** On/off-the-run treasuries; swap spread arbitrage; yield curve arbitrage
- **fi_arbitrage → risk:** High leverage required; liquidity risk; funding risk; convergence may not occur
- **convertible_bond_arb → approach:** Long convertible, short underlying equity; exploit mispricing of embedded option
- **convertible_bond_arb → delta_hedging:** Maintain delta-neutral position; earn gamma; rebalance frequently
- **convertible_bond_arb → risk:** Credit spread widening; liquidity risk in convertibles; crowding; short borrow cost
- **global_macro → approach:** Top-down macro views across FX, rates, equities, commodities; highly directional
- **global_macro → implementation:** Liquid futures, forwards, options; high leverage; low correlation to equities
- **global_macro → risk:** Timing risk; extreme drawdowns; model uncertainty; regime change
- **managed_futures → approach:** Trend-following (CTA) across commodity, financial futures; rules-based
- **managed_futures → characteristics:** Positive skew; negative correlation to equities in crises; long volatility
- **managed_futures → risk:** Whipsaw in ranging markets; data mining risk in backtests; crowding in major trends
- **conditional_factor_risk_model → purpose:** Assess factor exposures of hedge fund strategies; vary across market regimes
- **conditional_factor_risk_model → factors:** Equity market, credit spread, volatility, liquidity, momentum, value
- **conditional_factor_risk_model → conditional_nature:** Factor loadings change in bull vs bear markets; must model regime dependency
- **conditional_factor_risk_model → application:** Identify hidden market exposures; assess portfolio contribution of HF allocation
- **portfolio_contribution → diversification:** HFs add diversification if low correlation to equity/bond portfolio
- **portfolio_contribution → performance:** Contribution to 60/40 portfolio: absolute return + risk reduction
- **portfolio_contribution → risk_metrics:** Sharpe ratio, max drawdown, correlation, VaR, CVaR, Omega ratio
- **validation → strategy_required:** strategy_id present
- **validation → valid_type:** hedge_fund_type in [long_short_equity, dedicated_short, equity_market_neutral, merger_arb, distressed, fi_arb, convertible_arb, global_macro, managed_futures, multi_manager]

## Success & failure scenarios

**✅ Success paths**

- **Analyze Hedge Fund Strategy** — when strategy_id exists; hedge_fund_type in ["long_short_equity","dedicated_short","equity_market_neutral","merger_arb","distressed","fi_arb","convertible_arb","global_macro","managed_futures","multi_manager"], then call service; emit hedge_fund.strategy.analyzed. _Why: Analyze hedge fund strategy for portfolio construction._

**❌ Failure paths**

- **Invalid Type** — when hedge_fund_type not_in ["long_short_equity","dedicated_short","equity_market_neutral","merger_arb","distressed","fi_arb","convertible_arb","global_macro","managed_futures","multi_manager"], then emit hedge_fund.strategy.rejected. _Why: Unsupported hedge fund type._ *(error: `HF_INVALID_TYPE`)*

## Errors it can return

- `HF_INVALID_TYPE` — hedge_fund_type must be one of the supported hedge fund strategies

## Events

**`hedge_fund.strategy.analyzed`**
  Payload: `strategy_id`, `hedge_fund_type`, `factor_exposures`, `sharpe_ratio`, `max_drawdown`, `correlation_to_equity`

**`hedge_fund.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **asset-allocation-alternatives-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/hedge-fund-strategies-l3/) · **Spec source:** [`hedge-fund-strategies-l3.blueprint.yaml`](./hedge-fund-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
