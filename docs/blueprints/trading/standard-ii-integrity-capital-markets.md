---
title: "Standard Ii Integrity Capital Markets Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply Standard II (Integrity of Capital Markets) — Material Nonpublic Information and Market Manipulation — to investment research, trading, and execution pract"
---

# Standard Ii Integrity Capital Markets Blueprint

> Apply Standard II (Integrity of Capital Markets) — Material Nonpublic Information and Market Manipulation — to investment research, trading, and execution practices

| | |
|---|---|
| **Feature** | `standard-ii-integrity-capital-markets` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | ethics, standard-ii, mnpi, market-manipulation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/standard-ii-integrity-capital-markets.blueprint.yaml) |
| **JSON API** | [standard-ii-integrity-capital-markets.json]({{ site.baseurl }}/api/blueprints/trading/standard-ii-integrity-capital-markets.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `standard_ii_reviewer` | Standard II Reviewer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `case_id` | text | Yes | Case identifier |  |
| `substandard` | select | Yes | ii_a \| ii_b |  |

## Rules

- **ii_a_mnpi:**
  - **rule:** Do not act or cause others to act on material nonpublic information
  - **material_test:** Reasonable investor would consider it important
  - **nonpublic_test:** Not widely disseminated or selectively disclosed
  - **mosaic_theory:** Analysis combining public + nonmaterial nonpublic is allowed
  - **firewall_procedures:** Physical and procedural separation between departments
- **ii_b_market_manipulation:**
  - **information_based:** Spreading false rumours, misleading statements
  - **transaction_based:** Wash trades, cornering, pump and dump
  - **intent:** Purpose is to mislead market participants
- **recommended_procedures:**
  - **restricted_list:** Prevent trading in securities with MNPI
  - **watch_list:** Monitor but not restrict
  - **policies_training:** Documented procedures and periodic training
- **investigative_implications:**
  - **disclosure:** Encourage issuer to disclose the MNPI
  - **abstain:** If not disclosed, abstain from trading and from recommending
- **validation:**
  - **case_required:** case_id present
  - **valid_substandard:** substandard in [ii_a, ii_b]

## Outcomes

### Review_standard_ii (Priority: 1)

_Review conduct under Standard II_

**Given:**
- `case_id` (input) exists
- `substandard` (input) in `ii_a,ii_b`

**Then:**
- **call_service** target: `standard_ii_reviewer`
- **emit_event** event: `standard_ii.reviewed`

### Invalid_substandard (Priority: 10) — Error: `STD_II_INVALID_SUBSTANDARD`

_Unsupported substandard_

**Given:**
- `substandard` (input) not_in `ii_a,ii_b`

**Then:**
- **emit_event** event: `standard_ii.review_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STD_II_INVALID_SUBSTANDARD` | 400 | substandard must be ii_a or ii_b | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `standard_ii.reviewed` |  | `case_id`, `substandard`, `compliant`, `recommended_action` |
| `standard_ii.review_rejected` |  | `case_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cfa-code-of-ethics | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Standard Ii Integrity Capital Markets Blueprint",
  "description": "Apply Standard II (Integrity of Capital Markets) — Material Nonpublic Information and Market Manipulation — to investment research, trading, and execution pract",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ethics, standard-ii, mnpi, market-manipulation, cfa-level-1"
}
</script>
