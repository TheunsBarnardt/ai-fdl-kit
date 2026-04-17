---
title: "Financial Reporting Quality Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Assess financial reporting quality along a spectrum from high quality to outright fraud using the quality-of-earnings and quality-of-reporting lens. 3 fields. 3"
---

# Financial Reporting Quality Blueprint

> Assess financial reporting quality along a spectrum from high quality to outright fraud using the quality-of-earnings and quality-of-reporting lens

| | |
|---|---|
| **Feature** | `financial-reporting-quality` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, reporting-quality, earnings-quality, aggressive-accounting, fraud-risk, beneish, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/financial-reporting-quality.blueprint.yaml) |
| **JSON API** | [financial-reporting-quality.json]({{ site.baseurl }}/api/blueprints/trading/financial-reporting-quality.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quality_analyst` | Reporting Quality Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `period` | text | Yes | Reporting period |  |
| `signals` | json | No | Quantitative and qualitative red-flag inputs |  |

## Rules

- **quality_spectrum:**
  - **high_quality:** GAAP compliant, decision-useful, sustainable earnings
  - **low_quality:** GAAP compliant but with biased choices
  - **non_compliant:** Not GAAP compliant but may be material or intentional
  - **fraud:** Intentional misrepresentation
- **motivations_to_distort:** Meet analyst expectations, Earn compensation targets, Avoid covenant breach, Support equity issuance, Tax minimisation (biases opposite direction)
- **common_techniques:**
  - **revenue_recognition:** Bill-and-hold, channel stuffing, gross vs net, upfront vs deferred
  - **expense_recognition:** Capitalising opex, delaying impairments, under-reserving warranties
  - **non_recurring_items:** Smoothing via reclassification to/from non-recurring
  - **off_balance_sheet:** VIEs, factoring, repo 105, non-consolidated JVs
- **red_flags:** Accruals growing faster than earnings, CFO diverging from net income, Low effective tax rate vs peers, Frequent non-recurring items, Management churn, auditor switch
- **analytical_tools:**
  - **beneish_m_score:** Composite score flagging earnings manipulation likelihood
  - **accruals_ratio:** (NI - CFO - CFI) / avg total assets
  - **altman_z_score:** Bankruptcy risk complement
- **conditions_for_fraud:**
  - **incentive:** Pressure to meet targets
  - **opportunity:** Weak controls and oversight
  - **rationalisation:** Culture that tolerates manipulation
- **validation:**
  - **entity_required:** entity_id present
  - **period_required:** period present

## Outcomes

### Score_reporting_quality (Priority: 1)

_Produce quality score and red-flag list_

**Given:**
- `entity_id` (input) exists
- `period` (input) exists

**Then:**
- **call_service** target: `quality_analyst`
- **emit_event** event: `quality.scored`

### High_risk_flag (Priority: 2)

_Elevated manipulation or fraud risk_

**Given:**
- `high_risk_flag` (computed) eq `true`

**Then:**
- **emit_event** event: `quality.warning`

### Missing_inputs (Priority: 10) — Error: `QUALITY_MISSING_INPUTS`

_Entity or period missing_

**Given:**
- ANY: `entity_id` (input) not_exists OR `period` (input) not_exists

**Then:**
- **emit_event** event: `quality.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QUALITY_MISSING_INPUTS` | 400 | entity_id and period are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `quality.scored` |  | `score_id`, `entity_id`, `period`, `composite_score`, `red_flags` |
| `quality.warning` |  | `score_id`, `reason` |
| `quality.rejected` |  | `score_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-framework | required |  |
| fsa-income-statement | recommended |  |
| fsa-cash-flow | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Financial Reporting Quality Blueprint",
  "description": "Assess financial reporting quality along a spectrum from high quality to outright fraud using the quality-of-earnings and quality-of-reporting lens. 3 fields. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, reporting-quality, earnings-quality, aggressive-accounting, fraud-risk, beneish, cfa-level-1"
}
</script>
