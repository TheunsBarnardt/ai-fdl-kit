---
title: "Account Opening Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Investment account opening workflow with product selection, risk profiling, terms acceptance, funding instructions, and compliance review. 20 fields. 12 outcome"
---

# Account Opening Blueprint

> Investment account opening workflow with product selection, risk profiling, terms acceptance, funding instructions, and compliance review

| | |
|---|---|
| **Feature** | `account-opening` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | account-opening, investment, product-selection, risk-profiling, wealth-management, financial-services, kyc |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/account-opening.blueprint.yaml) |
| **JSON API** | [account-opening.json]({{ site.baseurl }}/api/blueprints/workflow/account-opening.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human | Individual opening an investment account |
| `advisor` | Financial Advisor | human | Advisor guiding client through account opening |
| `compliance_officer` | Compliance Officer | human | Reviews and approves account applications |
| `admin` | Administrator | human | System administrator who can override or escalate |
| `system` | System | system | Automated checks and notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `application_id` | text | Yes |  | Validations: required |
| `client_id` | text | Yes |  | Validations: required |
| `account_type` | select | Yes | Account Type |  |
| `selected_products` | json | Yes | Selected Investment Products |  |
| `risk_profile` | select | Yes | Risk Profile |  |
| `risk_score` | number | Yes | Risk Assessment Score | Validations: min, max |
| `investment_objective` | select | Yes | Investment Objective |  |
| `investment_horizon` | select | Yes | Investment Horizon |  |
| `initial_investment_amount` | number | Yes | Initial Investment Amount | Validations: required, min |
| `currency` | select | Yes | Currency |  |
| `source_of_funds` | select | Yes | Source of Funds |  |
| `source_of_funds_detail` | text | No | Source of Funds Details |  |
| `terms_accepted` | boolean | Yes | Terms and Conditions Accepted | Validations: required |
| `terms_accepted_at` | datetime | No |  |  |
| `mandate_document_id` | text | No | Signed Mandate Document |  |
| `funding_method` | select | Yes | Funding Method |  |
| `funding_reference` | text | No | Funding Reference Number |  |
| `status` | select | Yes |  |  |
| `compliance_notes` | rich_text | No | Compliance Review Notes |  |
| `rejection_reason` | text | No |  |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `product_selection` |  |  |
| `risk_assessment` |  |  |
| `terms_review` |  |  |
| `funding` |  |  |
| `submitted` |  |  |
| `compliance_review` |  |  |
| `approved` |  |  |
| `account_created` |  | Yes |
| `rejected` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `product_selection` | client,advisor |  |
|  | `product_selection` | `risk_assessment` | client,advisor | selected_products is not null |
|  | `risk_assessment` | `terms_review` | client,advisor | risk_score is not null |
|  | `terms_review` | `funding` | client,advisor | terms_accepted == true |
|  | `funding` | `submitted` | client,advisor | funding_method is not null |
|  | `submitted` | `compliance_review` | system,compliance_officer |  |
|  | `compliance_review` | `approved` | compliance_officer |  |
|  | `compliance_review` | `rejected` | compliance_officer | rejection_reason is not null |
|  | `approved` | `account_created` | system |  |
|  | `draft,product_selection,risk_assessment,terms_review,funding` | `cancelled` | client,advisor,admin |  |

## Rules

- **validation:** Client must complete onboarding (KYC) before opening an account, At least one investment product must be selected, Risk profile must be assessed before product selection is confirmed, Products must be suitable for the client's risk profile, Terms and conditions must be accepted before submission, Source of funds declaration is mandatory for compliance
- **product_suitability:** Conservative risk profile cannot select aggressive-growth products, Short-term horizon should warn on illiquid products, System validates product-risk alignment and warns on mismatches
- **compliance:** All applications require compliance review before account creation, Enhanced due diligence required for initial investments above threshold, Source of funds must be documented for anti-money laundering, Politically exposed persons require additional review
- **permissions:** Client can create and manage their own applications, Advisor can create applications on behalf of assigned clients, Compliance officer reviews and approves/rejects applications, Admin can override status and reassign applications

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| name | compliance_review |  |
| description | Compliance must review applications within 2 business days |  |
| max_duration | 48h |  |
| escalation |  |  |

## Outcomes

### Start_application (Priority: 1)

**Given:**
- `client_id` (input) exists
- `user.role` (session) in `Client,Advisor,Admin`

**Then:**
- **create_record** target: `applications`
- **transition_state** field: `status` from: `draft` to: `draft`
- **emit_event** event: `account.application_started`

**Result:** New account application created in draft status

### Cancel_application (Priority: 5)

**Given:**
- `application_id` (input) exists
- `status` (db) in `draft,product_selection,risk_assessment,terms_review,funding`
- `user.role` (session) in `Client,Advisor,Admin`

**Then:**
- **transition_state** field: `status` from: `current` to: `cancelled`
- **emit_event** event: `account.cancelled`

**Result:** Application cancelled

### Get_application_status (Priority: 8)

**Given:**
- `application_id` (input) exists
- `user.role` (session) in `Client,Advisor,Compliance,Admin`

**Then:**
- **emit_event** event: `account.status_viewed`

**Result:** Return current application status with progress indicator

### Get_available_products (Priority: 9)

**Given:**
- `client_id` (input) exists
- `user.role` (session) in `Client,Advisor`

**Then:**
- **emit_event** event: `products.listed`

**Result:** Return available investment products with descriptions, fees, and minimum investments

### Select_products (Priority: 10)

**Given:**
- `application_id` (input) exists
- `selected_products` (input) exists
- `status` (db) in `draft,product_selection`
- `user.role` (session) in `Client,Advisor`

**Then:**
- **set_field** target: `selected_products` value: `from_input`
- **transition_state** field: `status` from: `product_selection` to: `risk_assessment`
- **emit_event** event: `account.products_selected`

**Result:** Products selected, moved to risk assessment

### Product_suitability_warning (Priority: 15)

**Given:**
- `application_id` (input) exists
- `risk_profile` (computed) exists
- `product_risk_mismatch` (computed) eq `true`

**Then:**
- **emit_event** event: `account.suitability_warning`

**Result:** Warning displayed about product-risk profile mismatch

### Complete_risk_assessment (Priority: 20)

**Given:**
- `application_id` (input) exists
- `risk_score` (input) exists
- `risk_profile` (computed) exists
- `investment_objective` (input) exists
- `investment_horizon` (input) exists
- `status` (db) eq `risk_assessment`

**Then:**
- **set_field** target: `risk_score` value: `from_input`
- **set_field** target: `risk_profile` value: `from_computed`
- **transition_state** field: `status` from: `risk_assessment` to: `terms_review`
- **emit_event** event: `account.risk_assessed`

**Result:** Risk assessment completed

### Accept_terms (Priority: 30)

**Given:**
- `application_id` (input) exists
- `terms_accepted` (input) eq `true`
- `status` (db) eq `terms_review`

**Then:**
- **set_field** target: `terms_accepted` value: `true`
- **set_field** target: `terms_accepted_at` value: `now`
- **transition_state** field: `status` from: `terms_review` to: `funding`
- **emit_event** event: `account.terms_accepted`

**Result:** Terms accepted, moved to funding step

### Provide_funding_details (Priority: 40)

**Given:**
- `application_id` (input) exists
- `funding_method` (input) exists
- `initial_investment_amount` (input) gt `0`
- `source_of_funds` (input) exists
- `status` (db) eq `funding`

**Then:**
- **set_field** target: `funding_method` value: `from_input`
- **set_field** target: `initial_investment_amount` value: `from_input`
- **transition_state** field: `status` from: `funding` to: `submitted`
- **emit_event** event: `account.submitted`
- **notify** target: `compliance_officer`

**Result:** Application submitted for compliance review

### Compliance_approve (Priority: 50)

**Given:**
- `application_id` (input) exists
- `status` (db) eq `compliance_review`
- `user.role` (session) in `Compliance,Admin`

**Then:**
- **transition_state** field: `status` from: `compliance_review` to: `approved`
- **emit_event** event: `account.approved`
- **notify** target: `client`

**Result:** Application approved, account creation initiated

### Compliance_reject (Priority: 51)

**Given:**
- `application_id` (input) exists
- `rejection_reason` (input) exists
- `status` (db) eq `compliance_review`
- `user.role` (session) in `Compliance,Admin`

**Then:**
- **set_field** target: `rejection_reason` value: `from_input`
- **transition_state** field: `status` from: `compliance_review` to: `rejected`
- **emit_event** event: `account.rejected`
- **notify** target: `client`

**Result:** Application rejected with reason

### Create_account (Priority: 60)

**Given:**
- `application_id` (input) exists
- `status` (db) eq `approved`

**Then:**
- **call_service** target: `crm_create_account`
- **transition_state** field: `status` from: `approved` to: `account_created`
- **emit_event** event: `account.created`
- **notify** target: `client`

**Result:** Investment account created in CRM and client notified

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `APPLICATION_NOT_FOUND` | 404 | Account application not found | No |
| `ONBOARDING_INCOMPLETE` | 400 | Client onboarding must be completed before opening an account | No |
| `NO_PRODUCTS_SELECTED` | 400 | At least one investment product must be selected | No |
| `RISK_ASSESSMENT_REQUIRED` | 400 | Risk assessment must be completed before proceeding | No |
| `TERMS_NOT_ACCEPTED` | 400 | Terms and conditions must be accepted | No |
| `INVALID_STATUS_TRANSITION` | 400 | This action is not allowed in the current application status | No |
| `PRODUCT_SUITABILITY_VIOLATION` | 400 | Selected products do not match the client risk profile | No |
| `INSUFFICIENT_MINIMUM_INVESTMENT` | 400 | Initial investment amount is below the minimum required | No |
| `COMPLIANCE_REVIEW_REQUIRED` | 400 | Application requires compliance review before account creation | No |
| `CRM_ACCOUNT_CREATION_FAILED` | 500 | Account creation in CRM failed. Please try again or contact support | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `account.application_started` | New account application created | `application_id`, `client_id`, `timestamp` |
| `account.products_selected` | Investment products selected | `application_id`, `selected_products`, `timestamp` |
| `account.risk_assessed` | Risk assessment completed | `application_id`, `risk_profile`, `risk_score`, `timestamp` |
| `account.suitability_warning` | Product-risk suitability mismatch detected | `application_id`, `risk_profile`, `mismatched_products`, `timestamp` |
| `account.terms_accepted` | Terms and conditions accepted | `application_id`, `terms_accepted_at`, `timestamp` |
| `account.submitted` | Application submitted for review | `application_id`, `funding_method`, `amount`, `timestamp` |
| `account.approved` | Application approved by compliance | `application_id`, `approved_by`, `timestamp` |
| `account.rejected` | Application rejected by compliance | `application_id`, `rejection_reason`, `rejected_by`, `timestamp` |
| `account.created` | Investment account created in CRM | `application_id`, `account_number`, `client_id`, `timestamp` |
| `account.cancelled` | Application cancelled | `application_id`, `cancelled_by`, `timestamp` |
| `account.status_viewed` | Application status viewed | `application_id`, `viewed_by`, `timestamp` |
| `products.listed` | Available products listed for client | `client_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-onboarding | required | KYC onboarding must be completed before account can be opened |
| product-configurator | required | Products must exist in the catalog for selection during account opening |
| wizard-stepper | recommended | Multi-step account opening flow benefits from step-by-step wizard UI |
| document-management | recommended | Mandate documents and compliance paperwork need document storage |
| approval-chain | recommended | Compliance review follows an approval workflow pattern |
| email-notifications | recommended | Status change notifications sent via email |
| in-app-notifications | recommended | Real-time status updates shown in notification center |
| dataverse-client | required | Account creation and product data synced with CRM |
| audit-trail | recommended | All application changes must be tracked for regulatory compliance |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
form_layout: wizard
progress_tracking: true
steps:
  - label: Account Type
    icon: user-check
  - label: Select Products
    icon: package
  - label: Risk Assessment
    icon: shield-check
  - label: Terms & Conditions
    icon: file-text
  - label: Funding
    icon: banknote
  - label: Review & Submit
    icon: check-circle
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Account Opening Blueprint",
  "description": "Investment account opening workflow with product selection, risk profiling, terms acceptance, funding instructions, and compliance review. 20 fields. 12 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "account-opening, investment, product-selection, risk-profiling, wealth-management, financial-services, kyc"
}
</script>
