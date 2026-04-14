<!-- AUTO-GENERATED FROM terminal-payment-flow.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Terminal Payment Flow

> Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery

**Category:** Payment · **Version:** 1.0.0 · **Tags:** terminal · payment-flow · palm-vein · card · digital-receipt · android

## What this does

Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **transaction_id** *(token, required)* — Transaction ID
- **terminal_id** *(text, required)* — Terminal ID
- **merchant_id** *(text, required)* — Merchant ID
- **amount** *(number, required)* — Payment Amount
- **currency** *(text, required)* — Currency
- **payment_method** *(select, required)* — Payment Method
- **flow_state** *(select, required)* — Flow State
- **card_brand** *(text, optional)* — Card Brand
- **card_last_four** *(text, optional)* — Card Last Four Digits
- **palm_pay_id** *(text, optional)* — Palm Pay Link ID
- **authorization_code** *(text, optional)* — Authorization Code
- **receipt_destination** *(text, optional)* — Receipt Destination
- **receipt_type** *(select, optional)* — Receipt Type
- **refund_authorized_by** *(text, optional)* — Refund Authorized By

## What must be true

- **amount_entry → minimum:** Amount must be at least R0.01
- **amount_entry → display:** Amount shown in ZAR with 2 decimal places
- **amount_entry → confirmation:** Merchant confirms amount before method selection screen appears
- **method_selection → display_both:** Terminal always shows both payment options (palm and card)
- **method_selection → timeout:** Method selection screen times out after 60 seconds — returns to idle
- **method_selection → palm_first:** Palm scanner LED activates when method selection screen appears
- **palm_flow → scan_timeout:** Palm scan times out after 30 seconds
- **palm_flow → match_then_pay:** On match: resolve proxy → initiate payment rail → await settlement
- **palm_flow → fallback:** If palm fails, customer may choose card without re-entering amount
- **card_flow → emv_preferred:** EMV chip is preferred over magnetic stripe for security
- **card_flow → contactless_limit:** NFC tap may have an issuer-defined contactless limit
- **card_flow → pin_entry:** PIN entry on terminal keypad for chip transactions when required by issuer
- **receipt → digital_only:** Receipts delivered via SMS or email — no printer required
- **receipt → content:** Receipt includes: merchant name, date/time, amount, last 4 digits (card) or 'Palm Pay' label, authorization code
- **receipt → optional:** Customer may decline receipt
- **refunds → manager_auth_required:** Refunds require manager PIN entry at the terminal
- **refunds → same_method:** Refund must be processed via the same method as the original payment
- **refunds → lookup:** Original transaction looked up by authorization code or transaction ID
- **security → pci_dss:** Card data never stored on terminal — tokenized immediately
- **security → biometric_local:** Palm templates stored locally on device — never transmitted
- **security → tls:** All backend communication over TLS 1.2+
- **security → tamper_detection:** Terminal hardware tamper detection triggers lockdown

## Success & failure scenarios

**✅ Success paths**

- **Amount Confirmed** — when Terminal is idle; Valid amount entered, then Amount confirmed — terminal shows payment method selection.
- **Palm Payment Approved** — when flow_state eq "processing_palm"; Palm vein matched and proxy resolved; Payment settled via real-time rail, then Palm payment approved — ready to send receipt.
- **Card Payment Approved** — when flow_state eq "processing_card"; Card authorized by payment network, then Card payment approved — ready to send receipt.
- **Receipt Delivered** — when flow_state eq "approved"; Customer provides phone number or email for receipt, then Digital receipt sent — transaction complete.
- **Receipt Declined** — when flow_state eq "approved"; Customer declines receipt, then Customer declined receipt — transaction complete.
- **Refund Processed** — when Manager enters PIN to authorize refund; Original transaction found by authorization code; Manager authorization provided, then Refund processed — funds returned via original payment method.

**❌ Failure paths**

