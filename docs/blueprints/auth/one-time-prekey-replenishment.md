---
title: "One Time Prekey Replenishment Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment. 9 fields. 9 outcomes. 2 error codes. rule"
---

# One Time Prekey Replenishment Blueprint

> Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment

| | |
|---|---|
| **Feature** | `one-time-prekey-replenishment` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | prekeys, replenishment, pool-management, end-to-end-encryption, ec-keys, kem-keys, device-maintenance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/one-time-prekey-replenishment.blueprint.yaml) |
| **JSON API** | [one-time-prekey-replenishment.json]({{ site.baseurl }}/api/blueprints/auth/one-time-prekey-replenishment.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `identity_type` | select | No | Identity Type |  |
| `ec_prekey_count` | number | No | Available EC One-Time Pre-Key Count |  |
| `pq_prekey_count` | number | No | Available KEM One-Time Pre-Key Count |  |
| `aci_ec_count` | number | No | ACI EC One-Time Pre-Key Count |  |
| `pni_ec_count` | number | No | PNI EC One-Time Pre-Key Count |  |
| `aci_pq_count` | number | No | ACI KEM One-Time Pre-Key Count |  |
| `pni_pq_count` | number | No | PNI KEM One-Time Pre-Key Count |  |
| `ec_one_time_prekeys` | json | No | EC One-Time Pre-Keys to Upload |  |
| `pq_one_time_prekeys` | json | No | KEM One-Time Pre-Keys to Upload |  |

## Rules

- **polling:**
  - **client_polls_on_startup:** true
  - **client_polls_after_wake:** true
  - **client_polls_after_key_consumption:** true
- **identity_management:**
  - **four_pools_per_device:** true
  - **combined_count_endpoint_available:** true
- **upload_constraints:**
  - **max_ec_keys_per_upload:** 100
  - **max_kem_keys_per_upload:** 100
  - **non_empty_list_replaces_existing_pool:** true
  - **all_kem_keys_must_be_signed_by_identity_key:** true
- **last_resort_fallback:**
  - **kem_last_resort_key_used_when_pool_empty:** true
  - **last_resort_key_is_never_consumed:** true
- **orphan_cleanup:**
  - **background_process_removes_unreferenced_pages:** true
  - **minimum_retention_before_deletion:** true
  - **cleanup_is_non_disruptive:** true
- **authentication:**
  - **required_for_count_queries:** true
  - **required_for_uploads:** true

## Outcomes

### Count_query_unauthenticated (Priority: 1) — Error: `PREKEY_REPLENISHMENT_UNAUTHORIZED`

**Given:**
- request does not carry valid account credentials

**Then:**
- **emit_event** event: `prekey_replenishment.unauthorized`

**Result:** HTTP 401 — authentication required

### Count_query_success (Priority: 2)

**Given:**
- device is authenticated
- `identity_type` (input) exists

**Then:**
- **emit_event** event: `prekey_replenishment.count_queried`

**Result:** HTTP 200 — current EC and KEM one-time pre-key counts for the specified identity

### Combined_count_query_success (Priority: 3)

**Given:**
- device is authenticated
- combined count for all identity types requested

**Then:**
- **emit_event** event: `prekey_replenishment.combined_count_queried`

**Result:** HTTP 200 — EC and KEM counts for both ACI and PNI identities

### Pool_adequate (Priority: 4)

**Given:**
- device is authenticated
- all pools are at or above client replenishment threshold

**Then:**
- **emit_event** event: `prekey_replenishment.pool_adequate`

**Result:** No upload required; client continues normal operation

### Pool_below_threshold (Priority: 5)

**Given:**
- device is authenticated
- ANY: `ec_prekey_count` (db) lt `1` OR `pq_prekey_count` (db) lt `1`

**Then:**
- **emit_event** event: `prekey_replenishment.threshold_crossed`

**Result:** Client initiates a pre-key upload to replenish the depleted pool

### Upload_unauthenticated (Priority: 6) — Error: `PREKEY_REPLENISHMENT_UNAUTHORIZED`

**Given:**
- upload request does not carry valid account credentials

**Then:**
- **emit_event** event: `prekey_replenishment.upload_unauthorized`

**Result:** HTTP 401 — authentication required

### Upload_invalid_signature (Priority: 7) — Error: `PREKEY_REPLENISHMENT_INVALID_SIGNATURE`

**Given:**
- device is authenticated
- pq_one_time_prekeys batch is provided
- one or more KEM pre-keys fail signature validation against the identity key

**Then:**
- **emit_event** event: `prekey_replenishment.upload_signature_invalid`

**Result:** HTTP 422 — invalid KEM pre-key signature; no keys stored

### Upload_success (Priority: 8) | Transaction: atomic

**Given:**
- device is authenticated
- ANY: ec_one_time_prekeys is non-empty OR pq_one_time_prekeys is non-empty
- all submitted KEM pre-keys have valid signatures

**Then:**
- **create_record** target: `ec_one_time_prekey_pool` — Store new EC one-time pre-keys, replacing existing pool
- **create_record** target: `kem_one_time_prekey_pool` — Store new KEM one-time pre-keys, replacing existing pool
- **emit_event** event: `prekey_replenishment.upload_success`

**Result:** HTTP 200 — pool replenished; server-side counts updated

### Orphan_page_cleanup (Priority: 9)

**Given:**
- background maintenance is running
- a KEM pre-key storage page exists that is not referenced by any active device
- the page has been unreferenced for longer than the minimum retention period

**Then:**
- **delete_record** — Remove orphaned KEM pre-key storage page
- **emit_event** event: `prekey_replenishment.orphan_page_removed`

**Result:** Orphaned storage page deleted; no impact on active key exchange

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PREKEY_REPLENISHMENT_UNAUTHORIZED` | 401 | Authentication required to manage pre-keys. | No |
| `PREKEY_REPLENISHMENT_INVALID_SIGNATURE` | 422 | One or more pre-key signatures are invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `prekey_replenishment.count_queried` | Pre-key pool count successfully retrieved for a device and identity type | `account_id`, `device_id`, `identity_type`, `ec_prekey_count`, `pq_prekey_count` |
| `prekey_replenishment.combined_count_queried` | Combined ACI and PNI pre-key counts retrieved in a single call | `account_id`, `device_id`, `aci_ec_count`, `pni_ec_count`, `aci_pq_count`, `pni_pq_count` |
| `prekey_replenishment.threshold_crossed` | Pre-key pool dropped below replenishment threshold; upload required | `account_id`, `device_id`, `identity_type`, `ec_prekey_count`, `pq_prekey_count` |
| `prekey_replenishment.pool_adequate` | Pre-key pool is at or above threshold; no upload needed | `account_id`, `device_id`, `ec_prekey_count`, `pq_prekey_count` |
| `prekey_replenishment.upload_success` | New pre-keys successfully stored; pool replenished | `account_id`, `device_id`, `identity_type`, `ec_keys_uploaded`, `pq_keys_uploaded` |
| `prekey_replenishment.upload_signature_invalid` | Pre-key upload rejected due to invalid KEM key signature | `account_id`, `device_id`, `identity_type` |
| `prekey_replenishment.orphan_page_removed` | An orphaned KEM pre-key storage page was removed during maintenance | `page_id` |
| `prekey_replenishment.unauthorized` | Unauthenticated count query or upload attempt | `device_id` |
| `prekey_replenishment.upload_unauthorized` | Unauthenticated pre-key upload attempt | `device_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| signal-prekey-bundle | required | One-time keys are consumed during pre-key bundle retrieval and must be replenished to avoid fallback to last-resort keys |
| phone-number-registration | recommended | After registration, clients should immediately upload one-time pre-key pools for both ACI and PNI identities |

## AGI Readiness

### Goals

#### Reliable One Time Prekey Replenishment

Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

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
| `signal_prekey_bundle` | signal-prekey-bundle | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| count_query_unauthenticated | `autonomous` | - | - |
| count_query_success | `autonomous` | - | - |
| combined_count_query_success | `autonomous` | - | - |
| pool_adequate | `autonomous` | - | - |
| pool_below_threshold | `autonomous` | - | - |
| upload_unauthenticated | `autonomous` | - | - |
| upload_invalid_signature | `autonomous` | - | - |
| upload_success | `autonomous` | - | - |
| orphan_page_cleanup | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "One Time Prekey Replenishment Blueprint",
  "description": "Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment. 9 fields. 9 outcomes. 2 error codes. rule",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "prekeys, replenishment, pool-management, end-to-end-encryption, ec-keys, kem-keys, device-maintenance"
}
</script>
