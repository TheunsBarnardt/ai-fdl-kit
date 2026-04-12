---
title: "Room Invitations Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Controls how users enter rooms via invitation, direct join, or knock. Enforces join rules and rate-limits invitations. Supports third-party invitations via iden"
---

# Room Invitations Blueprint

> Controls how users enter rooms via invitation, direct join, or knock. Enforces join rules and rate-limits invitations. Supports third-party invitations via identity servers.

| | |
|---|---|
| **Feature** | `room-invitations` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | invite, join, knock, membership, access-control, room, rate-limiting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/room-invitations.blueprint.yaml) |
| **JSON API** | [room-invitations.json]({{ site.baseurl }}/api/blueprints/access/room-invitations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inviter` | Inviting User | human | Room member sending an invitation |
| `invitee` | Invited User | human | User receiving an invitation |
| `knocker` | Knocking User | human | User requesting permission to join a knock-enabled room |
| `homeserver` | Homeserver | system | Server enforcing join rules and rate limits |
| `identity_server` | Identity Server | external | External service validating third-party invitations |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `room_id` | token | Yes | Room being joined or invited to |  |
| `inviter_id` | text | No | User sending the invitation |  |
| `invitee_id` | text | Yes | User being invited |  |
| `membership` | select | Yes | Current membership state of the user in the room |  |
| `join_rule` | select | Yes | Rule governing how users may join the room |  |
| `allow_conditions` | json | No | For restricted rooms, the set of conditions that permit joining |  |
| `third_party_medium` | text | No | Medium of a third-party identifier (email, phone) |  |
| `transaction_id` | token | No | Client-provided identifier for idempotent invite requests |  |

## States

**State field:** `membership`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `leave` | Yes |  |
| `invite` |  |  |
| `join` |  |  |
| `knock` |  |  |
| `ban` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `leave` | `invite` | inviter |  |
|  | `invite` | `join` | invitee |  |
|  | `invite` | `leave` | invitee |  |
|  | `leave` | `join` | invitee |  |
|  | `leave` | `knock` | knocker |  |
|  | `knock` | `invite` | inviter |  |
|  | `join` | `leave` | invitee |  |
|  | `join` | `ban` | inviter |  |

## Rules

- **invitations:** Invitations require the inviter to have a power level meeting the room's invite threshold, Invitation sending is rate-limited per room, per recipient, and per inviter, Shadow-banned users cannot send invitations; their requests appear to succeed but are not delivered, Duplicate invitations (same sender, recipient, and content) are deduplicated, Banned users may not be invited; they must be unbanned first
- **joining:** Public rooms allow any authenticated user to join without invitation, Restricted rooms require the joining user to meet at least one of the declared allow conditions, Knock-enabled rooms require a moderator to approve the knock before the knocker can join, Third-party invites are validated through an identity server before delivery, Users cannot knock if they already have an active invitation or membership

## Outcomes

### Invite_sent (Priority: 1)

**Given:**
- inviter's power level meets the room's invite threshold
- invitee is not already a member or banned
- rate limits are not exceeded
- inviter is not shadow-banned

**Then:**
- **transition_state** field: `membership` from: `leave` to: `invite`
- **emit_event** event: `membership.invited`

**Result:** Invitee receives the invite and may accept or decline

### Join_public_room (Priority: 2)

**Given:**
- room join rule is public
- user is not banned

**Then:**
- **transition_state** field: `membership` from: `leave` to: `join`
- **emit_event** event: `membership.joined`

**Result:** User is immediately a full member

### Join_restricted_room (Priority: 3)

**Given:**
- room join rule is restricted
- user meets at least one allow condition

**Then:**
- **transition_state** field: `membership` from: `leave` to: `join`
- **emit_event** event: `membership.joined`

**Result:** User joins after satisfying the restriction conditions

### Knock_sent (Priority: 4)

**Given:**
- room join rule permits knocking
- user is not already a member, banned, or has a pending invite

**Then:**
- **transition_state** field: `membership` from: `leave` to: `knock`
- **emit_event** event: `membership.knocked`

**Result:** Room members are notified and may approve the knock

### Invite_rate_limited (Priority: 5) — Error: `INVITE_RATE_LIMITED`

**Given:**
- rate limit threshold exceeded for room, invitee, or inviter

**Result:** Invite rejected until rate limit window resets

### Invite_permission_denied (Priority: 6) — Error: `INVITE_PERMISSION_DENIED`

**Given:**
- inviter's power level is below the room's invite threshold

**Result:** Invite rejected

### Join_denied_banned (Priority: 7) — Error: `JOIN_BANNED`

**Given:**
- user is banned from the room

**Result:** Join rejected; user must be unbanned by a moderator first

### Knock_denied_rule (Priority: 8) — Error: `KNOCK_NOT_PERMITTED`

**Given:**
- room join rule does not permit knocking

**Result:** Knock rejected; room does not support knock workflow

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVITE_RATE_LIMITED` | 429 | You have sent too many invitations recently. Please wait before sending more. | No |
| `INVITE_PERMISSION_DENIED` | 403 | You do not have permission to invite users to this room | No |
| `JOIN_BANNED` | 403 | You have been banned from this room | No |
| `JOIN_RESTRICTED` | 403 | You do not meet the requirements to join this room | No |
| `KNOCK_NOT_PERMITTED` | 403 | This room does not accept knock requests | No |
| `KNOCK_ALREADY_MEMBER` | 400 | You cannot knock on a room you are already in | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `membership.invited` | A user has been invited to a room | `inviter_id`, `invitee_id`, `room_id` |
| `membership.joined` | A user has become a full member of a room | `user_id`, `room_id` |
| `membership.knocked` | A user has requested access to a knock-enabled room | `user_id`, `room_id` |
| `membership.left` | A user has left or been removed from a room | `user_id`, `room_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-power-levels | required | Invite, kick, and ban thresholds are defined in the room power levels |
| room-lifecycle | required | Join rules are established in the room's initial state at creation |
| identity-lookup | optional | Third-party invitations are validated through an identity server |
| server-federation | recommended | Cross-server invitations are delivered and co-signed via federation |

## AGI Readiness

### Goals

#### Reliable Room Invitations

Controls how users enter rooms via invitation, direct join, or knock. Enforces join rules and rate-limits invitations. Supports third-party invitations via identity servers.

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
| `room_power_levels` | room-power-levels | fail |
| `room_lifecycle` | room-lifecycle | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| invite_sent | `autonomous` | - | - |
| join_public_room | `autonomous` | - | - |
| join_restricted_room | `autonomous` | - | - |
| knock_sent | `autonomous` | - | - |
| invite_rate_limited | `autonomous` | - | - |
| invite_permission_denied | `autonomous` | - | - |
| join_denied_banned | `autonomous` | - | - |
| knock_denied_rule | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 8
  entry_points:
    - synapse/handlers/room_member.py
    - synapse/event_auth.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Room Invitations Blueprint",
  "description": "Controls how users enter rooms via invitation, direct join, or knock. Enforces join rules and rate-limits invitations. Supports third-party invitations via iden",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "invite, join, knock, membership, access-control, room, rate-limiting"
}
</script>
