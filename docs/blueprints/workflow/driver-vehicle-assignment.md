---
title: "Driver Vehicle Assignment Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Assign drivers to fleet vehicles for defined periods, maintain a full assignment history, and enforce constraints preventing double-assignment and unauthorised "
---

# Driver Vehicle Assignment Blueprint

> Assign drivers to fleet vehicles for defined periods, maintain a full assignment history, and enforce constraints preventing double-assignment and unauthorised transfers.

| | |
|---|---|
| **Feature** | `driver-vehicle-assignment` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, driver, assignment, history, scheduling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-vehicle-assignment.blueprint.yaml) |
| **JSON API** | [driver-vehicle-assignment.json]({{ site.baseurl }}/api/blueprints/workflow/driver-vehicle-assignment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Creates, modifies, and ends driver-vehicle assignments |
| `driver` | Driver | human | Is assigned to the vehicle; may view their current and historical assignments |
| `system` | System | system | Enforces assignment constraints and auto-ends assignments when a new one is created |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `driver` | text | Yes | Driver |  |
| `assignment_type` | select | Yes | Assignment Type |  |
| `start_date` | date | Yes | Start Date |  |
| `end_date` | date | No | End Date |  |
| `assigned_by` | text | No | Assigned By |  |
| `reason` | text | No | Assignment Reason |  |
| `end_reason` | text | No | End Reason |  |
| `actual_end_date` | date | No | Actual End Date |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `active` |  |  |
| `ended` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `active` | fleet_manager |  |
|  | `active` | `ended` | fleet_manager |  |
|  | `draft` | `cancelled` | fleet_manager |  |

## Rules

- **no_double_permanent_assignment:**
  - **description:** A vehicle cannot have two active permanent assignments simultaneously
- **no_overlapping_assignments:**
  - **description:** A vehicle cannot have more than one active assignment per driver type at the same time (one permanent + temporary assignments are permitted if temporal ranges do not overlap)
- **end_date_after_start:**
  - **description:** End date must be after start date when provided
- **permanent_ends_by_new:**
  - **description:** A permanent assignment may only be ended by creating a new assignment for the same vehicle (which auto-ends the previous one)
- **end_reason_required:**
  - **description:** Ending an assignment requires an end_reason
- **driver_must_be_active:**
  - **description:** Driver must have Active status in the driver registry to receive a new assignment
- **start_date_not_past:**
  - **description:** Start date cannot be in the past for new assignments (warn if creating a backdated record)
- **decommission_ends_all:**
  - **description:** When a vehicle is decommissioned, all active assignments are automatically ended

## Outcomes

### Assignment_conflict_rejected (Priority: 1) — Error: `ASSIGNMENT_CONFLICT`

**Given:**
- an active permanent assignment already exists for this vehicle
- new assignment type is permanent

**Result:** New assignment is rejected; fleet manager must end the existing assignment first

### History_query (Priority: 7)

**Given:**
- a vehicle or driver filter is provided

**Then:**
- **emit_event** event: `assignment.history_queried`

**Result:** Full assignment history for the specified vehicle or driver is returned including ended and cancelled records

### Assignment_ended (Priority: 8)

**Given:**
- status is active
- end_reason is provided

**Then:**
- **set_field** target: `actual_end_date` value: `today`
- **set_field** target: `status` value: `ended`
- **set_field** target: `vehicle.assigned_driver` value: `null` — Clear assigned driver from vehicle master if no replacement assigned
- **emit_event** event: `assignment.ended`

**Result:** Assignment is ended; vehicle master's assigned driver is cleared

### Previous_permanent_auto_ended (Priority: 9)

**Given:**
- an active permanent assignment exists for the vehicle
- new assignment is being created as permanent
- fleet manager explicitly confirms the transition

**Then:**
- **set_field** target: `previous_assignment.status` value: `ended`
- **set_field** target: `previous_assignment.actual_end_date` value: `today`
- **set_field** target: `previous_assignment.end_reason` value: `Superseded by new assignment`
- **emit_event** event: `assignment.ended`

**Result:** Previous permanent assignment is auto-ended and the new one is activated

### Assignment_created (Priority: 10)

**Given:**
- vehicle exists and is in active status
- driver exists and has Active status
- no conflicting active assignment exists for the vehicle and date range
- end_date is after start_date if provided

**Then:**
- **set_field** target: `status` value: `active`
- **set_field** target: `vehicle.assigned_driver` value: `driver`
- **emit_event** event: `assignment.created`

**Result:** Driver is assigned to the vehicle; vehicle master record reflects the new driver

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ASSIGNMENT_CONFLICT` | 409 | This vehicle already has an active permanent assignment. End the existing assignment before creating a new one. | No |
| `ASSIGNMENT_INACTIVE_DRIVER` | 422 | The selected driver is not active. Only active drivers can be assigned to vehicles. | No |
| `ASSIGNMENT_INVALID_DATE` | 400 | The assignment end date must be after the start date. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `assignment.created` | A driver has been assigned to a fleet vehicle | `vehicle`, `driver`, `assignment_type`, `start_date`, `end_date` |
| `assignment.ended` | A driver-vehicle assignment has been terminated | `vehicle`, `driver`, `actual_end_date`, `end_reason` |
| `assignment.history_queried` | The assignment history for a vehicle or driver has been retrieved | `filter_vehicle`, `filter_driver`, `date_range` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master stores the currently assigned driver and must be updated on each assignment change |
| vehicle-expense-tracking | optional | Costs can be attributed to the driver assigned during a given period via assignment history |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 3
  entry_points:
    - erpnext/setup/doctype/driver/driver.py
    - erpnext/setup/doctype/driver/driver.json
    - erpnext/setup/doctype/vehicle/vehicle.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Vehicle Assignment Blueprint",
  "description": "Assign drivers to fleet vehicles for defined periods, maintain a full assignment history, and enforce constraints preventing double-assignment and unauthorised ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, driver, assignment, history, scheduling"
}
</script>
