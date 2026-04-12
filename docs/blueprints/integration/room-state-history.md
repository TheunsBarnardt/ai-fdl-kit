---
title: "Room State History Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization "
---

# Room State History Blueprint

> Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization at every event.

| | |
|---|---|
| **Feature** | `room-state-history` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | state, history, events, dag, resolution, immutability, authorization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/room-state-history.blueprint.yaml) |
| **JSON API** | [room-state-history.json]({{ site.baseurl }}/api/blueprints/integration/room-state-history.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Participant sending or receiving events |
| `homeserver` | Homeserver | system | Server persisting events and maintaining state |
| `remote_server` | Remote Server | external | Foreign server sending events via federation |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_id` | token | Yes | Globally unique immutable identifier for an event |  |
| `room_id` | token | Yes | Room this event belongs to |  |
| `event_type` | text | Yes | Type identifier distinguishing state events from timeline events |  |
| `state_key` | text | No | Secondary key; combined with event_type to define a unique state slot |  |
| `content` | json | Yes | Payload of the event; interpreted according to event_type |  |
| `depth` | number | Yes | Integer DAG depth for topological ordering |  |
| `prev_event_ids` | json | Yes | Parent events this event references |  |
| `auth_event_ids` | json | Yes | State events that cryptographically authorize this event |  |
| `state_group` | number | No | Numeric identifier for a resolved state snapshot stored in the database |  |
| `origin_server_ts` | datetime | Yes | Timestamp set by the originating server at event creation |  |

## States

**State field:** `state_cache_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `warm` | Yes |  |
| `loading` |  |  |
| `evicted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `evicted` | `loading` | homeserver |  |
|  | `loading` | `warm` | homeserver |  |
|  | `warm` | `evicted` | homeserver |  |

## Rules

- **immutability:** Events are immutable once persisted; corrections are made only through redaction events, Every event must declare its auth events; the auth chain must be closed, State is tracked per (event_type, state_key) pair; only the most recent event per slot is current state, The genesis event must have no predecessor events and must not specify a room identifier in its content, Genesis events must declare a creator
- **validation:** All events must pass cryptographic signature validation before persistence, Events may not exceed the maximum permitted size, State resolution is applied when concurrent events create conflicting state; algorithm depends on room version
- **caching:** State cache entries expire after 60 minutes; long-idle rooms reload state from persistent storage on demand, State queries may be filtered to a subset of event types to reduce load

## Outcomes

### Event_accepted (Priority: 1)

**Given:**
- event passes signature validation
- event passes authorization rules for its type and state_key
- event size does not exceed the maximum limit
- auth event chain is valid and closed

**Then:**
- **create_record** target: `event_graph` — Event appended to the room's persistent event graph
- **set_field** target: `state_group` — New state group assigned if event modifies state
- **emit_event** event: `room.event.persisted`

**Result:** Event is part of the room history and state is updated if applicable

### State_conflict_resolved (Priority: 2)

**Given:**
- concurrent events modify the same state slot
- state resolution algorithm produces a deterministic winner

**Then:**
- **set_field** target: `state_group` — Resolved state snapshot stored with new state group identifier
- **emit_event** event: `room.state.resolved`

**Result:** Single authoritative current state established despite concurrent edits

### Event_rejected_auth (Priority: 3) — Error: `EVENT_AUTH_FAILED`

**Given:**
- ANY: event auth chain contains an invalid reference OR event sender lacks permission for this event type OR event violates a room version-specific rule

**Then:**
- **emit_event** event: `room.event.rejected`

**Result:** Event discarded; room state unchanged

### Event_rejected_signature (Priority: 4) — Error: `EVENT_SIGNATURE_INVALID`

**Given:**
- event is missing a valid server signature

**Then:**
- **emit_event** event: `room.event.rejected`

**Result:** Event discarded without processing

### Event_rejected_size (Priority: 5) — Error: `EVENT_TOO_LARGE`

**Given:**
- event content exceeds the maximum allowed byte size

**Result:** Event rejected before persistence

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EVENT_AUTH_FAILED` | 403 | Event failed authorization checks | No |
| `EVENT_SIGNATURE_INVALID` | 400 | Event rejected due to invalid or missing signatures | No |
| `EVENT_TOO_LARGE` | 413 | Event exceeds the maximum permitted size | No |
| `EVENT_MALFORMED` | 400 | Event is missing required fields or contains invalid structure | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `room.event.persisted` | An event has been validated and appended to the room graph | `event_id`, `room_id`, `event_type`, `state_key` |
| `room.state.resolved` | State conflict resolved; new authoritative state snapshot stored | `room_id`, `state_group` |
| `room.event.rejected` | An event was rejected due to auth, signature, or size failure | `event_id`, `rejection_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-power-levels | required | Power level state event is consulted during every state event authorization |
| server-federation | required | Federation sends and receives events; state resolution applies to federated events |
| room-lifecycle | required | Room creation writes the genesis event that anchors the entire state graph |
| event-redaction | recommended | Redaction prunes event content while preserving its position in the graph |

## AGI Readiness

### Goals

#### Reliable Room State History

Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization at every event.

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
| `server_federation` | server-federation | degrade |
| `room_lifecycle` | room-lifecycle | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| event_accepted | `autonomous` | - | - |
| state_conflict_resolved | `autonomous` | - | - |
| event_rejected_auth | `supervised` | - | - |
| event_rejected_signature | `supervised` | - | - |
| event_rejected_size | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 10
  entry_points:
    - synapse/state/__init__.py
    - synapse/event_auth.py
    - synapse/events/validator.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Room State History Blueprint",
  "description": "Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "state, history, events, dag, resolution, immutability, authorization"
}
</script>
