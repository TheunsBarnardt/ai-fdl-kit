---
title: "Lead Opportunity Pipeline Blueprint"
layout: default
parent: "Crm"
grand_parent: Blueprint Catalog
description: "Lead capture, qualification, and opportunity pipeline management with conversion tracking from initial contact through to customer creation. . 31 fields. 10 out"
---

# Lead Opportunity Pipeline Blueprint

> Lead capture, qualification, and opportunity pipeline management with conversion tracking from initial contact through to customer creation.


| | |
|---|---|
| **Feature** | `lead-opportunity-pipeline` |
| **Category** | Crm |
| **Version** | 1.0.0 |
| **Tags** | lead, opportunity, pipeline, sales, qualification, conversion |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/crm/lead-opportunity-pipeline.blueprint.yaml) |
| **JSON API** | [lead-opportunity-pipeline.json]({{ site.baseurl }}/api/blueprints/crm/lead-opportunity-pipeline.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sales_user` | Sales User | human | Captures leads, qualifies prospects, and manages opportunities |
| `sales_manager` | Sales Manager | human | Oversees pipeline, assigns leads, and reviews conversions |
| `system` | System | system | Auto-assigns owners, loads gravatars, syncs UTM data, and enforces uniqueness |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `first_name` | text | No | First Name |  |
| `last_name` | text | No | Last Name |  |
| `email_id` | email | No | Email Address | Validations: email |
| `company_name` | text | No | Company / Organization |  |
| `lead_status` | select | Yes | Lead Status |  |
| `qualification_status` | select | No | Qualification Status |  |
| `lead_owner` | email | No | Lead Owner |  |
| `lead_type` | select | No | Lead Type |  |
| `source` | text | No | Lead Source |  |
| `utm_source` | text | No | UTM Source |  |
| `utm_medium` | text | No | UTM Medium |  |
| `utm_campaign` | text | No | UTM Campaign |  |
| `territory` | text | No | Territory |  |
| `industry` | text | No | Industry |  |
| `annual_revenue` | number | No | Annual Revenue | Validations: min |
| `mobile_no` | phone | No | Mobile Number |  |
| `phone` | phone | No | Phone |  |
| `disabled` | boolean | No | Disabled |  |
| `unsubscribed` | boolean | No | Unsubscribed |  |
| `opportunity_status` | select | Yes | Opportunity Status |  |
| `opportunity_from` | select | Yes | Opportunity From |  |
| `party_name` | text | Yes | Party Name |  |
| `sales_stage` | text | No | Sales Stage |  |
| `probability` | number | No | Probability (%) | Validations: min, max |
| `opportunity_amount` | number | No | Opportunity Amount | Validations: min |
| `expected_closing` | date | No | Expected Closing Date |  |
| `items` | json | No | Opportunity Items |  |
| `lost_reasons` | json | No | Lost Reasons |  |
| `competitors` | json | No | Competitors |  |
| `contact_email` | email | No | Contact Email |  |
| `contact_mobile` | phone | No | Contact Mobile |  |

## States

**State field:** `lead_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Lead` | Yes |  |
| `Open` |  |  |
| `Replied` |  |  |
| `Opportunity` |  |  |
| `Quotation` |  |  |
| `Interested` |  |  |
| `Converted` |  | Yes |
| `Do Not Contact` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Lead` | `Open` | sales_user |  |
|  | `Open` | `Replied` | sales_user |  |
|  | `Open,Replied,Interested` | `Opportunity` | sales_user |  |
|  | `Opportunity,Interested` | `Quotation` | sales_user |  |
|  | `Open,Replied` | `Interested` | sales_user |  |
|  | `Opportunity,Quotation,Interested` | `Converted` | sales_user |  |
|  | `Lead,Open,Replied,Interested` | `Do Not Contact` | sales_user |  |

## Rules

- **lead_email_uniqueness:**
  - **description:** Email address must be unique across all leads (configurable). Duplicate detection runs on create and update.

- **lead_requires_identity:**
  - **description:** A lead must have either a person name (first_name or last_name) or a company_name. Both empty is rejected.

- **lead_owner_not_lead:**
  - **description:** Lead owner email cannot be the same as the lead's own email address to prevent self-assignment.

- **lead_to_opportunity_field_mapping:**
  - **description:** When converting a lead to an opportunity, relevant fields (name, email, phone, company, source, territory) are mapped automatically.

- **opportunity_cannot_lose_with_active_quotation:**
  - **description:** An opportunity cannot be declared lost if there is an active (non-cancelled) quotation linked to it.

- **prospect_aggregation:**
  - **description:** A prospect record aggregates multiple leads and opportunities belonging to the same company for unified tracking.

- **utm_campaign_sync:**
  - **description:** UTM campaign fields on a lead are synced to the campaign document for attribution and analytics tracking.

- **gravatar_auto_load:**
  - **description:** When an email address is set, the system attempts to load the lead's profile image from a gravatar service.


## Outcomes

### Create_lead (Priority: 1)

**Given:**
- sales user provides lead details
- `email_id` (input) exists

**Then:**
- **create_record** — New lead record created with captured details
- **emit_event** event: `lead.created`

**Result:** New lead is created and visible in the pipeline

### Duplicate_email_rejected (Priority: 1) — Error: `LEAD_DUPLICATE_EMAIL`

**Given:**
- `email_id` (input) exists
- another lead with the same email already exists

**Then:**
- **notify** — Show duplicate lead warning with link to existing record

**Result:** Lead creation blocked due to duplicate email

### No_name_or_company (Priority: 1) — Error: `LEAD_NO_NAME_OR_COMPANY`

**Given:**
- `first_name` (input) not_exists
- `last_name` (input) not_exists
- `company_name` (input) not_exists

**Then:**
- **notify** — Prompt user to provide a name or company

**Result:** Lead rejected — at least a name or company is required

### Owner_is_lead_rejected (Priority: 1) — Error: `LEAD_OWNER_IS_LEAD`

**Given:**
- `lead_owner` (input) eq `email_id`

**Then:**
- **notify** — Inform that lead owner cannot be the lead themselves

**Result:** Lead owner assignment rejected due to self-assignment

### Active_quotation_blocks_lost (Priority: 1) — Error: `OPPORTUNITY_ACTIVE_QUOTATION_EXISTS`

**Given:**
- sales user attempts to mark opportunity as lost
- an active (non-cancelled) quotation is linked to the opportunity

**Then:**
- **notify** — Show that active quotation must be cancelled first

**Result:** Cannot declare opportunity lost while active quotation exists

### Qualify_lead (Priority: 2)

**Given:**
- lead exists in Open or Replied status
- sales user assesses qualification criteria

**Then:**
- **set_field** target: `qualification_status` value: `Qualified`
- **emit_event** event: `lead.qualified`

**Result:** Lead is marked as qualified and ready for opportunity conversion

### Convert_to_opportunity (Priority: 3)

**Given:**
- lead is in an active status (Open, Replied, or Interested)
- sales user initiates conversion

**Then:**
- **create_record** — Opportunity created with fields mapped from lead
- **transition_state** field: `lead_status` from: `Open` to: `Opportunity`
- **emit_event** event: `lead.converted`
- **emit_event** event: `opportunity.created`

**Result:** Lead is converted to an opportunity with all relevant fields mapped

### Create_quotation (Priority: 4)

**Given:**
- opportunity is in Open or Replied status
- sales user creates a quotation from the opportunity

**Then:**
- **transition_state** field: `opportunity_status` from: `Open` to: `Quotation`
- **create_record** — Quotation generated from opportunity items and party details

**Result:** Quotation is created and opportunity status updated

### Declare_lost (Priority: 5)

**Given:**
- opportunity is in Open or Replied status
- `opportunity_status` (db) neq `Quotation`

**Then:**
- **transition_state** field: `opportunity_status` from: `Open` to: `Lost`
- **emit_event** event: `opportunity.lost`

**Result:** Opportunity is declared lost with reasons recorded

### Convert_to_customer (Priority: 6)

**Given:**
- opportunity is in Quotation or Converted status path
- sales user confirms customer creation

**Then:**
- **create_record** — Customer record created from opportunity/lead data
- **transition_state** field: `lead_status` to: `Converted`
- **emit_event** event: `opportunity.won`

**Result:** Customer record created and lead/opportunity marked as converted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LEAD_DUPLICATE_EMAIL` | 409 | A lead with this email address already exists. | No |
| `LEAD_NO_NAME_OR_COMPANY` | 400 | Please provide either a person name or a company name for the lead. | No |
| `LEAD_OWNER_IS_LEAD` | 400 | Lead owner cannot be the same person as the lead. | No |
| `OPPORTUNITY_ACTIVE_QUOTATION_EXISTS` | 409 | Cannot declare opportunity as lost while an active quotation exists. Cancel the quotation first. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `lead.created` | New lead record captured in the system | `lead_id`, `email_id`, `company_name`, `source` |
| `lead.qualified` | Lead qualification status updated | `lead_id`, `qualification_status` |
| `lead.converted` | Lead converted to an opportunity | `lead_id`, `opportunity_id` |
| `opportunity.created` | New opportunity created from lead or directly | `opportunity_id`, `party_name`, `opportunity_amount` |
| `opportunity.won` | Opportunity converted to a customer | `opportunity_id`, `customer_id` |
| `opportunity.lost` | Opportunity declared lost with reasons | `opportunity_id`, `lost_reasons` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| customer-supplier-management | recommended | Lead-to-customer conversion creates customer records managed by this feature |
| campaign-management | optional | UTM campaign tracking and email campaigns target leads |
| contract-management | optional | Won opportunities may result in contract creation |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python/Frappe Framework
  files_traced: 18
  entry_points:
    - erpnext/crm/doctype/lead/lead.py
    - erpnext/crm/doctype/opportunity/opportunity.py
    - erpnext/crm/doctype/prospect/prospect.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Lead Opportunity Pipeline Blueprint",
  "description": "Lead capture, qualification, and opportunity pipeline management with conversion tracking from initial contact through to customer creation.\n. 31 fields. 10 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "lead, opportunity, pipeline, sales, qualification, conversion"
}
</script>
