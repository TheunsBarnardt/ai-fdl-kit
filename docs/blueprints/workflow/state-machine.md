---
title: "State Machine Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Generic state machine engine with named states, guarded transitions, entry/exit actions, history tracking, and lifecycle validation rules. . 8 fields. 8 outcome"
---

# State Machine Blueprint

> Generic state machine engine with named states, guarded transitions, entry/exit actions, history tracking, and lifecycle validation rules.


| | |
|---|---|
| **Feature** | `state-machine` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | state-machine, finite-automaton, workflow-engine, lifecycle-management, transitions, event-driven |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/state-machine.blueprint.yaml) |
| **JSON API** | [state-machine.json]({{ site.baseurl }}/api/blueprints/workflow/state-machine.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `machine_admin` | Machine Administrator | human | Defines and configures state machine definitions |
| `entity_actor` | Entity Actor | human | Triggers events that cause state transitions on entities |
| `engine` | State Machine Engine | system | Evaluates guards, executes transitions, and records history |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `machine_id` | text | Yes | Machine ID | Validations: pattern |
| `name` | text | Yes | Machine Name | Validations: minLength, maxLength |
| `entity_type` | text | Yes | Entity Type |  |
| `current_state` | text | Yes | Current State |  |
| `states` | json | Yes | State Definitions |  |
| `transitions` | json | Yes | Transition Definitions |  |
| `history` | json | No | Transition History |  |
| `metadata` | json | No | Machine Metadata |  |

## Rules

- **exactly_one_initial_state:**
  - **description:** Every state machine definition must have exactly one state marked as initial. This is the state assigned when a new entity is created. Zero or multiple initial states are a configuration error.

- **at_least_one_terminal_state:**
  - **description:** Every state machine definition must have at least one state marked as terminal. Terminal states represent completed lifecycles and do not allow outgoing transitions.

- **no_orphan_states:**
  - **description:** Every non-initial state must be reachable from the initial state via at least one chain of transitions. States with no incoming transitions (except the initial state) are configuration errors.

- **deterministic_transitions:**
  - **description:** For any given (current_state, event) pair, at most one transition may be eligible after guard evaluation. If multiple transitions share the same from-state and event, their guard conditions must be mutually exclusive to ensure deterministic behavior.

- **terminal_states_no_outgoing:**
  - **description:** States marked as terminal must not have any outgoing transitions defined. Attempting to add a transition from a terminal state is a configuration error.

- **history_immutable:**
  - **description:** Transition history entries are append-only. Once recorded, history entries cannot be modified or deleted to ensure a complete audit trail.

- **guard_expressions_validated:**
  - **description:** Guard expressions on transitions must be valid expressions using the FDL expression syntax. Invalid guards are rejected at configuration time, not at transition time.

- **on_enter_exit_actions:**
  - **description:** Entry and exit actions on states execute automatically during transitions. Exit actions of the source state run before entry actions of the target state. Action failures cause the transition to roll back.


## Outcomes

### Machine_definition_created (Priority: 1)

**Given:**
- administrator provides state machine definition with states and transitions
- exactly one initial state is defined
- at least one terminal state is defined
- no orphan states exist
- all transitions are deterministic

**Then:**
- **create_record** target: `state_machine` — Store validated machine definition
- **emit_event** event: `state_machine.created`

**Result:** State machine definition validated and created successfully

### Transition_executed (Priority: 2) | Transaction: atomic

**Given:**
- an event is dispatched for an entity with a current state
- a transition exists from current state matching the event
- the transition guard evaluates to true (or has no guard)

**Then:**
- **call_service** target: `engine` — Execute exit actions of source state
- **transition_state** field: `current_state` from: `source_state` to: `target_state`
- **call_service** target: `engine` — Execute entry actions of target state
- **call_service** target: `engine` — Execute transition actions
- **set_field** target: `history` — Append transition record with from, to, event, actor, and timestamp
- **emit_event** event: `state_machine.transitioned`

**Result:** Entity transitions to new state with all actions executed and history recorded

### Transition_guard_blocks (Priority: 3) — Error: `STATE_MACHINE_GUARD_FAILED`

**Given:**
- an event is dispatched for an entity with a current state
- a transition exists from current state matching the event
- the transition guard evaluates to false

**Then:**
- **emit_event** event: `state_machine.transition_blocked`

**Result:** Transition blocked because guard condition is not satisfied

### No_valid_transition (Priority: 4) — Error: `STATE_MACHINE_NO_TRANSITION`

**Given:**
- an event is dispatched for an entity
- no transition exists from the current state matching the event

**Result:** Event ignored because no transition is defined for this state and event combination

### Transition_from_terminal_rejected (Priority: 5) — Error: `STATE_MACHINE_TERMINAL_STATE`

**Given:**
- an event is dispatched for an entity in a terminal state

**Result:** Event rejected because entity is in a terminal state with no outgoing transitions

### Entity_initialized (Priority: 6)

**Given:**
- a new entity is created for a registered state machine

**Then:**
- **set_field** target: `current_state` — Set to the machine's initial state
- **call_service** target: `engine` — Execute entry actions of the initial state
- **set_field** target: `history` — Record initial state assignment
- **emit_event** event: `state_machine.entity_initialized`

**Result:** New entity assigned to the initial state with entry actions executed

### Definition_validation_fails (Priority: 7) — Error: `STATE_MACHINE_INVALID_DEFINITION`

**Given:**
- ANY: no initial state is defined OR multiple initial states are defined OR no terminal state is defined OR orphan states exist OR non-deterministic transitions detected OR terminal state has outgoing transitions

**Result:** State machine definition rejected due to validation errors

### Transition_action_fails (Priority: 8) — Error: `STATE_MACHINE_ACTION_FAILED`

**Given:**
- a transition is executing
- an entry action, exit action, or transition action throws an error

**Then:**
- **emit_event** event: `state_machine.action_failed`

**Result:** Transition rolled back and entity remains in original state

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STATE_MACHINE_INVALID_DEFINITION` | 400 | State machine definition is invalid. Check initial/terminal states, orphan states, and transition determinism. | No |
| `STATE_MACHINE_NO_TRANSITION` | 409 | No transition defined for the given state and event combination. | No |
| `STATE_MACHINE_GUARD_FAILED` | 403 | Transition guard condition evaluated to false. The transition is not allowed. | No |
| `STATE_MACHINE_TERMINAL_STATE` | 409 | Entity is in a terminal state and cannot transition further. | No |
| `STATE_MACHINE_ACTION_FAILED` | 500 | A transition action failed. The transition has been rolled back. | No |
| `STATE_MACHINE_NOT_FOUND` | 404 | The specified state machine definition does not exist. | No |
| `STATE_MACHINE_DUPLICATE_ID` | 409 | A state machine with this ID already exists. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `state_machine.created` | A new state machine definition was created | `machine_id`, `name`, `entity_type`, `state_count`, `transition_count` |
| `state_machine.transitioned` | An entity transitioned from one state to another | `machine_id`, `entity_id`, `from_state`, `to_state`, `event`, `actor` |
| `state_machine.transition_blocked` | A transition was blocked by a guard condition | `machine_id`, `entity_id`, `current_state`, `event`, `guard_expression` |
| `state_machine.entity_initialized` | A new entity was assigned to its initial state | `machine_id`, `entity_id`, `initial_state` |
| `state_machine.action_failed` | An action during transition failed causing rollback | `machine_id`, `entity_id`, `action`, `error_details` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| automation-rules | recommended | Automation rules can trigger events that drive state machine transitions |
| approval-chain | optional | Approval workflows can be modeled as state machines with approval/rejection transitions |
| task-management | optional | Task lifecycle (open, in progress, done) can be managed by a state machine |
| bulk-operations | optional | Bulk operations may trigger state transitions on multiple entities simultaneously |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "State Machine Blueprint",
  "description": "Generic state machine engine with named states, guarded transitions, entry/exit actions, history tracking, and lifecycle validation rules.\n. 8 fields. 8 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "state-machine, finite-automaton, workflow-engine, lifecycle-management, transitions, event-driven"
}
</script>
