---
title: "Plugin Overrides Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels. 6 fields. 6 outcomes. 3 error cod"
---

# Plugin Overrides Blueprint

> Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels

| | |
|---|---|
| **Feature** | `plugin-overrides` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | plugin, override, extensibility, customization, editor-plugins |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/plugin-overrides.blueprint.yaml) |
| **JSON API** | [plugin-overrides.json]({{ site.baseurl }}/api/blueprints/integration/plugin-overrides.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `plugin_author` | Plugin Author | human | Developer who creates plugins to extend editor behavior |
| `plugin_loader` | Plugin Loader | system | System that merges and composes plugin overrides at initialization |
| `editor_user` | Editor User | human | Person using the editor with plugins active |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `plugin_name` | text | No | Plugin Name |  |
| `plugin_label` | text | No | Plugin Label |  |
| `plugin_icon` | text | No | Plugin Icon |  |
| `overrides` | json | No | Override Definitions |  |
| `field_transforms` | json | No | Field Transforms |  |
| `mobile_panel_height` | select | No | Mobile Panel Height |  |

## Rules

- **override_points:**
  - **available_overrides:** header, header_actions, preview, puck, fields, field_label, field_types, outline, drawer, drawer_item, component_overlay, iframe, action_bar
  - **total_count:** 13
- **override_composition:**
  - **wrapping_pattern:** true
  - **array_order:** true
  - **children_passthrough_required:** true
  - **immutable_plugins:** true
- **field_type_overrides:**
  - **per_type:** true
  - **same_wrapping_pattern:** true
- **built_in_plugins:**
  - **blocks_plugin:** true
  - **fields_plugin:** true
  - **outline_plugin:** true
  - **legacy_sidebar_plugin:** true
- **plugin_structure:**
  - **render_function:** true
  - **overrides_map:** true
  - **field_transforms_map:** true
  - **name_and_label:** true
  - **icon:** true
- **override_data_shapes:**
  - **header_receives:** actions, children
  - **header_actions_receives:** children
  - **fields_receives:** children, is_loading, item_selector
  - **field_label_receives:** children, icon, label, element_type, read_only
  - **component_overlay_receives:** children, hover, is_selected, component_id, component_type
  - **iframe_receives:** children, document
  - **action_bar_receives:** label, children, parent_action
  - **drawer_item_receives:** children, name
- **default_fallback:**
  - **passthrough_default:** true

## Outcomes

### Load_plugins (Priority: 1)

**Given:**
- editor initializes with a plugins array

**Then:**
- **call_service** target: `plugin_loader` — Iterate through plugins array, collect overrides from each
- **call_service** target: `override_composer` — For each override point, compose a chain: plugin1(plugin2(plugin3(default)))
- **set_field** target: `loaded_overrides` — Store the composed override functions for use by all editor components
- **emit_event** event: `plugin.loaded`

**Result:** All plugin overrides composed and ready for rendering

### Render_with_override (Priority: 2)

**Given:**
- an editor component renders at an override point
- one or more plugins have overrides for this point

**Then:**
- **call_service** target: `loaded_overrides` — Call the composed override function with the override point's props and default children

**Result:** Plugin-customized UI renders in place of or wrapping the default

### Render_custom_field_type (Priority: 3)

**Given:**
- a component field has a specific type (e.g., text, select)
- a plugin overrides that field type's rendering

**Then:**
- **call_service** target: `field_type_override` — Call the composed field type override with field props, value, onChange, and default children

**Result:** Custom field editor renders for this field type

### Render_plugin_panel (Priority: 4)

**Given:**
- a plugin defines a render function and a label

**Then:**
- **call_service** target: `plugin_panel_renderer` — Render plugin's panel in the sidebar with its icon and label as a tab

**Result:** Plugin panel appears as a sidebar tab that users can switch to

### Apply_field_transforms (Priority: 5)

**Given:**
- a plugin defines field transform functions

**Then:**
- **call_service** target: `transform_merger` — Merge plugin's field transforms with existing transforms (plugin transforms override defaults)

**Result:** Custom data transformation applied during field resolution

### Override_passthrough (Priority: 6)

**Given:**
- no plugin provides an override for a specific point

**Then:**
- **call_service** target: `default_override` — Render default passthrough component that simply renders children

**Result:** Default editor UI renders unchanged

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PLUGIN_LOAD_FAILED` | 500 | Failed to load plugin | No |
| `OVERRIDE_RENDER_FAILED` | 500 | Plugin override failed to render | No |
| `CHILDREN_NOT_PASSED` | 500 | Plugin override must pass children to maintain the composition chain | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `plugin.loaded` | Plugins were loaded and overrides composed | `plugin_count`, `override_count` |
| `plugin.panel.activated` | User switched to a plugin's sidebar panel | `plugin_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| component-registry | required | Plugins can customize component rendering and field editing |
| field-transforms | recommended | Plugins can provide custom field transform functions |
| editor-state | required | Plugin state and loaded overrides stored in the central store |

## AGI Readiness

### Goals

#### Reliable Plugin Overrides

Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels

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

- before making irreversible changes

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
| `component_registry` | component-registry | degrade |
| `editor_state` | editor-state | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| load_plugins | `autonomous` | - | - |
| render_with_override | `supervised` | - | - |
| render_custom_field_type | `autonomous` | - | - |
| render_plugin_panel | `autonomous` | - | - |
| apply_field_transforms | `autonomous` | - | - |
| override_passthrough | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 25
  entry_points:
    - types/API/Overrides.ts
    - lib/load-overrides.ts
    - lib/use-loaded-overrides.ts
    - plugins/
    - types/API/index.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Plugin Overrides Blueprint",
  "description": "Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels. 6 fields. 6 outcomes. 3 error cod",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "plugin, override, extensibility, customization, editor-plugins"
}
</script>
