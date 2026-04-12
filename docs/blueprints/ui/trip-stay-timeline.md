---
title: "Trip Stay Timeline Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Chronological feed of day-grouped journeys and place stays with single-expand accordion, companion map synchronisation, and hover highlighting.. 18 fields. 10 o"
---

# Trip Stay Timeline Blueprint

> Chronological feed of day-grouped journeys and place stays with single-expand accordion, companion map synchronisation, and hover highlighting.

| | |
|---|---|
| **Feature** | `trip-stay-timeline` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | timeline, trips, visits, map, travel |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/trip-stay-timeline.blueprint.yaml) |
| **JSON API** | [trip-stay-timeline.json]({{ site.baseurl }}/api/blueprints/ui/trip-stay-timeline.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Browses, expands, and interacts with timeline entries. |
| `system` | Timeline System | system | Builds the timeline feed from track and visit records. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `timeline_date` | date | Yes |  |  |
| `entry_type` | select | Yes |  |  |
| `started_at` | datetime | Yes |  |  |
| `ended_at` | datetime | Yes |  | Validations: custom |
| `duration_seconds` | number | No |  |  |
| `track_id` | hidden | No |  |  |
| `visit_id` | hidden | No |  |  |
| `place_name` | text | No |  |  |
| `transportation_mode` | select | No |  |  |
| `distance_km` | number | No |  |  |
| `average_speed_kmh` | number | No |  |  |
| `bounding_box` | json | No |  |  |
| `visit_latitude` | number | No |  |  |
| `visit_longitude` | number | No |  |  |
| `segments` | json | No |  |  |
| `trip_name` | text | No |  | Validations: maxLength |
| `trip_started_at` | datetime | No |  |  |
| `trip_ended_at` | datetime | No |  | Validations: custom |

## States

**State field:** `accordion_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `all_collapsed` | Yes |  |
| `day_expanded` |  |  |
| `entry_detail_open` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `all_collapsed` | `day_expanded` | user |  |
|  | `day_expanded` | `all_collapsed` | user |  |
|  | `day_expanded` | `day_expanded` | user |  |
|  | `day_expanded` | `entry_detail_open` | user |  |
|  | `entry_detail_open` | `day_expanded` | user |  |

## Rules

- **grouping:** The timeline is grouped by calendar date in the user's local timezone, descending (most recent day first)., Each day section contains entries sorted chronologically ascending by started_at., Journey and stay entries are interleaved in true chronological order within a day., Days with no entries (no tracks and no confirmed or suggested visits) are not shown.
- **accordion:** Only one day section may be expanded at a time; opening a day automatically closes any previously open day.
- **map_sync:** When a day is expanded, the companion map pans and zooms to the bounding box of all GPS points recorded on that day., When all day sections are collapsed, the companion map returns to a default full-history view., Hovering a stay entry highlights the corresponding visit marker on the companion map., Hovering a journey entry highlights its route line on the companion map.
- **lazy_loading:** Journey detail data (segment breakdown, speed profile) is loaded at most once per entry per page session; subsequent toggles reuse the cached result.
- **trip_calculation:** A trip's distance, route path, and visited country list are computed asynchronously after the trip's date range is saved., If a trip's date range changes, all calculations are re-run., Visited countries are derived from the distinct country labels of all GPS points within the trip's date range.

## Outcomes

### Timeline_loaded (Priority: 1)

**Given:**
- user navigates to the timeline feed

**Then:**
- Query track and confirmed/suggested visit records ordered by date descending for the current user
- **set_field** target: `accordion_state` value: `all_collapsed`

**Result:** Timeline renders with collapsed day groups. Most recent days appear at the top.

### Day_expanded (Priority: 2)

**Given:**
- user clicks a collapsed day heading

**Then:**
- **transition_state** field: `accordion_state` from: `all_collapsed` to: `day_expanded`
- Pan and zoom the companion map to the day's geographic bounding box
- **emit_event** event: `timeline.day.expanded`

**Result:** Day section opens showing journeys and stays interleaved chronologically. Map viewport updates.

### Different_day_opened (Priority: 3)

**Given:**
- `accordion_state` (session) eq `day_expanded`
- user clicks a different day heading

**Then:**
- Collapse the previously open day section
- **transition_state** field: `accordion_state` from: `day_expanded` to: `day_expanded`
- **emit_event** event: `timeline.day.expanded`

**Result:** New day opens; previous day collapses. Map updates to new day's bounds.

### Day_collapsed (Priority: 4)

**Given:**
- user clicks the currently open day heading to close it

**Then:**
- **transition_state** field: `accordion_state` from: `day_expanded` to: `all_collapsed`
- **emit_event** event: `timeline.day.collapsed`

**Result:** All day sections collapse. Map returns to full-history view.

### Journey_detail_opened (Priority: 5)

**Given:**
- `accordion_state` (session) eq `day_expanded`
- user toggles the detail panel for a journey entry
- detail data has not been loaded yet for this entry

**Then:**
- Lazy-load segment breakdown (transportation mode, colour, distance) for the journey
- **transition_state** field: `accordion_state` from: `day_expanded` to: `entry_detail_open`
- **emit_event** event: `timeline.journey.selected`

**Result:** Detail panel expands showing mode breakdown. Companion map highlights the route with a flowing animation.

### Journey_detail_closed (Priority: 6)

**Given:**
- `accordion_state` (session) eq `entry_detail_open`
- user toggles closed the journey detail panel

**Then:**
- **transition_state** field: `accordion_state` from: `entry_detail_open` to: `day_expanded`
- **emit_event** event: `timeline.journey.deselected`

**Result:** Detail panel collapses. Map route highlight is cleared.

### Entry_hovered (Priority: 7)

**Given:**
- user hovers the cursor over any timeline entry

**Then:**
- **emit_event** event: `timeline.entry.hovered`

**Result:** Corresponding route segment or visit marker is highlighted on the companion map.

### Entry_unhovered (Priority: 8)

**Given:**
- user moves cursor away from a timeline entry

**Then:**
- **emit_event** event: `timeline.entry.unhovered`

**Result:** Map highlight is cleared.

### Trip_saved (Priority: 9)

**Given:**
- user creates or updates a named trip with a valid start date and end date

**Then:**
- Asynchronously calculate the trip's GPS path, total distance, average speed, and visited countries
- **emit_event** event: `trip.calculated`

**Result:** Trip record is enriched with distance, route path, and country list.

### Trip_date_invalid (Priority: 10) — Error: `TRIP_DATE_INVALID`

**Given:**
- `trip_ended_at` (input) lte `trip_started_at`

**Result:** Trip cannot be saved. An inline validation error is shown next to the end date field.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRIP_DATE_INVALID` | 422 | Trip end date must be after the start date. | No |
| `TIMELINE_LOAD_FAILED` | 503 | Could not load timeline data. Please refresh the page. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `timeline.day.expanded` | A day section was opened by the user. | `timeline_date`, `bounding_box` |
| `timeline.day.collapsed` | All day sections are now collapsed. | `timeline_date` |
| `timeline.journey.selected` | User opened a journey's detail panel. | `track_id`, `started_at`, `ended_at` |
| `timeline.journey.deselected` | User closed a journey's detail panel. | `track_id` |
| `timeline.entry.hovered` | User hovered over a timeline entry. | `entry_type`, `started_at`, `ended_at`, `track_id`, `visit_id`, `visit_latitude`, `visit_longitude` |
| `timeline.entry.unhovered` | Cursor left a timeline entry. |  |
| `trip.calculated` | A named trip's path, distance, and countries were computed. | `trip_id`, `distance_km`, `visited_countries` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| visited-places-detection | required | Provides the stay/visit entries that appear in the timeline feed. |
| gps-position-history | required | Provides track records (journeys) rendered as timeline entries. |
| location-history-map-visualization | recommended | Companion map that syncs its viewport and highlights to timeline selections. |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/Freika/dawarich
  project: Dawarich — self-hostable location history tracker
  tech_stack: Ruby on Rails 8 + Stimulus + Turbo Frames + MapLibre GL JS
  files_traced: 10
  entry_points:
    - app/javascript/controllers/timeline_feed_controller.js
    - app/javascript/controllers/trips_controller.js
    - app/javascript/controllers/visits_map_controller.js
    - app/models/trip.rb
    - app/models/track.rb
    - app/jobs/trips/calculate_all_job.rb
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trip Stay Timeline Blueprint",
  "description": "Chronological feed of day-grouped journeys and place stays with single-expand accordion, companion map synchronisation, and hover highlighting.. 18 fields. 10 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "timeline, trips, visits, map, travel"
}
</script>
