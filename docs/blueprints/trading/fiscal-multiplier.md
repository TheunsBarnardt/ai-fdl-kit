---
title: "Fiscal Multiplier Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Estimate the impact of changes in government spending or taxes on aggregate output using the simple Keynesian multiplier and the balanced-budget multiplier. 4 f"
---

# Fiscal Multiplier Blueprint

> Estimate the impact of changes in government spending or taxes on aggregate output using the simple Keynesian multiplier and the balanced-budget multiplier

| | |
|---|---|
| **Feature** | `fiscal-multiplier` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, fiscal-multiplier, mpc, balanced-budget, keynesian, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fiscal-multiplier.blueprint.yaml) |
| **JSON API** | [fiscal-multiplier.json]({{ site.baseurl }}/api/blueprints/trading/fiscal-multiplier.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fiscal_engine` | Fiscal Multiplier Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario_id` | text | Yes | Scenario identifier |  |
| `marginal_propensity_to_consume` | number | Yes | MPC (0 to 1) |  |
| `tax_rate` | number | No | Average marginal tax rate |  |
| `shock` | json | Yes | Fiscal shock: delta_spending and/or delta_tax |  |

## Rules

- **simple_spending_multiplier:**
  - **formula:** k = 1 / (1 - MPC * (1 - t))
  - **interpretation:** A 1 unit increase in G raises GDP by k units
- **tax_multiplier:**
  - **formula:** k_T = -MPC / (1 - MPC * (1 - t))
  - **interpretation:** Absolute value smaller than the spending multiplier because part of tax cut is saved
- **balanced_budget_multiplier:**
  - **formula:** k_BB = (1 - MPC) / (1 - MPC * (1 - t))
  - **key_result:** Even when spending and taxes rise by equal amounts, output still expands (classic Haavelmo result)
- **factors_amplifying_or_dampening:**
  - **amplify:** High MPC (low savings rate), Zero lower bound on rates (no monetary offset), Recession / slack capacity, Stimulus aimed at liquidity-constrained households
  - **dampen:** Crowding out of private investment via higher rates, Imports leaking demand abroad (open economy), Ricardian households saving in anticipation of taxes, Full employment (supply constraints)
- **applications:**
  - **scenario_modelling:** Compare stimulus packages using multiplier ranges
  - **nowcasting_gdp:** Incorporate announced fiscal actions into near-term GDP forecasts
  - **credit_analysis:** Larger multipliers imply bigger revenue recovery for banks
- **validation:**
  - **valid_mpc:** 0 < MPC < 1
  - **valid_tax_rate:** 0 <= tax_rate < 1
  - **shock_present:** shock must exist

## Outcomes

### Compute_multiplier (Priority: 1)

_Calculate spending and tax multipliers for the given economy_

**Given:**
- `marginal_propensity_to_consume` (input) gt `0`
- `marginal_propensity_to_consume` (input) lt `1`
- `shock` (input) exists

**Then:**
- **call_service** target: `fiscal_engine`
- **emit_event** event: `fiscal.multiplier_computed`

### Invalid_mpc (Priority: 10) — Error: `MULT_INVALID_MPC`

_MPC outside (0, 1)_

**Given:**
- ANY: `marginal_propensity_to_consume` (input) lte `0` OR `marginal_propensity_to_consume` (input) gte `1`

**Then:**
- **emit_event** event: `fiscal.multiplier_rejected`

### Missing_shock (Priority: 11) — Error: `MULT_SHOCK_MISSING`

_Shock scenario missing_

**Given:**
- `shock` (input) not_exists

**Then:**
- **emit_event** event: `fiscal.multiplier_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MULT_INVALID_MPC` | 400 | MPC must lie strictly between 0 and 1 | No |
| `MULT_SHOCK_MISSING` | 400 | shock scenario is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fiscal.multiplier_computed` |  | `scenario_id`, `spending_multiplier`, `tax_multiplier`, `balanced_budget_multiplier`, `gdp_impact` |
| `fiscal.multiplier_rejected` |  | `scenario_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fiscal-policy-framework | required |  |
| fiscal-deficits-debt | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fiscal Multiplier

Estimate the impact of changes in government spending or taxes on aggregate output using the simple Keynesian multiplier and the balanced-budget multiplier

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
| `fiscal_policy_framework` | fiscal-policy-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_multiplier | `autonomous` | - | - |
| invalid_mpc | `autonomous` | - | - |
| missing_shock | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  mpc: 0.8
  tax_rate: 0.2
  spending_multiplier: 1 / (1 - 0.8 * 0.8) = 1 / 0.36 = 2.778
  tax_multiplier: -0.8 / 0.36 = -2.222
  balanced_budget_multiplier: (1 - 0.8) / 0.36 = 0.556
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fiscal Multiplier Blueprint",
  "description": "Estimate the impact of changes in government spending or taxes on aggregate output using the simple Keynesian multiplier and the balanced-budget multiplier. 4 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, fiscal-multiplier, mpc, balanced-budget, keynesian, cfa-level-1"
}
</script>
