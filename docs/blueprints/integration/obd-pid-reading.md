---
title: "Obd Pid Reading Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID"
---

# Obd Pid Reading Blueprint

> Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID support per vehicle

| | |
|---|---|
| **Feature** | `obd-pid-reading` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | obd, vehicle, diagnostics, pid, sensor, ecu, decoding, protocol |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/obd-pid-reading.blueprint.yaml) |
| **JSON API** | [obd-pid-reading.json]({{ site.baseurl }}/api/blueprints/integration/obd-pid-reading.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | Diagnostic System | system | The application building and dispatching PID query commands to the vehicle |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_mode` | number | Yes | OBD-II Service Mode |  |
| `pid_code` | text | Yes | PID Hex Code |  |
| `expected_bytes` | number | No | Expected Response Byte Count |  |
| `ecu_target` | select | No | ECU Target |  |
| `response_value` | json | No | Decoded Response Value |  |
| `is_supported` | boolean | No | PID Supported by Vehicle |  |
| `force_query` | boolean | No | Force Query Even If Unsupported |  |

## Rules

- **support_discovery:** At connection time, query PID support listing commands (mode 1, PIDs 0x00/0x20/0x40/0x60/0x80/0xA0/0xC0) to build the vehicle's supported PID set, Cache the supported PID set for the lifetime of the connection; do not re-query on each command, Mode 6 (monitor data) is only valid on CAN protocols; flag it as unsupported on non-CAN connections
- **query_execution:** Set the ECU target header on the adapter before each query when targeting a specific ECU, Append an optional frame-count digit to PID commands for early response termination when the adapter supports it, Flush the receive buffer before sending each command to discard stale data, Append a carriage return to every command byte sequence before transmission, Read the response until the adapter prompt character is received or the timeout expires
- **response_parsing:** Strip null bytes and normalize line endings from raw adapter output, Split response into frames; each frame identifies its source ECU via the header, Filter frames by ECU target bitmask to exclude responses from unintended ECUs, Constrain data bytes to the expected length for the PID; discard extra bytes, Pass constrained bytes to the PID-specific decoder function
- **return_values:** All numeric sensor values must be returned with their physical unit (RPM, km/h, °C, %, g/s, kPa, V, etc.), A null/empty response must be distinguishable from a zero-value response, If the decoder raises an error, return a null response rather than propagating the exception
- **unsupported_handling:** Do not transmit a PID command if the vehicle has not advertised support for it, unless force_query is true, Return a null response immediately for unsupported PIDs

## Outcomes

### Not_connected (Priority: 1) — Error: `OBD_NOT_CONNECTED`

**Given:**
- vehicle connection is not in vehicle_connected state

**Result:** Returns a null response immediately without transmitting any command

### Pid_not_supported (Priority: 2) — Error: `OBD_PID_NOT_SUPPORTED`

**Given:**
- vehicle is connected
- requested PID is not in the vehicle's advertised support set
- force_query is false

**Then:**
- **emit_event** event: `obd.pid.unsupported`

**Result:** Returns a null response; no command is transmitted to the vehicle

### No_response (Priority: 3) — Error: `OBD_NO_RESPONSE`

**Given:**
- vehicle is connected
- PID is supported or force_query is true
- adapter sends the command but no ECU response arrives before timeout

**Result:** Returns a null response; caller may retry the query

### No_matching_ecu (Priority: 4) — Error: `OBD_NO_MATCHING_ECU`

**Given:**
- vehicle is connected
- ECU response frames are received
- no frame matches the target ECU filter

**Result:** Returns a null response; the targeted ECU did not reply

### Decode_error (Priority: 5) — Error: `OBD_DECODE_ERROR`

**Given:**
- a response is received from the target ECU
- the decoder cannot interpret the response bytes

**Result:** Returns a null response; raw bytes are logged for diagnostics

### Successful_query (Priority: 10)

**Given:**
- vehicle is in vehicle_connected state
- PID is supported or force_query is true
- ECU responds within timeout
- at least one response frame matches the ECU target
- decoder produces a valid typed value

**Then:**
- **emit_event** event: `obd.pid.response`

**Result:** Returns decoded value with physical unit; caller receives a non-null response object

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBD_NOT_CONNECTED` | 503 | No active vehicle connection. Connect before querying. | No |
| `OBD_PID_NOT_SUPPORTED` | 422 | This vehicle does not support the requested parameter. | No |
| `OBD_NO_RESPONSE` | 503 | The vehicle did not respond to the query. Check the connection and retry. | No |
| `OBD_NO_MATCHING_ECU` | 404 | No response from the targeted ECU. It may not be present in this vehicle. | No |
| `OBD_DECODE_ERROR` | 422 | The vehicle returned data that could not be decoded for this parameter. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `obd.pid.response` | A PID was queried and a decoded value was received from the ECU | `service_mode`, `pid_code`, `response_value`, `ecu_target` |
| `obd.pid.unsupported` | A query was skipped because the vehicle does not advertise support for the PID | `service_mode`, `pid_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| obd-port-connection | required | Active vehicle_connected state must exist before PID queries are possible |
| obd-realtime-sensors | required | Real-time sensor readings use this PID query infrastructure |
| obd-dtc-diagnostics | required | DTC read (mode 3) and clear (mode 4) are implemented as PID-layer commands |
| obd-vin-extraction | optional | VIN reads via mode 9 PID query |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/brendan-w/python-OBD
  project: python-OBD
  tech_stack: Python, pyserial, ELM327 adapter
  files_traced: 4
  entry_points:
    - obd/commands.py
    - obd/OBDCommand.py
    - obd/decoders.py
    - obd/obd.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Obd Pid Reading Blueprint",
  "description": "Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "obd, vehicle, diagnostics, pid, sensor, ecu, decoding, protocol"
}
</script>
