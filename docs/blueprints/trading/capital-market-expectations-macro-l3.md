---
title: "Capital Market Expectations Macro L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Develop capital market expectations — CME framework, forecasting challenges, GDP growth decomposition, econometric and indicator approaches, business cycle phas"
---

# Capital Market Expectations Macro L3 Blueprint

> Develop capital market expectations — CME framework, forecasting challenges, GDP growth decomposition, econometric and indicator approaches, business cycle phases, monetary and fiscal policy

| | |
|---|---|
| **Feature** | `capital-market-expectations-macro-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, capital-market-expectations, business-cycle, gdp-growth, monetary-policy, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capital-market-expectations-macro-l3.blueprint.yaml) |
| **JSON API** | [capital-market-expectations-macro-l3.json]({{ site.baseurl }}/api/blueprints/trading/capital-market-expectations-macro-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `macro_strategist` | Macro Strategist | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `forecast_id` | text | Yes | Forecast identifier |  |
| `analysis_type` | select | Yes | gdp_growth \| business_cycle \| monetary_policy \| fiscal_policy \| international |  |

## Rules

- **cme_framework:**
  - **definition:** CME = long-run forecasts of risk/return characteristics of asset classes
  - **use_in_ips:** Drive strategic asset allocation; tactical shifts
  - **time_horizons:** Capital market cycle (3-5 yr); business cycle (1-2 yr)
- **forecasting_challenges:**
  - **data_limitations:** Revisions, measurement error, definitional changes
  - **historical_bias:** Ex post smoothing, survivorship, sample period selection
  - **ex_ante_ex_post:** Historical risk understates true ex ante uncertainty
  - **analyst_biases:** Anchoring, availability, herding, overconfidence
  - **model_uncertainty:** No model is universally correct; regime change breaks calibrations
  - **conditioning_info:** Ignoring current cycle phase biases mean estimates
- **gdp_growth_decomposition:**
  - **formula:** GDP growth = labour growth + productivity growth
  - **labour:** Working-age population growth + labour participation changes
  - **productivity:** Capital deepening + TFP growth
  - **anchoring:** Long-run asset returns anchor to long-run GDP growth
  - **emerging_markets:** Higher growth from catch-up; convergence over time
- **forecasting_approaches:**
  - **econometric:** Structural or reduced-form models; data-intensive; fragile to regime change
  - **economic_indicators:** Leading, lagging, coincident; diffusion indexes
  - **checklist:** Qualitative scoring of macro factors; flexible; subjective
- **business_cycle_phases:**
  - **early_expansion:** Recovery begins; unemployment peaks; easy policy; credits outperform
  - **expansion:** Growth above trend; inflation rises; equities perform well
  - **peak:** Growth slowing; inflation high; policy tightening; yield curve flat/inverts
  - **recession:** Negative growth; unemployment rising; easing; defensives outperform
  - **asset_class_rotation:** Risk assets → defensives → risk assets across cycle
- **inflation_deflation:**
  - **inflation_types:** Demand-pull, cost-push, monetary
  - **deflation_risk:** Debt deflation spiral; cash/govts outperform
  - **break_even_inflation:** Market measure of expected inflation from TIPS vs nominal
- **monetary_policy:**
  - **transmission:** Rate → credit conditions → investment → GDP
  - **zero_lower_bound:** QE, forward guidance when rates at zero
  - **negative_rates:** Distorts bank margins; may reduce effectiveness
  - **yield_curve_impact:** Steepening under QE; flattening when tightening
- **fiscal_policy:**
  - **stimulus:** Tax cuts or spending increases; crowding out at full employment
  - **austerity:** Multiplier effects on GDP; timing matters
  - **policy_mix:** Tight monetary + loose fiscal = high rates, growth
- **international_linkages:**
  - **macro_linkages:** Trade and capital flows transmit shocks
  - **interest_rate_fx:** Uncovered interest parity; carry trades
  - **contagion:** Emerging market crises spread through FX and capital flows
- **validation:**
  - **forecast_required:** forecast_id present
  - **valid_analysis:** analysis_type in [gdp_growth, business_cycle, monetary_policy, fiscal_policy, international]

## Outcomes

### Develop_cme (Priority: 1)

_Develop capital market expectation using macro framework_

**Given:**
- `forecast_id` (input) exists
- `analysis_type` (input) in `gdp_growth,business_cycle,monetary_policy,fiscal_policy,international`

**Then:**
- **call_service** target: `macro_strategist`
- **emit_event** event: `cme.developed`

### Invalid_analysis (Priority: 10) — Error: `CME_INVALID_ANALYSIS`

_Unsupported analysis type_

**Given:**
- `analysis_type` (input) not_in `gdp_growth,business_cycle,monetary_policy,fiscal_policy,international`

**Then:**
- **emit_event** event: `cme.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CME_INVALID_ANALYSIS` | 400 | analysis_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cme.developed` |  | `forecast_id`, `analysis_type`, `gdp_growth_estimate`, `cycle_phase`, `policy_stance` |
| `cme.rejected` |  | `forecast_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-market-expectations-asset-class-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capital Market Expectations Macro L3 Blueprint",
  "description": "Develop capital market expectations — CME framework, forecasting challenges, GDP growth decomposition, econometric and indicator approaches, business cycle phas",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, capital-market-expectations, business-cycle, gdp-growth, monetary-policy, cfa-level-3"
}
</script>
