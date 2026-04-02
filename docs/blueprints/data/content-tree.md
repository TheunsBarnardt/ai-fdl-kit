---
title: "Content Tree Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Hierarchical content tree with zone-based storage, tree walking, flattening, indexed lookups, and schema migration. 5 fields. 10 outcomes. 4 error codes. rules:"
---

# Content Tree Blueprint

> Hierarchical content tree with zone-based storage, tree walking, flattening, indexed lookups, and schema migration

| | |
|---|---|
| **Feature** | `content-tree` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | content-tree, data-model, serialization, tree-operations, page-data |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/content-tree.blueprint.yaml) |
| **JSON API** | [content-tree.json]({{ site.baseurl }}/api/blueprints/data/content-tree.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `editor` | Editor System | system | System that modifies the content tree through user actions |
| `renderer` | Render Engine | system | System that reads the content tree to produce visual output |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `root_props` | json | Yes | Root Properties |  |
| `content` | json | Yes | Root Content |  |
| `zones` | json | No | Zone Storage |  |
| `node_index` | json | No | Node Index |  |
| `zone_index` | json | No | Zone Index |  |

## Rules

- **data_model:**
  - **three_top_level_keys:** true
  - **zone_compound_format:** parentId:slotName
  - **root_zone_id:** root:default-zone
- **tree_structure:**
  - **slots_stored_inline:** true
  - **unlimited_nesting_depth:** true
  - **unique_instance_ids:** true
- **indexing:**
  - **node_index_maintained:** true
  - **zone_index_maintained:** true
  - **path_tracking:** true
  - **parent_tracking:** true
  - **flat_data_cached:** true
- **flattening:**
  - **nested_to_dotpath:** true
  - **array_indexed:** true
  - **empty_array_sentinel:** __puck_[]
  - **empty_object_sentinel:** __puck_{}
- **tree_walking:**
  - **dual_mapper_pattern:** true
  - **skip_optimization:** true
  - **index_rebuild_on_walk:** true
- **migration:**
  - **version_upgrades:** true
- **zone_registration:**
  - **register_on_mount:** true
  - **unregister_on_unmount:** true
  - **cache_on_unregister:** true

## Outcomes

### Insert_into_tree (Priority: 1)

**Given:**
- a valid component instance with unique ID exists
- the destination zone exists or will be created
- the destination index is within bounds

**Then:**
- **set_field** target: `content_tree` — Walk tree, insert component at destination zone and index
- **set_field** target: `node_index` — Add new node entry with path, parent, zone, and flat data
- **set_field** target: `zone_index` — Update zone's content IDs array
- **emit_event** event: `tree.node.inserted`

**Result:** Component exists in tree at specified position, indexes updated

### Move_in_tree (Priority: 2)

**Given:**
- source zone and index point to an existing component
- destination zone and index are valid
- component is not being moved to its current position

**Then:**
- **set_field** target: `content_tree` — Walk tree, remove from source zone, insert at destination zone
- **set_field** target: `node_index` — Update path and parent for moved node and all descendants
- **set_field** target: `zone_index` — Update content IDs for both source and destination zones
- **emit_event** event: `tree.node.moved`

**Result:** Component relocated, all indexes reflect new position

### Duplicate_in_tree (Priority: 3)

**Given:**
- source zone and index point to an existing component

**Then:**
- **create_record** target: `component_clone` — Deep clone component with all props and nested children
- **set_field** target: `clone_ids` — Regenerate unique IDs for the clone and ALL nested descendant components
- **set_field** target: `content_tree` — Insert clone at source index + 1 in the same zone
- **emit_event** event: `tree.node.duplicated`

**Result:** Identical copy with unique IDs placed next to original

### Remove_from_tree (Priority: 4)

**Given:**
- target zone and index point to an existing component

**Then:**
- **delete_record** target: `component_and_descendants` — Remove component and collect all descendant node IDs
- **set_field** target: `node_index` — Delete index entries for removed node and all descendants
- **set_field** target: `zone_index` — Delete zone entries owned by removed nodes, update parent zone
- **emit_event** event: `tree.node.removed`

**Result:** Component and all nested children fully removed from tree and indexes

### Reorder_in_zone (Priority: 5)

**Given:**
- source and destination are in the same zone
- source index differs from destination index

**Then:**
- **set_field** target: `content_tree` — Move component from old index to new index within the zone
- **set_field** target: `zone_index` — Update content IDs order for the zone
- **emit_event** event: `tree.node.reordered`

**Result:** Component order updated within zone

### Register_zone (Priority: 6)

**Given:**
- a component with slots mounts in the editor

**Then:**
- **create_record** target: `zone_entry` — Create zone entry in data and zone index, or restore from cache if previously registered
- **emit_event** event: `tree.zone.registered`

**Result:** Zone is available as a drop target

### Unregister_zone (Priority: 7)

**Given:**
- a component with slots unmounts from the editor

**Then:**
- **set_field** target: `zone_cache` — Cache zone content for potential restoration
- **delete_record** target: `zone_entry` — Remove zone from data and zone index
- **emit_event** event: `tree.zone.unregistered`

**Result:** Zone removed but content cached for re-registration

### Lookup_node_by_id (Priority: 8)

**Given:**
- a valid component ID is provided

**Then:**
- **call_service** target: `node_index` — Return node data, flat data, path, parent ID, and zone from index

**Result:** Full node information returned in O(1) lookup

### Walk_tree (Priority: 9)

**Given:**
- a tree traversal is needed for any operation

**Then:**
- **call_service** target: `tree_walker` — Traverse root content, then recursively traverse slots of each component, applying mapContent and mapNodeOrSkip functions

**Result:** Modified tree with rebuilt indexes

### Migrate_data (Priority: 10)

**Given:**
- data was saved in an older schema version

**Then:**
- **call_service** target: `migration` — Transform data structure to match current schema version
- **emit_event** event: `tree.data.migrated`

**Result:** Data compatible with current editor version

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NODE_NOT_FOUND` | 404 | Component not found at the specified position | No |
| `ZONE_NOT_FOUND` | 404 | Zone does not exist | No |
| `INVALID_ZONE_FORMAT` | 400 | Zone ID must follow parentId:slotName format | No |
| `MIGRATION_FAILED` | 500 | Failed to migrate data to current schema version | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tree.node.inserted` | A component was inserted into the tree | `node_id`, `zone`, `index` |
| `tree.node.moved` | A component was moved between zones | `node_id`, `source_zone`, `destination_zone` |
| `tree.node.duplicated` | A component was cloned with new IDs | `original_id`, `clone_id`, `zone` |
| `tree.node.removed` | A component and its descendants were removed | `node_id`, `descendant_count` |
| `tree.node.reordered` | A component was reordered within its zone | `node_id`, `zone`, `old_index`, `new_index` |
| `tree.zone.registered` | A drop zone was registered (component mounted) | `zone_compound`, `zone_type` |
| `tree.zone.unregistered` | A drop zone was unregistered (component unmounted) | `zone_compound` |
| `tree.data.migrated` | Data was migrated from an older schema version | `from_version`, `to_version` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| component-registry | required | Component configs define what can be stored in the tree |
| drag-drop-editor | required | Drag operations trigger insert, move, and reorder on the tree |
| editor-state | required | Tree is part of the centralized editor state |
| undo-redo | recommended | Tree state snapshots enable undo/redo |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Page editor
  tech_stack: TypeScript + React
  files_traced: 30
  entry_points:
    - lib/data/walk-app-state.ts
    - lib/data/flatten-node.ts
    - types/Data.tsx
    - reducer/actions/
    - lib/migrate.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Content Tree Blueprint",
  "description": "Hierarchical content tree with zone-based storage, tree walking, flattening, indexed lookups, and schema migration. 5 fields. 10 outcomes. 4 error codes. rules:",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "content-tree, data-model, serialization, tree-operations, page-data"
}
</script>
