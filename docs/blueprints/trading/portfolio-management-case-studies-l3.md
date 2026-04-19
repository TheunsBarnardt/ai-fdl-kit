---
title: "Portfolio Management Case Studies L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Applied portfolio management case studies — institutional liquidity management, ESG integration, lifecycle private wealth risk, and institutional enterprise ris"
---

# Portfolio Management Case Studies L3 Blueprint

> Applied portfolio management case studies — institutional liquidity management, ESG integration, lifecycle private wealth risk, and institutional enterprise risk management

| | |
|---|---|
| **Feature** | `portfolio-management-case-studies-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, case-study, liquidity-management, esg-integration, enterprise-risk-management, lifecycle-investing, institutional-risk, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-management-case-studies-l3.blueprint.yaml) |
| **JSON API** | [portfolio-management-case-studies-l3.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-management-case-studies-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `investment_committee` | Investment Committee | human |  |
| `portfolio_manager` | Portfolio Manager | human |  |
| `wealth_manager` | Wealth Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case study identifier |  |
| `case_type` | select | Yes | institutional_pm \| private_wealth_risk \| institutional_risk |  |

## Rules

- **institutional_pm_case:**
  - **liquidity_profiling:** Time-to-cash tables: classify assets by days/weeks/months to liquidate at target price
  - **rebalancing:** Maintain SAA amid market drift; use new contributions and derivatives before forced trading
  - **commitment_pacing:** Smooth private capital commitments over vintages; manage J-curve and capital call risk
  - **stress_testing:** Model liquidity under adverse scenario; identify forced selling trigger points
  - **derivatives_use:** Equitize cash with futures; hedge FX; manage duration; tactical tilts efficiently
  - **illiquidity_premium:** Capture illiquidity premium from PE, real assets, private credit; size to liquidity budget
  - **saa_process:** Define CME, risk tolerance, constraints; optimize; review annually
  - **taa:** Short-term deviations from SAA based on valuation and cycle signals; modest sizing
  - **manager_selection:** RFP process; qualitative and quantitative screen; operational DD; fee negotiation
  - **esg_integration:** Identify material ESG factors; integrate into manager selection and monitoring; stewardship
- **private_wealth_risk_case:**
  - **early_career:** High human capital; young dependents; life insurance priority; build emergency fund
  - **career_development:** Growing HC and FC; disability insurance; save aggressively; equity-heavy portfolio
  - **peak_accumulation:** HC declining; maximize retirement savings; long-term care planning; estate documents
  - **retirement:** HC zero; income replacement; sequence risk management; drawdown plan; annuity consideration
  - **lifecycle_integration:** Each life stage requires holistic balance sheet review and plan update
  - **risk_review_triggers:** Major life events: marriage, birth, divorce, death, inheritance, job change
- **institutional_risk_case:**
  - **financial_risks:** Market, credit, liquidity, counterparty, leverage, model risk; all interrelated
  - **long_term_perspective:** Short-term mark-to-market vs long-term risk to mission achievement
  - **illiquid_risks:** Valuation uncertainty; manager selection; capital commitment; exit risk
  - **liquidity_risk_mgmt:** Cascade of liquid assets; reserves; credit facilities; derivatives hedges
  - **enterprise_risk:** Integrate all risk types into unified framework; risk appetite statement
  - **environmental_risks:** Climate physical risk (asset stranding); transition risk (regulatory change)
  - **social_risks:** Labor practices; community impact; supply chain; material to long-term returns
  - **universal_ownership:** Large diversified investors own the whole market; externalities are internalized losses
  - **esg_case:** Material ESG factors must be integrated into investment process; stewardship enhances returns
- **validation:**
  - **case_required:** case_id present
  - **valid_case:** case_type in [institutional_pm, private_wealth_risk, institutional_risk]

## Outcomes

### Apply_case_study_framework (Priority: 1)

_Apply portfolio management framework from specified case study type_

**Given:**
- `case_id` (input) exists
- `case_type` (input) in `institutional_pm,private_wealth_risk,institutional_risk`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `case_study.framework.applied`

### Invalid_case (Priority: 10) — Error: `CASE_STUDY_INVALID_TYPE`

_Unsupported case type_

**Given:**
- `case_type` (input) not_in `institutional_pm,private_wealth_risk,institutional_risk`

**Then:**
- **emit_event** event: `case_study.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CASE_STUDY_INVALID_TYPE` | 400 | case_type must be one of institutional_pm, private_wealth_risk, institutional_risk | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `case_study.framework.applied` |  | `case_id`, `case_type`, `key_recommendations`, `risk_exposures_identified` |
| `case_study.rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| institutional-portfolio-management-l3 | required |  |
| private-wealth-management-overview-l3 | required |  |
| asset-allocation-alternatives-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Management Case Studies L3 Blueprint",
  "description": "Applied portfolio management case studies — institutional liquidity management, ESG integration, lifecycle private wealth risk, and institutional enterprise ris",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, case-study, liquidity-management, esg-integration, enterprise-risk-management, lifecycle-investing, institutional-risk, cfa-level-3"
}
</script>
