---
title: "Proposals Quotations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Creation, management, and approval workflow for investment proposals and quotations delivered to clients. 21 fields. 18 outcomes. 11 error codes. rules: validat"
---

# Proposals Quotations Blueprint

> Creation, management, and approval workflow for investment proposals and quotations delivered to clients

| | |
|---|---|
| **Feature** | `proposals-quotations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | proposals, quotations, document-generation, client-communication |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/proposals-quotations.blueprint.yaml) |
| **JSON API** | [proposals-quotations.json]({{ site.baseurl }}/api/blueprints/data/proposals-quotations.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `pm_assistant` | PM Assistant | human |  |
| `client` | Client | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `proposal_id` | number | Yes |  | Validations: required |
| `crm_number` | text | Yes |  | Validations: required, pattern |
| `proposal_name` | text | Yes |  | Validations: required, maxLength |
| `client_id` | text | Yes |  | Validations: required |
| `first_name` | text | Yes |  | Validations: required |
| `last_name` | text | Yes |  | Validations: required |
| `email` | email | Yes |  | Validations: required, email |
| `mobile_phone` | phone | Yes |  | Validations: required, phone |
| `identification_number` | text | Yes |  | Validations: required |
| `passport_number` | text | No |  |  |
| `portfolio_manager_id` | text | Yes |  | Validations: required |
| `portfolio_manager_name` | text | Yes |  | Validations: required |
| `relationship_team_id` | text | Yes |  | Validations: required |
| `product_id` | number | Yes |  | Validations: required |
| `product_name` | text | Yes |  | Validations: required |
| `asset_manager_id` | number | Yes |  | Validations: required |
| `document_id` | text | Yes |  | Validations: required |
| `document_name` | text | Yes |  | Validations: required |
| `status` | select | Yes |  | Validations: required |
| `client_comment` | rich_text | No |  | Validations: maxLength |
| `created_at` | datetime | Yes |  | Validations: required |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `accepted` |  | Yes |
| `declined` |  | Yes |
| `expired` |  | Yes |
| `closed` |  | Yes |

## Rules

- **validation:** Client email must be valid, Client ID required, Product and asset manager must exist, Document required
- **permissions:** Client views their proposals, PM creates and manages proposals, PM Assistant supports proposal creation, Client accepts or declines

## Outcomes

### Accept_proposal (Priority: 1)

**Given:**
- `proposal_id` (input) exists
- `status` (db) eq `pending`
- `client.role` (session) eq `Client`

**Then:**
- **transition_state** field: `status` from: `pending` to: `accepted`
- **set_field** target: `client_action_at` value: `now`
- **set_field** target: `client_comment` value: `from_input`
- **emit_event** event: `proposal.accepted`

**Result:** Proposal accepted

### Decline_proposal (Priority: 2)

**Given:**
- `proposal_id` (input) exists
- `status` (db) eq `pending`
- `client.role` (session) eq `Client`

**Then:**
- **transition_state** field: `status` from: `pending` to: `declined`
- **set_field** target: `client_action_at` value: `now`
- **set_field** target: `client_comment` value: `from_input`
- **emit_event** event: `proposal.declined`

**Result:** Proposal declined

### Get_current_proposal (Priority: 5)

**Given:**
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `proposal.retrieved`

**Result:** Returns latest proposal

### Get_client_proposals (Priority: 6)

**Given:**
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `proposals.list_retrieved`

**Result:** Returns all client proposals

### Get_proposals_for_review (Priority: 7)

**Given:**
- `client.role` (session) eq `Client`
- `status` (db) eq `pending`

**Then:**
- **emit_event** event: `pending_proposals.retrieved`

**Result:** Returns pending proposals

### Get_proposal_with_document (Priority: 8)

**Given:**
- `proposal_id` (input) exists
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `proposal_document.retrieved`

**Result:** Returns proposal with document

### Get_proposal_document (Priority: 20)

**Given:**
- `proposal_id` (input) exists
- `document_id` (db) exists
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `document.downloaded`

**Result:** Returns PDF document

### Generate_mandate_pdf (Priority: 21)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `mandate.generated`

**Result:** Returns mandate PDF

### Complete_onboarding_workflow (Priority: 22)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) in `approved,waiting_signature`
- `client.role` (session) eq `Client`

**Then:**
- **emit_event** event: `mandate_signing.initiated`

**Result:** eSignature service signing initiated

### Handle_mandate_signed (Priority: 23)

**Given:**
- `onboarding_id` (input) exists
- `envelope_status` (input) eq `completed`

**Then:**
- **set_field** target: `signed_mandate_doc_job_id` value: `from_envelope`
- **emit_event** event: `mandate.signed`

**Result:** Mandate signed

### Create_proposal (Priority: 30)

**Given:**
- `document_file` (input) exists
- `client_information.identification_number` (input) exists
- `mandate_details.product_id` (input) exists
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **emit_event** event: `validation.duplicate_check`

**Result:** Validation performed

### Create_proposal_success (Priority: 31)

**Given:**
- `document_file` (input) exists
- `client_information` (input) exists
- `mandate_details` (input) exists
- `client_information.identification_number` (db) not_exists
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **create_record** target: `proposal`
- **emit_event** event: `proposal.created`

**Result:** Proposal created

### Get_pm_proposals (Priority: 40)

**Given:**
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **emit_event** event: `pm_proposals.list_retrieved`

**Result:** Returns PM proposals

### Get_proposal_by_id (Priority: 41)

**Given:**
- `proposal_id` (input) exists
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **emit_event** event: `proposal.retrieved`

**Result:** Returns proposal details

### Update_proposal (Priority: 42)

**Given:**
- `proposal_id` (input) exists
- `status` (db) in `pending`
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `proposal.updated`

**Result:** Proposal updated

### Create_direct_onboarding (Priority: 50)

**Given:**
- `client_information` (input) exists
- `mandate_details` (input) exists
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **create_record** target: `onboarding`
- **emit_event** event: `onboarding.created`

**Result:** Onboarding created

### Start_onboarding_for_proposal (Priority: 51)

**Given:**
- `proposal_id` (input) exists
- `status` (db) eq `accepted`
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **create_record** target: `onboarding`
- **emit_event** event: `onboarding.created`

**Result:** Onboarding from proposal

### Get_pm_onboardings (Priority: 60)

**Given:**
- `client.role` (session) in `Portfolio Manager,PM Assistant`

**Then:**
- **emit_event** event: `pm_onboardings.list_retrieved`

**Result:** Returns PM onboardings

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PROPOSAL_NOT_FOUND` | 404 | Proposal not found | No |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid status transition | No |
| `DUPLICATE_CLIENT` | 409 | Client already exists | No |
| `MISSING_CLIENT_INFO` | 400 | Client information missing | No |
| `DOCUMENT_UPLOAD_FAILED` | 500 | Document upload failed | No |
| `DOCUMENT_NOT_FOUND` | 404 | Document not found | No |
| `INVALID_EMAIL` | 400 | Invalid email | No |
| `INVALID_PHONE` | 400 | Invalid phone | No |
| `UNAUTHORIZED_ACCESS` | 403 | Unauthorized | No |
| `PDF_GENERATION_FAILED` | 500 | PDF generation failed | No |
| `DOCU_SIGN_INTEGRATION_ERROR` | 500 | eSignature service error | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `proposal.created` | Proposal created | `proposal_id` |
| `proposal.retrieved` | Proposal retrieved | `proposal_id` |
| `proposals.list_retrieved` | Proposals list retrieved | `client_id` |
| `proposal_document.retrieved` | Proposal document retrieved | `proposal_id` |
| `pending_proposals.retrieved` | Pending proposals retrieved | `client_id` |
| `proposal.accepted` | Proposal accepted | `proposal_id` |
| `proposal.declined` | Proposal declined | `proposal_id` |
| `document.downloaded` | Document downloaded | `proposal_id` |
| `mandate.generated` | Mandate generated | `onboarding_id` |
| `mandate_signing.initiated` | Signing initiated | `onboarding_id` |
| `mandate.signed` | Mandate signed | `onboarding_id` |
| `proposal.updated` | Proposal updated | `proposal_id` |
| `onboarding.created` | Onboarding created | `onboarding_id` |
| `pm_proposals.list_retrieved` | PM proposals retrieved | `portfolio_manager_id` |
| `pm_onboardings.list_retrieved` | PM onboardings retrieved | `portfolio_manager_id` |
| `validation.duplicate_check` | Duplicate check performed | `identification_number` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-onboarding | required |  |
| advisor-onboarding | optional |  |
| user-auth | required |  |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
document_preview: true
client_comment_section: true
status_timeline: true
document_download: true
```

</details>

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
email-notification: Email notifications
esignature-integration: eSignature service integration
pdf-generation: PDF generation
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Proposals Quotations Blueprint",
  "description": "Creation, management, and approval workflow for investment proposals and quotations delivered to clients. 21 fields. 18 outcomes. 11 error codes. rules: validat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "proposals, quotations, document-generation, client-communication"
}
</script>
