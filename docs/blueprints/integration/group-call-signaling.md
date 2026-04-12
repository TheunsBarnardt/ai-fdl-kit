---
title: "Group Call Signaling Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication. 5 fields. 5 outcomes. 3 erro"
---

# Group Call Signaling Blueprint

> Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication

| | |
|---|---|
| **Feature** | `group-call-signaling` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | calling, group-call, zero-knowledge, call-link, turn, webrtc, privacy |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/group-call-signaling.blueprint.yaml) |
| **JSON API** | [group-call-signaling.json]({{ site.baseurl }}/api/blueprints/integration/group-call-signaling.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `create_call_link_credential_request` | token | Yes | Create Call Link Credential Request |  |
| `call_link_credential` | token | Yes | Call Link Credential |  |
| `redemption_time` | number | Yes | Redemption Time |  |
| `call_link_auth_credential` | token | Yes | Call Link Auth Credential |  |
| `account_identifier` | token | Yes | Account Identifier |  |

## Rules

- **access_control:**
  - **authenticated_only:** true
  - **note:** Only authenticated accounts may request call-link creation credentials
- **rate_limiting:**
  - **scope:** per_account
  - **note:** Per-account rate limiting is enforced on the call-link credential endpoint
- **server_blind:**
  - **note:** The server issues a ZK credential over the requesting account ACI and the day-truncated current timestamp combined with the client-supplied room ID commitment; the server learns only the account identity, never the room ID or call participants
- **credential_validity:**
  - **granularity:** calendar_day_utc
  - **note:** Credentials are valid for the current calendar day only; the timestamp is truncated to midnight UTC; clients must request a fresh credential each day
  - **deterministic:** true
  - **note2:** The credential is computed deterministically from the truncated day timestamp so multiple requests on the same day produce equivalent credentials
- **credential_batch:**
  - **note:** Call-link authentication credentials are issued in the same batch as group authentication credentials but may also be used independently for call-link room access
- **room_service_responsibility:**
  - **note:** The room service (separate from the messaging server) is responsible for enforcing call-link membership, capacity limits, and expiry; the messaging server only issues credentials

## Outcomes

### Rate_limited (Priority: 1) — Error: `CALL_LINK_RATE_LIMITED`

**Given:**
- Caller is authenticated
- Call-link creation rate limit is exceeded for this account

**Then:**
- **emit_event** event: `call_link.rate_limited`

**Result:** Request rejected with rate-limit error

### Unauthenticated (Priority: 2) — Error: `CALL_LINK_UNAUTHORIZED`

**Given:**
- Caller is not authenticated

**Result:** Request rejected as unauthorized

### Invalid_credential_request (Priority: 3) — Error: `CALL_LINK_INVALID_REQUEST`

**Given:**
- Caller is authenticated and within rate limit
- `create_call_link_credential_request` (input) exists
- Credential request blob is malformed or cannot be parsed as a valid ZK request

**Result:** Request rejected with bad-request error

### Credential_issued (Priority: 4)

**Given:**
- Caller is authenticated and within rate limit
- `create_call_link_credential_request` (input) exists
- Credential request blob is a valid ZK request

**Then:**
- **emit_event** event: `call_link.credential_issued`

**Result:** ZK call-link creation credential and the truncated-day redemption timestamp returned to the client

### Call_link_auth_batch_issued (Priority: 5)

**Given:**
- Caller is authenticated
- Valid day-aligned redemption range provided within the allowed 7-day window

**Then:**
- **emit_event** event: `call_link.auth_batch_issued`

**Result:** Array of daily call-link auth credentials returned, one per day in the requested range

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CALL_LINK_RATE_LIMITED` | 429 | Too many call-link credential requests. Please wait before trying again. | Yes |
| `CALL_LINK_UNAUTHORIZED` | 401 | Authentication required to create call links. | No |
| `CALL_LINK_INVALID_REQUEST` | 400 | Invalid call-link credential request. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `call_link.credential_issued` | A ZK call-link creation credential was issued for the requesting account | `account_id`, `redemption_time` |
| `call_link.auth_batch_issued` | A batch of daily call-link authentication credentials was issued alongside group auth credentials | `account_id`, `redemption_start`, `redemption_end` |
| `call_link.rate_limited` | A call-link credential request was rejected due to per-account rate limiting | `account_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| encrypted-group-metadata | required | Call-link authentication credentials are co-issued with group authentication credentials and share the same ZK server secret parameters |
| voip-call-signaling | recommended | Group calls use the same TURN relay infrastructure as 1:1 calls; TURN credentials may be fetched before joining a call-link room |
| login | required | Call-link credential issuance requires a valid authenticated device session |
| device-management | required | The requesting account must have a valid registered device |

## AGI Readiness

### Goals

#### Reliable Group Call Signaling

Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `encrypted_group_metadata` | encrypted-group-metadata | degrade |
| `login` | login | degrade |
| `device_management` | device-management | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| unauthenticated | `autonomous` | - | - |
| invalid_credential_request | `autonomous` | - | - |
| credential_issued | `autonomous` | - | - |
| call_link_auth_batch_issued | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Group Call Signaling Blueprint",
  "description": "Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication. 5 fields. 5 outcomes. 3 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "calling, group-call, zero-knowledge, call-link, turn, webrtc, privacy"
}
</script>
