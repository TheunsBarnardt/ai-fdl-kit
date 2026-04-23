<!-- AUTO-GENERATED FROM capital-market-expectations-macro-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Capital Market Expectations Macro L3

> Develop capital market expectations — CME framework, forecasting challenges, GDP growth decomposition, econometric and indicator approaches, business cycle phases, monetary and fiscal policy

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · capital-market-expectations · business-cycle · gdp-growth · monetary-policy · cfa-level-3

## What this does

Develop capital market expectations — CME framework, forecasting challenges, GDP growth decomposition, econometric and indicator approaches, business cycle phases, monetary and fiscal policy

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **forecast_id** *(text, required)* — Forecast identifier
- **analysis_type** *(select, required)* — gdp_growth | business_cycle | monetary_policy | fiscal_policy | international

## What must be true

- **cme_framework → definition:** CME = long-run forecasts of risk/return characteristics of asset classes
- **cme_framework → use_in_ips:** Drive strategic asset allocation; tactical shifts
- **cme_framework → time_horizons:** Capital market cycle (3-5 yr); business cycle (1-2 yr)
- **forecasting_challenges → data_limitations:** Revisions, measurement error, definitional changes
- **forecasting_challenges → historical_bias:** Ex post smoothing, survivorship, sample period selection
- **forecasting_challenges → ex_ante_ex_post:** Historical risk understates true ex ante uncertainty
- **forecasting_challenges → analyst_biases:** Anchoring, availability, herding, overconfidence
- **forecasting_challenges → model_uncertainty:** No model is universally correct; regime change breaks calibrations
- **forecasting_challenges → conditioning_info:** Ignoring current cycle phase biases mean estimates
- **gdp_growth_decomposition → formula:** GDP growth = labour growth + productivity growth
- **gdp_growth_decomposition → labour:** Working-age population growth + labour participation changes
- **gdp_growth_decomposition → productivity:** Capital deepening + TFP growth
- **gdp_growth_decomposition → anchoring:** Long-run asset returns anchor to long-run GDP growth
- **gdp_growth_decomposition → emerging_markets:** Higher growth from catch-up; convergence over time
- **forecasting_approaches → econometric:** Structural or reduced-form models; data-intensive; fragile to regime change
- **forecasting_approaches → economic_indicators:** Leading, lagging, coincident; diffusion indexes
- **forecasting_approaches → checklist:** Qualitative scoring of macro factors; flexible; subjective
- **business_cycle_phases → early_expansion:** Recovery begins; unemployment peaks; easy policy; credits outperform
- **business_cycle_phases → expansion:** Growth above trend; inflation rises; equities perform well
- **business_cycle_phases → peak:** Growth slowing; inflation high; policy tightening; yield curve flat/inverts
- **business_cycle_phases → recession:** Negative growth; unemployment rising; easing; defensives outperform
- **business_cycle_phases → asset_class_rotation:** Risk assets → defensives → risk assets across cycle
- **inflation_deflation → inflation_types:** Demand-pull, cost-push, monetary
- **inflation_deflation → deflation_risk:** Debt deflation spiral; cash/govts outperform
- **inflation_deflation → break_even_inflation:** Market measure of expected inflation from TIPS vs nominal
- **monetary_policy → transmission:** Rate → credit conditions → investment → GDP
- **monetary_policy → zero_lower_bound:** QE, forward guidance when rates at zero
- **monetary_policy → negative_rates:** Distorts bank margins; may reduce effectiveness
- **monetary_policy → yield_curve_impact:** Steepening under QE; flattening when tightening
- **fiscal_policy → stimulus:** Tax cuts or spending increases; crowding out at full employment
- **fiscal_policy → austerity:** Multiplier effects on GDP; timing matters
- **fiscal_policy → policy_mix:** Tight monetary + loose fiscal = high rates, growth
- **international_linkages → macro_linkages:** Trade and capital flows transmit shocks
- **international_linkages → interest_rate_fx:** Uncovered interest parity; carry trades
- **international_linkages → contagion:** Emerging market crises spread through FX and capital flows
- **validation → forecast_required:** forecast_id present
- **validation → valid_analysis:** analysis_type in [gdp_growth, business_cycle, monetary_policy, fiscal_policy, international]

## Success & failure scenarios

**✅ Success paths**

- **Develop Cme** — when forecast_id exists; analysis_type in ["gdp_growth","business_cycle","monetary_policy","fiscal_policy","international"], then call service; emit cme.developed. _Why: Develop capital market expectation using macro framework._

**❌ Failure paths**

- **Invalid Analysis** — when analysis_type not_in ["gdp_growth","business_cycle","monetary_policy","fiscal_policy","international"], then emit cme.rejected. _Why: Unsupported analysis type._ *(error: `CME_INVALID_ANALYSIS`)*

## Errors it can return

- `CME_INVALID_ANALYSIS` — analysis_type must be one of the supported types

## Events

**`cme.developed`**
  Payload: `forecast_id`, `analysis_type`, `gdp_growth_estimate`, `cycle_phase`, `policy_stance`

**`cme.rejected`**
  Payload: `forecast_id`, `reason_code`

## Connects to

- **capital-market-expectations-asset-class-l3** *(recommended)*

## Quality fitness 🟢 86/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/capital-market-expectations-macro-l3/) · **Spec source:** [`capital-market-expectations-macro-l3.blueprint.yaml`](./capital-market-expectations-macro-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
