---
title: "Sms Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Send SMS messages for OTP codes, alerts, and marketing with provider abstraction and compliance. 6 fields. 8 outcomes. 7 error codes. rules: delivery, phone_val"
---

# Sms Notifications Blueprint

> Send SMS messages for OTP codes, alerts, and marketing with provider abstraction and compliance

| | |
|---|---|
| **Feature** | `sms-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | sms, otp, alerts, marketing, tcpa, gdpr, notification, messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/notification/sms-notifications.blueprint.yaml) |
| **JSON API** | [sms-notifications.json]({{ site.baseurl }}/api/blueprints/notification/sms-notifications.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `recipient_phone` | phone | Yes | Recipient Phone Number | Validations: required, pattern |
| `message_body` | text | Yes | Message Body | Validations: required, maxLength |
| `message_type` | select | Yes | Message Type | Validations: required |
| `sender_id` | text | No | Sender ID | Validations: maxLength |
| `tracking_id` | text | No | Tracking ID |  |
| `expiry_seconds` | number | No | Message Expiry | Validations: min, max |

## Rules

- **delivery:**
  - **provider_abstraction:** true
  - **max_retries:** 2
  - **retry_backoff:** exponential
  - **retry_base_seconds:** 15
  - **timeout_seconds:** 30
- **phone_validation:**
  - **format:** e164
  - **lookup_carrier:** true
  - **reject_landline_for_otp:** true
- **compliance:**
  - **tcpa:**
    - **prior_express_consent_required:** true
    - **opt_out_keywords:** STOP, UNSUBSCRIBE, CANCEL, END, QUIT
    - **opt_out_response:** You have been unsubscribed. Reply START to re-subscribe.
    - **opt_in_keywords:** START, YES, SUBSCRIBE
    - **quiet_hours:**
      - **start:** 21:00
      - **end:** 08:00
      - **timezone:** recipient_local
  - **gdpr:**
    - **consent_record_required:** true
    - **right_to_erasure:** true
- **rate_limiting:**
  - **per_recipient_per_minute:** 2
  - **per_recipient_per_hour:** 10
  - **per_recipient_per_day:** 25
  - **otp_per_recipient_per_hour:** 5
  - **global_per_second:** 30
- **security:**
  - **otp_masking:** true
  - **sensitive_data_scrubbing:** true
  - **number_sanitization:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `SMS_RATE_LIMITED`

**Given:**
- `recipient_send_count` (computed) gte `2`

**Result:** reject with rate limit error

### Invalid_phone_number (Priority: 2) — Error: `SMS_INVALID_PHONE`

**Given:**
- `recipient_phone` (input) not_exists

**Result:** reject with invalid phone number error

### Recipient_opted_out (Priority: 3) — Error: `SMS_RECIPIENT_OPTED_OUT`

**Given:**
- `opt_out_status` (db) eq `true`

**Then:**
- **emit_event** event: `sms.blocked`

**Result:** silently skip delivery and log opt-out hit

### Quiet_hours_blocked (Priority: 4) — Error: `SMS_QUIET_HOURS`

**Given:**
- `message_type` (input) eq `marketing`
- `recipient_local_time` (computed) gt `21:00`

**Result:** queue for delivery after quiet hours end

### Missing_consent (Priority: 5) — Error: `SMS_CONSENT_REQUIRED`

**Given:**
- `message_type` (input) in `marketing,alert`
- `consent_record` (db) not_exists

**Result:** reject with consent required error

### Sms_sent (Priority: 10) | Transaction: atomic

**Given:**
- `recipient_phone` (input) matches `^\+[1-9]\d{6,14}$`
- `opt_out_status` (db) neq `true`
- `message_body` (input) exists

**Then:**
- **call_service** target: `sms_provider` — Deliver SMS via configured provider
- **create_record** target: `delivery_log` — Record delivery attempt with tracking ID and segment count
- **emit_event** event: `sms.sent`

**Result:** SMS queued for delivery with tracking ID returned

### Sms_delivered (Priority: 11)

**Given:**
- `delivery_status` (system) eq `delivered`

**Then:**
- **set_field** target: `delivered_at` value: `now` — Record delivery timestamp
- **emit_event** event: `sms.delivered`

**Result:** update delivery log with confirmed delivery

### Sms_failed (Priority: 12)

**Given:**
- `delivery_status` (system) eq `failed`

**Then:**
- **set_field** target: `failure_reason` value: `provider_error` — Record failure reason from provider
- **emit_event** event: `sms.failed`

**Result:** update delivery log with failure and trigger retry if eligible

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SMS_RATE_LIMITED` | 429 | SMS rate limit exceeded. Please try again later. | Yes |
| `SMS_INVALID_PHONE` | 422 | Invalid phone number. Please use E.164 format. | No |
| `SMS_RECIPIENT_OPTED_OUT` | 422 | Recipient has opted out of SMS messages | No |
| `SMS_QUIET_HOURS` | 422 | Marketing messages cannot be sent during quiet hours | Yes |
| `SMS_CONSENT_REQUIRED` | 403 | Recipient consent is required for this message type | No |
| `SMS_DELIVERY_FAILED` | 503 | SMS delivery failed. The message will be retried automatically. | Yes |
| `SMS_VALIDATION_ERROR` | 422 | Please check the SMS parameters and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sms.sent` | SMS successfully queued for delivery | `tracking_id`, `recipient_phone`, `message_type`, `segment_count`, `timestamp` |
| `sms.delivered` | Provider confirmed SMS delivery to recipient | `tracking_id`, `recipient_phone`, `delivered_at`, `timestamp` |
| `sms.failed` | SMS delivery failed after all retries | `tracking_id`, `recipient_phone`, `failure_reason`, `error_code`, `timestamp` |
| `sms.blocked` | SMS blocked due to opt-out or compliance rule | `recipient_phone`, `message_type`, `reason`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences | required | Must check user SMS opt-in preferences before sending |
| email-notifications | optional | Email fallback when SMS delivery fails |
| login | optional | OTP codes for two-factor authentication during login |
| webhook-outbound | optional | Delivery receipt callbacks from SMS providers |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: admin_panel
description: SMS delivery management is typically an admin/back-office concern
admin_views:
  - view: delivery_log
    description: Searchable log of all sent SMS with delivery status
    columns:
      - recipient_phone
      - message_type
      - status
      - segment_count
      - sent_at
      - delivered_at
  - view: opt_out_list
    description: Manage opted-out phone numbers
    columns:
      - phone
      - opted_out_at
      - reason
    actions:
      - remove_opt_out
  - view: consent_records
    description: View consent records for compliance audit
    columns:
      - phone
      - message_type
      - consented_at
      - consent_source
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Sms Notifications Blueprint",
  "description": "Send SMS messages for OTP codes, alerts, and marketing with provider abstraction and compliance. 6 fields. 8 outcomes. 7 error codes. rules: delivery, phone_val",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sms, otp, alerts, marketing, tcpa, gdpr, notification, messaging"
}
</script>
