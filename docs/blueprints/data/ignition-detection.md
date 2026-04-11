---
title: "Ignition Detection Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Detect transitions in vehicle ignition state by comparing the ignition attribute between consecutive position records, and emit ignition-on and ignition-off eve"
---

# Ignition Detection Blueprint

> Detect transitions in vehicle ignition state by comparing the ignition attribute between consecutive position records, and emit ignition-on and ignition-off events to drive engine hours calculation...

| | |
|---|---|
| **Feature** | `ignition-detection` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, ignition, engine, fleet, event |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/ignition-detection.blueprint.yaml) |
| **JSON API** | [ignition-detection.json]({{ site.baseurl }}/api/blueprints/data/ignition-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pipeline` | Position Processing Pipeline | system | Reads the ignition attribute from incoming positions and compares with the previous value |
| `device` | GPS Device | external | Reports ignition state as part of each position transmission |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes | Device whose ignition state is being tracked |  |
| `ignition` | boolean | No | Current ignition state reported in the position attributes (true = on, false = off) |  |
| `previous_ignition` | boolean | No | Ignition state from the device's previous position, used for transition detection |  |

## Rules

- **event_emission:**
  - **ignition_on_transition:** An ignition-on event is generated only when the previous position had ignition = false and the current position has ignition = true
  - **ignition_off_transition:** An ignition-off event is generated only when the previous position had ignition = true and the current position has ignition = false
- **validation:**
  - **attribute_required:** If either the current or previous position lacks the ignition attribute, no ignition event is generated for that position
  - **latest_position_only:** Only the latest position for the device is evaluated; outdated positions do not trigger ignition events
- **processing:**
  - **downstream_usage:** The ignition state is used by the engine hours handler to accumulate running time, and by the motion handler to inform trip detection

## Outcomes

### No_ignition_attribute (Priority: 3)

**Given:**
- the incoming position does not include an ignition attribute

**Result:** No ignition event is generated; engine hours and trip detection fall back to motion-based signals

### Ignition_turned_on (Priority: 10)

**Given:**
- `ignition` (input) eq `true`
- `previous_ignition` (db) eq `false`
- both current and previous positions carry the ignition attribute

**Then:**
- **create_record** target: `event` — Ignition-on event recorded with type = ignition_on, device_id, position_id
- **emit_event** event: `device.ignition_on`

**Result:** Ignition-on event stored; engine hours accumulation resumes, trip detection may trigger

### Ignition_turned_off (Priority: 10)

**Given:**
- `ignition` (input) eq `false`
- `previous_ignition` (db) eq `true`
- both current and previous positions carry the ignition attribute

**Then:**
- **create_record** target: `event` — Ignition-off event recorded with type = ignition_off, device_id, position_id
- **emit_event** event: `device.ignition_off`

**Result:** Ignition-off event stored; engine hours accumulation pauses, trip segmentation may close the current trip

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IGNITION_DEVICE_NOT_FOUND` | 404 | The device referenced in the position record does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.ignition_on` | Vehicle ignition has been switched on | `device_id`, `position_id`, `fix_time` |
| `device.ignition_off` | Vehicle ignition has been switched off | `device_id`, `position_id`, `fix_time` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion | required | Ignition state is read from the position attributes produced during ingestion |
| engine-hours-tracking | recommended | Engine hours are accumulated while ignition is on |
| trip-detection | recommended | Ignition transitions can serve as alternative trip start/end signals |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 4
  entry_points:
    - src/main/java/org/traccar/handler/events/IgnitionEventHandler.java
    - src/main/java/org/traccar/handler/EngineHoursHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ignition Detection Blueprint",
  "description": "Detect transitions in vehicle ignition state by comparing the ignition attribute between consecutive position records, and emit ignition-on and ignition-off eve",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, ignition, engine, fleet, event"
}
</script>
