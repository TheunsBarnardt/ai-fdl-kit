<!-- AUTO-GENERATED FROM gps-position-ingestion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Gps Position Ingestion

> Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route through a processing pipeline before...

**Category:** Integration · **Version:** 1.0.0 · **Tags:** gps · tracking · iot · protocol · position · ingestion · fleet

## What this does

Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route through a processing pipeline before...

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **device_id** *(hidden, required)* — Internal reference to the registered device this position belongs to
- **protocol** *(text, required)* — Name of the device communication protocol that produced this position
- **server_time** *(datetime, required)* — Timestamp at which the server received the message
- **device_time** *(datetime, optional)* — Timestamp reported by the device (may differ from server_time)
- **fix_time** *(datetime, required)* — GPS fix timestamp — the moment the device obtained the coordinates
- **valid** *(boolean, required)* — Whether the GPS fix is considered valid by the device
- **latitude** *(number, required)* — WGS-84 latitude in decimal degrees; must be in range [-90, 90]
- **longitude** *(number, required)* — WGS-84 longitude in decimal degrees; must be in range [-180, 180]
- **altitude** *(number, optional)* — Elevation above sea level in metres
- **speed** *(number, optional)* — Instantaneous speed in knots as reported by the device
- **course** *(number, optional)* — Heading in degrees (0–360, true north = 0)
- **accuracy** *(number, optional)* — Estimated horizontal accuracy in metres
- **outdated** *(boolean, optional)* — Flag set by the pipeline when a position's fix_time predates the device's most recent stored posi...
- **attributes** *(json, optional)* — Extensible key-value bag for protocol-specific sensor readings. Common keys: ignition (boolean), ...

## What must be true

- **validation → latitude_range:** latitude must be in the range [-90, 90]; positions outside this range are rejected
- **validation → longitude_range:** longitude must be in the range [-180, 180]; positions outside this range are rejected
- **validation → coordinate_precision:** Coordinates are stored with sufficient floating-point precision to represent sub-metre accuracy
- **data → outdated_positions:** A position whose fix_time is earlier than the device's last stored fix_time is accepted but flagged as outdated; event handlers skip outdated positions
- **data → disabled_device_handling:** Positions from disabled or expired devices are accepted at the transport layer but discarded before pipeline processing
- **data → protocol_field:** The protocol field records which decoder produced the position; downstream handlers may behave differently depending on protocol
- **processing → handler_pipeline:** All positions pass through the full handler pipeline in defined order before storage; a handler failure must not discard the position — it should log the error and pass to the next handler

## Success & failure scenarios

**✅ Success paths**

- **Position Outdated** — when position fix_time is earlier than device's most recent stored fix_time, then Position is stored for historical completeness but event handlers do not process it.
- **Position Accepted** — when device transmits a valid position message; latitude gte -90; latitude lte 90; longitude gte -180; longitude lte 180; device_id resolves to an active, non-disabled device, then Position is stored and the device's latest position is updated; pipeline handlers run enrichment and event detection.

**❌ Failure paths**

- **Invalid Coordinates** — when latitude lt -90 OR latitude gt 90 OR longitude lt -180 OR longitude gt 180, then Position is rejected; no record is created. *(error: `POSITION_INVALID_COORDINATES`)*
- **Device Not Found** — when unique_id in the incoming message does not match any registered device, then Message is silently discarded; the hardware is not recognised by the platform. *(error: `POSITION_DEVICE_NOT_REGISTERED`)*

## Errors it can return

- `POSITION_INVALID_COORDINATES` — Position coordinates are outside valid WGS-84 ranges
- `POSITION_DEVICE_NOT_REGISTERED` — No registered device matches the identifier in the incoming message

## Events

**`position.received`** — A new position record has been stored after passing pipeline processing
  Payload: `device_id`, `position_id`, `fix_time`, `latitude`, `longitude`, `speed`, `valid`, `protocol`

**`position.pipeline_error`** — A pipeline handler encountered an error while processing a position (position was still stored)
  Payload: `device_id`, `position_id`, `handler_name`, `error_message`

## Connects to

- **gps-device-registration** *(required)* — Positions can only be attributed to registered devices
- **gps-position-history** *(required)* — Stored positions form the historical record queried for playback and reports
- **geofence-management** *(recommended)* — Pipeline enriches positions with geofence membership
- **overspeed-alerts** *(recommended)* — Pipeline detects overspeed conditions from position speed and configured limits
- **ignition-detection** *(recommended)* — Pipeline reads ignition attribute to track engine state changes

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/gps-position-ingestion/) · **Spec source:** [`gps-position-ingestion.blueprint.yaml`](./gps-position-ingestion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
