---
title: "Messaging Email Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how muc"
---

# Messaging Email Notifications Blueprint

> Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how much message detail is included in each...

| | |
|---|---|
| **Feature** | `messaging-email-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | email, notifications, batching, digest, mentions, messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/messaging-email-notifications.blueprint.yaml) |
| **JSON API** | [messaging-email-notifications.json]({{ site.baseurl }}/api/blueprints/notification/messaging-email-notifications.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Receives email notifications for missed messages based on their preferences |
| `email_batching_job` | Email Batching Job | system | Background worker that collects queued notifications and dispatches batch emails |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `recipient_user_id` | hidden | Yes | User receiving the email notification |  |
| `sender_display_name` | text | Yes | Name of the message author shown in the email |  |
| `channel_name` | text | No | Name of the channel where the message was posted |  |
| `team_name` | text | No | Name of the workspace containing the channel |  |
| `message_html` | rich_text | No | HTML-formatted message body (included for full content level) |  |
| `message_text` | text | No | Plain-text fallback message body |  |
| `notification_type` | select | Yes | What triggered this notification |  |
| `email_interval` | select | Yes | User's selected batching frequency for email notifications |  |

## States

**State field:** `notification_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `queued` | Yes |  |
| `sent` |  | Yes |
| `discarded` |  | Yes |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `queued` | `sent` | email_batching_job |  |
|  | `queued` | `discarded` | system |  |
|  | `queued` | `failed` | email_batching_job |  |

## Rules

- **rule_01:** Email notifications are sent only when the user is not currently active in the application at the time of delivery.
- **rule_02:** Trigger evaluation follows this hierarchy: channel-level preference → user-level preference. A channel override of 'default' falls back to the user's global email preference.
- **rule_03:** {"Email is not sent for":"system messages, messages sent by the user themselves, channels where email is set to 'none', mentions in muted channels when the user has 'mention' push level."}
- **rule_04:** The 'immediately' interval actually queues for a short delay (approximately 30 seconds) to allow message threads to settle before sending.
- **rule_05:** When batching is enabled, if the user views any channel in the workspace after a notification is queued but before the batch fires, the entire batch for that workspace is discarded.
- **rule_06:** Direct messages and thread replies in followed threads may have independent email preference settings from global channel notifications.
- **rule_07:** Content level determines how much of the message appears in the email body; some configurations send only a generic alert without message content for privacy.
- **rule_08:** Unverified email addresses are blocked from receiving notifications when email verification is required.
- **rule_09:** Bots do not receive email notifications.

## Outcomes

### Email_unverified_blocked (Priority: 3)

**Given:**
- notification would be sent to user
- user's email address is not verified
- server requires email verification

**Then:**
- **emit_event** event: `email_notification.suppressed`

**Result:** Email suppressed; user must verify their email address first

### Email_send_failed (Priority: 5) — Error: `EMAIL_SEND_FAILED`

**Given:**
- email send attempt made to mail server
- SMTP server returns an error or is unreachable

**Then:**
- **emit_event** event: `email_notification.failed`

**Result:** Notification recorded as failed; no automatic retry

### Email_batch_discarded (Priority: 8)

**Given:**
- user views a channel that has queued notifications before the batch interval elapses

**Then:**
- **delete_record** target: `email_notification_queue` — Queued batch for that workspace discarded
- **emit_event** event: `email_notification.discarded`

**Result:** Email not sent; user has already seen the messages

### Email_queued (Priority: 10)

**Given:**
- message triggers notification for a recipient
- recipient's email preference is not 'none' at the applicable scope
- recipient's email address is verified (if verification required)
- recipient is not the message author
- channel notification level permits email
- recipient is a human user (not a bot)

**Then:**
- **create_record** target: `email_notification_queue` — Notification added to the per-user batch queue
- **emit_event** event: `email_notification.queued`

**Result:** Notification queued; will be sent at or after the user's configured batch interval

### Email_batch_sent (Priority: 10)

**Given:**
- email_batching_job fires at its configured interval
- user has one or more queued notifications
- configured batch interval for the user has elapsed since the first queued notification
- user has not viewed the relevant channels since queueing

**Then:**
- **emit_event** event: `email_notification.sent`

**Result:** Single email containing all queued notifications delivered to the recipient

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EMAIL_SEND_FAILED` | 500 | Email notification could not be delivered. Please check your email configuration. | No |
| `EMAIL_NOT_ENABLED` | 403 | Email notifications are not configured on this server. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `email_notification.queued` | Email notification added to the batch queue | `recipient_id`, `channel_id`, `post_id`, `notification_type`, `timestamp` |
| `email_notification.sent` | Email notification successfully dispatched to the mail server | `recipient_id`, `notification_count`, `timestamp` |
| `email_notification.discarded` | Queued email batch discarded because user viewed the channel | `recipient_id`, `reason`, `timestamp` |
| `email_notification.suppressed` | Email suppressed due to preference, verification, or bot status | `recipient_id`, `reason`, `timestamp` |
| `email_notification.failed` | Email send attempt returned an error | `recipient_id`, `error_reason`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences-dnd | required | Email notification preferences and DND status are evaluated before every email |
| mobile-push-notifications | recommended | Email and push share notification trigger evaluation; they complement each other |
| user-deactivation-archiving | recommended | Deactivated users should not receive email notifications |

## AGI Readiness

### Goals

#### Reliable Messaging Email Notifications

Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how much message detail is included in each...

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
| `notification_preferences_dnd` | notification-preferences-dnd | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| email_queued | `autonomous` | - | - |
| email_batch_sent | `autonomous` | - | - |
| email_batch_discarded | `autonomous` | - | - |
| email_send_failed | `autonomous` | - | - |
| email_unverified_blocked | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 8
  entry_points:
    - server/channels/app/notification.go
    - server/channels/app/email/
    - server/public/model/email_notification.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Messaging Email Notifications Blueprint",
  "description": "Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how muc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "email, notifications, batching, digest, mentions, messaging"
}
</script>
