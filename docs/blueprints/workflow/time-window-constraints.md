---
title: "Time Window Constraints Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Restrict when tasks may be serviced by associating time windows with jobs and vehicles. Optimizer schedules service within valid windows, inserting waiting time"
---

# Time Window Constraints Blueprint

> Restrict when tasks may be serviced by associating time windows with jobs and vehicles. Optimizer schedules service within valid windows, inserting waiting time where necessary.

| | |
|---|---|
| **Feature** | `time-window-constraints` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | time-windows, scheduling, delivery-windows, vrptw |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/time-window-constraints.blueprint.yaml) |
| **JSON API** | [time-window-constraints.json]({{ site.baseurl }}/api/blueprints/workflow/time-window-constraints.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Specifies acceptable delivery or pickup windows |
| `fleet_manager` | Fleet Manager | human | Sets vehicle working-hours windows |
| `optimization_engine` | Optimization Engine | system | Selects service start times that satisfy all windows |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `time_window_start` | number | Yes | Window Start (s) |  |
| `time_window_end` | number | Yes | Window End (s) |  |
| `multiple_time_windows` | json | No | Multiple Time Windows |  |
| `waiting_time` | number | No | Waiting Time (s) |  |
| `lead_time_violation` | number | No | Lead Time Violation (s) |  |
| `delay_violation` | number | No | Delay Violation (s) |  |

## States

**State field:** `window_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unconstrained` | Yes |  |
| `pending` |  |  |
| `waiting` |  |  |
| `in_window` |  | Yes |
| `violated` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `waiting` | optimization_engine |  |
|  | `waiting` | `in_window` | optimization_engine |  |
|  | `pending` | `in_window` | optimization_engine |  |
|  | `pending` | `violated` | optimization_engine |  |

## Rules

- **window_inclusive:** A time window [start, end] is satisfied when service begins at or after start and at or before end (both inclusive).
- **early_arrival_wait:** If a vehicle arrives before a window opens it waits; waiting time is included in route duration and reported per step.
- **multi_window_selection:** Multiple time windows per task are tried; the optimizer selects the window that minimises total route cost.
- **vehicle_shift_window:** A vehicle's time window defines its working hours; no step may be scheduled outside this window in standard solving mode.
- **soft_constraints_plan_mode:** In plan/ETA mode all time constraints become soft; violations are reported as lead_time (early) or delay (late) with duration.
- **default_unconstrained:** A default unconstrained time window (0, +inf) is applied when no window is specified.
- **break_windows:** Breaks carry time windows; break scheduling follows the same feasibility rules as job time windows.

## Outcomes

### No_feasible_window (Priority: 1) — Error: `TW_NO_FEASIBLE_WINDOW`

**Given:**
- standard solving mode
- vehicle cannot reach any task window without violating vehicle working hours

**Then:**
- **emit_event** event: `stop.unassigned`

**Result:** Job marked as unassigned; reported in solution unassigned list.

### Window_violated_plan_mode (Priority: 5)

**Given:**
- plan/ETA mode is active
- service time falls outside all defined time windows

**Then:**
- **emit_event** event: `stop.window.violated`

**Result:** Violation recorded; cause is lead_time if early, delay if late.

### Multi_window_chosen (Priority: 7)

**Given:**
- task has multiple time windows defined
- vehicle can reach the task before at least one window closes

**Then:**
- **emit_event** event: `stop.window.selected`

**Result:** Optimizer picks the window minimising total route cost.

### Early_arrival (Priority: 8)

**Given:**
- vehicle arrives before the earliest time window start

**Then:**
- **set_field** target: `waiting_time` — window_start - arrival_time
- **emit_event** event: `stop.window.waiting`

**Result:** Vehicle waits at stop until window opens; waiting time increases route duration.

### Window_satisfied (Priority: 10)

**Given:**
- service start time is between window_start and window_end (inclusive)

**Then:**
- **set_field** target: `waiting_time` — max(0, window_start - arrival_time)
- **emit_event** event: `stop.window.satisfied`

**Result:** Stop scheduled; waiting time recorded and added to route total.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TW_NO_FEASIBLE_WINDOW` | 422 | No vehicle can serve this task within its time windows and working-hours constraints. | No |
| `TW_INVALID_WINDOW` | 400 | Time window is invalid: end time must be greater than or equal to start time. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stop.window.satisfied` | Service scheduled within the task's time window | `job_id`, `arrival_time`, `service_start`, `waiting_time` |
| `stop.window.waiting` | Vehicle waiting at stop for window to open | `job_id`, `arrival_time`, `window_start`, `waiting_time` |
| `stop.window.selected` | One window chosen from multiple candidates for this task | `job_id`, `selected_window_index`, `arrival_time` |
| `stop.window.violated` | Plan mode — service time outside all windows | `job_id`, `violation_type`, `violation_duration_seconds` |
| `stop.unassigned` | Task could not be assigned due to infeasible windows | `job_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| driver-shift-break-constraints | recommended |  |
| stop-eta-calculation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Time Window Constraints

Restrict when tasks may be serviced by associating time windows with jobs and vehicles. Optimizer schedules service within valid windows, inserting waiting time where necessary.

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
| `vrp_solving` | vrp-solving | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| window_satisfied | `autonomous` | - | - |
| early_arrival | `autonomous` | - | - |
| multi_window_chosen | `autonomous` | - | - |
| window_violated_plan_mode | `autonomous` | - | - |
| no_feasible_window | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 8
  entry_points:
    - src/structures/vroom/time_window.h
    - src/structures/vroom/tw_route.h
    - src/algorithms/validation/choose_ETA.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Time Window Constraints Blueprint",
  "description": "Restrict when tasks may be serviced by associating time windows with jobs and vehicles. Optimizer schedules service within valid windows, inserting waiting time",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "time-windows, scheduling, delivery-windows, vrptw"
}
</script>
