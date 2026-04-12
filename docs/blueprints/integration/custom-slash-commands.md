---
title: "Custom Slash Commands Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and c"
---

# Custom Slash Commands Blueprint

> User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and configurable response visibility.


| | |
|---|---|
| **Feature** | `custom-slash-commands` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | slash-commands, webhooks, integrations, bots, custom-commands |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/custom-slash-commands.blueprint.yaml) |
| **JSON API** | [custom-slash-commands.json]({{ site.baseurl }}/api/blueprints/integration/custom-slash-commands.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `workspace_admin` | Workspace Administrator | human | Creates, manages, and deletes slash commands for a workspace |
| `member` | Channel Member | human | Executes slash commands in channels they belong to |
| `external_service` | External Service | external | HTTP endpoint that receives the command payload and returns a response |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `command_id` | hidden | Yes | Unique identifier for the slash command |  |
| `trigger` | text | Yes | Command keyword (without leading slash), 1–128 characters, alphanumeric plus | Validations: pattern, minLength, maxLength |
| `display_name` | text | No | Human-readable name shown in the command management UI | Validations: maxLength |
| `description` | text | No | Brief explanation of what the command does, shown in command help | Validations: maxLength |
| `auto_complete_hint` | text | No | Usage example displayed in the autocomplete suggestions |  |
| `url` | url | Yes | HTTP endpoint that receives the command execution payload | Validations: maxLength |
| `method` | select | Yes | HTTP method used when calling the endpoint |  |
| `username` | text | No | Username shown as the author of in-channel responses from this command |  |
| `icon_url` | url | No | URL of the icon shown alongside command responses |  |
| `auto_complete` | boolean | Yes | Whether this command appears in the autocomplete suggestion list |  |
| `token` | token | Yes | Secret token included in every request to the endpoint for authentication; can b |  |

## States

**State field:** `command_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `deleted` | workspace_admin |  |

## Rules

- **rule_01:** Trigger keywords must not include a leading slash; the slash prefix is implicit.
- **rule_02:** Trigger names are unique per workspace; duplicate triggers within the same team are rejected.
- **rule_03:** The token is auto-generated at creation and is the primary security mechanism; the endpoint must validate it on every request.
- **rule_04:** When the endpoint is called, the payload includes the trigger, command arguments, channel ID, team ID, user ID, and the command token.
- **rule_05:** Responses can be ephemeral (visible only to the command executor) or in_channel (posted publicly to the channel).
- **rule_06:** Responses may include text, attachments, and a goto_location for navigation.
- **rule_07:** A response may include extra_responses to post multiple messages in a single execution.
- **rule_08:** Commands can be created either by workspace members (with the appropriate permission) or by plugins (which set the plugin_id field instead of a creator user ID).
- **rule_09:** Plugin-registered commands and user-created commands cannot coexist with the same trigger; the system deduplicates across all sources.
- **rule_10:** Token and endpoint URL are redacted from command objects returned to non-admin callers.

## Outcomes

### Command_trigger_conflict (Priority: 2) — Error: `COMMAND_TRIGGER_ALREADY_EXISTS`

**Given:**
- new command trigger matches an existing active command in the same workspace

**Result:** Creation rejected; trigger must be unique within the workspace

### Command_endpoint_unreachable (Priority: 5) — Error: `COMMAND_ENDPOINT_FAILED`

**Given:**
- command executed
- HTTP request to the endpoint times out or returns a non-200 status

**Then:**
- **notify** target: `executing_user` — Error message delivered ephemerally to the user

**Result:** Execution fails gracefully; error shown only to the executor

### Command_created (Priority: 10)

**Given:**
- actor has permission to manage slash commands
- trigger is unique within the workspace
- url is a valid HTTP endpoint

**Then:**
- **create_record** target: `slash_command` — Command record stored with auto-generated token
- **emit_event** event: `command.created`

**Result:** Command immediately active; users can invoke it via /<trigger>

### Command_executed (Priority: 10)

**Given:**
- member types /<trigger> in a channel
- command is registered and active for this workspace

**Then:**
- **call_service** target: `command_url` — POST or GET request sent to the configured endpoint with command context payload
- **emit_event** event: `command.executed`

**Result:** Endpoint response processed; ephemeral or in-channel message posted

### Command_response_ephemeral (Priority: 10)

**Given:**
- endpoint returns response with response_type = ephemeral

**Then:**
- **notify** target: `executing_user` — Response message delivered only to the user who ran the command

**Result:** Only the command executor sees the response; channel is unaffected

### Command_response_in_channel (Priority: 10)

**Given:**
- endpoint returns response with response_type = in_channel

**Then:**
- **create_record** target: `post` — Response posted as a visible message in the channel

**Result:** Response visible to all channel members

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMMAND_TRIGGER_ALREADY_EXISTS` | 409 | A command with that trigger already exists in this workspace. | No |
| `COMMAND_INVALID_TRIGGER` | 400 | Trigger may only contain letters, numbers, periods, slashes, and hyphens. | No |
| `COMMAND_ENDPOINT_FAILED` | 500 | The command service could not be reached. Please try again later. | No |
| `COMMAND_NOT_FOUND` | 404 | Slash command not found. | No |
| `COMMAND_PERMISSION_DENIED` | 403 | You do not have permission to manage slash commands. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `command.created` | New slash command registered | `command_id`, `trigger`, `team_id`, `actor_id`, `timestamp` |
| `command.updated` | Slash command configuration modified | `command_id`, `trigger`, `changed_fields`, `actor_id`, `timestamp` |
| `command.deleted` | Slash command removed | `command_id`, `trigger`, `actor_id`, `timestamp` |
| `command.executed` | Slash command triggered by a user | `command_id`, `trigger`, `channel_id`, `user_id`, `timestamp` |
| `command.token_regenerated` | Command security token was regenerated; old token no longer valid | `command_id`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| server-plugin-framework | optional | Plugins can register slash commands in addition to API-created commands |
| role-based-access-control | required | Permissions govern who can create, execute, and manage slash commands |

## AGI Readiness

### Goals

#### Reliable Custom Slash Commands

User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and configurable response visibility.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `role_based_access_control` | role-based-access-control | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| command_created | `supervised` | - | - |
| command_executed | `autonomous` | - | - |
| command_response_ephemeral | `autonomous` | - | - |
| command_response_in_channel | `autonomous` | - | - |
| command_trigger_conflict | `autonomous` | - | - |
| command_endpoint_unreachable | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/public/model/command.go
    - server/channels/app/command.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Custom Slash Commands Blueprint",
  "description": "User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "slash-commands, webhooks, integrations, bots, custom-commands"
}
</script>
