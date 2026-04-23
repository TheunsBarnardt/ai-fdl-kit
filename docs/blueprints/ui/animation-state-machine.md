---
title: "Animation State Machine Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "State machine-based animation control. 4 outcomes. rules: implementation, platform_agnostic. AGI: semi_autonomous"
---

# Animation State Machine Blueprint

> State machine-based animation control

| | |
|---|---|
| **Feature** | `animation-state-machine` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/animation-state-machine.blueprint.yaml) |
| **JSON API** | [animation-state-machine.json]({{ site.baseurl }}/api/blueprints/ui/animation-state-machine.json) |

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

### State_creation (Priority: 1)

**Given:**
- Define animation states is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Define animation states completed

### Transitions (Priority: 2)

**Given:**
- Move between states with conditions is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Move between states with conditions completed

### Blend_spaces (Priority: 3)

**Given:**
- 1D/2D parametric blending is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** 1D/2D parametric blending completed

### State_callbacks (Priority: 4)

**Given:**
- Execute code on state change is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Execute code on state change completed

## AGI Readiness

### Goals

#### Reliable Animation State Machine

State machine-based animation control

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| state_creation | `supervised` | - | - |
| transitions | `autonomous` | - | - |
| blend_spaces | `autonomous` | - | - |
| state_callbacks | `autonomous` | - | - |

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
  "name": "Animation State Machine Blueprint",
  "description": "State machine-based animation control. 4 outcomes. rules: implementation, platform_agnostic. AGI: semi_autonomous",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, godot"
}
</script>
