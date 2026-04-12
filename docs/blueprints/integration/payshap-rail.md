---
title: "Payshap Rail Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling. 14 fields. 8 outcomes. 9"
---

# Payshap Rail Blueprint

> Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling

| | |
|---|---|
| **Feature** | `payshap-rail` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | payments, real-time, instant-payment, credit-push, proxy-resolution |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/payshap-rail.blueprint.yaml) |
| **JSON API** | [payshap-rail.json]({{ site.baseurl }}/api/blueprints/integration/payshap-rail.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal_app` | Terminal Application | system | Android payment terminal app initiating payment requests |
| `payment_gateway` | Payment Gateway | external | Payment orchestration platform routing transactions to the national payment system |
| `clearing_system` | Clearing System | external | National real-time clearing and settlement system |
| `receiving_bank` | Receiving Bank | external | Financial institution holding the payee's account |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `transaction_id` | token | Yes | Transaction ID |  |
| `uetr` | token | Yes | UETR |  |
| `merchant_reference` | text | Yes | Merchant Reference | Validations: maxLength |
| `source_proxy` | text | Yes | Source Proxy |  |
| `source_proxy_type` | select | Yes | Source Proxy Type |  |
| `destination_proxy` | text | Yes | Destination Proxy |  |
| `destination_proxy_type` | select | Yes | Destination Proxy Type |  |
| `amount` | number | Yes | Amount | Validations: min, max |
| `currency` | text | Yes | Currency |  |
| `status` | select | Yes | Payment Status |  |
| `initiated_at` | datetime | Yes | Initiated At |  |
| `settled_at` | datetime | No | Settled At |  |
| `failure_reason` | text | No | Failure Reason |  |
| `retry_count` | number | No | Retry Count |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `proxy_resolved` |  |  |
| `submitted` |  |  |
| `settled` |  | Yes |
| `failed` |  | Yes |
| `reversed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `proxy_resolved` | payment_gateway |  |
|  | `proxy_resolved` | `submitted` | payment_gateway |  |
|  | `submitted` | `settled` | clearing_system |  |
|  | `submitted` | `failed` | clearing_system |  |
|  | `pending` | `failed` | payment_gateway |  |
|  | `proxy_resolved` | `failed` | payment_gateway |  |
|  | `settled` | `reversed` | payment_gateway |  |

## Rules

- **proxy_resolution:**
  - **required_before_payment:** Proxy must be resolved to a valid account before submitting credit push
  - **resolution_timeout:** Proxy resolution must complete within 3 seconds
- **sla:**
  - **end_to_end_max:** 10 seconds from initiation to settlement confirmation
  - **retry_window:** Failed payments may be retried within 60 seconds
- **transaction_limits:**
  - **single_transaction_max:** R5,000 per transaction
  - **daily_limit:** R25,000 per merchant per day
- **idempotency:**
  - **duplicate_prevention:** Each transaction_id + uetr combination is unique — duplicate submissions return the original result
- **security:**
  - **tls_required:** All communication must use TLS 1.2 or higher
  - **oauth2_required:** API authentication via OAuth 2.0 bearer tokens
  - **audit_trail:** Every transaction state change must be logged with timestamp and actor
- **currency:**
  - **zar_only:** Only ZAR (South African Rand) is supported for domestic real-time payments

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| proxy_resolution | 3s |  |
| end_to_end | 10s |  |
| retry_window | 60s |  |

## Outcomes

### Proxy_resolved (Priority: 1)

**Given:**
- Payment request received with valid destination proxy
- `destination_proxy` (input) exists

**Then:**
- **call_service** target: `payment_gateway.identifier_determination` — Resolve proxy to destination account number
- **transition_state** field: `status` from: `pending` to: `proxy_resolved`
- **emit_event** event: `payshap.proxy.resolved`

**Result:** Destination account resolved — ready to submit credit push

### Payment_submitted (Priority: 2)

**Given:**
- `status` (db) eq `proxy_resolved`
- `amount` (input) lte `5000`

**Then:**
- **call_service** target: `payment_gateway.outbound_credit_transfer` — Submit credit push to clearing system via payment scheme
- **transition_state** field: `status` from: `proxy_resolved` to: `submitted`
- **emit_event** event: `payshap.payment.submitted`

**Result:** Credit push submitted to clearing system — awaiting settlement confirmation

### Payment_settled (Priority: 3) | Transaction: atomic

**Given:**
- `status` (db) eq `submitted`
- Positive response received from clearing system

**Then:**
- **transition_state** field: `status` from: `submitted` to: `settled`
- **set_field** target: `settled_at` value: `current timestamp`
- **emit_event** event: `payshap.payment.settled`

**Result:** Payment confirmed — funds transferred to destination account

### Proxy_not_found (Priority: 4) — Error: `PAYSHAP_PROXY_NOT_FOUND`

**Given:**
- `destination_proxy` (input) exists
- Proxy resolution returns no matching account

**Then:**
- **transition_state** field: `status` from: `pending` to: `failed`
- **set_field** target: `failure_reason` value: `Destination proxy not registered`
- **emit_event** event: `payshap.proxy.not_found`

**Result:** Payment failed — destination proxy is not registered in the system

### Insufficient_funds (Priority: 5) — Error: `PAYSHAP_INSUFFICIENT_FUNDS`

**Given:**
- `status` (db) eq `submitted`
- Clearing system rejects due to insufficient funds

**Then:**
- **transition_state** field: `status` from: `submitted` to: `failed`
- **set_field** target: `failure_reason` value: `Insufficient funds in source account`
- **emit_event** event: `payshap.payment.failed`

**Result:** Payment failed — insufficient funds in merchant account

### Daily_limit_exceeded (Priority: 6) — Error: `PAYSHAP_DAILY_LIMIT_EXCEEDED`

**Given:**
- `amount` (input) gt `0`
- Merchant's daily transaction total plus this amount exceeds daily limit

**Then:**
- **set_field** target: `failure_reason` value: `Daily transaction limit exceeded`
- **emit_event** event: `payshap.limit.exceeded`

**Result:** Payment blocked — merchant has exceeded their daily transaction limit

### Payment_timeout (Priority: 7) — Error: `PAYSHAP_TIMEOUT`

**Given:**
- ANY: `status` (db) eq `pending` OR `status` (db) eq `submitted`
- No response received within SLA timeout (10 seconds)

**Then:**
- **transition_state** field: `status` from: `submitted` to: `failed`
- **set_field** target: `failure_reason` value: `Transaction timed out`
- **emit_event** event: `payshap.payment.timeout`

**Result:** Payment timed out — may be retried within the retry window

### Payment_reversed (Priority: 8) | Transaction: atomic

**Given:**
- `status` (db) eq `settled`
- Reversal is authorized by manager

**Then:**
- **call_service** target: `payment_gateway.outbound_payment_return` — Submit reversal to clearing system
- **transition_state** field: `status` from: `settled` to: `reversed`
- **emit_event** event: `payshap.payment.reversed`

**Result:** Payment reversed — funds returned to source account

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAYSHAP_PROXY_NOT_FOUND` | 404 | Destination payment proxy is not registered | No |
| `PAYSHAP_INSUFFICIENT_FUNDS` | 422 | Insufficient funds to process this payment | No |
| `PAYSHAP_DAILY_LIMIT_EXCEEDED` | 429 | Daily transaction limit has been exceeded | No |
| `PAYSHAP_TIMEOUT` | 503 | Payment timed out — please try again | Yes |
| `PAYSHAP_AMOUNT_EXCEEDED` | 400 | Amount exceeds the single-transaction limit | No |
| `PAYSHAP_DUPLICATE_TRANSACTION` | 409 | Duplicate transaction — original result returned | No |
| `PAYSHAP_CLEARING_REJECTED` | 422 | Payment rejected by the clearing system | No |
| `PAYSHAP_GATEWAY_ERROR` | 503 | Payment gateway returned an error | Yes |
| `PAYSHAP_UNAUTHORIZED` | 401 | Authentication failed — invalid or expired credentials | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payshap.proxy.resolved` | Destination proxy resolved to account number | `transaction_id`, `destination_proxy`, `destination_proxy_type` |
| `payshap.proxy.not_found` | Proxy resolution failed — no matching account | `transaction_id`, `destination_proxy` |
| `payshap.payment.submitted` | Credit push submitted to clearing system | `transaction_id`, `uetr`, `amount`, `currency`, `source_proxy`, `destination_proxy` |
| `payshap.payment.settled` | Payment confirmed and settled | `transaction_id`, `uetr`, `amount`, `settled_at` |
| `payshap.payment.failed` | Payment failed with reason | `transaction_id`, `uetr`, `failure_reason` |
| `payshap.payment.timeout` | Payment timed out awaiting response | `transaction_id`, `uetr` |
| `payshap.payment.reversed` | Settled payment was reversed | `transaction_id`, `uetr`, `amount` |
| `payshap.limit.exceeded` | Transaction blocked due to limit exceeded | `transaction_id`, `amount`, `failure_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| clearing-house-outbound-payments | required | Credit push operations routed through clearing house outbound payment API |
| chp-request-to-pay | optional | Request-to-pay can be used as an alternative payment initiation method |
| palm-pay | recommended | Palm vein biometric resolves to a payment proxy for hands-free payment |
| payment-processing | recommended | General payment processing orchestration that may route to this rail |

## AGI Readiness

### Goals

#### Reliable Payshap Rail

Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling

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

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `clearing_house_outbound_payments` | clearing-house-outbound-payments | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| proxy_resolved | `autonomous` | - | - |
| payment_submitted | `autonomous` | - | - |
| payment_settled | `autonomous` | - | - |
| proxy_not_found | `autonomous` | - | - |
| insufficient_funds | `autonomous` | - | - |
| daily_limit_exceeded | `autonomous` | - | - |
| payment_timeout | `autonomous` | - | - |
| payment_reversed | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payshap Rail Blueprint",
  "description": "Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling. 14 fields. 8 outcomes. 9",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "payments, real-time, instant-payment, credit-push, proxy-resolution"
}
</script>
