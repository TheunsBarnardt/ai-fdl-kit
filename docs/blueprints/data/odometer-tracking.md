---
title: "Odometer Tracking Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Track cumulative vehicle mileage either by reading the hardware odometer transmitted by the GPS device or by calculating distance from GPS coordinates, with per"
---

# Odometer Tracking Blueprint

> Track cumulative vehicle mileage either by reading the hardware odometer transmitted by the GPS device or by calculating distance from GPS coordinates, with per-position incremental distances and a...

| | |
|---|---|
| **Feature** | `odometer-tracking` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, odometer, mileage, distance, fleet, maintenance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/odometer-tracking.blueprint.yaml) |
| **JSON API** | [odometer-tracking.json]({{ site.baseurl }}/api/blueprints/data/odometer-tracking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Optionally transmits the vehicle ECU odometer value in position data |
| `pipeline` | Distance Handler | system | Calculates incremental and cumulative distance from GPS coordinates when hardware odometer is unavailable |
| `fleet_manager` | Fleet Manager | human | Uses odometer data to schedule maintenance, calculate fuel efficiency, and generate mileage reports |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `odometer` | number | No | Hardware odometer reading in metres, transmitted directly by the vehicle ECU via the device |  |
| `distance` | number | No | Incremental distance in metres calculated from the previous position to this one |  |
| `total_distance` | number | No | Cumulative distance in metres accumulated across all positions for this device from the tracking ... |  |
| `min_distance_meters` | number | No | Minimum position-to-position distance to record; movements shorter than this are treated as GPS n... |  |
| `max_distance_meters` | number | No | Maximum plausible position-to-position distance; movements longer than this are treated as GPS er... |  |

## Rules

- **rule_1:** If the device transmits a hardware odometer value, it is stored directly on the position and takes precedence over calculated distance in reports
- **rule_2:** Incremental distance is calculated using the great-circle formula between the current and previous position coordinates
- **rule_3:** Distance increments shorter than min_distance_meters are treated as GPS noise and recorded as zero
- **rule_4:** Distance increments longer than max_distance_meters are treated as GPS position errors and excluded from the cumulative total
- **rule_5:** Cumulative total_distance is maintained on each position record as a running sum of valid increments
- **rule_6:** Reports prefer the hardware odometer if available; otherwise they use total_distance
- **rule_7:** The odometer can be reset remotely via a set_odometer command to align with a workshop reading

## Outcomes

### Error_position_excluded (Priority: 4)

**Given:**
- incremental distance > max_distance_meters

**Then:**
- **set_field** target: `position.distance` value: `0`

**Result:** Implausible jump excluded from odometer accumulation; position is still stored

### Noise_filtered (Priority: 5)

**Given:**
- incremental distance < min_distance_meters

**Then:**
- **set_field** target: `position.distance` value: `0`

**Result:** Position recorded with zero distance increment; cumulative total unchanged

### Hardware_odometer_used (Priority: 8)

**Given:**
- device transmits a non-zero hardware odometer value in position attributes

**Then:**
- **set_field** target: `position.odometer` — Hardware odometer value stored directly on the position

**Result:** Hardware odometer recorded; used by maintenance reminders and summary reports in preference to calculated distance

### Distance_calculated (Priority: 10)

**Given:**
- a new position is received with valid coordinates
- a previous position exists for the device
- incremental distance >= min_distance_meters
- incremental distance <= max_distance_meters

**Then:**
- **set_field** target: `position.distance` — Incremental distance for this position interval stored
- **set_field** target: `position.total_distance` — Cumulative total updated with the new increment

**Result:** Distance fields populated on the position record; available for reports and maintenance triggers

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ODOMETER_DEVICE_NOT_FOUND` | 404 | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `odometer.updated` | A new distance increment was calculated and accumulated (emitted when crossing a reporting threshold) | `device_id`, `total_distance`, `increment`, `position_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion | required | GPS coordinates and hardware odometer values arrive via position ingestion |
| maintenance-reminders | recommended | Maintenance intervals are triggered when odometer values cross configured thresholds |
| trip-detection | recommended | Trip distance is derived from odometer or calculated distance over the trip interval |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 5
  entry_points:
    - src/main/java/org/traccar/handler/DistanceHandler.java
    - src/main/java/org/traccar/model/Position.java
    - src/main/java/org/traccar/helper/DistanceCalculator.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Odometer Tracking Blueprint",
  "description": "Track cumulative vehicle mileage either by reading the hardware odometer transmitted by the GPS device or by calculating distance from GPS coordinates, with per",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, odometer, mileage, distance, fleet, maintenance"
}
</script>
