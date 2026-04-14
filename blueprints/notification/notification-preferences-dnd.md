<!-- AUTO-GENERATED FROM notification-preferences-dnd.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Notification Preferences Dnd

> User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period with automatic expiry.

**Category:** Notification · **Version:** 1.0.0 · **Tags:** notifications · preferences · dnd · do-not-disturb · mute · quiet-hours

## What this does

User-controlled notification preference system with per-channel overrides and a Do-Not-Disturb mode that suppresses all notifications for a configurable period with automatic expiry.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **desktop_notifications** *(select, required)* — Desktop notification trigger level
- **mobile_notifications** *(select, required)* — Mobile push notification trigger level
- **email_notifications** *(boolean, required)* — Whether email notifications are enabled
- **notification_comments** *(select, required)* — When to notify about thread replies
- **mention_keys** *(text, optional)* — Comma-separated custom keywords that trigger notifications when they appear in m
- **notify_on_first_name** *(boolean, optional)* — Whether the user's first name is treated as a mention keyword
- **channel_notification_override** *(json, optional)* — Per-channel overrides for desktop, mobile, and email notification levels; overri
- **channel_mark_unread** *(select, optional)* — Per-channel mute control — whether all messages or only mentions mark the channe
- **dnd_end_time** *(datetime, optional)* — Unix timestamp in seconds at which a timed DND status expires; zero means DND is
- **prev_status** *(text, optional)* — Previous availability status stored so it can be restored when DND expires

## What must be true

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

## Success & failure scenarios

**✅ Success paths**

- **Push Suppressed By Dnd** — when incoming push notification triggered for a user; user's current status is dnd, then Push notification not delivered; notification reason recorded as user status.
- **Preferences Updated** — when user submits updated notification preferences; all preference values are within allowed option sets, then New preferences take effect for the next incoming notification.
- **Channel Preference Overridden** — when user sets a channel-level notification override; channel_notification_override contains a valid level, then That channel uses the override instead of the user's global default.
- **Dnd Activated** — when user enables DND (optionally with an end time), then Push notifications suppressed until DND is manually disabled or expires.
- **Dnd Expired** — when dnd_expiry_job runs; user's dnd_end_time is in the past, then DND lifted; notifications resume according to user preferences.

## Errors it can return

- `NOTIFICATION_INVALID_PREFERENCE` — The selected notification level is not valid.
- `NOTIFICATION_CHANNEL_NOT_FOUND` — The specified channel was not found.

## Events

**`notification_prefs.updated`** — User updated their global notification preferences
  Payload: `user_id`, `changed_fields`, `timestamp`

**`user.status_changed`** — User availability status changed (online/away/dnd/offline)
  Payload: `user_id`, `old_status`, `new_status`, `dnd_end_time`, `timestamp`

**`notification.suppressed`** — A notification was suppressed due to user preference or DND status
  Payload: `user_id`, `notification_type`, `reason`, `channel_id`, `timestamp`

## Connects to

- **email-notifications** *(required)* — Email notification preferences are part of the same preference set
- **mobile-push-notifications** *(required)* — DND status directly suppresses push notifications
- **channel-moderation** *(recommended)* — Channel-level muting (mark_unread = mention) is implemented via the same notification preference mechanism

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/notification-preferences-dnd/) · **Spec source:** [`notification-preferences-dnd.blueprint.yaml`](./notification-preferences-dnd.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
