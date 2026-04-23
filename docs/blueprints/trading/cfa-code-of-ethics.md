---
title: "Cfa Code Of Ethics Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "State the CFA Institute Code of Ethics and its six principles, and describe the organization of the seven Standards of Professional Conduct they govern. 2 field"
---

# Cfa Code Of Ethics Blueprint

> State the CFA Institute Code of Ethics and its six principles, and describe the organization of the seven Standards of Professional Conduct they govern

| | |
|---|---|
| **Feature** | `cfa-code-of-ethics` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, cfa-code, standards-of-conduct, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cfa-code-of-ethics.blueprint.yaml) |
| **JSON API** | [cfa-code-of-ethics.json]({{ site.baseurl }}/api/blueprints/trading/cfa-code-of-ethics.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `code_reviewer` | Code Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `review_id` | text | Yes | Code review identifier |  |
| `member_type` | select | Yes | member \| candidate |  |

## Rules

- **code_principles:**
  - **one:** Act with integrity, competence, diligence, respect, and in ethical manner with clients, prospective clients, colleagues, and employers
  - **two:** Place integrity of the investment profession and interests of clients above own interests
  - **three:** Use reasonable care and exercise independent professional judgement when conducting analysis, making recommendations, taking actions
  - **four:** Practice and encourage others to practice in a professional and ethical manner
  - **five:** Promote integrity and viability of the global capital markets for benefit of society
  - **six:** Maintain and improve professional competence and strive to maintain and improve competence of other investment professionals
- **standards_organization:**
  - **i:** Professionalism
  - **ii:** Integrity of Capital Markets
  - **iii:** Duties to Clients
  - **iv:** Duties to Employers
  - **v:** Investment Analysis, Recommendations, and Actions
  - **vi:** Conflicts of Interest
  - **vii:** Responsibilities as a CFA Institute Member or Candidate
- **applicability:**
  - **who:** CFA Institute members, charter holders, candidates
  - **scope:** All professional activities regardless of jurisdiction
- **validation:**
  - **review_required:** review_id present
  - **valid_member:** member_type in [member, candidate]

## Outcomes

### Review_code_compliance (Priority: 1)

_Review conduct against Code_

**Given:**
- `review_id` (input) exists
- `member_type` (input) in `member,candidate`

**Then:**
- **call_service** target: `code_reviewer`
- **emit_event** event: `code.reviewed`

### Invalid_member (Priority: 10) — Error: `CODE_INVALID_MEMBER`

_Unsupported member type_

**Given:**
- `member_type` (input) not_in `member,candidate`

**Then:**
- **emit_event** event: `code.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CODE_INVALID_MEMBER` | 400 | member_type must be member or candidate | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `code.reviewed` |  | `review_id`, `member_type`, `principles_breached`, `standards_breached` |
| `code.review_rejected` |  | `review_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ethics-framework-investment | required |  |
| standard-i-professionalism | required |  |
| standard-ii-integrity-capital-markets | required |  |
| standard-iii-duties-to-clients | required |  |

## AGI Readiness

### Goals

#### Reliable Cfa Code Of Ethics

State the CFA Institute Code of Ethics and its six principles, and describe the organization of the seven Standards of Professional Conduct they govern

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
| `standard_i_professionalism` | standard-i-professionalism | fail |
| `standard_ii_integrity_capital_markets` | standard-ii-integrity-capital-markets | fail |
| `standard_iii_duties_to_clients` | standard-iii-duties-to-clients | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| review_code_compliance | `autonomous` | - | - |
| invalid_member | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cfa Code Of Ethics Blueprint",
  "description": "State the CFA Institute Code of Ethics and its six principles, and describe the organization of the seven Standards of Professional Conduct they govern. 2 field",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, cfa-code, standards-of-conduct, cfa-level-1"
}
</script>
