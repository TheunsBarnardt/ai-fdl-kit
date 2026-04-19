---
title: "File Operations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Cross-platform file reading and writing. 5 outcomes. rules: implementation, platform_agnostic"
---

# File Operations Blueprint

> Cross-platform file reading and writing

| | |
|---|---|
| **Feature** | `file-operations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | data, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/file-operations.blueprint.yaml) |
| **JSON API** | [file-operations.json]({{ site.baseurl }}/api/blueprints/data/file-operations.json) |

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

### File_reading (Priority: 1)

**Given:**
- Read file contents as string or bytes is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Read file contents as string or bytes completed

### File_writing (Priority: 2)

**Given:**
- Write data to file with overwrite protection is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Write data to file with overwrite protection completed

### File_existence (Priority: 3)

**Given:**
- Check if file exists is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Check if file exists completed

### File_deletion (Priority: 4)

**Given:**
- Delete file from disk is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Delete file from disk completed

### File_properties (Priority: 5)

**Given:**
- Get file size and modification time is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Get file size and modification time completed

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
  "name": "File Operations Blueprint",
  "description": "Cross-platform file reading and writing. 5 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "data, godot"
}
</script>
