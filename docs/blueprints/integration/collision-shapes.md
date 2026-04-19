---
title: "Collision Shapes Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Primitive collision shapes for physics and raycasting. 6 outcomes. rules: implementation, platform_agnostic"
---

# Collision Shapes Blueprint

> Primitive collision shapes for physics and raycasting

| | |
|---|---|
| **Feature** | `collision-shapes` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | integration, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/collision-shapes.blueprint.yaml) |
| **JSON API** | [collision-shapes.json]({{ site.baseurl }}/api/blueprints/integration/collision-shapes.json) |

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

### Box_shape (Priority: 1)

**Given:**
- Axis-aligned bounding box is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Axis-aligned bounding box completed

### Sphere_shape (Priority: 2)

**Given:**
- Spherical collision is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Spherical collision completed

### Capsule_shape (Priority: 3)

**Given:**
- Cylinder with rounded ends is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Cylinder with rounded ends completed

### Cylinder_shape (Priority: 4)

**Given:**
- Circular extrusion is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Circular extrusion completed

### Mesh_shape (Priority: 5)

**Given:**
- Trimesh from model data is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Trimesh from model data completed

### Convex_shape (Priority: 6)

**Given:**
- Optimized convex hull is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Optimized convex hull completed

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
  "name": "Collision Shapes Blueprint",
  "description": "Primitive collision shapes for physics and raycasting. 6 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "integration, godot"
}
</script>
