<!-- AUTO-GENERATED FROM webhook-ingestion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Webhook Ingestion

> Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async handler routing

**Category:** Integration · **Version:** 1.0.0 · **Tags:** webhooks · ingestion · signature-verification · replay-protection · events

## What this does

Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async handler routing

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **source** *(text, required)* — Webhook source identifier (e.g., provider name or integration ID)
- **event_type** *(text, required)* — Event type from the external service (e.g., payment.completed)
- **payload** *(json, required)* — Raw webhook payload body
- **signature** *(text, required)* — Cryptographic signature from the webhook header
- **signature_algorithm** *(select, optional)* — Signature verification algorithm
- **timestamp** *(datetime, required)* — Webhook timestamp from the provider header
- **event_id** *(text, required)* — Unique event identifier for idempotency deduplication
- **processing_status** *(select, optional)* — Current processing status
- **handler_id** *(text, optional)* — Registered handler that processes this event type
- **retry_count** *(number, optional)* — Number of handler retry attempts
- **webhook_secret** *(hidden, required)* — Shared secret or public key for signature verification

## What must be true

- **signature_verification:** Every incoming webhook must include a cryptographic signature in the request header, HMAC-SHA256: compute HMAC of raw body using shared secret; compare with provided signature, RSA-SHA256: verify signature using provider's public key against raw body, Reject webhook immediately if signature does not match (do not process payload), Use constant-time comparison to prevent timing attacks on signature verification
- **replay_protection:** Reject webhooks with timestamp older than 5 minutes from current server time, Clock skew tolerance of 30 seconds to account for network delays, Store processed event_ids for deduplication window (minimum 24 hours)
- **idempotency:** Deduplicate by event_id; if event_id already processed, return 200 without re-processing, Deduplication window is 24 hours; events older than 24 hours may be reprocessed
- **processing:** Store raw payload before processing (audit trail and replay capability), Route events to registered handlers based on source + event_type combination, Process handlers asynchronously; return 200 immediately to webhook sender, Failed handlers retry 3 times with exponential backoff (1s, 4s, 16s)
- **response:** Always return 200 status to webhook sender after signature verification, Return 401 for invalid signatures; return 400 for malformed payloads, Provider will retry on non-2xx responses; avoid unnecessary retries by responding quickly

## Success & failure scenarios

**✅ Success paths**

- **Webhook Received And Verified** — when signature exists; timestamp exists; event_id exists; Signature verification passes against raw payload; Timestamp is within 5-minute replay window, then Webhook stored and verified; 200 returned to sender; async processing initiated.
- **Webhook Processed Successfully** — when processing_status eq "verified"; Handler registered for source + event_type combination; Handler executes without error, then Webhook event processed by registered handler; status marked completed.
- **Webhook Handler Failed With Retry** — when processing_status in ["verified","processing"]; Handler throws an error during processing; retry_count lt 3, then Handler retried with exponential backoff; retry count incremented.
- **Webhook Duplicate Event** — when event_id already exists in processed events store, then 200 returned without re-processing; duplicate event silently ignored.

**❌ Failure paths**

- **Webhook Handler Failed Permanently** — when retry_count gte 3, then Handler exhausted all retries; webhook marked as failed for manual investigation. *(error: `WEBHOOK_HANDLER_FAILED`)*
- **Webhook Signature Invalid** — when Computed signature does not match provided signature, then 401 returned; webhook rejected without storing or processing payload. *(error: `WEBHOOK_SIGNATURE_INVALID`)*
- **Webhook Replay Detected** — when Timestamp is older than 5 minutes from current server time, then 400 returned; stale webhook rejected as potential replay attack. *(error: `WEBHOOK_REPLAY_DETECTED`)*
- **Webhook No Handler** — when No handler registered for the source + event_type combination, then Webhook stored for audit but no processing performed; 200 returned to sender. *(error: `WEBHOOK_NO_HANDLER`)*

## Errors it can return

- `WEBHOOK_SIGNATURE_INVALID` — Webhook signature verification failed. Payload may have been tampered with.
- `WEBHOOK_REPLAY_DETECTED` — Webhook timestamp is too old. Possible replay attack detected.
- `WEBHOOK_HANDLER_FAILED` — Webhook handler failed after all retry attempts. Manual investigation required.
- `WEBHOOK_NO_HANDLER` — No handler registered for this event type. Webhook stored but not processed.
- `WEBHOOK_PAYLOAD_MALFORMED` — Webhook payload could not be parsed. Expected valid JSON body.

## Connects to

- **payment-gateway** *(recommended)* — Receive payment status updates via provider webhooks
- **email-service** *(optional)* — Receive email delivery status notifications via webhooks
- **message-queue** *(recommended)* — Queue verified webhooks for async handler processing
- **api-gateway** *(optional)* — Route incoming webhooks through gateway for rate limiting

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/webhook-ingestion/) · **Spec source:** [`webhook-ingestion.blueprint.yaml`](./webhook-ingestion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
