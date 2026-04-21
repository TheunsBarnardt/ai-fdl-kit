---
title: "Color System Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Define a structured color palette using HSL for better control over shades and tones, ensuring sufficient colors for hierarchy while avoiding over-saturation an"
---

# Color System Blueprint

> Define a structured color palette using HSL for better control over shades and tones, ensuring sufficient colors for hierarchy while avoiding over-saturation and maintaining accessibility across all color-blindness types.


| | |
|---|---|
| **Feature** | `color-system` |
| **Category** | UI |
| **Version** | 1.0 |
| **Tags** | design-system, accessibility, visual-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/color-system.blueprint.yaml) |
| **JSON API** | [color-system.json]({{ site.baseurl }}/api/blueprints/ui/color-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `primary_colors` | text | No |  |  |
| `neutral_palette` | text | No |  |  |
| `accent_colors` | text | No |  |  |
| `color_format` | text | No |  |  |
| `contrast_standard` | text | No |  |  |

## Rules

- Use HSL instead of hex — easier to understand (Hue 0-360°, Saturation 0-100%, Lightness 0-100%) and generate shades
- You need more colors than you think — plan for 5-8 base colors with 5-9 shades each (dark, lighter, lightest, etc.)
- Define shades up front — don't generate them ad-hoc; create a structured palette
- Don't let lightness kill saturation — reduce saturation as lightness increases to keep colors vibrant
- Greys don't have to be grey — subtle hue can make neutrals feel warmer or cooler
- Accessible doesn't have to mean ugly — sufficient contrast is possible with saturated, modern colors
- Don't rely on color alone — always pair color with other signals (icon, text, weight) for color-blind users

## Outcomes

### 0

**Given:**
- design system is initiated

**Then:**
- **create_record** target: `color_palette`
- **set_field** target: `base_color_count` value: `5-8`
- **set_field** target: `shades_per_color` value: `5-9`

**Result:** color palette is comprehensive and systematic

### 1

**Given:**
- color shade is generated

**Then:**
- **set_field** target: `hue` value: `constant`
- **set_field** target: `saturation` value: `high for dark shades, reduced as lightness increases`
- **set_field** target: `lightness` value: `varies to create contrast`

**Result:** shade remains true to base hue and maintains vibrancy across the range

### 2

**Given:**
- text color is applied to background

**Then:**
- **set_field** target: `contrast_ratio` value: `>=4.5:1 for normal text, >=3:1 for large text`
- **set_field** target: `tested_for` value: `WCAG AA at minimum`

**Result:** text is readable for users with low vision and color-blindness

### 3

**Given:**
- information or meaning is conveyed through color

**Then:**
- **set_field** target: `secondary_indicator` value: `icon, text label, or pattern`
- **emit_event** event: `color.accessibility.checked`

**Result:** meaning is conveyed to color-blind users without color alone

### 4

**Given:**
- neutral or background color is selected

**Then:**
- **set_field** target: `hue` value: `subtle warm or cool bias (not pure grey)`
- **set_field** target: `saturation` value: `2-5%`

**Result:** neutral feels intentional and cohesive with brand rather than colorless

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required |  |
| dark-mode | recommended |  |
| accessibility | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Color System Blueprint",
  "description": "Define a structured color palette using HSL for better control over shades and tones, ensuring sufficient colors for hierarchy while avoiding over-saturation an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, accessibility, visual-design"
}
</script>
