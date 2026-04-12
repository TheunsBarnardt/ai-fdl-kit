---
title: "Vehicle Master Data Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.. 20 fi"
---

# Vehicle Master Data Blueprint

> Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.

| | |
|---|---|
| **Feature** | `vehicle-master-data` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, master-data, specifications, vin |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-master-data.blueprint.yaml) |
| **JSON API** | [vehicle-master-data.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-master-data.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Creates and maintains vehicle specification records |
| `system` | System | system | Auto-populates computed fields and validates uniqueness |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `license_plate` | text | Yes | License Plate |  |
| `make` | text | Yes | Make |  |
| `manufacturer` | text | No | Manufacturer |  |
| `model` | text | Yes | Model |  |
| `year` | number | No | Year of Manufacture |  |
| `vin` | text | No | VIN (Chassis Number) |  |
| `fuel_type` | select | Yes | Fuel Type |  |
| `fuel_uom` | text | Yes | Fuel Unit of Measure |  |
| `color` | text | No | Color |  |
| `doors` | number | No | Number of Doors |  |
| `wheels` | number | No | Number of Wheels |  |
| `seating_capacity` | number | No | Seating Capacity |  |
| `gross_vehicle_weight` | number | No | Gross Vehicle Weight (kg) |  |
| `acquisition_date` | date | No | Acquisition Date |  |
| `acquisition_cost` | number | No | Acquisition Cost |  |
| `last_odometer` | number | No | Last Known Odometer (km) |  |
| `current_location` | text | No | Current Location |  |
| `assigned_driver` | text | No | Assigned Driver |  |
| `fleet_category` | select | No | Fleet Category |  |
| `carbon_check_date` | date | No | Last Emissions Test Date |  |

## Rules

- **unique_license_plate:**
  - **description:** License plate must be unique across all vehicles
- **unique_vin:**
  - **description:** VIN must be unique if provided; standard VINs are 17 alphanumeric characters
- **year_not_future:**
  - **description:** Year of manufacture must not be in the future
- **acquisition_date_not_future:**
  - **description:** Acquisition date must not be in the future
- **odometer_non_negative:**
  - **description:** Last odometer value must be a non-negative integer
- **carbon_check_not_future:**
  - **description:** Carbon check date must not be a future date
- **fuel_fields_required:**
  - **description:** Fuel type and fuel unit of measure are required for accurate fuel efficiency calculations
- **acquisition_cost_positive:**
  - **description:** Acquisition cost must be positive if provided — it is the base value for depreciation

## Outcomes

### Duplicate_vin_rejected (Priority: 1) — Error: `VEHICLE_DUPLICATE_VIN`

**Given:**
- VIN is provided
- another vehicle record already uses the same VIN

**Result:** Record creation is blocked and the user is notified of the duplicate VIN

### Invalid_year_rejected (Priority: 2) — Error: `VEHICLE_INVALID_YEAR`

**Given:**
- year of manufacture is provided
- `year` (input) gt `current_year`

**Result:** Validation fails and the user is prompted to correct the year

### Odometer_updated (Priority: 8)

**Given:**
- new odometer value is provided
- `new_odometer` (input) gte `last_odometer`

**Then:**
- **set_field** target: `last_odometer` value: `new_odometer`
- **emit_event** event: `vehicle.odometer_updated`

**Result:** Last known odometer is updated on the vehicle record

### Vehicle_record_updated (Priority: 9)

**Given:**
- vehicle record exists
- changed fields pass all validation rules

**Then:**
- **emit_event** event: `vehicle.master_record_updated`

**Result:** Vehicle specification is updated and the change is auditable

### Vehicle_record_created (Priority: 10)

**Given:**
- license plate is unique
- make, model, and fuel type are provided
- year is not in the future if provided
- VIN is unique if provided

**Then:**
- **set_field** target: `last_odometer` value: `0`
- **emit_event** event: `vehicle.master_record_created`

**Result:** Vehicle specification record is saved and available for fleet operations

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_DUPLICATE_VIN` | 409 | A vehicle with this VIN already exists in the system. | No |
| `VEHICLE_INVALID_YEAR` | 400 | Year of manufacture cannot be in the future. | No |
| `VEHICLE_DUPLICATE_PLATE` | 409 | A vehicle with this license plate already exists. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.master_record_created` | A new vehicle specification record has been added to the fleet | `license_plate`, `make`, `model`, `year`, `vin`, `fuel_type` |
| `vehicle.master_record_updated` | One or more specification fields on a vehicle record were changed | `license_plate`, `changed_fields` |
| `vehicle.odometer_updated` | The last known odometer reading on the vehicle record was updated | `license_plate`, `previous_odometer`, `new_odometer` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-registration | required | Legal registration details complement the physical specification record |
| odometer-tracking | recommended | Detailed odometer history is maintained in the dedicated tracking feature |
| fuel-log | recommended | Fuel entries update the last_odometer field on the master record |
| vehicle-depreciation | recommended | Acquisition cost and date from master data seed the depreciation calculation |

## AGI Readiness

### Goals

#### Reliable Vehicle Master Data

Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | convenience | asset tracking must maintain precise location and status records |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `vehicle_registration` | vehicle-registration | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| vehicle_record_created | `supervised` | - | - |
| duplicate_vin_rejected | `supervised` | - | - |
| invalid_year_rejected | `supervised` | - | - |
| vehicle_record_updated | `supervised` | - | - |
| odometer_updated | `supervised` | - | - |

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
  "name": "Vehicle Master Data Blueprint",
  "description": "Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment.. 20 fi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, master-data, specifications, vin"
}
</script>
