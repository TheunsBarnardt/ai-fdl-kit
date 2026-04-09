---
title: "In App Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Real-time in-app notification center with read state, grouping, deep links, and persistent storage. 12 fields. 7 outcomes. 5 error codes. rules: delivery, persi"
---

# In App Notifications Blueprint

> Real-time in-app notification center with read state, grouping, deep links, and persistent storage

| | |
|---|---|
| **Feature** | `in-app-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | in-app, notification-center, real-time, websocket, sse, bell-icon, deep-links, grouping |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/in-app-notifications.blueprint.yaml) |
| **JSON API** | [in-app-notifications.json]({{ site.baseurl }}/api/blueprints/notification/in-app-notifications.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `title` | text | Yes | Notification Title | Validations: required, maxLength |
| `body` | text | Yes | Notification Body | Validations: required, maxLength |
| `type` | select | Yes | Notification Type | Validations: required |
| `read_at` | datetime | No | Read At |  |
| `action_url` | url | No | Action URL |  |
| `icon` | text | No | Icon | Validations: maxLength |
| `group_key` | text | No | Group Key | Validations: pattern, maxLength |
| `recipient_user_id` | text | Yes | Recipient User ID | Validations: required |
| `sender_id` | text | No | Sender ID |  |
| `priority` | select | No | Priority |  |
| `expires_at` | datetime | No | Expiry Time |  |
| `metadata` | json | No | Custom Metadata |  |

## Rules

- **delivery:**
  - **real_time_channel:** websocket
  - **fallback_channel:** sse
  - **polling_interval_seconds:** 30
  - **delivery_guarantee:** at_least_once
- **persistence:**
  - **storage:** database
  - **retention_days:** 90
  - **max_per_user:** 1000
- **read_state:**
  - **track_read_at:** true
  - **track_dismissed_at:** true
  - **mark_all_read:** true
- **grouping:**
  - **enabled:** true
  - **collapse_threshold:** 3
  - **group_summary_template:** {{count}} new {{type}} notifications
  - **expand_on_click:** true
- **pagination:**
  - **default_page_size:** 20
  - **max_page_size:** 100
  - **cursor_based:** true
- **security:**
  - **user_isolation:** true
  - **xss_prevention:** true
  - **action_url_validation:** true

## Outcomes

### User_not_found (Priority: 1) — Error: `NOTIFICATION_USER_NOT_FOUND`

**Given:**
- `recipient_user_id` (db) not_exists

**Result:** reject with user not found error

### Storage_limit_reached (Priority: 2) — Error: `NOTIFICATION_STORAGE_LIMIT`

**Given:**
- `user_notification_count` (db) gte `1000`

**Then:**
- **delete_record** target: `oldest_notification` — Remove the oldest notification to make room

**Result:** remove oldest notification and proceed with creation

### Notification_created (Priority: 10) | Transaction: atomic

**Given:**
- `recipient_user_id` (db) exists
- `title` (input) exists
- `body` (input) exists

**Then:**
- **create_record** target: `notification` — Persist notification to database with unread state
- **call_service** target: `realtime_channel` — Deliver notification via WebSocket/SSE to connected clients
- **set_field** target: `unread_count` value: `increment` — Increment unread badge count for recipient
- **emit_event** event: `notification.created`

**Result:** notification created, persisted, and delivered in real time

### Notification_read (Priority: 11)

**Given:**
- `notification_id` (input) exists
- `read_at` (db) not_exists

**Then:**
- **set_field** target: `read_at` value: `now` — Set read timestamp
- **set_field** target: `unread_count` value: `decrement` — Decrement unread badge count
- **emit_event** event: `notification.read`

**Result:** notification marked as read and badge count updated

### Mark_all_read (Priority: 12) | Transaction: atomic

**Given:**
- `mark_all` (input) eq `true`

**Then:**
- **set_field** target: `read_at` value: `now` — Set read timestamp on all unread notifications for this user
- **set_field** target: `unread_count` value: `0` — Reset unread badge count to zero
- **emit_event** event: `notification.all_read`

**Result:** all unread notifications marked as read and badge reset

### Notification_dismissed (Priority: 13)

**Given:**
- `notification_id` (input) exists

**Then:**
- **set_field** target: `dismissed_at` value: `now` — Record dismissal timestamp
- **set_field** target: `unread_count` value: `decrement` when: `read_at is null` — Decrement unread badge count if was unread
- **emit_event** event: `notification.dismissed`

**Result:** notification dismissed and hidden from feed

### Notification_clicked (Priority: 14)

**Given:**
- `notification_id` (input) exists
- `action_url` (db) exists

**Then:**
- **set_field** target: `read_at` value: `now` when: `read_at is null` — Auto-mark as read on click
- **emit_event** event: `notification.clicked`

**Result:** mark as read and navigate to action URL

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NOTIFICATION_USER_NOT_FOUND` | 404 | Recipient user not found | No |
| `NOTIFICATION_NOT_FOUND` | 404 | Notification not found | No |
| `NOTIFICATION_STORAGE_LIMIT` | 500 | Notification storage limit reached | Yes |
| `NOTIFICATION_UNAUTHORIZED` | 403 | You can only access your own notifications | No |
| `NOTIFICATION_VALIDATION_ERROR` | 422 | Please check the notification parameters and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `notification.created` | New in-app notification created and delivered | `notification_id`, `recipient_user_id`, `type`, `title`, `group_key`, `timestamp` |
| `notification.read` | Notification marked as read | `notification_id`, `recipient_user_id`, `timestamp` |
| `notification.dismissed` | Notification dismissed by user | `notification_id`, `recipient_user_id`, `timestamp` |
| `notification.all_read` | All notifications marked as read (bulk operation) | `recipient_user_id`, `count_marked`, `timestamp` |
| `notification.clicked` | Notification clicked, navigating to action URL | `notification_id`, `recipient_user_id`, `action_url`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences | required | Must check in-app notification preferences before displaying |
| push-notifications | recommended | Push notifications complement in-app when user is not online |
| email-notifications | optional | Email digest of unread in-app notifications |
| webhook-outbound | optional | Trigger outbound webhooks when notifications are created |

