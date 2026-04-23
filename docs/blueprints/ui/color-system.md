---
title: "Color System Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Define a structured color palette using HSL for better shade control, ensuring sufficient colors for hierarchy while avoiding over-saturation and maintaining ac"
---

# Color System Blueprint

> Define a structured color palette using HSL for better shade control, ensuring sufficient colors for hierarchy while avoiding over-saturation and maintaining accessibility for color-blind users.


| | |
|---|---|
| **Feature** | `color-system` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-system, accessibility, visual-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/color-system.blueprint.yaml) |
| **JSON API** | [color-system.json]({{ site.baseurl }}/api/blueprints/ui/color-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `primary_colors` | text | No | Main brand and action colors (5-8 base hues) |  |
| `neutral_palette` | text | No | Greys and near-neutrals with subtle hue biases |  |
| `accent_colors` | text | No | Alert, error, success, warning colors with sufficient contrast |  |
| `color_format` | text | No | Preferred format: HSL (recommended) or hex |  |
| `contrast_standard` | text | No | Minimum contrast ratio (WCAG AA 4.5:1 or AAA 7:1) |  |

## Rules

- **use_hsl_instead_of_hex:** Use HSL instead of hex — easier to understand (Hue 0-360°, Saturation 0-100%, Lightness 0-100%) and generate shades
- **need_more_colors_than_you_think:** You need more colors than you think — plan for 5-8 base colors with 5-9 shades each (dark, lighter, lightest, etc.)
- **define_shades_up_front:** Define shades up front — don't generate them ad-hoc; create a structured palette
- **dont_let_lightness_kill_saturation:** Don't let lightness kill saturation — reduce saturation as lightness increases to keep colors vibrant
- **greys_dont_have_to_be_grey:** Greys don't have to be grey — subtle hue can make neutrals feel warmer or cooler
- **accessible_doesnt_have_to_be_ugly:** Accessible doesn't have to mean ugly — sufficient contrast is possible with saturated, modern colors
- **dont_rely_on_color_alone:** Don't rely on color alone — always pair color with other signals (icon, text, weight) for color-blind users

## Outcomes

### Design_system_initiated (Priority: 1)

**Given:**
- design system is initiated

**Then:**
- **create_record** target: `color_palette`
- **set_field** target: `base_color_count` value: `5-8`
- **set_field** target: `shades_per_color` value: `5-9`

**Result:** color palette is comprehensive and systematic

### Color_shade_generated (Priority: 2)

**Given:**
- color shade is generated

**Then:**
- **set_field** target: `hue` value: `constant`
- **set_field** target: `saturation` value: `high for dark shades, reduced as lightness increases`
- **set_field** target: `lightness` value: `varies to create contrast`

**Result:** shade remains true to base hue and maintains vibrancy across the range

### Text_color_applied_to_background (Priority: 3)

**Given:**
- text color is applied to background

**Then:**
- **set_field** target: `contrast_ratio` value: `>=4.5:1 for normal text, >=3:1 for large text`
- **set_field** target: `tested_for` value: `WCAG AA at minimum`

**Result:** text is readable for users with low vision and color-blindness

### Information_conveyed_through_color (Priority: 4)

**Given:**
- information or meaning is conveyed through color

**Then:**
- **set_field** target: `secondary_indicator` value: `icon, text label, or pattern`
- **emit_event** event: `color.accessibility.checked`

**Result:** meaning is conveyed to color-blind users without color alone

### Neutral_background_color_selected (Priority: 5)

**Given:**
- neutral or background color is selected

**Then:**
- **set_field** target: `hue` value: `subtle warm or cool bias (not pure grey)`
- **set_field** target: `saturation` value: `2-5%`

**Result:** neutral feels intentional and cohesive with brand rather than colorless

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required | Color is a tool for expressing hierarchy and emphasis |
| dark-mode | recommended | Color system must work in both light and dark modes |
| accessibility | required | Color choices must pass contrast ratios and avoid color-only meaning |

## AGI Readiness

### Goals

#### Reliable Color System

Define a structured color palette using HSL for better shade control, ensuring sufficient colors for hierarchy while avoiding over-saturation and maintaining accessibility for color-blind users.


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
| `accessibility` | accessibility | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| design_system_initiated | `autonomous` | - | - |
| color_shade_generated | `autonomous` | - | - |
| text_color_applied_to_background | `autonomous` | - | - |
| information_conveyed_through_color | `autonomous` | - | - |
| neutral_background_color_selected | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Color System Blueprint",
  "description": "Define a structured color palette using HSL for better shade control, ensuring sufficient colors for hierarchy while avoiding over-saturation and maintaining ac",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, accessibility, visual-design"
}
</script>
