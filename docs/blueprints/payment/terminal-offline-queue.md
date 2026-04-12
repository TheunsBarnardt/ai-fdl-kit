---
title: "Terminal Offline Queue Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect. 20 fields. 8 outcomes. 5 error codes. rules: risk_li"
---

# Terminal Offline Queue Blueprint

> Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect

| | |
|---|---|
| **Feature** | `terminal-offline-queue` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | offline, queue, resilience, terminal, risk-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/terminal-offline-queue.blueprint.yaml) |
| **JSON API** | [terminal-offline-queue.json]({{ site.baseurl }}/api/blueprints/payment/terminal-offline-queue.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal_app` | Terminal Application | system | Android terminal app managing the offline queue |
| `merchant` | Merchant / Cashier | human | Operates terminal and sees offline status |
| `connectivity_monitor` | Connectivity Monitor | system | Monitors network state and triggers queue flush on reconnect |
| `payment_backend` | Payment Backend | system | Processes queued transactions when connectivity restores |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `queue_id` | token | Yes | Queue Entry ID |  |
| `terminal_id` | text | Yes | Terminal ID |  |
| `transaction_id` | token | Yes | Transaction ID |  |
| `payment_method` | select | Yes | Payment Method |  |
| `amount` | number | Yes | Transaction Amount | Validations: min |
| `currency` | text | Yes | Currency |  |
| `queued_at` | datetime | Yes | Queued At |  |
| `processed_at` | datetime | No | Processed At |  |
| `queue_status` | select | Yes | Queue Status |  |
| `retry_count` | number | No | Retry Count |  |
| `max_retries` | number | Yes | Max Retries |  |
| `failure_reason` | text | No | Failure Reason |  |
| `offline_max_amount` | number | Yes | Max Offline Transaction Amount | Validations: min |
| `offline_max_queue_depth` | number | Yes | Max Queue Depth |  |
| `offline_max_total_value` | number | Yes | Max Total Queued Value |  |
| `queue_expiry_hours` | number | Yes | Queue Expiry (hours) |  |
| `current_queue_depth` | number | No | Current Queue Depth |  |
| `current_queue_total` | number | No | Current Queue Total Value |  |
| `encrypted_card_data` | json | No | Encrypted Card Data |  |
| `palm_pay_ref` | text | No | Palm Pay Reference |  |

## States

**State field:** `queue_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `queued` | Yes |  |
| `processing` |  |  |
| `settled` |  | Yes |
| `failed` |  | Yes |
| `expired` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `queued` | `processing` | terminal_app |  |
|  | `processing` | `settled` | payment_backend |  |
|  | `processing` | `failed` | payment_backend |  |
|  | `processing` | `queued` | terminal_app | retry_count < max_retries |
|  | `queued` | `expired` | terminal_app |  |

## Rules

- **risk_limits:**
  - **per_transaction_cap:** Individual offline transactions capped at configured limit (default R500)
  - **queue_depth_cap:** Maximum number of queued transactions (default 10)
  - **total_value_cap:** Total value of all queued transactions capped (default R2,000)
- **queuing:**
  - **offline_detection:** Terminal detects offline state via connectivity monitor
  - **merchant_notification:** Merchant sees clear 'OFFLINE MODE' indicator on screen
  - **customer_notification:** Customer informed that payment will be processed when connectivity restores
  - **provisional_receipt:** Provisional receipt issued with 'pending' status
- **processing:**
  - **fifo_order:** Queued transactions processed in first-in-first-out order
  - **auto_flush:** Queue automatically flushed when connectivity restores
  - **retry_with_backoff:** Failed transactions retried with exponential backoff (max 3 retries)
- **expiry:**
  - **time_limit:** Queued transactions expire after configured duration (default 24 hours)
  - **expired_notification:** Merchant notified of expired transactions for manual resolution
- **security:**
  - **card_encryption:** Card data encrypted using terminal's hardware security module (HSM)
  - **no_plaintext:** Card data never stored in plaintext on device
  - **wipe_on_settle:** Card data wiped immediately after successful settlement
  - **palm_ref_only:** For palm payments, only the resolved proxy reference is queued — no biometric data
- **card_vs_palm:**
  - **card_offline:** Card offline transactions use encrypted card data stored in HSM
  - **palm_offline:** Palm offline transactions use the resolved palm-pay proxy reference

## Outcomes

### Transaction_queued (Priority: 1)

**Given:**
- Terminal is offline
- `amount` (input) lte `offline_max_amount`
- `current_queue_depth` (db) lt `offline_max_queue_depth`
- `current_queue_total` (computed) lt `offline_max_total_value`

**Then:**
- **create_record** target: `offline_queue` — Add transaction to offline queue
- **set_field** target: `queue_status` value: `queued`
- **set_field** target: `queued_at` value: `current timestamp`
- **set_field** target: `current_queue_depth` value: `current_queue_depth + 1`
- **set_field** target: `current_queue_total` value: `current_queue_total + amount`
- **emit_event** event: `offline.transaction.queued`

**Result:** Transaction queued for processing when connectivity restores

### Queue_flushed (Priority: 2)

**Given:**
- Connectivity restored
- `current_queue_depth` (db) gt `0`

**Then:**
- **call_service** target: `payment_backend.process_batch` — Submit all queued transactions in FIFO order
- **emit_event** event: `offline.queue.flushed`

**Result:** All queued transactions submitted for processing

### Queued_transaction_settled (Priority: 3) | Transaction: atomic

**Given:**
- `queue_status` (db) eq `processing`
- Payment backend confirms settlement

**Then:**
- **transition_state** field: `queue_status` from: `processing` to: `settled`
- **set_field** target: `processed_at` value: `current timestamp`
- **call_service** target: `receipt_service.send_confirmation` — Send final confirmation receipt replacing provisional receipt
- **emit_event** event: `offline.transaction.settled`

**Result:** Queued transaction settled — final receipt sent

### Amount_exceeds_offline_limit (Priority: 4) — Error: `OFFLINE_AMOUNT_EXCEEDED`

**Given:**
- Terminal is offline
- `amount` (input) gt `offline_max_amount`

**Then:**
- **notify** — Display message: amount too high for offline mode
- **emit_event** event: `offline.limit.amount_exceeded`

**Result:** Transaction blocked — amount exceeds offline limit

### Queue_depth_exceeded (Priority: 5) — Error: `OFFLINE_QUEUE_FULL`

**Given:**
- Terminal is offline
- `current_queue_depth` (db) gte `offline_max_queue_depth`

**Then:**
- **notify** — Display message: offline queue is full
- **emit_event** event: `offline.limit.queue_full`

**Result:** Transaction blocked — offline queue is full

### Total_value_exceeded (Priority: 6) — Error: `OFFLINE_TOTAL_EXCEEDED`

**Given:**
- Terminal is offline
- `current_queue_total` (computed) gte `offline_max_total_value`

**Then:**
- **notify** — Display message: total offline value limit reached
- **emit_event** event: `offline.limit.total_exceeded`

**Result:** Transaction blocked — total offline value limit reached

### Queued_transaction_failed (Priority: 7) — Error: `OFFLINE_PROCESSING_FAILED`

**Given:**
- `queue_status` (db) eq `processing`
- `retry_count` (db) gte `max_retries`

**Then:**
- **transition_state** field: `queue_status` from: `processing` to: `failed`
- **notify** — Alert merchant of failed offline transaction
- **emit_event** event: `offline.transaction.failed`

**Result:** Queued transaction failed after retries — merchant must resolve manually

### Transaction_expired (Priority: 8)

**Given:**
- `queue_status` (db) eq `queued`
- Transaction has been queued longer than queue_expiry_hours

**Then:**
- **transition_state** field: `queue_status` from: `queued` to: `expired`
- **notify** — Alert merchant of expired offline transaction
- **emit_event** event: `offline.transaction.expired`

**Result:** Queued transaction expired — merchant must resolve manually

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OFFLINE_AMOUNT_EXCEEDED` | 400 | Transaction amount exceeds the offline limit | No |
| `OFFLINE_QUEUE_FULL` | 503 | Offline queue is full — cannot accept more transactions | No |
| `OFFLINE_TOTAL_EXCEEDED` | 400 | Total offline transaction value limit reached | No |
| `OFFLINE_PROCESSING_FAILED` | 500 | Failed to process queued transaction after retries | No |
| `OFFLINE_TRANSACTION_EXPIRED` | 410 | Queued transaction has expired | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `offline.transaction.queued` | Transaction added to offline queue | `queue_id`, `transaction_id`, `amount`, `payment_method` |
| `offline.queue.flushed` | Offline queue flush started on reconnect | `terminal_id`, `current_queue_depth`, `current_queue_total` |
| `offline.transaction.settled` | Queued transaction processed and settled | `queue_id`, `transaction_id`, `amount` |
| `offline.transaction.failed` | Queued transaction failed after retries | `queue_id`, `transaction_id`, `amount`, `failure_reason` |
| `offline.transaction.expired` | Queued transaction expired | `queue_id`, `transaction_id`, `amount`, `queued_at` |
| `offline.limit.amount_exceeded` | Transaction blocked — amount exceeds offline limit | `transaction_id`, `amount`, `offline_max_amount` |
| `offline.limit.queue_full` | Transaction blocked — queue is full | `terminal_id`, `current_queue_depth` |
| `offline.limit.total_exceeded` | Transaction blocked — total value limit reached | `terminal_id`, `current_queue_total`, `offline_max_total_value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| terminal-payment-flow | required | Payment flow routes to offline queue when terminal is offline |
| payshap-rail | required | Queued palm payments processed via real-time rail on reconnect |
| payment-gateway | required | Queued card payments processed via payment gateway on reconnect |
| terminal-fleet | optional | Fleet management configures offline risk limits per terminal |

## AGI Readiness

### Goals

#### Reliable Terminal Offline Queue

Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect

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
| `terminal_payment_flow` | terminal-payment-flow | fail |
| `payshap_rail` | payshap-rail | fail |
| `payment_gateway` | payment-gateway | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| transaction_queued | `autonomous` | - | - |
| queue_flushed | `autonomous` | - | - |
| queued_transaction_settled | `autonomous` | - | - |
| amount_exceeds_offline_limit | `autonomous` | - | - |
| queue_depth_exceeded | `autonomous` | - | - |
| total_value_exceeded | `autonomous` | - | - |
| queued_transaction_failed | `autonomous` | - | - |
| transaction_expired | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Terminal Offline Queue Blueprint",
  "description": "Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect. 20 fields. 8 outcomes. 5 error codes. rules: risk_li",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "offline, queue, resilience, terminal, risk-management"
}
</script>
