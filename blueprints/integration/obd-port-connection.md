<!-- AUTO-GENERATED FROM obd-port-connection.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Obd Port Connection

> Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to establish a ready connection

**Category:** Integration · **Version:** 1.0.0 · **Tags:** obd · vehicle · diagnostics · serial · connection · discovery · adapter · protocol

## What this does

Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to establish a ready connection

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **port** *(text, optional)* — Serial Port
- **baud_rate** *(number, optional)* — Baud Rate
- **timeout_seconds** *(number, optional)* — Read Timeout (seconds)
- **protocol** *(select, optional)* — OBD-II Protocol
- **connection_status** *(select, optional)* — Connection Status

## What must be true

- **port_discovery:** When no port is specified, enumerate all candidate serial ports on the current platform, Linux/Cygwin: scan /dev/rfcomm* and /dev/ttyUSB* patterns, Windows: probe COM1 through COM255, macOS: scan /dev/tty.* excluding Bluetooth modem ports, Test each candidate port by opening it; exclude any that raise an access or hardware error, Return ports in the order discovered; the first successful one is used by default
- **baud_negotiation:** Try baud rates in fixed sequence: 38400, 9600, 230400, 115200, 57600, 19200, Send a delimiter byte sequence and wait up to 100ms for the adapter prompt character, Accept the first baud rate that produces a valid adapter prompt, Fail if no baud rate in the sequence succeeds
- **adapter_initialization:** Send a full reset command and wait at least 1 second before proceeding, Disable echo so adapter responses are not echoed back, Enable message headers so ECU source addresses are included in responses, Disable linefeeds to simplify response parsing, Each init command must return a success acknowledgement; abort if any fail
- **voltage_check:** Read the OBD-II socket voltage via the adapter after init, Require at least 6V to confirm the socket is powered (vehicle ignition on), Do not proceed to protocol detection if voltage is below threshold
- **protocol_detection:** Use adapter auto-detect mode first; query PID support to trigger detection, Read the detected protocol identifier from the adapter after the query, If auto-detect fails, try protocols in likelihood order: CAN 11-bit 500k, CAN 11-bit 250k, J1850 PWM, CAN 29-bit 500k, CAN 29-bit 250k, J1850 VPW, ISO 9141-2, ISO 14230-4 5baud, ISO 14230-4 fast, J1939
- **operational:** All OBD queries must return a null/empty response if connection_status is not vehicle_connected, is_connected() must return true only when status is vehicle_connected, Closing the connection must release the serial port immediately and reset status to not_connected

## Success & failure scenarios

**✅ Success paths**

- **Connection Closed** — when connection is in any non-not_connected state; caller requests close, then Serial port is released and connection state resets to not_connected.
- **Connection Established** — when a serial port is accessible; baud rate negotiation succeeds; all adapter initialization commands succeed; OBD-II socket voltage is 6V or above; a communication protocol is detected and confirmed with an ECU response, then System is in vehicle_connected state and ready to accept PID queries and diagnostic commands.

**❌ Failure paths**

- **No Port Found** — when no port is specified; port enumeration finds no accessible serial ports, then Connection remains in not_connected state; caller receives an empty port list. *(error: `OBD_NO_PORT_FOUND`)*
- **Port Access Denied** — when a port is specified or discovered; opening the port raises a permissions or hardware-busy error, then Connection remains in not_connected state. *(error: `OBD_PORT_ACCESS_DENIED`)*
- **Baud Negotiation Failed** — when a serial port is accessible; no baud rate in the negotiation sequence produces a valid adapter prompt, then Connection halts; adapter may be powered off or incompatible. *(error: `OBD_BAUD_NEGOTIATION_FAILED`)*
- **Adapter Init Failed** — when baud rate is established; one or more adapter initialization commands do not return a success acknowledgement, then Connection halts at not_connected; adapter may be damaged or incompatible. *(error: `OBD_ADAPTER_INIT_FAILED`)*
- **Low Voltage** — when adapter is initialized; measured OBD-II socket voltage is below 6V, then Connection halts at adapter_connected; vehicle ignition is likely off. *(error: `OBD_LOW_VOLTAGE`)*
- **Protocol Not Detected** — when OBD-II socket voltage is valid; all protocol candidates fail to produce a valid ECU response, then Connection halts at socket_connected; vehicle may not support OBD-II or ignition is off. *(error: `OBD_PROTOCOL_NOT_DETECTED`)*

## Errors it can return

- `OBD_NO_PORT_FOUND` — No diagnostic adapter port found. Ensure the adapter is plugged in.
- `OBD_PORT_ACCESS_DENIED` — Could not open the specified port. It may be in use or require elevated permissions.
- `OBD_BAUD_NEGOTIATION_FAILED` — Could not establish communication speed with the adapter. Check power and cable.
- `OBD_ADAPTER_INIT_FAILED` — Adapter did not respond to initialization commands. It may be incompatible.
- `OBD_LOW_VOLTAGE` — OBD-II socket voltage is too low. Turn on the vehicle ignition and retry.
- `OBD_PROTOCOL_NOT_DETECTED` — Could not detect a supported OBD-II protocol. The vehicle may not be compatible.

## Events

**`obd.connection.established`** — Vehicle connection fully established; protocol confirmed and ECU is responding
  Payload: `port`, `baud_rate`, `protocol`, `connection_status`

**`obd.connection.closed`** — Connection cleanly closed; serial port released
  Payload: `port`

**`obd.connection.error`** — A connection-level error occurred during setup or operation
  Payload: `error_code`, `port`

## Connects to

- **obd-pid-reading** *(required)* — PID queries require an active vehicle_connected state
- **obd-dtc-diagnostics** *(required)* — DTC read/clear requires an active vehicle_connected state
- **obd-realtime-sensors** *(required)* — Sensor streaming requires an active vehicle_connected state
- **obd-vin-extraction** *(required)* — VIN reading requires an active vehicle_connected state

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██░░░░░░░░` | 2/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/obd-port-connection/) · **Spec source:** [`obd-port-connection.blueprint.yaml`](./obd-port-connection.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
