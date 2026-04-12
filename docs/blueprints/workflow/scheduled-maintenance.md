---
title: "Scheduled Maintenance Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Define recurring maintenance schedules for vehicles based on calendar intervals or odometer milestones, track due dates, trigger work orders, and record complet"
---

# Scheduled Maintenance Blueprint

> Define recurring maintenance schedules for vehicles based on calendar intervals or odometer milestones, track due dates, trigger work orders, and record completion to advance the schedule.

| | |
|---|---|
| **Feature** | `scheduled-maintenance` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, maintenance, scheduling, reminders, odometer, preventive |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/scheduled-maintenance.blueprint.yaml) |
| **JSON API** | [scheduled-maintenance.json]({{ site.baseurl }}/api/blueprints/workflow/scheduled-maintenance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Creates and manages maintenance schedules; receives overdue alerts |
| `technician` | Technician | human | Completes the maintenance task and records it against the schedule |
| `system` | System | system | Daily scan that recalculates due dates and transitions overdue tasks |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `task_name` | text | Yes | Task Name |  |
| `maintenance_type` | select | Yes | Maintenance Type |  |
| `trigger_type` | select | Yes | Trigger Type |  |
| `interval_days` | number | No | Calendar Interval (days) |  |
| `interval_km` | number | No | Odometer Interval (km) |  |
| `start_date` | date | Yes | Schedule Start Date |  |
| `end_date` | date | No | Schedule End Date |  |
| `last_completed_date` | date | No | Last Completed Date |  |
| `last_completed_odometer` | number | No | Last Completed Odometer (km) |  |
| `next_due_date` | date | No | Next Due Date |  |
| `next_due_odometer` | number | No | Next Due Odometer (km) |  |
| `assigned_to` | text | No | Assigned To |  |
| `advance_warning_days` | number | No | Advance Warning (days) |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `due_soon` |  |  |
| `overdue` |  |  |
| `completed` |  |  |
| `paused` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `due_soon` | system |  |
|  | `due_soon` | `overdue` | system |  |
|  | `active` | `overdue` | system |  |
|  | `due_soon` | `completed` | technician |  |
|  | `overdue` | `completed` | technician |  |
|  | `completed` | `active` | system |  |
|  | `active` | `paused` | fleet_manager |  |
|  | `paused` | `active` | fleet_manager |  |

## Rules

- **interval_required:**
  - **description:** At least one of interval_days or interval_km must be provided — a schedule with neither is invalid
- **date_based_next_due:**
  - **description:** When trigger_type is date-based, next_due_date = last_completed_date (or start_date) + interval_days
- **odometer_based_next_due:**
  - **description:** When trigger_type is odometer-based, next_due_odometer = last_completed_odometer + interval_km
- **both_trigger_earliest:**
  - **description:** When trigger_type is both, the task becomes due when either threshold is first reached
- **auto_cancel_past_end_date:**
  - **description:** If end_date is set and next_due_date exceeds end_date, the schedule is automatically cancelled
- **daily_job:**
  - **description:** System runs a daily job to transition active → due_soon → overdue based on next_due_date
- **odometer_reevaluation:**
  - **description:** Odometer-based due dates are re-evaluated whenever a new odometer reading is recorded for the vehicle
- **completion_requires_reference:**
  - **description:** Task completion is only valid with a service log reference or completion date

## Outcomes

### Odometer_due_triggered (Priority: 6)

**Given:**
- trigger_type includes odometer
- vehicle current odometer is >= next_due_odometer
- status is active

**Then:**
- **set_field** target: `status` value: `due_soon`
- **notify** — Notify assignee that odometer threshold has been reached
- **emit_event** event: `scheduled_maintenance.odometer_threshold_reached`

**Result:** Task transitions to due_soon because the odometer threshold has been reached

### Task_completed (Priority: 7)

**Given:**
- status is due_soon, overdue, or active
- completion date and service log reference are provided

**Then:**
- **set_field** target: `last_completed_date` value: `completion_date`
- **set_field** target: `last_completed_odometer` value: `odometer_at_completion`
- **set_field** target: `status` value: `completed`
- **set_field** target: `next_due_date` — Recompute next_due_date = last_completed_date + interval_days
- **set_field** target: `next_due_odometer` — Recompute next_due_odometer = last_completed_odometer + interval_km
- **set_field** target: `status` value: `active`
- **emit_event** event: `scheduled_maintenance.completed`

**Result:** Completion is recorded, schedule advances to the next cycle and becomes active

### Task_overdue (Priority: 8)

**Given:**
- status is due_soon or active
- next_due_date has passed

**Then:**
- **set_field** target: `status` value: `overdue`
- **notify** — Send overdue alert to fleet manager
- **emit_event** event: `scheduled_maintenance.overdue`

**Result:** Task is marked overdue and an alert is sent to the fleet manager

### Task_due_soon (Priority: 9)

**Given:**
- system daily scan runs
- status is active
- days until next_due_date is less than or equal to advance_warning_days

**Then:**
- **set_field** target: `status` value: `due_soon`
- **notify** — Send due-soon notification to assigned_to user and fleet manager
- **emit_event** event: `scheduled_maintenance.due_soon`

**Result:** Task transitions to due_soon and the assignee is notified

### Schedule_created (Priority: 10)

**Given:**
- vehicle exists in the fleet
- task_name and maintenance_type are provided
- at least one of interval_days or interval_km is provided
- start_date is valid

**Then:**
- **set_field** target: `next_due_date` — Compute start_date + interval_days for date-based schedules
- **set_field** target: `next_due_odometer` — Compute vehicle last_odometer + interval_km for odometer-based schedules
- **set_field** target: `status` value: `active`
- **emit_event** event: `scheduled_maintenance.created`

**Result:** Maintenance schedule is active with next due date and/or odometer computed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCHEDULE_NO_INTERVAL` | 400 | A maintenance schedule must have either a calendar interval or an odometer interval. | No |
| `SCHEDULE_INVALID_DATE` | 400 | Schedule start date is invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `scheduled_maintenance.created` | A recurring maintenance schedule has been set up for a vehicle | `vehicle`, `task_name`, `maintenance_type`, `next_due_date`, `next_due_odometer` |
| `scheduled_maintenance.due_soon` | A scheduled maintenance task is approaching its due date or odometer threshold | `vehicle`, `task_name`, `next_due_date`, `next_due_odometer` |
| `scheduled_maintenance.overdue` | A scheduled maintenance task has passed its due date without completion | `vehicle`, `task_name`, `next_due_date` |
| `scheduled_maintenance.completed` | A scheduled task was completed and the schedule has advanced to the next cycle | `vehicle`, `task_name`, `last_completed_date`, `next_due_date`, `next_due_odometer` |
| `scheduled_maintenance.odometer_threshold_reached` | A vehicle's current odometer has reached the next service threshold | `vehicle`, `task_name`, `next_due_odometer`, `current_odometer` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master provides last odometer reading for odometer-based interval calculations |
| vehicle-maintenance-log | required | Completing a scheduled task creates a maintenance log record and advances the schedule |
| odometer-tracking | recommended | Validated odometer readings trigger odometer-based due date re-evaluation |

## AGI Readiness

### Goals

#### Reliable Scheduled Maintenance

Define recurring maintenance schedules for vehicles based on calendar intervals or odometer milestones, track due dates, trigger work orders, and record completion to advance the schedule.

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
| `vehicle_maintenance_log` | vehicle-maintenance-log | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| schedule_created | `supervised` | - | - |
| task_due_soon | `autonomous` | - | - |
| task_overdue | `autonomous` | - | - |
| task_completed | `autonomous` | - | - |
| odometer_due_triggered | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 4
  entry_points:
    - erpnext/assets/doctype/asset_maintenance/asset_maintenance.py
    - erpnext/assets/doctype/asset_maintenance_task/asset_maintenance_task.py
    - erpnext/assets/doctype/asset_maintenance_log/asset_maintenance_log.py
    - erpnext/assets/doctype/asset/asset.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Scheduled Maintenance Blueprint",
  "description": "Define recurring maintenance schedules for vehicles based on calendar intervals or odometer milestones, track due dates, trigger work orders, and record complet",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, maintenance, scheduling, reminders, odometer, preventive"
}
</script>
