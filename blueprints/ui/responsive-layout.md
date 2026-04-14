<!-- AUTO-GENERATED FROM responsive-layout.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Responsive Layout

> Design responsive layouts using breakpoint variants to apply different styles at different screen sizes

**Category:** Ui · **Version:** 1.0.0 · **Tags:** responsive · breakpoints · mobile-first · media-queries

## What this does

Design responsive layouts using breakpoint variants to apply different styles at different screen sizes

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **breakpoint_name** *(text, required)* — Identifier for screen size tier (e.g., sm, md, lg, xl, 2xl)
- **breakpoint_pixel_value** *(number, required)* — Pixel value threshold for breakpoint (e.g., 640, 768, 1024)
- **breakpoint_type** *(select, optional)* — Breakpoint threshold type
- **mobile_first_style** *(text, optional)* — Base style applied at smallest screen (no breakpoint prefix)
- **tablet_override_style** *(text, optional)* — Style applied at tablet breakpoint (e.g., md:)
- **desktop_override_style** *(text, optional)* — Style applied at desktop breakpoint (e.g., lg:)

## What must be true

- **mobile_first_approach:** Default styles (no breakpoint) apply to smallest screens, Breakpoint variants (sm:, md:, lg:) add or override styles at larger screens, Each breakpoint inherits and can override previous breakpoint styles, Breakpoints are min-width based; styles apply at breakpoint and above
- **breakpoint_ordering:** Breakpoints must be ordered from smallest to largest, Default breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px), Custom breakpoints can be added by extending theme.screens
- **cascade:** CSS media queries are ordered by breakpoint size; larger breakpoints come last, Larger breakpoint styles override smaller breakpoint styles (CSS cascade), Multiple variants on same utility combine; sm:md:flex is invalid (variant order)

## Success & failure scenarios

**✅ Success paths**

- **Define Mobile Layout** — when Designer starts with mobile layout; Sets grid to single column: 'grid grid-cols-1', then Single-column layout on mobile devices.
- **Add Tablet Layout** — when At tablet size (md: 768px), change to 2-column layout; Developer writes 'md:grid-cols-2', then CSS media query generated: @media (min-width: 768px) { .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }.
- **Override At Desktop** — when At desktop (lg: 1024px), expand to 3-column layout; Developer writes 'lg:grid-cols-3', then Mobile (1 col) → Tablet (2 col) → Desktop (3 col) responsive cascade.
- **Hide Element On Mobile** — when Element should be hidden on mobile, visible on tablet+; Developer writes 'hidden md:block', then Element hidden at base (display: none), shown at md+ (display: block).
- **Custom Breakpoint** — when Project needs custom breakpoint at 900px for specific layout (sm, md, lg, xl, 2xl not sufficient); Developer configures theme.screens.custom: '900px', then Custom breakpoint available; utilities like 'custom:flex' generate media query @media (min-width: 900px).
- **Responsive Spacing** — when Padding should be small on mobile, larger on desktop; Developer writes 'p-4 md:p-6 lg:p-8', then Padding cascades: 1rem (mobile) → 1.5rem (tablet) → 2rem (desktop).
- **Container Query Responsive** — when Designer wants layout relative to container, not viewport (container queries); Some frameworks support '@container' variant, then Layout adapts to container size instead of viewport; styles apply when container meets size threshold.

**❌ Failure paths**

- **Invalid Breakpoint Order** — when Custom breakpoints configured in wrong order: lg (1024px), md (768px), sm (640px), then CSS cascade broken; smaller breakpoints may override larger breakpoints unexpectedly. *(error: `BREAKPOINT_ORDER_INVALID`)*

## Errors it can return

- `BREAKPOINT_ORDER_INVALID` — Breakpoints must be ordered from smallest to largest. Fix theme.screens to ensure correct cascade.
- `UNKNOWN_BREAKPOINT` — Breakpoint variant not recognized. Check breakpoint name in theme.screens config.

## Events

**`layout.breakpoint_applied`**
  Payload: `breakpoint_name`, `layout_stage`, `css_properties`

**`layout.responsive_visibility`**
  Payload: `element_selector`, `mobile_style`, `tablet_plus_style`

**`layout.custom_breakpoint_defined`**
  Payload: `breakpoint_name`, `pixel_value`

**`layout.responsive_property`**
  Payload: `property_name`, `value_cascade`

**`layout.container_query_applied`**
  Payload: `element_selector`, `container_size`

**`layout.breakpoint_order_error`**
  Payload: `breakpoints_list`, `error_message`

## Connects to

- **utility-composition** *(required)* — Responsive variants (md:, lg:) apply utilities at breakpoints
- **theme-configuration** *(recommended)* — Breakpoints defined in theme.screens config

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/responsive-layout/) · **Spec source:** [`responsive-layout.blueprint.yaml`](./responsive-layout.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
