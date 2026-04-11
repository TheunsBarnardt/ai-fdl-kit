<!-- AUTO-GENERATED FROM email-service.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Email Service

> Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends

**Category:** Integration · **Version:** 1.0.0 · **Tags:** email · transactional · smtp · templates · notifications

## What this does

Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **from** *(email, required)* — Sender email address
- **to** *(json, required)* — Recipient email addresses
- **cc** *(json, optional)* — CC recipient email addresses
- **bcc** *(json, optional)* — BCC recipient email addresses
- **reply_to** *(email, optional)* — Reply-to email address
- **subject** *(text, required)* — Email subject line
- **template_id** *(text, optional)* — Template identifier for server-side rendering
- **template_vars** *(json, optional)* — Variables for template rendering (Handlebars/Mustache)
- **body_html** *(rich_text, optional)* — HTML email body
- **body_text** *(text, optional)* — Plain text email body (fallback)
- **attachments** *(json, optional)* — File attachments array (filename, content_type, data)
- **priority** *(select, optional)* — Email priority
- **message_id** *(text, optional)* — Unique message identifier returned by provider
- **delivery_status** *(select, optional)* — Current delivery status

## What must be true

- **recipients:** Maximum 50 recipients per single send (to + cc + bcc combined), At least one recipient in to[] is required, All recipient addresses must be valid RFC 5322 email addresses
- **content:** Either template_id or body_html/body_text must be provided, When template_id is set, template_vars are merged into the template at send time, HTML emails should always include a plain text fallback for accessibility
- **attachments:** Maximum total attachment size is 25MB per email, Each attachment must include filename and content_type, Executable file types (.exe, .bat, .cmd, .scr) are rejected
- **compliance:** Marketing emails must include an unsubscribe header (RFC 8058 List-Unsubscribe), Sender domain must pass SPF, DKIM, and DMARC verification, Bounce and complaint rates must stay below provider thresholds (bounce < 5%, complaint < 0.1%)
- **security:** Email content must be sanitized to prevent header injection attacks, Attachment content is scanned for malware before sending, Rate limiting applied per sender: max 100 emails per minute

## Success & failure scenarios

**✅ Success paths**

- **Single Email Sent** — when Valid from address with verified domain; At least one valid recipient in to[]; Subject and body (template or inline) provided, then Email queued for delivery; message_id returned for tracking.
- **Template Email Sent** — when template_id references a valid registered template; template_vars contain all required variables for the template, then Template rendered with variables and email queued for delivery.
- **Batch Email Sent** — when Multiple recipients provided (batch mode); Total recipients does not exceed 50, then Batch email queued; each recipient receives an individual copy with unique tracking.
- **Email Delivered** — when Provider confirms delivery to recipient mail server, then Delivery status updated; delivery confirmation event emitted.

**❌ Failure paths**

- **Email Bounced** — when Recipient mail server rejects the email (hard or soft bounce), then Bounce recorded; hard bounces suppress future sends to that address. *(error: `EMAIL_BOUNCED`)*
- **Email Complained** — when Recipient marks email as spam, then Complaint recorded; recipient added to suppression list. *(error: `EMAIL_COMPLAINED`)*
- **Invalid Sender** — when from exists; Sender domain fails SPF/DKIM/DMARC verification, then Send rejected; sender must verify domain before sending. *(error: `SENDER_NOT_VERIFIED`)*
- **Attachment Too Large** — when Total attachment size exceeds 25MB, then Send rejected; reduce attachment size or use cloud storage links. *(error: `ATTACHMENT_SIZE_EXCEEDED`)*
- **Rate Limited** — when Sender exceeds 100 emails per minute, then Send rejected with retry-after header; client should back off and retry. *(error: `EMAIL_RATE_LIMITED`)*

## Errors it can return

- `SENDER_NOT_VERIFIED` — Sender domain is not verified. Configure SPF, DKIM, and DMARC records before sending.
- `EMAIL_BOUNCED` — Email bounced. Recipient address may be invalid or mailbox full.
- `EMAIL_COMPLAINED` — Recipient marked email as spam. Address added to suppression list.
- `ATTACHMENT_SIZE_EXCEEDED` — Total attachment size exceeds 25MB limit. Reduce file sizes or use cloud storage links.
- `EMAIL_RATE_LIMITED` — Rate limit exceeded. Maximum 100 emails per minute per sender.
- `TEMPLATE_NOT_FOUND` — Template ID does not exist or is not published.
- `TEMPLATE_VARIABLE_MISSING` — Required template variable is missing from template_vars.

## Connects to

- **webhook-ingestion** *(recommended)* — Receive delivery status webhooks from email provider
- **message-queue** *(optional)* — Queue emails for async processing and retry

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/email-service/) · **Spec source:** [`email-service.blueprint.yaml`](./email-service.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
