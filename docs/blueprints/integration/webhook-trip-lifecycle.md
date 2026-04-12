---
title: "Webhook Trip Lifecycle Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "HTTP webhook delivery for order and driver lifecycle events, allowing external systems to react to ride state changes in real time.. 7 fields. 4 outcomes. 2 err"
---

# Webhook Trip Lifecycle Blueprint

> HTTP webhook delivery for order and driver lifecycle events, allowing external systems to react to ride state changes in real time.

| | |
|---|---|
| **Feature** | `webhook-trip-lifecycle` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | webhooks, events, notifications, order-lifecycle, driver |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/webhook-trip-lifecycle.blueprint.yaml) |
| **JSON API** | [webhook-trip-lifecycle.json]({{ site.baseurl }}/api/blueprints/integration/webhook-trip-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `operator` | Operator | human | Configures webhook endpoints for their organization. |
| `platform` | Platform | system | Delivers signed webhook payloads to registered endpoints on event occurrence. |
| `receiver` | Receiver | external | External service or application that receives and processes webhooks. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `endpoint_url` | url | Yes | HTTPS URL that will receive webhook POST requests. |  |
| `events` | multiselect | No | List of event types this endpoint subscribes to. Empty means all events. |  |
| `mode` | select | No | Whether this endpoint is live or in test mode. |  |
| `version` | text | No | API version for the webhook payload format. |  |
| `description` | text | No | Human-readable label for this endpoint. |  |
| `status` | select | No | Whether this endpoint is active or disabled. |  |
| `api_credential_id` | text | No | The API credential this endpoint is scoped to. |  |

## Rules

- **rule_01:** Webhook endpoints are scoped to an organization; each organization manages its own endpoints.
- **rule_02:** An endpoint may subscribe to a specific list of event types or receive all events (empty events array).
- **rule_03:** The platform delivers events as HTTP POST requests to the registered URL with a JSON payload.
- **rule_04:** Delivery includes the full resource payload for the affected entity (order or driver).
- **rule_05:** Failed deliveries are logged in the webhook request log with status code and response body.
- **rule_06:** Event types are fixed and defined at the platform level; custom event types are not supported.
- **rule_07:** Endpoints can be filtered by mode (live vs test) to separate production and test traffic.

## Outcomes

### Endpoint_registered (Priority: 1)

**Given:**
- operator provides a valid HTTPS URL

**Then:**
- **create_record** — Endpoint is stored with URL, event subscriptions, mode, and status.

**Result:** Endpoint is active and will receive matching events from this point forward.

### Event_delivered (Priority: 2)

**Given:**
- a lifecycle event fires (e.g., order.dispatched, order.completed)
- one or more active endpoints subscribe to this event type

**Then:**
- **call_service** target: `webhook_endpoint_url` — An HTTP POST request is sent to each subscribed endpoint URL with the event payload.
- **create_record** — Delivery attempt is logged with timestamp, response code, and response body.

**Result:** External system receives the event payload and can react (e.g., update its own database, trigger actions).

### Delivery_failed (Priority: 3)

**Given:**
- the endpoint URL returns a non-2xx status or times out

**Then:**
- **create_record** — Failed attempt is logged with error details.

**Result:** Operator can inspect the log and debug the endpoint configuration.

### All_events_subscribed (Priority: 4)

**Given:**
- endpoint is registered with an empty events list

**Result:** Endpoint receives every event type fired by the platform.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WEBHOOK_URL_INVALID` | 400 | The provided webhook URL is not a valid HTTPS URL. | No |
| `WEBHOOK_ENDPOINT_NOT_FOUND` | 404 | The specified webhook endpoint could not be found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.created` | An order has been created. | `order_id`, `customer_id`, `status`, `pickup_location`, `dropoff_location` |
| `order.dispatched` | An order has been dispatched to a driver. | `order_id`, `driver_id`, `dispatched_at` |
| `order.driver_assigned` | A driver has been assigned to an order. | `order_id`, `driver_id` |
| `order.updated` | An order's status or data has changed. | `order_id`, `status`, `updated_at` |
| `order.completed` | An order has been completed. | `order_id`, `driver_id`, `customer_id` |
| `order.dispatch_failed` | Order dispatch failed to find a driver. | `order_id` |
| `driver.assigned` | A driver has been assigned to an entity or order. | `driver_id`, `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Lifecycle events are the source of webhook delivery. |
| multi-tenant-organization | required | Webhook endpoints are scoped per organization. |
| fleet-ops-public-api | recommended | API credentials scope which endpoints can register webhooks. |

## AGI Readiness

### Goals

#### Reliable Webhook Trip Lifecycle

HTTP webhook delivery for order and driver lifecycle events, allowing external systems to react to ride state changes in real time.

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

- before making irreversible changes

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
| `ride_request_lifecycle` | ride-request-lifecycle | degrade |
| `multi_tenant_organization` | multi-tenant-organization | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| endpoint_registered | `autonomous` | - | - |
| event_delivered | `autonomous` | - | - |
| delivery_failed | `autonomous` | - | - |
| all_events_subscribed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Models/WebhookEndpoint.php
    - src/Models/WebhookRequestLog.php
    - config/api.php
    - src/Models/Order.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Webhook Trip Lifecycle Blueprint",
  "description": "HTTP webhook delivery for order and driver lifecycle events, allowing external systems to react to ride state changes in real time.. 7 fields. 4 outcomes. 2 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "webhooks, events, notifications, order-lifecycle, driver"
}
</script>
