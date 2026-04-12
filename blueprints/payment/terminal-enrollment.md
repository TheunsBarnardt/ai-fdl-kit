<!-- AUTO-GENERATED FROM terminal-enrollment.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Terminal Enrollment

> At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking

**Category:** Payment · **Version:** 1.0.0 · **Tags:** enrollment · biometric · palm-vein · onboarding · terminal

## What this does

At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **enrollment_id** *(token, required)* — Enrollment ID
- **terminal_id** *(text, required)* — Terminal ID
- **phone_number** *(phone, required)* — Phone Number
- **otp_code** *(text, optional)* — OTP Code
- **enrollment_state** *(select, required)* — Enrollment State
- **palms_enrolled** *(number, optional)* — Palms Enrolled
- **left_palm_template_ref** *(text, optional)* — Left Palm Template Ref
- **right_palm_template_ref** *(text, optional)* — Right Palm Template Ref
- **otp_attempts** *(number, optional)* — OTP Attempts
- **otp_max_attempts** *(number, required)* — Max OTP Attempts
- **enrollment_timeout_minutes** *(number, required)* — Enrollment Timeout (minutes)

## What must be true

- **enrollment_flow → palm_first:** Customer must scan at least one palm before entering phone number
- **enrollment_flow → optional_second_palm:** Customer may optionally enroll a second palm (left + right)
- **enrollment_flow → four_captures:** Each palm registration requires 4 successful captures (SDK requirement)
- **phone_verification → otp_length:** 6-digit numeric OTP
- **phone_verification → otp_expiry:** OTP expires after 5 minutes
- **phone_verification → max_attempts:** Maximum 3 OTP attempts before enrollment fails
- **phone_verification → resend_cooldown:** 30-second cooldown between OTP resends
- **duplicate_check → palm_unique:** Terminal checks if scanned palm already matches an existing template before proceeding
- **duplicate_check → phone_unique:** Phone number can only be linked to one set of palms at a time
- **timeout → enrollment_timeout:** Entire enrollment flow must complete within 5 minutes
- **timeout → scan_timeout:** Each palm scan attempt times out after 30 seconds
- **security → template_local:** Palm templates stored locally on device — never transmitted to external systems
- **security → otp_hashed:** OTP codes hashed before comparison
- **security → enrollment_audit:** Every enrollment attempt logged with terminal ID and timestamp
- **ui_guidance → hand_position:** Display clear instructions for hand placement (15-30cm, fingers spread)
- **ui_guidance → progress_indicator:** Show palm capture progress (1/4, 2/4, 3/4, 4/4)
- **ui_guidance → multilingual:** Enrollment UI available in local languages

## Success & failure scenarios

**✅ Success paths**

- **Enrollment Initiated** — when Merchant or customer starts enrollment mode; Terminal is not in active payment processing, then Enrollment started — terminal shows hand placement instructions.
- **Palm Registered** — when enrollment_state eq "palm_scanning"; Palm vein scanner captures 4 images and fuses template, then Palm registered — customer may enroll second palm or proceed to phone entry.
- **Phone Submitted** — when enrollment_state eq "palm_captured"; Customer enters phone number, then OTP sent to customer's phone for verification.
- **Otp Verified** — when enrollment_state eq "otp_sent"; Customer enters correct OTP, then Phone number verified — proceeding to create palm-pay link.
- **Enrollment Completed** — when enrollment_state eq "verified", then Enrollment complete — customer can now pay by palm at any terminal.
- **Enrollment Cancelled** — when Customer or merchant cancels enrollment at any step; Enrollment is not already in a terminal state, then Enrollment cancelled — any captured templates discarded.

**❌ Failure paths**

- **Otp Failed** — when enrollment_state eq "otp_sent"; Maximum OTP attempts exceeded, then Enrollment failed — too many incorrect OTP attempts. *(error: `ENROLLMENT_OTP_FAILED`)*
- **Palm Scan Failed** — when enrollment_state eq "palm_scanning"; Palm scanner could not capture valid template after retries, then Palm scan failed — customer should try again or use app enrollment. *(error: `ENROLLMENT_SCAN_FAILED`)*
- **Duplicate Palm Detected** — when enrollment_state eq "palm_scanning"; Scanned palm matches an existing registered template, then Palm already registered — customer can pay directly or contact support. *(error: `ENROLLMENT_DUPLICATE_PALM`)*
- **Enrollment Timeout** — when Enrollment session exceeds configured timeout, then Enrollment timed out — please start again. *(error: `ENROLLMENT_TIMEOUT`)*

## Business flows

**At Terminal Enrollment** — Walk-up palm enrollment at the terminal

1. **Enter enrollment mode on terminal** *(merchant)*
1. **Place first hand on scanner — 4 captures taken** *(customer)*
1. **Ask customer if they want to enroll second palm** *(terminal_app)*
1. **Place second hand on scanner — 4 captures taken** *(customer)*
1. **Enter phone number on terminal keypad** *(customer)*
1. **Enter 6-digit OTP received via SMS** *(customer)*
1. **Create palm-pay link and confirm enrollment** *(terminal_app)*
1. **Display success message — customer can now pay by palm** *(terminal_app)*
1. **Display failure message with reason** *(terminal_app)*

## Errors it can return

- `ENROLLMENT_OTP_FAILED` — Too many incorrect OTP attempts — please try again
- `ENROLLMENT_SCAN_FAILED` — Palm scan failed — please reposition hand and try again
- `ENROLLMENT_DUPLICATE_PALM` — This palm is already registered — you can pay directly
- `ENROLLMENT_TIMEOUT` — Enrollment timed out — please start again
- `ENROLLMENT_PHONE_IN_USE` — This phone number is already linked to another palm
- `ENROLLMENT_SCANNER_ERROR` — Palm scanner error — please try another terminal

## Connects to

- **biometric-auth** *(required)* — Palm enrollment uses the biometric authentication system
- **palm-vein** *(required)* — Hardware SDK for palm vein capture during enrollment
- **palm-pay** *(required)* — Creates the palm-to-proxy payment link as the enrollment output
- **terminal-payment-flow** *(optional)* — Enrollment is accessed from the terminal's main payment interface

## Quality fitness 🟢 89/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/terminal-enrollment/) · **Spec source:** [`terminal-enrollment.blueprint.yaml`](./terminal-enrollment.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
