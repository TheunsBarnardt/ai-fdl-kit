---
title: "Emv Card Reader Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing. 15 fields. 11 outcomes. 8 error "
---

# Emv Card Reader Blueprint

> EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing

| | |
|---|---|
| **Feature** | `emv-card-reader` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | emv, card-reader, nfc, contactless, pci, hardware, sdk |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/emv-card-reader.blueprint.yaml) |
| **JSON API** | [emv-card-reader.json]({{ site.baseurl }}/api/blueprints/integration/emv-card-reader.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal_app` | Terminal Application | system | Android app that calls the card reader SDK to process card payments |
| `card_reader` | Card Reader Hardware | external | Built-in EMV chip, NFC, and magnetic stripe reader |
| `customer` | Customer | human | Presents card for payment |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `reader_status` | select | Yes | Reader Status |  |
| `card_entry_mode` | select | No | Card Entry Mode |  |
| `card_brand` | text | No | Card Brand |  |
| `card_last_four` | text | No | Last Four Digits | Validations: pattern |
| `card_token` | token | No | Card Token |  |
| `application_id` | text | No | EMV Application ID (AID) |  |
| `application_label` | text | No | Application Label |  |
| `encrypted_pin_block` | text | No | Encrypted PIN Block |  |
| `authorization_code` | text | No | Authorisation Code |  |
| `amount` | number | Yes | Transaction Amount | Validations: min |
| `currency_code` | text | Yes | Currency Code |  |
| `cvm_result` | select | No | Cardholder Verification Method |  |
| `contactless_limit` | number | No | Contactless CVM Limit |  |
| `emv_tags` | json | No | EMV Tag Data |  |
| `track2_equivalent` | text | No | Track 2 Equivalent Data |  |

## States

**State field:** `reader_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `uninitialized` | Yes |  |
| `initialized` |  |  |
| `idle` |  |  |
| `waiting_card` |  |  |
| `card_detected` |  |  |
| `reading` |  |  |
| `pin_entry` |  |  |
| `online_auth` |  |  |
| `complete` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `uninitialized` | `initialized` | terminal_app |  |
|  | `initialized` | `idle` | card_reader |  |
|  | `idle` | `waiting_card` | terminal_app |  |
|  | `waiting_card` | `card_detected` | card_reader |  |
|  | `card_detected` | `reading` | card_reader |  |
|  | `reading` | `pin_entry` | terminal_app | cvm_result is online_pin or offline_pin |
|  | `reading` | `online_auth` | terminal_app | cvm_result is no_cvm or cdcvm |
|  | `pin_entry` | `online_auth` | customer |  |
|  | `online_auth` | `complete` | terminal_app |  |
|  | `waiting_card` | `idle` | terminal_app |  |
|  | `reading` | `idle` | card_reader |  |

## Rules

- **emv_kernel:**
  - **application_selection:** PPSE (contactless) or PSE (contact) for application selection — present list if multiple AIDs
  - **terminal_action_analysis:** EMV kernel performs Terminal Action Analysis to determine online/offline/decline
  - **issuer_script_processing:** Process issuer scripts received in authorisation response
- **chip_contact:**
  - **atr_required:** Read ATR (Answer to Reset) on card insertion
  - **application_selection:** Select application via PSE or AID list
  - **offline_data_auth:** Perform SDA/DDA/CDA as supported by card
  - **cvm_processing:** Process CVM list — online PIN preferred
- **nfc_contactless:**
  - **ppse_selection:** Select PPSE (2PAY.SYS.DDF01) for contactless application discovery
  - **ctls_kernel:** Use appropriate contactless kernel (Visa payWave, Mastercard CTLS, Amex CTLS)
  - **cvm_limit:** If amount exceeds contactless CVM limit, require PIN or fall back to chip
  - **tap_timeout:** NFC read must complete within 500ms
- **magnetic_stripe:**
  - **track_data:** Read Track 1 and Track 2 data
  - **fallback_only:** Magnetic stripe is fallback — prefer chip or NFC when available
  - **chip_card_detection:** If stripe-read card has chip, prompt for chip insertion (fallback prevention)
- **pin_entry:**
  - **encrypted:** PIN entered on PCI PTS certified keypad — never in plaintext
  - **pin_block_format:** ISO 9564 PIN block format
  - **dukpt:** PIN encrypted with DUKPT (Derived Unique Key Per Transaction)
  - **max_attempts:** Maximum 3 PIN attempts before card is blocked
  - **timeout:** PIN entry times out after 30 seconds
- **pci_compliance:**
  - **no_pan_storage:** Raw PAN (Primary Account Number) never stored on terminal
  - **tokenisation:** PAN tokenised immediately after read — only token persisted
  - **no_track_storage:** Track data never stored — transmitted for online auth only
  - **key_management:** Encryption keys managed via DUKPT — unique key per transaction
  - **tamper_detection:** Hardware tamper triggers key erasure and terminal lockdown
  - **pts_certification:** Terminal must be PCI PTS certified for PIN entry
- **card_brand_detection:**
  - **method:** Card brand determined from EMV Application Identifier (AID) prefix
  - **visa:** AID prefix A000-0000-0310-10
  - **mastercard:** AID prefix A000-0000-0410-10
  - **amex:** AID prefix A000-0000-2501
  - **discover:** AID prefix A000-0001-5230-10

## Outcomes

### Reader_initialized (Priority: 1)

**Given:**
- Terminal app initialises the card reader SDK

**Then:**
- **transition_state** field: `reader_status` from: `uninitialized` to: `initialized`
- **emit_event** event: `card.reader.initialized`

**Result:** Card reader SDK initialised and ready

### Card_detected_chip (Priority: 2)

**Given:**
- `reader_status` (db) eq `waiting_card`
- Customer inserts chip card

**Then:**
- **set_field** target: `card_entry_mode` value: `chip`
- **transition_state** field: `reader_status` from: `waiting_card` to: `card_detected`
- **emit_event** event: `card.detected`

**Result:** Chip card detected — reading ATR

### Card_detected_nfc (Priority: 3)

**Given:**
- `reader_status` (db) eq `waiting_card`
- Customer taps card or device on NFC reader

**Then:**
- **set_field** target: `card_entry_mode` value: `contactless`
- **transition_state** field: `reader_status` from: `waiting_card` to: `card_detected`
- **emit_event** event: `card.detected`

**Result:** Contactless card detected — reading PPSE

### Card_detected_swipe (Priority: 4)

**Given:**
- `reader_status` (db) eq `waiting_card`
- Customer swipes card through magnetic stripe reader

**Then:**
- **set_field** target: `card_entry_mode` value: `magnetic_stripe`
- **transition_state** field: `reader_status` from: `waiting_card` to: `card_detected`
- **emit_event** event: `card.detected`

**Result:** Magnetic stripe card detected — reading track data

### Card_read_success (Priority: 5)

**Given:**
- `reader_status` (db) eq `card_detected`
- Card data read successfully

**Then:**
- **set_field** target: `card_brand` value: `detected from AID`
- **set_field** target: `card_last_four` value: `last 4 digits of PAN`
- **set_field** target: `card_token` value: `tokenised PAN`
- **transition_state** field: `reader_status` from: `card_detected` to: `reading`
- **emit_event** event: `card.read.success`

**Result:** Card data read and tokenised — ready for CVM or online auth

### Pin_verified (Priority: 6)

**Given:**
- `reader_status` (db) eq `pin_entry`
- Customer enters PIN on keypad

**Then:**
- **set_field** target: `encrypted_pin_block` value: `DUKPT-encrypted PIN block`
- **transition_state** field: `reader_status` from: `pin_entry` to: `online_auth`
- **emit_event** event: `card.pin.entered`

**Result:** PIN captured and encrypted — proceeding to online authorisation

### Online_auth_approved (Priority: 7)

**Given:**
- `reader_status` (db) eq `online_auth`
- Issuer approves the transaction

**Then:**
- **set_field** target: `authorization_code` value: `from issuer response`
- **transition_state** field: `reader_status` from: `online_auth` to: `complete`
- **emit_event** event: `card.auth.approved`

**Result:** Card payment authorised by issuer

### Online_auth_declined (Priority: 8) — Error: `CARD_DECLINED`

**Given:**
- `reader_status` (db) eq `online_auth`
- Issuer declines the transaction

**Then:**
- **transition_state** field: `reader_status` from: `online_auth` to: `complete`
- **emit_event** event: `card.auth.declined`

**Result:** Card declined by issuer

### Card_read_failed (Priority: 9) — Error: `CARD_READ_FAILED`

**Given:**
- `reader_status` (db) in `card_detected,reading`
- Card cannot be read — damaged, removed too early, or unsupported

**Then:**
- **transition_state** field: `reader_status` from: `reading` to: `idle`
- **emit_event** event: `card.read.failed`

**Result:** Card read failed — customer should try again or use different card

### Pin_attempts_exceeded (Priority: 10) — Error: `CARD_PIN_BLOCKED`

**Given:**
- `reader_status` (db) eq `pin_entry`
- Customer exceeds maximum PIN attempts (3)

**Then:**
- **transition_state** field: `reader_status` from: `pin_entry` to: `complete`
- **emit_event** event: `card.pin.blocked`

**Result:** Card blocked — too many incorrect PIN attempts

### Chip_fallback_required (Priority: 11) — Error: `CARD_CHIP_FALLBACK`

**Given:**
- `card_entry_mode` (db) eq `magnetic_stripe`
- Swiped card has an EMV chip

**Then:**
- **emit_event** event: `card.chip_fallback`

**Result:** Please insert chip card instead of swiping

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CARD_DECLINED` | 422 | Card was declined by the issuer | No |
| `CARD_READ_FAILED` | 422 | Could not read card — please try again | Yes |
| `CARD_PIN_BLOCKED` | 403 | Card blocked — too many incorrect PIN attempts | No |
| `CARD_CHIP_FALLBACK` | 400 | Please insert your chip card instead of swiping | No |
| `CARD_READER_ERROR` | 500 | Card reader hardware error | Yes |
| `CARD_UNSUPPORTED` | 400 | Card type not supported on this terminal | No |
| `CARD_EXPIRED` | 400 | Card has expired | No |
| `CARD_TIMEOUT` | 422 | Card read timed out — please present card again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `card.reader.initialized` | Card reader SDK initialised | `terminal_id` |
| `card.detected` | Card detected — chip, NFC, or magnetic stripe | `card_entry_mode` |
| `card.read.success` | Card data read and tokenised | `card_entry_mode`, `card_brand`, `card_last_four` |
| `card.read.failed` | Card read failed | `card_entry_mode` |
| `card.pin.entered` | PIN captured and encrypted | `card_entry_mode` |
| `card.auth.approved` | Card payment authorised | `card_brand`, `card_last_four`, `authorization_code`, `amount` |
| `card.auth.declined` | Card payment declined by issuer | `card_brand`, `card_last_four` |
| `card.pin.blocked` | Card blocked after too many PIN attempts | `card_brand`, `card_last_four` |
| `card.chip_fallback` | Chip card swiped — insert chip instead | `card_brand` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| terminal-payment-flow | required | Terminal payment flow uses card reader for card payment method |
| payment-gateway | required | Online authorisation routed through payment gateway |
| payment-methods | recommended | Card tokenisation and brand management |
| palm-vein | optional | Companion hardware SDK — palm scanner and card reader on same terminal |

## AGI Readiness

### Goals

#### Reliable Emv Card Reader

EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing

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

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `terminal_payment_flow` | terminal-payment-flow | degrade |
| `payment_gateway` | payment-gateway | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| reader_initialized | `autonomous` | - | - |
| card_detected_chip | `autonomous` | - | - |
| card_detected_nfc | `autonomous` | - | - |
| card_detected_swipe | `autonomous` | - | - |
| card_read_success | `autonomous` | - | - |
| pin_verified | `autonomous` | - | - |
| online_auth_approved | `supervised` | - | - |
| online_auth_declined | `autonomous` | - | - |
| card_read_failed | `autonomous` | - | - |
| pin_attempts_exceeded | `autonomous` | - | - |
| chip_fallback_required | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Emv Card Reader Blueprint",
  "description": "EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing. 15 fields. 11 outcomes. 8 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "emv, card-reader, nfc, contactless, pci, hardware, sdk"
}
</script>
