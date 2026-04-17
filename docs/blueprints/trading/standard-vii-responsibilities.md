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
