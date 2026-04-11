<!-- AUTO-GENERATED FROM notification-preferences.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Notification Preferences

> Manage per-user notification preferences across channels and categories with quiet hours and frequency caps

**Category:** Notification · **Version:** 1.0.0 · **Tags:** preferences · opt-in · opt-out · quiet-hours · digest · do-not-disturb · notification · settings

## What this does

Manage per-user notification preferences across channels and categories with quiet hours and frequency caps

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(text, required)* — User ID
- **channel** *(select, required)* — Notification Channel
- **category** *(select, required)* — Notification Category
- **enabled** *(boolean, required)* — Enabled
- **quiet_hours_start** *(text, optional)* — Quiet Hours Start
- **quiet_hours_end** *(text, optional)* — Quiet Hours End
- **quiet_hours_timezone** *(text, optional)* — Timezone
- **do_not_disturb** *(boolean, optional)* — Do Not Disturb
- **do_not_disturb_until** *(datetime, optional)* — Do Not Disturb Until
- **digest_mode** *(select, optional)* — Digest Mode
- **digest_time** *(text, optional)* — Digest Delivery Time
- **frequency_cap_per_day** *(number, optional)* — Daily Frequency Cap

## What must be true

- **defaults → new_user_defaults → email → marketing:** false
- **defaults → new_user_defaults → email → transactional:** true
- **defaults → new_user_defaults → email → security:** true
- **defaults → new_user_defaults → email → social:** true
- **defaults → new_user_defaults → email → updates:** true
- **defaults → new_user_defaults → email → reminders:** true
- **defaults → new_user_defaults → sms → marketing:** false
- **defaults → new_user_defaults → sms → transactional:** false
- **defaults → new_user_defaults → sms → security:** true
- **defaults → new_user_defaults → sms → social:** false
- **defaults → new_user_defaults → sms → updates:** false
- **defaults → new_user_defaults → sms → reminders:** false
- **defaults → new_user_defaults → push → marketing:** false
- **defaults → new_user_defaults → push → transactional:** true
- **defaults → new_user_defaults → push → security:** true
- **defaults → new_user_defaults → push → social:** true
- **defaults → new_user_defaults → push → updates:** true
- **defaults → new_user_defaults → push → reminders:** true
- **defaults → new_user_defaults → in_app → marketing:** true
- **defaults → new_user_defaults → in_app → transactional:** true
- **defaults → new_user_defaults → in_app → security:** true
- **defaults → new_user_defaults → in_app → social:** true
- **defaults → new_user_defaults → in_app → updates:** true
- **defaults → new_user_defaults → in_app → reminders:** true
- **overrides → security_always_on:** true
- **overrides → transactional_always_on_for_in_app:** true
- **quiet_hours → default_start:** 22:00
- **quiet_hours → default_end:** 08:00
- **quiet_hours → applies_to:** marketing, social, updates, reminders
- **quiet_hours → queue_during_quiet:** true
- **frequency_caps → check_before_send:** true
- **frequency_caps → cap_exceeded_action:** queue_for_digest
- **do_not_disturb → overrides_all:** true
- **do_not_disturb → security_exception:** true
- **do_not_disturb → auto_expire:** true
- **compliance → unsubscribe_must_be_immediate:** true
- **compliance → preference_export:** true
- **compliance → preference_deletion:** true

## Success & failure scenarios

**✅ Success paths**

- **Preferences Updated** — when User exists; Valid notification channel; Valid notification category, then preference saved and applied immediately.
- **Quiet Hours Set** — when Quiet hours start time provided; Quiet hours end time provided, then quiet hours configured for the user.
- **Dnd Enabled** — when User is enabling Do Not Disturb, then all non-security notifications paused until DND is disabled or expires.
- **Dnd Auto Expired** — when DND is currently active; DND expiry time has passed, then DND automatically disabled and normal notification delivery resumes.
- **Digest Mode Configured** — when User selected a digest mode, then notifications will be batched and delivered according to digest schedule.

**❌ Failure paths**

- **User Not Found** — when User does not exist in the system, then reject with user not found error. *(error: `PREFERENCES_USER_NOT_FOUND`)*
- **Security Category Locked** — when User is attempting to disable security notifications; Attempting to opt out, then reject — security notifications cannot be disabled. *(error: `PREFERENCES_SECURITY_LOCKED`)*

## Errors it can return

- `PREFERENCES_USER_NOT_FOUND` — User not found
- `PREFERENCES_SECURITY_LOCKED` — Security notifications cannot be disabled
- `PREFERENCES_INVALID_CHANNEL` — Invalid notification channel
- `PREFERENCES_INVALID_CATEGORY` — Invalid notification category
- `PREFERENCES_VALIDATION_ERROR` — Please check your preference settings and try again

## Connects to

- **email-notifications** *(required)* — Email channel preferences control email delivery
- **sms-notifications** *(required)* — SMS channel preferences control SMS delivery
- **push-notifications** *(required)* — Push channel preferences control push delivery
- **in-app-notifications** *(required)* — In-app channel preferences control in-app delivery
- **signup** *(recommended)* — Initialize default preferences when a new user signs up

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/notification-preferences/) · **Spec source:** [`notification-preferences.blueprint.yaml`](./notification-preferences.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
