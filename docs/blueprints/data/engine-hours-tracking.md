---
title: "Engine Hours Tracking Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Accumulate the total time a vehicle engine has been running by measuring the duration between consecutive positions while the ignition is on, providing accurate"
---

# Engine Hours Tracking Blueprint

> Accumulate the total time a vehicle engine has been running by measuring the duration between consecutive positions while the ignition is on, providing accurate engine-hours data for maintenance sc...

| | |
|---|---|
| **Feature** | `engine-hours-tracking` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, engine-hours, maintenance, fleet, ignition |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/engine-hours-tracking.blueprint.yaml) |
| **JSON API** | [engine-hours-tracking.json]({{ site.baseurl }}/api/blueprints/data/engine-hours-tracking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Engine Hours Handler | system | Computes cumulative engine hours on each incoming position using ignition state and device timestamps |
| `device` | GPS Device | external | Optionally transmits hardware engine hours; always reports ignition state for calculation fallback |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `hours` | number | No | Cumulative engine running time in milliseconds stored on each position record |  |
| `ignition` | boolean | No | Ignition state at the time of the position; used to gate hour accumulation |  |
| `device_time` | datetime | Yes | Device clock timestamp used for interval calculation (preferred over server time for accuracy) |  |

## Rules

- **rule_1:** If the device transmits a hardware engine hours value, it is stored directly and used without modification
- **rule_2:** If no hardware value is present, engine hours are calculated from the difference between current and previous device timestamps when ignition was on in both positions
- **rule_3:** Hours are accumulated only when ignition = true in both the current and the previous position; idle-off periods are excluded
- **rule_4:** Device time (not server time) is used for interval calculation to avoid accumulating server-processing delays
- **rule_5:** The calculated engine hours value is stored on every position as a cumulative total, making it directly queryable for any time range
- **rule_6:** Engine hours feed maintenance reminders; a maintenance reminder fires when the hours value crosses a configured threshold

## Outcomes

### Ignition_off_interval_skipped (Priority: 8)

**Given:**
- ANY: `ignition` (input) eq `false` OR previous position had ignition = false

**Then:**
- **set_field** target: `position.hours` — Hours value carried forward unchanged from the previous position

**Result:** No hours added; engine was off during this interval

### Hardware_hours_used (Priority: 9)

**Given:**
- device transmits a non-zero hardware hours value in position attributes

**Then:**
- **set_field** target: `position.hours` — Hardware hours stored directly without recalculation

**Result:** Hardware hours recorded as authoritative; calculation fallback is not applied

### Hours_calculated (Priority: 10)

**Given:**
- current position does not carry a hardware hours value
- previous position exists and has an hours value
- `ignition` (input) eq `true`
- previous position also had ignition = true

**Then:**
- **set_field** target: `position.hours` — Previous hours + (current device_time - previous device_time) stored on the position

**Result:** Engine hours updated on the current position; cumulative running time increased by the ignition-on interval

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HOURS_DEVICE_NOT_FOUND` | 404 | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `engine_hours.threshold_reached` | Cumulative engine hours crossed a maintenance-relevant threshold | `device_id`, `hours_ms`, `position_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ignition-detection | required | Ignition state gates engine hour accumulation |
| gps-position-ingestion | required | Position records carry device timestamps and ignition attributes |
| maintenance-reminders | recommended | Engine hours thresholds trigger scheduled maintenance events |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 3
  entry_points:
    - src/main/java/org/traccar/handler/EngineHoursHandler.java
    - src/main/java/org/traccar/model/Position.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Engine Hours Tracking Blueprint",
  "description": "Accumulate the total time a vehicle engine has been running by measuring the duration between consecutive positions while the ignition is on, providing accurate",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, engine-hours, maintenance, fleet, ignition"
}
</script>
