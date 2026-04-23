---
title: "Employee Compensation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Report post-employment benefits (DB and DC pensions) and share-based compensation (restricted stock, stock options) — measure expense, obligation, and disclosur"
---

# Employee Compensation L2 Blueprint

> Report post-employment benefits (DB and DC pensions) and share-based compensation (restricted stock, stock options) — measure expense, obligation, and disclosures

| | |
|---|---|
| **Feature** | `employee-compensation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fsa, pensions, share-based-compensation, db-plans, dc-plans, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/employee-compensation-l2.blueprint.yaml) |
| **JSON API** | [employee-compensation-l2.json]({{ site.baseurl }}/api/blueprints/trading/employee-compensation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `comp_accountant` | Compensation Accountant | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `plan_id` | text | Yes | Plan identifier |  |
| `plan_type` | select | Yes | db_pension \| dc_pension \| stock_option \| restricted_stock |  |

## Rules

- **db_pension_core_concepts:**
  - **pbo:** Projected benefit obligation; actuarial PV of future payments assuming salary increases
  - **abo:** Accumulated benefit obligation; PV assuming no future salary growth
  - **service_cost:** Actuarial PV of benefits earned this period
  - **interest_cost:** Unwinding of discount on PBO
  - **actual_return_on_plan_assets:** FV change plus income
  - **actuarial_gains_losses:** From assumption changes and experience
- **db_reporting_under_ifrs:**
  - **balance_sheet:** Net pension asset/liability = FV assets − PBO
  - **pl_recognised:** Service cost + net interest (discount rate × net liability)
  - **oci_recognised:** Remeasurements (actuarial gains/losses, asset return deviation); never recycled
- **db_reporting_under_gaap:**
  - **balance_sheet:** Funded status on face of balance sheet
  - **pl_recognised:** Service cost, interest cost, expected return, amortisation of prior service cost and actuarial gains/losses
  - **oci_recognised:** Actuarial gains/losses, prior service cost; amortised to P&L via corridor
- **dc_pensions:**
  - **expense:** Employer contribution recognised as expense when paid or accrued
  - **no_obligation:** Employee bears investment risk
- **share_based_compensation:**
  - **restricted_stock:** FV at grant date divided by vesting period; expensed with offset to equity
  - **stock_options:** FV measured using Black-Scholes or binomial; expense ratably over vesting
  - **tax_effects:** Book-tax timing differences create deferred taxes
  - **share_count_effects:** Dilutive EPS includes vested options via treasury stock method
- **financial_modeling:**
  - **forecasting_shares_outstanding:** Account for expected grants, vesting, forfeitures, repurchases
  - **pension_reclassification_for_analysis:** Move actual return and service cost to operating, interest to financing, remeasurements out of P&L for peer comparison
- **validation:**
  - **plan_required:** plan_id present
  - **valid_type:** plan_type in [db_pension, dc_pension, stock_option, restricted_stock]

## Outcomes

### Measure_compensation (Priority: 1)

_Measure compensation expense and obligation_

**Given:**
- `plan_id` (input) exists
- `plan_type` (input) in `db_pension,dc_pension,stock_option,restricted_stock`

**Then:**
- **call_service** target: `comp_accountant`
- **emit_event** event: `comp.measured`

### Invalid_type (Priority: 10) — Error: `COMP_INVALID_TYPE`

_Unsupported plan type_

**Given:**
- `plan_type` (input) not_in `db_pension,dc_pension,stock_option,restricted_stock`

**Then:**
- **emit_event** event: `comp.measurement_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMP_INVALID_TYPE` | 400 | plan_type must be db_pension, dc_pension, stock_option, or restricted_stock | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `comp.measured` |  | `plan_id`, `plan_type`, `expense`, `obligation`, `funded_status` |
| `comp.measurement_rejected` |  | `plan_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| intercorporate-investments-l2 | optional |  |

## AGI Readiness

### Goals

#### Reliable Employee Compensation L2

Report post-employment benefits (DB and DC pensions) and share-based compensation (restricted stock, stock options) — measure expense, obligation, and disclosures

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| measure_compensation | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Employee Compensation L2 Blueprint",
  "description": "Report post-employment benefits (DB and DC pensions) and share-based compensation (restricted stock, stock options) — measure expense, obligation, and disclosur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fsa, pensions, share-based-compensation, db-plans, dc-plans, cfa-level-2"
}
</script>
