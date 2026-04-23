---
title: "Spacing System Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Define a consistent spacing and sizing scale using mathematical ratios so components are visually balanced, grouping is clear, and whitespace reinforces informa"
---

# Spacing System Blueprint

> Define a consistent spacing and sizing scale using mathematical ratios so components are visually balanced, grouping is clear, and whitespace reinforces information hierarchy.


| | |
|---|---|
| **Feature** | `spacing-system` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-system, layout, accessibility |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/spacing-system.blueprint.yaml) |
| **JSON API** | [spacing-system.json]({{ site.baseurl }}/api/blueprints/ui/spacing-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `base_unit` | number | No | Foundation spacing unit in pixels (4px or 8px) |  |
| `scale_multipliers` | text | No | Sequence of scale values (e.g., 1, 2, 3, 4, 6, 8, 12, 16) |  |
| `container_max_width` | number | No | Maximum content width in pixels (calculated from type measure) |  |
| `gutter_width` | number | No | Horizontal spacing inside containers |  |

## Rules

- **start_with_too_much_white_space:** Start with too much white space — conservative spacing always looks better than cramped layouts
- **establish_spacing_and_sizing_system:** Establish a spacing and sizing system — use a base unit (4px, 8px) and multiply by scale (1, 2, 3, 4, 6, 8, 12...)
- **dont_have_to_fill_whole_screen:** You don't have to fill the whole screen — avoid stretching content to viewport width; use containers
- **grids_are_overrated:** Grids are overrated — align by rhythm and intent, not arbitrary grids
- **relative_sizing_doesnt_scale:** Relative sizing doesn't scale — use absolute units in system, scale responsively in breakpoints
- **avoid_ambiguous_spacing:** Avoid ambiguous spacing — every gap between elements should be intentional and expressed in system

## Outcomes

### Interface_design_begins (Priority: 1)

**Given:**
- interface design begins

**Then:**
- **create_record** target: `spacing_scale`
- **set_field** target: `base_unit` value: `4px or 8px`
- **set_field** target: `scale_multiples` value: `[1, 2, 3, 4, 6, 8, 12, 16]`

**Result:** spacing scale is defined and enforced across all components

### Two_elements_adjacent (Priority: 2)

**Given:**
- two elements are adjacent in interface

**Then:**
- **set_field** target: `gap_size` value: `value from established scale`

**Result:** no ambiguous spacing; every gap is intentional

### Content_container_sized (Priority: 3)

**Given:**
- content container is sized

**Then:**
- **set_field** target: `max_width` value: `calculated from typography (measure)`
- **set_field** target: `horizontal_padding` value: `from spacing scale`

**Result:** content is readable and respects typography measure

### Related_content_grouped (Priority: 4)

**Given:**
- related content is grouped

**Then:**
- **set_field** target: `internal_spacing` value: `tighter spacing (1-2x base unit)`
- **set_field** target: `external_spacing` value: `looser spacing (4-6x base unit)`

**Result:** visual grouping is clear without explicit borders or backgrounds

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required | Spacing reinforces hierarchy through grouping and visual weight |
| typography-system | required | Type measure determines ideal container width for readability |
| responsive-design | recommended | Spacing scale scales responsively across viewport breakpoints |
| container-layouts | recommended | Spacing system is applied within container layout patterns |

## AGI Readiness

### Goals

#### Reliable Spacing System

Define a consistent spacing and sizing scale using mathematical ratios so components are visually balanced, grouping is clear, and whitespace reinforces information hierarchy.


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

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `visual_hierarchy` | visual-hierarchy | degrade |
| `typography_system` | typography-system | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| interface_design_begins | `autonomous` | - | - |
| two_elements_adjacent | `autonomous` | - | - |
| content_container_sized | `autonomous` | - | - |
| related_content_grouped | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Spacing System Blueprint",
  "description": "Define a consistent spacing and sizing scale using mathematical ratios so components are visually balanced, grouping is clear, and whitespace reinforces informa",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, layout, accessibility"
}
</script>
