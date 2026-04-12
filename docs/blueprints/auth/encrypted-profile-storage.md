---
title: "Encrypted Profile Storage Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system. 11 fields. 9 outcomes. 7 er"
---

# Encrypted Profile Storage Blueprint

> Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system

| | |
|---|---|
| **Feature** | `encrypted-profile-storage` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | encryption, profile, zero-knowledge, avatar, versioning, privacy |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/encrypted-profile-storage.blueprint.yaml) |
| **JSON API** | [encrypted-profile-storage.json]({{ site.baseurl }}/api/blueprints/auth/encrypted-profile-storage.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `profile_version` | text | Yes | Profile Version |  |
| `commitment` | token | Yes | Profile Key Commitment |  |
| `name` | token | No | Encrypted Name |  |
| `about` | token | No | Encrypted About |  |
| `about_emoji` | token | No | Encrypted About Emoji |  |
| `payment_address` | token | No | Encrypted Payment Address |  |
| `phone_number_sharing` | token | No | Encrypted Phone Number Sharing |  |
| `has_avatar` | boolean | No | Has Avatar |  |
| `same_avatar` | boolean | No | Same Avatar |  |
| `credential_request` | token | No | Credential Request |  |
| `credential_type` | select | No | Credential Type |  |

## Rules

- **encryption:**
  - **client_side_only:** true
  - **note:** All profile field values (name, about, about_emoji, payment_address, phone_number_sharing) are encrypted on the client before upload; the server stores opaque ciphertext and never accesses plaintext
  - **padding_required:** true
  - **padding_purpose:** Fixed-size padding prevents traffic-analysis leakage of plaintext length
- **versioning:**
  - **key:** account_identifier_plus_version
  - **multi_version:** true
  - **note:** Each profile version is keyed by both the account identifier and the version string; multiple versions may coexist per account
  - **commitment_immutable:** true
  - **commitment_note:** The profile key commitment is written once per version using a conditional update; it cannot be overwritten after creation
- **payment_address:**
  - **scope:** current_version_only
  - **note:** Payment addresses are only returned when the requested version matches the account's current profile version
  - **region_blocking:** configurable
  - **region_note:** Payment addresses are blocked for phone-number prefixes on a configurable disallowed-regions list, unless a payment address was already set
- **avatar:**
  - **max_size_bytes:** 10485760
  - **storage:** object_storage_profiles_prefix
  - **upload:** presigned_post_policy
  - **note:** Avatar uploads require pre-signed form credentials; the server generates an object name from random bytes and signs a timed upload form
  - **cleanup:** Previous avatar is deleted when an account sets a new avatar
- **access_control:**
  - **methods:** authenticated, unidentified_access_key, group_send_token
  - **note:** Profile retrieval requires authenticated access, a valid unidentified-access key, or a group send token (unversioned endpoint only)
  - **rate_limiting:** per_authenticated_account
- **credentials:**
  - **type:** expiring_profile_key
  - **validity_days:** 7
  - **note:** ZK expiring profile key credentials are valid for 7 days from issuance
- **deletion:**
  - **on_account_delete:** all_versions_deleted
  - **avatar_on_explicit_delete:** deleted
  - **avatar_on_reimplicit_register:** preserved_for_pin_recovery

## Outcomes

### Rate_limited (Priority: 1) — Error: `PROFILE_RATE_LIMITED`

**Given:**
- `requester_uuid` (session) exists
- Profile read rate limit is exceeded for this account

**Then:**
- **emit_event** event: `profile.rate_limited`

**Result:** Request rejected with rate-limit error

### Unauthorized_access (Priority: 2) — Error: `PROFILE_UNAUTHORIZED`

**Given:**
- Caller provides neither valid authentication nor a valid unidentified-access key nor a valid group send token

**Then:**
- **emit_event** event: `profile.access_denied`

**Result:** Request rejected as unauthorized

### Payment_address_region_blocked (Priority: 3) — Error: `PROFILE_PAYMENT_ADDRESS_REGION_BLOCKED`

**Given:**
- Caller is authenticated and is updating their own profile
- `payment_address` (input) exists
- Account phone number matches a blocked-region prefix and no payment address exists yet for this version

**Result:** Profile update rejected because payment addresses are not supported in this region

### Profile_set_new_avatar (Priority: 4)

**Given:**
- Caller is authenticated
- `commitment` (input) exists
- `has_avatar` (input) eq `true`
- `same_avatar` (input) eq `false`

**Then:**
- **create_record** — Persist encrypted profile fields and new avatar path
- **delete_record** — Remove old avatar from object storage
- **set_field** target: `current_profile_version` value: `profile_version`
- **emit_event** event: `profile.updated`

**Result:** Profile stored; response contains pre-signed avatar upload form credentials

### Profile_set_clear_avatar (Priority: 5)

**Given:**
- Caller is authenticated
- `commitment` (input) exists
- `has_avatar` (input) eq `false`

**Then:**
- **create_record** — Persist encrypted profile fields without avatar
- **delete_record** — Remove old avatar from object storage
- **set_field** target: `current_profile_version` value: `profile_version`
- **emit_event** event: `profile.updated`

**Result:** Profile stored with no avatar; empty 200 response

### Profile_set_unchanged_avatar (Priority: 6)

**Given:**
- Caller is authenticated
- `commitment` (input) exists
- `same_avatar` (input) eq `true`

**Then:**
- **create_record** — Persist encrypted profile fields reusing existing avatar path
- **set_field** target: `current_profile_version` value: `profile_version`
- **emit_event** event: `profile.updated`

**Result:** Profile stored; existing avatar object reused; empty 200 response

### Versioned_profile_retrieved (Priority: 7)

**Given:**
- Caller provides valid authentication or unidentified-access key
- `profile_version` (input) exists

**Then:**
- **emit_event** event: `profile.accessed`

**Result:** Encrypted profile fields returned (name, about, about_emoji, avatar path, payment_address, phone_number_sharing); fields absent if version not found

### Profile_key_credential_issued (Priority: 8)

**Given:**
- Caller provides valid authentication or unidentified-access key
- `credential_request` (input) exists
- `credential_type` (input) eq `expiringProfileKey`
- Profile version exists in storage

**Then:**
- **emit_event** event: `profile.credential_issued`

**Result:** Versioned profile fields returned alongside an expiring ZK profile key credential valid for 7 days

### Batch_identity_check_mismatch (Priority: 9)

**Given:**
- Unauthenticated batch identity check request submitted
- At least one element 4-byte SHA-256 fingerprint does not match the stored identity key

**Then:**
- **emit_event** event: `profile.identity_mismatch`

**Result:** Response contains only the elements whose fingerprints differ from stored identity keys

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PROFILE_RATE_LIMITED` | 429 | Too many profile requests. Please wait before trying again. | Yes |
| `PROFILE_UNAUTHORIZED` | 401 | Not authorized to access this profile. | No |
| `PROFILE_NOT_FOUND` | 404 | The requested profile or account was not found. | No |
| `PROFILE_INVALID_REQUEST` | 400 | Invalid profile request. Check field sizes and formats. | No |
| `PROFILE_PAYMENT_ADDRESS_REGION_BLOCKED` | 403 | Payment addresses are not supported in your region. | No |
| `PROFILE_INVALID_CREDENTIAL_TYPE` | 400 | Unsupported credential type requested. | No |
| `PROFILE_INVALID_CREDENTIAL_REQUEST` | 400 | The credential request is invalid or does not match the stored commitment. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `profile.updated` | A versioned profile was created or replaced by its owner | `account_id`, `profile_version`, `avatar_changed` |
| `profile.accessed` | A profile version was retrieved by a requester | `target_account_id`, `profile_version`, `requester_type` |
| `profile.credential_issued` | An expiring ZK profile key credential was issued for a profile version | `target_account_id`, `profile_version`, `expiry` |
| `profile.rate_limited` | A profile read request was rejected due to rate limiting | `requester_uuid` |
| `profile.access_denied` | A profile read was denied due to missing or invalid credentials | `target_account_id` |
| `profile.identity_mismatch` | One or more accounts returned mismatched identity key fingerprints in a batch check | `mismatched_identifiers` |
| `profile.deleted` | All versioned profiles for an account were deleted on account deletion or re-registration | `account_id`, `avatars_deleted` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| e2e-key-exchange | required | Profile key commitment is derived from the user's end-to-end encryption key material |
| device-management | required | Authenticated profile updates require a valid device session |
| login | required | Authenticated profile read/write endpoints require account authentication |
| encrypted-group-metadata | recommended | Group send tokens can gate unversioned profile retrieval for group members |
| multi-device-sync | recommended | Profile version changes should be synced across all devices belonging to the account |

## AGI Readiness

### Goals

#### Reliable Encrypted Profile Storage

Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system

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
| `e2e_key_exchange` | e2e-key-exchange | fail |
| `device_management` | device-management | fail |
| `login` | login | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| unauthorized_access | `autonomous` | - | - |
| payment_address_region_blocked | `human_required` | - | - |
| profile_set_new_avatar | `autonomous` | - | - |
| profile_set_clear_avatar | `autonomous` | - | - |
| profile_set_unchanged_avatar | `supervised` | - | - |
| versioned_profile_retrieved | `autonomous` | - | - |
| profile_key_credential_issued | `autonomous` | - | - |
| batch_identity_check_mismatch | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Encrypted Profile Storage Blueprint",
  "description": "Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system. 11 fields. 9 outcomes. 7 er",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "encryption, profile, zero-knowledge, avatar, versioning, privacy"
}
</script>
