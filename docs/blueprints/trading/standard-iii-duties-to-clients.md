---
title: "Standard Iii Duties To Clients Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard III (Duties to Clients) — Loyalty Prudence & Care, Fair Dealing, Suitability, Performance Presentation, and Preservation of Confidentiality — to "
---

# Standard Iii Duties To Clients Blueprint

> Apply Standard III (Duties to Clients) — Loyalty Prudence & Care, Fair Dealing, Suitability, Performance Presentation, and Preservation of Confidentiality — to client interactions

| | |
|---|---|
| **Feature** | `standard-iii-duties-to-clients` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-iii, fiduciary, suitability, confidentiality, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-iii-duties-to-clients.blueprint.yaml) |
| **JSON API** | [standard-iii-duties-to-clients.json]({{ site.baseurl }}/api/blueprints/trading/standard-iii-duties-to-clients.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_iii_reviewer` | Standard III Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | iii_a \| iii_b \| iii_c \| iii_d \| iii_e |  |

## Rules

- **iii_a_loyalty_prudence_care:**
  - **rule:** Act for the benefit of clients; place client interests before employer or personal
  - **soft_dollars:** Use solely for client benefit; disclose arrangements
- **iii_b_fair_dealing:**
  - **rule:** Deal fairly and objectively with all clients in recommendations, investment action, and advice
  - **premium_services:** Allowed if disclosed and available to all qualified clients
- **iii_c_suitability:**
  - **requirement:** IPS based investigation of financial situation, objectives, constraints
  - **ongoing:** Review suitability as circumstances change
- **iii_d_performance_presentation:**
  - **rule:** Fair, accurate, complete presentation of performance
  - **no_misrepresentation:** Include fees, composite definitions, benchmarks
- **iii_e_preservation_confidentiality:**
  - **rule:** Keep client information confidential unless illegality, law requires, client permits
- **recommended_procedures:**
  - **written_ips:** Maintain updated IPS for each client
  - **trading_priorities:** Fair allocation of trades across clients
  - **performance_gips:** Align with GIPS for presentation
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [iii_a, iii_b, iii_c, iii_d, iii_e]

## Outcomes

### Review_standard_iii (Priority: 1)

_Review conduct under Standard III_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `iii_a,iii_b,iii_c,iii_d,iii_e`

**Then:**
- **call_service** target: `standard_iii_reviewer`
- **emit_event** event: `standard_iii.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_III_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `iii_a,iii_b,iii_c,iii_d,iii_e`

**Then:**
- **emit_event** event: `standard_iii.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_III_INVALID_SUBSTANDARD` | 400 | substandard must be iii_a, iii_b, iii_c, iii_d, or iii_e | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_iii.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_iii.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |
| investment-policy-statement-ips | recommended |  |

## AGI Readiness

### Goals

#### Reliable Standard Iii Duties To Clients

Apply Standard III (Duties to Clients) — Loyalty Prudence & Care, Fair Dealing, Suitability, Performance Presentation, and Preservation of Confidentiality — to client interactions

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
| review_standard_iii | `autonomous` | - | - |
| invalid_substandard | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Iii Duties To Clients Blueprint",
  "description": "Apply Standard III (Duties to Clients) — Loyalty Prudence & Care, Fair Dealing, Suitability, Performance Presentation, and Preservation of Confidentiality — to ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-iii, fiduciary, suitability, confidentiality, cfa-level-1"
}
</script>
