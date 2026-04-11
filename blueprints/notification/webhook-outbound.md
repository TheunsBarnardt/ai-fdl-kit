<!-- AUTO-GENERATED FROM webhook-outbound.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Webhook Outbound

> Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring

**Category:** Notification · **Version:** 1.0.0 · **Tags:** webhook · outbound · integration · hmac · retry · delivery-logs · event-subscriptions · api

## What this does

Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **url** *(url, required)* — Endpoint URL
- **secret** *(token, required)* — Signing Secret
- **events** *(multiselect, required)* — Subscribed Events
- **active** *(boolean, required)* — Active
- **last_delivery_status** *(select, optional)* — Last Delivery Status
- **description** *(text, optional)* — Description
- **headers** *(json, optional)* — Custom Headers
- **failure_count** *(number, optional)* — Consecutive Failures
- **disabled_at** *(datetime, optional)* — Disabled At

## What must be true

- **delivery → method:** POST
- **delivery → content_type:** application/json
- **delivery → timeout_seconds:** 30
- **delivery → max_retries:** 5
- **delivery → retry_backoff:** exponential
- **delivery → retry_base_seconds:** 60
- **delivery → retry_schedule:** 60, 300, 1800, 7200, 86400
- **signing → algorithm:** hmac_sha256
- **signing → header_name:** X-Webhook-Signature
- **signing → timestamp_header:** X-Webhook-Timestamp
- **signing → signature_format:** sha256={{signature}}
- **signing → replay_tolerance_seconds:** 300
- **health_monitoring → consecutive_failure_threshold:** 10
- **health_monitoring → auto_disable:** true
- **health_monitoring → health_check_interval_minutes:** 60
- **health_monitoring → auto_re_enable_on_health_check:** true
- **secret_rotation → rotation_supported:** true
- **secret_rotation → dual_secret_window_hours:** 24
- **secret_rotation → minimum_secret_length:** 32
- **payload → max_size_bytes:** 65536
- **payload → include_event_type:** true
- **payload → include_delivery_id:** true
- **payload → include_timestamp:** true
- **payload → include_webhook_id:** true
- **payload → idempotency_key:** true
- **rate_limiting → per_endpoint_per_minute:** 60
- **rate_limiting → global_per_second:** 200
- **rate_limiting → concurrent_per_endpoint:** 5
- **security → https_only:** true
- **security → ip_allowlist_support:** true
- **security → secret_encryption_at_rest:** true
- **security → no_redirect_follow:** true
- **security → private_network_block:** true
- **security → dns_rebinding_protection:** true

## Success & failure scenarios

**✅ Success paths**

- **Webhook Delivered** — when Webhook endpoint is registered; Endpoint is active; Event type matches a subscribed event, then webhook delivered successfully with signature verification.
- **Webhook Auto Disabled** — when 10+ consecutive delivery failures, then endpoint auto-disabled after repeated failures; owner notified.
- **Secret Rotated** — when A new signing secret is provided for rotation, then new secret active immediately; old secret valid for 24-hour transition window.

**❌ Failure paths**

- **Invalid Endpoint** — when URL is missing or invalid, then reject with invalid endpoint error. *(error: `WEBHOOK_INVALID_ENDPOINT`)*
- **Endpoint Disabled** — when Webhook endpoint is disabled, then skip delivery and log that endpoint is disabled. *(error: `WEBHOOK_ENDPOINT_DISABLED`)*
- **Ssrf Blocked** — when URL resolves to private/internal IP range, then reject delivery to prevent SSRF attack. *(error: `WEBHOOK_SSRF_BLOCKED`)*
- **Rate Limited** — when Endpoint has received 60+ deliveries this minute, then queue for deferred delivery after rate limit window. *(error: `WEBHOOK_RATE_LIMITED`)*
- **Webhook Failed** — when Endpoint returned 4xx or 5xx error OR Connection timeout or network error, then log failure, increment counter, and schedule retry with exponential backoff. *(error: `WEBHOOK_DELIVERY_FAILED`)*

## Errors it can return

- `WEBHOOK_INVALID_ENDPOINT` — Invalid webhook endpoint URL
- `WEBHOOK_ENDPOINT_DISABLED` — Webhook endpoint is disabled
- `WEBHOOK_SSRF_BLOCKED` — Webhook delivery blocked for security reasons
- `WEBHOOK_RATE_LIMITED` — Webhook delivery rate limit exceeded
- `WEBHOOK_DELIVERY_FAILED` — Webhook delivery failed
- `WEBHOOK_PAYLOAD_TOO_LARGE` — Webhook payload exceeds maximum size
- `WEBHOOK_VALIDATION_ERROR` — Please check the webhook configuration and try again

## Connects to

- **email-notifications** *(optional)* — Email provider bounce/delivery webhooks use similar patterns
- **sms-notifications** *(optional)* — SMS delivery receipt callbacks follow webhook patterns
- **push-notifications** *(optional)* — Push delivery callbacks from providers
- **in-app-notifications** *(optional)* — Trigger in-app notification when outbound webhook fails

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/webhook-outbound/) · **Spec source:** [`webhook-outbound.blueprint.yaml`](./webhook-outbound.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
