---
title: "Multi Device Linking Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the"
---

# Multi Device Linking Blueprint

> Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the account identity

| | |
|---|---|
| **Feature** | `multi-device-linking` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | devices, provisioning, multi-device, linking, pre-keys |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/multi-device-linking.blueprint.yaml) |
| **JSON API** | [multi-device-linking.json]({{ site.baseurl }}/api/blueprints/auth/multi-device-linking.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | number | Yes | Device ID |  |
| `device_name` | token | No | Device Name |  |
| `linking_token` | token | Yes | Linking Token |  |
| `provisioning_address` | text | Yes | Provisioning Address |  |
| `aci_signed_pre_key` | json | Yes | ACI Signed Pre-Key |  |
| `pni_signed_pre_key` | json | Yes | PNI Signed Pre-Key |  |
| `aci_pq_last_resort_key` | json | Yes | ACI Post-Quantum Last-Resort Key |  |
| `pni_pq_last_resort_key` | json | Yes | PNI Post-Quantum Last-Resort Key |  |
| `registration_id` | number | Yes | Registration ID |  |
| `pni_registration_id` | number | Yes | PNI Registration ID |  |
| `capabilities` | json | Yes | Device Capabilities |  |
| `fetches_messages` | boolean | Yes | Fetches Messages |  |
| `push_token` | text | No | Push Token |  |

## Rules

- **linking_flow:** Only the primary device (device ID 1) may initiate device linking by generating a signed linking token, The linking token is single-use; attempting to reuse it must return 403 Forbidden, A new device must submit the linking token, its cryptographic keys, and its capabilities atomically; the server accepts or rejects the entire request, The primary device listens for linking completion events and may time out if the new device does not complete registration within the waiting period
- **key_validation:** Pre-key signatures must be verified against the account's existing identity keys before the device is added; a signature failure returns 422, The new device must declare a valid set of capabilities; capabilities required for new devices are enforced and requests without them are rejected with 422, All linked devices inherit the account's identity keys; each device maintains its own pre-key bundles and registration identifiers, Capability downgrades are prevented — if the account already has a capability that requires all devices to support it, a new device without that capability cannot be linked
- **device_management:** Linking a new device when the account has already reached its maximum device count returns 411 Device Limit Exceeded, A device may only remove itself or, in the case of the primary device, any linked device; a linked device cannot remove another linked device, The primary device cannot be deleted via the device removal endpoint, Device names are stored encrypted; the server cannot read them

## Outcomes

### Device_limit_exceeded (Priority: 2) — Error: `DEVICE_LIMIT_EXCEEDED`

**Given:**
- primary device requests a linking token
- account device count is at or above the configured maximum

**Then:**
- **emit_event** event: `device.limit_exceeded`

**Result:** HTTP 411 is returned; no token is issued until an existing linked device is removed

### Provisioning_address_not_found (Priority: 3) — Error: `DEVICE_PROVISIONING_ADDRESS_NOT_FOUND`

**Given:**
- primary device sends provisioning message
- no WebSocket subscriber is listening at the given provisioning address

**Then:**
- **emit_event** event: `device.provisioning_failed`

**Result:** HTTP 404 is returned; the new device must re-initiate the linking flow and display a new QR code

### Token_already_used (Priority: 3) — Error: `DEVICE_TOKEN_ALREADY_USED`

**Given:**
- new device submits a linking token that has already been consumed

**Then:**
- **emit_event** event: `device.link_failed`

**Result:** HTTP 403 is returned; the primary device must generate a new token and restart the linking flow

### Invalid_prekeys (Priority: 4) — Error: `DEVICE_INVALID_PREKEY_SIGNATURE`

**Given:**
- new device submits link request
- any signed pre-key or post-quantum last-resort key signature fails verification

**Then:**
- **emit_event** event: `device.link_failed`

**Result:** HTTP 422 is returned; the device is not added and must regenerate its keys before retrying

### Capability_downgrade (Priority: 5) — Error: `DEVICE_CAPABILITY_DOWNGRADE`

**Given:**
- new device submits link request
- device capabilities would downgrade a capability that requires all devices to support it

**Then:**
- **emit_event** event: `device.link_failed`

**Result:** HTTP 409 is returned; the new device must update its software to support all required capabilities

### Missing_capabilities (Priority: 6) — Error: `DEVICE_MISSING_CAPABILITIES`

**Given:**
- new device submits link request
- the capabilities field is absent or does not include all required capabilities

**Then:**
- **emit_event** event: `device.link_failed`

**Result:** HTTP 422 is returned; capabilities are mandatory for new devices

### Linking_token_generated (Priority: 10)

**Given:**
- primary device is authenticated
- account has not reached its maximum linked device count

**Then:**
- **create_record** target: `device_linking_tokens`
- **emit_event** event: `device.linking_token_issued`

**Result:** A signed linking token is returned to the primary device for inclusion in a provisioning message

### Provisioning_message_sent (Priority: 10)

**Given:**
- primary device has a valid linking token
- new device is listening on a provisioning WebSocket address

**Then:**
- **create_record** target: `provisioning_queue`
- **emit_event** event: `device.provisioning_sent`

**Result:** Encrypted provisioning message is delivered to the new device via its temporary WebSocket connection

### Device_removed (Priority: 10)

**Given:**
- authenticated device requests removal of a device ID
- requesting device is the primary device or is removing itself
- target device ID is not the primary device ID

**Then:**
- **delete_record** target: `devices`
- **emit_event** event: `device.removed`

**Result:** Device record and associated keys are deleted; remaining devices receive a sync notification

### Device_linked (Priority: 20)

**Given:**
- new device submits valid linking token, pre-keys, registration IDs, and capabilities
- account is below its device limit

**Then:**
- **create_record** target: `devices`
- **create_record** target: `pre_key_store`
- **emit_event** event: `device.linked`

**Result:** Device is added to the account; account and phone-number identity identifiers are returned alongside the assigned device ID

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEVICE_LIMIT_EXCEEDED` | 409 | Maximum number of linked devices reached; remove an existing device before adding a new one | No |
| `DEVICE_PROVISIONING_ADDRESS_NOT_FOUND` | 404 | The new device is no longer reachable; scan the QR code again to restart the linking process | No |
| `DEVICE_INVALID_PREKEY_SIGNATURE` | 422 | Device key signature verification failed; regenerate keys and retry | No |
| `DEVICE_CAPABILITY_DOWNGRADE` | 409 | Device does not support a capability required by this account; update the app and retry | No |
| `DEVICE_MISSING_CAPABILITIES` | 422 | Device capability declaration is missing or incomplete | No |
| `DEVICE_TOKEN_ALREADY_USED` | 403 | Linking token has already been used; the primary device must generate a new token | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.linking_token_issued` | Primary device generated a signed linking token to begin the device provisioning flow | `account_id`, `expires_at` |
| `device.provisioning_sent` | Encrypted provisioning message was delivered to the new device's temporary WebSocket address | `provisioning_address` |
| `device.provisioning_failed` | Provisioning message delivery failed because no subscriber was connected at the target address | `provisioning_address` |
| `device.linked` | A new device was successfully linked to the account | `account_id`, `device_id` |
| `device.removed` | A linked device was removed from the account | `account_id`, `device_id`, `removed_by` |
| `device.link_failed` | A device linking attempt failed due to invalid keys, capabilities, or a used token | `account_id`, `reason` |
| `device.limit_exceeded` | A linking token request was rejected because the account is at its device limit | `account_id`, `current_count`, `max_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| phone-number-registration | required | An account must exist with a primary device before additional devices can be linked |
| e2e-key-exchange | required | Each linked device uploads its own pre-key bundles during linking; senders fetch per-device keys to establish independent encrypted sessions |
| safety-number-verification | recommended | All devices on an account share the same identity key; safety number verification confirms the key has not changed after linking |
| sealed-sender-delivery | recommended | Messages are delivered independently to each linked device over the sealed-sender path |

## AGI Readiness

### Goals

#### Reliable Multi Device Linking

Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the account identity

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
- before permanently deleting records

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
| `e2e_key_exchange` | e2e-key-exchange | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| linking_token_generated | `autonomous` | - | - |
| device_limit_exceeded | `autonomous` | - | - |
| provisioning_message_sent | `autonomous` | - | - |
| provisioning_address_not_found | `autonomous` | - | - |
| invalid_prekeys | `autonomous` | - | - |
| capability_downgrade | `autonomous` | - | - |
| missing_capabilities | `autonomous` | - | - |
| token_already_used | `autonomous` | - | - |
| device_linked | `autonomous` | - | - |
| device_removed | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Device Linking Blueprint",
  "description": "Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "devices, provisioning, multi-device, linking, pre-keys"
}
</script>
