---
title: "Esg Investment Analysis L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate ESG considerations — ownership structures, board practices, remuneration, voting rights, material ESG risks and opportunities, and integration into inv"
---

# Esg Investment Analysis L2 Blueprint

> Evaluate ESG considerations — ownership structures, board practices, remuneration, voting rights, material ESG risks and opportunities, and integration into investment analysis

| | |
|---|---|
| **Feature** | `esg-investment-analysis-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, esg, governance, stewardship, materiality, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/esg-investment-analysis-l2.blueprint.yaml) |
| **JSON API** | [esg-investment-analysis-l2.json]({{ site.baseurl }}/api/blueprints/trading/esg-investment-analysis-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `esg_analyst` | ESG Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `integration_approach` | select | Yes | exclusion \| best_in_class \| thematic \| impact \| integration |  |

## Rules

- **ownership_structures:**
  - **dispersed:** No single shareholder with material control; principal-agent problem dominant
  - **concentrated:** Controlling shareholder; principal-principal conflict with minorities
- **types_of_influential_shareholders:**
  - **founders_families:** Long horizons; can entrench management
  - **governments:** Strategic objectives override commercial
  - **institutional:** Active managers, index funds, pension funds
  - **activist:** Campaign for governance or strategic change
  - **cross_holdings:** Mutual cross-ownership dilutes accountability
- **governance_evaluation:**
  - **board_policies:** Independence, diversity, tenure, committees
  - **executive_remuneration:** Alignment with long-term value; malus and clawback
  - **shareholder_voting:** One-share-one-vote vs dual class; proxy access
  - **minority_protection:** Pre-emptive rights, tag-along, independent directors
- **esg_risks_opportunities:**
  - **materiality:** ESG factors that affect financial performance by sector
  - **investment_horizon:** Longer horizon widens ESG relevance
  - **environmental_factors:** Climate transition, physical risk, resource scarcity
  - **social_factors:** Labour practices, product safety, community relations
  - **governance_factors:** Audit integrity, board, compensation, ethics
- **integration_approaches:**
  - **exclusion:** Remove sectors/firms on values grounds
  - **best_in_class:** Tilt toward top ESG performers within sector
  - **thematic:** Invest in specific themes (clean energy, water)
  - **impact:** Target measurable social/environmental outcomes alongside return
  - **integration:** Systematically incorporate ESG into traditional analysis
- **examples_of_integration:**
  - **adjust_cost_of_capital:** Higher WACC for elevated ESG risk
  - **adjust_cash_flow_forecast:** Penalise lower revenue or higher costs
  - **valuation_multiple:** Lower multiple for governance red flags
- **validation:**
  - **company_required:** company_id present
  - **valid_approach:** integration_approach in [exclusion, best_in_class, thematic, impact, integration]

## Outcomes

### Integrate_esg (Priority: 1)

_Integrate ESG considerations into investment analysis_

**Given:**
- `company_id` (input) exists
- `integration_approach` (input) in `exclusion,best_in_class,thematic,impact,integration`

**Then:**
- **call_service** target: `esg_analyst`
- **emit_event** event: `esg.integrated`

### Invalid_approach (Priority: 10) — Error: `ESG_INVALID_APPROACH`

_Unsupported integration approach_

**Given:**
- `integration_approach` (input) not_in `exclusion,best_in_class,thematic,impact,integration`

**Then:**
- **emit_event** event: `esg.integration_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ESG_INVALID_APPROACH` | 400 | integration_approach must be one of the supported approaches | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `esg.integrated` |  | `company_id`, `integration_approach`, `key_risks`, `adjusted_cost_of_capital` |
| `esg.integration_rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dividends-share-repurchases-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Esg Investment Analysis L2 Blueprint",
  "description": "Evaluate ESG considerations — ownership structures, board practices, remuneration, voting rights, material ESG risks and opportunities, and integration into inv",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, esg, governance, stewardship, materiality, cfa-level-2"
}
</script>
