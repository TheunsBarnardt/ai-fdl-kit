---
title: "Order Lifecycle Webhooks Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Configure and deliver webhook notifications to third-party endpoints for order lifecycle events. 13 fields. 5 outcomes. 4 error codes. rules: https_required, hm"
---

# Order Lifecycle Webhooks Blueprint

> Configure and deliver webhook notifications to third-party endpoints for order lifecycle events

| | |
|---|---|
| **Feature** | `order-lifecycle-webhooks` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | fleet, webhooks, events, integration, callbacks, api |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/order-lifecycle-webhooks.blueprint.yaml) |
| **JSON API** | [order-lifecycle-webhooks.json]({{ site.baseurl }}/api/blueprints/integration/order-lifecycle-webhooks.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `developer` | Developer | human | Technical user configuring webhook endpoints |
| `system` | Webhook Delivery Engine | system | Webhook signing, queuing, and delivery service |
| `external_service` | External Service | external | Third-party system receiving webhook payloads |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `webhook_id` | text | Yes | Webhook ID |  |
| `url` | url | Yes | Endpoint URL |  |
| `mode` | select | No | Mode |  |
| `version` | text | No | API Version |  |
| `description` | text | No | Description |  |
| `events` | json | Yes | Subscribed Events |  |
| `status` | select | Yes | Status |  |
| `api_credential_uuid` | text | No | API Credential |  |
| `request_log_id` | text | No | Request Log ID |  |
| `response_code` | number | No | HTTP Response Code |  |
| `response_body` | text | No | Response Body |  |
| `delivered_at` | datetime | No | Delivered At |  |
| `next_retry_at` | datetime | No | Next Retry At |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `disabled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `disabled` | developer |  |
|  | `disabled` | `active` | developer |  |

## Rules

- **https_required:** Webhook endpoints must use HTTPS; HTTP endpoints are rejected
- **hmac_signing:** Each payload is signed with HMAC-SHA256 using the organization's secret key
- **signature_validation:** Recipients must validate the signature to verify authenticity
- **retry_with_backoff:** Failed deliveries are retried with exponential backoff up to a configurable maximum
- **event_subscription:** Webhook subscriptions specify which event types to receive
- **request_log_retention:** Webhook request and response logs are retained for audit and debugging
- **disabled_no_delivery:** Disabled endpoints do not receive delivery attempts
- **test_mode:** Test mode sends payloads with synthetic test data without affecting live records
- **payload_structure:** Webhook payloads include event type, timestamp, and the full event data object
- **endpoint_limit:** A maximum of 100 active webhook endpoints per organization is enforced

## Outcomes

### Webhook_registered (Priority: 1)

**Given:**
- `url` (input) exists
- `events` (input) exists
- URL starts with https://

**Then:**
- **create_record**
- **emit_event** event: `webhook.registered`

**Result:** Webhook endpoint registered and ready to receive events

### Http_url_rejected (Priority: 1) — Error: `WEBHOOK_HTTPS_REQUIRED`

**Given:**
- URL does not start with https://

**Result:** Webhook registration rejected — HTTPS required

### Event_delivered (Priority: 2)

**Given:**
- subscribed event fires
- `status` (db) eq `active`

**Then:**
- **create_record**
- **emit_event** event: `webhook.delivered`

**Result:** Event payload successfully delivered to endpoint

### Delivery_failed (Priority: 3) — Error: `WEBHOOK_DELIVERY_FAILED`

**Given:**
- HTTP response code is 4xx or 5xx, or connection timed out
- retry count is below maximum

**Then:**
- **set_field** target: `next_retry_at` value: `exponential_backoff`
- **emit_event** event: `webhook.delivery_failed`

**Result:** Delivery failed; scheduled for retry

### Max_retries_exceeded (Priority: 4) — Error: `WEBHOOK_MAX_RETRIES_EXCEEDED`

**Given:**
- retry count has reached maximum

**Then:**
- **emit_event** event: `webhook.permanently_failed`

**Result:** Webhook delivery permanently failed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WEBHOOK_HTTPS_REQUIRED` | 422 | Webhook endpoints must use HTTPS. | No |
| `WEBHOOK_DELIVERY_FAILED` | 500 | Webhook delivery failed. Retrying automatically. | No |
| `WEBHOOK_MAX_RETRIES_EXCEEDED` | 500 | Webhook endpoint is unreachable after maximum retries. | No |
| `WEBHOOK_ENDPOINT_LIMIT` | 429 | Maximum number of webhook endpoints reached. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `webhook.registered` | Fired when a new webhook endpoint is configured | `webhook_id`, `url`, `events`, `mode` |
| `webhook.delivered` | Fired when an event is successfully delivered | `webhook_id`, `event_type`, `response_code`, `delivered_at` |
| `webhook.delivery_failed` | Fired when delivery fails and a retry is scheduled | `webhook_id`, `event_type`, `response_code`, `next_retry_at` |
| `webhook.permanently_failed` | Fired when all retry attempts are exhausted | `webhook_id`, `event_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Order lifecycle events are the primary webhook source |
| fleet-public-api | required | Webhooks complement the public API for event-driven integrations |
| multi-tenant-organization | required | Webhook endpoints are scoped per organization |

## AGI Readiness

### Goals

#### Reliable Order Lifecycle Webhooks

Configure and deliver webhook notifications to third-party endpoints for order lifecycle events

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `order_lifecycle` | order-lifecycle | degrade |
| `fleet_public_api` | fleet-public-api | degrade |
| `multi_tenant_organization` | multi-tenant-organization | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| webhook_registered | `autonomous` | - | - |
| event_delivered | `autonomous` | - | - |
| delivery_failed | `autonomous` | - | - |
| max_retries_exceeded | `autonomous` | - | - |
| http_url_rejected | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Lifecycle Webhooks Blueprint",
  "description": "Configure and deliver webhook notifications to third-party endpoints for order lifecycle events. 13 fields. 5 outcomes. 4 error codes. rules: https_required, hm",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, webhooks, events, integration, callbacks, api"
}
</script>
