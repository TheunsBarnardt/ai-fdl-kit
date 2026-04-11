---
title: "Gps Position Ingestion Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route"
---

# Gps Position Ingestion Blueprint

> Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route through a processing pipeline before storage.

| | |
|---|---|
| **Feature** | `gps-position-ingestion` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, iot, protocol, position, ingestion, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/gps-position-ingestion.blueprint.yaml) |
| **JSON API** | [gps-position-ingestion.json]({{ site.baseurl }}/api/blueprints/integration/gps-position-ingestion.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Physical tracking hardware that transmits encoded position messages |
| `protocol_decoder` | Protocol Decoder | system | Decodes device-specific binary or text frames into normalised position records |
| `pipeline` | Processing Pipeline | system | Applies enrichment and event-detection handlers to each decoded position |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes |  |  |
| `protocol` | text | Yes |  |  |
| `server_time` | datetime | Yes |  |  |
| `device_time` | datetime | No |  |  |
| `fix_time` | datetime | Yes |  |  |
| `valid` | boolean | Yes |  |  |
| `latitude` | number | Yes |  |  |
| `longitude` | number | Yes |  |  |
| `altitude` | number | No |  |  |
| `speed` | number | No |  |  |
| `course` | number | No |  |  |
| `accuracy` | number | No |  |  |
| `outdated` | boolean | No |  |  |
| `attributes` | json | No |  |  |

## Rules

- **validation:**
  - **latitude_range:** latitude must be in the range [-90, 90]; positions outside this range are rejected
  - **longitude_range:** longitude must be in the range [-180, 180]; positions outside this range are rejected
  - **coordinate_precision:** Coordinates are stored with sufficient floating-point precision to represent sub-metre accuracy
- **data:**
  - **outdated_positions:** A position whose fix_time is earlier than the device's last stored fix_time is accepted but flagged as outdated; event handlers skip outdated positions
  - **disabled_device_handling:** Positions from disabled or expired devices are accepted at the transport layer but discarded before pipeline processing
  - **protocol_field:** The protocol field records which decoder produced the position; downstream handlers may behave differently depending on protocol
- **processing:**
  - **handler_pipeline:** All positions pass through the full handler pipeline in defined order before storage; a handler failure must not discard the position — it should log the error and pass to the next handler

## Outcomes

### Invalid_coordinates (Priority: 1) — Error: `POSITION_INVALID_COORDINATES`

**Given:**
- ANY: `latitude` (input) lt `-90` OR `latitude` (input) gt `90` OR `longitude` (input) lt `-180` OR `longitude` (input) gt `180`

**Result:** Position is rejected; no record is created

### Device_not_found (Priority: 2) — Error: `POSITION_DEVICE_NOT_REGISTERED`

**Given:**
- unique_id in the incoming message does not match any registered device

**Result:** Message is silently discarded; the hardware is not recognised by the platform

### Position_outdated (Priority: 5)

**Given:**
- position fix_time is earlier than device's most recent stored fix_time

**Then:**
- **set_field** target: `outdated` value: `true`
- **create_record** target: `position` — Outdated position stored with outdated flag set

**Result:** Position is stored for historical completeness but event handlers do not process it

### Position_accepted (Priority: 10)

**Given:**
- device transmits a valid position message
- `latitude` (input) gte `-90`
- `latitude` (input) lte `90`
- `longitude` (input) gte `-180`
- `longitude` (input) lte `180`
- device_id resolves to an active, non-disabled device

**Then:**
- **create_record** target: `position` — Normalised position record persisted to storage
- **set_field** target: `device.last_update` — Device last_update and latest position_id updated
- **emit_event** event: `position.received`

**Result:** Position is stored and the device's latest position is updated; pipeline handlers run enrichment and event detection

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POSITION_INVALID_COORDINATES` |  | Position coordinates are outside valid WGS-84 ranges | No |
| `POSITION_DEVICE_NOT_REGISTERED` |  | No registered device matches the identifier in the incoming message | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `position.received` | A new position record has been stored after passing pipeline processing | `device_id`, `position_id`, `fix_time`, `latitude`, `longitude`, `speed`, `valid`, `protocol` |
| `position.pipeline_error` | A pipeline handler encountered an error while processing a position (position was still stored) | `device_id`, `position_id`, `handler_name`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-device-registration |  |  |
| gps-position-history |  |  |
| geofence-management |  |  |
| overspeed-alerts |  |  |
| ignition-detection |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty, Hibernate
  files_traced: 20
  entry_points:
    - src/main/java/org/traccar/model/Position.java
    - src/main/java/org/traccar/BaseProtocol.java
    - src/main/java/org/traccar/handler/BasePositionHandler.java
    - src/main/java/org/traccar/handler/DistanceHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gps Position Ingestion Blueprint",
  "description": "Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, iot, protocol, position, ingestion, fleet"
}
</script>
