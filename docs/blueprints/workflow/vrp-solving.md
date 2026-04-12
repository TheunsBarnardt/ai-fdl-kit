---
title: "Vrp Solving Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Solve a vehicle routing problem given jobs and vehicles, returning optimised routes that minimise total cost while satisfying all constraints.. 6 fields. 4 outc"
---

# Vrp Solving Blueprint

> Solve a vehicle routing problem given jobs and vehicles, returning optimised routes that minimise total cost while satisfying all constraints.

| | |
|---|---|
| **Feature** | `vrp-solving` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | route-optimization, vrp, logistics, scheduling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vrp-solving.blueprint.yaml) |
| **JSON API** | [vrp-solving.json]({{ site.baseurl }}/api/blueprints/workflow/vrp-solving.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Submits the problem definition and consumes the solution |
| `optimization_engine` | Optimization Engine | system | Runs heuristic construction and local-search to find best solution |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `jobs` | json | Yes | Jobs |  |
| `vehicles` | json | Yes | Vehicles |  |
| `shipments` | json | No | Shipments |  |
| `matrices` | json | No | Custom Matrices |  |
| `exploration_level` | number | No | Exploration Level |  |
| `timeout_ms` | number | No | Timeout (ms) |  |

## States

**State field:** `solving_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `solving` |  |  |
| `solved` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `solving` | fleet_manager |  |
|  | `solving` | `solved` | optimization_engine |  |
|  | `solving` | `failed` | optimization_engine |  |

## Rules

- **single_assignment:** Every job is assigned to at most one vehicle; unassigned jobs are reported separately.
- **constraint_satisfaction:** A vehicle route must not violate its capacity, skills, working-hours, max_tasks, max_travel_time, or max_distance constraints.
- **multi_start_search:** Solver runs multiple heuristic construction passes followed by local search; the pass with the lowest cost indicator is returned.
- **lexicographic_objective:** Optimization objective is lexicographic — maximise priority-weighted assignment first, then minimise total route cost.
- **initial_routes:** If initial routes are provided they seed a single-search refinement rather than multi-start exploration.
- **open_trip:** At least one of start or end must be defined per vehicle; if only one is given, the route is an open trip.

## Outcomes

### Input_error (Priority: 1) — Error: `VRP_INPUT_ERROR`

**Given:**
- required fields missing, duplicate IDs, or constraint values are invalid

**Then:**
- **emit_event** event: `vrp.failed`
- **transition_state** field: `solving_status` from: `solving` to: `failed`

**Result:** Error code returned with descriptive message; no routes produced.

### Routing_error (Priority: 2) — Error: `VRP_ROUTING_ERROR`

**Given:**
- routing engine unreachable or returns unfound routes for a location

**Then:**
- **emit_event** event: `vrp.failed`
- **transition_state** field: `solving_status` from: `solving` to: `failed`

**Result:** Error returned; caller should verify location coordinates or supply custom matrices.

### Partial_assignment (Priority: 5)

**Given:**
- solution is feasible but some jobs could not be assigned

**Then:**
- **emit_event** event: `vrp.solved`
- **transition_state** field: `solving_status` from: `solving` to: `solved`

**Result:** Solution returned with unassigned array populated.

### Feasible_solution (Priority: 10)

**Given:**
- all required fields are present and valid
- at least one vehicle and one job are defined

**Then:**
- **emit_event** event: `vrp.solved`
- **transition_state** field: `solving_status` from: `solving` to: `solved`

**Result:** Solution returned with routes, unassigned tasks, and summary statistics.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VRP_INPUT_ERROR` | 400 | Problem definition is invalid. Check for missing fields, duplicate IDs, or bad constraint values. | No |
| `VRP_ROUTING_ERROR` | 503 | Could not compute travel times for one or more locations. Verify coordinates or supply custom matrices. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vrp.solved` | Optimization completed; solution is ready for consumption | `routes`, `unassigned`, `summary` |
| `vrp.failed` | Optimization could not complete due to input or routing error | `error_code`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-vehicle-route-optimization | extends |  |
| time-window-constraints | optional |  |
| vehicle-capacity-constraints | optional |  |
| driver-shift-break-constraints | optional |  |
| pickup-delivery-pairing | optional |  |
| skill-based-assignment | optional |  |
| priority-urgency-weighting | optional |  |
| cost-based-route-optimization | optional |  |
| distance-matrix-calculation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Vrp Solving

Solve a vehicle routing problem given jobs and vehicles, returning optimised routes that minimise total cost while satisfying all constraints.

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| feasible_solution | `autonomous` | - | - |
| partial_assignment | `autonomous` | - | - |
| input_error | `autonomous` | - | - |
| routing_error | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 20
  entry_points:
    - src/problems/vrp.h
    - src/problems/cvrp/cvrp.h
    - src/problems/vrptw/vrptw.h
    - src/structures/vroom/input/input.h
    - src/algorithms/heuristics/heuristics.h
    - src/algorithms/local_search/local_search.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vrp Solving Blueprint",
  "description": "Solve a vehicle routing problem given jobs and vehicles, returning optimised routes that minimise total cost while satisfying all constraints.. 6 fields. 4 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "route-optimization, vrp, logistics, scheduling"
}
</script>
