<!-- AUTO-GENERATED FROM drag-drop-editor.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Drag Drop Editor

> Drag-and-drop page composition system with nested zones, collision detection, and component reordering

**Category:** Ui · **Version:** 1.0.0 · **Tags:** drag-and-drop · editor · composition · visual-builder · page-builder

## What this does

Drag-and-drop page composition system with nested zones, collision detection, and component reordering

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **drag_mode** *(select, required)* — Drag Mode
- **dragged_item** *(json, optional)* — Currently Dragged Item
- **zone_compound** *(text, required)* — Zone Identifier (parentId:slotName)
- **source_zone** *(text, optional)* — Source Zone
- **source_index** *(number, optional)* — Source Index
- **destination_zone** *(text, optional)* — Destination Zone
- **destination_index** *(number, optional)* — Destination Index
- **preview_index** *(json, optional)* — Preview State
- **collision_direction** *(select, optional)* — Collision Direction

## What must be true

- **drag_activation → pointer_distance_px:** 5
- **drag_activation → delay_ms:** 200
- **drag_activation → delay_tolerance_px:** 10
- **drag_activation → touch_delay_ms:** 200
- **collision_detection → algorithm:** midpoint-with-direction
- **collision_detection → midpoint_offset_percent:** 5
- **collision_detection → direction_interval_px:** 10
- **collision_detection → zone_buffer_px:** 6
- **collision_detection → fallback_enabled:** true
- **zone_management → zone_change_debounce_ms:** 100
- **zone_management → depth_priority:** true
- **zone_management → self_drop_prevention:** true
- **zone_management → descendant_drop_prevention:** true
- **drag_axis → auto_detection:** true
- **drag_axis → inline_axis:** x
- **drag_axis → block_axis:** y
- **drag_axis → dynamic_axis:** true
- **animation → drop_transition_ms:** 200
- **animation → preview_immediate:** true
- **position_sync → measure_interval_ms:** 100
- **position_sync → uses_resize_observer:** true
- **position_sync → uses_scroll_listener:** true

## Success & failure scenarios

**✅ Success paths**

- **Insert New Component** — when user drags a component type from the palette; user drops it on a valid zone that accepts that component type, then New component appears at drop position, is selected for editing.
- **Move Existing Component** — when user drags an existing component from the canvas; user drops it on a valid zone at a different position, then Component appears at new position, original position is empty.
- **Reorder Within Zone** — when user drags a component within the same zone; destination index differs from source index, then Component order updated within the zone.
- **Drag Cancelled** — when user presses Escape during drag; OR pointer leaves the editor bounds; OR drop target is void/invalid, then Component returns to original position, no state change.
- **Preview Updates During Drag** — when drag is in progress; pointer moves over a new valid target, then Visual preview shows where the component will land before user releases.

**❌ Failure paths**

- **Drop On Self** — when target component is the same as the dragged component, then Drag cancelled, component returns to original position. *(error: `DROP_ON_SELF`)*
- **Drop On Descendant** — when target zone belongs to a descendant of the dragged component, then Drag cancelled, component returns to original position. *(error: `DROP_ON_DESCENDANT`)*
- **Drop Type Not Allowed** — when target zone has an allow list that does not include the dragged component type; OR target zone has a disallow list that includes the dragged component type, then Zone does not accept this component type, drop rejected. *(error: `DROP_TYPE_NOT_ALLOWED`)*

## Errors it can return

- `DROP_ON_SELF` — Cannot drop a component onto itself
- `DROP_ON_DESCENDANT` — Cannot drop a component into its own child
- `DROP_TYPE_NOT_ALLOWED` — This zone does not accept that component type

## Events

**`editor.component.inserted`** — A new component was dragged from palette and placed on canvas
  Payload: `component_id`, `component_type`, `destination_zone`, `destination_index`

**`editor.component.moved`** — An existing component was moved to a different position
  Payload: `component_id`, `source_zone`, `source_index`, `destination_zone`, `destination_index`

**`editor.component.reordered`** — A component was reordered within the same zone
  Payload: `component_id`, `zone`, `old_index`, `new_index`

**`editor.drag.cancelled`** — A drag operation was cancelled without placing the component
  Payload: `component_id`, `drag_mode`

**`editor.drag.rejected`** — A drop was rejected due to validation rules
  Payload: `component_id`, `reason`

## Connects to

- **component-registry** *(required)* — Drag-and-drop needs the component registry to know what's draggable and what zones accept
- **content-tree** *(required)* — All insert/move/reorder operations modify the content tree
- **editor-state** *(required)* — Drag state, selection, and preview state managed by the central store
- **undo-redo** *(recommended)* — All drag operations should be undoable

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/drag-drop-editor/) · **Spec source:** [`drag-drop-editor.blueprint.yaml`](./drag-drop-editor.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
