---
title: "Bot Plugin Framework Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Extension framework for bots, apps, and plugins to extend platform behavior through a defined API. 11 fields. 8 outcomes. 3 error codes. rules: general. AGI: su"
---

# Bot Plugin Framework Blueprint

> Extension framework for bots, apps, and plugins to extend platform behavior through a defined API

| | |
|---|---|
| **Feature** | `bot-plugin-framework` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | bots, plugins, apps, extensibility, framework, marketplace |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/bot-plugin-framework.blueprint.yaml) |
| **JSON API** | [bot-plugin-framework.json]({{ site.baseurl }}/api/blueprints/integration/bot-plugin-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Extension Developer | human | Developer who builds and publishes an app or bot extension |
| `admin` | Platform Administrator | human | Administrator who installs, configures, enables, or disables extensions |
| `extension` | Extension / App | system | A packaged extension that runs sandboxed and communicates via the platform API |
| `platform` | Platform Runtime | system | The host platform that manages extension lifecycle and provides accessor APIs |
| `marketplace` | Extension Marketplace | external | External registry or catalogue where extensions are published and discovered |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `app_id` | text | Yes | App / Extension ID |  |
| `name` | text | Yes | Extension Name |  |
| `name_slug` | text | Yes | Name Slug |  |
| `version` | text | Yes | Version |  |
| `required_api_version` | text | Yes | Required API Version |  |
| `description` | text | Yes | Description |  |
| `author_name` | text | Yes | Author Name |  |
| `author_email` | email | No | Author Email |  |
| `status` | select | Yes | Status |  |
| `permissions` | multiselect | No | Declared Permissions |  |
| `settings` | json | No | Configuration Settings |  |

## Rules

- **general:** An extension must declare a required API version; the platform rejects installation if the version is incompatible, Extensions run in an isolated sandbox — they cannot access platform internals directly; all operations go through read, modify, http, and persistence accessors, The constructor may be called more than once; initialization logic must go in the initialize() lifecycle method, Extensions declare permissions upfront; the platform enforces them at runtime and may block undeclared actions, An extension's bot user is derived from the name slug (e.g. name-slug.bot); the platform creates it automatically on install, Extensions may register slash commands, scheduled jobs, API endpoints, UI components, and message handlers, Settings changes trigger the onSettingUpdated lifecycle hook; extensions must not cache settings values outside this hook, An extension in error state must be explicitly re-enabled by an administrator after the underlying issue is resolved, Extensions may be enabled or disabled dynamically at runtime without restarting the platform, Extensions must not store sensitive data in plain text; use the persistence accessor for encrypted storage, The platform calls onInstall, onUninstall, and onUpdate lifecycle hooks at the appropriate times

## Outcomes

### Incompatible_api_version (Priority: 1) — Error: `EXTENSION_INCOMPATIBLE_API_VERSION`

**Given:**
- extension's required API version is higher than the platform's current API version

**Result:** Installation is rejected with a version incompatibility error

### Permission_not_accepted (Priority: 2) — Error: `EXTENSION_PERMISSION_DENIED`

**Given:**
- administrator declines one or more required permissions during installation

**Result:** Installation is aborted; no extension files are persisted

### Extension_error (Priority: 3) — Error: `EXTENSION_RUNTIME_ERROR`

**Given:**
- extension throws an unhandled exception during a lifecycle hook or message handler

**Then:**
- **transition_state** field: `status` from: `running` to: `error`
- **emit_event** event: `extension.error`

**Result:** Extension transitions to error state; administrator is notified and must manually re-enable

### Extension_uninstalled (Priority: 6)

**Given:**
- administrator uninstalls the extension

**Then:**
- **emit_event** event: `extension.uninstalled`

**Result:** Extension is removed; its bot user, registered commands, and stored data are cleaned up

### Extension_updated (Priority: 7)

**Given:**
- a new version of an installed extension is available
- administrator triggers the update

**Then:**
- **emit_event** event: `extension.updated`

**Result:** New version replaces the old one; onUpdate lifecycle hook is called with old and new contexts

### Extension_disabled (Priority: 8)

**Given:**
- extension is in running state
- administrator disables the extension or an error occurs

**Then:**
- **transition_state** field: `status` from: `running` to: `disabled`
- **emit_event** event: `extension.disabled`

**Result:** Extension is stopped; all registered commands and handlers are deactivated

### Extension_enabled (Priority: 9)

**Given:**
- extension is installed and in a disabled or initialized state
- administrator enables the extension

**Then:**
- **transition_state** field: `status` from: `disabled` to: `running`
- **emit_event** event: `extension.enabled`

**Result:** Extension enters running state; its slash commands, handlers, and scheduled jobs become active

### Extension_installed (Priority: 10)

**Given:**
- administrator uploads or selects an extension package
- extension's required API version is compatible with the running platform
- all declared permissions are accepted by the administrator

**Then:**
- **transition_state** field: `status` from: `unknown` to: `initialized`
- **emit_event** event: `extension.installed`

**Result:** Extension is installed, its bot user is created, and onInstall lifecycle hook is called

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EXTENSION_INCOMPATIBLE_API_VERSION` | 400 | This extension requires a newer version of the platform API. Please update the platform before installing. | No |
| `EXTENSION_PERMISSION_DENIED` | 403 | Installation was cancelled because required permissions were not accepted. | No |
| `EXTENSION_RUNTIME_ERROR` | 400 | The extension encountered an error and has been disabled. Please check the extension logs. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `extension.installed` | Fires when an extension is successfully installed for the first time | `app_id`, `name`, `version` |
| `extension.enabled` | Fires when an extension transitions from disabled/initialized to running | `app_id`, `name` |
| `extension.disabled` | Fires when an extension is stopped by an administrator or due to an error | `app_id`, `name` |
| `extension.updated` | Fires when a new version of an installed extension is applied | `app_id`, `name`, `version` |
| `extension.uninstalled` | Fires when an extension is removed from the platform | `app_id`, `name` |
| `extension.error` | Fires when an extension encounters an unhandled runtime error | `app_id`, `name` |
| `extension.setting_updated` | Fires when an administrator changes a setting value for an extension | `app_id`, `name`, `settings` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| slash-commands | recommended | Extensions commonly register slash commands via the plugin framework |
| role-based-access-control | optional | Extensions may declare and enforce custom permissions through RBAC |
| webhook-management | optional | Extensions can register incoming and outgoing webhook handlers |

## AGI Readiness

### Goals

#### Safe Extension Lifecycle Management

Install, enable, disable, update, and remove extensions with sandbox enforcement, permission gating, and lifecycle hooks

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| sandbox_enforcement_rate | 100% | Extension operations that went through accessor APIs / total extension operations |
| error_state_detection_rate | 100% | Unhandled exceptions that transition extension to error state / total unhandled exceptions |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before installing an extension from an external marketplace
- before accepting permissions for an extension with elevated access

### Verification

**Invariants:**

- extensions cannot access platform internals directly; all operations go through accessor APIs
- an extension with an incompatible required API version must not be installed
- an extension in error state must be manually re-enabled by an administrator
- sensitive data must be stored through the encrypted persistence accessor

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| incompatible API version rejected | extension requires API version higher than platform version | installation is attempted | EXTENSION_INCOMPATIBLE_API_VERSION returned and nothing installed |
| runtime error transitions to error state | extension throws unhandled exception in message handler | exception occurs | extension transitions to error state and administrator is notified |

### Composability

**Capabilities:**

- `extension_lifecycle_orchestration`: Manage install, enable, disable, update, and remove lifecycle for sandboxed extensions
- `permission_gated_installation`: Require administrator acceptance of declared permissions before installing an extension

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| isolation | extension_power | sandboxed accessor APIs limit what extensions can do but protect platform integrity |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| install_extension | `human_required` | - | - |
| enable_extension | `supervised` | - | - |
| disable_extension | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 7
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bot Plugin Framework Blueprint",
  "description": "Extension framework for bots, apps, and plugins to extend platform behavior through a defined API. 11 fields. 8 outcomes. 3 error codes. rules: general. AGI: su",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bots, plugins, apps, extensibility, framework, marketplace"
}
</script>
