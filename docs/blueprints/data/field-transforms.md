---
title: "Field Transforms Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Per-field-type transformation pipeline with read-only path resolution, async tracking, and trigger-based caching. 6 fields. 7 outcomes. 3 error codes. rules: tr"
---

# Field Transforms Blueprint

> Per-field-type transformation pipeline with read-only path resolution, async tracking, and trigger-based caching

| | |
|---|---|
| **Feature** | `field-transforms` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | field-transforms, data-resolution, computed-properties, pipeline, editor |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/field-transforms.blueprint.yaml) |
| **JSON API** | [field-transforms.json]({{ site.baseurl }}/api/blueprints/data/field-transforms.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `transform_pipeline` | Transform Pipeline | system | System that applies per-field-type transformation functions to component data |
| `resolver` | Component Resolver | system | System that runs resolveData, resolveFields, and resolvePermissions lifecycle hooks |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `field_type` | select | Yes | Field Type |  |
| `field_value` | json | No | Field Value |  |
| `prop_path` | text | Yes | Property Path |  |
| `is_read_only` | boolean | No | Is Read Only |  |
| `component_id` | text | Yes | Component ID |  |
| `resolve_trigger` | select | No | Resolution Trigger |  |

## Rules

- **transform_pipeline:**
  - **per_field_type:** true
  - **walks_entire_props:** true
  - **handles_nested_objects:** true
  - **handles_arrays:** true
  - **handles_slots:** true
- **read_only_resolution:**
  - **exact_path_match:** true
  - **wildcard_path_match:** true
  - **force_read_only_flag:** true
- **caching:**
  - **cache_by_component_id:** true
  - **cache_stores_input_and_output:** true
  - **skip_on_unchanged:** true
- **trigger_based_skip:**
  - **move_skip_unless_parent_changed:** true
  - **force_always_resolves:** true
  - **insert_always_resolves:** true
- **async_tracking:**
  - **per_field_loading_state:** true
  - **deferred_loading_status:** true
- **default_transforms:**
  - **slot_transform:** true
  - **rich_text_transform:** true
  - **inline_text_transform:** true

## Outcomes

### Apply_transforms (Priority: 1)

**Given:**
- component data is being prepared for rendering or editing
- field transform functions are registered for the field types in use

**Then:**
- **call_service** target: `transform_pipeline` — Walk all component props, match field types to transform functions, apply transforms with value, readOnly state, componentId, and propPath

**Result:** Transformed prop values returned for rendering

### Resolve_read_only (Priority: 2)

**Given:**
- a field has a prop path
- the component has read-only flags defined

**Then:**
- **call_service** target: `read_only_resolver` — Check exact path match, then wildcard path match, then force flag to determine read-only state

**Result:** Field marked as read-only or editable based on resolution

### Resolve_component_data (Priority: 3)

**Given:**
- a trigger event occurs (insert, replace, move, load, or force)
- the component has a resolveData lifecycle hook
- cache check passes (data has changed, or trigger is force/insert)

**Then:**
- **call_service** target: `resolver` — Call resolveData with current data, changed flags, last data, trigger, and parent reference
- **set_field** target: `component_props` — Merge resolved props into component data
- **set_field** target: `resolution_cache` — Cache the input/output pair for future skip checks
- **emit_event** event: `field.data.resolved`

**Result:** Component data updated with dynamically computed values

### Resolve_fields_schema (Priority: 4)

**Given:**
- component data has changed
- the component has a resolveFields lifecycle hook

**Then:**
- **call_service** target: `resolver` — Call resolveFields with current data, changed flags, current fields, last fields, and app state
- **set_field** target: `field_definitions` — Update visible field schema based on resolver output
- **emit_event** event: `field.schema.resolved`

**Result:** Field panel shows/hides fields based on current component state

### Resolve_permissions (Priority: 5)

**Given:**
- component data or context has changed
- the component has a resolvePermissions lifecycle hook

**Then:**
- **call_service** target: `resolver` — Call resolvePermissions with current data, changed flags, current permissions, and app state
- **set_field** target: `component_permissions` — Update component-level permissions (drag, edit, delete, duplicate, insert)
- **emit_event** event: `field.permissions.resolved`

**Result:** Component actions enabled/disabled based on resolved permissions

### Skip_resolution_on_cache_hit (Priority: 6)

**Given:**
- trigger is 'replace' or 'move'
- component data has not changed since last resolution
- for 'move' trigger, parent component has not changed

**Then:**
- **emit_event** event: `field.resolution.skipped`

**Result:** Resolution skipped, cached result used

### Recursive_slot_resolution (Priority: 7)

**Given:**
- a component has slot fields containing child components
- parent component is being resolved

**Then:**
- **call_service** target: `resolver` — Recursively resolve each child component in each slot with same trigger

**Result:** All nested components resolved with parent context propagated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRANSFORM_FAILED` | 500 | Field transform failed to process | No |
| `RESOLVE_TIMEOUT` | 500 | Component data resolution timed out | No |
| `RESOLVE_ABORTED` | 500 | Resolution aborted because component was deleted during async operation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `field.data.resolved` | Component data was resolved via lifecycle hook | `component_id`, `trigger`, `did_change` |
| `field.schema.resolved` | Field schema was updated via resolveFields hook | `component_id`, `changed_fields_count` |
| `field.permissions.resolved` | Component permissions were resolved via lifecycle hook | `component_id`, `permissions` |
| `field.resolution.skipped` | Resolution was skipped due to cache hit | `component_id`, `trigger`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| component-registry | required | Lifecycle hooks (resolveData, resolveFields, resolvePermissions) are defined on component configs |
| content-tree | required | Transforms operate on component data stored in the content tree |
| editor-state | required | Resolution results update the centralized state |

## AGI Readiness

### Goals

#### Reliable Field Transforms

Per-field-type transformation pipeline with read-only path resolution, async tracking, and trigger-based caching

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `component_registry` | component-registry | degrade |
| `content_tree` | content-tree | degrade |
| `editor_state` | editor-state | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| apply_transforms | `autonomous` | - | - |
| resolve_read_only | `autonomous` | - | - |
| resolve_component_data | `autonomous` | - | - |
| resolve_fields_schema | `autonomous` | - | - |
| resolve_permissions | `autonomous` | - | - |
| skip_resolution_on_cache_hit | `autonomous` | - | - |
| recursive_slot_resolution | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 8
  entry_points:
    - lib/field-transforms/
    - lib/resolve-component-data.ts
    - types/API/FieldTransforms.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Field Transforms Blueprint",
  "description": "Per-field-type transformation pipeline with read-only path resolution, async tracking, and trigger-based caching. 6 fields. 7 outcomes. 3 error codes. rules: tr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "field-transforms, data-resolution, computed-properties, pipeline, editor"
}
</script>
