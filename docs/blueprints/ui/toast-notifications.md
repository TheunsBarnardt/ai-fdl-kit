---
title: "Toast Notifications Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Transient toast/snackbar notifications with auto-dismiss, stacking, and accessibility. 7 fields. 8 outcomes. 3 error codes. rules: stacking, auto_dismiss, acces"
---

# Toast Notifications Blueprint

> Transient toast/snackbar notifications with auto-dismiss, stacking, and accessibility

| | |
|---|---|
| **Feature** | `toast-notifications` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | toast, snackbar, notification, feedback, ui, accessibility |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/ui/toast-notifications.blueprint.yaml) |
| **JSON API** | [toast-notifications.json]({{ site.baseurl }}/api/blueprints/ui/toast-notifications.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message` | text | Yes | Message | Validations: required, maxLength |
| `type` | select | Yes | Notification Type | Validations: required |
| `duration_ms` | number | No | Duration (ms) | Validations: min, max |
| `dismissible` | boolean | No | Dismissible |  |
| `action_label` | text | No | Action Button Label | Validations: maxLength |
| `action_callback` | text | No | Action Callback |  |
| `position` | select | No | Position |  |

## Rules

- **stacking:**
  - **max_visible:** 5
  - **strategy:** fifo
  - **gap_px:** 8
  - **animation:** slide_in
- **auto_dismiss:**
  - **default_duration_ms:** 5000
  - **error_persistent:** true
  - **warning_duration_ms:** 8000
  - **pause_on_hover:** true
- **accessibility:**
  - **aria_live:** polite
  - **aria_live_error:** assertive
  - **role:** status
  - **focus_management:** false
  - **announce_dismissal:** true
- **theming:**
  - **icon_per_type:** true
  - **color_per_type:** true
  - **respect_reduced_motion:** true

## Outcomes

### Empty_message (Priority: 1) — Error: `TOAST_EMPTY_MESSAGE`

**Given:**
- `message` (input) not_exists

**Result:** do not render toast — silently fail or log warning

### Queue_overflow (Priority: 2)

**Given:**
- `visible_count` (computed) gte `5`

**Then:**
- **set_field** target: `oldest_toast` value: `dismissed` — Dismiss oldest toast to make room (FIFO)

**Result:** dismiss oldest toast and display new one

### Error_toast (Priority: 3)

**Given:**
- `type` (input) eq `error`

**Then:**
- **set_field** target: `duration_ms` value: `0` — Error toasts are persistent — no auto-dismiss
- **set_field** target: `dismissible` value: `true` — Error toasts must be manually dismissible
- **set_field** target: `aria_live` value: `assertive` — Errors use assertive announcements for screen readers

**Result:** render persistent error toast with assertive aria-live and close button

### Warning_toast (Priority: 4)

**Given:**
- `type` (input) eq `warning`

**Then:**
- **set_field** target: `duration_ms` value: `8000` — Warnings display for 8 seconds
- **set_field** target: `aria_live` value: `assertive` — Warnings use assertive announcements

**Result:** render warning toast with 8-second auto-dismiss and assertive aria-live

### Toast_with_action (Priority: 5)

**Given:**
- `action_label` (input) exists
- `action_callback` (input) exists

**Result:** render toast with action button that triggers callback on click

### Hover_pause (Priority: 6)

**Given:**
- `mouse_hover` (system) eq `true`
- `duration_ms` (input) gt `0`

**Then:**
- **set_field** target: `timer_paused` value: `true` — Pause auto-dismiss countdown

**Result:** pause auto-dismiss timer while mouse hovers, resume on mouse leave

### Default_toast (Priority: 10)

**Given:**
- `message` (input) exists
- `type` (input) in `success,info`

**Then:**
- **emit_event** event: `toast.shown`

**Result:** render toast with 5-second auto-dismiss, type-specific icon and color, and polite aria-live

### Toast_dismissed (Priority: 11)

**Given:**
- `toast_id` (input) exists

**Then:**
- **emit_event** event: `toast.dismissed`

**Result:** remove toast with fade-out animation and announce removal to screen readers

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TOAST_EMPTY_MESSAGE` | 400 | Notification message is required | No |
| `TOAST_INVALID_TYPE` | 400 | Invalid notification type. Must be success, error, warning, or info. | No |
| `TOAST_INVALID_POSITION` | 400 | Invalid position. Must be top-right, top-left, top-center, bottom-right, bottom-left, or bottom-center. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `toast.shown` | Toast notification displayed to the user | `message`, `type`, `position`, `duration_ms`, `timestamp` |
| `toast.dismissed` | Toast notification dismissed by user or auto-dismiss | `toast_id`, `type`, `dismissed_by`, `timestamp` |
| `toast.action_clicked` | User clicked the action button on a toast | `toast_id`, `action_label`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| form-builder | recommended | Forms show success/error toasts after submission |
| theme-configuration | optional | Toast colors and styling adapt to the active theme |
| internationalization | optional | Toast messages may need translation and RTL support |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Toast Notifications Blueprint",
  "description": "Transient toast/snackbar notifications with auto-dismiss, stacking, and accessibility. 7 fields. 8 outcomes. 3 error codes. rules: stacking, auto_dismiss, acces",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "toast, snackbar, notification, feedback, ui, accessibility"
}
</script>
