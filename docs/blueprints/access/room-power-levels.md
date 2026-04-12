---
title: "Room Power Levels Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.. 9"
---

# Room Power Levels Blueprint

> Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.

| | |
|---|---|
| **Feature** | `room-power-levels` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | power-levels, permissions, authorization, moderation, roles, room |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/room-power-levels.blueprint.yaml) |
| **JSON API** | [room-power-levels.json]({{ site.baseurl }}/api/blueprints/access/room-power-levels.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `room_creator` | Room Creator | human | Initial owner with highest power level (100 by default) |
| `moderator` | Moderator | human | User with elevated power sufficient for membership management |
| `regular_user` | Regular User | human | User at default power level 0 |
| `homeserver` | Homeserver | system | Server enforcing power level checks on every event |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `users` | json | No | Map of user identifiers to their explicit power levels |  |
| `users_default` | number | No | Power level assigned to users not listed in the users map (default 0) |  |
| `events` | json | No | Map of event types to the minimum power level required to send them |  |
| `events_default` | number | No | Minimum power level required to send non-state events not listed in events (default 0) |  |
| `state_default` | number | No | Minimum power level required to send state events not listed in events (default 50) |  |
| `invite` | number | No | Minimum power level required to invite another user (default 0) |  |
| `kick` | number | No | Minimum power level required to forcibly remove a member (default 50) |  |
| `ban` | number | No | Minimum power level required to ban a user (default 50) |  |
| `redact` | number | No | Minimum power level required to redact another user's events (default 50) |  |

## Rules

- **defaults:** Room creator receives power level 100 and is the initial sole administrator, Each user's effective power level is their explicit value in the users map, or users_default if not listed
- **event_sending:** To send a non-state event a user's power level must meet or exceed events_default or the specific events entry, To send a state event a user's power level must meet or exceed state_default or the specific events entry
- **membership_actions:** To invite a user the actor's power level must meet or exceed the invite threshold, To kick the actor's power level must meet or exceed kick and must be strictly greater than the target's level, To ban or unban the actor's power level must meet or exceed ban and be strictly greater than the target's level, To redact another user's event the actor must meet the redact threshold
- **modification:** Power level changes require that the requesting user's level equals or exceeds every value they are modifying, A user cannot grant a power level higher than their own current level

## Outcomes

### Action_permitted (Priority: 1)

**Given:**
- user's effective power level meets the required threshold for the action
- for membership actions, user level is strictly greater than target level

**Then:**
- **emit_event** event: `room.action.permitted`

**Result:** Action proceeds; event is accepted and persisted

### Invite_permitted (Priority: 2)

**Given:**
- user's power level meets or exceeds the invite threshold
- target user is not already a member or banned

**Then:**
- **emit_event** event: `room.action.permitted`

**Result:** Invite event accepted and forwarded to target

### Kick_permitted (Priority: 3)

**Given:**
- user's power level meets or exceeds the kick threshold
- user's power level is strictly greater than the target's power level

**Then:**
- **emit_event** event: `room.action.permitted`

**Result:** Target user's membership changed to leave

### Ban_permitted (Priority: 4)

**Given:**
- user's power level meets or exceeds the ban threshold
- user's power level is strictly greater than the target's power level

**Then:**
- **emit_event** event: `room.action.permitted`

**Result:** Target user is banned and cannot rejoin without being unbanned

### Insufficient_power_for_invite (Priority: 5) — Error: `INSUFFICIENT_POWER_INVITE`

**Given:**
- user's power level is below the invite threshold

**Result:** Invite rejected

### Insufficient_power_for_kick (Priority: 6) — Error: `INSUFFICIENT_POWER_KICK`

**Given:**
- ANY: user's power level is below the kick threshold OR user's power level is not strictly greater than target's power level

**Result:** Kick rejected

### Insufficient_power_for_ban (Priority: 7) — Error: `INSUFFICIENT_POWER_BAN`

**Given:**
- ANY: user's power level is below the ban threshold OR user's power level is not strictly greater than target's power level

**Result:** Ban rejected

### Insufficient_power_for_event (Priority: 8) — Error: `INSUFFICIENT_POWER_EVENT`

**Given:**
- user's power level is below the required level for the event type

**Result:** Event rejected

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_POWER_INVITE` | 403 | You do not have permission to invite users to this room | No |
| `INSUFFICIENT_POWER_KICK` | 403 | You do not have permission to remove this user from the room | No |
| `INSUFFICIENT_POWER_BAN` | 403 | You do not have permission to ban this user | No |
| `INSUFFICIENT_POWER_EVENT` | 403 | You do not have permission to send this type of event | No |
| `INSUFFICIENT_POWER_STATE` | 403 | You do not have permission to change this room setting | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `room.action.permitted` | A power-level-gated action was approved and may proceed | `user_id`, `action_type`, `room_id` |
| `room.power_levels.updated` | The room's power level configuration was changed | `room_id`, `changed_by`, `new_state_group` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-state-history | required | Power levels are persisted as a state event and consulted during every event authorization |
| room-invitations | required | Invite, kick, and ban actions are gated by power level thresholds |
| event-redaction | required | Redaction of other users' events requires meeting the redact power threshold |

## AGI Readiness

### Goals

#### Reliable Room Power Levels

Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.

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
| security | usability | access control must enforce least-privilege principle |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_state_history` | room-state-history | fail |
| `room_invitations` | room-invitations | fail |
| `event_redaction` | event-redaction | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| action_permitted | `autonomous` | - | - |
| invite_permitted | `autonomous` | - | - |
| kick_permitted | `autonomous` | - | - |
| ban_permitted | `autonomous` | - | - |
| insufficient_power_for_invite | `autonomous` | - | - |
| insufficient_power_for_kick | `autonomous` | - | - |
| insufficient_power_for_ban | `autonomous` | - | - |
| insufficient_power_for_event | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 4
  entry_points:
    - synapse/event_auth.py
    - synapse/handlers/room.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Room Power Levels Blueprint",
  "description": "Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.. 9",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "power-levels, permissions, authorization, moderation, roles, room"
}
</script>
