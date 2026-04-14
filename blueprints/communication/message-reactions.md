<!-- AUTO-GENERATED FROM message-reactions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Message Reactions

> Emoji reactions on messages, allowing users to express sentiment without posting a reply; supports toggle (add/remove) semantics

**Category:** Communication · **Version:** 1.0.0 · **Tags:** messaging · reactions · emoji · engagement

## What this does

Emoji reactions on messages, allowing users to express sentiment without posting a reply; supports toggle (add/remove) semantics

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **message_id** *(text, required)* — Message ID
- **room_id** *(text, required)* — Room ID
- **emoji** *(text, required)* — Emoji Code
- **reactor_username** *(text, required)* — Reactor Username
- **reaction_usernames** *(json, optional)* — Reacted-By Usernames
- **reacted_at** *(datetime, required)* — Reacted At
- **should_react** *(boolean, optional)* — Desired Reaction State

## What must be true

- **general:** A user may react to any message in a room they have read access to, Each user may add each emoji reaction at most once per message; reacting again with the same emoji removes the reaction (toggle), The emoji must be a valid standard or custom emoji registered in the system; unknown emoji codes are rejected, Users who are muted in the room cannot add reactions to messages in that room, In read-only channels, reactions are permitted only if the channel explicitly allows reacting when read-only, Users who have been manually unmuted in a read-only channel may react regardless of the read-only setting, When the last reaction for a given emoji is removed, the emoji entry is fully deleted from the message, Reactions are stored on the message record and propagated to the last-message snapshot of the room when applicable, The reaction list per message is unbounded in distinct emoji but each emoji tracks an ordered list of reacting usernames

## Success & failure scenarios

**✅ Success paths**

- **Reaction Added** — when user is authenticated and has access to the room; message exists in the room; emoji is valid (standard or custom); user has not already reacted with this emoji on this message; user is not muted in the room; room is not read-only, or the room allows reacting when read-only, or the user has been unmuted, then Emoji reaction is recorded on the message and all room members see the updated reaction count.
- **Reaction Removed** — when user is authenticated and has access to the room; message exists in the room; user has already reacted with this emoji on this message, then Emoji reaction is removed from the message; if no users remain for that emoji, the emoji entry is deleted.
- **Reaction Toggled** — when user is authenticated and has access to the room; message exists in the room; emoji is valid; should_react is not explicitly specified, then System determines current state and either adds or removes the reaction accordingly.

**❌ Failure paths**

- **Invalid Emoji** — when the specified emoji code does not match any registered standard or custom emoji, then User is informed the emoji is not recognized. *(error: `REACTION_INVALID_EMOJI`)*
- **User Muted** — when user is muted in the room, then User is informed they cannot react because they have been muted. *(error: `REACTION_USER_MUTED`)*
- **Room Readonly No React** — when room is read-only; room does not allow reacting when read-only; user has not been explicitly unmuted, then User is informed they cannot react in this read-only room. *(error: `REACTION_ROOM_READONLY`)*
- **Message Not Found** — when the specified message ID does not exist or has been deleted, then User is informed the message could not be found. *(error: `REACTION_MESSAGE_NOT_FOUND`)*
- **Access Denied** — when user does not have read access to the room, then User is denied access to react without revealing room details. *(error: `REACTION_ACCESS_DENIED`)*

## Errors it can return

- `REACTION_INVALID_EMOJI` — The selected emoji is not available. Please choose a valid emoji.
- `REACTION_USER_MUTED` — You cannot react to messages because you have been muted in this room.
- `REACTION_ROOM_READONLY` — Reactions are not allowed in this read-only room.
- `REACTION_MESSAGE_NOT_FOUND` — The message could not be found. It may have been deleted.
- `REACTION_ACCESS_DENIED` — You do not have permission to react in this room.

## Events

**`message_reactions.reaction_added`** — Fires when a user successfully adds an emoji reaction to a message
  Payload: `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at`

**`message_reactions.reaction_removed`** — Fires when a user removes their emoji reaction from a message
  Payload: `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at`

**`message_reactions.reaction_toggled`** — Fires after a toggle operation resolves to either an add or remove
  Payload: `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at`

## Connects to

- **channel-messaging** *(required)* — Reactions are attached to messages in channels or direct conversations
- **direct-messaging** *(recommended)* — Reactions may also be applied to direct message content
- **message-threading** *(optional)* — Reactions can be applied to thread replies as well as parent messages

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██░░░░░░░░` | 2/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/message-reactions/) · **Spec source:** [`message-reactions.blueprint.yaml`](./message-reactions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
