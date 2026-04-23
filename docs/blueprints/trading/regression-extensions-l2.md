---
title: "Regression Extensions L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply regression extensions — influence analysis (leverage, studentised residuals, Cook's D), dummy variables (intercept and slope), and qualitative dependents "
---

# Regression Extensions L2 Blueprint

> Apply regression extensions — influence analysis (leverage, studentised residuals, Cook's D), dummy variables (intercept and slope), and qualitative dependents (logit, probit)

| | |
|---|---|
| **Feature** | `regression-extensions-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quant, influence-analysis, dummy-variables, logit, probit, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/regression-extensions-l2.blueprint.yaml) |
| **JSON API** | [regression-extensions-l2.json]({{ site.baseurl }}/api/blueprints/trading/regression-extensions-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `regression_extensions_engine` | Regression Extensions Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `model_id` | text | Yes | Model identifier |  |
| `extension_type` | select | Yes | influence \| dummy \| logit \| probit |  |

## Rules

- **influence_analysis:**
  - **leverage:** Hat matrix diagonal h_ii; high leverage if h_ii > 3*(k+1)/n
  - **studentised_residuals:** Residual / its estimated SE; |t*| > 3 flags outlier
  - **cooks_distance:** D_i = (r_i² / (k+1)) * (h_ii/(1-h_ii)²); D_i > 1 (or > 0.5 cautious) flags influential observation
  - **detection_rule:** An observation is influential when removing it materially changes the fitted coefficients
- **dummy_variables:**
  - **intercept_dummy:** 0/1 indicator that shifts intercept for category
  - **slope_dummy:** Interaction term X*D allowing slope to vary by category
  - **n_minus_1_rule:** For n categories, use n-1 dummies to avoid the dummy variable trap
- **qualitative_dependents:**
  - **logit:** ln(p/(1-p)) = b0 + b1X1 + …; coefficients interpreted as log-odds change
  - **probit:** Φ⁻¹(p) = b0 + b1X1 + …; uses standard normal CDF link
  - **estimation:** Maximum likelihood; not OLS
  - **pseudo_r_squared:** McFadden R² for fit comparison
- **validation:**
  - **model_required:** model_id present
  - **valid_extension:** extension_type in [influence, dummy, logit, probit]

## Outcomes

### Apply_extension (Priority: 1)

_Apply regression extension_

**Given:**
- `model_id` (input) exists
- `extension_type` (input) in `influence,dummy,logit,probit`

**Then:**
- **call_service** target: `regression_extensions_engine`
- **emit_event** event: `regression_ext.applied`

### Invalid_extension (Priority: 10) — Error: `REG_EXT_INVALID_TYPE`

_Unsupported extension type_

**Given:**
- `extension_type` (input) not_in `influence,dummy,logit,probit`

**Then:**
- **emit_event** event: `regression_ext.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REG_EXT_INVALID_TYPE` | 400 | extension_type must be influence, dummy, logit, or probit | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `regression_ext.applied` |  | `model_id`, `extension_type`, `key_metric`, `recommended_action` |
| `regression_ext.rejected` |  | `model_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multiple-regression-basics-l2 | required |  |
| regression-misspecification-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Regression Extensions L2

Apply regression extensions — influence analysis (leverage, studentised residuals, Cook's D), dummy variables (intercept and slope), and qualitative dependents (logit, probit)

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
| `multiple_regression_basics_l2` | multiple-regression-basics-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| apply_extension | `autonomous` | - | - |
| invalid_extension | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Regression Extensions L2 Blueprint",
  "description": "Apply regression extensions — influence analysis (leverage, studentised residuals, Cook's D), dummy variables (intercept and slope), and qualitative dependents ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quant, influence-analysis, dummy-variables, logit, probit, cfa-level-2"
}
</script>
