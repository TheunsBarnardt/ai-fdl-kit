---
title: "Eta Calculation Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Calculate estimated time of arrival and driving distance between two geographic points, supporting both preliminary (straight-line) and precise (routing-based) "
---

# Eta Calculation Blueprint

> Calculate estimated time of arrival and driving distance between two geographic points, supporting both preliminary (straight-line) and precise (routing-based) calculations.

| | |
|---|---|
| **Feature** | `eta-calculation` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | eta, routing, distance, geospatial, matrix |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/eta-calculation.blueprint.yaml) |
| **JSON API** | [eta-calculation.json]({{ site.baseurl }}/api/blueprints/data/eta-calculation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `platform` | Platform | system | Computes ETAs on order creation and on demand via the distance-and-time endpoint. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `origin_latitude` | number | Yes | Latitude of the start point. |  |
| `origin_longitude` | number | Yes | Longitude of the start point. |  |
| `destination_latitude` | number | Yes | Latitude of the destination. |  |
| `destination_longitude` | number | Yes | Longitude of the destination. |  |
| `distance_meters` | number | No | Computed driving distance in meters. |  |
| `duration_seconds` | number | No | Computed driving duration in seconds. |  |
| `order_id` | text | No | Order the ETA is being computed for. |  |

## Rules

- **rule_01:** A preliminary distance and time estimate is computed at order creation from the pickup to the first waypoint (or drop-off).
- **rule_02:** The preliminary estimate uses a fast approximate method (geodesic calculation); precise routing is done on demand.
- **rule_03:** The on-demand distance-and-time endpoint returns real driving distance and time using a routing engine (e.g., OSRM).
- **rule_04:** Both origin and destination must be valid non-null geographic coordinates.
- **rule_05:** Calculated distance (meters) and time (seconds) are stored on the order record.
- **rule_06:** ETA can be recalculated at any point during the trip by calling the distance-and-time endpoint.

## Outcomes

### Preliminary_eta_computed (Priority: 1)

**Given:**
- order is created with valid pickup and drop-off coordinates

**Then:**
- **set_field** target: `order.distance` — Approximate geodesic distance in meters stored on the order.
- **set_field** target: `order.estimated_time` — Approximate travel time in seconds stored on the order.

**Result:** Order record carries initial distance and ETA estimates available immediately after creation.

### Precise_eta_computed (Priority: 2)

**Given:**
- caller requests distance-and-time for an order
- order has valid origin and destination coordinates

**Then:**
- **set_field** target: `order.distance` — Actual driving distance in meters updated from routing engine response.
- **set_field** target: `order.estimated_time` — Actual driving duration in seconds updated from routing engine response.

**Result:** Order's distance and ETA are updated with precise driving route data.

### Eta_unavailable (Priority: 3) — Error: `ETA_COORDINATES_MISSING`

**Given:**
- origin or destination coordinates are null or invalid

**Result:** ETA calculation is skipped; order is created without preliminary estimates.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ETA_COORDINATES_MISSING` | 400 | Cannot compute ETA: pickup or drop-off coordinates are missing. | No |
| `ROUTING_ENGINE_UNAVAILABLE` | 400 | Routing service is temporarily unavailable. Distance estimate may be approximate. | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Preliminary ETA is computed at order creation; used for customer-facing estimates. |
| customer-app-flow | recommended | Customer app surfaces ETA to pickup and ETA to drop-off. |
| driver-location-streaming | recommended | Live driver position enables dynamic ETA recalculation. |

## AGI Readiness

### Goals

#### Reliable Eta Calculation

Calculate estimated time of arrival and driving distance between two geographic points, supporting both preliminary (straight-line) and precise (routing-based) calculations.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

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
| preliminary_eta_computed | `autonomous` | - | - |
| precise_eta_computed | `autonomous` | - | - |
| eta_unavailable | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 3
  entry_points:
    - src/Models/Order.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Support/Utils.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Eta Calculation Blueprint",
  "description": "Calculate estimated time of arrival and driving distance between two geographic points, supporting both preliminary (straight-line) and precise (routing-based) ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "eta, routing, distance, geospatial, matrix"
}
</script>
