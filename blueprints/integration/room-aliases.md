<!-- AUTO-GENERATED FROM room-aliases.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Room Aliases

> Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution.

**Category:** Integration · **Version:** 1.0.0 · **Tags:** alias · directory · addressing · discovery · room · federation

## What this does

Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **alias** *(text, required)* — Full alias in #localpart:server format; localpart alphanumeric, no whitespace or colons, max 255 chars
- **room_id** *(token, required)* — The room this alias resolves to
- **servers** *(json, optional)* — List of server names hosting members of the room (returned with lookup results)
- **creator_id** *(text, optional)* — User who created the alias

## What must be true

- **format:** Alias localparts must contain no whitespace and no colon characters, The full alias including server name must not exceed 255 characters, The alias domain must match the local server; cross-server alias creation is not permitted
- **access:** A user must be a member of the target room to create an alias, unless they are a server administrator, Application services may only create aliases within their declared exclusive namespace, Alias deletion requires room administrator power level in the target room, An existing alias cannot be modified; it must be deleted and recreated, Server administrators bypass room membership requirements for all alias operations
- **federation:** Spam-checker module callbacks may reject alias creation with a custom error code, Federated alias lookups contact the alias home server if the alias is not local

## Success & failure scenarios

**✅ Success paths**

- **Alias Created** — when alias localpart contains no whitespace or colons; alias total length does not exceed 255 characters; requester is a member of the target room OR requester is a server administrator, then Alias is resolvable and can be shared as a room address.
- **Alias Created By Service** — when requester is a registered application service; alias falls within the service's declared namespace, then Service-managed alias is available for routing.
- **Alias Deleted** — when requester has room administrator power level in the target room; alias exists and is local, then Alias no longer resolves; room remains accessible by room ID.
- **Alias Resolved Locally** — when alias domain matches local server; alias exists in local directory, then Room ID and server list returned to requester.
- **Alias Resolved Via Federation** — when alias domain belongs to a remote server; remote server is reachable, then Remote alias resolved and returned to requester.

**❌ Failure paths**

- **Alias Creation Rejected Format** — when alias localpart contains whitespace OR alias localpart contains a colon OR alias total length exceeds 255 characters, then Alias creation rejected with format error. *(error: `ALIAS_INVALID_FORMAT`)*
- **Alias Creation Rejected Membership** — when requester is not a member of the target room; requester is not a server administrator, then Alias creation rejected; user must join room first. *(error: `ALIAS_MEMBERSHIP_REQUIRED`)*
- **Alias Creation Rejected Namespace** — when alias falls within an application service's exclusive namespace; requester is not that application service, then Alias creation rejected; namespace reserved by a registered service. *(error: `ALIAS_NAMESPACE_CONFLICT`)*
- **Alias Resolution Failed** — when alias does not exist locally; alias domain is local OR remote server is unreachable, then Alias lookup returns not found. *(error: `ALIAS_NOT_FOUND`)*

## Errors it can return

- `ALIAS_INVALID_FORMAT` — Room alias contains invalid characters or exceeds maximum length
- `ALIAS_MEMBERSHIP_REQUIRED` — You must be in the room to create an alias for it
- `ALIAS_NAMESPACE_CONFLICT` — This alias is reserved by a registered application service
- `ALIAS_NOT_FOUND` — Room alias not found
- `ALIAS_DELETE_PERMISSION_DENIED` — You do not have permission to delete this alias
- `ALIAS_FEDERATION_FAILED` — Could not retrieve alias from remote server

## Connects to

- **room-lifecycle** *(required)* — Aliases are created for existing rooms
- **room-power-levels** *(required)* — Alias deletion requires room administrator power level
- **server-federation** *(recommended)* — Remote alias resolution uses federation directory queries
- **application-services** *(optional)* — Application services enforce exclusive alias namespace reservations

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/room-aliases/) · **Spec source:** [`room-aliases.blueprint.yaml`](./room-aliases.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
