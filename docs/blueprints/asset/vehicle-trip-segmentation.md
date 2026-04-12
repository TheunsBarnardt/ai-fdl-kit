---
title: "Vehicle Trip Segmentation Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Automatically detects trip start and end from gear state signals, records position telemetry, and aggregates each completed trip into a drive record with distan"
---

# Vehicle Trip Segmentation Blueprint

> Automatically detects trip start and end from gear state signals, records position telemetry, and aggregates each completed trip into a drive record with distance, duration, and energy metadata.

| | |
|---|---|
| **Feature** | `vehicle-trip-segmentation` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, trip, telemetry, odometer, ev, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-trip-segmentation.blueprint.yaml) |
| **JSON API** | [vehicle-trip-segmentation.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-trip-segmentation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `polling_service` | Polling Service | system | Continuously polls vehicle API and triggers trip lifecycle transitions |
| `vehicle_api` | Vehicle API | external | Source of shift_state, odometer, battery range, and position data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trip_id` | hidden | No | Trip ID |  |
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `start_date` | datetime | Yes | Start Date |  |
| `end_date` | datetime | No | End Date |  |
| `start_odometer_km` | number | Yes | Start Odometer (km) |  |
| `end_odometer_km` | number | No | End Odometer (km) |  |
| `distance_km` | number | No | Distance (km) |  |
| `duration_min` | number | No | Duration (minutes) |  |
| `start_battery_level` | number | No | Start Battery Level (%) |  |
| `end_battery_level` | number | No | End Battery Level (%) |  |
| `start_ideal_range_km` | number | No | Start Ideal Range (km) |  |
| `end_ideal_range_km` | number | No | End Ideal Range (km) |  |
| `speed_max_kmh` | number | No | Max Speed (km/h) |  |
| `power_max_kw` | number | No | Max Power (kW) |  |
| `power_min_kw` | number | No | Min Power / Max Regen (kW) |  |
| `ascent_m` | number | No | Total Ascent (m) |  |
| `descent_m` | number | No | Total Descent (m) |  |
| `outside_temp_avg` | number | No | Avg Outside Temp (°C) |  |
| `position_count` | number | No | Position Readings |  |

## States

**State field:** `trip_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `inactive` | Yes |  |
| `in_progress` |  |  |
| `completed` |  | Yes |
| `discarded` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `inactive` | `in_progress` | polling_service | shift_state changes to D, N, or R |
|  | `in_progress` | `completed` | polling_service | shift_state becomes P or null AND position_count >= 2 AND distance_km >= 0.01 |
|  | `in_progress` | `discarded` | polling_service | trip ends with fewer than 2 positions OR distance_km < 0.01 OR distance_km < 0 |
|  | `in_progress` | `completed` | polling_service | vehicle has been offline for more than 15 minutes during the trip |

## Rules

- **trip_start_on_motion_gear:**
  - **description:** A trip starts when the vehicle shifts into any motion gear (D, N, or R)
- **minimum_distance_threshold:**
  - **description:** A trip must have at least 2 recorded positions and a distance of at least 0.01 km (10 metres) to be retained
- **negative_distance_discarded:**
  - **description:** A trip with negative distance (end odometer less than start) is discarded — indicates sensor glitch or API error
- **offline_during_drive:**
  - **description:** If the vehicle goes offline during a trip the driving state is maintained for up to 15 minutes before auto-completing with the last known data
- **distance_from_odometer:**
  - **description:** Distance is derived from odometer delta (end minus start), not from GPS geometry — odometer is converted from the API native unit to kilometres
- **aggregates_on_close:**
  - **description:** Speed max, power min/max, ascent, descent, and avg temperature are computed from the position time series when the trip closes

## Outcomes

### Trip_started (Priority: 1)

**Given:**
- no trip is currently in progress for this vehicle
- `shift_state` (input) in `D,N,R`

**Then:**
- **create_record** — Create a new in-progress trip record with start_date and start_odometer_km
- **transition_state** field: `trip_status` from: `inactive` to: `in_progress`
- **emit_event** event: `trip.started`

**Result:** Trip record created; position collection begins

### Position_recorded (Priority: 2)

**Given:**
- trip is currently in_progress for this vehicle

**Then:**
- **create_record** — Append current telemetry to the position log for this trip

**Result:** Position record appended; trip telemetry grows

### Trip_completed (Priority: 3)

**Given:**
- trip is currently in_progress
- `shift_state` (input) in `P`
- position_count >= 2
- `distance_km` (computed) gte `0.01`

**Then:**
- **set_field** target: `end_date` value: `current_timestamp`
- **set_field** target: `end_odometer_km` value: `current_odometer_reading`
- **set_field** target: `distance_km` value: `end_odometer_km - start_odometer_km`
- **set_field** target: `duration_min` value: `elapsed minutes between start_date and end_date`
- **transition_state** field: `trip_status` from: `in_progress` to: `completed`
- **emit_event** event: `trip.completed`

**Result:** Trip record finalised with all aggregate metrics

### Trip_discarded_insufficient_data (Priority: 4) — Error: `TRIP_BELOW_THRESHOLD`

**Given:**
- trip is currently in_progress
- ANY: position_count < 2 OR `distance_km` (computed) lt `0.01` OR `distance_km` (computed) lt `0`

**Then:**
- **delete_record** — Remove the trip record and all associated positions
- **transition_state** field: `trip_status` from: `in_progress` to: `discarded`
- **emit_event** event: `trip.discarded`

**Result:** Trip and positions deleted; no record retained

### Trip_auto_completed_offline (Priority: 5)

**Given:**
- trip is currently in_progress
- vehicle has been offline for more than 15 consecutive minutes

**Then:**
- **set_field** target: `end_date` value: `last_known_position_timestamp`
- **transition_state** field: `trip_status` from: `in_progress` to: `completed`
- **emit_event** event: `trip.auto_completed`

**Result:** Trip closed with last known data; prevents indefinitely open records

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRIP_BELOW_THRESHOLD` | 422 | Trip did not meet minimum distance or data requirements and was discarded. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trip.started` | A new trip began — vehicle shifted out of park | `vehicle_id`, `trip_id`, `start_date`, `start_odometer_km`, `start_battery_level` |
| `trip.completed` | A trip was successfully completed and aggregated | `vehicle_id`, `trip_id`, `distance_km`, `duration_min`, `end_battery_level` |
| `trip.discarded` | A trip was discarded for failing minimum thresholds | `vehicle_id`, `trip_id`, `reason` |
| `trip.auto_completed` | A trip was closed automatically after extended offline period | `vehicle_id`, `trip_id`, `offline_duration_min` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-state-machine | required |  |
| trip-energy-consumption | required |  |
| trip-replay | recommended |  |
| geofence-places | recommended |  |
| odometer-validation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Vehicle Trip Segmentation

Automatically detects trip start and end from gear state signals, records position telemetry, and aggregates each completed trip into a drive record with distance, duration, and energy metadata.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

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
| `vehicle_state_machine` | vehicle-state-machine | degrade |
| `trip_energy_consumption` | trip-energy-consumption | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| trip_started | `autonomous` | - | - |
| position_recorded | `autonomous` | - | - |
| trip_completed | `autonomous` | - | - |
| trip_discarded_insufficient_data | `autonomous` | - | - |
| trip_auto_completed_offline | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 5
  entry_points:
    - lib/teslamate/vehicles/vehicle.ex
    - lib/teslamate/log/drive.ex
    - lib/teslamate/log/position.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Trip Segmentation Blueprint",
  "description": "Automatically detects trip start and end from gear state signals, records position telemetry, and aggregates each completed trip into a drive record with distan",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, trip, telemetry, odometer, ev, fleet"
}
</script>
