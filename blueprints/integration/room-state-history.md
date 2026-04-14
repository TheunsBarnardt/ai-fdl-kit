<!-- AUTO-GENERATED FROM room-state-history.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Room State History

> Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization at every event.

**Category:** Integration · **Version:** 1.0.0 · **Tags:** state · history · events · dag · resolution · immutability · authorization

## What this does

Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization at every event.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **event_id** *(token, required)* — Globally unique immutable identifier for an event
- **room_id** *(token, required)* — Room this event belongs to
- **event_type** *(text, required)* — Type identifier distinguishing state events from timeline events
- **state_key** *(text, optional)* — Secondary key; combined with event_type to define a unique state slot
- **content** *(json, required)* — Payload of the event; interpreted according to event_type
- **depth** *(number, required)* — Integer DAG depth for topological ordering
- **prev_event_ids** *(json, required)* — Parent events this event references
- **auth_event_ids** *(json, required)* — State events that cryptographically authorize this event
- **state_group** *(number, optional)* — Numeric identifier for a resolved state snapshot stored in the database
- **origin_server_ts** *(datetime, required)* — Timestamp set by the originating server at event creation

## What must be true

- **immutability:** Events are immutable once persisted; corrections are made only through redaction events, Every event must declare its auth events; the auth chain must be closed, State is tracked per (event_type, state_key) pair; only the most recent event per slot is current state, The genesis event must have no predecessor events and must not specify a room identifier in its content, Genesis events must declare a creator
- **validation:** All events must pass cryptographic signature validation before persistence, Events may not exceed the maximum permitted size, State resolution is applied when concurrent events create conflicting state; algorithm depends on room version
- **caching:** State cache entries expire after 60 minutes; long-idle rooms reload state from persistent storage on demand, State queries may be filtered to a subset of event types to reduce load

## Success & failure scenarios

**✅ Success paths**

- **Event Accepted** — when event passes signature validation; event passes authorization rules for its type and state_key; event size does not exceed the maximum limit; auth event chain is valid and closed, then Event is part of the room history and state is updated if applicable.
- **State Conflict Resolved** — when concurrent events modify the same state slot; state resolution algorithm produces a deterministic winner, then Single authoritative current state established despite concurrent edits.

**❌ Failure paths**

- **Event Rejected Auth** — when event auth chain contains an invalid reference OR event sender lacks permission for this event type OR event violates a room version-specific rule, then Event discarded; room state unchanged. *(error: `EVENT_AUTH_FAILED`)*
- **Event Rejected Signature** — when event is missing a valid server signature, then Event discarded without processing. *(error: `EVENT_SIGNATURE_INVALID`)*
- **Event Rejected Size** — when event content exceeds the maximum allowed byte size, then Event rejected before persistence. *(error: `EVENT_TOO_LARGE`)*

## Errors it can return

- `EVENT_AUTH_FAILED` — Event failed authorization checks
- `EVENT_SIGNATURE_INVALID` — Event rejected due to invalid or missing signatures
- `EVENT_TOO_LARGE` — Event exceeds the maximum permitted size
- `EVENT_MALFORMED` — Event is missing required fields or contains invalid structure

## Events

**`room.event.persisted`** — An event has been validated and appended to the room graph
  Payload: `event_id`, `room_id`, `event_type`, `state_key`

**`room.state.resolved`** — State conflict resolved; new authoritative state snapshot stored
  Payload: `room_id`, `state_group`

**`room.event.rejected`** — An event was rejected due to auth, signature, or size failure
  Payload: `event_id`, `rejection_reason`

## Connects to

- **room-power-levels** *(required)* — Power level state event is consulted during every state event authorization
- **server-federation** *(required)* — Federation sends and receives events; state resolution applies to federated events
- **room-lifecycle** *(required)* — Room creation writes the genesis event that anchors the entire state graph
- **event-redaction** *(recommended)* — Redaction prunes event content while preserving its position in the graph

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/room-state-history/) · **Spec source:** [`room-state-history.blueprint.yaml`](./room-state-history.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
