---
title: "Real Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Convert a nominal return to a real (inflation-adjusted) return using the Fisher relation — captures the change in purchasing power. 4 fields. 3 outcomes. 2 erro"
---

# Real Return Blueprint

> Convert a nominal return to a real (inflation-adjusted) return using the Fisher relation — captures the change in purchasing power

| | |
|---|---|
| **Feature** | `real-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, real-return, inflation, fisher, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/real-return.blueprint.yaml) |
| **JSON API** | [real-return.json]({{ site.baseurl }}/api/blueprints/trading/real-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `nominal_return` | number | Yes | Nominal return for the period (decimal) |  |
| `inflation_rate` | number | Yes | Inflation rate over the same period (decimal) |  |
| `formula_variant` | select | No | exact (Fisher) or approximation (default exact) |  |
| `tax_adjustment` | select | No | none \| pre_tax_real \| after_tax_real |  |

## Rules

- **fisher_exact:**
  - **formula:** (1 + R_real) = (1 + R_nominal) / (1 + inflation)
  - **solved:** R_real = (1 + R_nominal) / (1 + inflation) - 1
- **approximation:**
  - **formula:** R_real ≈ R_nominal - inflation
  - **validity:** Accurate when both rates small; diverges at high inflation
- **three_way_decomposition:**
  - **formula:** (1 + R_real_after_tax) = (1 + R_nominal_pre_tax)*(1 - t) / (1 + inflation)
- **appropriate_use:**
  - **long_horizon:** Essential for long-horizon comparisons (retirement planning, endowments)
  - **cross_country:** Required when comparing returns across economies with different inflation regimes
  - **real_assets:** Inflation-indexed bonds quote real yield directly
- **validation:**
  - **inflation_above_total_deflation:** inflation > -1 required (else denominator non-positive)
  - **reasonable_bounds:** Flag inflation > 100% or < -50% as data-quality warning

## Outcomes

### Compute_real_return (Priority: 1)

_Apply Fisher formula to compute real return_

**Given:**
- `nominal_return` (input) exists
- `inflation_rate` (input) gt `-1`

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.real_calculated`

### Invalid_inflation (Priority: 10) — Error: `REAL_INVALID_INFLATION`

_Inflation <= -100%_

**Given:**
- `inflation_rate` (input) lte `-1`

**Then:**
- **emit_event** event: `return.real_rejected`

### Missing_inputs (Priority: 11) — Error: `REAL_MISSING_INPUTS`

_Missing required inputs_

**Given:**
- ANY: `nominal_return` (input) not_exists OR `inflation_rate` (input) not_exists

**Then:**
- **emit_event** event: `return.real_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REAL_INVALID_INFLATION` | 400 | Inflation rate must be strictly greater than -100% | No |
| `REAL_MISSING_INPUTS` | 400 | Both nominal return and inflation rate are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.real_calculated` |  | `portfolio_id`, `nominal_return`, `inflation_rate`, `real_return`, `method` |
| `return.real_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| holding-period-return | required |  |
| after-tax-nominal-return | recommended |  |
| gross-net-return | recommended |  |

## AGI Readiness

### Goals

#### Reliable Real Return

Convert a nominal return to a real (inflation-adjusted) return using the Fisher relation — captures the change in purchasing power

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
| compute_real_return | `autonomous` | - | - |
| invalid_inflation | `autonomous` | - | - |
| missing_inputs | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Nominal 8%, inflation 3%
  inputs:
    nominal_return: 0.08
    inflation_rate: 0.03
  exact: (1.08 / 1.03) - 1 = 0.0485
  approximation: 0.08 - 0.03 = 0.05
  approximation_error: 0.0015
inflation_data_sources:
  - name: CPI
    purpose: Consumer price basket — most common
  - name: CPIX (SA)
    purpose: Consumer price ex-mortgage interest
  - name: Core CPI
    purpose: Strips volatile food/energy
  - name: PPI
    purpose: Producer price index
  - name: GDP Deflator
    purpose: Economy-wide price level
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Real Return Blueprint",
  "description": "Convert a nominal return to a real (inflation-adjusted) return using the Fisher relation — captures the change in purchasing power. 4 fields. 3 outcomes. 2 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, real-return, inflation, fisher, cfa-level-1"
}
</script>
