---
title: "Vehicle State Machine Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Tracks the real-time operational state of a connected vehicle (online, driving, charging, asleep, offline, updating) by polling a vehicle API and persisting sta"
---

# Vehicle State Machine Blueprint

> Tracks the real-time operational state of a connected vehicle (online, driving, charging, asleep, offline, updating) by polling a vehicle API and persisting state transitions.

| | |
|---|---|
| **Feature** | `vehicle-state-machine` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, telemetry, state-machine, ev, fleet, polling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-state-machine.blueprint.yaml) |
| **JSON API** | [vehicle-state-machine.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-state-machine.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `vehicle_api` | Vehicle API | external | Remote API providing vehicle state, telemetry, and commands |
| `polling_service` | Polling Service | system | Background process that periodically fetches vehicle state |
| `vehicle_owner` | Vehicle Owner | human | Person who owns or manages the vehicle |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `current_state` | select | Yes | Current State |  |
| `shift_state` | select | No | Shift State |  |
| `charging_state` | select | No | Charging State |  |
| `is_sentry_mode` | boolean | No | Sentry Mode Active |  |
| `is_preconditioning` | boolean | No | Preconditioning Active |  |
| `is_dog_mode` | boolean | No | Dog Mode Active |  |
| `is_user_present` | boolean | No | Occupant Present |  |
| `software_update_status` | text | No | Software Update Status |  |
| `state_start_date` | datetime | Yes | State Start Date |  |
| `suspend_after_idle_min` | number | No | Suspend After Idle (minutes) |  |

## States

**State field:** `current_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `start` |  |  |
| `online` | Yes |  |
| `driving` |  |  |
| `charging` |  |  |
| `asleep` |  |  |
| `offline` |  |  |
| `updating` |  |  |
| `suspended` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `online` | `driving` | polling_service | shift_state is D, N, or R |
|  | `online` | `charging` | polling_service | charging_state is Starting or Charging |
|  | `online` | `updating` | polling_service | software_update_status is installing |
|  | `online` | `asleep` | polling_service | idle duration exceeds threshold and all sleep eligibility conditions are satisfied |
|  | `online` | `offline` | polling_service | API request fails or times out |
|  | `driving` | `online` | polling_service | shift_state becomes P or null |
|  | `charging` | `online` | polling_service | charging_state is no longer Starting or Charging |
|  | `asleep` | `online` | polling_service | next API poll returns online response |
|  | `offline` | `online` | polling_service | next API poll returns a valid response |
|  | `updating` | `online` | polling_service | software update installation completes |
|  | `online` | `suspended` | vehicle_owner | operator manually pauses logging |
|  | `suspended` | `online` | vehicle_owner | operator manually resumes logging |

## Rules

- **polling_interval_by_state:**
  - **description:** Polling interval varies by state — driving ~2.5s, charging ~5s, online/updating ~15s, asleep ~30s, offline exponential backoff starting at 5s up to 30s maximum
- **suspended_state_manual_only:**
  - **description:** A vehicle cannot transition from suspended state due to API signals; only explicit operator action resumes logging
- **sleep_eligibility_all_conditions:**
  - **description:** Sleep requires ALL of these to be false simultaneously — sentry mode, preconditioning, dog mode, user present, doors open, battery heater active, software download in progress
- **offline_during_drive_timeout:**
  - **description:** When offline during a drive the system maintains the driving state for up to 15 minutes using the last known position before auto-completing the trip
- **state_records_open_end_date:**
  - **description:** State records store state_start_date and state_end_date — the current state always has a null end date

## Outcomes

### Vehicle_transitions_to_driving (Priority: 1)

**Given:**
- `current_state` (db) eq `online`
- `shift_state` (input) in `D,N,R`

**Then:**
- **transition_state** field: `current_state` from: `online` to: `driving`
- **emit_event** event: `vehicle.state.driving_started`

**Result:** Vehicle enters driving state; trip recording begins

### Vehicle_transitions_to_charging (Priority: 2)

**Given:**
- `current_state` (db) eq `online`
- `charging_state` (input) in `Starting,Charging`

**Then:**
- **transition_state** field: `current_state` from: `online` to: `charging`
- **emit_event** event: `vehicle.state.charging_started`

**Result:** Vehicle enters charging state; charging session recording begins

### Vehicle_falls_asleep (Priority: 3)

**Given:**
- vehicle is online and idle duration exceeds suspend_after_idle_min
- all sleep eligibility conditions are met

**Then:**
- **transition_state** field: `current_state` from: `online` to: `asleep`
- **emit_event** event: `vehicle.state.asleep`

**Result:** Vehicle enters sleep state; polling interval reduced

### Vehicle_goes_offline (Priority: 4)

**Given:**
- API request fails or times out for the vehicle

**Then:**
- **transition_state** field: `current_state` from: `online` to: `offline`
- **emit_event** event: `vehicle.state.offline`

**Result:** Vehicle marked offline; polling continues with backoff

### Vehicle_wakes_up (Priority: 5)

**Given:**
- `current_state` (db) in `asleep,offline`
- API poll returns a valid online response

**Then:**
- **transition_state** field: `current_state` from: `asleep` to: `online`
- **emit_event** event: `vehicle.state.online`

**Result:** Vehicle transitions to online; normal polling resumes

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_API_UNREACHABLE` | 503 | Vehicle is not responding. Polling will continue with backoff. | No |
| `VEHICLE_SUSPENDED` | 409 | Vehicle logging is suspended. Resume logging to track activity. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.state.online` | Vehicle became reachable via API | `vehicle_id`, `timestamp` |
| `vehicle.state.driving_started` | Vehicle shifted into a drive gear | `vehicle_id`, `timestamp`, `shift_state` |
| `vehicle.state.driving_ended` | Vehicle shifted into park or stopped responding | `vehicle_id`, `timestamp`, `duration_min` |
| `vehicle.state.charging_started` | Vehicle began a charging session | `vehicle_id`, `timestamp`, `charging_state` |
| `vehicle.state.charging_ended` | Vehicle completed or stopped a charging session | `vehicle_id`, `timestamp`, `duration_min` |
| `vehicle.state.asleep` | Vehicle entered sleep mode | `vehicle_id`, `timestamp` |
| `vehicle.state.offline` | Vehicle stopped responding to API requests | `vehicle_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |
| ev-charging-session | required |  |
| vehicle-sleep-wake-detection | extends |  |

## AGI Readiness

### Goals

#### Reliable Vehicle State Machine

Tracks the real-time operational state of a connected vehicle (online, driving, charging, asleep, offline, updating) by polling a vehicle API and persisting state transitions.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

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
| `ev_charging_session` | ev-charging-session | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| vehicle_transitions_to_driving | `autonomous` | - | - |
| vehicle_transitions_to_charging | `autonomous` | - | - |
| vehicle_falls_asleep | `autonomous` | - | - |
| vehicle_goes_offline | `autonomous` | - | - |
| vehicle_wakes_up | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL, GenServer state machine
  files_traced: 8
  entry_points:
    - lib/teslamate/vehicles/vehicle.ex
    - lib/teslamate/log/state.ex
    - lib/teslamate/vehicles/vehicle/summary.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle State Machine Blueprint",
  "description": "Tracks the real-time operational state of a connected vehicle (online, driving, charging, asleep, offline, updating) by polling a vehicle API and persisting sta",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, telemetry, state-machine, ev, fleet, polling"
}
</script>
