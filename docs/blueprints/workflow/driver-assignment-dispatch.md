---
title: "Driver Assignment Dispatch Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.. 12 fields. 7 outcomes."
---

# Driver Assignment Dispatch Blueprint

> Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.

| | |
|---|---|
| **Feature** | `driver-assignment-dispatch` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | dispatch, driver-assignment, adhoc, fleet-ops, fleet, vehicle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-assignment-dispatch.blueprint.yaml) |
| **JSON API** | [driver-assignment-dispatch.json]({{ site.baseurl }}/api/blueprints/workflow/driver-assignment-dispatch.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Operator or system that assigns drivers to orders. |
| `driver` | Driver | human | The driver receiving the dispatched order. |
| `platform` | Platform | system | Automated dispatch and matching system. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Identifier of the order to dispatch. |  |
| `driver_id` | text | No | Public identifier of the driver to assign (omit for adhoc mode). |  |
| `adhoc` | boolean | No | If true, order is broadcast to nearby drivers; first to accept is assigned. |  |
| `adhoc_distance` | number | No | Radius in meters within which nearby drivers are pinged for adhoc orders. |  |
| `dispatch_immediately` | boolean | No | Whether to dispatch the order immediately after assignment. |  |
| `dispatched` | boolean | No | Whether the order has been successfully dispatched. |  |
| `dispatched_at` | datetime | No | Timestamp of dispatch. |  |
| `vehicle_id` | text | No | Vehicle assigned to the driver for this order. |  |
| `driver_response` | select | No | Driver response to dispatch (accepted, rejected). |  |
| `driver_response_at` | datetime | No | Timestamp when driver responded. |  |
| `notes` | text | No | Dispatcher notes for this assignment. |  |
| `status` | select | Yes | Current dispatch status. |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending_assignment` | Yes |  |
| `assigned` |  |  |
| `dispatched` |  |  |
| `accepted` |  |  |
| `rejected` |  | Yes |
| `reassigned` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending_assignment` | `assigned` | dispatcher |  |
|  | `pending_assignment` | `assigned` | platform |  |
|  | `assigned` | `dispatched` | dispatcher |  |
|  | `dispatched` | `accepted` | driver |  |
|  | `dispatched` | `rejected` | driver |  |
|  | `rejected` | `reassigned` | dispatcher |  |

## Rules

- **rule_01:** A driver can only be assigned to one active order at a time (current_job).
- **rule_02:** Assigning a driver does not automatically dispatch; dispatch is a separate explicit action.
- **rule_03:** In adhoc mode, the order is broadcast to all available drivers within adhoc_distance; the first driver to accept is assigned.
- **rule_04:** A dispatched order cannot be dispatched a second time.
- **rule_05:** If no driver is assigned and adhoc is false, dispatch fails with ORDER_NO_DRIVER_ASSIGNED.
- **rule_06:** When a driver is assigned, the driver receives a push notification with order details.
- **rule_07:** Vehicle assignment is exclusive; a vehicle can only be active for one driver at a time.
- **rule_08:** Driver must have status 'available' (online, not on an active order) to be assigned.
- **rule_09:** Vehicle must be operational and not already assigned to another active order.
- **rule_10:** System should suggest the nearest available driver based on current GPS position.
- **rule_11:** If a driver rejects a dispatch the order returns to the queue for reassignment.
- **rule_12:** Dispatcher can override system suggestions and manually select any available driver.
- **rule_13:** Driver acceptance or rejection must be timestamped for SLA tracking.

## Outcomes

### Driver_manually_assigned (Priority: 1)

**Given:**
- dispatcher provides a valid driver_id
- driver is available (not on another active order)

**Then:**
- **set_field** target: `driver_assigned` — Order record is updated with the assigned driver reference.
- **emit_event** event: `order.driver_assigned`
- **notify** target: `driver` — Driver receives push notification informing them of the new order assignment.

**Result:** Driver is linked to the order and notified. Order is ready to dispatch.

### Adhoc_ping_sent (Priority: 2)

**Given:**
- adhoc is true
- no driver is pre-assigned
- order is dispatched

**Then:**
- **emit_event** event: `order.dispatched`
- **notify** target: `nearby_drivers` — All available drivers within adhoc_distance are pinged with the order details.

**Result:** Nearby drivers receive a ping and can accept or reject the order.

### Order_dispatched (Priority: 3)

**Given:**
- driver is assigned OR adhoc is true
- order has not been dispatched already

**Then:**
- **set_field** target: `dispatched` value: `true`
- **set_field** target: `dispatched_at` value: `now`
- **transition_state** field: `status` from: `created` to: `dispatched`
- **emit_event** event: `order.dispatched`

**Result:** Order is live; driver begins navigating to pickup.

### Driver_assigned_at_adhoc_accept (Priority: 4)

**Given:**
- order is in adhoc mode
- a driver accepts the order ping
- no other driver has already accepted

**Then:**
- **set_field** target: `driver_assigned` — First-responding driver is locked to the order.
- **set_field** target: `current_job` — Order is set as the driver's current active job.
- **emit_event** event: `order.driver_assigned`

**Result:** Driver is assigned; order proceeds with this driver.

### Driver_accepted (Priority: 5)

**Given:**
- `driver_response` (input) eq `accepted`

**Then:**
- **set_field** target: `status` value: `accepted`
- **set_field** target: `driver_response_at` value: `now`
- **emit_event** event: `dispatch.accepted`

**Result:** Driver accepted; order is en route.

### Driver_rejected (Priority: 6) — Error: `DISPATCH_DRIVER_REJECTED`

**Given:**
- `driver_response` (input) eq `rejected`

**Then:**
- **set_field** target: `status` value: `rejected`
- **set_field** target: `driver_response_at` value: `now`
- **emit_event** event: `dispatch.rejected`

**Result:** Driver rejected; order returned to dispatch queue for reassignment.

### Dispatch_failed_no_driver (Priority: 7) — Error: `ORDER_NO_DRIVER_ASSIGNED`

**Given:**
- adhoc is false
- no driver_id is provided

**Then:**
- **emit_event** event: `order.dispatch_failed`

**Result:** Dispatch is rejected; operator must assign a driver first.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_NO_DRIVER_ASSIGNED` | 400 | No driver assigned to dispatch. | No |
| `ORDER_ALREADY_DISPATCHED` | 400 | This order has already been dispatched. | No |
| `DRIVER_NOT_FOUND` | 404 | The specified driver could not be found. | No |
| `DISPATCH_DRIVER_REJECTED` | 422 | The driver declined this order. | No |
| `DISPATCH_VEHICLE_UNAVAILABLE` | 422 | The selected vehicle is not available for dispatch. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.driver_assigned` | Fired when a driver is linked to an order. | `order_id`, `driver_id`, `assigned_at` |
| `order.dispatched` | Fired when an order is dispatched (to a specific driver or broadcast in adhoc mode). | `order_id`, `driver_id`, `adhoc`, `dispatched_at` |
| `order.dispatch_failed` | Fired when dispatch cannot be completed. | `order_id`, `reason` |
| `dispatch.accepted` | Fired when driver accepts the dispatch. | `order_id`, `driver_id`, `driver_response_at` |
| `dispatch.rejected` | Fired when driver rejects the dispatch. | `order_id`, `driver_id`, `driver_response_at` |
| `dispatch.reassigned` | Fired when order is reassigned to a different driver after rejection. | `order_id`, `new_driver_id`, `previous_driver_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Dispatch is a key state transition in the ride lifecycle. |
| driver-app-flow | required | Driver app handles the ping, accept, and reject interaction. |
| driver-shift-management | recommended | Only online/on-shift drivers should receive pings. |
| fleet-vehicle-registry | optional | Vehicle assignment is validated as part of driver dispatch readiness. |
| driver-profile | required | Driver availability and status comes from driver profile. |
| realtime-driver-tracking | recommended | Driver location used for nearest-driver auto-assignment and adhoc radius. |

## AGI Readiness

### Goals

#### Reliable Driver Assignment Dispatch

Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.

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

- before making irreversible changes

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
| driver_manually_assigned | `autonomous` | - | - |
| adhoc_ping_sent | `autonomous` | - | - |
| order_dispatched | `autonomous` | - | - |
| driver_assigned_at_adhoc_accept | `autonomous` | - | - |
| dispatch_failed_no_driver | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Models/Order.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Notifications/OrderAssigned.php
    - src/Notifications/OrderPing.php
    - src/Events/OrderDriverAssigned.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Assignment Dispatch Blueprint",
  "description": "Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.. 12 fields. 7 outcomes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "dispatch, driver-assignment, adhoc, fleet-ops, fleet, vehicle"
}
</script>
