---
title: "Route Planning Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Plan multi-stop delivery routes with ordered waypoints, route optimization, and distance/time estimation. 13 fields. 5 outcomes. 3 error codes. rules: minimum_w"
---

# Route Planning Blueprint

> Plan multi-stop delivery routes with ordered waypoints, route optimization, and distance/time estimation

| | |
|---|---|
| **Feature** | `route-planning` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, route, waypoints, stops, navigation, optimization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/route-planning.blueprint.yaml) |
| **JSON API** | [route-planning.json]({{ site.baseurl }}/api/blueprints/workflow/route-planning.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Operations staff defining delivery routes |
| `driver` | Driver | human | Driver executing the route |
| `system` | Routing Engine | system | Route calculation and optimization service |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `route_uuid` | text | Yes | Route ID |  |
| `order_uuid` | text | Yes | Order |  |
| `payload_uuid` | text | Yes | Payload |  |
| `pickup_uuid` | text | Yes | Pickup Location |  |
| `dropoff_uuid` | text | Yes | Dropoff Location |  |
| `return_uuid` | text | No | Return Location |  |
| `current_waypoint_uuid` | text | No | Current Waypoint |  |
| `waypoints` | json | No | Waypoints |  |
| `total_distance` | number | No | Total Distance (m) |  |
| `total_time` | number | No | Total Time (s) |  |
| `is_route_optimized` | boolean | No | Route Optimized |  |
| `route_details` | json | No | Turn-by-Turn Details |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `planned` |  |  |
| `active` |  |  |
| `completed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `planned` | system |  |
|  | `planned` | `active` | driver |  |
|  | `active` | `completed` | driver |  |

## Rules

- **minimum_waypoints:** A route must have at least one pickup and one dropoff location
- **sequential_waypoints:** Waypoints are ordered; the driver must visit them in sequence
- **optimization_preserves_endpoints:** Route optimization reorders intermediate stops while preserving first pickup and last dropoff
- **geospatial_calculation:** Distance and time estimates are calculated using a geospatial routing service
- **waypoint_advancement:** When a waypoint is completed, current_waypoint_uuid advances to the next stop
- **per_waypoint_tracking:** Each waypoint has its own tracking number for independent status updates
- **dispatcher_approval_for_changes:** Adding or removing waypoints after dispatch requires dispatcher approval
- **round_trip_support:** Round-trip routes include a return waypoint equal to the origin
- **audit_route_details:** Route details including turn-by-turn data are stored for auditing and replay
- **valid_coordinates:** Each place reference must have valid latitude and longitude coordinates

## Outcomes

### Route_created (Priority: 1)

**Given:**
- `pickup_uuid` (input) exists
- `dropoff_uuid` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `route.created`

**Result:** Route created with calculated distance and time

### Missing_coordinates (Priority: 1) — Error: `ROUTE_MISSING_COORDINATES`

**Given:**
- a place reference has no valid coordinates

**Result:** Route creation failed — location coordinates missing

### Route_optimized (Priority: 2)

**Given:**
- route has 3 or more waypoints
- optimization has not been applied

**Then:**
- **set_field** target: `is_route_optimized` value: `true`
- **set_field** target: `waypoints` value: `optimized_order`
- **emit_event** event: `route.optimized`

**Result:** Waypoint order optimized to minimize travel distance

### Waypoint_completed (Priority: 3)

**Given:**
- driver confirms arrival at current waypoint

**Then:**
- **set_field** target: `current_waypoint_uuid` value: `next_waypoint`
- **emit_event** event: `route.waypoint_completed`

**Result:** Current waypoint marked complete; driver advances to next stop

### Route_completed (Priority: 4)

**Given:**
- all waypoints are completed

**Then:**
- **set_field** target: `status` value: `completed`
- **emit_event** event: `route.completed`

**Result:** All stops visited; route is complete

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ROUTE_MISSING_COORDINATES` | 422 | One or more locations are missing valid coordinates. | No |
| `ROUTE_CALCULATION_FAILED` | 500 | Route could not be calculated. Please check all locations and try again. | No |
| `ROUTE_INVALID_WAYPOINT_ORDER` | 422 | Waypoint sequence is invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `route.created` | Fired when a route is calculated for an order | `route_uuid`, `order_uuid`, `total_distance`, `total_time`, `waypoint_count` |
| `route.optimized` | Fired when waypoint order is optimized | `route_uuid`, `total_distance`, `total_time` |
| `route.waypoint_completed` | Fired when a driver completes a waypoint stop | `route_uuid`, `completed_waypoint_uuid`, `next_waypoint_uuid` |
| `route.completed` | Fired when all route waypoints are completed | `route_uuid`, `order_uuid` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Routes are created for and attached to orders |
| realtime-driver-tracking | recommended | Driver position is tracked against route progress |
| order-sla-eta | recommended | Route time estimates feed into ETA calculations |
| proof-of-delivery | optional | POD collected at final delivery waypoint |

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
  "name": "Route Planning Blueprint",
  "description": "Plan multi-stop delivery routes with ordered waypoints, route optimization, and distance/time estimation. 13 fields. 5 outcomes. 3 error codes. rules: minimum_w",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, route, waypoints, stops, navigation, optimization"
}
</script>
