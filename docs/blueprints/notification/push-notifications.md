---
title: "Push Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Deliver mobile and web push notifications with device management, topic subscriptions, and rich media. 12 fields. 7 outcomes. 6 error codes. rules: delivery, de"
---

# Push Notifications Blueprint

> Deliver mobile and web push notifications with device management, topic subscriptions, and rich media

| | |
|---|---|
| **Feature** | `push-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | push, mobile, web-push, fcm, apns, notifications, real-time, device-tokens |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/push-notifications.blueprint.yaml) |
| **JSON API** | [push-notifications.json]({{ site.baseurl }}/api/blueprints/notification/push-notifications.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_token` | token | Yes | Device Token | Validations: required, minLength |
| `platform` | select | Yes | Platform | Validations: required |
| `title` | text | Yes | Notification Title | Validations: required, maxLength |
| `body` | text | Yes | Notification Body | Validations: required, maxLength |
| `image_url` | url | No | Rich Media Image |  |
| `action_url` | url | No | Action URL |  |
| `topic` | text | No | Topic | Validations: pattern |
| `badge_count` | number | No | Badge Count | Validations: min |
| `silent` | boolean | No | Silent Push |  |
| `priority` | select | No | Delivery Priority |  |
| `ttl_seconds` | number | No | Time to Live | Validations: min, max |
| `data_payload` | json | No | Custom Data Payload |  |

## Rules

- **delivery:**
  - **provider_abstraction:** true
  - **max_retries:** 3
  - **retry_backoff:** exponential
  - **retry_base_seconds:** 10
  - **timeout_seconds:** 15
- **device_management:**
  - **token_refresh_on_error:** true
  - **stale_token_cleanup_days:** 90
  - **max_devices_per_user:** 10
  - **dedup_tokens:** true
- **topics:**
  - **max_subscriptions_per_user:** 100
  - **max_subscribers_per_topic:** 1000000
  - **topic_naming:** kebab-case
- **payload:**
  - **max_size_bytes:** 4096
  - **rich_media_max_size_mb:** 5
  - **collapse_key_support:** true
- **rate_limiting:**
  - **per_device_per_minute:** 5
  - **per_topic_per_minute:** 30
  - **global_per_second:** 500
- **security:**
  - **token_encryption_at_rest:** true
  - **payload_sanitization:** true
  - **url_validation:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `PUSH_RATE_LIMITED`

**Given:**
- `device_send_count` (computed) gte `5`

**Result:** reject with rate limit error

### Invalid_device_token (Priority: 2) — Error: `PUSH_INVALID_TOKEN`

**Given:**
- `device_token` (db) not_exists

**Then:**
- **delete_record** target: `device_token` — Remove invalid token from device registry
- **emit_event** event: `push.token_invalid`

**Result:** remove stale token and skip delivery

### Payload_too_large (Priority: 3) — Error: `PUSH_PAYLOAD_TOO_LARGE`

**Given:**
- `payload_size` (computed) gt `4096`

**Result:** reject with payload size error

### Push_sent (Priority: 10) | Transaction: atomic

**Given:**
- `device_token` (db) exists
- `title` (input) exists
- `body` (input) exists

**Then:**
- **call_service** target: `push_provider` — Deliver notification via FCM, APNs, or web push based on platform
- **set_field** target: `badge_count` value: `increment` when: `silent == false` — Increment app badge count for recipient
- **create_record** target: `delivery_log` — Record delivery attempt
- **emit_event** event: `push.sent`

**Result:** push notification delivered to provider for dispatch

### Push_delivered (Priority: 11)

**Given:**
- `delivery_status` (system) eq `delivered`

**Then:**
- **set_field** target: `delivered_at` value: `now`
- **emit_event** event: `push.delivered`

**Result:** update delivery log with confirmed delivery

### Push_dismissed (Priority: 12)

**Given:**
- `user_action` (system) eq `dismissed`

**Then:**
- **set_field** target: `badge_count` value: `decrement` — Decrement badge count on dismiss
- **emit_event** event: `push.dismissed`

**Result:** record dismissal and update badge count

### Topic_broadcast (Priority: 13)

**Given:**
- `topic` (input) exists

**Then:**
- **call_service** target: `push_provider` — Broadcast notification to all topic subscribers
- **emit_event** event: `push.broadcast`

**Result:** notification broadcast to all subscribers of the topic

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PUSH_RATE_LIMITED` | 429 | Push notification rate limit exceeded | Yes |
| `PUSH_INVALID_TOKEN` | 410 | Device token is no longer valid | No |
| `PUSH_PAYLOAD_TOO_LARGE` | 413 | Notification payload exceeds maximum size | No |
| `PUSH_DELIVERY_FAILED` | 503 | Push notification delivery failed | Yes |
| `PUSH_TOPIC_NOT_FOUND` | 404 | Topic does not exist | No |
| `PUSH_VALIDATION_ERROR` | 422 | Please check the notification parameters and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `push.sent` | Push notification sent to provider | `tracking_id`, `user_id`, `device_token`, `platform`, `title`, `silent`, `timestamp` |
| `push.delivered` | Push notification confirmed delivered to device | `tracking_id`, `user_id`, `device_token`, `delivered_at`, `timestamp` |
| `push.dismissed` | User dismissed the notification | `tracking_id`, `user_id`, `notification_id`, `timestamp` |
| `push.broadcast` | Notification broadcast to a topic | `topic`, `title`, `subscriber_count`, `timestamp` |
| `push.token_invalid` | Device token was found to be invalid and removed | `device_token`, `platform`, `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences | required | Must check user push notification preferences before sending |
| in-app-notifications | recommended | Push notifications often have corresponding in-app notification entries |
| email-notifications | optional | Fallback to email when push delivery fails or is not available |
| sms-notifications | optional | Fallback to SMS for critical alerts when push is unavailable |

## AGI Readiness

### Goals

#### Reliable Push Notifications

Deliver mobile and web push notifications with device management, topic subscriptions, and rich media

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

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `notification_preferences` | notification-preferences | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| invalid_device_token | `autonomous` | - | - |
| payload_too_large | `autonomous` | - | - |
| push_sent | `autonomous` | - | - |
| push_delivered | `autonomous` | - | - |
| push_dismissed | `autonomous` | - | - |
| topic_broadcast | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: admin_panel
description: Push notification management and device registry
admin_views:
  - view: device_registry
    description: Registered devices per user
    columns:
      - user_id
      - platform
      - device_token
      - registered_at
      - last_active_at
    actions:
      - remove_device
  - view: delivery_log
    description: Push notification delivery history
    columns:
      - user_id
      - platform
      - title
      - status
      - sent_at
      - delivered_at
  - view: topic_manager
    description: Manage topic subscriptions
    columns:
      - topic
      - subscriber_count
      - last_broadcast_at
    actions:
      - broadcast
      - delete_topic
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Push Notifications Blueprint",
  "description": "Deliver mobile and web push notifications with device management, topic subscriptions, and rich media. 12 fields. 7 outcomes. 6 error codes. rules: delivery, de",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "push, mobile, web-push, fcm, apns, notifications, real-time, device-tokens"
}
</script>
