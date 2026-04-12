---
title: "Vehicle Maintenance Log Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Record completed maintenance and service events for a vehicle including work performed, parts consumed, labour cost, technician details, and the next scheduled "
---

# Vehicle Maintenance Log Blueprint

> Record completed maintenance and service events for a vehicle including work performed, parts consumed, labour cost, technician details, and the next scheduled service.

| | |
|---|---|
| **Feature** | `vehicle-maintenance-log` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, maintenance, service, history, log |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-maintenance-log.blueprint.yaml) |
| **JSON API** | [vehicle-maintenance-log.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-maintenance-log.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `technician` | Technician | human | Performs the service and records work completed and parts used |
| `fleet_manager` | Fleet Manager | human | Reviews service records, authorises cost, and schedules next service |
| `workshop` | Workshop / Service Provider | external | External service provider performing the maintenance work |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `service_date` | date | Yes | Service Date |  |
| `odometer_at_service` | number | No | Odometer at Service (km) |  |
| `service_type` | select | Yes | Service Type |  |
| `service_description` | text | Yes | Service Description |  |
| `actions_performed` | rich_text | No | Work Performed |  |
| `technician_name` | text | No | Technician / Assigned To |  |
| `workshop_name` | text | No | Workshop / Service Provider |  |
| `labour_cost` | number | No | Labour Cost |  |
| `parts_cost` | number | No | Parts Cost |  |
| `other_cost` | number | No | Other Costs |  |
| `total_cost` | number | No | Total Cost |  |
| `next_service_date` | date | No | Next Service Date |  |
| `next_service_odometer` | number | No | Next Service Odometer (km) |  |
| `completion_certificate` | file | No | Completion Certificate |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `in_progress` |  |  |
| `completed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `in_progress` | fleet_manager |  |
|  | `in_progress` | `completed` | technician |  |
|  | `draft` | `completed` | technician |  |
|  | `draft` | `cancelled` | fleet_manager |  |
|  | `in_progress` | `cancelled` | fleet_manager |  |

## Rules

- **date_not_future:**
  - **description:** Service date cannot be in the future
- **total_cost_calculation:**
  - **description:** Total cost is auto-calculated as labour_cost + parts_cost + other_cost
- **odometer_progression:**
  - **description:** Odometer at service must be >= vehicle's last recorded odometer reading
- **next_service_odometer_greater:**
  - **description:** If next_service_odometer is provided it must be greater than odometer_at_service
- **certificate_required_for_statutory:**
  - **description:** A completion certificate attachment is required for statutory service types
- **completed_records_readonly:**
  - **description:** Completed records are read-only and cannot be edited; a correction record must be created
- **cancellation_reason_required:**
  - **description:** Cancelled records must have a cancellation reason recorded

## Outcomes

### Invalid_odometer (Priority: 1) — Error: `MAINTENANCE_ODOMETER_INVALID`

**Given:**
- odometer_at_service is provided
- `odometer_at_service` (input) lt `last_odometer`

**Result:** Record cannot be saved until the odometer value is corrected

### Cost_recorded (Priority: 8)

**Given:**
- at least one of labour_cost, parts_cost, or other_cost is provided

**Then:**
- **emit_event** event: `maintenance.cost_incurred`

**Result:** Service cost is available for per-vehicle expense reporting

### Next_service_scheduled (Priority: 9)

**Given:**
- service_completed outcome has fired
- next_service_date or next_service_odometer is provided

**Then:**
- **emit_event** event: `maintenance.next_service_scheduled`

**Result:** A scheduled maintenance task is created or updated for the next service interval

### Service_completed (Priority: 10)

**Given:**
- vehicle exists in the fleet
- service_date is not in the future
- service_type and service_description are provided
- odometer_at_service is >= vehicle's last odometer if provided

**Then:**
- **set_field** target: `total_cost` — Compute labour_cost + parts_cost + other_cost
- **set_field** target: `status` value: `completed`
- **set_field** target: `vehicle.last_odometer` value: `odometer_at_service` — Update vehicle's last known odometer if provided
- **emit_event** event: `maintenance.service_completed`

**Result:** Service record is finalised, vehicle odometer is updated, and scheduled maintenance is notified

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MAINTENANCE_ODOMETER_INVALID` | 400 | Odometer at service cannot be less than the vehicle's last recorded reading. | No |
| `MAINTENANCE_FUTURE_DATE` | 400 | Service date cannot be in the future. | No |
| `MAINTENANCE_MISSING_CERTIFICATE` | 422 | A completion certificate is required for statutory service records. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `maintenance.service_completed` | A maintenance service event has been completed and logged for a vehicle | `vehicle`, `service_date`, `service_type`, `total_cost`, `next_service_date`, `next_service_odometer` |
| `maintenance.next_service_scheduled` | A next service date or odometer milestone has been recorded | `vehicle`, `next_service_date`, `next_service_odometer` |
| `maintenance.cost_incurred` | A service event with a recorded cost has been finalised | `vehicle`, `service_date`, `total_cost`, `service_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master provides last odometer and fuel type context |
| scheduled-maintenance | recommended | Maintenance log entries close out scheduled maintenance tasks and trigger the next cycle |
| parts-consumption | recommended | Parts consumed during the service are recorded via the parts consumption feature |
| vehicle-expense-tracking | recommended | Service costs roll up into per-vehicle expense reporting |
| workshop-directory | optional | Workshop reference on the log entry links to the service provider directory |

## AGI Readiness

### Goals

#### Reliable Vehicle Maintenance Log

Record completed maintenance and service events for a vehicle including work performed, parts consumed, labour cost, technician details, and the next scheduled service.

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
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| service_completed | `autonomous` | - | - |
| invalid_odometer | `autonomous` | - | - |
| next_service_scheduled | `autonomous` | - | - |
| cost_recorded | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 4
  entry_points:
    - erpnext/assets/doctype/asset_maintenance_log/asset_maintenance_log.py
    - erpnext/assets/doctype/asset_maintenance/asset_maintenance.py
    - erpnext/assets/doctype/asset_maintenance_task/asset_maintenance_task.py
    - erpnext/assets/doctype/asset_repair/asset_repair.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Maintenance Log Blueprint",
  "description": "Record completed maintenance and service events for a vehicle including work performed, parts consumed, labour cost, technician details, and the next scheduled ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, maintenance, service, history, log"
}
</script>
