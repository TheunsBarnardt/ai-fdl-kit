---
title: "Distance Matrix Calculation Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Build a travel-time and distance matrix between all locations by querying a routing engine or accepting pre-supplied matrices. Underpins all cost evaluations an"
---

# Distance Matrix Calculation Blueprint

> Build a travel-time and distance matrix between all locations by querying a routing engine or accepting pre-supplied matrices. Underpins all cost evaluations and ETA calculations.

| | |
|---|---|
| **Feature** | `distance-matrix-calculation` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | distance-matrix, travel-time, routing-engine, matrix-computation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/distance-matrix-calculation.blueprint.yaml) |
| **JSON API** | [distance-matrix-calculation.json]({{ site.baseurl }}/api/blueprints/workflow/distance-matrix-calculation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `optimization_engine` | Optimization Engine | system | Requests matrices from routing engine and stores them for solving |
| `routing_engine` | Routing Engine | system | External service that returns pairwise travel times and distances |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `locations` | json | Yes | Locations |  |
| `duration_matrix` | json | No | Duration Matrix (s) |  |
| `distance_matrix` | json | No | Distance Matrix (m) |  |
| `cost_matrix` | json | No | Cost Matrix |  |
| `matrix_profile` | text | No | Routing Profile |  |
| `location_index` | number | No | Location Index |  |
| `snapping_radius_metres` | number | No | Snapping Radius (m) |  |

## States

**State field:** `matrix_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_built` | Yes |  |
| `building` |  |  |
| `built` |  | Yes |
| `error` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `not_built` | `building` | optimization_engine |  |
|  | `building` | `built` | routing_engine |  |
|  | `building` | `error` | routing_engine |  |

## Rules

- **one_matrix_per_profile:** A separate matrix is computed for each distinct vehicle profile; vehicles sharing a profile share a matrix.
- **custom_bypasses_engine:** If custom duration matrices are provided for all profiles no routing engine call is made.
- **distance_on_demand:** If distance matrices are omitted but distance-based costs or geometry are requested, the routing engine is queried separately for distances.
- **cost_matrix_conflict:** Custom cost matrices may not be combined with per_hour or per_km vehicle costs.
- **square_matrix:** All matrices must be square (N x N) where N is the number of distinct locations.
- **unfound_route_halts:** When a location cannot be snapped to the road network the routing engine reports an error which halts the solve.
- **integer_arithmetic:** Internally all durations and distances are scaled by fixed factors for consistent integer arithmetic; output is rescaled to user-facing seconds and metres.
- **sparse_matrix_mode:** Per-vehicle route requests are made for vehicles with predefined steps, updating only the relevant matrix cells.

## Outcomes

### Routing_error (Priority: 1) — Error: `MATRIX_ROUTING_ERROR`

**Given:**
- routing engine returns unfound route for at least one location pair

**Then:**
- **emit_event** event: `matrix.error`
- **transition_state** field: `matrix_state` from: `building` to: `error`

**Result:** Solve aborted; caller should check coordinates or supply a custom matrix.

### Sparse_matrix_update (Priority: 8)

**Given:**
- vehicles have predefined route steps (plan mode or initial routes)

**Then:**
- **emit_event** event: `matrix.sparse.updated`

**Result:** Only cells relevant to each vehicle's route are queried; reduces routing engine load.

### Matrix_from_custom_input (Priority: 9)

**Given:**
- caller provides duration_matrix and optionally distance_matrix or cost_matrix

**Then:**
- **emit_event** event: `matrix.built`
- **transition_state** field: `matrix_state` from: `building` to: `built`

**Result:** Custom matrix ingested directly; location_index fields used for lookup.

### Matrix_built_from_engine (Priority: 10)

**Given:**
- all vehicle and job coordinates are provided
- routing engine is reachable and can snap all locations

**Then:**
- **emit_event** event: `matrix.built`
- **transition_state** field: `matrix_state` from: `building` to: `built`

**Result:** Square N x N duration (and optionally distance) matrix stored per profile; optimizer proceeds.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MATRIX_ROUTING_ERROR` | 503 | Routing engine could not compute routes for one or more location pairs. | No |
| `MATRIX_SIZE_MISMATCH` | 400 | Provided matrix dimensions do not match the number of locations. | No |
| `MATRIX_COST_CONFLICT` | 400 | Custom cost matrix cannot be combined with per_hour or per_km vehicle costs. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `matrix.built` | Travel-time and distance matrix successfully computed for a profile | `profile`, `location_count`, `build_duration_ms` |
| `matrix.sparse.updated` | Sparse matrix cells updated for vehicles with predefined routes | `vehicle_id`, `route_length`, `cells_updated` |
| `matrix.error` | Matrix computation failed for a profile | `profile`, `problem_location`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| routing-profile-selection | required |  |
| stop-eta-calculation | required |  |
| cost-based-route-optimization | recommended |  |

## AGI Readiness

### Goals

#### Reliable Distance Matrix Calculation

Build a travel-time and distance matrix between all locations by querying a routing engine or accepting pre-supplied matrices. Underpins all cost evaluations and ETA calculations.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

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
| `routing_profile_selection` | routing-profile-selection | degrade |
| `stop_eta_calculation` | stop-eta-calculation | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| matrix_built_from_engine | `autonomous` | - | - |
| matrix_from_custom_input | `autonomous` | - | - |
| sparse_matrix_update | `supervised` | - | - |
| routing_error | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 9
  entry_points:
    - src/routing/wrapper.h
    - src/structures/generic/matrix.h
    - src/structures/vroom/matrices.h
    - src/structures/vroom/input/input.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Distance Matrix Calculation Blueprint",
  "description": "Build a travel-time and distance matrix between all locations by querying a routing engine or accepting pre-supplied matrices. Underpins all cost evaluations an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "distance-matrix, travel-time, routing-engine, matrix-computation"
}
</script>
