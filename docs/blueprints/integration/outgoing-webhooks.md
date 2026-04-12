---
title: "Outgoing Webhooks Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems. 20 fields. 11 outcomes. "
---

# Outgoing Webhooks Blueprint

> Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems

| | |
|---|---|
| **Feature** | `outgoing-webhooks` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | webhooks, http, integration, automation, outbound, callbacks |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/outgoing-webhooks.blueprint.yaml) |
| **JSON API** | [outgoing-webhooks.json]({{ site.baseurl }}/api/blueprints/integration/outgoing-webhooks.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `administrator` | Administrator | human | User who configures outgoing webhook integrations |
| `trigger_service` | Trigger Service | system | Service that listens for channel events and dispatches HTTP callbacks to external URLs |
| `external_system` | External System | external | Third-party service that receives the outgoing HTTP callback and may return a response |
| `script_engine` | Script Engine | system | Isolated script execution environment that transforms event data before dispatch |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `name` | text | Yes | Integration Name |  |
| `enabled` | boolean | Yes | Enabled |  |
| `event_type` | select | Yes | Trigger Event |  |
| `urls` | text | Yes | Target URLs |  |
| `channel` | text | No | Source Channel(s) |  |
| `trigger_words` | text | No | Trigger Words |  |
| `trigger_word_anywhere` | boolean | No | Match Trigger Word Anywhere |  |
| `token` | token | Yes | Webhook Token |  |
| `username` | text | Yes | Post As Username |  |
| `alias` | text | No | Display Alias |  |
| `avatar` | url | No | Avatar URL |  |
| `emoji` | text | No | Avatar Emoji |  |
| `script_enabled` | boolean | Yes | Script Enabled |  |
| `script` | rich_text | No | Processing Script |  |
| `retry_failed_calls` | boolean | No | Retry Failed Calls |  |
| `retry_count` | number | No | Retry Count |  |
| `retry_delay` | text | No | Retry Delay |  |
| `run_on_edits` | boolean | No | Run On Message Edits |  |
| `impersonate_user` | boolean | No | Impersonate Triggering User |  |
| `target_room` | text | No | Target Room |  |

## Rules

- **general:** Each outgoing webhook fires for a specific event type; valid types are: sendMessage, fileUploaded, roomCreated, roomArchived, roomJoined, roomLeft, userCreated, Channel-scoped events (sendMessage, fileUploaded, roomJoined, roomLeft) require a source channel to be specified, Global events (roomCreated, roomArchived, userCreated) fire for all rooms without a channel filter, Trigger words, when configured, are matched against message text; only matching messages fire the webhook, The secret token is included in every outgoing request so external systems can verify the source, The HTTP call is dispatched asynchronously; it must not block message delivery in the conversation, A 200-range HTTP response from the external system is treated as success; other responses trigger retry logic if enabled, If the external system returns a message payload in its response, that message is posted back to the channel as a bot reply, Scripts run in an isolated sandbox; they may transform the outgoing payload or return null to cancel the request, Integration history is recorded for every outgoing call to support auditing and debugging, Only users with permission to manage outgoing integrations may create or modify webhooks, Retry attempts are limited to the configured retry count; after all retries fail, the error is logged to integration history

## Outcomes

### Webhook_created (Priority: 1)

**Given:**
- administrator submits a new outgoing webhook configuration
- `name` (input) exists
- `event_type` (input) exists
- `urls` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `outgoing_webhooks.integration_created`

**Result:** Outgoing webhook integration is registered and begins listening for the configured event

### Event_triggers_callback (Priority: 2)

**Given:**
- a monitored channel event occurs
- `enabled` (db) eq `true`
- `trigger_words` (db) not_exists

**Then:**
- **call_service** target: `trigger_service`
- **create_record**
- **emit_event** event: `outgoing_webhooks.callback_dispatched`

**Result:** HTTP POST is sent to all configured URLs with the event data and integration token

### Trigger_word_matched (Priority: 3)

**Given:**
- a sendMessage event occurs
- `trigger_words` (db) exists
- `message_text` (computed) matches

**Then:**
- **call_service** target: `trigger_service`
- **emit_event** event: `outgoing_webhooks.callback_dispatched`

**Result:** HTTP callback fires because the message matched a trigger word

### Script_transforms_payload (Priority: 4)

**Given:**
- event fires and script is enabled
- `script_enabled` (db) eq `true`

**Then:**
- **call_service** target: `script_engine`
- **call_service** target: `trigger_service`
- **emit_event** event: `outgoing_webhooks.callback_dispatched`

**Result:** Event data is transformed by the script before being sent to the external system

### Script_cancels_request (Priority: 5)

**Given:**
- script returns null or an empty response
- `script_enabled` (db) eq `true`

**Result:** Script cancelled the request; no HTTP call is made

### External_system_responds_with_message (Priority: 6)

**Given:**
- external system returns a valid message payload in the HTTP response
- `http_status` (computed) in `200,201,202`

**Then:**
- **create_record**
- **emit_event** event: `outgoing_webhooks.response_posted`

**Result:** External system's response is posted as a bot message in the originating channel

### Callback_failed_with_retry (Priority: 7)

**Given:**
- HTTP call returns a non-success status code
- `retry_failed_calls` (db) eq `true`
- `retry_attempts` (computed) lt

**Then:**
- **call_service** target: `trigger_service`
- **create_record**

**Result:** Failed HTTP call is retried after the configured delay

### Callback_failed_permanently (Priority: 8) — Error: `OUTGOING_WEBHOOK_CALLBACK_FAILED`

**Given:**
- HTTP call fails and all retry attempts are exhausted

**Then:**
- **create_record**

**Result:** Failure is recorded in integration history; no further retries are attempted

### Trigger_word_not_matched (Priority: 9)

**Given:**
- message event occurs but no trigger word is matched
- `trigger_words` (db) exists

**Result:** No callback is dispatched because the message did not contain any configured trigger word

### Webhook_disabled (Priority: 10) — Error: `OUTGOING_WEBHOOK_DISABLED`

**Given:**
- `enabled` (db) eq `false`

**Result:** No callback is dispatched because the integration has been disabled

### Insufficient_permissions (Priority: 11) — Error: `OUTGOING_WEBHOOK_NOT_AUTHORIZED`

**Given:**
- user attempts to create or modify a webhook without the required permission

**Result:** Operation is rejected; user lacks the required authorization

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OUTGOING_WEBHOOK_CALLBACK_FAILED` | 400 | The webhook callback could not be delivered after all retry attempts | No |
| `OUTGOING_WEBHOOK_DISABLED` | 400 | This outgoing webhook integration has been disabled | No |
| `OUTGOING_WEBHOOK_NOT_AUTHORIZED` | 400 | You do not have permission to manage outgoing webhook integrations | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `outgoing_webhooks.integration_created` | Fired when a new outgoing webhook integration is registered | `name`, `event_type` |
| `outgoing_webhooks.callback_dispatched` | Fired when an HTTP callback is sent to the external URL(s) | `name`, `event_type`, `urls` |
| `outgoing_webhooks.response_posted` | Fired when the external system returns a message that is posted back to the channel | `name`, `channel`, `response_text` |
| `outgoing_webhooks.integration_updated` | Fired when an existing outgoing webhook integration is modified | `name`, `event_type` |
| `outgoing_webhooks.integration_deleted` | Fired when an outgoing webhook integration is removed | `name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| incoming-webhooks | recommended | Incoming webhooks provide the complementary ability to receive data from external systems |
| channel-messaging | required | Outgoing webhooks are triggered by channel messaging events |
| role-based-access-control | required | Permissions control who may create and manage webhook integrations |

## AGI Readiness

### Goals

#### Asynchronous Event Notification

Dispatch HTTP callbacks to external systems for configured channel events without blocking message delivery, with retry and audit logging

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| callback_non_blocking_rate | 100% | Callbacks dispatched asynchronously without delaying message delivery / total callbacks |
| retry_exhaustion_audit_rate | 100% | Failed callbacks with all retries exhausted that were logged to integration history / total permanent failures |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before enabling script processing on an outgoing webhook
- before modifying retry policy for a high-volume integration

### Verification

**Invariants:**

- HTTP callbacks are dispatched asynchronously and must not block message delivery
- the integration token is included in every outgoing request
- disabled integrations do not dispatch any callbacks
- all call results are recorded in integration history

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| trigger word filter respected | webhook has trigger words configured and message does not match | message event occurs | no callback dispatched |
| external response posted as bot message | external system returns a valid message payload with HTTP 200 | callback response is received | response is posted as a bot message in the originating channel |

### Composability

**Capabilities:**

- `event_driven_http_callbacks`: Listen for channel events and dispatch async HTTP POST callbacks to configured external URLs
- `retry_with_audit_logging`: Retry failed callbacks with configurable delay and record all attempts in integration history

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| delivery_reliability | latency | retry logic with backoff improves eventual delivery at the cost of delayed failure resolution |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_outgoing_webhook | `supervised` | - | - |
| enable_script_on_outgoing | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 6
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Outgoing Webhooks Blueprint",
  "description": "Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems. 20 fields. 11 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "webhooks, http, integration, automation, outbound, callbacks"
}
</script>
