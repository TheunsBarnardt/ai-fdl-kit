---
title: "Payment Gateway Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates. 12 fields. "
---

# Payment Gateway Blueprint

> Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates

| | |
|---|---|
| **Feature** | `payment-gateway` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | payments, gateway, transactions, pci, financial |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/payment-gateway.blueprint.yaml) |
| **JSON API** | [payment-gateway.json]({{ site.baseurl }}/api/blueprints/integration/payment-gateway.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `amount` | number | Yes | Payment amount in smallest currency unit (e.g., cents) | Validations: min |
| `currency` | text | Yes | ISO 4217 currency code (e.g., USD, EUR, GBP) | Validations: pattern |
| `payment_method_token` | token | Yes | Tokenized payment method (never raw card data) |  |
| `description` | text | No | Human-readable payment description | Validations: maxLength |
| `metadata` | json | No | Arbitrary key-value metadata attached to the payment |  |
| `idempotency_key` | text | Yes | Unique key to prevent duplicate charges | Validations: maxLength |
| `status` | select | No | Current payment status |  |
| `provider_transaction_id` | text | No | Transaction ID from the payment provider |  |
| `failure_code` | text | No | Provider-specific failure code |  |
| `failure_message` | text | No | Human-readable failure description |  |
| `three_d_secure_status` | select | No | 3D Secure authentication status |  |
| `refund_amount` | number | No | Amount to refund (partial or full) | Validations: min |

## Rules

- **idempotency:** Every mutation (charge, capture, void, refund) must include an idempotency_key, Duplicate requests with same idempotency_key return the original response without re-processing, Idempotency keys expire after 24 hours
- **pci_compliance:** Raw card numbers, CVV, and magnetic stripe data must never be logged, stored, or transmitted, Only tokenized payment methods (payment_method_token) are accepted, All payment API communication occurs over TLS 1.2+
- **three_d_secure:** 3D Secure authentication required for card-not-present transactions when mandated by issuer, If 3D Secure fails, payment may proceed at merchant's risk (liability shift)
- **webhook_verification:** All provider webhook payloads must be verified via HMAC signature before processing, Webhook events update payment status asynchronously
- **amounts:** Amount must be a positive integer in smallest currency unit (cents, pence, etc.), Refund amount must not exceed original captured amount, Partial refunds allowed; total refunds must not exceed captured amount
- **authorization:** Authorization holds expire after 7 days if not captured, Voiding releases the hold immediately; only authorized (uncaptured) payments can be voided

## Outcomes

### Payment_authorized (Priority: 1)

**Given:**
- `amount` (input) gt `0`
- `payment_method_token` (input) exists
- `idempotency_key` (input) exists

**Then:**
- **set_field** target: `status` value: `authorized`
- **emit_event** event: `payment.authorized`

**Result:** Payment authorized; funds held on customer payment method pending capture

### Payment_captured (Priority: 2)

**Given:**
- `status` (db) eq `authorized`
- Capture request received within authorization hold period

**Then:**
- **transition_state** field: `status` from: `authorized` to: `captured`
- **emit_event** event: `payment.captured`

**Result:** Payment captured; funds transferred from customer to merchant

### Payment_voided (Priority: 3)

**Given:**
- `status` (db) eq `authorized`
- Void request received before capture

**Then:**
- **transition_state** field: `status` from: `authorized` to: `voided`
- **emit_event** event: `payment.voided`

**Result:** Authorization voided; hold released on customer payment method

### Payment_refunded (Priority: 4)

**Given:**
- `status` (db) in `captured,partially_refunded`
- `refund_amount` (input) gt `0`

**Then:**
- **emit_event** event: `payment.refunded`

**Result:** Refund processed; funds returned to customer payment method within 5-10 business days

### Payment_failed_declined (Priority: 5) — Error: `PAYMENT_DECLINED`

**Given:**
- Payment provider declines the transaction (insufficient funds, fraud, expired card)

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `payment.failed`

**Result:** Payment declined; failure code and message returned to caller

### Payment_failed_3ds (Priority: 6) — Error: `THREE_D_SECURE_FAILED`

**Given:**
- `three_d_secure_status` (computed) eq `failed`

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `payment.failed`

**Result:** 3D Secure authentication failed; payment not processed

### Payment_failed_invalid_token (Priority: 7) — Error: `INVALID_PAYMENT_TOKEN`

**Given:**
- payment_method_token is expired, revoked, or does not exist

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `payment.failed`

**Result:** Payment rejected; customer must provide a new payment method

### Duplicate_request (Priority: 8)

**Given:**
- Request with same idempotency_key already processed

**Result:** Original response returned without re-processing the payment

### Refund_exceeds_captured (Priority: 9) — Error: `REFUND_EXCEEDS_AMOUNT`

**Given:**
- Refund amount exceeds remaining captured amount

**Then:**
- **emit_event** event: `payment.refund_failed`

**Result:** Refund rejected; amount exceeds what is available to refund

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAYMENT_DECLINED` | 422 | Payment was declined by the issuer. Try a different payment method. | No |
| `THREE_D_SECURE_FAILED` | 401 | 3D Secure authentication failed. Payment cannot be processed. | No |
| `INVALID_PAYMENT_TOKEN` | 400 | Payment method token is invalid or expired. Provide a new payment method. | No |
| `REFUND_EXCEEDS_AMOUNT` | 400 | Refund amount exceeds the captured payment amount. | No |
| `AUTHORIZATION_EXPIRED` | 400 | Authorization hold has expired. Create a new payment authorization. | No |
| `VOID_NOT_ALLOWED` | 400 | Payment cannot be voided. Only authorized (uncaptured) payments can be voided. | No |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Webhook signature verification failed. Payload may have been tampered with. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payment.authorized` |  | `provider_transaction_id`, `amount`, `currency`, `payment_method_type` |
| `payment.captured` |  | `provider_transaction_id`, `amount`, `currency` |
| `payment.voided` |  | `provider_transaction_id`, `amount`, `currency` |
| `payment.refunded` |  | `provider_transaction_id`, `refund_amount`, `currency`, `remaining_amount` |
| `payment.failed` |  | `provider_transaction_id`, `failure_code`, `failure_message` |
| `payment.refund_failed` |  | `provider_transaction_id`, `refund_amount`, `error_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| webhook-ingestion | required | Receive async payment status updates from provider webhooks |
| api-gateway | recommended | Route payment API requests through gateway with rate limiting |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payment Gateway Blueprint",
  "description": "Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates. 12 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "payments, gateway, transactions, pci, financial"
}
</script>
