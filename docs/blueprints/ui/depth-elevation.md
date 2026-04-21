---
title: "Depth Elevation Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Use shadows, layering, and spatial relationships to create visual depth and communicate element elevation, even in flat designs, making clickable elements feel "
---

# Depth Elevation Blueprint

> Use shadows, layering, and spatial relationships to create visual depth and communicate element elevation, even in flat designs, making clickable elements feel interactive and content hierarchy clear.


| | |
|---|---|
| **Feature** | `depth-elevation` |
| **Category** | UI |
| **Version** | 1.0 |
| **Tags** | design-system, visual-design, interaction-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/depth-elevation.blueprint.yaml) |
| **JSON API** | [depth-elevation.json]({{ site.baseurl }}/api/blueprints/ui/depth-elevation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `light_source_direction` | text | No |  |  |
| `shadow_levels` | text | No |  |  |
| `max_shadow_blur` | number | No |  |  |
| `interaction_shadow_change` | text | No |  |  |

## Rules

- Emulate a light source — consistent shadow direction (typically top-left light) creates believable depth
- Use shadows to convey elevation — stronger shadows = higher elevation; no shadow = background level
- Shadows can have two parts — a soft, larger shadow (ambient) and a sharper, smaller shadow (contact)
- Even flat designs can have depth — shadows on flat surfaces are effective without skeuomorphism
- Overlap elements to create layers — slight overlap communicates spatial relationship and depth

## Outcomes

### 0

**Given:**
- modal or floating panel is displayed above content

**Then:**
- **set_field** target: `elevation_level` value: `highest`
- **set_field** target: `shadow_blur` value: `16-24px`
- **set_field** target: `shadow_spread` value: `0 to 8px`
- **set_field** target: `shadow_opacity` value: `15-25%`
- **set_field** target: `shadow_offset` value: `0 12px (down and slightly forward)`

**Result:** modal clearly appears above all other content and captures focus

### 1

**Given:**
- card or raised element is on background

**Then:**
- **set_field** target: `elevation_level` value: `medium`
- **set_field** target: `shadow_blur` value: `8-12px`
- **set_field** target: `shadow_spread` value: `0 to 4px`
- **set_field** target: `shadow_opacity` value: `10-15%`

**Result:** card appears layered above background without excessive visual weight

### 2

**Given:**
- button or interactive element is at rest

**Then:**
- **set_field** target: `elevation_level` value: `low or none`
- **set_field** target: `shadow` value: `subtle or none at rest`
- **transition_state** field: `element_state` from: `rest` to: `hover`
- **set_field** target: `shadow` value: `small shadow on hover`

**Result:** button feels raised on interaction, subtle at rest

### 3

**Given:**
- elements are layered (e.g., image with overlay)

**Then:**
- **set_field** target: `overlap_offset` value: `8-16px`
- **set_field** target: `shadow_on_overlapping` value: `optional subtle shadow`

**Result:** layering is clear and suggests spatial depth

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | recommended |  |
| color-system | recommended |  |
| dark-mode | recommended |  |
| animation-state-machine | optional |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Depth Elevation Blueprint",
  "description": "Use shadows, layering, and spatial relationships to create visual depth and communicate element elevation, even in flat designs, making clickable elements feel ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, visual-design, interaction-design"
}
</script>
