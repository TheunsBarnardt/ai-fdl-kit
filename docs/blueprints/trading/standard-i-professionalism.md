---
title: "Standard I Professionalism Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard I (Professionalism) — Knowledge of the Law, Independence & Objectivity, Misrepresentation, Misconduct, and Competence — to investment professiona"
---

# Standard I Professionalism Blueprint

> Apply Standard I (Professionalism) — Knowledge of the Law, Independence & Objectivity, Misrepresentation, Misconduct, and Competence — to investment professional conduct

| | |
|---|---|
| **Feature** | `standard-i-professionalism` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-i, professionalism, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-i-professionalism.blueprint.yaml) |
| **JSON API** | [standard-i-professionalism.json]({{ site.baseurl }}/api/blueprints/trading/standard-i-professionalism.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_i_reviewer` | Standard I Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | i_a \| i_b \| i_c \| i_d \| i_e |  |

## Rules

- **i_a_knowledge_of_law:**
  - **rule:** Understand and comply with all applicable laws, rules, regulations; strictest standard prevails
  - **dissociation:** Must dissociate from illegal or unethical activity
- **i_b_independence_objectivity:**
  - **rule:** Use reasonable care and judgement; reject or limit gifts and compensation that compromise independence
  - **modest_gifts:** Token, customary gifts acceptable with disclosure
- **i_c_misrepresentation:**
  - **rule:** No false or misleading statements in analysis, recommendations, marketing
  - **plagiarism:** Attribution required
- **i_d_misconduct:**
  - **rule:** No dishonesty, fraud, deceit; no conduct that reflects adversely on professional reputation
- **i_e_competence:**
  - **rule:** Act with, and maintain, the competence necessary to fulfil professional responsibilities
- **violations_examples:**
  - **i_a:** Failing to report violation by colleague
  - **i_b:** Accepting lavish gifts from issuer
  - **i_c:** Copying research without attribution
  - **i_d:** Personal fraud unrelated to work
  - **i_e:** Taking on complex mandate without requisite expertise
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [i_a, i_b, i_c, i_d, i_e]

## Outcomes

### Review_standard_i (Priority: 1)

_Review conduct under Standard I_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `i_a,i_b,i_c,i_d,i_e`

**Then:**
- **call_service** target: `standard_i_reviewer`
- **emit_event** event: `standard_i.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_I_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `i_a,i_b,i_c,i_d,i_e`

**Then:**
- **emit_event** event: `standard_i.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_I_INVALID_SUBSTANDARD` | 400 | substandard must be i_a, i_b, i_c, i_d, or i_e | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_i.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_i.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |

## AGI Readiness

### Goals

#### Reliable Standard I Professionalism

Apply Standard I (Professionalism) — Knowledge of the Law, Independence & Objectivity, Misrepresentation, Misconduct, and Competence — to investment professional conduct

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
| `cfa_code_of_ethics` | cfa-code-of-ethics | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| review_standard_i | `autonomous` | - | - |
| invalid_substandard | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard I Professionalism Blueprint",
  "description": "Apply Standard I (Professionalism) — Knowledge of the Law, Independence & Objectivity, Misrepresentation, Misconduct, and Competence — to investment professiona",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-i, professionalism, cfa-level-1"
}
</script>
