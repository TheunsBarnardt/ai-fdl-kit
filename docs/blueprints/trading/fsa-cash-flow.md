---
title: "Fsa Cash Flow Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse cash flow statements — CFO, CFI, CFF — using direct and indirect methods, convert indirect to direct, and derive free cash flow and cash flow ratios. 6 "
---

# Fsa Cash Flow Blueprint

> Analyse cash flow statements — CFO, CFI, CFF — using direct and indirect methods, convert indirect to direct, and derive free cash flow and cash flow ratios

| | |
|---|---|
| **Feature** | `fsa-cash-flow` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, cash-flow-statement, cfo, free-cash-flow, direct-indirect-method, fcff, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-cash-flow.blueprint.yaml) |
| **JSON API** | [fsa-cash-flow.json]({{ site.baseurl }}/api/blueprints/trading/fsa-cash-flow.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cf_analyst` | Cash Flow Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `period` | text | Yes | Reporting period |  |
| `cfo` | number | Yes | Cash flow from operations |  |
| `cfi` | number | No | Cash flow from investing |  |
| `cff` | number | No | Cash flow from financing |  |
| `capex` | number | No | Capital expenditures |  |

## Rules

- **cfo_methods:**
  - **direct_method:** Reports cash receipts from customers and cash paid to suppliers/employees
  - **indirect_method:** Starts from net income; adjusts for non-cash items and working capital changes
  - **conversion:** Indirect to direct: restate each line using changes in related receivables/payables
- **classification:**
  - **cfo_ifrs_flexibility:** Interest and dividends paid/received can be CFO or CFF/CFI under IFRS
  - **cfo_gaap_rigid:** US GAAP requires interest paid and interest/dividends received in CFO
- **free_cash_flow:**
  - **fcff:** CFO + interest * (1 - t) - capex
  - **fcfe:** CFO - capex + net borrowing
  - **interpretation:** Cash available to equity holders after reinvestment and debt service
- **cash_flow_ratios:**
  - **cfo_to_revenue:** CFO / revenue — cash earnings quality
  - **cfo_to_current_liabilities:** CFO / CL — short-term coverage
  - **cfo_to_debt:** CFO / total debt — debt service capacity
  - **interest_coverage_cash:** (CFO + interest + taxes) / interest
- **sources_uses_analysis:**
  - **positive_cfo_indicator:** Mature business with strong cash generation
  - **negative_cfo_growth:** Growth firms may show negative CFO during scaling
  - **cff_as_funding:** Persistent negative CFO + positive CFF signals dependency on external funding
- **validation:**
  - **entity_required:** entity_id present
  - **period_required:** period present

## Outcomes

### Analyze_cash_flow (Priority: 1)

_Produce CFO quality, FCF, and cash flow ratios_

**Given:**
- `entity_id` (input) exists
- `period` (input) exists
- `cfo` (input) exists

**Then:**
- **call_service** target: `cf_analyst`
- **emit_event** event: `cf.analyzed`

### Missing_inputs (Priority: 10) — Error: `CF_MISSING_INPUTS`

_Required inputs missing_

**Given:**
- ANY: `entity_id` (input) not_exists OR `period` (input) not_exists OR `cfo` (input) not_exists

**Then:**
- **emit_event** event: `cf.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CF_MISSING_INPUTS` | 400 | entity_id, period, and cfo are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cf.analyzed` |  | `analysis_id`, `entity_id`, `period`, `fcff`, `fcfe`, `cfo_to_revenue`, `cfo_to_debt` |
| `cf.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-framework | required |  |
| fsa-income-statement | recommended |  |
| fsa-balance-sheet | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Cash Flow Blueprint",
  "description": "Analyse cash flow statements — CFO, CFI, CFF — using direct and indirect methods, convert indirect to direct, and derive free cash flow and cash flow ratios. 6 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, cash-flow-statement, cfo, free-cash-flow, direct-indirect-method, fcff, cfa-level-1"
}
</script>
