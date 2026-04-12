---
title: "Obd Realtime Sensors Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callb"
---

# Obd Realtime Sensors Blueprint

> Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callback-driven updates

| | |
|---|---|
| **Feature** | `obd-realtime-sensors` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | obd, vehicle, sensors, realtime, rpm, speed, temperature, maf, throttle, fuel, streaming |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/obd-realtime-sensors.blueprint.yaml) |
| **JSON API** | [obd-realtime-sensors.json]({{ site.baseurl }}/api/blueprints/integration/obd-realtime-sensors.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | Diagnostic System | system | Background polling loop that queries registered sensors and dispatches value-change callbacks |
| `consumer` | Data Consumer | system | Application or UI layer receiving sensor updates via callbacks or direct queries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `engine_rpm` | number | No | Engine RPM |  |
| `vehicle_speed` | number | No | Vehicle Speed (km/h) |  |
| `coolant_temp` | number | No | Engine Coolant Temperature (°C) |  |
| `throttle_position` | number | No | Absolute Throttle Position (%) |  |
| `maf_rate` | number | No | Mass Air Flow Rate (g/s) |  |
| `fuel_level` | number | No | Fuel Tank Level (%) |  |
| `poll_interval_ms` | number | No | Poll Interval (milliseconds) |  |
| `watched_sensors` | json | No | Registered Sensor Identifiers |  |
| `streaming_state` | select | No | Streaming State |  |

## States

**State field:** `streaming_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `streaming` |  |  |
| `paused` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `streaming` | system |  |
|  | `streaming` | `paused` | system |  |
|  | `paused` | `streaming` | system |  |
|  | `streaming` | `idle` | system |  |
|  | `paused` | `idle` | system |  |

## Rules

- **sensor_support:** Only query sensors that the vehicle advertises as supported via the PID support listing, Skip unsupported sensors silently during streaming; return null on direct query, Support is cached at connection time; do not re-query the support listing on each poll cycle
- **decoding:** RPM: two bytes — formula ((high × 256) + low) ÷ 4 — returns value in RPM, Speed: one byte — raw value equals speed in km/h — returns value in km/h, Coolant temperature: one byte — subtract 40 to get °C — range -40 to +215 °C, Throttle position: one byte — (raw ÷ 255) × 100 — returns percentage 0–100, MAF rate: two bytes — formula ((high × 256) + low) ÷ 100 — returns value in g/s, Fuel level: one byte — (raw ÷ 255) × 100 — returns percentage 0–100, All returned values carry explicit physical units; consumers must not assume a unit
- **streaming:** The polling loop must run in a separate thread or async task; it must not block the caller, Introduce a configurable delay between query cycles to avoid saturating the OBD-II bus, Invoke registered callbacks only when a sensor value changes from the previous poll, Multiple callbacks may be registered per sensor; invoke all of them in order, Sensor registration and deregistration are safe to call while streaming is active, A paused loop retains all registered sensors and callbacks
- **direct_query:** Any sensor may be queried on demand without starting the streaming loop, Direct queries follow the same support check and decoding rules as streaming

## Outcomes

### Sensor_not_supported (Priority: 1) — Error: `OBD_SENSOR_NOT_SUPPORTED`

**Given:**
- the requested sensor PID is not in the vehicle's advertised support set

**Then:**
- **emit_event** event: `obd.sensor.unsupported`

**Result:** Returns a null response; sensor is excluded from streaming without error

### Not_connected (Priority: 2) — Error: `OBD_NOT_CONNECTED`

**Given:**
- vehicle connection is not in vehicle_connected state

**Then:**
- **transition_state** field: `streaming_state` from: `streaming` to: `idle`

**Result:** Active streaming loop stops; all pending sensor queries return null

### Direct_query_success (Priority: 5)

**Given:**
- vehicle is connected
- sensor PID is supported by the vehicle
- caller requests a single on-demand reading

**Then:**
- **emit_event** event: `obd.sensor.reading`

**Result:** Returns the decoded sensor value with its physical unit to the caller

### Streaming_started (Priority: 6)

**Given:**
- vehicle is connected
- at least one sensor is registered for watching
- streaming_state is idle

**Then:**
- **transition_state** field: `streaming_state` from: `idle` to: `streaming`
- **emit_event** event: `obd.streaming.started`

**Result:** Background polling loop starts; all registered sensors are queried on each cycle

### Sensor_value_changed (Priority: 7)

**Given:**
- streaming_state is streaming
- a polled sensor returns a value different from the previous poll

**Then:**
- **emit_event** event: `obd.sensor.changed`

**Result:** All callbacks registered for this sensor are invoked with the new value

### Streaming_paused (Priority: 8)

**Given:**
- streaming_state is streaming
- caller requests a temporary pause

**Then:**
- **transition_state** field: `streaming_state` from: `streaming` to: `paused`
- **emit_event** event: `obd.streaming.paused`

**Result:** Polling loop suspends; registered sensors and callbacks are retained

### Streaming_stopped (Priority: 9)

**Given:**
- streaming_state is streaming or paused
- caller stops the loop or deregisters all sensors

**Then:**
- **transition_state** field: `streaming_state` from: `streaming` to: `idle`
- **emit_event** event: `obd.streaming.stopped`

**Result:** Background polling loop terminates; no further callbacks are invoked

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBD_SENSOR_NOT_SUPPORTED` | 422 | This vehicle does not support the requested sensor. | No |
| `OBD_NOT_CONNECTED` | 503 | No active vehicle connection. Connect before reading sensors. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `obd.sensor.reading` | A single on-demand sensor query returned a decoded value | `sensor_name`, `sensor_value`, `sensor_unit`, `timestamp` |
| `obd.sensor.changed` | A streaming sensor value changed from the previous poll cycle | `sensor_name`, `sensor_value`, `previous_value`, `sensor_unit`, `timestamp` |
| `obd.sensor.unsupported` | A query or registration was attempted for a sensor the vehicle does not support | `sensor_name` |
| `obd.streaming.started` | Continuous sensor polling loop has started | `watched_sensors`, `poll_interval_ms` |
| `obd.streaming.paused` | Sensor polling loop has been temporarily suspended | `watched_sensors` |
| `obd.streaming.stopped` | Sensor polling loop has terminated | `watched_sensors` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| obd-port-connection | required | Active vehicle_connected state required for all sensor queries |
| obd-pid-reading | required | Each sensor reading is a PID query dispatched through the PID reading layer |

## AGI Readiness

### Goals

#### Reliable Obd Realtime Sensors

Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callback-driven updates

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `obd_port_connection` | obd-port-connection | degrade |
| `obd_pid_reading` | obd-pid-reading | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| sensor_not_supported | `autonomous` | - | - |
| not_connected | `autonomous` | - | - |
| direct_query_success | `autonomous` | - | - |
| streaming_started | `autonomous` | - | - |
| sensor_value_changed | `supervised` | - | - |
| streaming_paused | `autonomous` | - | - |
| streaming_stopped | `autonomous` | - | - |

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
    - obd/decoders.py
    - obd/asynchronous.py
    - obd/UnitsAndScaling.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Obd Realtime Sensors Blueprint",
  "description": "Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callb",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "obd, vehicle, sensors, realtime, rpm, speed, temperature, maf, throttle, fuel, streaming"
}
</script>
