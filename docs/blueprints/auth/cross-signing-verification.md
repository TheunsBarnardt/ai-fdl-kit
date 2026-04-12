---
title: "Cross Signing Verification Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Three-key trust hierarchy for verifying devices and users. Master key signs self-signing and user-signing keys. All uploads are cryptographically validated befo"
---

# Cross Signing Verification Blueprint

> Three-key trust hierarchy for verifying devices and users. Master key signs self-signing and user-signing keys. All uploads are cryptographically validated before storage.

| | |
|---|---|
| **Feature** | `cross-signing-verification` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | e2e, cross-signing, verification, trust, keys, identity, security |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/cross-signing-verification.blueprint.yaml) |
| **JSON API** | [cross-signing-verification.json]({{ site.baseurl }}/api/blueprints/auth/cross-signing-verification.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `key_owner` | Key Owner | human | User uploading or updating their cross-signing keys |
| `verifying_user` | Verifying User | human | User checking another user's key signatures to establish trust |
| `homeserver` | Homeserver | system | Server validating cryptographic signatures and storing keys |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `master_key` | json | No | Root key for the account; all other keys must be signed by this key |  |
| `self_signing_key` | json | No | Key used to sign the owner's own device keys; must be signed by master_key |  |
| `user_signing_key` | json | No | Key used to sign other users' master keys (trust delegation); must be signed by master_key |  |
| `user_id` | text | Yes | Account the cross-signing keys belong to |  |
| `signatures` | json | Yes | Cryptographic signatures on each key proving its authority chain |  |

## Rules

- **key_hierarchy:** All three key types must be signed by the master key before they can be stored, A master key must already exist before other keys can be uploaded, or all three can be uploaded together, Uploading a new master key invalidates all existing device verifications for the account, Self-signing keys sign the owner's own device keys, User-signing keys sign other users' master keys for trust delegation
- **notifications:** Master or self-signing key updates trigger device list update notifications to all users in shared rooms, User-signing key updates only notify the key owner (not broadcast to room members), All signature verification uses canonical JSON serialization

## Outcomes

### Keys_uploaded (Priority: 1)

**Given:**
- all submitted keys carry valid signatures from the master key
- ANY: master key is being uploaded alongside other keys OR master key already exists on the server

**Then:**
- **create_record** target: `key_store` — Cross-signing keys persisted to key store
- **emit_event** event: `cross_signing.keys_uploaded`

**Result:** Keys are stored and trust hierarchy is established

### Master_key_updated (Priority: 2)

**Given:**
- new master key is valid
- master key differs from the existing one

**Then:**
- **create_record** target: `key_store` — New master key stored; prior device verifications invalidated
- **emit_event** event: `cross_signing.master_key_updated`
- **notify** — Device list update broadcast to all users in shared encrypted rooms

**Result:** Account's root of trust is rotated; remote devices are notified

### User_signing_key_updated (Priority: 3)

**Given:**
- new user-signing key carries valid master key signature

**Then:**
- **create_record** target: `key_store` — User-signing key stored
- **emit_event** event: `cross_signing.user_signing_key_updated`
- **notify** — Signature update notification sent only to the key owner

**Result:** Key owner can now sign other users' master keys to extend trust

### Keys_queried (Priority: 4)

**Given:**
- requester is authenticated
- target user's keys are available locally or via federation

**Then:**
- **emit_event** event: `cross_signing.keys_retrieved`

**Result:** Requester receives target user's cross-signing key bundle

### Invalid_signature (Priority: 5) — Error: `CROSS_SIGNING_SIGNATURE_INVALID`

**Given:**
- ANY: master key signature fails cryptographic verification OR self-signing key is not validly signed by master key OR user-signing key is not validly signed by master key

**Result:** Key upload rejected; no keys stored

### Master_key_missing (Priority: 6) — Error: `CROSS_SIGNING_MASTER_KEY_MISSING`

**Given:**
- self-signing or user-signing key uploaded without a master key
- no master key exists on the server for this account

**Result:** Upload rejected; master key must be established first

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CROSS_SIGNING_SIGNATURE_INVALID` | 400 | One or more cross-signing keys have invalid signatures | No |
| `CROSS_SIGNING_MASTER_KEY_MISSING` | 400 | A master key must be provided before uploading other cross-signing keys | No |
| `CROSS_SIGNING_KEY_NOT_FOUND` | 404 | No cross-signing keys found for this user | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cross_signing.keys_uploaded` | One or more cross-signing keys were successfully stored | `user_id`, `key_types_updated` |
| `cross_signing.master_key_updated` | The account's master key was replaced; device verifications may need renewal | `user_id` |
| `cross_signing.user_signing_key_updated` | The user-signing key was updated; only the key owner is notified | `user_id` |
| `cross_signing.keys_retrieved` | A user's cross-signing key bundle was returned to a requester | `querying_user_id`, `target_user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| e2e-key-exchange | required | Cross-signing keys are bundled with device keys in key query responses |
| device-management | required | Cross-signing updates trigger device list broadcasts; device deletions affect key associations |

## AGI Readiness

### Goals

#### Reliable Cross Signing Verification

Three-key trust hierarchy for verifying devices and users. Master key signs self-signing and user-signing keys. All uploads are cryptographically validated before storage.

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

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `e2e_key_exchange` | e2e-key-exchange | fail |
| `device_management` | device-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| keys_uploaded | `autonomous` | - | - |
| master_key_updated | `supervised` | - | - |
| user_signing_key_updated | `supervised` | - | - |
| keys_queried | `autonomous` | - | - |
| invalid_signature | `autonomous` | - | - |
| master_key_missing | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 5
  entry_points:
    - synapse/handlers/e2e_keys.py
    - synapse/storage/databases/main/end_to_end_keys.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cross Signing Verification Blueprint",
  "description": "Three-key trust hierarchy for verifying devices and users. Master key signs self-signing and user-signing keys. All uploads are cryptographically validated befo",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "e2e, cross-signing, verification, trust, keys, identity, security"
}
</script>
