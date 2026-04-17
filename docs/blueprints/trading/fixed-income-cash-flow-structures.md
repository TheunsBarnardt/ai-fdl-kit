---
title: "Fixed Income Cash Flow Structures Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Characterise fixed-income cash flow patterns — bullet, amortising, sinking fund, step-up, floating, PIK, contingent — and compute principal and interest schedul"
---

# Fixed Income Cash Flow Structures Blueprint

> Characterise fixed-income cash flow patterns — bullet, amortising, sinking fund, step-up, floating, PIK, contingent — and compute principal and interest schedules

| | |
|---|---|
| **Feature** | `fixed-income-cash-flow-structures` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, cash-flow-structure, amortising, sinking-fund, floating-rate, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-cash-flow-structures.blueprint.yaml) |
| **JSON API** | [fixed-income-cash-flow-structures.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-cash-flow-structures.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_cashflow` | Fixed-Income Cash Flow Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `cash_flow_structure` | select | Yes | bullet \| amortising \| sinking_fund \| step_up \| floating \| pik \| contingent |  |
| `face_value` | number | Yes | Face value |  |
| `coupon_rate` | number | No | Coupon rate or reference plus margin (decimal) |  |

## Rules

- **bullet:**
  - **pattern:** Periodic coupons + full principal at maturity
- **amortising:**
  - **fully_amortising:** Equal payments; each contains interest and principal
  - **partially_amortising:** Amortise to a balloon at maturity
- **sinking_fund:**
  - **pattern:** Issuer retires bonds progressively per schedule
  - **lottery:** Specific bonds drawn by lottery
- **floating_rate:**
  - **reference:** SOFR, EURIBOR, TONAR
  - **spread:** Quoted margin above reference
  - **reset_frequency:** Quarterly or semi-annual
  - **caps_floors:** Optional
- **step_up:**
  - **pattern:** Pre-scheduled coupon increases; common in callables
- **pik:**
  - **pattern:** Interest paid in additional bonds or notes
  - **use_case:** Distressed or leveraged issuers
- **inflation_linked:**
  - **principal_indexed:** TIPS-style; coupon applied to inflated principal
  - **interest_indexed:** Fixed principal; coupon tracks inflation
- **contingent:**
  - **catastrophe:** Principal loss on trigger event
  - **covid_pandemic:** Reduced payments on trigger
- **validation:**
  - **bond_required:** bond_id present
  - **valid_structure:** cash_flow_structure in allowed set
  - **positive_face:** face_value > 0

## Outcomes

### Compute_cash_flow_schedule (Priority: 1)

_Compute scheduled principal and interest flows_

**Given:**
- `bond_id` (input) exists
- `cash_flow_structure` (input) in `bullet,amortising,sinking_fund,step_up,floating,pik,contingent`
- `face_value` (input) gt `0`

**Then:**
- **call_service** target: `fi_cashflow`
- **emit_event** event: `cashflow.computed`

### Invalid_structure (Priority: 10) — Error: `CF_INVALID_STRUCTURE`

_Unsupported cash flow structure_

**Given:**
- `cash_flow_structure` (input) not_in `bullet,amortising,sinking_fund,step_up,floating,pik,contingent`

**Then:**
- **emit_event** event: `cashflow.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CF_INVALID_STRUCTURE` | 400 | cash_flow_structure must be one of the supported patterns | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cashflow.computed` |  | `computation_id`, `bond_id`, `structure`, `schedule` |
| `cashflow.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-bond-features | required |  |
| fixed-income-bond-pricing | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Cash Flow Structures Blueprint",
  "description": "Characterise fixed-income cash flow patterns — bullet, amortising, sinking fund, step-up, floating, PIK, contingent — and compute principal and interest schedul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, cash-flow-structure, amortising, sinking-fund, floating-rate, cfa-level-1"
}
</script>
