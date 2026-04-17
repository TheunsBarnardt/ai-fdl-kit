---
title: "Risk Budgeting Tolerance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Set enterprise risk tolerance, allocate a risk budget across business units and strategies, and measure marginal contribution to risk for consistent ex-ante cap"
---

# Risk Budgeting Tolerance Blueprint

> Set enterprise risk tolerance, allocate a risk budget across business units and strategies, and measure marginal contribution to risk for consistent ex-ante capital allocation

| | |
|---|---|
| **Feature** | `risk-budgeting-tolerance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | risk-management, risk-budget, risk-tolerance, marginal-var, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/risk-budgeting-tolerance.blueprint.yaml) |
| **JSON API** | [risk-budgeting-tolerance.json]({{ site.baseurl }}/api/blueprints/trading/risk-budgeting-tolerance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `risk_budget_mgr` | Risk Budget Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `budget_id` | text | Yes | Risk budget identifier |  |
| `total_risk_budget` | number | Yes | Total risk budget (e.g., VaR or TE) |  |
| `allocation_method` | select | Yes | equal_weight \| equal_risk \| marginal_contribution |  |

## Rules

- **risk_tolerance:**
  - **quantify:** Express as maximum acceptable loss, tracking error, or volatility
  - **consistency:** Applied across business units and strategies
- **risk_budget:**
  - **total:** Aggregate risk allowance consistent with tolerance
  - **allocation:** Split across exposures; constrain each to sub-budget
- **methods:**
  - **equal_weight:** Same risk budget per unit — simple but ignores differences
  - **equal_risk_contribution:** Each unit contributes equal ex-ante risk
  - **marginal_contribution:** Allocate where marginal Sharpe is highest
- **measurement:**
  - **var:** Value-at-Risk at specified confidence
  - **tracking_error:** Annualised std dev of active return
  - **stress_tests:** Historical and hypothetical scenarios
- **monitoring:**
  - **frequency:** Daily at trading level, weekly/monthly at strategy level
  - **breach_protocol:** Unwind or escalate when sub-budget breached
- **validation:**
  - **budget_required:** budget_id present
  - **positive_budget:** total_risk_budget > 0
  - **valid_method:** allocation_method in allowed set

## Outcomes

### Allocate_risk_budget (Priority: 1)

_Allocate risk budget across units_

**Given:**
- `budget_id` (input) exists
- `total_risk_budget` (input) gt `0`
- `allocation_method` (input) in `equal_weight,equal_risk,marginal_contribution`

**Then:**
- **call_service** target: `risk_budget_mgr`
- **emit_event** event: `risk_budget.allocated`

### Invalid_method (Priority: 10) — Error: `BUDGET_INVALID_METHOD`

_Unsupported allocation method_

**Given:**
- `allocation_method` (input) not_in `equal_weight,equal_risk,marginal_contribution`

**Then:**
- **emit_event** event: `risk_budget.rejected`

### Invalid_budget (Priority: 11) — Error: `BUDGET_INVALID_AMOUNT`

_Non-positive budget_

**Given:**
- `total_risk_budget` (input) lte `0`

**Then:**
- **emit_event** event: `risk_budget.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BUDGET_INVALID_METHOD` | 400 | allocation_method must be equal_weight, equal_risk, or marginal_contribution | No |
| `BUDGET_INVALID_AMOUNT` | 400 | total_risk_budget must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `risk_budget.allocated` |  | `budget_id`, `allocation_method`, `sub_budgets`, `expected_return` |
| `risk_budget.rejected` |  | `budget_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| risk-management-framework | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Risk Budgeting Tolerance Blueprint",
  "description": "Set enterprise risk tolerance, allocate a risk budget across business units and strategies, and measure marginal contribution to risk for consistent ex-ante cap",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "risk-management, risk-budget, risk-tolerance, marginal-var, cfa-level-1"
}
</script>
