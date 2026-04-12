---
title: "Odometer Validation Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Validates vehicle odometer readings ingested from telemetry, enforcing minimum trip distance thresholds, detecting negative distance anomalies, and flagging une"
---

# Odometer Validation Blueprint

> Validates vehicle odometer readings ingested from telemetry, enforcing minimum trip distance thresholds, detecting negative distance anomalies, and flagging unexpected odometer jumps.

| | |
|---|---|
| **Feature** | `odometer-validation` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, odometer, validation, trip, sanity, telemetry, ev |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/odometer-validation.blueprint.yaml) |
| **JSON API** | [odometer-validation.json]({{ site.baseurl }}/api/blueprints/asset/odometer-validation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Validates odometer values at trip close and flags anomalies |
| `vehicle_api` | Vehicle API | external | Source of raw odometer readings in the API native unit |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `raw_odometer` | number | Yes | Raw Odometer (API unit) |  |
| `odometer_km` | number | Yes | Odometer (km) |  |
| `trip_start_odometer_km` | number | Yes | Trip Start Odometer (km) |  |
| `trip_end_odometer_km` | number | No | Trip End Odometer (km) |  |
| `trip_distance_km` | number | No | Trip Distance (km) |  |
| `previous_odometer_km` | number | No | Previous Odometer Reading (km) |  |
| `odometer_jump_threshold_km` | number | No | Jump Alert Threshold (km) |  |
| `min_trip_distance_km` | number | No | Minimum Trip Distance (km) |  |

## Rules

- **convert_at_ingestion:**
  - **description:** Odometer values from the vehicle API are converted to kilometres at ingestion using a fixed conversion factor; the raw value is preserved for audit
- **minimum_trip_distance:**
  - **description:** A trip with distance < 0.01 km (10 metres) is discarded; the raw value is preserved for audit
- **negative_distance_discard:**
  - **description:** A trip with negative distance (end odometer less than start) is discarded — can occur due to sensor glitches, API errors, or data gaps
- **minimum_position_count:**
  - **description:** A trip with fewer than 2 recorded position readings is discarded regardless of calculated distance
- **jump_flagged_not_corrected:**
  - **description:** An odometer jump is detected when a new reading exceeds the previous by more than the threshold — flagged for review but not automatically corrected
- **no_smoothing_applied:**
  - **description:** Odometer values are stored as-is from the API; no smoothing, interpolation, or backward correction is applied
- **positions_deleted_with_trip:**
  - **description:** When a trip is discarded all associated position readings are also deleted; no record is retained for sub-threshold trips

## Outcomes

### Odometer_converted_and_stored (Priority: 1)

**Given:**
- a new odometer reading arrives from the vehicle API

**Then:**
- **set_field** target: `odometer_km` value: `raw_odometer converted to kilometres`

**Result:** Odometer stored in canonical unit; ready for trip distance calculation

### Trip_distance_valid (Priority: 2)

**Given:**
- a trip has just ended
- `trip_distance_km` (computed) gte `0.01`
- trip has >= 2 recorded position readings

**Then:**
- **set_field** target: `trip_distance_km` value: `trip_end_odometer_km - trip_start_odometer_km`
- **emit_event** event: `odometer.trip.distance_valid`

**Result:** Trip distance accepted; record retained

### Trip_discarded_below_threshold (Priority: 3) — Error: `TRIP_DISTANCE_BELOW_THRESHOLD`

**Given:**
- a trip has just ended
- ANY: `trip_distance_km` (computed) lt `0.01` OR trip has fewer than 2 position readings

**Then:**
- **delete_record** — Remove the trip and all associated position readings
- **emit_event** event: `odometer.trip.discarded`

**Result:** Sub-threshold trip deleted; no record retained

### Trip_discarded_negative_distance (Priority: 4) — Error: `TRIP_NEGATIVE_DISTANCE`

**Given:**
- a trip has just ended
- `trip_distance_km` (computed) lt `0`

**Then:**
- **delete_record** — Remove the trip and all associated position readings
- **emit_event** event: `odometer.anomaly.negative_distance`

**Result:** Trip with negative distance discarded; anomaly logged

### Odometer_jump_flagged (Priority: 5)

**Given:**
- new odometer reading exceeds previous reading by more than odometer_jump_threshold_km

**Then:**
- **emit_event** event: `odometer.anomaly.jump_detected`

**Result:** Large unexpected odometer increase flagged for review; reading stored as-is

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRIP_DISTANCE_BELOW_THRESHOLD` | 422 | Trip did not meet minimum distance requirement and was not recorded. | No |
| `TRIP_NEGATIVE_DISTANCE` | 422 | Trip distance was negative, indicating a data error. Trip was discarded. | No |
| `ODOMETER_JUMP_DETECTED` | 422 | Unusually large odometer increase detected. Please review telemetry data. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `odometer.trip.distance_valid` | Trip distance passed validation and was retained | `vehicle_id`, `trip_id`, `trip_distance_km` |
| `odometer.trip.discarded` | Trip discarded for failing distance or position count threshold | `vehicle_id`, `trip_id`, `reason`, `trip_distance_km`, `position_count` |
| `odometer.anomaly.negative_distance` | Trip ended with a lower odometer than it started — data anomaly | `vehicle_id`, `trip_id`, `start_odometer_km`, `end_odometer_km` |
| `odometer.anomaly.jump_detected` | Odometer reading jumped unexpectedly between consecutive readings | `vehicle_id`, `previous_odometer_km`, `current_odometer_km`, `jump_km` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 3
  entry_points:
    - lib/teslamate/log/drive.ex
    - lib/teslamate/log/position.ex
    - lib/teslamate/convert.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Odometer Validation Blueprint",
  "description": "Validates vehicle odometer readings ingested from telemetry, enforcing minimum trip distance thresholds, detecting negative distance anomalies, and flagging une",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, odometer, validation, trip, sanity, telemetry, ev"
}
</script>
