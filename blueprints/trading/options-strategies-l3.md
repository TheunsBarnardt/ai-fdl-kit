<!-- AUTO-GENERATED FROM options-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Options Strategies L3

> Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · options · derivatives · covered-call · protective-put · spread · straddle · collar · volatility · cfa-level-3

## What this does

Options strategies for portfolio management — covered calls, protective puts, spreads, straddles, collars, volatility skew, and equity risk modification

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **strategy_type** *(select, required)* — covered_call | protective_put | bull_spread | bear_spread | straddle | collar | calendar_spread

## What must be true

- **position_equivalencies → synthetic_long_forward:** Long call + short put at same strike and expiry ≡ long forward
- **position_equivalencies → synthetic_call:** Long stock + long put ≡ long call (put-call parity)
- **position_equivalencies → synthetic_put:** Short stock + long call ≡ long put
- **position_equivalencies → covered_call_equiv:** Long stock + short call ≡ short put (equivalent payoff profile)
- **covered_call → objective:** Generate income from premium; cap upside; lower cost basis
- **covered_call → profit_at_expiry:** Profit = premium received − max(0, S_T − X) + (S_T − S_0)
- **covered_call → max_profit:** Strike price − purchase price + premium
- **covered_call → max_loss:** Purchase price − premium (stock goes to zero)
- **covered_call → breakeven:** Purchase price − premium received
- **covered_call → use_cases:** Overwrite to generate alpha on flat/slightly rising market; reduce effective cost basis
- **protective_put → objective:** Insurance against downside; unlimited upside retained
- **protective_put → profit_at_expiry:** Profit = max(0, X − S_T) − premium paid + (S_T − S_0)
- **protective_put → max_loss:** Purchase price + premium − strike price
- **protective_put → breakeven:** Purchase price + premium paid
- **protective_put → use_cases:** Protect concentrated position; lock in gain before tax event
- **put_writing → objective:** Earn premium; willing to buy stock at lower price
- **put_writing → max_profit:** Premium received
- **put_writing → max_loss:** Strike price − premium (stock to zero)
- **put_writing → risk:** Unlimited downside if stock collapses; suitable for bullish view with defined budget
- **spreads → bull_call_spread:** Buy lower strike call, sell higher strike call; limited profit, limited cost
- **spreads → bull_put_spread:** Sell higher strike put, buy lower strike put; net premium received; bullish
- **spreads → bear_put_spread:** Buy higher strike put, sell lower strike put; limited profit; bearish
- **spreads → bear_call_spread:** Sell lower strike call, buy higher strike call; net premium received; bearish
- **spreads → max_profit_bull:** Difference in strikes − net premium paid (call spread)
- **spreads → max_loss_bull:** Net premium paid (call spread)
- **straddle → long_straddle:** Buy call and put at same strike; profit from large move in either direction
- **straddle → breakeven:** Strike ± total premium
- **straddle → use_case:** Anticipate high volatility event (earnings, binary event) without directional view
- **straddle → short_straddle:** Sell call and put; profit from low volatility; unlimited loss potential
- **collar → structure:** Long stock + long put + short call; bounded payoff
- **collar → zero_cost_collar:** Premium from short call offsets cost of put; no net premium outlay
- **collar → risk_reduction:** Limits both upside and downside; suitable for protecting large unrealized gain
- **calendar_spread → structure:** Sell near-term option, buy longer-term option at same strike
- **calendar_spread → profit_from:** Faster time decay of near-term option (theta advantage)
- **calendar_spread → use_case:** Low volatility environment; exploit term structure of volatility
- **implied_vol_skew → definition:** Implied vol varies by strike; typically higher for OTM puts (crash protection demand)
- **implied_vol_skew → put_skew:** OTM put IV > ATM IV; investors pay premium for downside protection
- **implied_vol_skew → call_skew:** OTM call IV > ATM IV; rare; indicates demand for upside participation
- **implied_vol_skew → term_structure:** Near-term IV typically higher during stress events; flattens in calm markets
- **portfolio_applications → equity_risk_increase:** Buy calls or sell puts to increase effective equity exposure
- **portfolio_applications → equity_risk_decrease:** Buy puts or sell calls to reduce effective equity exposure
- **portfolio_applications → volatility_hedge:** Long straddle/strangle before binary events; short if vol is richly priced
- **portfolio_applications → hedge_expected_volatility:** Buy VIX calls or variance swaps to hedge portfolio against volatility spike
- **validation → strategy_required:** strategy_id present
- **validation → valid_strategy:** strategy_type in [covered_call, protective_put, bull_spread, bear_spread, straddle, collar, calendar_spread]

## Success & failure scenarios

**✅ Success paths**

- **Implement Options Strategy** — when strategy_id exists; strategy_type in ["covered_call","protective_put","bull_spread","bear_spread","straddle","collar","calendar_spread"], then call service; emit options.strategy.implemented. _Why: Implement selected options strategy for portfolio management objective._

**❌ Failure paths**

- **Invalid Strategy** — when strategy_type not_in ["covered_call","protective_put","bull_spread","bear_spread","straddle","collar","calendar_spread"], then emit options.strategy.rejected. _Why: Unsupported strategy type._ *(error: `OPTIONS_INVALID_STRATEGY`)*

## Errors it can return

- `OPTIONS_INVALID_STRATEGY` — strategy_type must be one of the supported option strategies

## Events

**`options.strategy.implemented`**
  Payload: `strategy_id`, `strategy_type`, `max_profit`, `max_loss`, `breakeven`, `net_premium`

**`options.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **swaps-forwards-futures-strategies-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/options-strategies-l3/) · **Spec source:** [`options-strategies-l3.blueprint.yaml`](./options-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
