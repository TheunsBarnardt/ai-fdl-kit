---
title: "Realtime Driver Tracking Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Real-time GPS location tracking for drivers and vehicles with position history and live map updates. 13 fields. 5 outcomes. 3 error codes. rules: valid_coordina"
---

# Realtime Driver Tracking Blueprint

> Real-time GPS location tracking for drivers and vehicles with position history and live map updates

| | |
|---|---|
| **Feature** | `realtime-driver-tracking` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | fleet, gps, tracking, real-time, location, telematics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/realtime-driver-tracking.blueprint.yaml) |
| **JSON API** | [realtime-driver-tracking.json]({{ site.baseurl }}/api/blueprints/integration/realtime-driver-tracking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Driver whose location is being tracked |
| `dispatcher` | Dispatcher | human | Operations staff monitoring driver locations |
| `tracking_device` | Tracking Device | system | In-vehicle or mobile GPS device sending location updates |
| `system` | System | system | Location ingestion and broadcasting service |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `position_uuid` | text | Yes | Position Record ID |  |
| `subject_uuid` | text | Yes | Subject (Driver/Vehicle) |  |
| `subject_type` | text | Yes | Subject Type |  |
| `order_uuid` | text | No | Active Order |  |
| `destination_uuid` | text | No | Current Destination |  |
| `coordinates` | json | Yes | GPS Coordinates |  |
| `heading` | number | No | Heading (degrees) |  |
| `bearing` | number | No | Bearing to Destination |  |
| `speed` | number | No | Speed |  |
| `altitude` | number | No | Altitude |  |
| `device_id` | text | No | Device ID |  |
| `device_type` | select | No | Device Type |  |
| `data_frequency` | text | No | Update Interval |  |

## Rules

- **valid_coordinates:** Location updates must include valid GPS coordinates (latitude within -90..90, longitude within -180..180)
- **immutable_positions:** Position records are immutable once stored; they form an audit trail of movement
- **update_frequency:** Driver location is updated at the configured device frequency (default every 30 seconds on active orders)
- **realtime_broadcast:** Location data is broadcast in real time to authorized dispatchers via WebSocket
- **retention_policy:** Position records are retained for the organization's configured retention period
- **stale_flag:** Stale positions older than 5 minutes should be flagged as potentially outdated on maps
- **geometry_storage:** GPS coordinates are stored as geospatial geometry for spatial query performance
- **org_isolation:** Location data is only visible to dispatchers within the same organization
- **driver_consent:** Drivers must consent to location tracking as part of onboarding
- **device_source_recorded:** Vehicle telematics devices can push location updates; position source is recorded

## Outcomes

### Position_recorded (Priority: 1)

**Given:**
- `coordinates` (input) exists
- `subject_uuid` (input) exists

**Then:**
- **create_record**
- **set_field** target: `driver.location` value: `coordinates`
- **emit_event** event: `tracking.position_updated`

**Result:** Position recorded and broadcast to live map

### Invalid_coordinates (Priority: 1) — Error: `TRACKING_INVALID_COORDINATES`

**Given:**
- ANY: latitude is outside range -90..90 OR longitude is outside range -180..180

**Result:** Position rejected — invalid GPS coordinates

### Driver_arrives_at_waypoint (Priority: 2)

**Given:**
- driver coordinates are within arrival radius of current waypoint
- `order_uuid` (db) exists

**Then:**
- **emit_event** event: `tracking.arrived_at_waypoint`

**Result:** Geofence arrival detected and order status updated

### Unauthorized_tracking (Priority: 2) — Error: `TRACKING_ACCESS_DENIED`

**Given:**
- requestor does not belong to the same organization as the driver

**Result:** Location data access denied

### Driver_departed_from_location (Priority: 3)

**Given:**
- driver was at a waypoint location
- driver coordinates moved beyond departure radius

**Then:**
- **emit_event** event: `tracking.departed_from_waypoint`

**Result:** Driver departure from waypoint detected

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRACKING_INVALID_COORDINATES` | 422 | Invalid GPS coordinates provided. | No |
| `TRACKING_ACCESS_DENIED` | 403 | You do not have permission to view this location. | No |
| `TRACKING_SUBJECT_NOT_FOUND` | 404 | Tracked subject not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tracking.position_updated` | Fired on every GPS position update | `subject_uuid`, `subject_type`, `coordinates`, `speed`, `heading`, `order_uuid`, `timestamp` |
| `tracking.arrived_at_waypoint` | Fired when driver enters the geofence radius of a waypoint | `subject_uuid`, `order_uuid`, `destination_uuid`, `coordinates`, `timestamp` |
| `tracking.departed_from_waypoint` | Fired when driver leaves a waypoint geofence | `subject_uuid`, `order_uuid`, `destination_uuid`, `coordinates`, `timestamp` |
| `tracking.device_online` | Fired when a tracking device comes online | `subject_uuid`, `device_id`, `device_type` |
| `tracking.device_offline` | Fired when a tracking device goes offline | `subject_uuid`, `device_id`, `last_known_position` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-profile | required | Driver profile holds the current location field |
| order-lifecycle | required | Position updates are linked to active orders |
| route-planning | required | Waypoint geofences are derived from the route |
| dispatch-driver-assignment | recommended | Nearest-driver calculation requires real-time positions |
| fleet-performance-dashboard | optional | Live map shows all driver positions on the dashboard |

## AGI Readiness

### Goals

#### Reliable Realtime Driver Tracking

Real-time GPS location tracking for drivers and vehicles with position history and live map updates

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `driver_profile` | driver-profile | degrade |
| `order_lifecycle` | order-lifecycle | degrade |
| `route_planning` | route-planning | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| position_recorded | `autonomous` | - | - |
| driver_arrives_at_waypoint | `autonomous` | - | - |
| driver_departed_from_location | `autonomous` | - | - |
| invalid_coordinates | `autonomous` | - | - |
| unauthorized_tracking | `autonomous` | - | - |

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
  "name": "Realtime Driver Tracking Blueprint",
  "description": "Real-time GPS location tracking for drivers and vehicles with position history and live map updates. 13 fields. 5 outcomes. 3 error codes. rules: valid_coordina",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, gps, tracking, real-time, location, telematics"
}
</script>
