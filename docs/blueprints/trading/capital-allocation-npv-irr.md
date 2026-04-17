---
title: "Capital Allocation Npv Irr Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Rank capital investments using NPV, IRR, and ROIC; identify allocation principles and common pitfalls (IRR conflicts, sunk costs, optimistic projections). 4 fie"
---

# Capital Allocation Npv Irr Blueprint

> Rank capital investments using NPV, IRR, and ROIC; identify allocation principles and common pitfalls (IRR conflicts, sunk costs, optimistic projections)

| | |
|---|---|
| **Feature** | `capital-allocation-npv-irr` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, capital-allocation, npv, irr, roic, capital-budgeting, real-options, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/capital-allocation-npv-irr.blueprint.yaml) |
| **JSON API** | [capital-allocation-npv-irr.json]({{ site.baseurl }}/api/blueprints/trading/capital-allocation-npv-irr.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `capital_analyst` | Capital Allocation Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `project_id` | text | Yes | Project identifier |  |
| `cash_flows` | json | Yes | Array of cash flows by period |  |
| `discount_rate` | number | Yes | Required rate of return (decimal) |  |
| `invested_capital` | number | No | Total invested capital for ROIC |  |

## Rules

- **npv:**
  - **formula:** NPV = sum_t CF_t / (1 + r)^t
  - **rule:** Accept if NPV > 0
  - **why_superior:** Measures value added in currency; handles unconventional cash flows
- **irr:**
  - **definition:** Discount rate that sets NPV to zero
  - **rule:** Accept if IRR > hurdle rate
  - **limitations:** Multiple IRRs with sign changes, Reinvestment at IRR assumption, Scale bias in ranking mutually exclusive projects
- **roic:**
  - **formula:** ROIC = NOPAT / Invested Capital
  - **compare_to:** WACC — value creation when ROIC > WACC
- **project_types:**
  - **going_concern:** Maintenance capex to sustain operations
  - **regulatory_compliance:** Required by law; NPV often negative but mandatory
  - **expansion:** Growing existing business
  - **new_lines:** Higher risk, diversification
- **allocation_principles:** Incremental cash flows only, Include opportunity costs and externalities, Exclude sunk costs and financing costs, Use after-tax cash flows, Discount at project risk-adjusted rate
- **pitfalls:** Overly optimistic projections, Internal politics biasing approvals, Pet projects and empire building, Failure to account for inflation consistently, Template risk — reusing discount rates
- **real_options:**
  - **examples:** Timing, expansion, abandonment, switching inputs
  - **valuation:** Adds flexibility value on top of static NPV
- **validation:**
  - **project_required:** project_id present
  - **discount_rate_valid:** 0 < discount_rate < 1
  - **cash_flows_present:** cash_flows must exist

## Outcomes

### Rank_project (Priority: 1)

_Compute NPV, IRR and recommendation_

**Given:**
- `project_id` (input) exists
- `discount_rate` (input) gt `0`
- `cash_flows` (input) exists

**Then:**
- **call_service** target: `capital_analyst`
- **emit_event** event: `capital.project_ranked`

### Invalid_rate (Priority: 10) — Error: `CAP_INVALID_RATE`

_Discount rate out of range_

**Given:**
- ANY: `discount_rate` (input) lte `0` OR `discount_rate` (input) gte `1`

**Then:**
- **emit_event** event: `capital.project_rejected`

### Missing_cash_flows (Priority: 11) — Error: `CAP_CASH_FLOWS_MISSING`

_Cash flows missing_

**Given:**
- `cash_flows` (input) not_exists

**Then:**
- **emit_event** event: `capital.project_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CAP_INVALID_RATE` | 400 | discount_rate must be strictly between 0 and 1 | No |
| `CAP_CASH_FLOWS_MISSING` | 400 | cash_flows array is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `capital.project_ranked` |  | `project_id`, `npv`, `irr`, `roic`, `recommendation` |
| `capital.project_rejected` |  | `project_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| corporate-capital-structure | recommended |  |
| working-capital-management | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Capital Allocation Npv Irr Blueprint",
  "description": "Rank capital investments using NPV, IRR, and ROIC; identify allocation principles and common pitfalls (IRR conflicts, sunk costs, optimistic projections). 4 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, capital-allocation, npv, irr, roic, capital-budgeting, real-options, cfa-level-1"
}
</script>
