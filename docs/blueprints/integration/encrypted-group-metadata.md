---
title: "Encrypted Group Metadata Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send auth"
---

# Encrypted Group Metadata Blueprint

> Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send authorization

| | |
|---|---|
| **Feature** | `encrypted-group-metadata` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | encryption, zero-knowledge, groups, privacy, credentials, server-blind |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/encrypted-group-metadata.blueprint.yaml) |
| **JSON API** | [encrypted-group-metadata.json]({{ site.baseurl }}/api/blueprints/integration/encrypted-group-metadata.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `group_auth_credential` | token | Yes | Group Auth Credential |  |
| `call_link_auth_credential` | token | Yes | Call Link Auth Credential |  |
| `redemption_time` | number | Yes | Redemption Time |  |
| `redemption_start` | number | Yes | Redemption Window Start |  |
| `redemption_end` | number | Yes | Redemption Window End |  |
| `pni` | token | No | Phone Number Identity |  |
| `group_send_token` | token | No | Group Send Token |  |

## Rules

- **server_blind:**
  - **note:** The messaging server never stores group membership lists, group titles, group avatars, or any group metadata in plaintext; all such data is held by a separate group-management service as opaque client-encrypted blobs
- **credential_issuance:**
  - **batch:** true
  - **max_window_days:** 7
  - **alignment:** day
  - **min_start:** yesterday
  - **max_end:** today_plus_8_days
  - **note:** Group authentication credentials are issued in daily batches for a client-specified window up to 7 days; clients cache credentials locally and present the day-matched credential at redemption
- **identity_linking:**
  - **note:** Credentials incorporate both the ACI and PNI service identifiers so the group service can correlate identities for membership checks without the messaging server learning group structure
- **group_send:**
  - **verification:** zk_server_secret_params
  - **expiry:** embedded_in_token
  - **member_check:** all_recipients_must_be_in_token
  - **exclusive_with:** unidentified_access_key
  - **note:** Group send tokens allow senders to prove group membership without the server learning the group identity or sender membership
- **access_control:**
  - **authenticated_only:** true
  - **note:** Only authenticated accounts may request credential batches; credentials are bound to the requesting account's ACI

## Outcomes

### Credential_batch_issued (Priority: 1)

**Given:**
- Caller is authenticated
- `redemption_start` (input) exists
- `redemption_end` (input) exists
- redemption_start is day-aligned and not earlier than yesterday
- redemption_end is day-aligned and not later than today plus 8 days
- redemption_end is not earlier than redemption_start
- redemption_end is within 7 days of redemption_start

**Then:**
- **emit_event** event: `group_credentials.issued`

**Result:** Array of daily group-auth credentials and call-link auth credentials returned, one entry per day in the range, along with the account PNI

### Invalid_redemption_range (Priority: 2) — Error: `GROUP_CRED_INVALID_RANGE`

**Given:**
- Caller is authenticated
- ANY: redemption_start is before yesterday OR redemption_end is after today plus 8 days OR redemption_end is earlier than redemption_start OR range between redemption_start and redemption_end exceeds 7 days OR redemption_start or redemption_end is not day-aligned

**Result:** Request rejected with bad-request error

### Unauthenticated (Priority: 3) — Error: `GROUP_CRED_UNAUTHORIZED`

**Given:**
- Caller is not authenticated

**Result:** Request rejected as unauthorized

### Group_send_authorized (Priority: 4)

**Given:**
- `group_send_token` (request) exists
- Token cryptographic verification passes against current server ZK parameters
- Token has not expired
- All target service identifiers are listed in the token member set

**Then:**
- **emit_event** event: `group_send.authorized`

**Result:** Request authorized for message delivery or profile retrieval to the listed recipients

### Group_send_token_invalid (Priority: 5) — Error: `GROUP_SEND_TOKEN_INVALID`

**Given:**
- `group_send_token` (request) exists
- ANY: Token cryptographic verification fails OR Token has expired OR A target service identifier is not listed in the token member set

**Then:**
- **emit_event** event: `group_send.rejected`

**Result:** Request rejected as unauthorized

### Duplicate_auth_headers (Priority: 6) — Error: `GROUP_CRED_DUPLICATE_AUTH`

**Given:**
- `group_send_token` (request) exists
- Unidentified-access key header is also present in the same request

**Result:** Request rejected because both a group send token and unidentified-access key were supplied

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GROUP_CRED_UNAUTHORIZED` | 401 | Authentication required to request group credentials. | No |
| `GROUP_CRED_INVALID_RANGE` | 400 | Invalid redemption time range. Range must be day-aligned, start at yesterday or later, and span at most 7 days. | No |
| `GROUP_SEND_TOKEN_INVALID` | 401 | Group send token is invalid or has expired. | No |
| `GROUP_CRED_DUPLICATE_AUTH` | 400 | Provide either a group send token or an unidentified-access key, not both. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `group_credentials.issued` | A batch of daily group authentication and call-link authentication credentials was issued for an account | `account_id`, `redemption_start`, `redemption_end`, `credential_count` |
| `group_send.authorized` | A group send token was successfully verified, authorizing message delivery or profile access | `target_identifiers`, `token_expiry` |
| `group_send.rejected` | A group send token failed cryptographic verification or has expired | `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| encrypted-profile-storage | recommended | Group send tokens may authorize unversioned profile lookups for group members |
| login | required | Credential batch issuance requires account authentication |
| e2e-key-exchange | required | ZK credentials are derived from account identity keys managed by the key-exchange feature |
| group-call-signaling | recommended | Call-link auth credentials issued in this batch are consumed by the group-call-signaling feature |
| device-management | recommended | Credentials are bound to account identifiers; device sessions must be valid at issuance time |

## AGI Readiness

### Goals

#### Reliable Encrypted Group Metadata

Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send authorization

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
| `login` | login | degrade |
| `e2e_key_exchange` | e2e-key-exchange | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| credential_batch_issued | `autonomous` | - | - |
| invalid_redemption_range | `autonomous` | - | - |
| unauthenticated | `autonomous` | - | - |
| group_send_authorized | `autonomous` | - | - |
| group_send_token_invalid | `autonomous` | - | - |
| duplicate_auth_headers | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Encrypted Group Metadata Blueprint",
  "description": "Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send auth",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "encryption, zero-knowledge, groups, privacy, credentials, server-blind"
}
</script>
