---
title: "Pickup Delivery Pairing Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Link a pickup and delivery stop as a paired shipment served by the same vehicle with pickup before delivery. Supports multidimensional load amounts and independ"
---

# Pickup Delivery Pairing Blueprint

> Link a pickup and delivery stop as a paired shipment served by the same vehicle with pickup before delivery. Supports multidimensional load amounts and independent time windows per stop.

| | |
|---|---|
| **Feature** | `pickup-delivery-pairing` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | pickup-delivery, pdp, shipments, paired-stops, precedence |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/pickup-delivery-pairing.blueprint.yaml) |
| **JSON API** | [pickup-delivery-pairing.json]({{ site.baseurl }}/api/blueprints/workflow/pickup-delivery-pairing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `shipper` | Shipper | human | Defines paired pickup and delivery locations and amounts |
| `fleet_manager` | Fleet Manager | human | Submits the problem including shipments |
| `optimization_engine` | Optimization Engine | system | Enforces precedence and same-vehicle constraints during route building |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pickup_id` | number | Yes | Pickup ID |  |
| `pickup_location` | json | Yes | Pickup Location |  |
| `pickup_time_windows` | json | No | Pickup Time Windows |  |
| `pickup_service_duration` | number | No | Pickup Service Duration (s) |  |
| `delivery_id` | number | Yes | Delivery ID |  |
| `delivery_location` | json | Yes | Delivery Location |  |
| `delivery_time_windows` | json | No | Delivery Time Windows |  |
| `delivery_service_duration` | number | No | Delivery Service Duration (s) |  |
| `shipment_amount` | json | No | Shipment Amount |  |
| `shipment_skills` | json | No | Required Skills |  |
| `shipment_priority` | number | No | Priority (0-100) |  |

## States

**State field:** `shipment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `assigned` |  |  |
| `pickup_done` |  |  |
| `delivered` |  | Yes |
| `unassigned` |  | Yes |
| `violated` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `assigned` | optimization_engine |  |
|  | `assigned` | `pickup_done` | optimization_engine |  |
|  | `pickup_done` | `delivered` | optimization_engine |  |
|  | `pending` | `unassigned` | optimization_engine |  |
|  | `assigned` | `violated` | optimization_engine |  |

## Rules

- **same_vehicle:** A pickup and its delivery must be served by the same vehicle; splitting a shipment across vehicles is forbidden.
- **pickup_before_delivery:** The pickup step must appear before the delivery step in the vehicle's route.
- **unique_ids:** Pickup and delivery IDs must be globally unique across all jobs and shipment steps.
- **capacity_tracking:** The shipment amount is loaded at pickup and removed at delivery; the vehicle must have sufficient capacity at both points.
- **skill_inheritance:** Skills defined on the shipment apply to both stops; the assigned vehicle must possess all listed skills.
- **priority_applies_to_both:** Priority defined on the shipment contributes to the objective for both stops.
- **independent_time_windows:** Pickup and delivery may have independent time windows; both must be feasibly schedulable on the same vehicle route.

## Outcomes

### Pickup_without_delivery (Priority: 3) — Error: `SHIPMENT_MISSING_COUNTERPART`

**Given:**
- plan/ETA mode active
- pickup step present in route but delivery step is absent

**Then:**
- **emit_event** event: `shipment.precedence.violated`

**Result:** precedence violation recorded; the unpaired stop is flagged.

### Precedence_violated_plan_mode (Priority: 4)

**Given:**
- plan/ETA mode active
- delivery step appears before pickup step in submitted route

**Then:**
- **emit_event** event: `shipment.precedence.violated`

**Result:** precedence violation recorded on the out-of-order step.

### Shipment_unassigned (Priority: 5)

**Given:**
- no vehicle has skills and capacity to serve both stops within their windows

**Then:**
- **emit_event** event: `shipment.unassigned`

**Result:** Both stops in solution unassigned array.

### Shipment_completed (Priority: 10)

**Given:**
- same vehicle serves both pickup and delivery stops
- pickup appears before delivery in the route
- vehicle capacity is not exceeded after loading at pickup

**Then:**
- **emit_event** event: `shipment.completed`

**Result:** Both steps in route with correct order; vehicle load increases at pickup and decreases at delivery.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SHIPMENT_DUPLICATE_ID` | 400 | Two pickup or two delivery steps share the same ID. | No |
| `SHIPMENT_MISSING_COUNTERPART` | 400 | A pickup or delivery step has no matching counterpart in the problem. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `shipment.completed` | Both pickup and delivery stops served in correct order by same vehicle | `pickup_id`, `delivery_id`, `vehicle_id`, `pickup_eta`, `delivery_eta` |
| `shipment.unassigned` | No feasible vehicle assignment found for this shipment | `pickup_id`, `delivery_id`, `reason` |
| `shipment.precedence.violated` | Plan mode — precedence or pairing constraint broken | `pickup_id`, `delivery_id`, `vehicle_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vrp-solving | required |  |
| vehicle-capacity-constraints | recommended |  |
| time-window-constraints | optional |  |
| skill-based-assignment | optional |  |
| stop-eta-calculation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Pickup Delivery Pairing

Link a pickup and delivery stop as a paired shipment served by the same vehicle with pickup before delivery. Supports multidimensional load amounts and independent time windows per stop.

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
| shipment_completed | `autonomous` | - | - |
| shipment_unassigned | `autonomous` | - | - |
| precedence_violated_plan_mode | `autonomous` | - | - |
| pickup_without_delivery | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/VROOM-Project/vroom
  project: VROOM
  tech_stack: C++20
  files_traced: 8
  entry_points:
    - src/structures/vroom/job.h
    - src/structures/typedefs.h
    - src/structures/vroom/solution/violations.h
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pickup Delivery Pairing Blueprint",
  "description": "Link a pickup and delivery stop as a paired shipment served by the same vehicle with pickup before delivery. Supports multidimensional load amounts and independ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "pickup-delivery, pdp, shipments, paired-stops, precedence"
}
</script>
