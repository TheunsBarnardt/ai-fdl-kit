---
title: "Palm Vein Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching. 16 fields. 13 outcomes. 13 error code"
---

# Palm Vein Blueprint

> Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching

| | |
|---|---|
| **Feature** | `palm-vein` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | biometric, vein-pattern, hardware, sdk, authentication |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/palm-vein.blueprint.yaml) |
| **JSON API** | [palm-vein.json]({{ site.baseurl }}/api/blueprints/integration/palm-vein.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `host_application` | Host Application | system | The application that calls the SDK API to perform palm vein operations |
| `palm_scanner` | Biometric Scanning Hardware | external | Biometric scanner hardware that captures palm vein images |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `license_path` | text | Yes | License File Path | Validations: required |
| `auto_update_template` | boolean | Yes | Auto-Update Template |  |
| `logging_enabled` | boolean | Yes | SDK Logging |  |
| `firmware_version` | text | No | Firmware Version | Validations: maxLength |
| `serial_number` | text | No | Device Serial Number | Validations: maxLength |
| `palm_feature` | json | No | Palm Vein Feature Data |  |
| `palm_template` | json | No | Palm Vein Template |  |
| `palm_image` | json | No | Palm Vein Image |  |
| `timeout_seconds` | number | Yes | Operation Timeout | Validations: min, max |
| `image_masked` | boolean | Yes | Apply Blur to Callback Image |  |
| `led_color` | select | No | LED Color |  |
| `led_duration_ms` | number | No | LED Duration (ms) | Validations: oneOf |
| `match_index` | number | No | Matched Template Index |  |
| `template_count` | number | Yes | Number of Templates to Compare | Validations: min |
| `updated_template` | json | No | Updated Template |  |
| `palm_hand` | select | No | Palm Hand |  |

## States

**State field:** `device_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `uninitialized` | Yes |  |
| `initialized` |  |  |
| `device_open` |  |  |
| `idle` |  |  |
| `extracting` |  |  |
| `registering` |  |  |
| `device_closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `uninitialized` | `initialized` | host_application |  |
|  | `initialized` | `device_open` | host_application |  |
|  | `device_open` | `idle` | palm_scanner |  |
|  | `idle` | `extracting` | host_application |  |
|  | `idle` | `registering` | host_application |  |
|  | `extracting` | `idle` | palm_scanner |  |
|  | `registering` | `idle` | palm_scanner |  |
|  | `extracting` | `idle` | host_application | Operation cancelled via SD_API_Cancel |
|  | `registering` | `idle` | host_application | Operation cancelled via SD_API_Cancel |
|  | `idle` | `device_closed` | host_application |  |
|  | `device_closed` | `uninitialized` | host_application |  |

## Rules

- **initialization:**
  - **single_init:** SD_API_GetBufferSize and SD_API_Init must each be called exactly once at program start
  - **single_uninit:** SD_API_Uninit must be called exactly once at program end
  - **init_before_all:** All other API calls require successful initialization first
- **buffer_sizes:**
  - **precondition:** SD_API_GetBufferSize must be called before any feature/template/image operations to obtain correct buffer sizes
  - **outputs:** {"feature_size":"Size of palm vein feature data buffer"}, {"template_size":"Size of palm vein template buffer"}, {"image_size":"Size of palm vein image buffer"}, {"registration_count":"Number of palm captures required for registration (4)"}
- **device_management:**
  - **cancel_before_reopen:** If currently in registration or feature extraction, call SD_API_Cancel before opening or closing the device
  - **busy_check:** Device returns DEVBUSY error if a registration or extraction is already in progress
- **registration:**
  - **capture_count:** 4
  - **timeout_range:** -1 to 1000 seconds (-1 = no limit)
  - **template_storage:** Templates must be persisted in a database linked to user accounts
- **matching:**
  - **one_to_n:** SD_API_Match1VN compares one feature against N templates
  - **template_update:** On successful match, the updated template (pucUpdTmpl) should replace the old template to improve future accuracy
  - **auto_update:** When auto-update is enabled during init, SD_API_Match1VNEx automatically updates templates
- **led_control:**
  - **supported_durations:** 0, 1000
  - **off_command:** Pass LED_NULL to turn off LED
- **palm_positioning:**
  - **distance:** Hand must be approximately 15-30cm from device center
  - **centered:** Hand must be centered on the device
  - **fingers_spread:** Fingers must be spread naturally
- **security:**
  - **biometric_data_sensitive:** Feature data, templates, and images are biometric PII and must be treated as sensitive
  - **license_required:** A valid license file is required for SDK operation

## Outcomes

### Sdk_initialized (Priority: 1)

**Given:**
- SDK has not been initialized yet
- Valid license file exists at specified path

**Then:**
- **call_service** target: `SDPVD310API.SD_API_GetBufferSize` — Obtain feature, template, image sizes and registration count
- **call_service** target: `SDPVD310API.SD_API_Init` — Initialize SDK with license, auto-update, and logging settings
- **emit_event** event: `palm.sdk.initialized`

**Result:** SDK is initialized and ready for device operations

### Sdk_init_failed (Priority: 2) — Error: `PALM_INVALID_LICENSE`

**Given:**
- License file is missing or invalid

**Then:**
- **emit_event** event: `palm.sdk.init_failed`

**Result:** SDK initialization fails with license error

### Device_opened (Priority: 3)

**Given:**
- SDK is initialized
- No active registration or extraction in progress

**Then:**
- **call_service** target: `SDPVD310API.SD_API_OpenDev` — Open device and retrieve firmware version and serial number
- **set_field** target: `firmware_version` value: `returned by device`
- **set_field** target: `serial_number` value: `returned by device`
- **emit_event** event: `palm.device.opened`

**Result:** Device is connected and firmware/serial info is available

### Device_not_connected (Priority: 4) — Error: `PALM_DEVICE_NOT_CONNECTED`

**Given:**
- SDK is initialized
- `device_state` (system) neq `device_open`

**Then:**
- **emit_event** event: `palm.device.disconnected`

**Result:** Device is not connected — check USB connection and retry

### Feature_extracted (Priority: 5)

**Given:**
- Device is open and idle
- Buffer sizes have been obtained

**Then:**
- **call_service** target: `SDPVD310API.SD_API_ExtractFeature` — Capture palm vein image and extract biometric features with 30s timeout
- **set_field** target: `palm_feature` value: `extracted feature data`
- **set_field** target: `palm_image` value: `captured raw image data`
- **emit_event** event: `palm.feature.extracted`

**Result:** Palm vein feature and image data are captured and available for matching or storage

### Feature_extraction_failed (Priority: 6) — Error: `PALM_EXTRACTION_FAILED`

**Given:**
- Device is open and performing extraction
- ANY: Palm positioning is incorrect OR Image quality is poor OR Operation times out

**Then:**
- **emit_event** event: `palm.feature.extraction_failed`

**Result:** Feature extraction failed — user should reposition hand and try again

### Template_registered (Priority: 7) | Transaction: atomic

**Given:**
- Device is open and idle
- Buffer sizes have been obtained

**Then:**
- **call_service** target: `SDPVD310API.SD_API_Register` — Capture 4 palm images and fuse into a template with 30s timeout
- **set_field** target: `palm_template` value: `fused template data`
- **create_record** target: `palm_templates` — Store template in database linked to user account
- **emit_event** event: `palm.template.registered`

**Result:** Palm vein template is registered and stored for future matching

### Registration_failed (Priority: 8) — Error: `PALM_REGISTRATION_FAILED`

**Given:**
- Device is open and performing registration
- ANY: User moves hand during capture OR Image quality is poor OR Operation times out OR Feature fusion fails

**Then:**
- **emit_event** event: `palm.template.registration_failed`

**Result:** Registration failed — user should keep hand steady and try again

### Match_succeeded (Priority: 9) | Transaction: atomic

**Given:**
- Valid feature data is available (from extraction)
- One or more templates exist in the database

**Then:**
- **call_service** target: `SDPVD310API.SD_API_Match1VN` — Compare feature against N stored templates
- **set_field** target: `match_index` value: `index of matched template`
- **set_field** target: `updated_template` value: `updated template data from match` — Replace old template with updated version for improved accuracy
- **emit_event** event: `palm.match.succeeded`

**Result:** Palm vein matched against stored template — identity verified

### Match_failed (Priority: 10) — Error: `PALM_VERIFICATION_FAILED`

**Given:**
- Valid feature data is available
- Feature does not match any stored template

**Then:**
- **emit_event** event: `palm.match.failed`

**Result:** Palm vein does not match any registered template — verification failed

### Operation_cancelled (Priority: 11)

**Given:**
- ANY: Feature extraction is in progress OR Registration is in progress
- Cancel is requested

**Then:**
- **call_service** target: `SDPVD310API.SD_API_Cancel` — Cancel the current extraction or registration operation
- **emit_event** event: `palm.operation.cancelled`

**Result:** Current operation is cancelled and device returns to idle state

### Device_busy (Priority: 12) — Error: `PALM_DEVICE_BUSY`

**Given:**
- ANY: Feature extraction is in progress OR Registration is in progress
- A new operation is attempted

**Then:**
- **emit_event** event: `palm.device.busy`

**Result:** Device is busy — cancel the current operation before starting a new one

### Operation_timed_out (Priority: 13) — Error: `PALM_TIMEOUT`

**Given:**
- ANY: Feature extraction is in progress OR Registration is in progress
- `elapsed_time` (system) gt `timeout_seconds`

**Then:**
- **emit_event** event: `palm.operation.timeout`

**Result:** Operation timed out — user should try again

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PALM_INVALID_LICENSE` | 403 | Palm vein scanner license is invalid or missing | No |
| `PALM_DEVICE_NOT_CONNECTED` | 500 | Palm vein scanner is not connected | Yes |
| `PALM_DEVICE_BUSY` | 409 | Scanner is busy with another operation — please cancel or wait | Yes |
| `PALM_EXTRACTION_FAILED` | 422 | Could not capture palm vein features — please reposition your hand | Yes |
| `PALM_REGISTRATION_FAILED` | 422 | Palm vein registration failed — keep your hand steady and try again | Yes |
| `PALM_VERIFICATION_FAILED` | 401 | Palm vein does not match any registered pattern | No |
| `PALM_TIMEOUT` | 422 | Operation timed out — please try again | Yes |
| `PALM_HAND_POSITION_ERROR` | 422 | Please position your hand 15-30cm from the scanner center with fingers spread naturally | Yes |
| `PALM_IMAGE_QUALITY_POOR` | 422 | Image quality is too low — please try again in better conditions | Yes |
| `PALM_COMMUNICATION_FAILED` | 500 | Communication with palm vein scanner failed | Yes |
| `PALM_MISSING_LIBRARY` | 500 | Required SDK library is missing | No |
| `PALM_PARAMETER_ERROR` | 400 | Invalid parameter passed to scanner operation | No |
| `PALM_INSUFFICIENT_MEMORY` | 500 | Insufficient memory for scanner operation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `palm.sdk.initialized` | SDK initialized successfully — buffer sizes available | `feature_size`, `template_size`, `image_size`, `registration_count` |
| `palm.sdk.init_failed` | SDK initialization failed | `error_code` |
| `palm.device.opened` | Scanner device opened — firmware and serial number obtained | `firmware_version`, `serial_number` |
| `palm.device.disconnected` | Scanner device is not connected or was disconnected | `error_code` |
| `palm.feature.extracted` | Palm vein feature data extracted from a single scan | `feature_size` |
| `palm.feature.extraction_failed` | Feature extraction failed due to positioning, quality, or timeout | `error_code` |
| `palm.template.registered` | Palm vein template registered (4 images fused) and stored | `user_id`, `template_size` |
| `palm.template.registration_failed` | Template registration failed — includes the stage at which failure occurred | `error_code`, `stage` |
| `palm.match.succeeded` | Feature matched against a stored template — identity verified | `user_id`, `match_index` |
| `palm.match.failed` | Feature did not match any stored template | `error_code` |
| `palm.operation.cancelled` | Active extraction or registration operation was cancelled |  |
| `palm.operation.timeout` | Operation exceeded the configured timeout duration | `operation_type`, `timeout_seconds` |
| `palm.device.busy` | Attempted operation while device was busy with another task | `error_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| biometric-auth | recommended | Biometric-auth uses the palm vein SDK to provide alternative authentication |

## AGI Readiness

### Goals

#### Reliable Palm Vein

Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| sdk_initialized | `autonomous` | - | - |
| sdk_init_failed | `autonomous` | - | - |
| device_opened | `autonomous` | - | - |
| device_not_connected | `autonomous` | - | - |
| feature_extracted | `autonomous` | - | - |
| feature_extraction_failed | `autonomous` | - | - |
| template_registered | `autonomous` | - | - |
| registration_failed | `autonomous` | - | - |
| match_succeeded | `autonomous` | - | - |
| match_failed | `autonomous` | - | - |
| operation_cancelled | `supervised` | - | - |
| device_busy | `autonomous` | - | - |
| operation_timed_out | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
sdk:
  library: SDPVD310API
  platforms:
    windows: SDPVD310API.dll
    linux: SDPVD310API.so
  languages:
    - c
    - cpp
    - java
    - jni
    - csharp
  supported_os:
    windows:
      - xp
      - "7"
      - "8"
      - "10"
      - server
    linux:
      - debian
      - redhat
  supported_arch:
    windows:
      - x86
      - x86_64
    linux:
      - x86
      - x86_64
      - mips64el
      - aarch64
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Palm Vein Blueprint",
  "description": "Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching. 16 fields. 13 outcomes. 13 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "biometric, vein-pattern, hardware, sdk, authentication"
}
</script>
