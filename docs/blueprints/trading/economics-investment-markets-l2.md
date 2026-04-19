---
title: "Economics Investment Markets L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Link economics to investment markets — PV model, real default-free rates, business cycle effects on yield curve, credit premium, equity risk premium, and commer"
---

# Economics Investment Markets L2 Blueprint

> Link economics to investment markets — PV model, real default-free rates, business cycle effects on yield curve, credit premium, equity risk premium, and commercial real estate pricing

| | |
|---|---|
| **Feature** | `economics-investment-markets-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, economics, business-cycle, yield-curve, erp, credit-premium, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/economics-investment-markets-l2.blueprint.yaml) |
| **JSON API** | [economics-investment-markets-l2.json]({{ site.baseurl }}/api/blueprints/trading/economics-investment-markets-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `macro_strategist` | Macro Investment Strategist | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_class` | text | Yes | Asset class identifier |  |
| `analysis_type` | select | Yes | real_rates \| yield_curve \| credit \| equity \| real_estate |  |

## Rules

- **present_value_model:**
  - **framework:** Asset price = PV of expected future cash flows at risk-adjusted discount rate
  - **discount_rate:** Risk-free + relevant risk premia
  - **expectations:** Price reflects consensus cash flow and discount rate expectations
- **real_default_free_rates:**
  - **short_run:** Set by monetary policy; tracks inflation expectations
  - **long_run:** Co-moves with trend real GDP growth (Fisher)
  - **cyclicality:** Rise in expansion, fall in recession
  - **uncertainty_premium:** Compensation for real rate uncertainty over investment horizon
- **business_cycle_and_rates:**
  - **early_expansion:** Short rates rising; curve steep
  - **peak:** Short rates highest; curve may invert
  - **recession:** Rates cut; curve steepens; credit spreads widen
  - **recovery:** Rates low; curve steep; risk assets rally
- **yield_curve_cycle:**
  - **short_rate_tbills:** Tracks central bank policy; most cyclical
  - **term_spread:** Long − short; leading indicator of economic activity
  - **break_even_inflation:** Nominal − real (TIPS) yield; market-implied inflation
  - **slope_as_predictor:** Inverted curve has historically preceded recession by 12-18 months
- **credit_premium:**
  - **definition:** Yield spread over default-free for default risk + liquidity
  - **cyclicality:** Widens in recession; tightens in expansion
  - **sovereign_credit:** Distinct from corporate; driven by fiscal position, FX reserves
  - **industry_factors:** Sector cyclicality affects credit quality
- **equity_risk_premium:**
  - **definition:** Expected equity return above risk-free
  - **bad_consumption_outcomes:** Equities fall in recessions — compensation required
  - **earnings_cycle:** Corporate profits highly pro-cyclical
  - **valuation_multiples:** P/E expands when growth expected; contracts in stress
  - **size_of_erp:** Historically 3-6% long-run for developed markets
- **commercial_real_estate:**
  - **pricing_formula:** V = NOI / cap_rate
  - **cap_rate_cycle:** Falls in expansion (prices rise); rises in recession (prices fall)
  - **cash_flow_cycle:** Vacancy rises in recession; rents fall
  - **real_estate_cycle_lag:** Follows economic cycle with 1-2 quarter lag
- **validation:**
  - **asset_required:** asset_class present
  - **valid_analysis:** analysis_type in [real_rates, yield_curve, credit, equity, real_estate]

## Outcomes

### Analyse_macro_investment (Priority: 1)

_Analyse economics and investment market linkage_

**Given:**
- `asset_class` (input) exists
- `analysis_type` (input) in `real_rates,yield_curve,credit,equity,real_estate`

**Then:**
- **call_service** target: `macro_strategist`
- **emit_event** event: `macro.analysed`

### Invalid_analysis (Priority: 10) — Error: `MACRO_INVALID_ANALYSIS`

_Unsupported analysis type_

**Given:**
- `analysis_type` (input) not_in `real_rates,yield_curve,credit,equity,real_estate`

**Then:**
- **emit_event** event: `macro.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MACRO_INVALID_ANALYSIS` | 400 | analysis_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `macro.analysed` |  | `asset_class`, `analysis_type`, `cycle_phase`, `risk_premium_estimate`, `relative_value` |
| `macro.rejected` |  | `asset_class`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| term-structure-interest-rate-dynamics-l2 | recommended |  |
| active-portfolio-management-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Economics Investment Markets L2 Blueprint",
  "description": "Link economics to investment markets — PV model, real default-free rates, business cycle effects on yield curve, credit premium, equity risk premium, and commer",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, economics, business-cycle, yield-curve, erp, credit-premium, cfa-level-2"
}
</script>
