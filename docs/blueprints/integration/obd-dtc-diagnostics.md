---
title: "Obd Dtc Diagnostics Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Read, decode, and clear Diagnostic Trouble Codes (DTCs) from vehicle ECUs; report MIL (malfunction indicator lamp) status, DTC count, and human-readable fault d"
---

# Obd Dtc Diagnostics Blueprint

> Read, decode, and clear Diagnostic Trouble Codes (DTCs) from vehicle ECUs; report MIL (malfunction indicator lamp) status, DTC count, and human-readable fault descriptions

| | |
|---|---|
| **Feature** | `obd-dtc-diagnostics` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | obd, vehicle, diagnostics, dtc, fault, mil, check-engine, mode3, mode4 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/obd-dtc-diagnostics.blueprint.yaml) |
| **JSON API** | [obd-dtc-diagnostics.json]({{ site.baseurl }}/api/blueprints/integration/obd-dtc-diagnostics.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `technician` | Technician or Vehicle Owner | human | Person requesting retrieval or clearance of stored fault codes |
| `system` | Diagnostic System | system | System translating raw OBD responses into decoded fault information |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `dtc_codes` | json | No | Stored DTC List |  |
| `dtc_code` | text | No | DTC Code String |  |
| `dtc_type` | select | No | DTC Category |  |
| `dtc_description` | text | No | Fault Description |  |
| `mil_active` | boolean | No | MIL Active (Check Engine Light) |  |
| `dtc_count` | number | No | Stored DTC Count |  |
| `ignition_type` | select | No | Engine Ignition Type |  |

## Rules

- **dtc_encoding:** DTCs are transmitted as 2-byte pairs; zero-value pairs (0x0000) are padding and must be ignored, Bits 7–6 of the first byte encode the DTC type: 00=P (Powertrain), 01=C (Chassis), 10=B (Body), 11=U (Network), Bits 5–4 of the first byte form the first decimal digit of the sub-code (0–3), The remaining 12 bits (second byte + lower nibble of first byte) form three hex digits, Concatenate type letter + first digit + three hex digits to produce the code string (e.g. P0100)
- **dtc_lookup:** Match the decoded code string against the standardized DTC description table, If no description is found for a code, return the code with an empty or 'Unknown' description, Descriptions must be user-safe and must not include internal system references
- **reading:** Use OBD-II mode 3 (0x03) to retrieve stored DTCs from all responding ECUs, Iterate response in 2-byte steps; stop at end of data or on the first zero-value pair, Use mode 1 PID 0x01 (vehicle status) to read MIL flag, DTC count, and ignition type independently, DTC reads are non-destructive; reading does not clear or modify stored codes
- **clearing:** Use OBD-II mode 4 (0x04) to clear all stored DTCs and freeze frame data simultaneously, Clearing affects all ECUs that respond to the broadcast; selective clearing per ECU is not standard, After clearing, re-query to confirm codes are removed; the MIL resets only if no recurring faults exist, Clearing is irreversible within the current ignition cycle; warn the caller before proceeding

## Outcomes

### Not_connected (Priority: 1) — Error: `OBD_NOT_CONNECTED`

**Given:**
- vehicle connection is not in vehicle_connected state

**Result:** Returns null; no DTC query or clear command is transmitted

### No_dtcs_stored (Priority: 5)

**Given:**
- vehicle is connected
- mode 3 query returns only zero-value padding pairs or an empty response

**Then:**
- **emit_event** event: `obd.dtc.read`

**Result:** Returns an empty DTC list; MIL is off and no faults are active

### Dtcs_found (Priority: 6)

**Given:**
- vehicle is connected
- mode 3 query returns one or more non-zero DTC byte pairs

**Then:**
- **emit_event** event: `obd.dtc.read`

**Result:** Returns list of decoded DTC objects with code strings and human-readable descriptions; MIL is typically active

### Dtcs_cleared (Priority: 7)

**Given:**
- vehicle is connected
- caller explicitly requests a DTC clear operation

**Then:**
- **emit_event** event: `obd.dtc.cleared`

**Result:** All stored DTCs and freeze frame data are erased from all ECUs; MIL resets if no recurring faults remain

### Status_read (Priority: 8)

**Given:**
- vehicle is connected
- caller requests MIL status and DTC count (mode 1 PID 0x01)

**Then:**
- **emit_event** event: `obd.status.read`

**Result:** Returns MIL on/off state, count of stored codes, and engine ignition type

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBD_NOT_CONNECTED` | 503 | No active vehicle connection. Connect before reading diagnostics. | No |
| `OBD_DTC_READ_FAILED` | 503 | Could not retrieve fault codes from the vehicle. Check the connection. | No |
| `OBD_DTC_CLEAR_FAILED` | 500 | Could not clear fault codes. Ensure the vehicle ignition is on and retry. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `obd.dtc.read` | Diagnostic trouble codes were retrieved and decoded from the vehicle | `dtc_codes`, `dtc_count`, `mil_active` |
| `obd.dtc.cleared` | All stored DTCs and freeze frame data were erased from the vehicle ECUs | `mil_active`, `timestamp` |
| `obd.status.read` | Vehicle OBD status was read including MIL state, DTC count, and ignition type | `mil_active`, `dtc_count`, `ignition_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| obd-port-connection | required | Active vehicle_connected state required for all DTC operations |
| obd-pid-reading | required | DTC queries and status reads are dispatched via the PID query infrastructure |

## AGI Readiness

### Goals

#### Reliable Obd Dtc Diagnostics

Read, decode, and clear Diagnostic Trouble Codes (DTCs) from vehicle ECUs; report MIL (malfunction indicator lamp) status, DTC count, and human-readable fault descriptions

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

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
| not_connected | `autonomous` | - | - |
| no_dtcs_stored | `autonomous` | - | - |
| dtcs_found | `autonomous` | - | - |
| dtcs_cleared | `autonomous` | - | - |
| status_read | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/brendan-w/python-OBD
  project: python-OBD
  tech_stack: Python, pyserial, ELM327 adapter
  files_traced: 3
  entry_points:
    - obd/commands.py
    - obd/decoders.py
    - obd/codes.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Obd Dtc Diagnostics Blueprint",
  "description": "Read, decode, and clear Diagnostic Trouble Codes (DTCs) from vehicle ECUs; report MIL (malfunction indicator lamp) status, DTC count, and human-readable fault d",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "obd, vehicle, diagnostics, dtc, fault, mil, check-engine, mode3, mode4"
}
</script>
