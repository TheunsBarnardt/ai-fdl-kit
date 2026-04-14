---
title: "Palm Vein Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management. 17 fields. 14 outcom"
---

# Palm Vein Blueprint

> USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management

| | |
|---|---|
| **Feature** | `palm-vein` |
| **Category** | Integration |
| **Version** | 2.0.0 |
| **Tags** | biometric, vein-pattern, hardware, sdk, usb, android |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/palm-vein.blueprint.yaml) |
| **JSON API** | [palm-vein.json]({{ site.baseurl }}/api/blueprints/integration/palm-vein.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `host_application` | Host Application | system | Android terminal app that calls the SDK API to perform palm vein operations |
| `palm_scanner` | PVM310 Biometric Scanner | external | USB-connected palm vein scanning hardware (vendor-id 31109, product-id 4097) |
| `usb_manager` | USB Permission Manager | system | Android USB host permission handler (PalmUSBManager) in the Application class |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `license_path` | text | Yes | License File Path | Validations: required |
| `chip_type` | text | Yes | Target Chip Platform |  |
| `proximity_intensity_max` | number | Yes | Proximity Intensity Threshold | Validations: min, max |
| `firmware_version` | text | No | Firmware Version |  |
| `serial_number` | text | No | Device Serial Number |  |
| `usb_vendor_id` | number | Yes | USB Vendor ID |  |
| `usb_product_id` | number | Yes | USB Product ID |  |
| `palm_template` | json | No | Palm Vein Template |  |
| `palm_token` | text | No | Palm Cache Token |  |
| `palm_roi_image` | json | No | Palm ROI Image |  |
| `palm_raw_image` | json | No | Palm Raw Image |  |
| `palm_hand` | select | No | Enrolled Hand |  |
| `timeout_seconds` | number | Yes | Operation Timeout | Validations: min, max |
| `image_masked` | boolean | Yes | Apply Mask to Display Image |  |
| `led_color` | select | No | LED Color |  |
| `led_duration_ms` | number | No | LED Duration (ms) |  |
| `cache_pool_count` | number | No | Palms in Cache Pool |  |

## States

**State field:** `device_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `uninitialized` | Yes |  |
| `cache_pool_ready` |  |  |
| `service_ready` |  |  |
| `usb_waiting` |  |  |
| `device_open` |  |  |
| `idle` |  |  |
| `capturing` |  |  |
| `enrolling` |  |  |
| `identifying` |  |  |
| `device_closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `uninitialized` | `cache_pool_ready` | host_application |  |
|  | `cache_pool_ready` | `service_ready` | host_application |  |
|  | `service_ready` | `usb_waiting` | usb_manager |  |
|  | `usb_waiting` | `device_open` | usb_manager |  |
|  | `device_open` | `idle` | host_application |  |
|  | `idle` | `capturing` | host_application |  |
|  | `capturing` | `enrolling` | host_application |  |
|  | `capturing` | `identifying` | host_application |  |
|  | `enrolling` | `idle` | palm_scanner |  |
|  | `identifying` | `idle` | palm_scanner |  |
|  | `capturing` | `idle` | host_application |  |
|  | `idle` | `device_closed` | host_application |  |
|  | `device_open` | `device_closed` | usb_manager |  |

## Rules

- **sdk_singleton:**
  - **api_access:** SDPVUnifiedAPI.getInstance() returns the singleton — all operations go through this instance
  - **thread_safety:** captureImage(), detectRoi(), enroll(), identifyFeature() must run on background threads — never on the main thread
- **initialization_sequence:**
  - **order:** initCachePool → initService → initModel → (USB permission) → initDevice
  - **cache_pool_first:** initCachePool is time-consuming and must complete before any other SDK call
  - **chip_type:** ChipType.RK3568 is required for the PVM310 terminal hardware
  - **license_copy:** License file must exist at /sdcard/SD_TEMPLATE/LICENSE/license.dat — app copies from res/raw/license.dat on first launch
  - **model_after_service:** initModel() must be called after initService() to load the deep learning algorithm
- **usb_permission:**
  - **handler:** PalmUSBManager created in Application.onCreate() handles USB attach/detach/permission
  - **auto_request:** USB permission is requested automatically when PalmUSBManager detects the device
  - **callback:** onCheckPermission(0) means granted — then call initDevice(context)
  - **removal:** onUSBRemoved() fires when device is unplugged — call terminateDevice()
  - **device_filter:** USB device filter: vendor-id=31109, product-id=4097
- **image_capture:**
  - **loop_pattern:** DeviceTookImage thread calls captureImage() in a continuous loop
  - **success:** RETURN_DEVICE_SUCCESS means palm detected — check proximity_intensity before using
  - **no_trigger:** RETURN_DEVICE_ERROR_DEVICE_NOT_TRIGGERED means no palm detected — keep looping
  - **proximity_check:** If proximity_intensity > 500, palm is too close — warn user
  - **camera_dimensions:** Raw image is 400×640 pixels
  - **frame_queue:** Captured frames go into a bounded queue for the detect thread
- **roi_detection:**
  - **method:** detectRoi(rawImage) extracts the palm vein region of interest
  - **success:** RETURN_SERVICE_SUCCESS means valid ROI — imageRoi can be used for enroll/identify
  - **failure:** Non-success means palm not properly positioned — discard frame and retry
  - **mask_display:** maskImage(rawImage) blurs the image for privacy display to the user
- **enrollment:**
  - **listener:** setEnrollListener(PalmEnroll) must be called before starting enrollment
  - **flow:** captureImage loop → detectRoi → enroll(EnrollPicture(roiImage, rawImage)) — repeat until enrollComplete
  - **feature_count:** SDPVServiceConstant.FEATURE_NUM captures required (typically 5-6 valid frames)
  - **callbacks:**
    - **complete:** enrollComplete(EnrollResult) — template in result.getTmpl()
    - **fail:** enrollFail(UnifiedMsg) — enrollment failed, user should retry
    - **progress:** enrollTimes(count) — number of successful captures so far
  - **insert_after:** After enrollComplete, call insertPalm(template) to add to cache pool
  - **token_returned:** insertPalm returns a token string for cache management
  - **custom_token:** insertPalm(template, userId) allows custom token for user-linked identification
- **identification:**
  - **method:** identifyFeature(roiImage, callback) compares against the internal cache pool
  - **callback:** Callback receives (code, message, palmToken) — code == RETURN_SERVICE_SUCCESS means match found
  - **token_resolution:** palmToken from callback maps to the token used in insertPalm — resolves to user_id
  - **led_feedback:** Green LED on success (lightLed(LED_GREEN, 1000)), red on failure (lightLed(LED_RED, 1000))
- **cache_management:**
  - **insert:** insertPalm(template) or insertPalm(template, token) adds to cache pool
  - **remove:** removePalm(token) removes a specific template
  - **clear:** clearCachePool() removes all templates
  - **count:** palmsCount returns the number of templates in the cache
  - **persistence:** Cache pool data stored under /sdcard/SD_TEMPLATE/HANDS_TEMPLATE/
- **led_control:**
  - **method:** lightLed(LEDColor, durationMs) — LEDColor.LED_RED, LED_GREEN, LED_BLUE
  - **duration:** Duration in milliseconds (e.g., 1000 for 1 second flash)
- **palm_positioning:**
  - **distance:** Hand must be approximately 15-30cm from the scanner
  - **proximity_warning:** proximity_intensity > 500 means too close — display warning to user
  - **centered:** Hand must be centered on the scanner
  - **fingers_spread:** Fingers should be spread naturally
- **security:**
  - **biometric_data_sensitive:** Templates, ROI images, and raw images are biometric PII — encrypt at rest
  - **template_never_transmitted:** Templates stay on-device — only tokens transmitted to backend
  - **license_required:** Valid license.dat required for initService()
- **storage_paths:**
  - **root:** /sdcard/SD_TEMPLATE/
  - **license:** /sdcard/SD_TEMPLATE/LICENSE/license.dat
  - **templates:** /sdcard/SD_TEMPLATE/HANDS_TEMPLATE/
  - **images:** /sdcard/SD_TEMPLATE/PALM_IMG/

## Outcomes

### Cache_pool_initialized (Priority: 1)

**Given:**
- App has started
- Cache pool has not been initialized yet

**Then:**
- **call_service** target: `SDPVUnifiedAPI.initCachePool` — Initialize cache pool with context and ChipType.RK3568
- **emit_event** event: `palm.cache_pool.initialized`

**Result:** Cache pool initialized — template storage ready

### Service_initialized (Priority: 2)

**Given:**
- Cache pool is initialized
- License file exists at configured path

**Then:**
- **call_service** target: `SDPVUnifiedAPI.initService` — Initialize service with license file path
- **call_service** target: `SDPVUnifiedAPI.initModel` — Load the deep learning model for palm vein recognition
- **emit_event** event: `palm.service.initialized`

**Result:** Algorithm service and model loaded — ready for USB device

### Service_init_failed (Priority: 3) — Error: `PALM_INVALID_LICENSE`

**Given:**
- License file is missing or invalid

**Then:**
- **emit_event** event: `palm.sdk.init_failed`

**Result:** Service initialization fails — check license.dat

### Usb_permission_granted (Priority: 4)

**Given:**
- Service is initialized
- PalmUSBManager detects USB device (vendor 31109, product 4097)

**Then:**
- **call_service** target: `PalmUSBManager.initUSBPermission` — Request USB permission from Android system
- **emit_event** event: `palm.usb.permission_granted`

**Result:** USB permission granted — ready to open device

### Device_opened (Priority: 5)

**Given:**
- USB permission has been granted

**Then:**
- **call_service** target: `SDPVUnifiedAPI.initDevice` — Open USB connection to palm scanner
- **set_field** target: `firmware_version` value: `returned by api.firmwareVersion`
- **set_field** target: `serial_number` value: `returned by api.serialNumber`
- **emit_event** event: `palm.device.opened`

**Result:** Device connected — firmware and serial obtained

### Device_not_connected (Priority: 6) — Error: `PALM_DEVICE_NOT_CONNECTED`

**Given:**
- Service is initialized
- initDevice returns non-success code

**Then:**
- **emit_event** event: `palm.device.disconnected`

**Result:** Device not connected — check USB cable and retry

### Image_captured (Priority: 7)

**Given:**
- Device is open and idle
- captureImage returns RETURN_DEVICE_SUCCESS
- `proximity_intensity_max` (system) gte `0`

**Then:**
- **call_service** target: `SDPVUnifiedAPI.detectRoi` — Detect palm ROI in the captured image
- **set_field** target: `palm_roi_image` value: `ROI from detectRoi result`
- **emit_event** event: `palm.image.captured`

**Result:** Image captured and ROI detected — ready for enrollment or identification

### Palm_too_close (Priority: 8) — Error: `PALM_HAND_POSITION_ERROR`

**Given:**
- captureImage returns success
- proximity_intensity exceeds threshold (500)

**Then:**
- **emit_event** event: `palm.position.too_close`

**Result:** Palm is too close to scanner — user should move hand back

### Template_enrolled (Priority: 9) | Transaction: atomic

**Given:**
- Device is open and idle
- PalmEnroll listener is set via setEnrollListener()
- captureImage → detectRoi → enroll loop is running

**Then:**
- **call_service** target: `SDPVUnifiedAPI.enroll` — Feed ROI image + raw image as EnrollPicture into enrollment pipeline
- **call_service** target: `SDPVUnifiedAPI.insertPalm` — Insert completed template into cache pool with user token
- **set_field** target: `palm_template` value: `template from EnrollResult.getTmpl()`
- **set_field** target: `palm_token` value: `token returned by insertPalm()`
- **create_record** target: `palm_templates` — Store template in local database linked to user account
- **emit_event** event: `palm.template.registered`

**Result:** Palm enrolled, template in cache pool and database — user can now identify by palm

### Enrollment_failed (Priority: 10) — Error: `PALM_REGISTRATION_FAILED`

**Given:**
- Enrollment is in progress
- ANY: enrollFail callback fires OR Capture loop times out before enough valid frames OR User moves hand during capture

**Then:**
- **emit_event** event: `palm.template.registration_failed`

**Result:** Enrollment failed — user should keep hand steady and try again

### Palm_identified (Priority: 11)

**Given:**
- Device is open and idle
- ROI image available from detectRoi()
- Cache pool has at least one template

**Then:**
- **call_service** target: `SDPVUnifiedAPI.identifyFeature` — Compare ROI image against cache pool — callback returns (code, msg, palmToken)
- **call_service** target: `SDPVUnifiedAPI.lightLed` — Flash green LED on successful identification
- **emit_event** event: `palm.match.succeeded`

**Result:** Palm identified — token resolves to registered user

### Identification_failed (Priority: 12) — Error: `PALM_VERIFICATION_FAILED`

**Given:**
- identifyFeature callback returns non-success code

**Then:**
- **call_service** target: `SDPVUnifiedAPI.lightLed` — Flash red LED on failed identification
- **emit_event** event: `palm.match.failed`

**Result:** Palm does not match any registered template

### Usb_device_removed (Priority: 13)

**Given:**
- Device is open
- PalmUSBManager fires onUSBRemoved()

**Then:**
- **call_service** target: `SDPVUnifiedAPI.terminateDevice` — Clean up device connection
- **emit_event** event: `palm.device.disconnected`

**Result:** USB device removed — scanner unavailable until reconnected

### Operation_timed_out (Priority: 14) — Error: `PALM_TIMEOUT`

**Given:**
- ANY: Capture loop is running OR Enrollment is in progress OR Identification is in progress
- `elapsed_time` (system) gt `timeout_seconds`

**Then:**
- **emit_event** event: `palm.operation.timeout`

**Result:** Operation timed out — user should try again

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PALM_INVALID_LICENSE` | 403 | Palm vein scanner license is invalid or missing | No |
| `PALM_DEVICE_NOT_CONNECTED` | 500 | Palm vein scanner is not connected — check USB cable | Yes |
| `PALM_USB_PERMISSION_DENIED` | 403 | USB permission denied for palm vein scanner | No |
| `PALM_DEVICE_BUSY` | 409 | Scanner is busy with another operation | Yes |
| `PALM_EXTRACTION_FAILED` | 422 | Could not detect palm vein ROI — reposition your hand | Yes |
| `PALM_REGISTRATION_FAILED` | 422 | Palm enrollment failed — keep your hand steady and try again | Yes |
| `PALM_VERIFICATION_FAILED` | 401 | Palm does not match any registered pattern | No |
| `PALM_TIMEOUT` | 422 | Operation timed out — please try again | Yes |
| `PALM_HAND_POSITION_ERROR` | 422 | Palm is too close — hold your hand 15-30cm from the scanner | Yes |
| `PALM_COMMUNICATION_FAILED` | 500 | USB communication with scanner failed | Yes |
| `PALM_CACHE_INSERT_FAILED` | 500 | Failed to insert template into cache pool | No |
| `PALM_PARAMETER_ERROR` | 400 | Invalid parameter passed to scanner operation | No |
| `PALM_INSUFFICIENT_MEMORY` | 500 | Insufficient memory for scanner operation | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `palm.cache_pool.initialized` | Cache pool initialized with template count | `cache_pool_count` |
| `palm.service.initialized` | Algorithm service and model loaded |  |
| `palm.sdk.init_failed` | SDK initialization failed | `error_code` |
| `palm.usb.permission_granted` | USB permission granted for palm scanner |  |
| `palm.device.opened` | Scanner device opened via USB | `firmware_version`, `serial_number` |
| `palm.device.disconnected` | Scanner device disconnected or USB removed | `error_code` |
| `palm.image.captured` | Image captured and ROI detected | `proximity_intensity` |
| `palm.position.too_close` | Palm is too close to scanner | `proximity_intensity` |
| `palm.template.registered` | Palm enrolled — template in cache pool and database | `user_id`, `palm_token` |
| `palm.template.registration_failed` | Enrollment failed | `error_code`, `stage` |
| `palm.match.succeeded` | Palm identified against cache pool | `palm_token`, `user_id` |
| `palm.match.failed` | Palm did not match any cached template | `error_code` |
| `palm.operation.timeout` | Operation exceeded timeout | `operation_type`, `timeout_seconds` |
| `palm.operation.cancelled` | Capture/enroll/identify operation cancelled |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| biometric-auth | recommended | Biometric-auth uses the palm vein SDK to provide alternative authentication |
| palm-pay | optional | Palm pay links palm vein templates to payment proxies for hands-free payment |
| terminal-enrollment | optional | At-terminal enrollment uses palm vein SDK for walk-up registration |

## AGI Readiness

### Goals

#### Reliable Palm Vein

USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when USB device is unavailable
- **security** (non-negotiable): Biometric templates must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- biometric templates are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions
- USB permission is always checked before device operations

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | biometric failures erode user trust and block payment |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| cache_pool_initialized | `autonomous` | - | - |
| service_initialized | `autonomous` | - | - |
| service_init_failed | `autonomous` | - | - |
| usb_permission_granted | `autonomous` | - | - |
| device_opened | `autonomous` | - | - |
| device_not_connected | `autonomous` | - | - |
| image_captured | `autonomous` | - | - |
| palm_too_close | `autonomous` | - | - |
| template_enrolled | `autonomous` | - | - |
| enrollment_failed | `autonomous` | - | - |
| palm_identified | `autonomous` | - | - |
| identification_failed | `autonomous` | - | - |
| usb_device_removed | `autonomous` | - | - |
| operation_timed_out | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
sdk:
  library: SDPalmVeinUsb
  version: 2.3.2.311
  release_date: 2024-12-23
  artifact: SDPalmVeinUsb-2.3.2.311-2024-12-23.aar
  vendor: SaintDeem
  platform: android
  api_class: com.saintdeem.palmvein.SDPVUnifiedAPI
  usb_manager: com.saintdeem.palmvein.usb.utils.PalmUSBManager
  key_classes:
    - SDPVUnifiedAPI — singleton SDK entry point
    - PalmUSBManager — USB permission and connection lifecycle
    - PalmUSBManagerListener — callbacks for USB permission/attach/detach
    - PalmEnroll — enrollment callback interface (enrollComplete, enrollFail,
      enrollTimes)
    - EnrollResult — enrollment output containing template bytes
    - EnrollPicture — input to enroll() containing ROI image and raw image
    - CaptureResult — output of captureImage() with image bytes and
      proximity_intensity
    - DetectRoiResult — output of detectRoi() with imageRoi bytes
    - LEDColor — enum for LED control (LED_RED, LED_GREEN, LED_BLUE)
    - SDPVDeviceConstant — device result codes
    - SDPVServiceConstant — service result codes and FEATURE_NUM
  camera:
    width: 400
    height: 640
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Palm Vein Blueprint",
  "description": "USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management. 17 fields. 14 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "biometric, vein-pattern, hardware, sdk, usb, android"
}
</script>
