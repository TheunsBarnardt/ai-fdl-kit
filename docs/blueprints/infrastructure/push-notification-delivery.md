---
title: "Push Notification Delivery Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Route urgent and background notifications to mobile devices via the correct platform push service, with token expiry cleanup, scheduled background delivery, and"
---

# Push Notification Delivery Blueprint

> Route urgent and background notifications to mobile devices via the correct platform push service, with token expiry cleanup, scheduled background delivery, and challenge notification support

| | |
|---|---|
| **Feature** | `push-notification-delivery` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | push-notification, mobile, android, ios, background-delivery, device-token, challenge |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/push-notification-delivery.blueprint.yaml) |
| **JSON API** | [push-notification-delivery.json]({{ site.baseurl }}/api/blueprints/infrastructure/push-notification-delivery.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_token` | token | Yes | Device Push Token |  |
| `token_type` | select | Yes | Token Type |  |
| `notification_type` | select | Yes | Notification Type |  |
| `urgent` | boolean | Yes | Urgent |  |
| `notification_data` | text | No | Notification Data |  |
| `account_identifier` | token | No | Account Identifier |  |
| `device_identifier` | token | No | Device Identifier |  |
| `background_notification_period_minutes` | number | No | Background Notification Period (minutes) |  |

## Rules

- **routing:**
  - **platform_selection:** based_on_registered_token_type
  - **fallback:** none
- **delivery_priority:**
  - **urgent_true:** immediate_high_priority
  - **urgent_false:** scheduled_background_delivery
- **payload_format:**
  - **new_message_ios_urgent:** mutable_content_alert
  - **new_message_ios_background:** content_available_silent
  - **new_message_android_urgent:** high_priority_data_message
  - **new_message_android_background:** normal_priority_data_message
  - **challenge:** background_silent_with_token_payload
  - **rate_limit_challenge:** background_silent_with_token_payload
  - **login_attempt_alert:** high_priority_alert_with_context
- **token_lifecycle:**
  - **clear_on_unregistered:** true
  - **expiry_check:** compare_invalidation_timestamp_to_last_registration
- **background_scheduling:**
  - **storage:** distributed_in_memory
  - **deduplication:** true
  - **cancel_on_messages_retrieved:** true
- **collapse:**
  - **urgent_new_message_collapse_key:** incoming_message

## Outcomes

### Device_not_registered (Priority: 1) — Error: `PUSH_DEVICE_NOT_REGISTERED`

**Given:**
- `device_token` (db) not_exists

**Result:** Not-registered error returned to the caller; no notification is sent

### Token_unregistered (Priority: 2)

**Given:**
- platform push service reports the device token as unregistered, expired, or invalid
- platform invalidation timestamp post-dates the last device token registration timestamp

**Then:**
- **set_field** target: `device_token` value: `null` — Clear the stale push token from the device record
- **emit_event** event: `push_notification.token_expired`

**Result:** Stale token cleared; future push attempts return not-registered until the client re-registers a token

### Delivery_failed (Priority: 3) — Error: `PUSH_DELIVERY_FAILED`

**Given:**
- platform push service returns an error other than token-unregistered

**Then:**
- **emit_event** event: `push_notification.delivery_failed`

**Result:** Delivery failure recorded in metrics; error is not propagated to the original request caller (best-effort delivery)

### Background_notification_scheduled (Priority: 9)

**Given:**
- `urgent` (input) eq `false`
- `device_token` (db) exists

**Then:**
- **create_record** target: `pending_notification` — Record the pending background notification in the distributed store; a background worker dispatches it after the minimum interval
- **emit_event** event: `push_notification.scheduled`

**Result:** Background notification queued for deferred delivery; no immediate push is sent

### Urgent_notification_sent (Priority: 10)

**Given:**
- `urgent` (input) eq `true`
- `device_token` (db) exists

**Then:**
- **call_service** target: `platform_push_service` — Route the notification payload to the appropriate platform push service based on token type, with high-priority delivery flag and correct platform payload format
- **emit_event** event: `push_notification.sent`

**Result:** Notification submitted to the platform push service for immediate dispatch to the device

### Background_notifications_cancelled (Priority: 10)

**Given:**
- account has retrieved its pending messages
- `device_identifier` (input) exists

**Then:**
- **delete_record** target: `scheduled_background_notification` — Remove pending background notifications for this account and device from the scheduled store
- **emit_event** event: `push_notification.cancelled`

**Result:** Pending background notifications removed; no further silent pings are sent until new messages arrive

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PUSH_DEVICE_NOT_REGISTERED` | 404 | No push token registered for this device. Please update your push registration. | No |
| `PUSH_DELIVERY_FAILED` | 503 | Push notification delivery failed. The message will be available for retrieval. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `push_notification.sent` | A push notification was submitted to the platform push service for immediate delivery | `account_identifier`, `device_identifier`, `token_type`, `notification_type`, `urgent` |
| `push_notification.scheduled` | A background push notification was queued for deferred delivery | `account_identifier`, `device_identifier`, `token_type` |
| `push_notification.token_expired` | A push token was cleared because the platform push service reported it as unregistered or expired | `account_identifier`, `device_identifier`, `token_type` |
| `push_notification.delivery_failed` | A push notification could not be delivered due to a platform push service error | `account_identifier`, `token_type`, `notification_type` |
| `push_notification.cancelled` | Pending background push notifications were cancelled because the device retrieved its messages | `account_identifier`, `device_identifier` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| rate-limiting-abuse-prevention | required | Push challenges are issued and verified through the rate limiting subsystem; this feature is the delivery transport |
| device-management | required | Push tokens are registered and maintained as part of device management; token clearing relies on device records |
| message-queue | recommended | Background push notifications signal that messages are waiting; the message queue holds the actual content |
| login | recommended | Login-attempt alert notifications are part of the sign-in approval flow |

## AGI Readiness

### Goals

#### Reliable Push Notification Delivery

Route urgent and background notifications to mobile devices via the correct platform push service, with token expiry cleanup, scheduled background delivery, and challenge notification support

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `rate_limiting_abuse_prevention` | rate-limiting-abuse-prevention | fail |
| `device_management` | device-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| urgent_notification_sent | `autonomous` | - | - |
| background_notification_scheduled | `autonomous` | - | - |
| token_unregistered | `autonomous` | - | - |
| device_not_registered | `autonomous` | - | - |
| delivery_failed | `autonomous` | - | - |
| background_notifications_cancelled | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Push Notification Delivery Blueprint",
  "description": "Route urgent and background notifications to mobile devices via the correct platform push service, with token expiry cleanup, scheduled background delivery, and",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "push-notification, mobile, android, ios, background-delivery, device-token, challenge"
}
</script>
