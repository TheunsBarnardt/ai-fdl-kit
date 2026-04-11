<!-- AUTO-GENERATED FROM client-onboarding.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Client Onboarding

> Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** onboarding · client-acquisition · financial-services

## What this does

Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **onboarding_id** *(number, required)*
- **first_name** *(text, required)*
- **last_name** *(text, required)*
- **date_of_birth** *(date, required)*
- **identification_number** *(text, required)*
- **passport_number** *(text, optional)*
- **email** *(email, required)*
- **mobile_phone** *(phone, required)*
- **home_phone** *(phone, optional)*
- **work_phone** *(phone, optional)*
- **physical_address_street** *(text, required)*
- **physical_address_city** *(text, required)*
- **physical_address_postal_code** *(text, required)*
- **postal_address_same_as_physical** *(boolean, optional)*
- **employer_name** *(text, required)*
- **occupation** *(text, required)*
- **industry_sector** *(text, required)*
- **status** *(select, required)*

## What must be true

- **validation:** Email must be valid format, Phone numbers must be valid, Date of birth must be in the past
- **permissions:** Client can view/edit their own onboarding, Portfolio Manager can manage assigned onboardings, Onboarding-Activ8 can create and manage all, Onboarding-CID can approve

## Success & failure scenarios

**✅ Success paths**

- **Start Onboarding** — when onboarding_id exists; status eq "initiated"; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Onboarding started.
- **Update Onboarding Progress** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Progress step updated.
- **Notify Client Onboarding Ready** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Client notified.
- **Complete Client Onboarding** — when onboarding_id exists; status in ["in_progress","account_starting"]; first_name exists; email exists; physical_address_street exists; employer_name exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Client details completed.
- **Get Personal Details** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8","Onboarding-CID"], then Returns personal details.
- **Get Contact Details** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8","Onboarding-CID"], then Returns contact details.
- **Get Address Details** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8","Onboarding-CID"], then Returns address details.
- **Get Employment Details** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8","Onboarding-CID"], then Returns employment details.
- **Get Onboarding Metadata** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8","Onboarding-CID"], then Returns metadata with status.
- **Update Personal Details** — when onboarding_id exists; first_name exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Personal details updated.
- **Update Contact Details** — when onboarding_id exists; email exists; mobile_phone exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Contact details updated.
- **Update Address Details** — when onboarding_id exists; physical_address_street exists; physical_address_city exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Address details updated.
- **Update Employment Details** — when onboarding_id exists; employer_name exists; occupation exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Employment details updated.

## Errors it can return

- `ONBOARDING_NOT_FOUND` — Onboarding record not found
- `INVALID_EMAIL_FORMAT` — Email address is invalid
- `INVALID_PHONE_FORMAT` — Phone number is invalid
- `MISSING_REQUIRED_FIELD` — Required field is missing
- `INVALID_STATUS_TRANSITION` — Invalid status transition
- `UNAUTHORIZED_ACCESS` — Unauthorized access
- `FORM_VALIDATION_FAILED` — Form validation failed

## Connects to

- **advisor-onboarding** *(recommended)*
- **proposals-quotations** *(recommended)*
- **user-auth** *(required)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/client-onboarding/) · **Spec source:** [`client-onboarding.blueprint.yaml`](./client-onboarding.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
