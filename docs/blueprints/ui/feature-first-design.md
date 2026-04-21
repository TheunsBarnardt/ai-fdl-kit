---
title: "Feature First Design Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Start design with core features and user workflows before deciding on app shell, navigation, or layout. This prevents design paralysis and ensures information a"
---

# Feature First Design Blueprint

> Start design with core features and user workflows before deciding on app shell, navigation, or layout. This prevents design paralysis and ensures information architecture is driven by real requirements, not design assumptions.


| | |
|---|---|
| **Feature** | `feature-first-design` |
| **Category** | UI |
| **Version** | 1.0 |
| **Tags** | design-process, methodology, workflow |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/feature-first-design.blueprint.yaml) |
| **JSON API** | [feature-first-design.json]({{ site.baseurl }}/api/blueprints/ui/feature-first-design.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `priority_features` | text | No |  |  |
| `current_feature` | text | No |  |  |
| `design_phase` | text | No |  |  |

## Rules

- Start with a feature, not a layout — design the actual functionality (search, form, display) before worrying about navigation or shell
- Detail comes later — low-fidelity mockups (wireframes, sketches) are fine initially; color, icons, and polish come after core flows work
- Don't design too much — design one feature end-to-end before moving to the next; don't try to design the entire app in abstract
- Work in cycles — iterate between design and code; use working prototypes to identify real problems faster than abstract mockups
- Be a pessimist about features — don't imply functionality you aren't ready to build; design only what's committed
- Make it real early — build and test with real data as soon as possible, not static mockups

## Flows

## Outcomes

### 0

**Given:**
- new feature is being designed

**Then:**
- **set_field** target: `design_focus` value: `core workflow and required fields`
- **set_field** target: `ignore_for_now` value: `navigation, shell, layout architecture`
- **set_field** target: `fidelity_level` value: `low (wireframe or sketch)`

**Result:** design effort is focused on real requirements, not assumptions

### 1

**Given:**
- feature design is ready for implementation

**Then:**
- **set_field** target: `next_step` value: `build functional prototype in code`
- **set_field** target: `defer` value: `color, icons, typography refinement`
- **set_field** target: `test_with` value: `real data, real user workflow`

**Result:** design moves into code early for faster iteration

### 2

**Given:**
- working prototype reveals design problems

**Then:**
- **set_field** target: `response` value: `iterate in code, not in design tool`
- **emit_event** event: `design.iteration.active`

**Result:** design problems are caught early with real user interaction

### 3

**Given:**
- multiple features are planned

**Then:**
- **set_field** target: `design_sequence` value: `highest-priority feature first, end-to-end`
- **set_field** target: `avoid` value: `designing all features in parallel`

**Result:** each feature is complete and tested before next begins

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| design-polish | optional |  |
| form-design | recommended |  |
| accessibility | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Feature First Design Blueprint",
  "description": "Start design with core features and user workflows before deciding on app shell, navigation, or layout. This prevents design paralysis and ensures information a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-process, methodology, workflow"
}
</script>
