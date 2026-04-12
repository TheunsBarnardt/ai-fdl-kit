---
title: "Order Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "End-to-end delivery order lifecycle management from creation through completion or cancellation. 18 fields. 7 outcomes. 5 error codes. rules: dispatch_requires_"
---

# Order Lifecycle Blueprint

> End-to-end delivery order lifecycle management from creation through completion or cancellation

| | |
|---|---|
| **Feature** | `order-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, delivery, order, logistics, dispatch |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/order-lifecycle.blueprint.yaml) |
| **JSON API** | [order-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/order-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Operations staff who create and manage orders |
| `driver` | Driver | human | Field driver executing the delivery |
| `customer` | Customer | human | Entity placing the delivery order |
| `system` | System | system | Automated order processing and state transitions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Order ID |  |
| `internal_id` | text | No | Internal Reference ID |  |
| `customer_uuid` | text | Yes | Customer |  |
| `driver_assigned_uuid` | text | No | Assigned Driver |  |
| `vehicle_assigned_uuid` | text | No | Assigned Vehicle |  |
| `payload_uuid` | text | Yes | Payload (Pickup/Dropoff) |  |
| `route_uuid` | text | No | Route |  |
| `scheduled_at` | datetime | No | Scheduled Time |  |
| `dispatched_at` | datetime | No | Dispatched At |  |
| `started_at` | datetime | No | Started At |  |
| `pod_required` | boolean | No | POD Required |  |
| `pod_method` | select | No | POD Method |  |
| `notes` | rich_text | No | Delivery Notes |  |
| `type` | text | No | Order Type |  |
| `status` | select | Yes | Status |  |
| `distance` | number | No | Route Distance (m) |  |
| `time` | number | No | Estimated Time (s) |  |
| `adhoc` | boolean | No | Ad-hoc Order |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `created` | Yes |  |
| `pending` |  |  |
| `dispatched` |  |  |
| `driver_enroute` |  |  |
| `arrived` |  |  |
| `driver_waiting` |  |  |
| `in_progress` |  |  |
| `completed` |  | Yes |
| `cancelled` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `created` | `pending` | dispatcher |  |
|  | `pending` | `dispatched` | dispatcher |  |
|  | `dispatched` | `driver_enroute` | driver |  |
|  | `driver_enroute` | `arrived` | driver |  |
|  | `arrived` | `in_progress` | driver |  |
|  | `in_progress` | `completed` | driver |  |
|  | `dispatched` | `cancelled` | dispatcher |  |
|  | `pending` | `cancelled` | dispatcher |  |
|  | `in_progress` | `failed` | system |  |

## Rules

- **dispatch_requires_driver_and_vehicle:** A driver and vehicle must be assigned before an order can be dispatched
- **pod_required_before_completion:** Proof of delivery must be collected before completing when pod_required is true
- **no_reactivation:** Cancelled or failed orders cannot be reactivated; a new order must be created
- **valid_state_transitions:** Order status transitions must follow the defined state machine
- **scheduled_dispatch_window:** Scheduled orders cannot be dispatched more than 30 minutes early without override
- **audit_all_transitions:** Each status change is logged with timestamp, actor, and previous status
- **driver_must_be_available:** An order can only be assigned to a driver whose status is available
- **payload_required:** An order must have at least one pickup and one dropoff waypoint in the payload
- **recalculate_on_route_change:** Distance and time estimates must be recalculated whenever the route changes
- **tenant_isolation:** Each order belongs to exactly one organization and is invisible to others

## Outcomes

### Order_created (Priority: 1)

**Given:**
- dispatcher is authenticated and authorized
- `payload_uuid` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `order.created`
- **set_field** target: `status` value: `created`

**Result:** Order created in 'created' state and awaits dispatch

### Dispatch_rejected_no_driver (Priority: 1) — Error: `ORDER_DISPATCH_REQUIRES_DRIVER`

**Given:**
- `driver_assigned_uuid` (input) not_exists

**Result:** Dispatch rejected — driver must be assigned first

### Order_dispatched (Priority: 2)

**Given:**
- `driver_assigned_uuid` (input) exists
- `vehicle_assigned_uuid` (input) exists
- `status` (db) in `created,pending`

**Then:**
- **set_field** target: `status` value: `dispatched`
- **set_field** target: `dispatched_at` value: `now`
- **emit_event** event: `order.dispatched`

**Result:** Order dispatched to driver with route and instructions

### Pod_missing (Priority: 2) — Error: `ORDER_POD_REQUIRED`

**Given:**
- `pod_required` (db) eq `true`
- no proof of delivery record exists for this order

**Result:** Completion blocked until proof of delivery is captured

### Driver_started (Priority: 3)

**Given:**
- `status` (db) eq `dispatched`

**Then:**
- **set_field** target: `status` value: `driver_enroute`
- **set_field** target: `started_at` value: `now`
- **emit_event** event: `order.driver_enroute`

**Result:** Driver is en route to pickup location

### Delivery_completed (Priority: 4)

**Given:**
- `status` (db) eq `in_progress`
- pod_required is false OR proof of delivery has been captured

**Then:**
- **set_field** target: `status` value: `completed`
- **emit_event** event: `order.completed`

**Result:** Order completed and customer notified

### Order_cancelled (Priority: 5)

**Given:**
- `status` (db) not_in `completed,cancelled,failed`

**Then:**
- **set_field** target: `status` value: `cancelled`
- **emit_event** event: `order.cancelled`

**Result:** Order cancelled and all parties notified

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_DISPATCH_REQUIRES_DRIVER` | 422 | A driver must be assigned before dispatching the order. | No |
| `ORDER_DISPATCH_REQUIRES_VEHICLE` | 422 | A vehicle must be assigned before dispatching the order. | No |
| `ORDER_POD_REQUIRED` | 422 | Proof of delivery is required to complete this order. | No |
| `ORDER_INVALID_TRANSITION` | 422 | This status change is not allowed at this stage. | No |
| `ORDER_NOT_FOUND` | 404 | The requested order could not be found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.created` | Fired when a new order is created | `order_id`, `customer_uuid`, `scheduled_at`, `type` |
| `order.dispatched` | Fired when an order is dispatched to a driver | `order_id`, `driver_assigned_uuid`, `vehicle_assigned_uuid`, `dispatched_at` |
| `order.driver_enroute` | Fired when driver starts traveling to pickup | `order_id`, `driver_assigned_uuid`, `started_at` |
| `order.arrived` | Fired when driver arrives at pickup location | `order_id`, `driver_assigned_uuid` |
| `order.in_progress` | Fired when delivery is in progress | `order_id`, `driver_assigned_uuid` |
| `order.completed` | Fired when delivery is successfully completed | `order_id`, `driver_assigned_uuid`, `customer_uuid` |
| `order.cancelled` | Fired when an order is cancelled | `order_id`, `customer_uuid`, `cancelled_by` |
| `order.failed` | Fired when a delivery fails | `order_id`, `driver_assigned_uuid`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dispatch-driver-assignment | required | Driver and vehicle assignment is required before dispatch |
| route-planning | required | Route must be planned for order execution |
| proof-of-delivery | recommended | POD collection validates delivery completion |
| delivery-notifications | recommended | Customer and driver notifications at each status change |
| order-sla-eta | recommended | ETA tracking per order for SLA monitoring |
| order-lifecycle-webhooks | optional | Webhook delivery of order lifecycle events to third parties |

## AGI Readiness

### Goals

#### Reliable Order Lifecycle

End-to-end delivery order lifecycle management from creation through completion or cancellation

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
| `dispatch_driver_assignment` | dispatch-driver-assignment | degrade |
| `route_planning` | route-planning | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| order_created | `supervised` | - | - |
| order_dispatched | `autonomous` | - | - |
| driver_started | `autonomous` | - | - |
| delivery_completed | `autonomous` | - | - |
| order_cancelled | `supervised` | - | - |
| dispatch_rejected_no_driver | `supervised` | - | - |
| pod_missing | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Lifecycle Blueprint",
  "description": "End-to-end delivery order lifecycle management from creation through completion or cancellation. 18 fields. 7 outcomes. 5 error codes. rules: dispatch_requires_",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, delivery, order, logistics, dispatch"
}
</script>
