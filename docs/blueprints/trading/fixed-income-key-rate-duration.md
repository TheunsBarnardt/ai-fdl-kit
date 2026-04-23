---
title: "Fixed Income Key Rate Duration Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Measure bond and portfolio sensitivity to non-parallel curve shifts using key-rate durations, steepener/flattener, and butterfly trades. 4 fields. 2 outcomes. 1"
---

# Fixed Income Key Rate Duration Blueprint

> Measure bond and portfolio sensitivity to non-parallel curve shifts using key-rate durations, steepener/flattener, and butterfly trades

| | |
|---|---|
| **Feature** | `fixed-income-key-rate-duration` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, key-rate-duration, curve-risk, steepener, butterfly, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-key-rate-duration.blueprint.yaml) |
| **JSON API** | [fixed-income-key-rate-duration.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-key-rate-duration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `curve_risk_engine` | Curve Risk Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `curve_point_years` | number | No | Curve tenor being perturbed (years) |  |
| `shock_bps` | number | No | Size of the shock (basis points) |  |
| `trade_type` | select | No | parallel \| steepener \| flattener \| butterfly \| reverse_butterfly |  |

## Rules

- **key_rate_duration:**
  - **definition:** Sensitivity of price to a 1 bp shift at a specific curve tenor, holding others fixed
  - **sum_to_effective:** Sum of key-rate durations approximates effective duration for parallel shift
- **principal_components:**
  - **level:** Largest component; captures parallel shifts (about 80-90 percent of variance)
  - **slope:** Steepener/flattener rotation around a mid-point
  - **curvature:** Butterfly; differential movement of belly vs wings
- **curve_trades:**
  - **steepener:** Long short-maturity, short long-maturity; profits when curve steepens
  - **flattener:** Opposite of steepener
  - **butterfly:** Long wings, short belly; profits when curvature increases
- **hedging:**
  - **duration_neutral:** Offset aggregate duration with swaps/futures
  - **key_rate_neutral:** Match key-rate durations bucket by bucket
  - **convexity_hedging:** Options or barbell positions
- **validation:**
  - **portfolio_required:** portfolio_id present

## Outcomes

### Compute_key_rate_risk (Priority: 1)

_Compute key-rate durations and proposed curve trades_

**Given:**
- `portfolio_id` (input) exists

**Then:**
- **call_service** target: `curve_risk_engine`
- **emit_event** event: `curve_risk.computed`

### Missing_portfolio (Priority: 10) — Error: `CURVE_RISK_MISSING_PORTFOLIO`

_Portfolio missing_

**Given:**
- `portfolio_id` (input) not_exists

**Then:**
- **emit_event** event: `curve_risk.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURVE_RISK_MISSING_PORTFOLIO` | 400 | portfolio_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `curve_risk.computed` |  | `computation_id`, `portfolio_id`, `key_rate_durations`, `proposed_trades` |
| `curve_risk.rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-duration-measures | required |  |
| fixed-income-spot-forward-rates | required |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Key Rate Duration

Measure bond and portfolio sensitivity to non-parallel curve shifts using key-rate durations, steepener/flattener, and butterfly trades

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
| `fixed_income_duration_measures` | fixed-income-duration-measures | fail |
| `fixed_income_spot_forward_rates` | fixed-income-spot-forward-rates | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_key_rate_risk | `autonomous` | - | - |
| missing_portfolio | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Key Rate Duration Blueprint",
  "description": "Measure bond and portfolio sensitivity to non-parallel curve shifts using key-rate durations, steepener/flattener, and butterfly trades. 4 fields. 2 outcomes. 1",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, key-rate-duration, curve-risk, steepener, butterfly, cfa-level-1"
}
</script>
