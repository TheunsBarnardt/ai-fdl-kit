---
title: "Financial Report Quality L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate quality of financial reports — Beneish M-score, Altman Z-score, accrual-based earnings quality, cash-flow quality, and warning signs of misreporting. 2"
---

# Financial Report Quality L2 Blueprint

> Evaluate quality of financial reports — Beneish M-score, Altman Z-score, accrual-based earnings quality, cash-flow quality, and warning signs of misreporting

| | |
|---|---|
| **Feature** | `financial-report-quality-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, report-quality, beneish, altman, earnings-quality, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/financial-report-quality-l2.blueprint.yaml) |
| **JSON API** | [financial-report-quality-l2.json]({{ site.baseurl }}/api/blueprints/trading/financial-report-quality-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quality_assessor` | Financial Report Quality Assessor | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company_id` | text | Yes | Company identifier |  |
| `assessment_type` | select | Yes | beneish \| altman \| earnings_quality \| cash_flow_quality \| balance_sheet_quality |  |

## Rules

- **conceptual_framework:**
  - **quality_spectrum:** High reporting quality = relevant + faithful representation; high earnings quality = sustainable + value-creating
  - **potential_problems:** Timing of recognition, classification, off-balance-sheet arrangements
- **steps_to_evaluate:**
  - **understand_business:** Industry, strategy, accounting policies
  - **identify_accounting_areas_at_risk:** Revenue recognition, estimates, non-GAAP measures
  - **compare_statements:** Year-over-year, peer, auditor letter
  - **quantitative_tools:** Apply M-score, Z-score, accrual ratios
- **beneish_m_score:**
  - **purpose:** Classify as earnings manipulator
  - **inputs:** DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA
  - **threshold:** M > -1.78 suggests likely manipulation
  - **limitations:** Calibrated to historical accounting frauds; false positives possible
- **altman_z_score:**
  - **purpose:** Bankruptcy prediction for public manufacturers
  - **formula:** Z = 1.2*WC/TA + 1.4*RE/TA + 3.3*EBIT/TA + 0.6*MVE/TL + 1.0*Sales/TA
  - **zones:** Z > 2.99 safe; 1.81 < Z < 2.99 grey; Z < 1.81 distress
  - **limitations:** Not designed for financials or private firms; recalibrations exist
- **earnings_quality_indicators:**
  - **persistence:** High proportion of cash-based earnings; low accruals
  - **accruals:** Total accruals / average NOA; high accruals portend reversal
  - **mean_reversion:** Extreme earnings revert; signals low persistence
  - **beating_benchmarks:** Suspicious clustering at zero EPS, analyst consensus, prior-year EPS
  - **external_indicators:** Restatements, SEC enforcement, auditor changes
- **cash_flow_quality:**
  - **sustainable_cfo:** Organic operating cash flow excluding one-off items
  - **earnings_cash_gap:** Persistent gap between net income and CFO
  - **classification_games:** Shifting items between operating/investing/financing
- **balance_sheet_quality:**
  - **completeness:** Off-balance-sheet exposures disclosed
  - **measurement:** FV hierarchy level 3 heavy reliance
  - **classification:** Appropriate split between operating/non-operating
- **case_lessons:**
  - **sunbeam_microstrategy:** Channel stuffing, side agreements, multi-element contracts
  - **worldcom:** Capitalising operating expenses; detect via asset growth vs revenue growth
- **validation:**
  - **company_required:** company_id present
  - **valid_assessment:** assessment_type in allowed set

## Outcomes

### Assess_quality (Priority: 1)

_Assess financial report quality_

**Given:**
- `company_id` (input) exists
- `assessment_type` (input) in `beneish,altman,earnings_quality,cash_flow_quality,balance_sheet_quality`

**Then:**
- **call_service** target: `quality_assessor`
- **emit_event** event: `quality.assessed`

### Invalid_assessment (Priority: 10) — Error: `QUALITY_INVALID_ASSESSMENT`

_Unsupported assessment type_

**Given:**
- `assessment_type` (input) not_in `beneish,altman,earnings_quality,cash_flow_quality,balance_sheet_quality`

**Then:**
- **emit_event** event: `quality.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QUALITY_INVALID_ASSESSMENT` | 400 | assessment_type must be one of beneish, altman, earnings_quality, cash_flow_quality, balance_sheet_quality | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `quality.assessed` |  | `company_id`, `assessment_type`, `score`, `risk_level`, `flags` |
| `quality.assessment_rejected` |  | `company_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| intercorporate-investments-l2 | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Financial Report Quality L2 Blueprint",
  "description": "Evaluate quality of financial reports — Beneish M-score, Altman Z-score, accrual-based earnings quality, cash-flow quality, and warning signs of misreporting. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, report-quality, beneish, altman, earnings-quality, cfa-level-2"
}
</script>
