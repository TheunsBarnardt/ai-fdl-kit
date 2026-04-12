---
title: "Geofence Places Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "User-defined named circular geofences that tag trip start/end and charging events with place labels and optionally apply billing tariffs to sessions at that loc"
---

# Geofence Places Blueprint

> User-defined named circular geofences that tag trip start/end and charging events with place labels and optionally apply billing tariffs to sessions at that location.

| | |
|---|---|
| **Feature** | `geofence-places` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | geofence, location, places, vehicle, trip, charging, spatial |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/geofence-places.blueprint.yaml) |
| **JSON API** | [geofence-places.json]({{ site.baseurl }}/api/blueprints/asset/geofence-places.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `vehicle_owner` | Vehicle Owner | human | Creates, names, and configures geofences and their tariffs |
| `system` | System | system | Matches vehicle positions to geofences at trip and charge events |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `geofence_id` | hidden | No | Geofence ID |  |
| `name` | text | Yes | Place Name |  |
| `latitude` | number | Yes | Centre Latitude |  |
| `longitude` | number | Yes | Centre Longitude |  |
| `radius_m` | number | Yes | Radius (metres) |  |
| `billing_type` | select | No | Billing Type |  |
| `cost_per_unit` | number | No | Cost Per Unit |  |
| `session_fee` | number | No | Session Fee |  |

## Rules

- **freeform_names_only:**
  - **description:** Geofences are user-defined with no system-reserved place types — no hardcoded home or work semantics; names are free-form strings
- **circle_geometry:**
  - **description:** A geofence is a circle defined by a centre point and a radius; valid radius range is 1 to 5000 metres
- **nearest_wins:**
  - **description:** When a vehicle event occurs the system finds the closest geofence whose circle contains the vehicle's position; if multiple geofences overlap the nearest centre wins
- **no_match_is_valid:**
  - **description:** If no geofence contains the position the event is recorded without a geofence reference
- **spatial_matching_required:**
  - **description:** Geofence matching uses spatial distance calculations; simple bounding-box or string matching is not sufficient
- **retroactive_tariff_update:**
  - **description:** Changing a geofence tariff retroactively updates the cost of all historical charging sessions matched to that geofence
- **delete_removes_future_only:**
  - **description:** Deleting a geofence removes it from future matching; historical events retain their geofence reference for audit continuity
- **session_fee_non_negative:**
  - **description:** Session fee must be zero or positive; negative fees are rejected

## Outcomes

### Geofence_created (Priority: 1)

**Given:**
- operator provides name, latitude, longitude, and radius
- `radius_m` (input) gte `1`
- `radius_m` (input) lte `5000`
- `session_fee` (input) gte `0`

**Then:**
- **create_record**
- **emit_event** event: `geofence.created`

**Result:** Geofence persisted; future vehicle events within the area will be tagged

### Geofence_matched_at_event (Priority: 2)

**Given:**
- a vehicle event occurs (trip start, trip end, or charge start)
- at least one geofence circle contains the vehicle's position

**Then:**
- **set_field** target: `event.geofence_id` value: `id of the nearest matching geofence`
- **emit_event** event: `geofence.matched`

**Result:** Event tagged with the matching place name; tariff applied if charging

### Geofence_not_matched (Priority: 3)

**Given:**
- a vehicle event occurs
- no geofence circle contains the vehicle's position

**Then:**
- **set_field** target: `event.geofence_id` value: `null`

**Result:** Event recorded without a place label

### Geofence_updated (Priority: 4)

**Given:**
- operator modifies a geofence tariff

**Then:**
- **emit_event** event: `geofence.tariff_updated`
- **set_field** target: `historical_charging_sessions_at_location` — Recalculate cost for all historical sessions matched to this geofence

**Result:** Tariff changes applied retroactively to all sessions at this location

### Geofence_radius_invalid (Priority: 5) — Error: `GEOFENCE_RADIUS_OUT_OF_RANGE`

**Given:**
- ANY: `radius_m` (input) lt `1` OR `radius_m` (input) gt `5000`

**Result:** Geofence not saved; user informed of valid radius range

### Session_fee_invalid (Priority: 6) — Error: `GEOFENCE_NEGATIVE_SESSION_FEE`

**Given:**
- `session_fee` (input) lt `0`

**Result:** Geofence not saved; user informed that session fee must be non-negative

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOFENCE_RADIUS_OUT_OF_RANGE` | 422 | Geofence radius must be between 1 and 5000 metres. | No |
| `GEOFENCE_NEGATIVE_SESSION_FEE` | 422 | Session fee must be zero or a positive value. | No |
| `GEOFENCE_NAME_REQUIRED` | 422 | A name is required to identify this place. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `geofence.created` | A new named place geofence was created | `geofence_id`, `name`, `latitude`, `longitude`, `radius_m` |
| `geofence.matched` | A vehicle event was matched to a geofence | `geofence_id`, `name`, `event_type`, `vehicle_id`, `distance_from_centre_m` |
| `geofence.tariff_updated` | A geofence charging tariff was modified | `geofence_id`, `billing_type`, `cost_per_unit`, `session_fee` |
| `geofence.deleted` | A geofence was removed | `geofence_id`, `name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ev-charging-session | required |  |
| ev-charging-cost-tariff | required |  |
| vehicle-trip-segmentation | recommended |  |
| location-visit-history | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL + PostGIS
  files_traced: 3
  entry_points:
    - lib/teslamate/locations/geo_fence.ex
    - lib/teslamate/locations.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geofence Places Blueprint",
  "description": "User-defined named circular geofences that tag trip start/end and charging events with place labels and optionally apply billing tariffs to sessions at that loc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "geofence, location, places, vehicle, trip, charging, spatial"
}
</script>
