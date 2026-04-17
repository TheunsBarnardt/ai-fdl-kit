---
title: "Standard Iv Duties To Employers Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard IV (Duties to Employers) — Loyalty, Additional Compensation Arrangements, and Responsibilities of Supervisors — to employment and managerial situ"
---

# Standard Iv Duties To Employers Blueprint

> Apply Standard IV (Duties to Employers) — Loyalty, Additional Compensation Arrangements, and Responsibilities of Supervisors — to employment and managerial situations

| | |
|---|---|
| **Feature** | `standard-iv-duties-to-employers` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-iv, duties-to-employer, supervisor-responsibility, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-iv-duties-to-employers.blueprint.yaml) |
| **JSON API** | [standard-iv-duties-to-employers.json]({{ site.baseurl }}/api/blueprints/trading/standard-iv-duties-to-employers.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_iv_reviewer` | Standard IV Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | iv_a \| iv_b \| iv_c |  |

## Rules

- **iv_a_loyalty:**
  - **rule:** Act for benefit of employer; do not deprive employer of advantage of skills and abilities; no confidential info disclosure
  - **whistleblowing_exception:** May disclose to authorities when employer violations harm clients or market
  - **leaving_employer:** No solicitation of clients until departure; no taking of files or client lists
- **iv_b_additional_compensation:**
  - **rule:** Disclose in writing all additional compensation arrangements that may create conflict
  - **consent_required:** Obtain written consent from employer
- **iv_c_supervisor_responsibilities:**
  - **rule:** Make reasonable efforts to detect and prevent violations by those under supervision
  - **inadequate_system:** Must decline supervisory role if compliance system inadequate
  - **delegation:** Supervisor remains responsible even when delegating
- **recommended_procedures:**
  - **compliance_program:** Written policies, training, monitoring, enforcement
  - **investigation:** Prompt and thorough when violation suspected
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [iv_a, iv_b, iv_c]

## Outcomes

### Review_standard_iv (Priority: 1)

_Review conduct under Standard IV_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `iv_a,iv_b,iv_c`

**Then:**
- **call_service** target: `standard_iv_reviewer`
- **emit_event** event: `standard_iv.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_IV_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `iv_a,iv_b,iv_c`

**Then:**
- **emit_event** event: `standard_iv.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_IV_INVALID_SUBSTANDARD` | 400 | substandard must be iv_a, iv_b, or iv_c | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_iv.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_iv.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Iv Duties To Employers Blueprint",
  "description": "Apply Standard IV (Duties to Employers) — Loyalty, Additional Compensation Arrangements, and Responsibilities of Supervisors — to employment and managerial situ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-iv, duties-to-employer, supervisor-responsibility, cfa-level-1"
}
</script>
