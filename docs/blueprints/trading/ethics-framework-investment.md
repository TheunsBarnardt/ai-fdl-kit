---
title: "Ethics Framework Investment Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Explain the role of ethics in the investment profession, trust and client well-being, differences between ethical conduct and legal conduct, and challenges to e"
---

# Ethics Framework Investment Blueprint

> Explain the role of ethics in the investment profession, trust and client well-being, differences between ethical conduct and legal conduct, and challenges to ethical behaviour

| | |
|---|---|
| **Feature** | `ethics-framework-investment` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, investment-profession, trust, fiduciary, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/ethics-framework-investment.blueprint.yaml) |
| **JSON API** | [ethics-framework-investment.json]({{ site.baseurl }}/api/blueprints/trading/ethics-framework-investment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ethics_reviewer` | Ethics Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `review_id` | text | Yes | Ethics review identifier |  |
| `situation_type` | select | Yes | client_conflict \| market_integrity \| firm_conflict \| self_conduct |  |

## Rules

- **role_of_ethics:**
  - **trust:** Professions require public trust; investment industry fiduciary role
  - **beyond_compliance:** Legal compliance is minimum; ethics sets higher standard
- **ethics_vs_law:**
  - **law:** Minimum enforceable conduct
  - **ethics:** Higher voluntary standard based on profession values
  - **conflict_possible:** Legal act may be unethical; illegal act never ethical
- **ethical_challenges:**
  - **in_group_loyalty:** Firm or team pressure
  - **overconfidence:** Certainty about one's ethics prevents scrutiny
  - **situational_influences:** Stress, incentives, scarcity
- **professional_implications:**
  - **standard:** Act in clients' best interest; uphold integrity of markets
  - **consequences:** Career, firm, and industry trust damage
- **validation:**
  - **review_required:** review_id present
  - **valid_situation:** situation_type in allowed set

## Outcomes

### Assess_ethical_situation (Priority: 1)

_Assess ethical situation_

**Given:**
- `review_id` (input) exists
- `situation_type` (input) in `client_conflict,market_integrity,firm_conflict,self_conduct`

**Then:**
- **call_service** target: `ethics_reviewer`
- **emit_event** event: `ethics.assessed`

### Invalid_situation (Priority: 10) — Error: `ETHICS_INVALID_SITUATION`

_Unsupported situation type_

**Given:**
- `situation_type` (input) not_in `client_conflict,market_integrity,firm_conflict,self_conduct`

**Then:**
- **emit_event** event: `ethics.assessment_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETHICS_INVALID_SITUATION` | 400 | situation_type must be a supported category | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ethics.assessed` |  | `review_id`, `situation_type`, `concern_level`, `recommendation` |
| `ethics.assessment_rejected` |  | `review_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |
| ethical-decision-making-framework | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ethics Framework Investment Blueprint",
  "description": "Explain the role of ethics in the investment profession, trust and client well-being, differences between ethical conduct and legal conduct, and challenges to e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, investment-profession, trust, fiduciary, cfa-level-1"
}
</script>
