---
title: "Plugin Development Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Create and register plugins to extend CSS framework with custom utilities, variants, and theme values. 9 fields. 9 outcomes. 3 error codes. rules: plugin_format"
---

# Plugin Development Blueprint

> Create and register plugins to extend CSS framework with custom utilities, variants, and theme values

| | |
|---|---|
| **Feature** | `plugin-development` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | extensibility, plugins, custom-utilities, theme-extension |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/plugin-development.blueprint.yaml) |
| **JSON API** | [plugin-development.json]({{ site.baseurl }}/api/blueprints/integration/plugin-development.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `plugin_developer` | Plugin Developer | human | Creates custom utilities or theme extensions |
| `framework_engine` | Framework Engine | system | CSS framework that processes and applies plugins |
| `consumer_project` | Consumer Project | system | Project that installs and uses the plugin |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `plugin_name` | text | Yes | Plugin Name |  |
| `plugin_type` | select | Yes | Plugin Type |  |
| `utility_name` | text | No | Utility Name |  |
| `utility_values` | json | No | Utility Values |  |
| `variant_name` | text | No | Variant Name |  |
| `variant_selector` | text | No | Variant Selector |  |
| `plugin_config` | json | No | Plugin Configuration |  |
| `plugin_options` | json | No | Plugin Options |  |
| `theme_namespace` | text | No | Theme Namespace |  |

## States

**State field:** `plugin_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `created` |  |  |
| `registered` | Yes |  |
| `loaded` |  |  |
| `applied` |  |  |
| `disabled` |  |  |

## Rules

- **plugin_format:** Plugin must export a function that receives plugin API utilities (addBase, addUtility, addVariant), Plugin can optionally return a config object to extend theme
- **registration:** Plugin must be registered in project config under plugins array, Plugins are applied in order; later plugins can override earlier ones
- **naming_conventions:** Custom utility names use kebab-case (e.g., 'prose-sm', 'card-outlined'), Custom variant names use kebab-case (e.g., 'group-hover', 'supports-grid'), Theme extension keys must match framework namespace format (--namespace-value)
- **config_merge:** Plugin config extends theme; conflicting keys in user config take precedence, Theme.extend in plugin is recursively merged with user theme.extend
- **scope:** Plugin utilities and variants are global; they apply to all compiled CSS, Plugin theme values are available via theme() function in arbitrary values

## Outcomes

### Create_simple_utility (Priority: 1)

**Given:**
- Plugin developer creates a utility for card layout
- Utility should have responsive values (sm: small-size, md: medium-size)

**Then:**
- **create_record**
- **emit_event** event: `plugin.utility_created`

**Result:** Custom utility registered; available in compiled CSS (e.g., 'card', 'sm:card')

### Extend_theme_with_colors (Priority: 2)

**Given:**
- Plugin provides custom color palette (brand-primary: #FF6B35, brand-secondary: #004E89)
- Plugin returns config object with colors

**Then:**
- **create_record**
- **emit_event** event: `plugin.theme_extended`

**Result:** Colors available in utilities (text-brand-primary, bg-brand-secondary) and theme() function

### Create_custom_variant (Priority: 3)

**Given:**
- Plugin developer creates variant for 'even-child' pseudo-selector
- Selector provided: '&:nth-child(even)'

**Then:**
- **create_record**
- **emit_event** event: `plugin.variant_created`

**Result:** Custom variant available (even-child:flex, md:even-child:bg-gray-100)

### Plugin_with_options (Priority: 4)

**Given:**
- Plugin created with plugin.withOptions to accept configuration
- Consumer passes options when registering plugin

**Then:**
- **set_field** target: `plugin_options` value: `{prefix: 'tw-', customColor: '#FF0000'}`
- **emit_event** event: `plugin.instantiated_with_options`

**Result:** Plugin instance created with custom options; utilities and theme generated based on options

### Plugin_adds_base_styles (Priority: 5)

**Given:**
- Plugin provides reset or base styles for typography
- Plugin calls addBase({ h1: { fontSize: '2.5rem', fontWeight: 'bold' } })

**Then:**
- **emit_event** event: `plugin.base_styles_added`

**Result:** Base styles injected at @layer base; applied to matched selectors without class needed

### Multiple_utilities_single_plugin (Priority: 6)

**Given:**
- Plugin provides multiple utilities (prose-sm, prose-base, prose-lg)

**Then:**
- **create_record**

**Result:** All utilities registered; each available with responsive variants (md:prose-base, lg:prose-lg)

### Config_override_by_user (Priority: 7)

**Given:**
- Plugin extends theme with color (brand: '#FF6B35')
- User config also defines brand color (brand: '#FF0000')

**Then:**
- **set_field** target: `theme_namespace` value: `{brand: '#FF0000'}`

**Result:** User-defined color takes precedence; utilities use user's color, not plugin's

### Plugin_load_failure (Priority: 10) — Error: `PLUGIN_LOAD_FAILED`

**Given:**
- Plugin module fails to load or export invalid structure
- Plugin does not export a function

**Then:**
- **emit_event** event: `plugin.load_error`

**Result:** Build fails; error message indicates which plugin caused failure

### Plugin_type_mismatch (Priority: 11) — Error: `INVALID_PLUGIN_API_USAGE`

**Given:**
- Plugin calls addUtility with invalid value structure
- Or addVariant with invalid selector syntax

**Then:**
- **emit_event** event: `plugin.validation_error`

**Result:** Build fails; error indicates which API call was invalid

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PLUGIN_LOAD_FAILED` | 400 | Failed to load plugin module. Check that the plugin is properly exported and accessible. | No |
| `INVALID_PLUGIN_API_USAGE` | 400 | Plugin API call is invalid. Verify utility/variant definition matches expected format. | No |
| `PLUGIN_THEME_CONFLICT` | 400 | Plugin theme values conflict with framework reserved keys. Use a custom namespace. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `plugin.utility_created` |  | `utility_name`, `utility_values` |
| `plugin.variant_created` |  | `variant_name`, `variant_selector` |
| `plugin.theme_extended` |  | `theme_namespace`, `new_values` |
| `plugin.instantiated_with_options` |  | `plugin_name`, `options` |
| `plugin.base_styles_added` |  | `base_rules` |
| `plugin.load_error` |  | `plugin_name`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| theme-configuration | recommended | Plugins can extend theme with custom values |
| utility-composition | recommended | Custom utilities composed with variants like built-in utilities |
| build-integration | optional | Plugins loaded and applied during build process |

## AGI Readiness

### Goals

#### Reliable Plugin Development

Create and register plugins to extend CSS framework with custom utilities, variants, and theme values

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_simple_utility | `supervised` | - | - |
| extend_theme_with_colors | `autonomous` | - | - |
| create_custom_variant | `supervised` | - | - |
| plugin_with_options | `autonomous` | - | - |
| plugin_adds_base_styles | `autonomous` | - | - |
| multiple_utilities_single_plugin | `autonomous` | - | - |
| config_override_by_user | `supervised` | - | - |
| plugin_load_failure | `autonomous` | - | - |
| plugin_type_mismatch | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript / JavaScript
  api_style: Functional (builder pattern)
  pattern: Factory pattern (plugin.withOptions for configurable plugins)
source_location: packages/tailwindcss/src
plugin_patterns:
  - "Simple: plugin(({ addBase, addUtility, addVariant }) => { ... })"
  - "Configurable: plugin.withOptions((options) => (api) => { ... })"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Plugin Development Blueprint",
  "description": "Create and register plugins to extend CSS framework with custom utilities, variants, and theme values. 9 fields. 9 outcomes. 3 error codes. rules: plugin_format",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "extensibility, plugins, custom-utilities, theme-extension"
}
</script>
