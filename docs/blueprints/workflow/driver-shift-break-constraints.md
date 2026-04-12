---
title: "Driver Shift Break Constraints Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Enforce driver working-hours limits and mandatory rest breaks within routes. Each vehicle has a shift time window and breaks with their own time windows and dur"
---

# Driver Shift Break Constraints Blueprint

> Enforce driver working-hours limits and mandatory rest breaks within routes. Each vehicle has a shift time window and breaks with their own time windows and durations.

| | |
|---|---|
| **Feature** | `driver-shift-break-constraints` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | driver-hours, breaks, compliance, shift-scheduling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-shift-break-constraints.blueprint.yaml) |
| **JSON API** | [driver-shift-break-constraints.json]({{ site.baseurl }}/api/blueprints/workflow/driver-shift-break-constraints.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Configures shift windows and break rules per vehicle |
| `driver` | Driver | human | Subject to working-hours and rest rules |
| `optimization_engine` | Optimization Engine | system | Schedules breaks within routes without violating stop time windows |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `shift_start` | number | No | Shift Start (s) |  |
| `shift_end` | number | No | Shift End (s) |  |
| `break_id` | number | Yes | Break ID |  |
| `break_time_windows` | json | No | Break Time Windows |  |
| `break_service_duration` | number | No | Break Duration (s) |  |
| `break_description` | text | No | Break Description |  |
| `break_max_load` | json | No | Break Max Load |  |

## States

**State field:** `break_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unscheduled` | Yes |  |
| `scheduled` |  |  |
| `active` |  |  |
| `completed` |  | Yes |
| `missed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unscheduled` | `scheduled` | optimization_engine |  |
|  | `scheduled` | `active` | driver |  |
|  | `active` | `completed` | driver |  |
|  | `scheduled` | `missed` | optimization_engine |  |

## Rules

- **break_once_per_route:** Each break must appear exactly once in the vehicle's route; omitting a required break is a missing_break violation in plan mode.
- **break_between_stops:** Breaks are inserted between job stops; they cannot overlap with service at a job location.
- **break_window_timing:** A break's time window is satisfied when the break begins within the window; the same waiting-time logic used for jobs applies.
- **multiple_breaks_allowed:** Multiple breaks are allowed per vehicle and are scheduled independently.
- **break_max_load_rule:** If break_max_load is set the break may only start when vehicle load is at or below that threshold on all dimensions.
- **shift_window_enforced:** No stop (including breaks) may be scheduled outside the vehicle shift window in standard solving mode.
- **duplicate_break_rejected:** Duplicate break IDs for the same vehicle are rejected as input errors.

## Outcomes

### No_feasible_break_position (Priority: 3) — Error: `BREAK_NO_FEASIBLE_POSITION`

**Given:**
- standard solving mode
- no position in route satisfies both break time window and max_load

**Then:**
- **emit_event** event: `route.break.infeasible`

**Result:** Optimizer may leave some jobs unassigned to create space for the break.

### Shift_window_exceeded (Priority: 4)

**Given:**
- plan/ETA mode active
- last route step completes after shift_end

**Then:**
- **emit_event** event: `route.shift.violated`

**Result:** delay violation recorded; severity expressed as seconds beyond shift end.

### Break_missed_plan_mode (Priority: 5)

**Given:**
- plan/ETA mode active
- break defined for vehicle but not included in submitted route steps

**Then:**
- **emit_event** event: `route.break.violated`

**Result:** missing_break violation recorded at route level.

### Break_waiting (Priority: 8)

**Given:**
- vehicle arrives at break position before the break window opens

**Then:**
- **set_field** target: `waiting_time` — time idled before break window opens
- **emit_event** event: `route.break.waiting`

**Result:** Waiting time added to route; break starts at window open time.

### Break_scheduled (Priority: 10)

**Given:**
- vehicle has at least one break defined
- a feasible position exists in the route within the break's time window

**Then:**
- **emit_event** event: `route.break.scheduled`

**Result:** Break inserted between two stops; route step includes break with arrival, waiting_time, and service fields.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BREAK_DUPLICATE_ID` | 400 | Two breaks for the same vehicle share the same id. | No |
| `BREAK_NO_FEASIBLE_POSITION` | 422 | No route position satisfies break time window and load constraints simultaneously. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `route.break.scheduled` | Break placed at a feasible position in the route | `vehicle_id`, `break_id`, `position_in_route`, `scheduled_start` |
| `route.break.waiting` | Vehicle waiting at break position for window to open | `vehicle_id`, `break_id`, `waiting_time` |
| `route.break.violated` | Plan mode — required break omitted from submitted route | `vehicle_id`, `break_id`, `violation_cause` |
| `route.shift.violated` | Plan mode — route extends beyond vehicle shift window | `vehicle_id`, `violation_type`, `delay_seconds` |
| `route.break.infeasible` | No feasible break position found in route | `vehicle_id`, `break_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| time-window-constraints | required |  |
| vehicle-capacity-constraints | optional |  |
| stop-eta-calculation | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 7
  entry_points:
    - src/structures/vroom/break.h
    - src/structures/vroom/vehicle.h
    - src/algorithms/validation/choose_ETA.h
    - src/structures/vroom/solution/violations.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Shift Break Constraints Blueprint",
  "description": "Enforce driver working-hours limits and mandatory rest breaks within routes. Each vehicle has a shift time window and breaks with their own time windows and dur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "driver-hours, breaks, compliance, shift-scheduling"
}
</script>
