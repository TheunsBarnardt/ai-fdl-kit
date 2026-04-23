---
title: "Feature First Design Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Start design with core features and user workflows before deciding on app shell or navigation. This prevents design paralysis and ensures information architectu"
---

# Feature First Design Blueprint

> Start design with core features and user workflows before deciding on app shell or navigation. This prevents design paralysis and ensures information architecture is driven by real requirements.


| | |
|---|---|
| **Feature** | `feature-first-design` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | design-process, methodology, workflow |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/feature-first-design.blueprint.yaml) |
| **JSON API** | [feature-first-design.json]({{ site.baseurl }}/api/blueprints/ui/feature-first-design.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `priority_features` | text | No | Ranked list of features to design and build |  |
| `current_feature` | text | No | Feature currently in design cycle |  |
| `design_phase` | text | No | Current phase (requirements, wireframe, prototype, iterate, polish) |  |

## Rules

- **start_with_feature_not_layout:** Start with a feature, not a layout — design the actual functionality (search, form, display) before worrying about navigation or shell
- **detail_comes_later:** Detail comes later — low-fidelity mockups (wireframes, sketches) are fine initially; color, icons, and polish come after core flows work
- **dont_design_too_much:** Don't design too much — design one feature end-to-end before moving to the next; don't try to design the entire app in abstract
- **work_in_cycles:** Work in cycles — iterate between design and code; use working prototypes to identify real problems faster than abstract mockups
- **be_pessimist_about_features:** Be a pessimist about features — don't imply functionality you aren't ready to build; design only what's committed
- **make_it_real_early:** Make it real early — build and test with real data as soon as possible, not static mockups

## Flows

### Feature_first_design_cycle

Iterative design cycle starting from feature, not layout

1. **define_feature_scope** (designer) — Identify core workflow and required fields for the feature
1. **sketch_wireframe** (designer) — Sketch low-fidelity wireframe focusing on feature, not shell
1. **implement_prototype** (developer) — Developer builds functional prototype from wireframe
1. **test_with_real_data** (designer) — Test prototype with real data and identify problems
1. **refine_design** (designer) — Iterate on design to fix discovered issues
1. **apply_visual_polish** (designer) — Add visual refinement (color, icons, spacing)
1. **merge_to_main** (developer) — Merge polished feature to main

## Outcomes

### New_feature_being_designed (Priority: 1)

**Given:**
- new feature is being designed

**Then:**
- **set_field** target: `design_focus` value: `core workflow and required fields`
- **set_field** target: `ignore_for_now` value: `navigation, shell, layout architecture`
- **set_field** target: `fidelity_level` value: `low (wireframe or sketch)`

**Result:** design effort is focused on real requirements, not assumptions

### Feature_design_ready_for_implementation (Priority: 2)

**Given:**
- feature design is ready for implementation

**Then:**
- **set_field** target: `next_step` value: `build functional prototype in code`
- **set_field** target: `defer` value: `color, icons, typography refinement`
- **set_field** target: `test_with` value: `real data, real user workflow`

**Result:** design moves into code early for faster iteration

### Working_prototype_reveals_problems (Priority: 3)

**Given:**
- working prototype reveals design problems

**Then:**
- **set_field** target: `response` value: `iterate in code, not in design tool`
- **emit_event** event: `design.iteration.active`

**Result:** design problems are caught early with real user interaction

### Multiple_features_planned (Priority: 4)

**Given:**
- multiple features are planned

**Then:**
- **set_field** target: `design_sequence` value: `highest-priority feature first, end-to-end`
- **set_field** target: `avoid` value: `designing all features in parallel`

**Result:** each feature is complete and tested before next begins

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| design-polish | optional | Polish is applied after core feature is working |
| form-design | recommended | Forms are common features to start with |
| accessibility | required | Accessibility is considered from start, not bolted on later |

## AGI Readiness

### Goals

#### Reliable Feature First Design

Start design with core features and user workflows before deciding on app shell or navigation. This prevents design paralysis and ensures information architecture is driven by real requirements.


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

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `accessibility` | accessibility | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| new_feature_being_designed | `autonomous` | - | - |
| feature_design_ready_for_implementation | `autonomous` | - | - |
| working_prototype_reveals_problems | `autonomous` | - | - |
| multiple_features_planned | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Feature First Design Blueprint",
  "description": "Start design with core features and user workflows before deciding on app shell or navigation. This prevents design paralysis and ensures information architectu",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "design-process, methodology, workflow"
}
</script>
