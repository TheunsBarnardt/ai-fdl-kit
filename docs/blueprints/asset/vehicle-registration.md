---
title: "Vehicle Registration Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Register a vehicle into the fleet with legal identification, assign ownership, and track registration status and renewal dates.. 10 fields. 5 outcomes. 3 error "
---

# Vehicle Registration Blueprint

> Register a vehicle into the fleet with legal identification, assign ownership, and track registration status and renewal dates.

| | |
|---|---|
| **Feature** | `vehicle-registration` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, registration, ownership, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-registration.blueprint.yaml) |
| **JSON API** | [vehicle-registration.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-registration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Registers, updates, and deregisters fleet vehicles |
| `finance_manager` | Finance Manager | human | Approves vehicle acquisition cost and disposal |
| `system` | System | system | Triggers renewal reminders and status transitions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `license_plate` | text | Yes | License Plate |  |
| `chassis_number` | text | No | Chassis Number (VIN) |  |
| `registration_number` | text | No | Registration Certificate Number |  |
| `registration_date` | date | Yes | Registration Date |  |
| `registration_expiry` | date | No | Registration Expiry Date |  |
| `registered_owner` | text | Yes | Registered Owner |  |
| `company` | text | No | Company |  |
| `acquisition_date` | date | No | Acquisition Date |  |
| `vehicle_value` | number | No | Declared Vehicle Value |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `active` |  |  |
| `expiring_soon` |  |  |
| `expired` |  |  |
| `transferred` |  |  |
| `decommissioned` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `active` | fleet_manager |  |
|  | `active` | `expiring_soon` | system |  |
|  | `expiring_soon` | `active` | fleet_manager |  |
|  | `expiring_soon` | `expired` | system |  |
|  | `expired` | `active` | fleet_manager |  |
|  | `active` | `transferred` | fleet_manager |  |
|  | `active` | `decommissioned` | fleet_manager |  |

## Rules

- **unique_license_plate:**
  - **description:** License plate must be unique across all registered vehicles in the system
- **unique_chassis_number:**
  - **description:** Chassis number must be unique if provided
- **expiry_after_registration:**
  - **description:** Registration expiry date must be after registration date
- **no_dispatch_when_expired:**
  - **description:** A vehicle cannot be dispatched while its registration is in Expired status
- **transfer_requires_authorisation:**
  - **description:** Ownership transfer requires sign-off by an authorised manager
- **registration_date_not_future:**
  - **description:** Registration date cannot be a future date

## Outcomes

### Duplicate_plate_rejected (Priority: 1) — Error: `VEHICLE_DUPLICATE_PLATE`

**Given:**
- a vehicle with the same license plate already exists

**Result:** Registration is rejected and the user is notified of the conflict

### Duplicate_chassis_rejected (Priority: 2) — Error: `VEHICLE_DUPLICATE_CHASSIS`

**Given:**
- chassis number is provided
- a vehicle with the same chassis number already exists

**Result:** Registration is rejected and the user is notified of the duplicate VIN

### Ownership_transferred (Priority: 7)

**Given:**
- new registered owner is provided
- transfer is authorised by a manager

**Then:**
- **set_field** target: `registered_owner` value: `new_owner`
- **set_field** target: `status` value: `transferred`
- **emit_event** event: `vehicle.ownership_transferred`

**Result:** Ownership record is updated and a transfer event is emitted

### Registration_renewed (Priority: 8)

**Given:**
- vehicle is in expiring_soon or expired status
- new registration expiry date is provided and is a future date

**Then:**
- **set_field** target: `registration_expiry` value: `new_expiry_date`
- **set_field** target: `status` value: `active`
- **emit_event** event: `vehicle.registration_renewed`

**Result:** Registration is renewed and vehicle returns to active status

### Vehicle_registered (Priority: 10)

**Given:**
- license plate is unique in the system
- required fields are populated
- registration date is not in the future

**Then:**
- **set_field** target: `status` value: `active`
- **emit_event** event: `vehicle.registered`

**Result:** Vehicle is added to the fleet registry with active status

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_DUPLICATE_PLATE` | 409 | A vehicle with this license plate is already registered. | No |
| `VEHICLE_DUPLICATE_CHASSIS` | 409 | A vehicle with this chassis number already exists in the system. | No |
| `VEHICLE_INVALID_DATE` | 400 | The registration date cannot be in the future. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.registered` | A new vehicle has been added to the fleet registry | `license_plate`, `chassis_number`, `registered_owner`, `registration_date` |
| `vehicle.registration_renewed` | Vehicle registration certificate has been renewed | `license_plate`, `registration_expiry` |
| `vehicle.ownership_transferred` | Vehicle ownership has changed | `license_plate`, `previous_owner`, `new_owner` |
| `vehicle.registration_expired` | Vehicle registration certificate has lapsed without renewal | `license_plate`, `registration_expiry` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master record contains the physical specifications tied to this registration |
| vehicle-renewal-reminders | recommended | Generates advance notifications before registration expiry |
| vehicle-insurance | recommended | Insurance policy is typically linked to a registered vehicle |
| vehicle-documents | recommended | Registration certificate and permit documents are stored against the vehicle record |

## AGI Readiness

### Goals

#### Reliable Vehicle Registration

Register a vehicle into the fleet with legal identification, assign ownership, and track registration status and renewal dates.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

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
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| vehicle_registered | `autonomous` | - | - |
| duplicate_plate_rejected | `supervised` | - | - |
| duplicate_chassis_rejected | `supervised` | - | - |
| registration_renewed | `autonomous` | - | - |
| ownership_transferred | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 3
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Registration Blueprint",
  "description": "Register a vehicle into the fleet with legal identification, assign ownership, and track registration status and renewal dates.. 10 fields. 5 outcomes. 3 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, registration, ownership, compliance"
}
</script>
