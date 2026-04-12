---
title: "Identity Lookup Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Bridge between user contact details (email, phone) and messaging identities via external identity servers. Enables invitations before account creation and conta"
---

# Identity Lookup Blueprint

> Bridge between user contact details (email, phone) and messaging identities via external identity servers. Enables invitations before account creation and contact binding.

| | |
|---|---|
| **Feature** | `identity-lookup` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | identity, 3pid, email, phone, lookup, binding, verification |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/identity-lookup.blueprint.yaml) |
| **JSON API** | [identity-lookup.json]({{ site.baseurl }}/api/blueprints/auth/identity-lookup.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Account owner binding or looking up an identity |
| `homeserver` | Homeserver | system | Server proxying identity requests and enforcing rate limits |
| `identity_server` | Identity Server | external | External service storing bindings between contact details and account identifiers |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `medium` | select | Yes | Type of third-party identifier |  |
| `address` | text | Yes | The email address or phone number being looked up or bound |  |
| `user_id` | text | No | The messaging account identifier to bind to the address |  |
| `client_secret` | token | Yes | Client-generated secret that links validation steps in a session |  |
| `session_id` | token | No | Server-assigned identifier for the validation session |  |
| `id_server` | url | Yes | Domain of the identity server handling this request |  |
| `validated_at` | datetime | No | Timestamp when the identity server confirmed the address ownership |  |

## Rules

- **access:** Identity server addresses must use the HTTPS scheme; HTTP is not permitted, Validation token requests are rate-limited per IP address and per third-party address, The client_secret must be present in all requests that continue a validation session, Third-party lookup can be disabled server-wide via configuration, Binding a third-party identifier to an account requires a successfully validated session
- **validation:** Validation sessions have a time limit enforced by the identity server, Identity server responses must include the medium field to be considered successful

## Outcomes

### Validation_token_sent (Priority: 1)

**Given:**
- third-party lookup is enabled on the server
- request is not rate-limited by IP or address
- id_server uses HTTPS scheme
- client_secret is provided

**Then:**
- **emit_event** event: `identity.validation_requested`

**Result:** Validation message sent to the address; user must confirm receipt

### Validation_completed (Priority: 2)

**Given:**
- user has confirmed the validation token
- session_id and client_secret match the pending session

**Then:**
- **create_record** target: `identity_store` — Validated third-party identifier recorded with timestamp
- **emit_event** event: `identity.validated`

**Result:** Identity server confirms ownership; address may now be bound to an account

### Address_bound (Priority: 3)

**Given:**
- validation session is complete
- user is authenticated

**Then:**
- **create_record** target: `identity_server` — Binding between address and account identifier stored on identity server
- **emit_event** event: `identity.bound`

**Result:** Other users can invite this user by their email or phone number

### Address_lookup (Priority: 4)

**Given:**
- requester is authenticated
- lookup is enabled on the server
- id_server is reachable

**Then:**
- **emit_event** event: `identity.looked_up`

**Result:** User ID associated with the address returned to requester

### Rate_limited (Priority: 5) — Error: `IDENTITY_RATE_LIMITED`

**Given:**
- ANY: IP address has exceeded validation token request rate OR address has exceeded validation token request rate

**Result:** Request rejected until rate limit window resets

### Identity_server_unreachable (Priority: 6) — Error: `IDENTITY_SERVER_UNREACHABLE`

**Given:**
- identity server does not respond within the timeout period

**Result:** Operation fails; user should retry later

### Lookup_disabled (Priority: 7) — Error: `IDENTITY_LOOKUP_DISABLED`

**Given:**
- third-party lookup is disabled in server configuration

**Result:** Request rejected with configuration error

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IDENTITY_RATE_LIMITED` | 429 | Too many identity requests. Please wait before trying again. | No |
| `IDENTITY_SERVER_UNREACHABLE` | 500 | Could not contact the identity server. Please try again later. | No |
| `IDENTITY_LOOKUP_DISABLED` | 403 | Third-party identifier lookup is not enabled on this server | No |
| `IDENTITY_SERVER_INVALID` | 400 | Identity server address is invalid or uses an unsupported scheme | No |
| `IDENTITY_SESSION_INVALID` | 400 | The validation session could not be found or the client secret is incorrect | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `identity.validation_requested` | A validation token was requested for a third-party address | `medium`, `address`, `session_id` |
| `identity.validated` | The user confirmed ownership of the third-party address | `medium`, `address`, `validated_at` |
| `identity.bound` | A third-party address was bound to an account identifier | `user_id`, `medium`, `address` |
| `identity.looked_up` | A third-party address was resolved to an account identifier | `medium`, `address`, `resolved_user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-invitations | recommended | Third-party invites use identity lookup to invite users by email or phone |
| push-notification-gateway | recommended | Email pushers verify their pushkey against the user's bound identities |

## AGI Readiness

### Goals

#### Reliable Identity Lookup

Bridge between user contact details (email, phone) and messaging identities via external identity servers. Enables invitations before account creation and contact binding.

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| validation_token_sent | `autonomous` | - | - |
| validation_completed | `autonomous` | - | - |
| address_bound | `autonomous` | - | - |
| address_lookup | `autonomous` | - | - |
| rate_limited | `autonomous` | - | - |
| identity_server_unreachable | `autonomous` | - | - |
| lookup_disabled | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 5
  entry_points:
    - synapse/handlers/identity.py
    - synapse/http/client.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Identity Lookup Blueprint",
  "description": "Bridge between user contact details (email, phone) and messaging identities via external identity servers. Enables invitations before account creation and conta",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "identity, 3pid, email, phone, lookup, binding, verification"
}
</script>
