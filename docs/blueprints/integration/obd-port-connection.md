---
title: "Obd Port Connection Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to est"
---

# Obd Port Connection Blueprint

> Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to establish a ready connection

| | |
|---|---|
| **Feature** | `obd-port-connection` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | obd, vehicle, diagnostics, serial, connection, discovery, adapter, protocol |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/obd-port-connection.blueprint.yaml) |
| **JSON API** | [obd-port-connection.json]({{ site.baseurl }}/api/blueprints/integration/obd-port-connection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | Diagnostic System | system | The application initiating and managing the vehicle connection |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `port` | text | No | Serial Port |  |
| `baud_rate` | number | No | Baud Rate |  |
| `timeout_seconds` | number | No | Read Timeout (seconds) |  |
| `protocol` | select | No | OBD-II Protocol |  |
| `connection_status` | select | No | Connection Status |  |

## States

**State field:** `connection_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_connected` | Yes |  |
| `adapter_connected` |  |  |
| `socket_connected` |  |  |
| `vehicle_connected` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `not_connected` | `adapter_connected` | system |  |
|  | `adapter_connected` | `socket_connected` | system |  |
|  | `socket_connected` | `vehicle_connected` | system |  |
|  | `vehicle_connected` | `not_connected` | system |  |
|  | `adapter_connected` | `not_connected` | system |  |
|  | `socket_connected` | `not_connected` | system |  |

## Rules

- **port_discovery:** When no port is specified, enumerate all candidate serial ports on the current platform, Linux/Cygwin: scan /dev/rfcomm* and /dev/ttyUSB* patterns, Windows: probe COM1 through COM255, macOS: scan /dev/tty.* excluding Bluetooth modem ports, Test each candidate port by opening it; exclude any that raise an access or hardware error, Return ports in the order discovered; the first successful one is used by default
- **baud_negotiation:** Try baud rates in fixed sequence: 38400, 9600, 230400, 115200, 57600, 19200, Send a delimiter byte sequence and wait up to 100ms for the adapter prompt character, Accept the first baud rate that produces a valid adapter prompt, Fail if no baud rate in the sequence succeeds
- **adapter_initialization:** Send a full reset command and wait at least 1 second before proceeding, Disable echo so adapter responses are not echoed back, Enable message headers so ECU source addresses are included in responses, Disable linefeeds to simplify response parsing, Each init command must return a success acknowledgement; abort if any fail
- **voltage_check:** Read the OBD-II socket voltage via the adapter after init, Require at least 6V to confirm the socket is powered (vehicle ignition on), Do not proceed to protocol detection if voltage is below threshold
- **protocol_detection:** Use adapter auto-detect mode first; query PID support to trigger detection, Read the detected protocol identifier from the adapter after the query, If auto-detect fails, try protocols in likelihood order: CAN 11-bit 500k, CAN 11-bit 250k, J1850 PWM, CAN 29-bit 500k, CAN 29-bit 250k, J1850 VPW, ISO 9141-2, ISO 14230-4 5baud, ISO 14230-4 fast, J1939
- **operational:** All OBD queries must return a null/empty response if connection_status is not vehicle_connected, is_connected() must return true only when status is vehicle_connected, Closing the connection must release the serial port immediately and reset status to not_connected

## Outcomes

### No_port_found (Priority: 1) — Error: `OBD_NO_PORT_FOUND`

**Given:**
- no port is specified
- port enumeration finds no accessible serial ports

**Result:** Connection remains in not_connected state; caller receives an empty port list

### Port_access_denied (Priority: 2) — Error: `OBD_PORT_ACCESS_DENIED`

**Given:**
- a port is specified or discovered
- opening the port raises a permissions or hardware-busy error

**Result:** Connection remains in not_connected state

### Baud_negotiation_failed (Priority: 3) — Error: `OBD_BAUD_NEGOTIATION_FAILED`

**Given:**
- a serial port is accessible
- no baud rate in the negotiation sequence produces a valid adapter prompt

**Result:** Connection halts; adapter may be powered off or incompatible

### Adapter_init_failed (Priority: 4) — Error: `OBD_ADAPTER_INIT_FAILED`

**Given:**
- baud rate is established
- one or more adapter initialization commands do not return a success acknowledgement

**Result:** Connection halts at not_connected; adapter may be damaged or incompatible

### Low_voltage (Priority: 5) — Error: `OBD_LOW_VOLTAGE`

**Given:**
- adapter is initialized
- measured OBD-II socket voltage is below 6V

**Result:** Connection halts at adapter_connected; vehicle ignition is likely off

### Protocol_not_detected (Priority: 6) — Error: `OBD_PROTOCOL_NOT_DETECTED`

**Given:**
- OBD-II socket voltage is valid
- all protocol candidates fail to produce a valid ECU response

**Result:** Connection halts at socket_connected; vehicle may not support OBD-II or ignition is off

### Connection_closed (Priority: 9)

**Given:**
- connection is in any non-not_connected state
- caller requests close

**Then:**
- **transition_state** field: `connection_status` from: `vehicle_connected` to: `not_connected`
- **emit_event** event: `obd.connection.closed`

**Result:** Serial port is released and connection state resets to not_connected

### Connection_established (Priority: 10)

**Given:**
- a serial port is accessible
- baud rate negotiation succeeds
- all adapter initialization commands succeed
- OBD-II socket voltage is 6V or above
- a communication protocol is detected and confirmed with an ECU response

**Then:**
- **transition_state** field: `connection_status` from: `not_connected` to: `vehicle_connected`
- **emit_event** event: `obd.connection.established`

**Result:** System is in vehicle_connected state and ready to accept PID queries and diagnostic commands

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBD_NO_PORT_FOUND` | 503 | No diagnostic adapter port found. Ensure the adapter is plugged in. | No |
| `OBD_PORT_ACCESS_DENIED` | 403 | Could not open the specified port. It may be in use or require elevated permissions. | No |
| `OBD_BAUD_NEGOTIATION_FAILED` | 503 | Could not establish communication speed with the adapter. Check power and cable. | No |
| `OBD_ADAPTER_INIT_FAILED` | 503 | Adapter did not respond to initialization commands. It may be incompatible. | No |
| `OBD_LOW_VOLTAGE` | 503 | OBD-II socket voltage is too low. Turn on the vehicle ignition and retry. | No |
| `OBD_PROTOCOL_NOT_DETECTED` | 503 | Could not detect a supported OBD-II protocol. The vehicle may not be compatible. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `obd.connection.established` | Vehicle connection fully established; protocol confirmed and ECU is responding | `port`, `baud_rate`, `protocol`, `connection_status` |
| `obd.connection.closed` | Connection cleanly closed; serial port released | `port` |
| `obd.connection.error` | A connection-level error occurred during setup or operation | `error_code`, `port` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| obd-pid-reading | required | PID queries require an active vehicle_connected state |
| obd-dtc-diagnostics | required | DTC read/clear requires an active vehicle_connected state |
| obd-realtime-sensors | required | Sensor streaming requires an active vehicle_connected state |
| obd-vin-extraction | required | VIN reading requires an active vehicle_connected state |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/brendan-w/python-OBD
  project: python-OBD
  tech_stack: Python, pyserial, ELM327 adapter
  files_traced: 4
  entry_points:
    - obd/obd.py
    - obd/elm327.py
    - obd/utils.py
    - obd/__init__.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Obd Port Connection Blueprint",
  "description": "Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to est",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "obd, vehicle, diagnostics, serial, connection, discovery, adapter, protocol"
}
</script>
