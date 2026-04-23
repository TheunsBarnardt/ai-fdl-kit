---
title: "Inflation Targeting Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate an inflation-targeting monetary regime — explicit target, transparency, credibility, and conditions for effective transmission to inflation expectation"
---

# Inflation Targeting Blueprint

> Evaluate an inflation-targeting monetary regime — explicit target, transparency, credibility, and conditions for effective transmission to inflation expectations

| | |
|---|---|
| **Feature** | `inflation-targeting` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, inflation-targeting, credibility, central-bank, expectations, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/inflation-targeting.blueprint.yaml) |
| **JSON API** | [inflation-targeting.json]({{ site.baseurl }}/api/blueprints/trading/inflation-targeting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inflation_analyst` | Inflation Regime Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jurisdiction` | text | Yes | Central bank jurisdiction |  |
| `target_rate` | number | Yes | Explicit inflation target (percent) |  |
| `tolerance_band` | number | No | Symmetric tolerance around target (percent) |  |
| `horizon_months` | number | No | Medium-term horizon over which target applies |  |

## Rules

- **regime_features:**
  - **explicit_target:** Publicly announced numerical inflation target
  - **central_bank_independence:** Operational freedom to set policy tools
  - **transparency:** Regular reports, minutes, forecasts
  - **accountability:** Assessed against the announced target
  - **credibility:** Track record of hitting target anchors expectations
- **conditions_for_success:** Well-developed financial system, Flexible exchange rate, No fiscal dominance, Quality inflation data, Effective transmission via banking sector
- **comparison_to_alternatives:**
  - **monetary_aggregate_targeting:** Targets money supply growth — weak when money demand unstable
  - **exchange_rate_targeting:** Peg to anchor currency — surrenders monetary independence
  - **nominal_gdp_targeting:** Targets nominal spending — less common in practice
- **validation:**
  - **target_positive:** target_rate > 0
  - **jurisdiction_required:** jurisdiction present

## Outcomes

### Evaluate_regime (Priority: 1)

_Score credibility and effectiveness of an inflation-targeting regime_

**Given:**
- `jurisdiction` (input) exists
- `target_rate` (input) gt `0`

**Then:**
- **call_service** target: `inflation_analyst`
- **emit_event** event: `inflation.regime_evaluated`

### Invalid_target (Priority: 10) — Error: `INFL_INVALID_TARGET`

_Target must be positive_

**Given:**
- `target_rate` (input) lte `0`

**Then:**
- **emit_event** event: `inflation.regime_rejected`

### Missing_jurisdiction (Priority: 11) — Error: `INFL_JURISDICTION_MISSING`

_Jurisdiction missing_

**Given:**
- `jurisdiction` (input) not_exists

**Then:**
- **emit_event** event: `inflation.regime_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INFL_INVALID_TARGET` | 400 | target_rate must be greater than zero | No |
| `INFL_JURISDICTION_MISSING` | 400 | jurisdiction is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inflation.regime_evaluated` |  | `evaluation_id`, `jurisdiction`, `target_rate`, `credibility_score`, `expectations_anchor` |
| `inflation.regime_rejected` |  | `evaluation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| monetary-policy-framework | required |  |
| business-cycle-phases | recommended |  |

## AGI Readiness

### Goals

#### Reliable Inflation Targeting

Evaluate an inflation-targeting monetary regime — explicit target, transparency, credibility, and conditions for effective transmission to inflation expectations

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
| `monetary_policy_framework` | monetary-policy-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| evaluate_regime | `autonomous` | - | - |
| invalid_target | `autonomous` | - | - |
| missing_jurisdiction | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Inflation Targeting Blueprint",
  "description": "Evaluate an inflation-targeting monetary regime — explicit target, transparency, credibility, and conditions for effective transmission to inflation expectation",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, inflation-targeting, credibility, central-bank, expectations, cfa-level-1"
}
</script>
