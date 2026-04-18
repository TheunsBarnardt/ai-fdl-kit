---
title: "Corporate Restructuring L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate corporate restructuring — corporate lifecycle and motivations, investment actions (equity, JV, acquisition), divestments (sale, spin-off, split-off, ca"
---

# Corporate Restructuring L2 Blueprint

> Evaluate corporate restructuring — corporate lifecycle and motivations, investment actions (equity, JV, acquisition), divestments (sale, spin-off, split-off, carve-out), and pro-forma WACC

| | |
|---|---|
| **Feature** | `corporate-restructuring-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, restructuring, mergers-acquisitions, divestitures, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/corporate-restructuring-l2.blueprint.yaml) |
| **JSON API** | [corporate-restructuring-l2.json]({{ site.baseurl }}/api/blueprints/trading/corporate-restructuring-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `restructuring_analyst` | Corporate Restructuring Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `deal_id` | text | Yes | Deal identifier |  |
| `action_type` | select | Yes | equity_investment \| joint_venture \| acquisition \| divestment \| restructuring |  |

## Rules

- **corporate_life_cycle:**
  - **startup:** Negative cash flow; equity funded
  - **growth:** Scale revenue, reinvest, need capital
  - **mature:** Positive cash flow, payout rises, M&A active
  - **decline:** Divestiture, restructuring, bankruptcy
- **motivations:**
  - **synergy:** Cost, revenue, financial
  - **diversification:** Earnings stability (often value-destroying)
  - **strategic:** Market entry, vertical integration, tech access
  - **financial_engineering:** Leverage, tax, capital-structure optimisation
  - **management_empire_building:** Value-destroying agency behaviour
- **types_of_restructurings:**
  - **equity_investment:** Minority stake for strategic access
  - **joint_venture:** Shared-control entity with partners
  - **acquisition:** Full control of target
  - **divestment_sale:** Outright sale for cash
  - **spin_off:** Pro-rata distribution of subsidiary shares to existing holders
  - **split_off:** Shareholders exchange parent shares for subsidiary
  - **carve_out:** IPO of subsidiary; parent retains majority or minority
  - **liquidation:** Asset sale, proceeds returned to claimants
- **evaluation_framework:**
  - **initial_evaluation:** Strategic fit, size, financing, timeline
  - **preliminary_valuation:** Comparable companies, comparable transactions
  - **modeling_valuation:** Pro forma three-statement model with synergies
  - **pro_forma_wacc:** Weighted average of combined entity's cost of capital post-deal
- **acquisition_valuation:**
  - **dcf_synergies:** Incremental free cash flows from combination
  - **accretion_dilution:** EPS impact of deal financing mix
  - **premium:** Control premium typical 20-40%
  - **goodwill:** Excess of price over FV of identifiable net assets
- **divestment_valuation:**
  - **spin_off_shareholder_value:** Sum of parts vs pre-deal market cap
  - **tax_efficiency:** Type A-F reorganisations in US; often tax-free if structured correctly
  - **operational_separation_costs:** IT, HR, contracts
- **validation:**
  - **deal_required:** deal_id present
  - **valid_action:** action_type in [equity_investment, joint_venture, acquisition, divestment, restructuring]

## Outcomes

### Evaluate_restructuring (Priority: 1)

_Evaluate corporate restructuring action_

**Given:**
- `deal_id` (input) exists
- `action_type` (input) in `equity_investment,joint_venture,acquisition,divestment,restructuring`

**Then:**
- **call_service** target: `restructuring_analyst`
- **emit_event** event: `restructuring.evaluated`

### Invalid_action (Priority: 10) — Error: `RESTRUCTURING_INVALID_ACTION`

_Unsupported action type_

**Given:**
- `action_type` (input) not_in `equity_investment,joint_venture,acquisition,divestment,restructuring`

**Then:**
- **emit_event** event: `restructuring.evaluation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RESTRUCTURING_INVALID_ACTION` | 400 | action_type must be one of the supported actions | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `restructuring.evaluated` |  | `deal_id`, `action_type`, `value_created`, `pro_forma_wacc`, `accretion_dilution` |
| `restructuring.evaluation_rejected` |  | `deal_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cost-of-capital-advanced-l2 | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Corporate Restructuring L2 Blueprint",
  "description": "Evaluate corporate restructuring — corporate lifecycle and motivations, investment actions (equity, JV, acquisition), divestments (sale, spin-off, split-off, ca",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, restructuring, mergers-acquisitions, divestitures, cfa-level-2"
}
</script>
