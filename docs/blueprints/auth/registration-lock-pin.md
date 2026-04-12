---
title: "Registration Lock Pin Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Account registration lock using a user-set PIN backed by a secure value recovery service, protecting re-registration after SIM theft or device loss. 4 fields. 6"
---

# Registration Lock Pin Blueprint

> Account registration lock using a user-set PIN backed by a secure value recovery service, protecting re-registration after SIM theft or device loss

| | |
|---|---|
| **Feature** | `registration-lock-pin` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | registration-lock, pin, secure-value-recovery, account-recovery, re-registration, credential-freeze |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/registration-lock-pin.blueprint.yaml) |
| **JSON API** | [registration-lock-pin.json]({{ site.baseurl }}/api/blueprints/auth/registration-lock-pin.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `registration_lock_token` | password | No | Registration Lock PIN Token |  |
| `svr_credentials` | json | No | Secure Value Recovery Credentials |  |
| `time_remaining_ms` | number | No | Lock Time Remaining (ms) |  |
| `lock_status` | select | No | Registration Lock Status |  |

## Rules

- **lock_states:**
  - **absent_skips_check:** true
  - **expired_skips_check:** true
  - **required_enforces_pin:** true
- **pin_security:**
  - **rate_limited_per_phone_number:** true
  - **pin_never_stored_in_plaintext:** true
- **credential_freeze:**
  - **freeze_on_first_mismatch:** true
  - **timeout_begins_at_freeze:** true
  - **disconnect_all_devices_on_freeze:** true
  - **push_notification_on_freeze:** true
- **recovery_password_handling:**
  - **preserve_on_empty_token_plus_recovery_password_path:** true
  - **delete_on_all_other_mismatch_paths:** true
- **success_clearing:**
  - **clear_rate_limit_on_correct_pin:** true
- **svr_credentials:**
  - **returned_on_lock_failure:** true

## Outcomes

### Lock_absent (Priority: 1)

**Given:**
- `lock_status` (db) eq `ABSENT`

**Then:**
- **emit_event** event: `registration_lock.check_skipped`

**Result:** Registration proceeds without PIN check

### Lock_expired (Priority: 2)

**Given:**
- `lock_status` (db) eq `EXPIRED`

**Then:**
- **emit_event** event: `registration_lock.expired`

**Result:** Registration proceeds; expired lock is not enforced

### Pin_rate_limited (Priority: 3) — Error: `LOCK_PIN_RATE_LIMITED`

**Given:**
- `lock_status` (db) eq `REQUIRED`
- `registration_lock_token` (input) exists
- rate limit for PIN attempts on this phone number is exhausted

**Then:**
- **emit_event** event: `registration_lock.pin_rate_limited`

**Result:** HTTP 429 — too many PIN attempts

### Pin_missing (Priority: 4) — Error: `LOCK_PIN_REQUIRED`

**Given:**
- `lock_status` (db) eq `REQUIRED`
- `registration_lock_token` (input) not_exists

**Then:**
- **emit_event** event: `registration_lock.pin_required`

**Result:** HTTP 423 with time_remaining_ms and secure value recovery credentials

### Pin_incorrect (Priority: 5) — Error: `LOCK_PIN_INCORRECT` | Transaction: atomic

**Given:**
- `lock_status` (db) eq `REQUIRED`
- `registration_lock_token` (input) exists
- submitted registration lock token does not match stored lock

**Then:**
- **set_field** target: `account_credentials_status` value: `locked`
- **call_service** target: `disconnection_manager` — Terminate all active sessions for the account
- **notify**
- **emit_event** event: `registration_lock.pin_incorrect`

**Result:** HTTP 423 with time_remaining_ms and secure value recovery credentials; device receives push notification

### Pin_correct (Priority: 6)

**Given:**
- `lock_status` (db) eq `REQUIRED`
- `registration_lock_token` (input) exists
- submitted registration lock token matches stored lock

**Then:**
- **set_field** target: `pin_rate_limit_counter` value: `0`
- **emit_event** event: `registration_lock.pin_verified`

**Result:** Registration proceeds; PIN rate-limit counter cleared

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LOCK_PIN_REQUIRED` | 423 | A registration lock PIN is required to re-register this number. | Yes |
| `LOCK_PIN_INCORRECT` | 423 | Incorrect registration lock PIN. Your previous device has been notified. | Yes |
| `LOCK_PIN_RATE_LIMITED` | 429 | Too many PIN attempts. Please wait before trying again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `registration_lock.pin_verified` | Correct PIN supplied; registration lock check passed | `phone_number` |
| `registration_lock.pin_incorrect` | Incorrect PIN supplied; account credentials frozen and device notified | `phone_number`, `time_remaining_ms` |
| `registration_lock.pin_required` | Lock is active but no PIN was provided | `phone_number`, `time_remaining_ms` |
| `registration_lock.expired` | Lock exists but has expired due to account inactivity | `phone_number` |
| `registration_lock.check_skipped` | No lock configured; check skipped | `phone_number` |
| `registration_lock.pin_rate_limited` | PIN attempts rate-limited | `phone_number` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| phone-number-registration | required | Registration lock is enforced as a gate within the phone number registration flow |
| signal-prekey-bundle | optional | After successful registration, pre-key bundles are required for messaging |

## AGI Readiness

### Goals

#### Reliable Registration Lock Pin

Account registration lock using a user-set PIN backed by a secure value recovery service, protecting re-registration after SIM theft or device loss

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `phone_number_registration` | phone-number-registration | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| lock_absent | `autonomous` | - | - |
| lock_expired | `autonomous` | - | - |
| pin_rate_limited | `autonomous` | - | - |
| pin_missing | `autonomous` | - | - |
| pin_incorrect | `autonomous` | - | - |
| pin_correct | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Registration Lock Pin Blueprint",
  "description": "Account registration lock using a user-set PIN backed by a secure value recovery service, protecting re-registration after SIM theft or device loss. 4 fields. 6",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "registration-lock, pin, secure-value-recovery, account-recovery, re-registration, credential-freeze"
}
</script>
