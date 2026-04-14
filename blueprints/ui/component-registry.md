<!-- AUTO-GENERATED FROM component-registry.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Component Registry

> Pluggable component registration system with config-driven fields, slots, lifecycle hooks, and permissions

**Category:** Ui · **Version:** 1.0.0 · **Tags:** component-system · registry · plugin · visual-editor · configuration

## What this does

Pluggable component registration system with config-driven fields, slots, lifecycle hooks, and permissions

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **component_type** *(text, required)* — Component Type
- **component_label** *(text, optional)* — Display Label
- **default_props** *(json, optional)* — Default Properties
- **field_definitions** *(json, optional)* — Field Definitions
- **instance_id** *(text, required)* — Instance ID
- **instance_props** *(json, required)* — Instance Properties
- **slot_content** *(json, optional)* — Slot Content
- **read_only_flags** *(json, optional)* — Read-Only Flags
- **component_metadata** *(json, optional)* — Component Metadata
- **inline_editing** *(boolean, optional)* — Inline Editing

## What must be true

- **registration → render_required:** true
- **registration → unique_types:** true
- **registration → config_immutable_at_runtime:** true
- **field_types → supported:** text, number, textarea, select, radio, richtext, array, object, external, custom, slot
- **slots → allow_list:** true
- **slots → disallow_list:** true
- **slots → nested_unlimited:** true
- **slots → storage_inline:** true
- **instance_management → auto_id_generation:** true
- **instance_management → recursive_id_generation:** true
- **instance_management → zone_compound_format:** parentId:slotName
- **categories → grouping:** true
- **categories → visibility_toggle:** true
- **categories → default_expanded_toggle:** true
- **lifecycle_hooks → resolve_data:** true
- **lifecycle_hooks → resolve_fields:** true
- **lifecycle_hooks → resolve_permissions:** true
- **lifecycle_hooks → triggers:** insert, replace, move, load, force
- **permissions → granularity:** per-component-instance
- **permissions → permission_types:** drag, duplicate, delete, edit, insert
- **permissions → caching:** true

## Success & failure scenarios

**✅ Success paths**

- **Register Component** — when developer provides a component configuration with a render function; component type name is unique within the configuration, then Component appears in the editor palette and can be placed on pages.
- **Insert Component Instance** — when component type exists in the registry; destination zone exists and accepts this component type, then New component instance exists in the content tree with resolved data.
- **Edit Component Props** — when editor user selects a component on the canvas; component has editable fields, then Component re-renders with new property values, field panel updates.
- **Duplicate Component** — when editor user triggers duplicate on a selected component; component permissions allow duplication, then Identical copy appears next to original with unique IDs throughout.
- **Remove Component** — when editor user triggers delete on a selected component; component permissions allow deletion, then Component and all nested children removed from the page.
- **Slot Accepts Component** — when a slot field is defined on the component; the slot has an allow list; the component being dropped is in the allow list, then Child component renders inside the parent's slot.

**❌ Failure paths**

- **Resolve Data On Context Change** — when component has a resolveData lifecycle hook defined; trigger event occurs: insert, replace, move, load, or force, then Component data updated with dynamically computed values. *(error: `RESOLVE_DATA_FAILED`)*
- **Slot Rejects Component** — when a slot field is defined with an allow list; the component being dropped is NOT in the allow list; OR the component is in the disallow list, then Component cannot be dropped into this slot. *(error: `SLOT_TYPE_REJECTED`)*

## Errors it can return

- `COMPONENT_TYPE_NOT_FOUND` — Component type does not exist in the registry
- `SLOT_TYPE_REJECTED` — This slot does not accept that component type
- `PERMISSION_DENIED` — This action is not permitted on this component
- `RESOLVE_DATA_FAILED` — Failed to resolve component data

## Events

**`component.instance.created`** — A new component instance was placed on the page
  Payload: `instance_id`, `component_type`, `zone`, `index`

**`component.instance.duplicated`** — A component was cloned with new IDs
  Payload: `original_id`, `clone_id`, `zone`, `index`

**`component.instance.removed`** — A component and its descendants were deleted
  Payload: `instance_id`, `component_type`, `zone`

**`component.props.changed`** — A component's properties were edited
  Payload: `instance_id`, `changed_fields`

**`component.data.resolved`** — A component's data was dynamically resolved via lifecycle hook
  Payload: `instance_id`, `trigger`, `did_change`

**`component.slot.rejected`** — A component was rejected from a slot due to type constraints
  Payload: `parent_id`, `slot_name`, `rejected_type`

## Connects to

- **drag-drop-editor** *(required)* — Components are placed via drag-and-drop from the registry palette
- **content-tree** *(required)* — Component instances are stored and managed in the content tree
- **field-transforms** *(recommended)* — Field transforms enable dynamic field rendering and computed properties
- **plugin-overrides** *(optional)* — Override system can customize how components and fields are rendered

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/component-registry/) · **Spec source:** [`component-registry.blueprint.yaml`](./component-registry.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
