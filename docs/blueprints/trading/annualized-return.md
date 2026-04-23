---
title: "Annualized Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Convert a return earned over any period (days, weeks, months, quarters) into an equivalent annualized (compounded-to-one-year) rate. 4 fields. 4 outcomes. 3 err"
---

# Annualized Return Blueprint

> Convert a return earned over any period (days, weeks, months, quarters) into an equivalent annualized (compounded-to-one-year) rate

| | |
|---|---|
| **Feature** | `annualized-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, annualization, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/annualized-return.blueprint.yaml) |
| **JSON API** | [annualized-return.json]({{ site.baseurl }}/api/blueprints/trading/annualized-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `period_return` | number | Yes | Return for the sub-annual period (decimal, e.g., 0.02 for 2%) |  |
| `period_length` | number | Yes | Length of the observed period |  |
| `period_unit` | select | Yes | Unit (days, weeks, months, quarters, years) |  |
| `day_count_basis` | select | No | Day count basis when period_unit = days (ACT_365, ACT_360, 30_360) |  |

## Rules

- **core_formula:**
  - **annualize:** R_annual = (1 + R_period)^c - 1
  - **periods_per_year_days_365:** c = 365 / period_days (ACT/365)
  - **periods_per_year_weeks:** c = 52 / period_weeks
  - **periods_per_year_months:** c = 12 / period_months
  - **periods_per_year_quarters:** c = 4 / period_quarters
- **non_annual_compounding:**
  - **formula:** EAR = (1 + r_stated/m)^m - 1 where m is compounding periods per year
- **sign_preservation:**
  - **negative_allowed:** If R_period < 0, the annualized return is also negative (with magnified compounding effect)
  - **floor:** R_period must be > -1 else annualization is undefined
- **appropriate_use:**
  - **comparison:** Needed to compare investments with different measurement horizons
  - **reporting_convention:** Regulatory and client reporting frequently require annualized returns
- **validation:**
  - **period_length_positive:** period_length > 0
  - **return_above_total_loss:** period_return > -1
  - **supported_units:** period_unit in {days, weeks, months, quarters, years}

## Outcomes

### Compute_annualized (Priority: 1)

_Annualize a valid sub-period return_

**Given:**
- `period_return` (input) gt `-1`
- `period_length` (input) gt `0`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.annualized_calculated`

### Total_loss_input (Priority: 10) — Error: `ANNUALIZE_TOTAL_LOSS`

_period_return <= -100%_

**Given:**
- `period_return` (input) lte `-1`

**Then:**
- **emit_event** event: `return.annualized_rejected`

### Invalid_period_length (Priority: 11) — Error: `ANNUALIZE_INVALID_PERIOD`

_Period length not strictly positive_

**Given:**
- `period_length` (input) lte `0`

**Then:**
- **emit_event** event: `return.annualized_rejected`

### Unsupported_unit (Priority: 12) — Error: `ANNUALIZE_UNSUPPORTED_UNIT`

_period_unit not in supported set_

**Given:**
- `period_unit` (input) not_in `days,weeks,months,quarters,years`

**Then:**
- **emit_event** event: `return.annualized_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ANNUALIZE_TOTAL_LOSS` | 400 | Cannot annualize a return <= -100% | No |
| `ANNUALIZE_INVALID_PERIOD` | 400 | Period length must be strictly positive | No |
| `ANNUALIZE_UNSUPPORTED_UNIT` | 400 | Period unit must be one of days, weeks, months, quarters, years | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.annualized_calculated` |  | `series_id`, `period_return`, `period_length`, `period_unit`, `annualized_return` |
| `return.annualized_rejected` |  | `series_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| geometric-mean-return | recommended |  |
| continuously-compounded-return | recommended |  |

## AGI Readiness

### Goals

#### Reliable Annualized Return

Convert a return earned over any period (days, weeks, months, quarters) into an equivalent annualized (compounded-to-one-year) rate

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
| `holding_period_return` | holding-period-return | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_annualized | `autonomous` | - | - |
| total_loss_input | `autonomous` | - | - |
| invalid_period_length | `autonomous` | - | - |
| unsupported_unit | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_examples:
  monthly:
    period_return: 0.02
    period_length: 1
    period_unit: months
    annualized: (1.02)^12 - 1 = 0.2682
  quarterly:
    period_return: 0.05
    period_length: 1
    period_unit: quarters
    annualized: (1.05)^4 - 1 = 0.2155
  days_100:
    period_return: 0.03
    period_length: 100
    period_unit: days
    annualized: (1.03)^(365/100) - 1 = 0.1121
day_count_conventions:
  - name: ACT_365
    periods_per_year: 365
  - name: ACT_360
    periods_per_year: 360
  - name: 30_360
    periods_per_year: 360
    note: assume 30-day months
ear_vs_apr:
  apr_stated_rate: r_stated (e.g., 12% APR with monthly compounding)
  ear_effective_rate: (1 + r_stated/m)^m - 1 (12% APR monthly → EAR 12.68%)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Annualized Return Blueprint",
  "description": "Convert a return earned over any period (days, weeks, months, quarters) into an equivalent annualized (compounded-to-one-year) rate. 4 fields. 4 outcomes. 3 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, annualization, cfa-level-1"
}
</script>
