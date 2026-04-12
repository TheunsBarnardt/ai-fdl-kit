---
title: "Driver Location Streaming Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Real-time GPS location updates from drivers, persisted as position history and broadcast to subscribers for live map tracking.. 8 fields. 4 outcomes. 2 error co"
---

# Driver Location Streaming Blueprint

> Real-time GPS location updates from drivers, persisted as position history and broadcast to subscribers for live map tracking.

| | |
|---|---|
| **Feature** | `driver-location-streaming` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | real-time, gps, location, tracking, broadcast, geospatial |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/driver-location-streaming.blueprint.yaml) |
| **JSON API** | [driver-location-streaming.json]({{ site.baseurl }}/api/blueprints/integration/driver-location-streaming.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Mobile device reporting location at regular intervals. |
| `platform` | Platform | system | Server that receives, persists, and broadcasts location updates. |
| `subscriber` | Subscriber | system | Dashboard, customer app, or operator console receiving live location updates. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `driver_id` | text | Yes | Identifier of the driver whose location is being updated. |  |
| `latitude` | number | Yes | WGS-84 decimal latitude. |  |
| `longitude` | number | Yes | WGS-84 decimal longitude. |  |
| `altitude` | number | No | Altitude above sea level in meters. |  |
| `heading` | number | No | Bearing in degrees from north (0-360). |  |
| `speed` | number | No | Current speed in meters per second. |  |
| `order_id` | text | No | Active order this position update is associated with. |  |
| `destination_id` | text | No | Current waypoint/destination the driver is heading toward. |  |

## Rules

- **rule_01:** The driver app sends location updates on a regular interval (typically every few seconds while active).
- **rule_02:** Each update overwrites the driver's current location in the driver record.
- **rule_03:** A new position history record is only created if the driver has moved more than 50 meters from the last recorded position, or if no prior position exists.
- **rule_04:** Every location update triggers a broadcast event to the channel keyed on the driver's public identifier.
- **rule_05:** Subscribers listen on a per-driver channel to receive real-time location pushes.
- **rule_06:** Reverse geocoding to refresh city and country is throttled — only runs if 10+ minutes have elapsed since last geocode or if city/country are empty.
- **rule_07:** Location updates include the current active order and destination waypoint when available, enabling route tracking.

## Outcomes

### Location_updated (Priority: 1)

**Given:**
- driver sends a location update with latitude and longitude
- driver record exists

**Then:**
- **set_field** target: `driver.location` — Driver's current position is updated with new coordinates.
- **set_field** target: `driver.heading` — Heading is updated.
- **set_field** target: `driver.speed` — Speed is updated.
- **emit_event** event: `driver.location_changed`

**Result:** All subscribers on the driver's channel receive the new position in real time.

### Position_history_recorded (Priority: 2)

**Given:**
- driver has moved more than 50 meters from last recorded position OR no prior position exists
- location update received

**Then:**
- **create_record** — A new position history record is written with coordinates, heading, speed, altitude, current order, and destination.

**Result:** A persistent trail of driver positions is recorded for replay and audit.

### Geocode_refreshed (Priority: 3)

**Given:**
- 10 or more minutes have passed since last geocode, OR city or country fields are empty

**Then:**
- **set_field** target: `driver.city` — City is resolved from coordinates via reverse geocoding.
- **set_field** target: `driver.country` — Country code is resolved from coordinates.

**Result:** Driver's city and country are kept current for zone and routing logic.

### Driver_not_found (Priority: 4) — Error: `DRIVER_NOT_FOUND`

**Given:**
- provided driver_id does not match any driver record

**Result:** Update is rejected with an error response.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DRIVER_NOT_FOUND` | 404 | Driver resource not found. | No |
| `LOCATION_UPDATE_INVALID` | 400 | Invalid coordinates provided for location update. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `driver.location_changed` | Fired on every driver location update; broadcast to the driver's real-time channel. | `driver_id`, `latitude`, `longitude`, `altitude`, `heading`, `speed`, `order_id`, `destination_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | recommended | Location updates are linked to the active order for trip tracking. |
| driver-app-flow | required | The driver app is the source of location updates. |
| eta-calculation | recommended | ETA is recalculated using updated driver position. |
| service-zones | optional | Zone entry/exit events can be derived from location changes. |

## AGI Readiness

### Goals

#### Reliable Driver Location Streaming

Real-time GPS location updates from drivers, persisted as position history and broadcast to subscribers for live map tracking.

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
| `driver_app_flow` | driver-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| location_updated | `supervised` | - | - |
| position_history_recorded | `autonomous` | - | - |
| geocode_refreshed | `autonomous` | - | - |
| driver_not_found | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Http/Controllers/Api/v1/DriverController.php
    - src/Models/Driver.php
    - src/Models/Position.php
    - src/Events/DriverLocationChanged.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Location Streaming Blueprint",
  "description": "Real-time GPS location updates from drivers, persisted as position history and broadcast to subscribers for live map tracking.. 8 fields. 4 outcomes. 2 error co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "real-time, gps, location, tracking, broadcast, geospatial"
}
</script>
