---
title: "Fsa Income Statement Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse income statements — revenue/expense recognition, non-recurring items, basic and diluted EPS, common-size ratios — applying IFRS 15 / ASC 606 five-step m"
---

# Fsa Income Statement Blueprint

> Analyse income statements — revenue/expense recognition, non-recurring items, basic and diluted EPS, common-size ratios — applying IFRS 15 / ASC 606 five-step model

| | |
|---|---|
| **Feature** | `fsa-income-statement` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | financial-statement-analysis, income-statement, revenue-recognition, eps, ifrs-15, expense-recognition, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fsa-income-statement.blueprint.yaml) |
| **JSON API** | [fsa-income-statement.json]({{ site.baseurl }}/api/blueprints/trading/fsa-income-statement.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `is_analyst` | Income Statement Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `period` | text | Yes | Reporting period |  |
| `revenue` | number | Yes | Revenue |  |
| `net_income` | number | Yes | Net income |  |
| `weighted_avg_shares` | number | No | Weighted average shares outstanding |  |

## Rules

- **revenue_recognition_five_step:**
  - **step1:** Identify contract with customer
  - **step2:** Identify performance obligations
  - **step3:** Determine transaction price
  - **step4:** Allocate price to performance obligations
  - **step5:** Recognise revenue when performance obligation satisfied
- **expense_recognition:**
  - **matching_principle:** Expenses matched to related revenues
  - **capitalize_vs_expense:** Capitalise if future benefit, else expense
  - **depreciation_methods:** Straight-line, declining balance, units-of-production
- **non_recurring_items:**
  - **unusual_or_infrequent:** Present separately within continuing operations
  - **discontinued_operations:** Net of tax, separate line
  - **accounting_changes:** Retrospective application generally required
- **eps:**
  - **basic_eps:** (Net income - preferred dividends) / weighted avg common shares
  - **diluted_eps_convertible:** If-converted method for convertible securities
  - **diluted_eps_options:** Treasury stock method for options and warrants
  - **antidilutive_exclusion:** Exclude securities that would increase EPS
- **common_size:**
  - **technique:** Each line as percent of revenue
  - **use:** Compare across firms and periods
- **key_ratios:**
  - **gross_margin:** Gross profit / revenue
  - **operating_margin:** Operating income / revenue
  - **net_margin:** Net income / revenue
- **validation:**
  - **entity_required:** entity_id present
  - **period_required:** period present
  - **revenue_non_negative:** revenue >= 0

## Outcomes

### Analyze_income_statement (Priority: 1)

_Produce margins, EPS, and common-size analysis_

**Given:**
- `entity_id` (input) exists
- `period` (input) exists
- `revenue` (input) gte `0`

**Then:**
- **call_service** target: `is_analyst`
- **emit_event** event: `is.analyzed`

### Invalid_revenue (Priority: 10) — Error: `IS_INVALID_REVENUE`

_Negative revenue_

**Given:**
- `revenue` (input) lt `0`

**Then:**
- **emit_event** event: `is.analysis_rejected`

### Missing_inputs (Priority: 11) — Error: `IS_MISSING_INPUTS`

_Entity or period missing_

**Given:**
- ANY: `entity_id` (input) not_exists OR `period` (input) not_exists

**Then:**
- **emit_event** event: `is.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IS_INVALID_REVENUE` | 400 | revenue must be non-negative | No |
| `IS_MISSING_INPUTS` | 400 | entity_id and period are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `is.analyzed` |  | `analysis_id`, `entity_id`, `period`, `gross_margin`, `operating_margin`, `net_margin`, `basic_eps`, `diluted_eps` |
| `is.analysis_rejected` |  | `analysis_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fsa-framework | required |  |
| fsa-balance-sheet | recommended |  |
| fsa-cash-flow | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fsa Income Statement

Analyse income statements — revenue/expense recognition, non-recurring items, basic and diluted EPS, common-size ratios — applying IFRS 15 / ASC 606 five-step model

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fsa_framework` | fsa-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyze_income_statement | `autonomous` | - | - |
| invalid_revenue | `autonomous` | - | - |
| missing_inputs | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fsa Income Statement Blueprint",
  "description": "Analyse income statements — revenue/expense recognition, non-recurring items, basic and diluted EPS, common-size ratios — applying IFRS 15 / ASC 606 five-step m",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "financial-statement-analysis, income-statement, revenue-recognition, eps, ifrs-15, expense-recognition, cfa-level-1"
}
</script>
