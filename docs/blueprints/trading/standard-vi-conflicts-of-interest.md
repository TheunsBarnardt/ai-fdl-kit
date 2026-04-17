---
title: "Standard Vi Conflicts Of Interest Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard VI (Conflicts of Interest) — Disclosure of Conflicts, Priority of Transactions, and Referral Fees — to manage real and potential conflicts betwee"
---

# Standard Vi Conflicts Of Interest Blueprint

> Apply Standard VI (Conflicts of Interest) — Disclosure of Conflicts, Priority of Transactions, and Referral Fees — to manage real and potential conflicts between clients, employer, and self

| | |
|---|---|
| **Feature** | `standard-vi-conflicts-of-interest` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-vi, conflicts-of-interest, priority-of-transactions, referral-fees, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-vi-conflicts-of-interest.blueprint.yaml) |
| **JSON API** | [standard-vi-conflicts-of-interest.json]({{ site.baseurl }}/api/blueprints/trading/standard-vi-conflicts-of-interest.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_vi_reviewer` | Standard VI Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | vi_a \| vi_b \| vi_c |  |

## Rules

- **vi_a_disclosure_of_conflicts:**
  - **rule:** Full and fair disclosure of all matters that reasonably could impair independence or interfere with duties to clients/employer
  - **plain_language:** Disclosure must be prominent and understandable
- **vi_b_priority_of_transactions:**
  - **rule:** Investment transactions for clients and employer take priority over personal transactions
  - **allowed_personal:** After client interests served; avoid front-running
  - **ipo_restrictions:** Members/candidates typically restricted from new issues
- **vi_c_referral_fees:**
  - **rule:** Disclose to employer, clients, prospective clients all consideration from referrals
  - **form:** Written disclosure before engagement
- **recommended_procedures:**
  - **compliance_program:** Blackout periods, pre-clearance for personal trades
  - **disclosure_templates:** Standardised written disclosures with confirmations
- **common_violations:**
  - **undisclosed_ownership:** Analyst holds stock being recommended
  - **family_accounts:** Personal trade via family account to avoid restrictions
  - **soft_referral:** Unrecorded kickback for client introduction
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [vi_a, vi_b, vi_c]

## Outcomes

### Review_standard_vi (Priority: 1)

_Review conduct under Standard VI_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `vi_a,vi_b,vi_c`

**Then:**
- **call_service** target: `standard_vi_reviewer`
- **emit_event** event: `standard_vi.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_VI_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `vi_a,vi_b,vi_c`

**Then:**
- **emit_event** event: `standard_vi.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_VI_INVALID_SUBSTANDARD` | 400 | substandard must be vi_a, vi_b, or vi_c | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_vi.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_vi.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Vi Conflicts Of Interest Blueprint",
  "description": "Apply Standard VI (Conflicts of Interest) — Disclosure of Conflicts, Priority of Transactions, and Referral Fees — to manage real and potential conflicts betwee",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-vi, conflicts-of-interest, priority-of-transactions, referral-fees, cfa-level-1"
}
</script>
