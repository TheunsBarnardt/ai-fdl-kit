<!-- AUTO-GENERATED FROM location-history-map-visualization.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Location History Map Visualization

> Interactive map rendering GPS history as points, connected routes (optionally speed-coloured), and a density heatmap with layer toggles and point-position correction.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** map · location · gps · heatmap · routes · visualization

## What this does

Interactive map rendering GPS history as points, connected routes (optionally speed-coloured), and a density heatmap with layer toggles and point-position correction.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **point_id** *(hidden, optional)*
- **latitude** *(number, required)*
- **longitude** *(number, required)*
- **recorded_at** *(datetime, required)*
- **velocity** *(number, optional)*
- **altitude** *(number, optional)*
- **battery_level** *(number, optional)*
- **accuracy_meters** *(number, optional)*
- **is_anomaly** *(boolean, optional)*
- **date_range_start** *(datetime, required)*
- **date_range_end** *(datetime, required)*
- **active_layers** *(multiselect, optional)*
- **speed_colouring_enabled** *(boolean, optional)*
- **speed_colour_scale** *(json, optional)*

## What must be true

- **data_quality:** Anomaly points are excluded from route and heatmap layers by default; they may be toggled separately., Points with accuracy worse than 100 m are automatically flagged as anomalies., A maximum speed of 1 000 km/h is used as an anomaly detection floor during speed-based filtering.
- **routing:** Route lines connect consecutive GPS points in chronological order., A gap larger than a configurable threshold (default 5 hours) between two consecutive points breaks the route into separate segments., Below zoom level 8, simplified merged route lines are shown instead of per-segment speed-coloured lines so routes remain visible at low zoom.
- **speed_colouring:** Speed colouring interpolates linearly between configurable colour stops (e.g. stationary → walking → cycling → driving). Speeds above the highest stop are clamped.
- **point_editing:** When a GPS point is dragged to a new position, adjacent route segments update in-place without a full layer reload., If the drag ends with no movement (click, not drag), no API call is made and the point is not updated.
- **heatmap:** Heatmap intensity and radius scale exponentially with zoom level so clusters remain meaningful at all zoom levels.
- **persistence:** Layer visibility choices persist across page navigation within the same session.

## Success & failure scenarios

**✅ Success paths**

- **Map Loaded** — when user navigates to the map view; a valid date range is set, then A loading indicator appears on the map while data is fetched.
- **Layers Rendered** — when map_state eq "loading"; API returns a non-empty point collection, then GPS points appear as circles, routes connect them chronologically, and heatmap shows density. Viewport fits all loaded points.
- **No Data For Range** — when API returns an empty point collection for the selected date range, then An empty-state message is shown; no layer data is displayed.
- **Speed Coloured Routes** — when speed_colouring_enabled eq true; current map zoom is above the low-zoom threshold, then Route lines render with continuous colour variation from slow (green) through medium to fast (red).
- **Point Position Corrected** — when map_state eq "dragging_point"; user releases the drag with the point in a new position, then Point appears at its new position; route segments passing through the old position update to new coordinates.
- **Layer Toggled** — when user toggles one of the available overlay layers, then The selected layer appears or disappears on the map immediately.

**❌ Failure paths**

- **Point Drag Failed** — when point position update request fails, then Point snaps back to its original position. An error notification is shown. *(error: `POINT_UPDATE_FAILED`)*
- **Data Load Failed** — when API request for points returns an error or times out, then An error message is shown. Previously rendered layers are cleared. *(error: `MAP_DATA_LOAD_FAILED`)*

## Errors it can return

- `POINT_UPDATE_FAILED` — Could not save the updated position. Please try again.
- `MAP_DATA_LOAD_FAILED` — Could not load location data for this period. Please refresh and try again.

## Connects to

- **location-history-storage** *(required)* — Provides the persisted GPS points that this feature visualises.
- **gps-position-history** *(required)* — API that serves time-range point queries consumed by the map.
- **visited-places-detection** *(recommended)* — Visit clusters can be rendered as an overlay on the same map.
- **trip-stay-timeline** *(recommended)* — Timeline selection drives the map date range and highlighted segments.

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `████░░░░░░` | 4/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `███░░` | 3/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/location-history-map-visualization/) · **Spec source:** [`location-history-map-visualization.blueprint.yaml`](./location-history-map-visualization.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
