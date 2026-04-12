<!-- AUTO-GENERATED FROM phone-number-registration.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Phone Number Registration

> Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation

**Category:** Auth · **Version:** 1.0.0 · **Tags:** registration · phone-verification · sms · voice · captcha · push-challenge · account-creation · identity-keys

## What this does

Phone number registration with SMS/voice verification sessions, push challenge, and captcha gating before account creation

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **phone_number** *(phone, required)* — Phone Number
- **session_id** *(token, optional)* — Verification Session ID
- **recovery_password** *(token, optional)* — Registration Recovery Password
- **aci_identity_key** *(token, required)* — ACI Identity Key
- **pni_identity_key** *(token, required)* — PNI Identity Key
- **account_name** *(text, optional)* — Device Name
- **registration_id** *(number, required)* — Registration ID
- **pni_registration_id** *(number, required)* — PNI Registration ID
- **fetches_messages** *(boolean, required)* — Fetches Messages via WebSocket
- **apn_token** *(token, optional)* — Apple Push Notification Token
- **gcm_token** *(token, optional)* — Google Cloud Messaging Token
- **aci_signed_prekey** *(json, required)* — ACI Signed Pre-Key
- **pni_signed_prekey** *(json, required)* — PNI Signed Pre-Key
- **aci_pq_last_resort_prekey** *(json, required)* — ACI Post-Quantum Last-Resort Pre-Key
- **pni_pq_last_resort_prekey** *(json, required)* — PNI Post-Quantum Last-Resort Pre-Key
- **skip_device_transfer** *(boolean, required)* — Skip Device Transfer
- **registration_lock** *(password, optional)* — Registration Lock PIN

## What must be true

- **verification → methods:** session, recovery_password
- **verification → mutually_exclusive:** true
- **verification → session_must_be_verified:** true
- **identity_keys → all_signed_prekeys_must_be_valid:** true
- **device_channel → exactly_one_delivery_channel:** true
- **capabilities → new_devices_must_support_pq_ratchet:** true
- **rate_limiting → per_phone_number:** true
- **registration_lock → status_checked_on_reregistration:** true
- **registration_lock → lock_statuses:** ABSENT, REQUIRED, EXPIRED
- **registration_lock → expired_lock_is_ignored:** true
- **registration_lock → pin_attempts_rate_limited:** true
- **registration_lock → freeze_credentials_on_mismatch:** true
- **registration_lock → delete_recovery_password_on_mismatch:** true
- **device_transfer → conflict_returned_when_transfer_possible:** true
- **fraud_check → notify_anti_abuse_on_session_verification:** true

## Success & failure scenarios

**✅ Success paths**

- **Success New Account** — when session is verified or recovery_password is valid; no existing account for this phone number OR registration lock check passes; all signed pre-keys are valid; device has all required capabilities, then HTTP 200 — account UUID, PNI UUID, identity keys; reregistered=false.
- **Success Reregistration** — when session is verified or recovery_password is valid; existing account found for this phone number; registration lock check passes; all signed pre-keys are valid, then HTTP 200 — account UUID, PNI UUID, identity keys; reregistered=true.

**❌ Failure paths**

- **Rate Limited** — when registration attempt rate limit exceeded for phone number, then HTTP 429 with Retry-After header. *(error: `REGISTRATION_RATE_LIMITED`)*
- **Invalid Signatures** — when one or more pre-key signatures fail validation against the identity key, then HTTP 422 — invalid pre-key signature. *(error: `REGISTRATION_INVALID_SIGNATURES`)*
- **Missing Capabilities** — when device capabilities do not include all capabilities required for new device registration, then HTTP 499 — client must support post-quantum ratchet. *(error: `REGISTRATION_MISSING_CAPABILITIES`)*
- **Unverified Session** — when Session-based verification path chosen; session is not in a verified state, then HTTP 401 — verification session is not verified. *(error: `REGISTRATION_SESSION_NOT_VERIFIED`)*
- **Invalid Recovery Password** — when Recovery-password verification path chosen; recovery_password does not match stored registration recovery password, then HTTP 403 — registration recovery password is invalid. *(error: `REGISTRATION_RECOVERY_INVALID`)*
- **Device Transfer Available** — when Client has not opted out of transfer; existing account for this phone number has a device capable of transfer, then HTTP 409 — client should prompt user to decide on device transfer. *(error: `REGISTRATION_DEVICE_TRANSFER_AVAILABLE`)*
- **Registration Lock Required** — when existing account has an active, non-expired registration lock; No registration lock PIN was provided, then HTTP 423 with time-remaining milliseconds and secure value recovery credentials. *(error: `REGISTRATION_LOCK_REQUIRED`)*
- **Registration Lock Mismatch** — when existing account has an active, non-expired registration lock; A PIN was supplied; supplied registration_lock does not match the stored lock, then HTTP 423 — credentials frozen; device receives push notification. *(error: `REGISTRATION_LOCK_MISMATCH`)*

## Errors it can return

- `REGISTRATION_RATE_LIMITED` — Too many registration attempts. Please wait before trying again.
- `REGISTRATION_INVALID_SIGNATURES` — One or more pre-key signatures are invalid.
- `REGISTRATION_MISSING_CAPABILITIES` — This version of the app does not support required security features. Please update.
- `REGISTRATION_SESSION_NOT_VERIFIED` — Phone number verification has not been completed.
- `REGISTRATION_RECOVERY_INVALID` — The account recovery credential is invalid.
- `REGISTRATION_DEVICE_TRANSFER_AVAILABLE` — A device transfer is available. Please confirm whether to transfer data from your existing device.
- `REGISTRATION_LOCK_REQUIRED` — This account has a registration lock. Enter your PIN to continue.
- `REGISTRATION_LOCK_MISMATCH` — Incorrect registration lock PIN.

## Connects to

- **registration-lock-pin** *(required)* — Registration lock verification is an integral gate in the registration flow
- **signal-prekey-bundle** *(required)* — Signed pre-keys for both identities must be provided during registration
- **one-time-prekey-replenishment** *(recommended)* — After registration, clients should replenish one-time pre-key pools for both identities

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/phone-number-registration/) · **Spec source:** [`phone-number-registration.blueprint.yaml`](./phone-number-registration.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
