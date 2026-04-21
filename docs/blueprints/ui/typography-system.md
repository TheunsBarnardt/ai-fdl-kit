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
| **Version** | 1.0 |
| **Tags** | design-system, accessibility, typography |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/typography-system.blueprint.yaml) |
| **JSON API** | [typography-system.json]({{ site.baseurl }}/api/blueprints/ui/typography-system.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `base_size` | number | No |  |  |
| `type_scale_ratio` | number | No |  |  |
| `primary_font_family` | text | No |  |  |
| `secondary_font_family` | text | No |  |  |
| `line_length_range` | text | No |  |  |

## Rules

- Establish a type scale — use a base size (16px) and multiply by consistent ratios (1.125, 1.25, 1.5) for heading sizes
- Use good fonts with multiple weights — modern sans-serifs with 3+ weights (regular, medium, bold) are safest defaults
- Keep line length between 50-75 characters for optimal readability
- Align text to baseline, never center-align — readability is worse with center alignment
- Line-height should be proportional to measure — tighter leading for small text, looser for large
- Not every link needs a color — underline or weight change can signal interactivity
- Align with readability in mind — consider visual weight, line-height, letter-spacing together
- Use letter-spacing effectively — only increase for headlines; body text rarely needs adjustment

## Outcomes

### 0

**Given:**
- new interface is created

**Then:**
- **create_record** target: `type_scale`
- **set_field** target: `primary_font` value: `modern_sans_serif_with_3plus_weights`
- **set_field** target: `line_length_max` value: `75 characters`

**Result:** typography system is established and documented

### 1

**Given:**
- body text is rendered

**Then:**
- **set_field** target: `font_size` value: `16px or larger`
- **set_field** target: `line_height` value: `1.5 to 1.75`
- **set_field** target: `measure` value: `50-75 characters per line`
- **set_field** target: `text_alignment` value: `left_aligned`

**Result:** text is scannable and readable without eye strain

### 2

**Given:**
- heading is rendered

**Then:**
- **set_field** target: `font_size` value: `computed from type scale`
- **set_field** target: `font_weight` value: `600 or bolder`
- **set_field** target: `line_height` value: `1.1 to 1.3`

**Result:** heading has clear visual distinction from body copy

### 3

**Given:**
- small metadata or UI text (12px or smaller)

**Then:**
- **set_field** target: `line_height` value: `1.4 minimum`
- **set_field** target: `letter_spacing` value: `+0.25px minimum`

**Result:** small text remains readable and isn't cramped

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visual-hierarchy | required |  |
| spacing-system | recommended |  |
| accessibility | required |  |
| dark-mode | recommended |  |


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
