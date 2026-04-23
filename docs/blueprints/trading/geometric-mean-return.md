---
title: "Geometric Mean Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the geometric mean (compound) return over multiple periods — the actual compound growth rate realised by a buy-and-hold investor. 2 fields. 3 outcomes. "
---

# Geometric Mean Return Blueprint

> Compute the geometric mean (compound) return over multiple periods — the actual compound growth rate realised by a buy-and-hold investor

| | |
|---|---|
| **Feature** | `geometric-mean-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, compound-return, cagr, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/geometric-mean-return.blueprint.yaml) |
| **JSON API** | [geometric-mean-return.json]({{ site.baseurl }}/api/blueprints/trading/geometric-mean-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `returns` | json | Yes | Array of periodic returns (decimal, e.g., [0.05, -0.02, 0.08]) |  |
| `return_frequency` | select | No | Frequency (daily, monthly, quarterly, annual) |  |

## Rules

- **core_formula:**
  - **geometric_mean:** R_G = [product(1 + R_t) for t=1..T]^(1/T) - 1
  - **equivalent_log_form:** R_G = exp( (1/T) * sum(ln(1 + R_t)) ) - 1
- **properties:**
  - **compound_growth:** Reflects actual compound growth of a buy-and-hold investment
  - **downward_relative_to_arithmetic:** R_G <= R_bar with equality only when all returns identical
  - **volatility_drag:** Approximation: R_G ≈ R_bar - (sigma^2)/2
- **domain_constraints:**
  - **no_return_below_minus_one:** Each (1 + R_t) must be > 0; if any R_t <= -1 (total loss), geometric mean is undefined (-100%)
- **appropriate_use:**
  - **past_performance:** Preferred for reporting historical compound performance
  - **backward_looking:** Describes realised compound growth, not expected future single-period return
- **validation:**
  - **non_empty:** At least one observation required
  - **no_total_loss:** No observation may be <= -1.0 (else compound factor is zero or negative)

## Outcomes

### Compute_geomean (Priority: 1)

_Calculate geometric mean when all returns > -1_

**Given:**
- `returns` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.geometric_mean_calculated`

### Total_loss_observation (Priority: 10) — Error: `GEOMEAN_TOTAL_LOSS`

_One or more returns are <= -100%_

**Given:**
- `returns` (input) exists

**Then:**
- **emit_event** event: `return.geomean_rejected`

### Empty_returns (Priority: 11) — Error: `GEOMEAN_EMPTY_RETURNS`

_Empty returns array_

**Given:**
- `returns` (input) not_exists

**Then:**
- **emit_event** event: `return.geomean_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOMEAN_TOTAL_LOSS` | 400 | Geometric mean undefined when a return <= -100% (compound factor non-positive) | No |
| `GEOMEAN_EMPTY_RETURNS` | 400 | Returns array must contain at least one observation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.geometric_mean_calculated` |  | `series_id`, `geometric_mean`, `observation_count`, `frequency`, `volatility_drag` |
| `return.geomean_rejected` |  | `series_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| arithmetic-mean-return | recommended |  |
| time-weighted-return | recommended |  |
| annualized-return | recommended |  |

## AGI Readiness

### Goals

#### Reliable Geometric Mean Return

Compute the geometric mean (compound) return over multiple periods — the actual compound growth rate realised by a buy-and-hold investor

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
| compute_geomean | `autonomous` | - | - |
| total_loss_observation | `autonomous` | - | - |
| empty_returns | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  inputs:
    returns:
      - 0.15
      - -0.05
      - 0.1
      - 0.2
      - -0.1
  computation: "[(1.15)(0.95)(1.10)(1.20)(0.90)]^(1/5) - 1 = (1.297)^0.2 - 1 ≈ 0.0535"
  geometric_mean: 0.0535
  arithmetic_mean_comparison: 0.06
  volatility_drag: 0.0065
numerical_precision:
  decimal_places: 6
  rounding_mode: half_even
  log_form_preferred_when: T is large or some (1+R_t) very close to 0, to avoid underflow
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geometric Mean Return Blueprint",
  "description": "Compute the geometric mean (compound) return over multiple periods — the actual compound growth rate realised by a buy-and-hold investor. 2 fields. 3 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, compound-return, cagr, cfa-level-1"
}
</script>
