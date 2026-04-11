<!-- AUTO-GENERATED FROM email-notifications.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Email Notifications

> Send transactional and system emails with template rendering, delivery tracking, and bounce handling

**Category:** Notification · **Version:** 1.0.0 · **Tags:** email · transactional · templates · delivery-tracking · bounce-handling · unsubscribe · notification

## What this does

Send transactional and system emails with template rendering, delivery tracking, and bounce handling

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **recipient_email** *(email, required)* — Recipient Email
- **template_id** *(text, required)* — Template ID
- **template_variables** *(json, optional)* — Template Variables
- **subject** *(text, required)* — Email Subject
- **from_address** *(email, optional)* — From Address
- **reply_to** *(email, optional)* — Reply-To Address
- **category** *(select, required)* — Email Category
- **priority** *(select, optional)* — Send Priority
- **tracking_id** *(text, optional)* — Tracking ID
- **unsubscribe_url** *(url, optional)* — Unsubscribe URL

## What must be true

- **delivery → provider_abstraction:** true
- **delivery → max_retries:** 3
- **delivery → retry_backoff:** exponential
- **delivery → retry_base_seconds:** 30
- **delivery → timeout_seconds:** 30
- **templates → engine:** variable_substitution
- **templates → escape_html:** true
- **templates → fallback_to_plain_text:** true
- **templates → required_variables_check:** true
- **bounce_handling → soft_bounce_max_retries:** 3
- **bounce_handling → hard_bounce_action:** suppress
- **bounce_handling → complaint_action:** unsubscribe
- **bounce_handling → suppression_list:** true
- **compliance → unsubscribe_link_required:** true
- **compliance → list_unsubscribe_header:** true
- **compliance → physical_address_required:** true
- **rate_limiting → per_recipient_per_hour:** 10
- **rate_limiting → per_domain_per_minute:** 100
- **rate_limiting → global_per_second:** 50
- **security → dkim_signing:** true
- **security → spf_validation:** true
- **security → dmarc_policy:** reject
- **security → sanitize_variables:** true

## Success & failure scenarios

**✅ Success paths**

- **Email Sent** — when Template exists and is active; Recipient email is valid format; Recipient is not on suppression list, then email queued for delivery with tracking ID returned.
- **Email Bounced** — when Provider reported a bounce (webhook callback), then update delivery log and suppress recipient on hard bounce.
- **Email Opened** — when Tracking pixel was loaded by recipient email client, then record open event in delivery log.

**❌ Failure paths**

- **Rate Limited** — when Recipient has received 10+ emails this hour, then queue email for deferred delivery after rate limit window. *(error: `EMAIL_RATE_LIMITED`)*
- **Invalid Template** — when Template ID does not exist in template registry, then reject with template not found error. *(error: `EMAIL_TEMPLATE_NOT_FOUND`)*
- **Missing Variables** — when Template requires variables that were not provided, then reject with missing variables error listing which variables are absent. *(error: `EMAIL_MISSING_VARIABLES`)*
- **Recipient Suppressed** — when Recipient is on suppression list (hard bounce or unsubscribe), then silently skip delivery and log suppression hit. *(error: `EMAIL_RECIPIENT_SUPPRESSED`)*

## Errors it can return

- `EMAIL_RATE_LIMITED` — Email rate limit exceeded. Please try again later.
- `EMAIL_TEMPLATE_NOT_FOUND` — Email template not found
- `EMAIL_MISSING_VARIABLES` — Required template variables are missing
- `EMAIL_RECIPIENT_SUPPRESSED` — Recipient address is suppressed
- `EMAIL_DELIVERY_FAILED` — Email delivery failed. The message will be retried automatically.
- `EMAIL_VALIDATION_ERROR` — Please check the email parameters and try again

## Connects to

- **notification-preferences** *(required)* — Must check user email opt-in preferences before sending
- **password-reset** *(optional)* — Password reset emails are a common transactional email type
- **email-verification** *(optional)* — Verification emails are sent via this system
- **signup** *(optional)* — Welcome emails triggered on signup
- **webhook-outbound** *(optional)* — Bounce and delivery webhooks from providers use outbound webhook patterns

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/email-notifications/) · **Spec source:** [`email-notifications.blueprint.yaml`](./email-notifications.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
