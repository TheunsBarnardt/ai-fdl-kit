---
title: "Button Controls Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Clickable buttons and button groups. 4 outcomes. rules: implementation, platform_agnostic"
---

# Button Controls Blueprint

> Clickable buttons and button groups

| | |
|---|---|
| **Feature** | `button-controls` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/button-controls.blueprint.yaml) |
| **JSON API** | [button-controls.json]({{ site.baseurl }}/api/blueprints/ui/button-controls.json) |

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

### Button_creation (Priority: 1)

**Given:**
- Text and icon buttons is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Text and icon buttons completed

### Button_signals (Priority: 2)

**Given:**
- pressed, released, toggled is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** pressed, released, toggled completed

### Button_groups (Priority: 3)

**Given:**
- Radio button behavior is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Radio button behavior completed

### Styling (Priority: 4)

**Given:**
- Customize appearance is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Customize appearance completed

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
  "name": "Button Controls Blueprint",
  "description": "Clickable buttons and button groups. 4 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, godot"
}
</script>
