---
title: "Equity Return Roe Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute accounting return on equity and cost of equity, decompose ROE using DuPont analysis, and reconcile book value with intrinsic equity value. 6 fields. 3 o"
---

# Equity Return Roe Blueprint

> Compute accounting return on equity and cost of equity, decompose ROE using DuPont analysis, and reconcile book value with intrinsic equity value

| | |
|---|---|
| **Feature** | `equity-return-roe` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, roe, cost-of-equity, dupont, intrinsic-value, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-return-roe.blueprint.yaml) |
| **JSON API** | [equity-return-roe.json]({{ site.baseurl }}/api/blueprints/trading/equity-return-roe.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `roe_analyst` | Return-on-Equity Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `net_income` | number | Yes | Net income available to common |  |
| `avg_equity` | number | Yes | Average shareholders equity |  |
| `risk_free_rate` | number | No | Risk-free rate (decimal) |  |
| `beta` | number | No | Equity beta |  |
| `equity_premium` | number | No | Equity risk premium (decimal) |  |

## Rules

- **roe_basic:**
  - **formula:** Net income / average common equity
- **dupont_three_factor:**
  - **formula:** (NI/Sales) * (Sales/Assets) * (Assets/Equity)
  - **interpretation:** Margin x turnover x leverage
- **dupont_five_factor:**
  - **formula:** (NI/EBT) * (EBT/EBIT) * (EBIT/Sales) * (Sales/Assets) * (Assets/Equity)
  - **interpretation:** Tax burden x interest burden x operating margin x turnover x leverage
- **cost_of_equity_methods:**
  - **capm:** Rf + beta * equity_risk_premium
  - **ddm_implied:** Dividend/Price + g
  - **bond_yield_plus:** Bond yield + equity risk premium (approx 3-5 percent)
- **required_return_uses:** Discount rate for DDM, FCFE, Hurdle rate in capital budgeting, Benchmark for ROE sustainability
- **value_creation:**
  - **condition:** ROE > cost of equity -> economic profit
  - **signal:** Persistent spread indicates franchise value
- **validation:**
  - **entity_required:** entity_id present
  - **positive_equity:** avg_equity > 0

## Outcomes

### Compute_roe_and_ke (Priority: 1)

_Compute ROE decomposition and cost of equity_

**Given:**
- `entity_id` (input) exists
- `avg_equity` (input) gt `0`

**Then:**
- **call_service** target: `roe_analyst`
- **emit_event** event: `roe.computed`

### Invalid_equity (Priority: 10) — Error: `ROE_INVALID_EQUITY`

_Equity non-positive_

**Given:**
- `avg_equity` (input) lte `0`

**Then:**
- **emit_event** event: `roe.computation_rejected`

### Missing_entity (Priority: 11) — Error: `ROE_ENTITY_MISSING`

_Entity missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `roe.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ROE_INVALID_EQUITY` | 400 | avg_equity must be positive | No |
| `ROE_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `roe.computed` |  | `computation_id`, `entity_id`, `roe`, `cost_of_equity`, `economic_spread` |
| `roe.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-valuation-ddm | required |  |
| fsa-ratio-analysis | required |  |

## AGI Readiness

### Goals

#### Reliable Equity Return Roe

Compute accounting return on equity and cost of equity, decompose ROE using DuPont analysis, and reconcile book value with intrinsic equity value

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
| `equity_valuation_ddm` | equity-valuation-ddm | fail |
| `fsa_ratio_analysis` | fsa-ratio-analysis | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_roe_and_ke | `autonomous` | - | - |
| invalid_equity | `autonomous` | - | - |
| missing_entity | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Return Roe Blueprint",
  "description": "Compute accounting return on equity and cost of equity, decompose ROE using DuPont analysis, and reconcile book value with intrinsic equity value. 6 fields. 3 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, roe, cost-of-equity, dupont, intrinsic-value, cfa-level-1"
}
</script>