- **Palm Payment Declined** — when flow_state eq "processing_palm"; Palm not recognized OR Palm pay link is inactive OR Payment rail declined the transaction OR Daily or transaction limit exceeded, then Palm payment declined — customer may try card instead. *(error: `TERMINAL_PALM_DECLINED`)*
- **Card Payment Declined** — when flow_state eq "processing_card"; Card issuer declined the transaction, then Card declined by issuer — transaction ended. *(error: `TERMINAL_CARD_DECLINED`)*
- **Method Selection Timeout** — when flow_state eq "awaiting_method"; No payment method selected within 60 seconds, then Transaction timed out — terminal returns to idle. *(error: `TERMINAL_TIMEOUT`)*

## Business flows

**Payment Transaction** — End-to-end payment flow on the terminal

1. **Enter payment amount on terminal** *(merchant)*
1. **Confirm amount displayed on screen** *(merchant)*
1. **Choose payment method: scan palm or present card** *(customer)*
1. **Scan palm vein pattern and match against templates** *(palm_scanner)*
1. **Resolve proxy and initiate real-time payment** *(terminal_app)*
1. **Display failure message and offer card fallback** *(terminal_app)*
1. **Read card via chip insert, NFC tap, or magnetic swipe** *(card_reader)*
1. **Send authorization to payment network** *(terminal_app)*
1. **Ask customer for receipt preference (SMS, email, or none)** *(terminal_app)*
1. **Send digital receipt via SMS or email** *(receipt_service)*
1. **Return terminal to idle state** *(terminal_app)*

## Errors it can return

- `TERMINAL_PALM_DECLINED` — Palm payment was declined — please try card
- `TERMINAL_CARD_DECLINED` — Card was declined by the issuer
- `TERMINAL_TIMEOUT` — Transaction timed out
- `TERMINAL_SCANNER_ERROR` — Palm scanner error — please try card
- `TERMINAL_CARD_READER_ERROR` — Card reader error — please try again
- `TERMINAL_NETWORK_ERROR` — Network connection lost — transaction may be queued
- `TERMINAL_REFUND_UNAUTHORIZED` — Manager authorization required for refunds
- `TERMINAL_INVALID_AMOUNT` — Invalid payment amount

## Events

**`terminal.amount.confirmed`** — Payment amount confirmed by merchant
  Payload: `transaction_id`, `terminal_id`, `amount`

**`terminal.payment.approved`** — Payment approved (palm or card)
  Payload: `transaction_id`, `terminal_id`, `amount`, `payment_method`, `authorization_code`

**`terminal.palm.declined`** — Palm payment declined — card fallback offered
  Payload: `transaction_id`, `terminal_id`

**`terminal.card.declined`** — Card payment declined by issuer
  Payload: `transaction_id`, `terminal_id`, `card_brand`, `card_last_four`

**`terminal.receipt.sent`** — Digital receipt delivered
  Payload: `transaction_id`, `receipt_type`, `receipt_destination`

**`terminal.receipt.declined`** — Customer declined receipt
  Payload: `transaction_id`

**`terminal.refund.processed`** — Refund processed with manager authorization
  Payload: `transaction_id`, `original_transaction_id`, `amount`, `refund_authorized_by`

**`terminal.session.timeout`** — Transaction timed out at method selection
  Payload: `transaction_id`, `terminal_id`

## Connects to

- **palm-pay** *(required)* — Palm vein payment resolution for hands-free payment method
- **payshap-rail** *(required)* — Real-time payment rail for palm-based payments
- **payment-gateway** *(required)* — Card payment authorization via payment gateway
- **payment-methods** *(recommended)* — Card tokenization and management for card payments
- **pos-core** *(optional)* — POS session management if terminal is part of a retail POS system
- **terminal-fleet** *(recommended)* — Fleet management for terminal device administration
- **terminal-offline-queue** *(recommended)* — Offline transaction queuing when network is unavailable
- **terminal-enrollment** *(optional)* — At-terminal palm enrollment for new customers
- **refunds-returns** *(recommended)* — Refund processing for reversed transactions

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/terminal-payment-flow/) · **Spec source:** [`terminal-payment-flow.blueprint.yaml`](./terminal-payment-flow.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
