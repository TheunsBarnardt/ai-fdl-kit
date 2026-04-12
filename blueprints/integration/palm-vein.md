<!-- AUTO-GENERATED FROM palm-vein.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Palm Vein

> USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management

**Category:** Integration · **Version:** 2.0.0 · **Tags:** biometric · vein-pattern · hardware · sdk · usb · android

## What this does

USB palm vein scanner integration using SDPVUnifiedAPI — capture, ROI detection, enrollment, 1:N identification, and cache pool management

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **license_path** *(text, required)* — License File Path
- **chip_type** *(text, required)* — Target Chip Platform
- **proximity_intensity_max** *(number, required)* — Proximity Intensity Threshold
- **firmware_version** *(text, optional)* — Firmware Version
- **serial_number** *(text, optional)* — Device Serial Number
- **usb_vendor_id** *(number, required)* — USB Vendor ID
- **usb_product_id** *(number, required)* — USB Product ID
- **palm_template** *(json, optional)* — Palm Vein Template
- **palm_token** *(text, optional)* — Palm Cache Token
- **palm_roi_image** *(json, optional)* — Palm ROI Image
- **palm_raw_image** *(json, optional)* — Palm Raw Image
- **palm_hand** *(select, optional)* — Enrolled Hand
- **timeout_seconds** *(number, required)* — Operation Timeout
- **image_masked** *(boolean, required)* — Apply Mask to Display Image
- **led_color** *(select, optional)* — LED Color
- **led_duration_ms** *(number, optional)* — LED Duration (ms)
- **cache_pool_count** *(number, optional)* — Palms in Cache Pool

## What must be true

