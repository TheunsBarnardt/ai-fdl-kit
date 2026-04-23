---
title: "Capital Market Expectations Asset Class L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman. 2 fields. 2 "
---

# Capital Market Expectations Asset Class L3 Blueprint

> Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman

| | |
|---|---|
| **Feature** | `capital-market-expectations-asset-class-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, capital-market-expectations, fixed-income-forecasting, equity-forecasting, real-estate, singer-terhaar, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capital-market-expectations-asset-class-l3.blueprint.yaml) |
| **JSON API** | [capital-market-expectations-asset-class-l3.json]({{ site.baseurl }}/api/blueprints/trading/capital-market-expectations-asset-class-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `macro_strategist` | Macro Strategist | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `forecast_id` | text | Yes | Forecast identifier |  |
| `asset_class` | select | Yes | fixed_income \| equity \| real_estate \| fx \| volatility |  |

## Rules

- **fi_forecasting_approaches:**
  - **dcf:** YTM ≈ expected return if horizon ≈ Macaulay duration; capital gain/loss and reinvestment effects offset
  - **horizon_vs_duration:** Short horizon → capital gain/loss dominates; long horizon → reinvestment dominates
  - **building_blocks:** Expected return = risk-free rate + term premium + credit premium + liquidity premium
- **fi_building_blocks:**
  - **risk_free:** Short-term default-free rate; tied to central bank policy rate; normalize when negative
  - **term_premium:** Proportional to duration; time-varying; driven by inflation uncertainty, recession-hedge ability, supply/demand, cycle
  - **credit_premium:** Embedded in spread net of expected defaults; countercyclical for IG; default clusters in recessions
  - **liquidity_premium:** Spread of non-sovereign vs sovereign for equivalent quality; increases with illiquidity factors
  - **credit_barbell:** Concentrate credit exposure at short maturities; take duration via long-maturity govts
- **em_bond_risks:**
  - **economic:** Fiscal deficit >4% GDP, debt/GDP >70-80%, CA deficit >4%, FX reserves <100% of ST debt
  - **political_legal:** Willingness to pay; property rights; history of restructuring/default
  - **thresholds:** Foreign debt >50% GDP or >200% CA receipts is danger zone
- **equity_forecasting:**
  - **historical:** Long-run average may be biased by survivorship, sample period, starting valuation
  - **grinold_kroner:** E(R) = D/P + g + repricing ≈ dividend yield + nominal earnings growth + P/E change
  - **risk_premium:** E(R) = risk-free + equity risk premium; ERP = equity return − bond return (historical or forward)
  - **singer_terhaar:** RP = φ × RP_global_integrated + (1-φ) × RP_segmented; φ = degree of integration
  - **integration_ranges:** DM equities: φ=0.75-0.90; EM equities/bonds: φ=0.50-0.75; real estate: ~0.50-0.75
- **em_equity_risks:**
  - **governance:** Weak disclosure, accounting standards, minority shareholder protections
  - **political:** Nationalization, regulatory seizure, capital controls, currency inconvertibility
  - **informational:** Less efficient pricing; country risk dominates industry risk in EM
- **real_estate_forecasting:**
  - **cap_rate_model:** E(R) = cap rate + NOI growth rate − %Δcap rate (analogous to Grinold-Kroner)
  - **noi_growth:** Long-run NOI growth ≈ GDP growth; inflation component separable
  - **smoothing_bias:** Appraisal-based returns are smoothed; understate true volatility and contemporaneous correlation
  - **unsmoothing:** Apply time-series model to recover true volatility; required before risk modelling
  - **boom_bust:** Overbuilding → excess supply → long absorption; supply inelastic short term
- **fx_forecasting:**
  - **ppp:** Long-run: inflation differential determines FX trend; short-run: deviations persist
  - **current_account:** Persistent CA deficit → currency depreciation; trade competitiveness channel
  - **capital_flows:** Higher real rates attract capital → currency appreciation; carry trade
  - **uip:** E(ΔFX) = interest rate differential; implies no excess return to carry in equilibrium
- **volatility_forecasting:**
  - **sample_vcv:** Historical sample VCV; simple but unstable with many assets
  - **factor_vcv:** Multi-factor model constrains VCV; reduces estimation error; more stable
  - **shrinkage:** Blend sample VCV and factor/target VCV; reduces extreme estimates
  - **smoothed_returns:** Unsmooth appraisal/PE returns before computing VCV; else understate true risk
  - **arch:** ARCH/GARCH models time-varying volatility; conditional variance clusters in turbulent periods
- **black_litterman:**
  - **step1:** Start from market-cap equilibrium returns (reverse optimization from CAPM)
  - **step2:** Express analyst views as expected return deviations with confidence levels
  - **step3:** Blend equilibrium and views proportionally to confidence → updated expected returns
  - **step4:** Run MVO with updated returns; produces diversified, intuitive portfolios
  - **advantage:** Eliminates corner solutions and extreme weights common in unconstrained MVO
- **validation:**
  - **forecast_required:** forecast_id present
  - **valid_asset:** asset_class in [fixed_income, equity, real_estate, fx, volatility]

## Outcomes

### Develop_asset_class_forecast (Priority: 1)

_Develop expected return forecast for a specified asset class_

**Given:**
- `forecast_id` (input) exists
- `asset_class` (input) in `fixed_income,equity,real_estate,fx,volatility`

**Then:**
- **call_service** target: `macro_strategist`
- **emit_event** event: `cme.asset_class.developed`

### Invalid_asset_class (Priority: 10) — Error: `CME_INVALID_ASSET_CLASS`

_Unsupported asset class_

**Given:**
- `asset_class` (input) not_in `fixed_income,equity,real_estate,fx,volatility`

**Then:**
- **emit_event** event: `cme.asset_class.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CME_INVALID_ASSET_CLASS` | 400 | asset_class must be one of fixed_income, equity, real_estate, fx, volatility | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cme.asset_class.developed` |  | `forecast_id`, `asset_class`, `expected_return`, `risk_premium`, `methodology` |
| `cme.asset_class.rejected` |  | `forecast_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| capital-market-expectations-macro-l3 | required |  |

## AGI Readiness

### Goals

#### Reliable Capital Market Expectations Asset Class L3

Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `capital_market_expectations_macro_l3` | capital-market-expectations-macro-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| develop_asset_class_forecast | `autonomous` | - | - |
| invalid_asset_class | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capital Market Expectations Asset Class L3 Blueprint",
  "description": "Forecast asset class returns — FI building blocks, equity DCF/risk-premium, real estate cap rates, FX, volatility, Singer-Terhaar, Black-Litterman. 2 fields. 2 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, capital-market-expectations, fixed-income-forecasting, equity-forecasting, real-estate, singer-terhaar, cfa-level-3"
}
</script>
