---
title: "Vehicle Sleep Wake Detection Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Detects when a connected vehicle enters and exits sleep mode by observing API availability, persists sleep period records, and adapts the polling schedule to mi"
---

# Vehicle Sleep Wake Detection Blueprint

> Detects when a connected vehicle enters and exits sleep mode by observing API availability, persists sleep period records, and adapts the polling schedule to minimise battery drain.

| | |
|---|---|
| **Feature** | `vehicle-sleep-wake-detection` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, sleep, wake, battery, telemetry, ev, polling |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-sleep-wake-detection.blueprint.yaml) |
| **JSON API** | [vehicle-sleep-wake-detection.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-sleep-wake-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `polling_service` | Polling Service | system | Periodically queries the vehicle API to detect state changes |
| `vehicle_api` | Vehicle API | external | Returns vehicle state including explicit sleep/online/offline status |
| `vehicle_owner` | Vehicle Owner | human | May configure idle-to-sleep thresholds |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `sleep_state` | select | Yes | Sleep State |  |
| `state_start_date` | datetime | Yes | State Start Date |  |
| `state_end_date` | datetime | No | State End Date |  |
| `suspend_after_idle_min` | number | No | Suspend After Idle (minutes) |  |
| `polling_interval_sec` | number | No | Current Polling Interval (seconds) |  |

## States

**State field:** `sleep_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `online` | Yes |  |
| `asleep` |  |  |
| `offline` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `online` | `asleep` | polling_service | API returns asleep AND all sleep eligibility conditions are satisfied |
|  | `online` | `offline` | polling_service | API request fails, times out, or returns no valid response |
|  | `asleep` | `online` | polling_service | Next API poll returns a valid online response |
|  | `offline` | `online` | polling_service | API request succeeds after one or more failures |

## Rules

- **sleep_from_api_not_inferred:**
  - **description:** Sleep state is determined by the vehicle API — the API explicitly returns asleep when the vehicle is in deep sleep, not inferred locally
- **polling_interval_adapts:**
  - **description:** Polling interval adapts by state — asleep uses ~30s to avoid waking the vehicle, offline uses exponential backoff starting ~5s doubling to ~30s max, online uses ~15s
- **sleep_eligibility_all_conditions:**
  - **description:** A vehicle can only enter sleep when ALL of these are false — sentry mode, preconditioning, dog mode, user presence, open doors, battery heater active, software download in progress
- **suspend_threshold_configurable:**
  - **description:** The suspend_after_idle_min threshold controls how long active polling continues before stepping back to allow sleep. Default ~15-21 minutes; with streaming API ~3 minutes
- **state_periods_stored_with_timestamps:**
  - **description:** State periods are stored with explicit start_date and end_date enabling historical sleep duration analysis and battery-drain reporting
- **no_auto_resume_from_suspended:**
  - **description:** Logging cannot be resumed automatically while asleep or offline; only explicit operator action changes the suspended flag

## Outcomes

### Vehicle_enters_sleep (Priority: 1)

**Given:**
- `sleep_state` (db) eq `online`
- API response explicitly indicates vehicle is asleep
- all sleep eligibility conditions are satisfied

**Then:**
- **set_field** target: `state_end_date` value: `current_timestamp`
- **create_record** — Open a new asleep state record with state_start_date
- **transition_state** field: `sleep_state` from: `online` to: `asleep`
- **emit_event** event: `vehicle.sleep.entered`

**Result:** Sleep period begins; polling switches to low-frequency mode

### Vehicle_wakes (Priority: 2)

**Given:**
- `sleep_state` (db) in `asleep,offline`
- API request returns a valid online response

**Then:**
- **set_field** target: `state_end_date` value: `current_timestamp`
- **create_record** — Open a new online state record
- **transition_state** field: `sleep_state` from: `asleep` to: `online`
- **emit_event** event: `vehicle.sleep.exited`

**Result:** Wake detected; polling resumes at normal interval

### Vehicle_goes_offline (Priority: 3)

**Given:**
- API request for the vehicle fails or times out

**Then:**
- **transition_state** field: `sleep_state` from: `online` to: `offline`
- **emit_event** event: `vehicle.offline`

**Result:** Offline state recorded; polling continues with backoff strategy

### Vehicle_recovers_from_offline (Priority: 4)

**Given:**
- `sleep_state` (db) eq `offline`
- API request returns a valid response

**Then:**
- **transition_state** field: `sleep_state` from: `offline` to: `online`
- **emit_event** event: `vehicle.online`

**Result:** Vehicle reconnected; normal polling resumes

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VEHICLE_API_TIMEOUT` | 503 | Vehicle is not responding. Will retry with backoff. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.sleep.entered` | Vehicle transitioned into deep sleep mode | `vehicle_id`, `timestamp` |
| `vehicle.sleep.exited` | Vehicle woke from sleep and is responding normally | `vehicle_id`, `timestamp`, `sleep_duration_min` |
| `vehicle.offline` | Vehicle stopped responding to API requests | `vehicle_id`, `timestamp` |
| `vehicle.online` | Vehicle is reachable and responding normally | `vehicle_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-state-machine | extends |  |
| vehicle-trip-segmentation | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL, GenServer
  files_traced: 4
  entry_points:
    - lib/teslamate/vehicles/vehicle.ex
    - lib/teslamate/log/state.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Sleep Wake Detection Blueprint",
  "description": "Detects when a connected vehicle enters and exits sleep mode by observing API availability, persists sleep period records, and adapts the polling schedule to mi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, sleep, wake, battery, telemetry, ev, polling"
}
</script>
