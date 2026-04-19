---
title: "Keyboard Input Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Keyboard input capture and key state tracking. 4 outcomes. rules: implementation, platform_agnostic"
---

# Keyboard Input Blueprint

> Keyboard input capture and key state tracking

| | |
|---|---|
| **Feature** | `keyboard-input` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | integration, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/keyboard-input.blueprint.yaml) |
| **JSON API** | [keyboard-input.json]({{ site.baseurl }}/api/blueprints/integration/keyboard-input.json) |

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

### Key_state_detection (Priority: 1)

**Given:**
- Check if key is pressed is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Check if key is pressed completed

### Key_events (Priority: 2)

**Given:**
- Receive key press/release signals is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Receive key press/release signals completed

### Key_modifiers (Priority: 3)

**Given:**
- Detect Shift, Ctrl, Alt, etc. is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Detect Shift, Ctrl, Alt, etc. completed

### Raw_input (Priority: 4)

**Given:**
- Access raw keyboard input is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Access raw keyboard input completed

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
  "name": "Keyboard Input Blueprint",
  "description": "Keyboard input capture and key state tracking. 4 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "integration, godot"
}
</script>
