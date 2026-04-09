---
title: "Drag Drop Editor Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Drag-and-drop page composition system with nested zones, collision detection, and component reordering. 9 fields. 8 outcomes. 3 error codes. rules: drag_activat"
---

# Drag Drop Editor Blueprint

> Drag-and-drop page composition system with nested zones, collision detection, and component reordering

| | |
|---|---|
| **Feature** | `drag-drop-editor` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | drag-and-drop, editor, composition, visual-builder, page-builder |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/drag-drop-editor.blueprint.yaml) |
| **JSON API** | [drag-drop-editor.json]({{ site.baseurl }}/api/blueprints/ui/drag-drop-editor.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | Editor User | human | Person composing a page by dragging and dropping components |
| `collision_engine` | Collision Detection Engine | system | Determines valid drop targets and insertion positions during drag operations |
| `zone_manager` | Zone Manager | system | Tracks nested drop zones and determines deepest valid target |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `drag_mode` | select | Yes | Drag Mode | Validations: required |
| `dragged_item` | json | No | Currently Dragged Item |  |
| `zone_compound` | text | Yes | Zone Identifier (parentId:slotName) | Validations: pattern |
| `source_zone` | text | No | Source Zone |  |
| `source_index` | number | No | Source Index |  |
| `destination_zone` | text | No | Destination Zone |  |
| `destination_index` | number | No | Destination Index |  |
| `preview_index` | json | No | Preview State |  |
| `collision_direction` | select | No | Collision Direction |  |

## States

**State field:** `drag_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `dragging` |  |  |
| `hovering_target` |  |  |
| `dropped` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `dragging` | user | Pointer moves 5px or 200ms delay elapsed after mousedown/touchstart |
|  | `dragging` | `hovering_target` | collision_engine | Pointer is over a valid drop zone that accepts the component type |
|  | `hovering_target` | `hovering_target` | collision_engine | Pointer moves to a different valid zone |
|  | `hovering_target` | `dragging` | collision_engine | Pointer leaves all valid drop zones |
|  | `dragging` | `cancelled` | user | User presses Escape or pointer leaves the editor |
|  | `hovering_target` | `cancelled` | user | User presses Escape |
|  | `hovering_target` | `dropped` | user | User releases pointer over valid drop zone |

## Rules

- **drag_activation:**
  - **pointer_distance_px:** 5
  - **delay_ms:** 200
  - **delay_tolerance_px:** 10
  - **touch_delay_ms:** 200
- **collision_detection:**
  - **algorithm:** midpoint-with-direction
  - **midpoint_offset_percent:** 5
  - **direction_interval_px:** 10
  - **zone_buffer_px:** 6
  - **fallback_enabled:** true
- **zone_management:**
  - **zone_change_debounce_ms:** 100
  - **depth_priority:** true
  - **self_drop_prevention:** true
  - **descendant_drop_prevention:** true
- **drag_axis:**
  - **auto_detection:** true
  - **inline_axis:** x
  - **block_axis:** y
  - **dynamic_axis:** true
- **animation:**
  - **drop_transition_ms:** 200
  - **preview_immediate:** true
- **position_sync:**
  - **measure_interval_ms:** 100
  - **uses_resize_observer:** true
  - **uses_scroll_listener:** true

## Outcomes

### Insert_new_component (Priority: 1)

**Given:**
- user drags a component type from the palette
- user drops it on a valid zone that accepts that component type

**Then:**
- **create_record** target: `component_instance` — Create new component instance with generated unique ID and default props
- **set_field** target: `content_tree` — Insert component at destination zone and index
- **emit_event** event: `editor.component.inserted`
- **set_field** target: `selected_item` — Select the newly inserted component

**Result:** New component appears at drop position, is selected for editing

### Move_existing_component (Priority: 2)

**Given:**
- user drags an existing component from the canvas
- user drops it on a valid zone at a different position

**Then:**
- **set_field** target: `content_tree` — Remove component from source zone and insert at destination zone
- **emit_event** event: `editor.component.moved`
- **set_field** target: `selected_item` — Select the moved component at its new position

**Result:** Component appears at new position, original position is empty

### Reorder_within_zone (Priority: 3)

**Given:**
- user drags a component within the same zone
- destination index differs from source index

**Then:**
- **set_field** target: `content_tree` — Move component from source index to destination index within the same zone
- **emit_event** event: `editor.component.reordered`

**Result:** Component order updated within the zone

### Drop_on_self (Priority: 4) — Error: `DROP_ON_SELF`

**Given:**
- target component is the same as the dragged component

**Then:**
- **emit_event** event: `editor.drag.rejected`

**Result:** Drag cancelled, component returns to original position

### Drop_on_descendant (Priority: 5) — Error: `DROP_ON_DESCENDANT`

**Given:**
- target zone belongs to a descendant of the dragged component

**Then:**
- **emit_event** event: `editor.drag.rejected`

**Result:** Drag cancelled, component returns to original position

### Drop_type_not_allowed (Priority: 6) — Error: `DROP_TYPE_NOT_ALLOWED`

**Given:**
- target zone has an allow list that does not include the dragged component type
- OR target zone has a disallow list that includes the dragged component type

**Then:**
- **emit_event** event: `editor.drag.rejected`

**Result:** Zone does not accept this component type, drop rejected

### Drag_cancelled (Priority: 7)

**Given:**
- user presses Escape during drag
- OR pointer leaves the editor bounds
- OR drop target is void/invalid

**Then:**
- **set_field** target: `preview_index` — Clear all previews
- **transition_state** field: `drag_state` from: `dragging` to: `cancelled`
- **emit_event** event: `editor.drag.cancelled`

**Result:** Component returns to original position, no state change

### Preview_updates_during_drag (Priority: 8)

**Given:**
- drag is in progress
- pointer moves over a new valid target

**Then:**
- **set_field** target: `preview_index` — Update preview to show insertion indicator at new target position

**Result:** Visual preview shows where the component will land before user releases

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DROP_ON_SELF` | 400 | Cannot drop a component onto itself | No |
| `DROP_ON_DESCENDANT` | 400 | Cannot drop a component into its own child | No |
| `DROP_TYPE_NOT_ALLOWED` | 400 | This zone does not accept that component type | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `editor.component.inserted` | A new component was dragged from palette and placed on canvas | `component_id`, `component_type`, `destination_zone`, `destination_index` |
| `editor.component.moved` | An existing component was moved to a different position | `component_id`, `source_zone`, `source_index`, `destination_zone`, `destination_index` |
| `editor.component.reordered` | A component was reordered within the same zone | `component_id`, `zone`, `old_index`, `new_index` |
| `editor.drag.cancelled` | A drag operation was cancelled without placing the component | `component_id`, `drag_mode` |
| `editor.drag.rejected` | A drop was rejected due to validation rules | `component_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| component-registry | required | Drag-and-drop needs the component registry to know what's draggable and what zones accept |
| content-tree | required | All insert/move/reorder operations modify the content tree |
| editor-state | required | Drag state, selection, and preview state managed by the central store |
| undo-redo | recommended | All drag operations should be undoable |

## AGI Readiness

### Goals

#### Reliable Drag Drop Editor

Drag-and-drop page composition system with nested zones, collision detection, and component reordering

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

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
| insert_new_component | `autonomous` | - | - |
| move_existing_component | `autonomous` | - | - |
| reorder_within_zone | `autonomous` | - | - |
| drop_on_self | `autonomous` | - | - |
| drop_on_descendant | `autonomous` | - | - |
| drop_type_not_allowed | `autonomous` | - | - |
| drag_cancelled | `supervised` | - | - |
| preview_updates_during_drag | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 40
  entry_points:
    - components/DragDropContext/index.tsx
    - components/DraggableComponent/index.tsx
    - components/DropZone/index.tsx
    - lib/dnd/collision/dynamic/
    - lib/dnd/NestedDroppablePlugin.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Drag Drop Editor Blueprint",
  "description": "Drag-and-drop page composition system with nested zones, collision detection, and component reordering. 9 fields. 8 outcomes. 3 error codes. rules: drag_activat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "drag-and-drop, editor, composition, visual-builder, page-builder"
}
</script>
