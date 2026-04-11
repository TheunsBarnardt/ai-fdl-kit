---
title: "Fleet Performance Dashboard Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Configurable dashboards with widgets showing fleet KPIs, live driver map, order metrics, and performance analytics. 8 fields. 5 outcomes. 3 error codes. rules: "
---

# Fleet Performance Dashboard Blueprint

> Configurable dashboards with widgets showing fleet KPIs, live driver map, order metrics, and performance analytics

| | |
|---|---|
| **Feature** | `fleet-performance-dashboard` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | fleet, dashboard, analytics, KPIs, metrics, monitoring, map |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/fleet-performance-dashboard.blueprint.yaml) |
| **JSON API** | [fleet-performance-dashboard.json]({{ site.baseurl }}/api/blueprints/ui/fleet-performance-dashboard.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Primary user viewing fleet performance |
| `dispatcher` | Dispatcher | human | Dispatcher monitoring live operations |
| `system` | Analytics Engine | system | Aggregates metrics and feeds dashboard data |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `dashboard_id` | text | Yes | Dashboard ID |  |
| `name` | text | Yes | Dashboard Name |  |
| `owner_uuid` | text | Yes | Owner |  |
| `widgets` | json | No | Widget Configurations |  |
| `widget_type` | select | Yes | Widget Type |  |
| `widget_config` | json | No | Widget Settings |  |
| `date_range` | select | No | Date Range |  |
| `refresh_interval` | number | No | Refresh Interval (seconds) |  |

## Rules

- **user_scoped:** Dashboard configurations are per-user and scoped to the user's organization
- **org_isolation:** All metric data is scoped to the user's organization; cross-tenant data is never shown
- **live_map_online_only:** The live driver map widget shows only online drivers with their current positions
- **auto_refresh:** Widget data is refreshed at the configured interval or on user interaction
- **kpi_date_range:** KPI counters reflect the selected date range and update automatically
- **historical_trends:** Charts support historical trend views with configurable time granularity
- **configurable_layout:** Dashboard widgets can be added, removed, and reordered by the user
- **export_available:** Report generation from dashboard data is available for export
- **realtime_websocket:** Real-time metrics use WebSocket subscriptions; historical metrics use REST API queries
- **state_persisted:** Dashboard state (widget layout, filters) is persisted per user

## Outcomes

### Dashboard_created (Priority: 1)

**Given:**
- `name` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `dashboard.created`

**Result:** New dashboard created with default widget layout

### Widget_added (Priority: 2)

**Given:**
- `widget_type` (input) exists
- `dashboard_id` (db) exists

**Then:**
- **create_record**
- **emit_event** event: `dashboard.widget_added`

**Result:** Widget added to dashboard and configured

### Live_map_loaded (Priority: 3)

**Given:**
- user opens live map widget
- drivers are online

**Then:**
- **emit_event** event: `dashboard.live_map_loaded`

**Result:** Live map displays all online drivers with real-time positions

### Metrics_refreshed (Priority: 4)

**Given:**
- refresh interval elapsed or user requests refresh

**Then:**
- **emit_event** event: `dashboard.metrics_refreshed`

**Result:** All widgets updated with latest data

### Report_exported (Priority: 5)

**Given:**
- user requests dashboard export

**Then:**
- **emit_event** event: `dashboard.report_exported`

**Result:** Dashboard data exported as CSV or PDF report

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DASHBOARD_NOT_FOUND` | 404 | Dashboard not found. | No |
| `DASHBOARD_WIDGET_INVALID` | 422 | The selected widget type is not supported. | No |
| `DASHBOARD_METRIC_UNAVAILABLE` | 422 | This metric is not available for the selected date range. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `dashboard.created` | Fired when a new dashboard is created | `dashboard_id`, `owner_uuid`, `name` |
| `dashboard.widget_added` | Fired when a widget is added to a dashboard | `dashboard_id`, `widget_type`, `widget_config` |
| `dashboard.live_map_loaded` | Fired when live driver map is rendered | `dashboard_id`, `online_driver_count` |
| `dashboard.metrics_refreshed` | Fired when dashboard metrics are refreshed | `dashboard_id`, `timestamp` |
| `dashboard.report_exported` | Fired when a dashboard report is exported | `dashboard_id`, `date_range`, `format` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| realtime-driver-tracking | required | Live map widget requires driver position data |
| order-lifecycle | required | Order KPIs are derived from order lifecycle data |
| vehicle-fleet-registry | recommended | Vehicle status metrics appear on fleet dashboard |
| driver-profile | recommended | Driver availability and performance metrics |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Performance Dashboard Blueprint",
  "description": "Configurable dashboards with widgets showing fleet KPIs, live driver map, order metrics, and performance analytics. 8 fields. 5 outcomes. 3 error codes. rules: ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, dashboard, analytics, KPIs, metrics, monitoring, map"
}
</script>
