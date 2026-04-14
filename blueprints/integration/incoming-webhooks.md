<!-- AUTO-GENERATED FROM incoming-webhooks.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Incoming Webhooks

> Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels

**Category:** Integration · **Version:** 1.0.0 · **Tags:** webhooks · http · integration · automation · inbound

## What this does

Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **name** *(text, required)* — Integration Name
- **enabled** *(boolean, required)* — Enabled
- **channel** *(text, required)* — Target Channel(s)
- **username** *(text, required)* — Post As Username
- **token** *(token, required)* — Webhook Token
- **alias** *(text, optional)* — Display Alias
- **avatar** *(url, optional)* — Avatar URL
- **emoji** *(text, optional)* — Avatar Emoji
- **script_enabled** *(boolean, required)* — Script Enabled
- **script** *(rich_text, optional)* — Processing Script
- **override_destination_channel_enabled** *(boolean, optional)* — Allow Channel Override
- **payload_body** *(json, required)* — Payload Body
- **payload_text** *(text, optional)* — Message Text

## What must be true

- **general:** Webhook URL includes the integration token; any request with an invalid or missing token must be rejected, Only users with permission to manage incoming integrations may create or modify webhooks, The target channel must begin with # (for rooms) or @ (for direct messages), If a script is enabled, the payload is passed to the isolated script engine before message posting, Scripts may transform, filter, or enrich the message; if a script returns no content, the message is not posted, If channel override is enabled, the payload may specify an alternative destination channel, The posting username must correspond to an existing system user, Webhook endpoint must be available over HTTPS in production environments, Payloads may be JSON or application/x-www-form-urlencoded; both formats must be handled, Script execution is sandboxed; scripts cannot access the host filesystem or make arbitrary network calls, Integration history is recorded for each request to support debugging and auditing

## Success & failure scenarios

**✅ Success paths**

- **Webhook Created** — when administrator submits a new incoming webhook configuration; name exists; channel exists; username exists, then Webhook integration is created with a generated token; the webhook URL is returned to the administrator.
- **Payload Received And Posted** — when external system sends a POST request to the webhook URL; token exists; enabled eq true; script_enabled eq false, then Payload is converted to a channel message and posted under the configured username.
- **Payload Processed By Script** — when external system sends a POST request; token exists; enabled eq true; script_enabled eq true, then Payload is transformed by the custom script then posted as a channel message.
- **Script Returns No Content** — when script execution returns an empty or null message; script_enabled eq true, then No message is posted; the webhook request is silently consumed.

**❌ Failure paths**

- **Invalid Token** — when Token is missing or does not match any active integration, then Request is rejected with an authentication error; nothing is posted. *(error: `INCOMING_WEBHOOK_INVALID_TOKEN`)*
- **Webhook Disabled** — when enabled eq false, then Request is rejected because the integration has been disabled. *(error: `INCOMING_WEBHOOK_DISABLED`)*
- **Invalid Channel** — when target channel does not start with # or @, or does not exist, then Integration creation or message posting fails due to an invalid channel reference. *(error: `INCOMING_WEBHOOK_INVALID_CHANNEL`)*
- **Script Error** — when script execution throws an exception or produces an invalid result; script_enabled eq true, then Script error is recorded in integration history; no message is posted. *(error: `INCOMING_WEBHOOK_SCRIPT_ERROR`)*
- **Insufficient Permissions** — when user attempts to create or modify a webhook without the required permission, then Operation is rejected; user is informed they lack the required authorization. *(error: `INCOMING_WEBHOOK_NOT_AUTHORIZED`)*

## Errors it can return

- `INCOMING_WEBHOOK_INVALID_TOKEN` — Invalid webhook token. Please check the webhook URL and try again
- `INCOMING_WEBHOOK_DISABLED` — This webhook integration has been disabled
- `INCOMING_WEBHOOK_INVALID_CHANNEL` — Invalid target channel. Channel must start with # or @ and must exist
- `INCOMING_WEBHOOK_SCRIPT_ERROR` — An error occurred while processing the webhook script
- `INCOMING_WEBHOOK_NOT_AUTHORIZED` — You do not have permission to manage incoming webhook integrations

## Events

**`incoming_webhooks.integration_created`** — Fired when a new incoming webhook integration is created
  Payload: `name`, `channel`

**`incoming_webhooks.message_posted`** — Fired when a webhook payload results in a channel message being posted
  Payload: `name`, `channel`, `payload_text`

**`incoming_webhooks.integration_updated`** — Fired when an existing incoming webhook integration is modified
  Payload: `name`, `channel`

**`incoming_webhooks.integration_deleted`** — Fired when an incoming webhook integration is removed
  Payload: `name`

## Connects to

- **outgoing-webhooks** *(recommended)* — Outgoing webhooks provide the complementary ability to notify external systems of internal events
- **channel-messaging** *(required)* — Messages produced by incoming webhooks are posted to channels
- **role-based-access-control** *(required)* — Permissions control who may create and manage webhook integrations

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/incoming-webhooks/) · **Spec source:** [`incoming-webhooks.blueprint.yaml`](./incoming-webhooks.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
