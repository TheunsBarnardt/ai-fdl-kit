---
title: "Terminal Payment Flow Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery. 14 fields. 9 outcom"
---

# Terminal Payment Flow Blueprint

> Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery

| | |
|---|---|
| **Feature** | `terminal-payment-flow` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | terminal, payment-flow, palm-vein, card, digital-receipt, android |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/terminal-payment-flow.blueprint.yaml) |
| **JSON API** | [terminal-payment-flow.json]({{ site.baseurl }}/api/blueprints/payment/terminal-payment-flow.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `merchant` | Merchant / Cashier | human | Operates the terminal — enters amount and initiates transactions |
| `customer` | Customer | human | Pays via palm scan or card |
| `terminal_app` | Terminal Application | system | Android app running on the payment terminal |
| `palm_scanner` | Built-in Palm Scanner | external | Integrated palm vein scanning hardware |
| `card_reader` | Built-in Card Reader | external | Integrated EMV chip, NFC tap, and magnetic stripe reader |
| `receipt_service` | Receipt Service | system | Sends digital receipts via SMS or email |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `transaction_id` | token | Yes | Transaction ID |  |
| `terminal_id` | text | Yes | Terminal ID |  |
| `merchant_id` | text | Yes | Merchant ID |  |
| `amount` | number | Yes | Payment Amount | Validations: min |
| `currency` | text | Yes | Currency |  |
| `payment_method` | select | Yes | Payment Method |  |
| `flow_state` | select | Yes | Flow State |  |
| `card_brand` | text | No | Card Brand |  |
| `card_last_four` | text | No | Card Last Four Digits |  |
| `palm_pay_id` | text | No | Palm Pay Link ID |  |
| `authorization_code` | text | No | Authorization Code |  |
| `receipt_destination` | text | No | Receipt Destination |  |
| `receipt_type` | select | No | Receipt Type |  |
| `refund_authorized_by` | text | No | Refund Authorized By |  |

## States

**State field:** `flow_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `amount_entered` |  |  |
| `awaiting_method` |  |  |
| `processing_palm` |  |  |
| `processing_card` |  |  |
| `approved` |  |  |
| `declined` |  | Yes |
| `error` |  | Yes |
| `receipt_sent` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `amount_entered` | merchant |  |
|  | `amount_entered` | `awaiting_method` | terminal_app |  |
|  | `awaiting_method` | `processing_palm` | customer |  |
|  | `awaiting_method` | `processing_card` | customer |  |
|  | `processing_palm` | `approved` | terminal_app |  |
|  | `processing_palm` | `declined` | terminal_app |  |
|  | `processing_palm` | `awaiting_method` | terminal_app | Customer chooses to retry with card |
|  | `processing_card` | `approved` | terminal_app |  |
|  | `processing_card` | `declined` | terminal_app |  |
|  | `approved` | `receipt_sent` | receipt_service |  |
|  | `processing_palm` | `error` | terminal_app |  |
|  | `processing_card` | `error` | terminal_app |  |

## Rules

- **amount_entry:**
  - **minimum:** Amount must be at least R0.01
  - **display:** Amount shown in ZAR with 2 decimal places
  - **confirmation:** Merchant confirms amount before method selection screen appears
- **method_selection:**
  - **display_both:** Terminal always shows both payment options (palm and card)
  - **timeout:** Method selection screen times out after 60 seconds — returns to idle
  - **palm_first:** Palm scanner LED activates when method selection screen appears
- **palm_flow:**
  - **scan_timeout:** Palm scan times out after 30 seconds
  - **match_then_pay:** On match: resolve proxy → initiate payment rail → await settlement
  - **fallback:** If palm fails, customer may choose card without re-entering amount
- **card_flow:**
  - **emv_preferred:** EMV chip is preferred over magnetic stripe for security
  - **contactless_limit:** NFC tap may have an issuer-defined contactless limit
  - **pin_entry:** PIN entry on terminal keypad for chip transactions when required by issuer
- **receipt:**
  - **digital_only:** Receipts delivered via SMS or email — no printer required
  - **content:** Receipt includes: merchant name, date/time, amount, last 4 digits (card) or 'Palm Pay' label, authorization code
  - **optional:** Customer may decline receipt
- **refunds:**
  - **manager_auth_required:** Refunds require manager PIN entry at the terminal
  - **same_method:** Refund must be processed via the same method as the original payment
  - **lookup:** Original transaction looked up by authorization code or transaction ID
- **security:**
  - **pci_dss:** Card data never stored on terminal — tokenized immediately
  - **biometric_local:** Palm templates stored locally on device — never transmitted
  - **tls:** All backend communication over TLS 1.2+
  - **tamper_detection:** Terminal hardware tamper detection triggers lockdown

## Flows

### Payment_transaction

End-to-end payment flow on the terminal

1. **Enter payment amount on terminal** (merchant)
1. **Confirm amount displayed on screen** (merchant)
1. **Choose payment method: scan palm or present card** (customer)
1. **Scan palm vein pattern and match against templates** (palm_scanner)
1. **Resolve proxy and initiate real-time payment** (terminal_app)
1. **Display failure message and offer card fallback** (terminal_app)
1. **Read card via chip insert, NFC tap, or magnetic swipe** (card_reader)
1. **Send authorization to payment network** (terminal_app)
1. **Ask customer for receipt preference (SMS, email, or none)** (terminal_app)
1. **Send digital receipt via SMS or email** (receipt_service)
1. **Return terminal to idle state** (terminal_app)

## Outcomes

### Amount_confirmed (Priority: 1)

**Given:**
- Terminal is idle
- `amount` (input) gte `0.01`

**Then:**
- **transition_state** field: `flow_state` from: `idle` to: `amount_entered`
- **transition_state** field: `flow_state` from: `amount_entered` to: `awaiting_method`
- **emit_event** event: `terminal.amount.confirmed`

**Result:** Amount confirmed — terminal shows payment method selection

### Palm_payment_approved (Priority: 2) | Transaction: atomic

**Given:**
- `flow_state` (db) eq `processing_palm`
- Palm vein matched and proxy resolved
- Payment settled via real-time rail

**Then:**
- **set_field** target: `payment_method` value: `palm`
- **transition_state** field: `flow_state` from: `processing_palm` to: `approved`
- **emit_event** event: `terminal.payment.approved`

**Result:** Palm payment approved — ready to send receipt

### Card_payment_approved (Priority: 3) | Transaction: atomic

**Given:**
- `flow_state` (db) eq `processing_card`
- Card authorized by payment network

**Then:**
- **set_field** target: `payment_method` value: `card_chip` — Set to actual card method used (chip/tap/swipe)
- **transition_state** field: `flow_state` from: `processing_card` to: `approved`
- **emit_event** event: `terminal.payment.approved`

**Result:** Card payment approved — ready to send receipt

### Receipt_delivered (Priority: 4)

**Given:**
- `flow_state` (db) eq `approved`
- `receipt_destination` (input) exists

**Then:**
- **call_service** target: `receipt_service.send_digital_receipt` — Send receipt via SMS or email
- **transition_state** field: `flow_state` from: `approved` to: `receipt_sent`
- **emit_event** event: `terminal.receipt.sent`

**Result:** Digital receipt sent — transaction complete

### Receipt_declined (Priority: 5)

**Given:**
- `flow_state` (db) eq `approved`
- `receipt_type` (input) eq `none`

**Then:**
- **transition_state** field: `flow_state` from: `approved` to: `receipt_sent`
- **emit_event** event: `terminal.receipt.declined`

**Result:** Customer declined receipt — transaction complete

### Palm_payment_declined (Priority: 6) — Error: `TERMINAL_PALM_DECLINED`

**Given:**
- `flow_state` (db) eq `processing_palm`
- ANY: Palm not recognized OR Palm pay link is inactive OR Payment rail declined the transaction OR Daily or transaction limit exceeded

**Then:**
- **transition_state** field: `flow_state` from: `processing_palm` to: `awaiting_method` — Return to method selection for card fallback
- **emit_event** event: `terminal.palm.declined`

**Result:** Palm payment declined — customer may try card instead

### Card_payment_declined (Priority: 7) — Error: `TERMINAL_CARD_DECLINED`

**Given:**
- `flow_state` (db) eq `processing_card`
- Card issuer declined the transaction

**Then:**
- **transition_state** field: `flow_state` from: `processing_card` to: `declined`
- **emit_event** event: `terminal.card.declined`

**Result:** Card declined by issuer — transaction ended

### Refund_processed (Priority: 8) | Transaction: atomic

**Given:**
- Manager enters PIN to authorize refund
- Original transaction found by authorization code
- `refund_authorized_by` (input) exists

**Then:**
- **call_service** target: `payment_backend.process_refund` — Reverse original payment via same method (palm rail or card network)
- **emit_event** event: `terminal.refund.processed`

**Result:** Refund processed — funds returned via original payment method

### Method_selection_timeout (Priority: 9) — Error: `TERMINAL_TIMEOUT`

**Given:**
- `flow_state` (db) eq `awaiting_method`
- No payment method selected within 60 seconds

**Then:**
- **transition_state** field: `flow_state` from: `awaiting_method` to: `idle`
- **emit_event** event: `terminal.session.timeout`

**Result:** Transaction timed out — terminal returns to idle

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TERMINAL_PALM_DECLINED` | 422 | Palm payment was declined — please try card | No |
| `TERMINAL_CARD_DECLINED` | 422 | Card was declined by the issuer | No |
| `TERMINAL_TIMEOUT` | 422 | Transaction timed out | No |
| `TERMINAL_SCANNER_ERROR` | 500 | Palm scanner error — please try card | Yes |
| `TERMINAL_CARD_READER_ERROR` | 500 | Card reader error — please try again | Yes |
| `TERMINAL_NETWORK_ERROR` | 503 | Network connection lost — transaction may be queued | Yes |
| `TERMINAL_REFUND_UNAUTHORIZED` | 403 | Manager authorization required for refunds | No |
| `TERMINAL_INVALID_AMOUNT` | 400 | Invalid payment amount | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `terminal.amount.confirmed` | Payment amount confirmed by merchant | `transaction_id`, `terminal_id`, `amount` |
| `terminal.payment.approved` | Payment approved (palm or card) | `transaction_id`, `terminal_id`, `amount`, `payment_method`, `authorization_code` |
| `terminal.palm.declined` | Palm payment declined — card fallback offered | `transaction_id`, `terminal_id` |
| `terminal.card.declined` | Card payment declined by issuer | `transaction_id`, `terminal_id`, `card_brand`, `card_last_four` |
| `terminal.receipt.sent` | Digital receipt delivered | `transaction_id`, `receipt_type`, `receipt_destination` |
| `terminal.receipt.declined` | Customer declined receipt | `transaction_id` |
| `terminal.refund.processed` | Refund processed with manager authorization | `transaction_id`, `original_transaction_id`, `amount`, `refund_authorized_by` |
| `terminal.session.timeout` | Transaction timed out at method selection | `transaction_id`, `terminal_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| palm-pay | required | Palm vein payment resolution for hands-free payment method |
| payshap-rail | required | Real-time payment rail for palm-based payments |
| payment-gateway | required | Card payment authorization via payment gateway |
| payment-methods | recommended | Card tokenization and management for card payments |
| pos-core | optional | POS session management if terminal is part of a retail POS system |
| terminal-fleet | recommended | Fleet management for terminal device administration |
| terminal-offline-queue | recommended | Offline transaction queuing when network is unavailable |
| terminal-enrollment | optional | At-terminal palm enrollment for new customers |
| refunds-returns | recommended | Refund processing for reversed transactions |

## AGI Readiness

### Goals

#### Reliable Terminal Payment Flow

Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery

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
| `palm_pay` | palm-pay | fail |
| `payshap_rail` | payshap-rail | fail |
| `payment_gateway` | payment-gateway | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| amount_confirmed | `autonomous` | - | - |
| palm_payment_approved | `supervised` | - | - |
| card_payment_approved | `supervised` | - | - |
| receipt_delivered | `autonomous` | - | - |
| receipt_declined | `autonomous` | - | - |
| palm_payment_declined | `autonomous` | - | - |
| card_payment_declined | `autonomous` | - | - |
| refund_processed | `autonomous` | - | - |
| method_selection_timeout | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Terminal Payment Flow Blueprint",
  "description": "Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery. 14 fields. 9 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "terminal, payment-flow, palm-vein, card, digital-receipt, android"
}
</script>
