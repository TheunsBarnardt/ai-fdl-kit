---
title: "Location Visit History Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Tracks where a vehicle parks by linking trip and charge events to reverse-geocoded addresses and named geofences, enabling reporting on dwell time and visit fre"
---

# Location Visit History Blueprint

> Tracks where a vehicle parks by linking trip and charge events to reverse-geocoded addresses and named geofences, enabling reporting on dwell time and visit frequency per location.

| | |
|---|---|
| **Feature** | `location-visit-history` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | vehicle, location, history, visits, parking, address, telemetry |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/location-visit-history.blueprint.yaml) |
| **JSON API** | [location-visit-history.json]({{ site.baseurl }}/api/blueprints/asset/location-visit-history.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | System | system | Reverse-geocodes positions, matches geofences, and builds visit records |
| `geocoding_service` | Geocoding Service | external | Converts latitude and longitude to a structured address |
| `vehicle_owner` | Vehicle Owner | human | Views visit history and may define geofences to name frequent places |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `address_id` | hidden | No | Address ID |  |
| `display_name` | text | No | Full Address |  |
| `latitude` | number | Yes | Latitude |  |
| `longitude` | number | Yes | Longitude |  |
| `street` | text | No | Street Name |  |
| `house_number` | text | No | House Number |  |
| `neighbourhood` | text | No | Neighbourhood |  |
| `city` | text | No | City |  |
| `state` | text | No | State / Region |  |
| `country` | text | No | Country |  |
| `osm_id` | text | No | Map Service Object ID |  |
| `osm_type` | text | No | Map Service Object Type |  |
| `geofence_id` | hidden | No | Matched Geofence |  |
| `arrival_date` | datetime | No | Arrival Date |  |
| `departure_date` | datetime | No | Departure Date |  |
| `parking_duration_min` | number | No | Parking Duration (minutes) |  |

## Rules

- **reverse_geocode_on_event:**
  - **description:** Every trip end and every charging session start triggers a reverse-geocoding lookup to resolve coordinates to a structured address
- **address_deduplication:**
  - **description:** Addresses are cached by external map service identifier (osm_id + osm_type); if an address with those identifiers already exists it is reused rather than creating a duplicate
- **geocoding_failure_non_blocking:**
  - **description:** Geocoding failures do not block event creation; events are persisted with a null address reference
- **language_configurable:**
  - **description:** Address language is configurable; the system requests addresses in the configured language from the geocoding service
- **parking_duration_from_trip_boundary:**
  - **description:** Visit duration is calculated as the time between a trip end (arrival) and the next trip start (departure) for the same vehicle
- **geofence_tagging_simultaneous:**
  - **description:** Geofence matching is performed at the same time as address lookup; if a named geofence contains the position the event is tagged with both address and geofence
- **visit_frequency_by_address:**
  - **description:** Visit frequency for a location is derived by counting events sharing the same address_id or geofence_id over a time period

## Outcomes

### Address_resolved (Priority: 1)

**Given:**
- a trip just ended or a charging session just started
- geocoding service returns a valid address

**Then:**
- **create_record** — Persist the resolved address if it does not already exist (deduplicate by osm_id + osm_type)
- **set_field** target: `event.address_id` value: `id of the resolved address`
- **emit_event** event: `location.address.resolved`

**Result:** Event tagged with structured address; visit history queryable

### Address_not_resolved (Priority: 2)

**Given:**
- a trip just ended or a charging session just started
- geocoding service fails or returns no result

**Then:**
- **set_field** target: `event.address_id` value: `null`

**Result:** Event recorded without an address; coordinates retained for future resolution

### Geofence_tagged_on_visit (Priority: 3)

**Given:**
- a trip just ended or a charging session just started
- a named geofence contains the vehicle's position

**Then:**
- **set_field** target: `event.geofence_id` value: `id of the nearest matching geofence`
- **emit_event** event: `location.geofence.matched`

**Result:** Event tagged with user-defined place name for friendly display

### Parking_duration_calculated (Priority: 4)

**Given:**
- a new trip starts
- the vehicle was at the same location for a measurable duration

**Then:**
- **set_field** target: `parking_duration_min` value: `departure_date - arrival_date in minutes`
- **emit_event** event: `location.visit.completed`

**Result:** Parking duration recorded; visit history updated with dwell time

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GEOCODING_UNAVAILABLE` | 503 | Location could not be resolved to an address. Coordinates were saved. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `location.address.resolved` | A vehicle event was tagged with a reverse-geocoded address | `event_type`, `vehicle_id`, `address_id`, `display_name`, `latitude`, `longitude` |
| `location.geofence.matched` | A vehicle event was matched to a named geofence | `event_type`, `vehicle_id`, `geofence_id`, `geofence_name` |
| `location.visit.completed` | A parking period at a location has ended | `vehicle_id`, `address_id`, `geofence_id`, `arrival_date`, `departure_date`, `parking_duration_min` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-trip-segmentation | required |  |
| ev-charging-session | required |  |
| geofence-places | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/adriankumpf/teslamate
  project: TeslaMate
  tech_stack: Elixir, Phoenix, PostgreSQL + PostGIS, OpenStreetMap Nominatim
  files_traced: 5
  entry_points:
    - lib/teslamate/locations.ex
    - lib/teslamate/locations/address.ex
    - lib/teslamate/locations/geocoder.ex
    - lib/teslamate/locations/geo_fence.ex
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Location Visit History Blueprint",
  "description": "Tracks where a vehicle parks by linking trip and charge events to reverse-geocoded addresses and named geofences, enabling reporting on dwell time and visit fre",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "vehicle, location, history, visits, parking, address, telemetry"
}
</script>
