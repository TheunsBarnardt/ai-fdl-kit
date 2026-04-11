---
title: "Stop Detection Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Detect and record periods when a vehicle is stationary, capturing stop location, start time, end time, and duration, to support idle time analysis, delivery dwe"
---

# Stop Detection Blueprint

> Detect and record periods when a vehicle is stationary, capturing stop location, start time, end time, and duration, to support idle time analysis, delivery dwell time reporting, and route compliance.

| | |
|---|---|
| **Feature** | `stop-detection` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, stop, idle, dwell, fleet, report |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/stop-detection.blueprint.yaml) |
| **JSON API** | [stop-detection.json]({{ site.baseurl }}/api/blueprints/workflow/stop-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Position Processing Pipeline | system | Identifies stationary periods from consecutive positions using speed and time thresholds |
| `fleet_user` | Fleet User | human | Reviews stop reports to analyse idle time, unscheduled stops, and delivery durations |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes | Device being monitored |  |
| `stop_latitude` | number | No | Latitude of the stop location |  |
| `stop_longitude` | number | No | Longitude of the stop location |  |
| `stop_start_time` | datetime | No | Timestamp when movement ceased and the stop began |  |
| `stop_end_time` | datetime | No | Timestamp when movement resumed and the stop ended |  |
| `stop_duration_seconds` | number | No | Total duration of the stop in seconds |  |
| `stop_gap_seconds` | number | No | Minimum seconds of stillness required before a period is classified as a stop |  |

## Rules

- **rule_1:** A stop is detected when the device remains below the motion speed threshold for at least stop_gap_seconds
- **rule_2:** Short stationary periods below stop_gap_seconds (e.g., red lights, traffic) are not classified as stops
- **rule_3:** A stop ends and a new trip may begin when the device's speed exceeds the motion threshold again
- **rule_4:** Stop location is the coordinates at which movement first ceased; minor GPS drift during a stop is ignored
- **rule_5:** Stop records include the reverse-geocoded address when available
- **rule_6:** Stops that overlap with geofence zones are annotated with the zone name for context
- **rule_7:** Engine hours and fuel data at stop boundaries are recorded to support idle fuel consumption analysis

## Outcomes

### Brief_halt_ignored (Priority: 5)

**Given:**
- device speed dropped to zero but resumed movement within stop_gap_seconds

**Result:** Short halt ignored; no stop record created (traffic light, junction, etc.)

### Stop_detected (Priority: 10)

**Given:**
- device speed has been below the motion threshold for >= stop_gap_seconds
- device was previously in a moving state

**Then:**
- **create_record** target: `event` — Stop detected event recorded with type = device_stopped, stop start time and coordinates
- **emit_event** event: `stop.detected`

**Result:** Stop record started; location, time, and sensor values at stop onset captured

### Stop_ended (Priority: 10)

**Given:**
- device resumes movement after a recorded stop
- device speed exceeds motion threshold

**Then:**
- **set_field** target: `stop_end_time` value: `now`
- **emit_event** event: `stop.ended`

**Result:** Stop record closed with end time and duration; available for stop reports

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STOP_DEVICE_NOT_FOUND` | 404 | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stop.detected` | Vehicle has come to a stop for longer than the minimum stop threshold | `device_id`, `stop_latitude`, `stop_longitude`, `stop_start_time`, `geofence_ids` |
| `stop.ended` | Vehicle has resumed movement after a recorded stop | `device_id`, `stop_start_time`, `stop_end_time`, `stop_duration_seconds` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trip-detection | required | Stops are the inverse of trips; both use the same motion state machine |
| gps-position-ingestion | required | Position speed values drive stop detection |
| geofence-management | recommended | Stops inside geofences are annotated with zone context |
| fleet-scheduled-reports | recommended | Stop records feed into scheduled stop reports |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 6
  entry_points:
    - src/main/java/org/traccar/handler/events/MotionEventHandler.java
    - src/main/java/org/traccar/session/state/MotionProcessor.java
    - src/main/java/org/traccar/reports/StopsReportProvider.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Stop Detection Blueprint",
  "description": "Detect and record periods when a vehicle is stationary, capturing stop location, start time, end time, and duration, to support idle time analysis, delivery dwe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, stop, idle, dwell, fleet, report"
}
</script>
