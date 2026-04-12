---
title: "Order Sla Eta Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Track estimated time of arrival and service level agreement compliance per delivery order. 12 fields. 5 outcomes. 2 error codes. rules: recalculate_on_position,"
---

# Order Sla Eta Blueprint

> Track estimated time of arrival and service level agreement compliance per delivery order

| | |
|---|---|
| **Feature** | `order-sla-eta` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, sla, eta, delivery, time, compliance, tracking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/order-sla-eta.blueprint.yaml) |
| **JSON API** | [order-sla-eta.json]({{ site.baseurl }}/api/blueprints/workflow/order-sla-eta.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | ETA Engine | system | Calculates and updates ETAs based on real-time position data |
| `dispatcher` | Dispatcher | human | Monitors SLA compliance and manages exceptions |
| `customer` | Customer | external | Recipient of ETA updates and SLA guarantees |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sla_record_id` | text | Yes | SLA Record ID |  |
| `order_uuid` | text | Yes | Order |  |
| `scheduled_at` | datetime | No | Scheduled Time |  |
| `estimated_arrival` | datetime | No | Estimated Arrival (ETA) |  |
| `actual_arrival` | datetime | No | Actual Arrival |  |
| `sla_target` | datetime | No | SLA Deadline |  |
| `elapsed_time` | number | No | Elapsed Time (s) |  |
| `remaining_time` | number | No | Remaining Time (s) |  |
| `distance_remaining` | number | No | Distance Remaining (m) |  |
| `sla_status` | select | Yes | SLA Status |  |
| `breach_reason` | text | No | Breach Reason |  |
| `eta_accuracy` | number | No | ETA Accuracy (%) |  |

## States

**State field:** `sla_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `on_time` | Yes |  |
| `at_risk` |  |  |
| `breached` |  | Yes |
| `met` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `on_time` | `at_risk` | system |  |
|  | `at_risk` | `breached` | system |  |
|  | `on_time` | `met` | system |  |
|  | `at_risk` | `met` | system |  |

## Rules

- **recalculate_on_position:** ETA is recalculated every time a new driver position update is received
- **eta_factors:** ETA calculation factors in remaining route distance, current speed, and traffic conditions
- **at_risk_threshold:** When ETA exceeds SLA target by more than the configured warning threshold, status transitions to at_risk
- **at_risk_notification:** Dispatcher is notified when an order transitions to at_risk status
- **breach_recording:** SLA breach is recorded when the order is not completed by the SLA deadline
- **milestone_notifications:** Customers receive ETA update notifications at configurable milestones (e.g., 30 min away)
- **accuracy_tracking:** Historical ETA accuracy is tracked per driver and route for model improvement
- **per_service_sla:** SLA configurations can be defined per service type, customer tier, or service area
- **scheduled_sla:** Scheduled orders have their SLA target set at the time of scheduling
- **breach_review:** Breached SLA records are flagged for review and compensation processing

## Outcomes

### Eta_calculated (Priority: 1)

**Given:**
- driver position update received for active order
- `distance_remaining` (computed) gt `0`

**Then:**
- **set_field** target: `estimated_arrival` value: `calculated_eta`
- **set_field** target: `remaining_time` value: `calculated`
- **emit_event** event: `sla.eta_updated`

**Result:** ETA updated based on current driver position

### Sla_at_risk (Priority: 2)

**Given:**
- estimated_arrival exceeds sla_target by more than warning_threshold
- `sla_status` (db) eq `on_time`

**Then:**
- **set_field** target: `sla_status` value: `at_risk`
- **emit_event** event: `sla.at_risk`

**Result:** SLA flagged as at-risk; dispatcher alerted

### Sla_breached (Priority: 3)

**Given:**
- sla_target has passed
- order is not yet completed

**Then:**
- **set_field** target: `sla_status` value: `breached`
- **emit_event** event: `sla.breached`

**Result:** SLA breach recorded; review and compensation triggered

### Sla_met (Priority: 4)

**Given:**
- order.completed event received
- actual_arrival is before or at sla_target

**Then:**
- **set_field** target: `sla_status` value: `met`
- **set_field** target: `actual_arrival` value: `now`
- **emit_event** event: `sla.met`

**Result:** Delivery completed within SLA

### Eta_customer_notification (Priority: 5)

**Given:**
- remaining_time crossed a configured notification milestone

**Then:**
- **emit_event** event: `sla.eta_milestone_reached`

**Result:** Customer notified of upcoming delivery ETA

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLA_CALCULATION_FAILED` | 500 | ETA could not be calculated at this time. | No |
| `SLA_NO_TARGET_DEFINED` | 422 | No SLA target is configured for this order type. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sla.eta_updated` | Fired each time ETA is recalculated | `order_uuid`, `estimated_arrival`, `distance_remaining`, `remaining_time` |
| `sla.at_risk` | Fired when ETA exceeds SLA target warning threshold | `order_uuid`, `estimated_arrival`, `sla_target` |
| `sla.breached` | Fired when SLA deadline is exceeded without completion | `order_uuid`, `sla_target`, `breach_reason` |
| `sla.met` | Fired when order is completed within SLA | `order_uuid`, `actual_arrival`, `sla_target` |
| `sla.eta_milestone_reached` | Fired when ETA crosses a configured notification milestone | `order_uuid`, `customer_uuid`, `estimated_arrival`, `remaining_time` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | SLA tracking is linked to order lifecycle events |
| realtime-driver-tracking | required | Driver position feeds ETA recalculations |
| route-planning | required | Remaining route distance is used for ETA calculation |
| delivery-notifications | recommended | ETA milestones trigger customer notifications |

## AGI Readiness

### Goals

#### Reliable Order Sla Eta

Track estimated time of arrival and service level agreement compliance per delivery order

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
| `order_lifecycle` | order-lifecycle | degrade |
| `realtime_driver_tracking` | realtime-driver-tracking | degrade |
| `route_planning` | route-planning | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| eta_calculated | `autonomous` | - | - |
| sla_at_risk | `autonomous` | - | - |
| sla_breached | `autonomous` | - | - |
| sla_met | `autonomous` | - | - |
| eta_customer_notification | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Sla Eta Blueprint",
  "description": "Track estimated time of arrival and service level agreement compliance per delivery order. 12 fields. 5 outcomes. 2 error codes. rules: recalculate_on_position,",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, sla, eta, delivery, time, compliance, tracking"
}
</script>
