---
title: "Signal Prekey Bundle Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions. 10"
---

# Signal Prekey Bundle Blueprint

> Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions

| | |
|---|---|
| **Feature** | `signal-prekey-bundle` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | prekeys, end-to-end-encryption, ec-keys, kem-keys, double-ratchet, post-quantum, identity-keys, key-exchange |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/signal-prekey-bundle.blueprint.yaml) |
| **JSON API** | [signal-prekey-bundle.json]({{ site.baseurl }}/api/blueprints/auth/signal-prekey-bundle.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `identity_type` | select | Yes | Identity Type |  |
| `ec_one_time_prekeys` | json | No | EC One-Time Pre-Keys |  |
| `ec_signed_prekey` | json | No | Signed EC Pre-Key |  |
| `pq_one_time_prekeys` | json | No | KEM One-Time Pre-Keys |  |
| `pq_last_resort_prekey` | json | No | KEM Last-Resort Pre-Key |  |
| `target_identifier` | token | No | Target Account Identifier |  |
| `target_device_id` | text | No | Target Device ID |  |
| `unidentified_access_key` | token | No | Unidentified Access Key |  |
| `group_send_token` | token | No | Group Send Endorsement Token |  |
| `digest` | token | No | Key Consistency Digest |  |

## Rules

- **signatures:**
  - **all_signed_keys_must_validate_against_identity_key:** true
- **upload_limits:**
  - **max_ec_one_time_prekeys_per_upload:** 100
  - **max_kem_one_time_prekeys_per_upload:** 100
  - **non_empty_ec_list_replaces_existing_pool:** true
  - **non_empty_kem_list_replaces_existing_pool:** true
- **identity_key_changes:**
  - **only_primary_device_may_change:** true
- **fetch_authorization:**
  - **requires_exactly_one_of:** account_credentials, unidentified_access_key, group_send_token
  - **group_send_token_must_be_verified_against_server_secret:** true
- **fetch_rate_limiting:**
  - **per_requesting_account:** true
- **key_consumption:**
  - **ec_one_time_keys_are_consumed_on_fetch:** true
  - **kem_one_time_keys_are_consumed_on_fetch:** true
  - **missing_signed_ec_or_kem_key_excludes_device:** true
- **consistency_check:**
  - **digest_algorithm:** SHA-256
  - **digest_covers:** identity_key, signed_ec_prekey_id, signed_ec_prekey_bytes, last_resort_kem_key_id, last_resort_kem_key_bytes

## Outcomes

### Upload_invalid_signatures (Priority: 1) — Error: `PREKEY_INVALID_SIGNATURE`

**Given:**
- one or more submitted pre-keys have signatures that do not match the account identity key

**Then:**
- **emit_event** event: `prekey.upload_signature_invalid`

**Result:** HTTP 422 — invalid signature; no keys stored

### Upload_identity_change_non_primary (Priority: 2) — Error: `PREKEY_IDENTITY_CHANGE_FORBIDDEN`

**Given:**
- ec_signed_prekey is present
- requesting device is not the primary device

**Then:**
- **emit_event** event: `prekey.identity_change_unauthorized`

**Result:** HTTP 403 — only the primary device may change identity keys

### Upload_success (Priority: 3) | Transaction: atomic

**Given:**
- device is authenticated
- all submitted keys have valid signatures

**Then:**
- **create_record** target: `ec_one_time_prekey_pool` — Store EC one-time pre-keys if list is non-empty
- **create_record** target: `ec_signed_prekey_store` — Replace signed EC pre-key if provided
- **create_record** target: `kem_one_time_prekey_pool` — Store KEM one-time pre-keys if list is non-empty
- **create_record** target: `kem_last_resort_prekey_store` — Replace KEM last-resort key if provided
- **emit_event** event: `prekey.uploaded`

**Result:** HTTP 200 — pre-keys stored successfully

### Fetch_unauthenticated (Priority: 4) — Error: `PREKEY_FETCH_UNAUTHORIZED`

**Given:**
- `target_identifier` (input) exists
- requesting device is not authenticated
- `unidentified_access_key` (input) not_exists
- `group_send_token` (input) not_exists

**Then:**
- **emit_event** event: `prekey.fetch_unauthorized`

**Result:** HTTP 401 — at least one authorization mechanism required

### Fetch_ambiguous_auth (Priority: 5) — Error: `PREKEY_FETCH_AMBIGUOUS_AUTH`

**Given:**
- `group_send_token` (input) exists
- ANY: requesting device is authenticated OR `unidentified_access_key` (input) exists

**Then:**
- **emit_event** event: `prekey.fetch_ambiguous_auth`

**Result:** HTTP 400 — only one authorization mechanism may be used per request

### Fetch_group_token_invalid (Priority: 6) — Error: `PREKEY_GROUP_TOKEN_INVALID`

**Given:**
- `group_send_token` (input) exists
- token verification fails against server secret params or target identifier

**Then:**
- **emit_event** event: `prekey.fetch_group_token_invalid`

**Result:** HTTP 401 — group send token is invalid or expired

### Fetch_rate_limited (Priority: 7) — Error: `PREKEY_FETCH_RATE_LIMITED`

**Given:**
- authenticated account has exceeded pre-key fetch rate limit

**Then:**
- **emit_event** event: `prekey.fetch_rate_limited`

**Result:** HTTP 429 with Retry-After header

### Fetch_not_found (Priority: 8) — Error: `PREKEY_NOT_FOUND`

**Given:**
- `target_identifier` (input) exists
- target account or device does not exist or has no available pre-keys for any requested device

**Then:**
- **emit_event** event: `prekey.fetch_not_found`

**Result:** HTTP 404 — target not found or has no keys

### Fetch_success (Priority: 9)

**Given:**
- `target_identifier` (input) exists
- target account exists and at least one device has both a signed EC key and a KEM key
- requester holds valid authorization credentials

**Then:**
- **delete_record** — Consume one EC one-time pre-key per device if available
- **delete_record** — Consume one KEM one-time pre-key per device; fall back to last-resort if pool empty
- **emit_event** event: `prekey.fetched`

**Result:** HTTP 200 — pre-key bundle with identity key, signed EC key, optional unsigned EC key, and KEM key per device

### Consistency_check_pass (Priority: 10)

**Given:**
- `digest` (input) exists
- computed SHA-256 over identity key and repeated-use keys matches submitted digest

**Then:**
- **emit_event** event: `prekey.consistency_verified`

**Result:** HTTP 200 — client and server have consistent repeated-use key views

### Consistency_check_fail (Priority: 11) — Error: `PREKEY_CONSISTENCY_MISMATCH`

**Given:**
- `digest` (input) exists
- ANY: computed digest does not match submitted digest OR signed EC pre-key or last-resort KEM key not found on server

**Then:**
- **emit_event** event: `prekey.consistency_mismatch`

**Result:** HTTP 409 — key views inconsistent; client should re-upload repeated-use keys

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PREKEY_INVALID_SIGNATURE` | 422 | One or more pre-key signatures are invalid. | No |
| `PREKEY_IDENTITY_CHANGE_FORBIDDEN` | 403 | Identity key changes can only be made from the primary device. | No |
| `PREKEY_FETCH_UNAUTHORIZED` | 401 | Authentication required to retrieve pre-key bundles. | No |
| `PREKEY_FETCH_AMBIGUOUS_AUTH` | 400 | Multiple authorization methods were provided. Use only one. | No |
| `PREKEY_GROUP_TOKEN_INVALID` | 401 | Group send authorization token is invalid. | No |
| `PREKEY_FETCH_RATE_LIMITED` | 429 | Too many key fetch requests. Please wait before trying again. | Yes |
| `PREKEY_NOT_FOUND` | 404 | The requested account or device has no available pre-keys. | No |
| `PREKEY_CONSISTENCY_MISMATCH` | 409 | Your device keys are out of sync. Please re-upload your pre-keys. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `prekey.uploaded` | Pre-keys successfully stored for a device | `account_id`, `device_id`, `identity_type`, `ec_count`, `pq_count` |
| `prekey.fetched` | Pre-key bundle retrieved for a target account | `target_identifier`, `device_count`, `ec_one_time_available`, `kem_one_time_available` |
| `prekey.upload_signature_invalid` | Pre-key upload rejected due to invalid signature | `account_id`, `identity_type` |
| `prekey.identity_change_unauthorized` | Non-primary device attempted to change identity key | `account_id`, `device_id` |
| `prekey.consistency_verified` | Client and server have consistent repeated-use key views | `account_id`, `device_id`, `identity_type` |
| `prekey.consistency_mismatch` | Client and server pre-key views are inconsistent | `account_id`, `device_id`, `identity_type` |
| `prekey.fetch_rate_limited` | Pre-key fetch rate limit exceeded | `account_id`, `target_identifier` |
| `prekey.fetch_unauthorized` | Pre-key fetch attempted without authorization | `target_identifier` |
| `prekey.fetch_ambiguous_auth` | Pre-key fetch provided multiple conflicting authorization mechanisms | `target_identifier` |
| `prekey.fetch_group_token_invalid` | Group send token failed verification | `target_identifier` |
| `prekey.fetch_not_found` | Target account or device has no available pre-keys | `target_identifier`, `target_device_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| phone-number-registration | required | Signed pre-keys for both identities are required at account registration time |
| one-time-prekey-replenishment | required | One-time pre-key pools must be monitored and replenished after keys are consumed during key exchange |

## AGI Readiness

### Goals

#### Reliable Signal Prekey Bundle

Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions

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
| `one_time_prekey_replenishment` | one-time-prekey-replenishment | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| upload_invalid_signatures | `autonomous` | - | - |
| upload_identity_change_non_primary | `supervised` | - | - |
| upload_success | `autonomous` | - | - |
| fetch_unauthenticated | `autonomous` | - | - |
| fetch_ambiguous_auth | `autonomous` | - | - |
| fetch_group_token_invalid | `autonomous` | - | - |
| fetch_rate_limited | `autonomous` | - | - |
| fetch_not_found | `autonomous` | - | - |
| fetch_success | `autonomous` | - | - |
| consistency_check_pass | `autonomous` | - | - |
| consistency_check_fail | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Signal Prekey Bundle Blueprint",
  "description": "Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions. 10",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "prekeys, end-to-end-encryption, ec-keys, kem-keys, double-ratchet, post-quantum, identity-keys, key-exchange"
}
</script>
