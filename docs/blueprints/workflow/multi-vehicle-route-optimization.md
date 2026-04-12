---
title: "Multi Vehicle Route Optimization Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Distribute tasks across a heterogeneous fleet, building one ordered route per vehicle that collectively covers all assignable tasks while minimising total fleet"
---

# Multi Vehicle Route Optimization Blueprint

> Distribute tasks across a heterogeneous fleet, building one ordered route per vehicle that collectively covers all assignable tasks while minimising total fleet cost.

| | |
|---|---|
| **Feature** | `multi-vehicle-route-optimization` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet-management, route-optimization, multi-vehicle, logistics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/multi-vehicle-route-optimization.blueprint.yaml) |
| **JSON API** | [multi-vehicle-route-optimization.json]({{ site.baseurl }}/api/blueprints/workflow/multi-vehicle-route-optimization.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Defines the fleet and the set of tasks to complete |
| `dispatcher` | Dispatcher | human | Reviews and adjusts generated routes before dispatch |
| `optimization_engine` | Optimization Engine | system | Constructs and refines routes across all vehicles concurrently |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | number | Yes | Vehicle ID |  |
| `vehicle_start` | json | No | Start Location |  |
| `vehicle_end` | json | No | End Location |  |
| `vehicle_description` | text | No | Vehicle Description |  |
| `vehicle_type` | text | No | Vehicle Type |  |
| `max_tasks` | number | No | Max Tasks |  |
| `max_travel_time` | number | No | Max Travel Time (s) |  |
| `max_distance` | number | No | Max Distance (m) |  |
| `speed_factor` | number | No | Speed Factor |  |

## States

**State field:** `fleet_route_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unoptimized` | Yes |  |
| `optimizing` |  |  |
| `optimized` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unoptimized` | `optimizing` | fleet_manager |  |
|  | `optimizing` | `optimized` | optimization_engine |  |

## Rules

- **one_route_per_vehicle:** Each vehicle produces at most one route; a vehicle may be unused if no tasks are assigned.
- **vehicle_sort_order:** Vehicles are sorted by decreasing max_tasks, capacity, time-window length, and range bounds before heuristic construction.
- **heterogeneous_cost_search:** When the fleet has heterogeneous costs, both availability-sorted and cost-sorted orderings are tried and the better result kept.
- **route_feasibility:** A route is valid only if it respects capacity, skill, time-window, max_tasks, max_travel_time, and max_distance for every step.
- **unassigned_not_error:** Unassigned tasks are reported in the solution; they do not cause an error.
- **open_trip:** If only start or only end is specified the route is an open trip; the free endpoint is placed at the first or last task.
- **round_trip:** A round trip is formed by setting start and end to the same location.
- **parallel_search:** Parallel threads run independent search paths; the path with the lowest lexicographic cost indicator is selected.

## Outcomes

### Single_vehicle_tsp (Priority: 5)

**Given:**
- only one vehicle is defined or has compatible skills for all tasks

**Then:**
- **emit_event** event: `fleet.routes.optimized`

**Result:** Solution degenerates to TSP; one route returned for the single vehicle.

### Partial_assignment (Priority: 7)

**Given:**
- some tasks cannot be assigned due to capacity, skill, or range limits

**Then:**
- **emit_event** event: `fleet.routes.optimized`
- **transition_state** field: `fleet_route_status` from: `optimizing` to: `optimized`

**Result:** Optimised routes returned with unassigned list.

### All_tasks_assigned (Priority: 10)

**Given:**
- fleet has sufficient capacity and compatible skills for all jobs
- all time windows and range constraints are satisfiable

**Then:**
- **emit_event** event: `fleet.routes.optimized`
- **transition_state** field: `fleet_route_status` from: `optimizing` to: `optimized`

**Result:** Every task assigned; summary reports zero unassigned, total cost, duration, and distance.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FLEET_NO_VEHICLES` | 400 | No vehicles defined in the problem. | No |
| `FLEET_NO_TASKS` | 400 | No jobs or shipments defined in the problem. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fleet.routes.optimized` | Multi-vehicle route optimization completed | `vehicle_routes`, `unassigned_tasks`, `summary` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| vehicle-capacity-constraints | optional |  |
| time-window-constraints | optional |  |
| skill-based-assignment | optional |  |
| cost-based-route-optimization | optional |  |
| routing-profile-selection | optional |  |
| distance-matrix-calculation | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 15
  entry_points:
    - src/structures/vroom/vehicle.h
    - src/problems/vrp.h
    - src/structures/vroom/solution/route.h
    - src/algorithms/heuristics/heuristics.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Multi Vehicle Route Optimization Blueprint",
  "description": "Distribute tasks across a heterogeneous fleet, building one ordered route per vehicle that collectively covers all assignable tasks while minimising total fleet",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet-management, route-optimization, multi-vehicle, logistics"
}
</script>
