---
title: "Vehicle Capacity Constraints Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Model multidimensional load limits (weight, volume, items) for vehicles and ensure cumulative load never exceeds capacity at any point in the route.. 6 fields. "
---

# Vehicle Capacity Constraints Blueprint

> Model multidimensional load limits (weight, volume, items) for vehicles and ensure cumulative load never exceeds capacity at any point in the route.

| | |
|---|---|
| **Feature** | `vehicle-capacity-constraints` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | capacity-planning, load-management, cvrp, logistics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-capacity-constraints.blueprint.yaml) |
| **JSON API** | [vehicle-capacity-constraints.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-capacity-constraints.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Defines vehicle capacities and job load amounts |
| `optimization_engine` | Optimization Engine | system | Tracks cumulative load through each route and enforces capacity |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_capacity` | json | Yes | Vehicle Capacity |  |
| `job_delivery` | json | No | Delivery Amount |  |
| `job_pickup` | json | No | Pickup Amount |  |
| `shipment_amount` | json | No | Shipment Amount |  |
| `current_load` | json | No | Current Load |  |
| `break_max_load` | json | No | Break Max Load |  |

## States

**State field:** `load_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `empty` | Yes |  |
| `loaded` |  |  |
| `in_transit` |  |  |
| `over_capacity` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `empty` | `loaded` | optimization_engine |  |
|  | `loaded` | `in_transit` | optimization_engine |  |
|  | `in_transit` | `over_capacity` | optimization_engine |  |

## Rules

- **consistent_dimensions:** All capacity arrays must have the same number of dimensions across vehicles, jobs, and shipments.
- **per_dimension_check:** Capacity is checked per dimension independently; every dimension must be within bounds simultaneously.
- **delivery_preloaded:** Delivery amounts are pre-loaded onto the vehicle before the route starts and reduced at each delivery stop.
- **pickup_accumulates:** Pickup amounts accumulate on the vehicle as pickup stops are served.
- **infeasible_rejection:** A route is infeasible if vehicle load exceeds capacity in any dimension at any point; such routes are rejected during construction.
- **break_max_load_rule:** If break_max_load is set, a break may only be scheduled when vehicle load is at or below the maximum on all dimensions.
- **zero_capacity:** Capacity dimension count of zero means no capacity constraint is applied.

## Outcomes

### Capacity_exceeded_plan_mode (Priority: 4)

**Given:**
- plan/ETA mode is active
- vehicle load exceeds capacity at some step

**Then:**
- **emit_event** event: `route.capacity.violated`

**Result:** Violation of type load recorded in step and route.

### Capacity_exceeded_solving (Priority: 5)

**Given:**
- route would require vehicle to carry more than capacity on at least one dimension
- standard solving mode

**Then:**
- **emit_event** event: `job.unassigned`

**Result:** Job not added to this vehicle's route; optimizer tries other vehicles or leaves unassigned.

### Break_load_enforced (Priority: 6)

**Given:**
- break has max_load defined
- vehicle load at scheduled break time exceeds break max_load on any dimension

**Then:**
- **emit_event** event: `break.rescheduled`

**Result:** Break deferred until load drops below max_load, or reported as max_load violation in plan mode.

### Capacity_satisfied (Priority: 10)

**Given:**
- sum of pickups minus deliveries does not exceed vehicle capacity on any dimension
- at every step the running load is within bounds

**Then:**
- **set_field** target: `current_load` — load after each step recorded in solution
- **emit_event** event: `route.capacity.valid`

**Result:** Route is feasible; step-level load reported in solution output.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CAPACITY_DIMENSION_MISMATCH` | 400 | Capacity arrays have different lengths across vehicles, jobs, or shipments. | No |
| `CAPACITY_NEGATIVE_VALUE` | 400 | A capacity or amount value is negative. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `route.capacity.valid` | All stops served within vehicle capacity limits | `vehicle_id`, `max_load_reached`, `dimensions` |
| `route.capacity.violated` | Vehicle load exceeds capacity at a step (plan mode) | `vehicle_id`, `step_id`, `exceeded_dimension`, `load`, `capacity` |
| `job.unassigned` | Job could not be placed on any vehicle without violating capacity | `job_id`, `reason` |
| `break.rescheduled` | Break deferred due to max_load constraint | `vehicle_id`, `break_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| multi-vehicle-route-optimization | required |  |
| driver-shift-break-constraints | optional |  |
| pickup-delivery-pairing | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 6
  entry_points:
    - src/structures/vroom/amount.h
    - src/structures/vroom/vehicle.h
    - src/structures/vroom/job.h
    - src/structures/vroom/break.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Capacity Constraints Blueprint",
  "description": "Model multidimensional load limits (weight, volume, items) for vehicles and ensure cumulative load never exceeds capacity at any point in the route.. 6 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "capacity-planning, load-management, cvrp, logistics"
}
</script>
