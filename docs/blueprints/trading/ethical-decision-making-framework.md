---
title: "Ethical Decision Making Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply a structured ethical decision-making framework to investment situations — identify facts, stakeholders, conflicts, ethical principles, options, and the fi"
---

# Ethical Decision Making Framework Blueprint

> Apply a structured ethical decision-making framework to investment situations — identify facts, stakeholders, conflicts, ethical principles, options, and the final decision with rationale

| | |
|---|---|
| **Feature** | `ethical-decision-making-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, decision-framework, stakeholders, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/ethical-decision-making-framework.blueprint.yaml) |
| **JSON API** | [ethical-decision-making-framework.json]({{ site.baseurl }}/api/blueprints/trading/ethical-decision-making-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `edm_engine` | Ethical Decision Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `stakeholders` | json | Yes | Affected parties |  |

## Rules

- **steps:**
  - **identify:** Situation, stakeholders, duties, ethical principles
  - **consider:** Relevant Code/Standards and firm policies
  - **decide:** Choose action that upholds ethical obligations
  - **act:** Implement decision; escalate if needed
  - **reflect:** Evaluate outcome; learn for future cases
- **stakeholder_analysis:**
  - **identify_interests:** Clients, employers, colleagues, markets, self
  - **weight_duties:** Fiduciary duty to clients is paramount
- **conflict_resolution:**
  - **priorities:** Client > employer > self within ethics constraints
  - **disclosure:** When conflict cannot be eliminated, disclose fully
- **common_pitfalls:**
  - **action_bias:** Preferring any action over inaction
  - **in_group_loyalty:** Siding with firm against client
  - **moral_disengagement:** Reframing harm as acceptable
- **validation:**
  - **case_required:** case_id present

## Outcomes

### Apply_framework (Priority: 1)

_Apply ethical decision framework_

**Given:**
- `case_id` (input) exists
- `stakeholders` (input) exists

**Then:**
- **call_service** target: `edm_engine`
- **emit_event** event: `edm.applied`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EDM_MISSING_INPUTS` | 400 | case_id and stakeholders required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `edm.applied` |  | `case_id`, `recommendation`, `rationale`, `escalation_required` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ethics-framework-investment | required |  |
| cfa-code-of-ethics | required |  |

## AGI Readiness

### Goals

#### Reliable Ethical Decision Making Framework

Apply a structured ethical decision-making framework to investment situations — identify facts, stakeholders, conflicts, ethical principles, options, and the final decision with rationale

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
| `ethics_framework_investment` | ethics-framework-investment | fail |
| `cfa_code_of_ethics` | cfa-code-of-ethics | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| apply_framework | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ethical Decision Making Framework Blueprint",
  "description": "Apply a structured ethical decision-making framework to investment situations — identify facts, stakeholders, conflicts, ethical principles, options, and the fi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, decision-framework, stakeholders, cfa-level-1"
}
</script>
