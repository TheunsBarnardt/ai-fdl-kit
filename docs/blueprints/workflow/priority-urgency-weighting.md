---
title: "Priority Urgency Weighting Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Assign an integer priority weight (0-100) to tasks so the optimizer preferentially assigns high-priority tasks first. Priority maximisation takes lexicographic "
---

# Priority Urgency Weighting Blueprint

> Assign an integer priority weight (0-100) to tasks so the optimizer preferentially assigns high-priority tasks first. Priority maximisation takes lexicographic precedence over cost minimisation.

| | |
|---|---|
| **Feature** | `priority-urgency-weighting` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | priority, urgency, task-ranking, service-level, sla |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/priority-urgency-weighting.blueprint.yaml) |
| **JSON API** | [priority-urgency-weighting.json]({{ site.baseurl }}/api/blueprints/workflow/priority-urgency-weighting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `operations_planner` | Operations Planner | human | Assigns priority values to tasks based on customer SLA or urgency |
| `optimization_engine` | Optimization Engine | system | Maximises total priority sum before minimising cost |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `task_priority` | number | No | Task Priority (0-100) |  |
| `priority_sum` | number | No | Priority Sum |  |
| `unassigned_priority_loss` | number | No | Unassigned Priority Loss |  |

## States

**State field:** `assignment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unassigned` | Yes |  |
| `assigned` |  | Yes |
| `evicted` |  |  |
| `final_unassigned` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unassigned` | `assigned` | optimization_engine |  |
|  | `assigned` | `evicted` | optimization_engine |  |
|  | `evicted` | `assigned` | optimization_engine |  |
|  | `evicted` | `final_unassigned` | optimization_engine |  |
|  | `unassigned` | `final_unassigned` | optimization_engine |  |

## Rules

- **priority_range:** Priority is an integer in [0, 100]; values outside this range are rejected as input errors.
- **lexicographic_objective:** The optimizer's primary objective is to maximise the sum of priorities of assigned tasks; cost minimisation is secondary.
- **priority_dominates_cost:** A higher-priority task unassigned is always worse than any increase in route cost from assigning it.
- **unassigned_high_priority:** When constraints prevent assigning a high-priority task to any vehicle, it is left unassigned and reported.
- **priority_replace_operator:** In local search, the PriorityReplace operator can evict a low-priority assigned task to make room for a higher-priority unassigned task.
- **shipment_priority:** For a shipment the priority contributes once to the sum when both stops are assigned.
- **same_priority_by_cost:** Tasks with the same priority are differentiated by cost in the objective.

## Outcomes

### Priority_task_unassigned (Priority: 5)

**Given:**
- no vehicle can accommodate the task within its constraints
- task has non-zero priority

**Then:**
- **emit_event** event: `task.priority.unassigned`

**Result:** Task reported in unassigned list.

### Priority_summary_reported (Priority: 6)

**Given:**
- solve completed

**Then:**
- **emit_event** event: `solution.priority.summary`

**Result:** Summary includes priority field showing total priority sum of all assigned tasks.

### Low_priority_evicted (Priority: 8)

**Given:**
- a higher-priority unassigned task can replace a lower-priority assigned task
- route remains feasible after the swap

**Then:**
- **emit_event** event: `task.priority.replaced`

**Result:** Lower-priority task removed; higher-priority task inserted. Evicted task may be re-inserted or left unassigned.

### High_priority_assigned (Priority: 10)

**Given:**
- at least one vehicle is compatible (skills, capacity, time windows)
- task has priority > 0

**Then:**
- **set_field** target: `priority_sum` — task priority added to route and solution priority totals
- **emit_event** event: `task.priority.assigned`

**Result:** Task appears in a vehicle route; its priority value is included in route and summary priority_sum fields.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRIORITY_OUT_OF_RANGE` | 400 | Task priority must be an integer between 0 and 100. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `task.priority.assigned` | High-priority task successfully placed in a vehicle route | `job_id`, `priority`, `vehicle_id` |
| `task.priority.replaced` | Lower-priority task evicted to accommodate higher-priority task | `evicted_job_id`, `evicted_priority`, `inserted_job_id`, `inserted_priority`, `vehicle_id` |
| `task.priority.unassigned` | Task with non-zero priority could not be assigned | `job_id`, `priority`, `reason` |
| `solution.priority.summary` | Total priority sum of assigned tasks reported in solution | `total_priority_sum`, `unassigned_priority_loss` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| multi-vehicle-route-optimization | recommended |  |
| skill-based-assignment | optional |  |
| time-window-constraints | optional |  |

## AGI Readiness

### Goals

#### Reliable Priority Urgency Weighting

Assign an integer priority weight (0-100) to tasks so the optimizer preferentially assigns high-priority tasks first. Priority maximisation takes lexicographic precedence over cost minimisation.

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
| high_priority_assigned | `autonomous` | - | - |
| low_priority_evicted | `autonomous` | - | - |
| priority_task_unassigned | `autonomous` | - | - |
| priority_summary_reported | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 6
  entry_points:
    - src/structures/typedefs.h
    - src/structures/vroom/job.h
    - src/structures/vroom/solution_indicators.h
    - src/structures/vroom/solution/summary.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Priority Urgency Weighting Blueprint",
  "description": "Assign an integer priority weight (0-100) to tasks so the optimizer preferentially assigns high-priority tasks first. Priority maximisation takes lexicographic ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "priority, urgency, task-ranking, service-level, sla"
}
</script>
