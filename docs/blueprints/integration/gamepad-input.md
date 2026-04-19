---
title: "Gamepad Input Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Joystick/gamepad input and haptic feedback. 5 outcomes. rules: implementation, platform_agnostic"
---

# Gamepad Input Blueprint

> Joystick/gamepad input and haptic feedback

| | |
|---|---|
| **Feature** | `gamepad-input` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | integration, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/gamepad-input.blueprint.yaml) |
| **JSON API** | [gamepad-input.json]({{ site.baseurl }}/api/blueprints/integration/gamepad-input.json) |

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

### Device_detection (Priority: 1)

**Given:**
- Enumerate connected gamepads is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Enumerate connected gamepads completed

### Axis_input (Priority: 2)

**Given:**
- Read analog stick/trigger values is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Read analog stick/trigger values completed

### Button_input (Priority: 3)

**Given:**
- Detect gamepad button presses is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Detect gamepad button presses completed

### Vibration (Priority: 4)

**Given:**
- Send haptic feedback to device is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Send haptic feedback to device completed

### Device_mapping (Priority: 5)

**Given:**
- Standardized input mapping is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Standardized input mapping completed

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
  "name": "Gamepad Input Blueprint",
  "description": "Joystick/gamepad input and haptic feedback. 5 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "integration, godot"
}
</script>
