---
title: "Remote Device Commands Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Send control commands from the platform to GPS tracking hardware using the device's native protocol channel or SMS fallback, supporting engine control, configur"
---

# Remote Device Commands Blueprint

> Send control commands from the platform to GPS tracking hardware using the device's native protocol channel or SMS fallback, supporting engine control, configuration, alarm management, and informat...

| | |
|---|---|
| **Feature** | `remote-device-commands` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, commands, remote-control, fleet, iot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/remote-device-commands.blueprint.yaml) |
| **JSON API** | [remote-device-commands.json]({{ site.baseurl }}/api/blueprints/integration/remote-device-commands.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_operator` | Fleet Operator | human | Initiates commands to devices through the platform interface |
| `platform` | Tracking Platform | system | Validates, routes, and delivers commands to devices; queues when device is offline |
| `device` | GPS Device | external | Receives and executes commands, acknowledges via subsequent position or dedicated response |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes | Target device for the command |  |
| `type` | select | Yes | Command type identifier. Common types: engine_stop, engine_resume, reboot_device, power_off, fact... |  |
| `text_channel` | boolean | No | When true, command is sent via SMS rather than the data channel; requires device phone number |  |
| `description` | text | No | Human-readable label for this saved command |  |
| `attributes` | json | No | Command-specific parameters. Common keys: frequency (reporting interval in seconds), timezone, de... |  |

## Rules

- **access:**
  - **permission_required:** Commands can only be sent to devices the requesting user has permission to manage
  - **limit_commands_restriction:** Users with the limitCommands restriction cannot send commands
- **validation:**
  - **protocol_support_check:** The platform checks whether the device's current protocol supports the requested command type; unsupported commands are rejected before delivery
  - **text_channel_requires_phone:** Commands sent via the text channel require the device to have a phone number configured
- **processing:**
  - **offline_queuing:** When a device is offline (no active TCP connection) and text_channel is false, the command is queued and delivered when the device next connects
  - **custom_commands_always_accepted:** Custom commands (type = custom) are always accepted regardless of protocol capability declarations
  - **engine_control_confirmation:** engine_stop and engine_resume require extra authorisation and must be confirmed before execution
  - **saved_commands:** Saved commands (stored with description) can be recalled and re-sent without re-entering parameters

## Outcomes

### Permission_denied (Priority: 2) — Error: `COMMAND_PERMISSION_DENIED`

**Given:**
- ANY: user does not have access to the target device OR user has the limitCommands restriction

**Result:** Command is rejected; no information about the device is disclosed

### Unsupported_command (Priority: 3) — Error: `COMMAND_UNSUPPORTED_BY_PROTOCOL`

**Given:**
- device protocol does not support the requested command type
- command type is not custom

**Result:** Command is rejected; operator is informed that the device does not support this command

### Command_queued (Priority: 8)

**Given:**
- device is currently offline
- text_channel is false
- user has permission and command type is supported

**Then:**
- **create_record** target: `queued_command` — Command stored for deferred delivery
- **emit_event** event: `command.queued`

**Result:** Command stored in queue; delivered automatically when device reconnects

### Command_sent (Priority: 10)

**Given:**
- fleet_operator selects command type and target device
- user has permission to manage the device
- user does not have limitCommands restriction
- device protocol supports the command type or type is custom
- device is online on the data channel or text_channel is true

**Then:**
- **emit_event** event: `command.sent`

**Result:** Command is dispatched to the device and acknowledged or executed asynchronously

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMMAND_UNSUPPORTED_BY_PROTOCOL` | 404 | The target device does not support this command type | No |
| `COMMAND_PERMISSION_DENIED` | 403 | You do not have permission to send commands to this device | No |
| `COMMAND_DEVICE_NOT_FOUND` | 404 | The specified device does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `command.sent` | A command was dispatched to a device | `device_id`, `command_type`, `channel`, `sent_at`, `operator_id` |
| `command.queued` | A command was queued for offline delivery | `device_id`, `command_type`, `queued_at` |
| `command.delivered` | A queued command was delivered upon device reconnection | `device_id`, `command_type`, `delivered_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-device-registration | required | Devices must be registered to receive commands |
| fleet-device-sharing | required | Permission model controls who can send commands |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 10
  entry_points:
    - src/main/java/org/traccar/model/Command.java
    - src/main/java/org/traccar/api/resource/CommandResource.java
    - src/main/java/org/traccar/command/CommandSenderManager.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Remote Device Commands Blueprint",
  "description": "Send control commands from the platform to GPS tracking hardware using the device's native protocol channel or SMS fallback, supporting engine control, configur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, commands, remote-control, fleet, iot"
}
</script>
