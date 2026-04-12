---
title: "Phone Number Registration Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation. 17 fields. 10 outcomes. 8 error code"
---

# Phone Number Registration Blueprint

> Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation

| | |
|---|---|
| **Feature** | `phone-number-registration` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | registration, phone-verification, sms, voice, captcha, push-challenge, account-creation, identity-keys |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/phone-number-registration.blueprint.yaml) |
| **JSON API** | [phone-number-registration.json]({{ site.baseurl }}/api/blueprints/auth/phone-number-registration.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `phone_number` | phone | Yes | Phone Number | Validations: required, phone |
| `session_id` | token | No | Verification Session ID |  |
| `recovery_password` | token | No | Registration Recovery Password |  |
| `aci_identity_key` | token | Yes | ACI Identity Key | Validations: required |
| `pni_identity_key` | token | Yes | PNI Identity Key | Validations: required |
| `account_name` | text | No | Device Name |  |
| `registration_id` | number | Yes | Registration ID |  |
| `pni_registration_id` | number | Yes | PNI Registration ID |  |
| `fetches_messages` | boolean | Yes | Fetches Messages via WebSocket |  |
| `apn_token` | token | No | Apple Push Notification Token |  |
| `gcm_token` | token | No | Google Cloud Messaging Token |  |
| `aci_signed_prekey` | json | Yes | ACI Signed Pre-Key |  |
| `pni_signed_prekey` | json | Yes | PNI Signed Pre-Key |  |
| `aci_pq_last_resort_prekey` | json | Yes | ACI Post-Quantum Last-Resort Pre-Key |  |
| `pni_pq_last_resort_prekey` | json | Yes | PNI Post-Quantum Last-Resort Pre-Key |  |
| `skip_device_transfer` | boolean | Yes | Skip Device Transfer |  |
| `registration_lock` | password | No | Registration Lock PIN |  |

## Rules

- **verification:**
  - **methods:** session, recovery_password
  - **mutually_exclusive:** true
  - **session_must_be_verified:** true
- **identity_keys:**
  - **all_signed_prekeys_must_be_valid:** true
- **device_channel:**
  - **exactly_one_delivery_channel:** true
- **capabilities:**
  - **new_devices_must_support_pq_ratchet:** true
- **rate_limiting:**
  - **per_phone_number:** true
- **registration_lock:**
  - **status_checked_on_reregistration:** true
  - **lock_statuses:** ABSENT, REQUIRED, EXPIRED
  - **expired_lock_is_ignored:** true
  - **pin_attempts_rate_limited:** true
  - **freeze_credentials_on_mismatch:** true
  - **delete_recovery_password_on_mismatch:** true
- **device_transfer:**
  - **conflict_returned_when_transfer_possible:** true
- **fraud_check:**
  - **notify_anti_abuse_on_session_verification:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `REGISTRATION_RATE_LIMITED`

**Given:**
- registration attempt rate limit exceeded for phone number

**Then:**
- **emit_event** event: `registration.rate_limited`

**Result:** HTTP 429 with Retry-After header

### Invalid_signatures (Priority: 2) — Error: `REGISTRATION_INVALID_SIGNATURES`

**Given:**
- one or more pre-key signatures fail validation against the identity key

**Then:**
- **emit_event** event: `registration.invalid_key_signatures`

**Result:** HTTP 422 — invalid pre-key signature

### Missing_capabilities (Priority: 3) — Error: `REGISTRATION_MISSING_CAPABILITIES`

**Given:**
- device capabilities do not include all capabilities required for new device registration

**Then:**
- **emit_event** event: `registration.missing_capabilities`

**Result:** HTTP 499 — client must support post-quantum ratchet

### Unverified_session (Priority: 4) — Error: `REGISTRATION_SESSION_NOT_VERIFIED`

**Given:**
- `session_id` (input) exists
- session is not in a verified state

**Then:**
- **emit_event** event: `registration.unverified_session`

**Result:** HTTP 401 — verification session is not verified

### Invalid_recovery_password (Priority: 5) — Error: `REGISTRATION_RECOVERY_INVALID`

**Given:**
- `recovery_password` (input) exists
- recovery_password does not match stored registration recovery password

**Then:**
- **emit_event** event: `registration.recovery_password_invalid`

**Result:** HTTP 403 — registration recovery password is invalid

### Device_transfer_available (Priority: 6) — Error: `REGISTRATION_DEVICE_TRANSFER_AVAILABLE`

**Given:**
- `skip_device_transfer` (input) eq `false`
- existing account for this phone number has a device capable of transfer

**Then:**
- **emit_event** event: `registration.device_transfer_available`

**Result:** HTTP 409 — client should prompt user to decide on device transfer

### Registration_lock_required (Priority: 7) — Error: `REGISTRATION_LOCK_REQUIRED`

**Given:**
- existing account has an active, non-expired registration lock
- `registration_lock` (input) not_exists

**Then:**
- **emit_event** event: `registration.lock_required`

**Result:** HTTP 423 with time-remaining milliseconds and secure value recovery credentials

### Registration_lock_mismatch (Priority: 8) — Error: `REGISTRATION_LOCK_MISMATCH` | Transaction: atomic

**Given:**
- existing account has an active, non-expired registration lock
- `registration_lock` (input) exists
- supplied registration_lock does not match the stored lock

**Then:**
- **set_field** target: `account_credentials_status` value: `locked`
- **emit_event** event: `registration.lock_mismatch`
- **notify**

**Result:** HTTP 423 — credentials frozen; device receives push notification

### Success_new_account (Priority: 9) | Transaction: atomic

**Given:**
- session is verified or recovery_password is valid
- no existing account for this phone number OR registration lock check passes
- all signed pre-keys are valid
- device has all required capabilities

**Then:**
- **create_record** target: `account`
- **create_record** target: `device`
- **emit_event** event: `registration.success`

**Result:** HTTP 200 — account UUID, PNI UUID, identity keys; reregistered=false

### Success_reregistration (Priority: 10) | Transaction: atomic

**Given:**
- session is verified or recovery_password is valid
- existing account found for this phone number
- registration lock check passes
- all signed pre-keys are valid

**Then:**
- **create_record** target: `account`
- **emit_event** event: `registration.reregistration_success`

**Result:** HTTP 200 — account UUID, PNI UUID, identity keys; reregistered=true

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REGISTRATION_RATE_LIMITED` | 429 | Too many registration attempts. Please wait before trying again. | Yes |
| `REGISTRATION_INVALID_SIGNATURES` | 422 | One or more pre-key signatures are invalid. | No |
| `REGISTRATION_MISSING_CAPABILITIES` | 422 | This version of the app does not support required security features. Please update. | No |
| `REGISTRATION_SESSION_NOT_VERIFIED` | 401 | Phone number verification has not been completed. | Yes |
| `REGISTRATION_RECOVERY_INVALID` | 403 | The account recovery credential is invalid. | No |
| `REGISTRATION_DEVICE_TRANSFER_AVAILABLE` | 409 | A device transfer is available. Please confirm whether to transfer data from your existing device. | Yes |
| `REGISTRATION_LOCK_REQUIRED` | 423 | This account has a registration lock. Enter your PIN to continue. | Yes |
| `REGISTRATION_LOCK_MISMATCH` | 423 | Incorrect registration lock PIN. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `registration.success` | New account successfully created | `phone_number`, `account_uuid`, `pni_uuid`, `verification_type` |
| `registration.reregistration_success` | Existing account successfully re-registered | `phone_number`, `account_uuid`, `verification_type` |
| `registration.rate_limited` | Registration attempt was rate-limited | `phone_number` |
| `registration.lock_mismatch` | Registration lock PIN was incorrect; existing credentials frozen | `phone_number` |
| `registration.lock_required` | Registration lock PIN required but not supplied | `phone_number` |
| `registration.invalid_key_signatures` | Pre-key upload rejected due to invalid signatures | `phone_number` |
| `registration.missing_capabilities` | Device does not have required capabilities | `phone_number` |
| `registration.unverified_session` | Attempted registration with an unverified session | `session_id` |
| `registration.recovery_password_invalid` | Recovery password did not match stored credential | `phone_number` |
| `registration.device_transfer_available` | Device transfer is possible and user has not opted out | `phone_number` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| registration-lock-pin | required | Registration lock verification is an integral gate in the registration flow |
| signal-prekey-bundle | required | Signed pre-keys for both identities must be provided during registration |
| one-time-prekey-replenishment | recommended | After registration, clients should replenish one-time pre-key pools for both identities |

## AGI Readiness

### Goals

#### Reliable Phone Number Registration

Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation

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
| `registration_lock_pin` | registration-lock-pin | fail |
| `signal_prekey_bundle` | signal-prekey-bundle | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| invalid_signatures | `autonomous` | - | - |
| missing_capabilities | `autonomous` | - | - |
| unverified_session | `autonomous` | - | - |
| invalid_recovery_password | `autonomous` | - | - |
| device_transfer_available | `autonomous` | - | - |
| registration_lock_required | `autonomous` | - | - |
| registration_lock_mismatch | `autonomous` | - | - |
| success_new_account | `autonomous` | - | - |
| success_reregistration | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Phone Number Registration Blueprint",
  "description": "Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation. 17 fields. 10 outcomes. 8 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "registration, phone-verification, sms, voice, captcha, push-challenge, account-creation, identity-keys"
}
</script>
