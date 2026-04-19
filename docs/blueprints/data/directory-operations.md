---
title: "Directory Operations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Directory traversal and management. 4 outcomes. rules: implementation, platform_agnostic"
---

# Directory Operations Blueprint

> Directory traversal and management

| | |
|---|---|
| **Feature** | `directory-operations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | data, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/directory-operations.blueprint.yaml) |
| **JSON API** | [directory-operations.json]({{ site.baseurl }}/api/blueprints/data/directory-operations.json) |

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

### Directory_listing (Priority: 1)

**Given:**
- Enumerate files and subdirectories is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Enumerate files and subdirectories completed

### Directory_creation (Priority: 2)

**Given:**
- Create new directories is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Create new directories completed

### Directory_deletion (Priority: 3)

**Given:**
- Remove empty directories is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Remove empty directories completed

### Path_resolution (Priority: 4)

**Given:**
- Normalize and join paths is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Normalize and join paths completed

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
  "name": "Directory Operations Blueprint",
  "description": "Directory traversal and management. 4 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "data, godot"
}
</script>
