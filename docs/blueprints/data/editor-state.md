---
title: "Editor State Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Centralized state management with sliced architecture, action dispatching, computed selections, and public API. 11 fields. 7 outcomes. 2 error codes. rules: sto"
---

# Editor State Blueprint

> Centralized state management with sliced architecture, action dispatching, computed selections, and public API

| | |
|---|---|
| **Feature** | `editor-state` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | state-management, store, reducer, editor, centralized-state |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/editor-state.blueprint.yaml) |
| **JSON API** | [editor-state.json]({{ site.baseurl }}/api/blueprints/data/editor-state.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Action Dispatcher | system | Routes actions through the reducer to modify state |
| `store` | State Store | system | Single source of truth for all editor state |
| `consumer` | State Consumer | system | Any UI component or system that reads from the store |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `data` | json | Yes | Page Data |  |
| `ui_state` | json | Yes | UI State |  |
| `selected_item` | json | No | Selected Item |  |
| `item_selector` | json | No | Item Selector |  |
| `left_sidebar_visible` | boolean | Yes | Left Sidebar Visible |  |
| `right_sidebar_visible` | boolean | Yes | Right Sidebar Visible |  |
| `preview_mode` | select | Yes | Preview Mode |  |
| `is_dragging` | boolean | Yes | Is Dragging |  |
| `field_focus` | text | No | Focused Field |  |
| `status` | select | Yes | Editor Status |  |
| `component_loading_state` | json | No | Component Loading |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `LOADING` | Yes |  |
| `MOUNTED` |  |  |
| `READY` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `LOADING` | `MOUNTED` | store |  |
|  | `MOUNTED` | `READY` | store | All stylesheets loaded in iframe (if iframe enabled) |

## Rules

- **store_architecture:**
  - **single_store:** true
  - **sliced:** true
  - **immutable_updates:** true
- **action_types:**
  - **supported:** insert, move, remove, duplicate, replace, replace_root, reorder, set, set_data, set_ui, register_zone, unregister_zone
- **dispatch_interceptor:**
  - **history_recording:** true
  - **action_callback:** true
  - **selected_item_sync:** true
- **slices:**
  - **history_slice:** true
  - **nodes_slice:** true
  - **fields_slice:** true
  - **permissions_slice:** true
- **computed_state:**
  - **selected_item_from_selector:** true
  - **component_config_from_type:** true
- **component_loading:**
  - **deferred_loading_timeout:** true
  - **reference_counting:** true
  - **cleanup_on_cancel:** true
- **public_api:**
  - **read_state:** true
  - **dispatch_actions:** true
  - **access_history:** true
  - **get_permissions:** true
  - **resolve_data_by_id:** true
  - **resolve_data_by_selector:** true
  - **get_item_by_id:** true
  - **get_item_by_selector:** true
  - **get_selector_for_id:** true
  - **get_parent_by_id:** true

## Outcomes

### Dispatch_action (Priority: 1)

**Given:**
- a valid action with a recognized type is dispatched

**Then:**
- **call_service** target: `reducer` — Route action to appropriate handler (insert, move, remove, etc.)
- **set_field** target: `application_state` — Update state with reducer output
- **set_field** target: `selected_item` — Recompute selectedItem from updated itemSelector
- **call_service** target: `history` — Record state snapshot to history (if action is history-enabled)
- **call_service** target: `on_action_callback` — Call onAction callback with action, new state, and previous state
- **emit_event** event: `state.action.dispatched`

**Result:** State updated, history recorded, callbacks notified

### Select_component (Priority: 2)

**Given:**
- user clicks on a component in the canvas or outline

**Then:**
- **set_field** target: `item_selector` — Set itemSelector to { zone, index } of clicked component
- **set_field** target: `selected_item` — Compute selectedItem from the new selector
- **call_service** target: `fields_slice` — Resolve and display fields for the selected component
- **emit_event** event: `state.selection.changed`

**Result:** Component highlighted on canvas, properties panel shows its fields

### Deselect_component (Priority: 3)

**Given:**
- user clicks on empty canvas area or presses Escape

**Then:**
- **set_field** target: `item_selector` — Set itemSelector to null
- **set_field** target: `selected_item` — Set selectedItem to null
- **emit_event** event: `state.selection.cleared`

**Result:** No component selected, properties panel empty or shows page settings

### Toggle_preview_mode (Priority: 4)

**Given:**
- user toggles between edit and interactive preview

**Then:**
- **set_field** target: `preview_mode` — Switch between 'edit' (editable canvas) and 'interactive' (clickable preview)
- **emit_event** event: `state.preview_mode.changed`

**Result:** Canvas switches between editable and interactive modes

### Set_component_loading (Priority: 5)

**Given:**
- an async operation starts for a component (data resolution, external fetch)

**Then:**
- **set_field** target: `component_loading_state` — Increment loading counter for the component ID (with optional defer timeout)

**Result:** Component shows loading indicator while async operation is in progress

### Clear_component_loading (Priority: 6)

**Given:**
- an async operation completes for a component

**Then:**
- **set_field** target: `component_loading_state` — Decrement loading counter for the component ID

**Result:** Loading indicator removed when counter reaches 0

### Batch_resolve_on_load (Priority: 7)

**Given:**
- editor loads initial data

**Then:**
- **call_service** target: `resolver` — Walk all top-level components and resolve their data with trigger 'load'
- **set_field** target: `application_state` — Replace each component's data with resolved version if changed
- **emit_event** event: `state.data.batch_resolved`

**Result:** All components have their dynamic data resolved

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `UNKNOWN_ACTION_TYPE` | 400 | Unrecognized action type | No |
| `INVALID_SELECTOR` | 400 | Item selector does not point to a valid component | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `state.action.dispatched` | An action was processed by the reducer | `action_type` |
| `state.selection.changed` | A different component was selected | `component_id`, `zone`, `index` |
| `state.selection.cleared` | Component selection was cleared |  |
| `state.preview_mode.changed` | Editor switched between edit and interactive preview | `mode` |
| `state.data.batch_resolved` | Batch data resolution completed on page load | `resolved_count`, `changed_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| content-tree | required | Page data (root, content, zones) is core state |
| undo-redo | required | History slice manages undo/redo within the store |
| component-registry | required | Component configs inform how state is structured and resolved |
| field-transforms | required | Field resolution pipeline reads and writes state |
| drag-drop-editor | recommended | Drag state (isDragging, preview) is UI state |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Puck Editor
  tech_stack: TypeScript + React
  files_traced: 15
  entry_points:
    - store/index.ts
    - store/slices/
    - store/default-app-state.ts
    - lib/use-puck.ts
    - reducer/index.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Editor State Blueprint",
  "description": "Centralized state management with sliced architecture, action dispatching, computed selections, and public API. 11 fields. 7 outcomes. 2 error codes. rules: sto",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "state-management, store, reducer, editor, centralized-state"
}
</script>
