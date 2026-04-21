---
title: "Visual Hierarchy Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Establish clear visual hierarchy through size, weight, color, and spacing so users can quickly scan and understand interface priority without cognitive overload"
---

# Visual Hierarchy Blueprint

> Establish clear visual hierarchy through size, weight, color, and spacing so users can quickly scan and understand interface priority without cognitive overload.


| | |
|---|---|
| **Feature** | `visual-hierarchy` |
| **Category** | UI |
| **Version** | 1.0 |
| **Tags** | design-system, accessibility, visual-design |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/visual-hierarchy.blueprint.yaml) |
| **JSON API** | [visual-hierarchy.json]({{ site.baseurl }}/api/blueprints/ui/visual-hierarchy.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `primary_content` | text | No |  |  |
| `secondary_content` | text | No |  |  |
| `tertiary_content` | text | No |  |  |
| `hierarchy_levels` | number | No |  |  |

## Rules

- Not all elements should be equal — differentiate primary content from secondary
- Use size strategically — scale is the most powerful hierarchy tool after careful spacing
- Don't use grey text on colored backgrounds — reduces contrast and harm accessibility
- Emphasize by de-emphasizing — make less important elements quieter, not primary ones louder
- Never use labels as primary identity — labels are a last resort after visual hierarchy fails
- Separate visual hierarchy from document hierarchy — visual and structural order needn't match

## Outcomes

### 0

**Given:**
- user scans interface for key information

**Then:**
- primary actions and content are visually distinct through size, weight, or color
- secondary elements are de-emphasized through reduced opacity, weight, or color intensity
- all elements have clear visual relationships expressed in spacing and contrast

**Result:** user can scan interface in under 2 seconds without reading labels

### 1

**Given:**
- interface has multiple content sections

**Then:**
- section headings use significantly larger type size than body content
- heading weight (font-weight) is proportional to hierarchy level
- spacing between hierarchy levels increases as importance decreases

**Result:** visual structure is immediately apparent without visual stress

### 2

**Given:**
- action or data point is critical to task completion

**Then:**
- **set_field** target: `element_size` value: `largest in context`
- **set_field** target: `color_saturation` value: `highest in context`
- **set_field** target: `contrast_ratio` value: `>=7:1`

**Result:** critical element has no visual competitors for user attention

### 3

**Given:**
- interface has low-priority metadata or supporting info

**Then:**
- **set_field** target: `text_color` value: `reduced_saturation or opacity < 100%`
- **set_field** target: `font_weight` value: `lighter than body`
- **set_field** target: `element_size` value: `12-14px for web`

**Result:** low-priority content is accessible but won't distract from primary content

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| typography-system | recommended |  |
| spacing-system | recommended |  |
| color-system | recommended |  |
| accessibility | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Visual Hierarchy Blueprint",
  "description": "Establish clear visual hierarchy through size, weight, color, and spacing so users can quickly scan and understand interface priority without cognitive overload",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-system, accessibility, visual-design"
}
</script>
