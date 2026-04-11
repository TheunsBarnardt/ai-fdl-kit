<!-- AUTO-GENERATED FROM undo-redo.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Undo Redo

> Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation

**Category:** Data · **Version:** 1.0.0 · **Tags:** undo · redo · history · state-management · editor

## What this does

Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **histories** *(json, required)* — History Stack
- **history_index** *(number, required)* — Current Index
- **has_past** *(boolean, required)* — Has Past (undo available)
- **has_future** *(boolean, required)* — Has Future (redo available)

## What must be true

- **recording → debounce_ms:** 250
- **recording → excluded_actions:** register_zone, unregister_zone, set_data, set_ui
- **recording → snapshot_full_state:** true
- **navigation → forward_branch_destruction:** true
- **navigation → tidy_on_navigate:** true
- **stack → no_max_size:** true
- **stack → unique_ids:** true
- **hotkeys → undo:** Cmd+Z or Ctrl+Z
- **hotkeys → redo:** Cmd+Shift+Z or Ctrl+Shift+Z or Cmd+Y or Ctrl+Y

## Success & failure scenarios

**✅ Success paths**

- **Record Action** — when a state-changing action occurs (insert, move, delete, edit, etc.); the action is not in the excluded list; debounce window of 250ms has elapsed since last recording, then New state saved to history, undo becomes available.
- **Record After Undo** — when user has undone to a past state (index < stack length - 1); a new state-changing action occurs, then Future history discarded, new timeline established.
- **Undo** — when user triggers undo (hotkey or UI button); has_past is true (index > 0), then Application reverts to previous state, redo becomes available.
- **Redo** — when user triggers redo (hotkey or UI button); has_future is true (index < stack length - 1), then Application advances to next state in history.
- **Load History** — when external system provides a saved history stack, then History restored from external source, full undo/redo available.

**❌ Failure paths**

- **Undo At Beginning** — when user triggers undo; has_past is false (index is 0), then No action taken, undo button remains disabled. *(error: `UNDO_UNAVAILABLE`)*
- **Redo At End** — when user triggers redo; has_future is false (index is at end of stack), then No action taken, redo button remains disabled. *(error: `REDO_UNAVAILABLE`)*

## Errors it can return

- `UNDO_UNAVAILABLE` — Nothing to undo
- `REDO_UNAVAILABLE` — Nothing to redo

## Connects to

- **editor-state** *(required)* — History records and restores the centralized editor state
- **drag-drop-editor** *(recommended)* — Drag operations should be recorded in history for undo support
- **component-registry** *(recommended)* — Component insert/edit/delete operations create history entries

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/undo-redo/) · **Spec source:** [`undo-redo.blueprint.yaml`](./undo-redo.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
