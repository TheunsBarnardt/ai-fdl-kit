---
title: "Sealed Sender Delivery Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens. 8 fields. "
---

# Sealed Sender Delivery Blueprint

> Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens

| | |
|---|---|
| **Feature** | `sealed-sender-delivery` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | messaging, privacy, end-to-end-encryption, anonymous-delivery, group-messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/sealed-sender-delivery.blueprint.yaml) |
| **JSON API** | [sealed-sender-delivery.json]({{ site.baseurl }}/api/blueprints/auth/sealed-sender-delivery.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `unidentified_access_key` | token | No | Unidentified Access Key |  |
| `group_send_token` | token | No | Group Send Token |  |
| `destination_identifier` | text | Yes | Destination Identifier |  |
| `message_payloads` | json | Yes | Message Payloads |  |
| `unrestricted_unidentified_access` | boolean | No | Unrestricted Unidentified Access |  |
| `timestamp` | number | Yes | Timestamp |  |
| `online` | boolean | No | Online Only |  |
| `urgent` | boolean | No | Urgent |  |

## Rules

- **authentication:** Exactly one authentication mechanism must be provided per request — either an unidentified access key or a group send endorsement token, never both, An unidentified access key must match the 16-byte key stored on the recipient account using a constant-time comparison to prevent timing attacks, Combined unidentified access keys for multi-recipient delivery are derived by XOR-ing each recipient's individual key; recipients with unrestricted access are excluded from the XOR, Group send endorsement tokens must be cryptographically verified against the set of recipient service identifiers and a server-held expiry key before delivery proceeds, An expired or invalid group send endorsement token must be rejected with a 401 response
- **delivery:** Story messages bypass access key authentication; group send endorsement tokens must not accompany story sends, When the recipient account does not exist the server must return 404 for single-recipient sends, Multi-recipient sends with a group send endorsement token may tolerate unknown recipients, returning their identifiers in the response; single-access-key multi-recipient sends must fail if any recipient cannot be resolved, The sender's identity is never recorded, logged, or stored by the server in sealed-sender delivery paths, Rate limiting is applied to the recipient account identifier to prevent abuse without identifying the sender

## Outcomes

### Missing_auth (Priority: 1) — Error: `SEALED_SENDER_MISSING_AUTH`

**Given:**
- `unidentified_access_key` (request) not_exists
- `group_send_token` (request) not_exists

**Then:**
- **emit_event** event: `sealed_sender.rejected`

**Result:** Request is rejected with HTTP 401 Unauthorized

### Conflicting_auth (Priority: 2) — Error: `SEALED_SENDER_CONFLICTING_AUTH`

**Given:**
- `unidentified_access_key` (request) exists
- `group_send_token` (request) exists

**Then:**
- **emit_event** event: `sealed_sender.rejected`

**Result:** Request is rejected with HTTP 400 Bad Request; both tokens must not be provided simultaneously

### Invalid_group_send_token (Priority: 3) — Error: `SEALED_SENDER_INVALID_GROUP_TOKEN`

**Given:**
- `group_send_token` (request) exists
- group send token signature verification fails or token is expired

**Then:**
- **emit_event** event: `sealed_sender.rejected`

**Result:** Request is rejected with HTTP 401; sender is not enrolled in the group or the token has expired

### Access_key_mismatch (Priority: 4) — Error: `SEALED_SENDER_ACCESS_DENIED`

**Given:**
- `unidentified_access_key` (request) exists
- recipient account has a stored access key and the presented key does not match

**Then:**
- **emit_event** event: `sealed_sender.rejected`

**Result:** Request is rejected with HTTP 401; the caller cannot prove permission to send to this recipient

### Recipient_not_found (Priority: 5) — Error: `SEALED_SENDER_RECIPIENT_NOT_FOUND`

**Given:**
- destination account does not exist in the system
- request is a single-recipient send

**Then:**
- **emit_event** event: `sealed_sender.rejected`

**Result:** Request is rejected with HTTP 404; recipient unknown

### Rate_limited (Priority: 6) — Error: `SEALED_SENDER_RATE_LIMITED`

**Given:**
- per-recipient delivery rate limit is exceeded

**Then:**
- **emit_event** event: `sealed_sender.rate_limited`

**Result:** Request is rejected with HTTP 429 and a Retry-After header

### Delivered_single_recipient (Priority: 10)

**Given:**
- exactly one authentication mechanism is present and passes verification
- destination account exists

**Then:**
- **create_record** target: `message_queue`
- **emit_event** event: `sealed_sender.delivered`

**Result:** Encrypted payloads are enqueued for all registered recipient devices; HTTP 200 is returned with a sync flag

### Delivered_multi_recipient (Priority: 11)

**Given:**
- exactly one authentication mechanism is present and passes verification
- message targets multiple recipients via group send

**Then:**
- **create_record** target: `message_queue`
- **emit_event** event: `sealed_sender.multi_delivered`

**Result:** Encrypted payloads are fanned out to all resolved recipient devices; unresolved recipient identifiers are returned in the HTTP 200 response body

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SEALED_SENDER_MISSING_AUTH` | 401 | Authentication required to deliver this message | No |
| `SEALED_SENDER_CONFLICTING_AUTH` | 400 | Provide either an access key or a group token, not both | No |
| `SEALED_SENDER_INVALID_GROUP_TOKEN` | 401 | Group send authorisation token is invalid or has expired | No |
| `SEALED_SENDER_ACCESS_DENIED` | 401 | Not authorised to deliver to this recipient | No |
| `SEALED_SENDER_RECIPIENT_NOT_FOUND` | 404 | Recipient not found | No |
| `SEALED_SENDER_RATE_LIMITED` | 429 | Too many messages sent to this recipient; please retry later | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sealed_sender.delivered` | A sealed-sender message was successfully enqueued for a single recipient | `destination_identifier`, `timestamp`, `device_count` |
| `sealed_sender.multi_delivered` | A sealed-sender multi-recipient message was fanned out to group members | `recipient_count`, `unresolved_recipients`, `timestamp` |
| `sealed_sender.rejected` | A sealed-sender delivery attempt was rejected due to failed authentication or a missing recipient | `destination_identifier`, `reason` |
| `sealed_sender.rate_limited` | A sealed-sender delivery attempt was rate-limited | `destination_identifier` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| e2e-key-exchange | required | Pre-key bundles and identity keys established by the key exchange feature are used to encrypt messages that travel over the sealed-sender path |
| phone-number-registration | required | Accounts must be registered and have an unidentified access key configured before sealed-sender delivery can be used |
| device-management | recommended | Messages are fanned out to all registered devices on the recipient account; device management determines which devices are present |
| multi-device-linking | recommended | Linked devices each receive a copy of sealed-sender messages independently |

## AGI Readiness

### Goals

#### Reliable Sealed Sender Delivery

Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens

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
| `phone_number_registration` | phone-number-registration | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| missing_auth | `autonomous` | - | - |
| conflicting_auth | `autonomous` | - | - |
| invalid_group_send_token | `autonomous` | - | - |
| access_key_mismatch | `autonomous` | - | - |
| recipient_not_found | `autonomous` | - | - |
| rate_limited | `autonomous` | - | - |
| delivered_single_recipient | `autonomous` | - | - |
| delivered_multi_recipient | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sealed Sender Delivery Blueprint",
  "description": "Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens. 8 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, privacy, end-to-end-encryption, anonymous-delivery, group-messaging"
}
</script>
