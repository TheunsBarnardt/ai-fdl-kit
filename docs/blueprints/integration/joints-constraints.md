---
title: "Joints Constraints Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "3D joint constraints connecting rigid bodies. 5 outcomes. rules: implementation, platform_agnostic"
---

# Joints Constraints Blueprint

> 3D joint constraints connecting rigid bodies

| | |
|---|---|
| **Feature** | `joints-constraints` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | integration, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/joints-constraints.blueprint.yaml) |
| **JSON API** | [joints-constraints.json]({{ site.baseurl }}/api/blueprints/integration/joints-constraints.json) |

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

### Hinge_joint (Priority: 1)

**Given:**
- Revolute joint (door hinge) is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Revolute joint (door hinge) completed

### Slider_joint (Priority: 2)

**Given:**
- Prismatic joint (piston) is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Prismatic joint (piston) completed

### Ball_joint (Priority: 3)

**Given:**
- Spherical joint (shoulder) is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Spherical joint (shoulder) completed

### Cone_twist_joint (Priority: 4)

**Given:**
- Twist with cone limit is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Twist with cone limit completed

### 6 Dof_joint (Priority: 5)

**Given:**
- Full 6-axis freedom with limits is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Full 6-axis freedom with limits completed

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
  "name": "Joints Constraints Blueprint",
  "description": "3D joint constraints connecting rigid bodies. 5 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "integration, godot"
}
</script>
