<!-- AUTO-GENERATED FROM swaps-forwards-futures-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Swaps Forwards Futures Strategies L3

> Derivatives strategies using swaps, forwards and futures — interest rate risk, currency exposure, equity risk, asset allocation, variance swaps, and inferring market expectations

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · derivatives · swaps · futures · forwards · interest-rate-risk · currency-management · equity-derivatives · asset-allocation · cfa-level-3

## What this does

Derivatives strategies using swaps, forwards and futures — interest rate risk, currency exposure, equity risk, asset allocation, variance swaps, and inferring market expectations

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **risk_type** *(select, required)* — interest_rate | currency | equity | asset_allocation | volatility

## What must be true

- **interest_rate_risk → ir_swap:** Pay fixed/receive floating to reduce duration; receive fixed/pay floating to increase duration
- **interest_rate_risk → duration_adjustment:** ΔDV01 = target BPV − portfolio BPV; N_futures = ΔDV01 / futures BPV
- **interest_rate_risk → futures_rate_lock:** Lock in forward rate using Eurodollar/SOFR futures; hedge reinvestment risk
- **interest_rate_risk → fixed_income_futures:** Treasury futures: # contracts = [(MD_target − MD_portfolio) / MD_futures] × (Portfolio / Futures price)
- **currency_management_derivatives → currency_swap:** Exchange notional and coupon payments in two currencies; convert currency of liability
- **currency_management_derivatives → currency_forward:** Lock in exchange rate for future settlement; hedge FX exposure
- **currency_management_derivatives → fx_futures:** Exchange-traded FX futures; mark-to-market daily; standardized contract sizes
- **currency_management_derivatives → hedge_ratio:** Full hedge: sell forward = 100% of FX exposure; partial hedge based on risk tolerance
- **currency_management_derivatives → rolling:** Roll forward contracts near expiry; may incur basis risk if spot/forward differ from model
- **equity_risk → equity_swap:** Receive equity index return, pay fixed or floating; gain equity exposure without buying stocks
- **equity_risk → equity_futures:** Long futures to gain equity beta; short to reduce beta
- **equity_risk → beta_adjustment:** N_futures = [(β_target − β_portfolio) / β_futures] × (Portfolio value / Futures price)
- **equity_risk → cash_equitization:** Invest idle cash in equity futures to maintain full equity exposure
- **asset_allocation_derivatives → rebalancing_futures:** Use futures to rebalance between asset classes without selling underlying securities
- **asset_allocation_derivatives → class_switch:** Go long futures on target class, short on source class; effective, low-cost rebalancing
- **asset_allocation_derivatives → overlay_strategy:** Separate alpha generation (underlying) from asset class exposure (derivatives overlay)
- **asset_allocation_derivatives → synthetic_allocation:** Hold T-bills + long futures = synthetic asset class exposure; portable alpha
- **variance_swaps → definition:** Payoff = notional × (realized variance − strike variance); buyer profits if vol rises above strike
- **variance_swaps → vega_exposure:** Long variance swap = long volatility; payoff is convex (variance, not vol)
- **variance_swaps → use_case:** Pure volatility exposure without delta-hedging; hedge against volatility spike
- **variance_swaps → fair_strike:** Approximately equal to implied variance (squared implied vol) at initiation
- **volatility_futures_options → vix_futures:** Futures on 30-day implied vol of S&P 500; liquid; mean-reverting
- **volatility_futures_options → vix_calls:** Buy OTM calls to hedge tail risk; portfolio protection against volatility spike
- **volatility_futures_options → term_structure:** VIX futures curve typically upward sloping (contango); long position suffers roll cost
- **inferring_market_expectations → fed_funds_futures:** Implied fed funds rate path from futures prices; market consensus on rate path
- **inferring_market_expectations → forward_rate_agreement:** FRA rates reveal expected short-term rates for specific future periods
- **inferring_market_expectations → equity_futures_implied:** Futures price = spot × (1 + r − d)^T; implied repo/dividend yield
- **validation → strategy_required:** strategy_id present
- **validation → valid_risk:** risk_type in [interest_rate, currency, equity, asset_allocation, volatility]

## Success & failure scenarios

**✅ Success paths**

- **Implement Derivatives Strategy** — when strategy_id exists; risk_type in ["interest_rate","currency","equity","asset_allocation","volatility"], then call service; emit derivatives.strategy.implemented. _Why: Implement swap, forward or futures strategy for specified risk type._

**❌ Failure paths**

- **Invalid Risk Type** — when risk_type not_in ["interest_rate","currency","equity","asset_allocation","volatility"], then emit derivatives.strategy.rejected. _Why: Unsupported risk type._ *(error: `DERIVATIVES_INVALID_RISK_TYPE`)*

## Errors it can return

- `DERIVATIVES_INVALID_RISK_TYPE` — risk_type must be one of interest_rate, currency, equity, asset_allocation, volatility

## Events

**`derivatives.strategy.implemented`**
  Payload: `strategy_id`, `risk_type`, `notional`, `number_of_contracts`, `expected_hedge_effectiveness`

**`derivatives.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **options-strategies-l3** *(recommended)*
- **currency-management-intro-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/swaps-forwards-futures-strategies-l3/) · **Spec source:** [`swaps-forwards-futures-strategies-l3.blueprint.yaml`](./swaps-forwards-futures-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
