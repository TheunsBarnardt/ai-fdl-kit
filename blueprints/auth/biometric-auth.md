<!-- AUTO-GENERATED FROM biometric-auth.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Biometric Auth

> Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user

**Category:** Auth · **Version:** 1.0.0 · **Tags:** biometric · palm-vein · authentication · passwordless · enrollment

## What this does

Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(hidden, required)* — User ID
- **palm_label** *(select, required)* — Which Hand
- **palm_template** *(json, optional)* — Palm Vein Template
- **palm_feature** *(json, optional)* — Palm Vein Feature
- **enrollment_status** *(select, required)* — Enrollment Status
- **auth_method** *(select, optional)* — Authentication Method
- **enrolled_palm_count** *(number, optional)* — Number of Enrolled Palms
- **email** *(email, required)* — Email Address

## What must be true

- **enrollment → max_palms:** 2
- **enrollment → unique_per_hand:** Only one template per hand per user — re-enrolling the same hand replaces the old template
- **enrollment → must_be_authenticated:** User must be logged in (via password) to enroll a palm
- **enrollment → capture_count:** 4
- **authentication → alternative_to_password:** Palm vein scan can be used instead of password to log in
- **authentication → email_required:** User must provide their email to identify which templates to match against
- **authentication → match_any_palm:** If user has 2 enrolled palms, feature is matched against both — either can authenticate
- **authentication → template_auto_update:** On successful match, the updated template from the SDK replaces the old one to improve future accuracy
- **rate_limiting → max_attempts_per_email:** 5
- **rate_limiting → lockout_duration:** 15m
- **rate_limiting → max_attempts_per_ip:** 10
- **rate_limiting → ip_window:** 1m
- **fallback → scanner_unavailable:** If palm scanner is not connected or busy, user falls back to password login
- **security → template_encryption:** Palm templates must be encrypted at rest in the database
- **security → feature_not_persisted:** Extracted features are used only for matching and never stored
- **security → constant_time_match:** Template matching is performed by the SDK algorithm — timing is hardware-controlled
- **security → audit_logging:** All enrollment and authentication attempts must be logged for security audit

## Success & failure scenarios

**✅ Success paths**

- **Biometric Login Success** — when User provides their email; Palm vein feature extracted from scanner; Feature matches one of the user's enrolled templates, then Identity verified via palm vein — session created.
- **Enrollment Success** — when User is authenticated via password; User has fewer than 2 palms enrolled; User selected which hand to enroll; SDK registration completes successfully (4 images captured and fused), then Palm enrolled successfully — you can now use it to log in.
- **Enrollment Replaces Existing** — when User is authenticated via password; palm_label exists; A template already exists for this hand; SDK registration completes successfully, then Palm re-enrolled — old template replaced with new one.
- **Palm Removed** — when User is authenticated via password; User selects which palm to remove; A template exists for the selected hand, then Palm removed — if no palms remain, biometric login is disabled.

**❌ Failure paths**

- **Rate Limited** — when User has exceeded max biometric auth attempts, then Too many failed attempts — account locked for 15 minutes. *(error: `BIOMETRIC_RATE_LIMITED`)*
- **Scanner Unavailable** — when Palm vein scanner is not connected or device is busy, then Scanner not available — please use password login instead. *(error: `BIOMETRIC_SCANNER_UNAVAILABLE`)*
- **No Palms Enrolled** — when User has no enrolled palm templates, then No palms enrolled — user must log in with password and enroll from account settings. *(error: `BIOMETRIC_NOT_ENROLLED`)*
- **Biometric Login Failed** — when email exists; palm_feature exists; Feature does not match any of the user's enrolled templates, then Palm vein does not match — please try again or use password login. *(error: `BIOMETRIC_AUTH_FAILED`)*
- **Enrollment Failed** — when User is authenticated via password; SDK registration fails (timeout, poor image quality, hand positioning), then Enrollment failed — please reposition your hand and try again. *(error: `BIOMETRIC_ENROLLMENT_FAILED`)*
- **Max Palms Reached** — when User is authenticated; User already has 2 palms enrolled; User attempts to enroll another palm without removing one first, then Maximum of 2 palms already enrolled — remove one before adding another. *(error: `BIOMETRIC_MAX_PALMS`)*
- **User Not Found** — when email exists; No user account found for email, then Authentication failed. *(error: `BIOMETRIC_AUTH_FAILED`)*

## Errors it can return

- `BIOMETRIC_AUTH_FAILED` — Biometric authentication failed
- `BIOMETRIC_RATE_LIMITED` — Too many authentication attempts — please wait before trying again
- `BIOMETRIC_SCANNER_UNAVAILABLE` — Palm vein scanner is not available — please use password login
- `BIOMETRIC_NOT_ENROLLED` — No palm enrolled for this account — please enroll from account settings
- `BIOMETRIC_ENROLLMENT_FAILED` — Palm enrollment failed — please reposition your hand and try again
- `BIOMETRIC_MAX_PALMS` — Maximum of 2 palms already enrolled — remove one to add another

## Connects to

- **login** *(extends)* — Adds palm vein as an alternative authentication method to password
- **palm-vein** *(required)* — Requires the biometric scanner SDK integration for scanner operations
- **signup** *(recommended)* — Users may enroll palms during or after account creation
- **palm-pay** *(optional)* — Palm pay extends biometric auth to enable hands-free payment
- **terminal-enrollment** *(optional)* — At-terminal palm enrollment for payment terminal walk-up registration

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+1** since baseline (90 → 91)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/biometric-auth/) · **Spec source:** [`biometric-auth.blueprint.yaml`](./biometric-auth.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
