---
title: "Trip Energy Consumption Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Calculates energy consumed per trip from battery range delta and a per-vehicle efficiency factor derived statistically from charging history and updated after e"
---

# Trip Energy Consumption Blueprint

> Calculates energy consumed per trip from battery range delta and a per-vehicle efficiency factor derived statistically from charging history and updated after each qualifying session.

| | |
|---|---|
| **Feature** | `trip-energy-consumption` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, energy, efficiency, ev, telemetry, trip |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/trip-energy-consumption.blueprint.yaml) |
| **JSON API** | [trip-energy-consumption.json]({{ site.baseurl }}/api/blueprints/asset/trip-energy-consumption.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Calculates and stores energy metrics when trips and charging sessions close |
| `vehicle_owner` | Vehicle Owner | human | May configure preferred range metric (ideal vs rated) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trip_id` | hidden | No | Trip ID |  |
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `start_range_km` | number | Yes | Start Range (km) |  |
| `end_range_km` | number | Yes | End Range (km) |  |
| `range_delta_km` | number | No | Range Consumed (km) |  |
| `preferred_range_metric` | select | No | Preferred Range Metric |  |
| `vehicle_efficiency_wh_per_km` | number | No | Vehicle Efficiency (Wh/km) |  |
| `estimated_energy_kwh` | number | No | Estimated Energy Consumed (kWh) |  |

## Rules

- **energy_from_range_and_efficiency:**
  - **description:** Energy consumed per trip is estimated as range_delta_km x efficiency_wh_per_km divided by 1000
- **preferred_range_configurable:**
  - **description:** Range delta uses the configured preferred_range_metric (ideal or rated); changing this setting affects all future efficiency derivations
- **efficiency_from_charging_history:**
  - **description:** The efficiency factor is a per-vehicle value derived from the statistical mode of kWh-per-range-gained across qualifying charging sessions — not a fixed manufacturer specification
- **charging_session_qualifies:**
  - **description:** A session qualifies for efficiency derivation only when duration > 10 minutes, end_battery_level <= 95%, both start and end range values are present, and charge_energy_added > 0
- **precision_fallback_strategy:**
  - **description:** Derivation tries decreasing decimal precision (5 to 2) paired with decreasing minimum sample counts (8, 5, 3, 2) and accepts the first precision level with a consensus
- **retain_existing_if_no_consensus:**
  - **description:** If no precision level yields a consensus the existing efficiency factor is retained unchanged and never deleted or set to null
- **no_negative_energy:**
  - **description:** Negative range_delta (battery charged during trip via regeneration artifact) is treated as zero energy consumed

## Outcomes

### Energy_estimated_at_trip_close (Priority: 1)

**Given:**
- trip has just completed
- `start_range_km` (db) exists
- `end_range_km` (db) exists
- `vehicle_efficiency_wh_per_km` (db) exists

**Then:**
- **set_field** target: `range_delta_km` value: `start_range_km - end_range_km`
- **set_field** target: `estimated_energy_kwh` value: `max(0, range_delta_km) x vehicle_efficiency_wh_per_km / 1000`
- **emit_event** event: `trip.energy.calculated`

**Result:** Energy estimate attached to the completed trip record

### Efficiency_updated_after_charge (Priority: 2)

**Given:**
- a qualifying charging session has just completed
- at least 2 sessions meet the derivation criteria at some precision level

**Then:**
- **set_field** target: `vehicle_efficiency_wh_per_km` value: `mode of charge_energy_added per range_added across qualifying sessions`
- **emit_event** event: `vehicle.efficiency.updated`

**Result:** Vehicle efficiency factor updated; future trip energy estimates improve

### Efficiency_unchanged_insufficient_data (Priority: 3)

**Given:**
- a charging session has just completed
- no consensus found across all precision and threshold levels

**Then:**
- **emit_event** event: `vehicle.efficiency.unchanged`

**Result:** Efficiency factor unchanged; previous value used for future estimates

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EFFICIENCY_NO_DATA` | 422 | Not enough qualifying charging sessions to derive an efficiency factor. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trip.energy.calculated` | Energy consumption estimate attached to a completed trip | `vehicle_id`, `trip_id`, `estimated_energy_kwh`, `range_delta_km`, `efficiency_wh_per_km` |
| `vehicle.efficiency.updated` | Vehicle efficiency factor recalculated from charging history | `vehicle_id`, `new_efficiency_wh_per_km`, `sample_count`, `precision_used` |
| `vehicle.efficiency.unchanged` | Efficiency derivation ran but found no consensus; value kept | `vehicle_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |
| ev-charging-session | required |  |
| vehicle-efficiency-metrics | extends |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 4
  entry_points:
    - lib/teslamate/log/drive.ex
    - lib/teslamate/log/car.ex
    - lib/teslamate/settings/global_settings.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip Energy Consumption Blueprint",
  "description": "Calculates energy consumed per trip from battery range delta and a per-vehicle efficiency factor derived statistically from charging history and updated after e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, energy, efficiency, ev, telemetry, trip"
}
</script>
