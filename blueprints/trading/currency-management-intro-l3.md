<!-- AUTO-GENERATED FROM currency-management-intro-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Currency Management Intro L3

> Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · currency-management · fx-hedging · currency-risk · return-decomposition · cfa-level-3

## What this does

Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **mandate_id** *(text, required)* — Currency mandate identifier
- **hedge_approach** *(select, required)* — passive | discretionary | active | overlay

## What must be true

- **fx_market_structure → spot_market:** Immediate delivery (T+2); most liquid; driven by supply and demand
- **fx_market_structure → forward_market:** Agreement to exchange currencies at future date at today's forward rate
- **fx_market_structure → fx_swap:** Simultaneous spot sale and forward purchase; used to roll hedges; not a currency swap
- **fx_market_structure → currency_options:** Right to buy/sell currency; provides asymmetric protection; costs premium
- **return_decomposition → total_return:** R_total = R_local + R_FX (in portfolio currency)
- **return_decomposition → r_fx:** Percentage change in value of foreign currency vs domestic currency
- **return_decomposition → volatility_decomp:** σ²_total ≈ σ²_local + σ²_FX + 2·ρ·σ_local·σ_FX
- **return_decomposition → correlation_effect:** When ρ(local, FX) > 0: FX amplifies volatility; when ρ < 0: FX dampens volatility
- **portfolio_optimization → strategic_currency:** Optimal currency exposure depends on return, risk, and correlation of FX with asset
- **portfolio_optimization → hedging_decision:** Hedge if FX risk adds more volatility than return; consider carry cost
- **portfolio_optimization → carry:** Interest rate differential = forward premium/discount; cost/benefit of hedging
- **hedging_spectrum → passive:** Fully hedge all FX exposure back to domestic currency; no active currency bets
- **hedging_spectrum → discretionary:** Partial hedge with manager discretion to vary hedge ratio within policy bands
- **hedging_spectrum → active:** Currency managed as separate alpha source; may take positions beyond underlying exposure
- **hedging_spectrum → overlay:** Specialist currency manager overlaid on physical portfolio; manages FX separately
- **ips_currency_policy → strategic_benchmark:** Define benchmark hedge ratio (0%, 50%, 100%) in IPS
- **ips_currency_policy → hedge_ratio_tolerance:** Allowable deviation bands around benchmark hedge ratio
- **ips_currency_policy → currency_rebalancing:** When to rebalance hedge as underlying FX exposure changes
- **ips_currency_policy → permissible_instruments:** Define which FX instruments (forwards, options, NDFs) are permitted
- **factors_affecting_hedge_decision → transaction_costs:** Bid-ask spread on forward contracts; higher for exotic currencies
- **factors_affecting_hedge_decision → correlation_with_portfolio:** Negative correlation → natural hedge; reduces need for explicit hedging
- **factors_affecting_hedge_decision → investor_horizon:** Short-horizon investors more concerned with FX volatility than long-horizon
- **factors_affecting_hedge_decision → carry_cost:** High interest rate differentials increase cost of hedging high-yielding currencies
- **factors_affecting_hedge_decision → currency_alpha:** Active currency managers may add alpha; assess manager skill vs hedging cost
- **validation → mandate_required:** mandate_id present
- **validation → valid_approach:** hedge_approach in [passive, discretionary, active, overlay]

## Success & failure scenarios

**✅ Success paths**

- **Establish Currency Mandate** — when mandate_id exists; hedge_approach in ["passive","discretionary","active","overlay"], then call service; emit currency.mandate.established. _Why: Establish currency management approach for international portfolio._

**❌ Failure paths**

- **Invalid Approach** — when hedge_approach not_in ["passive","discretionary","active","overlay"], then emit currency.mandate.rejected. _Why: Unsupported hedge approach._ *(error: `CURRENCY_INVALID_APPROACH`)*

## Errors it can return

- `CURRENCY_INVALID_APPROACH` — hedge_approach must be one of passive, discretionary, active, overlay

## Events

**`currency.mandate.established`**
  Payload: `mandate_id`, `hedge_approach`, `benchmark_hedge_ratio`, `permitted_instruments`

**`currency.mandate.rejected`**
  Payload: `mandate_id`, `reason_code`

## Connects to

- **currency-management-program-l3** *(recommended)*
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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/currency-management-intro-l3/) · **Spec source:** [`currency-management-intro-l3.blueprint.yaml`](./currency-management-intro-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
