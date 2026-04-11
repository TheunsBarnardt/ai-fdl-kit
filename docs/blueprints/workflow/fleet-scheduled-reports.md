---
title: "Fleet Scheduled Reports Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Generate, schedule, and distribute fleet tracking reports covering trips, stops, route history, events, geofence activity, device summaries, and fuel consumptio"
---

# Fleet Scheduled Reports Blueprint

> Generate, schedule, and distribute fleet tracking reports covering trips, stops, route history, events, geofence activity, device summaries, and fuel consumption, with on-demand and automated periodic delivery.

| | |
|---|---|
| **Feature** | `fleet-scheduled-reports` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, reports, fleet, schedule, export, trips, stops |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/fleet-scheduled-reports.blueprint.yaml) |
| **JSON API** | [fleet-scheduled-reports.json]({{ site.baseurl }}/api/blueprints/workflow/fleet-scheduled-reports.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_user` | Fleet User | human | Requests on-demand reports and configures scheduled report deliveries |
| `scheduler` | Report Scheduler | system | Triggers report generation on configured intervals; distributes results to configured recipients |
| `fleet_admin` | Fleet Administrator | human | Configures scheduled report definitions for devices and user groups |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `report_type` | select | Yes |  |  |
| `device_ids` | json | No |  |  |
| `group_ids` | json | No |  |  |
| `from` | datetime | Yes |  |  |
| `to` | datetime | Yes |  |  |
| `export_format` | select | No |  |  |
| `event_types` | json | No |  |  |
| `schedule_cron` | text | No |  |  |
| `calendar_id` | hidden | No |  |  |

## Rules

- Only devices the requesting user has permission to view are included in report output
- Users with the disableReports restriction cannot generate or access reports
- from must be earlier than to; reports with inverted ranges are rejected
- Trips and stops reports require trip and stop detection to have been active during the report period
## Rules

- **Summary reports aggregate per-device:** start/end odometer, total distance, max speed, total fuel used, and engine hours

- Route reports return all stored positions in chronological order, suitable for animated playback
- Events reports filter by event type; an empty type list returns all event types
- Export formats include all available sensor and attribute data, not just core fields
- Scheduled reports use a cron schedule stored in the database; the scheduler queries due reports at each run interval

## Outcomes

### Invalid_range (Priority: 1) — Error: `REPORT_INVALID_TIME_RANGE`

**Given:**
- `from` (input) gte `to`

**Result:** Report rejected; operator informed that the time range is invalid

### Access_denied (Priority: 2) — Error: `REPORT_ACCESS_DENIED`

**Given:**
- ANY: user does not have permission to view the requested devices OR user has the disableReports restriction

**Result:** Report request rejected; no data returned

### Scheduled_report_dispatched (Priority: 8)

**Given:**
- scheduler determines a report definition is due based on its cron expression
- associated calendar is active (or no calendar set)

**Then:**
- **emit_event** event: `report.scheduled_dispatched`

**Result:** Report generated for the configured period and delivered to configured recipients

### Report_generated (Priority: 10)

**Given:**
- fleet_user requests a report with valid type, device selection, and time range
- user has access to the specified devices
- user does not have disableReports restriction
- `from` (input) lt `to`

**Then:**
- **emit_event** event: `report.generated`

**Result:** Report file returned to the user as a downloadable attachment or streamed response

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REPORT_ACCESS_DENIED` |  | You do not have permission to generate reports for the selected devices | No |
| `REPORT_INVALID_TIME_RANGE` |  | The report start time must be before the end time | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `report.generated` | An on-demand report was generated and is ready for download | `report_type`, `device_count`, `record_count`, `export_format`, `requested_by` |
| `report.scheduled_dispatched` | A scheduled report was automatically generated and dispatched to configured recipients | `report_type`, `period_from`, `period_to`, `recipient_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-history |  |  |
| trip-detection |  |  |
| stop-detection |  |  |
| fleet-device-sharing |  |  |
| geofence-alerts |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Hibernate, Apache POI
  files_traced: 12
  entry_points:
    - src/main/java/org/traccar/reports/TripsReportProvider.java
    - src/main/java/org/traccar/reports/StopsReportProvider.java
    - src/main/java/org/traccar/reports/SummaryReportProvider.java
    - src/main/java/org/traccar/reports/EventsReportProvider.java
    - src/main/java/org/traccar/schedule/TaskReports.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Scheduled Reports Blueprint",
  "description": "Generate, schedule, and distribute fleet tracking reports covering trips, stops, route history, events, geofence activity, device summaries, and fuel consumptio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, reports, fleet, schedule, export, trips, stops"
}
</script>