- **sdk_singleton → api_access:** SDPVUnifiedAPI.getInstance() returns the singleton — all operations go through this instance
- **sdk_singleton → thread_safety:** captureImage(), detectRoi(), enroll(), identifyFeature() must run on background threads — never on the main thread
- **initialization_sequence → order:** initCachePool → initService → initModel → (USB permission) → initDevice
- **initialization_sequence → cache_pool_first:** initCachePool is time-consuming and must complete before any other SDK call
- **initialization_sequence → chip_type:** ChipType.RK3568 is required for the PVM310 terminal hardware
- **initialization_sequence → license_copy:** License file must exist at /sdcard/SD_TEMPLATE/LICENSE/license.dat — app copies from res/raw/license.dat on first launch
- **initialization_sequence → model_after_service:** initModel() must be called after initService() to load the deep learning algorithm
- **usb_permission → handler:** PalmUSBManager created in Application.onCreate() handles USB attach/detach/permission
- **usb_permission → auto_request:** USB permission is requested automatically when PalmUSBManager detects the device
- **usb_permission → callback:** onCheckPermission(0) means granted — then call initDevice(context)
- **usb_permission → removal:** onUSBRemoved() fires when device is unplugged — call terminateDevice()
- **usb_permission → device_filter:** USB device filter: vendor-id=31109, product-id=4097
- **image_capture → loop_pattern:** DeviceTookImage thread calls captureImage() in a continuous loop
- **image_capture → success:** RETURN_DEVICE_SUCCESS means palm detected — check proximity_intensity before using
- **image_capture → no_trigger:** RETURN_DEVICE_ERROR_DEVICE_NOT_TRIGGERED means no palm detected — keep looping
- **image_capture → proximity_check:** If proximity_intensity > 500, palm is too close — warn user
- **image_capture → camera_dimensions:** Raw image is 400×640 pixels
- **image_capture → frame_queue:** Captured frames go into a bounded queue for the detect thread
- **roi_detection → method:** detectRoi(rawImage) extracts the palm vein region of interest
- **roi_detection → success:** RETURN_SERVICE_SUCCESS means valid ROI — imageRoi can be used for enroll/identify
- **roi_detection → failure:** Non-success means palm not properly positioned — discard frame and retry
- **roi_detection → mask_display:** maskImage(rawImage) blurs the image for privacy display to the user
- **enrollment → listener:** setEnrollListener(PalmEnroll) must be called before starting enrollment
- **enrollment → flow:** captureImage loop → detectRoi → enroll(EnrollPicture(roiImage, rawImage)) — repeat until enrollComplete
- **enrollment → feature_count:** SDPVServiceConstant.FEATURE_NUM captures required (typically 5-6 valid frames)
- **enrollment → callbacks → complete:** enrollComplete(EnrollResult) — template in result.getTmpl()
- **enrollment → callbacks → fail:** enrollFail(UnifiedMsg) — enrollment failed, user should retry
- **enrollment → callbacks → progress:** enrollTimes(count) — number of successful captures so far
- **enrollment → insert_after:** After enrollComplete, call insertPalm(template) to add to cache pool
- **enrollment → token_returned:** insertPalm returns a token string for cache management
- **enrollment → custom_token:** insertPalm(template, userId) allows custom token for user-linked identification
- **identification → method:** identifyFeature(roiImage, callback) compares against the internal cache pool
- **identification → callback:** Callback receives (code, message, palmToken) — code == RETURN_SERVICE_SUCCESS means match found
- **identification → token_resolution:** palmToken from callback maps to the token used in insertPalm — resolves to user_id
- **identification → led_feedback:** Green LED on success (lightLed(LED_GREEN, 1000)), red on failure (lightLed(LED_RED, 1000))
- **cache_management → insert:** insertPalm(template) or insertPalm(template, token) adds to cache pool
- **cache_management → remove:** removePalm(token) removes a specific template
- **cache_management → clear:** clearCachePool() removes all templates
- **cache_management → count:** palmsCount returns the number of templates in the cache
- **cache_management → persistence:** Cache pool data stored under /sdcard/SD_TEMPLATE/HANDS_TEMPLATE/
- **led_control → method:** lightLed(LEDColor, durationMs) — LEDColor.LED_RED, LED_GREEN, LED_BLUE
- **led_control → duration:** Duration in milliseconds (e.g., 1000 for 1 second flash)
- **palm_positioning → distance:** Hand must be approximately 15-30cm from the scanner
- **palm_positioning → proximity_warning:** proximity_intensity > 500 means too close — display warning to user
- **palm_positioning → centered:** Hand must be centered on the scanner
- **palm_positioning → fingers_spread:** Fingers should be spread naturally
- **security → biometric_data_sensitive:** Templates, ROI images, and raw images are biometric PII — encrypt at rest
- **security → template_never_transmitted:** Templates stay on-device — only tokens transmitted to backend
- **security → license_required:** Valid license.dat required for initService()
- **storage_paths → root:** /sdcard/SD_TEMPLATE/
- **storage_paths → license:** /sdcard/SD_TEMPLATE/LICENSE/license.dat
- **storage_paths → templates:** /sdcard/SD_TEMPLATE/HANDS_TEMPLATE/
- **storage_paths → images:** /sdcard/SD_TEMPLATE/PALM_IMG/

## Success & failure scenarios

**✅ Success paths**

- **Cache Pool Initialized** — when App has started; Cache pool has not been initialized yet, then Cache pool initialized — template storage ready.
- **Service Initialized** — when Cache pool is initialized; License file exists at configured path, then Algorithm service and model loaded — ready for USB device.
- **Usb Permission Granted** — when Service is initialized; PalmUSBManager detects USB device (vendor 31109, product 4097), then USB permission granted — ready to open device.
- **Device Opened** — when USB permission has been granted, then Device connected — firmware and serial obtained.
- **Image Captured** — when Device is open and idle; captureImage returns RETURN_DEVICE_SUCCESS; Proximity intensity is within safe range, then Image captured and ROI detected — ready for enrollment or identification.
- **Template Enrolled** — when Device is open and idle; PalmEnroll listener is set via setEnrollListener(); captureImage → detectRoi → enroll loop is running, then Palm enrolled, template in cache pool and database — user can now identify by palm.
- **Palm Identified** — when Device is open and idle; ROI image available from detectRoi(); Cache pool has at least one template, then Palm identified — token resolves to registered user.
- **Usb Device Removed** — when Device is open; PalmUSBManager fires onUSBRemoved(), then USB device removed — scanner unavailable until reconnected.

**❌ Failure paths**

