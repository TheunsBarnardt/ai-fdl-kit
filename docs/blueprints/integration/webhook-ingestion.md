---
title: "Webhook Ingestion Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async hand"
---

# Webhook Ingestion Blueprint

> Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async handler routing

| | |
|---|---|
| **Feature** | `webhook-ingestion` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | webhooks, ingestion, signature-verification, replay-protection, events |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/webhook-ingestion.blueprint.yaml) |
| **JSON API** | [webhook-ingestion.json]({{ site.baseurl }}/api/blueprints/integration/webhook-ingestion.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `source` | text | Yes | Webhook source identifier (e.g., provider name or integration ID) |  |
| `event_type` | text | Yes | Event type from the external service (e.g., payment.completed) |  |
| `payload` | json | Yes | Raw webhook payload body |  |
| `signature` | text | Yes | Cryptographic signature from the webhook header |  |
| `signature_algorithm` | select | No | Signature verification algorithm |  |
| `timestamp` | datetime | Yes | Webhook timestamp from the provider header |  |
| `event_id` | text | Yes | Unique event identifier for idempotency deduplication |  |
| `processing_status` | select | No | Current processing status |  |
| `handler_id` | text | No | Registered handler that processes this event type |  |
| `retry_count` | number | No | Number of handler retry attempts |  |
| `webhook_secret` | hidden | Yes | Shared secret or public key for signature verification |  |

## Rules

- **signature_verification:** Every incoming webhook must include a cryptographic signature in the request header, HMAC-SHA256: compute HMAC of raw body using shared secret; compare with provided signature, RSA-SHA256: verify signature using provider's public key against raw body, Reject webhook immediately if signature does not match (do not process payload), Use constant-time comparison to prevent timing attacks on signature verification
- **replay_protection:** Reject webhooks with timestamp older than 5 minutes from current server time, Clock skew tolerance of 30 seconds to account for network delays, Store processed event_ids for deduplication window (minimum 24 hours)
- **idempotency:** Deduplicate by event_id; if event_id already processed, return 200 without re-processing, Deduplication window is 24 hours; events older than 24 hours may be reprocessed
- **processing:** Store raw payload before processing (audit trail and replay capability), Route events to registered handlers based on source + event_type combination, Process handlers asynchronously; return 200 immediately to webhook sender, Failed handlers retry 3 times with exponential backoff (1s, 4s, 16s)
- **response:** Always return 200 status to webhook sender after signature verification, Return 401 for invalid signatures; return 400 for malformed payloads, Provider will retry on non-2xx responses; avoid unnecessary retries by responding quickly

## Outcomes

### Webhook_received_and_verified (Priority: 1)

**Given:**
- `signature` (request) exists
- `timestamp` (request) exists
- `event_id` (request) exists
- Signature verification passes against raw payload
- Timestamp is within 5-minute replay window

**Then:**
- **create_record**
- **set_field** target: `processing_status` value: `verified`
- **emit_event** event: `webhook.received`
- **emit_event** event: `webhook.verified`

**Result:** Webhook stored and verified; 200 returned to sender; async processing initiated

### Webhook_processed_successfully (Priority: 2)

**Given:**
- `processing_status` (db) eq `verified`
- Handler registered for source + event_type combination
- Handler executes without error

**Then:**
- **set_field** target: `processing_status` value: `completed`
- **emit_event** event: `webhook.processed`

**Result:** Webhook event processed by registered handler; status marked completed

### Webhook_handler_failed_with_retry (Priority: 3)

**Given:**
- `processing_status` (db) in `verified,processing`
- Handler throws an error during processing
- `retry_count` (db) lt `3`

**Then:**
- **set_field** target: `retry_count` value: `retry_count + 1`
- **set_field** target: `processing_status` value: `processing`

**Result:** Handler retried with exponential backoff; retry count incremented

### Webhook_handler_failed_permanently (Priority: 4) — Error: `WEBHOOK_HANDLER_FAILED`

**Given:**
- `retry_count` (db) gte `3`

**Then:**
- **set_field** target: `processing_status` value: `failed`
- **emit_event** event: `webhook.failed`

**Result:** Handler exhausted all retries; webhook marked as failed for manual investigation

### Webhook_signature_invalid (Priority: 5) — Error: `WEBHOOK_SIGNATURE_INVALID`

**Given:**
- Computed signature does not match provided signature

**Then:**
- **emit_event** event: `webhook.failed`

**Result:** 401 returned; webhook rejected without storing or processing payload

### Webhook_replay_detected (Priority: 6) — Error: `WEBHOOK_REPLAY_DETECTED`

**Given:**
- Timestamp is older than 5 minutes from current server time

**Then:**
- **emit_event** event: `webhook.failed`

**Result:** 400 returned; stale webhook rejected as potential replay attack

### Webhook_duplicate_event (Priority: 7)

**Given:**
- event_id already exists in processed events store

**Result:** 200 returned without re-processing; duplicate event silently ignored

### Webhook_no_handler (Priority: 8) — Error: `WEBHOOK_NO_HANDLER`

**Given:**
- No handler registered for the source + event_type combination

**Then:**
- **set_field** target: `processing_status` value: `completed`
- **emit_event** event: `webhook.received`

**Result:** Webhook stored for audit but no processing performed; 200 returned to sender

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Webhook signature verification failed. Payload may have been tampered with. | No |
| `WEBHOOK_REPLAY_DETECTED` | 400 | Webhook timestamp is too old. Possible replay attack detected. | No |
| `WEBHOOK_HANDLER_FAILED` | 500 | Webhook handler failed after all retry attempts. Manual investigation required. | No |
| `WEBHOOK_NO_HANDLER` | 400 | No handler registered for this event type. Webhook stored but not processed. | No |
| `WEBHOOK_PAYLOAD_MALFORMED` | 400 | Webhook payload could not be parsed. Expected valid JSON body. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `webhook.received` |  | `source`, `event_type`, `event_id`, `timestamp` |
| `webhook.verified` |  | `source`, `event_type`, `event_id` |
| `webhook.processed` |  | `source`, `event_type`, `event_id`, `handler_id` |
| `webhook.failed` |  | `source`, `event_type`, `event_id`, `error_code`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payment-gateway | recommended | Receive payment status updates via provider webhooks |
| email-service | optional | Receive email delivery status notifications via webhooks |
| message-queue | recommended | Queue verified webhooks for async handler processing |
| api-gateway | optional | Route incoming webhooks through gateway for rate limiting |

## AGI Readiness

### Goals

#### Secure Ingestion

Process incoming webhooks securely with zero tolerance for forged or replayed events

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| signature_verification_rate | 100% | All processed webhooks have valid signatures |
| replay_rejection_rate | 100% | All duplicate event_ids within the dedup window are rejected |
| processing_latency | < 200ms to acknowledge | Time from webhook receipt to HTTP 200 response |

**Constraints:**

- **security** (non-negotiable): Reject any webhook that fails signature verification — no fallback to unverified processing
- **performance** (negotiable): Acknowledge receipt quickly, process asynchronously

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before registering a new webhook source with signing keys
- before disabling signature verification for any source

**Escalation Triggers:**

- `invalid_signature_rate > 5`
- `replay_attempt_rate > 10`
- `handler_error_rate > 3`

### Verification

**Invariants:**

- every processed webhook has a verified signature
- no event_id is processed more than once within the deduplication window
- webhook payloads are never modified between receipt and handler delivery
- signing keys are stored encrypted and never logged

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| valid webhook processing | a webhook with valid HMAC signature and unique event_id | the webhook is received | HTTP 200 returned and payload dispatched to correct handler |
| invalid signature rejection | a webhook with tampered signature | the webhook is received | HTTP 401 returned and event logged as security incident |
| replay protection | a webhook with an event_id that was already processed | the duplicate webhook is received | HTTP 200 returned (idempotent) but handler is not invoked again |
| handler failure retry | a valid webhook whose handler fails with a transient error | the handler returns a 5xx status | webhook queued for retry with exponential backoff up to max_retries |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| process_webhook | `autonomous` | - | - |
| register_source | `supervised` | - | - |
| disable_source | `human_required` | - | - |
| rotate_signing_keys | `human_required` | - | - |
| purge_dedup_cache | `supervised` | 1h | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Webhook Ingestion Blueprint",
  "description": "Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async hand",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "webhooks, ingestion, signature-verification, replay-protection, events"
}
</script>
