---
title: "Room Aliases Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution."
---

# Room Aliases Blueprint

> Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution.

| | |
|---|---|
| **Feature** | `room-aliases` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | alias, directory, addressing, discovery, room, federation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/room-aliases.blueprint.yaml) |
| **JSON API** | [room-aliases.json]({{ site.baseurl }}/api/blueprints/integration/room-aliases.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `room_member` | Room Member | human | Authenticated user who is a member of the target room |
| `server_admin` | Server Administrator | human | Administrator who can manage aliases without room membership |
| `bridge_service` | Bridge or Application Service | system | Registered service managing aliases within its declared namespace |
| `homeserver` | Homeserver | system | Server resolving and storing alias mappings |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `alias` | text | Yes | Full alias in #localpart:server format; localpart alphanumeric, no whitespace or colons, max 255 chars | Validations: maxLength |
| `room_id` | token | Yes | The room this alias resolves to |  |
| `servers` | json | No | List of server names hosting members of the room (returned with lookup results) |  |
| `creator_id` | text | No | User who created the alias |  |

## Rules

- **format:** Alias localparts must contain no whitespace and no colon characters, The full alias including server name must not exceed 255 characters, The alias domain must match the local server; cross-server alias creation is not permitted
- **access:** A user must be a member of the target room to create an alias, unless they are a server administrator, Application services may only create aliases within their declared exclusive namespace, Alias deletion requires room administrator power level in the target room, An existing alias cannot be modified; it must be deleted and recreated, Server administrators bypass room membership requirements for all alias operations
- **federation:** Spam-checker module callbacks may reject alias creation with a custom error code, Federated alias lookups contact the alias home server if the alias is not local

## Outcomes

### Alias_created (Priority: 1)

**Given:**
- alias localpart contains no whitespace or colons
- alias total length does not exceed 255 characters
- ANY: requester is a member of the target room OR requester is a server administrator

**Then:**
- **create_record** target: `directory` — Alias-to-room mapping stored with associated server list
- **emit_event** event: `alias.created`

**Result:** Alias is resolvable and can be shared as a room address

### Alias_created_by_service (Priority: 2)

**Given:**
- requester is a registered application service
- alias falls within the service's declared namespace

**Then:**
- **create_record** target: `directory` — Alias stored with service as creator
- **emit_event** event: `alias.created`

**Result:** Service-managed alias is available for routing

### Alias_deleted (Priority: 3)

**Given:**
- requester has room administrator power level in the target room
- alias exists and is local

**Then:**
- **delete_record** target: `directory` — Alias mapping removed from directory
- **emit_event** event: `alias.deleted`

**Result:** Alias no longer resolves; room remains accessible by room ID

### Alias_resolved_locally (Priority: 4)

**Given:**
- alias domain matches local server
- alias exists in local directory

**Then:**
- **emit_event** event: `alias.resolved`

**Result:** Room ID and server list returned to requester

### Alias_resolved_via_federation (Priority: 5)

**Given:**
- alias domain belongs to a remote server
- remote server is reachable

**Then:**
- **emit_event** event: `alias.resolved`

**Result:** Remote alias resolved and returned to requester

### Alias_creation_rejected_format (Priority: 6) — Error: `ALIAS_INVALID_FORMAT`

**Given:**
- ANY: alias localpart contains whitespace OR alias localpart contains a colon OR alias total length exceeds 255 characters

**Result:** Alias creation rejected with format error

### Alias_creation_rejected_membership (Priority: 7) — Error: `ALIAS_MEMBERSHIP_REQUIRED`

**Given:**
- requester is not a member of the target room
- requester is not a server administrator

**Result:** Alias creation rejected; user must join room first

### Alias_creation_rejected_namespace (Priority: 8) — Error: `ALIAS_NAMESPACE_CONFLICT`

**Given:**
- alias falls within an application service's exclusive namespace
- requester is not that application service

**Result:** Alias creation rejected; namespace reserved by a registered service

### Alias_resolution_failed (Priority: 9) — Error: `ALIAS_NOT_FOUND`

**Given:**
- alias does not exist locally
- ANY: alias domain is local OR remote server is unreachable

**Result:** Alias lookup returns not found

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ALIAS_INVALID_FORMAT` | 400 | Room alias contains invalid characters or exceeds maximum length | No |
| `ALIAS_MEMBERSHIP_REQUIRED` | 403 | You must be in the room to create an alias for it | No |
| `ALIAS_NAMESPACE_CONFLICT` | 403 | This alias is reserved by a registered application service | No |
| `ALIAS_NOT_FOUND` | 404 | Room alias not found | No |
| `ALIAS_DELETE_PERMISSION_DENIED` | 403 | You do not have permission to delete this alias | No |
| `ALIAS_FEDERATION_FAILED` | 503 | Could not retrieve alias from remote server | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alias.created` | A new alias has been mapped to a room | `alias`, `room_id`, `creator_id` |
| `alias.deleted` | An alias mapping has been removed | `alias`, `room_id` |
| `alias.resolved` | An alias lookup returned a room ID and server list | `alias`, `room_id`, `servers` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-lifecycle | required | Aliases are created for existing rooms |
| room-power-levels | required | Alias deletion requires room administrator power level |
| server-federation | recommended | Remote alias resolution uses federation directory queries |
| application-services | optional | Application services enforce exclusive alias namespace reservations |

## AGI Readiness

### Goals

#### Reliable Room Aliases

Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution.

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

**Human Checkpoints:**

- before modifying sensitive data fields
- before permanently deleting records

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

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_lifecycle` | room-lifecycle | degrade |
| `room_power_levels` | room-power-levels | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| alias_created | `supervised` | - | - |
| alias_created_by_service | `supervised` | - | - |
| alias_deleted | `human_required` | - | - |
| alias_resolved_locally | `autonomous` | - | - |
| alias_resolved_via_federation | `autonomous` | - | - |
| alias_creation_rejected_format | `supervised` | - | - |
| alias_creation_rejected_membership | `supervised` | - | - |
| alias_creation_rejected_namespace | `supervised` | - | - |
| alias_resolution_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 6
  entry_points:
    - synapse/handlers/directory.py
    - synapse/appservice/__init__.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Room Aliases Blueprint",
  "description": "Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "alias, directory, addressing, discovery, room, federation"
}
</script>
