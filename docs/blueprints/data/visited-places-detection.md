---
title: "Visited Places Detection Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation o"
---

# Visited Places Detection Blueprint

> Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation or dismissal.

| | |
|---|---|
| **Feature** | `visited-places-detection` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | location, gps, clustering, places, visits, stay-detection |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/visited-places-detection.blueprint.yaml) |
| **JSON API** | [visited-places-detection.json]({{ site.baseurl }}/api/blueprints/data/visited-places-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Reviews suggested visits and confirms, declines, or edits them. |
| `detection_service` | Visit Detection Service | system | Processes raw GPS points to produce candidate visit records. |
| `geocoder` | Geocoding Service | external | Reverse-geocodes visit centre coordinates into human-readable place names. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `visit_id` | hidden | No |  |  |
| `started_at` | datetime | Yes |  |  |
| `ended_at` | datetime | Yes |  | Validations: custom |
| `duration_minutes` | number | No |  |  |
| `center_latitude` | number | Yes |  | Validations: min, max |
| `center_longitude` | number | Yes |  | Validations: min, max |
| `radius_meters` | number | No |  |  |
| `status` | select | Yes |  |  |
| `name` | text | Yes |  | Validations: required |
| `place_id` | hidden | No |  |  |
| `area_id` | hidden | No |  |  |
| `point_ids` | json | No |  |  |
| `time_threshold_minutes` | number | No |  |  |
| `merge_threshold_minutes` | number | No |  |  |
| `minimum_visit_duration_seconds` | number | No |  |  |
| `minimum_points_required` | number | No |  |  |
| `detection_radius_meters` | number | No |  |  |

## States

**State field:** `visit_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `suggested` | Yes |  |
| `confirmed` |  |  |
| `declined` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `suggested` | `confirmed` | user |  |
|  | `suggested` | `declined` | user |  |
|  | `confirmed` | `suggested` | user |  |

## Rules

- **eligibility:** Only GPS points that are not already assigned to a visit and are not flagged as anomalies are considered for detection.
- **clustering:** A new visit cluster begins whenever the gap between two consecutive chronologically sorted GPS points exceeds time_threshold_minutes., A visit cluster is discarded if it contains fewer than minimum_points_required points or its duration is below minimum_visit_duration_seconds., The cluster's effective radius grows logarithmically with visit duration, capped at 500 m, so brief stops have a tight radius and long stays a wider one.
- **merging:** Two consecutive visits are merged if the gap between them is within merge_threshold_minutes AND their centres are within 50 m AND no significant movement (> 50 m) is detected in the gap points., After merging, the visit centre is recomputed as the arithmetic mean of all constituent point coordinates.
- **place_scans:** When a known place is referenced, only points within detection_radius_meters of the place are considered, scoped per calendar month for efficiency.
- **naming:** Visit name defaults to: place name (if linked), otherwise area name, otherwise reverse-geocoded address.
- **lifecycle:** All newly created visits are given status = suggested; the user must confirm or decline each one., Confirmed visits remain linked to their GPS points so re-detection over the same window does not create duplicates (idempotent via place+user+started_at key).

## Outcomes

### Smart_detection_triggered (Priority: 1)

**Given:**
- detection is requested for a user and a time range
- the time range contains at least minimum_points_required unvisited, non-anomaly points

**Then:**
- Run point clustering to identify stationary groups
- Run merger to combine adjacent clusters at the same location
- Group merged visits by approximate geographic cell and persist as visit records
- **emit_event** event: `visits.detection.completed`

**Result:** New visit records with status=suggested appear in the user's visit feed.

### No_qualifying_points (Priority: 2)

**Given:**
- the requested time range contains no unvisited, non-anomaly points

**Then:**
- **emit_event** event: `visits.detection.skipped`

**Result:** No visit records are created; no error is raised.

### Place_visit_scan_triggered (Priority: 3)

**Given:**
- a known place exists with at least one GPS point within detection_radius_meters

**Then:**
- For each calendar month with qualifying points near the place, group points by time threshold and create or update visit records linked to the place
- **emit_event** event: `visits.place_scan.completed`

**Result:** Visits associated with the specific place are created or updated.

### Visit_confirmed (Priority: 4)

**Given:**
- `status` (db) eq `suggested`
- user confirms the visit

**Then:**
- **transition_state** field: `visit_status` from: `suggested` to: `confirmed`
- **emit_event** event: `visit.confirmed`

**Result:** Visit is marked confirmed and appears with a distinct visual indicator.

### Visit_declined (Priority: 5)

**Given:**
- `status` (db) eq `suggested`
- user dismisses the visit

**Then:**
- **transition_state** field: `visit_status` from: `suggested` to: `declined`
- **emit_event** event: `visit.declined`

**Result:** Visit is hidden from the default feed and marked declined.

### Duplicate_prevented (Priority: 6)

**Given:**
- detection runs over a range that already has a confirmed visit for the same place and start time

**Then:**
- Find the existing visit by (place_id, user_id, started_at) and update its end time and duration if the new detection extends it

**Result:** No duplicate visit record is created; the existing record is updated if needed.

### Detection_failed (Priority: 7) — Error: `VISIT_DETECTION_FAILED`

**Given:**
- an unhandled error occurs during point clustering or visit creation

**Then:**
- **emit_event** event: `visits.detection.failed`

**Result:** Detection stops; partial results may be persisted. The user is notified.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VISIT_DETECTION_FAILED` | 500 | Visit detection could not be completed. Please try again later. | Yes |
| `PLACE_NOT_FOUND` | 404 | The specified place could not be found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `visits.detection.completed` | Smart detection finished for a time range. | `user_id`, `visit_count`, `started_at`, `ended_at` |
| `visits.detection.skipped` | Detection found no qualifying points and created nothing. | `user_id`, `started_at`, `ended_at` |
| `visits.detection.failed` | Detection aborted due to an error. | `user_id`, `error_message` |
| `visits.place_scan.completed` | Place-specific visit history scanned and recorded. | `place_id`, `visit_count` |
| `visit.confirmed` | User confirmed a suggested visit. | `visit_id`, `place_id`, `started_at`, `ended_at` |
| `visit.declined` | User declined a suggested visit. | `visit_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| location-history-storage | required | Provides the raw GPS points that are clustered into visits. |
| gps-position-history | required | Supplies the ordered, time-ranged point sequence used for detection. |
| location-history-map-visualization | recommended | Confirmed and suggested visits can be overlaid on the location map. |
| trip-stay-timeline | recommended | Confirmed visits appear as stay entries in the timeline feed. |
| geofence-places | optional | Named geofences provide semantic labels and radius constraints for visits. |

## AGI Readiness

### Goals

#### Reliable Visited Places Detection

Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation or dismissal.

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

- before transitioning to a terminal state

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
| `location_history_storage` | location-history-storage | degrade |
| `gps_position_history` | gps-position-history | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| smart_detection_triggered | `autonomous` | - | - |
| no_qualifying_points | `autonomous` | - | - |
| place_visit_scan_triggered | `autonomous` | - | - |
| visit_confirmed | `autonomous` | - | - |
| visit_declined | `autonomous` | - | - |
| duplicate_prevented | `autonomous` | - | - |
| detection_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/Freika/dawarich
  project: Dawarich — self-hostable location history tracker
  tech_stack: Ruby on Rails 8 + PostgreSQL + PostGIS
  files_traced: 12
  entry_points:
    - app/services/visits/detector.rb
    - app/services/visits/group.rb
    - app/services/visits/merger.rb
    - app/services/visits/smart_detect.rb
    - app/services/visits/creator.rb
    - app/services/places/visits/create.rb
    - app/models/visit.rb
    - app/models/place.rb
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Visited Places Detection Blueprint",
  "description": "Automatically clusters stationary GPS points into candidate visit records, merges adjacent stays at the same location, and surfaces them for user confirmation o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "location, gps, clustering, places, visits, stay-detection"
}
</script>
