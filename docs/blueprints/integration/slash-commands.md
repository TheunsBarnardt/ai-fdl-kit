---
title: "Slash Commands Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Register and execute text commands with a / prefix in chat messages. 8 fields. 6 outcomes. 3 error codes. rules: general. AGI: supervised"
---

# Slash Commands Blueprint

> Register and execute text commands with a / prefix in chat messages

| | |
|---|---|
| **Feature** | `slash-commands` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | commands, chat, extensibility, shortcuts, integration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/slash-commands.blueprint.yaml) |
| **JSON API** | [slash-commands.json]({{ site.baseurl }}/api/blueprints/integration/slash-commands.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Any authenticated user who types slash commands in a chat message |
| `platform` | Platform | system | The chat platform that parses messages and dispatches command execution |
| `command_handler` | Command Handler | system | The registered callback or extension that executes the command logic |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `command` | text | Yes | Command Name |  |
| `params` | text | No | Command Parameters |  |
| `room_id` | text | Yes | Room ID |  |
| `user_id` | text | Yes | User ID |  |
| `description` | text | Yes | Description |  |
| `params_example` | text | No | Parameters Example |  |
| `permission` | text | No | Required Permission |  |
| `provides_preview` | boolean | No | Provides Preview |  |

## Rules

- **general:** Command names must be unique across the platform; registering a duplicate command replaces or errors depending on configuration, Command names are lowercased and must contain only alphanumeric characters and hyphens, Command execution is triggered only when the full message starts with /, followed by a registered command name, Commands with a required permission are hidden from users who lack that permission, If provides_preview is true, the platform calls the previewer function as the user types and shows up to 10 preview items, Selecting a preview item triggers executePreviewItem instead of the main executor, Command callbacks receive read-only access to the platform data; mutations go through the modify accessor, Commands may send ephemeral messages back to the invoking user without posting to the room, Unrecognized command names should surface a help hint rather than silently fail, Extensions and apps may register, enable, or disable commands dynamically at runtime

## Outcomes

### Command_not_found (Priority: 1) — Error: `SLASH_COMMAND_NOT_FOUND`

**Given:**
- user sends a message starting with / followed by a name that is not a registered command

**Result:** Platform surfaces a help message or ignores the unknown command

### Permission_denied (Priority: 2) — Error: `SLASH_COMMAND_PERMISSION_DENIED`

**Given:**
- user sends a message starting with / followed by a registered command name
- command requires a permission the user does not hold

**Result:** Command is not displayed to the user and execution is rejected

### Command_disabled (Priority: 3) — Error: `SLASH_COMMAND_DISABLED`

**Given:**
- user invokes a command that is currently disabled by an extension or admin

**Result:** Execution is blocked and an informational message may be shown to the user

### Preview_shown (Priority: 8)

**Given:**
- user is typing a command whose provides_preview is true
- user has not yet submitted the message

**Then:**
- **emit_event** event: `slash_command.preview_requested`

**Result:** Platform calls the previewer and displays up to 10 inline preview items to the user

### Preview_item_selected (Priority: 9)

**Given:**
- preview was shown
- user selects one of the preview items

**Then:**
- **emit_event** event: `slash_command.preview_item_selected`

**Result:** Platform calls executePreviewItem with the selected item instead of the main executor

### Command_executed (Priority: 10)

**Given:**
- user sends a message starting with / followed by a registered command name
- user has the required permission for the command (if any)

**Then:**
- **emit_event** event: `slash_command.executed`

**Result:** Command handler is invoked with the command name, params, room context, and user context

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLASH_COMMAND_NOT_FOUND` | 404 | The command you entered was not found. Type /help to see available commands. | No |
| `SLASH_COMMAND_PERMISSION_DENIED` | 403 | You do not have permission to use this command. | No |
| `SLASH_COMMAND_DISABLED` | 400 | This command is currently disabled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `slash_command.executed` | Fires when a registered slash command is successfully dispatched to its handler | `command`, `params`, `room_id`, `user_id` |
| `slash_command.preview_requested` | Fires when the platform requests inline preview results while a user is typing a command | `command`, `params`, `room_id`, `user_id` |
| `slash_command.preview_item_selected` | Fires when a user selects one of the inline preview items | `command`, `params`, `room_id`, `user_id` |
| `slash_command.registered` | Fires when a new slash command is registered by a handler or extension | `command`, `description`, `permission` |
| `slash_command.unregistered` | Fires when a slash command is removed or disabled | `command` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bot-plugin-framework | recommended | Extensions and bots use the plugin framework to register slash commands dynamically |
| role-based-access-control | optional | Permission-gated commands rely on RBAC to determine access |

## AGI Readiness

### Goals

#### Extensible Command Dispatch

Parse, authorise, and dispatch slash commands from chat messages to registered handlers with permission enforcement and preview support

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| permission_enforcement_rate | 100% | Permission-gated commands hidden from and rejected for unauthorised users / total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before registering a system-level slash command that affects all users

### Verification

**Invariants:**

- command names must be unique across the platform
- permission-required commands are hidden from users who lack the permission
- unrecognised commands surface a help hint rather than silently failing

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| permission-gated command rejected | user without required permission types a permission-gated command | message is submitted | SLASH_COMMAND_PERMISSION_DENIED and command not displayed to the user |
| preview shown while typing | command has provides_preview true and user is still typing | user types the command | up to 10 inline preview items displayed |

### Composability

**Capabilities:**

- `command_registration`: Register and unregister slash commands dynamically by extensions and bots
- `inline_preview_dispatch`: Call command preview functions while user types and display results inline

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| discoverability | strict_failure | unknown commands show a help hint rather than an error to guide users to available commands |

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
  "name": "Slash Commands Blueprint",
  "description": "Register and execute text commands with a / prefix in chat messages. 8 fields. 6 outcomes. 3 error codes. rules: general. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "commands, chat, extensibility, shortcuts, integration"
}
</script>
