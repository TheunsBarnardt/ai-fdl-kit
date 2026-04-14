<!-- AUTO-GENERATED FROM multi-factor-auth.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Factor Auth

> Second-factor authentication via TOTP, SMS OTP, or backup codes

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · mfa · totp · otp · security · 2fa · backup-codes

## What this does

Second-factor authentication via TOTP, SMS OTP, or backup codes

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **mfa_method** *(select, required)* — MFA Method
- **totp_secret** *(hidden, optional)* — TOTP Secret
- **totp_code** *(text, optional)* — Authenticator Code
- **sms_code** *(text, optional)* — SMS Code
- **phone_number** *(phone, optional)* — Phone Number
- **backup_code** *(text, optional)* — Backup Code
- **recovery_email** *(email, optional)* — Recovery Email

## What must be true

- **security → totp → algorithm:** SHA1
- **security → totp → digits:** 6
- **security → totp → period_seconds:** 30
- **security → totp → window_tolerance:** 1
- **security → sms → code_length:** 6
- **security → sms → expiry_seconds:** 300
- **security → sms → max_resend_attempts:** 3
- **security → sms → resend_cooldown_seconds:** 60
- **security → backup_codes → count:** 10
- **security → backup_codes → format:** xxxx-xxxx
- **security → backup_codes → single_use:** true
- **security → backup_codes → hash_storage:** true
- **security → max_verification_attempts:** 3
- **security → lockout_duration_minutes:** 15
- **security → rate_limit → window_seconds:** 60
- **security → rate_limit → max_requests:** 5
- **security → rate_limit → scope:** per_user
- **security → secret_storage → encryption:** aes_256_gcm
- **setup → require_password_confirmation:** true
- **setup → qr_code_format:** otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30
- **setup → require_verification_before_enable:** true

## Success & failure scenarios

**✅ Success paths**

- **Setup Totp Success** — when mfa_method eq "totp"; MFA is not yet enabled for this user; User re-entered password to confirm identity, then show QR code and backup codes — user must verify one TOTP code to activate.
- **Setup Sms Success** — when mfa_method eq "sms"; mfa_enabled eq false; password_confirmed eq true; Valid E.164 phone number provided, then send SMS code — user must verify to activate.
- **Verify Totp Success** — when mfa_method eq "totp"; Code matches TOTP for current or adjacent time window, then MFA verification successful — proceed to application.
- **Verify Sms Success** — when mfa_method eq "sms"; Code matches the sent SMS code; SMS code has not expired, then MFA verification successful — proceed to application.
- **Disable Mfa** — when mfa_enabled eq true; User re-entered password to confirm identity, then MFA disabled — user returns to single-factor authentication.

**❌ Failure paths**

- **Rate Limited** — when More than 5 MFA attempts in 60 seconds, then show "Too many verification attempts. Please wait a moment.". *(error: `MFA_RATE_LIMITED`)*
- **Account Locked** — when 3 consecutive failed MFA attempts; Lockout period has not expired, then show "MFA verification locked. Please try again later.". *(error: `MFA_ACCOUNT_LOCKED`)*
- **Verify Backup Code Success** — when backup_code exists; Backup code matches a stored hash, then MFA verification successful via backup code — warn user about remaining codes. *(error: `MFA_NO_BACKUP_CODES`)*
- **Verification Failed** — when TOTP code does not match OR SMS code does not match OR Backup code does not match, then show "Invalid verification code. Please try again.". *(error: `MFA_INVALID_CODE`)*

## Errors it can return

- `MFA_INVALID_CODE` — Invalid verification code
- `MFA_ACCOUNT_LOCKED` — MFA verification locked. Please try again later.
- `MFA_RATE_LIMITED` — Too many verification attempts. Please wait a moment.
- `MFA_ALREADY_ENABLED` — MFA is already enabled for this account
- `MFA_NOT_ENABLED` — MFA is not enabled for this account
- `MFA_SETUP_INCOMPLETE` — Please complete MFA setup by verifying a code
- `MFA_NO_BACKUP_CODES` — No backup codes remaining. Please reconfigure MFA.
- `MFA_SMS_EXPIRED` — SMS code has expired. Please request a new one.

## Events

**`mfa.enabled`** — MFA successfully activated for a user
  Payload: `user_id`, `method`, `timestamp`

**`mfa.verified`** — MFA code successfully verified
  Payload: `user_id`, `method`, `timestamp`

**`mfa.failed`** — MFA verification attempt failed
  Payload: `user_id`, `method`, `timestamp`, `attempt_count`

**`mfa.backup_used`** — Backup code used for MFA verification
  Payload: `user_id`, `timestamp`, `remaining_codes`

**`mfa.disabled`** — MFA disabled for a user
  Payload: `user_id`, `timestamp`

**`mfa.setup_initiated`** — User began MFA setup process
  Payload: `user_id`, `method`, `timestamp`

## Connects to

- **login** *(required)* — MFA is a second factor after primary authentication
- **signup** *(required)* — User account must exist before enabling MFA
- **password-reset** *(recommended)* — Password reset may need to bypass or reset MFA
- **session-management** *(recommended)* — MFA verification status tracked per session

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `███████░░░` | 7/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████████░` | 9/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/multi-factor-auth/) · **Spec source:** [`multi-factor-auth.blueprint.yaml`](./multi-factor-auth.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
