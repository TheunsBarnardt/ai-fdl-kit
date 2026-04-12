---
title: "Routing Profile Selection Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Associate each vehicle with a named routing profile (car, truck, hgv, bike) so travel time and distance matrices use road network rules appropriate for that veh"
---

# Routing Profile Selection Blueprint

> Associate each vehicle with a named routing profile (car, truck, hgv, bike) so travel time and distance matrices use road network rules appropriate for that vehicle class.

| | |
|---|---|
| **Feature** | `routing-profile-selection` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | routing-profile, hgv, truck-routing, road-restrictions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/routing-profile-selection.blueprint.yaml) |
| **JSON API** | [routing-profile-selection.json]({{ site.baseurl }}/api/blueprints/workflow/routing-profile-selection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Assigns routing profiles to vehicles |
| `routing_engine` | Routing Engine | system | Computes travel time/distance matrices per profile |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_profile` | text | No | Routing Profile |  |
| `speed_factor` | number | No | Speed Factor |  |
| `profile_duration_matrix` | json | No | Duration Matrix |  |
| `profile_distance_matrix` | json | No | Distance Matrix |  |
| `profile_cost_matrix` | json | No | Cost Matrix |  |

## States

**State field:** `matrix_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `fetching` |  |  |
| `ready` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `fetching` | routing_engine |  |
|  | `fetching` | `ready` | routing_engine |  |
|  | `fetching` | `failed` | routing_engine |  |

## Rules

- **one_matrix_per_profile:** Each distinct profile in the fleet triggers one separate matrix retrieval from the routing engine.
- **custom_matrix_bypasses_engine:** When custom matrices are provided for a profile, no routing engine call is made.
- **cost_matrix_conflict:** A custom cost matrix and a per_hour or per_km vehicle cost cannot be used together; this combination is rejected.
- **profiles_are_opaque:** Profiles are treated as opaque strings; the optimizer does not interpret them — only the routing engine does.
- **shared_profile_matrix:** If all vehicles share the same profile, a single matrix fetch is made.
- **speed_factor_scales_duration:** speed_factor scales the duration matrix values after retrieval; distance values are unaffected.
- **geometry_per_profile:** When geometry output is requested, polyline-encoded route geometry is fetched per vehicle using the vehicle's profile.

## Outcomes

### Routing_engine_error (Priority: 2) — Error: `ROUTING_ENGINE_ERROR`

**Given:**
- routing engine returns error or one or more locations are unreachable

**Then:**
- **emit_event** event: `routing.matrix.failed`

**Result:** Solve aborted with routing error; caller should verify coordinates or supply a custom matrix.

### Speed_factor_applied (Priority: 7)

**Given:**
- speed_factor is set to a value other than 1.0 for a vehicle

**Then:**
- **emit_event** event: `routing.matrix.scaled`

**Result:** All travel durations for this vehicle scaled by speed_factor.

### Matrix_from_custom_input (Priority: 9)

**Given:**
- custom duration matrix provided in problem input for this profile

**Then:**
- **emit_event** event: `routing.matrix.ready`

**Result:** Custom matrix used directly; no routing engine call made.

### Matrix_ready (Priority: 10)

**Given:**
- routing engine is reachable
- all vehicle locations can be snapped to the road network for this profile

**Then:**
- **emit_event** event: `routing.matrix.ready`

**Result:** Duration (and optionally distance) matrix stored for this profile; optimizer proceeds to solving.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ROUTING_ENGINE_ERROR` | 503 | Routing engine unreachable or returned unfound routes for one or more locations. | No |
| `ROUTING_PROFILE_COST_CONFLICT` | 400 | Custom cost matrix cannot be combined with per_hour or per_km vehicle costs. | No |
| `ROUTING_INVALID_SPEED_FACTOR` | 400 | speed_factor must be greater than 0 and at most 5. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `routing.matrix.ready` | Travel matrix successfully obtained for a routing profile | `profile`, `matrix_size`, `retrieval_duration_ms` |
| `routing.matrix.failed` | Could not retrieve matrix for the routing profile | `profile`, `error_message`, `problem_location` |
| `routing.matrix.scaled` | Duration matrix scaled by speed_factor for a vehicle | `vehicle_id`, `profile`, `speed_factor` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| distance-matrix-calculation | required |  |
| multi-vehicle-route-optimization | recommended |  |
| cost-based-route-optimization | optional |  |

## AGI Readiness

### Goals

#### Reliable Routing Profile Selection

Associate each vehicle with a named routing profile (car, truck, hgv, bike) so travel time and distance matrices use road network rules appropriate for that vehicle class.

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
| matrix_ready | `autonomous` | - | - |
| matrix_from_custom_input | `autonomous` | - | - |
| routing_engine_error | `autonomous` | - | - |
| speed_factor_applied | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 7
  entry_points:
    - src/routing/wrapper.h
    - src/routing/http_wrapper.h
    - src/structures/vroom/vehicle.h
    - src/structures/typedefs.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Routing Profile Selection Blueprint",
  "description": "Associate each vehicle with a named routing profile (car, truck, hgv, bike) so travel time and distance matrices use road network rules appropriate for that veh",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "routing-profile, hgv, truck-routing, road-restrictions"
}
</script>
