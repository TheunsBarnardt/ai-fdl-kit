---
title: "Time Weighted Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Calculate time-weighted rate of return by chain-linking sub-period HPRs, neutralising the effect of external cash flow timing for fair manager evaluation. 3 fie"
---

# Time Weighted Return Blueprint

> Calculate time-weighted rate of return by chain-linking sub-period HPRs, neutralising the effect of external cash flow timing for fair manager evaluation

| | |
|---|---|
| **Feature** | `time-weighted-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, twr, gips, performance, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/time-weighted-return.blueprint.yaml) |
| **JSON API** | [time-weighted-return.json]({{ site.baseurl }}/api/blueprints/trading/time-weighted-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sub_period_returns` | json | Yes | Array of sub-period HPRs, each bracketing an external cash flow |  |
| `periods_per_year` | number | No | Compounding frequency for annualization |  |
| `valuation_method` | select | No | How sub-periods are formed (exact_valuation, modified_dietz, daily_valuation) |  |

## Rules

- **core_formula:**
  - **twr_chain_link:** R_TWR = [product(1 + R_t) for t=1..T]^(1/years) - 1
  - **sub_period_definition:** A new sub-period begins every time there is an external cash flow
  - **sub_period_hpr:** R_t = (EMV_t - BMV_t - ExternalFlow_t) / BMV_t under specific conventions
- **conventions:**
  - **exact_method:** Revalue portfolio immediately before every external flow — most accurate
  - **modified_dietz:** Weight external flows by fraction of period — approximation when daily valuation unavailable
  - **daily_valuation:** GIPS-compliant preferred method post-2010
- **appropriate_use:**
  - **manager_evaluation:** Preferred return measure for comparing managers — removes cash flow timing effects
  - **gips_compliance:** Required by CFA Institute GIPS standards for composite performance
- **validation:**
  - **non_empty:** At least one sub-period required
  - **no_total_loss:** No sub-period return may be <= -1.0

## Outcomes

### Compute_twr (Priority: 1)

_Chain-link sub-period returns when valid_

**Given:**
- `sub_period_returns` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.twr_calculated`

### Total_loss_sub_period (Priority: 10) — Error: `TWR_TOTAL_LOSS_SUBPERIOD`

_A sub-period return is <= -100%_

**Given:**
- `sub_period_returns` (input) exists

**Then:**
- **emit_event** event: `return.twr_rejected`

### Empty_sub_periods (Priority: 11) — Error: `TWR_EMPTY_SUBPERIODS`

_No sub-period returns provided_

**Given:**
- `sub_period_returns` (input) not_exists

**Then:**
- **emit_event** event: `return.twr_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TWR_TOTAL_LOSS_SUBPERIOD` | 400 | A sub-period return <= -100% makes TWR undefined | No |
| `TWR_EMPTY_SUBPERIODS` | 400 | At least one sub-period return is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.twr_calculated` |  | `portfolio_id`, `twr`, `annualized_twr`, `sub_period_count`, `valuation_method` |
| `return.twr_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| money-weighted-return | required |  |
| holding-period-return | required |  |
| geometric-mean-return | recommended |  |
| annualized-return | recommended |  |

## AGI Readiness

### Goals

#### Reliable Time Weighted Return

Calculate time-weighted rate of return by chain-linking sub-period HPRs, neutralising the effect of external cash flow timing for fair manager evaluation

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
| `money_weighted_return` | money-weighted-return | fail |
| `holding_period_return` | holding-period-return | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_twr | `autonomous` | - | - |
| total_loss_sub_period | `autonomous` | - | - |
| empty_sub_periods | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Year 1 HPR = 15%, Year 2 HPR = 6.7% (bracketing investor's cash flow)
  sub_period_returns:
    - 0.15
    - 0.067
  computation: "[(1.15)(1.067)]^(1/2) - 1 ≈ 0.108"
  twr: 0.108
  mwr_comparison: 0.0968
  interpretation: Manager return ≈ 10.8% per year; investor's MWR of 9.68% differs
    due to cash flow timing
methods_detail:
  exact_valuation:
    description: Revalue portfolio on every external cash flow date
    accuracy: highest
  modified_dietz:
    formula: R ≈ (EMV - BMV - CF) / (BMV + sum(w_i * CF_i))
    description: Weights cash flows by fraction of period remaining
    accuracy: approximation
  daily_valuation:
    description: Compound daily HPRs
    gips_standard: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Time Weighted Return Blueprint",
  "description": "Calculate time-weighted rate of return by chain-linking sub-period HPRs, neutralising the effect of external cash flow timing for fair manager evaluation. 3 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, twr, gips, performance, cfa-level-1"
}
</script>
