---
title: "Push Notification Gateway Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Manage user-registered notification endpoints and deliver async push notifications to HTTP or email gateways when room events match configurable push rules.. 8 "
---

# Push Notification Gateway Blueprint

> Manage user-registered notification endpoints and deliver async push notifications to HTTP or email gateways when room events match configurable push rules.

| | |
|---|---|
| **Feature** | `push-notification-gateway` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | push, notifications, gateway, email, webhook, rules, devices |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/push-notification-gateway.blueprint.yaml) |
| **JSON API** | [push-notification-gateway.json]({{ site.baseurl }}/api/blueprints/notification/push-notification-gateway.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Account owner registering or managing push notification endpoints |
| `homeserver` | Homeserver | system | Server evaluating push rules and dispatching notifications |
| `push_gateway` | Push Gateway | external | External HTTP service or email relay receiving notification payloads |
| `identity_server` | Identity Server | external | Used to validate that an email push key belongs to the user's account |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes | Account the pusher belongs to |  |
| `kind` | select | Yes | Delivery mechanism for the pusher |  |
| `app_id` | text | Yes | Identifier for the application registering the pusher |  |
| `pushkey` | text | Yes | Delivery endpoint; a URL for HTTP pushers or an email address for email pushers |  |
| `data` | json | No | Gateway-specific configuration such as endpoint URL and format |  |
| `lang` | text | No | Language code used when generating localised notification content |  |
| `device_id` | token | No | Optional device association for the pusher |  |
| `enabled` | boolean | No | Whether the pusher is currently delivering notifications |  |

## States

**State field:** `pusher_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `disabled` |  |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `disabled` | user |  |
|  | `disabled` | `active` | user |  |
|  | `active` | `deleted` | user |  |
|  | `active` | `deleted` | homeserver |  |

## Rules

- **registration:** A pusher is uniquely identified by the combination of user_id, app_id, and pushkey, Email pushers require the pushkey (email address) to be a verified third-party identifier on the account, Push notifications are only delivered when the pusher is in the active state
- **delivery:** Notification delivery is asynchronous and does not block event processing, Push rules are evaluated against each event to determine whether a notification should be sent, Failed HTTP deliveries are retried with exponential backoff, Deleting a device cascades to remove all pushers associated with that device, Pushers are distributed across worker instances using consistent hashing

## Outcomes

### Pusher_registered (Priority: 1)

**Given:**
- user is authenticated
- for email pushers: pushkey is a verified identity on the account
- pusher with this app_id and pushkey does not already exist

**Then:**
- **create_record** target: `pusher` — Pusher record stored and background delivery task started
- **emit_event** event: `pusher.registered`

**Result:** Device will receive notifications when matching push rules are triggered

### Pusher_updated (Priority: 2)

**Given:**
- pusher with this app_id and pushkey already exists for the user

**Then:**
- **set_field** target: `data` — Pusher configuration updated
- **emit_event** event: `pusher.updated`

**Result:** Existing pusher uses new configuration going forward

### Notification_delivered (Priority: 3)

**Given:**
- a room event matches at least one active push rule for the user
- pusher is in active state

**Then:**
- **notify** — Notification payload sent to the external gateway
- **emit_event** event: `notification.delivered`

**Result:** External gateway receives the notification and forwards to the user's device

### Notification_delivery_failed (Priority: 4)

**Given:**
- external gateway returns an error or is unreachable

**Then:**
- **emit_event** event: `notification.delivery_failed`

**Result:** Delivery retried with backoff; user may not receive the notification if all retries fail

### Pusher_disabled (Priority: 5)

**Given:**
- user requests to disable the pusher without deleting it

**Then:**
- **set_field** target: `enabled` value: `false`
- **emit_event** event: `pusher.disabled`

**Result:** Pusher stops delivering notifications but remains registered

### Pusher_deleted (Priority: 6)

**Given:**
- user requests deletion or device cascade triggers removal

**Then:**
- **delete_record** target: `pusher` — Pusher record removed; delivery task stopped
- **emit_event** event: `pusher.deleted`

**Result:** No further notifications delivered through this endpoint

### Email_pusher_rejected (Priority: 7) — Error: `PUSHER_EMAIL_NOT_VERIFIED`

**Given:**
- kind is email
- pushkey is not a verified third-party identifier on the account

**Result:** Email pusher registration rejected

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PUSHER_EMAIL_NOT_VERIFIED` | 400 | The email address is not a verified identifier on your account | No |
| `PUSHER_INVALID_KIND` | 400 | Unrecognised pusher kind | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pusher.registered` | A new notification endpoint was registered | `user_id`, `app_id`, `kind` |
| `pusher.updated` | An existing pusher's configuration was changed | `user_id`, `app_id` |
| `pusher.disabled` | A pusher was temporarily disabled by the user | `user_id`, `app_id` |
| `pusher.deleted` | A pusher was permanently removed | `user_id`, `app_id` |
| `notification.delivered` | A push notification was successfully sent to the external gateway | `user_id`, `app_id`, `event_id` |
| `notification.delivery_failed` | Push notification delivery failed and is scheduled for retry | `user_id`, `app_id`, `retry_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| device-management | required | Pusher deletion is cascaded when the associated device is removed |
| identity-lookup | recommended | Email pushers validate their pushkey against verified identities on the account |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 8
  entry_points:
    - synapse/push/pusherpool.py
    - synapse/handlers/push_rules.py
    - synapse/push/httppusher.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Push Notification Gateway Blueprint",
  "description": "Manage user-registered notification endpoints and deliver async push notifications to HTTP or email gateways when room events match configurable push rules.. 8 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "push, notifications, gateway, email, webhook, rules, devices"
}
</script>
