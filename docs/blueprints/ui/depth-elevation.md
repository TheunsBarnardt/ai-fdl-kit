---
title: "Depth Elevation Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Use shadows, layering, and spatial relationships to create visual depth and communicate elevation, even in flat designs, making clickable elements feel interact"
---

# Depth Elevation Blueprint

> Use shadows, layering, and spatial relationships to create visual depth and communicate elevation, even in flat designs, making clickable elements feel interactive and content hierarchy clear.


| | |
|---|---|
| **Feature** | `depth-elevation` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-system, visual-design, interaction-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/depth-elevation.blueprint.yaml) |
| **JSON API** | [depth-elevation.json]({{ site.baseurl }}/api/blueprints/ui/depth-elevation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `light_source_direction` | text | No | Direction of primary light (e.g., top-left, directly above) |  |
| `shadow_levels` | text | No | Predefined shadow styles for different elevations (background, card, modal) |  |
| `max_shadow_blur` | number | No | Maximum blur radius for largest shadows (typically 24px) |  |
| `interaction_shadow_change` | text | No | How shadows change on hover/active (increase blur, offset, or opacity) |  |

## Rules

- **emulate_a_light_source:** Emulate a light source — consistent shadow direction (typically top-left light) creates believable depth
- **use_shadows_to_convey_elevation:** Use shadows to convey elevation — stronger shadows = higher elevation; no shadow = background level
- **shadows_can_have_two_parts:** Shadows can have two parts — a soft, larger shadow (ambient) and a sharper, smaller shadow (contact)
- **even_flat_designs_can_have_depth:** Even flat designs can have depth — shadows on flat surfaces are effective without skeuomorphism
- **overlap_elements_to_create_layers:** Overlap elements to create layers — slight overlap communicates spatial relationship and depth

## Outcomes

### Modal_floating_panel_displayed (Priority: 1)

**Given:**
- modal or floating panel is displayed above content

**Then:**
- **set_field** target: `elevation_level` value: `highest`
- **set_field** target: `shadow_blur` value: `16-24px`
- **set_field** target: `shadow_spread` value: `0 to 8px`
- **set_field** target: `shadow_opacity` value: `15-25%`
- **set_field** target: `shadow_offset` value: `0 12px (down and slightly forward)`

**Result:** modal clearly appears above all other content and captures focus

### Card_raised_element_on_background (Priority: 2)

**Given:**
- card or raised element is on background

**Then:**
- **set_field** target: `elevation_level` value: `medium`
- **set_field** target: `shadow_blur` value: `8-12px`
- **set_field** target: `shadow_spread` value: `0 to 4px`
- **set_field** target: `shadow_opacity` value: `10-15%`

**Result:** card appears layered above background without excessive visual weight

### Button_interactive_element_at_rest (Priority: 3)

**Given:**
- button or interactive element is at rest

**Then:**
- **set_field** target: `elevation_level` value: `low or none`
- **set_field** target: `shadow` value: `subtle or none at rest`
- **transition_state** field: `element_state` from: `rest` to: `hover`
- **set_field** target: `shadow` value: `small shadow on hover`

**Result:** button feels raised on interaction, subtle at rest

### Elements_layered_with_overlay (Priority: 4)

**Given:**
- elements are layered (e.g., image with overlay)

**Then:**
- **set_field** target: `overlap_offset` value: `8-16px`
- **set_field** target: `shadow_on_overlapping` value: `optional subtle shadow`

**Result:** layering is clear and suggests spatial depth

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | recommended | Elevation and shadows express hierarchy through spatial positioning |
| color-system | recommended | Shadow color is derived from brand darkness, not pure black |
| dark-mode | recommended | Shadow appearance differs in dark mode (lighter shadows on dark backgrounds) |
| animation-state-machine | optional | Shadows can animate smoothly during state transitions |

## AGI Readiness

### Goals

#### Reliable Depth Elevation

Use shadows, layering, and spatial relationships to create visual depth and communicate elevation, even in flat designs, making clickable elements feel interactive and content hierarchy clear.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| modal_floating_panel_displayed | `autonomous` | - | - |
| card_raised_element_on_background | `autonomous` | - | - |
| button_interactive_element_at_rest | `autonomous` | - | - |
| elements_layered_with_overlay | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Depth Elevation Blueprint",
  "description": "Use shadows, layering, and spatial relationships to create visual depth and communicate elevation, even in flat designs, making clickable elements feel interact",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, visual-design, interaction-design"
}
</script>
