---
title: "Driver Shift Scheduling Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Schedule and manage driver work shifts, availability windows, and hours-of-service compliance. 12 fields. 6 outcomes. 4 error codes. rules: no_overlap, minimum_"
---

# Driver Shift Scheduling Blueprint

> Schedule and manage driver work shifts, availability windows, and hours-of-service compliance

| | |
|---|---|
| **Feature** | `driver-shift-scheduling` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, driver, shifts, scheduling, availability, hos, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-shift-scheduling.blueprint.yaml) |
| **JSON API** | [driver-shift-scheduling.json]({{ site.baseurl }}/api/blueprints/workflow/driver-shift-scheduling.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Manager creating and managing shift schedules |
| `driver` | Driver | human | Driver confirming and working their assigned shifts |
| `system` | Scheduling Engine | system | Automated conflict detection and HOS enforcement |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `shift_id` | text | Yes | Shift ID |  |
| `driver_uuid` | text | Yes | Driver |  |
| `start_time` | datetime | Yes | Shift Start |  |
| `end_time` | datetime | Yes | Shift End |  |
| `actual_start` | datetime | No | Actual Clock-in |  |
| `actual_end` | datetime | No | Actual Clock-out |  |
| `duration_hours` | number | No | Duration (hours) |  |
| `break_duration_minutes` | number | No | Break Duration (minutes) |  |
| `shift_type` | select | No | Shift Type |  |
| `service_area_uuid` | text | No | Assigned Service Area |  |
| `notes` | text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `scheduled` | Yes |  |
| `confirmed` |  |  |
| `active` |  |  |
| `completed` |  | Yes |
| `missed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `scheduled` | `confirmed` | driver |  |
|  | `confirmed` | `active` | driver |  |
|  | `active` | `completed` | driver |  |
|  | `confirmed` | `missed` | system |  |
|  | `scheduled` | `cancelled` | fleet_manager |  |
|  | `confirmed` | `cancelled` | fleet_manager |  |

## Rules

- **no_overlap:** Driver shifts must not overlap; a driver cannot have two concurrent active shifts
- **minimum_rest:** Minimum rest period between consecutive shifts must be enforced per regulatory requirements
- **max_duration:** Shifts longer than the configured maximum hours are rejected
- **mandatory_breaks:** Break periods must comply with labor regulations (e.g., mandatory break every X hours)
- **hos_enforcement:** Maximum weekly driving hours enforced; system warns before threshold
- **shift_notifications:** Drivers receive notifications when a shift is assigned, confirmed, or cancelled
- **dispatch_within_shift:** A driver can only be dispatched during their active shift window
- **on_call_availability:** On-call shifts make the driver available but do not guarantee active deployment
- **recurring_templates:** Shift templates can be created for recurring weekly schedules
- **overtime_tracking:** Overtime calculation is tracked based on actual times vs scheduled times

## Outcomes

### Shift_scheduled (Priority: 1)

**Given:**
- `driver_uuid` (input) exists
- `start_time` (input) exists
- `end_time` (input) exists
- no overlapping shift exists for this driver

**Then:**
- **create_record**
- **emit_event** event: `shift.scheduled`

**Result:** Shift scheduled and driver notified

### Shift_overlap_rejected (Priority: 1) — Error: `SHIFT_OVERLAP`

**Given:**
- driver has an overlapping scheduled shift

**Result:** Shift creation rejected — overlapping shift exists

### Shift_confirmed (Priority: 2)

**Given:**
- `status` (db) eq `scheduled`

**Then:**
- **set_field** target: `status` value: `confirmed`
- **emit_event** event: `shift.confirmed`

**Result:** Driver confirmed shift

### Hos_limit_exceeded (Priority: 2) — Error: `SHIFT_HOS_LIMIT_EXCEEDED`

**Given:**
- scheduled shift would cause driver to exceed maximum weekly hours

**Result:** Shift rejected — hours-of-service limit would be exceeded

### Driver_clocked_in (Priority: 3)

**Given:**
- `status` (db) eq `confirmed`
- current time is within grace period of start_time

**Then:**
- **set_field** target: `status` value: `active`
- **set_field** target: `actual_start` value: `now`
- **emit_event** event: `shift.started`

**Result:** Driver clocked in; shift is active

### Driver_clocked_out (Priority: 4)

**Given:**
- `status` (db) eq `active`

**Then:**
- **set_field** target: `status` value: `completed`
- **set_field** target: `actual_end` value: `now`
- **emit_event** event: `shift.completed`

**Result:** Driver clocked out; shift completed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SHIFT_OVERLAP` | 409 | This driver already has a shift during this time period. | No |
| `SHIFT_HOS_LIMIT_EXCEEDED` | 422 | This shift would exceed the maximum allowed driving hours. | No |
| `SHIFT_INSUFFICIENT_REST` | 422 | Insufficient rest period between consecutive shifts. | No |
| `SHIFT_NOT_FOUND` | 404 | Shift not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `shift.scheduled` | Fired when a new shift is created for a driver | `shift_id`, `driver_uuid`, `start_time`, `end_time`, `shift_type` |
| `shift.confirmed` | Fired when driver confirms shift acceptance | `shift_id`, `driver_uuid`, `start_time` |
| `shift.started` | Fired when driver clocks in | `shift_id`, `driver_uuid`, `actual_start` |
| `shift.completed` | Fired when driver clocks out | `shift_id`, `driver_uuid`, `actual_start`, `actual_end`, `duration_hours` |
| `shift.missed` | Fired when driver fails to clock in within grace period | `shift_id`, `driver_uuid`, `start_time` |
| `shift.cancelled` | Fired when a shift is cancelled | `shift_id`, `driver_uuid`, `cancelled_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-profile | required | Shifts are assigned to driver profiles |
| dispatch-driver-assignment | required | Drivers can only be dispatched during active shifts |
| service-area-management | optional | Shifts can be scoped to specific service areas |

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
  "name": "Driver Shift Scheduling Blueprint",
  "description": "Schedule and manage driver work shifts, availability windows, and hours-of-service compliance. 12 fields. 6 outcomes. 4 error codes. rules: no_overlap, minimum_",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, driver, shifts, scheduling, availability, hos, compliance"
}
</script>
