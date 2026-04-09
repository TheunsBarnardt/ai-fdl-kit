---
title: "Email Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Send transactional and system emails with template rendering, delivery tracking, and bounce handling. 10 fields. 7 outcomes. 6 error codes. rules: delivery, tem"
---

# Email Notifications Blueprint

> Send transactional and system emails with template rendering, delivery tracking, and bounce handling

| | |
|---|---|
| **Feature** | `email-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | email, transactional, templates, delivery-tracking, bounce-handling, unsubscribe, notification |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/email-notifications.blueprint.yaml) |
| **JSON API** | [email-notifications.json]({{ site.baseurl }}/api/blueprints/notification/email-notifications.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `recipient_email` | email | Yes | Recipient Email | Validations: required, email, maxLength |
| `template_id` | text | Yes | Template ID | Validations: required, pattern |
| `template_variables` | json | No | Template Variables |  |
| `subject` | text | Yes | Email Subject | Validations: required, maxLength |
| `from_address` | email | No | From Address |  |
| `reply_to` | email | No | Reply-To Address |  |
| `category` | select | Yes | Email Category | Validations: required |
| `priority` | select | No | Send Priority |  |
| `tracking_id` | text | No | Tracking ID |  |
| `unsubscribe_url` | url | No | Unsubscribe URL |  |

## Rules

- **delivery:**
  - **provider_abstraction:** true
  - **max_retries:** 3
  - **retry_backoff:** exponential
  - **retry_base_seconds:** 30
  - **timeout_seconds:** 30
- **templates:**
  - **engine:** variable_substitution
  - **escape_html:** true
  - **fallback_to_plain_text:** true
  - **required_variables_check:** true
- **bounce_handling:**
  - **soft_bounce_max_retries:** 3
  - **hard_bounce_action:** suppress
  - **complaint_action:** unsubscribe
  - **suppression_list:** true
- **compliance:**
  - **unsubscribe_link_required:** true
  - **list_unsubscribe_header:** true
  - **physical_address_required:** true
- **rate_limiting:**
  - **per_recipient_per_hour:** 10
  - **per_domain_per_minute:** 100
  - **global_per_second:** 50
- **security:**
  - **dkim_signing:** true
  - **spf_validation:** true
  - **dmarc_policy:** reject
  - **sanitize_variables:** true

## Outcomes

### Rate_limited (Priority: 1) — Error: `EMAIL_RATE_LIMITED`

**Given:**
- `recipient_send_count` (computed) gte `10`

**Result:** queue email for deferred delivery after rate limit window

### Invalid_template (Priority: 2) — Error: `EMAIL_TEMPLATE_NOT_FOUND`

**Given:**
- `template_id` (db) not_exists

**Result:** reject with template not found error

### Missing_variables (Priority: 3) — Error: `EMAIL_MISSING_VARIABLES`

**Given:**
- `required_variables` (computed) neq `satisfied`

**Result:** reject with missing variables error listing which variables are absent

### Recipient_suppressed (Priority: 4) — Error: `EMAIL_RECIPIENT_SUPPRESSED`

**Given:**
- `recipient_email` (db) eq `suppressed`

**Then:**
- **emit_event** event: `email.suppressed`

**Result:** silently skip delivery and log suppression hit

### Email_sent (Priority: 10) | Transaction: atomic

**Given:**
- `template_id` (db) exists
- `recipient_email` (input) matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `recipient_email` (db) neq `suppressed`

**Then:**
- **call_service** target: `template_engine` — Render template with variable substitution and HTML escaping
- **call_service** target: `email_provider` — Deliver email via configured provider
- **create_record** target: `delivery_log` — Record delivery attempt with tracking ID
- **emit_event** event: `email.sent`

**Result:** email queued for delivery with tracking ID returned

### Email_bounced (Priority: 11)

**Given:**
- `delivery_status` (system) eq `bounced`

**Then:**
- **set_field** target: `bounce_count` value: `increment` — Increment bounce counter for this recipient
- **set_field** target: `suppressed` value: `true` when: `bounce_type == "hard"` — Add to suppression list on hard bounce
- **emit_event** event: `email.bounced`

**Result:** update delivery log and suppress recipient on hard bounce

### Email_opened (Priority: 12)

**Given:**
- `tracking_pixel_hit` (system) eq `true`

**Then:**
- **set_field** target: `opened_at` value: `now` — Record first open timestamp
- **emit_event** event: `email.opened`

**Result:** record open event in delivery log

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EMAIL_RATE_LIMITED` | 429 | Email rate limit exceeded. Please try again later. | Yes |
| `EMAIL_TEMPLATE_NOT_FOUND` | 404 | Email template not found | No |
| `EMAIL_MISSING_VARIABLES` | 422 | Required template variables are missing | No |
| `EMAIL_RECIPIENT_SUPPRESSED` | 422 | Recipient address is suppressed | No |
| `EMAIL_DELIVERY_FAILED` | 503 | Email delivery failed. The message will be retried automatically. | Yes |
| `EMAIL_VALIDATION_ERROR` | 422 | Please check the email parameters and try again | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `email.sent` | Email successfully queued for delivery | `tracking_id`, `recipient_email`, `template_id`, `category`, `timestamp` |
| `email.bounced` | Email delivery bounced (soft or hard) | `tracking_id`, `recipient_email`, `bounce_type`, `reason`, `timestamp` |
| `email.opened` | Recipient opened the email (tracking pixel loaded) | `tracking_id`, `recipient_email`, `opened_at`, `user_agent` |
| `email.suppressed` | Delivery skipped because recipient is on suppression list | `recipient_email`, `template_id`, `reason`, `timestamp` |
| `email.delivered` | Provider confirmed delivery to recipient mailbox | `tracking_id`, `recipient_email`, `delivered_at`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| notification-preferences | required | Must check user email opt-in preferences before sending |
| password-reset | optional | Password reset emails are a common transactional email type |
| email-verification | optional | Verification emails are sent via this system |
| signup | optional | Welcome emails triggered on signup |
| webhook-outbound | optional | Bounce and delivery webhooks from providers use outbound webhook patterns |

## AGI Readiness

### Goals

#### Reliable Email Notifications

Send transactional and system emails with template rendering, delivery tracking, and bounce handling

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
| rate_limited | `autonomous` | - | - |
| invalid_template | `autonomous` | - | - |
| missing_variables | `autonomous` | - | - |
| recipient_suppressed | `autonomous` | - | - |
| email_sent | `autonomous` | - | - |
| email_bounced | `autonomous` | - | - |
| email_opened | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: admin_panel
description: Email delivery management is typically an admin/back-office concern
admin_views:
  - view: delivery_log
    description: Searchable log of all sent emails with status
    columns:
      - recipient_email
      - template_id
      - category
      - status
      - sent_at
      - opened_at
  - view: suppression_list
    description: Manage suppressed email addresses
    columns:
      - email
      - reason
      - suppressed_at
    actions:
      - remove_suppression
  - view: template_manager
    description: Preview and edit email templates
    actions:
      - preview
      - edit
      - send_test
accessibility:
  aria_live_region: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Email Notifications Blueprint",
  "description": "Send transactional and system emails with template rendering, delivery tracking, and bounce handling. 10 fields. 7 outcomes. 6 error codes. rules: delivery, tem",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "email, transactional, templates, delivery-tracking, bounce-handling, unsubscribe, notification"
}
</script>
