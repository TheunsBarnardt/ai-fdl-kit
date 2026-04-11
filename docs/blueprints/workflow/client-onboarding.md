---
title: "Client Onboarding Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Multi-step process for new clients to complete personal, contact, address, and employment details before account opening. 18 fields. 13 outcomes. 7 error codes."
---

# Client Onboarding Blueprint

> Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

| | |
|---|---|
| **Feature** | `client-onboarding` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | onboarding, client-acquisition, financial-services |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/client-onboarding.blueprint.yaml) |
| **JSON API** | [client-onboarding.json]({{ site.baseurl }}/api/blueprints/workflow/client-onboarding.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Client | human |  |
| `portfolio_manager` | Portfolio Manager | human |  |
| `pm_assistant` | PM Assistant | human |  |
| `onboarding_officer` | Onboarding Officer | human |  |
| `cid_officer` | CID Officer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `onboarding_id` | number | Yes | Onboarding Id | Validations: required |
| `first_name` | text | Yes | First Name | Validations: required, maxLength |
| `last_name` | text | Yes | Last Name | Validations: required, maxLength |
| `date_of_birth` | date | Yes | Date Of Birth | Validations: required |
| `identification_number` | text | Yes | Identification Number | Validations: required |
| `passport_number` | text | No | Passport Number |  |
| `email` | email | Yes | Email | Validations: required, email |
| `mobile_phone` | phone | Yes | Mobile Phone | Validations: required, phone |
| `home_phone` | phone | No | Home Phone |  |
| `work_phone` | phone | No | Work Phone |  |
| `physical_address_street` | text | Yes | Physical Address Street | Validations: required |
| `physical_address_city` | text | Yes | Physical Address City | Validations: required |
| `physical_address_postal_code` | text | Yes | Physical Address Postal Code | Validations: required |
| `postal_address_same_as_physical` | boolean | No | Postal Address Same As Physical |  |
| `employer_name` | text | Yes | Employer Name | Validations: required |
| `occupation` | text | Yes | Occupation | Validations: required |
| `industry_sector` | text | Yes | Industry Sector | Validations: required |
| `status` | select | Yes | Status | Validations: required |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `starting` |  |  |
| `in_progress` |  |  |
| `account_starting` |  |  |
| `account_in_progress` |  |  |
| `submit_application` |  |  |
| `waiting_approval` |  |  |
| `approved` |  |  |
| `mandate_signed` |  | Yes |
| `cancelled` |  | Yes |
| `expired` |  | Yes |

## Rules

- **validation:** Email must be valid format, Phone numbers must be valid, Date of birth must be in the past
- **permissions:** Client can view/edit their own onboarding, Portfolio Manager can manage assigned onboardings, Onboarding-Activ8 can create and manage all, Onboarding-CID can approve

## Outcomes

### Start_onboarding (Priority: 1)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) eq `initiated`
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **transition_state** field: `status` from: `initiated` to: `starting`
- **emit_event** event: `onboarding.started`

**Result:** Onboarding started

### Update_onboarding_progress (Priority: 2)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **set_field** target: `current_step` value: `from_input`
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `step.updated`

**Result:** Progress step updated

### Notify_client_onboarding_ready (Priority: 3) — Error: `ONBOARDING_NOT_FOUND`

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **emit_event** event: `notification.sent`

**Result:** Client notified

### Complete_client_onboarding (Priority: 5)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) in `in_progress,account_starting`
- `first_name` (db) exists
- `email` (db) exists
- `physical_address_street` (db) exists
- `employer_name` (db) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **transition_state** field: `status` from: `in_progress` to: `account_starting`
- **emit_event** event: `client_details.completed`

**Result:** Client details completed

### Get_personal_details (Priority: 10)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `details.retrieved`

**Result:** Returns personal details

### Get_contact_details (Priority: 11)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `details.retrieved`

**Result:** Returns contact details

### Get_address_details (Priority: 12)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `details.retrieved`

**Result:** Returns address details

### Get_employment_details (Priority: 13)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `details.retrieved`

**Result:** Returns employment details

### Get_onboarding_metadata (Priority: 14)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `metadata.retrieved`

**Result:** Returns metadata with status

### Update_personal_details (Priority: 20)

**Given:**
- `onboarding_id` (input) exists
- `first_name` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `details.updated`

**Result:** Personal details updated

### Update_contact_details (Priority: 21)

**Given:**
- `onboarding_id` (input) exists
- `email` (input) exists
- `mobile_phone` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `details.updated`

**Result:** Contact details updated

### Update_address_details (Priority: 22)

**Given:**
- `onboarding_id` (input) exists
- `physical_address_street` (input) exists
- `physical_address_city` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `details.updated`

**Result:** Address details updated

### Update_employment_details (Priority: 23)

**Given:**
- `onboarding_id` (input) exists
- `employer_name` (input) exists
- `occupation` (input) exists
- `client.role` (session) in `Client,Portfolio Manager,PM Assistant,Onboarding-Activ8`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `details.updated`

**Result:** Employment details updated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ONBOARDING_NOT_FOUND` | 404 | Onboarding record not found | No |
| `INVALID_EMAIL_FORMAT` | 400 | Email address is invalid | No |
| `INVALID_PHONE_FORMAT` | 400 | Phone number is invalid | No |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing | No |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid status transition | No |
| `UNAUTHORIZED_ACCESS` | 403 | Unauthorized access | No |
| `FORM_VALIDATION_FAILED` | 400 | Form validation failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `onboarding.started` | Onboarding workflow initiated | `onboarding_id` |
| `details.retrieved` | Details retrieved | `onboarding_id` |
| `details.updated` | Details updated | `onboarding_id` |
| `step.updated` | Step updated | `onboarding_id` |
| `client_details.completed` | Client details completed | `onboarding_id` |
| `notification.sent` | Notification sent | `onboarding_id` |
| `metadata.retrieved` | Metadata retrieved | `onboarding_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| advisor-onboarding | recommended |  |
| proposals-quotations | recommended |  |
| user-auth | required |  |

## AGI Readiness

### Goals

#### Reliable Client Onboarding

Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `user_auth` | user-auth | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| get_personal_details | `autonomous` | - | - |
| update_personal_details | `supervised` | - | - |
| get_contact_details | `autonomous` | - | - |
| update_contact_details | `supervised` | - | - |
| get_address_details | `autonomous` | - | - |
| update_address_details | `supervised` | - | - |
| get_employment_details | `autonomous` | - | - |
| update_employment_details | `supervised` | - | - |
| start_onboarding | `autonomous` | - | - |
| complete_client_onboarding | `autonomous` | - | - |
| update_onboarding_progress | `supervised` | - | - |
| notify_client_onboarding_ready | `autonomous` | - | - |
| get_onboarding_metadata | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
form_layout: multi-step
progress_tracking: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Client Onboarding Blueprint",
  "description": "Multi-step process for new clients to complete personal, contact, address, and employment details before account opening. 18 fields. 13 outcomes. 7 error codes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "onboarding, client-acquisition, financial-services"
}
</script>
