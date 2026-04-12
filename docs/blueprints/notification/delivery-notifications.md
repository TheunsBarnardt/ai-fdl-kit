---
title: "Delivery Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Send automated SMS and email notifications to customers and drivers at each order status change. 12 fields. 6 outcomes. 4 error codes. rules: status_change_trig"
---

# Delivery Notifications Blueprint

> Send automated SMS and email notifications to customers and drivers at each order status change

| | |
|---|---|
| **Feature** | `delivery-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | fleet, notifications, sms, email, customer, driver, alerts |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/delivery-notifications.blueprint.yaml) |
| **JSON API** | [delivery-notifications.json]({{ site.baseurl }}/api/blueprints/notification/delivery-notifications.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system` | Notification Service | system | Automated notification engine |
| `dispatcher` | Dispatcher | human | Can trigger manual notifications or configure templates |
| `customer` | Customer | external | Recipient of delivery status notifications |
| `driver` | Driver | human | Recipient of dispatch and assignment notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `notification_id` | text | Yes | Notification ID |  |
| `order_uuid` | text | Yes | Order |  |
| `recipient_type` | select | Yes | Recipient Type |  |
| `recipient_identifier` | text | Yes | Recipient Email or Phone |  |
| `channel` | select | Yes | Delivery Channel |  |
| `template_id` | text | No | Message Template |  |
| `subject` | text | No | Email Subject |  |
| `message` | rich_text | Yes | Message Body |  |
| `trigger_event` | text | Yes | Trigger Event |  |
| `sent_at` | datetime | No | Sent At |  |
| `delivered_at` | datetime | No | Delivered At |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `queued` | Yes |  |
| `sent` |  |  |
| `delivered` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `queued` | `sent` | system |  |
|  | `sent` | `delivered` | system |  |
|  | `sent` | `failed` | system |  |

## Rules

- **status_change_triggers:** Notifications are triggered automatically on order status changes: created, dispatched, en_route, arrived, completed, cancelled
- **template_required:** Each notification type (email/SMS) must have a corresponding template configured
- **no_pii_in_messages:** Sensitive data (PII, internal IDs) must never be included in notification messages
- **retry_policy:** Failed notifications are retried up to 3 times with exponential backoff
- **valid_contact:** Customers must have a valid email address or phone number to receive notifications
- **opt_out_respected:** Notification opt-out preferences must be respected; never send to opted-out contacts
- **sms_length:** SMS messages must comply with carrier length limits (160 characters for standard SMS)
- **audit_log:** Each notification is logged with status for delivery audit trails
- **asynchronous:** Notification sending is asynchronous and must not block order status transitions
- **template_variables:** Message templates support variable substitution for order ID, customer name, ETA, etc.

## Outcomes

### Notification_sent_on_dispatch (Priority: 1)

**Given:**
- order.dispatched event received
- customer has a valid email or phone number
- customer has not opted out of notifications

**Then:**
- **create_record**
- **emit_event** event: `notification.queued`

**Result:** Dispatch notification queued for customer

### Recipient_opted_out (Priority: 1) — Error: `NOTIFICATION_OPT_OUT`

**Given:**
- customer has opted out of notifications

**Result:** Notification suppressed — recipient has opted out

### Notification_sent_on_completion (Priority: 2)

**Given:**
- order.completed event received
- customer has a valid contact

**Then:**
- **create_record**
- **emit_event** event: `notification.queued`

**Result:** Delivery completion notification queued for customer

### Driver_notified_on_dispatch (Priority: 3)

**Given:**
- dispatch.assigned event received
- driver has a registered mobile device

**Then:**
- **emit_event** event: `notification.queued`

**Result:** Driver notified of new order assignment via push or SMS

### Notification_delivered (Priority: 4)

**Given:**
- provider confirms delivery

**Then:**
- **set_field** target: `status` value: `delivered`
- **set_field** target: `delivered_at` value: `now`

**Result:** Notification delivery confirmed

### Notification_failed (Priority: 5) — Error: `NOTIFICATION_DELIVERY_FAILED`

**Given:**
- provider reports failure
- retry count has reached maximum

**Then:**
- **set_field** target: `status` value: `failed`
- **emit_event** event: `notification.failed`

**Result:** Notification failed after maximum retries

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NOTIFICATION_DELIVERY_FAILED` | 500 | We were unable to deliver the notification. Please check your contact details. | No |
| `NOTIFICATION_OPT_OUT` | 422 | Notification not sent — recipient has opted out. | No |
| `NOTIFICATION_MISSING_CONTACT` | 422 | No valid contact information found for this recipient. | No |
| `NOTIFICATION_TEMPLATE_NOT_FOUND` | 422 | Notification template not configured for this event. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `notification.queued` | Fired when a notification is queued for sending | `notification_id`, `order_uuid`, `recipient_type`, `channel`, `trigger_event` |
| `notification.sent` | Fired when notification is dispatched to the provider | `notification_id`, `sent_at` |
| `notification.delivered` | Fired when delivery is confirmed | `notification_id`, `delivered_at` |
| `notification.failed` | Fired when notification fails after all retries | `notification_id`, `order_uuid`, `channel`, `error` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Order status changes trigger notification events |
| fleet-customer-contacts | required | Customer contact information for notification delivery |
| driver-profile | recommended | Driver contact info for dispatch notifications |

## AGI Readiness

### Goals

#### Reliable Delivery Notifications

Send automated SMS and email notifications to customers and drivers at each order status change

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| delivery_reliability | speed | notifications must reach recipients even if delayed |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `order_lifecycle` | order-lifecycle | degrade |
| `fleet_customer_contacts` | fleet-customer-contacts | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| notification_sent_on_dispatch | `autonomous` | - | - |
| notification_sent_on_completion | `autonomous` | - | - |
| driver_notified_on_dispatch | `autonomous` | - | - |
| notification_delivered | `autonomous` | - | - |
| notification_failed | `autonomous` | - | - |
| recipient_opted_out | `autonomous` | - | - |

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
  "name": "Delivery Notifications Blueprint",
  "description": "Send automated SMS and email notifications to customers and drivers at each order status change. 12 fields. 6 outcomes. 4 error codes. rules: status_change_trig",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, notifications, sms, email, customer, driver, alerts"
}
</script>
