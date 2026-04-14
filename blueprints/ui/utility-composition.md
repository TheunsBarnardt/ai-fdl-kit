<!-- AUTO-GENERATED FROM utility-composition.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Utility Composition

> Build user interfaces by composing utility classes with variants and modifiers to generate CSS rules

**Category:** Ui · **Version:** 1.0.0 · **Tags:** utilities · variants · responsive · state-modifiers

## What this does

Build user interfaces by composing utility classes with variants and modifiers to generate CSS rules

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **utility_class_name** *(text, required)* — Base utility class without variants (e.g., 'flex', 'p-4', 'text-blue-500')
- **variant_prefix** *(text, optional)* — Variant modifier before colon (e.g., 'hover', 'md', 'dark', 'group-hover')
- **modifier** *(text, optional)* — Optional modifier after slash to apply sub-values (e.g., opacity: 'p-4/50' means 50% opacity)
- **important_flag** *(boolean, optional)* — Whether to add !important to generated CSS rule (trailing ! in class name)
- **css_property** *(text, required)* — CSS property applied by utility (e.g., 'display', 'padding', 'color')
- **css_value** *(text, required)* — CSS value applied to property (e.g., 'flex', '1rem', '#3b82f6')
- **responsive_breakpoint** *(select, optional)* — Responsive breakpoint variant (sm, md, lg, xl, 2xl)
- **pseudo_class** *(select, optional)* — CSS pseudo-class variant
- **pseudo_element** *(select, optional)* — CSS pseudo-element variant

## What must be true

- **parsing:** Utility class format: [variant(s):]*utility[/modifier][!], Multiple variants chain with colons: 'md:hover:flex' (responsive + pseudo-class + utility), Unknown utilities are silently dropped, not compiled to CSS
- **variants:** Responsive variants (sm:, md:, lg:) generate CSS media queries based on breakpoints, Pseudo-class variants (hover:, focus:) generate CSS :pseudo-class selectors, Pseudo-element variants (before:, after:) generate CSS ::pseudo-element selectors, Dark mode variant (dark:) generates selector based on darkMode strategy (media, class, selector), Variant order matters: variants sort in a specific order for CSS cascade correctness
- **composition:** Single utility can have multiple variants; all variants apply to the same CSS rule, Modifier (after /) applies additional behavior like opacity or color opacity, Important flag (!) adds !important to generated CSS declaration
- **performance:** Duplicate class names are deduplicated; same utility+variants only generates CSS once

## Success & failure scenarios

**✅ Success paths**

- **Simple Utility** — when Developer writes utility class 'flex' in HTML; flex utility is defined in design system, then CSS rule generated: .flex { display: flex; }.
- **Utility With Value** — when Developer writes 'p-4' (padding with value from theme); spacing theme has value for 4 (e.g., 1rem), then CSS rule generated: .p-4 { padding: 1rem; }.
- **Responsive Utility** — when Developer writes 'md:flex'; md breakpoint is configured (e.g., 768px), then CSS rule in media query: @media (min-width: 768px) { .md\:flex { display: flex; } }.
- **Hover State Styling** — when Developer writes 'hover:text-blue-500'; text-blue-500 utility exists, then CSS rule generated: .hover\:text-blue-500:hover { color: #3b82f6; }.
- **Multiple Variants** — when Developer writes 'md:hover:flex'; md breakpoint and hover variant both exist, then CSS rule combines both: @media (min-width: 768px) { .md\:hover\:flex:hover { display: flex; } }.
- **Important Modifier** — when Developer writes 'flex!' to force !important, then CSS rule includes !important: .flex\! { display: flex !important; }.
- **Modifier Opacity** — when Developer writes 'p-4/50' (padding with 50% opacity), then CSS includes opacity modifier: .p-4\/50 { padding: 1rem; opacity: 0.5; }.

**❌ Failure paths**

- **Unknown Utility** — when Developer writes 'unknown-class'; unknown-class does not match any known utility, then Class is skipped; no CSS generated for this utility. *(error: `UNKNOWN_UTILITY`)*

## Errors it can return

- `UNKNOWN_UTILITY` — Utility class not recognized. Check the utility name spelling and ensure it's defined in your theme.
- `INVALID_VARIANT_COMBINATION` — This variant combination is not supported or not applicable to this utility.
- `INVALID_MODIFIER` — Modifier value is invalid for this utility (e.g., opacity must be 0-100).

## Events

**`utility.compiled`**
  Payload: `utility_name`, `css_property`, `css_value`, `variants`

**`utility.invalid`**
  Payload: `utility_name`

## Connects to

- **theme-configuration** *(required)* — Utilities read values from theme configuration
- **responsive-layout** *(recommended)* — Responsive variants (md:, lg:) enable layout breakpoints
- **arbitrary-values** *(optional)* — Arbitrary values provide escape hatch for custom values

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/utility-composition/) · **Spec source:** [`utility-composition.blueprint.yaml`](./utility-composition.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
