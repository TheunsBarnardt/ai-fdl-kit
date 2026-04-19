---
title: "Gips Standards L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Global Investment Performance Standards (GIPS) — firm definition, composites, time-weighted return, valuation, presentation requirements, portability, and verif"
---

# Gips Standards L3 Blueprint

> Global Investment Performance Standards (GIPS) — firm definition, composites, time-weighted return, valuation, presentation requirements, portability, and verification

| | |
|---|---|
| **Feature** | `gips-standards-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, gips, performance-standards, composite, time-weighted-return, performance-reporting, verification, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/gips-standards-l3.blueprint.yaml) |
| **JSON API** | [gips-standards-l3.json]({{ site.baseurl }}/api/blueprints/trading/gips-standards-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_analyst` | Performance Analyst | human |  |
| `compliance_officer` | Compliance Officer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `firm_id` | text | Yes | Firm identifier |  |
| `gips_area` | select | Yes | firm_definition \| composite_construction \| return_calculation \| valuation \| presentation \| portability \| verification |  |

## Rules

- **objective_scope:**
  - **objective:** Fair, accurate, and comparable investment performance globally
  - **scope:** Voluntary; asset managers claiming compliance must apply standards firm-wide
  - **compliance:** Claim of compliance must be firm-wide; cannot claim composite-level compliance
  - **ethics:** GIPS is an ethical framework; full disclosure and fair presentation are paramount
- **firm_definition:**
  - **definition:** Distinct business entity held out to clients or prospects as an investment manager
  - **subsidiary:** Subsidiaries may claim separately if managed independently with distinct strategies
  - **divisions:** Internal management divisions are not separate firms for GIPS purposes
  - **discretion:** Only discretionary accounts (where manager makes investment decisions) included
- **composite_construction:**
  - **definition:** Aggregation of one or more portfolios managed according to similar investment mandate
  - **inclusion:** All fee-paying discretionary portfolios must be in at least one composite
  - **exclusion:** Non-discretionary or non-fee-paying accounts may be excluded
  - **terminated_accounts:** Must include terminated accounts for periods they were active; prevents survivorship bias
  - **strategy_definition:** Composites defined by investment mandate, objective, or strategy; fully disclosed
- **time_weighted_return:**
  - **definition:** Return that eliminates impact of external cash flows; reflects manager's investment decisions
  - **formula:** Chain-link subperiod returns; revalue portfolio at each external cash flow
  - **vs_money_weighted:** TWR preferred for comparing managers; MWR (IRR) used for PE and private assets
  - **annualizing:** Returns > 1 year must be annualized; <1 year must not be annualized
  - **subperiod:** At minimum, revalue at each large external cash flow; daily preferred
- **return_calculation:**
  - **cash_equivalents:** Include dividends, interest; accrual basis preferred
  - **expenses:** Gross-of-fees and net-of-fees returns both required; investment management fees disclosed
  - **trading_costs:** Must be deducted from gross returns; all transaction costs included
- **valuation:**
  - **frequency:** Monthly minimum; quarterly for some asset classes
  - **fair_value:** Fair value = price at which willing buyer and seller would transact; not cost or distressed
  - **hierarchy:** Observable quoted market prices preferred; model-based last resort; disclose methodology
- **presentation_requirements:**
  - **minimum_years:** Must present at least 5 years of GIPS performance; build to 10 years
  - **required_elements:** Composite name, composite creation date, # portfolios, composite/benchmark return, composite dispersion, composite 3-yr annualized ex-ante risk, benchmark name
  - **dispersion:** Must show internal dispersion of portfolio returns within composite; indicates consistency
  - **benchmark:** Must show appropriate benchmark for comparison; disclose benchmark description
  - **inception:** If less than 5 years since inception, show performance since inception
- **portability:**
  - **definition:** If key decision-makers move to a new firm, track record may be portable
  - **conditions:** Same investment process, same decision-making team, substantially same portfolios followed
  - **disclosure:** Must disclose that prior firm performance was achieved at a different firm
  - **strict:** New firm must meet GIPS requirements for new performance period
- **verification:**
  - **definition:** Third-party examination of firm-wide GIPS compliance; not audit of specific composites
  - **scope:** Test construction and presentation of all composites; verify policies and procedures
  - **voluntary:** Not required for GIPS compliance; but strongly recommended for credibility
  - **composite_examination:** More specific verification of individual composite construction; optional add-on
- **validation:**
  - **firm_required:** firm_id present
  - **valid_area:** gips_area in [firm_definition, composite_construction, return_calculation, valuation, presentation, portability, verification]

## Outcomes

### Assess_gips_compliance (Priority: 1)

_Assess GIPS compliance for specified area_

**Given:**
- `firm_id` (input) exists
- `gips_area` (input) in `firm_definition,composite_construction,return_calculation,valuation,presentation,portability,verification`

**Then:**
- **call_service** target: `compliance_officer`
- **emit_event** event: `gips.assessed`

### Invalid_area (Priority: 10) — Error: `GIPS_INVALID_AREA`

_Unsupported GIPS area_

**Given:**
- `gips_area` (input) not_in `firm_definition,composite_construction,return_calculation,valuation,presentation,portability,verification`

**Then:**
- **emit_event** event: `gips.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GIPS_INVALID_AREA` | 400 | gips_area must be one of the supported GIPS compliance areas | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `gips.assessed` |  | `firm_id`, `gips_area`, `compliant`, `findings`, `remediation_required` |
| `gips.rejected` |  | `firm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-ethics-standards-l3 | required |  |
| portfolio-performance-evaluation-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gips Standards L3 Blueprint",
  "description": "Global Investment Performance Standards (GIPS) — firm definition, composites, time-weighted return, valuation, presentation requirements, portability, and verif",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, gips, performance-standards, composite, time-weighted-return, performance-reporting, verification, cfa-level-3"
}
</script>
