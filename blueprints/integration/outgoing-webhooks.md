<!-- AUTO-GENERATED FROM outgoing-webhooks.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Outgoing Webhooks

> Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems

**Category:** Integration · **Version:** 1.0.0 · **Tags:** webhooks · http · integration · automation · outbound · callbacks

## What this does

Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **name** *(text, required)* — Integration Name
- **enabled** *(boolean, required)* — Enabled
- **event_type** *(select, required)* — Trigger Event
- **urls** *(text, required)* — Target URLs
- **channel** *(text, optional)* — Source Channel(s)
- **trigger_words** *(text, optional)* — Trigger Words
- **trigger_word_anywhere** *(boolean, optional)* — Match Trigger Word Anywhere
- **token** *(token, required)* — Webhook Token
- **username** *(text, required)* — Post As Username
- **alias** *(text, optional)* — Display Alias
- **avatar** *(url, optional)* — Avatar URL
- **emoji** *(text, optional)* — Avatar Emoji
- **script_enabled** *(boolean, required)* — Script Enabled
- **script** *(rich_text, optional)* — Processing Script
- **retry_failed_calls** *(boolean, optional)* — Retry Failed Calls
- **retry_count** *(number, optional)* — Retry Count
- **retry_delay** *(text, optional)* — Retry Delay
- **run_on_edits** *(boolean, optional)* — Run On Message Edits
- **impersonate_user** *(boolean, optional)* — Impersonate Triggering User
- **target_room** *(text, optional)* — Target Room

## What must be true

- **general:** Each outgoing webhook fires for a specific event type; valid types are: sendMessage, fileUploaded, roomCreated, roomArchived, roomJoined, roomLeft, userCreated, Channel-scoped events (sendMessage, fileUploaded, roomJoined, roomLeft) require a source channel to be specified, Global events (roomCreated, roomArchived, userCreated) fire for all rooms without a channel filter, Trigger words, when configured, are matched against message text; only matching messages fire the webhook, The secret token is included in every outgoing request so external systems can verify the source, The HTTP call is dispatched asynchronously; it must not block message delivery in the conversation, A 200-range HTTP response from the external system is treated as success; other responses trigger retry logic if enabled, If the external system returns a message payload in its response, that message is posted back to the channel as a bot reply, Scripts run in an isolated sandbox; they may transform the outgoing payload or return null to cancel the request, Integration history is recorded for every outgoing call to support auditing and debugging, Only users with permission to manage outgoing integrations may create or modify webhooks, Retry attempts are limited to the configured retry count; after all retries fail, the error is logged to integration history

## Success & failure scenarios

**✅ Success paths**

- **Webhook Created** — when administrator submits a new outgoing webhook configuration; name exists; event_type exists; urls exists, then Outgoing webhook integration is registered and begins listening for the configured event.
- **Event Triggers Callback** — when a monitored channel event occurs; enabled eq true; No trigger word filter configured, so any message fires the webhook, then HTTP POST is sent to all configured URLs with the event data and integration token.
- **Trigger Word Matched** — when a sendMessage event occurs; trigger_words exists; Message text contains one of the configured trigger words, then HTTP callback fires because the message matched a trigger word.
- **Script Transforms Payload** — when event fires and script is enabled; script_enabled eq true, then Event data is transformed by the script before being sent to the external system.
- **Script Cancels Request** — when script returns null or an empty response; script_enabled eq true, then Script cancelled the request; no HTTP call is made.
- **External System Responds With Message** — when external system returns a valid message payload in the HTTP response; http_status in [200,201,202], then External system's response is posted as a bot message in the originating channel.
- **Callback Failed With Retry** — when HTTP call returns a non-success status code; retry_failed_calls eq true; Remaining retry attempts are available, then Failed HTTP call is retried after the configured delay.
- **Trigger Word Not Matched** — when message event occurs but no trigger word is matched; trigger_words exists, then No callback is dispatched because the message did not contain any configured trigger word.

**❌ Failure paths**

- **Callback Failed Permanently** — when HTTP call fails and all retry attempts are exhausted, then Failure is recorded in integration history; no further retries are attempted. *(error: `OUTGOING_WEBHOOK_CALLBACK_FAILED`)*
- **Webhook Disabled** — when enabled eq false, then No callback is dispatched because the integration has been disabled. *(error: `OUTGOING_WEBHOOK_DISABLED`)*
- **Insufficient Permissions** — when user attempts to create or modify a webhook without the required permission, then Operation is rejected; user lacks the required authorization. *(error: `OUTGOING_WEBHOOK_NOT_AUTHORIZED`)*

## Errors it can return

- `OUTGOING_WEBHOOK_CALLBACK_FAILED` — The webhook callback could not be delivered after all retry attempts
- `OUTGOING_WEBHOOK_DISABLED` — This outgoing webhook integration has been disabled
- `OUTGOING_WEBHOOK_NOT_AUTHORIZED` — You do not have permission to manage outgoing webhook integrations

## Connects to

- **incoming-webhooks** *(recommended)* — Incoming webhooks provide the complementary ability to receive data from external systems
- **channel-messaging** *(required)* — Outgoing webhooks are triggered by channel messaging events
- **role-based-access-control** *(required)* — Permissions control who may create and manage webhook integrations

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/outgoing-webhooks/) · **Spec source:** [`outgoing-webhooks.blueprint.yaml`](./outgoing-webhooks.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
