<!-- AUTO-GENERATED FROM state-machine.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# State Machine

> Generic state machine engine with named states, guarded transitions, entry/exit actions, history tracking, and lifecycle validation rules.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** state-machine · finite-automaton · workflow-engine · lifecycle-management · transitions · event-driven

## What this does

Generic state machine engine with named states, guarded transitions, entry/exit actions, history tracking, and lifecycle validation rules.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **machine_id** *(text, required)* — Machine ID
- **name** *(text, required)* — Machine Name
- **entity_type** *(text, required)* — Entity Type
- **current_state** *(text, required)* — Current State
- **states** *(json, required)* — State Definitions
- **transitions** *(json, required)* — Transition Definitions
- **history** *(json, optional)* — Transition History
- **metadata** *(json, optional)* — Machine Metadata

## What must be true

- **exactly_one_initial_state:** Every state machine definition must have exactly one state marked as initial. This is the state assigned when a new entity is created. Zero or multiple initial states are a configuration error.
- **at_least_one_terminal_state:** Every state machine definition must have at least one state marked as terminal. Terminal states represent completed lifecycles and do not allow outgoing transitions.
- **no_orphan_states:** Every non-initial state must be reachable from the initial state via at least one chain of transitions. States with no incoming transitions (except the initial state) are configuration errors.
- **deterministic_transitions:** For any given (current_state, event) pair, at most one transition may be eligible after guard evaluation. If multiple transitions share the same from-state and event, their guard conditions must be mutually exclusive to ensure deterministic behavior.
- **terminal_states_no_outgoing:** States marked as terminal must not have any outgoing transitions defined. Attempting to add a transition from a terminal state is a configuration error.
- **history_immutable:** Transition history entries are append-only. Once recorded, history entries cannot be modified or deleted to ensure a complete audit trail.
- **guard_expressions_validated:** Guard expressions on transitions must be valid expressions using the FDL expression syntax. Invalid guards are rejected at configuration time, not at transition time.
- **on_enter_exit_actions:** Entry and exit actions on states execute automatically during transitions. Exit actions of the source state run before entry actions of the target state. Action failures cause the transition to roll back.

## Success & failure scenarios

**✅ Success paths**

- **Machine Definition Created** — when administrator provides state machine definition with states and transitions; exactly one initial state is defined; at least one terminal state is defined; no orphan states exist; all transitions are deterministic, then State machine definition validated and created successfully.
- **Transition Executed** — when an event is dispatched for an entity with a current state; a transition exists from current state matching the event; the transition guard evaluates to true (or has no guard), then Entity transitions to new state with all actions executed and history recorded.
- **Entity Initialized** — when a new entity is created for a registered state machine, then New entity assigned to the initial state with entry actions executed.

**❌ Failure paths**

- **Transition Guard Blocks** — when an event is dispatched for an entity with a current state; a transition exists from current state matching the event; the transition guard evaluates to false, then Transition blocked because guard condition is not satisfied. *(error: `STATE_MACHINE_GUARD_FAILED`)*
- **No Valid Transition** — when an event is dispatched for an entity; no transition exists from the current state matching the event, then Event ignored because no transition is defined for this state and event combination. *(error: `STATE_MACHINE_NO_TRANSITION`)*
- **Transition From Terminal Rejected** — when an event is dispatched for an entity in a terminal state, then Event rejected because entity is in a terminal state with no outgoing transitions. *(error: `STATE_MACHINE_TERMINAL_STATE`)*
- **Definition Validation Fails** — when no initial state is defined OR multiple initial states are defined OR no terminal state is defined OR orphan states exist OR non-deterministic transitions detected OR terminal state has outgoing transitions, then State machine definition rejected due to validation errors. *(error: `STATE_MACHINE_INVALID_DEFINITION`)*
- **Transition Action Fails** — when a transition is executing; an entry action, exit action, or transition action throws an error, then Transition rolled back and entity remains in original state. *(error: `STATE_MACHINE_ACTION_FAILED`)*

## Errors it can return

- `STATE_MACHINE_INVALID_DEFINITION` — State machine definition is invalid. Check initial/terminal states, orphan states, and transition determinism.
- `STATE_MACHINE_NO_TRANSITION` — No transition defined for the given state and event combination.
- `STATE_MACHINE_GUARD_FAILED` — Transition guard condition evaluated to false. The transition is not allowed.
- `STATE_MACHINE_TERMINAL_STATE` — Entity is in a terminal state and cannot transition further.
- `STATE_MACHINE_ACTION_FAILED` — A transition action failed. The transition has been rolled back.
- `STATE_MACHINE_NOT_FOUND` — The specified state machine definition does not exist.
- `STATE_MACHINE_DUPLICATE_ID` — A state machine with this ID already exists.

## Connects to

- **automation-rules** *(recommended)* — Automation rules can trigger events that drive state machine transitions
- **approval-chain** *(optional)* — Approval workflows can be modeled as state machines with approval/rejection transitions
- **task-management** *(optional)* — Task lifecycle (open, in progress, done) can be managed by a state machine
- **bulk-operations** *(optional)* — Bulk operations may trigger state transitions on multiple entities simultaneously

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/state-machine/) · **Spec source:** [`state-machine.blueprint.yaml`](./state-machine.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
