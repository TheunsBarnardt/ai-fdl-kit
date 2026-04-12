---
title: "Fleet Vehicle Registry Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Registry of fleets and vehicles within an organization, including fleet grouping, vehicle assignment to drivers, and vehicle type management.. 16 fields. 5 outc"
---

# Fleet Vehicle Registry Blueprint

> Registry of fleets and vehicles within an organization, including fleet grouping, vehicle assignment to drivers, and vehicle type management.

| | |
|---|---|
| **Feature** | `fleet-vehicle-registry` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, registry, asset-management, driver-vehicle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/fleet-vehicle-registry.blueprint.yaml) |
| **JSON API** | [fleet-vehicle-registry.json]({{ site.baseurl }}/api/blueprints/asset/fleet-vehicle-registry.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `operator` | Fleet Operator | human | Creates and manages fleet groups and vehicle records. |
| `dispatcher` | Dispatcher | human | Assigns vehicles to drivers and manages fleet composition. |
| `platform` | Platform | system | Enforces vehicle assignment exclusivity and fleet membership rules. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | No | Public identifier of the vehicle. |  |
| `year` | number | No | Manufacturing year of the vehicle. |  |
| `make` | text | Yes | Vehicle manufacturer (e.g., Toyota, Ford). |  |
| `model` | text | Yes | Vehicle model name. |  |
| `trim` | text | No | Trim level or variant of the vehicle. |  |
| `plate_number` | text | No | License plate number. |  |
| `vin` | text | No | Vehicle Identification Number. |  |
| `vehicle_type` | text | No | Classification of the vehicle (e.g., sedan, SUV, truck, motorcycle). |  |
| `status` | select | No | Current availability status of the vehicle. |  |
| `fleet_id` | text | No | Reference to the fleet this vehicle belongs to. |  |
| `driver_id` | text | No | Reference to the driver currently assigned to this vehicle. |  |
| `fleet_name` | text | Yes | Name of the fleet group. |  |
| `fleet_task` | text | No | Primary operational task of the fleet (e.g., pickup, delivery, shuttle). |  |
| `fleet_color` | text | No | Color code used to visually distinguish this fleet on maps. |  |
| `service_area_id` | text | No | Service area this fleet operates within. |  |
| `zone_id` | text | No | Zone within the service area assigned to this fleet. |  |

## Rules

- **rule_01:** A vehicle can only be actively assigned to one driver at a time; assigning it to a new driver automatically unassigns it from any previous driver.
- **rule_02:** A fleet can have multiple drivers and multiple vehicles as members.
- **rule_03:** Vehicles and drivers are linked to fleets via membership records (fleet_drivers, fleet_vehicles).
- **rule_04:** Fleet groups can be scoped to a specific service area or zone for operational routing.
- **rule_05:** All fleet and vehicle records are scoped to the organization (company).
- **rule_06:** Vehicle records support rich metadata including VIN data and telematics integration fields.
- **rule_07:** Drivers and vehicles are linked independently; a driver may be in a fleet without a vehicle assigned.

## Outcomes

### Vehicle_registered (Priority: 1)

**Given:**
- operator provides make, model, and optionally plate number and VIN

**Then:**
- **create_record** — Vehicle record is persisted under the organization.

**Result:** Vehicle is available for assignment to drivers and fleets.

### Vehicle_assigned_to_driver (Priority: 2)

**Given:**
- dispatcher links a vehicle to a driver
- vehicle is active

**Then:**
- **set_field** target: `driver.vehicle_id` — Driver record references the vehicle.
- **set_field** target: `prior_driver.vehicle_id` value: `null` — Any previously assigned driver is automatically unlinked from the vehicle.

**Result:** Driver is assigned to the vehicle exclusively.

### Fleet_created (Priority: 3)

**Given:**
- operator provides a fleet name

**Then:**
- **create_record** — Fleet group is created, optionally scoped to a service area or zone.

**Result:** Fleet can be populated with drivers and vehicles.

### Driver_added_to_fleet (Priority: 4)

**Given:**
- dispatcher adds a driver to a fleet

**Then:**
- **create_record** — Membership record links driver to fleet.

**Result:** Driver is a member of the fleet and subject to fleet-level operations.

### Vehicle_added_to_fleet (Priority: 5)

**Given:**
- dispatcher adds a vehicle to a fleet

**Then:**
- **create_record** — Membership record links vehicle to fleet.

**Result:** Vehicle is tracked within the fleet's asset inventory.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_NOT_FOUND` | 404 | The specified vehicle could not be found. | No |
| `FLEET_NOT_FOUND` | 404 | The specified fleet could not be found. | No |
| `VEHICLE_ALREADY_ASSIGNED` | 400 | This vehicle is already assigned to another driver. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fleet.vehicle_assigned` | Vehicle is assigned to a driver within the fleet. | `fleet_id`, `vehicle_id`, `driver_id` |
| `fleet.driver_added` | Driver is added to a fleet. | `fleet_id`, `driver_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-assignment-dispatch | recommended | Vehicle assignment is validated as part of driver dispatch readiness. |
| service-zones | optional | Fleets can be scoped to a service area or zone. |
| driver-shift-management | optional | Shift management determines which fleet members are active. |

## AGI Readiness

### Goals

#### Reliable Fleet Vehicle Registry

Registry of fleets and vehicles within an organization, including fleet grouping, vehicle assignment to drivers, and vehicle type management.

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| vehicle_registered | `autonomous` | - | - |
| vehicle_assigned_to_driver | `autonomous` | - | - |
| fleet_created | `supervised` | - | - |
| driver_added_to_fleet | `autonomous` | - | - |
| vehicle_added_to_fleet | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Models/Fleet.php
    - src/Models/Vehicle.php
    - src/Models/FleetDriver.php
    - src/Models/FleetVehicle.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Vehicle Registry Blueprint",
  "description": "Registry of fleets and vehicles within an organization, including fleet grouping, vehicle assignment to drivers, and vehicle type management.. 16 fields. 5 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, registry, asset-management, driver-vehicle"
}
</script>
