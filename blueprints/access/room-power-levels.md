<!-- AUTO-GENERATED FROM room-power-levels.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Room Power Levels

> Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.

**Category:** Access · **Version:** 1.0.0 · **Tags:** power-levels · permissions · authorization · moderation · roles · room

## What this does

Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **users** *(json, optional)* — Map of user identifiers to their explicit power levels
- **users_default** *(number, optional)* — Power level assigned to users not listed in the users map (default 0)
- **events** *(json, optional)* — Map of event types to the minimum power level required to send them
- **events_default** *(number, optional)* — Minimum power level required to send non-state events not listed in events (default 0)
- **state_default** *(number, optional)* — Minimum power level required to send state events not listed in events (default 50)
- **invite** *(number, optional)* — Minimum power level required to invite another user (default 0)
- **kick** *(number, optional)* — Minimum power level required to forcibly remove a member (default 50)
- **ban** *(number, optional)* — Minimum power level required to ban a user (default 50)
- **redact** *(number, optional)* — Minimum power level required to redact another user's events (default 50)

## What must be true

- **defaults:** Room creator receives power level 100 and is the initial sole administrator, Each user's effective power level is their explicit value in the users map, or users_default if not listed
- **event_sending:** To send a non-state event a user's power level must meet or exceed events_default or the specific events entry, To send a state event a user's power level must meet or exceed state_default or the specific events entry
- **membership_actions:** To invite a user the actor's power level must meet or exceed the invite threshold, To kick the actor's power level must meet or exceed kick and must be strictly greater than the target's level, To ban or unban the actor's power level must meet or exceed ban and be strictly greater than the target's level, To redact another user's event the actor must meet the redact threshold
- **modification:** Power level changes require that the requesting user's level equals or exceeds every value they are modifying, A user cannot grant a power level higher than their own current level

## Success & failure scenarios

**✅ Success paths**

- **Action Permitted** — when user's effective power level meets the required threshold for the action; for membership actions, user level is strictly greater than target level, then Action proceeds; event is accepted and persisted.
- **Invite Permitted** — when user's power level meets or exceeds the invite threshold; target user is not already a member or banned, then Invite event accepted and forwarded to target.
- **Kick Permitted** — when user's power level meets or exceeds the kick threshold; user's power level is strictly greater than the target's power level, then Target user's membership changed to leave.
- **Ban Permitted** — when user's power level meets or exceeds the ban threshold; user's power level is strictly greater than the target's power level, then Target user is banned and cannot rejoin without being unbanned.

**❌ Failure paths**

- **Insufficient Power For Invite** — when user's power level is below the invite threshold, then Invite rejected. *(error: `INSUFFICIENT_POWER_INVITE`)*
- **Insufficient Power For Kick** — when user's power level is below the kick threshold OR user's power level is not strictly greater than target's power level, then Kick rejected. *(error: `INSUFFICIENT_POWER_KICK`)*
- **Insufficient Power For Ban** — when user's power level is below the ban threshold OR user's power level is not strictly greater than target's power level, then Ban rejected. *(error: `INSUFFICIENT_POWER_BAN`)*
- **Insufficient Power For Event** — when user's power level is below the required level for the event type, then Event rejected. *(error: `INSUFFICIENT_POWER_EVENT`)*

## Errors it can return

- `INSUFFICIENT_POWER_INVITE` — You do not have permission to invite users to this room
- `INSUFFICIENT_POWER_KICK` — You do not have permission to remove this user from the room
- `INSUFFICIENT_POWER_BAN` — You do not have permission to ban this user
- `INSUFFICIENT_POWER_EVENT` — You do not have permission to send this type of event
- `INSUFFICIENT_POWER_STATE` — You do not have permission to change this room setting

## Events

**`room.action.permitted`** — A power-level-gated action was approved and may proceed
  Payload: `user_id`, `action_type`, `room_id`

**`room.power_levels.updated`** — The room's power level configuration was changed
  Payload: `room_id`, `changed_by`, `new_state_group`

## Connects to

- **room-state-history** *(required)* — Power levels are persisted as a state event and consulted during every event authorization
- **room-invitations** *(required)* — Invite, kick, and ban actions are gated by power level thresholds
- **event-redaction** *(required)* — Redaction of other users' events requires meeting the redact power threshold

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/room-power-levels/) · **Spec source:** [`room-power-levels.blueprint.yaml`](./room-power-levels.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
