<!-- AUTO-GENERATED FROM obd-pid-reading.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Obd Pid Reading

> Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID support per vehicle

**Category:** Integration · **Version:** 1.0.0 · **Tags:** obd · vehicle · diagnostics · pid · sensor · ecu · decoding · protocol

## What this does

Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID support per vehicle

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **service_mode** *(number, required)* — OBD-II Service Mode
- **pid_code** *(text, required)* — PID Hex Code
- **expected_bytes** *(number, optional)* — Expected Response Byte Count
- **ecu_target** *(select, optional)* — ECU Target
- **response_value** *(json, optional)* — Decoded Response Value
- **is_supported** *(boolean, optional)* — PID Supported by Vehicle
- **force_query** *(boolean, optional)* — Force Query Even If Unsupported

## What must be true

- **support_discovery:** At connection time, query PID support listing commands (mode 1, PIDs 0x00/0x20/0x40/0x60/0x80/0xA0/0xC0) to build the vehicle's supported PID set, Cache the supported PID set for the lifetime of the connection; do not re-query on each command, Mode 6 (monitor data) is only valid on CAN protocols; flag it as unsupported on non-CAN connections
- **query_execution:** Set the ECU target header on the adapter before each query when targeting a specific ECU, Append an optional frame-count digit to PID commands for early response termination when the adapter supports it, Flush the receive buffer before sending each command to discard stale data, Append a carriage return to every command byte sequence before transmission, Read the response until the adapter prompt character is received or the timeout expires
- **response_parsing:** Strip null bytes and normalize line endings from raw adapter output, Split response into frames; each frame identifies its source ECU via the header, Filter frames by ECU target bitmask to exclude responses from unintended ECUs, Constrain data bytes to the expected length for the PID; discard extra bytes, Pass constrained bytes to the PID-specific decoder function
- **return_values:** All numeric sensor values must be returned with their physical unit (RPM, km/h, °C, %, g/s, kPa, V, etc.), A null/empty response must be distinguishable from a zero-value response, If the decoder raises an error, return a null response rather than propagating the exception
- **unsupported_handling:** Do not transmit a PID command if the vehicle has not advertised support for it, unless force_query is true, Return a null response immediately for unsupported PIDs

## Success & failure scenarios

**✅ Success paths**

- **Successful Query** — when vehicle is in vehicle_connected state; PID is supported or force_query is true; ECU responds within timeout; at least one response frame matches the ECU target; decoder produces a valid typed value, then Returns decoded value with physical unit; caller receives a non-null response object.

**❌ Failure paths**

- **Not Connected** — when vehicle connection is not in vehicle_connected state, then Returns a null response immediately without transmitting any command. *(error: `OBD_NOT_CONNECTED`)*
- **Pid Not Supported** — when vehicle is connected; requested PID is not in the vehicle's advertised support set; force_query is false, then Returns a null response; no command is transmitted to the vehicle. *(error: `OBD_PID_NOT_SUPPORTED`)*
- **No Response** — when vehicle is connected; PID is supported or force_query is true; adapter sends the command but no ECU response arrives before timeout, then Returns a null response; caller may retry the query. *(error: `OBD_NO_RESPONSE`)*
- **No Matching Ecu** — when vehicle is connected; ECU response frames are received; no frame matches the target ECU filter, then Returns a null response; the targeted ECU did not reply. *(error: `OBD_NO_MATCHING_ECU`)*
- **Decode Error** — when a response is received from the target ECU; the decoder cannot interpret the response bytes, then Returns a null response; raw bytes are logged for diagnostics. *(error: `OBD_DECODE_ERROR`)*

## Errors it can return

- `OBD_NOT_CONNECTED` — No active vehicle connection. Connect before querying.
- `OBD_PID_NOT_SUPPORTED` — This vehicle does not support the requested parameter.
- `OBD_NO_RESPONSE` — The vehicle did not respond to the query. Check the connection and retry.
- `OBD_NO_MATCHING_ECU` — No response from the targeted ECU. It may not be present in this vehicle.
- `OBD_DECODE_ERROR` — The vehicle returned data that could not be decoded for this parameter.

## Connects to

- **obd-port-connection** *(required)* — Active vehicle_connected state must exist before PID queries are possible
- **obd-realtime-sensors** *(required)* — Real-time sensor readings use this PID query infrastructure
- **obd-dtc-diagnostics** *(required)* — DTC read (mode 3) and clear (mode 4) are implemented as PID-layer commands
- **obd-vin-extraction** *(optional)* — VIN reads via mode 9 PID query

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█░░░░░░░░░` | 1/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/obd-pid-reading/) · **Spec source:** [`obd-pid-reading.blueprint.yaml`](./obd-pid-reading.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
