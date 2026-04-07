---
title: "Theme Configuration Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Define and customize design tokens (colors, spacing, typography, breakpoints) that power a CSS framework. 9 fields. 6 outcomes. 3 error codes. rules: naming, in"
---

# Theme Configuration Blueprint

> Define and customize design tokens (colors, spacing, typography, breakpoints) that power a CSS framework

| | |
|---|---|
| **Feature** | `theme-configuration` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-system, theming, customization, tokens |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/theme-configuration.blueprint.yaml) |
| **JSON API** | [theme-configuration.json]({{ site.baseurl }}/api/blueprints/ui/theme-configuration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Team member configuring design tokens for a project |
| `design_system` | Design System Engine | system | CSS framework that generates utilities from theme configuration |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `theme_key` | text | Yes | Theme Key |  |
| `theme_value` | text | Yes | CSS Value |  |
| `color_palette` | select | No | Color Namespace |  |
| `spacing_scale` | text | No | Spacing Namespace |  |
| `breakpoint_name` | text | No | Breakpoint Name |  |
| `breakpoint_value` | text | No | Breakpoint Value |  |
| `extend_mode` | boolean | No | Extend Mode |  |
| `prefix` | text | No | Utility Prefix |  |
| `dark_mode_strategy` | select | No | Dark Mode Strategy |  |

## States

**State field:** `theme_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `defined` |  |  |
| `resolved` | Yes |  |
| `referenced` |  |  |
| `deprecated` |  |  |

## Rules

- **naming:** Theme keys use CSS custom property format: --namespace-name (kebab-case after double dash), Color palettes must use 3-digit or 6-digit hex (#fff, #ffffff), rgb(), or hsl() format, Spacing values must be valid CSS lengths (px, rem, em, %)
- **inheritance:** Extend mode (theme.extend) merges with defaults; non-extend mode replaces defaults, Plugin-provided theme values take precedence over user config when using extend
- **constraints:** Theme key cannot be just --* (wildcard reset); must be --namespace or --namespace-value, Breakpoint values must be ordered from smallest to largest for responsive cascading, Dark mode strategy cannot be both 'class' and 'selector' simultaneously

## Outcomes

### Define_color_palette (Priority: 1)

**Given:**
- Developer provides a color name (e.g., 'primary') and hex value (e.g., '#3b82f6')
- Developer decides whether to extend default colors or replace them

**Then:**
- **set_field** target: `theme_value` value: `#3b82f6`
- **emit_event** event: `theme.color_defined`

**Result:** Color palette entry created; utilities like 'bg-primary', 'text-primary' become available

### Extend_spacing_scale (Priority: 2)

**Given:**
- Developer provides custom spacing multiplier (e.g., xs: '0.5rem')
- extend_mode is true

**Then:**
- **create_record**
- **emit_event** event: `theme.spacing_extended`

**Result:** New spacing value merged with defaults; utilities like 'p-xs', 'gap-xs' available

### Configure_responsive_breakpoints (Priority: 3)

**Given:**
- Developer defines custom breakpoint (e.g., sm: '640px', tablet: '768px')

**Then:**
- **set_field** target: `breakpoint_value` value: `640px`
- **transition_state** field: `theme_status` from: `defined` to: `resolved`

**Result:** Breakpoint registered; responsive variants (sm:, tablet:) auto-generated from CSS media queries

### Enable_dark_mode (Priority: 4)

**Given:**
- Developer sets darkMode strategy (e.g., 'class', 'media', or custom)

**Then:**
- **set_field** target: `dark_mode_strategy` value: `class`
- **emit_event** event: `theme.dark_mode_enabled`

**Result:** Dark mode variant (dark:) generated; utilities respond to dark mode selector

### Apply_prefix_to_utilities (Priority: 5)

**Given:**
- prefix field is set (e.g., 'tw-')

**Then:**
- **set_field** target: `prefix` value: `tw-`

**Result:** All utility class names prefixed (flex → tw-flex, p-4 → tw-p-4)

### Theme_value_not_found (Priority: 10) — Error: `THEME_VALUE_NOT_FOUND`

**Given:**
- Utility references a theme key that does not exist (e.g., text-[theme(--color-missing)])

**Then:**
- **emit_event** event: `theme.error_invalid_reference`

**Result:** Candidate marked invalid; utility not generated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `THEME_VALUE_NOT_FOUND` | 400 | Theme key does not exist. Check spelling and ensure the key is defined in theme config. | No |
| `INVALID_THEME_FORMAT` | 400 | Theme value does not match expected CSS format (hex, rgb, hsl, length). | No |
| `BREAKPOINT_ORDER_INVALID` | 400 | Breakpoints must be ordered from smallest to largest for responsive cascading. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `theme.color_defined` |  | `color_name`, `color_value`, `timestamp` |
| `theme.spacing_extended` |  | `spacing_name`, `spacing_value` |
| `theme.dark_mode_enabled` |  | `dark_mode_strategy` |
| `theme.error_invalid_reference` |  | `missing_key`, `utility_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| utility-composition | recommended | Uses theme values to generate utilities |
| plugin-development | optional | Plugins can extend theme with custom values |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript + CSS
  framework: CSS utility framework
  core_engine: Rust (crates/oxide)
  config_format: JavaScript/TypeScript or YAML
source_location: packages/tailwindcss/src
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Theme Configuration Blueprint",
  "description": "Define and customize design tokens (colors, spacing, typography, breakpoints) that power a CSS framework. 9 fields. 6 outcomes. 3 error codes. rules: naming, in",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, theming, customization, tokens"
}
</script>
