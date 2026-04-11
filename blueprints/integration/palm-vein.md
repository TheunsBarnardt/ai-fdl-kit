<!-- AUTO-GENERATED FROM palm-vein.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Palm Vein

> Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching

**Category:** Integration · **Version:** 1.0.0 · **Tags:** biometric · vein-pattern · hardware · sdk · authentication

## What this does

Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **license_path** *(text, required)* — License File Path
- **auto_update_template** *(boolean, required)* — Auto-Update Template
- **logging_enabled** *(boolean, required)* — SDK Logging
- **firmware_version** *(text, optional)* — Firmware Version
- **serial_number** *(text, optional)* — Device Serial Number
- **palm_feature** *(json, optional)* — Palm Vein Feature Data
- **palm_template** *(json, optional)* — Palm Vein Template
- **palm_image** *(json, optional)* — Palm Vein Image
- **timeout_seconds** *(number, required)* — Operation Timeout
- **image_masked** *(boolean, required)* — Apply Blur to Callback Image
- **led_color** *(select, optional)* — LED Color
- **led_duration_ms** *(number, optional)* — LED Duration (ms)
- **match_index** *(number, optional)* — Matched Template Index
- **template_count** *(number, required)* — Number of Templates to Compare
- **updated_template** *(json, optional)* — Updated Template
- **palm_hand** *(select, optional)* — Palm Hand

## What must be true

- **initialization → single_init:** SD_API_GetBufferSize and SD_API_Init must each be called exactly once at program start
- **initialization → single_uninit:** SD_API_Uninit must be called exactly once at program end
- **initialization → init_before_all:** All other API calls require successful initialization first
- **buffer_sizes → precondition:** SD_API_GetBufferSize must be called before any feature/template/image operations to obtain correct buffer sizes
- **buffer_sizes → outputs → feature_size:** Size of palm vein feature data buffer
- **buffer_sizes → outputs → template_size:** Size of palm vein template buffer
- **buffer_sizes → outputs → image_size:** Size of palm vein image buffer
- **buffer_sizes → outputs → registration_count:** Number of palm captures required for registration (4)
- **device_management → cancel_before_reopen:** If currently in registration or feature extraction, call SD_API_Cancel before opening or closing the device
- **device_management → busy_check:** Device returns DEVBUSY error if a registration or extraction is already in progress
- **registration → capture_count:** 4
- **registration → timeout_range:** -1 to 1000 seconds (-1 = no limit)
- **registration → template_storage:** Templates must be persisted in a database linked to user accounts
- **matching → one_to_n:** SD_API_Match1VN compares one feature against N templates
- **matching → template_update:** On successful match, the updated template (pucUpdTmpl) should replace the old template to improve future accuracy
- **matching → auto_update:** When auto-update is enabled during init, SD_API_Match1VNEx automatically updates templates
- **led_control → supported_durations:** 0, 1000
- **led_control → off_command:** Pass LED_NULL to turn off LED
- **palm_positioning → distance:** Hand must be approximately 15-30cm from device center
- **palm_positioning → centered:** Hand must be centered on the device
- **palm_positioning → fingers_spread:** Fingers must be spread naturally
- **security → biometric_data_sensitive:** Feature data, templates, and images are biometric PII and must be treated as sensitive
- **security → license_required:** A valid license file is required for SDK operation

## Success & failure scenarios

**✅ Success paths**

- **Sdk Initialized** — when SDK has not been initialized yet; Valid license file exists at specified path, then SDK is initialized and ready for device operations.
- **Device Opened** — when SDK is initialized; No active registration or extraction in progress, then Device is connected and firmware/serial info is available.
- **Feature Extracted** — when Device is open and idle; Buffer sizes have been obtained, then Palm vein feature and image data are captured and available for matching or storage.
- **Template Registered** — when Device is open and idle; Buffer sizes have been obtained, then Palm vein template is registered and stored for future matching.
- **Match Succeeded** — when Valid feature data is available (from extraction); One or more templates exist in the database, then Palm vein matched against stored template — identity verified.
- **Operation Cancelled** — when Feature extraction is in progress OR Registration is in progress; Cancel is requested, then Current operation is cancelled and device returns to idle state.

**❌ Failure paths**

- **Sdk Init Failed** — when License file is missing or invalid, then SDK initialization fails with license error. *(error: `PALM_INVALID_LICENSE`)*
- **Device Not Connected** — when SDK is initialized; Device is not physically connected, then Device is not connected — check USB connection and retry. *(error: `PALM_DEVICE_NOT_CONNECTED`)*
- **Feature Extraction Failed** — when Device is open and performing extraction; Palm positioning is incorrect OR Image quality is poor OR Operation times out, then Feature extraction failed — user should reposition hand and try again. *(error: `PALM_EXTRACTION_FAILED`)*
- **Registration Failed** — when Device is open and performing registration; User moves hand during capture OR Image quality is poor OR Operation times out OR Feature fusion fails, then Registration failed — user should keep hand steady and try again. *(error: `PALM_REGISTRATION_FAILED`)*
- **Match Failed** — when Valid feature data is available; Feature does not match any stored template, then Palm vein does not match any registered template — verification failed. *(error: `PALM_VERIFICATION_FAILED`)*
- **Device Busy** — when Feature extraction is in progress OR Registration is in progress; A new operation is attempted, then Device is busy — cancel the current operation before starting a new one. *(error: `PALM_DEVICE_BUSY`)*
- **Operation Timed Out** — when Feature extraction is in progress OR Registration is in progress; Operation exceeds configured timeout, then Operation timed out — user should try again. *(error: `PALM_TIMEOUT`)*

## Errors it can return

- `PALM_INVALID_LICENSE` — Palm vein scanner license is invalid or missing
- `PALM_DEVICE_NOT_CONNECTED` — Palm vein scanner is not connected
- `PALM_DEVICE_BUSY` — Scanner is busy with another operation — please cancel or wait
- `PALM_EXTRACTION_FAILED` — Could not capture palm vein features — please reposition your hand
- `PALM_REGISTRATION_FAILED` — Palm vein registration failed — keep your hand steady and try again
- `PALM_VERIFICATION_FAILED` — Palm vein does not match any registered pattern
- `PALM_TIMEOUT` — Operation timed out — please try again
- `PALM_HAND_POSITION_ERROR` — Please position your hand 15-30cm from the scanner center with fingers spread naturally
- `PALM_IMAGE_QUALITY_POOR` — Image quality is too low — please try again in better conditions
- `PALM_COMMUNICATION_FAILED` — Communication with palm vein scanner failed
- `PALM_MISSING_LIBRARY` — Required SDK library is missing
- `PALM_PARAMETER_ERROR` — Invalid parameter passed to scanner operation
- `PALM_INSUFFICIENT_MEMORY` — Insufficient memory for scanner operation

## Connects to

- **biometric-auth** *(recommended)* — Biometric-auth uses the palm vein SDK to provide alternative authentication

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/palm-vein/) · **Spec source:** [`palm-vein.blueprint.yaml`](./palm-vein.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
