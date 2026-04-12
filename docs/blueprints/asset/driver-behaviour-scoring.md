---
title: "Driver Behaviour Scoring Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Analyses vehicle telemetry (speed and power time series) to detect hard braking and rapid acceleration events, producing a per-trip smoothness score for driver "
---

# Driver Behaviour Scoring Blueprint

> Analyses vehicle telemetry (speed and power time series) to detect hard braking and rapid acceleration events, producing a per-trip smoothness score for driver feedback.

| | |
|---|---|
| **Feature** | `driver-behaviour-scoring` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, driver, behaviour, scoring, ev, safety, efficiency, telemetry |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/driver-behaviour-scoring.blueprint.yaml) |
| **JSON API** | [driver-behaviour-scoring.json]({{ site.baseurl }}/api/blueprints/asset/driver-behaviour-scoring.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Analyses position telemetry after each trip to score driving behaviour |
| `vehicle_owner` | Vehicle Owner | human | Reviews per-trip scores and historical behaviour trends |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trip_id` | hidden | No | Trip ID |  |
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `score` | number | No | Smoothness Score (0-100) |  |
| `hard_braking_events` | number | No | Hard Braking Events |  |
| `rapid_acceleration_events` | number | No | Rapid Acceleration Events |  |
| `high_power_events` | number | No | High Power Events |  |
| `max_deceleration_ms2` | number | No | Max Deceleration (m/s2) |  |
| `max_acceleration_ms2` | number | No | Max Acceleration (m/s2) |  |
| `hard_braking_threshold_ms2` | number | No | Hard Braking Threshold (m/s2) |  |
| `rapid_acceleration_threshold_ms2` | number | No | Rapid Acceleration Threshold (m/s2) |  |
| `high_power_threshold_kw` | number | No | High Power Threshold (kW) |  |

## Rules

- **acceleration_from_consecutive_speeds:**
  - **description:** Acceleration and deceleration are calculated from consecutive speed readings as delta_v / delta_t in m/s2; the telemetry sampling interval must be known and consistent
- **hard_braking_from_deceleration_rate:**
  - **description:** Hard braking is detected when deceleration rate exceeds the configured threshold regardless of whether regenerative braking is active; rate of speed change is the primary signal
- **rapid_acceleration_from_acceleration_rate:**
  - **description:** Rapid acceleration is detected when acceleration rate exceeds the configured threshold whether from zero or already in motion
- **high_power_from_instantaneous_draw:**
  - **description:** High-power events are detected when instantaneous power draw exceeds the configured threshold capturing both aggressive motor use and heavy climate load
- **score_normalised_to_100:**
  - **description:** Score = 100 x (1 - aggressive_intervals / total_intervals) scaled by event severity; 100 is perfectly smooth, 0 is continuous aggressive behaviour
- **minimum_readings_required:**
  - **description:** A minimum number of position readings is required for a valid score; trips with fewer readings return a null score
- **thresholds_configurable_per_vehicle:**
  - **description:** Thresholds should be configurable per vehicle type — sport vehicles may have higher thresholds than standard passenger vehicles

## Outcomes

### Trip_scored_successfully (Priority: 1)

**Given:**
- a trip has just completed
- trip has sufficient position readings to calculate rates of change

**Then:**
- **set_field** target: `hard_braking_events` value: `count of intervals with deceleration > hard_braking_threshold_ms2`
- **set_field** target: `rapid_acceleration_events` value: `count of intervals with acceleration > rapid_acceleration_threshold_ms2`
- **set_field** target: `score` value: `100 x (1 - aggressive_event_intervals / total_intervals)`
- **emit_event** event: `driver.score.calculated`

**Result:** Driving score attached to trip; driver can review behaviour

### Aggressive_event_detected (Priority: 2)

**Given:**
- a position interval shows acceleration or deceleration exceeding threshold

**Then:**
- **create_record** — Record the event type, magnitude, timestamp, and position for review
- **emit_event** event: `driver.event.aggressive`

**Result:** Individual aggressive driving event recorded for detailed post-trip review

### Trip_score_insufficient_data (Priority: 3) — Error: `SCORE_INSUFFICIENT_DATA`

**Given:**
- a trip has just completed
- trip has fewer than the minimum required position readings

**Result:** Score not calculated; trip too short for meaningful behaviour analysis

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCORE_INSUFFICIENT_DATA` | 422 | Trip too short to calculate a driving score. More position data required. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `driver.score.calculated` | A per-trip driving behaviour score was calculated | `vehicle_id`, `trip_id`, `score`, `hard_braking_events`, `rapid_acceleration_events`, `high_power_events` |
| `driver.event.aggressive` | An individual aggressive driving event was detected during a trip | `vehicle_id`, `trip_id`, `event_type`, `magnitude_ms2`, `recorded_at`, `latitude`, `longitude` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |
| trip-replay | recommended |  |
| vehicle-efficiency-metrics | recommended |  |

## AGI Readiness

### Goals

#### Reliable Driver Behaviour Scoring

Analyses vehicle telemetry (speed and power time series) to detect hard braking and rapid acceleration events, producing a per-trip smoothness score for driver feedback.

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
| trip_scored_successfully | `autonomous` | - | - |
| aggressive_event_detected | `autonomous` | - | - |
| trip_score_insufficient_data | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 3
  entry_points:
    - lib/teslamate/log/position.ex
    - lib/teslamate/log/drive.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Behaviour Scoring Blueprint",
  "description": "Analyses vehicle telemetry (speed and power time series) to detect hard braking and rapid acceleration events, producing a per-trip smoothness score for driver ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, driver, behaviour, scoring, ev, safety, efficiency, telemetry"
}
</script>
