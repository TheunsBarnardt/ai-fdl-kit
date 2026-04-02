---
title: "Component Registry Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Pluggable component registration system with config-driven fields, slots, lifecycle hooks, and permissions. 10 fields. 8 outcomes. 4 error codes. rules: registr"
---

# Component Registry Blueprint

> Pluggable component registration system with config-driven fields, slots, lifecycle hooks, and permissions

| | |
|---|---|
| **Feature** | `component-registry` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | component-system, registry, plugin, visual-editor, configuration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/component-registry.blueprint.yaml) |
| **JSON API** | [component-registry.json]({{ site.baseurl }}/api/blueprints/ui/component-registry.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Person who registers component types with the editor via configuration |
| `editor_user` | Editor User | human | Person who uses the visual editor to place and configure components |
| `resolver` | Data Resolver | system | System that runs lifecycle hooks to dynamically compute component data, fields, and permissions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `component_type` | text | Yes | Component Type | Validations: required |
| `component_label` | text | No | Display Label |  |
| `default_props` | json | No | Default Properties |  |
| `field_definitions` | json | No | Field Definitions |  |
| `instance_id` | text | Yes | Instance ID | Validations: required |
| `instance_props` | json | Yes | Instance Properties |  |
| `slot_content` | json | No | Slot Content |  |
| `read_only_flags` | json | No | Read-Only Flags |  |
| `component_metadata` | json | No | Component Metadata |  |
| `inline_editing` | boolean | No | Inline Editing |  |

## Rules

- **registration:**
  - **render_required:** true
  - **unique_types:** true
  - **config_immutable_at_runtime:** true
- **field_types:**
  - **supported:** text, number, textarea, select, radio, richtext, array, object, external, custom, slot
- **slots:**
  - **allow_list:** true
  - **disallow_list:** true
  - **nested_unlimited:** true
  - **storage_inline:** true
- **instance_management:**
  - **auto_id_generation:** true
  - **recursive_id_generation:** true
  - **zone_compound_format:** parentId:slotName
- **categories:**
  - **grouping:** true
  - **visibility_toggle:** true
  - **default_expanded_toggle:** true
- **lifecycle_hooks:**
  - **resolve_data:** true
  - **resolve_fields:** true
  - **resolve_permissions:** true
  - **triggers:** insert, replace, move, load, force
- **permissions:**
  - **granularity:** per-component-instance
  - **permission_types:** drag, duplicate, delete, edit, insert
  - **caching:** true

## Outcomes

### Register_component (Priority: 1)

**Given:**
- developer provides a component configuration with a render function
- component type name is unique within the configuration

**Then:**
- **create_record** target: `component_registry` — Component type is registered with its config, fields, default props, and lifecycle hooks

**Result:** Component appears in the editor palette and can be placed on pages

### Insert_component_instance (Priority: 2)

**Given:**
- component type exists in the registry
- destination zone exists and accepts this component type

**Then:**
- **create_record** target: `component_instance` — Create new instance with auto-generated unique ID and default props
- **call_service** target: `resolve_data` — Run resolveData hook with trigger 'insert' to allow dynamic initialization
- **call_service** target: `resolve_fields` — Run resolveFields hook to determine which fields to show
- **call_service** target: `resolve_permissions` — Run resolvePermissions hook to set initial permissions
- **emit_event** event: `component.instance.created`

**Result:** New component instance exists in the content tree with resolved data

### Edit_component_props (Priority: 3)

**Given:**
- editor user selects a component on the canvas
- component has editable fields

**Then:**
- **set_field** target: `instance_props` — Update the modified property value
- **call_service** target: `resolve_data` — Run resolveData hook with trigger 'replace' and changed prop flags
- **call_service** target: `resolve_fields` — Run resolveFields to update visible fields based on new data
- **emit_event** event: `component.props.changed`

**Result:** Component re-renders with new property values, field panel updates

### Duplicate_component (Priority: 4)

**Given:**
- editor user triggers duplicate on a selected component
- component permissions allow duplication

**Then:**
- **create_record** target: `component_instance` — Clone component with all props but regenerate all IDs (parent + all nested children)
- **set_field** target: `content_tree` — Insert clone immediately after the original
- **emit_event** event: `component.instance.duplicated`

**Result:** Identical copy appears next to original with unique IDs throughout

### Remove_component (Priority: 5)

**Given:**
- editor user triggers delete on a selected component
- component permissions allow deletion

**Then:**
- **delete_record** target: `component_instance` — Remove component and all its descendants from the content tree
- **emit_event** event: `component.instance.removed`

**Result:** Component and all nested children removed from the page

### Resolve_data_on_context_change (Priority: 6)

**Given:**
- component has a resolveData lifecycle hook defined
- trigger event occurs: insert, replace, move, load, or force

**Then:**
- **call_service** target: `resolve_data` — Call resolveData with current data, changed flags, last data, trigger type, and parent reference
- **set_field** target: `instance_props` — Merge returned props into component data if changed
- **emit_event** event: `component.data.resolved`

**Result:** Component data updated with dynamically computed values

### Slot_accepts_component (Priority: 7)

**Given:**
- a slot field is defined on the component
- the slot has an allow list
- the component being dropped is in the allow list

**Then:**
- **set_field** target: `slot_content` — Component added to the slot's content array

**Result:** Child component renders inside the parent's slot

### Slot_rejects_component (Priority: 8) — Error: `SLOT_TYPE_REJECTED`

**Given:**
- a slot field is defined with an allow list
- the component being dropped is NOT in the allow list
- OR the component is in the disallow list

**Then:**
- **emit_event** event: `component.slot.rejected`

**Result:** Component cannot be dropped into this slot

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMPONENT_TYPE_NOT_FOUND` | 404 | Component type does not exist in the registry | No |
| `SLOT_TYPE_REJECTED` | 400 | This slot does not accept that component type | No |
| `PERMISSION_DENIED` | 403 | This action is not permitted on this component | No |
| `RESOLVE_DATA_FAILED` | 500 | Failed to resolve component data | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `component.instance.created` | A new component instance was placed on the page | `instance_id`, `component_type`, `zone`, `index` |
| `component.instance.duplicated` | A component was cloned with new IDs | `original_id`, `clone_id`, `zone`, `index` |
| `component.instance.removed` | A component and its descendants were deleted | `instance_id`, `component_type`, `zone` |
| `component.props.changed` | A component's properties were edited | `instance_id`, `changed_fields` |
| `component.data.resolved` | A component's data was dynamically resolved via lifecycle hook | `instance_id`, `trigger`, `did_change` |
| `component.slot.rejected` | A component was rejected from a slot due to type constraints | `parent_id`, `slot_name`, `rejected_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| drag-drop-editor | required | Components are placed via drag-and-drop from the registry palette |
| content-tree | required | Component instances are stored and managed in the content tree |
| field-transforms | recommended | Field transforms enable dynamic field rendering and computed properties |
| plugin-overrides | optional | Override system can customize how components and fields are rendered |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 30
  entry_points:
    - types/Config.tsx
    - components/ComponentList/
    - lib/resolve-component-data.ts
    - reducer/actions/insert.ts
    - types/Fields.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Component Registry Blueprint",
  "description": "Pluggable component registration system with config-driven fields, slots, lifecycle hooks, and permissions. 10 fields. 8 outcomes. 4 error codes. rules: registr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "component-system, registry, plugin, visual-editor, configuration"
}
</script>
