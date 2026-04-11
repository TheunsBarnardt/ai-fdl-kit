---
title: "Webhook Outbound Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring. 9 fields. 8 outcomes. 7 error codes. rules: delivery, signi"
---

# Webhook Outbound Blueprint

> Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring

| | |
|---|---|
| **Feature** | `webhook-outbound` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | webhook, outbound, integration, hmac, retry, delivery-logs, event-subscriptions, api |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/webhook-outbound.blueprint.yaml) |
| **JSON API** | [webhook-outbound.json]({{ site.baseurl }}/api/blueprints/notification/webhook-outbound.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `url` | url | Yes | Endpoint URL | Validations: required, pattern, maxLength |
| `secret` | token | Yes | Signing Secret | Validations: required, minLength |
| `events` | multiselect | Yes | Subscribed Events | Validations: required |
| `active` | boolean | Yes | Active |  |
| `last_delivery_status` | select | No | Last Delivery Status |  |
| `description` | text | No | Description | Validations: maxLength |
| `headers` | json | No | Custom Headers |  |
| `failure_count` | number | No | Consecutive Failures |  |
| `disabled_at` | datetime | No | Disabled At |  |

## Rules

- **delivery:**
  - **method:** POST
  - **content_type:** application/json
  - **timeout_seconds:** 30
  - **max_retries:** 5
  - **retry_backoff:** exponential
  - **retry_base_seconds:** 60
  - **retry_schedule:** 60, 300, 1800, 7200, 86400
- **signing:**
  - **algorithm:** hmac_sha256
  - **header_name:** X-Webhook-Signature
  - **timestamp_header:** X-Webhook-Timestamp
  - **signature_format:** sha256={{signature}}
  - **replay_tolerance_seconds:** 300
- **health_monitoring:**
  - **consecutive_failure_threshold:** 10
  - **auto_disable:** true
  - **health_check_interval_minutes:** 60
  - **auto_re_enable_on_health_check:** true
- **secret_rotation:**
  - **rotation_supported:** true
  - **dual_secret_window_hours:** 24
  - **minimum_secret_length:** 32
- **payload:**
  - **max_size_bytes:** 65536
  - **include_event_type:** true
  - **include_delivery_id:** true
  - **include_timestamp:** true
  - **include_webhook_id:** true
  - **idempotency_key:** true
- **rate_limiting:**
  - **per_endpoint_per_minute:** 60
  - **global_per_second:** 200
  - **concurrent_per_endpoint:** 5
- **security:**
  - **https_only:** true
  - **ip_allowlist_support:** true
  - **secret_encryption_at_rest:** true
  - **no_redirect_follow:** true
  - **private_network_block:** true
  - **dns_rebinding_protection:** true

## Outcomes

### Invalid_endpoint (Priority: 1) — Error: `WEBHOOK_INVALID_ENDPOINT`

**Given:**
- `url` (input) not_exists

**Result:** reject with invalid endpoint error

### Endpoint_disabled (Priority: 2) — Error: `WEBHOOK_ENDPOINT_DISABLED`

**Given:**
- `active` (db) eq `false`

**Then:**
- **emit_event** event: `webhook.skipped`

**Result:** skip delivery and log that endpoint is disabled

### Ssrf_blocked (Priority: 3) — Error: `WEBHOOK_SSRF_BLOCKED`

**Given:**
- `resolved_ip` (computed) in `private_ranges`

**Result:** reject delivery to prevent SSRF attack

### Rate_limited (Priority: 4) — Error: `WEBHOOK_RATE_LIMITED`

**Given:**
- `endpoint_send_count` (computed) gte `60`

**Result:** queue for deferred delivery after rate limit window

### Webhook_delivered (Priority: 10) | Transaction: atomic

**Given:**
- `url` (db) exists
- `active` (db) eq `true`
- `event_type` (input) exists

**Then:**
- **call_service** target: `webhook_signer` — Generate HMAC-SHA256 signature of the payload
- **call_service** target: `http_client` — Deliver signed payload to endpoint URL
- **set_field** target: `failure_count` value: `0` — Reset consecutive failure counter on success
- **set_field** target: `last_delivery_status` value: `success`
- **create_record** target: `delivery_log` — Record successful delivery with response status and latency
- **emit_event** event: `webhook.delivered`

**Result:** webhook delivered successfully with signature verification

### Webhook_failed (Priority: 11) — Error: `WEBHOOK_DELIVERY_FAILED`

**Given:**
- ANY: `response_status` (system) gte `400` OR `response_status` (system) not_exists

**Then:**
- **set_field** target: `failure_count` value: `increment` — Increment consecutive failure counter
- **set_field** target: `last_delivery_status` value: `failed`
- **create_record** target: `delivery_log` — Record failed delivery with error details
- **emit_event** event: `webhook.failed`

**Result:** log failure, increment counter, and schedule retry with exponential backoff

### Webhook_auto_disabled (Priority: 12)

**Given:**
- `failure_count` (db) gte `10`

**Then:**
- **set_field** target: `active` value: `false` — Auto-disable the webhook endpoint
- **set_field** target: `disabled_at` value: `now`
- **emit_event** event: `webhook.disabled`
- **notify** target: `webhook_owner` — Notify endpoint owner that their webhook has been disabled

**Result:** endpoint auto-disabled after repeated failures; owner notified

### Secret_rotated (Priority: 13)

**Given:**
- `new_secret` (input) exists

**Then:**
- **set_field** target: `previous_secret` value: `current_secret` — Move current secret to previous (dual-secret window)
- **set_field** target: `secret` value: `new_secret` — Set new primary signing secret
- **set_field** target: `previous_secret_expires_at` value: `now + 24h` — Old secret remains valid for 24 hours
- **emit_event** event: `webhook.secret_rotated`

**Result:** new secret active immediately; old secret valid for 24-hour transition window

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WEBHOOK_INVALID_ENDPOINT` | 422 | Invalid webhook endpoint URL | No |
| `WEBHOOK_ENDPOINT_DISABLED` | 422 | Webhook endpoint is disabled | No |
| `WEBHOOK_SSRF_BLOCKED` | 403 | Webhook delivery blocked for security reasons | No |
| `WEBHOOK_RATE_LIMITED` | 429 | Webhook delivery rate limit exceeded | Yes |
| `WEBHOOK_DELIVERY_FAILED` | 503 | Webhook delivery failed | Yes |
| `WEBHOOK_PAYLOAD_TOO_LARGE` | 413 | Webhook payload exceeds maximum size | No |
| `WEBHOOK_VALIDATION_ERROR` | 422 | Please check the webhook configuration and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `webhook.delivered` | Webhook payload successfully delivered to endpoint | `webhook_id`, `delivery_id`, `url`, `event_type`, `response_status`, `latency_ms`, `timestamp` |
| `webhook.failed` | Webhook delivery failed (will retry if eligible) | `webhook_id`, `delivery_id`, `url`, `event_type`, `response_status`, `error`, `retry_count`, `timestamp` |
| `webhook.disabled` | Webhook endpoint auto-disabled after repeated failures | `webhook_id`, `url`, `failure_count`, `last_error`, `timestamp` |
| `webhook.skipped` | Webhook delivery skipped because endpoint is disabled | `webhook_id`, `url`, `event_type`, `reason`, `timestamp` |
| `webhook.secret_rotated` | Webhook signing secret was rotated | `webhook_id`, `url`, `rotated_at`, `dual_window_expires_at`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| email-notifications | optional | Email provider bounce/delivery webhooks use similar patterns |
| sms-notifications | optional | SMS delivery receipt callbacks follow webhook patterns |
| push-notifications | optional | Push delivery callbacks from providers |
| in-app-notifications | optional | Trigger in-app notification when outbound webhook fails |

## AGI Readiness

### Goals

#### Reliable Webhook Outbound

Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| delivery_reliability | speed | notifications must reach recipients even if delayed |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| invalid_endpoint | `autonomous` | - | - |
| endpoint_disabled | `human_required` | - | - |
| ssrf_blocked | `human_required` | - | - |
| rate_limited | `autonomous` | - | - |
| webhook_delivered | `autonomous` | - | - |
| webhook_failed | `autonomous` | - | - |
| webhook_auto_disabled | `human_required` | - | - |
| secret_rotated | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: settings_page
description: Webhook management in developer/integration settings
components:
  endpoint_list:
    description: List of registered webhook endpoints
    columns:
      - url
      - description
      - events
      - active
      - last_delivery_status
      - failure_count
    actions:
      - edit
      - disable
      - delete
      - test
      - rotate_secret
  endpoint_form:
    description: Create or edit a webhook endpoint
    fields_order:
      - url
      - description
      - events
      - headers
      - active
    show_secret_once: true
  delivery_log:
    description: Delivery attempt history for debugging
    columns:
      - delivery_id
      - event_type
      - response_status
      - latency_ms
      - created_at
    expandable: true
    expand_shows:
      - request_payload
      - response_body
      - headers
  test_delivery:
    description: Send a test webhook payload to verify endpoint
    action: send_test
    shows_response: true
accessibility:
  aria_live_region: true
  keyboard_navigation: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Webhook Outbound Blueprint",
  "description": "Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring. 9 fields. 8 outcomes. 7 error codes. rules: delivery, signi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "webhook, outbound, integration, hmac, retry, delivery-logs, event-subscriptions, api"
}
</script>
