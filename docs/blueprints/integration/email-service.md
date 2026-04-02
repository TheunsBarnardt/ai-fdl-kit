---
title: "Email Service Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends. 14 fields"
---

# Email Service Blueprint

> Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends

| | |
|---|---|
| **Feature** | `email-service` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | email, transactional, smtp, templates, notifications |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/integration/email-service.blueprint.yaml) |
| **JSON API** | [email-service.json]({{ site.baseurl }}/api/blueprints/integration/email-service.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `from` | email | Yes | Sender email address | Validations: email |
| `to` | json | Yes | Recipient email addresses | Validations: required |
| `cc` | json | No | CC recipient email addresses |  |
| `bcc` | json | No | BCC recipient email addresses |  |
| `reply_to` | email | No | Reply-to email address |  |
| `subject` | text | Yes | Email subject line | Validations: maxLength |
| `template_id` | text | No | Template identifier for server-side rendering |  |
| `template_vars` | json | No | Variables for template rendering (Handlebars/Mustache) |  |
| `body_html` | rich_text | No | HTML email body |  |
| `body_text` | text | No | Plain text email body (fallback) |  |
| `attachments` | json | No | File attachments array (filename, content_type, data) | Validations: max |
| `priority` | select | No | Email priority |  |
| `message_id` | text | No | Unique message identifier returned by provider |  |
| `delivery_status` | select | No | Current delivery status |  |

## Rules

- **recipients:** Maximum 50 recipients per single send (to + cc + bcc combined), At least one recipient in to[] is required, All recipient addresses must be valid RFC 5322 email addresses
- **content:** Either template_id or body_html/body_text must be provided, When template_id is set, template_vars are merged into the template at send time, HTML emails should always include a plain text fallback for accessibility
- **attachments:** Maximum total attachment size is 25MB per email, Each attachment must include filename and content_type, Executable file types (.exe, .bat, .cmd, .scr) are rejected
- **compliance:** Marketing emails must include an unsubscribe header (RFC 8058 List-Unsubscribe), Sender domain must pass SPF, DKIM, and DMARC verification, Bounce and complaint rates must stay below provider thresholds (bounce < 5%, complaint < 0.1%)
- **security:** Email content must be sanitized to prevent header injection attacks, Attachment content is scanned for malware before sending, Rate limiting applied per sender: max 100 emails per minute

## Outcomes

### Single_email_sent (Priority: 1)

**Given:**
- Valid from address with verified domain
- At least one valid recipient in to[]
- Subject and body (template or inline) provided

**Then:**
- **create_record**
- **emit_event** event: `email.queued`

**Result:** Email queued for delivery; message_id returned for tracking

### Template_email_sent (Priority: 2)

**Given:**
- template_id references a valid registered template
- template_vars contain all required variables for the template

**Then:**
- **emit_event** event: `email.queued`

**Result:** Template rendered with variables and email queued for delivery

### Batch_email_sent (Priority: 3)

**Given:**
- Multiple recipients provided (batch mode)
- Total recipients does not exceed 50

**Then:**
- **emit_event** event: `email.queued`

**Result:** Batch email queued; each recipient receives an individual copy with unique tracking

### Email_delivered (Priority: 4)

**Given:**
- Provider confirms delivery to recipient mail server

**Then:**
- **set_field** target: `delivery_status` value: `delivered`
- **emit_event** event: `email.delivered`

**Result:** Delivery status updated; delivery confirmation event emitted

### Email_bounced (Priority: 5) — Error: `EMAIL_BOUNCED`

**Given:**
- Recipient mail server rejects the email (hard or soft bounce)

**Then:**
- **set_field** target: `delivery_status` value: `bounced`
- **emit_event** event: `email.bounced`

**Result:** Bounce recorded; hard bounces suppress future sends to that address

### Email_complained (Priority: 6) — Error: `EMAIL_COMPLAINED`

**Given:**
- Recipient marks email as spam

**Then:**
- **set_field** target: `delivery_status` value: `complained`
- **emit_event** event: `email.complained`

**Result:** Complaint recorded; recipient added to suppression list

### Invalid_sender (Priority: 7) — Error: `SENDER_NOT_VERIFIED`

**Given:**
- `from` (input) exists
- Sender domain fails SPF/DKIM/DMARC verification

**Then:**
- **emit_event** event: `email.send_failed`

**Result:** Send rejected; sender must verify domain before sending

### Attachment_too_large (Priority: 8) — Error: `ATTACHMENT_SIZE_EXCEEDED`

**Given:**
- Total attachment size exceeds 25MB

**Then:**
- **emit_event** event: `email.send_failed`

**Result:** Send rejected; reduce attachment size or use cloud storage links

### Rate_limited (Priority: 9) — Error: `EMAIL_RATE_LIMITED`

**Given:**
- Sender exceeds 100 emails per minute

**Then:**
- **emit_event** event: `email.send_failed`

**Result:** Send rejected with retry-after header; client should back off and retry

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SENDER_NOT_VERIFIED` | 403 | Sender domain is not verified. Configure SPF, DKIM, and DMARC records before sending. | No |
| `EMAIL_BOUNCED` | 400 | Email bounced. Recipient address may be invalid or mailbox full. | No |
| `EMAIL_COMPLAINED` | 400 | Recipient marked email as spam. Address added to suppression list. | No |
| `ATTACHMENT_SIZE_EXCEEDED` | 413 | Total attachment size exceeds 25MB limit. Reduce file sizes or use cloud storage links. | No |
| `EMAIL_RATE_LIMITED` | 429 | Rate limit exceeded. Maximum 100 emails per minute per sender. | No |
| `TEMPLATE_NOT_FOUND` | 404 | Template ID does not exist or is not published. | No |
| `TEMPLATE_VARIABLE_MISSING` | 400 | Required template variable is missing from template_vars. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `email.queued` |  | `message_id`, `from`, `to`, `subject` |
| `email.sent` |  | `message_id`, `provider_message_id` |
| `email.delivered` |  | `message_id`, `to`, `delivered_at` |
| `email.bounced` |  | `message_id`, `to`, `bounce_type`, `bounce_reason` |
| `email.complained` |  | `message_id`, `to`, `complained_at` |
| `email.send_failed` |  | `message_id`, `error_code`, `error_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| webhook-ingestion | recommended | Receive delivery status webhooks from email provider |
| message-queue | optional | Queue emails for async processing and retry |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Email Service Blueprint",
  "description": "Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends. 14 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "email, transactional, smtp, templates, notifications"
}
</script>
