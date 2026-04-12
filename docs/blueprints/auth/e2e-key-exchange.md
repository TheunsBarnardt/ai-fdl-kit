---
title: "E2e Key Exchange Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Manages cryptographic key material for end-to-end encrypted messaging. Handles device key publication, one-time pre-key upload/claiming, and cross-server key qu"
---

# E2e Key Exchange Blueprint

> Manages cryptographic key material for end-to-end encrypted messaging. Handles device key publication, one-time pre-key upload/claiming, and cross-server key queries.

| | |
|---|---|
| **Feature** | `e2e-key-exchange` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | e2e, encryption, key-exchange, olm, megolm, devices, security |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/e2e-key-exchange.blueprint.yaml) |
| **JSON API** | [e2e-key-exchange.json]({{ site.baseurl }}/api/blueprints/auth/e2e-key-exchange.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sender_device` | Sending Device | human | Device establishing an encrypted session with recipients |
| `recipient_device` | Recipient Device | human | Device whose keys are being queried to set up encryption |
| `homeserver` | Homeserver | system | Key distribution server; stores and serves keys without decrypting content |
| `remote_server` | Remote Server | external | Foreign server hosting recipient devices |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | token | Yes | Identifier of the device the keys belong to |  |
| `user_id` | text | Yes | Account the device belongs to |  |
| `identity_keys` | json | Yes | Long-lived public keys for the device (curve25519 and ed25519) |  |
| `one_time_keys` | json | No | Single-use pre-keys uploaded in bulk to bootstrap Olm sessions |  |
| `fallback_keys` | json | No | Fallback pre-keys used when no one-time keys remain |  |
| `claimed_keys` | json | No | One-time keys retrieved by another device to initiate encryption |  |
| `failures` | json | No | Map of server domains to error descriptions for failed queries |  |

## Rules

- **key_management:** The server stores device keys and one-time keys but never stores private key material, One-time keys are consumed exactly once; after claiming they are removed from the pool, When one-time keys are exhausted, fallback keys are used and marked for replacement, Devices that are deleted have their associated keys removed from the store
- **querying:** Device key queries must be separated by domain: local devices from database, remote via federation, Remote device key results are cached to reduce federation load; stale cache entries refreshed on demand, Servers that are unreachable during a query are recorded in the failures response, Servers previously marked as down are not contacted until their backoff window expires

## Outcomes

### Device_keys_uploaded (Priority: 1)

**Given:**
- device is authenticated
- uploaded keys include valid signatures from the device

**Then:**
- **create_record** target: `key_store` — Device identity keys stored and indexed for querying
- **emit_event** event: `keys.device_keys_uploaded`

**Result:** Device keys are discoverable by other users in shared rooms

### One_time_keys_uploaded (Priority: 2)

**Given:**
- device is authenticated
- uploaded one-time keys have valid signatures

**Then:**
- **create_record** target: `key_pool` — One-time keys added to the available pool for this device
- **emit_event** event: `keys.one_time_keys_uploaded`

**Result:** Other devices can claim these keys to establish Olm sessions

### One_time_key_claimed (Priority: 3)

**Given:**
- requester specifies one or more target devices
- target device has at least one unclaimed one-time key

**Then:**
- **delete_record** target: `key_pool` — Claimed one-time key removed from pool; cannot be reused
- **emit_event** event: `keys.one_time_key_claimed`

**Result:** Requester can use the claimed key to establish an encrypted Olm session

### Fallback_key_used (Priority: 4)

**Given:**
- target device has no unclaimed one-time keys
- a fallback key is available

**Then:**
- **emit_event** event: `keys.fallback_key_used`

**Result:** Encryption session established using fallback key; device should upload new one-time keys

### Keys_queried_local (Priority: 5)

**Given:**
- queried users are all on the local server

**Then:**
- **emit_event** event: `keys.query_completed`

**Result:** Device keys returned from local database with cross-signing bundles

### Keys_queried_federated (Priority: 6)

**Given:**
- queried users include users on remote servers
- remote servers are reachable

**Then:**
- **create_record** target: `key_cache` — Remote device keys cached locally
- **emit_event** event: `keys.query_completed`

**Result:** Keys for remote users returned; unreachable servers listed in failures

### Key_query_partial_failure (Priority: 7)

**Given:**
- one or more remote servers are unreachable or in backoff

**Then:**
- **set_field** target: `failures` — Unreachable servers recorded in failures map
- **emit_event** event: `keys.query_partial_failure`

**Result:** Available keys returned; caller can retry for failed servers later

### No_keys_available (Priority: 8) — Error: `KEY_EXCHANGE_NO_KEYS`

**Given:**
- target device has no one-time keys and no fallback key

**Result:** No key returned for that device; encryption session cannot be established

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `KEY_EXCHANGE_NO_KEYS` | 404 | No one-time keys available for this device | No |
| `KEY_EXCHANGE_QUERY_FAILED` | 503 | Key query could not be completed for one or more servers | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `keys.device_keys_uploaded` | A device's long-lived identity keys were published | `user_id`, `device_id` |
| `keys.one_time_keys_uploaded` | A batch of one-time pre-keys was added to a device's pool | `user_id`, `device_id`, `key_count` |
| `keys.one_time_key_claimed` | A one-time key was consumed to bootstrap an Olm session | `claimer_id`, `target_device_id` |
| `keys.fallback_key_used` | A fallback key was used because no one-time keys remained | `target_device_id` |
| `keys.query_completed` | A device key query was resolved (fully or partially) | `querying_device_id`, `user_count`, `failures` |
| `keys.query_partial_failure` | Key query completed but one or more servers were unreachable | `failed_servers` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| cross-signing-verification | recommended | Cross-signing keys are bundled in key query responses alongside device keys |
| device-management | required | Device keys are invalidated when the device is deleted |
| key-backup-recovery | recommended | Session keys established during key exchange are backed up for recovery |
| server-federation | recommended | Remote device keys are fetched via federation queries |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 8
  entry_points:
    - synapse/handlers/e2e_keys.py
    - synapse/storage/databases/main/end_to_end_keys.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "E2e Key Exchange Blueprint",
  "description": "Manages cryptographic key material for end-to-end encrypted messaging. Handles device key publication, one-time pre-key upload/claiming, and cross-server key qu",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "e2e, encryption, key-exchange, olm, megolm, devices, security"
}
</script>
