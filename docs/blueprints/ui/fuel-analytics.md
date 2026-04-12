---
title: "Fuel Analytics Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Analyse fuel consumption, cost trends, and efficiency metrics across the fleet or per vehicle with configurable grouping periods, anomaly detection, and benchma"
---

# Fuel Analytics Blueprint

> Analyse fuel consumption, cost trends, and efficiency metrics across the fleet or per vehicle with configurable grouping periods, anomaly detection, and benchmark comparisons.

| | |
|---|---|
| **Feature** | `fuel-analytics` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | fleet, fuel, analytics, reporting, efficiency, cost, trends |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/fuel-analytics.blueprint.yaml) |
| **JSON API** | [fuel-analytics.json]({{ site.baseurl }}/api/blueprints/ui/fuel-analytics.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Reviews fleet-wide and per-vehicle fuel performance |
| `finance_manager` | Finance Manager | human | Reviews fuel cost spend and budget variance |
| `system` | System | system | Aggregates fuel log data and computes analytics on demand |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle_filter` | text | No | Vehicle Filter |  |
| `date_from` | date | Yes | From Date |  |
| `date_to` | date | Yes | To Date |  |
| `grouping_period` | select | No | Grouping Period |  |
| `total_fuel_quantity` | number | No | Total Fuel Consumed |  |
| `total_fuel_cost` | number | No | Total Fuel Cost |  |
| `total_distance` | number | No | Total Distance (km) |  |
| `average_cost_per_km` | number | No | Average Cost per km |  |
| `average_efficiency` | number | No | Average Efficiency (units/100km) |  |
| `refuel_count` | number | No | Number of Fill-ups |  |
| `efficiency_trend` | select | No | Efficiency Trend |  |
| `comparison_baseline` | select | No | Comparison Baseline |  |
| `anomaly_threshold_pct` | number | No | Anomaly Threshold (%) |  |

## Rules

- **valid_date_range:**
  - **description:** Date range must be valid — date_to must be after date_from
- **cost_per_km_requires_distance:**
  - **description:** cost_per_km is computed only when total_distance is greater than zero
- **trend_classification:**
  - **description:** Efficiency trend is classified as improving when current period average is more than 5% better than comparison baseline; declining when more than 5% worse; stable otherwise
- **anomaly_detection:**
  - **description:** An anomaly is flagged when a single vehicle's efficiency deviates from the fleet average by more than anomaly_threshold_pct
- **minimum_entries_for_trend:**
  - **description:** Vehicles with fewer than two fuel entries in the period are excluded from trend calculations
- **base_currency:**
  - **description:** All monetary values are presented in the fleet's base currency

## Outcomes

### No_data_in_period (Priority: 1)

**Given:**
- no fuel log entries exist for the selected vehicle and date range

**Then:**
- **emit_event** event: `fuel_analytics.no_data`

**Result:** Report displays a no-data message; user is advised to widen the date range or check filters

### Invalid_date_range (Priority: 2) — Error: `ANALYTICS_INVALID_DATE_RANGE`

**Given:**
- `date_to` (input) lte `date_from`

**Result:** Report generation is blocked with a date validation error

### Anomaly_detected (Priority: 9)

**Given:**
- report_generated outcome has run
- a vehicle's efficiency deviates from fleet average by more than anomaly_threshold_pct

**Then:**
- **emit_event** event: `fuel_analytics.anomaly_detected`

**Result:** Anomalous vehicle is highlighted in the report with the deviation percentage

### Report_generated (Priority: 10)

**Given:**
- date_from and date_to are provided
- `date_to` (input) gt `date_from`
- at least one fuel log entry exists in the period

**Then:**
- **set_field** target: `total_fuel_quantity` — Sum fuel_quantity from all entries in range
- **set_field** target: `total_fuel_cost` — Sum total_cost from all entries in range
- **set_field** target: `total_distance` — Sum distance_since_last from all entries in range
- **set_field** target: `average_cost_per_km` — Divide total_fuel_cost by total_distance
- **set_field** target: `average_efficiency` — Compute (total_fuel_quantity / total_distance) × 100
- **set_field** target: `efficiency_trend` — Compare average_efficiency to comparison_baseline and classify
- **emit_event** event: `fuel_analytics.report_generated`

**Result:** Analytics report is rendered with consumption totals, cost breakdown, efficiency metrics, and trend direction

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ANALYTICS_INVALID_DATE_RANGE` | 400 | The end date must be after the start date. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fuel_analytics.report_generated` | A fuel analytics report has been computed for the specified filters and period | `vehicle_filter`, `date_from`, `date_to`, `total_fuel_cost`, `average_efficiency`, `efficiency_trend` |
| `fuel_analytics.anomaly_detected` | A vehicle's fuel efficiency deviates significantly from the fleet baseline | `vehicle`, `deviation_pct`, `expected_efficiency`, `actual_efficiency` |
| `fuel_analytics.no_data` | No fuel log entries exist for the requested vehicle and date range | `vehicle_filter`, `date_from`, `date_to` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fuel-log | required | Fuel log entries are the source data for all analytics computations |
| vehicle-master-data | required | Vehicle specifications (fuel type, category) are used to group and filter analytics |
| odometer-tracking | recommended | Validated odometer data improves distance and efficiency accuracy |
| vehicle-expense-tracking | recommended | Fuel cost analytics feed into the broader per-vehicle expense reporting |

## AGI Readiness

### Goals

#### Reliable Fuel Analytics

Analyse fuel consumption, cost trends, and efficiency metrics across the fleet or per vehicle with configurable grouping periods, anomaly detection, and benchmark comparisons.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fuel_log` | fuel-log | degrade |
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| report_generated | `autonomous` | - | - |
| no_data_in_period | `autonomous` | - | - |
| anomaly_detected | `autonomous` | - | - |
| invalid_date_range | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 1
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fuel Analytics Blueprint",
  "description": "Analyse fuel consumption, cost trends, and efficiency metrics across the fleet or per vehicle with configurable grouping periods, anomaly detection, and benchma",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, fuel, analytics, reporting, efficiency, cost, trends"
}
</script>
