---
title: "Systematic Nonsystematic Risk Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Decompose total risk into systematic (market) and nonsystematic (unique) components, explain diversification of unique risk, and use single-index and market mod"
---

# Systematic Nonsystematic Risk Blueprint

> Decompose total risk into systematic (market) and nonsystematic (unique) components, explain diversification of unique risk, and use single-index and market models for estimation

| | |
|---|---|
| **Feature** | `systematic-nonsystematic-risk` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, systematic-risk, unique-risk, single-index-model, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/systematic-nonsystematic-risk.blueprint.yaml) |
| **JSON API** | [systematic-nonsystematic-risk.json]({{ site.baseurl }}/api/blueprints/trading/systematic-nonsystematic-risk.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `risk_decomp` | Risk Decomposition Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `decomp_id` | text | Yes | Decomposition identifier |  |
| `asset_return` | number | Yes | Asset return |  |
| `beta` | number | Yes | Beta |  |
| `market_return` | number | Yes | Market return |  |

## Rules

- **total_risk:**
  - **formula:** var(Ri) = beta_i^2 * var(Rm) + var(epsilon_i)
  - **systematic:** beta_i^2 * var(Rm) — compensated market risk
  - **nonsystematic:** var(epsilon_i) — firm-specific, diversifiable
- **market_model:**
  - **equation:** Ri = alpha_i + beta_i * Rm + epsilon_i
  - **estimation:** OLS regression of Ri on Rm
- **single_index_model:**
  - **simplification:** Covariance between assets reduces to beta_i * beta_j * var(Rm)
  - **use:** Enables tractable portfolio variance calculations in large asset sets
- **diversification_effect:**
  - **rule:** As N increases, average idiosyncratic variance falls as 1/N
  - **limit:** Systematic risk remains — cannot be diversified
- **beta_estimation:**
  - **approach:** Rolling regressions 2-5 years
  - **adjusted_beta:** Shrink toward 1.0 to reduce estimation error
- **validation:**
  - **decomp_required:** decomp_id present

## Outcomes

### Decompose_risk (Priority: 1)

_Decompose asset risk into systematic and nonsystematic_

**Given:**
- `decomp_id` (input) exists

**Then:**
- **call_service** target: `risk_decomp`
- **emit_event** event: `risk.decomposed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RISK_DECOMP_INVALID` | 400 | decomposition inputs invalid | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `risk.decomposed` |  | `decomp_id`, `systematic_variance`, `nonsystematic_variance`, `beta`, `r_squared` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| beta-market-model | required |  |
| capm-security-market-line | required |  |

## AGI Readiness

### Goals

#### Reliable Systematic Nonsystematic Risk

Decompose total risk into systematic (market) and nonsystematic (unique) components, explain diversification of unique risk, and use single-index and market models for estimation

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
| `beta_market_model` | beta-market-model | fail |
| `capm_security_market_line` | capm-security-market-line | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| decompose_risk | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Systematic Nonsystematic Risk Blueprint",
  "description": "Decompose total risk into systematic (market) and nonsystematic (unique) components, explain diversification of unique risk, and use single-index and market mod",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, systematic-risk, unique-risk, single-index-model, cfa-level-1"
}
</script>
