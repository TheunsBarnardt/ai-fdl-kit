---
title: "Dispatch Driver Assignment Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Assign drivers and vehicles to orders, manage dispatch queue, and handle driver acceptance or rejection. 9 fields. 6 outcomes. 4 error codes. rules: driver_must"
---

# Dispatch Driver Assignment Blueprint

> Assign drivers and vehicles to orders, manage dispatch queue, and handle driver acceptance or rejection

| | |
|---|---|
| **Feature** | `dispatch-driver-assignment` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, dispatch, driver, vehicle, assignment |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/dispatch-driver-assignment.blueprint.yaml) |
| **JSON API** | [dispatch-driver-assignment.json]({{ site.baseurl }}/api/blueprints/workflow/dispatch-driver-assignment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Operations staff managing the dispatch queue |
| `driver` | Driver | human | Driver receiving the dispatch |
| `system` | System | system | Automated assignment and optimization engine |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_uuid` | text | Yes | Order |  |
| `driver_uuid` | text | Yes | Assigned Driver |  |
| `vehicle_uuid` | text | Yes | Assigned Vehicle |  |
| `dispatched_at` | datetime | No | Dispatched At |  |
| `dispatch_method` | select | No | Dispatch Method |  |
| `driver_response` | select | No | Driver Response |  |
| `driver_response_at` | datetime | No | Driver Response Time |  |
| `notes` | text | No | Dispatcher Notes |  |
| `status` | select | Yes | Status |  |

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
|  | `pending_assignment` | `assigned` | system |  |
|  | `assigned` | `dispatched` | dispatcher |  |
|  | `dispatched` | `accepted` | driver |  |
|  | `dispatched` | `rejected` | driver |  |
|  | `rejected` | `reassigned` | dispatcher |  |

## Rules

- **driver_must_be_available:** A driver must have status 'available' (online and not on an active order) to be assigned
- **vehicle_must_be_operational:** A vehicle must be assigned and operational to be dispatched
- **same_organization:** Driver and vehicle must belong to the same organization
- **suggest_nearest_driver:** System should suggest the nearest available driver based on current GPS position
- **rejection_returns_to_queue:** If a driver rejects a dispatch, the order returns to the queue for reassignment
- **immediate_push_notification:** Dispatch notifications must be sent to the driver's mobile device immediately
- **one_active_order_per_driver:** A driver can only be assigned to one active order at a time
- **timestamp_responses:** Driver acceptance or rejection must be timestamped for SLA tracking
- **dispatcher_override:** Dispatcher can override system suggestions and manually select any available driver
- **adhoc_radius:** Ad-hoc orders can be dispatched to the nearest driver within a configurable radius

## Outcomes

### Manual_assignment_success (Priority: 1)

**Given:**
- `driver_uuid` (input) exists
- `vehicle_uuid` (input) exists
- driver status is available

**Then:**
- **set_field** target: `driver_assigned_uuid` value: `driver_uuid`
- **set_field** target: `dispatched_at` value: `now`
- **emit_event** event: `dispatch.assigned`

**Result:** Order assigned and dispatched to selected driver

### No_available_drivers (Priority: 1) — Error: `DISPATCH_NO_AVAILABLE_DRIVERS`

**Given:**
- no drivers are online and available within range

**Result:** Dispatch failed — no available drivers found

### Auto_assignment_success (Priority: 2)

**Given:**
- dispatch_method is auto
- available drivers exist within configured radius

**Then:**
- **set_field** target: `driver_assigned_uuid` value: `nearest_available_driver`
- **emit_event** event: `dispatch.auto_assigned`

**Result:** Nearest available driver automatically assigned

### Driver_unavailable (Priority: 2) — Error: `DISPATCH_DRIVER_UNAVAILABLE`

**Given:**
- `driver_uuid` (db) neq `available`

**Result:** Dispatch rejected — driver is not available

### Driver_accepted (Priority: 3)

**Given:**
- `driver_response` (input) eq `accepted`

**Then:**
- **set_field** target: `status` value: `accepted`
- **set_field** target: `driver_response_at` value: `now`
- **emit_event** event: `dispatch.accepted`

**Result:** Driver accepted the dispatch and is en route

### Driver_rejected (Priority: 4) — Error: `DISPATCH_DRIVER_REJECTED`

**Given:**
- `driver_response` (input) eq `rejected`

**Then:**
- **set_field** target: `status` value: `rejected`
- **set_field** target: `driver_response_at` value: `now`
- **emit_event** event: `dispatch.rejected`

**Result:** Driver rejected; order returned to dispatch queue

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISPATCH_DRIVER_UNAVAILABLE` | 422 | The selected driver is not currently available. | No |
| `DISPATCH_VEHICLE_UNAVAILABLE` | 422 | The selected vehicle is not available for dispatch. | No |
| `DISPATCH_NO_AVAILABLE_DRIVERS` | 422 | No available drivers found in the area. | No |
| `DISPATCH_DRIVER_REJECTED` | 422 | The driver declined this order. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `dispatch.assigned` | Fired when a driver is manually assigned to an order | `order_uuid`, `driver_uuid`, `vehicle_uuid`, `dispatched_at` |
| `dispatch.auto_assigned` | Fired when the system auto-assigns a driver | `order_uuid`, `driver_uuid`, `vehicle_uuid` |
| `dispatch.accepted` | Fired when driver accepts the dispatch | `order_uuid`, `driver_uuid`, `driver_response_at` |
| `dispatch.rejected` | Fired when driver rejects the dispatch | `order_uuid`, `driver_uuid`, `driver_response_at` |
| `dispatch.reassigned` | Fired when order is reassigned to a different driver | `order_uuid`, `new_driver_uuid`, `previous_driver_uuid` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Dispatch is a key step in order lifecycle |
| driver-profile | required | Driver availability and status comes from driver profile |
| vehicle-fleet-registry | required | Vehicle availability comes from fleet registry |
| realtime-driver-tracking | recommended | Driver location used for nearest-driver auto-assignment |

## AGI Readiness

### Goals

#### Reliable Dispatch Driver Assignment

Assign drivers and vehicles to orders, manage dispatch queue, and handle driver acceptance or rejection

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
| `order_lifecycle` | order-lifecycle | degrade |
| `driver_profile` | driver-profile | degrade |
| `vehicle_fleet_registry` | vehicle-fleet-registry | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| manual_assignment_success | `autonomous` | - | - |
| auto_assignment_success | `autonomous` | - | - |
| driver_accepted | `autonomous` | - | - |
| driver_rejected | `supervised` | - | - |
| no_available_drivers | `autonomous` | - | - |
| driver_unavailable | `autonomous` | - | - |

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
  "name": "Dispatch Driver Assignment Blueprint",
  "description": "Assign drivers and vehicles to orders, manage dispatch queue, and handle driver acceptance or rejection. 9 fields. 6 outcomes. 4 error codes. rules: driver_must",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, dispatch, driver, vehicle, assignment"
}
</script>
