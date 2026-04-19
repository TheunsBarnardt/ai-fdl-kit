---
title: "Real Estate Investment L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse real estate investments — property types, risk factors, appraisal vs transaction indexes, REIT structures, NAV per share, FFO/AFFO multiples, private vs"
---

# Real Estate Investment L2 Blueprint

> Analyse real estate investments — property types, risk factors, appraisal vs transaction indexes, REIT structures, NAV per share, FFO/AFFO multiples, private vs public comparison

| | |
|---|---|
| **Feature** | `real-estate-investment-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | alternative-investments, real-estate, reits, nav, ffo, affo, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/real-estate-investment-l2.blueprint.yaml) |
| **JSON API** | [real-estate-investment-l2.json]({{ site.baseurl }}/api/blueprints/trading/real-estate-investment-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `re_analyst` | Real Estate Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `property_id` | text | Yes | Property or REIT identifier |  |
| `valuation_approach` | select | Yes | nav \| income \| multiples \| comparables |  |

## Rules

- **basic_forms:**
  - **direct_ownership:** Physical property; illiquid; large lot size
  - **mortgage:** Debt secured by real estate
  - **pooled:** REOC, REIT, commingled funds
- **characteristics:**
  - **heterogeneous:** No two properties identical
  - **illiquid:** High transaction costs, long time to sell
  - **income_producing:** Rent provides predictable cash flow
  - **leverage:** Debt commonly used to enhance return
- **risk_factors:**
  - **business_risk:** Tenant concentration, vacancy
  - **financial_risk:** Leverage amplifies volatility
  - **liquidity_risk:** Illiquidity in private markets
  - **inflation_risk:** Leases may lag CPI
  - **environmental:** Regulatory, remediation liabilities
- **property_types:**
  - **office:** Long leases, cyclical demand
  - **retail:** Shopping malls; disrupted by e-commerce
  - **industrial:** Warehouses; benefiting from logistics growth
  - **residential:** Multifamily apartments; recession-resilient
  - **hotel:** Short-term; high operating leverage
  - **healthcare:** Long lease; government reimbursement risk
- **economic_value_drivers:**
  - **gdp_employment:** Drive office and industrial demand
  - **demographics:** Drive residential and healthcare
  - **interest_rates:** Cap rate expansion = price decline
  - **construction_pipeline:** New supply constrains rent growth
- **indexes:**
  - **appraisal_based:** NCREIF; lagged, smoothed; understates volatility
  - **transaction_based:** Hedonic regression on actual sales; better accuracy
  - **real_estate_security:** REIT indexes; liquid but equity-correlated
- **reit_structures:**
  - **equity_reit:** Own and operate properties
  - **mortgage_reit:** Invest in mortgages or MBS; interest income
  - **hybrid:** Both property and mortgage
  - **us_requirements:** 90% taxable income distributed; tax-transparent
- **reit_valuation_nav:**
  - **nav_calculation:** Estimate market value of properties less liabilities
  - **navps:** NAV ÷ shares outstanding
  - **accounting:** REIT books investment property at cost or FV depending on GAAP/IFRS
  - **premium_discount:** REIT trades at premium when market expects growth above NAV
- **reit_valuation_multiples:**
  - **ffo:** Net income + D&A − gains on sales
  - **affo:** FFO − capex maintenance; better cash proxy
  - **p_ffo:** Price ÷ FFO; main relative metric
  - **p_affo:** Price ÷ AFFO; sustainability check
  - **advantages:** Removes non-cash and one-off distortions
- **private_vs_public:**
  - **private:** Core, value-add, opportunistic; illiquid; lower correlation to equities
  - **public:** Highly liquid; correlated with equities short-term; daily pricing
- **validation:**
  - **property_required:** property_id present
  - **valid_approach:** valuation_approach in [nav, income, multiples, comparables]

## Outcomes

### Analyse_real_estate (Priority: 1)

_Analyse real estate investment_

**Given:**
- `property_id` (input) exists
- `valuation_approach` (input) in `nav,income,multiples,comparables`

**Then:**
- **call_service** target: `re_analyst`
- **emit_event** event: `real_estate.analysed`

### Invalid_approach (Priority: 10) — Error: `RE_INVALID_APPROACH`

_Unsupported valuation approach_

**Given:**
- `valuation_approach` (input) not_in `nav,income,multiples,comparables`

**Then:**
- **emit_event** event: `real_estate.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RE_INVALID_APPROACH` | 400 | valuation_approach must be one of the supported approaches | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `real_estate.analysed` |  | `property_id`, `valuation_approach`, `navps`, `p_ffo`, `p_affo`, `implied_cap_rate` |
| `real_estate.rejected` |  | `property_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| private-company-valuation-l2 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Real Estate Investment L2 Blueprint",
  "description": "Analyse real estate investments — property types, risk factors, appraisal vs transaction indexes, REIT structures, NAV per share, FFO/AFFO multiples, private vs",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alternative-investments, real-estate, reits, nav, ffo, affo, cfa-level-2"
}
</script>
