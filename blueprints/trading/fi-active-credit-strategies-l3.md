<!-- AUTO-GENERATED FROM fi-active-credit-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fi Active Credit Strategies L3

> Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and structured credit

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · fixed-income · credit-strategies · credit-spread · high-yield · cds · structured-credit · factor-credit · cfa-level-3

## What this does

Active credit fixed-income strategies — bottom-up/top-down/factor credit, liquidity and tail risk, synthetic credit, spread curve strategies, global credit, and structured credit

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **credit_approach** *(select, required)* — bottom_up | top_down | factor | synthetic | spread_curve | global | structured

## What must be true

- **credit_spread_measures → oas:** Option-Adjusted Spread; spread over risk-free after removing embedded option value
- **credit_spread_measures → z_spread:** Zero-volatility spread; constant spread over spot curve making PV = price
- **credit_spread_measures → dts:** Duration Times Spread = modified spread duration × OAS; comparable across instruments
- **credit_spread_measures → spread_duration:** Sensitivity to 1% change in credit spread; key for credit P&L attribution
- **credit_risk → pd_lgd:** Expected credit loss = PD × LGD; both must be estimated forward-looking
- **credit_risk → downgrade_risk:** Rating migration can cause spread widening well before default
- **credit_risk → liquidity_risk:** Credit bonds are illiquid; bid-ask wider in stress; forced selling amplifies losses
- **credit_risk → market_credit_risk:** Spread changes driven by risk appetite, not just fundamental credit quality
- **bottom_up_strategies → security_selection:** Identify mispriced bonds relative to fair value given credit fundamentals
- **bottom_up_strategies → credit_analysis:** Cash flow adequacy, leverage, coverage ratios, competitive position, covenant quality
- **bottom_up_strategies → relative_value:** Compare similar bonds across issuers, maturities, capital structure
- **bottom_up_strategies → fallen_angels:** Investment-grade downgraded to HY; often oversold; potential return opportunity
- **top_down_strategies → sector_allocation:** Overweight/underweight sectors (financial, energy, consumer) based on cycle view
- **top_down_strategies → quality_tilt:** Overweight IG vs HY or vice versa based on spread outlook and default forecast
- **top_down_strategies → country_allocation:** Within global credit, overweight countries with improving fundamentals
- **top_down_strategies → duration_management:** Adjust credit spread duration relative to benchmark
- **factor_strategies → carry:** Buy high-spread bonds; earn excess spread net of expected losses
- **factor_strategies → momentum:** Buy bonds with recent spread tightening; sell widening
- **factor_strategies → value:** Buy bonds that are cheap vs fundamental model; sell expensive
- **factor_strategies → quality:** Buy bonds with improving credit quality; sell deteriorating
- **factor_strategies → size:** Small-issue premium; compensation for illiquidity in smaller bonds
- **liquidity_tail_risk → liquidity_risk:** Credit spreads widen when risk appetite drops; liquidity evaporates simultaneously
- **liquidity_tail_risk → liquidity_budget:** Maintain buffer of liquid assets; avoid concentrating in illiquid bonds
- **liquidity_tail_risk → tail_risk:** Left-tail events (default clusters, credit crises) not captured by normal distributions
- **liquidity_tail_risk → stress_testing:** Model portfolio under 2008-style credit crisis; assess drawdown and recovery
- **synthetic_credit → cds:** Credit default swap; protection buyer pays premium; seller bears default loss
- **synthetic_credit → long_credit_cds:** Sell protection = long credit; earns premium; bears default risk
- **synthetic_credit → short_credit_cds:** Buy protection = short credit; hedges or speculates on spread widening
- **synthetic_credit → cds_index:** CDX (US), iTraxx (Europe); liquid; used for macro credit hedging and TAA
- **synthetic_credit → total_return_swap:** Receive total return on credit index; pay floating; synthetic credit exposure
- **spread_curve_strategies → static:** Exploit mis-valuation on spread curve; buy cheap maturities vs rich maturities
- **spread_curve_strategies → dynamic:** Position for expected changes in spread curve shape; steepener/flattener
- **spread_curve_strategies → credit_barbell:** Short-maturity credit + long-duration govts; earn credit premium + duration premium
- **global_credit → investment_grade:** DM IG corporate bonds; broad universe; trade currency-hedged
- **global_credit → high_yield:** Sub-IG bonds; higher spread; higher default risk; more equity-like
- **global_credit → em_credit:** Sovereign and corporate bonds from emerging markets; additional country risk
- **structured_credit → abs:** Asset-backed securities; auto loans, student loans, credit cards
- **structured_credit → cmbs:** Commercial mortgage-backed securities; collateralized by income-producing real estate
- **structured_credit → clo:** Collateralized loan obligation; pool of leveraged loans; tranched risk
- **structured_credit → securitization_benefits:** Diversification, risk transfer, improved access to credit markets
- **validation → strategy_required:** strategy_id present
- **validation → valid_approach:** credit_approach in [bottom_up, top_down, factor, synthetic, spread_curve, global, structured]

## Success & failure scenarios

**✅ Success paths**

- **Implement Credit Strategy** — when strategy_id exists; credit_approach in ["bottom_up","top_down","factor","synthetic","spread_curve","global","structured"], then call service; emit credit.strategy.implemented. _Why: Implement active credit strategy using specified approach._

**❌ Failure paths**

- **Invalid Approach** — when credit_approach not_in ["bottom_up","top_down","factor","synthetic","spread_curve","global","structured"], then emit credit.strategy.rejected. _Why: Unsupported credit approach._ *(error: `CREDIT_INVALID_APPROACH`)*

## Errors it can return

- `CREDIT_INVALID_APPROACH` — credit_approach must be one of the supported credit strategies

## Events

**`credit.strategy.implemented`**
  Payload: `strategy_id`, `credit_approach`, `spread_duration`, `oas`, `dts`, `expected_excess_return`

**`credit.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **yield-curve-strategies-l3** *(recommended)*
- **fixed-income-portfolio-management-l3** *(required)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fi-active-credit-strategies-l3/) · **Spec source:** [`fi-active-credit-strategies-l3.blueprint.yaml`](./fi-active-credit-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