## AGI Readiness

### Goals

#### Reliable In App Notifications

Real-time in-app notification center with read state, grouping, deep links, and persistent storage

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

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
| user_not_found | `autonomous` | - | - |
| storage_limit_reached | `autonomous` | - | - |
| notification_created | `supervised` | - | - |
| notification_read | `autonomous` | - | - |
| mark_all_read | `autonomous` | - | - |
| notification_dismissed | `autonomous` | - | - |
| notification_clicked | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: notification_panel
description: Bell icon with dropdown notification center
components:
  bell_icon:
    position: top_right
    show_badge: true
    badge_shows: unread_count
    animate_on_new: true
  notification_panel:
    position: dropdown_right
    max_height: 480px
    width: 380px
    show_header: true
    header_actions:
      - mark_all_read
      - settings_link
  notification_item:
    show_icon: true
    show_timestamp: true
    show_type_indicator: true
    swipe_to_dismiss: true
    click_action: navigate_to_action_url
  empty_state:
    message: You're all caught up!
    icon: check_circle
fields_order:
  - icon
  - title
  - body
  - timestamp
pagination:
  type: infinite_scroll
  load_more_text: Load older notifications
accessibility:
  autofocus: first_notification
  aria_live_region: true
  keyboard_navigation: true
  screen_reader_labels: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "In App Notifications Blueprint",
  "description": "Real-time in-app notification center with read state, grouping, deep links, and persistent storage. 12 fields. 7 outcomes. 5 error codes. rules: delivery, persi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "in-app, notification-center, real-time, websocket, sse, bell-icon, deep-links, grouping"
}
</script>
