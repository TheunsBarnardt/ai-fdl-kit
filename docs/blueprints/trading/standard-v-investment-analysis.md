---
title: "Standard V Investment Analysis Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard V (Investment Analysis, Recommendations, and Actions) — Diligence & Reasonable Basis, Communication with Clients, and Record Retention — to resea"
---

# Standard V Investment Analysis Blueprint

> Apply Standard V (Investment Analysis, Recommendations, and Actions) — Diligence & Reasonable Basis, Communication with Clients, and Record Retention — to research and recommendations

| | |
|---|---|
| **Feature** | `standard-v-investment-analysis` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-v, diligence, communication, record-retention, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-v-investment-analysis.blueprint.yaml) |
| **JSON API** | [standard-v-investment-analysis.json]({{ site.baseurl }}/api/blueprints/trading/standard-v-investment-analysis.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_v_reviewer` | Standard V Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | v_a \| v_b \| v_c |  |

## Rules

- **v_a_diligence_reasonable_basis:**
  - **rule:** Exercise diligence, independence, thoroughness; have reasonable and adequate basis for recommendations
  - **third_party_research:** Assess quality and independence before relying
  - **group_research:** OK to rely on group opinion even when individual disagrees, provided reasonable basis
- **v_b_communication_with_clients:**
  - **distinguish:** Separate fact from opinion in reports
  - **risks_and_limitations:** Disclose significant limitations, basic characteristics, investment process
  - **material_changes:** Prompt communication of process changes
- **v_c_record_retention:**
  - **rule:** Maintain records supporting analysis, recommendations, investment action, client communications
  - **typical_duration:** 7 years minimum recommended
  - **firm_ownership:** Records belong to firm; take copies only with permission
- **recommended_procedures:**
  - **research_policy:** Written policy on reasonable basis standards
  - **review:** Peer review of recommendations
  - **archival:** Systematic records storage and retrieval
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [v_a, v_b, v_c]

## Outcomes

### Review_standard_v (Priority: 1)

_Review conduct under Standard V_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `v_a,v_b,v_c`

**Then:**
- **call_service** target: `standard_v_reviewer`
- **emit_event** event: `standard_v.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_V_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `v_a,v_b,v_c`

**Then:**
- **emit_event** event: `standard_v.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_V_INVALID_SUBSTANDARD` | 400 | substandard must be v_a, v_b, or v_c | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_v.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_v.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard V Investment Analysis Blueprint",
  "description": "Apply Standard V (Investment Analysis, Recommendations, and Actions) — Diligence & Reasonable Basis, Communication with Clients, and Record Retention — to resea",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-v, diligence, communication, record-retention, cfa-level-1"
}
</script>
