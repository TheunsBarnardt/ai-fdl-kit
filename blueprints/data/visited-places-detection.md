<!-- AUTO-GENERATED FROM visited-places-detection.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Visited Places Detection

> Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation or dismissal.

**Category:** Data · **Version:** 1.0.0 · **Tags:** location · gps · clustering · places · visits · stay-detection

## What this does

Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation or dismissal.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **visit_id** *(hidden, optional)*
- **started_at** *(datetime, required)*
- **ended_at** *(datetime, required)*
- **duration_minutes** *(number, optional)*
- **center_latitude** *(number, required)*
- **center_longitude** *(number, required)*
- **radius_meters** *(number, optional)*
- **status** *(select, required)*
- **name** *(text, required)*
- **place_id** *(hidden, optional)*
- **area_id** *(hidden, optional)*
- **point_ids** *(json, optional)*
- **time_threshold_minutes** *(number, optional)*
- **merge_threshold_minutes** *(number, optional)*
- **minimum_visit_duration_seconds** *(number, optional)*
- **minimum_points_required** *(number, optional)*
- **detection_radius_meters** *(number, optional)*

## What must be true

- **eligibility:** Only GPS points that are not already assigned to a visit and are not flagged as anomalies are considered for detection.
- **clustering:** A new visit cluster begins whenever the gap between two consecutive chronologically sorted GPS points exceeds time_threshold_minutes., A visit cluster is discarded if it contains fewer than minimum_points_required points or its duration is below minimum_visit_duration_seconds., The cluster's effective radius grows logarithmically with visit duration, capped at 500 m, so brief stops have a tight radius and long stays a wider one.
- **merging:** Two consecutive visits are merged if the gap between them is within merge_threshold_minutes AND their centres are within 50 m AND no significant movement (> 50 m) is detected in the gap points., After merging, the visit centre is recomputed as the arithmetic mean of all constituent point coordinates.
- **place_scans:** When a known place is referenced, only points within detection_radius_meters of the place are considered, scoped per calendar month for efficiency.
- **naming:** Visit name defaults to: place name (if linked), otherwise area name, otherwise reverse-geocoded address.
- **lifecycle:** All newly created visits are given status = suggested; the user must confirm or decline each one., Confirmed visits remain linked to their GPS points so re-detection over the same window does not create duplicates (idempotent via place+user+started_at key).

## Success & failure scenarios

**✅ Success paths**

- **Smart Detection Triggered** — when detection is requested for a user and a time range; the time range contains at least minimum_points_required unvisited, non-anomaly points, then New visit records with status=suggested appear in the user's visit feed.
- **No Qualifying Points** — when the requested time range contains no unvisited, non-anomaly points, then No visit records are created; no error is raised.
- **Place Visit Scan Triggered** — when a known place exists with at least one GPS point within detection_radius_meters, then Visits associated with the specific place are created or updated.
- **Visit Confirmed** — when status eq "suggested"; user confirms the visit, then Visit is marked confirmed and appears with a distinct visual indicator.
- **Visit Declined** — when status eq "suggested"; user dismisses the visit, then Visit is hidden from the default feed and marked declined.
- **Duplicate Prevented** — when detection runs over a range that already has a confirmed visit for the same place and start time, then No duplicate visit record is created; the existing record is updated if needed.

**❌ Failure paths**

- **Detection Failed** — when an unhandled error occurs during point clustering or visit creation, then Detection stops; partial results may be persisted. The user is notified. *(error: `VISIT_DETECTION_FAILED`)*

## Errors it can return

- `VISIT_DETECTION_FAILED` — Visit detection could not be completed. Please try again later.
- `PLACE_NOT_FOUND` — The specified place could not be found.

## Connects to

- **location-history-storage** *(required)* — Provides the raw GPS points that are clustered into visits.
- **gps-position-history** *(required)* — Supplies the ordered, time-ranged point sequence used for detection.
- **location-history-map-visualization** *(recommended)* — Confirmed and suggested visits can be overlaid on the location map.
- **trip-stay-timeline** *(recommended)* — Confirmed visits appear as stay entries in the timeline feed.
- **geofence-places** *(optional)* — Named geofences provide semantic labels and radius constraints for visits.

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `████░░░░░░` | 4/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `███░░` | 3/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/visited-places-detection/) · **Spec source:** [`visited-places-detection.blueprint.yaml`](./visited-places-detection.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
