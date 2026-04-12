---
title: "Skill Based Assignment Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Restrict which vehicles may serve which tasks by tagging each task with required skills and each vehicle with held skills. A vehicle may only serve a task if it"
---

# Skill Based Assignment Blueprint

> Restrict which vehicles may serve which tasks by tagging each task with required skills and each vehicle with held skills. A vehicle may only serve a task if it holds every required skill.

| | |
|---|---|
| **Feature** | `skill-based-assignment` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | skill-matching, driver-competency, task-qualification, workforce-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/skill-based-assignment.blueprint.yaml) |
| **JSON API** | [skill-based-assignment.json]({{ site.baseurl }}/api/blueprints/workflow/skill-based-assignment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Assigns skill sets to vehicles |
| `operations_planner` | Operations Planner | human | Specifies required skills on tasks and shipments |
| `optimization_engine` | Optimization Engine | system | Pre-filters vehicle-to-task compatibility using skill intersection |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_skills` | json | No | Vehicle Skills |  |
| `job_skills` | json | No | Required Job Skills |  |
| `shipment_skills` | json | No | Required Shipment Skills |  |
| `skill_id` | number | No | Skill ID |  |

## States

**State field:** `skill_compatibility`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `compatible` | Yes |  |
| `incompatible` |  |  |
| `violation` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `compatible` | `incompatible` | optimization_engine |  |
|  | `compatible` | `violation` | optimization_engine |  |

## Rules

- **superset_required:** A vehicle may serve a task only if the vehicle's skill set contains all of the task's required skills.
- **opaque_identifiers:** Skills are opaque integer identifiers; the system does not interpret their meaning — that is the operator's responsibility.
- **empty_vehicle_skills:** A vehicle with no skills defined has an empty skill set; it can only serve tasks with no required skills.
- **empty_task_skills:** A task with no required skills can be served by any vehicle regardless of the vehicle's skills.
- **precomputed_compatibility:** Skill compatibility is computed once at load time as a matrix; it does not change during solving.
- **unassigned_when_no_match:** If no vehicle holds the skills required by a task, the task cannot be assigned and is reported as unassigned.
- **skills_violation_plan_mode:** In plan mode, assigning a task to a vehicle lacking required skills is recorded as a skills violation.

## Outcomes

### Skill_violation_plan_mode (Priority: 4)

**Given:**
- plan/ETA mode active
- submitted route assigns task to vehicle missing required skills

**Then:**
- **emit_event** event: `task.skill.violated`

**Result:** skills violation recorded on the affected step and route.

### Task_unassigned_no_match (Priority: 5)

**Given:**
- no vehicle in the fleet holds all required skills for this task

**Then:**
- **emit_event** event: `task.unassigned`

**Result:** Task reported as unassigned; operator should add a compatible vehicle or relax skill requirements.

### Incompatible_skipped (Priority: 7)

**Given:**
- vehicle_skills does not contain all job_skills
- standard solving mode

**Then:**
- **emit_event** event: `task.skill.rejected`

**Result:** Vehicle excluded from consideration for this task; no violation recorded.

### Compatible_assignment (Priority: 10)

**Given:**
- vehicle_skills is a superset of job_skills

**Then:**
- **emit_event** event: `task.skill.matched`

**Result:** Vehicle is eligible for this task; optimizer may assign it subject to other constraints.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SKILL_NO_COMPATIBLE_VEHICLE` | 422 | No vehicle holds the required skills for this task. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `task.skill.matched` | Vehicle confirmed compatible with task skill requirements | `vehicle_id`, `job_id`, `matched_skills` |
| `task.skill.rejected` | Vehicle lacks required skills for a task; skipped during optimization | `vehicle_id`, `job_id`, `missing_skills` |
| `task.skill.violated` | Plan mode — task assigned to incompatible vehicle | `vehicle_id`, `job_id`, `missing_skills` |
| `task.unassigned` | No compatible vehicle found; task left unassigned | `job_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| multi-vehicle-route-optimization | required |  |
| pickup-delivery-pairing | optional |  |
| driver-shift-break-constraints | optional |  |

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
    - src/structures/vroom/vehicle.h
    - src/structures/vroom/job.h
    - src/structures/vroom/solution/violations.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Skill Based Assignment Blueprint",
  "description": "Restrict which vehicles may serve which tasks by tagging each task with required skills and each vehicle with held skills. A vehicle may only serve a task if it",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "skill-matching, driver-competency, task-qualification, workforce-management"
}
</script>
