---
title: "Trip Replay Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Records a dense telemetry time-series (position, speed, power, elevation, battery) throughout every trip, enabling post-hoc replay with full speed and elevation"
---

# Trip Replay Blueprint

> Records a dense telemetry time-series (position, speed, power, elevation, battery) throughout every trip, enabling post-hoc replay with full speed and elevation profiles.

| | |
|---|---|
| **Feature** | `trip-replay` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, trip, replay, telemetry, speed, elevation, ev |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/trip-replay.blueprint.yaml) |
| **JSON API** | [trip-replay.json]({{ site.baseurl }}/api/blueprints/asset/trip-replay.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `polling_service` | Polling Service | system | Captures telemetry at high frequency during driving and fills elevation gaps |
| `elevation_service` | Elevation Service | external | Provides altitude data for positions that lack it from the vehicle API |
| `vehicle_owner` | Vehicle Owner | human | Reviews trip replays, speed profiles, and elevation data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `position_id` | hidden | No | Position ID |  |
| `trip_id` | hidden | No | Trip ID |  |
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `recorded_at` | datetime | Yes | Recorded At |  |
| `latitude` | number | Yes | Latitude |  |
| `longitude` | number | Yes | Longitude |  |
| `speed_kmh` | number | No | Speed (km/h) |  |
| `elevation_m` | number | No | Elevation (m) |  |
| `power_kw` | number | No | Power (kW) |  |
| `battery_level_pct` | number | No | Battery Level (%) |  |
| `ideal_range_km` | number | No | Ideal Range (km) |  |
| `rated_range_km` | number | No | Rated Range (km) |  |
| `outside_temp_c` | number | No | Outside Temp (°C) |  |
| `inside_temp_c` | number | No | Inside Temp (°C) |  |
| `is_climate_on` | boolean | No | Climate On |  |
| `odometer_km` | number | No | Odometer (km) |  |
| `trip_ascent_m` | number | No | Trip Total Ascent (m) |  |
| `trip_descent_m` | number | No | Trip Total Descent (m) |  |
| `trip_speed_max_kmh` | number | No | Trip Max Speed (km/h) |  |
| `trip_power_max_kw` | number | No | Trip Max Power (kW) |  |
| `trip_power_min_kw` | number | No | Trip Min Power / Max Regen (kW) |  |

## Rules

- **high_frequency_capture:**
  - **description:** Position readings are captured at the polling interval during driving (~2.5 seconds) yielding roughly 1440 readings per hour
- **linked_by_trip_id:**
  - **description:** Each position reading is linked to its trip by a foreign key enabling ordered reconstruction of the full journey path
- **elevation_backfilled_asynchronously:**
  - **description:** Elevation data may be absent from the vehicle API and is backfilled asynchronously by querying an elevation service in batches of approximately 100 positions
- **ascent_descent_from_consecutive_deltas:**
  - **description:** Ascent accumulates positive elevation deltas; descent accumulates absolute negative elevation deltas; maximum values are capped to prevent integer overflow
- **power_sign_convention:**
  - **description:** Positive power means energy consumed by motor or climate systems; negative power means energy returned via regenerative braking
- **speed_converted_to_km_h:**
  - **description:** Speed is stored in km/h; the vehicle API typically provides it in mph and it is converted at ingestion time
- **positions_retained_indefinitely:**
  - **description:** All position readings for a trip are retained indefinitely and never pruned after trip aggregation enabling replay at any future time

## Outcomes

### Position_recorded_during_trip (Priority: 1)

**Given:**
- a trip is currently in progress

**Then:**
- **create_record** — Append telemetry snapshot to the trip position time series

**Result:** One position reading added; trip replay fidelity increases

### Elevation_backfilled (Priority: 2)

**Given:**
- positions exist with null elevation_m
- elevation service is available

**Then:**
- **set_field** target: `elevation_m` — Altitude resolved from external elevation service in batches
- **emit_event** event: `trip.elevation.backfilled`

**Result:** Elevation gaps filled; elevation profile becomes available

### Trip_aggregates_computed (Priority: 3)

**Given:**
- a trip has just completed
- position time series is available for the trip

**Then:**
- **set_field** target: `trip_ascent_m` — Sum of positive elevation deltas across all ordered positions
- **set_field** target: `trip_descent_m` — Sum of absolute negative elevation deltas across all ordered positions
- **set_field** target: `trip_speed_max_kmh` — Maximum speed_kmh across all positions
- **set_field** target: `trip_power_max_kw` — Maximum power_kw across all positions
- **set_field** target: `trip_power_min_kw` — Minimum power_kw across all positions
- **emit_event** event: `trip.replay.ready`

**Result:** Trip aggregates attached; replay with full speed and elevation profile is available

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ELEVATION_SERVICE_UNAVAILABLE` | 503 | Elevation data could not be retrieved. Profiles will be incomplete until resolved. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trip.replay.ready` | A completed trip has all position data and aggregates needed for replay | `vehicle_id`, `trip_id`, `position_count`, `trip_ascent_m`, `trip_descent_m`, `trip_speed_max_kmh` |
| `trip.elevation.backfilled` | Elevation data was resolved for positions that previously had none | `vehicle_id`, `trip_id`, `position_count_updated` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |
| driver-behaviour-scoring | recommended |  |

## AGI Readiness

### Goals

#### Reliable Trip Replay

Records a dense telemetry time-series (position, speed, power, elevation, battery) throughout every trip, enabling post-hoc replay with full speed and elevation profiles.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | convenience | asset tracking must maintain precise location and status records |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `vehicle_trip_segmentation` | vehicle-trip-segmentation | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| position_recorded_during_trip | `autonomous` | - | - |
| elevation_backfilled | `autonomous` | - | - |
| trip_aggregates_computed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 4
  entry_points:
    - lib/teslamate/log/position.ex
    - lib/teslamate/log/drive.ex
    - lib/teslamate/terrain.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip Replay Blueprint",
  "description": "Records a dense telemetry time-series (position, speed, power, elevation, battery) throughout every trip, enabling post-hoc replay with full speed and elevation",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, trip, replay, telemetry, speed, elevation, ev"
}
</script>
