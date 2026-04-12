---
title: "Location History Map Visualization Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Interactive map rendering GPS history as points, connected routes (optionally speed-coloured), and a density heatmap with layer toggles and point-position corre"
---

# Location History Map Visualization Blueprint

> Interactive map rendering GPS history as points, connected routes (optionally speed-coloured), and a density heatmap with layer toggles and point-position correction.

| | |
|---|---|
| **Feature** | `location-history-map-visualization` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | map, location, gps, heatmap, routes, visualization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/location-history-map-visualization.blueprint.yaml) |
| **JSON API** | [location-history-map-visualization.json]({{ site.baseurl }}/api/blueprints/ui/location-history-map-visualization.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Browses location history on the interactive map. |
| `system` | Map System | system | Fetches GPS data from the API and renders all map layers. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `point_id` | hidden | No |  |  |
| `latitude` | number | Yes |  | Validations: min, max |
| `longitude` | number | Yes |  | Validations: min, max |
| `recorded_at` | datetime | Yes |  |  |
| `velocity` | number | No |  |  |
| `altitude` | number | No |  |  |
| `battery_level` | number | No |  |  |
| `accuracy_meters` | number | No |  |  |
| `is_anomaly` | boolean | No |  |  |
| `date_range_start` | datetime | Yes |  |  |
| `date_range_end` | datetime | Yes |  |  |
| `active_layers` | multiselect | No |  |  |
| `speed_colouring_enabled` | boolean | No |  |  |
| `speed_colour_scale` | json | No |  |  |

## States

**State field:** `map_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `loading` |  |  |
| `rendered` |  |  |
| `dragging_point` |  |  |
| `error` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `loading` | user |  |
|  | `loading` | `rendered` | system |  |
|  | `loading` | `error` | system |  |
|  | `rendered` | `loading` | user |  |
|  | `rendered` | `dragging_point` | user |  |
|  | `dragging_point` | `rendered` | user |  |

## Rules

- **data_quality:** Anomaly points are excluded from route and heatmap layers by default; they may be toggled separately., Points with accuracy worse than 100 m are automatically flagged as anomalies., A maximum speed of 1 000 km/h is used as an anomaly detection floor during speed-based filtering.
- **routing:** Route lines connect consecutive GPS points in chronological order., A gap larger than a configurable threshold (default 5 hours) between two consecutive points breaks the route into separate segments., Below zoom level 8, simplified merged route lines are shown instead of per-segment speed-coloured lines so routes remain visible at low zoom.
- **speed_colouring:** Speed colouring interpolates linearly between configurable colour stops (e.g. stationary → walking → cycling → driving). Speeds above the highest stop are clamped.
- **point_editing:** When a GPS point is dragged to a new position, adjacent route segments update in-place without a full layer reload., If the drag ends with no movement (click, not drag), no API call is made and the point is not updated.
- **heatmap:** Heatmap intensity and radius scale exponentially with zoom level so clusters remain meaningful at all zoom levels.
- **persistence:** Layer visibility choices persist across page navigation within the same session.

## Outcomes

### Map_loaded (Priority: 1)

**Given:**
- user navigates to the map view
- a valid date range is set

**Then:**
- **set_field** target: `map_state` value: `loading`
- Fetch GPS points for the date range from the location data API

**Result:** A loading indicator appears on the map while data is fetched.

### Layers_rendered (Priority: 2)

**Given:**
- `map_state` (session) eq `loading`
- API returns a non-empty point collection

**Then:**
- **set_field** target: `map_state` value: `rendered`
- **emit_event** event: `map.layers.rendered`

**Result:** GPS points appear as circles, routes connect them chronologically, and heatmap shows density. Viewport fits all loaded points.

### No_data_for_range (Priority: 3)

**Given:**
- API returns an empty point collection for the selected date range

**Then:**
- **set_field** target: `map_state` value: `rendered`

**Result:** An empty-state message is shown; no layer data is displayed.

### Speed_coloured_routes (Priority: 4)

**Given:**
- `speed_colouring_enabled` (session) eq `true`
- current map zoom is above the low-zoom threshold

**Then:**
- Split route LineStrings into per-segment sub-features, each carrying a colour derived from speed between its endpoints

**Result:** Route lines render with continuous colour variation from slow (green) through medium to fast (red).

### Point_position_corrected (Priority: 5)

**Given:**
- `map_state` (session) eq `dragging_point`
- user releases the drag with the point in a new position

**Then:**
- PATCH the point's latitude and longitude via the location API
- **set_field** target: `map_state` value: `rendered`
- **emit_event** event: `point.position.updated`

**Result:** Point appears at its new position; route segments passing through the old position update to new coordinates.

### Point_drag_failed (Priority: 6) — Error: `POINT_UPDATE_FAILED`

**Given:**
- point position update request fails

**Then:**
- **set_field** target: `map_state` value: `rendered`
- Revert the point on the map to its original coordinates

**Result:** Point snaps back to its original position. An error notification is shown.

### Layer_toggled (Priority: 7)

**Given:**
- user toggles one of the available overlay layers

**Then:**
- **set_field** target: `active_layers` value: `updated_layer_selection`
- **emit_event** event: `map.layer.toggled`

**Result:** The selected layer appears or disappears on the map immediately.

### Data_load_failed (Priority: 8) — Error: `MAP_DATA_LOAD_FAILED`

**Given:**
- API request for points returns an error or times out

**Then:**
- **set_field** target: `map_state` value: `error`

**Result:** An error message is shown. Previously rendered layers are cleared.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POINT_UPDATE_FAILED` | 500 | Could not save the updated position. Please try again. | Yes |
| `MAP_DATA_LOAD_FAILED` | 503 | Could not load location data for this period. Please refresh and try again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `map.layers.rendered` | All active layers successfully drawn on the map. | `point_count`, `active_layers`, `date_range_start`, `date_range_end` |
| `map.layer.toggled` | User showed or hid an overlay layer. | `layer_name`, `visible` |
| `point.position.updated` | A GPS point's coordinates were successfully corrected. | `point_id`, `latitude`, `longitude` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| location-history-storage | required | Provides the persisted GPS points that this feature visualises. |
| gps-position-history | required | API that serves time-range point queries consumed by the map. |
| visited-places-detection | recommended | Visit clusters can be rendered as an overlay on the same map. |
| trip-stay-timeline | recommended | Timeline selection drives the map date range and highlighted segments. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/Freika/dawarich
  project: Dawarich — self-hostable location history tracker
  tech_stack: Ruby on Rails 8 + MapLibre GL JS + Stimulus + Turbo
  files_traced: 18
  entry_points:
    - app/javascript/maps_maplibre/layers/points_layer.js
    - app/javascript/maps_maplibre/layers/routes_layer.js
    - app/javascript/maps_maplibre/layers/heatmap_layer.js
    - app/javascript/maps_maplibre/layers/tracks_layer.js
    - app/javascript/maps_maplibre/layers/visits_layer.js
    - app/javascript/maps/polylines.js
    - app/services/points/anomaly_filter.rb
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Location History Map Visualization Blueprint",
  "description": "Interactive map rendering GPS history as points, connected routes (optionally speed-coloured), and a density heatmap with layer toggles and point-position corre",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "map, location, gps, heatmap, routes, visualization"
}
</script>
