---
title: "Stop Eta Calculation Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Compute estimated arrival time and cumulative metrics for every route step (jobs, breaks, depots). Supports automatic ETA during solving and ETA-selection for p"
---

# Stop Eta Calculation Blueprint

> Compute estimated arrival time and cumulative metrics for every route step (jobs, breaks, depots). Supports automatic ETA during solving and ETA-selection for provided route plans.

| | |
|---|---|
| **Feature** | `stop-eta-calculation` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | eta, arrival-time, route-timing, plan-mode |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/stop-eta-calculation.blueprint.yaml) |
| **JSON API** | [stop-eta-calculation.json]({{ site.baseurl }}/api/blueprints/workflow/stop-eta-calculation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `optimization_engine` | Optimization Engine | system | Computes ETAs during solving and chooses optimal ETAs in plan mode |
| `dispatcher` | Dispatcher | human | Reviews per-stop ETAs and communicates them to drivers or customers |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `arrival_time` | number | No | Arrival Time (s) |  |
| `cumulative_travel_duration` | number | No | Cumulative Travel Duration (s) |  |
| `setup_duration` | number | No | Setup Duration (s) |  |
| `service_duration` | number | No | Service Duration (s) |  |
| `waiting_time` | number | No | Waiting Time (s) |  |
| `step_type` | select | Yes | Step Type |  |
| `cumulative_distance` | number | No | Cumulative Distance (m) |  |

## States

**State field:** `eta_mode`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `solving` | Yes |  |
| `plan_mode` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `solving` | `plan_mode` | fleet_manager |  |

## Rules

- **eta_formula:** ETA at step n = ETA at step n-1 + service(n-1) + travel_time(n-1 to n) + waiting_time(n).
- **waiting_time_formula:** Waiting time at a step = max(0, time_window_start - arrival_time).
- **setup_before_service:** Setup time is applied before service time at each stop; both are included in the step record.
- **plan_mode_minimises_violations:** In plan mode, ETAs are chosen to minimise total timing violations while respecting the submitted stop ordering.
- **load_after_step:** A step's load field shows vehicle load AFTER the step is completed.
- **timing_in_seconds:** All timing values in solution output are in seconds; distances in metres.
- **depot_no_service:** For start and end depot steps, service and setup durations are zero.

## Outcomes

### Distance_reported (Priority: 6)

**Given:**
- distance reporting is enabled via geometry flag or distance matrix

**Then:**
- **emit_event** event: `route.distance.reported`

**Result:** Cumulative distance reported at each step; total distance in route and solution summary.

### Step_waiting_time_recorded (Priority: 7)

**Given:**
- vehicle arrives before a step's time window opens

**Then:**
- **set_field** target: `waiting_time` — window_start - arrival_time
- **emit_event** event: `step.waiting_time.recorded`

**Result:** Waiting time added to step record; departure from stop is window_start + setup + service.

### Eta_chosen_plan_mode (Priority: 9)

**Given:**
- plan mode active
- user submitted ordered route steps with optional service_at/after/before hints

**Then:**
- **emit_event** event: `route.eta.computed`

**Result:** Optimal ETA assigned to each step minimising violations; constraint breaches recorded.

### Eta_computed_solving (Priority: 10)

**Given:**
- VRP solver has produced a feasible route

**Then:**
- **emit_event** event: `route.eta.computed`

**Result:** Each route step includes arrival, cumulative duration, setup, service, and waiting_time fields.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETA_ROUTING_UNAVAILABLE` | 503 | Travel time data unavailable for a step pair; cannot compute ETA. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `route.eta.computed` | ETAs calculated for all steps in a vehicle route | `vehicle_id`, `steps`, `total_duration`, `total_distance`, `total_waiting_time` |
| `step.waiting_time.recorded` | Vehicle waited at a stop for a time window | `vehicle_id`, `step_id`, `waiting_time` |
| `route.distance.reported` | Per-step and total distances appended to route | `vehicle_id`, `total_distance`, `per_step_cumulative_distance` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| time-window-constraints | recommended |  |
| driver-shift-break-constraints | recommended |  |
| distance-matrix-calculation | required |  |

## AGI Readiness

### Goals

#### Reliable Stop Eta Calculation

Compute estimated arrival time and cumulative metrics for every route step (jobs, breaks, depots). Supports automatic ETA during solving and ETA-selection for provided route plans.

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
| `distance_matrix_calculation` | distance-matrix-calculation | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| eta_computed_solving | `autonomous` | - | - |
| eta_chosen_plan_mode | `autonomous` | - | - |
| step_waiting_time_recorded | `autonomous` | - | - |
| distance_reported | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 8
  entry_points:
    - src/algorithms/validation/choose_ETA.h
    - src/algorithms/validation/check.h
    - src/structures/vroom/solution/step.h
    - src/structures/vroom/solution/route.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Stop Eta Calculation Blueprint",
  "description": "Compute estimated arrival time and cumulative metrics for every route step (jobs, breaks, depots). Supports automatic ETA during solving and ETA-selection for p",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "eta, arrival-time, route-timing, plan-mode"
}
</script>
