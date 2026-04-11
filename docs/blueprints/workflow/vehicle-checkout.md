---
title: "Vehicle Checkout Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Manage vehicle check-out and check-in workflows including condition verification, mileage tracking, and responsibility handoff. 15 fields. 5 outcomes. 3 error c"
---

# Vehicle Checkout Blueprint

> Manage vehicle check-out and check-in workflows including condition verification, mileage tracking, and responsibility handoff

| | |
|---|---|
| **Feature** | `vehicle-checkout` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, checkout, checkin, handoff, mileage, inspection |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-checkout.blueprint.yaml) |
| **JSON API** | [vehicle-checkout.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-checkout.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Driver checking out and returning a vehicle |
| `fleet_manager` | Fleet Manager | human | Fleet manager approving checkouts and reviewing returns |
| `system` | System | system | Automated availability tracking and audit |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `checkout_id` | text | Yes | Checkout ID |  |
| `vehicle_uuid` | text | Yes | Vehicle |  |
| `driver_uuid` | text | Yes | Driver |  |
| `order_uuid` | text | No | Order Context |  |
| `checkout_at` | datetime | No | Checkout Time |  |
| `checkin_at` | datetime | No | Return Time |  |
| `odometer_at_checkout` | number | No | Odometer at Checkout |  |
| `odometer_at_checkin` | number | No | Odometer at Return |  |
| `distance_traveled` | number | No | Distance Traveled |  |
| `fuel_level_at_checkout` | number | No | Fuel Level at Checkout (%) |  |
| `fuel_level_at_checkin` | number | No | Fuel Level at Return (%) |  |
| `condition_at_checkout` | select | No | Condition at Checkout |  |
| `condition_at_checkin` | select | No | Condition at Return |  |
| `notes` | rich_text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `checked_out` |  |  |
| `in_use` |  |  |
| `returned` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `checked_out` | fleet_manager |  |
|  | `checked_out` | `in_use` | driver |  |
|  | `in_use` | `returned` | driver |  |
|  | `pending` | `cancelled` | fleet_manager |  |

## Rules

- **no_double_checkout:** A vehicle cannot be checked out if it is already checked out to another driver
- **maintenance_not_available:** Vehicles under maintenance are not available for checkout
- **odometer_monotonic:** Odometer readings at check-in must be equal to or greater than readings at checkout
- **pre_inspection:** Pre-checkout inspection captures vehicle condition and fuel level as baseline
- **post_inspection:** Post-return inspection is compared to baseline to identify damage or fuel usage
- **distance_calculation:** Distance traveled is calculated as odometer_at_checkin minus odometer_at_checkout
- **duration_tracking:** Checkout duration is tracked for hours-of-service compliance
- **overdue_notifications:** Fleet managers receive notifications when a vehicle is overdue for return
- **damage_triggers_incident:** Any damage noted at check-in not present at checkout triggers an incident report
- **history_retention:** Checkout history is retained for audit, maintenance scheduling, and billing

## Outcomes

### Checkout_requested (Priority: 1)

**Given:**
- `vehicle_uuid` (input) exists
- `driver_uuid` (input) exists
- vehicle status is active and not currently checked out

**Then:**
- **create_record**
- **emit_event** event: `vehicle_checkout.requested`

**Result:** Checkout request submitted for fleet manager approval

### Vehicle_already_checked_out (Priority: 1) — Error: `CHECKOUT_VEHICLE_UNAVAILABLE`

**Given:**
- vehicle is currently checked out

**Result:** Checkout denied — vehicle is already in use

### Checkout_approved (Priority: 2)

**Given:**
- `status` (db) eq `pending`

**Then:**
- **set_field** target: `status` value: `checked_out`
- **set_field** target: `checkout_at` value: `now`
- **emit_event** event: `vehicle_checkout.approved`

**Result:** Vehicle checked out; driver has custody

### Invalid_odometer (Priority: 2) — Error: `CHECKOUT_INVALID_ODOMETER`

**Given:**
- odometer_at_checkin is less than odometer_at_checkout

**Result:** Check-in rejected — odometer reading cannot decrease

### Vehicle_returned (Priority: 3)

**Given:**
- `status` (db) eq `in_use`
- `odometer_at_checkin` (input) gte `0`

**Then:**
- **set_field** target: `status` value: `returned`
- **set_field** target: `checkin_at` value: `now`
- **emit_event** event: `vehicle_checkout.returned`

**Result:** Vehicle returned; distance and condition logged

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHECKOUT_VEHICLE_UNAVAILABLE` | 409 | This vehicle is currently checked out to another driver. | No |
| `CHECKOUT_INVALID_ODOMETER` | 422 | Return odometer reading must be greater than or equal to checkout reading. | No |
| `CHECKOUT_NOT_FOUND` | 404 | Checkout record not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle_checkout.requested` | Fired when a driver requests to check out a vehicle | `checkout_id`, `vehicle_uuid`, `driver_uuid` |
| `vehicle_checkout.approved` | Fired when checkout is approved by fleet manager | `checkout_id`, `vehicle_uuid`, `driver_uuid`, `checkout_at` |
| `vehicle_checkout.returned` | Fired when vehicle is returned after use | `checkout_id`, `vehicle_uuid`, `driver_uuid`, `distance_traveled`, `checkin_at` |
| `vehicle_checkout.overdue` | Fired when vehicle has not been returned by expected return time | `checkout_id`, `vehicle_uuid`, `driver_uuid` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-fleet-registry | required | Vehicle availability is managed in the fleet registry |
| driver-profile | required | Driver is responsible for vehicle during checkout |
| field-incident-reporting | recommended | Damage found at check-in can trigger an incident report |
| order-lifecycle | optional | Checkout can be linked to a specific delivery order |

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
  "name": "Vehicle Checkout Blueprint",
  "description": "Manage vehicle check-out and check-in workflows including condition verification, mileage tracking, and responsibility handoff. 15 fields. 5 outcomes. 3 error c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, checkout, checkin, handoff, mileage, inspection"
}
</script>
