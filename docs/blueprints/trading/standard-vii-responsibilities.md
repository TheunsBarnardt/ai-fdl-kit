---
title: "Standard Vii Responsibilities Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard VII (Responsibilities as CFA Member/Candidate) — Conduct in the CFA Program and proper reference to CFA Institute, designation, and program. 2 fi"
---

# Standard Vii Responsibilities Blueprint

> Apply Standard VII (Responsibilities as CFA Member/Candidate) — Conduct in the CFA Program and proper reference to CFA Institute, designation, and program

| | |
|---|---|
| **Feature** | `standard-vii-responsibilities` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-vii, cfa-program-conduct, designation-usage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-vii-responsibilities.blueprint.yaml) |
| **JSON API** | [standard-vii-responsibilities.json]({{ site.baseurl }}/api/blueprints/trading/standard-vii-responsibilities.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_vii_reviewer` | Standard VII Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | vii_a \| vii_b |  |

## Rules

- **vii_a_conduct_in_cfa_program:**
  - **rule:** Do not engage in conduct that compromises the reputation or integrity of CFA Institute, CFA designation, or the integrity, validity, or security of CFA examinations
  - **violations:** Cheating, exam disclosure, misusing confidential info about exam content
- **vii_b_reference_to_cfa:**
  - **rule:** When referring to CFA Institute membership, CFA designation, or candidacy, must not misrepresent or exaggerate meaning
  - **factual_statements:** 'Passed Level I on first attempt' is factual; 'CFA I' or 'CFAI' suggesting partial designation is not allowed
  - **candidacy:** Must be active candidate to claim candidate status
- **proper_designation_usage:**
  - **letters:** CFA or Chartered Financial Analyst after name — only after earning charter
  - **format:** Not a noun ('a CFA'), always an adjective ('a CFA charterholder')
- **recommended_procedures:**
  - **training:** Ensure understanding of exam conduct rules
  - **consistency_checks:** Review marketing materials and CVs for proper designation usage
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [vii_a, vii_b]

## Outcomes

### Review_standard_vii (Priority: 1)

_Review conduct under Standard VII_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `vii_a,vii_b`

**Then:**
- **call_service** target: `standard_vii_reviewer`
- **emit_event** event: `standard_vii.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_VII_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `vii_a,vii_b`

**Then:**
- **emit_event** event: `standard_vii.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_VII_INVALID_SUBSTANDARD` | 400 | substandard must be vii_a or vii_b | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_vii.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_vii.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |

## AGI Readiness

### Goals

#### Reliable Standard Vii Responsibilities

Apply Standard VII (Responsibilities as CFA Member/Candidate) — Conduct in the CFA Program and proper reference to CFA Institute, designation, and program

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
| review_standard_vii | `autonomous` | - | - |
| invalid_substandard | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Vii Responsibilities Blueprint",
  "description": "Apply Standard VII (Responsibilities as CFA Member/Candidate) — Conduct in the CFA Program and proper reference to CFA Institute, designation, and program. 2 fi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-vii, cfa-program-conduct, designation-usage, cfa-level-1"
}
</script>
