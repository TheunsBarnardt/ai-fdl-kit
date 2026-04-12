<!-- AUTO-GENERATED FROM mqtt-location-ingestion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Mqtt Location Ingestion

> Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or processing handler.

**Category:** Integration · **Version:** 1.0.0 · **Tags:** mqtt · location · ingestion · iot · real-time · device-tracking

## What this does

Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or processing handler.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **topic** *(text, required)* — Publish Topic
- **payload** *(json, required)* — Raw Payload
- **payload_type** *(select, optional)* — Payload Type
- **tst** *(number, optional)* — Device Timestamp
- **lat** *(number, optional)* — Latitude
- **lon** *(number, optional)* — Longitude
- **accuracy** *(number, optional)* — Accuracy (metres)
- **tracker_id** *(text, optional)* — Tracker ID
- **trigger** *(select, optional)* — Report Trigger
- **is_retained** *(boolean, optional)* — Retained Flag

## What must be true

- **topic_validation → minimum_segments:** Topic must contain at least three slash-delimited segments (prefix/user/device); shorter topics are silently discarded
- **topic_validation → segment_extraction:** User and device names are extracted from positions 1 and 2 (0-indexed); the first segment may be any prefix string
- **topic_validation → leading_slash_tolerance:** An optional leading slash in the topic is tolerated; segment positions shift accordingly
- **payload_validation → empty_discard:** Empty payloads (zero bytes) are discarded without processing
- **payload_validation → retain_filter:** If the ignore-retained-messages option is enabled, messages with the retained flag set are discarded before parsing
- **payload_validation → parse_order:** Payload is parsed as JSON first; if JSON fails a CSV-to-JSON conversion is attempted; if both fail the raw binary dump is stored as-is
- **payload_validation → type_routing:** The _type field in the JSON payload determines routing; an absent or unrecognised _type stores the payload without further processing
- **coordinate_normalisation → nan_discard:** For location and transition payloads, lat and lon are normalised to numbers; a NaN result causes the message to be discarded
- **coordinate_normalisation → timestamp_fallback:** The tst field is normalised to a number; if absent or non-numeric the current server time is substituted
- **deduplication → out_of_order:** Duplicate or out-of-order location publishes append to history but do not overwrite the last-position snapshot when the incoming tst is not newer than the stored one
- **encryption → decrypt_before_process:** Encrypted payloads are decrypted before re-entering the processing pipeline; if decryption fails the message is dropped and logged

## Success & failure scenarios

**✅ Success paths**

- **Retained Ignored** — when is_retained is true; ignore_retained_messages configuration is enabled, then Retained message discarded; broker state replays do not pollute history.
- **Location Stored** — when payload_type equals location; lat and lon are valid numbers, then Location recorded in history log and last-position store; real-time subscribers notified.
- **Waypoint Received** — when payload_type equals waypoint or waypoints, then Waypoint definitions stored for geofence evaluation; geofence state reloaded.
- **Transition Received** — when payload_type equals transition; lat and lon are valid numbers, then Device-reported geofence transition stored and forwarded.
- **Non Location Stored** — when payload_type is one of: cmd, steps, lwt, beacon, status, then Auxiliary message persisted for audit; no position update performed.
- **Card Stored** — when payload_type equals card, then Display name and avatar available for map overlays and friend lists.
- **Unparseable Payload Stored** — when JSON parsing fails; CSV parsing also fails, then Unrecognised payload preserved for manual inspection.

**❌ Failure paths**

- **Empty Payload Discarded** — when payload not_exists, then Message silently dropped; no storage operation performed. *(error: `INGESTION_EMPTY_PAYLOAD`)*
- **Invalid Coordinates** — when payload_type is location or transition; lat or lon cannot be parsed as a finite number, then Malformed location message dropped and logged; history not updated. *(error: `INGESTION_INVALID_COORDINATES`)*
- **Short Topic Discarded** — when topic has fewer than three slash-delimited segments, then Message discarded; cannot extract user or device identity. *(error: `INGESTION_TOPIC_TOO_SHORT`)*

## Errors it can return

- `INGESTION_EMPTY_PAYLOAD` — Empty message received and discarded
- `INGESTION_INVALID_COORDINATES` — Location coordinates are missing or invalid
- `INGESTION_TOPIC_TOO_SHORT` — Message topic is too short to identify a device

## Connects to

- **location-history-storage** *(required)* — Stores parsed location records and maintains last-position files
- **geofencing-regions** *(recommended)* — Evaluates device position against registered waypoints on each ingested location
- **shared-location-friends** *(optional)* — Distributes ingested positions to subscribed friend devices in HTTP mode

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/mqtt-location-ingestion/) · **Spec source:** [`mqtt-location-ingestion.blueprint.yaml`](./mqtt-location-ingestion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
