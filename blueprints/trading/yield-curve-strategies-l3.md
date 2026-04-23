<!-- AUTO-GENERATED FROM yield-curve-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Yield Curve Strategies L3

> Active fixed-income yield curve strategies — duration positioning, curve shape trades, key rate durations, multi-currency fixed income, and strategy evaluation framework

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · fixed-income · yield-curve · duration · convexity · butterfly-trade · curve-steepener · key-rate-duration · cfa-level-3

## What this does

Active fixed-income yield curve strategies — duration positioning, curve shape trades, key rate durations, multi-currency fixed income, and strategy evaluation framework

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **curve_view** *(select, required)* — duration_bet | steepener | flattener | butterfly | multi_currency

## What must be true

- **yield_curve_dynamics → parallel_shift:** All maturities move by same amount; modified duration captures P&L
- **yield_curve_dynamics → twist:** Short and long rates diverge; steepening or flattening; key rate durations needed
- **yield_curve_dynamics → butterfly:** Belly moves relative to wings; requires barbells vs bullets to exploit
- **yield_curve_dynamics → static_curve:** No change anticipated; earn rolldown return as bonds age toward shorter maturity
- **yield_curve_dynamics → dynamic_curve:** Rates move; profit from anticipating shift correctly
- **duration_convexity → modified_duration:** Price sensitivity per 1% parallel yield change
- **duration_convexity → macaulay_duration:** Weighted average time to receipt of cash flows; equals modified × (1+y)
- **duration_convexity → convexity:** Second-order effect; positive convexity beneficial; portfolio gains more than it loses
- **duration_convexity → dollar_duration:** Modified duration × price; absolute rate sensitivity; additive across portfolio
- **static_strategies → buy_hold:** Earn YTM + rolldown; no trading; lowest cost
- **static_strategies → ride_yield_curve:** Buy longer maturity, sell before maturity; earn rolldown as bond ages
- **static_strategies → rolldown_return:** Bond rolls down curve to lower yield → capital gain; positive when curve is steep
- **dynamic_strategies → duration_increase:** Long duration if rates expected to fall; buy longer bonds or futures
- **dynamic_strategies → duration_decrease:** Short duration if rates expected to rise; sell long bonds; use pay-fixed swap
- **dynamic_strategies → steepener:** Long long-term rates + short short-term rates; profit if curve steepens
- **dynamic_strategies → flattener:** Long short-term + short long-term; profit if curve flattens
- **dynamic_strategies → bullet:** Concentrate in single maturity; low dispersion; most exposed to rate at that point
- **dynamic_strategies → barbell:** Concentrate at short and long ends; high convexity; profits from curve twist
- **dynamic_strategies → butterfly:** Long belly + short wings (barbell vs bullet); profit from hump change
- **dynamic_strategies → reverse_butterfly:** Short belly + long wings; profit from flattening of hump
- **key_rate_duration → definition:** Sensitivity of portfolio value to 1% shift in yield at specific maturity
- **key_rate_duration → portfolio_krd:** Weighted average of individual bond KRDs; allows precise exposure mapping
- **key_rate_duration → target_profile:** Match KRD profile to liability duration profile or to curve view
- **key_rate_duration → isolate_exposure:** Use KRD to position specifically on expected curve segment movements
- **multi_currency_fi → cross_currency:** Exploit rate differential across countries; hedge or leave currency unhedged
- **multi_currency_fi → currency_hedged_carry:** Earn rate differential net of forward premium; hedged return ≈ domestic yield
- **multi_currency_fi → active_currency_fi:** Take selective FX exposure alongside rate view; amplifies or dampens fi return
- **multi_currency_fi → country_selection:** Allocate to markets with best risk-adjusted return; consider duration and spread risk
- **evaluation_framework → horizon_return:** Project total return over investment horizon for each scenario
- **evaluation_framework → breakeven_analysis:** How much must rates change to eliminate advantage of current positioning
- **evaluation_framework → scenario_analysis:** Bull, base, bear rate scenarios; weighted return vs benchmark
- **evaluation_framework → risk_attribution:** Decompose return into duration, curve, spread, currency contributions
- **validation → strategy_required:** strategy_id present
- **validation → valid_view:** curve_view in [duration_bet, steepener, flattener, butterfly, multi_currency]

## Success & failure scenarios

**✅ Success paths**

- **Implement Curve Strategy** — when strategy_id exists; curve_view in ["duration_bet","steepener","flattener","butterfly","multi_currency"], then call service; emit yield_curve.strategy.implemented. _Why: Implement yield curve strategy based on specified market view._

**❌ Failure paths**

- **Invalid View** — when curve_view not_in ["duration_bet","steepener","flattener","butterfly","multi_currency"], then emit yield_curve.strategy.rejected. _Why: Unsupported curve view._ *(error: `CURVE_INVALID_VIEW`)*

## Errors it can return

- `CURVE_INVALID_VIEW` — curve_view must be one of duration_bet, steepener, flattener, butterfly, multi_currency

## Events

**`yield_curve.strategy.implemented`**
  Payload: `strategy_id`, `curve_view`, `duration`, `convexity`, `expected_horizon_return`

**`yield_curve.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **fixed-income-portfolio-management-l3** *(required)*
- **fi-active-credit-strategies-l3** *(recommended)*

## Quality fitness 🟢 87/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/yield-curve-strategies-l3/) · **Spec source:** [`yield-curve-strategies-l3.blueprint.yaml`](./yield-curve-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
