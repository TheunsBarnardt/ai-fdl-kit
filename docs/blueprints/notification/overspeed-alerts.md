---
title: "Overspeed Alerts Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Detect when a tracked device exceeds a configured speed limit for a minimum duration, using a four-level speed limit hierarchy (position > geofence > device > s"
---

# Overspeed Alerts Blueprint

> Detect when a tracked device exceeds a configured speed limit for a minimum duration, using a four-level speed limit hierarchy (position > geofence > device > server), and emit a single event at the start of each overspeed episode.

| | |
|---|---|
| **Feature** | `overspeed-alerts` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, overspeed, speed-limit, alert, fleet, safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/overspeed-alerts.blueprint.yaml) |
| **JSON API** | [overspeed-alerts.json]({{ site.baseurl }}/api/blueprints/notification/overspeed-alerts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Position Processing Pipeline | system | Evaluates each incoming position speed against the applicable limit and manages overspeed state |
| `fleet_admin` | Fleet Administrator | human | Configures speed limits at device, geofence, or server level |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes |  |  |
| `speed` | number | Yes |  |  |
| `speed_limit` | number | No |  |  |
| `geofence_id` | hidden | No |  |  |
| `overspeed_state` | boolean | No |  |  |
| `overspeed_start_time` | datetime | No |  |  |
| `min_duration_seconds` | number | No |  |  |

## Rules

- **processing:**
  - **speed_limit_hierarchy:** Speed limits are resolved in priority order — position-level limit first, then the lowest (or highest, if configured) geofence limit among all active geofences, then device-level limit, then server-wide default
  - **geofence_limit_selection:** When multiple geofences each carry a speed limit, the platform selects the most restrictive (lowest) limit by default; this behaviour is configurable
  - **speed_multiplier_tolerance:** A speed multiplier (threshold_multiplier > 1.0) may be applied to create a tolerance buffer above the nominal limit before triggering
  - **latest_position_only:** Only positions that are the latest for the device are evaluated; outdated positions do not change overspeed state
- **event_emission:**
  - **single_event_per_episode:** An overspeed event is emitted only when the device transitions from non-overspeeding to overspeeding AND the overspeed condition has persisted for at least min_duration_seconds
  - **no_repeated_events:** Only one overspeed event is emitted per episode; no repeated events are generated while the device remains over the limit
  - **state_cleared_on_recovery:** When the device's speed drops below the limit, the overspeed state is cleared; a new episode can begin if speed rises again

## Outcomes

### No_speed_limit_configured (Priority: 3)

**Given:**
- no speed limit is configured at any level of the hierarchy

**Result:** Speed is not evaluated; no overspeed events are generated

### Overspeed_cleared (Priority: 8)

**Given:**
- device speed drops below speed_limit
- `overspeed_state` (db) eq `true`

**Then:**
- **set_field** target: `overspeed_state` value: `false`

**Result:** Overspeed state cleared; the device can trigger a new event if it speeds again

### Overspeed_event_emitted (Priority: 10)

**Given:**
- device speed exceeds (speed_limit × threshold_multiplier)
- overspeed condition has persisted for >= min_duration_seconds
- `overspeed_state` (db) eq `false`

**Then:**
- **set_field** target: `overspeed_state` value: `true`
- **create_record** target: `event` — Overspeed event recorded with type = device_overspeed, speed, speed_limit, geofence_id (if applicable)
- **emit_event** event: `device.overspeed`

**Result:** Overspeed event stored; notification handlers alert subscribed users

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OVERSPEED_DEVICE_NOT_FOUND` |  | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.overspeed` | Device exceeded the applicable speed limit for the minimum required duration | `device_id`, `speed`, `speed_limit`, `geofence_id`, `fix_time`, `position_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion |  |  |
| geofence-management |  |  |
| gps-device-registration |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 5
  entry_points:
    - src/main/java/org/traccar/handler/events/OverspeedEventHandler.java
    - src/main/java/org/traccar/session/state/OverspeedProcessor.java
    - src/main/java/org/traccar/session/state/OverspeedState.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Overspeed Alerts Blueprint",
  "description": "Detect when a tracked device exceeds a configured speed limit for a minimum duration, using a four-level speed limit hierarchy (position > geofence > device > s",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, overspeed, speed-limit, alert, fleet, safety"
}
</script>
