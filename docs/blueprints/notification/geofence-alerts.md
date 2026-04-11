---
title: "Geofence Alerts Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Detect and emit events when a tracked device crosses the boundary of a geofence zone, distinguishing entry (device was outside, now inside) from exit (device wa"
---

# Geofence Alerts Blueprint

> Detect and emit events when a tracked device crosses the boundary of a geofence zone, distinguishing entry (device was outside, now inside) from exit (device was inside, now outside), with calendar-based suppression.

| | |
|---|---|
| **Feature** | `geofence-alerts` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, geofence, alert, event, fleet, zone |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/geofence-alerts.blueprint.yaml) |
| **JSON API** | [geofence-alerts.json]({{ site.baseurl }}/api/blueprints/notification/geofence-alerts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Position Processing Pipeline | system | Evaluates zone membership for each incoming position and compares with the previous position |
| `fleet_user` | Fleet User | human | Receives notifications when devices enter or leave zones of interest |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes |  |  |
| `geofence_id` | hidden | Yes |  |  |
| `event_type` | select | Yes |  |  |
| `position_id` | hidden | Yes |  |  |
| `fix_time` | datetime | Yes |  |  |

## Rules

- **processing:**
  - **entry_detection:** A geofence entry event is generated when a zone ID appears in the current position's zone list but was absent from the previous position's zone list
  - **exit_detection:** A geofence exit event is generated when a zone ID was present in the previous position's zone list but is absent from the current position's zone list
  - **latest_position_only:** Only positions that are the latest for the device are evaluated; outdated or replayed positions do not trigger crossing events
  - **atomic_processing:** Both entry and exit events for the same position are processed atomically; a position update may produce multiple crossing events
- **event_emission:**
  - **calendar_suppression:** If the geofence has an associated calendar and the current time falls outside the calendar's active periods, no entry or exit event is generated
  - **one_event_per_zone_crossing:** One event is generated per zone per crossing; if a device enters two zones simultaneously, two separate entry events are emitted

## Outcomes

### No_previous_position (Priority: 3)

**Given:**
- device has no previous stored position to compare against

**Result:** No crossing event can be inferred; evaluation is skipped until a second position arrives

### Calendar_suppressed (Priority: 5)

**Given:**
- geofence boundary would have been crossed
- geofence has a calendar and current time is outside active calendar periods

**Result:** Crossing is ignored; no entry or exit event is generated

### Geofence_entered (Priority: 10)

**Given:**
- current position includes a geofence_id not present in the previous position
- geofence calendar is active (or no calendar is set)
- position is the latest for the device (not outdated)

**Then:**
- **create_record** target: `event` — Geofence entry event recorded with type = geofence_enter, device_id, geofence_id, position_id
- **emit_event** event: `geofence.entered`

**Result:** Entry event stored; notification handlers route alerts to subscribed users

### Geofence_exited (Priority: 10)

**Given:**
- previous position included a geofence_id that is absent from the current position
- geofence calendar is active (or no calendar is set)
- position is the latest for the device (not outdated)

**Then:**
- **create_record** target: `event` — Geofence exit event recorded with type = geofence_exit, device_id, geofence_id, position_id
- **emit_event** event: `geofence.exited`

**Result:** Exit event stored; notification handlers route alerts to subscribed users

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOFENCE_EVENT_DEVICE_NOT_FOUND` |  | The device referenced in the position record does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `geofence.entered` | Device has crossed into a geofence zone | `device_id`, `geofence_id`, `geofence_name`, `position_id`, `fix_time` |
| `geofence.exited` | Device has crossed out of a geofence zone | `device_id`, `geofence_id`, `geofence_name`, `position_id`, `fix_time` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| geofence-management |  |  |
| gps-position-ingestion |  |  |
| fleet-device-sharing |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 5
  entry_points:
    - src/main/java/org/traccar/handler/events/GeofenceEventHandler.java
    - src/main/java/org/traccar/handler/GeofenceHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geofence Alerts Blueprint",
  "description": "Detect and emit events when a tracked device crosses the boundary of a geofence zone, distinguishing entry (device was outside, now inside) from exit (device wa",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, geofence, alert, event, fleet, zone"
}
</script>
