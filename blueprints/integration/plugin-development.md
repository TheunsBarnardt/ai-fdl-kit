<!-- AUTO-GENERATED FROM plugin-development.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Plugin Development

> Create and register plugins to extend CSS framework with custom utilities, variants, and theme values

**Category:** Integration · **Version:** 1.0.0 · **Tags:** extensibility · plugins · custom-utilities · theme-extension

## What this does

Create and register plugins to extend CSS framework with custom utilities, variants, and theme values

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **plugin_name** *(text, required)* — Plugin Name
- **plugin_type** *(select, required)* — Plugin Type
- **utility_name** *(text, optional)* — Utility Name
- **utility_values** *(json, optional)* — Utility Values
- **variant_name** *(text, optional)* — Variant Name
- **variant_selector** *(text, optional)* — Variant Selector
- **plugin_config** *(json, optional)* — Plugin Configuration
- **plugin_options** *(json, optional)* — Plugin Options
- **theme_namespace** *(text, optional)* — Theme Namespace

## What must be true

- **plugin_format:** Plugin must export a function that receives plugin API utilities (addBase, addUtility, addVariant), Plugin can optionally return a config object to extend theme
- **registration:** Plugin must be registered in project config under plugins array, Plugins are applied in order; later plugins can override earlier ones
- **naming_conventions:** Custom utility names use kebab-case (e.g., 'prose-sm', 'card-outlined'), Custom variant names use kebab-case (e.g., 'group-hover', 'supports-grid'), Theme extension keys must match framework namespace format (--namespace-value)
- **config_merge:** Plugin config extends theme; conflicting keys in user config take precedence, Theme.extend in plugin is recursively merged with user theme.extend
- **scope:** Plugin utilities and variants are global; they apply to all compiled CSS, Plugin theme values are available via theme() function in arbitrary values

## Success & failure scenarios

**✅ Success paths**

- **Create Simple Utility** — when Plugin developer creates a utility for card layout; Utility should have responsive values (sm: small-size, md: medium-size), then Custom utility registered; available in compiled CSS (e.g., 'card', 'sm:card').
- **Extend Theme With Colors** — when Plugin provides custom color palette (brand-primary: #FF6B35, brand-secondary: #004E89); Plugin returns config object with colors, then Colors available in utilities (text-brand-primary, bg-brand-secondary) and theme() function.
- **Create Custom Variant** — when Plugin developer creates variant for 'even-child' pseudo-selector; Selector provided: '&:nth-child(even)', then Custom variant available (even-child:flex, md:even-child:bg-gray-100).
- **Plugin With Options** — when Plugin created with plugin.withOptions to accept configuration; Consumer passes options when registering plugin, then Plugin instance created with custom options; utilities and theme generated based on options.
- **Plugin Adds Base Styles** — when Plugin provides reset or base styles for typography; Plugin calls addBase({ h1: { fontSize: '2.5rem', fontWeight: 'bold' } }), then Base styles injected at @layer base; applied to matched selectors without class needed.
- **Multiple Utilities Single Plugin** — when Plugin provides multiple utilities (prose-sm, prose-base, prose-lg), then All utilities registered; each available with responsive variants (md:prose-base, lg:prose-lg).
- **Config Override By User** — when Plugin extends theme with color (brand: '#FF6B35'); User config also defines brand color (brand: '#FF0000'), then User-defined color takes precedence; utilities use user's color, not plugin's.

**❌ Failure paths**

- **Plugin Load Failure** — when Plugin module fails to load or export invalid structure; Plugin does not export a function, then Build fails; error message indicates which plugin caused failure. *(error: `PLUGIN_LOAD_FAILED`)*
- **Plugin Type Mismatch** — when Plugin calls addUtility with invalid value structure; Or addVariant with invalid selector syntax, then Build fails; error indicates which API call was invalid. *(error: `INVALID_PLUGIN_API_USAGE`)*

## Errors it can return

- `PLUGIN_LOAD_FAILED` — Failed to load plugin module. Check that the plugin is properly exported and accessible.
- `INVALID_PLUGIN_API_USAGE` — Plugin API call is invalid. Verify utility/variant definition matches expected format.
- `PLUGIN_THEME_CONFLICT` — Plugin theme values conflict with framework reserved keys. Use a custom namespace.

## Events

**`plugin.utility_created`**
  Payload: `utility_name`, `utility_values`

**`plugin.variant_created`**
  Payload: `variant_name`, `variant_selector`

**`plugin.theme_extended`**
  Payload: `theme_namespace`, `new_values`

**`plugin.instantiated_with_options`**
  Payload: `plugin_name`, `options`

**`plugin.base_styles_added`**
  Payload: `base_rules`

**`plugin.load_error`**
  Payload: `plugin_name`, `error_message`

## Connects to

- **theme-configuration** *(recommended)* — Plugins can extend theme with custom values
- **utility-composition** *(recommended)* — Custom utilities composed with variants like built-in utilities
- **build-integration** *(optional)* — Plugins loaded and applied during build process

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/plugin-development/) · **Spec source:** [`plugin-development.blueprint.yaml`](./plugin-development.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
