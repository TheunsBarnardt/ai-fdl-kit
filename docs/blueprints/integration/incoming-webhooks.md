---
title: "Incoming Webhooks Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels. 13 fields. 9 outcomes. 5 error codes. rules: gene"
---

# Incoming Webhooks Blueprint

> Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels

| | |
|---|---|
| **Feature** | `incoming-webhooks` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | webhooks, http, integration, automation, inbound |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/incoming-webhooks.blueprint.yaml) |
| **JSON API** | [incoming-webhooks.json]({{ site.baseurl }}/api/blueprints/integration/incoming-webhooks.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `administrator` | Administrator | human | User who configures incoming webhook integrations |
| `external_system` | External System | external | Third-party service or system that sends HTTP POST requests to the webhook endpoint |
| `webhook_service` | Webhook Service | system | Service that receives, validates, and processes incoming webhook payloads |
| `script_engine` | Script Engine | system | Isolated script execution environment that runs custom processing logic on payloads |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `name` | text | Yes | Integration Name |  |
| `enabled` | boolean | Yes | Enabled |  |
| `channel` | text | Yes | Target Channel(s) |  |
| `username` | text | Yes | Post As Username |  |
| `token` | token | Yes | Webhook Token |  |
| `alias` | text | No | Display Alias |  |
| `avatar` | url | No | Avatar URL |  |
| `emoji` | text | No | Avatar Emoji |  |
| `script_enabled` | boolean | Yes | Script Enabled |  |
| `script` | rich_text | No | Processing Script |  |
| `override_destination_channel_enabled` | boolean | No | Allow Channel Override |  |
| `payload_body` | json | Yes | Payload Body |  |
| `payload_text` | text | No | Message Text |  |

## Rules

- **general:** Webhook URL includes the integration token; any request with an invalid or missing token must be rejected, Only users with permission to manage incoming integrations may create or modify webhooks, The target channel must begin with # (for rooms) or @ (for direct messages), If a script is enabled, the payload is passed to the isolated script engine before message posting, Scripts may transform, filter, or enrich the message; if a script returns no content, the message is not posted, If channel override is enabled, the payload may specify an alternative destination channel, The posting username must correspond to an existing system user, Webhook endpoint must be available over HTTPS in production environments, Payloads may be JSON or application/x-www-form-urlencoded; both formats must be handled, Script execution is sandboxed; scripts cannot access the host filesystem or make arbitrary network calls, Integration history is recorded for each request to support debugging and auditing

## Outcomes

### Webhook_created (Priority: 1)

**Given:**
- administrator submits a new incoming webhook configuration
- `name` (input) exists
- `channel` (input) exists
- `username` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `incoming_webhooks.integration_created`

**Result:** Webhook integration is created with a generated token; the webhook URL is returned to the administrator

### Payload_received_and_posted (Priority: 2)

**Given:**
- external system sends a POST request to the webhook URL
- `token` (request) exists
- `enabled` (db) eq `true`
- `script_enabled` (db) eq `false`

**Then:**
- **create_record**
- **emit_event** event: `incoming_webhooks.message_posted`

**Result:** Payload is converted to a channel message and posted under the configured username

### Payload_processed_by_script (Priority: 3)

**Given:**
- external system sends a POST request
- `token` (request) exists
- `enabled` (db) eq `true`
- `script_enabled` (db) eq `true`

**Then:**
- **call_service** target: `script_engine`
- **create_record**
- **emit_event** event: `incoming_webhooks.message_posted`

**Result:** Payload is transformed by the custom script then posted as a channel message

### Script_returns_no_content (Priority: 4)

**Given:**
- script execution returns an empty or null message
- `script_enabled` (db) eq `true`

**Result:** No message is posted; the webhook request is silently consumed

### Invalid_token (Priority: 5) — Error: `INCOMING_WEBHOOK_INVALID_TOKEN`

**Given:**
- `token` (request) not_exists

**Result:** Request is rejected with an authentication error; nothing is posted

### Webhook_disabled (Priority: 6) — Error: `INCOMING_WEBHOOK_DISABLED`

**Given:**
- `enabled` (db) eq `false`

**Result:** Request is rejected because the integration has been disabled

### Invalid_channel (Priority: 7) — Error: `INCOMING_WEBHOOK_INVALID_CHANNEL`

**Given:**
- target channel does not start with # or @, or does not exist

**Result:** Integration creation or message posting fails due to an invalid channel reference

### Script_error (Priority: 8) — Error: `INCOMING_WEBHOOK_SCRIPT_ERROR`

**Given:**
- script execution throws an exception or produces an invalid result
- `script_enabled` (db) eq `true`

**Then:**
- **create_record**

**Result:** Script error is recorded in integration history; no message is posted

### Insufficient_permissions (Priority: 9) — Error: `INCOMING_WEBHOOK_NOT_AUTHORIZED`

**Given:**
- user attempts to create or modify a webhook without the required permission

**Result:** Operation is rejected; user is informed they lack the required authorization

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INCOMING_WEBHOOK_INVALID_TOKEN` | 401 | Invalid webhook token. Please check the webhook URL and try again | No |
| `INCOMING_WEBHOOK_DISABLED` | 400 | This webhook integration has been disabled | No |
| `INCOMING_WEBHOOK_INVALID_CHANNEL` | 400 | Invalid target channel. Channel must start with # or @ and must exist | No |
| `INCOMING_WEBHOOK_SCRIPT_ERROR` | 400 | An error occurred while processing the webhook script | No |
| `INCOMING_WEBHOOK_NOT_AUTHORIZED` | 400 | You do not have permission to manage incoming webhook integrations | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `incoming_webhooks.integration_created` | Fired when a new incoming webhook integration is created | `name`, `channel` |
| `incoming_webhooks.message_posted` | Fired when a webhook payload results in a channel message being posted | `name`, `channel`, `payload_text` |
| `incoming_webhooks.integration_updated` | Fired when an existing incoming webhook integration is modified | `name`, `channel` |
| `incoming_webhooks.integration_deleted` | Fired when an incoming webhook integration is removed | `name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| outgoing-webhooks | recommended | Outgoing webhooks provide the complementary ability to notify external systems of internal events |
| channel-messaging | required | Messages produced by incoming webhooks are posted to channels |
| role-based-access-control | required | Permissions control who may create and manage webhook integrations |

## AGI Readiness

### Goals

#### Secure Payload To Message Conversion

Receive, authenticate, and convert external HTTP payloads into channel messages with sandboxed optional script processing

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| token_rejection_rate | 100% | Requests with invalid tokens rejected / total invalid-token requests |
| script_sandbox_compliance | 100% | Script executions that stayed within sandbox / total script executions |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before enabling script processing on a new incoming webhook
- before changing the posting username for an active integration

### Verification

**Invariants:**

- every request must include a valid integration token
- script execution is sandboxed and cannot access the host filesystem or make arbitrary network calls
- disabled integrations must not process any incoming payloads

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| invalid token rejected | POST request arrives with missing or wrong token | request is processed | INCOMING_WEBHOOK_INVALID_TOKEN returned and nothing posted |
| script returning null suppresses message | script is enabled and returns null | payload is received | no message posted but request acknowledged |

### Composability

**Capabilities:**

- `token_authenticated_payload_ingestion`: Accept and validate incoming HTTP payloads using integration tokens
- `sandboxed_script_transformation`: Transform payloads through isolated script execution before posting as channel messages

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | script_flexibility | sandboxed script execution limits capabilities but prevents server-side code injection |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| enable_script_processing | `supervised` | - | - |
| create_incoming_webhook | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 5
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Incoming Webhooks Blueprint",
  "description": "Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels. 13 fields. 9 outcomes. 5 error codes. rules: gene",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "webhooks, http, integration, automation, inbound"
}
</script>
