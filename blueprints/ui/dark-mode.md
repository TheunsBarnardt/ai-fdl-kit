<!-- AUTO-GENERATED FROM dark-mode.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dark Mode

> Theme toggle supporting light, dark, and system-preference modes with CSS custom properties, user preference persistence, smooth transitions, and flash-of-wrong-theme prevention.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** dark-mode · theming · css-custom-properties · prefers-color-scheme · user-preferences · color-scheme

## What this does

Theme toggle supporting light, dark, and system-preference modes with CSS custom properties, user preference persistence, smooth transitions, and flash-of-wrong-theme prevention.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **theme** *(select, required)* — Theme
- **user_preference** *(select, optional)* — User Preference
- **system_preference** *(select, optional)* — System Preference
- **resolved_theme** *(select, required)* — Resolved Theme
- **transition_duration_ms** *(number, optional)* — Transition Duration (ms)
- **component_override** *(json, optional)* — Per-Component Theme Override
- **css_variables** *(json, optional)* — CSS Custom Properties Map

## What must be true

- **respect_system_preference:** When the user has not explicitly chosen a theme (preference is "system"), the resolved theme must match the operating system's prefers-color-scheme media query value.
- **no_flash_on_load:** Theme must be resolved and applied before the first paint. Use an inline script in the document head that reads persisted preference from storage and sets the theme class/attribute on the html element synchronously.
- **transition_duration:** Color transitions between themes must use a 200ms duration on background-color, color, and border-color properties. Transitions must not apply on initial page load to prevent visual flicker.
- **persist_user_choice:** When a user explicitly selects a theme, persist the choice to local storage (or equivalent) so it survives page reloads and new sessions.
- **system_preference_listener:** Register a matchMedia listener for prefers-color-scheme changes. When the user's preference is "system" and the OS theme changes, update the resolved theme in real time without page reload.
- **per_component_overrides:** Individual components may override the global theme via a data attribute or prop. Overridden components must scope their CSS custom properties to avoid leaking into child components.
- **css_custom_properties_only:** All theme-dependent colors, shadows, and borders must be defined as CSS custom properties. No hardcoded color values in component styles.

## Success & failure scenarios

**✅ Success paths**

- **User Selects Theme** — when user explicitly selects a theme (light or dark), then Theme changes immediately and preference is persisted to storage.
- **System Preference Applied** — when user_preference eq "system"; operating system reports a preferred color scheme via prefers-color-scheme, then Theme follows the operating system preference automatically.
- **System Preference Changes Live** — when user_preference eq "system"; operating system color scheme changes while page is open, then Theme updates in real time when OS color scheme changes.
- **Page Loads Without Flash** — when page is loading for the first time or after navigation; persisted theme preference exists in storage, then Page renders with correct theme from the first frame with no flash.
- **Component Overrides Theme** — when a component specifies a theme override different from the global theme, then Component displays in its overridden theme while rest of page uses global theme.
- **No Persisted Preference** — when user_preference not_exists; page loads for the first time, then First-time visitors see the theme matching their OS preference.

## Errors it can return

- `THEME_STORAGE_UNAVAILABLE` — Unable to persist theme preference. Local storage may be disabled.
- `THEME_INVALID_VALUE` — Theme value must be one of: light, dark, or system.
- `THEME_OVERRIDE_SCOPE_LEAK` — Component theme override is leaking CSS custom properties to child elements.

## Connects to

- **theme-configuration** *(required)* — Dark mode relies on the theme configuration system for CSS custom property definitions
- **accessibility** *(recommended)* — Both light and dark themes must independently meet WCAG AA contrast ratios
- **responsive-layout** *(optional)* — Theme toggle UI may need responsive positioning across breakpoints

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/dark-mode/) · **Spec source:** [`dark-mode.blueprint.yaml`](./dark-mode.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
