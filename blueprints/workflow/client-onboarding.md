<!-- AUTO-GENERATED FROM client-onboarding.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Client Onboarding

> Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** onboarding · client-acquisition · financial-services

## What this does

Multi-step process for new clients to complete personal, contact, address, and employment details before account opening

Specifies 13 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **onboarding_id** *(number, required)* — Onboarding Id
- **first_name** *(text, required)* — First Name
- **last_name** *(text, required)* — Last Name
- **date_of_birth** *(date, required)* — Date Of Birth
- **identification_number** *(text, required)* — Identification Number
- **passport_number** *(text, optional)* — Passport Number
- **email** *(email, required)* — Email
- **mobile_phone** *(phone, required)* — Mobile Phone
- **home_phone** *(phone, optional)* — Home Phone
- **work_phone** *(phone, optional)* — Work Phone
- **physical_address_street** *(text, required)* — Physical Address Street
- **physical_address_city** *(text, required)* — Physical Address City
- **physical_address_postal_code** *(text, required)* — Physical Address Postal Code
- **postal_address_same_as_physical** *(boolean, optional)* — Postal Address Same As Physical
- **employer_name** *(text, required)* — Employer Name
- **occupation** *(text, required)* — Occupation
- **industry_sector** *(text, required)* — Industry Sector
- **status** *(select, required)* — Status

## What must be true

- **validation:** Email must be valid format, Phone numbers must be valid, Date of birth must be in the past
- **permissions:** Client can view/edit their own onboarding, Portfolio Manager can manage assigned onboardings, Onboarding-Activ8 can create and manage all, Onboarding-CID can approve

## Success & failure scenarios

**✅ Success paths**

- **Start Onboarding** — when onboarding_id exists; status eq "initiated"; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Onboarding started.
- **Update Onboarding Progress** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Progress step updated.
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

**❌ Failure paths**

- **Notify Client Onboarding Ready** — when onboarding_id exists; client.role in ["Client","Portfolio Manager","PM Assistant","Onboarding-Activ8"], then Client notified. *(error: `ONBOARDING_NOT_FOUND`)*

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

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `█████████░` | 9/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

📈 **+5** since baseline (75 → 80)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 18 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/client-onboarding/) · **Spec source:** [`client-onboarding.blueprint.yaml`](./client-onboarding.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
