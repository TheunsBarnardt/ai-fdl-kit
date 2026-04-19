---
title: "Text Input Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Text entry fields and text editing. 5 outcomes. rules: implementation, platform_agnostic"
---

# Text Input Blueprint

> Text entry fields and text editing

| | |
|---|---|
| **Feature** | `text-input` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/text-input.blueprint.yaml) |
| **JSON API** | [text-input.json]({{ site.baseurl }}/api/blueprints/ui/text-input.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `game_engine` | Godot Engine | system |  |

## Rules

- **implementation:**
  - **description:** Feature implemented in C++ engine core
- **platform_agnostic:**
  - **description:** Works across desktop, web, mobile platforms

## Outcomes

### Single Line_input (Priority: 1)

**Given:**
- LineEdit widget is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** LineEdit widget completed

### Multi Line_input (Priority: 2)

**Given:**
- TextEdit widget is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** TextEdit widget completed

### Text_validation (Priority: 3)

**Given:**
- Input filtering and constraints is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Input filtering and constraints completed

### Cursor_control (Priority: 4)

**Given:**
- Move caret and select text is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Move caret and select text completed

### Copy/paste (Priority: 5)

**Given:**
- Clipboard integration is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Clipboard integration completed

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  runtime: Godot 4.x
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Text Input Blueprint",
  "description": "Text entry fields and text editing. 5 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, godot"
}
</script>
