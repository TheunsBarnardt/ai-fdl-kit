---
title: "Capital Flows Balance Of Payments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Decompose the balance of payments into current, capital, and financial accounts and analyse how capital flows interact with savings, investment, and the exchang"
---

# Capital Flows Balance Of Payments Blueprint

> Decompose the balance of payments into current, capital, and financial accounts and analyse how capital flows interact with savings, investment, and the exchange rate

| | |
|---|---|
| **Feature** | `capital-flows-balance-of-payments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, balance-of-payments, current-account, capital-account, savings-investment, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capital-flows-balance-of-payments.blueprint.yaml) |
| **JSON API** | [capital-flows-balance-of-payments.json]({{ site.baseurl }}/api/blueprints/trading/capital-flows-balance-of-payments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `bop_analyst` | Balance of Payments Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Country |  |
| `current_account_pct_gdp` | number | Yes | Current account balance as percent of GDP |  |
| `capital_account_pct_gdp` | number | No | Capital account balance as percent of GDP |  |
| `financial_account_pct_gdp` | number | No | Financial account balance as percent of GDP |  |
| `reserves_change_pct_gdp` | number | No | Official reserve asset change |  |

## Rules

- **accounts:**
  - **current_account:** Trade in goods/services + primary income (wages, investment income) + secondary income (transfers)
  - **capital_account:** Capital transfers and non-produced non-financial assets (usually small)
  - **financial_account:** Direct investment, portfolio investment, other investment, reserves
- **identity:**
  - **formula:** CA + KA + FA = 0 (with reserves and errors & omissions)
  - **interpretation:** Trade deficit is financed by net foreign asset purchases (FA surplus)
- **savings_investment:**
  - **identity:** CA = S - I (national savings minus investment)
  - **surplus_country:** S > I -> capital exporter
  - **deficit_country:** I > S -> capital importer
- **twin_deficits:**
  - **mechanism:** Fiscal deficit (G > T) lowers national savings -> wider CA deficit
- **hot_money_risk:**
  - **characteristic:** Short-term portfolio flows reverse quickly
  - **vulnerability:** Rising external financing needs increase FX and rates risk
- **applications:**
  - **fx_forecasting:** Persistent CA deficits often weaken currency over medium term
  - **sovereign_analysis:** Rising external debt + CA deficit -> sovereign risk premium rises
  - **equity_macro:** Net exporters benefit from global demand; importers from domestic demand
- **validation:**
  - **jurisdiction_required:** jurisdiction present
  - **bop_reasonable:** |current_account_pct_gdp| <= 50

## Outcomes

### Assess_external_position (Priority: 1)

_Assess sustainability of external position_

**Given:**
- `jurisdiction` (input) exists
- `current_account_pct_gdp` (input) exists

**Then:**
- **call_service** target: `bop_analyst`
- **emit_event** event: `bop.position_assessed`

### Unsustainable_deficit (Priority: 2)

_Deficit financed by unstable flows_

**Given:**
- `unsustainable_flag` (computed) eq `true`

**Then:**
- **emit_event** event: `bop.sustainability_warning`

### Missing_jurisdiction (Priority: 10) — Error: `BOP_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `bop.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BOP_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bop.position_assessed` |  | `assessment_id`, `jurisdiction`, `current_account`, `financing_mix`, `sustainability_flag` |
| `bop.sustainability_warning` |  | `assessment_id`, `reason` |
| `bop.assessment_rejected` |  | `assessment_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| exchange-rate-regimes | recommended |  |
| fiscal-deficits-debt | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capital Flows Balance Of Payments Blueprint",
  "description": "Decompose the balance of payments into current, capital, and financial accounts and analyse how capital flows interact with savings, investment, and the exchang",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, balance-of-payments, current-account, capital-account, savings-investment, cfa-level-1"
}
</script>
