<!-- AUTO-GENERATED FROM multi-factor-authentication.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Factor Authentication

> TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify possession of the registered...

**Category:** Auth · **Version:** 2.0.0 · **Tags:** mfa · totp · two-factor · otp · authenticator · security

## What this does

TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify possession of the registered...

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **secret** *(token, required)* — Base32-encoded shared TOTP secret (160-bit, cryptographically random)
- **qr_code** *(file, optional)* — PNG QR code encoding the otpauth:// URI for authenticator app enrollment
- **totp_code** *(text, required)* — 6-digit time-based one-time password submitted by the user
- **mfa_active** *(boolean, required)* — Whether MFA is currently enabled for the user
- **used_timestamps** *(json, optional)* — Array of recently used TOTP time windows to prevent code reuse

## What must be true

- **rule_01:** The TOTP algorithm follows RFC 6238 with a 30-second time step and a validation window of ±1 code (approximately 90 seconds tolerance) to accommodate clock skew.
- **rule_02:** Each validated code is recorded to prevent replay attacks within the same time window.
- **rule_03:** Only users authenticated via local email or directory (LDAP) credentials may activate MFA; SSO (SAML, OAuth) users cannot, as MFA is delegated to their identity provider.
- **rule_04:** When MFA enforcement is enabled globally, users who have not enrolled are blocked from all operations except MFA enrollment endpoints.
- **rule_05:** Bots and service accounts are exempt from MFA enforcement.
- **rule_06:** A 160-bit secret is generated using a cryptographically secure random source and never transmitted after initial enrollment.
- **rule_07:** Deactivating MFA clears both the secret and the used-timestamp list atomically.

## Success & failure scenarios

**✅ Success paths**

- **Mfa Enrollment Initiated** — when MFA is enabled in system configuration; user is authenticated via email or directory credentials; user does not already have active MFA, then QR code and manual entry key returned to the user for authenticator app enrollment.
- **Mfa Activation Success** — when user is in enrollment_pending state; submitted TOTP code is valid and has not been used in the current window, then MFA active; future logins require a valid TOTP code.
- **Mfa Verified** — when user has active MFA; primary credential validated; submitted TOTP code is valid for current or adjacent time window; code has not been used before in this window, then User fully authenticated; session established.

**❌ Failure paths**

- **Mfa Not Available For Sso User** — when user authenticated via SAML or OAuth attempts to activate MFA, then Activation blocked; MFA must be configured at the identity provider. *(error: `MFA_NOT_SUPPORTED_FOR_SSO`)*
- **Mfa Code Replayed** — when TOTP code is mathematically valid; code's time window is already present in used_timestamps, then Login rejected to prevent replay attack. *(error: `MFA_CODE_ALREADY_USED`)*
- **Mfa Code Invalid** — when user has active MFA; submitted TOTP code is incorrect or outside the valid time window, then Login rejected; user prompted to retry with a fresh code. *(error: `INVALID_OTP`)*

## Errors it can return

- `INVALID_OTP` — The verification code you entered is incorrect. Please try again.
- `MFA_CODE_ALREADY_USED` — This code has already been used. Please wait for a new code.
- `MFA_NOT_ENABLED` — Multi-factor authentication is not enabled on this server.
- `MFA_NOT_SUPPORTED_FOR_SSO` — Multi-factor authentication is managed by your identity provider.
- `MFA_ALREADY_ACTIVE` — Multi-factor authentication is already enabled for this account.

## Events

**`mfa.verified`** — MFA verification successful
  Payload: `user_id`, `session_id`

**`auth.mfa_enrollment_started`** — User initiated MFA enrollment; secret generated
  Payload: `user_id`, `timestamp`

**`auth.mfa_activated`** — MFA successfully enrolled after first code verification
  Payload: `user_id`, `timestamp`

**`auth.mfa_failed`** — Invalid or replayed TOTP code submitted
  Payload: `user_id`, `reason`, `attempt_count`, `timestamp`

**`auth.mfa_deactivated`** — MFA removed from user account
  Payload: `user_id`, `actor_id`, `timestamp`

## Connects to

- **session-management** *(required)* — Sessions are only created after both primary credential and MFA are verified
- **ldap-authentication-sync** *(recommended)* — LDAP users are the primary population for MFA enforcement alongside email users
- **saml-sso** *(optional)* — SAML users are excluded from MFA; the feature relationship documents this boundary

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+18** since baseline (61 → 79)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/multi-factor-authentication/) · **Spec source:** [`multi-factor-authentication.blueprint.yaml`](./multi-factor-authentication.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
