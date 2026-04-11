---
title: "Fuel Level Reporting Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Read fuel sensor data transmitted by GPS hardware, detect significant fuel drops (theft or fast consumption) and unexpected increases (refuelling), and provide "
---

# Fuel Level Reporting Blueprint

> Read fuel sensor data transmitted by GPS hardware, detect significant fuel drops (theft or fast consumption) and unexpected increases (refuelling), and provide fuel consumption summaries across trips and time periods.

| | |
|---|---|
| **Feature** | `fuel-level-reporting` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, fuel, fleet, sensor, alert, consumption |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/fuel-level-reporting.blueprint.yaml) |
| **JSON API** | [fuel-level-reporting.json]({{ site.baseurl }}/api/blueprints/data/fuel-level-reporting.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Reads fuel sensor and includes fuel level in position transmissions |
| `pipeline` | Position Processing Pipeline | system | Compares fuel levels between consecutive positions to detect threshold crossings |
| `fleet_manager` | Fleet Manager | human | Monitors fuel levels, reviews consumption reports, and investigates anomalous drops |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `fuel_level` | number | No |  |  |
| `fuel_volume` | number | No |  |  |
| `fuel_used` | number | No |  |  |
| `fuel_consumption_rate` | number | No |  |  |
| `fuel_drop_threshold` | number | No |  |  |
| `fuel_increase_threshold` | number | No |  |  |

## Rules

- Fuel data is read from position attributes; the specific attribute key and unit depend on the device and protocol
- A fuel drop event is generated when the fuel level decreases by more than fuel_drop_threshold between consecutive positions
- A fuel increase event is generated when the fuel level increases by more than fuel_increase_threshold between consecutive positions (indicating a refuel)
- Only latest positions are evaluated for threshold crossings; outdated positions are skipped
- Fuel consumption is calculated per trip and per summary period using the difference between start and end fuel values
- If the device does not report a fuel sensor, the feature is inactive and no fuel events are generated
- Both percentage-based and volume-based fuel attributes are supported; the platform uses whichever the device provides

## Outcomes

### No_fuel_sensor (Priority: 3)

**Given:**
- position does not include any fuel attribute

**Result:** Fuel events skipped for this position; no fuel data is available from this device

### Fuel_drop_detected (Priority: 10)

**Given:**
- current fuel value is lower than previous fuel value by >= fuel_drop_threshold
- position is the latest for the device

**Then:**
- **create_record** target: `event` — Fuel drop event recorded with type = device_fuel_drop, previous and current values
- **emit_event** event: `fuel.dropped`

**Result:** Fuel drop event stored; possible theft or leak investigation can be triggered

### Fuel_increase_detected (Priority: 10)

**Given:**
- current fuel value is higher than previous fuel value by >= fuel_increase_threshold
- position is the latest for the device

**Then:**
- **create_record** target: `event` — Fuel increase event recorded with type = device_fuel_increase, previous and current values
- **emit_event** event: `fuel.increased`

**Result:** Fuel increase event stored; refuelling noted for cost tracking

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FUEL_DEVICE_NOT_FOUND` |  | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fuel.dropped` | Fuel level fell by more than the configured threshold — possible theft, leak, or high consumption | `device_id`, `previous_fuel`, `current_fuel`, `delta`, `position_id`, `fix_time` |
| `fuel.increased` | Fuel level rose by more than the configured threshold — refuelling detected | `device_id`, `previous_fuel`, `current_fuel`, `delta`, `position_id`, `fix_time` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion |  |  |
| trip-detection |  |  |
| fleet-scheduled-reports |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 4
  entry_points:
    - src/main/java/org/traccar/handler/events/FuelEventHandler.java
    - src/main/java/org/traccar/model/Position.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fuel Level Reporting Blueprint",
  "description": "Read fuel sensor data transmitted by GPS hardware, detect significant fuel drops (theft or fast consumption) and unexpected increases (refuelling), and provide ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, fuel, fleet, sensor, alert, consumption"
}
</script>
