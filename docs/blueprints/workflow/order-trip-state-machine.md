---
title: "Order Trip State Machine Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Configurable state machine that controls how an order advances through its activity flow, with support for custom order types, waypoint-level states, and proof-"
---

# Order Trip State Machine Blueprint

> Configurable state machine that controls how an order advances through its activity flow, with support for custom order types, waypoint-level states, and proof-of-delivery gates.

| | |
|---|---|
| **Feature** | `order-trip-state-machine` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | state-machine, order-flow, activity, waypoints, configurable |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/order-trip-state-machine.blueprint.yaml) |
| **JSON API** | [order-trip-state-machine.json]({{ site.baseurl }}/api/blueprints/workflow/order-trip-state-machine.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Triggers state transitions by calling update-activity. |
| `platform` | Platform | system | Validates transitions, determines next valid activity, and applies flow logic. |
| `operator` | Operator | human | Configures custom order type flows via the order config system. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Identifier of the order being advanced. |  |
| `current_status` | text | Yes | Current status code of the order (e.g., created, dispatched, driver_enroute). |  |
| `activity_code` | text | No | The code of the activity to transition to (e.g., driver_enroute, completed). |  |
| `order_type` | text | No | Key identifying which order configuration flow to use (defaults to "default"). |  |
| `skip_dispatch` | boolean | No | If true, the dispatch step is bypassed and the flow moves to the next activity. |  |
| `waypoint_id` | text | No | For multi-waypoint orders, the specific waypoint being advanced. |  |
| `proof_id` | text | No | Reference to a proof record if this activity requires proof of delivery. |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `created` | Yes |  |
| `dispatched` |  |  |
| `driver_enroute` |  |  |
| `arrived` |  |  |
| `in_progress` |  |  |
| `completed` |  | Yes |
| `canceled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `created` | `dispatched` | platform |  |
|  | `dispatched` | `driver_enroute` | driver |  |
|  | `driver_enroute` | `arrived` | driver |  |
|  | `arrived` | `in_progress` | driver |  |
|  | `in_progress` | `completed` | driver |  |
|  | `any` | `canceled` | platform |  |

## Rules

- **rule_01:** The system determines the valid next activity for any order based on its current status and configured flow.
- **rule_02:** Order type determines which flow configuration is used; "default" is used if none is configured.
- **rule_03:** Custom order types have their own activity sequences defined in the order config system.
- **rule_04:** For multi-waypoint orders, each waypoint has its own activity state tracked independently.
- **rule_05:** All waypoints must reach completed status before the overall order can be completed.
- **rule_06:** If skip_dispatch is true, the dispatched step is bypassed and the flow jumps directly to the next activity.
- **rule_07:** A tracking status record is written at each transition, capturing status, code, details, and location.
- **Proof of delivery gates:** if an activity requires proof (pod_required), the transition is blocked until proof is captured.
- **rule_09:** Activity codes are normalized to snake_case on write.

## Outcomes

### Next_activity_resolved (Priority: 1)

**Given:**
- order exists and current status is known

**Then:**
- **set_field** target: `response` — The next valid activity (code, status label, details) is returned to the caller.

**Result:** Driver app knows what action to offer next without hard-coding flow logic.

### Activity_transition_applied (Priority: 2)

**Given:**
- driver submits an activity code matching the expected next state
- any required proofs are already captured

**Then:**
- **transition_state** field: `status` from: `current` to: `next`
- **create_record** — Tracking status entry written with activity code, status label, driver location, and timestamp.
- **emit_event** event: `order.updated`

**Result:** Order advances; customer and operator see updated status.

### Waypoint_activity_applied (Priority: 3)

**Given:**
- order has multiple waypoints
- driver submits an activity code for a specific waypoint

**Then:**
- **create_record** — Tracking status entry is written for the specific waypoint.
- **set_field** target: `waypoint.status_code` — Waypoint's individual completion status is updated.

**Result:** That waypoint advances independently; overall order completes only when all waypoints are done.

### Invalid_activity_rejected (Priority: 4) — Error: `INVALID_ACTIVITY_CODE`

**Given:**
- submitted activity code is not the expected next state

**Result:** Transition is rejected; current status is unchanged.

### Proof_gate_blocked (Priority: 5) — Error: `PROOF_REQUIRED`

**Given:**
- activity requires proof of delivery
- no proof has been captured for this order or waypoint

**Result:** Transition is blocked until proof is submitted.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_ACTIVITY_CODE` | 400 | The submitted activity is not valid for the current order state. | No |
| `PROOF_REQUIRED` | 400 | Proof of delivery is required before this activity can be completed. | No |
| `ORDER_NOT_FOUND` | 404 | Order not found. | No |
| `WAYPOINTS_INCOMPLETE` | 400 | Not all waypoints have been completed. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.updated` | Fired on every successful activity transition. | `order_id`, `status`, `activity_code`, `driver_id`, `location`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | The lifecycle is driven by this state machine. |
| driver-app-flow | required | Driver app calls update-activity to trigger transitions. |
| proof-of-delivery | optional | Proof-required activities gate on this feature. |
| webhook-trip-lifecycle | recommended | Each transition emits webhook events consumed by external systems. |

## AGI Readiness

### Goals

#### Reliable Order Trip State Machine

Configurable state machine that controls how an order advances through its activity flow, with support for custom order types, waypoint-level states, and proof-of-delivery gates.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `ride_request_lifecycle` | ride-request-lifecycle | degrade |
| `driver_app_flow` | driver-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| next_activity_resolved | `autonomous` | - | - |
| activity_transition_applied | `autonomous` | - | - |
| waypoint_activity_applied | `autonomous` | - | - |
| invalid_activity_rejected | `supervised` | - | - |
| proof_gate_blocked | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 4
  entry_points:
    - src/Support/Flow.php
    - src/Models/Order.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - config/api.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Trip State Machine Blueprint",
  "description": "Configurable state machine that controls how an order advances through its activity flow, with support for custom order types, waypoint-level states, and proof-",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "state-machine, order-flow, activity, waypoints, configurable"
}
</script>
