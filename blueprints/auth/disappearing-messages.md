<!-- AUTO-GENERATED FROM disappearing-messages.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Disappearing Messages

> Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating timer changes

**Category:** Auth · **Version:** 1.0.0 · **Tags:** messaging · privacy · ephemeral · timer · client-enforced

## What this does

Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating timer changes

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **conversation_id** *(text, required)* — Conversation ID
- **expire_timer_seconds** *(number, required)* — Expire Timer (seconds)
- **set_by** *(text, optional)* — Set By
- **message_received_at** *(number, optional)* — Message Received At
- **message_id** *(text, optional)* — Message ID

## What must be true

- **client_enforcement:** Disappearing message deletion is enforced entirely on client devices; the server does not delete message content, Clients must schedule local deletion at message_received_at + expire_timer_seconds * 1000; messages must be deleted even if the app is backgrounded or restarted, Clients must not rely on the server to confirm or enforce deletion; the server merely relays the timer value
- **timer_propagation:** The server propagates timer-change messages to all participant devices as standard encrypted messages so every device applies the same timer, A timer value of 0 disables disappearing messages for the conversation, Valid non-zero timer values are positive integers representing seconds; recommended presets include 5 seconds, 1 minute, 5 minutes, 1 hour, 1 day, and 1 week, When a new participant joins a group conversation they receive the current timer value as part of the group state, Timer-change messages must be delivered to all linked devices of each participant so deletion is consistent across devices, A timer-change by any participant overrides the previous timer for all participants; the last-writer-wins rule applies
- **group_rules:** Groups may restrict timer changes to administrators only; clients enforce this restriction, and the server passes through the encrypted control message without inspecting it

## Success & failure scenarios

**✅ Success paths**

- **Offline Queued** — when participant device is offline when timer-change message is sent, then Timer-change message is stored in the offline queue and delivered when the device reconnects.
- **Message Expired Client** — when client's local clock passes the calculated deletion deadline for a stored message; expire_timer_seconds gt 0, then Message content and metadata are removed from the device's local storage; no server action is taken.
- **Timer Disabled** — when authenticated participant sends a timer-change control message; expire_timer_seconds eq 0, then Disappearing messages are disabled for the conversation; all participant devices receive the change and stop scheduling future deletions.
- **Timer Updated** — when authenticated participant sends a timer-change control message; expire_timer_seconds gte 0, then Timer-change control message is enqueued for delivery to all participant devices; each device updates its local conversation state.

**❌ Failure paths**

- **Invalid Timer Value** — when expire_timer_seconds lt 0, then Timer-change message is rejected; negative timer values are not permitted. *(error: `DISAPPEARING_INVALID_TIMER`)*

## Errors it can return

- `DISAPPEARING_INVALID_TIMER` — Timer value must be zero or a positive number of seconds

## Events

**`disappearing.timer_changed`** — A participant updated the disappearing-message timer for a conversation
  Payload: `conversation_id`, `expire_timer_seconds`, `set_by`

**`disappearing.timer_disabled`** — A participant disabled the disappearing-message timer for a conversation
  Payload: `conversation_id`, `set_by`

**`disappearing.message_deleted`** — A client deleted a message after its expiry timer elapsed (client-side event only)
  Payload: `message_id`, `conversation_id`

**`disappearing.timer_queued`** — A timer-change control message was queued for offline delivery
  Payload: `conversation_id`, `expire_timer_seconds`

## Connects to

- **sealed-sender-delivery** *(recommended)* — Timer-change control messages travel as encrypted sealed-sender messages so the server cannot inspect the timer value
- **e2e-key-exchange** *(recommended)* — All messages carrying timer updates are encrypted end-to-end using keys managed by the key exchange feature
- **multi-device-linking** *(recommended)* — Timer changes must be delivered to all linked devices to keep deletion consistent across a user's devices

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/disappearing-messages/) · **Spec source:** [`disappearing-messages.blueprint.yaml`](./disappearing-messages.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
