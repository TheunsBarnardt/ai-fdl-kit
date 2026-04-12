---
title: "Notification Preferences Dnd Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period "
---

# Notification Preferences Dnd Blueprint

> User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period with automatic expiry.


| | |
|---|---|
| **Feature** | `notification-preferences-dnd` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | notifications, preferences, dnd, do-not-disturb, mute, quiet-hours |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/notification-preferences-dnd.blueprint.yaml) |
| **JSON API** | [notification-preferences-dnd.json]({{ site.baseurl }}/api/blueprints/notification/notification-preferences-dnd.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Configures their own notification preferences and DND schedule |
| `dnd_expiry_job` | DND Expiry Job | system | Background process that checks and expires timed DND statuses every minute |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `desktop_notifications` | select | Yes | Desktop notification trigger level |  |
| `mobile_notifications` | select | Yes | Mobile push notification trigger level |  |
| `email_notifications` | boolean | Yes | Whether email notifications are enabled |  |
| `notification_comments` | select | Yes | When to notify about thread replies |  |
| `mention_keys` | text | No | Comma-separated custom keywords that trigger notifications when they appear in m |  |
| `notify_on_first_name` | boolean | No | Whether the user's first name is treated as a mention keyword |  |
| `channel_notification_override` | json | No | Per-channel overrides for desktop, mobile, and email notification levels; overri |  |
| `channel_mark_unread` | select | No | Per-channel mute control — whether all messages or only mentions mark the channe |  |
| `dnd_end_time` | datetime | No | Unix timestamp in seconds at which a timed DND status expires; zero means DND is |  |
| `prev_status` | text | No | Previous availability status stored so it can be restored when DND expires |  |

## States

**State field:** `availability_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `online` | Yes |  |
| `away` |  |  |
| `dnd` |  |  |
| `offline` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `online` | `dnd` | user |  |
|  | `away` | `dnd` | user |  |
|  | `dnd` | `online` | user |  |
|  | `dnd` | `online` | dnd_expiry_job |  |

## Rules

- **rule_01:** Notification preference resolution follows a three-level hierarchy: channel-level override → user-level default → system default.
- **rule_02:** A channel-level setting of 'default' falls back to the user's global preference for that notification type.
- **rule_03:** When DND is active, push notifications are suppressed even if the user's push preference is set to 'all'.
- **rule_04:** DND does not suppress email notifications by default; email is governed only by the email notification preference.
- **rule_05:** Direct messages apply 'all' push notification logic even if the user has 'mention' set as their general push preference.
- **rule_06:** Group messages also use 'all' push logic, treating them equivalently to direct messages.
- **rule_07:** A timed DND end_time is truncated to one-minute intervals, aligning with the expiry job's polling interval.
- **rule_08:** DND expiry checks run every minute; the status reverts to prev_status on expiry.
- **rule_09:** Custom mention keys are comma-separated; they trigger notifications identically to username @-mentions.
- **rule_10:** Thread notification preferences (desktop_threads, push_threads, email_threads) are independent of top-level preferences and apply specifically to replies in followed threads.

## Outcomes

### Push_suppressed_by_dnd (Priority: 1)

**Given:**
- incoming push notification triggered for a user
- user's current status is dnd

**Then:**
- **emit_event** event: `notification.suppressed`

**Result:** Push notification not delivered; notification reason recorded as user status

### Preferences_updated (Priority: 10)

**Given:**
- user submits updated notification preferences
- all preference values are within allowed option sets

**Then:**
- **set_field** target: `user.notify_props` — All updated preference fields persisted
- **emit_event** event: `notification_prefs.updated`

**Result:** New preferences take effect for the next incoming notification

### Channel_preference_overridden (Priority: 10)

**Given:**
- user sets a channel-level notification override
- channel_notification_override contains a valid level

**Then:**
- **set_field** target: `channel_member.notify_props` — Channel-specific preference stored on the membership record

**Result:** That channel uses the override instead of the user's global default

### Dnd_activated (Priority: 10)

**Given:**
- user enables DND (optionally with an end time)

**Then:**
- **set_field** target: `user.status` value: `dnd`
- **set_field** target: `user.prev_status` — Current status saved so it can be restored on DND expiry
- **set_field** target: `user.dnd_end_time` — If timed, end time truncated to next minute boundary and stored
- **emit_event** event: `user.status_changed`

**Result:** Push notifications suppressed until DND is manually disabled or expires

### Dnd_expired (Priority: 10)

**Given:**
- dnd_expiry_job runs
- user's dnd_end_time is in the past

**Then:**
- **set_field** target: `user.status` value: `prev_status`
- **set_field** target: `user.dnd_end_time` value: `0`
- **emit_event** event: `user.status_changed`

**Result:** DND lifted; notifications resume according to user preferences

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NOTIFICATION_INVALID_PREFERENCE` | 400 | The selected notification level is not valid. | No |
| `NOTIFICATION_CHANNEL_NOT_FOUND` | 404 | The specified channel was not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `notification_prefs.updated` | User updated their global notification preferences | `user_id`, `changed_fields`, `timestamp` |
| `user.status_changed` | User availability status changed (online/away/dnd/offline) | `user_id`, `old_status`, `new_status`, `dnd_end_time`, `timestamp` |
| `notification.suppressed` | A notification was suppressed due to user preference or DND status | `user_id`, `notification_type`, `reason`, `channel_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| email-notifications | required | Email notification preferences are part of the same preference set |
| mobile-push-notifications | required | DND status directly suppresses push notifications |
| channel-moderation | recommended | Channel-level muting (mark_unread = mention) is implemented via the same notification preference mechanism |

## AGI Readiness

### Goals

#### Reliable Notification Preferences Dnd

User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period with automatic expiry.


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
| `email_notifications` | email-notifications | degrade |
| `mobile_push_notifications` | mobile-push-notifications | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| preferences_updated | `supervised` | - | - |
| channel_preference_overridden | `autonomous` | - | - |
| dnd_activated | `autonomous` | - | - |
| dnd_expired | `autonomous` | - | - |
| push_suppressed_by_dnd | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/public/model/user.go
    - server/channels/app/notification.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Notification Preferences Dnd Blueprint",
  "description": "User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "notifications, preferences, dnd, do-not-disturb, mute, quiet-hours"
}
</script>
