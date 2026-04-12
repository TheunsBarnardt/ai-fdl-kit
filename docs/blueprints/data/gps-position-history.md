---
title: "Gps Position History Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Query, replay, and export the historical sequence of GPS positions recorded for one or more devices over a user-specified time range, supporting route visualisa"
---

# Gps Position History Blueprint

> Query, replay, and export the historical sequence of GPS positions recorded for one or more devices over a user-specified time range, supporting route visualisation, speed analysis, and multi-forma...

| | |
|---|---|
| **Feature** | `gps-position-history` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, history, playback, route, report, export, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/gps-position-history.blueprint.yaml) |
| **JSON API** | [gps-position-history.json]({{ site.baseurl }}/api/blueprints/data/gps-position-history.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_user` | Fleet User | human | Queries historical routes and exports data for analysis |
| `system` | Tracking Platform | system | Retrieves and streams stored positions in chronological order |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | hidden | Yes | Device whose position history is being queried |  |
| `from` | datetime | Yes | Start of the time range (inclusive) |  |
| `to` | datetime | Yes | End of the time range (inclusive) |  |
| `positions` | json | No | Ordered array of position records returned by the query, each including fix_time, latitude, longi... |  |
| `export_format` | select | No | Requested export format: gpx, kml, or csv |  |

## Rules

- **data:**
  - **time_range_ordering:** from must be earlier than to; queries with inverted ranges are rejected
  - **result_ordering:** Positions are returned in ascending fix_time order to support sequential playback
  - **access_control:** Only positions belonging to devices the requesting user has permission to view are returned
  - **invalid_positions:** Invalid (non-valid fix) positions are included in results but clients should visually distinguish them
  - **outdated_positions:** Outdated positions are included and marked as outdated for client handling
- **performance:**
  - **streaming:** For time ranges that would yield very large result sets, results should be streamed rather than buffered
- **completeness:**
  - **export_attributes:** Export formats must include all available position attributes (sensor data, alarms, driver ID) not only coordinates

## Outcomes

### Invalid_range (Priority: 1) — Error: `HISTORY_INVALID_TIME_RANGE`

**Given:**
- `from` (input) gte `to`

**Result:** Query is rejected with an error indicating the time range is invalid

### Access_denied (Priority: 2) — Error: `HISTORY_ACCESS_DENIED`

**Given:**
- requesting user does not have permission to view the specified device

**Result:** Query is rejected; no position data is returned

### Empty_result (Priority: 5)

**Given:**
- no positions exist for the device in the requested time range

**Result:** Empty list is returned with no error; client displays an empty route

### Export_requested (Priority: 8)

**Given:**
- fleet_user requests history export in gpx, kml, or csv format
- `export_format` (input) in `gpx,kml,csv`

**Then:**
- **emit_event** event: `position_history.exported`

**Result:** File in the requested format is returned as a downloadable attachment

### History_returned (Priority: 10)

**Given:**
- fleet_user requests history for a device they have access to
- `from` (input) lt `to`

**Then:**
- **emit_event** event: `position_history.queried`

**Result:** Ordered list of positions is returned to the client for playback or display

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HISTORY_INVALID_TIME_RANGE` | 400 | The start time must be before the end time | No |
| `HISTORY_ACCESS_DENIED` | 403 | You do not have permission to view history for this device | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `position_history.queried` | A historical position query was executed | `device_id`, `from`, `to`, `position_count`, `requested_by` |
| `position_history.exported` | Position history was exported to a file | `device_id`, `from`, `to`, `export_format`, `position_count`, `requested_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion | required | Positions must be ingested before they can be queried as history |
| fleet-device-sharing | required | Access control determines which devices a user may query |
| trip-detection | recommended | Trip segments can be overlaid on the position route for context |
| fleet-scheduled-reports | recommended | Scheduled route reports use position history as their data source |

## AGI Readiness

### Goals

#### Reliable Gps Position History

Query, replay, and export the historical sequence of GPS positions recorded for one or more devices over a user-specified time range, supporting route visualisation, speed analysis, and multi-forma...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `gps_position_ingestion` | gps-position-ingestion | degrade |
| `fleet_device_sharing` | fleet-device-sharing | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| history_returned | `autonomous` | - | - |
| empty_result | `autonomous` | - | - |
| export_requested | `autonomous` | - | - |
| invalid_range | `autonomous` | - | - |
| access_denied | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Hibernate, H2/MySQL/PostgreSQL
  files_traced: 10
  entry_points:
    - src/main/java/org/traccar/api/resource/PositionResource.java
    - src/main/java/org/traccar/helper/model/PositionUtil.java
    - src/main/java/org/traccar/reports/RouteReportProvider.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gps Position History Blueprint",
  "description": "Query, replay, and export the historical sequence of GPS positions recorded for one or more devices over a user-specified time range, supporting route visualisa",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, history, playback, route, report, export, fleet"
}
</script>
