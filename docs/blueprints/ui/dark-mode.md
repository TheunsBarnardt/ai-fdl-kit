---
title: "Dark Mode Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Theme toggle supporting light, dark, and system-preference modes with CSS custom properties, user preference persistence, smooth transitions, and flash-of-wrong"
---

# Dark Mode Blueprint

> Theme toggle supporting light, dark, and system-preference modes with CSS custom properties, user preference persistence, smooth transitions, and flash-of-wrong-theme prevention.


| | |
|---|---|
| **Feature** | `dark-mode` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | dark-mode, theming, css-custom-properties, prefers-color-scheme, user-preferences, color-scheme |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/dark-mode.blueprint.yaml) |
| **JSON API** | [dark-mode.json]({{ site.baseurl }}/api/blueprints/ui/dark-mode.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `theme` | select | Yes | Theme | Validations: required |
| `user_preference` | select | No | User Preference |  |
| `system_preference` | select | No | System Preference |  |
| `resolved_theme` | select | Yes | Resolved Theme |  |
| `transition_duration_ms` | number | No | Transition Duration (ms) | Validations: min, max |
| `component_override` | json | No | Per-Component Theme Override |  |
| `css_variables` | json | No | CSS Custom Properties Map |  |

## Rules

- **respect_system_preference:**
  - **description:** When the user has not explicitly chosen a theme (preference is "system"), the resolved theme must match the operating system's prefers-color-scheme media query value.

- **no_flash_on_load:**
  - **description:** Theme must be resolved and applied before the first paint. Use an inline script in the document head that reads persisted preference from storage and sets the theme class/attribute on the html element synchronously.

- **transition_duration:**
  - **description:** Color transitions between themes must use a 200ms duration on background-color, color, and border-color properties. Transitions must not apply on initial page load to prevent visual flicker.

- **persist_user_choice:**
  - **description:** When a user explicitly selects a theme, persist the choice to local storage (or equivalent) so it survives page reloads and new sessions.

- **system_preference_listener:**
  - **description:** Register a matchMedia listener for prefers-color-scheme changes. When the user's preference is "system" and the OS theme changes, update the resolved theme in real time without page reload.

- **per_component_overrides:**
  - **description:** Individual components may override the global theme via a data attribute or prop. Overridden components must scope their CSS custom properties to avoid leaking into child components.

- **css_custom_properties_only:**
  - **description:** All theme-dependent colors, shadows, and borders must be defined as CSS custom properties. No hardcoded color values in component styles.


## Outcomes

### User_selects_theme (Priority: 1)

**Given:**
- user explicitly selects a theme (light or dark)

**Then:**
- **set_field** target: `user_preference` — Store chosen theme as user preference
- **set_field** target: `resolved_theme` — Apply the chosen theme immediately
- **set_field** target: `theme` — Update theme field to the explicit choice
- **emit_event** event: `theme.changed`

**Result:** Theme changes immediately and preference is persisted to storage

### System_preference_applied (Priority: 2)

**Given:**
- `user_preference` (db) eq `system`
- operating system reports a preferred color scheme via prefers-color-scheme

**Then:**
- **set_field** target: `system_preference` — Capture OS color scheme value
- **set_field** target: `resolved_theme` — Resolve theme to match OS preference
- **emit_event** event: `theme.changed`

**Result:** Theme follows the operating system preference automatically

### System_preference_changes_live (Priority: 3)

**Given:**
- `user_preference` (db) eq `system`
- operating system color scheme changes while page is open

**Then:**
- **set_field** target: `system_preference` — Update cached system preference
- **set_field** target: `resolved_theme` — Resolve theme to new OS preference
- **emit_event** event: `theme.system_preference_changed`

**Result:** Theme updates in real time when OS color scheme changes

### Page_loads_without_flash (Priority: 4)

**Given:**
- page is loading for the first time or after navigation
- persisted theme preference exists in storage

**Then:**
- **set_field** target: `resolved_theme` — Theme applied synchronously before first paint via inline script

**Result:** Page renders with correct theme from the first frame with no flash

### Component_overrides_theme (Priority: 5)

**Given:**
- a component specifies a theme override different from the global theme

**Then:**
- **set_field** target: `component_override` — Component renders with its own scoped CSS custom properties

**Result:** Component displays in its overridden theme while rest of page uses global theme

### No_persisted_preference (Priority: 6)

**Given:**
- `user_preference` (db) not_exists
- page loads for the first time

**Then:**
- **set_field** target: `theme` value: `system` — Default to system preference mode
- **set_field** target: `resolved_theme` — Resolve theme from OS prefers-color-scheme

**Result:** First-time visitors see the theme matching their OS preference

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `THEME_STORAGE_UNAVAILABLE` | 500 | Unable to persist theme preference. Local storage may be disabled. | No |
| `THEME_INVALID_VALUE` | 400 | Theme value must be one of: light, dark, or system. | No |
| `THEME_OVERRIDE_SCOPE_LEAK` | 500 | Component theme override is leaking CSS custom properties to child elements. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `theme.changed` | Theme was changed by user action or system preference | `theme`, `resolved_theme`, `source` |
| `theme.system_preference_changed` | Operating system color scheme changed while user preference is set to system | `system_preference`, `resolved_theme` |
| `theme.preference_persisted` | User theme preference was saved to persistent storage | `user_preference` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| theme-configuration | required | Dark mode relies on the theme configuration system for CSS custom property definitions |
| accessibility | recommended | Both light and dark themes must independently meet WCAG AA contrast ratios |
| responsive-layout | optional | Theme toggle UI may need responsive positioning across breakpoints |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dark Mode Blueprint",
  "description": "Theme toggle supporting light, dark, and system-preference modes with CSS custom properties, user preference persistence, smooth transitions, and flash-of-wrong",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "dark-mode, theming, css-custom-properties, prefers-color-scheme, user-preferences, color-scheme"
}
</script>
