---
title: "Asset Maintenance Repairs Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Asset maintenance scheduling and repair management with preventive and corrective tasks, repair cost capitalization, and stock consumption tracking for parts us"
---

# Asset Maintenance Repairs Blueprint

> Asset maintenance scheduling and repair management with preventive and corrective tasks, repair cost capitalization, and stock consumption tracking for parts used during repairs.


| | |
|---|---|
| **Feature** | `asset-maintenance-repairs` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | asset-maintenance, preventive-maintenance, corrective-maintenance, repair, maintenance-log, asset-lifecycle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/asset-maintenance-repairs.blueprint.yaml) |
| **JSON API** | [asset-maintenance-repairs.json]({{ site.baseurl }}/api/blueprints/asset/asset-maintenance-repairs.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_name` | text | Yes | Asset Name |  |
| `maintenance_tasks` | json | Yes | Maintenance Tasks |  |
| `maintenance_status` | select | Yes | Maintenance Status |  |
| `task` | text | No | Task Name |  |
| `maintenance_type` | select | No | Maintenance Type |  |
| `log_status` | select | No | Log Status |  |
| `has_certificate` | boolean | No | Has Certificate |  |
| `certificate_attachments` | file | No | Certificate Attachments |  |
| `completion_date` | date | No | Completion Date |  |
| `actions_performed` | text | No | Actions Performed |  |
| `description` | rich_text | No | Description |  |
| `failure_date` | date | No | Failure Date |  |
| `assign_to` | text | No | Assigned To |  |
| `repair_status` | select | No | Repair Status |  |
| `repair_cost` | number | No | Repair Cost | Validations: min |
| `stock_items` | json | No | Stock Items Consumed |  |
| `capitalize_repair_cost` | boolean | No | Capitalize Repair Cost |  |
| `increase_in_asset_life` | number | No | Increase in Asset Life (Months) | Validations: min |

## Rules

- **calendar_events_per_schedule:**
  - **description:** Maintenance tasks generate calendar events based on their configured periodicity, assigned to the responsible person.

- **next_due_date_auto_calculated:**
  - **description:** Next due date is auto-calculated from the periodicity setting when a maintenance task is completed.

- **overdue_status_auto_set:**
  - **description:** Maintenance status is automatically set to Overdue when next_due_date is earlier than today.

- **repair_cost_capitalization:**
  - **description:** Repair cost can be capitalized (added to asset gross value), which creates a corresponding GL entry for the value increase.

- **repair_extends_useful_life:**
  - **description:** A repair can extend the asset useful life by a specified number of months, recalculating the remaining depreciation schedule.

- **stock_items_create_entries:**
  - **description:** Stock items consumed during repair create stock entries (Material Issue) from the specified warehouse.

- **completion_triggers_next_cycle:**
  - **description:** Completing a maintenance task triggers calculation of the next due date and creates the next calendar event.


## Outcomes

### Schedule_maintenance

**Given:**
- asset exists and is not in Draft status
- maintenance tasks with periodicity and assignment are provided

**Then:**
- **create_record** target: `maintenance_schedule` — Maintenance schedule created for the asset
- **emit_event** event: `maintenance.scheduled`

**Result:** Maintenance schedule created with calendar events for each task

### Complete_maintenance_task

**Given:**
- maintenance task exists and is in Planned status
- actions performed and completion date are provided

**Then:**
- **set_field** target: `log_status` value: `Completed`
- **set_field** target: `next_due_date` — Recalculated based on periodicity
- **emit_event** event: `maintenance.completed`

**Result:** Task marked complete, next cycle scheduled

### Log_repair

**Given:**
- asset exists
- failure_date and description are provided

**Then:**
- **create_record** target: `asset_repair` — Repair record created with Pending status
- **emit_event** event: `repair.started`

**Result:** Repair logged and assigned for resolution

### Capitalize_repair_cost — Error: `REPAIR_CAPITALIZE_INVALID`

**Given:**
- repair is in Completed status
- capitalize_repair_cost is true
- repair_cost is greater than zero

**Then:**
- **set_field** target: `asset_value` — Asset gross value increased by repair cost
- **create_record** target: `journal_entry` — GL entry for capitalized repair cost
- **emit_event** event: `repair.cost_capitalized`

**Result:** Repair cost added to asset value with GL entries

### Extend_asset_life

**Given:**
- repair is in Completed status
- increase_in_asset_life is greater than zero

**Then:**
- **set_field** target: `total_number_of_depreciations` — Depreciation count increased to reflect extended life
- **emit_event** event: `repair.completed`

**Result:** Asset useful life extended and depreciation schedule recalculated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MAINTENANCE_ASSET_NOT_FOUND` | 404 | The specified asset does not exist or is not active. | No |
| `REPAIR_ALREADY_COMPLETED` | 400 | This repair has already been completed and cannot be modified. | No |
| `REPAIR_CAPITALIZE_INVALID` | 400 | Cannot capitalize repair cost. Repair must be completed with a cost greater than zero. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `maintenance.scheduled` | Fired when a maintenance schedule is created or updated | `asset_name`, `tasks`, `next_due_dates` |
| `maintenance.completed` | Fired when a maintenance task is completed | `asset_name`, `task`, `completion_date` |
| `maintenance.overdue` | Fired when a maintenance task becomes overdue | `asset_name`, `task`, `due_date` |
| `repair.started` | Fired when a repair is logged | `asset_name`, `failure_date`, `description` |
| `repair.completed` | Fired when a repair is marked complete | `asset_name`, `repair_cost`, `increase_in_asset_life` |
| `repair.cost_capitalized` | Fired when repair cost is capitalized to asset value | `asset_name`, `repair_cost`, `new_asset_value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-asset-lifecycle | required | Maintenance and repairs operate on registered fixed assets |
| stock-entry-movements | optional | Stock items consumed during repair create material issue entries |

## AGI Readiness

### Goals

#### Reliable Asset Maintenance Repairs

Asset maintenance scheduling and repair management with preventive and corrective tasks, repair cost capitalization, and stock consumption tracking for parts used during repairs.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | convenience | asset tracking must maintain precise location and status records |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fixed_asset_lifecycle` | fixed-asset-lifecycle | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| schedule_maintenance | `autonomous` | - | - |
| complete_maintenance_task | `autonomous` | - | - |
| log_repair | `autonomous` | - | - |
| capitalize_repair_cost | `autonomous` | - | - |
| extend_asset_life | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Asset Maintenance Repairs Blueprint",
  "description": "Asset maintenance scheduling and repair management with preventive and corrective tasks, repair cost capitalization, and stock consumption tracking for parts us",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "asset-maintenance, preventive-maintenance, corrective-maintenance, repair, maintenance-log, asset-lifecycle"
}
</script>
