---
title: "Server Plugin Framework Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Isolated server-side extension system where plugins run as separate processes, communicate with the host via RPC, and react to application lifecycle events thro"
---

# Server Plugin Framework Blueprint

> Isolated server-side extension system where plugins run as separate processes, communicate with the host via RPC, and react to application lifecycle events through a standardized hook interface.


| | |
|---|---|
| **Feature** | `server-plugin-framework` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | plugins, extensions, hooks, rpc, isolation, server-side, extensibility |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/server-plugin-framework.blueprint.yaml) |
| **JSON API** | [server-plugin-framework.json]({{ site.baseurl }}/api/blueprints/integration/server-plugin-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Installs, enables, disables, and configures plugins |
| `plugin_developer` | Plugin Developer | human | Authors the plugin binary and manifest |
| `plugin_process` | Plugin Process | system | Isolated child process hosting the plugin code |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `plugin_id` | text | Yes | Globally unique plugin identifier in reverse-DNS notation (e | Validations: pattern, minLength, maxLength |
| `version` | text | Yes | Semantic version of the plugin (e |  |
| `min_server_version` | text | No | Minimum server version required for this plugin to run |  |
| `executable_path` | text | Yes | Path to the plugin binary within the plugin archive, relative to the plugin root |  |
| `webapp_bundle_path` | text | No | Path to the client-side JavaScript bundle (optional; omit for server-only plugin |  |
| `settings_schema` | json | No | JSON schema defining the plugin's configurable settings and their UI presentatio |  |
| `enabled` | boolean | Yes | Whether the plugin is currently activated |  |
| `cluster_id` | text | No | Cluster node where this plugin instance is running |  |

## States

**State field:** `plugin_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_running` | Yes |  |
| `running` |  |  |
| `failed_to_start` |  |  |
| `failed_to_stay_running` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `not_running` | `running` | system |  |
|  | `running` | `not_running` | system_admin |  |
|  | `not_running` | `failed_to_start` | system |  |
|  | `running` | `failed_to_stay_running` | system |  |

## Rules

- **rule_01:** Plugins run in isolated child processes; a crashing plugin cannot affect the host server or other plugins.
- **rule_02:** The OnConfigurationChange hook is called once before OnActivate; plugins should not call the server API until OnActivate has been entered.
- **rule_03:** If OnActivate returns an error, the plugin transitions to failed_to_start and does not receive any further hooks.
- **rule_04:** Plugins with a webapp bundle are flagged as client-side capable; the server serves the bundle to the browser.
- **rule_05:** Plugin configuration changes are delivered via OnConfigurationChange; plugins must not cache configuration across calls.
- **rule_06:** Plugin ID must be unique across all installed plugins; installing a plugin with a conflicting ID replaces the existing version.
- **rule_07:** Cluster-aware installations run one plugin process per server node; the cluster_id field identifies which node hosts the instance.
- **rule_08:** Plugins can register additional slash commands, HTTP handlers, and WebSocket event listeners during activation.
- **rule_09:** Deactivation is the plugin's final opportunity to use the API; all resources must be released in OnDeactivate.

## Outcomes

### Plugin_activation_failed (Priority: 5) — Error: `PLUGIN_ACTIVATION_FAILED`

**Given:**
- plugin process cannot start or OnActivate returns non-nil error

**Then:**
- **set_field** target: `plugin.state` value: `failed_to_start`
- **emit_event** event: `plugin.activation_failed`

**Result:** Plugin in failed_to_start state; administrator must investigate logs and retry

### Plugin_crashed (Priority: 5)

**Given:**
- plugin process exits unexpectedly while in running state

**Then:**
- **set_field** target: `plugin.state` value: `failed_to_stay_running`
- **emit_event** event: `plugin.crashed`

**Result:** Plugin in failed_to_stay_running; server continues running; plugin can be restarted

### Plugin_installed (Priority: 10)

**Given:**
- actor is system administrator
- plugin archive is a valid bundle with manifest and executable
- plugin_id is unique or replaces an existing version
- min_server_version is satisfied by the current server version

**Then:**
- **create_record** target: `plugin_installation` — Plugin files extracted to plugin directory; manifest validated and stored
- **emit_event** event: `plugin.installed`

**Result:** Plugin available for activation; state is not_running

### Plugin_activated (Priority: 10)

**Given:**
- system admin enables the plugin
- plugin is in not_running or failed state

**Then:**
- **create_record** target: `plugin_process` — Child process spawned; RPC channel established; OnConfigurationChange then OnActivate called
- **emit_event** event: `plugin.activated`

**Result:** Plugin running and receiving hooks

### Plugin_deactivated (Priority: 10)

**Given:**
- system admin disables the plugin or server is shutting down

**Then:**
- **emit_event** event: `plugin.deactivating`
- **delete_record** target: `plugin_process` — OnDeactivate called; process terminated after return
- **emit_event** event: `plugin.deactivated`

**Result:** Plugin process terminated; hooks no longer called

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PLUGIN_ACTIVATION_FAILED` | 500 | The plugin could not be activated. Check server logs for details. | No |
| `PLUGIN_NOT_FOUND` | 404 | Plugin not found. | No |
| `PLUGIN_VERSION_INCOMPATIBLE` | 400 | This plugin requires a newer version of the server. | No |
| `PLUGIN_ID_CONFLICT` | 409 | A plugin with this ID is already installed. | No |
| `PLUGIN_INVALID_MANIFEST` | 400 | The plugin manifest is missing required fields or contains invalid values. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `plugin.installed` | Plugin archive uploaded and extracted | `plugin_id`, `version`, `actor_id`, `timestamp` |
| `plugin.activated` | Plugin process started and running | `plugin_id`, `version`, `cluster_id`, `timestamp` |
| `plugin.deactivated` | Plugin process gracefully stopped | `plugin_id`, `actor_id`, `timestamp` |
| `plugin.crashed` | Plugin process terminated unexpectedly | `plugin_id`, `timestamp` |
| `plugin.activation_failed` | Plugin failed to start or OnActivate returned an error | `plugin_id`, `error_reason`, `timestamp` |
| `plugin.configuration_changed` | Plugin settings were updated; OnConfigurationChange delivered to plugin | `plugin_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| custom-slash-commands | optional | Plugins can register slash commands in addition to custom commands created via the API |
| role-based-access-control | required | Plugin installation and management requires system administrator permission |

## AGI Readiness

### Goals

#### Reliable Server Plugin Framework

Isolated server-side extension system where plugins run as separate processes, communicate with the host via RPC, and react to application lifecycle events through a standardized hook interface.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

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
| plugin_installed | `autonomous` | - | - |
| plugin_activated | `autonomous` | - | - |
| plugin_activation_failed | `autonomous` | - | - |
| plugin_deactivated | `autonomous` | - | - |
| plugin_crashed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 8
  entry_points:
    - server/public/plugin/plugin.go
    - server/public/model/plugin_status.go
    - server/public/model/marketplace_plugin.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Server Plugin Framework Blueprint",
  "description": "Isolated server-side extension system where plugins run as separate processes, communicate with the host via RPC, and react to application lifecycle events thro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "plugins, extensions, hooks, rpc, isolation, server-side, extensibility"
}
</script>
