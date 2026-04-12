---
title: "Trip History Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Persistent history of completed and past trips per rider and per driver, including tracking numbers, activity timelines, and position trails for audit and repla"
---

# Trip History Blueprint

> Persistent history of completed and past trips per rider and per driver, including tracking numbers, activity timelines, and position trails for audit and replay.

| | |
|---|---|
| **Feature** | `trip-history` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | history, trips, tracking, audit, driver-history, rider-history |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/trip-history.blueprint.yaml) |
| **JSON API** | [trip-history.json]({{ site.baseurl }}/api/blueprints/data/trip-history.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Views their past rides and trip summaries. |
| `driver` | Driver | human | Views their completed trips and earnings history. |
| `operator` | Operator | human | Audits trip history across all drivers and customers. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Public identifier of the completed or past order. |  |
| `tracking_number` | text | Yes | Alphanumeric tracking reference visible to customers. |  |
| `customer_id` | text | No | Reference to the customer who requested the trip. |  |
| `driver_id` | text | No | Reference to the driver who fulfilled the trip. |  |
| `status` | text | Yes | Final status of the trip (completed, canceled). |  |
| `pickup_location` | json | No | Recorded pickup location. |  |
| `dropoff_location` | json | No | Recorded drop-off location. |  |
| `distance` | number | No | Total trip distance in meters. |  |
| `duration` | number | No | Total trip duration in seconds. |  |
| `started_at` | datetime | No | When the trip started (rider picked up). |  |
| `completed_at` | datetime | No | When the trip ended. |  |
| `tracking_statuses` | json | No | Chronological list of activity status changes with timestamps and locations. |  |
| `position_trail` | json | No | Sequence of GPS positions recorded during the trip for route replay. |  |
| `page` | number | No | Pagination cursor for listing history. |  |
| `limit` | number | No | Maximum number of results per page. |  |

## Rules

- **rule_01:** Trip history includes all orders associated with a given customer or driver, regardless of current status.
- **rule_02:** Queries can be filtered by status (completed, canceled), date range, customer ID, or driver ID.
- **rule_03:** Each order in history carries its tracking number, status, route summary, and timestamps.
- **rule_04:** Tracking statuses (activity log) are stored per order and ordered chronologically.
- **rule_05:** Position trail records are stored per order/driver and enable route replay with up to 50-meter resolution.
- **rule_06:** History is paginated; a limit and cursor/page parameter control the result window.
- **rule_07:** Operators can access all history within their organization; customers and drivers see only their own.

## Outcomes

### Driver_history_retrieved (Priority: 1)

**Given:**
- authenticated request to list orders filtered by driver_id

**Then:**
- **set_field** target: `response.orders` — Paginated list of orders where driver is the assigned driver, with summary fields.

**Result:** Driver sees their trip history with status, distance, duration, and timestamps.

### Customer_history_retrieved (Priority: 2)

**Given:**
- authenticated request to list orders filtered by customer_id

**Then:**
- **set_field** target: `response.orders` — Paginated list of orders linked to the customer.

**Result:** Customer sees all their past rides with tracking numbers and final statuses.

### Tracking_timeline_retrieved (Priority: 3)

**Given:**
- request for tracking statuses for a specific order

**Then:**
- **set_field** target: `response.tracking_statuses` — Ordered list of activity events, each with code, status label, timestamp, and location.

**Result:** Full activity timeline for the trip is returned.

### Position_trail_retrieved (Priority: 4)

**Given:**
- request for position history for a specific order and driver

**Then:**
- **set_field** target: `response.positions` — Ordered GPS positions with heading, speed, and altitude recorded at 50-meter intervals.

**Result:** Route of the trip can be replayed on a map.

### Order_not_found (Priority: 5) — Error: `ORDER_NOT_FOUND`

**Given:**
- requested order ID does not exist or belongs to a different organization

**Result:** 404 response is returned.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_NOT_FOUND` | 404 | The specified order could not be found. | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Every entry in trip history is a completed order from the lifecycle. |
| driver-location-streaming | recommended | Position records that make up the position trail are written during location streaming. |
| order-trip-state-machine | recommended | Tracking statuses are written at each state machine transition. |
| customer-app-flow | recommended | Customer app exposes trip history to riders. |
| driver-app-flow | recommended | Driver app exposes trip history to drivers. |

## AGI Readiness

### Goals

#### Reliable Trip History

Persistent history of completed and past trips per rider and per driver, including tracking numbers, activity timelines, and position trails for audit and replay.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `ride_request_lifecycle` | ride-request-lifecycle | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| driver_history_retrieved | `autonomous` | - | - |
| customer_history_retrieved | `autonomous` | - | - |
| tracking_timeline_retrieved | `autonomous` | - | - |
| position_trail_retrieved | `autonomous` | - | - |
| order_not_found | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Models/Order.php
    - src/Models/Driver.php
    - src/Models/TrackingNumber.php
    - src/Models/TrackingStatus.php
    - src/Models/Position.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip History Blueprint",
  "description": "Persistent history of completed and past trips per rider and per driver, including tracking numbers, activity timelines, and position trails for audit and repla",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "history, trips, tracking, audit, driver-history, rider-history"
}
</script>
