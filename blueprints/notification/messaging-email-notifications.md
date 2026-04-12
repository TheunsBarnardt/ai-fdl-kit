<!-- AUTO-GENERATED FROM messaging-email-notifications.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Messaging Email Notifications

> Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how much message detail is included in each...

**Category:** Notification · **Version:** 1.0.0 · **Tags:** email · notifications · batching · digest · mentions · messaging

## What this does

Email delivery of missed message notifications with configurable batching intervals, mention-aware triggering, and content level controls that determine how much message detail is included in each...

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **recipient_user_id** *(hidden, required)* — User receiving the email notification
- **sender_display_name** *(text, required)* — Name of the message author shown in the email
- **channel_name** *(text, optional)* — Name of the channel where the message was posted
- **team_name** *(text, optional)* — Name of the workspace containing the channel
- **message_html** *(rich_text, optional)* — HTML-formatted message body (included for full content level)
- **message_text** *(text, optional)* — Plain-text fallback message body
- **notification_type** *(select, required)* — What triggered this notification
- **email_interval** *(select, required)* — User's selected batching frequency for email notifications

## What must be true

- **rule_01:** Email notifications are sent only when the user is not currently active in the application at the time of delivery.
- **rule_02:** Trigger evaluation follows this hierarchy: channel-level preference → user-level preference. A channel override of 'default' falls back to the user's global email preference.
- **rule_03:** {"Email is not sent for":"system messages, messages sent by the user themselves, channels where email is set to 'none', mentions in muted channels when the user has 'mention' push level."}
- **rule_04:** The 'immediately' interval actually queues for a short delay (approximately 30 seconds) to allow message threads to settle before sending.
- **rule_05:** When batching is enabled, if the user views any channel in the workspace after a notification is queued but before the batch fires, the entire batch for that workspace is discarded.
- **rule_06:** Direct messages and thread replies in followed threads may have independent email preference settings from global channel notifications.
- **rule_07:** Content level determines how much of the message appears in the email body; some configurations send only a generic alert without message content for privacy.
- **rule_08:** Unverified email addresses are blocked from receiving notifications when email verification is required.
- **rule_09:** Bots do not receive email notifications.

## Success & failure scenarios

**✅ Success paths**

- **Email Unverified Blocked** — when notification would be sent to user; user's email address is not verified; server requires email verification, then Email suppressed; user must verify their email address first.
- **Email Batch Discarded** — when user views a channel that has queued notifications before the batch interval elapses, then Email not sent; user has already seen the messages.
- **Email Queued** — when message triggers notification for a recipient; recipient's email preference is not 'none' at the applicable scope; recipient's email address is verified (if verification required); recipient is not the message author; channel notification level permits email; recipient is a human user (not a bot), then Notification queued; will be sent at or after the user's configured batch interval.
- **Email Batch Sent** — when email_batching_job fires at its configured interval; user has one or more queued notifications; configured batch interval for the user has elapsed since the first queued notification; user has not viewed the relevant channels since queueing, then Single email containing all queued notifications delivered to the recipient.

**❌ Failure paths**

- **Email Send Failed** — when email send attempt made to mail server; SMTP server returns an error or is unreachable, then Notification recorded as failed; no automatic retry. *(error: `EMAIL_SEND_FAILED`)*

## Errors it can return

- `EMAIL_SEND_FAILED` — Email notification could not be delivered. Please check your email configuration.
- `EMAIL_NOT_ENABLED` — Email notifications are not configured on this server.

## Connects to

- **notification-preferences-dnd** *(required)* — Email notification preferences and DND status are evaluated before every email
- **mobile-push-notifications** *(recommended)* — Email and push share notification trigger evaluation; they complement each other
- **user-deactivation-archiving** *(recommended)* — Deactivated users should not receive email notifications

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/messaging-email-notifications/) · **Spec source:** [`messaging-email-notifications.blueprint.yaml`](./messaging-email-notifications.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
