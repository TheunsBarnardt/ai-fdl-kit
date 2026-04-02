---
title: "Utility Composition Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Build user interfaces by composing utility classes with variants and modifiers to generate CSS rules. 9 fields. 8 outcomes. 3 error codes. rules: parsing, varia"
---

# Utility Composition Blueprint

> Build user interfaces by composing utility classes with variants and modifiers to generate CSS rules

| | |
|---|---|
| **Feature** | `utility-composition` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | utilities, variants, responsive, state-modifiers |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/utility-composition.blueprint.yaml) |
| **JSON API** | [utility-composition.json]({{ site.baseurl }}/api/blueprints/ui/utility-composition.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer/Designer | human | Writes HTML/templates using utility classes |
| `css_generator` | CSS Generator | system | Parses utility class names and generates CSS rules |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `utility_class_name` | text | Yes | Base utility class without variants (e.g., 'flex', 'p-4', 'text-blue-500') |  |
| `variant_prefix` | text | No | Variant modifier before colon (e.g., 'hover', 'md', 'dark', 'group-hover') |  |
| `modifier` | text | No | Optional modifier after slash to apply sub-values (e.g., opacity: 'p-4/50' means 50% opacity) |  |
| `important_flag` | boolean | No | Whether to add !important to generated CSS rule (trailing ! in class name) |  |
| `css_property` | text | Yes | CSS property applied by utility (e.g., 'display', 'padding', 'color') |  |
| `css_value` | text | Yes | CSS value applied to property (e.g., 'flex', '1rem', '#3b82f6') |  |
| `responsive_breakpoint` | select | No | Responsive breakpoint variant (sm, md, lg, xl, 2xl) |  |
| `pseudo_class` | select | No | CSS pseudo-class variant |  |
| `pseudo_element` | select | No | CSS pseudo-element variant |  |

## States

**State field:** `class_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unrecognized` |  |  |
| `parsed` | Yes |  |
| `compiled` |  |  |
| `sorted` |  |  |

## Rules

- **parsing:** Utility class format: [variant(s):]*utility[/modifier][!], Multiple variants chain with colons: 'md:hover:flex' (responsive + pseudo-class + utility), Unknown utilities are silently dropped, not compiled to CSS
- **variants:** Responsive variants (sm:, md:, lg:) generate CSS media queries based on breakpoints, Pseudo-class variants (hover:, focus:) generate CSS :pseudo-class selectors, Pseudo-element variants (before:, after:) generate CSS ::pseudo-element selectors, Dark mode variant (dark:) generates selector based on darkMode strategy (media, class, selector), Variant order matters: variants sort in a specific order for CSS cascade correctness
- **composition:** Single utility can have multiple variants; all variants apply to the same CSS rule, Modifier (after /) applies additional behavior like opacity or color opacity, Important flag (!) adds !important to generated CSS declaration
- **performance:** Duplicate class names are deduplicated; same utility+variants only generates CSS once

## Outcomes

### Simple_utility (Priority: 1)

**Given:**
- Developer writes utility class 'flex' in HTML
- flex utility is defined in design system

**Then:**
- **set_field** target: `css_property` value: `display`
- **set_field** target: `css_value` value: `flex`
- **emit_event** event: `utility.compiled`

**Result:** CSS rule generated: .flex { display: flex; }

### Utility_with_value (Priority: 2)

**Given:**
- Developer writes 'p-4' (padding with value from theme)
- spacing theme has value for 4 (e.g., 1rem)

**Then:**
- **set_field** target: `css_property` value: `padding`
- **set_field** target: `css_value` value: `1rem`

**Result:** CSS rule generated: .p-4 { padding: 1rem; }

### Responsive_utility (Priority: 3)

**Given:**
- Developer writes 'md:flex'
- md breakpoint is configured (e.g., 768px)

**Then:**
- **set_field** target: `responsive_breakpoint` value: `md`
- **set_field** target: `css_property` value: `display`
- **set_field** target: `css_value` value: `flex`

**Result:** CSS rule in media query: @media (min-width: 768px) { .md\:flex { display: flex; } }

### Hover_state_styling (Priority: 4)

**Given:**
- Developer writes 'hover:text-blue-500'
- text-blue-500 utility exists

**Then:**
- **set_field** target: `pseudo_class` value: `hover`
- **set_field** target: `css_property` value: `color`
- **set_field** target: `css_value` value: `#3b82f6`

**Result:** CSS rule generated: .hover\:text-blue-500:hover { color: #3b82f6; }

### Multiple_variants (Priority: 5)

**Given:**
- Developer writes 'md:hover:flex'
- md breakpoint and hover variant both exist

**Then:**
- **set_field** target: `responsive_breakpoint` value: `md`
- **set_field** target: `pseudo_class` value: `hover`

**Result:** CSS rule combines both: @media (min-width: 768px) { .md\:hover\:flex:hover { display: flex; } }

### Important_modifier (Priority: 6)

**Given:**
- Developer writes 'flex!' to force !important

**Then:**
- **set_field** target: `important_flag` value: `true`

**Result:** CSS rule includes !important: .flex\! { display: flex !important; }

### Modifier_opacity (Priority: 7)

**Given:**
- Developer writes 'p-4/50' (padding with 50% opacity)

**Then:**
- **set_field** target: `modifier` value: `50`

**Result:** CSS includes opacity modifier: .p-4\/50 { padding: 1rem; opacity: 0.5; }

### Unknown_utility (Priority: 10) — Error: `UNKNOWN_UTILITY`

**Given:**
- Developer writes 'unknown-class'
- unknown-class does not match any known utility

**Then:**
- **emit_event** event: `utility.invalid`

**Result:** Class is skipped; no CSS generated for this utility

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `UNKNOWN_UTILITY` | 400 | Utility class not recognized. Check the utility name spelling and ensure it's defined in your theme. | No |
| `INVALID_VARIANT_COMBINATION` | 400 | This variant combination is not supported or not applicable to this utility. | No |
| `INVALID_MODIFIER` | 400 | Modifier value is invalid for this utility (e.g., opacity must be 0-100). | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `utility.compiled` |  | `utility_name`, `css_property`, `css_value`, `variants` |
| `utility.invalid` |  | `utility_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| theme-configuration | required | Utilities read values from theme configuration |
| responsive-layout | recommended | Responsive variants (md:, lg:) enable layout breakpoints |
| arbitrary-values | optional | Arbitrary values provide escape hatch for custom values |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript + CSS
  parser: Rust (crates/oxide for candidate parsing)
source_location: packages/tailwindcss/src
performance_notes: Candidate parsing cached; invalid candidates tracked to prevent re-parsing
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Utility Composition Blueprint",
  "description": "Build user interfaces by composing utility classes with variants and modifiers to generate CSS rules. 9 fields. 8 outcomes. 3 error codes. rules: parsing, varia",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "utilities, variants, responsive, state-modifiers"
}
</script>
