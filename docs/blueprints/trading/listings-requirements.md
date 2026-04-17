---
title: "Listings Requirements Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Manages listing and compliance requirements for securities, including approval criteria, disclosure obligations, and continuing obligations for issuers.. 7 fiel"
---

# Listings Requirements Blueprint

> Manages listing and compliance requirements for securities, including approval criteria, disclosure obligations, and continuing obligations for issuers.

| | |
|---|---|
| **Feature** | `listings-requirements` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | listings, regulatory, compliance, disclosure, securities, corporate-governance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/listings-requirements.blueprint.yaml) |
| **JSON API** | [listings-requirements.json]({{ site.baseurl }}/api/blueprints/trading/listings-requirements.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `applicant_issuer` | Applicant Issuer | external |  |
| `sponsor` | Sponsor/Designated Adviser | external |  |
| `exchange_authority` | Exchange Authority | system |  |
| `auditor` | Auditor/Reporting Accountant | external |  |
| `public_shareholders` | Public/Shareholders | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `issuer_name` | text | Yes | Issuer Name |  |
| `security_type` | select | Yes | Security Type |  |
| `listing_status` | select | Yes | Listing Status |  |
| `public_float_percentage` | number | No | Public Float Percentage |  |
| `market_value_zar` | number | No | Market Value (ZAR) |  |
| `auditor_approved` | boolean | No | Auditor Approved |  |
| `sponsor_appointed` | boolean | No | Sponsor Appointed |  |

## States

**State field:** `listing_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `[object Object]` | Yes |  |
| `[object Object]` |  |  |
| `[object Object]` |  |  |
| `[object Object]` |  |  |
| `[object Object]` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending_approval` | `approved` | exchange_authority | All listing criteria satisfied |
|  | `approved` | `listed` | exchange_authority | All conditions precedent satisfied |
|  | `listed` | `suspended` | exchange_authority | Non-compliance or disclosure breach detected |
|  | `suspended` | `listed` | exchange_authority | Compliance restored |
|  | `listed` | `delisted` | exchange_authority | Non-compliance unresolved or delisting request |

## Rules

- **listing_requirements:**
  - **minimum_public_float:** Minimum 30% public float or 1,000 public shareholders
  - **accounting_standards:** Financial statements must comply with IFRS
  - **auditor_accreditation:** Auditor must be registered with regulatory body
  - **continuous_reporting:** Ongoing disclosure of material price-sensitive information required
  - **solvency_test:** Solvency and liquidity test required for corporate actions
- **disclosure_obligations:**
  - **annual_reporting:** Annual financial statements within 4 months of year-end
  - **interim_reporting:** Interim results within 3 months of half-year end
  - **sens_announcements:** Price-sensitive information announced via SENS immediately
  - **closed_period_restrictions:** Directors restricted from trading during closed periods
  - **material_threshold:** Material information threshold generally 10%

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| listing_approval_timeline | 120 days |  |
| disclosure_responsiveness | 1 day |  |

## Outcomes

### Listing_approved (Priority: 1) — Error: `LISTING_APPROVED`

_Exchange approves listing application after criteria satisfied_

**Given:**
- Applicant issuer applies for listing
- Sponsor appointed and confirmed
- `public_float_percentage` (input) gte `30`
- Auditor appointed and accredited
- Full financial statements reviewed

**Then:**
- **transition_state** field: `listing_status` from: `pending_approval` to: `approved`
- **emit_event** event: `listing.approved`

**Result:** Application approved; issuer permitted to proceed

### Listing_admitted (Priority: 2) — Error: `LISTING_ADMITTED`

_Securities admitted to official list after all conditions precedent satisfied_

**Given:**
- Listing approved by exchange
- All approval conditions satisfied
- Share certificates or dematerialised records issued

**Then:**
- **transition_state** field: `listing_status` from: `approved` to: `listed`
- **emit_event** event: `listing.admitted`

**Result:** Securities admitted to official list; trading commenced

### Annual_reporting_due (Priority: 3) — Error: `ANNUAL_REPORTING_DUE`

_Issuer must file audited financial statements within 4 months of year-end_

**Given:**
- Issuer is in listed status
- Financial year end has passed

**Then:**
- **emit_event** event: `reporting.due`

**Result:** Reporting obligation created

### Material_disclosure_required (Priority: 4) — Error: `MATERIAL_DISCLOSURE_REQUIRED`

_Material price-sensitive information disclosed to market via SENS_

**Given:**
- Issuer identifies material price-sensitive information
- `information_type` (input) exists

**Then:**
- **emit_event** event: `disclosure.required`

**Result:** Information disclosed via SENS

### Regulatory_suspension (Priority: 5) — Error: `LISTING_SUSPENDED`

_Trading suspended when issuer non-compliance detected_

**Given:**
- Issuer in listed status
- `compliance_status` (db) eq `non_compliant`

**Then:**
- **transition_state** field: `listing_status` from: `listed` to: `suspended`
- **emit_event** event: `listing.suspended`

**Result:** Trading suspended; issuer required to remediate

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LISTING_APPROVED` | 409 | Listing application approved | No |
| `LISTING_ADMITTED` | 409 | Securities admitted to list | No |
| `ANNUAL_REPORTING_DUE` | 422 | Annual financial statements due | No |
| `MATERIAL_DISCLOSURE_REQUIRED` | 422 | Material information disclosure required | No |
| `LISTING_SUSPENDED` | 423 | Trading suspended for investigation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `listing.approved` |  | `issuer_name`, `approval_date` |
| `listing.admitted` |  | `issuer_name`, `security_type`, `list_date` |
| `listing.suspended` |  | `issuer_name`, `suspension_date`, `reason` |
| `reporting.due` |  | `issuer_name`, `due_date` |
| `disclosure.required` |  | `issuer_name`, `information_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| corporate-actions-reference-data | recommended |  |
| continuous-disclosure-policy | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Listings Requirements Blueprint",
  "description": "Manages listing and compliance requirements for securities, including approval criteria, disclosure obligations, and continuing obligations for issuers.. 7 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "listings, regulatory, compliance, disclosure, securities, corporate-governance"
}
</script>
