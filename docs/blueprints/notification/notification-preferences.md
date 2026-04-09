---
title: "Notification Preferences Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Manage per-user notification preferences across channels and categories with quiet hours and frequency caps. 12 fields. 7 outcomes. 5 error codes. rules: defaul"
---

# Notification Preferences Blueprint

> Manage per-user notification preferences across channels and categories with quiet hours and frequency caps

| | |
|---|---|
| **Feature** | `notification-preferences` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | preferences, opt-in, opt-out, quiet-hours, digest, do-not-disturb, notification, settings |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/notification-preferences.blueprint.yaml) |
| **JSON API** | [notification-preferences.json]({{ site.baseurl }}/api/blueprints/notification/notification-preferences.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes | User ID | Validations: required |
| `channel` | select | Yes | Notification Channel | Validations: required |
| `category` | select | Yes | Notification Category | Validations: required |
| `enabled` | boolean | Yes | Enabled |  |
| `quiet_hours_start` | text | No | Quiet Hours Start | Validations: pattern |
| `quiet_hours_end` | text | No | Quiet Hours End | Validations: pattern |
| `quiet_hours_timezone` | text | No | Timezone | Validations: pattern |
| `do_not_disturb` | boolean | No | Do Not Disturb |  |
| `do_not_disturb_until` | datetime | No | Do Not Disturb Until |  |
| `digest_mode` | select | No | Digest Mode |  |
| `digest_time` | text | No | Digest Delivery Time | Validations: pattern |
| `frequency_cap_per_day` | number | No | Daily Frequency Cap | Validations: min |

## Rules

- **defaults:**
  - **new_user_defaults:**
    - **email:**
      - **marketing:** false
      - **transactional:** true
      - **security:** true
      - **social:** true
      - **updates:** true
      - **reminders:** true
    - **sms:**
      - **marketing:** false
      - **transactional:** false
      - **security:** true
      - **social:** false
      - **updates:** false
      - **reminders:** false
    - **push:**
      - **marketing:** false
      - **transactional:** true
      - **security:** true
      - **social:** true
      - **updates:** true
      - **reminders:** true
    - **in_app:**
      - **marketing:** true
      - **transactional:** true
      - **security:** true
      - **social:** true
      - **updates:** true
      - **reminders:** true
- **overrides:**
  - **security_always_on:** true
  - **transactional_always_on_for_in_app:** true
- **quiet_hours:**
  - **default_start:** 22:00
  - **default_end:** 08:00
  - **applies_to:** marketing, social, updates, reminders
  - **queue_during_quiet:** true
- **frequency_caps:**
  - **check_before_send:** true
  - **cap_exceeded_action:** queue_for_digest
- **do_not_disturb:**
  - **overrides_all:** true
  - **security_exception:** true
  - **auto_expire:** true
- **compliance:**
  - **unsubscribe_must_be_immediate:** true
  - **preference_export:** true
  - **preference_deletion:** true

## Outcomes

### User_not_found (Priority: 1) — Error: `PREFERENCES_USER_NOT_FOUND`

**Given:**
- `user_id` (db) not_exists

**Result:** reject with user not found error

### Security_category_locked (Priority: 2) — Error: `PREFERENCES_SECURITY_LOCKED`

**Given:**
- `category` (input) eq `security`
- `enabled` (input) eq `false`

**Result:** reject — security notifications cannot be disabled

### Preferences_updated (Priority: 10) | Transaction: atomic

**Given:**
- `user_id` (db) exists
- `channel` (input) in `email,sms,push,in_app`
- `category` (input) in `marketing,transactional,security,social,updates,reminders`

**Then:**
- **set_field** target: `preference` value: `input` — Update the channel-category preference record
- **emit_event** event: `preferences.updated`

**Result:** preference saved and applied immediately

### Quiet_hours_set (Priority: 11)

**Given:**
- `quiet_hours_start` (input) exists
- `quiet_hours_end` (input) exists

**Then:**
- **set_field** target: `quiet_hours` value: `input` — Save quiet hours window
- **emit_event** event: `preferences.updated`

**Result:** quiet hours configured for the user

### Dnd_enabled (Priority: 12)

**Given:**
- `do_not_disturb` (input) eq `true`

**Then:**
- **set_field** target: `do_not_disturb` value: `true` — Enable global Do Not Disturb
- **emit_event** event: `preferences.updated`

**Result:** all non-security notifications paused until DND is disabled or expires

### Dnd_auto_expired (Priority: 13)

**Given:**
- `do_not_disturb` (db) eq `true`
- `do_not_disturb_until` (db) lt `now`

**Then:**
- **set_field** target: `do_not_disturb` value: `false` — Auto-disable DND
- **emit_event** event: `preferences.updated`

**Result:** DND automatically disabled and normal notification delivery resumes

### Digest_mode_configured (Priority: 14)

**Given:**
- `digest_mode` (input) in `hourly,daily,weekly`

**Then:**
- **set_field** target: `digest_mode` value: `input` — Save digest mode preference
- **set_field** target: `digest_time` value: `input` — Save preferred digest delivery time
- **emit_event** event: `preferences.updated`

**Result:** notifications will be batched and delivered according to digest schedule

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PREFERENCES_USER_NOT_FOUND` | 404 | User not found | No |
| `PREFERENCES_SECURITY_LOCKED` | 403 | Security notifications cannot be disabled | No |
| `PREFERENCES_INVALID_CHANNEL` | 422 | Invalid notification channel | No |
| `PREFERENCES_INVALID_CATEGORY` | 422 | Invalid notification category | No |
| `PREFERENCES_VALIDATION_ERROR` | 422 | Please check your preference settings and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `preferences.updated` | User notification preferences changed | `user_id`, `channel`, `category`, `enabled`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| email-notifications | required | Email channel preferences control email delivery |
| sms-notifications | required | SMS channel preferences control SMS delivery |
| push-notifications | required | Push channel preferences control push delivery |
| in-app-notifications | required | In-app channel preferences control in-app delivery |
| signup | recommended | Initialize default preferences when a new user signs up |

## AGI Readiness

### Goals

#### Reliable Notification Preferences

Manage per-user notification preferences across channels and categories with quiet hours and frequency caps

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
| `email_notifications` | email-notifications | degrade |
| `sms_notifications` | sms-notifications | degrade |
| `push_notifications` | push-notifications | degrade |
| `in_app_notifications` | in-app-notifications | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| user_not_found | `autonomous` | - | - |
| security_category_locked | `autonomous` | - | - |
| preferences_updated | `supervised` | - | - |
| quiet_hours_set | `autonomous` | - | - |
| dnd_enabled | `autonomous` | - | - |
| dnd_auto_expired | `autonomous` | - | - |
| digest_mode_configured | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: settings_page
description: Notification preferences page in user settings
components:
  channel_matrix:
    description: "Grid of toggles: rows = categories, columns = channels"
    rows:
      - marketing
      - transactional
      - security
      - social
      - updates
      - reminders
    columns:
      - email
      - sms
      - push
      - in_app
    disabled_cells:
      - category: security
        channels:
          - email
          - sms
          - push
          - in_app
        reason: Security notifications are always enabled
  quiet_hours:
    description: Time picker for quiet hours start/end with timezone selector
    show_preview: true
  do_not_disturb:
    description: Toggle with optional duration picker
    quick_options:
      - 1 hour
      - Until tomorrow
      - Until I turn it off
  digest_settings:
    description: Digest mode selector with delivery time picker
    show_when: digest_mode != off
fields_order:
  - do_not_disturb
  - channel_matrix
  - quiet_hours
  - digest_settings
accessibility:
  autofocus: do_not_disturb
  aria_live_region: true
  keyboard_navigation: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Notification Preferences Blueprint",
  "description": "Manage per-user notification preferences across channels and categories with quiet hours and frequency caps. 12 fields. 7 outcomes. 5 error codes. rules: defaul",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "preferences, opt-in, opt-out, quiet-hours, digest, do-not-disturb, notification, settings"
}
</script>
