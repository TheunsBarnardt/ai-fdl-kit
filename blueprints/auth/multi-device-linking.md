<!-- AUTO-GENERATED FROM multi-device-linking.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Multi Device Linking

> Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the account identity

**Category:** Auth · **Version:** 1.0.0 · **Tags:** devices · provisioning · multi-device · linking · pre-keys

## What this does

Provisioning and management of linked devices on an existing account, allowing a user to register up to a configured maximum of secondary devices that share the account identity

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **device_id** *(number, required)* — Device ID
- **device_name** *(token, optional)* — Device Name
- **linking_token** *(token, required)* — Linking Token
- **provisioning_address** *(text, required)* — Provisioning Address
- **aci_signed_pre_key** *(json, required)* — ACI Signed Pre-Key
- **pni_signed_pre_key** *(json, required)* — PNI Signed Pre-Key
- **aci_pq_last_resort_key** *(json, required)* — ACI Post-Quantum Last-Resort Key
- **pni_pq_last_resort_key** *(json, required)* — PNI Post-Quantum Last-Resort Key
- **registration_id** *(number, required)* — Registration ID
- **pni_registration_id** *(number, required)* — PNI Registration ID
- **capabilities** *(json, required)* — Device Capabilities
- **fetches_messages** *(boolean, required)* — Fetches Messages
- **push_token** *(text, optional)* — Push Token

## What must be true

- **linking_flow:** Only the primary device (device ID 1) may initiate device linking by generating a signed linking token, The linking token is single-use; attempting to reuse it must return 403 Forbidden, A new device must submit the linking token, its cryptographic keys, and its capabilities atomically; the server accepts or rejects the entire request, The primary device listens for linking completion events and may time out if the new device does not complete registration within the waiting period
- **key_validation:** Pre-key signatures must be verified against the account's existing identity keys before the device is added; a signature failure returns 422, The new device must declare a valid set of capabilities; capabilities required for new devices are enforced and requests without them are rejected with 422, All linked devices inherit the account's identity keys; each device maintains its own pre-key bundles and registration identifiers, Capability downgrades are prevented — if the account already has a capability that requires all devices to support it, a new device without that capability cannot be linked
- **device_management:** Linking a new device when the account has already reached its maximum device count returns 411 Device Limit Exceeded, A device may only remove itself or, in the case of the primary device, any linked device; a linked device cannot remove another linked device, The primary device cannot be deleted via the device removal endpoint, Device names are stored encrypted; the server cannot read them

## Success & failure scenarios

**✅ Success paths**

- **Linking Token Generated** — when primary device is authenticated; account has not reached its maximum linked device count, then A signed linking token is returned to the primary device for inclusion in a provisioning message.
- **Provisioning Message Sent** — when primary device has a valid linking token; new device is listening on a provisioning WebSocket address, then Encrypted provisioning message is delivered to the new device via its temporary WebSocket connection.
- **Device Removed** — when authenticated device requests removal of a device ID; requesting device is the primary device or is removing itself; target device ID is not the primary device ID, then Device record and associated keys are deleted; remaining devices receive a sync notification.
- **Device Linked** — when new device submits valid linking token, pre-keys, registration IDs, and capabilities; account is below its device limit, then Device is added to the account; account and phone-number identity identifiers are returned alongside the assigned device ID.

**❌ Failure paths**

- **Device Limit Exceeded** — when primary device requests a linking token; account device count is at or above the configured maximum, then HTTP 411 is returned; no token is issued until an existing linked device is removed. *(error: `DEVICE_LIMIT_EXCEEDED`)*
- **Provisioning Address Not Found** — when primary device sends provisioning message; no WebSocket subscriber is listening at the given provisioning address, then HTTP 404 is returned; the new device must re-initiate the linking flow and display a new QR code. *(error: `DEVICE_PROVISIONING_ADDRESS_NOT_FOUND`)*
- **Token Already Used** — when new device submits a linking token that has already been consumed, then HTTP 403 is returned; the primary device must generate a new token and restart the linking flow. *(error: `DEVICE_TOKEN_ALREADY_USED`)*
- **Invalid Prekeys** — when new device submits link request; any signed pre-key or post-quantum last-resort key signature fails verification, then HTTP 422 is returned; the device is not added and must regenerate its keys before retrying. *(error: `DEVICE_INVALID_PREKEY_SIGNATURE`)*
- **Capability Downgrade** — when new device submits link request; device capabilities would downgrade a capability that requires all devices to support it, then HTTP 409 is returned; the new device must update its software to support all required capabilities. *(error: `DEVICE_CAPABILITY_DOWNGRADE`)*
- **Missing Capabilities** — when new device submits link request; the capabilities field is absent or does not include all required capabilities, then HTTP 422 is returned; capabilities are mandatory for new devices. *(error: `DEVICE_MISSING_CAPABILITIES`)*

## Errors it can return

- `DEVICE_LIMIT_EXCEEDED` — Maximum number of linked devices reached; remove an existing device before adding a new one
- `DEVICE_PROVISIONING_ADDRESS_NOT_FOUND` — The new device is no longer reachable; scan the QR code again to restart the linking process
- `DEVICE_INVALID_PREKEY_SIGNATURE` — Device key signature verification failed; regenerate keys and retry
- `DEVICE_CAPABILITY_DOWNGRADE` — Device does not support a capability required by this account; update the app and retry
- `DEVICE_MISSING_CAPABILITIES` — Device capability declaration is missing or incomplete
- `DEVICE_TOKEN_ALREADY_USED` — Linking token has already been used; the primary device must generate a new token

## Events

**`device.linking_token_issued`** — Primary device generated a signed linking token to begin the device provisioning flow
  Payload: `account_id`, `expires_at`

**`device.provisioning_sent`** — Encrypted provisioning message was delivered to the new device's temporary WebSocket address
  Payload: `provisioning_address`

**`device.provisioning_failed`** — Provisioning message delivery failed because no subscriber was connected at the target address
  Payload: `provisioning_address`

**`device.linked`** — A new device was successfully linked to the account
  Payload: `account_id`, `device_id`

**`device.removed`** — A linked device was removed from the account
  Payload: `account_id`, `device_id`, `removed_by`

**`device.link_failed`** — A device linking attempt failed due to invalid keys, capabilities, or a used token
  Payload: `account_id`, `reason`

**`device.limit_exceeded`** — A linking token request was rejected because the account is at its device limit
  Payload: `account_id`, `current_count`, `max_count`

## Connects to

- **phone-number-registration** *(required)* — An account must exist with a primary device before additional devices can be linked
- **e2e-key-exchange** *(required)* — Each linked device uploads its own pre-key bundles during linking; senders fetch per-device keys to establish independent encrypted sessions
- **safety-number-verification** *(recommended)* — All devices on an account share the same identity key; safety number verification confirms the key has not changed after linking
- **sealed-sender-delivery** *(recommended)* — Messages are delivered independently to each linked device over the sealed-sender path

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/multi-device-linking/) · **Spec source:** [`multi-device-linking.blueprint.yaml`](./multi-device-linking.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
