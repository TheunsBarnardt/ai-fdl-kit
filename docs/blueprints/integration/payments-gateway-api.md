---
title: "Payments Gateway Api Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Central HTTP surface for all payment operations — thin-client terminals and admin consoles call this; PGW owns rail selection, EMV, fraud, refunds, disputes. 9 "
---

# Payments Gateway Api Blueprint

> Central HTTP surface for all payment operations — thin-client terminals and admin consoles call this; PGW owns rail selection, EMV, fraud, refunds, disputes

| | |
|---|---|
| **Feature** | `payments-gateway-api` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | gateway, api, payments, rails, emv, fraud, refund, dispute |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/payments-gateway-api.blueprint.yaml) |
| **JSON API** | [payments-gateway-api.json]({{ site.baseurl }}/api/blueprints/integration/payments-gateway-api.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal_client` | Thin-client Terminal | system | Device initiating payments, refunds, and palm-session resolution |
| `admin_console` | Admin Console | system | Operator UI that issues refund / dispute / config calls |
| `rail_adapter` | Rail Adapter | external | Pluggable rail implementation invoked by PGW per routing policy |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `payment_id` | token | Yes | Payment ID |  |
| `merchant_id` | text | Yes | Merchant ID |  |
| `amount` | number | Yes | Amount (cents) | Validations: min |
| `currency` | text | Yes | ISO-4217 currency code | Validations: pattern |
| `method` | select | Yes | Payment method |  |
| `palm_session_token` | token | No | Palm session token (when method=palm) |  |
| `card_data_encrypted` | text | No | SPoC-encrypted card data (when method=card_*) |  |
| `device_attestation` | text | Yes | Signed device attestation — validated per call |  |
| `idempotency_key` | token | Yes | Client-generated idempotency key |  |

## Rules

- **security:** MUST: mTLS + device attestation verified on every request, MUST: idempotency_key deduplicates retries within 24h, MUST: card data is SPoC-encrypted end-to-end; PGW decrypts inside HSM boundary only, MUST: response never includes full PAN or CVV
- **routing:** MUST: rail selection runs through the Rail Registry policy engine, not hardcoded, MUST: on rail failure, return 502 with PGW_RAIL_ERROR — do not fall back silently
- **observability:** MUST: emit payment.initiated / payment.settled / payment.failed events for audit and metrics

## Outcomes

### Attestation_failed (Priority: 1) — Error: `PGW_ATTESTATION_FAILED`

**Given:**
- device attestation signature invalid or expired

**Then:**
- **emit_event** event: `payment.attestation_failed`

**Result:** 401 — device attestation rejected; no rail call made

### Rate_limited (Priority: 2) — Error: `PGW_RATE_LIMITED`

**Given:**
- `requests_in_window` (computed) gt `100`

**Then:**
- **emit_event** event: `payment.rate_limited`

**Result:** 429 — request throttled

### Idempotency_conflict (Priority: 5) — Error: `PGW_IDEMPOTENCY_CONFLICT`

**Given:**
- idempotency_key seen within 24h with different payload

**Result:** 409 — conflicting retry

### Palm_session_expired (Priority: 10) — Error: `PGW_PALM_SESSION_EXPIRED`

**Given:**
- method == palm
- palm_session_token expired or not found

**Result:** 422 — resolve palm session again

### Rail_error (Priority: 50) — Error: `PGW_RAIL_ERROR`

**Given:**
- rail adapter returns non-success after retry

**Then:**
- **emit_event** event: `payment.rail_error`

**Result:** 502 — rail error surfaced to caller; transaction not settled

### Successful_palm_payment (Priority: 100)

**Given:**
- method == palm
- palm_session_token valid and unexpired
- device attestation verified
- rail routing succeeds

**Then:**
- **call_service** target: `rail_registry.route_and_execute`
- **emit_event** event: `payment.settled`
- **call_service** target: `receipt_service.send`

**Result:** Payment settled via selected rail; receipt queued

### Successful_card_payment (Priority: 110)

**Given:**
- method in [card_chip, card_tap, card_stripe]
- cloud EMV kernel authorises
- rail routing succeeds

**Then:**
- **call_service** target: `cloud_emv_kernel.process`
- **call_service** target: `rail_registry.route_and_execute`
- **emit_event** event: `payment.settled`

**Result:** Card payment authorised and captured

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PGW_INVALID_REQUEST` | 400 | Invalid payment request | No |
| `PGW_ATTESTATION_FAILED` | 401 | Device authentication failed | No |
| `PGW_IDEMPOTENCY_CONFLICT` | 409 | Duplicate request with different payload | No |
| `PGW_PALM_SESSION_EXPIRED` | 422 | Palm session expired — please rescan | No |
| `PGW_RATE_LIMITED` | 429 | Too many requests — retry later | No |
| `PGW_RAIL_ERROR` | 503 | Payment network error | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payment.initiated` | Payment request accepted and queued for rail routing |  |
| `payment.settled` | Payment confirmed by rail |  |
| `payment.failed` | Payment rejected or errored at any stage |  |
| `payment.rate_limited` |  |  |
| `payment.attestation_failed` |  |  |
| `payment.rail_error` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Handles personal information of SA data subjects — must satisfy POPIA Act 4 of 2013 |
| rail-registry | required | Rail selection is delegated to the registry — PGW never hard-codes rails |
| cloud-emv-kernel | required | Card payments require cloud EMV — terminal is SPoC passthrough only |
| device-attestation | required | Every call requires a verified device attestation |
| fraud-detection | required | Every payment is scored before rail execution |
| palm-pay | required | Palm sessions resolve to payment proxies via PGW |
| payment-observability | recommended | Transaction metrics, latency p50/p95/p99, and alerting |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payments Gateway Api Blueprint",
  "description": "Central HTTP surface for all payment operations — thin-client terminals and admin consoles call this; PGW owns rail selection, EMV, fraud, refunds, disputes. 9 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gateway, api, payments, rails, emv, fraud, refund, dispute"
}
</script>
