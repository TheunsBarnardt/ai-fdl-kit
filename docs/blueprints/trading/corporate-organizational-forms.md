---
title: "Corporate Organizational Forms Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify business organizational forms — sole proprietorship, partnership, limited company — and assess liability, taxation, and access to external financing im"
---

# Corporate Organizational Forms Blueprint

> Classify business organizational forms — sole proprietorship, partnership, limited company — and assess liability, taxation, and access to external financing implications

| | |
|---|---|
| **Feature** | `corporate-organizational-forms` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-issuers, organizational-form, legal-entity, sole-proprietorship, partnership, limited-company, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/corporate-organizational-forms.blueprint.yaml) |
| **JSON API** | [corporate-organizational-forms.json]({{ site.baseurl }}/api/blueprints/trading/corporate-organizational-forms.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `corp_analyst` | Corporate Structure Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entity_id` | text | Yes | Entity identifier |  |
| `organizational_form` | select | Yes | sole_trader \| general_partnership \| limited_partnership \| limited_company |  |

## Rules

- **forms:**
  - **sole_trader:** Single owner, unlimited liability, pass-through taxation
  - **general_partnership:** Multiple owners jointly and severally liable, pass-through tax
  - **limited_partnership:** General partners unlimited liability, limited partners liability capped
  - **limited_company:** Separate legal identity, limited liability, corporate taxation
- **key_features:**
  - **legal_identity:** Limited companies are separate legal persons
  - **owner_manager_separation:** Pronounced in publicly listed corporations
  - **shareholder_liability:** Limited to invested capital in limited companies
  - **external_financing:** Corporations can issue equity and debt securities publicly
  - **taxation:** Double taxation for corporations; pass-through for partnerships and sole traders
- **public_vs_private:**
  - **public:** Shares listed on exchange, subject to disclosure and reporting
  - **private:** Shares restricted, lower disclosure, less liquidity
- **transitions:**
  - **ipo:** Private to public — listing process, underwriters, prospectus
  - **going_private:** Public to private — LBO, management buyout, acquisition
- **validation:**
  - **entity_required:** entity_id present
  - **valid_form:** organizational_form in allowed set

## Outcomes

### Classify_entity (Priority: 1)

_Identify organizational form and implications_

**Given:**
- `entity_id` (input) exists
- `organizational_form` (input) in `sole_trader,general_partnership,limited_partnership,limited_company`

**Then:**
- **call_service** target: `corp_analyst`
- **emit_event** event: `corp.form_classified`

### Invalid_form (Priority: 10) — Error: `CORP_INVALID_FORM`

_Unsupported organizational form_

**Given:**
- `organizational_form` (input) not_in `sole_trader,general_partnership,limited_partnership,limited_company`

**Then:**
- **emit_event** event: `corp.form_rejected`

### Missing_entity (Priority: 11) — Error: `CORP_ENTITY_MISSING`

_Entity id missing_

**Given:**
- `entity_id` (input) not_exists

**Then:**
- **emit_event** event: `corp.form_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CORP_INVALID_FORM` | 400 | organizational_form must be sole_trader, general_partnership, limited_partnership, or limited_company | No |
| `CORP_ENTITY_MISSING` | 400 | entity_id is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `corp.form_classified` |  | `classification_id`, `entity_id`, `organizational_form`, `liability_type`, `tax_regime` |
| `corp.form_rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| corporate-stakeholders | recommended |  |
| corporate-governance-mechanisms | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Corporate Organizational Forms Blueprint",
  "description": "Classify business organizational forms — sole proprietorship, partnership, limited company — and assess liability, taxation, and access to external financing im",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-issuers, organizational-form, legal-entity, sole-proprietorship, partnership, limited-company, cfa-level-1"
}
</script>
