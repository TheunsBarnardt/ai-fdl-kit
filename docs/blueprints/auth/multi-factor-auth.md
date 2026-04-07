---
title: "Multi Factor Auth Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Second-factor authentication via TOTP, SMS OTP, or backup codes. 7 fields. 9 outcomes. 8 error codes. rules: security, setup"
---

# Multi Factor Auth Blueprint

> Second-factor authentication via TOTP, SMS OTP, or backup codes

| | |
|---|---|
| **Feature** | `multi-factor-auth` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | authentication, mfa, totp, otp, security, 2fa, backup-codes |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/multi-factor-auth.blueprint.yaml) |
| **JSON API** | [multi-factor-auth.json]({{ site.baseurl }}/api/blueprints/auth/multi-factor-auth.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `mfa_method` | select | Yes | MFA Method | Validations: required, oneOf |
| `totp_secret` | hidden | No | TOTP Secret |  |
| `totp_code` | text | No | Authenticator Code | Validations: pattern |
| `sms_code` | text | No | SMS Code | Validations: pattern |
| `phone_number` | phone | No | Phone Number | Validations: pattern |
| `backup_code` | text | No | Backup Code | Validations: pattern |
| `recovery_email` | email | No | Recovery Email |  |

## Rules

- **security:**
  - **totp:**
    - **algorithm:** SHA1
    - **digits:** 6
    - **period_seconds:** 30
    - **window_tolerance:** 1
  - **sms:**
    - **code_length:** 6
    - **expiry_seconds:** 300
    - **max_resend_attempts:** 3
    - **resend_cooldown_seconds:** 60
  - **backup_codes:**
    - **count:** 10
    - **format:** xxxx-xxxx
    - **single_use:** true
    - **hash_storage:** true
  - **max_verification_attempts:** 3
  - **lockout_duration_minutes:** 15
  - **rate_limit:**
    - **window_seconds:** 60
    - **max_requests:** 5
    - **scope:** per_user
  - **secret_storage:**
    - **encryption:** aes_256_gcm
- **setup:**
  - **require_password_confirmation:** true
  - **qr_code_format:** otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30
  - **require_verification_before_enable:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `MFA_RATE_LIMITED`

**Given:**
- `verification_attempts` (computed) gt `5`

**Result:** show "Too many verification attempts. Please wait a moment."

### Account_locked (Priority: 2) — Error: `MFA_ACCOUNT_LOCKED`

**Given:**
- `mfa_failed_attempts` (db) gte `3`
- `mfa_locked_until` (db) gt `now`

**Result:** show "MFA verification locked. Please try again later."

### Setup_totp_success (Priority: 5) | Transaction: atomic

**Given:**
- `mfa_method` (input) eq `totp`
- `mfa_enabled` (db) eq `false`
- `password_confirmed` (session) eq `true`

**Then:**
- **create_record** target: `totp_secret` — Generate and store encrypted TOTP secret
- **create_record** target: `backup_codes` — Generate 10 hashed single-use backup codes
- **emit_event** event: `mfa.setup_initiated`

**Result:** show QR code and backup codes — user must verify one TOTP code to activate

### Setup_sms_success (Priority: 6) | Transaction: atomic

**Given:**
- `mfa_method` (input) eq `sms`
- `mfa_enabled` (db) eq `false`
- `password_confirmed` (session) eq `true`
- `phone_number` (input) matches `^\+[1-9]\d{1,14}$`

**Then:**
- **create_record** target: `sms_code` — Generate and send SMS verification code
- **create_record** target: `backup_codes` — Generate 10 hashed single-use backup codes
- **emit_event** event: `mfa.setup_initiated`

**Result:** send SMS code — user must verify to activate

### Verify_totp_success (Priority: 7) | Transaction: atomic

**Given:**
- `mfa_method` (db) eq `totp`
- `totp_code` (input) eq `computed_totp`

**Then:**
- **set_field** target: `mfa_failed_attempts` value: `0` — Reset failed attempt counter
- **set_field** target: `mfa_enabled` value: `true` when: `mfa_enabled == false` — Activate MFA on first successful verification during setup
- **emit_event** event: `mfa.verified`

**Result:** MFA verification successful — proceed to application

### Verify_sms_success (Priority: 8) | Transaction: atomic

**Given:**
- `mfa_method` (db) eq `sms`
- `sms_code` (input) eq `stored_sms_code`
- `sms_code_expires_at` (db) gt `now`

**Then:**
- **set_field** target: `mfa_failed_attempts` value: `0`
- **set_field** target: `mfa_enabled` value: `true` when: `mfa_enabled == false`
- **delete_record** target: `sms_code` — Invalidate used SMS code
- **emit_event** event: `mfa.verified`

**Result:** MFA verification successful — proceed to application

### Verify_backup_code_success (Priority: 9) | Transaction: atomic

**Given:**
- `backup_code` (input) exists
- `backup_code` (input) eq `stored_backup_hash`

**Then:**
- **delete_record** target: `used_backup_code` — Invalidate the used backup code (single-use)
- **set_field** target: `mfa_failed_attempts` value: `0`
- **emit_event** event: `mfa.backup_used`

**Result:** MFA verification successful via backup code — warn user about remaining codes

### Verification_failed (Priority: 10) — Error: `MFA_INVALID_CODE` | Transaction: atomic

**Given:**
- ANY: `totp_code` (input) neq `computed_totp` OR `sms_code` (input) neq `stored_sms_code` OR `backup_code` (input) neq `stored_backup_hash`

**Then:**
- **set_field** target: `mfa_failed_attempts` value: `increment` — Increment failed MFA attempt counter
- **emit_event** event: `mfa.failed`
- **set_field** target: `mfa_locked_until` value: `now + 15m` when: `mfa_failed_attempts >= 3`

**Result:** show "Invalid verification code. Please try again."

### Disable_mfa (Priority: 11) | Transaction: atomic

**Given:**
- `mfa_enabled` (db) eq `true`
- `password_confirmed` (session) eq `true`

**Then:**
- **set_field** target: `mfa_enabled` value: `false`
- **delete_record** target: `totp_secret` — Remove stored TOTP secret
- **delete_record** target: `backup_codes` — Invalidate all remaining backup codes
- **emit_event** event: `mfa.disabled`

**Result:** MFA disabled — user returns to single-factor authentication

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MFA_INVALID_CODE` | 401 | Invalid verification code | Yes |
| `MFA_ACCOUNT_LOCKED` | 423 | MFA verification locked. Please try again later. | No |
| `MFA_RATE_LIMITED` | 429 | Too many verification attempts. Please wait a moment. | Yes |
| `MFA_ALREADY_ENABLED` | 409 | MFA is already enabled for this account | No |
| `MFA_NOT_ENABLED` | 400 | MFA is not enabled for this account | No |
| `MFA_SETUP_INCOMPLETE` | 400 | Please complete MFA setup by verifying a code | Yes |
| `MFA_NO_BACKUP_CODES` | 400 | No backup codes remaining. Please reconfigure MFA. | No |
| `MFA_SMS_EXPIRED` | 401 | SMS code has expired. Please request a new one. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mfa.enabled` | MFA successfully activated for a user | `user_id`, `method`, `timestamp` |
| `mfa.verified` | MFA code successfully verified | `user_id`, `method`, `timestamp` |
| `mfa.failed` | MFA verification attempt failed | `user_id`, `method`, `timestamp`, `attempt_count` |
| `mfa.backup_used` | Backup code used for MFA verification | `user_id`, `timestamp`, `remaining_codes` |
| `mfa.disabled` | MFA disabled for a user | `user_id`, `timestamp` |
| `mfa.setup_initiated` | User began MFA setup process | `user_id`, `method`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | MFA is a second factor after primary authentication |
| signup | required | User account must exist before enabling MFA |
| password-reset | recommended | Password reset may need to bypass or reset MFA |
| session-management | recommended | MFA verification status tracked per session |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: single_column_centered
max_width: 480px
setup:
  show_qr_code: true
  show_secret_text: true
  show_backup_codes_download: true
  require_code_verification: true
verification:
  fields_order:
    - totp_code
  autofocus: totp_code
  show_backup_code_link: true
actions:
  primary:
    label: Verify
    type: submit
    full_width: true
  secondary:
    label: Use backup code
    type: link
    position: below_form
accessibility:
  autofocus: totp_code
  autocomplete:
    totp_code: one-time-code
    sms_code: one-time-code
  aria_live_region: true
loading:
  disable_button: true
  show_spinner: true
  prevent_double_submit: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Factor Auth Blueprint",
  "description": "Second-factor authentication via TOTP, SMS OTP, or backup codes. 7 fields. 9 outcomes. 8 error codes. rules: security, setup",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "authentication, mfa, totp, otp, security, 2fa, backup-codes"
}
</script>
