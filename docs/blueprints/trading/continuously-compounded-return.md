---
title: "Continuously Compounded Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the continuously compounded (log) return — preferred in quantitative finance for its additive properties over time. 4 fields. 5 outcomes. 2 error codes."
---

# Continuously Compounded Return Blueprint

> Compute the continuously compounded (log) return — preferred in quantitative finance for its additive properties over time

| | |
|---|---|
| **Feature** | `continuously-compounded-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, log-return, continuous-compounding, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/continuously-compounded-return.blueprint.yaml) |
| **JSON API** | [continuously-compounded-return.json]({{ site.baseurl }}/api/blueprints/trading/continuously-compounded-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `beginning_price` | number | No | Beginning price (P0) — if computing from prices |  |
| `ending_price` | number | No | Ending price (P1) — if computing from prices |  |
| `holding_period_return` | number | No | Holding period return (R) — if converting from HPR |  |
| `conversion_direction` | select | Yes | hpr_to_continuous or continuous_to_hpr or prices_to_continuous |  |

## Rules

- **core_formulas:**
  - **from_prices:** r_c = ln(P1 / P0)
  - **from_hpr:** r_c = ln(1 + R)
  - **inverse:** R = exp(r_c) - 1
- **additivity_property:**
  - **multi_period:** r_c(0,T) = sum(r_c(t-1,t)) for t=1..T — log returns are time-additive
  - **contrast_with_hpr:** HPRs compound multiplicatively, log returns sum additively
- **distributional_properties:**
  - **lognormal_assumption:** If prices are lognormally distributed, log returns are normally distributed
  - **symmetric_around_zero:** Log returns can be symmetric; HPRs cannot be since R >= -1
- **domain_constraints:**
  - **hpr_above_total_loss:** R > -1 required (ln of non-positive number undefined)
  - **prices_positive:** P0 > 0 and P1 > 0 required
- **appropriate_use:**
  - **quantitative_modeling:** Preferred for GBM/Black-Scholes, volatility estimation, time-series modeling
  - **time_aggregation:** When summing returns across many sub-periods

## Outcomes

### From_prices (Priority: 1)

_Convert price pair to continuously compounded return_

**Given:**
- `conversion_direction` (input) eq `prices_to_continuous`
- `beginning_price` (input) gt `0`
- `ending_price` (input) gt `0`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.continuous_calculated`

### From_hpr (Priority: 2)

_Convert HPR to continuously compounded return_

**Given:**
- `conversion_direction` (input) eq `hpr_to_continuous`
- `holding_period_return` (input) gt `-1`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.continuous_calculated`

### To_hpr (Priority: 3)

_Convert continuously compounded return back to HPR_

**Given:**
- `conversion_direction` (input) eq `continuous_to_hpr`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.hpr_from_continuous_calculated`

### Invalid_hpr (Priority: 10) — Error: `CONTINUOUS_INVALID_HPR`

_HPR at or below -100%_

**Given:**
- `holding_period_return` (input) lte `-1`

**Then:**
- **emit_event** event: `return.continuous_rejected`

### Non_positive_price (Priority: 11) — Error: `CONTINUOUS_INVALID_PRICE`

_A price is zero or negative_

**Given:**
- ANY: `beginning_price` (input) lte `0` OR `ending_price` (input) lte `0`

**Then:**
- **emit_event** event: `return.continuous_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONTINUOUS_INVALID_HPR` | 400 | Continuously compounded return undefined when HPR <= -100% | No |
| `CONTINUOUS_INVALID_PRICE` | 400 | Prices must be strictly positive for log return calculation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.continuous_calculated` |  | `instrument_id`, `continuous_return`, `source_type` |
| `return.hpr_from_continuous_calculated` |  | `instrument_id`, `hpr`, `continuous_return` |
| `return.continuous_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| annualized-return | recommended |  |
| geometric-mean-return | recommended |  |

## AGI Readiness

### Goals

#### Reliable Continuously Compounded Return

Compute the continuously compounded (log) return — preferred in quantitative finance for its additive properties over time

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
| from_prices | `autonomous` | - | - |
| from_hpr | `autonomous` | - | - |
| to_hpr | `autonomous` | - | - |
| invalid_hpr | `autonomous` | - | - |
| non_positive_price | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  hpr: 0.07
  continuous: ln(1.07) ≈ 0.0677
  interpretation: 7% HPR equals 6.77% continuously compounded
additivity_example:
  daily_log_returns:
    - 0.001
    - -0.002
    - 0.003
    - 0.0005
  total_log_return: 0.0025
  note: Simply sum them — additive property
annualization_under_iid:
  formula: r_c_annual = r_c_daily * 252 (trading days) or * 365 (calendar)
  assumption: i.i.d. daily log returns
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Continuously Compounded Return Blueprint",
  "description": "Compute the continuously compounded (log) return — preferred in quantitative finance for its additive properties over time. 4 fields. 5 outcomes. 2 error codes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, log-return, continuous-compounding, cfa-level-1"
}
</script>
