---
title: "Fsa Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply a six-step financial statement analysis framework — purpose, data collection, processing, analysis, communication, follow-up — using regulated and supplem"
---

# Fsa Framework Blueprint

> Apply a six-step financial statement analysis framework — purpose, data collection, processing, analysis, communication, follow-up — using regulated and supplementary information sources

| | |
|---|---|
| **Feature** | `fsa-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, fsa-framework, ifrs, us-gaap, mdna, audit-report, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-framework.blueprint.yaml) |
| **JSON API** | [fsa-framework.json]({{ site.baseurl }}/api/blueprints/trading/fsa-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fsa_analyst` | Financial Statement Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `analysis_id` | text | Yes | Analysis identifier |  |
| `purpose` | text | Yes | Analysis purpose and context |  |
| `reporting_framework` | select | No | ifrs \| us_gaap \| other |  |

## Rules

- **framework_steps:**
  - **purpose:** Articulate purpose and context
  - **collect:** Collect financial and non-financial data
  - **process:** Adjust, restate, standardise
  - **analyze:** Ratios, common-size, trend, peer comparison
  - **communicate:** Report findings with recommendations
  - **follow_up:** Update conclusions with new data
- **regulated_sources:**
  - **iosco:** Global principles for securities regulation
  - **sec:** US 10-K, 10-Q, 8-K, proxies, registration statements
  - **europe:** IFRS-based annual and interim reports
  - **notes:** Disclosures on accounting choices, estimates
  - **segment_reporting:** Business and geographic
  - **mdna:** Management commentary on performance and prospects
  - **auditor_report:** Unqualified, qualified, adverse, disclaimer
- **ifrs_vs_gaap:**
  - **convergence:** Many standards aligned (revenue, leases) but differences remain
  - **examples:** LIFO allowed under US GAAP but not IFRS; development cost capitalisation differs
- **other_sources:** Industry data, peer filings, analyst reports, News, earnings calls, investor presentations, Alternative data — satellite, web traffic, shipping
- **validation:**
  - **purpose_required:** purpose present
  - **analysis_id_required:** analysis_id present

## Outcomes

### Start_analysis (Priority: 1)

_Kick off FSA pipeline_

**Given:**
- `analysis_id` (input) exists
- `purpose` (input) exists

**Then:**
- **call_service** target: `fsa_analyst`
- **emit_event** event: `fsa.analysis_started`

### Missing_inputs (Priority: 10) — Error: `FSA_MISSING_INPUTS`

_Missing required inputs_

**Given:**
- ANY: `analysis_id` (input) not_exists OR `purpose` (input) not_exists

**Then:**
- **emit_event** event: `fsa.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FSA_MISSING_INPUTS` | 400 | analysis_id and purpose are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fsa.analysis_started` |  | `analysis_id`, `purpose`, `reporting_framework`, `data_sources` |
| `fsa.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-income-statement | recommended |  |
| fsa-balance-sheet | recommended |  |
| fsa-cash-flow | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Framework Blueprint",
  "description": "Apply a six-step financial statement analysis framework — purpose, data collection, processing, analysis, communication, follow-up — using regulated and supplem",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, fsa-framework, ifrs, us-gaap, mdna, audit-report, cfa-level-1"
}
</script>
