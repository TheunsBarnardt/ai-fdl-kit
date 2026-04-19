---
title: "Keyframe Animation Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Timeline-based keyframe animation and playback. 5 outcomes. rules: implementation, platform_agnostic"
---

# Keyframe Animation Blueprint

> Timeline-based keyframe animation and playback

| | |
|---|---|
| **Feature** | `keyframe-animation` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ui, godot |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/keyframe-animation.blueprint.yaml) |
| **JSON API** | [keyframe-animation.json]({{ site.baseurl }}/api/blueprints/ui/keyframe-animation.json) |

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

### Animation_recording (Priority: 1)

**Given:**
- Capture property changes is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Capture property changes completed

### Animation_playback (Priority: 2)

**Given:**
- Play stored animations is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Play stored animations completed

### Animation_blending (Priority: 3)

**Given:**
- Fade between animations is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Fade between animations completed

### Animation_speed (Priority: 4)

**Given:**
- Adjust playback rate is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Adjust playback rate completed

### Animation_callbacks (Priority: 5)

**Given:**
- Trigger events at keyframes is requested

**Then:**
- **transition_state** field: `status` from: `idle` to: `active`

**Result:** Trigger events at keyframes completed

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
  "name": "Keyframe Animation Blueprint",
  "description": "Timeline-based keyframe animation and playback. 5 outcomes. rules: implementation, platform_agnostic",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ui, godot"
}
</script>
