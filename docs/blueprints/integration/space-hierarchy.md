---
title: "Space Hierarchy Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child reso"
---

# Space Hierarchy Blueprint

> Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child resolution.

| | |
|---|---|
| **Feature** | `space-hierarchy` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | spaces, hierarchy, grouping, discovery, navigation, rooms |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/space-hierarchy.blueprint.yaml) |
| **JSON API** | [space-hierarchy.json]({{ site.baseurl }}/api/blueprints/integration/space-hierarchy.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `space_admin` | Space Administrator | human | User with power to manage child relationships in a space |
| `user` | User | human | User browsing or navigating the space hierarchy |
| `homeserver` | Homeserver | system | Server traversing and caching space hierarchy data |
| `remote_server` | Remote Server | external | Foreign server hosting child rooms or sub-spaces |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `space_room_id` | token | Yes | Room ID of the space (a room with type m.space) |  |
| `child_room_id` | token | No | Room ID of a child within the space |  |
| `via_servers` | json | Yes | Server names to contact when resolving the child room |  |
| `suggested` | boolean | No | Whether the child is highlighted as a recommended entry point |  |
| `order` | text | No | Optional lexicographic ordering hint for display |  |
| `max_depth` | number | No | Maximum traversal depth; null means unlimited |  |
| `pagination_token` | token | No | Opaque token referencing a paginated traversal session |  |
| `suggested_only` | boolean | No | If true, only suggested children are included in results |  |

## States

**State field:** `traversal_session_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `expired` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `expired` | homeserver |  |

## Rules

- **structure:** A space is a room whose creation event specifies the space room type, Child relationships are defined by state events in the parent space room; each child room ID is the state key, A child state event must include a list of servers to contact for resolution
- **traversal:** Traversal is breadth-first; oldest forward extremities in the queue are processed first, A maximum of 50 rooms may be returned per page, A maximum of 50 children per space are processed in a single traversal step, At most 3 servers are queried when resolving a remote child room, Pagination sessions expire after 5 minutes of inactivity, Maximum traversal depth is configurable; depth 0 returns only the root space
- **access:** Regular users only see rooms they are permitted to access; server administrators see all rooms, Remote child rooms are fetched via federation hierarchy API

## Outcomes

### Hierarchy_page_returned (Priority: 1)

**Given:**
- ANY: requester is a member of the space OR requester is a server administrator
- pagination session is valid or no token provided

**Then:**
- **create_record** target: `pagination_session` — Pagination session created or resumed with traversal state
- **emit_event** event: `space.hierarchy.page_returned`

**Result:** Batch of rooms from the space hierarchy returned with optional continuation token

### Hierarchy_traversal_complete (Priority: 2)

**Given:**
- all reachable rooms within max_depth have been visited

**Then:**
- **emit_event** event: `space.hierarchy.complete`

**Result:** Final page returned with no continuation token

### Remote_child_resolved (Priority: 3)

**Given:**
- child room is hosted on a remote server
- at least one via_server is reachable

**Then:**
- **emit_event** event: `space.child.resolved`

**Result:** Remote child room details included in hierarchy response

### Remote_child_unresolvable (Priority: 4)

**Given:**
- child room is hosted on a remote server
- all via_servers are unreachable

**Then:**
- **emit_event** event: `space.child.unresolvable`

**Result:** Child room omitted from results; traversal continues

### Access_denied (Priority: 5) — Error: `SPACE_ACCESS_DENIED`

**Given:**
- requester is not a member of the space
- room previews are disabled
- requester is not a server administrator

**Result:** Hierarchy request rejected

### Session_expired (Priority: 6) — Error: `SPACE_PAGINATION_TOKEN_EXPIRED`

**Given:**
- pagination token references a session that has expired

**Result:** Client must restart traversal from the beginning

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SPACE_ACCESS_DENIED` | 403 | You do not have permission to browse this space | No |
| `SPACE_PAGINATION_TOKEN_EXPIRED` | 400 | Pagination session has expired. Please restart the request. | No |
| `SPACE_NOT_FOUND` | 404 | The requested space room was not found | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `space.hierarchy.page_returned` | A page of rooms from the space hierarchy was returned to the requester | `space_room_id`, `rooms_returned`, `next_token` |
| `space.hierarchy.complete` | All reachable rooms within the traversal depth have been visited | `space_room_id`, `total_rooms` |
| `space.child.resolved` | A remote child room was successfully resolved via federation | `child_room_id`, `resolved_via_server` |
| `space.child.unresolvable` | A child room could not be reached from any listed server | `child_room_id`, `attempted_servers` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| room-lifecycle | required | Spaces are rooms; they are created through the same room creation flow |
| room-state-history | required | Child relationships are stored as state events in the space room |
| room-power-levels | required | Only users with sufficient power may manage child state events |
| server-federation | recommended | Remote child rooms are resolved via federated hierarchy queries |

## AGI Readiness

### Goals

#### Reliable Space Hierarchy

Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child resolution.

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
| `room_lifecycle` | room-lifecycle | degrade |
| `room_state_history` | room-state-history | degrade |
| `room_power_levels` | room-power-levels | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| hierarchy_page_returned | `autonomous` | - | - |
| hierarchy_traversal_complete | `autonomous` | - | - |
| remote_child_resolved | `autonomous` | - | - |
| remote_child_unresolvable | `autonomous` | - | - |
| access_denied | `autonomous` | - | - |
| session_expired | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 5
  entry_points:
    - synapse/handlers/room_summary.py
    - synapse/storage/databases/main/room.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Space Hierarchy Blueprint",
  "description": "Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child reso",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "spaces, hierarchy, grouping, discovery, navigation, rooms"
}
</script>
