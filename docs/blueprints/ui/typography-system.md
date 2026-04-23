---
title: "Typography System Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Define a consistent type scale, font selection, and readability rules that establish clear visual hierarchy and ensure text is readable across all interface siz"
---

# Typography System Blueprint

> Define a consistent type scale, font selection, and readability rules that establish clear visual hierarchy and ensure text is readable across all interface sizes and contexts.


| | |
|---|---|
| **Feature** | `typography-system` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-system, accessibility, typography |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/typography-system.blueprint.yaml) |
| **JSON API** | [typography-system.json]({{ site.baseurl }}/api/blueprints/ui/typography-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `base_size` | number | No | Foundation font size (typically 16px for web) |  |
| `type_scale_ratio` | number | No | Multiplier for heading sizes (e.g., 1.125, 1.25, 1.5) |  |
| `primary_font_family` | text | No | Primary font name and weights (e.g., Inter 400, 500, 600, 700) |  |
| `secondary_font_family` | text | No | Optional secondary font for contrast (e.g., serif for displays) |  |
| `line_length_range` | text | No | Target character count per line (e.g., 50-75) |  |

## Rules

- **establish_type_scale:** Establish a type scale — use a base size (16px) and multiply by consistent ratios (1.125, 1.25, 1.5) for heading sizes
- **use_good_fonts_with_multiple_weights:** Use good fonts with multiple weights — modern sans-serifs with 3+ weights (regular, medium, bold) are safest defaults
- **keep_line_length_50_75_chars:** Keep line length between 50-75 characters for optimal readability
- **align_text_to_baseline:** Align text to baseline, never center-align — readability is worse with center alignment
- **line_height_proportional_to_measure:** Line-height should be proportional to measure — tighter leading for small text, looser for large
- **not_every_link_needs_color:** Not every link needs a color — underline or weight change can signal interactivity
- **align_with_readability_in_mind:** Align with readability in mind — consider visual weight, line-height, letter-spacing together
- **use_letter_spacing_effectively:** Use letter-spacing effectively — only increase for headlines; body text rarely needs adjustment

## Outcomes

### New_interface_created (Priority: 1)

**Given:**
- new interface is created

**Then:**
- **create_record** target: `type_scale`
- **set_field** target: `primary_font` value: `modern_sans_serif_with_3plus_weights`
- **set_field** target: `line_length_max` value: `75 characters`

**Result:** typography system is established and documented

### Body_text_rendered (Priority: 2)

**Given:**
- body text is rendered

**Then:**
- **set_field** target: `font_size` value: `16px or larger`
- **set_field** target: `line_height` value: `1.5 to 1.75`
- **set_field** target: `measure` value: `50-75 characters per line`
- **set_field** target: `text_alignment` value: `left_aligned`

**Result:** text is scannable and readable without eye strain

### Heading_rendered (Priority: 3)

**Given:**
- heading is rendered

**Then:**
- **set_field** target: `font_size` value: `computed from type scale`
- **set_field** target: `font_weight` value: `600 or bolder`
- **set_field** target: `line_height` value: `1.1 to 1.3`

**Result:** heading has clear visual distinction from body copy

### Small_metadata_text (Priority: 4)

**Given:**
- small metadata or UI text (12px or smaller)

**Then:**
- **set_field** target: `line_height` value: `1.4 minimum`
- **set_field** target: `letter_spacing` value: `+0.25px minimum`

**Result:** small text remains readable and isn't cramped

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required | Type scale is primary tool for expressing visual hierarchy |
| spacing-system | recommended | Line-height and letter-spacing are part of spacing system |
| accessibility | required | Font size and line-height must support readability for low-vision users |
| dark-mode | recommended | Typography contrast and brightness differ between light and dark modes |

## AGI Readiness

### Goals

#### Reliable Typography System

Define a consistent type scale, font selection, and readability rules that establish clear visual hierarchy and ensure text is readable across all interface sizes and contexts.


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
| new_interface_created | `supervised` | - | - |
| body_text_rendered | `autonomous` | - | - |
| heading_rendered | `autonomous` | - | - |
| small_metadata_text | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Typography System Blueprint",
  "description": "Define a consistent type scale, font selection, and readability rules that establish clear visual hierarchy and ensure text is readable across all interface siz",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, accessibility, typography"
}
</script>
