<!-- AUTO-GENERATED FROM location-history-storage.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Location History Storage

> Store device location records in append-only monthly logs, maintain a last-known-position snapshot per device, and serve time-range queries in multiple output formats without an external database.

**Category:** Data · **Version:** 1.0.0 · **Tags:** location · history · storage · flat-file · gps · tracking · time-series

## What this does

Store device location records in append-only monthly logs, maintain a last-known-position snapshot per device, and serve time-range queries in multiple output formats without an external database.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user** *(text, required)* — Username
- **device** *(text, required)* — Device Name
- **tst** *(number, required)* — Device Timestamp
- **lat** *(number, required)* — Latitude
- **lon** *(number, required)* — Longitude
- **accuracy** *(number, optional)* — Accuracy (metres)
- **tracker_id** *(text, optional)* — Tracker ID
- **geohash** *(text, optional)* — Geohash
- **address** *(text, optional)* — Reverse-Geo Address
- **country_code** *(text, optional)* — Country Code
- **from_time** *(datetime, optional)* — Query From
- **to_time** *(datetime, optional)* — Query To
- **result_limit** *(number, optional)* — Result Limit
- **output_format** *(select, optional)* — Output Format

## What must be true

- **storage_conventions → utc_only:** All timestamps are stored and queried in UTC; local-time conversion is the responsibility of the consumer
- **storage_conventions → lowercase_paths:** User and device names are normalised to lowercase when constructing storage paths; mixed-case inputs map to the same records
- **storage_conventions → monthly_buckets:** History records are appended to monthly log files (one per calendar month per user/device); records are never modified in place
- **storage_conventions → no_external_database:** Storage operates entirely on the local filesystem with no network database dependency
- **last_position → newer_wins:** The last-position snapshot is overwritten only when the incoming record's tst is strictly newer than the stored one; out-of-order publishes append to history but leave the snapshot unchanged
- **last_position → enrichment_at_read:** The snapshot is enriched with card data and geocoding details at read time, not at write time
- **last_position → extra_metadata:** Optional extra metadata files co-located with the last-position snapshot are merged into query responses without overwriting existing fields
- **querying → time_window_scan:** Queries filtered by time window scan only the log files whose calendar month overlaps the requested range
- **querying → reverse_scan:** A reverse-N query reads the log backwards and stops after collecting the requested number of records; efficient for recent-position lookups
- **querying → field_filtering:** Responses can be filtered to a specified subset of fields to reduce payload size

## Success & failure scenarios

**✅ Success paths**

- **Location Appended** — when valid location record received with user, device, tst, lat, lon, then Record permanently appended to history; readable immediately via query API.
- **Last Position Updated** — when valid location record received; Incoming record is newer than the stored last position, then Last-position snapshot reflects the most recent known location.
- **Last Position Unchanged** — when valid location record received; Incoming record is equal to or older than the stored last position, then History log updated; last-position snapshot preserved; out-of-order delivery handled gracefully.
- **History Queried** — when user and device are specified; from_time and to_time define a valid time window, then Array of location records within the requested window returned in the specified format.
- **Last N Queried** — when user and device are specified; result_limit gt 0, then The N most recent records returned by reverse-scanning the log; avoids full-file read.
- **Last Position Queried** — when user and device are specified; query targets the last-position snapshot rather than the history log, then Single enriched JSON object with last position, reverse-geo address, card details, and any extra metadata.
- **User List Queried** — when query requests list of all known users or devices, then Directory of all users and their devices returned; derived from last-position snapshot directory structure.

**❌ Failure paths**

- **Storage Unavailable** — when the storage base directory does not exist or cannot be created, then Write operation fails; no partial record created. *(error: `STORAGE_PATH_UNAVAILABLE`)*

## Errors it can return

- `STORAGE_PATH_UNAVAILABLE` — Storage is currently unavailable
- `STORAGE_WRITE_FAILED` — Failed to record location data

## Connects to

- **mqtt-location-ingestion** *(required)* — Provides the stream of validated location records to persist
- **geofencing-regions** *(recommended)* — Reads stored waypoint files from the same storage tree to initialise geofence state
- **shared-location-friends** *(optional)* — Reads last-position snapshots to populate friend location responses

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/location-history-storage/) · **Spec source:** [`location-history-storage.blueprint.yaml`](./location-history-storage.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
