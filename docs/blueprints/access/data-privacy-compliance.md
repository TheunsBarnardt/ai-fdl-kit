---
title: "Data Privacy Compliance Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent. 16 fields. 8 outcomes. 7 error codes. rules: consent, erasure, "
---

# Data Privacy Compliance Blueprint

> GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent

| | |
|---|---|
| **Feature** | `data-privacy-compliance` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | gdpr, ccpa, privacy, consent, erasure, data-portability, compliance, cookies, right-to-access |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/access/data-privacy-compliance.blueprint.yaml) |
| **JSON API** | [data-privacy-compliance.json]({{ site.baseurl }}/api/blueprints/access/data-privacy-compliance.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `consent_id` | text | Yes | Consent Record ID |  |
| `user_id` | text | Yes | User ID | Validations: required |
| `consent_type` | select | Yes | Consent Type | Validations: required |
| `purpose` | text | Yes | Purpose | Validations: required, maxLength |
| `legal_basis` | select | Yes | Legal Basis | Validations: required |
| `granted_at` | datetime | No | Consent Granted At |  |
| `revoked_at` | datetime | No | Consent Revoked At |  |
| `is_active` | boolean | Yes | Consent Active |  |
| `consent_version` | text | Yes | Consent Version | Validations: required |
| `ip_address_at_consent` | text | No | IP Address at Consent |  |
| `erasure_request_id` | text | No | Erasure Request ID |  |
| `erasure_status` | select | No | Erasure Status |  |
| `erasure_requested_at` | datetime | No | Erasure Requested At |  |
| `erasure_completed_at` | datetime | No | Erasure Completed At |  |
| `export_format` | select | No | Export Format |  |
| `cookie_category` | select | No | Cookie Category |  |

## Rules

- **consent:**
  - **granular_per_purpose:** true
  - **opt_in_required:** true
  - **withdrawal_as_easy_as_grant:** true
  - **record_proof:** true
  - **re_consent_on_policy_change:** true
  - **minimum_age:** 16
- **erasure:**
  - **deadline_days:** 30
  - **cascading_deletion:** true
  - **exceptions:** legal_obligation, public_interest
  - **verification_required:** true
  - **notification_to_third_parties:** true
- **data_export:**
  - **formats:** json, csv
  - **include_all_personal_data:** true
  - **exclude_derived_data:** true
  - **max_processing_hours:** 24
  - **delivery:** secure_download_link
  - **link_expiry_hours:** 48
- **cookies:**
  - **strictly_necessary_no_consent:** true
  - **banner_required:** true
  - **granular_categories:** true
  - **remember_preference:** true
  - **preference_duration_days:** 365
- **data_processing_agreements:**
  - **required_for_third_parties:** true
  - **annual_review:** true

## Outcomes

### Consent_granted (Priority: 1) | Transaction: atomic

**Given:**
- `user_id` (input) exists
- `consent_type` (input) exists
- `legal_basis` (input) exists

**Then:**
- **create_record** target: `consents` — Create consent record with timestamp and proof
- **set_field** target: `is_active` value: `true` — Mark consent as active
- **set_field** target: `granted_at` value: `now` — Record consent grant timestamp
- **emit_event** event: `privacy.consent_granted`

**Result:** consent recorded with proof of affirmative opt-in

### Consent_revoked (Priority: 2) | Transaction: atomic

**Given:**
- `consent_id` (db) exists
- `is_active` (db) eq `true`

**Then:**
- **set_field** target: `is_active` value: `false` — Mark consent as revoked
- **set_field** target: `revoked_at` value: `now` — Record revocation timestamp
- **emit_event** event: `privacy.consent_revoked`
- **call_service** target: `data_processing` — Cease data processing for this purpose immediately

**Result:** consent revoked and data processing stopped for this purpose

### Consent_not_found (Priority: 3) — Error: `CONSENT_NOT_FOUND`

**Given:**
- `consent_id` (db) not_exists

**Result:** show "Consent record not found"

### Erasure_requested (Priority: 4) | Transaction: atomic

**Given:**
- `user_id` (input) exists
- `identity_verified` (computed) eq `true`

**Then:**
- **create_record** target: `erasure_requests` — Create erasure request with 30-day deadline
- **set_field** target: `erasure_status` value: `requested` — Set initial status to requested
- **set_field** target: `erasure_requested_at` value: `now` — Record request timestamp
- **emit_event** event: `privacy.erasure_requested`
- **notify** — Confirm erasure request receipt to user

**Result:** erasure request created with 30-day compliance deadline

### Data_exported (Priority: 5) | Transaction: atomic

**Given:**
- `user_id` (input) exists
- `identity_verified` (computed) eq `true`
- `export_format` (input) exists

**Then:**
- **call_service** target: `data_export` — Gather all personal data across subsystems
- **emit_event** event: `privacy.data_exported`
- **notify** — Send secure download link (expires in 48 hours)

**Result:** personal data compiled and secure download link sent to user

### Data_deleted (Priority: 6) | Transaction: atomic

**Given:**
- `erasure_request_id` (db) exists
- `erasure_status` (db) eq `in_progress`
- `all_subsystems_cleared` (computed) eq `true`

**Then:**
- **set_field** target: `erasure_status` value: `completed` — Mark erasure as completed
- **set_field** target: `erasure_completed_at` value: `now` — Record completion timestamp
- **emit_event** event: `privacy.erasure_completed`
- **notify** — Notify user that their data has been deleted

**Result:** all personal data deleted across all systems and user notified

### Erasure_deadline_approaching (Priority: 7)

**Given:**
- `erasure_status` (db) in `requested,in_progress`
- `erasure_requested_at` (db) lt `now - 25d`

**Then:**
- **notify** — Alert DPO that erasure deadline is approaching
- **emit_event** event: `privacy.erasure_deadline_warning`

**Result:** escalation alert sent to data protection officer

### Erasure_exempt (Priority: 8) — Error: `ERASURE_EXEMPT`

**Given:**
- `legal_hold` (db) eq `true`

**Result:** show "Some data cannot be deleted due to legal obligations. Remaining data has been removed."

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONSENT_NOT_FOUND` | 404 | Consent record not found | No |
| `CONSENT_ALREADY_REVOKED` | 409 | This consent has already been revoked | No |
| `ERASURE_EXEMPT` | 403 | Some data is exempt from erasure due to legal obligations | No |
| `ERASURE_IN_PROGRESS` | 409 | An erasure request is already being processed for this account | No |
| `IDENTITY_VERIFICATION_REQUIRED` | 401 | Identity verification is required before this action | Yes |
| `EXPORT_TOO_LARGE` | 413 | Data export exceeds maximum size. Please contact support. | No |
| `EXPORT_PROCESSING` | 422 | Your data export is being prepared. You will receive a download link. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `privacy.consent_granted` | User granted consent for a specific processing purpose | `user_id`, `consent_type`, `purpose`, `legal_basis`, `consent_version`, `timestamp` |
| `privacy.consent_revoked` | User revoked consent for a specific processing purpose | `user_id`, `consent_type`, `purpose`, `timestamp` |
| `privacy.data_exported` | User personal data exported for portability | `user_id`, `export_format`, `record_count`, `timestamp` |
| `privacy.erasure_requested` | User requested deletion of their personal data | `user_id`, `erasure_request_id`, `deadline`, `timestamp` |
| `privacy.erasure_completed` | All personal data successfully deleted across all systems | `user_id`, `erasure_request_id`, `subsystems_cleared`, `timestamp` |
| `privacy.erasure_deadline_warning` | Erasure request approaching 30-day compliance deadline | `user_id`, `erasure_request_id`, `days_remaining`, `timestamp` |
| `privacy.cookie_preference_updated` | User updated their cookie consent preferences | `user_id`, `cookie_categories_accepted`, `cookie_categories_rejected`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| signup | required | Consent must be collected at registration |
| audit-logging | required | All consent changes and data access must be audited for compliance |
| team-organization | optional | Consent and erasure may need to be scoped per organization |
| role-based-access | recommended | DPO role needs elevated access to privacy management tools |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: tabbed_sections
max_width: 960px
tabs:
  - consent_management
  - data_export
  - erasure_requests
  - cookie_settings
actions:
  primary:
    label: Save Preferences
    type: submit
  secondary:
    label: Download My Data
    type: button
fields_order:
  - consent_type
  - purpose
  - legal_basis
accessibility:
  aria_live_region: true
  screen_reader_descriptions: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Data Privacy Compliance Blueprint",
  "description": "GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent. 16 fields. 8 outcomes. 7 error codes. rules: consent, erasure, ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gdpr, ccpa, privacy, consent, erasure, data-portability, compliance, cookies, right-to-access"
}
</script>
