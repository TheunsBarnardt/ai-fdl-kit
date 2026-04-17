<!-- AUTO-GENERATED FROM broker-user-access.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker User Access

> User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and audit trail of access changes

**Category:** Auth · **Version:** 1.0.0 · **Tags:** back-office · broker · user-access · rbac · access-control · security · audit · segregation-of-duties

## What this does

User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and audit trail of access changes

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(text, required)* — User ID
- **operator_id** *(text, required)* — Operator ID
- **user_name** *(text, required)* — User Name
- **broker_alpha** *(text, required)* — Broker Alpha Code
- **branch_code** *(text, optional)* — Branch Code
- **function_code** *(text, required)* — Function Code
- **generic_code** *(text, optional)* — Generic Code
- **broker_option** *(select, required)* — Broker Option
- **update_option** *(select, required)* — Update Option
- **access_level** *(select, required)* — Security Access Level
- **branch_data_option** *(select, optional)* — Branch Data Option
- **action_code** *(select, required)* — Action Code
- **access_status** *(select, required)* — Access Status
- **deactivated_date** *(date, optional)* — Deactivated Date
- **function_description** *(text, optional)* — Function Description
- **verifier_role** *(select, optional)* — Verifier Role
- **requested_by** *(text, optional)* — Requested By User
- **requested_at** *(datetime, optional)* — Request Timestamp
- **verified_by** *(text, optional)* — Verified By User
- **verified_at** *(datetime, optional)* — Verification Timestamp
- **change_reason** *(text, optional)* — Change Reason

## What must be true

- **access_control → function_level_security:** Every screen/function has a unique security code checked at invocation
- **access_control → view_vs_update:** Access is granted at either enquiry (E) or update (U) level, where update implies enquiry
- **access_control → screen_level_enforcement:** Resource-access-control-facility enforces permission check before screen is rendered or action processed
- **access_control → deactivation_blocks_access:** A deactivated access prevents any use of the function until reactivated and verified
- **segregation_of_duties → dual_control_verification:** A granted access is not usable until verified by a second authorised user
- **segregation_of_duties → self_verification_prohibited:** Loader and verifier may differ; verifier must hold dedicated verification role (branch, broker, or exchange-level)
- **segregation_of_duties → broker_scope_restriction:** A broker user may only grant access to users whose ID begins with the broker alpha code
- **role_model → verification_roles:** Three verification scopes: branch verifier, broker verifier, exchange-wide verifier
- **role_model → function_grant_scope:** Broker users may only grant functions where broker option allows enquiry or update
- **role_model → special_security_codes:** Certain functions use combination security codes and special characters (e.g. portfolio advisor data-access codes)
- **audit → full_audit_trail:** All access changes are logged with user, timestamp, action, old/new status, retained at least 36 months
- **audit → change_reason_required:** Deactivation and revocation require a documented change reason
- **audit → enquiry_logging:** Access enquiries by user ID or by function code are logged for compliance review
- **compliance → popia_alignment:** Access records may contain staff personal information; POPIA lawful-basis and data-minimisation apply
- **compliance → least_privilege:** Default posture is no access; privileges granted explicitly per function

## Success & failure scenarios

**✅ Success paths**

- **Grant New Function Access** — when action_code eq "N"; user_id exists; function_code exists, then create_record; set access_status = "UNVER"; emit user_access.requested. _Why: Security administrator allocates a new function to a user, marked unverified pending sign-off._
- **Verify And Activate Access** — when action_code eq "V"; access_status eq "UNVER"; verifier_role in ["BRNVR","BRKVR","JSEVR"], then move access_status UNVER → ACTIVE; set verified_at = "now"; emit user_access.verified; emit user_access.granted. _Why: Authorised verifier signs off unverified access, making it usable._
- **Deactivate Access** — when action_code eq "D"; access_status eq "ACTIVE", then move access_status ACTIVE → DEACT; set deactivated_date = "today"; emit user_access.deactivated. _Why: Administrator deactivates an active access while retaining history._
- **Reactivate Access** — when action_code eq "R"; access_status eq "DEACT", then move access_status DEACT → UNVER; emit user_access.reactivated. _Why: Administrator reactivates a previously deactivated access, requiring re-verification._
- **Runtime Function Invocation Check** — when access_status eq "ACTIVE"; access_level gte "required_level", then call service; emit user_access.enquiry. _Why: Runtime check when user attempts to invoke a function; access granted only when status is ACTIVE and level matches._
- **Enquire Access By User Or Function** — when query_type in ["by_user","by_function"], then call service; emit user_access.enquiry. _Why: Authorised administrator lists all functions for a user or all users for a function._

**❌ Failure paths**

- **Reject Broker Scope Violation** — when granting_user_type eq "broker"; user_id_prefix neq "broker_alpha", then emit user_access.denied. _Why: Broker administrator attempts to grant access to a user outside their broker alpha._ *(error: `ACCESS_BROKER_SCOPE_VIOLATION`)*
- **Reject Unauthorised Verifier** — when action_code eq "V"; verifier_role not_in ["BRNVR","BRKVR","JSEVR"], then emit user_access.denied. _Why: User without a verification role attempts to verify access._ *(error: `ACCESS_SELF_VERIFICATION_FORBIDDEN`)*
- **Reject Update On Enquiry Only Function** — when update_option eq "E"; access_level eq "U", then emit user_access.denied. _Why: Update-level access requested against a function defined as enquiry-only._ *(error: `ACCESS_UPDATE_NOT_PERMITTED`)*

## Errors it can return

- `ACCESS_USER_INVALID` — User ID is not recognised, please verify via user enquiry screen
- `ACCESS_UNAUTHORISED_GRANTOR` — You are not authorised to grant access to this function
- `ACCESS_BROKER_SCOPE_VIOLATION` — Broker users may only grant access to users within their own broker alpha
- `ACCESS_UPDATE_NOT_PERMITTED` — Update access is not permitted for this function, enquiry only
- `ACCESS_VERIFICATION_REQUIRED` — Access must be verified by a second authorised user before it can be used
- `ACCESS_SELF_VERIFICATION_FORBIDDEN` — Verifier must hold a dedicated verification role
- `ACCESS_INVALID_STATE_TRANSITION` — The requested action is not valid from the current access status
- `ACCESS_FUNCTION_NOT_FOUND` — Function code is not defined in the security codes register

## Events

**`user_access.requested`**
  Payload: `user_id`, `function_code`, `access_level`, `requested_by`, `timestamp`

**`user_access.granted`**
  Payload: `user_id`, `function_code`, `access_level`, `verified_by`, `timestamp`

**`user_access.verified`**
  Payload: `user_id`, `function_code`, `verified_by`, `timestamp`

**`user_access.deactivated`**
  Payload: `user_id`, `function_code`, `deactivated_by`, `change_reason`, `timestamp`

**`user_access.reactivated`**
  Payload: `user_id`, `function_code`, `reactivated_by`, `timestamp`

**`user_access.revoked`**
  Payload: `user_id`, `function_code`, `revoked_by`, `change_reason`, `timestamp`

**`user_access.denied`**
  Payload: `user_id`, `function_code`, `reason`, `timestamp`

**`user_access.enquiry`**
  Payload: `query_type`, `query_value`, `queried_by`, `timestamp`

## Connects to

- **popia-compliance** *(required)*
- **broker-client-account-maintenance** *(recommended)*
- **login** *(recommended)*
- **password-reset** *(optional)*

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/broker-user-access/) · **Spec source:** [`broker-user-access.blueprint.yaml`](./broker-user-access.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
