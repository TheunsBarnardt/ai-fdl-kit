---
title: "Location History Storage Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Store device location records in append-only monthly logs, maintain a last-known-position snapshot per device, and serve time-range queries in multiple output f"
---

# Location History Storage Blueprint

> Store device location records in append-only monthly logs, maintain a last-known-position snapshot per device, and serve time-range queries in multiple output formats without an external database.

| | |
|---|---|
| **Feature** | `location-history-storage` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | location, history, storage, flat-file, gps, tracking, time-series |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/location-history-storage.blueprint.yaml) |
| **JSON API** | [location-history-storage.json]({{ site.baseurl }}/api/blueprints/data/location-history-storage.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `recorder_service` | Recorder Service | system | Writes incoming location records to append-only logs and updates the last-position snapshot |
| `api_client` | API Client | external | Queries historical location data via a REST or command-line interface |
| `admin_operator` | Administrator | human | Manages storage retention, purges old log files, and configures the storage root path |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user` | text | Yes | Username |  |
| `device` | text | Yes | Device Name |  |
| `tst` | number | Yes | Device Timestamp |  |
| `lat` | number | Yes | Latitude |  |
| `lon` | number | Yes | Longitude |  |
| `accuracy` | number | No | Accuracy (metres) |  |
| `tracker_id` | text | No | Tracker ID |  |
| `geohash` | text | No | Geohash |  |
| `address` | text | No | Reverse-Geo Address |  |
| `country_code` | text | No | Country Code |  |
| `from_time` | datetime | No | Query From |  |
| `to_time` | datetime | No | Query To |  |
| `result_limit` | number | No | Result Limit |  |
| `output_format` | select | No | Output Format |  |

## Rules

- **storage_conventions:**
  - **utc_only:** All timestamps are stored and queried in UTC; local-time conversion is the responsibility of the consumer
  - **lowercase_paths:** User and device names are normalised to lowercase when constructing storage paths; mixed-case inputs map to the same records
  - **monthly_buckets:** History records are appended to monthly log files (one per calendar month per user/device); records are never modified in place
  - **no_external_database:** Storage operates entirely on the local filesystem with no network database dependency
- **last_position:**
  - **newer_wins:** The last-position snapshot is overwritten only when the incoming record's tst is strictly newer than the stored one; out-of-order publishes append to history but leave the snapshot unchanged
  - **enrichment_at_read:** The snapshot is enriched with card data and geocoding details at read time, not at write time
  - **extra_metadata:** Optional extra metadata files co-located with the last-position snapshot are merged into query responses without overwriting existing fields
- **querying:**
  - **time_window_scan:** Queries filtered by time window scan only the log files whose calendar month overlaps the requested range
  - **reverse_scan:** A reverse-N query reads the log backwards and stops after collecting the requested number of records; efficient for recent-position lookups
  - **field_filtering:** Responses can be filtered to a specified subset of fields to reduce payload size

## Outcomes

### Storage_unavailable (Priority: 1) — Error: `STORAGE_PATH_UNAVAILABLE`

**Given:**
- the storage base directory does not exist or cannot be created

**Result:** Write operation fails; no partial record created

### Location_appended (Priority: 10)

**Given:**
- valid location record received with user, device, tst, lat, lon

**Then:**
- **create_record** target: `monthly_log` — Append ISO-timestamped JSON line to the monthly log file for this user/device
- **emit_event** event: `location.stored`

**Result:** Record permanently appended to history; readable immediately via query API

### Last_position_updated (Priority: 20)

**Given:**
- valid location record received
- `tst` (input) gt `stored_last_tst`

**Then:**
- **set_field** target: `last_position_snapshot` — Overwrite the last-position file with the new location JSON
- **emit_event** event: `location.last_updated`

**Result:** Last-position snapshot reflects the most recent known location

### Last_position_unchanged (Priority: 25)

**Given:**
- valid location record received
- `tst` (input) lte `stored_last_tst`

**Then:**
- **create_record** target: `monthly_log` — Record is still appended to history log for completeness

**Result:** History log updated; last-position snapshot preserved; out-of-order delivery handled gracefully

### History_queried (Priority: 30)

**Given:**
- user and device are specified
- from_time and to_time define a valid time window

**Then:**
- **emit_event** event: `location.history_queried`

**Result:** Array of location records within the requested window returned in the specified format

### Last_n_queried (Priority: 35)

**Given:**
- user and device are specified
- `result_limit` (input) gt `0`

**Then:**
- **emit_event** event: `location.history_queried`

**Result:** The N most recent records returned by reverse-scanning the log; avoids full-file read

### Last_position_queried (Priority: 40)

**Given:**
- user and device are specified
- query targets the last-position snapshot rather than the history log

**Then:**
- **emit_event** event: `location.last_queried`

**Result:** Single enriched JSON object with last position, reverse-geo address, card details, and any extra metadata

### User_list_queried (Priority: 50)

**Given:**
- query requests list of all known users or devices

**Then:**
- **emit_event** event: `location.users_listed`

**Result:** Directory of all users and their devices returned; derived from last-position snapshot directory structure

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STORAGE_PATH_UNAVAILABLE` | 503 | Storage is currently unavailable | No |
| `STORAGE_WRITE_FAILED` | 500 | Failed to record location data | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `location.stored` | A location record was appended to the monthly history log | `user`, `device`, `tst`, `lat`, `lon` |
| `location.last_updated` | The last-position snapshot for a device was overwritten with a newer record | `user`, `device`, `tst`, `lat`, `lon` |
| `location.history_queried` | A time-range or last-N query was executed and results returned | `user`, `device`, `from_time`, `to_time`, `record_count`, `output_format` |
| `location.last_queried` | The last-known position for a device was read and returned | `user`, `device`, `tst` |
| `location.users_listed` | The directory of tracked users and devices was returned | `user_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| mqtt-location-ingestion | required | Provides the stream of validated location records to persist |
| geofencing-regions | recommended | Reads stored waypoint files from the same storage tree to initialise geofence state |
| shared-location-friends | optional | Reads last-position snapshots to populate friend location responses |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/owntracks/recorder
  project: OwnTracks Recorder
  tech_stack: C, flat filesystem, LMDB geo cache
  files_traced: 5
  entry_points:
    - storage.c (putrec, last_users, locations, lister, append_device_details)
    - storage.h
    - recorder.c (is_newer_than_last)
    - doc/STORE.md
    - doc/DESIGN.md
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Location History Storage Blueprint",
  "description": "Store device location records in append-only monthly logs, maintain a last-known-position snapshot per device, and serve time-range queries in multiple output f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "location, history, storage, flat-file, gps, tracking, time-series"
}
</script>
