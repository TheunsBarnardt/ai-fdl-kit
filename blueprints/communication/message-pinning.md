<!-- AUTO-GENERATED FROM message-pinning.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Message Pinning

> Pin important messages to a channel so members can quickly find key information without scrolling through history

**Category:** Communication · **Version:** 1.0.0 · **Tags:** messaging · pinning · channel · moderation

## What this does

Pin important messages to a channel so members can quickly find key information without scrolling through history

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **message_id** *(text, required)* — Message ID
- **channel_id** *(text, required)* — Channel ID
- **pinned** *(boolean, required)* — Pinned State
- **pinned_at** *(datetime, optional)* — Pinned At
- **pinned_by_user_id** *(text, optional)* — Pinned By
- **pinned_by_username** *(text, optional)* — Pinned By Username

## What must be true

- **general:** Pinning must be enabled at the system/workspace level; if disabled, no pin or unpin actions are permitted, Only users with the pin-message permission for the target channel may pin or unpin messages, The acting user must be a member of the channel and have active access to it, A message that is already pinned is silently returned as-is without raising an error, When a message is pinned, a system notification message is posted in the channel to inform members, End-to-end encrypted messages are pinned using an encrypted system message type to preserve confidentiality, Nested quote attachments in the pinned message are included in the system notification up to the configured chain limit, When unpinning, the user must still be a subscribed member of the channel, If message history retention is enabled, a history clone is saved before unpinning, If the pinned message is the channel's last message, the channel's last-message metadata is updated immediately, Read receipt records are updated to reflect the new pin state when receipt storage is enabled, All pin and unpin actions trigger extensibility hooks so downstream integrations can react

## Success & failure scenarios

**✅ Success paths**

- **Already Pinned** — when message is already in pinned state; pinned is true, then No change made; message was already pinned.
- **Pin Successful** — when pinning is enabled; message exists and belongs to an accessible channel; user has pin-message permission; message is currently not pinned, then Message is pinned; a system notification appears in the channel.
- **Unpin Successful** — when pinning is enabled; message exists and belongs to an accessible channel; user has pin-message permission and is subscribed; message is currently pinned, then Message is unpinned; channel members see the updated pin list.

**❌ Failure paths**

- **Pinning Disabled** — when system-level message pinning setting is disabled, then Action rejected; pinning is not permitted in this workspace. *(error: `PIN_FEATURE_DISABLED`)*
- **Message Not Found** — when message_id does not correspond to an existing message, then Action rejected; the target message could not be found. *(error: `PIN_MESSAGE_NOT_FOUND`)*
- **Channel Not Found** — when channel_id does not correspond to an existing channel, then Action rejected; the target channel could not be found. *(error: `PIN_CHANNEL_NOT_FOUND`)*
- **User Not Authenticated** — when no authenticated user session exists, then Action rejected; user must be logged in. *(error: `PIN_NOT_AUTHENTICATED`)*
- **User Not Authorized** — when authenticated user does not have pin-message permission in the channel, then Action rejected; user lacks the required permission. *(error: `PIN_NOT_AUTHORIZED`)*
- **User No Channel Access** — when authenticated user cannot access the target channel, then Action rejected; user does not have access to this channel. *(error: `PIN_NO_CHANNEL_ACCESS`)*
- **Unpin User Not Subscribed** — when action is unpin; user is not subscribed to the channel, then Action rejected; only subscribed members may unpin messages. *(error: `UNPIN_NOT_SUBSCRIBED`)*

## Errors it can return

- `PIN_FEATURE_DISABLED` — Message pinning is not available in this workspace
- `PIN_MESSAGE_NOT_FOUND` — The message you are trying to pin could not be found
- `PIN_CHANNEL_NOT_FOUND` — The channel could not be found
- `PIN_NOT_AUTHENTICATED` — You must be logged in to pin messages
- `PIN_NOT_AUTHORIZED` — You do not have permission to pin messages in this channel
- `PIN_NO_CHANNEL_ACCESS` — You do not have access to this channel
- `UNPIN_NOT_SUBSCRIBED` — You must be a member of the channel to unpin messages

## Connects to

- **direct-messaging** *(recommended)* — Pinning applies to channels and direct message threads
- **message-starring** *(optional)* — Starring is the personal counterpart to channel-level pinning

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/message-pinning/) · **Spec source:** [`message-pinning.blueprint.yaml`](./message-pinning.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
