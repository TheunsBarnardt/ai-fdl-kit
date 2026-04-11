<!-- AUTO-GENERATED FROM lead-opportunity-pipeline.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Lead Opportunity Pipeline

> Lead capture, qualification, and opportunity pipeline management with conversion tracking from initial contact through to customer creation.

**Category:** Crm · **Version:** 1.0.0 · **Tags:** lead · opportunity · pipeline · sales · qualification · conversion

## What this does

Lead capture, qualification, and opportunity pipeline management with conversion tracking from initial contact through to customer creation.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **first_name** *(text, optional)* — First Name
- **last_name** *(text, optional)* — Last Name
- **email_id** *(email, optional)* — Email Address
- **company_name** *(text, optional)* — Company / Organization
- **lead_status** *(select, required)* — Lead Status
- **qualification_status** *(select, optional)* — Qualification Status
- **lead_owner** *(email, optional)* — Lead Owner
- **lead_type** *(select, optional)* — Lead Type
- **source** *(text, optional)* — Lead Source
- **utm_source** *(text, optional)* — UTM Source
- **utm_medium** *(text, optional)* — UTM Medium
- **utm_campaign** *(text, optional)* — UTM Campaign
- **territory** *(text, optional)* — Territory
- **industry** *(text, optional)* — Industry
- **annual_revenue** *(number, optional)* — Annual Revenue
- **mobile_no** *(phone, optional)* — Mobile Number
- **phone** *(phone, optional)* — Phone
- **disabled** *(boolean, optional)* — Disabled
- **unsubscribed** *(boolean, optional)* — Unsubscribed
- **opportunity_status** *(select, required)* — Opportunity Status
- **opportunity_from** *(select, required)* — Opportunity From
- **party_name** *(text, required)* — Party Name
- **sales_stage** *(text, optional)* — Sales Stage
- **probability** *(number, optional)* — Probability (%)
- **opportunity_amount** *(number, optional)* — Opportunity Amount
- **expected_closing** *(date, optional)* — Expected Closing Date
- **items** *(json, optional)* — Opportunity Items
- **lost_reasons** *(json, optional)* — Lost Reasons
- **competitors** *(json, optional)* — Competitors
- **contact_email** *(email, optional)* — Contact Email
- **contact_mobile** *(phone, optional)* — Contact Mobile

## What must be true

- **lead_email_uniqueness:** Email address must be unique across all leads (configurable). Duplicate detection runs on create and update.
- **lead_requires_identity:** A lead must have either a person name (first_name or last_name) or a company_name. Both empty is rejected.
- **lead_owner_not_lead:** Lead owner email cannot be the same as the lead's own email address to prevent self-assignment.
- **lead_to_opportunity_field_mapping:** When converting a lead to an opportunity, relevant fields (name, email, phone, company, source, territory) are mapped automatically.
- **opportunity_cannot_lose_with_active_quotation:** An opportunity cannot be declared lost if there is an active (non-cancelled) quotation linked to it.
- **prospect_aggregation:** A prospect record aggregates multiple leads and opportunities belonging to the same company for unified tracking.
- **utm_campaign_sync:** UTM campaign fields on a lead are synced to the campaign document for attribution and analytics tracking.
- **gravatar_auto_load:** When an email address is set, the system attempts to load the lead's profile image from a gravatar service.

## Success & failure scenarios

**✅ Success paths**

- **Create Lead** — when sales user provides lead details; Email address is provided (optional but triggers uniqueness check), then New lead is created and visible in the pipeline.
- **Qualify Lead** — when lead exists in Open or Replied status; sales user assesses qualification criteria, then Lead is marked as qualified and ready for opportunity conversion.
- **Convert To Opportunity** — when lead is in an active status (Open, Replied, or Interested); sales user initiates conversion, then Lead is converted to an opportunity with all relevant fields mapped.
- **Create Quotation** — when opportunity is in Open or Replied status; sales user creates a quotation from the opportunity, then Quotation is created and opportunity status updated.
- **Declare Lost** — when opportunity is in Open or Replied status; No active quotation exists for this opportunity, then Opportunity is declared lost with reasons recorded.
- **Convert To Customer** — when opportunity is in Quotation or Converted status path; sales user confirms customer creation, then Customer record created and lead/opportunity marked as converted.

**❌ Failure paths**

- **Duplicate Email Rejected** — when email_id exists; another lead with the same email already exists, then Lead creation blocked due to duplicate email. *(error: `LEAD_DUPLICATE_EMAIL`)*
- **No Name Or Company** — when first_name not_exists; last_name not_exists; company_name not_exists, then Lead rejected — at least a name or company is required. *(error: `LEAD_NO_NAME_OR_COMPANY`)*
- **Owner Is Lead Rejected** — when Lead owner email matches the lead's email, then Lead owner assignment rejected due to self-assignment. *(error: `LEAD_OWNER_IS_LEAD`)*
- **Active Quotation Blocks Lost** — when sales user attempts to mark opportunity as lost; an active (non-cancelled) quotation is linked to the opportunity, then Cannot declare opportunity lost while active quotation exists. *(error: `OPPORTUNITY_ACTIVE_QUOTATION_EXISTS`)*

## Errors it can return

- `LEAD_DUPLICATE_EMAIL` — A lead with this email address already exists.
- `LEAD_NO_NAME_OR_COMPANY` — Please provide either a person name or a company name for the lead.
- `LEAD_OWNER_IS_LEAD` — Lead owner cannot be the same person as the lead.
- `OPPORTUNITY_ACTIVE_QUOTATION_EXISTS` — Cannot declare opportunity as lost while an active quotation exists. Cancel the quotation first.

## Connects to

- **customer-supplier-management** *(recommended)* — Lead-to-customer conversion creates customer records managed by this feature
- **campaign-management** *(optional)* — UTM campaign tracking and email campaigns target leads
- **contract-management** *(optional)* — Won opportunities may result in contract creation

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/crm/lead-opportunity-pipeline/) · **Spec source:** [`lead-opportunity-pipeline.blueprint.yaml`](./lead-opportunity-pipeline.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
