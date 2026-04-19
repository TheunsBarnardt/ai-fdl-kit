---
title: "Client Risk Profiling Ips Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "KYC-lite risk questionnaire, risk-score computation, and IPS draft tying client goals to mandate with FATCA/CRS checks. 9 fields. 6 outcomes. 3 error codes. rul"
---

# Client Risk Profiling Ips Blueprint

> KYC-lite risk questionnaire, risk-score computation, and IPS draft tying client goals to mandate with FATCA/CRS checks

| | |
|---|---|
| **Feature** | `client-risk-profiling-ips` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | kyc, risk-profiling, ips, suitability, fatca, crs, client-onboarding |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/client-risk-profiling-ips.blueprint.yaml) |
| **JSON API** | [client-risk-profiling-ips.json]({{ site.baseurl }}/api/blueprints/workflow/client-risk-profiling-ips.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | external | Completes questionnaire and signs IPS |
| `cfa` | Chartered Financial Analyst | human | Reviews profile, drafts and countersigns IPS |
| `compliance_officer` | Compliance Officer | human | Reviews FATCA/CRS flags and high-risk profiles |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | Yes | Client Identifier |  |
| `questionnaire_responses` | json | Yes | Risk Questionnaire Responses |  |
| `risk_score` | number | No | Computed Risk Score (0-100) |  |
| `risk_profile` | select | No | Risk Profile |  |
| `investment_horizon_years` | number | Yes | Investment Horizon (years) |  |
| `liquidity_needs` | text | No | Liquidity Needs |  |
| `goals` | rich_text | Yes | Client Goals |  |
| `fatca_crs_declared` | boolean | Yes | FATCA/CRS Declaration Complete |  |
| `ips_status` | select | Yes | IPS Status |  |

## States

**State field:** `ips_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `intake` | Yes |  |
| `questionnaire_complete` |  |  |
| `profiled` |  |  |
| `ips_drafted` |  |  |
| `ips_signed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `intake` | `questionnaire_complete` | client |  |
|  | `questionnaire_complete` | `profiled` | cfa |  |
|  | `profiled` | `ips_drafted` | cfa |  |
|  | `ips_drafted` | `ips_signed` | client |  |

## Rules

- **questionnaire:**
  - **description:** MUST: All mandatory questions answered; questionnaire version captured; retained 7 years
  - **retention_years:** 7
- **scoring:**
  - **description:** MUST: Deterministic scoring function versioned; score recomputed on any response change
  - **versioned:** true
- **profile_mapping:**
  - **description:** MUST: Risk score maps to profile bands. 0-20 conservative, 21-40 moderate, 41-60 balanced, 61-80 growth, 81-100 aggressive
- **ips_required_sections:**
  - **description:** MUST: IPS includes goals, horizon, risk profile, liquidity, constraints, benchmark, rebalancing policy
  - **required_sections:** goals, horizon, risk_profile, liquidity, constraints, benchmark, rebalancing
- **fatca_crs:**
  - **description:** MUST: FATCA/CRS declaration collected before IPS can be signed; flags escalate to compliance
  - **blocks_signing_when_missing:** true
- **signing:**
  - **description:** MUST: Client signs IPS electronically with audit trail; CFA countersigns
  - **dual_signature:** true

## Outcomes

### Questionnaire_incomplete (Priority: 2) — Error: `PROFILING_QUESTIONNAIRE_INCOMPLETE`

_One or more mandatory questions unanswered_

**Given:**
- any mandatory question lacks a response

**Result:** Client prompted to complete missing fields

### Fatca_crs_flagged (Priority: 3) — Error: `PROFILING_FATCA_CRS_FLAGGED`

_FATCA/CRS declaration reveals cross-border tax status needing review_

**Given:**
- fatca_crs declaration indicates foreign tax residency or US person

**Then:**
- **notify** target: `compliance_officer`
- **emit_event** event: `profiling.fatca_crs_flagged`

**Result:** Case routed to compliance

### Questionnaire_submitted_successfully (Priority: 10) | Transaction: atomic

_All mandatory questionnaire fields captured_

**Given:**
- `questionnaire_responses` (input) exists
- every mandatory question has a response

**Then:**
- **transition_state** field: `ips_status` from: `intake` to: `questionnaire_complete`
- **emit_event** event: `profiling.questionnaire_submitted`

**Result:** Questionnaire persisted

### Risk_profile_computed (Priority: 10)

_Risk score computed and mapped to profile band_

**Given:**
- `questionnaire_responses` (input) exists

**Then:**
- **set_field** target: `risk_score` value: `computed`
- **set_field** target: `risk_profile` value: `mapped_band`
- **emit_event** event: `profiling.profile_computed`

**Result:** Profile assigned

### Ips_generated (Priority: 10)

_IPS draft produced from questionnaire and profile_

**Given:**
- risk_profile is set
- goals and horizon are captured

**Then:**
- **transition_state** field: `ips_status` from: `profiled` to: `ips_drafted`
- **emit_event** event: `profiling.ips_drafted`

**Result:** IPS draft ready for review

### Ips_signed (Priority: 10) | Transaction: atomic

_Client and CFA have electronically signed the IPS_

**Given:**
- client signature captured
- cfa countersignature captured
- `fatca_crs_declared` (input) eq `true`

**Then:**
- **transition_state** field: `ips_status` from: `ips_drafted` to: `ips_signed`
- **emit_event** event: `profiling.ips_signed`

**Result:** IPS active; trading may begin

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PROFILING_QUESTIONNAIRE_INCOMPLETE` | 422 | Please complete all required questions. | Yes |
| `PROFILING_FATCA_CRS_FLAGGED` | 409 | Your declaration requires compliance review. | No |
| `PROFILING_NOT_FOUND` | 404 | Client profile not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `profiling.questionnaire_submitted` | Client finished the questionnaire | `client_id` |
| `profiling.profile_computed` | Risk profile assigned | `client_id`, `risk_score`, `risk_profile` |
| `profiling.ips_drafted` | IPS draft generated | `client_id` |
| `profiling.ips_signed` | IPS fully signed | `client_id` |
| `profiling.fatca_crs_flagged` | Cross-border tax flag raised | `client_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fund-creation-lifecycle | recommended | Client IPS guides fund mandate selection |
| pre-trade-compliance-checks | required | IPS constraints feed pre-trade compliance |
| immutable-audit-log | required | All questionnaire and signing events must be audited |
| popia-compliance | required | Client personal information handling must satisfy POPIA |

## AGI Readiness

### Goals

#### Suitable Advice

Ensure every client has a current, signed IPS aligned to their risk profile and goals before any trade

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| ips_coverage | = 100% | Percentage of active clients with signed IPS within 30 days of onboarding |

**Constraints:**

- **regulatory** (non-negotiable): FATCA/CRS declaration is mandatory

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- CFA confirms computed profile
- client signs IPS
- compliance reviews FATCA/CRS flags

**Escalation Triggers:**

- `fatca_crs_flagged`
- `risk_score >= 81 and investment_horizon_years < 3`

### Verification

**Invariants:**

- no signed IPS without FATCA/CRS declaration
- risk_profile matches band for computed risk_score
- all IPS versions are preserved

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| questionnaire_submitted_successfully | `autonomous` | - | - |
| risk_profile_computed | `autonomous` | - | - |
| ips_generated | `supervised` | - | - |
| ips_signed | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Client Risk Profiling Ips Blueprint",
  "description": "KYC-lite risk questionnaire, risk-score computation, and IPS draft tying client goals to mandate with FATCA/CRS checks. 9 fields. 6 outcomes. 3 error codes. rul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "kyc, risk-profiling, ips, suitability, fatca, crs, client-onboarding"
}
</script>
