---
title: "Dashboard Analytics Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Configurable analytics dashboard with widget grid system, KPI cards, charts, date range selection, auto-refresh, and drill-down capabilities. 7 fields. 7 outcom"
---

# Dashboard Analytics Blueprint

> Configurable analytics dashboard with widget grid system, KPI cards, charts, date range selection, auto-refresh, and drill-down capabilities

| | |
|---|---|
| **Feature** | `dashboard-analytics` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | dashboard, analytics, widgets, kpi, charts, grid-layout, data-visualization, reporting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/dashboard-analytics.blueprint.yaml) |
| **JSON API** | [dashboard-analytics.json]({{ site.baseurl }}/api/blueprints/ui/dashboard-analytics.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `dashboard_id` | text | Yes | Dashboard ID | Validations: required |
| `name` | text | Yes | Dashboard Name | Validations: required, maxLength |
| `widgets` | json | No | Widget Definitions |  |
| `date_range` | json | No | Date Range |  |
| `refresh_interval` | number | No | Auto-Refresh Interval (seconds) | Validations: min |
| `layout_columns` | number | No | Grid Column Count | Validations: min, max |
| `owner` | text | Yes | Dashboard Owner | Validations: required |

## Rules

- **widgets:**
  - **max_per_dashboard:** 20
  - **types:** metric_card, chart, table, list, progress_bar, text_block
- **grid:**
  - **columns:** 12
  - **responsive_breakpoints:**
    - **mobile:** 1
    - **tablet:** 6
    - **desktop:** 12
  - **min_widget_width_cols:** 2
  - **min_widget_height_rows:** 1
- **performance:**
  - **lazy_load_offscreen:** true
  - **cache_ttl_seconds:** 300
  - **parallel_fetch:** true
  - **stale_while_revalidate:** true
- **date_range:**
  - **presets:** today, 7d, 30d, 90d, ytd, custom
  - **max_range_days:** 365
  - **timezone_aware:** true

## Outcomes

### Dashboard_created (Priority: 1)

**Given:**
- user provides a dashboard name
- user is authenticated

**Then:**
- **create_record** target: `dashboard` — Create empty dashboard with 12-column grid layout
- **emit_event** event: `dashboard.created`

**Result:** Empty dashboard ready for widget configuration

### Widget_added (Priority: 2)

**Given:**
- dashboard has fewer than 20 widgets
- widget type is in the supported library
- widget data source is configured

**Then:**
- **set_field** target: `widgets` — Add widget to the dashboard at the specified grid position
- **call_service** target: `widget_data_fetcher` — Fetch initial data for the new widget
- **emit_event** event: `dashboard.widget_added`

**Result:** Widget renders at the specified position with live data

### Widget_limit_reached (Priority: 3) — Error: `DASHBOARD_MAX_WIDGETS`

**Given:**
- `widget_count` (computed) gte `20`

**Result:** User informed that the maximum widget limit has been reached

### Date_range_changed (Priority: 4) — Error: `DASHBOARD_DATE_RANGE_INVALID`

**Given:**
- user selects a new date range preset or custom range
- date range is within the maximum 365-day limit

**Then:**
- **set_field** target: `date_range` — Update the dashboard date range
- **call_service** target: `widget_data_fetcher` — Refresh all widget data with the new date range
- **emit_event** event: `dashboard.date_range_changed`

**Result:** All widgets refresh to display data for the new date range

### Auto_refreshed (Priority: 5)

**Given:**
- refresh interval has elapsed
- dashboard tab is visible (not background)

**Then:**
- **call_service** target: `widget_data_fetcher` — Fetch fresh data for all visible widgets
- **emit_event** event: `dashboard.refreshed`

**Result:** All visible widgets show updated data without page reload

### Widget_drill_down (Priority: 6)

**Given:**
- user clicks a data point or KPI value in a widget
- widget has drill-down configured

**Then:**
- **emit_event** event: `dashboard.drill_down`

**Result:** Detailed view opens showing the underlying data for the selected metric

### Data_source_error (Priority: 7) — Error: `DASHBOARD_DATA_SOURCE_ERROR`

**Given:**
- widget data source returns an error or times out

**Then:**
- **emit_event** event: `dashboard.widget_error`

**Result:** Widget displays error state with retry option, other widgets unaffected

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DASHBOARD_MAX_WIDGETS` | 400 | Maximum of 20 widgets per dashboard has been reached | No |
| `DASHBOARD_DATA_SOURCE_ERROR` | 503 | Failed to load widget data. Please try again. | Yes |
| `DASHBOARD_NOT_FOUND` | 404 | The requested dashboard does not exist | No |
| `DASHBOARD_DATE_RANGE_INVALID` | 400 | Date range must not exceed 365 days | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `dashboard.created` | A new dashboard was created | `dashboard_id`, `name`, `owner`, `timestamp` |
| `dashboard.widget_added` | A widget was added to a dashboard | `dashboard_id`, `widget_id`, `widget_type`, `position` |
| `dashboard.refreshed` | Dashboard data was auto-refreshed | `dashboard_id`, `timestamp`, `widget_count` |
| `dashboard.date_range_changed` | Dashboard date range was changed | `dashboard_id`, `date_range` |
| `dashboard.drill_down` | User drilled down into a widget data point | `dashboard_id`, `widget_id`, `dimension`, `value` |
| `dashboard.widget_error` | A widget failed to load data | `dashboard_id`, `widget_id`, `error` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| charts-visualization | required | Dashboard chart widgets use the charts-visualization feature for rendering |
| data-table | recommended | Dashboard table widgets use the data-table feature for tabular data display |
| accessibility | recommended | Dashboard widgets must be keyboard navigable and screen reader compatible |
| dark-mode | optional | Dashboard should support light and dark themes |

## AGI Readiness

### Goals

#### Reliable Dashboard Analytics

Configurable analytics dashboard with widget grid system, KPI cards, charts, date range selection, auto-refresh, and drill-down capabilities

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `charts_visualization` | charts-visualization | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| dashboard_created | `supervised` | - | - |
| widget_added | `autonomous` | - | - |
| widget_limit_reached | `autonomous` | - | - |
| date_range_changed | `supervised` | - | - |
| auto_refreshed | `autonomous` | - | - |
| widget_drill_down | `autonomous` | - | - |
| data_source_error | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dashboard Analytics Blueprint",
  "description": "Configurable analytics dashboard with widget grid system, KPI cards, charts, date range selection, auto-refresh, and drill-down capabilities. 7 fields. 7 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "dashboard, analytics, widgets, kpi, charts, grid-layout, data-visualization, reporting"
}
</script>
