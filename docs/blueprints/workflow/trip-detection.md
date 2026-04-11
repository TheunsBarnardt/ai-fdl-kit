---
title: "Trip Detection Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Automatically detect the start and end of vehicle trips by monitoring movement patterns across consecutive position records, applying configurable distance and "
---

# Trip Detection Blueprint

> Automatically detect the start and end of vehicle trips by monitoring movement patterns across consecutive position records, applying configurable distance and duration thresholds to filter noise, and producing structured trip records for reporting.

| | |
|---|---|
| **Feature** | `trip-detection` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, trip, motion, fleet, report, segmentation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/trip-detection.blueprint.yaml) |
| **JSON API** | [trip-detection.json]({{ site.baseurl }}/api/blueprints/workflow/trip-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Position Processing Pipeline | system | Evaluates each position for motion state transitions using a rolling distance and duration model |
| `fleet_user` | Fleet User | human | Views trip history, distances, durations, and per-trip driver or fuel data in reports |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes |  |  |
| `motion_streak` | boolean | No |  |  |
| `motion_start_time` | datetime | No |  |  |
| `motion_start_latitude` | number | No |  |  |
| `motion_start_longitude` | number | No |  |  |
| `min_trip_distance_meters` | number | No |  |  |
| `min_trip_duration_seconds` | number | No |  |  |
| `stop_gap_seconds` | number | No |  |  |

## States

**State field:** `motion_streak`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `stopped` | Yes |  |
| `moving` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `stopped` | `moving` | pipeline |  |
|  | `moving` | `stopped` | pipeline |  |

## Rules

- Movement is detected when the device travels at least min_trip_distance_meters from the last recorded stop position
- A trip is only recorded if the movement episode lasts at least min_trip_duration_seconds; shorter movements are treated as noise
- A trip ends when the device remains stationary (below the motion speed threshold) for at least stop_gap_seconds
- Motion state is persisted on the device record so it survives server restarts; the last known state is used as the baseline for the next incoming position
- Only latest positions drive state transitions; outdated or replayed positions are ignored
- Trip start and end positions are stored with full coordinates, timestamps, addresses, and cumulative sensor values (fuel, odometer, engine hours)
- If ignition data is available, the ignition-off event can be used as a supplemental trip-end signal

## Outcomes

### Noise_filtered (Priority: 5)

**Given:**
- device moved but distance or duration did not meet minimum thresholds

**Result:** No trip events generated; movement treated as GPS jitter or brief repositioning

### Trip_started (Priority: 10)

**Given:**
- `motion_streak` (db) eq `false`
- device has moved >= min_trip_distance_meters from the last stop

**Then:**
- **set_field** target: `motion_streak` value: `true`
- **set_field** target: `motion_start_time` — Trip start timestamp recorded
- **create_record** target: `event` — Trip start event recorded with type = device_moving
- **emit_event** event: `trip.started`

**Result:** Trip start event stored; trip record begins accumulating distance and duration

### Trip_ended (Priority: 10)

**Given:**
- `motion_streak` (db) eq `true`
- device has been stationary for >= stop_gap_seconds

**Then:**
- **set_field** target: `motion_streak` value: `false`
- **create_record** target: `event` — Trip end event recorded with type = device_stopped
- **emit_event** event: `trip.ended`

**Result:** Trip record completed with start/end coordinates, total distance, and duration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRIP_DEVICE_NOT_FOUND` |  | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trip.started` | A new vehicle trip has begun | `device_id`, `start_time`, `start_latitude`, `start_longitude`, `driver_unique_id` |
| `trip.ended` | A vehicle trip has concluded | `device_id`, `start_time`, `end_time`, `distance_meters`, `max_speed`, `fuel_used`, `driver_unique_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion |  |  |
| stop-detection |  |  |
| ignition-detection |  |  |
| driver-identification |  |  |
| fleet-scheduled-reports |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 7
  entry_points:
    - src/main/java/org/traccar/handler/events/MotionEventHandler.java
    - src/main/java/org/traccar/session/state/MotionProcessor.java
    - src/main/java/org/traccar/session/state/NewMotionProcessor.java
    - src/main/java/org/traccar/reports/TripsReportProvider.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip Detection Blueprint",
  "description": "Automatically detect the start and end of vehicle trips by monitoring movement patterns across consecutive position records, applying configurable distance and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, trip, motion, fleet, report, segmentation"
}
</script>
