---
title: "Room Lifecycle Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Manage creation of communication rooms with configurable presets and version upgrades that atomically migrate members and state while tombstoning the old room.."
---

# Room Lifecycle Blueprint

> Manage creation of communication rooms with configurable presets and version upgrades that atomically migrate members and state while tombstoning the old room.

| | |
|---|---|
| **Feature** | `room-lifecycle` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | room, creation, lifecycle, upgrade, messaging, collaboration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/room-lifecycle.blueprint.yaml) |
| **JSON API** | [room-lifecycle.json]({{ site.baseurl }}/api/blueprints/integration/room-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `creator` | Room Creator | human | User who initiates room creation or upgrade |
| `system` | Homeserver | system | Server that persists events and manages room state |
| `member` | Room Member | human | Existing member migrated during a room upgrade |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `room_id` | token | Yes | Globally unique identifier assigned at creation |  |
| `room_creator_id` | text | Yes | User identifier of the creator; receives highest power level |  |
| `room_version` | text | Yes | Version string determining auth rules and state resolution algorithm |  |
| `preset` | select | No | Template that sets default join rules, history visibility, and guest access |  |
| `is_public` | boolean | No | Whether the room appears in the public room directory |  |
| `initial_state` | json | No | Additional state events to apply immediately after creation |  |
| `creation_content` | json | No | Custom fields merged into the creation event content |  |
| `power_level_content_override` | json | No | Custom power level assignments overriding preset defaults |  |

## States

**State field:** `room_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `upgrading` |  |  |
| `tombstoned` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `upgrading` | creator |  |
|  | `upgrading` | `active` | system |  |
|  | `active` | `tombstoned` | system |  |

## Rules

- **creation:** Creator automatically receives power level 100 and is the sole initial member, Presets define default join rules, history visibility, and whether guests can join, Power levels may be overridden by the creator at creation time, Encryption can be enabled by default based on server policy for certain presets, Room identifiers are unique; collisions trigger a retry with a new identifier
- **upgrade:** Only one upgrade per room may be in progress concurrently, Upgrade must copy all relevant state events to the new room before tombstoning the old room, After upgrade, local members are auto-joined and remote members are invited to the new room, Up to five retries are attempted if a state conflict occurs during upgrade

## Outcomes

### Room_created (Priority: 1)

**Given:**
- requester is authenticated
- requester has not exceeded room creation rate limit

**Then:**
- **create_record** target: `room` — Room record and genesis event sequence persisted
- **emit_event** event: `room.created`

**Result:** Room is ready for members to join and exchange messages

### Room_created_with_encryption (Priority: 2)

**Given:**
- requester is authenticated
- preset or server policy requires encryption

**Then:**
- **create_record** target: `room` — Room created with encryption state event included
- **emit_event** event: `room.created`

**Result:** Room is created with end-to-end encryption enabled from the first message

### Room_upgrade_success (Priority: 3)

**Given:**
- creator has room admin power level
- no concurrent upgrade is already in progress
- target room version is supported

**Then:**
- **create_record** target: `room` — New room created with state cloned from old room
- **transition_state** field: `room_status` from: `upgrading` to: `tombstoned` — Tombstone event written to old room
- **emit_event** event: `room.upgraded`

**Result:** Members are migrated to the new room; old room is archived

### Room_upgrade_failed (Priority: 4) — Error: `ROOM_UPGRADE_FAILED`

**Given:**
- ANY: creator lacks admin power level OR concurrent upgrade already in progress OR target room version is unsupported OR maximum retries exceeded

**Then:**
- **emit_event** event: `room.upgrade.failed`

**Result:** Upgrade aborted; original room remains active

### Rate_limited (Priority: 5) — Error: `ROOM_CREATION_RATE_LIMITED`

**Given:**
- creator has exceeded the room creation rate limit

**Result:** Room creation rejected until rate limit window resets

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ROOM_UPGRADE_IN_PROGRESS` | 400 | An upgrade for this room is currently in progress | No |
| `ROOM_UPGRADE_FAILED` | 500 | Room upgrade could not be completed | No |
| `ROOM_CREATION_RATE_LIMITED` | 429 | You have created too many rooms recently. Please wait before creating another. | No |
| `ROOM_VERSION_UNSUPPORTED` | 400 | The requested room version is not supported by this server | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `room.created` | A new room has been initialised and is ready for use | `room_id`, `creator_id`, `preset`, `room_version` |
| `room.upgraded` | Room has been successfully migrated to a new version | `old_room_id`, `new_room_id`, `new_version` |
| `room.upgrade.failed` | Room upgrade could not complete after all retries | `room_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-power-levels | required | Power levels are established in the initial room state at creation |
| room-state-history | required | State events are the mechanism for all room configuration |
| server-federation | recommended | Federation senders are initialised for federated rooms on creation |
| room-invitations | recommended | Room upgrade invites remote members to the new room |
| e2e-key-exchange | optional | Encryption state event may be included at creation time |

## AGI Readiness

### Goals

#### Reliable Room Lifecycle

Manage creation of communication rooms with configurable presets and version upgrades that atomically migrate members and state while tombstoning the old room.

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
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_power_levels` | room-power-levels | degrade |
| `room_state_history` | room-state-history | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| room_created | `supervised` | - | - |
| room_created_with_encryption | `supervised` | - | - |
| room_upgrade_success | `autonomous` | - | - |
| room_upgrade_failed | `autonomous` | - | - |
| rate_limited | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 8
  entry_points:
    - synapse/handlers/room.py
    - synapse/handlers/event_creation.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Room Lifecycle Blueprint",
  "description": "Manage creation of communication rooms with configurable presets and version upgrades that atomically migrate members and state while tombstoning the old room..",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "room, creation, lifecycle, upgrade, messaging, collaboration"
}
</script>
