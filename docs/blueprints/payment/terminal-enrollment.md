---
title: "Terminal Enrollment Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking. 11 fields. 10 outcomes. 6 error codes. rules: enrollmen"
---

# Terminal Enrollment Blueprint

> At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking

| | |
|---|---|
| **Feature** | `terminal-enrollment` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | enrollment, biometric, palm-vein, onboarding, terminal |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/terminal-enrollment.blueprint.yaml) |
| **JSON API** | [terminal-enrollment.json]({{ site.baseurl }}/api/blueprints/payment/terminal-enrollment.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Person enrolling their palm at the terminal |
| `merchant` | Merchant / Cashier | human | Initiates enrollment mode on the terminal |
| `terminal_app` | Terminal Application | system | Android app guiding the enrollment flow |
| `palm_scanner` | Built-in Palm Scanner | external | Integrated palm vein scanning hardware |
| `otp_service` | OTP Service | system | Sends and verifies one-time passwords via SMS |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `enrollment_id` | token | Yes | Enrollment ID |  |
| `terminal_id` | text | Yes | Terminal ID |  |
| `phone_number` | phone | Yes | Phone Number | Validations: required |
| `otp_code` | text | No | OTP Code | Validations: pattern |
| `enrollment_state` | select | Yes | Enrollment State |  |
| `palms_enrolled` | number | No | Palms Enrolled |  |
| `left_palm_template_ref` | text | No | Left Palm Template Ref |  |
| `right_palm_template_ref` | text | No | Right Palm Template Ref |  |
| `otp_attempts` | number | No | OTP Attempts |  |
| `otp_max_attempts` | number | Yes | Max OTP Attempts |  |
| `enrollment_timeout_minutes` | number | Yes | Enrollment Timeout (minutes) |  |

## States

**State field:** `enrollment_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `palm_scanning` |  |  |
| `palm_captured` |  |  |
| `phone_entered` |  |  |
| `otp_sent` |  |  |
| `verified` |  |  |
| `linked` |  | Yes |
| `failed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initiated` | `palm_scanning` | terminal_app |  |
|  | `palm_scanning` | `palm_captured` | palm_scanner |  |
|  | `palm_captured` | `palm_scanning` | customer | palms_enrolled < 2 |
|  | `palm_captured` | `phone_entered` | customer |  |
|  | `phone_entered` | `otp_sent` | otp_service |  |
|  | `otp_sent` | `verified` | customer |  |
|  | `otp_sent` | `otp_sent` | otp_service | otp_attempts < otp_max_attempts |
|  | `verified` | `linked` | terminal_app |  |
|  | `otp_sent` | `failed` | terminal_app | otp_attempts >= otp_max_attempts |
|  | `palm_scanning` | `failed` | terminal_app |  |
|  | `initiated` | `cancelled` | customer |  |
|  | `palm_scanning` | `cancelled` | customer |  |
|  | `palm_captured` | `cancelled` | customer |  |
|  | `phone_entered` | `cancelled` | customer |  |
|  | `otp_sent` | `cancelled` | customer |  |

## Rules

- **enrollment_flow:**
  - **palm_first:** Customer must scan at least one palm before entering phone number
  - **optional_second_palm:** Customer may optionally enroll a second palm (left + right)
  - **four_captures:** Each palm registration requires 4 successful captures (SDK requirement)
- **phone_verification:**
  - **otp_length:** 6-digit numeric OTP
  - **otp_expiry:** OTP expires after 5 minutes
  - **max_attempts:** Maximum 3 OTP attempts before enrollment fails
  - **resend_cooldown:** 30-second cooldown between OTP resends
- **duplicate_check:**
  - **palm_unique:** Terminal checks if scanned palm already matches an existing template before proceeding
  - **phone_unique:** Phone number can only be linked to one set of palms at a time
- **timeout:**
  - **enrollment_timeout:** Entire enrollment flow must complete within 5 minutes
  - **scan_timeout:** Each palm scan attempt times out after 30 seconds
- **security:**
  - **template_local:** Palm templates stored locally on device — never transmitted to external systems
  - **otp_hashed:** OTP codes hashed before comparison
  - **enrollment_audit:** Every enrollment attempt logged with terminal ID and timestamp
- **ui_guidance:**
  - **hand_position:** Display clear instructions for hand placement (15-30cm, fingers spread)
  - **progress_indicator:** Show palm capture progress (1/4, 2/4, 3/4, 4/4)
  - **multilingual:** Enrollment UI available in local languages

## Flows

### At_terminal_enrollment

Walk-up palm enrollment at the terminal

1. **Enter enrollment mode on terminal** (merchant)
1. **Place first hand on scanner — 4 captures taken** (customer)
1. **Ask customer if they want to enroll second palm** (terminal_app)
1. **Place second hand on scanner — 4 captures taken** (customer)
1. **Enter phone number on terminal keypad** (customer)
1. **Enter 6-digit OTP received via SMS** (customer)
1. **Create palm-pay link and confirm enrollment** (terminal_app)
1. **Display success message — customer can now pay by palm** (terminal_app)
1. **Display failure message with reason** (terminal_app)

## Outcomes

### Enrollment_initiated (Priority: 1)

**Given:**
- Merchant or customer starts enrollment mode
- Terminal is not in active payment processing

**Then:**
- **create_record** target: `enrollments` — Create enrollment session
- **transition_state** field: `enrollment_state` to: `initiated`
- **transition_state** field: `enrollment_state` from: `initiated` to: `palm_scanning`
- **emit_event** event: `enrollment.initiated`

**Result:** Enrollment started — terminal shows hand placement instructions

### Palm_registered (Priority: 2)

**Given:**
- `enrollment_state` (db) eq `palm_scanning`
- Palm vein scanner captures 4 images and fuses template

**Then:**
- **set_field** target: `palms_enrolled` value: `palms_enrolled + 1`
- **transition_state** field: `enrollment_state` from: `palm_scanning` to: `palm_captured`
- **emit_event** event: `enrollment.palm.registered`

**Result:** Palm registered — customer may enroll second palm or proceed to phone entry

### Phone_submitted (Priority: 3)

**Given:**
- `enrollment_state` (db) eq `palm_captured`
- `phone_number` (input) exists

**Then:**
- **transition_state** field: `enrollment_state` from: `palm_captured` to: `phone_entered`
- **call_service** target: `otp_service.send_otp` — Send 6-digit OTP to customer's phone
- **transition_state** field: `enrollment_state` from: `phone_entered` to: `otp_sent`
- **emit_event** event: `enrollment.otp.sent`

**Result:** OTP sent to customer's phone for verification

### Otp_verified (Priority: 4)

**Given:**
- `enrollment_state` (db) eq `otp_sent`
- Customer enters correct OTP

**Then:**
- **transition_state** field: `enrollment_state` from: `otp_sent` to: `verified`
- **emit_event** event: `enrollment.otp.verified`

**Result:** Phone number verified — proceeding to create palm-pay link

### Enrollment_completed (Priority: 5) | Transaction: atomic

**Given:**
- `enrollment_state` (db) eq `verified`

**Then:**
- **call_service** target: `palm_pay.create_link` — Create active palm-to-proxy link (phone number as PayShap proxy)
- **transition_state** field: `enrollment_state` from: `verified` to: `linked`
- **emit_event** event: `enrollment.completed`

**Result:** Enrollment complete — customer can now pay by palm at any terminal

### Otp_failed (Priority: 6) — Error: `ENROLLMENT_OTP_FAILED`

**Given:**
- `enrollment_state` (db) eq `otp_sent`
- `otp_attempts` (db) gte `otp_max_attempts`

**Then:**
- **transition_state** field: `enrollment_state` from: `otp_sent` to: `failed`
- **emit_event** event: `enrollment.otp.failed`

**Result:** Enrollment failed — too many incorrect OTP attempts

### Palm_scan_failed (Priority: 7) — Error: `ENROLLMENT_SCAN_FAILED`

**Given:**
- `enrollment_state` (db) eq `palm_scanning`
- Palm scanner could not capture valid template after retries

**Then:**
- **transition_state** field: `enrollment_state` from: `palm_scanning` to: `failed`
- **emit_event** event: `enrollment.scan.failed`

**Result:** Palm scan failed — customer should try again or use app enrollment

### Duplicate_palm_detected (Priority: 8) — Error: `ENROLLMENT_DUPLICATE_PALM`

**Given:**
- `enrollment_state` (db) eq `palm_scanning`
- Scanned palm matches an existing registered template

**Then:**
- **transition_state** field: `enrollment_state` from: `palm_scanning` to: `failed`
- **emit_event** event: `enrollment.duplicate.detected`

**Result:** Palm already registered — customer can pay directly or contact support

### Enrollment_timeout (Priority: 9) — Error: `ENROLLMENT_TIMEOUT`

**Given:**
- Enrollment session exceeds configured timeout

**Then:**
- **transition_state** field: `enrollment_state` from: `palm_scanning` to: `failed`
- **emit_event** event: `enrollment.timeout`

**Result:** Enrollment timed out — please start again

### Enrollment_cancelled (Priority: 10)

**Given:**
- Customer or merchant cancels enrollment at any step
- `enrollment_state` (db) not_in `linked,failed,cancelled`

**Then:**
- **transition_state** field: `enrollment_state` from: `palm_scanning` to: `cancelled`
- **emit_event** event: `enrollment.cancelled`

**Result:** Enrollment cancelled — any captured templates discarded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ENROLLMENT_OTP_FAILED` | 401 | Too many incorrect OTP attempts — please try again | No |
| `ENROLLMENT_SCAN_FAILED` | 422 | Palm scan failed — please reposition hand and try again | Yes |
| `ENROLLMENT_DUPLICATE_PALM` | 409 | This palm is already registered — you can pay directly | No |
| `ENROLLMENT_TIMEOUT` | 422 | Enrollment timed out — please start again | No |
| `ENROLLMENT_PHONE_IN_USE` | 409 | This phone number is already linked to another palm | No |
| `ENROLLMENT_SCANNER_ERROR` | 500 | Palm scanner error — please try another terminal | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `enrollment.initiated` | Enrollment session started | `enrollment_id`, `terminal_id` |
| `enrollment.palm.registered` | Palm template registered during enrollment | `enrollment_id`, `palms_enrolled` |
| `enrollment.otp.sent` | OTP sent to customer's phone | `enrollment_id`, `phone_number` |
| `enrollment.otp.verified` | OTP verified successfully | `enrollment_id` |
| `enrollment.otp.failed` | OTP verification failed — max attempts exceeded | `enrollment_id`, `otp_attempts` |
| `enrollment.completed` | Enrollment complete — palm-pay link active | `enrollment_id`, `palms_enrolled`, `phone_number` |
| `enrollment.scan.failed` | Palm scan failed during enrollment | `enrollment_id`, `terminal_id` |
| `enrollment.duplicate.detected` | Scanned palm already registered | `enrollment_id` |
| `enrollment.timeout` | Enrollment session timed out | `enrollment_id` |
| `enrollment.cancelled` | Enrollment cancelled by customer or merchant | `enrollment_id`, `enrollment_state` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| biometric-auth | required | Palm enrollment uses the biometric authentication system |
| palm-vein | required | Hardware SDK for palm vein capture during enrollment |
| palm-pay | required | Creates the palm-to-proxy payment link as the enrollment output |
| terminal-payment-flow | optional | Enrollment is accessed from the terminal's main payment interface |

## AGI Readiness

### Goals

#### Reliable Terminal Enrollment

At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `biometric_auth` | biometric-auth | fail |
| `palm_vein` | palm-vein | fail |
| `palm_pay` | palm-pay | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| enrollment_initiated | `autonomous` | - | - |
| palm_registered | `autonomous` | - | - |
| phone_submitted | `autonomous` | - | - |
| otp_verified | `autonomous` | - | - |
| enrollment_completed | `autonomous` | - | - |
| otp_failed | `autonomous` | - | - |
| palm_scan_failed | `autonomous` | - | - |
| duplicate_palm_detected | `autonomous` | - | - |
| enrollment_timeout | `autonomous` | - | - |
| enrollment_cancelled | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Terminal Enrollment Blueprint",
  "description": "At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking. 11 fields. 10 outcomes. 6 error codes. rules: enrollmen",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "enrollment, biometric, palm-vein, onboarding, terminal"
}
</script>
