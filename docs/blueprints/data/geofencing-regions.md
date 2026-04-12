---
title: "Geofencing Regions Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Define named circular regions by centre coordinates and radius; automatically detect when a tracked device enters or leaves each region and emit transition even"
---

# Geofencing Regions Blueprint

> Define named circular regions by centre coordinates and radius; automatically detect when a tracked device enters or leaves each region and emit transition events.

| | |
|---|---|
| **Feature** | `geofencing-regions` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | geofence, regions, waypoints, location, iot, proximity, transition |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/geofencing-regions.blueprint.yaml) |
| **JSON API** | [geofencing-regions.json]({{ site.baseurl }}/api/blueprints/data/geofencing-regions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `mobile_device` | Mobile Device | external | Device whose reported position is checked against all registered regions on every location update |
| `recorder_service` | Recorder Service | system | Evaluates each incoming position against the region database and fires transition hooks |
| `administrator` | Administrator | human | Operator who defines global shared regions; device users define personal regions via their apps |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `region_key` | hidden | Yes | Region Key |  |
| `label` | text | Yes | Region Label |  |
| `center_lat` | number | Yes | Centre Latitude |  |
| `center_lon` | number | Yes | Centre Longitude |  |
| `radius_meters` | number | Yes | Radius (metres) |  |
| `is_inside` | boolean | No | Currently Inside |  |
| `owner_user` | text | Yes | Owner Username |  |
| `owner_device` | text | Yes | Owner Device |  |
| `device_lat` | number | No | Device Latitude |  |
| `device_lon` | number | No | Device Longitude |  |

## States

**State field:** `presence_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `outside` | Yes |  |
| `inside` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `outside` | `inside` | recorder_service |  |
|  | `inside` | `outside` | recorder_service |  |

## Rules

- **boundary_check:**
  - **formula:** Regions are circles; the boundary test uses the Haversine great-circle distance formula between the device position and the region centre
  - **positive_radius:** A region is active only when radius_meters is greater than zero; zero or negative values are skipped
- **state_persistence:**
  - **per_tuple:** Each region's inside/outside state is persisted per owner-user, owner-device, and region-key so duplicate publishes do not re-fire events
  - **transition_only:** An event is emitted only when the presence state changes; no event fires when the device stays inside or outside
- **global_regions:**
  - **wildcard_owner:** Regions owned by a reserved wildcard user/device pair are evaluated for every tracked device regardless of who owns them
- **region_loading:**
  - **startup_load:** Region definitions are loaded at service startup from persisted storage files
  - **dynamic_refresh:** Region definitions are refreshed whenever a device publishes a new waypoints payload
- **payload:**
  - **distance_in_event:** The distance in metres between the device and the region centre at the moment of transition is included in the transition event payload

## Outcomes

### Region_skipped_zero_radius (Priority: 5) — Error: `GEOFENCE_INVALID_RADIUS`

**Given:**
- `radius_meters` (db) lte `0`

**Result:** Region with non-positive radius is ignored during evaluation

### Region_entered (Priority: 10)

**Given:**
- presence_state is outside
- `device_lat` (input) exists
- `device_lon` (input) exists
- haversine distance from device to region centre is less than radius_meters

**Then:**
- **set_field** target: `is_inside` value: `true` — Mark device as inside this region
- **transition_state** field: `presence_state` from: `outside` to: `inside`
- **emit_event** event: `region.entered`

**Result:** Transition hook fires with ENTER event; external systems notified of arrival

### Region_left (Priority: 20)

**Given:**
- presence_state is inside
- haversine distance from device to region centre is greater than or equal to radius_meters

**Then:**
- **set_field** target: `is_inside` value: `false` — Mark device as outside this region
- **transition_state** field: `presence_state` from: `inside` to: `outside`
- **emit_event** event: `region.left`

**Result:** Transition hook fires with LEAVE event; external systems notified of departure

### No_transition (Priority: 30)

**Given:**
- presence state does not change (device remains inside or outside)

**Result:** No event emitted; region state unchanged

### Region_definitions_loaded (Priority: 40)

**Given:**
- waypoints payload received for owner_user and owner_device
- payload contains at least one entry with radius_meters greater than 0

**Then:**
- **create_record** target: `region_store` — Upsert each valid region entry into the persistent region database keyed by owner identity and geohash of centre point
- **emit_event** event: `region.definitions_updated`

**Result:** Region database updated; subsequent position evaluations use the new definitions

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOFENCE_DB_UNAVAILABLE` | 503 | Geofencing is temporarily unavailable | No |
| `GEOFENCE_INVALID_RADIUS` | 422 | Region radius must be greater than zero | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `region.entered` | Device crossed into a region boundary from outside | `owner_user`, `owner_device`, `label`, `center_lat`, `center_lon`, `device_lat`, `device_lon`, `distance_meters` |
| `region.left` | Device crossed out of a region boundary from inside | `owner_user`, `owner_device`, `label`, `center_lat`, `center_lon`, `device_lat`, `device_lon`, `distance_meters` |
| `region.definitions_updated` | A new waypoints payload updated the set of active region definitions for an owner | `owner_user`, `owner_device`, `region_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| mqtt-location-ingestion | required | Provides device positions that are evaluated on each message receipt |
| location-history-storage | recommended | Transition events can be written to the history log alongside regular location records |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/owntracks/recorder
  project: OwnTracks Recorder
  tech_stack: C, LMDB, Haversine formula, Lua hooks
  files_traced: 5
  entry_points:
    - fences.c (check_a_waypoint, check_fences)
    - fences.h
    - storage.c (load_otrw_from_string, load_otrw_waypoints)
    - doc/FENCES.md
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Geofencing Regions Blueprint",
  "description": "Define named circular regions by centre coordinates and radius; automatically detect when a tracked device enters or leaves each region and emit transition even",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "geofence, regions, waypoints, location, iot, proximity, transition"
}
</script>
