<!-- AUTO-GENERATED FROM campaign-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Campaign Management

> Marketing campaign definition and email drip campaign execution with scheduled delivery, recipient tracking, and unsubscribe management.

**Category:** Crm · **Version:** 1.0.0 · **Tags:** campaign · email-marketing · drip-sequence · marketing · automation

## What this does

Marketing campaign definition and email drip campaign execution with scheduled delivery, recipient tracking, and unsubscribe management.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **campaign_name** *(text, required)* — Campaign Name
- **campaign_description** *(rich_text, optional)* — Description
- **campaign_schedules** *(json, required)* — Campaign Schedules
- **email_campaign_name** *(text, required)* — Email Campaign Name
- **email_campaign_for** *(select, required)* — Email Campaign For
- **recipient** *(text, required)* — Recipient
- **sender** *(email, required)* — Sender Email
- **start_date** *(date, required)* — Start Date
- **end_date** *(date, optional)* — End Date
- **email_campaign_status** *(select, required)* — Email Campaign Status

## What must be true

- **start_date_not_past:** Campaign start date cannot be before the current date at creation time.
- **end_date_auto_calculated:** End date is automatically computed from start_date plus the maximum send_after_days value in the campaign schedule entries.
- **no_duplicate_active_campaigns:** A recipient cannot have more than one active (Scheduled or In Progress) email campaign for the same campaign definition.
- **lead_must_have_email:** When email_campaign_for is Lead, the linked lead must have a valid email address. Campaigns to leads without email are rejected.
- **drip_sequence_schedule:** Each schedule entry defines a send_after_days offset from the start date. Emails are queued and sent on the computed date.
- **unsubscribe_terminal:** Unsubscribe is terminal for individual lead/contact recipients. Email group members may be re-subscribed by the marketing user.
- **utm_campaign_sync:** Campaign name is synced to UTM Campaign fields on leads for end-to-end attribution and analytics tracking.

## Success & failure scenarios

**✅ Success paths**

- **Create Campaign** — when marketing user provides campaign name and schedule entries; At least one schedule entry with email template and send_after_days, then Campaign is created with drip schedule ready for use.
- **Launch Email Campaign** — when campaign exists with at least one schedule entry; marketing user selects recipient type and recipient; Start date is today or in the future, then Email campaign is scheduled and will begin on the start date.
- **Send Scheduled Email** — when email campaign is in Scheduled or In Progress status; current date matches a scheduled send date (start_date + send_after_days), then Scheduled email is sent and campaign status updated to In Progress.
- **Unsubscribe Recipient** — when recipient clicks unsubscribe link or requests removal; email campaign is in Scheduled or In Progress status, then Recipient is unsubscribed and no further emails are sent.
- **Complete Campaign** — when all scheduled emails in the drip sequence have been sent; email campaign is in In Progress status, then Email campaign is marked as completed.

**❌ Failure paths**

- **Start Date Past Rejected** — when Start date is in the past, then Campaign launch blocked due to past start date. *(error: `CAMPAIGN_START_DATE_PAST`)*
- **No Schedule Entries** — when campaign_schedules not_exists, then Campaign creation blocked — at least one schedule is required. *(error: `CAMPAIGN_NO_SCHEDULE`)*
- **Lead No Email Rejected** — when email_campaign_for eq "Lead"; linked lead has no email address, then Campaign launch blocked — lead must have an email address. *(error: `CAMPAIGN_LEAD_NO_EMAIL`)*
- **Duplicate Active Rejected** — when recipient already has an active email campaign for this campaign, then Duplicate active campaign prevented for the same recipient. *(error: `CAMPAIGN_DUPLICATE_ACTIVE`)*
- **Send Failed** — when email delivery fails for a scheduled send, then Email delivery failure recorded for review. *(error: `CAMPAIGN_SEND_FAILED`)*

## Errors it can return

- `CAMPAIGN_START_DATE_PAST` — Campaign start date cannot be in the past.
- `CAMPAIGN_NO_SCHEDULE` — Campaign must have at least one schedule entry with an email template.
- `CAMPAIGN_LEAD_NO_EMAIL` — The selected lead does not have an email address. Add an email before launching the campaign.
- `CAMPAIGN_DUPLICATE_ACTIVE` — This recipient already has an active campaign for the same campaign definition.
- `CAMPAIGN_SEND_FAILED` — Failed to deliver the scheduled campaign email. Check email configuration and recipient address.

## Connects to

- **lead-opportunity-pipeline** *(recommended)* — Campaigns target leads and track attribution via UTM fields
- **customer-supplier-management** *(optional)* — Campaigns may target existing customers via contact records

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/crm/campaign-management/) · **Spec source:** [`campaign-management.blueprint.yaml`](./campaign-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
