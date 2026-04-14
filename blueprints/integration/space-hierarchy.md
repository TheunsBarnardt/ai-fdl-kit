<!-- AUTO-GENERATED FROM space-hierarchy.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Space Hierarchy

> Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child resolution.

**Category:** Integration · **Version:** 1.0.0 · **Tags:** spaces · hierarchy · grouping · discovery · navigation · rooms

## What this does

Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child resolution.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **space_room_id** *(token, required)* — Room ID of the space (a room with type m.space)
- **child_room_id** *(token, optional)* — Room ID of a child within the space
- **via_servers** *(json, required)* — Server names to contact when resolving the child room
- **suggested** *(boolean, optional)* — Whether the child is highlighted as a recommended entry point
- **order** *(text, optional)* — Optional lexicographic ordering hint for display
- **max_depth** *(number, optional)* — Maximum traversal depth; null means unlimited
- **pagination_token** *(token, optional)* — Opaque token referencing a paginated traversal session
- **suggested_only** *(boolean, optional)* — If true, only suggested children are included in results

## What must be true

- **structure:** A space is a room whose creation event specifies the space room type, Child relationships are defined by state events in the parent space room; each child room ID is the state key, A child state event must include a list of servers to contact for resolution
- **traversal:** Traversal is breadth-first; oldest forward extremities in the queue are processed first, A maximum of 50 rooms may be returned per page, A maximum of 50 children per space are processed in a single traversal step, At most 3 servers are queried when resolving a remote child room, Pagination sessions expire after 5 minutes of inactivity, Maximum traversal depth is configurable; depth 0 returns only the root space
- **access:** Regular users only see rooms they are permitted to access; server administrators see all rooms, Remote child rooms are fetched via federation hierarchy API

## Success & failure scenarios

**✅ Success paths**

- **Hierarchy Page Returned** — when requester is a member of the space OR requester is a server administrator; pagination session is valid or no token provided, then Batch of rooms from the space hierarchy returned with optional continuation token.
- **Hierarchy Traversal Complete** — when all reachable rooms within max_depth have been visited, then Final page returned with no continuation token.
- **Remote Child Resolved** — when child room is hosted on a remote server; at least one via_server is reachable, then Remote child room details included in hierarchy response.
- **Remote Child Unresolvable** — when child room is hosted on a remote server; all via_servers are unreachable, then Child room omitted from results; traversal continues.

**❌ Failure paths**

- **Access Denied** — when requester is not a member of the space; room previews are disabled; requester is not a server administrator, then Hierarchy request rejected. *(error: `SPACE_ACCESS_DENIED`)*
- **Session Expired** — when pagination token references a session that has expired, then Client must restart traversal from the beginning. *(error: `SPACE_PAGINATION_TOKEN_EXPIRED`)*

## Errors it can return

- `SPACE_ACCESS_DENIED` — You do not have permission to browse this space
- `SPACE_PAGINATION_TOKEN_EXPIRED` — Pagination session has expired. Please restart the request.
- `SPACE_NOT_FOUND` — The requested space room was not found

## Events

**`space.hierarchy.page_returned`** — A page of rooms from the space hierarchy was returned to the requester
  Payload: `space_room_id`, `rooms_returned`, `next_token`

**`space.hierarchy.complete`** — All reachable rooms within the traversal depth have been visited
  Payload: `space_room_id`, `total_rooms`

**`space.child.resolved`** — A remote child room was successfully resolved via federation
  Payload: `child_room_id`, `resolved_via_server`

**`space.child.unresolvable`** — A child room could not be reached from any listed server
  Payload: `child_room_id`, `attempted_servers`

## Connects to

- **room-lifecycle** *(required)* — Spaces are rooms; they are created through the same room creation flow
- **room-state-history** *(required)* — Child relationships are stored as state events in the space room
- **room-power-levels** *(required)* — Only users with sufficient power may manage child state events
- **server-federation** *(recommended)* — Remote child rooms are resolved via federated hierarchy queries

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/space-hierarchy/) · **Spec source:** [`space-hierarchy.blueprint.yaml`](./space-hierarchy.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
