---
title: "Undo Redo Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation. 4 fields. 7 outcomes. 2 error codes. rules: recordi"
---

# Undo Redo Blueprint

> Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation

| | |
|---|---|
| **Feature** | `undo-redo` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | undo, redo, history, state-management, editor |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/undo-redo.blueprint.yaml) |
| **JSON API** | [undo-redo.json]({{ site.baseurl }}/api/blueprints/data/undo-redo.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | Editor User | human | Person performing actions in the editor that are recorded in history |
| `history_manager` | History Manager | system | System that records, navigates, and prunes the history stack |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `histories` | json | Yes | History Stack |  |
| `history_index` | number | Yes | Current Index | Validations: required |
| `has_past` | boolean | Yes | Has Past (undo available) |  |
| `has_future` | boolean | Yes | Has Future (redo available) |  |

## Rules

- **recording:**
  - **debounce_ms:** 250
  - **excluded_actions:** register_zone, unregister_zone, set_data, set_ui
  - **snapshot_full_state:** true
- **navigation:**
  - **forward_branch_destruction:** true
  - **tidy_on_navigate:** true
- **stack:**
  - **no_max_size:** true
  - **unique_ids:** true
- **hotkeys:**
  - **undo:** Cmd+Z or Ctrl+Z
  - **redo:** Cmd+Shift+Z or Ctrl+Shift+Z or Cmd+Y or Ctrl+Y

## Outcomes

### Record_action (Priority: 1)

**Given:**
- a state-changing action occurs (insert, move, delete, edit, etc.)
- the action is not in the excluded list
- debounce window of 250ms has elapsed since last recording

**Then:**
- **create_record** target: `history_entry` — Snapshot current state with unique ID and append to history stack
- **set_field** target: `history_index` — Move index to point to the new entry (end of stack)
- **emit_event** event: `history.recorded`

**Result:** New state saved to history, undo becomes available

### Record_after_undo (Priority: 2)

**Given:**
- user has undone to a past state (index < stack length - 1)
- a new state-changing action occurs

**Then:**
- **set_field** target: `histories` — Discard all entries after current index, append new entry
- **set_field** target: `history_index` — Move index to the new end of stack
- **emit_event** event: `history.branch_destroyed`

**Result:** Future history discarded, new timeline established

### Undo (Priority: 3)

**Given:**
- user triggers undo (hotkey or UI button)
- has_past is true (index > 0)

**Then:**
- **set_field** target: `history_index` — Decrement index by 1
- **set_field** target: `application_state` — Restore state from history entry at new index, clearing field focus
- **emit_event** event: `history.undo`

**Result:** Application reverts to previous state, redo becomes available

### Redo (Priority: 4)

**Given:**
- user triggers redo (hotkey or UI button)
- has_future is true (index < stack length - 1)

**Then:**
- **set_field** target: `history_index` — Increment index by 1
- **set_field** target: `application_state` — Restore state from history entry at new index, clearing field focus
- **emit_event** event: `history.redo`

**Result:** Application advances to next state in history

### Undo_at_beginning (Priority: 5) — Error: `UNDO_UNAVAILABLE`

**Given:**
- user triggers undo
- has_past is false (index is 0)

**Result:** No action taken, undo button remains disabled

### Redo_at_end (Priority: 6) — Error: `REDO_UNAVAILABLE`

**Given:**
- user triggers redo
- has_future is false (index is at end of stack)

**Result:** No action taken, redo button remains disabled

### Load_history (Priority: 7)

**Given:**
- external system provides a saved history stack

**Then:**
- **set_field** target: `histories` — Replace entire history stack with provided entries
- **set_field** target: `history_index` — Set index to last entry
- **set_field** target: `application_state` — Restore state from the latest history entry
- **emit_event** event: `history.loaded`

**Result:** History restored from external source, full undo/redo available

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `UNDO_UNAVAILABLE` | 400 | Nothing to undo | No |
| `REDO_UNAVAILABLE` | 400 | Nothing to redo | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `history.recorded` | A new state snapshot was added to the history stack | `history_id`, `index`, `stack_size` |
| `history.undo` | User navigated backward in history | `from_index`, `to_index` |
| `history.redo` | User navigated forward in history | `from_index`, `to_index` |
| `history.branch_destroyed` | Future history was discarded after a new action during undo state | `discarded_count`, `new_stack_size` |
| `history.loaded` | History stack was loaded from an external source | `stack_size`, `index` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| editor-state | required | History records and restores the centralized editor state |
| drag-drop-editor | recommended | Drag operations should be recorded in history for undo support |
| component-registry | recommended | Component insert/edit/delete operations create history entries |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/puckeditor/puck
  project: Puck Editor
  tech_stack: TypeScript + React
  files_traced: 12
  entry_points:
    - store/slices/history.ts
    - lib/use-hotkey.ts
    - components/MenuBar/index.tsx
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Undo Redo Blueprint",
  "description": "Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation. 4 fields. 7 outcomes. 2 error codes. rules: recordi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "undo, redo, history, state-management, editor"
}
</script>
