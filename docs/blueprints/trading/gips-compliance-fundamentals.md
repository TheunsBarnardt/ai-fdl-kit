---
title: "Gips Compliance Fundamentals Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Describe the Global Investment Performance Standards — who can claim compliance, benefits of compliance, fundamentals of compliance, and key verification and pr"
---

# Gips Compliance Fundamentals Blueprint

> Describe the Global Investment Performance Standards — who can claim compliance, benefits of compliance, fundamentals of compliance, and key verification and presentation requirements

| | |
|---|---|
| **Feature** | `gips-compliance-fundamentals` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, gips, performance-standards, composite-presentation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/gips-compliance-fundamentals.blueprint.yaml) |
| **JSON API** | [gips-compliance-fundamentals.json]({{ site.baseurl }}/api/blueprints/trading/gips-compliance-fundamentals.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `gips_assessor` | GIPS Compliance Assessor | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `firm_id` | text | Yes | Firm identifier |  |
| `compliance_status` | select | Yes | compliant \| non_compliant \| pending_verification |  |

## Rules

- **purpose:**
  - **fair_representation:** Ethical, voluntary global standard for presenting performance
  - **comparability:** Prospective clients can compare firms on like-for-like basis
- **who_can_claim:**
  - **firm_wide:** Only at firm level; individual portfolios cannot claim GIPS compliance
  - **applicability:** Investment management firms managing assets for third parties
- **benefits:**
  - **marketing:** Distinguish from non-compliant competitors
  - **controls:** Strengthens internal controls and data quality
  - **global_acceptance:** Portable to prospective clients worldwide
- **fundamentals_of_compliance:**
  - **input_data:** Fair value, accrual accounting, consistent valuation
  - **calculation_methodology:** Time-weighted returns, subperiod linking, geometric compounding
  - **composites:** All fee-paying discretionary portfolios in at least one composite
  - **disclosures:** Provide required disclosures in each presentation
  - **presentation_and_reporting:** Meet minimum reporting and statistic requirements
- **verification:**
  - **optional_third_party:** Independent verifier attests to firm-wide compliance
  - **composite_specific:** Additional performance examination on individual composites
- **validation:**
  - **firm_required:** firm_id present
  - **valid_status:** compliance_status in allowed set

## Outcomes

### Assess_gips_compliance (Priority: 1)

_Assess GIPS compliance status_

**Given:**
- `firm_id` (input) exists
- `compliance_status` (input) in `compliant,non_compliant,pending_verification`

**Then:**
- **call_service** target: `gips_assessor`
- **emit_event** event: `gips.assessed`

### Invalid_status (Priority: 10) — Error: `GIPS_INVALID_STATUS`

_Unsupported compliance status_

**Given:**
- `compliance_status` (input) not_in `compliant,non_compliant,pending_verification`

**Then:**
- **emit_event** event: `gips.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GIPS_INVALID_STATUS` | 400 | compliance_status must be compliant, non_compliant, or pending_verification | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `gips.assessed` |  | `firm_id`, `compliance_status`, `gaps`, `verification_recommended` |
| `gips.assessment_rejected` |  | `firm_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gips-composites-requirements | required |  |
| standard-iii-duties-to-clients | recommended |  |

## AGI Readiness

### Goals

#### Reliable Gips Compliance Fundamentals

Describe the Global Investment Performance Standards — who can claim compliance, benefits of compliance, fundamentals of compliance, and key verification and presentation requirements

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
| `gips_composites_requirements` | gips-composites-requirements | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| assess_gips_compliance | `autonomous` | - | - |
| invalid_status | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gips Compliance Fundamentals Blueprint",
  "description": "Describe the Global Investment Performance Standards — who can claim compliance, benefits of compliance, fundamentals of compliance, and key verification and pr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, gips, performance-standards, composite-presentation, cfa-level-1"
}
</script>
