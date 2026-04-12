---
title: "Vehicle Fleet Registry Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Register and manage fleet vehicles, track availability, maintenance status, and telematics data. 19 fields. 5 outcomes. 3 error codes. rules: unique_plate, deco"
---

# Vehicle Fleet Registry Blueprint

> Register and manage fleet vehicles, track availability, maintenance status, and telematics data

| | |
|---|---|
| **Feature** | `vehicle-fleet-registry` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, registry, telematics, maintenance, VIN |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-fleet-registry.blueprint.yaml) |
| **JSON API** | [vehicle-fleet-registry.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-fleet-registry.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Administrator managing vehicle records |
| `driver` | Driver | human | Driver operating a vehicle |
| `system` | System | system | Telematics integration and status automation |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `make` | text | Yes | Make |  |
| `model` | text | Yes | Model |  |
| `year` | number | Yes | Year |  |
| `trim` | text | No | Trim |  |
| `type` | select | No | Vehicle Type |  |
| `plate_number` | text | Yes | License Plate |  |
| `vin` | text | No | VIN |  |
| `vin_data` | json | No | VIN Decoded Data |  |
| `model_data` | json | No | Model Specifications |  |
| `photo_uuid` | text | No | Vehicle Photo |  |
| `location` | json | No | Current Location |  |
| `speed` | number | No | Current Speed |  |
| `heading` | number | No | Heading (degrees) |  |
| `altitude` | number | No | Altitude |  |
| `telematics` | json | No | Telematics Data |  |
| `meta` | json | No | Additional Metadata |  |
| `online` | boolean | No | Telematics Online |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `in_service` |  |  |
| `maintenance` |  |  |
| `decommissioned` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `in_service` | driver |  |
|  | `in_service` | `active` | system |  |
|  | `active` | `maintenance` | fleet_manager |  |
|  | `maintenance` | `active` | fleet_manager |  |
|  | `active` | `decommissioned` | fleet_manager |  |

## Rules

- **unique_plate:** A vehicle must have a unique plate number within the organization
- **decommissioned_no_dispatch:** Decommissioned vehicles cannot be assigned to orders
- **maintenance_no_dispatch:** Vehicles under maintenance cannot be dispatched
- **vin_decoding:** VIN decoding populates model specifications automatically when a VIN is provided
- **continuous_telematics:** Telematics data is updated continuously from connected tracking devices
- **position_audit:** Vehicle location history is stored as position records for audit trails
- **tenant_isolation:** A vehicle belongs to exactly one organization
- **type_determines_capacity:** Vehicle type classification determines load capacity and route suitability
- **photo_management:** Photo uploads must be processed and stored as managed file references
- **plate_change_audit:** Plate number changes require fleet manager authorization and audit logging

## Outcomes

### Vehicle_registered (Priority: 1)

**Given:**
- `make` (input) exists
- `model` (input) exists
- `plate_number` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `vehicle.registered`

**Result:** Vehicle registered in the fleet registry

### Duplicate_plate_rejected (Priority: 1) — Error: `VEHICLE_DUPLICATE_PLATE`

**Given:**
- plate_number already exists in organization

**Result:** Vehicle registration rejected due to duplicate plate number

### Vehicle_sent_to_maintenance (Priority: 2)

**Given:**
- `status` (db) eq `active`

**Then:**
- **set_field** target: `status` value: `maintenance`
- **emit_event** event: `vehicle.maintenance_started`

**Result:** Vehicle status set to maintenance and removed from dispatch pool

### Unavailable_for_dispatch (Priority: 2) — Error: `VEHICLE_UNAVAILABLE`

**Given:**
- `status` (db) in `maintenance,decommissioned`

**Result:** Vehicle cannot be assigned to an order

### Vehicle_cleared_from_maintenance (Priority: 3)

**Given:**
- `status` (db) eq `maintenance`

**Then:**
- **set_field** target: `status` value: `active`
- **emit_event** event: `vehicle.maintenance_cleared`

**Result:** Vehicle returned to active fleet after maintenance

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_DUPLICATE_PLATE` | 409 | A vehicle with this plate number already exists. | No |
| `VEHICLE_UNAVAILABLE` | 422 | This vehicle is not available for dispatch. | No |
| `VEHICLE_NOT_FOUND` | 404 | Vehicle not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.registered` | Fired when a new vehicle is added to the fleet | `vehicle_id`, `make`, `model`, `year`, `plate_number`, `type` |
| `vehicle.status_changed` | Fired when vehicle operational status changes | `vehicle_id`, `previous_status`, `new_status` |
| `vehicle.maintenance_started` | Fired when a vehicle enters maintenance | `vehicle_id`, `make`, `model` |
| `vehicle.maintenance_cleared` | Fired when a vehicle is cleared from maintenance | `vehicle_id` |
| `vehicle.location_updated` | Fired on GPS location updates from telematics | `vehicle_id`, `location`, `speed`, `heading`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dispatch-driver-assignment | required | Vehicles must be registered to be dispatched |
| vehicle-checkout | recommended | Check-in/out workflow manages vehicle allocation |
| realtime-driver-tracking | recommended | Vehicle telemetry feeds real-time tracking |
| field-incident-reporting | optional | Incidents are reported against specific vehicles |

## AGI Readiness

### Goals

#### Reliable Vehicle Fleet Registry

Register and manage fleet vehicles, track availability, maintenance status, and telematics data

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| vehicle_registered | `autonomous` | - | - |
| vehicle_sent_to_maintenance | `autonomous` | - | - |
| vehicle_cleared_from_maintenance | `autonomous` | - | - |
| duplicate_plate_rejected | `supervised` | - | - |
| unavailable_for_dispatch | `autonomous` | - | - |

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
  "name": "Vehicle Fleet Registry Blueprint",
  "description": "Register and manage fleet vehicles, track availability, maintenance status, and telematics data. 19 fields. 5 outcomes. 3 error codes. rules: unique_plate, deco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, registry, telematics, maintenance, VIN"
}
</script>
