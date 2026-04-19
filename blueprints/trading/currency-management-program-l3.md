<!-- AUTO-GENERATED FROM currency-management-program-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Currency Management Program L3

> Active currency management strategies — fundamentals, technical, carry trade, volatility trading, forward/option instruments, exotic options, and EM currency management

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · currency-management · carry-trade · currency-overlay · fx-options · emerging-market-currency · cross-hedge · cfa-level-3

## What this does

Active currency management strategies — fundamentals, technical, carry trade, volatility trading, forward/option instruments, exotic options, and EM currency management

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **program_id** *(text, required)* — Currency program identifier
- **strategy_type** *(select, required)* — fundamentals | technical | carry_trade | volatility | options_based | em_currency

## What must be true

- **fundamental_currency → ppp:** Long-run FX determined by relative inflation; short-run deviations exploitable
- **fundamental_currency → current_account:** CA surplus → currency appreciates; deficit → depreciates
- **fundamental_currency → real_rates:** Higher real interest rates attract capital → currency appreciation
- **fundamental_currency → valuation_models:** BEER, FEER, PEER; identify under/over-valued currencies vs fundamentals
- **technical_currency → trend_following:** Momentum strategies; buy recent winners, sell losers; exploits FX trends
- **technical_currency → mean_reversion:** Buy extreme oversold; sell extreme overbought; shorter-term
- **technical_currency → support_resistance:** Key price levels; chart patterns; filter for entries and exits
- **carry_trade → definition:** Borrow low-yield currency, invest in high-yield currency; profit = interest differential
- **carry_trade → uip_violation:** UIP predicts carry trade earns zero; empirically carry earns positive return on average
- **carry_trade → crash_risk:** Carry unwinds rapidly during risk-off; skewness of return distribution is negative
- **carry_trade → diversified_carry:** Diversify across many currency pairs; reduces crash risk; smoother returns
- **volatility_trading → long_vol:** Buy straddles/strangles; profit from large FX moves
- **volatility_trading → short_vol:** Sell options; earn premium in range-bound markets
- **volatility_trading → vol_surface:** Exploit mispricings on volatility surface (skew, term structure)
- **options_based_strategies → over_under_hedge:** Use OTM options to hedge beyond/below forward rate; pay for asymmetry
- **options_based_strategies → protective_put:** Buy OTM put to hedge FX downside; retain upside; costs premium
- **options_based_strategies → risk_reversal:** Buy OTM put, sell OTM call; limits both; can be zero cost
- **options_based_strategies → put_spread:** Buy ATM put, sell OTM put; cheaper downside hedge; limited protection below lower strike
- **options_based_strategies → seagull_spread:** Buy put spread + sell call; zero or low cost; common for exporters
- **options_based_strategies → exotic_options:** Barrier, average rate, basket options; cheaper but complex payoffs
- **multiple_currency_hedging → cross_hedge:** Hedge one currency using correlated but more liquid proxy currency
- **multiple_currency_hedging → macro_hedge:** Single instrument to hedge aggregate FX exposure of diversified portfolio
- **multiple_currency_hedging → minimum_variance_hedge:** Minimize portfolio variance; hedge ratio = ρ(portfolio, FX) × σ_portfolio / σ_FX
- **multiple_currency_hedging → basis_risk:** Residual risk when hedged and proxy currency are imperfectly correlated
- **em_currency → special_risks:** Higher volatility; capital controls; convertibility risk; thinner markets
- **em_currency → ndf:** Non-deliverable forward; settled in hard currency; used when local FX market is restricted
- **em_currency → liquidity:** EM FX markets less liquid; larger bid-ask; concentration of activity near month-end
- **em_currency → political_risk:** Sudden devaluations, capital controls, forced conversion at off-market rates
- **validation → program_required:** program_id present
- **validation → valid_strategy:** strategy_type in [fundamentals, technical, carry_trade, volatility, options_based, em_currency]

## Success & failure scenarios

**✅ Success paths**

- **Implement Currency Program** — when program_id exists; strategy_type in ["fundamentals","technical","carry_trade","volatility","options_based","em_currency"], then call service; emit currency.program.implemented. _Why: Implement active currency management strategy._

**❌ Failure paths**

- **Invalid Strategy** — when strategy_type not_in ["fundamentals","technical","carry_trade","volatility","options_based","em_currency"], then emit currency.program.rejected. _Why: Unsupported currency strategy type._ *(error: `CURRENCY_PROGRAM_INVALID_STRATEGY`)*

## Errors it can return

- `CURRENCY_PROGRAM_INVALID_STRATEGY` — strategy_type must be one of the supported currency management strategies

## Events

**`currency.program.implemented`**
  Payload: `program_id`, `strategy_type`, `hedge_ratio`, `expected_carry`, `options_premium`

**`currency.program.rejected`**
  Payload: `program_id`, `reason_code`

## Connects to

- **currency-management-intro-l3** *(required)*
- **swaps-forwards-futures-strategies-l3** *(recommended)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/currency-management-program-l3/) · **Spec source:** [`currency-management-program-l3.blueprint.yaml`](./currency-management-program-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
