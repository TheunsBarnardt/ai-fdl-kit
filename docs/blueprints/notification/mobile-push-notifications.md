---
title: "Mobile Push Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and con"
---

# Mobile Push Notifications Blueprint

> Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and content-level controls from minimal...

| | |
|---|---|
| **Feature** | `mobile-push-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | push, mobile, apns, fcm, proxy, device, jwt, notifications |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/mobile-push-notifications.blueprint.yaml) |
| **JSON API** | [mobile-push-notifications.json]({{ site.baseurl }}/api/blueprints/notification/mobile-push-notifications.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Receives push notifications on registered mobile devices |
| `push_proxy` | Push Proxy Service | external | Relay service that forwards signed notification payloads to APNS and FCM |
| `notification_system` | Notification System | system | Evaluates eligibility, assembles payload, signs, and dispatches notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `device_id` | text | Yes | Unique identifier for the registered mobile device |  |
| `platform` | select | Yes | Mobile operating system platform |  |
| `ack_id` | token | Yes | Per-delivery unique identifier for acknowledgement tracking |  |
| `notification_type` | select | Yes | Category of notification payload |  |
| `message` | text | No | Notification body text; may be omitted in ID-loaded or generic modes |  |
| `badge` | number | No | Unread message count to display on the app badge |  |
| `channel_id` | hidden | No | Channel where the triggering message was posted |  |
| `sender_name` | text | No | Display name of the message author |  |
| `content_level` | select | Yes | How much message content to include in the payload |  |
| `signature` | token | Yes | ES256 JWT signature covering the ack_id and device_id to prevent spoofing |  |

## Rules

- **rule_01:** Push notifications are delivered independently to each active mobile session for the recipient user; each session receives its own uniquely signed payload with a distinct ack_id.
- **rule_02:** Notifications are suppressed entirely when the user's status is DND (Do Not Disturb); this check takes priority over all other preferences.
- **rule_03:** Push is also suppressed when the user is currently active in the same channel where the triggering message was posted (unless the notify-active-channel setting overrides this).
- **rule_04:** The id_loaded content level sends only the channel ID and post ID; the device fetches the full message content after receiving the notification, protecting content from being stored in push infrastructure.
- **rule_05:** Direct messages and group messages use "all" push logic regardless of the user's global push preference of "mention", because every DM is implicitly a personal communication.
- **rule_06:** Muted channels (mark_unread = mention) suppress push notifications for non-mention messages.
- **rule_07:** Each notification payload is signed with the server's asymmetric key using ES256; the push proxy validates the signature before forwarding to APNS or FCM.
- **rule_08:** When the push proxy responds with "remove", the device's push token is considered stale and the session is flagged for cleanup.
- **rule_09:** Plugin hooks can intercept, modify, or cancel push notifications before delivery.
- **rule_10:** Bots do not receive push notifications.

## Outcomes

### Push_suppressed_dnd (Priority: 2)

**Given:**
- notification would be delivered
- user's status is dnd

**Then:**
- **emit_event** event: `push.notification_suppressed`

**Result:** Notification not delivered; reason recorded as user_status

### Push_suppressed_active_channel (Priority: 3)

**Given:**
- notification would be delivered
- user is actively viewing the channel where the message was posted

**Then:**
- **emit_event** event: `push.notification_suppressed`

**Result:** Notification not delivered; user is already aware of the message

### Push_suppressed_muted_channel (Priority: 4)

**Given:**
- notification would be delivered
- channel is muted for the recipient (mark_unread = mention)
- message does not directly mention the user

**Then:**
- **emit_event** event: `push.notification_suppressed`

**Result:** Notification not delivered; channel is muted

### Push_device_stale (Priority: 5)

**Given:**
- notification sent to push proxy
- push proxy returns 'remove' response for a device

**Then:**
- **invalidate** target: `device_session` — Session with the stale device token flagged for cleanup
- **emit_event** event: `push.device_removed`

**Result:** Stale device registration removed; future notifications skip this device

### Push_proxy_error (Priority: 5)

**Given:**
- push proxy returns an error response

**Then:**
- **emit_event** event: `push.delivery_failed`

**Result:** Delivery failure logged; no retry (stateless delivery model)

### Push_delivered (Priority: 10)

**Given:**
- message triggers a notification for the recipient
- recipient has at least one active mobile session with a registered device
- user's push preference permits the notification type (all or mention when mentioned)
- user is not in DND status
- user is not active in the triggering channel (or notify-when-active is set)
- no plugin hook rejected the notification

**Then:**
- **emit_event** event: `push.notification_sent`

**Result:** Signed payload delivered to push proxy; proxy forwards to APNS or FCM

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PUSH_PROXY_ERROR` | 400 | Push notification could not be delivered. Please check your connection. | No |
| `PUSH_NOT_ENABLED` | 403 | Mobile push notifications are not configured on this server. | No |
| `PUSH_NOT_LICENSED` | 403 | Mobile push notifications require an active license for the hosted proxy service. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `push.notification_sent` | Push notification payload dispatched to the proxy service | `user_id`, `device_id`, `ack_id`, `platform`, `channel_id`, `post_id`, `timestamp` |
| `push.notification_suppressed` | Push notification eligible but suppressed for a documented reason | `user_id`, `reason`, `channel_id`, `post_id`, `timestamp` |
| `push.delivery_failed` | Push proxy reported a delivery error | `user_id`, `device_id`, `error_reason`, `timestamp` |
| `push.device_removed` | Device registration removed because push proxy reported stale token | `user_id`, `device_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences-dnd | required | User preferences and DND status are checked before every push delivery |
| session-management-revocation | required | Mobile sessions carry device IDs; session revocation removes device registrations |
| email-notifications | recommended | Email and push share notification trigger logic; the two complement each other |

## AGI Readiness

### Goals

#### Reliable Mobile Push Notifications

Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and content-level controls from minimal...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before modifying sensitive data fields

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

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `notification_preferences_dnd` | notification-preferences-dnd | degrade |
| `session_management_revocation` | session-management-revocation | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| push_delivered | `autonomous` | - | - |
| push_suppressed_dnd | `autonomous` | - | - |
| push_suppressed_active_channel | `autonomous` | - | - |
| push_suppressed_muted_channel | `autonomous` | - | - |
| push_device_stale | `autonomous` | - | - |
| push_proxy_error | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 7
  entry_points:
    - server/channels/app/notification.go
    - server/public/model/notification.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Mobile Push Notifications Blueprint",
  "description": "Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and con",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "push, mobile, apns, fcm, proxy, device, jwt, notifications"
}
</script>
