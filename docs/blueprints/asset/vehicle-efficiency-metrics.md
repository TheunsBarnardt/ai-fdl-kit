---
title: "Vehicle Efficiency Metrics Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Tracks a vehicle's energy efficiency (Wh/km) over time by statistically deriving an efficiency factor from charging sessions and applying it to trips for trend "
---

# Vehicle Efficiency Metrics Blueprint

> Tracks a vehicle's energy efficiency (Wh/km) over time by statistically deriving an efficiency factor from charging sessions and applying it to trips for trend analysis.

| | |
|---|---|
| **Feature** | `vehicle-efficiency-metrics` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, efficiency, energy, ev, analytics, telemetry |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-efficiency-metrics.blueprint.yaml) |
| **JSON API** | [vehicle-efficiency-metrics.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-efficiency-metrics.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Recalculates efficiency after each qualifying charging session |
| `vehicle_owner` | Vehicle Owner | human | May configure preferred range metric and review efficiency trends |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `efficiency_wh_per_km` | number | No | Efficiency (Wh/km) |  |
| `efficiency_sample_count` | number | No | Confirmed Sample Count |  |
| `efficiency_last_updated` | datetime | No | Efficiency Last Updated |  |
| `preferred_range_metric` | select | No | Preferred Range Metric |  |
| `derivation_min_sessions` | number | No | Minimum Sessions for Derivation |  |

## Rules

- **efficiency_from_statistical_mode:**
  - **description:** The efficiency factor is derived by calculating energy_added_kwh / range_gained_km for each qualifying session then taking the statistical mode with sufficient samples
- **session_qualification_criteria:**
  - **description:** A session qualifies only when duration > 10 minutes, end_battery_level <= 95%, both start and end range values are present, and charge_energy_added > 0
- **precision_fallback_strategy:**
  - **description:** Derivation tries precision levels 5 through 2 paired with minimum sample counts 8, 5, 3, 2 — the first level with a consensus wins
- **retain_if_no_consensus:**
  - **description:** If no precision level yields a consensus the existing factor is kept unchanged and never deleted or set to null
- **efficiency_unit:**
  - **description:** Efficiency is expressed in Wh/km; convert to kWh/100km by dividing by 10, or to Wh/mi by dividing by 1.609
- **no_retroactive_recalculation:**
  - **description:** Historical trips are not retroactively recalculated when efficiency changes — each trip uses the factor current at close time

## Outcomes

### Efficiency_derived_successfully (Priority: 1)

**Given:**
- a qualifying charging session has just completed
- a consensus efficiency value found at some precision level

**Then:**
- **set_field** target: `efficiency_wh_per_km` value: `new consensus value`
- **set_field** target: `efficiency_sample_count` value: `number of sessions that matched`
- **set_field** target: `efficiency_last_updated` value: `current_timestamp`
- **emit_event** event: `vehicle.efficiency.updated`

**Result:** Efficiency factor updated; new trips will use the improved estimate

### Efficiency_derivation_inconclusive (Priority: 2)

**Given:**
- a qualifying charging session has just completed
- no consensus found at any precision level

**Then:**
- **emit_event** event: `vehicle.efficiency.unchanged`

**Result:** Efficiency factor unchanged; previous value retained

### Efficiency_applied_to_trip (Priority: 3)

**Given:**
- a trip has just completed
- `efficiency_wh_per_km` (db) exists

**Then:**
- **set_field** target: `estimated_energy_kwh` — trip.range_delta_km x efficiency_wh_per_km / 1000

**Result:** Energy consumed estimate attached to trip for analytics

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EFFICIENCY_DERIVATION_FAILED` | 422 | Could not derive an efficiency factor. More charging data required. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.efficiency.updated` | Efficiency factor successfully recalculated from charging history | `vehicle_id`, `efficiency_wh_per_km`, `sample_count`, `precision_used` |
| `vehicle.efficiency.unchanged` | Efficiency derivation ran but found no consensus; value unchanged | `vehicle_id`, `sessions_evaluated`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ev-charging-session | required |  |
| trip-energy-consumption | extends |  |
| battery-health-tracking | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 4
  entry_points:
    - lib/teslamate/log/car.ex
    - lib/teslamate/log/charging_process.ex
    - lib/teslamate/settings/global_settings.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Efficiency Metrics Blueprint",
  "description": "Tracks a vehicle's energy efficiency (Wh/km) over time by statistically deriving an efficiency factor from charging sessions and applying it to trips for trend ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, efficiency, energy, ev, analytics, telemetry"
}
</script>
