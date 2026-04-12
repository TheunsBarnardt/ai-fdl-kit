---
title: "Fuel Log Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Record fuel fill-up events for fleet vehicles capturing date, odometer, quantity, cost, and station details; each entry updates the vehicle's last known odomete"
---

# Fuel Log Blueprint

> Record fuel fill-up events for fleet vehicles capturing date, odometer, quantity, cost, and station details; each entry updates the vehicle's last known odometer.

| | |
|---|---|
| **Feature** | `fuel-log` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, fuel, odometer, cost, log |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/fuel-log.blueprint.yaml) |
| **JSON API** | [fuel-log.json]({{ site.baseurl }}/api/blueprints/workflow/fuel-log.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Records the fuel fill-up at the pump |
| `fleet_manager` | Fleet Manager | human | Reviews and approves fuel entries; investigates anomalies |
| `system` | System | system | Validates odometer progression and computes derived metrics |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `fuel_date` | datetime | Yes | Fuel Date |  |
| `odometer_reading` | number | Yes | Odometer Reading (km) |  |
| `fuel_type` | select | Yes | Fuel Type |  |
| `fuel_quantity` | number | Yes | Quantity |  |
| `unit_of_measure` | text | Yes | Unit of Measure |  |
| `cost_per_unit` | number | No | Cost per Unit |  |
| `total_cost` | number | No | Total Cost |  |
| `fuel_station` | text | No | Fuel Station / Supplier |  |
| `payment_method` | select | No | Payment Method |  |
| `receipt_reference` | text | No | Receipt / Invoice Reference |  |
| `filled_by` | text | No | Filled By |  |
| `notes` | text | No | Notes |  |
| `distance_since_last` | number | No | Distance Since Last Fill-up (km) |  |
| `efficiency` | number | No | Fuel Efficiency (units/100km) |  |

## Rules

- **odometer_monotonic:**
  - **description:** Odometer reading must be greater than or equal to the vehicle's last recorded odometer value
- **quantity_positive:**
  - **description:** Fuel quantity must be a positive number
- **total_cost_calculation:**
  - **description:** Total cost is auto-calculated as quantity × cost_per_unit if not manually provided; manual entry takes precedence
- **fuel_type_match:**
  - **description:** Fuel type on the log entry should match the vehicle's configured fuel type; a mismatch triggers a warning
- **tank_capacity_check:**
  - **description:** A single entry cannot record more fuel than the vehicle's tank capacity if tank capacity is configured
- **date_not_future:**
  - **description:** Fuel date cannot be in the future
- **distance_computation:**
  - **description:** Distance since last fill-up is computed as current odometer minus previous odometer
- **efficiency_computation:**
  - **description:** Fuel efficiency is computed as (fuel_quantity / distance_since_last) × 100 if distance > 0

## Outcomes

### Odometer_rollback_rejected (Priority: 1) — Error: `FUEL_ODOMETER_ROLLBACK`

**Given:**
- `odometer_reading` (input) lt `last_odometer`

**Result:** Entry is rejected; user is prompted to verify the odometer reading

### Fuel_type_mismatch_warning (Priority: 2)

**Given:**
- fuel_type on entry does not match the vehicle's configured fuel type

**Then:**
- **emit_event** event: `fuel.type_mismatch_detected`

**Result:** Warning is shown to the user; entry can still be saved after confirmation

### Full_tank_exceeded_warning (Priority: 3)

**Given:**
- vehicle has a configured tank capacity
- `fuel_quantity` (input) gt `tank_capacity`

**Then:**
- **emit_event** event: `fuel.quantity_anomaly`

**Result:** Warning is raised; entry is held for fleet manager review

### Fuel_entry_recorded (Priority: 10)

**Given:**
- vehicle exists in the fleet
- fuel_date is not in the future
- `odometer_reading` (input) gte `last_odometer`
- `fuel_quantity` (input) gt `0`

**Then:**
- **set_field** target: `distance_since_last` — Compute odometer_reading minus previous odometer
- **set_field** target: `efficiency` — Compute fuel_quantity / distance_since_last × 100 if distance > 0
- **set_field** target: `total_cost` — Set to quantity × cost_per_unit if not manually provided
- **set_field** target: `vehicle.last_odometer` value: `odometer_reading`
- **emit_event** event: `fuel.entry_recorded`

**Result:** Fuel entry is saved, vehicle's last odometer is updated, and efficiency is computed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FUEL_ODOMETER_ROLLBACK` | 400 | Odometer reading cannot be less than the previous recorded reading. | No |
| `FUEL_INVALID_QUANTITY` | 400 | Fuel quantity must be greater than zero. | No |
| `FUEL_FUTURE_DATE` | 400 | Fuel date cannot be in the future. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fuel.entry_recorded` | A fuel fill-up event has been logged for a vehicle | `vehicle`, `fuel_date`, `odometer_reading`, `fuel_quantity`, `total_cost`, `efficiency` |
| `fuel.type_mismatch_detected` | The fuel type entered does not match the vehicle's configured fuel type | `vehicle`, `expected_fuel_type`, `entered_fuel_type` |
| `fuel.quantity_anomaly` | Fuel quantity entered exceeds the vehicle's configured tank capacity | `vehicle`, `fuel_quantity`, `tank_capacity` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master provides last odometer, fuel type, and tank capacity |
| odometer-tracking | recommended | Each fuel log odometer reading is also stored in the dedicated odometer history |
| fuel-analytics | recommended | Fuel log entries are the source data for efficiency and cost analytics |
| vehicle-expense-tracking | recommended | Fuel costs from this log roll up into per-vehicle expense reporting |

## AGI Readiness

### Goals

#### Reliable Fuel Log

Record fuel fill-up events for fleet vehicles capturing date, odometer, quantity, cost, and station details; each entry updates the vehicle's last known odometer.

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
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| fuel_entry_recorded | `autonomous` | - | - |
| odometer_rollback_rejected | `supervised` | - | - |
| fuel_type_mismatch_warning | `autonomous` | - | - |
| full_tank_exceeded_warning | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 2
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fuel Log Blueprint",
  "description": "Record fuel fill-up events for fleet vehicles capturing date, odometer, quantity, cost, and station details; each entry updates the vehicle's last known odomete",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, fuel, odometer, cost, log"
}
</script>
