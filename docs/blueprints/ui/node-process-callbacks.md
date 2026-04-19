---
title: "Node Process Callbacks Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Per-frame update callbacks and physics processing. 4 outcomes. rules: implementation, platform_agnostic"
---

# Node Process Callbacks Blueprint

> Per-frame update callbacks and physics processing

| | |
|---|---|
| **Feature** | `node-process-callbacks` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/node-process-callbacks.blueprint.yaml) |
| **JSON API** | [node-process-callbacks.json]({{ site.baseurl }}/api/blueprints/ui/node-process-callbacks.json) |

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

### Process (Priority: 1)

**Given:**
- Called every frame for logic updates is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Called every frame for logic updates completed

### Physics_process (Priority: 2)

**Given:**
- Called at fixed timestep for physics is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Called at fixed timestep for physics completed

### Input_processing (Priority: 3)

**Given:**
- Receive input events is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Receive input events completed

### Notification_system (Priority: 4)

**Given:**
- Custom lifecycle notifications is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Custom lifecycle notifications completed

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
  "name": "Node Process Callbacks Blueprint",
  "description": "Per-frame update callbacks and physics processing. 4 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, godot"
}
</script>
