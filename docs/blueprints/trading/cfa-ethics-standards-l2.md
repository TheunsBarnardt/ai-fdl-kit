---
title: "Cfa Ethics Standards L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conf"
---

# Cfa Ethics Standards L2 Blueprint

> Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conflicts, CFA designation)

| | |
|---|---|
| **Feature** | `cfa-ethics-standards-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, professional-standards, cfa-standards, conflicts-of-interest, fiduciary-duty, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cfa-ethics-standards-l2.blueprint.yaml) |
| **JSON API** | [cfa-ethics-standards-l2.json]({{ site.baseurl }}/api/blueprints/trading/cfa-ethics-standards-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ethics_reviewer` | Ethics and Compliance Reviewer | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `member_id` | text | Yes | Member or candidate identifier |  |
| `standard_group` | select | Yes | professionalism \| capital_markets \| clients \| employers \| investment_analysis \| conflicts \| cfa_responsibilities |  |

## Rules

- **code_of_ethics:**
  - **act_integrity:** Act with integrity, competence, diligence, and respect
  - **client_primacy:** Place interests of clients above personal interests
  - **independence:** Maintain objectivity and independence
  - **professional_conduct:** Reflect credit on the profession
  - **capital_markets:** Promote capital market integrity
  - **competence:** Maintain and improve professional competence
- **standard_i_professionalism:**
  - **ia_knowledge_of_law:** Comply with most strict of applicable law, code, or regulations; dissociate from violations
  - **ib_independence_objectivity:** No gifts or pressures compromising independent judgement
  - **ic_misrepresentation:** Do not misrepresent qualifications, services, or performance
  - **id_misconduct:** Do not engage in dishonesty, fraud, or deceit
- **standard_ii_capital_markets:**
  - **iia_material_nonpublic:** Do not trade on material nonpublic information (mosaic theory allowed)
  - **iib_market_manipulation:** Do not engage in information- or transaction-based manipulation
- **standard_iii_duties_to_clients:**
  - **iiia_loyalty_prudence_care:** Act for clients' benefit; vote proxies in client interest
  - **iiib_fair_dealing:** Deal fairly with all clients in recommendations and transactions
  - **iiic_suitability:** Know client objectives, constraints, risk tolerance
  - **iiid_performance_presentation:** Communicate performance fairly, accurately (GIPS preferred)
  - **iiie_confidentiality:** Protect client information; exceptions for legal requirements
- **standard_iv_duties_to_employers:**
  - **iva_loyalty:** Act in employer's interest; no misuse of firm assets; whistleblowing where warranted
  - **ivb_additional_compensation:** Disclose and obtain consent for outside compensation
  - **ivc_responsibilities_of_supervisors:** Prevent violations by subordinates; compliance systems
- **standard_v_investment_analysis:**
  - **va_diligence_reasonable_basis:** Research independently; have basis for recommendations
  - **vb_communication:** Disclose fact vs opinion; material changes promptly
  - **vc_record_retention:** Maintain records supporting analysis per regulatory and firm requirements
- **standard_vi_conflicts_of_interest:**
  - **via_disclosure_of_conflicts:** Disclose all conflicts in clear, prominent manner
  - **vib_priority_of_transactions:** Client transactions before employer and personal; IPO restrictions
  - **vic_referral_fees:** Disclose referral arrangements before or at time of engagement
- **standard_vii_cfa_responsibilities:**
  - **viia_conduct_as_participant:** No cheating or compromising CFA exam integrity
  - **viib_cfa_designation:** Do not misrepresent CFA designation; no partial designation
- **mosaic_theory:**
  - **definition:** Non-material nonpublic info + public info may form material conclusion; not a violation
  - **caution:** If single piece is material and nonpublic, mosaic doesn't shield
- **gips_performance:**
  - **definition:** Global Investment Performance Standards; voluntary but strongly recommended
  - **compliance:** Firm-wide; GIPS-compliant composites
  - **advantage:** Standardised, comparable performance across managers
- **validation:**
  - **member_required:** member_id present
  - **valid_standard:** standard_group in allowed set

## Outcomes

### Review_ethics (Priority: 1)

_Review ethics and professional standards compliance_

**Given:**
- `member_id` (input) exists
- `standard_group` (input) in `professionalism,capital_markets,clients,employers,investment_analysis,conflicts,cfa_responsibilities`

**Then:**
- **call_service** target: `ethics_reviewer`
- **emit_event** event: `ethics.reviewed`

### Invalid_standard (Priority: 10) — Error: `ETHICS_INVALID_STANDARD`

_Unsupported standard group_

**Given:**
- `standard_group` (input) not_in `professionalism,capital_markets,clients,employers,investment_analysis,conflicts,cfa_responsibilities`

**Then:**
- **emit_event** event: `ethics.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETHICS_INVALID_STANDARD` | 400 | standard_group must be one of the supported standard groups | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ethics.reviewed` |  | `member_id`, `standard_group`, `violation_found`, `remediation_required` |
| `ethics.rejected` |  | `member_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| economics-investment-markets-l2 | optional |  |

## AGI Readiness

### Goals

#### Reliable Cfa Ethics Standards L2

Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conflicts, CFA designation)

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| review_ethics | `autonomous` | - | - |
| invalid_standard | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cfa Ethics Standards L2 Blueprint",
  "description": "Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conf",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, professional-standards, cfa-standards, conflicts-of-interest, fiduciary-duty, cfa-level-2"
}
</script>
