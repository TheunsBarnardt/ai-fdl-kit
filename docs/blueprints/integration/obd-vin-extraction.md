---
title: "Obd Vin Extraction Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Read and decode the Vehicle Identification Number (VIN) from the vehicle ECU using OBD-II mode 9 service, stripping frame padding to produce a validated 17-char"
---

# Obd Vin Extraction Blueprint

> Read and decode the Vehicle Identification Number (VIN) from the vehicle ECU using OBD-II mode 9 service, stripping frame padding to produce a validated 17-character ISO 3779 string

| | |
|---|---|
| **Feature** | `obd-vin-extraction` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | obd, vehicle, vin, identification, mode9, vehicle-info |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/obd-vin-extraction.blueprint.yaml) |
| **JSON API** | [obd-vin-extraction.json]({{ site.baseurl }}/api/blueprints/integration/obd-vin-extraction.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | Diagnostic System | system | System querying, assembling, and validating the VIN from ECU response frames |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vin` | text | No | Vehicle Identification Number | Validations: pattern |
| `wmi` | text | No | World Manufacturer Identifier |  |
| `vds` | text | No | Vehicle Descriptor Section |  |
| `vis` | text | No | Vehicle Identifier Section |  |

## Rules

- **protocol:** VIN is read via OBD-II mode 9 (vehicle information service), PID 0x02, Before reading the VIN, query mode 9 PID 0x01 (VIN message count) to determine frame count, The adapter reassembles multi-frame responses transparently; no manual frame sequencing is required, VIN is read-only; it cannot be written or modified via OBD-II
- **decoding:** The mode byte prefix in the ECU response is not part of the VIN data and must be discarded, Strip leading and trailing null padding bytes (0x00, 0x01, 0x02) from the assembled response, The result must be exactly 17 characters; reject anything shorter, VIN characters are ASCII-encoded; non-ASCII bytes in the response indicate a malformed reply, VIN segments: characters 1–3 = WMI (manufacturer), 4–9 = VDS (descriptor), 10–17 = VIS (identifier)
- **validation:** A valid VIN contains only uppercase letters (excluding I, O, Q) and digits 0–9 per ISO 3779, Do not return a partial or padded VIN; return null if the character count is not exactly 17

## Outcomes

### Not_connected (Priority: 1) — Error: `OBD_NOT_CONNECTED`

**Given:**
- vehicle connection is not in vehicle_connected state

**Result:** Returns null; no query is transmitted

### Vin_not_supported (Priority: 2) — Error: `OBD_VIN_NOT_SUPPORTED`

**Given:**
- vehicle is connected
- vehicle does not advertise support for mode 9 VIN service

**Result:** Returns null; this vehicle model does not expose a VIN via OBD-II

### No_response (Priority: 3) — Error: `OBD_NO_RESPONSE`

**Given:**
- vehicle is connected
- mode 9 VIN is advertised as supported
- ECU does not respond within the timeout period

**Result:** Returns null; caller may retry

### Vin_too_short (Priority: 4) — Error: `OBD_VIN_INVALID`

**Given:**
- ECU responds to the VIN query
- decoded string after stripping padding is fewer than 17 characters

**Result:** Returns null; the ECU response is malformed or incomplete

### Vin_read_successful (Priority: 10)

**Given:**
- vehicle is connected
- mode 9 VIN service is advertised as supported
- ECU responds within timeout
- decoded string after stripping padding is exactly 17 characters

**Then:**
- **emit_event** event: `obd.vin.read`

**Result:** Returns the validated 17-character VIN string with WMI, VDS, and VIS segments

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OBD_NOT_CONNECTED` | 503 | No active vehicle connection. Connect before reading the VIN. | No |
| `OBD_VIN_NOT_SUPPORTED` | 422 | This vehicle does not expose a VIN via OBD-II. | No |
| `OBD_NO_RESPONSE` | 503 | The vehicle did not respond to the VIN request. Check the connection and retry. | No |
| `OBD_VIN_INVALID` | 422 | The vehicle returned an invalid or incomplete VIN. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `obd.vin.read` | VIN was successfully read and decoded from the vehicle ECU | `vin`, `wmi`, `vds`, `vis` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| obd-port-connection | required | Active vehicle_connected state required to issue mode 9 queries |
| obd-pid-reading | required | VIN extraction uses the PID query infrastructure (mode 9, PID 0x02) |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/brendan-w/python-OBD
  project: python-OBD
  tech_stack: Python, pyserial, ELM327 adapter
  files_traced: 2
  entry_points:
    - obd/commands.py
    - obd/decoders.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Obd Vin Extraction Blueprint",
  "description": "Read and decode the Vehicle Identification Number (VIN) from the vehicle ECU using OBD-II mode 9 service, stripping frame padding to produce a validated 17-char",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "obd, vehicle, vin, identification, mode9, vehicle-info"
}
</script>
