<!-- AUTO-GENERATED FROM data-privacy-compliance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Data Privacy Compliance

> GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent

**Category:** Access · **Version:** 1.0.0 · **Tags:** gdpr · ccpa · privacy · consent · erasure · data-portability · compliance · cookies · right-to-access

## What this does

GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **consent_id** *(text, required)* — Consent Record ID
- **user_id** *(text, required)* — User ID
- **consent_type** *(select, required)* — Consent Type
- **purpose** *(text, required)* — Purpose
- **legal_basis** *(select, required)* — Legal Basis
- **granted_at** *(datetime, optional)* — Consent Granted At
- **revoked_at** *(datetime, optional)* — Consent Revoked At
- **is_active** *(boolean, required)* — Consent Active
- **consent_version** *(text, required)* — Consent Version
- **ip_address_at_consent** *(text, optional)* — IP Address at Consent
- **erasure_request_id** *(text, optional)* — Erasure Request ID
- **erasure_status** *(select, optional)* — Erasure Status
- **erasure_requested_at** *(datetime, optional)* — Erasure Requested At
- **erasure_completed_at** *(datetime, optional)* — Erasure Completed At
- **export_format** *(select, optional)* — Export Format
- **cookie_category** *(select, optional)* — Cookie Category

## What must be true

- **consent → granular_per_purpose:** true
- **consent → opt_in_required:** true
- **consent → withdrawal_as_easy_as_grant:** true
- **consent → record_proof:** true
- **consent → re_consent_on_policy_change:** true
- **consent → minimum_age:** 16
- **erasure → deadline_days:** 30
- **erasure → cascading_deletion:** true
- **erasure → exceptions:** legal_obligation, public_interest
- **erasure → verification_required:** true
- **erasure → notification_to_third_parties:** true
- **data_export → formats:** json, csv
- **data_export → include_all_personal_data:** true
- **data_export → exclude_derived_data:** true
- **data_export → max_processing_hours:** 24
- **data_export → delivery:** secure_download_link
- **data_export → link_expiry_hours:** 48
- **cookies → strictly_necessary_no_consent:** true
- **cookies → banner_required:** true
- **cookies → granular_categories:** true
- **cookies → remember_preference:** true
- **cookies → preference_duration_days:** 365
- **data_processing_agreements → required_for_third_parties:** true
- **data_processing_agreements → annual_review:** true

## Success & failure scenarios

**✅ Success paths**

- **Consent Granted** — when User identity confirmed; Specific consent type selected; Legal basis for processing specified, then consent recorded with proof of affirmative opt-in.
- **Erasure Requested** — when User identity confirmed; User identity verified through re-authentication, then erasure request created with 30-day compliance deadline.
- **Data Exported** — when User identity confirmed; User identity verified; Export format selected (JSON or CSV), then personal data compiled and secure download link sent to user.
- **Data Deleted** — when Valid erasure request exists; Erasure is currently being processed; Data deleted from all subsystems, caches, and third parties, then all personal data deleted across all systems and user notified.
- **Erasure Deadline Approaching** — when Erasure not yet completed; Request is older than 25 days (5 days until 30-day deadline), then escalation alert sent to data protection officer.

**❌ Failure paths**

- **Consent Revoked** — when Consent record exists; Consent is currently active, then consent revoked and data processing stopped for this purpose. *(error: `CONSENT_ALREADY_REVOKED`)*
- **Consent Not Found** — when No consent record found for the given ID, then show "Consent record not found". *(error: `CONSENT_NOT_FOUND`)*
- **Erasure Exempt** — when Data is under legal hold or required by law, then show "Some data cannot be deleted due to legal obligations. Remaining data has been removed.". *(error: `ERASURE_EXEMPT`)*

## Errors it can return

- `CONSENT_NOT_FOUND` — Consent record not found
- `CONSENT_ALREADY_REVOKED` — This consent has already been revoked
- `ERASURE_EXEMPT` — Some data is exempt from erasure due to legal obligations
- `ERASURE_IN_PROGRESS` — An erasure request is already being processed for this account
- `IDENTITY_VERIFICATION_REQUIRED` — Identity verification is required before this action
- `EXPORT_TOO_LARGE` — Data export exceeds maximum size. Please contact support.
- `EXPORT_PROCESSING` — Your data export is being prepared. You will receive a download link.

## Connects to

- **signup** *(required)* — Consent must be collected at registration
- **audit-logging** *(required)* — All consent changes and data access must be audited for compliance
- **team-organization** *(optional)* — Consent and erasure may need to be scoped per organization
- **role-based-access** *(recommended)* — DPO role needs elevated access to privacy management tools

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/data-privacy-compliance/) · **Spec source:** [`data-privacy-compliance.blueprint.yaml`](./data-privacy-compliance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
