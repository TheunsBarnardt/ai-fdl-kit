---
title: "Charts Visualization Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Chart rendering system with bar, line, pie, donut, area, scatter, time-series, and heatmap types, responsive sizing, tooltips, legends, and real-time updates. 1"
---

# Charts Visualization Blueprint

> Chart rendering system with bar, line, pie, donut, area, scatter, time-series, and heatmap types, responsive sizing, tooltips, legends, and real-time updates

| | |
|---|---|
| **Feature** | `charts-visualization` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | charts, visualization, graphs, data-viz, responsive, real-time, analytics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/charts-visualization.blueprint.yaml) |
| **JSON API** | [charts-visualization.json]({{ site.baseurl }}/api/blueprints/ui/charts-visualization.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `chart_type` | select | Yes | Chart Type | Validations: required |
| `data_series` | json | Yes | Data Series | Validations: required |
| `x_axis` | json | No | X-Axis Configuration |  |
| `y_axis` | json | No | Y-Axis Configuration |  |
| `title` | text | No | Chart Title | Validations: maxLength |
| `subtitle` | text | No | Chart Subtitle |  |
| `legend_position` | select | No | Legend Position |  |
| `color_palette` | json | No | Color Palette |  |
| `animate` | boolean | No | Enable Animation |  |
| `tooltip_enabled` | boolean | No | Show Tooltips |  |

## Rules

- **data_series:**
  - **max_series:** 10
  - **empty_state_required:** true
- **rendering:**
  - **responsive:** true
  - **min_height_px:** 200
  - **resize_debounce_ms:** 100
- **accessibility:**
  - **colorblind_safe_palettes:** true
  - **pattern_fills_available:** true
  - **aria_labels:** true
  - **keyboard_navigable:** true
- **axes:**
  - **auto_scale:** true
  - **grid_lines:** true
  - **tick_rotation_threshold:** 10
- **animation:**
  - **initial_duration_ms:** 500
  - **update_duration_ms:** 300
  - **respect_reduced_motion:** true
- **real_time:**
  - **max_points_before_shift:** 100
  - **update_throttle_ms:** 200

## Outcomes

### Chart_rendered (Priority: 1)

**Given:**
- chart type is specified
- at least one data series is provided
- data series has at least one data point

**Then:**
- **emit_event** event: `chart.rendered`

**Result:** Chart renders with data, axes, legend, and tooltips according to configuration

### Chart_empty_state (Priority: 2)

**Given:**
- chart type is specified
- data series is empty or all values are null

**Then:**
- **emit_event** event: `chart.empty`

**Result:** Chart container displays an empty state message instead of blank space

### Data_updated (Priority: 3)

**Given:**
- chart is already rendered
- new data is provided for one or more series

**Then:**
- **set_field** target: `data_series` — Update data series with new values
- **emit_event** event: `chart.data_updated`

**Result:** Chart animates to reflect new data without full re-render

### Data_point_clicked (Priority: 4)

**Given:**
- user clicks or taps a data point, bar, or slice

**Then:**
- **emit_event** event: `chart.clicked`

**Result:** Click event emitted with the data point details for drill-down or linking

### Series_toggled (Priority: 5)

**Given:**
- user clicks a legend item
- chart has more than one data series

**Then:**
- **set_field** target: `data_series` — Toggle visibility of the clicked series
- **emit_event** event: `chart.series_toggled`

**Result:** Series hidden or shown with animation, axes rescale if needed

### Max_series_exceeded (Priority: 6) — Error: `CHART_MAX_SERIES_EXCEEDED`

**Given:**
- `series_count` (computed) gt `10`

**Result:** Only the first 10 series are rendered, user warned about the limit

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHART_MAX_SERIES_EXCEEDED` | 400 | Maximum of 10 data series per chart. Additional series will not be displayed. | No |
| `CHART_INVALID_DATA` | 422 | Data format is incompatible with the selected chart type | Yes |
| `CHART_RENDER_FAILED` | 500 | Chart failed to render. Please check the data and configuration. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `chart.rendered` | A chart was successfully rendered | `chart_type`, `series_count`, `data_point_count` |
| `chart.data_updated` | Chart data was updated (manually or via real-time stream) | `chart_type`, `series_count`, `is_real_time` |
| `chart.clicked` | A data point, bar, or slice was clicked | `chart_type`, `series_name`, `data_point`, `value` |
| `chart.empty` | Chart rendered with no data | `chart_type` |
| `chart.series_toggled` | A data series was shown or hidden via legend | `series_name`, `visible` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dashboard-analytics | recommended | Charts are commonly used as dashboard widgets |
| dark-mode | optional | Chart colors and grid lines should adapt to light and dark themes |
| accessibility | recommended | Charts need colorblind-safe palettes, ARIA labels, and keyboard navigation |
| internationalization | optional | Axis labels, tooltips, and number formatting depend on locale |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Charts Visualization Blueprint",
  "description": "Chart rendering system with bar, line, pie, donut, area, scatter, time-series, and heatmap types, responsive sizing, tooltips, legends, and real-time updates. 1",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "charts, visualization, graphs, data-viz, responsive, real-time, analytics"
}
</script>
