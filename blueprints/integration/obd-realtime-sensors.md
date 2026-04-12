<!-- AUTO-GENERATED FROM obd-realtime-sensors.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Obd Realtime Sensors

> Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callback-driven updates

**Category:** Integration · **Version:** 1.0.0 · **Tags:** obd · vehicle · sensors · realtime · rpm · speed · temperature · maf · throttle · fuel · streaming

## What this does

Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callback-driven updates

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **engine_rpm** *(number, optional)* — Engine RPM
- **vehicle_speed** *(number, optional)* — Vehicle Speed (km/h)
- **coolant_temp** *(number, optional)* — Engine Coolant Temperature (°C)
- **throttle_position** *(number, optional)* — Absolute Throttle Position (%)
- **maf_rate** *(number, optional)* — Mass Air Flow Rate (g/s)
- **fuel_level** *(number, optional)* — Fuel Tank Level (%)
- **poll_interval_ms** *(number, optional)* — Poll Interval (milliseconds)
- **watched_sensors** *(json, optional)* — Registered Sensor Identifiers
- **streaming_state** *(select, optional)* — Streaming State

## What must be true

- **sensor_support:** Only query sensors that the vehicle advertises as supported via the PID support listing, Skip unsupported sensors silently during streaming; return null on direct query, Support is cached at connection time; do not re-query the support listing on each poll cycle
- **decoding:** RPM: two bytes — formula ((high × 256) + low) ÷ 4 — returns value in RPM, Speed: one byte — raw value equals speed in km/h — returns value in km/h, Coolant temperature: one byte — subtract 40 to get °C — range -40 to +215 °C, Throttle position: one byte — (raw ÷ 255) × 100 — returns percentage 0–100, MAF rate: two bytes — formula ((high × 256) + low) ÷ 100 — returns value in g/s, Fuel level: one byte — (raw ÷ 255) × 100 — returns percentage 0–100, All returned values carry explicit physical units; consumers must not assume a unit
- **streaming:** The polling loop must run in a separate thread or async task; it must not block the caller, Introduce a configurable delay between query cycles to avoid saturating the OBD-II bus, Invoke registered callbacks only when a sensor value changes from the previous poll, Multiple callbacks may be registered per sensor; invoke all of them in order, Sensor registration and deregistration are safe to call while streaming is active, A paused loop retains all registered sensors and callbacks
- **direct_query:** Any sensor may be queried on demand without starting the streaming loop, Direct queries follow the same support check and decoding rules as streaming

## Success & failure scenarios

**✅ Success paths**

- **Direct Query Success** — when vehicle is connected; sensor PID is supported by the vehicle; caller requests a single on-demand reading, then Returns the decoded sensor value with its physical unit to the caller.
- **Streaming Started** — when vehicle is connected; at least one sensor is registered for watching; streaming_state is idle, then Background polling loop starts; all registered sensors are queried on each cycle.
- **Sensor Value Changed** — when streaming_state is streaming; a polled sensor returns a value different from the previous poll, then All callbacks registered for this sensor are invoked with the new value.
- **Streaming Paused** — when streaming_state is streaming; caller requests a temporary pause, then Polling loop suspends; registered sensors and callbacks are retained.
- **Streaming Stopped** — when streaming_state is streaming or paused; caller stops the loop or deregisters all sensors, then Background polling loop terminates; no further callbacks are invoked.

**❌ Failure paths**

- **Sensor Not Supported** — when the requested sensor PID is not in the vehicle's advertised support set, then Returns a null response; sensor is excluded from streaming without error. *(error: `OBD_SENSOR_NOT_SUPPORTED`)*
- **Not Connected** — when vehicle connection is not in vehicle_connected state, then Active streaming loop stops; all pending sensor queries return null. *(error: `OBD_NOT_CONNECTED`)*

## Errors it can return

- `OBD_SENSOR_NOT_SUPPORTED` — This vehicle does not support the requested sensor.
- `OBD_NOT_CONNECTED` — No active vehicle connection. Connect before reading sensors.

## Connects to

- **obd-port-connection** *(required)* — Active vehicle_connected state required for all sensor queries
- **obd-pid-reading** *(required)* — Each sensor reading is a PID query dispatched through the PID reading layer

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/obd-realtime-sensors/) · **Spec source:** [`obd-realtime-sensors.blueprint.yaml`](./obd-realtime-sensors.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
