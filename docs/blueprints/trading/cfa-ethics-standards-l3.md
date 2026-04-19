---
title: "Cfa Ethics Standards L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "CFA Code of Ethics and Standards of Professional Conduct I-VII — professionalism, integrity, duties to clients, employers, investment analysis, conflicts of int"
---

# Cfa Ethics Standards L3 Blueprint

> CFA Code of Ethics and Standards of Professional Conduct I-VII — professionalism, integrity, duties to clients, employers, investment analysis, conflicts of interest, and responsibilities

| | |
|---|---|
| **Feature** | `cfa-ethics-standards-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, professional-conduct, cfa-standards, fiduciary-duty, conflicts-of-interest, material-nonpublic-information, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cfa-ethics-standards-l3.blueprint.yaml) |
| **JSON API** | [cfa-ethics-standards-l3.json]({{ site.baseurl }}/api/blueprints/trading/cfa-ethics-standards-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cfa_member` | CFA Member or Candidate | human |  |
| `compliance_officer` | Compliance Officer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Ethics case identifier |  |
| `standard_violated` | select | Yes | I_professionalism \| II_integrity \| III_duties_clients \| IV_duties_employers \| V_investment_analysis \| VI_conflicts \| VII_responsibilities |  |

## Rules

- **standard_i_professionalism:**
  - **ia_knowledge_law:** Know and follow the more strict of applicable law or CFA Standards; dissociate from violations
  - **ib_independence_objectivity:** Maintain objectivity; refuse gifts that compromise independence; disclose soft-dollar arrangements
  - **ic_misrepresentation:** Never misrepresent qualifications, performance, or investment analysis; no plagiarism
  - **id_misconduct:** No dishonesty, fraud, deceit; no actions reflecting adversely on the profession
- **standard_ii_integrity:**
  - **iia_mnpi:** Do not act on or cause others to act on material nonpublic information; mosaic theory permitted
  - **iib_market_manipulation:** Do not artificially influence prices or volumes; no pump-and-dump; no false information
  - **materiality:** Material = information a reasonable investor would consider significant in investment decision
  - **mosaic_theory:** Combining public information + non-material non-public information is permitted
- **standard_iii_duties_clients:**
  - **iiia_loyalty:** Act in clients' best interests; place client interests above own and employer
  - **iiib_fair_dealing:** Fair and equitable treatment across all clients; no front-running; simultaneous dissemination
  - **iiic_suitability:** Know the client (IPS); recommend suitable investments; portfolio context matters
  - **iiid_performance_presentation:** Fair and complete performance record; no cherry-picking; no misleading composite
  - **iiie_preservation_confidentiality:** Keep client information confidential; exceptions: legal, employer compliance, consent
- **standard_iv_duties_employers:**
  - **iva_loyalty:** Act in employer's best interests; don't take client list or proprietary info when leaving
  - **ivb_additional_compensation:** Disclose any outside compensation that could create conflict with employer
  - **ivc_responsibilities_supervisors:** Supervisors must prevent violations; establish and enforce compliance systems
- **standard_v_investment_analysis:**
  - **va_diligence:** Reasonable basis for recommendations; thorough research; no recommendation without basis
  - **vb_communication:** Distinguish fact from opinion; disclose limitations; communicate material changes
  - **vc_record_retention:** Maintain records supporting investment analysis; at least 7 years
- **standard_vi_conflicts:**
  - **via_disclosure:** Disclose all potential conflicts; fully disclose compensation, ownership, board positions
  - **vib_priority_transactions:** Clients before personal; employees before firm; no front-running
  - **vic_referral_fees:** Disclose any referral or solicitation fees; client must be able to assess independence
- **standard_vii_responsibilities:**
  - **viia_conduct_exam:** Confidentiality of exam; don't misrepresent exam content or CFA designation
  - **viib_cfa_designation:** Use CFA designation properly; don't claim superior performance from designation
- **recommended_procedures:**
  - **know_law:** Compliance officer; legal counsel; distribution area laws; dissociation procedures
  - **mnpi:** Firewall between departments; restricted list; personal trading policy; information barriers
  - **fair_dealing:** Pro-rata distribution of investment recommendations; simultaneous dissemination
  - **suitability:** Regular IPS review; reconfirm investment objectives and constraints
  - **performance:** GIPS compliance recommended; include terminated accounts in composites
- **validation:**
  - **case_required:** case_id present
  - **valid_standard:** standard_violated in [I_professionalism, II_integrity, III_duties_clients, IV_duties_employers, V_investment_analysis, VI_conflicts, VII_responsibilities]

## Outcomes

### Evaluate_ethics_case (Priority: 1)

_Evaluate professional conduct against CFA Standards_

**Given:**
- `case_id` (input) exists
- `standard_violated` (input) in `I_professionalism,II_integrity,III_duties_clients,IV_duties_employers,V_investment_analysis,VI_conflicts,VII_responsibilities`

**Then:**
- **call_service** target: `compliance_officer`
- **emit_event** event: `ethics.case.evaluated`

### Invalid_standard (Priority: 10) — Error: `ETHICS_INVALID_STANDARD`

_Unrecognized standard reference_

**Given:**
- `standard_violated` (input) not_in `I_professionalism,II_integrity,III_duties_clients,IV_duties_employers,V_investment_analysis,VI_conflicts,VII_responsibilities`

**Then:**
- **emit_event** event: `ethics.case.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETHICS_INVALID_STANDARD` | 400 | standard_violated must reference a valid CFA Standard (I through VII) | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ethics.case.evaluated` |  | `case_id`, `standard_violated`, `violation_found`, `recommended_action` |
| `ethics.case.rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-ethics-application-l3 | recommended |  |
| gips-standards-l3 | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cfa Ethics Standards L3 Blueprint",
  "description": "CFA Code of Ethics and Standards of Professional Conduct I-VII — professionalism, integrity, duties to clients, employers, investment analysis, conflicts of int",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, professional-conduct, cfa-standards, fiduciary-duty, conflicts-of-interest, material-nonpublic-information, cfa-level-3"
}
</script>
