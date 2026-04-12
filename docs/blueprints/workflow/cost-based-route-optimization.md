---
title: "Cost Based Route Optimization Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Configure per-vehicle cost models (fixed, per-hour travel, per-kilometre, per-task-hour) and minimize total fleet cost as the secondary objective after maximisi"
---

# Cost Based Route Optimization Blueprint

> Configure per-vehicle cost models (fixed, per-hour travel, per-kilometre, per-task-hour) and minimize total fleet cost as the secondary objective after maximising task assignment.

| | |
|---|---|
| **Feature** | `cost-based-route-optimization` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | cost-optimization, fuel-cost, route-costing, fleet-economics, tco |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/cost-based-route-optimization.blueprint.yaml) |
| **JSON API** | [cost-based-route-optimization.json]({{ site.baseurl }}/api/blueprints/workflow/cost-based-route-optimization.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Configures cost parameters per vehicle |
| `optimization_engine` | Optimization Engine | system | Evaluates route cost at every insertion and swap; selects the solution with lowest total cost among equal-assignment solutions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fixed_cost` | number | No | Fixed Cost |  |
| `cost_per_hour` | number | No | Cost Per Hour |  |
| `cost_per_km` | number | No | Cost Per km |  |
| `cost_per_task_hour` | number | No | Cost Per Task Hour |  |
| `route_cost` | number | No | Route Cost |  |
| `solution_total_cost` | number | No | Total Solution Cost |  |

## States

**State field:** `cost_evaluation_phase`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pre_solve` | Yes |  |
| `heuristic_phase` |  |  |
| `local_search_phase` |  |  |
| `solution_reported` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pre_solve` | `heuristic_phase` | optimization_engine |  |
|  | `heuristic_phase` | `local_search_phase` | optimization_engine |  |
|  | `local_search_phase` | `solution_reported` | optimization_engine |  |

## Rules

- **cost_formula:** Route cost = fixed_cost + (cost_per_hour x travel_hours) + (cost_per_km x distance_km) + (cost_per_task_hour x task_hours).
- **integer_arithmetic:** All costs are stored and evaluated as scaled integers internally to avoid floating-point rounding; output is rescaled to user-facing values.
- **cost_matrix_conflict:** A custom cost matrix for a vehicle may not be combined with per_hour or per_km cost parameters.
- **default_cost_equals_duration:** When only cost_per_hour is set to the default, cost equals travel duration in seconds.
- **heterogeneous_search:** When costs are heterogeneous across the fleet, the optimizer tries both availability-sorted and cost-sorted vehicle orderings.
- **lexicographic_objective:** Optimization objective is: 1. Maximise priority-weighted assignment, 2. Maximise assigned count, 3. Minimise total cost, 4. Minimise vehicles used, 5. Minimise duration, 6. Minimise distance.
- **fixed_cost_incentive:** fixed_cost incentivises using fewer vehicles; set to 0 to allow unconstrained vehicle use.

## Outcomes

### Cost_reported (Priority: 6)

**Given:**
- solve completed

**Then:**
- **emit_event** event: `solution.cost.reported`

**Result:** Each route includes a cost field; summary includes total cost across all routes.

### Distance_cost_applied (Priority: 7)

**Given:**
- cost_per_km > 0 for at least one vehicle

**Then:**
- **emit_event** event: `route.cost.distance_weighted`

**Result:** Route cost includes distance component; optimizer balances shorter routes against time efficiency.

### Fixed_cost_avoidance (Priority: 8)

**Given:**
- fixed_cost > 0 for some vehicles
- all tasks can be served by a smaller fleet

**Then:**
- **emit_event** event: `solution.fleet.reduced`

**Result:** Optimizer consolidates routes to avoid activating high-fixed-cost vehicles.

### Cost_minimised (Priority: 10)

**Given:**
- all tasks that can be assigned are assigned
- multiple route configurations have equal assignment

**Then:**
- **emit_event** event: `solution.cost.minimised`

**Result:** Solution with lowest total cost selected; route and summary objects include cost, duration, distance, and vehicle-count breakdowns.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COST_MATRIX_CONFLICT` | 400 | Custom cost matrix cannot be combined with per_hour or per_km vehicle cost parameters. | No |
| `COST_VALUE_OVERFLOW` | 400 | Cost values are too large and would cause an internal overflow. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `solution.cost.minimised` | Least-cost feasible solution selected from all search paths | `total_cost`, `routes_used`, `total_duration`, `total_distance` |
| `solution.fleet.reduced` | Fewer vehicles used to avoid fixed costs while maintaining assignment | `vehicles_used`, `vehicles_available`, `fixed_cost_saved` |
| `route.cost.distance_weighted` | Route cost includes per-kilometre distance component | `vehicle_id`, `distance_km`, `distance_cost` |
| `solution.cost.reported` | Final costs reported in solution output | `total_cost`, `per_route_costs`, `summary` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| multi-vehicle-route-optimization | required |  |
| distance-matrix-calculation | recommended |  |
| routing-profile-selection | optional |  |
| priority-urgency-weighting | recommended |  |

## AGI Readiness

### Goals

#### Reliable Cost Based Route Optimization

Configure per-vehicle cost models (fixed, per-hour travel, per-kilometre, per-task-hour) and minimize total fleet cost as the secondary objective after maximising task assignment.

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
| `multi_vehicle_route_optimization` | multi-vehicle-route-optimization | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| cost_minimised | `autonomous` | - | - |
| fixed_cost_avoidance | `autonomous` | - | - |
| distance_cost_applied | `autonomous` | - | - |
| cost_reported | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 8
  entry_points:
    - src/structures/vroom/vehicle.h
    - src/structures/vroom/cost_wrapper.h
    - src/structures/vroom/eval.h
    - src/structures/vroom/solution_indicators.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cost Based Route Optimization Blueprint",
  "description": "Configure per-vehicle cost models (fixed, per-hour travel, per-kilometre, per-task-hour) and minimize total fleet cost as the secondary objective after maximisi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cost-optimization, fuel-cost, route-costing, fleet-economics, tco"
}
</script>
