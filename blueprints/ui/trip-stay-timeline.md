<!-- AUTO-GENERATED FROM trip-stay-timeline.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Trip Stay Timeline

> Chronological feed of day-grouped journeys and place stays with single-expand accordion, companion map synchronisation, and hover highlighting.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** timeline · trips · visits · map · travel

## What this does

Chronological feed of day-grouped journeys and place stays with single-expand accordion, companion map synchronisation, and hover highlighting.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **timeline_date** *(date, required)*
- **entry_type** *(select, required)*
- **started_at** *(datetime, required)*
- **ended_at** *(datetime, required)*
- **duration_seconds** *(number, optional)*
- **track_id** *(hidden, optional)*
- **visit_id** *(hidden, optional)*
- **place_name** *(text, optional)*
- **transportation_mode** *(select, optional)*
- **distance_km** *(number, optional)*
- **average_speed_kmh** *(number, optional)*
- **bounding_box** *(json, optional)*
- **visit_latitude** *(number, optional)*
- **visit_longitude** *(number, optional)*
- **segments** *(json, optional)*
- **trip_name** *(text, optional)*
- **trip_started_at** *(datetime, optional)*
- **trip_ended_at** *(datetime, optional)*

## What must be true

- **grouping:** The timeline is grouped by calendar date in the user's local timezone, descending (most recent day first)., Each day section contains entries sorted chronologically ascending by started_at., Journey and stay entries are interleaved in true chronological order within a day., Days with no entries (no tracks and no confirmed or suggested visits) are not shown.
- **accordion:** Only one day section may be expanded at a time; opening a day automatically closes any previously open day.
- **map_sync:** When a day is expanded, the companion map pans and zooms to the bounding box of all GPS points recorded on that day., When all day sections are collapsed, the companion map returns to a default full-history view., Hovering a stay entry highlights the corresponding visit marker on the companion map., Hovering a journey entry highlights its route line on the companion map.
- **lazy_loading:** Journey detail data (segment breakdown, speed profile) is loaded at most once per entry per page session; subsequent toggles reuse the cached result.
- **trip_calculation:** A trip's distance, route path, and visited country list are computed asynchronously after the trip's date range is saved., If a trip's date range changes, all calculations are re-run., Visited countries are derived from the distinct country labels of all GPS points within the trip's date range.

## Success & failure scenarios

**✅ Success paths**

- **Timeline Loaded** — when user navigates to the timeline feed, then Timeline renders with collapsed day groups. Most recent days appear at the top.
- **Day Expanded** — when user clicks a collapsed day heading, then Day section opens showing journeys and stays interleaved chronologically. Map viewport updates.
- **Different Day Opened** — when accordion_state eq "day_expanded"; user clicks a different day heading, then New day opens; previous day collapses. Map updates to new day's bounds.
- **Day Collapsed** — when user clicks the currently open day heading to close it, then All day sections collapse. Map returns to full-history view.
- **Journey Detail Opened** — when accordion_state eq "day_expanded"; user toggles the detail panel for a journey entry; detail data has not been loaded yet for this entry, then Detail panel expands showing mode breakdown. Companion map highlights the route with a flowing animation.
- **Journey Detail Closed** — when accordion_state eq "entry_detail_open"; user toggles closed the journey detail panel, then Detail panel collapses. Map route highlight is cleared.
- **Entry Hovered** — when user hovers the cursor over any timeline entry, then Corresponding route segment or visit marker is highlighted on the companion map.
- **Entry Unhovered** — when user moves cursor away from a timeline entry, then Map highlight is cleared.
- **Trip Saved** — when user creates or updates a named trip with a valid start date and end date, then Trip record is enriched with distance, route path, and country list.

**❌ Failure paths**

- **Trip Date Invalid** — when trip_ended_at lte "trip_started_at", then Trip cannot be saved. An inline validation error is shown next to the end date field. *(error: `TRIP_DATE_INVALID`)*

## Errors it can return

- `TRIP_DATE_INVALID` — Trip end date must be after the start date.
- `TIMELINE_LOAD_FAILED` — Could not load timeline data. Please refresh the page.

## Events

**`timeline.day.expanded`** — A day section was opened by the user.
  Payload: `timeline_date`, `bounding_box`

**`timeline.day.collapsed`** — All day sections are now collapsed.
  Payload: `timeline_date`

**`timeline.journey.selected`** — User opened a journey's detail panel.
  Payload: `track_id`, `started_at`, `ended_at`

**`timeline.journey.deselected`** — User closed a journey's detail panel.
  Payload: `track_id`

**`timeline.entry.hovered`** — User hovered over a timeline entry.
  Payload: `entry_type`, `started_at`, `ended_at`, `track_id`, `visit_id`, `visit_latitude`, `visit_longitude`

**`timeline.entry.unhovered`** — Cursor left a timeline entry.

**`trip.calculated`** — A named trip's path, distance, and countries were computed.
  Payload: `trip_id`, `distance_km`, `visited_countries`

## Connects to

- **visited-places-detection** *(required)* — Provides the stay/visit entries that appear in the timeline feed.
- **gps-position-history** *(required)* — Provides track records (journeys) rendered as timeline entries.
- **location-history-map-visualization** *(recommended)* — Companion map that syncs its viewport and highlights to timeline selections.

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `████░░░░░░` | 4/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `███░░` | 3/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/trip-stay-timeline/) · **Spec source:** [`trip-stay-timeline.blueprint.yaml`](./trip-stay-timeline.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
