<!-- AUTO-GENERATED FROM asset-allocation-constraints-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Asset Allocation Constraints L3

> Asset allocation under real-world constraints — asset size, liquidity, time horizon, taxes, regulatory limits, TAA, and behavioral biases

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · asset-allocation · tax-aware-investing · tactical-asset-allocation · behavioral-finance · regulatory-constraints · cfa-level-3

## What this does

Asset allocation under real-world constraints — asset size, liquidity, time horizon, taxes, regulatory limits, TAA, and behavioral biases

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **allocation_id** *(text, required)* — Allocation identifier
- **constraint_type** *(select, required)* — size | liquidity | time_horizon | regulatory | tax | behavioral

## What must be true

- **asset_size_constraints → small_portfolios:** Cannot access illiquid alternatives; high relative transaction costs; limited diversification
- **asset_size_constraints → large_portfolios:** Market impact limits position size in small-cap and illiquid markets; must use separate accounts
- **asset_size_constraints → size_advantage:** Large funds have access to private equity, infrastructure, direct real estate; lower fees via negotiation
- **asset_size_constraints → illiquid_premium:** Larger portfolios can harvest illiquidity premium unavailable to small investors
- **liquidity_constraints → operating_needs:** Maintain liquid reserves for ongoing distributions, expenses, and redemptions
- **liquidity_constraints → liability_matching:** Liquid assets must cover near-term liabilities; illiquid allocation only from long-horizon surplus
- **liquidity_constraints → stressed_liquidity:** Stress-test liquidity under market dislocations; private assets may become illiquid simultaneously
- **time_horizon → human_capital:** Changing human capital (labor income) over life alters economic balance sheet → glide path
- **time_horizon → liability_character:** As liabilities approach, reduce risk; immunize rather than grow
- **time_horizon → long_horizon:** Longer horizon allows more illiquidity, higher equity; shorter horizons need liquidity and stability
- **regulatory_constraints → insurance_cos:** Regulatory capital requirements; match duration of assets to liabilities; credit quality limits
- **regulatory_constraints → pension_funds:** Funding ratio requirements; liability-matching mandates; ALM frameworks
- **regulatory_constraints → endowments:** Perpetual horizon; spending rules (typically 4-5% per annum); broader alternative access
- **regulatory_constraints → foundations:** Mandatory distribution rules (5% in US); similar to endowments; mission-related investing
- **regulatory_constraints → swfs:** Objectives vary by mandate (stabilization vs savings); often long horizon; complex governance
- **tax_aware_investing → after_tax_return:** Focus on after-tax expected return and risk; asset location matters
- **tax_aware_investing → asset_location:** Place tax-inefficient assets (bonds, REITs) in tax-deferred; equities in taxable accounts
- **tax_aware_investing → rebalancing_taxes:** Use new contributions, distributions, loss harvesting to rebalance before selling
- **tax_aware_investing → loss_harvesting:** Realize capital losses to offset gains; defer realization of gains
- **tax_aware_investing → after_tax_optimization:** Optimize on after-tax returns and after-tax risk; complicates MVO inputs
- **saa_revision → goals_change:** Revise SAA when investor goals materially change
- **saa_revision → constraints_change:** Revise SAA when constraints (regulatory, liquidity, time horizon) change
- **saa_revision → beliefs_change:** Revise SAA when long-run CME views materially shift; avoid excessive turnover
- **tactical_asset_allocation → discretionary_taa:** Subjective judgment-based deviations from SAA; depends on manager skill
- **tactical_asset_allocation → systematic_taa:** Rules-based signals (value, momentum, carry); disciplined; backtestable
- **tactical_asset_allocation → taa_sizing:** Size TAA bets in proportion to conviction and available risk budget vs SAA
- **tactical_asset_allocation → evaluation:** Judge TAA by information ratio vs SAA benchmark; not absolute return
- **behavioral_biases → loss_aversion:** Investors feel losses more than equal gains → under-allocate to risky assets; hold losers too long
- **behavioral_biases → illusion_of_control:** Overconfidence in ability to time market → excessive TAA; higher turnover
- **behavioral_biases → mental_accounting:** Segregate money into buckets; consistent with goals-based but may sub-optimize overall
- **behavioral_biases → representativeness:** Extrapolate recent performance → chase winners; buy high, sell low
- **behavioral_biases → framing:** Presentation of choices affects decision; annual vs multi-year framing changes risk tolerance
- **behavioral_biases → availability:** Weight recent vivid events (2008 crisis) too heavily → excessive defensiveness long after
- **validation → allocation_required:** allocation_id present
- **validation → valid_constraint:** constraint_type in [size, liquidity, time_horizon, regulatory, tax, behavioral]

## Success & failure scenarios

**✅ Success paths**

- **Apply Constraint** — when allocation_id exists; constraint_type in ["size","liquidity","time_horizon","regulatory","tax","behavioral"], then call service; emit allocation.constrained. _Why: Apply real-world constraint to asset allocation._

**❌ Failure paths**

- **Invalid Constraint** — when constraint_type not_in ["size","liquidity","time_horizon","regulatory","tax","behavioral"], then emit allocation.constraint_rejected. _Why: Unsupported constraint type._ *(error: `CONSTRAINT_INVALID_TYPE`)*

## Errors it can return

- `CONSTRAINT_INVALID_TYPE` — constraint_type must be one of size, liquidity, time_horizon, regulatory, tax, behavioral

## Events

**`allocation.constrained`**
  Payload: `allocation_id`, `constraint_type`, `adjusted_weights`, `expected_after_tax_return`

**`allocation.constraint_rejected`**
  Payload: `allocation_id`, `reason_code`

## Connects to

- **overview-asset-allocation-l3** *(required)*
- **principles-asset-allocation-l3** *(required)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/asset-allocation-constraints-l3/) · **Spec source:** [`asset-allocation-constraints-l3.blueprint.yaml`](./asset-allocation-constraints-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
