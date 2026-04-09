---
title: "Responsive Layout Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Design responsive layouts using breakpoint variants to apply different styles at different screen sizes. 6 fields. 8 outcomes. 2 error codes. rules: mobile_firs"
---

# Responsive Layout Blueprint

> Design responsive layouts using breakpoint variants to apply different styles at different screen sizes

| | |
|---|---|
| **Feature** | `responsive-layout` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | responsive, breakpoints, mobile-first, media-queries |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/responsive-layout.blueprint.yaml) |
| **JSON API** | [responsive-layout.json]({{ site.baseurl }}/api/blueprints/ui/responsive-layout.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `designer` | Designer/Developer | human | Creates responsive layouts by applying breakpoint variants |
| `css_generator` | CSS Generator | system | Converts breakpoint variants to CSS media queries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `breakpoint_name` | text | Yes | Identifier for screen size tier (e.g., sm, md, lg, xl, 2xl) |  |
| `breakpoint_pixel_value` | number | Yes | Pixel value threshold for breakpoint (e.g., 640, 768, 1024) |  |
| `breakpoint_type` | select | No | Breakpoint threshold type |  |
| `mobile_first_style` | text | No | Base style applied at smallest screen (no breakpoint prefix) |  |
| `tablet_override_style` | text | No | Style applied at tablet breakpoint (e.g., md:) |  |
| `desktop_override_style` | text | No | Style applied at desktop breakpoint (e.g., lg:) |  |

## States

**State field:** `layout_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `base` | Yes |  |
| `tablet` |  |  |
| `desktop` |  |  |

## Rules

- **mobile_first_approach:** Default styles (no breakpoint) apply to smallest screens, Breakpoint variants (sm:, md:, lg:) add or override styles at larger screens, Each breakpoint inherits and can override previous breakpoint styles, Breakpoints are min-width based; styles apply at breakpoint and above
- **breakpoint_ordering:** Breakpoints must be ordered from smallest to largest, Default breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px), Custom breakpoints can be added by extending theme.screens
- **cascade:** CSS media queries are ordered by breakpoint size; larger breakpoints come last, Larger breakpoint styles override smaller breakpoint styles (CSS cascade), Multiple variants on same utility combine; sm:md:flex is invalid (variant order)

## Outcomes

### Define_mobile_layout (Priority: 1)

**Given:**
- Designer starts with mobile layout
- Sets grid to single column: 'grid grid-cols-1'

**Then:**
- **set_field** target: `mobile_first_style` value: `grid grid-cols-1`
- **emit_event** event: `layout.breakpoint_applied`

**Result:** Single-column layout on mobile devices

### Add_tablet_layout (Priority: 2)

**Given:**
- At tablet size (md: 768px), change to 2-column layout
- Developer writes 'md:grid-cols-2'

**Then:**
- **transition_state** field: `layout_status` from: `base` to: `tablet`
- **set_field** target: `tablet_override_style` value: `grid-cols-2`
- **emit_event** event: `layout.breakpoint_applied`

**Result:** CSS media query generated: @media (min-width: 768px) { .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

### Override_at_desktop (Priority: 3)

**Given:**
- At desktop (lg: 1024px), expand to 3-column layout
- Developer writes 'lg:grid-cols-3'

**Then:**
- **transition_state** field: `layout_status` from: `tablet` to: `desktop`
- **set_field** target: `desktop_override_style` value: `grid-cols-3`

**Result:** Mobile (1 col) → Tablet (2 col) → Desktop (3 col) responsive cascade

### Hide_element_on_mobile (Priority: 4)

**Given:**
- Element should be hidden on mobile, visible on tablet+
- Developer writes 'hidden md:block'

**Then:**
- **emit_event** event: `layout.responsive_visibility`

**Result:** Element hidden at base (display: none), shown at md+ (display: block)

### Custom_breakpoint (Priority: 5)

**Given:**
- Project needs custom breakpoint at 900px for specific layout (sm, md, lg, xl, 2xl not sufficient)
- Developer configures theme.screens.custom: '900px'

**Then:**
- **create_record**
- **emit_event** event: `layout.custom_breakpoint_defined`

**Result:** Custom breakpoint available; utilities like 'custom:flex' generate media query @media (min-width: 900px)

### Responsive_spacing (Priority: 6)

**Given:**
- Padding should be small on mobile, larger on desktop
- Developer writes 'p-4 md:p-6 lg:p-8'

**Then:**
- **emit_event** event: `layout.responsive_property`

**Result:** Padding cascades: 1rem (mobile) → 1.5rem (tablet) → 2rem (desktop)

### Container_query_responsive (Priority: 7)

**Given:**
- Designer wants layout relative to container, not viewport (container queries)
- Some frameworks support '@container' variant

**Then:**
- **emit_event** event: `layout.container_query_applied`

**Result:** Layout adapts to container size instead of viewport; styles apply when container meets size threshold

### Invalid_breakpoint_order (Priority: 10) — Error: `BREAKPOINT_ORDER_INVALID`

**Given:**
- Custom breakpoints configured in wrong order: lg (1024px), md (768px), sm (640px)

**Then:**
- **emit_event** event: `layout.breakpoint_order_error`

**Result:** CSS cascade broken; smaller breakpoints may override larger breakpoints unexpectedly

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BREAKPOINT_ORDER_INVALID` | 400 | Breakpoints must be ordered from smallest to largest. Fix theme.screens to ensure correct cascade. | No |
| `UNKNOWN_BREAKPOINT` | 400 | Breakpoint variant not recognized. Check breakpoint name in theme.screens config. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `layout.breakpoint_applied` |  | `breakpoint_name`, `layout_stage`, `css_properties` |
| `layout.responsive_visibility` |  | `element_selector`, `mobile_style`, `tablet_plus_style` |
| `layout.custom_breakpoint_defined` |  | `breakpoint_name`, `pixel_value` |
| `layout.responsive_property` |  | `property_name`, `value_cascade` |
| `layout.container_query_applied` |  | `element_selector`, `container_size` |
| `layout.breakpoint_order_error` |  | `breakpoints_list`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| utility-composition | required | Responsive variants (md:, lg:) apply utilities at breakpoints |
| theme-configuration | recommended | Breakpoints defined in theme.screens config |

## AGI Readiness

### Goals

#### Reliable Responsive Layout

Design responsive layouts using breakpoint variants to apply different styles at different screen sizes

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `utility_composition` | utility-composition | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| define_mobile_layout | `autonomous` | - | - |
| add_tablet_layout | `autonomous` | - | - |
| override_at_desktop | `supervised` | - | - |
| hide_element_on_mobile | `autonomous` | - | - |
| custom_breakpoint | `autonomous` | - | - |
| responsive_spacing | `autonomous` | - | - |
| container_query_responsive | `autonomous` | - | - |
| invalid_breakpoint_order | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: CSS Media Queries + CSS Variables
  pattern: Mobile-first responsive design
  media_query_type: min-width (width >= breakpoint)
source_location: packages/tailwindcss/src
default_breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
best_practices:
  - Start with mobile layout; progressively enhance for larger screens
  - Keep breakpoint threshold values consistent across project
  - Use named breakpoints (sm, md) not pixel values in markup
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Responsive Layout Blueprint",
  "description": "Design responsive layouts using breakpoint variants to apply different styles at different screen sizes. 6 fields. 8 outcomes. 2 error codes. rules: mobile_firs",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "responsive, breakpoints, mobile-first, media-queries"
}
</script>
