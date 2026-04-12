---
title: "Ev Charging Session Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Records the full lifecycle of an EV charging session — opening on plug-in, appending per-reading telemetry throughout, and aggregating energy, duration, cost, a"
---

# Ev Charging Session Blueprint

> Records the full lifecycle of an EV charging session — opening on plug-in, appending per-reading telemetry throughout, and aggregating energy, duration, cost, and battery change on close.

| | |
|---|---|
| **Feature** | `ev-charging-session` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | ev, charging, energy, kWh, telemetry, cost, vehicle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/ev-charging-session.blueprint.yaml) |
| **JSON API** | [ev-charging-session.json]({{ site.baseurl }}/api/blueprints/asset/ev-charging-session.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `polling_service` | Polling Service | system | Detects charging state transitions and records per-reading telemetry |
| `vehicle_api` | Vehicle API | external | Reports charging_state, energy_added, power, voltage, and battery level |
| `vehicle_owner` | Vehicle Owner | human | Initiates and ends charging sessions at a charging location |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `session_id` | hidden | No | Session ID |  |
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `start_date` | datetime | Yes | Start Date |  |
| `end_date` | datetime | No | End Date |  |
| `duration_min` | number | No | Duration (minutes) |  |
| `start_battery_level` | number | Yes | Start Battery Level (%) |  |
| `end_battery_level` | number | No | End Battery Level (%) |  |
| `start_range_km` | number | No | Start Range (km) |  |
| `end_range_km` | number | No | End Range (km) |  |
| `charge_energy_added_kwh` | number | No | Energy Added (kWh) |  |
| `charge_energy_used_kwh` | number | No | Grid Energy Used (kWh) |  |
| `outside_temp_avg` | number | No | Avg Outside Temp (°C) |  |
| `cost` | number | No | Session Cost |  |
| `location_id` | hidden | No | Location (Geofence) |  |
| `reading_date` | datetime | Yes | Reading Timestamp |  |
| `battery_level` | number | Yes | Battery Level at Reading (%) |  |
| `charger_power_kw` | number | No | Charger Power (kW) |  |
| `charger_voltage` | number | No | Charger Voltage (V) |  |
| `charger_actual_current` | number | No | Charger Current (A) |  |
| `charger_phases` | number | No | AC Phases |  |
| `fast_charger_type` | text | No | Charger Network / Protocol |  |

## States

**State field:** `session_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `in_progress` |  |  |
| `completed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `in_progress` | polling_service | charging_state transitions to Starting or Charging |
|  | `in_progress` | `completed` | polling_service | charging_state is no longer Starting or Charging |

## Rules

- **session_opens_on_charging_state:**
  - **description:** A charging session opens when the vehicle API reports charging_state as Starting or Charging
- **telemetry_every_five_seconds:**
  - **description:** Per-reading telemetry is appended approximately every 5 seconds during the session, creating a detailed time series of the charging curve
- **aggregates_on_close:**
  - **description:** When a session closes — charge_energy_added = last minus first reading; charge_energy_used = sum(voltage x current x phases x interval seconds / 3600); duration_min = (max_date - min_date) in minutes; outside_temp_avg = average of all readings
- **cost_from_geofence_tariff:**
  - **description:** Cost is calculated based on the geofence tariff at the charging location. If no tariff is configured cost is null
- **free_charging_exemption:**
  - **description:** If the vehicle holds a free-charging entitlement and the session used the qualifying network, cost is set to 0.00 regardless of tariff
- **location_from_nearest_geofence:**
  - **description:** Location is determined at session start by finding the nearest geofence containing the vehicle's position
- **sessions_never_deleted:**
  - **description:** Sessions are never deleted after completion — they serve as the source of truth for efficiency factor derivation and battery health analysis

## Outcomes

### Session_started (Priority: 1)

**Given:**
- no charging session is currently in progress for this vehicle
- `charging_state` (input) in `Starting,Charging`

**Then:**
- **create_record** — Create session record with start_date, start_battery_level, location
- **transition_state** field: `session_status` from: `idle` to: `in_progress`
- **emit_event** event: `charging.session.started`

**Result:** Charging session opened; telemetry collection begins

### Telemetry_reading_recorded (Priority: 2)

**Given:**
- a charging session is in_progress

**Then:**
- **create_record** — Append current charger telemetry to the session time series

**Result:** One telemetry reading appended; charging curve grows

### Session_completed (Priority: 3)

**Given:**
- a charging session is in_progress
- `charging_state` (input) not_in `Starting,Charging`

**Then:**
- **set_field** target: `end_date` value: `current_timestamp`
- **set_field** target: `charge_energy_added_kwh` value: `last_reading_energy_added - first_reading_energy_added`
- **set_field** target: `duration_min` value: `elapsed minutes between start_date and end_date`
- **set_field** target: `cost` value: `calculated from geofence tariff`
- **transition_state** field: `session_status` from: `in_progress` to: `completed`
- **emit_event** event: `charging.session.completed`

**Result:** Session aggregated and closed; efficiency recalculation triggered

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHARGING_SESSION_NO_DATA` | 422 | Charging session ended without sufficient telemetry data. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `charging.session.started` | A charging session began at a location | `vehicle_id`, `session_id`, `start_date`, `location_id`, `start_battery_level` |
| `charging.session.completed` | A charging session completed | `vehicle_id`, `session_id`, `charge_energy_added_kwh`, `duration_min`, `cost`, `end_battery_level` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-state-machine | required |  |
| ev-charging-cost-tariff | required |  |
| geofence-places | recommended |  |
| trip-energy-consumption | recommended |  |
| battery-health-tracking | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 6
  entry_points:
    - lib/teslamate/vehicles/vehicle.ex
    - lib/teslamate/log/charging_process.ex
    - lib/teslamate/log/charge.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ev Charging Session Blueprint",
  "description": "Records the full lifecycle of an EV charging session — opening on plug-in, appending per-reading telemetry throughout, and aggregating energy, duration, cost, a",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ev, charging, energy, kWh, telemetry, cost, vehicle"
}
</script>
