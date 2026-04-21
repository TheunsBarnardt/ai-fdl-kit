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
| **Version** | 1.0 |
| **Tags** | design-system, layout, accessibility |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/spacing-system.blueprint.yaml) |
| **JSON API** | [spacing-system.json]({{ site.baseurl }}/api/blueprints/ui/spacing-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `base_unit` | number | No |  |  |
| `scale_multipliers` | text | No |  |  |
| `container_max_width` | number | No |  |  |
| `gutter_width` | number | No |  |  |

## Rules

- Start with too much white space — conservative spacing always looks better than cramped layouts
- Establish a spacing and sizing system — use a base unit (4px, 8px) and multiply by scale (1, 2, 3, 4, 6, 8, 12...)
- You don't have to fill the whole screen — avoid stretching content to viewport width; use containers
- Grids are overrated — align by rhythm and intent, not arbitrary grids
- Relative sizing doesn't scale — use absolute units in system, scale responsively in breakpoints
- Avoid ambiguous spacing — every gap between elements should be intentional and expressed in system

## Outcomes

### 0

**Given:**
- interface design begins

**Then:**
- **create_record** target: `spacing_scale`
- **set_field** target: `base_unit` value: `4px or 8px`
- **set_field** target: `scale_multiples` value: `[1, 2, 3, 4, 6, 8, 12, 16]`

**Result:** spacing scale is defined and enforced across all components

### 1

**Given:**
- two elements are adjacent in interface

**Then:**
- **set_field** target: `gap_size` value: `value from established scale`

**Result:** no ambiguous spacing; every gap is intentional

### 2

**Given:**
- content container is sized

**Then:**
- **set_field** target: `max_width` value: `calculated from typography (measure)`
- **set_field** target: `horizontal_padding` value: `from spacing scale`

**Result:** content is readable and respects typography measure

### 3

**Given:**
- related content is grouped

**Then:**
- **set_field** target: `internal_spacing` value: `tighter spacing (1-2x base unit)`
- **set_field** target: `external_spacing` value: `looser spacing (4-6x base unit)`

**Result:** visual grouping is clear without explicit borders or backgrounds

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required |  |
| typography-system | required |  |
| responsive-design | recommended |  |
| container-layouts | recommended |  |


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
