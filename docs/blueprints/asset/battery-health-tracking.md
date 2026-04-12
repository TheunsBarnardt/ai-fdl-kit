---
title: "Battery Health Tracking Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Monitors EV battery health over time by comparing reported range capacity against a manufacturer baseline, detecting degradation trends and alerting when capaci"
---

# Battery Health Tracking Blueprint

> Monitors EV battery health over time by comparing reported range capacity against a manufacturer baseline, detecting degradation trends and alerting when capacity loss exceeds a threshold.

| | |
|---|---|
| **Feature** | `battery-health-tracking` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, battery, health, degradation, ev, telemetry, analytics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/battery-health-tracking.blueprint.yaml) |
| **JSON API** | [battery-health-tracking.json]({{ site.baseurl }}/api/blueprints/asset/battery-health-tracking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Calculates battery health snapshots from charging telemetry |
| `vehicle_owner` | Vehicle Owner | human | Reviews battery health trends and configures degradation alert thresholds |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_id` | text | Yes | Vehicle ID |  |
| `snapshot_date` | datetime | Yes | Snapshot Date |  |
| `measured_range_km` | number | No | Measured Max Range (km) |  |
| `baseline_range_km` | number | Yes | Baseline Range (km) |  |
| `degradation_pct` | number | No | Degradation (%) |  |
| `energy_per_soc_pct_kwh` | number | No | Energy per SOC Point (kWh) |  |
| `degradation_alert_threshold_pct` | number | No | Alert Threshold (%) |  |

## Rules

- **health_from_range_at_high_soc:**
  - **description:** Battery health is estimated by comparing the vehicle's reported range at high SOC against the baseline range for the vehicle model
- **high_soc_sessions_most_reliable:**
  - **description:** The most reliable health snapshots come from charging sessions that end near 100% SOC — these give the clearest picture of current maximum capacity
- **degradation_formula:**
  - **description:** Degradation percentage = (baseline_range_km - measured_range_km) / baseline_range_km x 100; positive values indicate degradation
- **secondary_health_indicator:**
  - **description:** Energy-per-SOC (kWh added per percentage point gained) is a secondary health indicator — a higher value means more energy is needed to reach the same SOC
- **rolling_average_over_outliers:**
  - **description:** A single outlier reading due to extreme temperature or partial charge should not override the trend; use rolling averages over multiple data points
- **alert_on_threshold_exceeded:**
  - **description:** Alerts fire when degradation_pct exceeds the configured degradation_alert_threshold_pct

## Outcomes

### Health_snapshot_created (Priority: 1)

**Given:**
- a charging session completed with end_battery_level >= 90%
- `measured_range_km` (computed) exists

**Then:**
- **create_record** — Persist a new health data point with snapshot_date, measured_range_km, and degradation_pct
- **emit_event** event: `battery.health.snapshot_taken`

**Result:** Health snapshot recorded; trend analysis can be updated

### Degradation_alert_triggered (Priority: 2)

**Given:**
- `degradation_pct` (computed) gte `degradation_alert_threshold_pct`

**Then:**
- **notify**
- **emit_event** event: `battery.health.degradation_alert`

**Result:** Owner notified of significant capacity loss

### Health_trending_normal (Priority: 3)

**Given:**
- `degradation_pct` (computed) lt `degradation_alert_threshold_pct`

**Then:**
- **emit_event** event: `battery.health.snapshot_taken`

**Result:** Health snapshot recorded; degradation within acceptable range

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BATTERY_BASELINE_NOT_CONFIGURED` | 422 | No baseline range is configured for this vehicle model. Health tracking requires a reference value. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `battery.health.snapshot_taken` | A battery health data point was recorded | `vehicle_id`, `snapshot_date`, `measured_range_km`, `baseline_range_km`, `degradation_pct` |
| `battery.health.degradation_alert` | Battery degradation exceeded the configured alert threshold | `vehicle_id`, `degradation_pct`, `threshold_pct`, `measured_range_km` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ev-charging-session | required |  |
| trip-energy-consumption | recommended |  |
| vehicle-efficiency-metrics | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL
  files_traced: 4
  entry_points:
    - lib/teslamate/log/charge.ex
    - lib/teslamate/log/charging_process.ex
    - grafana/dashboards/battery-health.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Battery Health Tracking Blueprint",
  "description": "Monitors EV battery health over time by comparing reported range capacity against a manufacturer baseline, detecting degradation trends and alerting when capaci",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, battery, health, degradation, ev, telemetry, analytics"
}
</script>
