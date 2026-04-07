---
title: "Arbitrary Values Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Use one-off custom values in utilities without defining them in theme, enabling flexible styling beyond framework constraints. 5 fields. 10 outcomes. 3 error co"
---

# Arbitrary Values Blueprint

> Use one-off custom values in utilities without defining them in theme, enabling flexible styling beyond framework constraints

| | |
|---|---|
| **Feature** | `arbitrary-values` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | arbitrary, dynamic, custom-values, escape-hatch |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/arbitrary-values.blueprint.yaml) |
| **JSON API** | [arbitrary-values.json]({{ site.baseurl }}/api/blueprints/ui/arbitrary-values.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Uses arbitrary values for unique styling requirements |
| `value_parser` | Value Parser | system | Parses and validates arbitrary value syntax |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `utility_name` | text | Yes | Base utility name (e.g., 'w', 'p', 'bg') |  |
| `arbitrary_value_syntax` | text | Yes | Value in square brackets: [value] |  |
| `css_value` | text | Yes | CSS value inside brackets (must be valid CSS) |  |
| `theme_function_reference` | text | No | Reference to theme value using theme() function |  |
| `css_variable_reference` | text | No | Reference to CSS custom property (--variable-name) |  |

## States

**State field:** `value_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `syntactically_valid` | Yes |  |
| `semantically_valid` |  |  |
| `compiled` |  |  |
| `invalid` |  |  |

## Rules

- **syntax:** Arbitrary value format: utility[value] (square brackets contain CSS), Value must be valid CSS; framework does not validate CSS syntax at parse time, Spaces inside brackets are allowed: [1rem 2rem] for multi-value properties, Slashes in values must be escaped if interpreted as modifiers: [line-height/1.5]
- **content_validation:** Value cannot contain unbalanced brackets or quotes unless properly escaped, Value can reference theme() function: [theme(--color-primary)], Value can reference CSS variables: [var(--spacing-unit)]
- **performance:** Arbitrary values cannot be cached; each unique value generates CSS, For repeated values, define in theme instead of arbitrary values
- **modifiers:** Arbitrary values can use modifiers: [rgba(255, 0, 0, 0.5)]/50 (opacity modifier)

## Outcomes

### Simple_arbitrary_width (Priority: 1)

**Given:**
- Designer needs element with 200px width (not in spacing scale)
- Designer writes 'w-[200px]'

**Then:**
- **set_field** target: `css_value` value: `200px`
- **emit_event** event: `arbitrary_value.used`

**Result:** CSS rule generated: .w-\[200px\] { width: 200px; }

### Arbitrary_color_value (Priority: 2)

**Given:**
- Designer needs specific color not in palette: 'bg-[#abc123]'
- hex value is valid CSS color

**Then:**
- **set_field** target: `css_value` value: `#abc123`

**Result:** CSS rule generated: .bg-\[\#abc123\] { background-color: #abc123; }

### Arbitrary_rgba_color (Priority: 3)

**Given:**
- Designer needs transparent color: 'bg-[rgba(255, 0, 0, 0.5)]'

**Then:**
- **set_field** target: `css_value` value: `rgba(255, 0, 0, 0.5)`

**Result:** CSS rule generated: .bg-\[rgba\(255\ 0\ 0\ 0\.5\)\] { background-color: rgba(255, 0, 0, 0.5); }

### Arbitrary_with_theme_reference (Priority: 4)

**Given:**
- Designer uses theme value in arbitrary: 'p-[theme(--spacing-4)]'
- theme() function resolves --spacing-4 from config

**Then:**
- **set_field** target: `theme_function_reference` value: `theme(--spacing-4)`
- **emit_event** event: `arbitrary_value.theme_referenced`

**Result:** CSS rule generated: .p-\[theme\(--spacing-4\)\] { padding: 1rem; }

### Arbitrary_with_css_variable (Priority: 5)

**Given:**
- Designer uses CSS variable in arbitrary: 'w-[var(--custom-width)]'
- CSS variable defined in stylesheet or inline style

**Then:**
- **set_field** target: `css_variable_reference` value: `var(--custom-width)`
- **emit_event** event: `arbitrary_value.css_variable_referenced`

**Result:** CSS rule generated: .w-\[var\(--custom-width\)\] { width: var(--custom-width); }

### Arbitrary_with_modifier (Priority: 6)

**Given:**
- Designer applies opacity modifier to arbitrary color: 'bg-[rgba(255, 0, 0, 0.5)]/75'
- Modifier 75 means 75% opacity

**Then:**
- **set_field** target: `arbitrary_value_syntax` value: `[rgba(255, 0, 0, 0.5)]/75`
- **emit_event** event: `arbitrary_value.modifier_applied`

**Result:** Opacity modifier applied to arbitrary value

### Responsive_arbitrary_value (Priority: 7)

**Given:**
- Designer wants custom width at different breakpoints: 'w-[200px] md:w-[300px] lg:w-[400px]'

**Then:**
- **emit_event** event: `arbitrary_value.responsive`

**Result:** Each breakpoint generates separate CSS rule with arbitrary value

### Arbitrary_property (Priority: 8)

**Given:**
- Designer needs custom CSS property: '[--custom-property:value]'
- Some frameworks support arbitrary properties (e.g., [color:red])

**Then:**
- **set_field** target: `css_value` value: `custom-value`

**Result:** Custom CSS property set or value applied (framework support varies)

### Invalid_arbitrary_syntax (Priority: 10) — Error: `INVALID_ARBITRARY_SYNTAX`

**Given:**
- Developer writes malformed arbitrary: 'w-[200px' (missing closing bracket)
- Or unbalanced brackets: 'bg-[rgba(255, 0, 0, 0.5)]'

**Then:**
- **emit_event** event: `arbitrary_value.syntax_error`

**Result:** Arbitrary value rejected; CSS not generated

### Invalid_theme_reference (Priority: 11) — Error: `INVALID_THEME_REFERENCE`

**Given:**
- Developer references non-existent theme key: 'p-[theme(--spacing-missing)]'

**Then:**
- **emit_event** event: `arbitrary_value.theme_error`

**Result:** Theme reference fails; candidate marked invalid

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_ARBITRARY_SYNTAX` | 400 | Arbitrary value syntax is invalid. Use square brackets: utility[value] | No |
| `INVALID_THEME_REFERENCE` | 400 | Theme reference theme(key) is invalid. Check that the theme key exists. | No |
| `UNBALANCED_BRACKETS` | 400 | Arbitrary value contains unbalanced brackets. Ensure all brackets are properly closed. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `arbitrary_value.used` |  | `utility_name`, `css_value` |
| `arbitrary_value.theme_referenced` |  | `utility_name`, `theme_key` |
| `arbitrary_value.css_variable_referenced` |  | `utility_name`, `variable_name` |
| `arbitrary_value.modifier_applied` |  | `modifier_value` |
| `arbitrary_value.responsive` |  | `breakpoints`, `arbitrary_values` |
| `arbitrary_value.syntax_error` |  | `utility_name`, `syntax_error` |
| `arbitrary_value.theme_error` |  | `missing_key` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| utility-composition | recommended | Arbitrary values extend utilities beyond theme-defined values |
| theme-configuration | optional | Arbitrary values reference theme via theme() function |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript + CSS
  pattern: Escape hatch for dynamic/custom values
  validation: Syntactic (brackets); semantic validation deferred to CSS engine
source_location: packages/tailwindcss/src
use_cases:
  - One-off values not in design system (e.g., w-[200px])
  - Dynamic values from design tokens (e.g., p-[theme(--spacing-custom)])
  - Runtime values from CSS variables (e.g., w-[var(--width)])
  - Complex values requiring CSS functions (e.g., bg-[rgba(...)])
best_practices:
  - Use arbitrary values sparingly; prefer defining in theme for consistency
  - Document why arbitrary value is needed (design token missing?)
  - Reference theme() for values that should stay in sync with design system
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Arbitrary Values Blueprint",
  "description": "Use one-off custom values in utilities without defining them in theme, enabling flexible styling beyond framework constraints. 5 fields. 10 outcomes. 3 error co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "arbitrary, dynamic, custom-values, escape-hatch"
}
</script>
