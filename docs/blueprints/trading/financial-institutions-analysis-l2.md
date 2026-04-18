---
title: "Financial Institutions Analysis L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse banks via CAMELS framework and insurance (P&C, life/health) specifics — capital adequacy, asset quality, earnings, liquidity, market-risk sensitivity. 2"
---

# Financial Institutions Analysis L2 Blueprint

> Analyse banks via CAMELS framework and insurance (P&C, life/health) specifics — capital adequacy, asset quality, earnings, liquidity, market-risk sensitivity

| | |
|---|---|
| **Feature** | `financial-institutions-analysis-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, financial-institutions, camels, banks, insurance, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/financial-institutions-analysis-l2.blueprint.yaml) |
| **JSON API** | [financial-institutions-analysis-l2.json]({{ site.baseurl }}/api/blueprints/trading/financial-institutions-analysis-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_analyst` | Financial Institutions Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `institution_id` | text | Yes | Institution identifier |  |
| `institution_type` | select | Yes | bank \| pc_insurer \| life_insurer |  |

## Rules

- **what_makes_fis_different:**
  - **balance_sheet_centric:** Business model = managing balance sheet spread and risk
  - **regulated:** Global (Basel, IAIS) and national oversight
  - **systemic:** Interconnectedness creates contagion risk
- **camels:**
  - **capital_adequacy:** CET1 ratio, Tier 1 ratio, Total capital ratio vs Basel minimums plus buffers
  - **asset_quality:** Non-performing loan ratio, coverage ratio (reserves/NPLs), concentration
  - **management:** Experience, strategy execution, risk culture, governance
  - **earnings:** ROA, ROE, NIM, efficiency ratio, earnings volatility
  - **liquidity:** LCR (≥100%), NSFR (≥100%), loan-to-deposit ratio, HQLA mix
  - **sensitivity_to_market_risk:** Duration gap, VaR, stress tests, trading book exposure
- **non_camels_considerations:**
  - **government_support:** Implicit guarantee effects on cost of funding
  - **mission_business_model:** Retail vs wholesale vs universal
  - **competitive_position:** Market share, funding cost advantage
  - **corporate_culture_governance:** Risk appetite, board oversight
- **pc_insurance_analysis:**
  - **key_ratios:** Loss ratio, expense ratio, combined ratio (<100% = underwriting profit)
  - **reserves_adequacy:** Prior-year development
  - **reinsurance_usage:** Ceding ratio, retention, counterparty credit
  - **investment_portfolio:** Liquidity needs vs policyholder obligations
- **life_health_insurance_analysis:**
  - **key_ratios:** Mortality experience, persistence, expense ratio, return on embedded value
  - **asset_liability_matching:** Duration matching for long-tail liabilities
  - **risk_based_capital:** Regulatory solvency ratio (SCR, MCR)
  - **product_mix:** Interest-sensitive vs mortality-sensitive
- **validation:**
  - **institution_required:** institution_id present
  - **valid_type:** institution_type in [bank, pc_insurer, life_insurer]

## Outcomes

### Analyse_institution (Priority: 1)

_Analyse financial institution_

**Given:**
- `institution_id` (input) exists
- `institution_type` (input) in `bank,pc_insurer,life_insurer`

**Then:**
- **call_service** target: `fi_analyst`
- **emit_event** event: `fi.analysed`

### Invalid_type (Priority: 10) — Error: `FI_INVALID_TYPE`

_Unsupported institution type_

**Given:**
- `institution_type` (input) not_in `bank,pc_insurer,life_insurer`

**Then:**
- **emit_event** event: `fi.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_INVALID_TYPE` | 400 | institution_type must be bank, pc_insurer, or life_insurer | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fi.analysed` |  | `institution_id`, `institution_type`, `overall_rating`, `key_risks` |
| `fi.analysis_rejected` |  | `institution_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| intercorporate-investments-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Financial Institutions Analysis L2 Blueprint",
  "description": "Analyse banks via CAMELS framework and insurance (P&C, life/health) specifics — capital adequacy, asset quality, earnings, liquidity, market-risk sensitivity. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, financial-institutions, camels, banks, insurance, cfa-level-2"
}
</script>
