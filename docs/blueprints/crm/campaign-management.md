---
title: "Campaign Management Blueprint"
layout: default
parent: "Crm"
grand_parent: Blueprint Catalog
description: "Marketing campaign definition and email drip campaign execution with scheduled delivery, recipient tracking, and unsubscribe management. . 10 fields. 10 outcome"
---

# Campaign Management Blueprint

> Marketing campaign definition and email drip campaign execution with scheduled delivery, recipient tracking, and unsubscribe management.


| | |
|---|---|
| **Feature** | `campaign-management` |
| **Category** | Crm |
| **Version** | 1.0.0 |
| **Tags** | campaign, email-marketing, drip-sequence, marketing, automation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/crm/campaign-management.blueprint.yaml) |
| **JSON API** | [campaign-management.json]({{ site.baseurl }}/api/blueprints/crm/campaign-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `marketing_user` | Marketing User | human | Creates campaigns, defines schedules, and monitors delivery |
| `recipient` | Recipient | human | Receives campaign emails, may unsubscribe |
| `email_system` | Email System | system | Sends scheduled emails, tracks delivery status, and processes unsubscribes |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `campaign_name` | text | Yes | Campaign Name | Validations: required, maxLength |
| `campaign_description` | rich_text | No | Description |  |
| `campaign_schedules` | json | Yes | Campaign Schedules |  |
| `email_campaign_name` | text | Yes | Email Campaign Name |  |
| `email_campaign_for` | select | Yes | Email Campaign For |  |
| `recipient` | text | Yes | Recipient |  |
| `sender` | email | Yes | Sender Email |  |
| `start_date` | date | Yes | Start Date |  |
| `end_date` | date | No | End Date |  |
| `email_campaign_status` | select | Yes | Email Campaign Status |  |

## States

**State field:** `email_campaign_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Scheduled` | Yes |  |
| `In Progress` |  |  |
| `Completed` |  | Yes |
| `Unsubscribed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Scheduled` | `In Progress` | email_system | start_date <= today |
|  | `In Progress` | `Completed` | email_system |  |
|  | `Scheduled,In Progress` | `Unsubscribed` | recipient |  |

## Rules

- **start_date_not_past:**
  - **description:** Campaign start date cannot be before the current date at creation time.

- **end_date_auto_calculated:**
  - **description:** End date is automatically computed from start_date plus the maximum send_after_days value in the campaign schedule entries.

- **no_duplicate_active_campaigns:**
  - **description:** A recipient cannot have more than one active (Scheduled or In Progress) email campaign for the same campaign definition.

- **lead_must_have_email:**
  - **description:** When email_campaign_for is Lead, the linked lead must have a valid email address. Campaigns to leads without email are rejected.

- **drip_sequence_schedule:**
  - **description:** Each schedule entry defines a send_after_days offset from the start date. Emails are queued and sent on the computed date.

- **unsubscribe_terminal:**
  - **description:** Unsubscribe is terminal for individual lead/contact recipients. Email group members may be re-subscribed by the marketing user.

- **utm_campaign_sync:**
  - **description:** Campaign name is synced to UTM Campaign fields on leads for end-to-end attribution and analytics tracking.


## Outcomes

### Create_campaign (Priority: 1)

**Given:**
- marketing user provides campaign name and schedule entries
- `campaign_schedules` (input) exists

**Then:**
- **create_record** — Campaign created with schedule definitions
- **emit_event** event: `campaign.created`

**Result:** Campaign is created with drip schedule ready for use

### Start_date_past_rejected (Priority: 1) — Error: `CAMPAIGN_START_DATE_PAST`

**Given:**
- `start_date` (input) lt `today`

**Then:**
- **notify** — Inform that start date cannot be in the past

**Result:** Campaign launch blocked due to past start date

### No_schedule_entries (Priority: 1) — Error: `CAMPAIGN_NO_SCHEDULE`

**Given:**
- `campaign_schedules` (input) not_exists

**Then:**
- **notify** — Prompt to add at least one schedule entry

**Result:** Campaign creation blocked — at least one schedule is required

### Lead_no_email_rejected (Priority: 1) — Error: `CAMPAIGN_LEAD_NO_EMAIL`

**Given:**
- `email_campaign_for` (input) eq `Lead`
- linked lead has no email address

**Then:**
- **notify** — Show that the target lead has no email address

**Result:** Campaign launch blocked — lead must have an email address

### Duplicate_active_rejected (Priority: 1) — Error: `CAMPAIGN_DUPLICATE_ACTIVE`

**Given:**
- recipient already has an active email campaign for this campaign

**Then:**
- **notify** — Show existing active campaign for this recipient

**Result:** Duplicate active campaign prevented for the same recipient

### Send_failed (Priority: 1) — Error: `CAMPAIGN_SEND_FAILED`

**Given:**
- email delivery fails for a scheduled send

**Then:**
- **notify** — Log delivery failure with error details

**Result:** Email delivery failure recorded for review

### Launch_email_campaign (Priority: 2)

**Given:**
- campaign exists with at least one schedule entry
- marketing user selects recipient type and recipient
- `start_date` (input) gte `today`

**Then:**
- **create_record** — Email campaign created and scheduled for the recipient
- **set_field** target: `end_date` — Auto-calculated from start_date + max send_after_days
- **set_field** target: `email_campaign_status` value: `Scheduled`

**Result:** Email campaign is scheduled and will begin on the start date

### Send_scheduled_email (Priority: 3)

**Given:**
- email campaign is in Scheduled or In Progress status
- current date matches a scheduled send date (start_date + send_after_days)

**Then:**
- **call_service** target: `email_service` — Send the scheduled email template to the recipient
- **transition_state** field: `email_campaign_status` from: `Scheduled` to: `In Progress`
- **emit_event** event: `campaign.email_sent`

**Result:** Scheduled email is sent and campaign status updated to In Progress

### Unsubscribe_recipient (Priority: 4)

**Given:**
- recipient clicks unsubscribe link or requests removal
- email campaign is in Scheduled or In Progress status

**Then:**
- **transition_state** field: `email_campaign_status` to: `Unsubscribed`
- **emit_event** event: `campaign.recipient_unsubscribed`

**Result:** Recipient is unsubscribed and no further emails are sent

### Complete_campaign (Priority: 5)

**Given:**
- all scheduled emails in the drip sequence have been sent
- email campaign is in In Progress status

**Then:**
- **transition_state** field: `email_campaign_status` from: `In Progress` to: `Completed`
- **emit_event** event: `campaign.completed`

**Result:** Email campaign is marked as completed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CAMPAIGN_START_DATE_PAST` | 400 | Campaign start date cannot be in the past. | No |
| `CAMPAIGN_NO_SCHEDULE` | 400 | Campaign must have at least one schedule entry with an email template. | No |
| `CAMPAIGN_LEAD_NO_EMAIL` | 400 | The selected lead does not have an email address. Add an email before launching the campaign. | No |
| `CAMPAIGN_DUPLICATE_ACTIVE` | 409 | This recipient already has an active campaign for the same campaign definition. | No |
| `CAMPAIGN_SEND_FAILED` | 500 | Failed to deliver the scheduled campaign email. Check email configuration and recipient address. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `campaign.created` | New campaign definition created | `campaign_id`, `campaign_name` |
| `campaign.email_sent` | Scheduled campaign email delivered to recipient | `campaign_id`, `recipient`, `email_template` |
| `campaign.completed` | All scheduled emails in the campaign have been sent | `campaign_id`, `recipient` |
| `campaign.recipient_unsubscribed` | Recipient opted out of the campaign | `campaign_id`, `recipient` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| lead-opportunity-pipeline | recommended | Campaigns target leads and track attribution via UTM fields |
| customer-supplier-management | optional | Campaigns may target existing customers via contact records |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python/Frappe Framework
  files_traced: 8
  entry_points:
    - erpnext/crm/doctype/campaign/campaign.py
    - erpnext/crm/doctype/email_campaign/email_campaign.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Campaign Management Blueprint",
  "description": "Marketing campaign definition and email drip campaign execution with scheduled delivery, recipient tracking, and unsubscribe management.\n. 10 fields. 10 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "campaign, email-marketing, drip-sequence, marketing, automation"
}
</script>