- **Service Init Failed** — when License file is missing or invalid, then Service initialization fails — check license.dat. *(error: `PALM_INVALID_LICENSE`)*
- **Device Not Connected** — when Service is initialized; initDevice returns non-success code, then Device not connected — check USB cable and retry. *(error: `PALM_DEVICE_NOT_CONNECTED`)*
- **Palm Too Close** — when captureImage returns success; proximity_intensity exceeds threshold (500), then Palm is too close to scanner — user should move hand back. *(error: `PALM_HAND_POSITION_ERROR`)*
- **Enrollment Failed** — when Enrollment is in progress; enrollFail callback fires OR Capture loop times out before enough valid frames OR User moves hand during capture, then Enrollment failed — user should keep hand steady and try again. *(error: `PALM_REGISTRATION_FAILED`)*
- **Identification Failed** — when identifyFeature callback returns non-success code, then Palm does not match any registered template. *(error: `PALM_VERIFICATION_FAILED`)*
- **Operation Timed Out** — when Capture loop is running OR Enrollment is in progress OR Identification is in progress; Operation exceeds configured timeout, then Operation timed out — user should try again. *(error: `PALM_TIMEOUT`)*

## Errors it can return

- `PALM_INVALID_LICENSE` — Palm vein scanner license is invalid or missing
- `PALM_DEVICE_NOT_CONNECTED` — Palm vein scanner is not connected — check USB cable
- `PALM_USB_PERMISSION_DENIED` — USB permission denied for palm vein scanner
- `PALM_DEVICE_BUSY` — Scanner is busy with another operation
- `PALM_EXTRACTION_FAILED` — Could not detect palm vein ROI — reposition your hand
- `PALM_REGISTRATION_FAILED` — Palm enrollment failed — keep your hand steady and try again
- `PALM_VERIFICATION_FAILED` — Palm does not match any registered pattern
- `PALM_TIMEOUT` — Operation timed out — please try again
- `PALM_HAND_POSITION_ERROR` — Palm is too close — hold your hand 15-30cm from the scanner
- `PALM_COMMUNICATION_FAILED` — USB communication with scanner failed
- `PALM_CACHE_INSERT_FAILED` — Failed to insert template into cache pool
- `PALM_PARAMETER_ERROR` — Invalid parameter passed to scanner operation
- `PALM_INSUFFICIENT_MEMORY` — Insufficient memory for scanner operation

## Events

**`palm.cache_pool.initialized`** — Cache pool initialized with template count
  Payload: `cache_pool_count`

**`palm.service.initialized`** — Algorithm service and model loaded

**`palm.sdk.init_failed`** — SDK initialization failed
  Payload: `error_code`

**`palm.usb.permission_granted`** — USB permission granted for palm scanner

**`palm.device.opened`** — Scanner device opened via USB
  Payload: `firmware_version`, `serial_number`

**`palm.device.disconnected`** — Scanner device disconnected or USB removed
  Payload: `error_code`

**`palm.image.captured`** — Image captured and ROI detected
  Payload: `proximity_intensity`

**`palm.position.too_close`** — Palm is too close to scanner
  Payload: `proximity_intensity`

**`palm.template.registered`** — Palm enrolled — template in cache pool and database
  Payload: `user_id`, `palm_token`

**`palm.template.registration_failed`** — Enrollment failed
  Payload: `error_code`, `stage`

**`palm.match.succeeded`** — Palm identified against cache pool
  Payload: `palm_token`, `user_id`

**`palm.match.failed`** — Palm did not match any cached template
  Payload: `error_code`

**`palm.operation.timeout`** — Operation exceeded timeout
  Payload: `operation_type`, `timeout_seconds`

**`palm.operation.cancelled`** — Capture/enroll/identify operation cancelled

## Connects to

- **biometric-auth** *(recommended)* — Biometric-auth uses the palm vein SDK to provide alternative authentication
- **palm-pay** *(optional)* — Palm pay links palm vein templates to payment proxies for hands-free payment
- **terminal-enrollment** *(optional)* — At-terminal enrollment uses palm vein SDK for walk-up registration

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+2** since baseline (82 → 84)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/palm-vein/) · **Spec source:** [`palm-vein.blueprint.yaml`](./palm-vein.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
