---
title: "Advisor Onboarding Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Registration and onboarding process for independent financial advisors with CID approval and mandate signing. 11 fields. 11 outcomes. 10 error codes. rules: val"
---

# Advisor Onboarding Blueprint

> Registration and onboarding process for independent financial advisors with CID approval and mandate signing

| | |
|---|---|
| **Feature** | `advisor-onboarding` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | advisor-registration, approval-workflow, financial-services |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/advisor-onboarding.blueprint.yaml) |
| **JSON API** | [advisor-onboarding.json]({{ site.baseurl }}/api/blueprints/workflow/advisor-onboarding.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `advisor` | Advisor | human |  |
| `onboarding_officer` | Onboarding Officer | human |  |
| `cid_officer` | CID Officer | human |  |
| `esignature_service` | eSignature Service | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `onboarding_id` | number | Yes |  | Validations: required |
| `identification_number` | text | Yes |  | Validations: required, unique |
| `passport_number` | text | No |  |  |
| `first_name` | text | Yes |  | Validations: required, maxLength |
| `last_name` | text | Yes |  | Validations: required, maxLength |
| `email` | email | Yes |  | Validations: required, email |
| `mobile_phone` | phone | Yes |  | Validations: required, phone |
| `advisor_code` | text | Yes |  | Validations: required, pattern |
| `status` | select | Yes |  | Validations: required |
| `cancellation_reason` | text | No |  |  |
| `envelope_id` | text | No |  |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `in_progress` |  |  |
| `waiting_approval` |  |  |
| `approved` |  |  |
| `mandate_signing` |  |  |
| `mandate_signed` |  | Yes |
| `cancelled` |  | Yes |
| `expired` |  | Yes |

## Rules

- **validation:** ID and passport must be unique in system, Valid email and phone required, Advisor code format alphanumeric 6-10 chars
- **permissions:** Onboarding-Activ8 creates and manages, Onboarding-CID approves, Advisor views own onboarding

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| max_duration | 30d |  |

## Outcomes

### Create_advisor_onboarding_duplicate (Priority: 0) — Error: `DUPLICATE_IDENTITY`

**Given:**
- ANY: `identification_number` (db) exists OR `passport_number` (db) exists

**Then:**
- **emit_event** event: `validation.duplicate_found`

**Result:** Error duplicate found

### Create_advisor_onboarding (Priority: 1)

**Given:**
- `identification_number` (input) exists
- `email` (input) exists
- `advisor_code` (input) exists
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **create_record** target: `onboarding`
- **emit_event** event: `onboarding.created`

**Result:** Advisor onboarding created

### Send_to_approval (Priority: 3)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) in `initiated,in_progress`
- `identification_number` (db) exists
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **transition_state** field: `status` from: `in_progress` to: `waiting_approval`
- **emit_event** event: `approval.submitted`

**Result:** Sent for CID approval

### Cid_approve_onboarding (Priority: 4)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) eq `waiting_approval`
- `client.role` (session) eq `Onboarding-CID`

**Then:**
- **transition_state** field: `status` from: `waiting_approval` to: `approved`
- **emit_event** event: `approval.granted`

**Result:** CID approved onboarding

### Complete_onboarding_mandate (Priority: 5)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) eq `approved`
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **transition_state** field: `status` from: `approved` to: `mandate_signing`
- **set_field** target: `envelope_id` value: `generated`
- **emit_event** event: `mandate.generated`

**Result:** Mandate sent to eSignature service

### Handle_mandate_signed (Priority: 6)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) eq `mandate_signing`
- `envelope_status` (input) eq `signed`

**Then:**
- **transition_state** field: `status` from: `mandate_signing` to: `mandate_signed`
- **emit_event** event: `mandate.signed`

**Result:** Mandate signed, onboarding complete

### Get_advisor_onboarding (Priority: 10)

**Given:**
- `onboarding_id` (input) exists
- `client.role` (session) in `Onboarding-Activ8,Onboarding-CID`

**Then:**
- **emit_event** event: `onboarding.retrieved`

**Result:** Returns advisor onboarding data

### Update_advisor_onboarding (Priority: 11)

**Given:**
- `onboarding_id` (input) exists
- `status` (db) in `initiated,in_progress`
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `onboarding.updated`

**Result:** Advisor onboarding updated

### Cancel_advisor_onboarding (Priority: 12)

**Given:**
- `onboarding_id` (input) exists
- `cancellation_reason` (input) exists
- `status` (db) not_in `mandate_signed,cancelled`
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **transition_state** field: `status` from: `current` to: `cancelled`
- **set_field** target: `cancellation_reason` value: `from_input`
- **emit_event** event: `onboarding.cancelled`

**Result:** Onboarding cancelled

### Get_creator_onboardings (Priority: 20)

**Given:**
- `client.role` (session) eq `Onboarding-Activ8`

**Then:**
- **emit_event** event: `list.retrieved`

**Result:** Returns created onboardings

### Get_cid_onboardings (Priority: 21)

**Given:**
- `client.role` (session) eq `Onboarding-CID`

**Then:**
- **emit_event** event: `list.retrieved`

**Result:** Returns pending approvals

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ONBOARDING_NOT_FOUND` | 404 | Onboarding not found | No |
| `DUPLICATE_IDENTITY` | 409 | Advisor with this identity exists | No |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid status transition | No |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing | No |
| `INVALID_EMAIL_FORMAT` | 400 | Invalid email | No |
| `INVALID_PHONE_FORMAT` | 400 | Invalid phone | No |
| `UNAUTHORIZED_ACCESS` | 403 | Unauthorized | No |
| `INVALID_ADVISOR_CODE` | 400 | Invalid advisor code | No |
| `DOCU_SIGN_ERROR` | 500 | eSignature service error | No |
| `MANDATE_GENERATION_FAILED` | 500 | Mandate generation failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `onboarding.created` | Advisor onboarding created | `onboarding_id` |
| `onboarding.retrieved` | Onboarding retrieved | `onboarding_id` |
| `onboarding.updated` | Onboarding updated | `onboarding_id` |
| `onboarding.cancelled` | Onboarding cancelled | `onboarding_id` |
| `validation.duplicate_found` | Duplicate found | `identification_number` |
| `approval.submitted` | Submitted for approval | `onboarding_id` |
| `approval.granted` | Approval granted | `onboarding_id` |
| `mandate.generated` | Mandate generated | `onboarding_id` |
| `mandate.signed` | Mandate signed | `onboarding_id` |
| `list.retrieved` | List retrieved | `filter` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-onboarding | recommended |  |
| proposals-quotations | optional |  |
| user-auth | required |  |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
progress_tracking: true
status_badge: true
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Advisor Onboarding Blueprint",
  "description": "Registration and onboarding process for independent financial advisors with CID approval and mandate signing. 11 fields. 11 outcomes. 10 error codes. rules: val",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "advisor-registration, approval-workflow, financial-services"
}
</script>
