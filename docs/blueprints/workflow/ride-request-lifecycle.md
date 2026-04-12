---
title: "Ride Request Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.. 17 fields. 8 outcomes. 5 error codes. rules: rul"
---

# Ride Request Lifecycle Blueprint

> End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.

| | |
|---|---|
| **Feature** | `ride-request-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | ride-hailing, order, lifecycle, dispatch, pickup, completion |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/ride-request-lifecycle.blueprint.yaml) |
| **JSON API** | [ride-request-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/ride-request-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | The rider requesting the trip. |
| `driver` | Driver | human | The driver assigned to fulfil the ride. |
| `platform` | Platform | system | The dispatch and orchestration system. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Unique public identifier for the ride request. |  |
| `status` | select | Yes | Current lifecycle status of the ride request. |  |
| `customer_id` | text | Yes | Reference to the customer who requested the ride. |  |
| `driver_id` | text | No | Reference to the assigned driver (set at dispatch or on adhoc acceptance). |  |
| `pickup_location` | json | Yes | Geographic coordinates and address of the pickup point. |  |
| `dropoff_location` | json | Yes | Geographic coordinates and address of the drop-off point. |  |
| `tracking_number` | text | No | Human-readable tracking code for the ride. |  |
| `dispatched` | boolean | No | Whether the order has been sent to a driver. |  |
| `dispatched_at` | datetime | No | Timestamp when the order was dispatched. |  |
| `started` | boolean | No | Whether the driver has started the trip (picked up the rider). |  |
| `started_at` | datetime | No | Timestamp when the trip started. |  |
| `distance` | number | No | Estimated or actual trip distance in meters. |  |
| `estimated_time` | number | No | Estimated trip duration in seconds. |  |
| `scheduled_at` | datetime | No | Optional future date/time for scheduled rides. |  |
| `pod_required` | boolean | No | Whether proof of pickup/drop-off is required. |  |
| `pod_method` | select | No | Method of proof collection. |  |
| `notes` | text | No | Additional instructions or notes from the customer. |  |

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
|  | `created` | `canceled` | customer |  |
|  | `dispatched` | `canceled` | customer |  |
|  | `dispatched` | `canceled` | platform |  |

## Rules

- **rule_01:** A ride request defaults to status "created" on creation.
- **rule_02:** An order must have a pickup and drop-off location to be created.
- **rule_03:** Dispatch requires either a pre-assigned driver or adhoc mode where nearby drivers are pinged.
- **rule_04:** An order cannot be dispatched more than once.
- **rule_05:** An order cannot be started before it has been dispatched (unless skip_dispatch flag is used).
- **rule_06:** Cancellation fires a cancellation event and halts any further activity transitions.
- **rule_07:** A tracking number is generated at order creation for customer-facing status lookups.
- **rule_08:** If proof of delivery is required, trip completion is only allowed after proof is captured.
- **rule_09:** Preliminary distance and time estimates are computed at order creation using routing data.

## Outcomes

### Order_created (Priority: 1)

**Given:**
- customer submits a ride request with valid pickup and drop-off

**Then:**
- **create_record** — Order record is persisted with status created.
- **emit_event** event: `order.created`
- **set_field** target: `status` value: `created`

**Result:** Ride request is created and a tracking number is returned to the customer.

### Order_dispatched (Priority: 2)

**Given:**
- order status is created
- driver is assigned or order is in adhoc mode

**Then:**
- **set_field** target: `dispatched` value: `true`
- **set_field** target: `dispatched_at` value: `now`
- **emit_event** event: `order.dispatched`
- **transition_state** field: `status` from: `created` to: `dispatched`

**Result:** Driver receives a push notification with ride details.

### Driver_accepts_and_enroutes (Priority: 3)

**Given:**
- order status is dispatched
- driver updates activity to driver_enroute

**Then:**
- **transition_state** field: `status` from: `dispatched` to: `driver_enroute`
- **emit_event** event: `order.updated`

**Result:** Customer sees driver is en route; ETA is surfaced.

### Driver_arrives (Priority: 4)

**Given:**
- order status is driver_enroute
- driver updates activity to arrived

**Then:**
- **transition_state** field: `status` from: `driver_enroute` to: `arrived`
- **emit_event** event: `order.updated`

**Result:** Customer is notified that the driver has arrived.

### Trip_starts (Priority: 5)

**Given:**
- order status is arrived
- driver confirms pickup

**Then:**
- **set_field** target: `started` value: `true`
- **set_field** target: `started_at` value: `now`
- **transition_state** field: `status` from: `arrived` to: `in_progress`
- **emit_event** event: `order.updated`

**Result:** Trip is underway; customer tracking is updated live.

### Trip_completed (Priority: 6)

**Given:**
- order status is in_progress
- driver marks delivery complete
- proof captured if pod_required is true

**Then:**
- **transition_state** field: `status` from: `in_progress` to: `completed`
- **emit_event** event: `order.completed`

**Result:** Ride is complete; driver is freed for next assignment.

### Order_canceled (Priority: 7) — Error: `ORDER_CANCELED`

**Given:**
- customer or platform requests cancellation
- order status is not completed

**Then:**
- **transition_state** field: `status` from: `any` to: `canceled`
- **emit_event** event: `order.canceled`

**Result:** Ride request is terminated; no further activity can be applied.

### Dispatch_failed (Priority: 8) — Error: `ORDER_DISPATCH_FAILED`

**Given:**
- order is dispatched
- no driver accepts within the timeout period

**Then:**
- **emit_event** event: `order.dispatch_failed`

**Result:** Platform notifies the operator; order may be re-dispatched or canceled.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_CANCELED` | 400 | This ride request has been canceled. | No |
| `ORDER_DISPATCH_FAILED` | 400 | Unable to find a driver for your request. Please try again. | No |
| `ORDER_ALREADY_DISPATCHED` | 400 | This order has already been dispatched. | No |
| `ORDER_ALREADY_STARTED` | 400 | This order has already started. | No |
| `ORDER_NOT_DISPATCHED` | 400 | Order must be dispatched before it can be started. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.created` | Fired when a new ride request is successfully created. | `order_id`, `customer_id`, `pickup_location`, `dropoff_location`, `tracking_number` |
| `order.dispatched` | Fired when an order is dispatched to a driver. | `order_id`, `driver_id`, `dispatched_at` |
| `order.updated` | Fired on any status or data change to the order. | `order_id`, `status`, `updated_at` |
| `order.completed` | Fired when the trip is successfully completed. | `order_id`, `driver_id`, `customer_id`, `distance`, `duration` |
| `order.canceled` | Fired when the order is canceled. | `order_id`, `canceled_by`, `reason` |
| `order.dispatch_failed` | Fired when dispatch cannot be completed. | `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-assignment-dispatch | required | Dispatch requires a driver to be assigned or adhoc mode. |
| driver-app-flow | required | Driver app triggers activity updates (enroute, arrived, in_progress, completed). |
| customer-app-flow | required | Customer app creates the request and tracks status changes. |
| order-trip-state-machine | extends | Detailed configurable state machine that governs activity transitions. |
| webhook-trip-lifecycle | recommended | Webhooks deliver lifecycle events to external systems. |
| proof-of-delivery | optional | Required when pod_required is true on the order. |
| eta-calculation | recommended | Preliminary ETA is set at creation; updated at each transition. |

## AGI Readiness

### Goals

#### Reliable Ride Request Lifecycle

End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.

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
| `driver_assignment_dispatch` | driver-assignment-dispatch | degrade |
| `driver_app_flow` | driver-app-flow | degrade |
| `customer_app_flow` | customer-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| order_created | `supervised` | - | - |
| order_dispatched | `autonomous` | - | - |
| driver_accepts_and_enroutes | `autonomous` | - | - |
| driver_arrives | `autonomous` | - | - |
| trip_starts | `autonomous` | - | - |
| trip_completed | `autonomous` | - | - |
| order_canceled | `supervised` | - | - |
| dispatch_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 8
  entry_points:
    - src/Models/Order.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Support/Flow.php
    - src/Events/OrderDispatched.php
    - src/Events/OrderCompleted.php
    - src/Events/OrderCanceled.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ride Request Lifecycle Blueprint",
  "description": "End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.. 17 fields. 8 outcomes. 5 error codes. rules: rul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ride-hailing, order, lifecycle, dispatch, pickup, completion"
}
</script>
