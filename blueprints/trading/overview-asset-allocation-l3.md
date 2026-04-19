<!-- AUTO-GENERATED FROM overview-asset-allocation-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Overview Asset Allocation L3

> Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · asset-allocation · strategic-asset-allocation · liability-relative · goals-based · rebalancing · cfa-level-3

## What this does

Asset allocation framework — governance, economic balance sheet, SAA approaches (asset-only, liability-relative, goals-based), implementation and rebalancing

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **allocation_id** *(text, required)* — Allocation identifier
- **approach** *(select, required)* — asset_only | liability_relative | goals_based

## What must be true

- **governance → definition:** Governance = framework for rights, responsibilities, and accountability in portfolio management
- **governance → ips:** Investment Policy Statement documents objectives, constraints, and asset allocation policy
- **governance → governance_audit:** Periodic review of governance structure for effectiveness and alignment with objectives
- **governance → rights_responsibilities:** Allocate decision rights to those with expertise and accountability
- **economic_balance_sheet → assets:** Financial assets + human capital (PV of future labor income) + PV of pension promises
- **economic_balance_sheet → liabilities:** Financial liabilities + PV of consumption goals + PV of pension obligations
- **economic_balance_sheet → extended_portfolio:** Asset allocation should reflect all economic assets and liabilities, not just financial
- **economic_balance_sheet → human_capital:** Young investors: large human capital → lower equity allocation in financial portfolio needed
- **asset_class_criteria → homogeneous:** Assets within class behave similarly
- **asset_class_criteria → diversifying:** Low correlation with other asset classes
- **asset_class_criteria → investable:** Accessible in sufficiently large amounts
- **asset_class_criteria → exhaustive:** Cover most of investable opportunity set
- **asset_class_criteria → exclusive:** Minimal overlap between classes
- **saa_approaches → asset_only:** Maximize risk-adjusted return without explicit liability reference; mean-variance optimization
- **saa_approaches → liability_relative:** Maximize surplus (assets minus liabilities); match liability duration and cash flows
- **saa_approaches → goals_based:** Allocate to sub-portfolios matched to individual life goals with specific time horizons and probabilities
- **relevant_risk_concepts → asset_only_risk:** Volatility of portfolio returns (standard deviation)
- **relevant_risk_concepts → liability_relative_risk:** Volatility of surplus or funding ratio
- **relevant_risk_concepts → goals_based_risk:** Probability of failing to achieve a specific goal
- **asset_class_risk_modeling → normal:** Mean-variance sufficient if returns approximately normal
- **asset_class_risk_modeling → fat_tails:** Use scenario analysis or simulation when returns are non-normal or crisis regimes matter
- **asset_class_risk_modeling → illiquid:** Adjust VCV for smoothing bias; use factor models
- **implementation → passive_active_weights:** Decide whether to deviate from SAA weights (tactical) and by how much
- **implementation → passive_active_classes:** Decide whether to implement each class via passive or active management
- **implementation → risk_budgeting:** Allocate active risk budget across asset classes; balance information ratio vs tracking error
- **rebalancing → strategic:** Maintain SAA weights; restore after market drift
- **rebalancing → corridor_width:** Wider corridors for low-vol, low-corr, high-tax-cost assets; narrower for high-vol, high-momentum
- **rebalancing → calendar_vs_trigger:** Calendar = periodic rebalance; trigger = rebalance when weights breach corridor
- **rebalancing → transaction_costs:** Wider corridors justified when trading costs are high relative to diversification benefit lost
- **validation → allocation_required:** allocation_id present
- **validation → valid_approach:** approach in [asset_only, liability_relative, goals_based]

## Success & failure scenarios

**✅ Success paths**

- **Develop Saa** — when allocation_id exists; approach in ["asset_only","liability_relative","goals_based"], then call service; emit saa.developed. _Why: Develop strategic asset allocation using specified approach._

**❌ Failure paths**

- **Invalid Approach** — when approach not_in ["asset_only","liability_relative","goals_based"], then emit saa.rejected. _Why: Unsupported allocation approach._ *(error: `SAA_INVALID_APPROACH`)*

## Errors it can return

- `SAA_INVALID_APPROACH` — approach must be one of asset_only, liability_relative, goals_based

## Events

**`saa.developed`**
  Payload: `allocation_id`, `approach`, `asset_class_weights`, `expected_return`, `expected_risk`

**`saa.rejected`**
  Payload: `allocation_id`, `reason_code`

## Connects to

- **capital-market-expectations-macro-l3** *(required)*
- **capital-market-expectations-asset-class-l3** *(required)*
- **principles-asset-allocation-l3** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/overview-asset-allocation-l3/) · **Spec source:** [`overview-asset-allocation-l3.blueprint.yaml`](./overview-asset-allocation-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
