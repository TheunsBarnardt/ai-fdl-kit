---
title: "Guest Room Access Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Allow unauthenticated guest users to access rooms without a full account. Room owners control guest access via a state event. Revoking access removes existing g"
---

# Guest Room Access Blueprint

> Allow unauthenticated guest users to access rooms without a full account. Room owners control guest access via a state event. Revoking access removes existing guests.

| | |
|---|---|
| **Feature** | `guest-room-access` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | guest, anonymous, access-control, room, membership |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/guest-room-access.blueprint.yaml) |
| **JSON API** | [guest-room-access.json]({{ site.baseurl }}/api/blueprints/access/guest-room-access.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `guest_user` | Guest User | human | User with a temporary identity not registered as a full account |
| `room_admin` | Room Administrator | human | User with power to enable or disable guest access |
| `homeserver` | Homeserver | system | Server enforcing the guest access policy |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `room_id` | token | Yes | Room the guest is attempting to access |  |
| `guest_access` | select | Yes | Current guest access policy for the room |  |
| `is_guest` | boolean | No | Flag on the membership event indicating the member is a guest |  |

## States

**State field:** `guest_access`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `forbidden` | Yes |  |
| `can_join` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `forbidden` | `can_join` | room_admin |  |
|  | `can_join` | `forbidden` | room_admin |  |

## Rules

- **guest_access:** Guest access is a local-server concept; federation does not propagate guest identity across servers, A room must have an explicit guest_access state event set to can_join before guests may enter, If no guest_access state event exists the room is treated as having guest access forbidden, Guest membership events carry a kind field set to guest to distinguish them from regular members, When guest access is revoked all existing guest members are immediately removed from the room, Guests may observe messages but their ability to send messages depends on the room's event power levels, Server configuration may disable guest access globally regardless of per-room settings

## Outcomes

### Guest_joined (Priority: 1)

**Given:**
- room has a guest_access state event with value can_join
- server configuration permits guest access

**Then:**
- **transition_state** field: `membership` from: `leave` to: `join`
- **emit_event** event: `guest.joined`

**Result:** Guest user is a member and can receive room messages

### Guest_access_revoked (Priority: 2)

**Given:**
- room admin changes guest_access state event to forbidden
- existing guest members are present in the room

**Then:**
- **set_field** target: `guest_access` value: `forbidden`
- **emit_event** event: `guest.access_revoked`

**Result:** All existing guests are removed; future guest joins are rejected

### Guest_join_denied (Priority: 3) — Error: `GUEST_ACCESS_FORBIDDEN`

**Given:**
- ANY: no guest_access state event exists in the room OR guest_access state event is set to forbidden OR server configuration disables guest access

**Result:** Guest join rejected with forbidden error

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GUEST_ACCESS_FORBIDDEN` | 403 | Guest access is not permitted for this room | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `guest.joined` | A guest user has joined a room with guest access enabled | `guest_user_id`, `room_id` |
| `guest.access_revoked` | Guest access was disabled and existing guests were removed | `room_id`, `kicked_guest_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| guest-accounts | recommended | Guest room access requires a guest account for identity and permission scoping |
| room-invitations | required | Guest join follows the same membership state machine as regular joins |
| room-power-levels | required | Guest users' ability to send events is constrained by power level thresholds |
| room-state-history | required | Guest access policy is stored as a room state event |

## AGI Readiness

### Goals

#### Reliable Guest Room Access

Allow unauthenticated guest users to access rooms without a full account. Room owners control guest access via a state event. Revoking access removes existing guests.

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
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | usability | access control must enforce least-privilege principle |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `room_invitations` | room-invitations | fail |
| `room_power_levels` | room-power-levels | fail |
| `room_state_history` | room-state-history | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| guest_joined | `autonomous` | - | - |
| guest_access_revoked | `human_required` | - | - |
| guest_join_denied | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 5
  entry_points:
    - synapse/handlers/room_member.py
    - synapse/handlers/room.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Guest Room Access Blueprint",
  "description": "Allow unauthenticated guest users to access rooms without a full account. Room owners control guest access via a state event. Revoking access removes existing g",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "guest, anonymous, access-control, room, membership"
}
</script>
