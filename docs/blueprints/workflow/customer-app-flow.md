---
title: "Customer App Flow Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Customer (rider)-facing flow for requesting, tracking, and canceling rides through the public API.. 9 fields. 5 outcomes. 3 error codes. rules: rule_01, rule_02"
---

# Customer App Flow Blueprint

> Customer (rider)-facing flow for requesting, tracking, and canceling rides through the public API.

| | |
|---|---|
| **Feature** | `customer-app-flow` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | customer, rider, booking, tracking, cancellation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/customer-app-flow.blueprint.yaml) |
| **JSON API** | [customer-app-flow.json]({{ site.baseurl }}/api/blueprints/workflow/customer-app-flow.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | End user requesting and tracking a ride. |
| `platform` | Platform | system | API server processing customer requests and surfacing status updates. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pickup_location` | json | Yes | Pickup address and coordinates (latitude, longitude, address string). |  |
| `dropoff_location` | json | Yes | Drop-off address and coordinates. |  |
| `scheduled_at` | datetime | No | Optional future pickup time for scheduled rides (omit for immediate). |  |
| `notes` | text | No | Customer instructions or special requests for the driver. |  |
| `order_id` | text | No | Public order identifier returned after booking (used for tracking and cancellation). |  |
| `tracking_number` | text | No | Customer-facing alphanumeric tracking reference. |  |
| `status` | select | No | Current ride status visible to the customer. |  |
| `driver_location` | json | No | Current driver coordinates for live map display (lat, lng, heading). |  |
| `eta_seconds` | number | No | Estimated time until driver arrives at pickup, in seconds. |  |

## Rules

- **rule_01:** A customer must have a valid account (authenticated session or API key) to create an order.
- **rule_02:** Pickup and drop-off locations are required; a return location is optional.
- **rule_03:** On order creation, a preliminary distance and time estimate is calculated and stored.
- **rule_04:** A tracking number is issued at creation and can be used to poll order status without authentication.
- **rule_05:** Customers can cancel an order at any time before it reaches in_progress status.
- **rule_06:** After in_progress, cancellation is subject to platform policy (not enforced here).
- **rule_07:** The customer receives real-time status updates via their subscribed channel or by polling the order endpoint.
- **rule_08:** Driver location (for live map) is surfaced only once an order is dispatched.

## Outcomes

### Ride_requested (Priority: 1)

**Given:**
- customer provides valid pickup and drop-off locations
- customer is authenticated

**Then:**
- **create_record** — Order is persisted with status created and customer reference.
- **emit_event** event: `order.created`

**Result:** Customer receives an order_id and tracking_number to follow their ride.

### Ride_tracked (Priority: 2)

**Given:**
- customer queries the order by order_id or tracking_number

**Then:**
- **set_field** target: `response` — Current status, driver location, ETA, and activity history are returned.

**Result:** Customer sees live ride status and driver position on the map.

### Ride_canceled_by_customer (Priority: 3)

**Given:**
- customer requests cancellation
- order status is not completed

**Then:**
- **transition_state** field: `status` from: `any` to: `canceled`
- **emit_event** event: `order.canceled`

**Result:** Ride is terminated; customer is notified.

### Scheduled_ride_created (Priority: 4)

**Given:**
- customer provides a scheduled_at timestamp in the future

**Then:**
- **create_record** — Order is persisted with status created and scheduled_at set; dispatch is deferred until near the scheduled time.

**Result:** Ride is booked for the future; customer receives confirmation.

### Ride_completed_confirmation (Priority: 5)

**Given:**
- order status transitions to completed

**Then:**
- **emit_event** event: `order.completed`

**Result:** Customer receives completion confirmation and trip summary.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_NOT_FOUND` | 404 | The specified ride could not be found. | No |
| `ORDER_CANCELED` | 400 | This ride has been canceled. | No |
| `INVALID_LOCATION` | 400 | Pickup or drop-off location is invalid or missing. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.created` | Ride request is created by the customer. | `order_id`, `customer_id`, `pickup_location`, `dropoff_location`, `tracking_number` |
| `order.canceled` | Ride is canceled. | `order_id`, `canceled_by`, `reason` |
| `order.completed` | Ride is completed. | `order_id`, `customer_id`, `distance`, `duration` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Customer app creates the initial order that enters the lifecycle. |
| driver-location-streaming | recommended | Customer app subscribes to driver location for live map. |
| eta-calculation | recommended | ETA to pickup is shown in the customer app. |
| trip-history | recommended | Customer can view past rides. |
| fleet-ops-public-api | required | Customer app communicates via the public REST API. |

## AGI Readiness

### Goals

#### Reliable Customer App Flow

Customer (rider)-facing flow for requesting, tracking, and canceling rides through the public API.

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
| `fleet_ops_public_api` | fleet-ops-public-api | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| ride_requested | `autonomous` | - | - |
| ride_tracked | `autonomous` | - | - |
| ride_canceled_by_customer | `supervised` | - | - |
| scheduled_ride_created | `supervised` | - | - |
| ride_completed_confirmation | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 4
  entry_points:
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Models/Order.php
    - src/routes.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Customer App Flow Blueprint",
  "description": "Customer (rider)-facing flow for requesting, tracking, and canceling rides through the public API.. 9 fields. 5 outcomes. 3 error codes. rules: rule_01, rule_02",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "customer, rider, booking, tracking, cancellation"
}
</script>
