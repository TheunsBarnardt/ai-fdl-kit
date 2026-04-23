---
title: "Broker User Access Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and"
---

# Broker User Access Blueprint

> User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and audit trail of access changes

| | |
|---|---|
| **Feature** | `broker-user-access` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, user-access, rbac, access-control, security, audit, segregation-of-duties |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-user-access.blueprint.yaml) |
| **JSON API** | [broker-user-access.json]({{ site.baseurl }}/api/blueprints/auth/broker-user-access.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `security_administrator` | Security Administrator | human | Authorised user who allocates functions to users |
| `access_verifier` | Access Verifier | human | Authorised user who verifies (signs off) granted access before activation |
| `back_office_user` | Back-Office User | human | End user whose access is being granted, modified, or revoked |
| `back_office_system` | Back-Office System | system | Host system that enforces per-function security checks at runtime |
| `exchange_operator` | Exchange Operator | external | Central operator that creates new users and defines function codes |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes | User ID |  |
| `operator_id` | text | Yes | Operator ID |  |
| `user_name` | text | Yes | User Name |  |
| `broker_alpha` | text | Yes | Broker Alpha Code |  |
| `branch_code` | text | No | Branch Code |  |
| `function_code` | text | Yes | Function Code |  |
| `generic_code` | text | No | Generic Code |  |
| `broker_option` | select | Yes | Broker Option |  |
| `update_option` | select | Yes | Update Option |  |
| `access_level` | select | Yes | Security Access Level |  |
| `branch_data_option` | select | No | Branch Data Option |  |
| `action_code` | select | Yes | Action Code |  |
| `access_status` | select | Yes | Access Status |  |
| `deactivated_date` | date | No | Deactivated Date |  |
| `function_description` | text | No | Function Description |  |
| `verifier_role` | select | No | Verifier Role |  |
| `requested_by` | text | No | Requested By User |  |
| `requested_at` | datetime | No | Request Timestamp |  |
| `verified_by` | text | No | Verified By User |  |
| `verified_at` | datetime | No | Verification Timestamp |  |
| `change_reason` | text | No | Change Reason |  |

## States

**State field:** `access_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `unverified` |  |  |
| `granted` |  |  |
| `deactivated` |  |  |
| `revoked` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `unverified` | security_administrator |  |
|  | `unverified` | `granted` | access_verifier |  |
|  | `granted` | `deactivated` | security_administrator |  |
|  | `deactivated` | `unverified` | security_administrator |  |
|  | `granted` | `revoked` | security_administrator |  |

## Rules

- **access_control:**
  - **function_level_security:** Every screen/function has a unique security code checked at invocation
  - **view_vs_update:** Access is granted at either enquiry (E) or update (U) level, where update implies enquiry
  - **screen_level_enforcement:** Resource-access-control-facility enforces permission check before screen is rendered or action processed
  - **deactivation_blocks_access:** A deactivated access prevents any use of the function until reactivated and verified
- **segregation_of_duties:**
  - **dual_control_verification:** A granted access is not usable until verified by a second authorised user
  - **self_verification_prohibited:** Loader and verifier may differ; verifier must hold dedicated verification role (branch, broker, or exchange-level)
  - **broker_scope_restriction:** A broker user may only grant access to users whose ID begins with the broker alpha code
- **role_model:**
  - **verification_roles:** Three verification scopes: branch verifier, broker verifier, exchange-wide verifier
  - **function_grant_scope:** Broker users may only grant functions where broker option allows enquiry or update
  - **special_security_codes:** Certain functions use combination security codes and special characters (e.g. portfolio advisor data-access codes)
- **audit:**
  - **full_audit_trail:** All access changes are logged with user, timestamp, action, old/new status, retained at least 36 months
  - **change_reason_required:** Deactivation and revocation require a documented change reason
  - **enquiry_logging:** Access enquiries by user ID or by function code are logged for compliance review
- **compliance:**
  - **popia_alignment:** Access records may contain staff personal information; POPIA lawful-basis and data-minimisation apply
  - **least_privilege:** Default posture is no access; privileges granted explicitly per function

## Outcomes

### Grant_new_function_access (Priority: 1) | Transaction: atomic

_Security administrator allocates a new function to a user, marked unverified pending sign-off_

**Given:**
- `action_code` (input) eq `N`
- `user_id` (db) exists
- `function_code` (db) exists

**Then:**
- **create_record**
- **set_field** target: `access_status` value: `UNVER`
- **emit_event** event: `user_access.requested`

### Reject_broker_scope_violation (Priority: 2) — Error: `ACCESS_BROKER_SCOPE_VIOLATION`

_Broker administrator attempts to grant access to a user outside their broker alpha_

**Given:**
- `granting_user_type` (session) eq `broker`
- `user_id_prefix` (input) neq `broker_alpha`

**Then:**
- **emit_event** event: `user_access.denied`

### Verify_and_activate_access (Priority: 3) | Transaction: atomic

_Authorised verifier signs off unverified access, making it usable_

**Given:**
- `action_code` (input) eq `V`
- `access_status` (db) eq `UNVER`
- `verifier_role` (session) in `BRNVR,BRKVR,JSEVR`

**Then:**
- **transition_state** field: `access_status` from: `UNVER` to: `ACTIVE`
- **set_field** target: `verified_at` value: `now`
- **emit_event** event: `user_access.verified`
- **emit_event** event: `user_access.granted`

### Reject_unauthorised_verifier (Priority: 4) — Error: `ACCESS_SELF_VERIFICATION_FORBIDDEN`

_User without a verification role attempts to verify access_

**Given:**
- `action_code` (input) eq `V`
- `verifier_role` (session) not_in `BRNVR,BRKVR,JSEVR`

**Then:**
- **emit_event** event: `user_access.denied`

### Deactivate_access (Priority: 5) | Transaction: atomic

_Administrator deactivates an active access while retaining history_

**Given:**
- `action_code` (input) eq `D`
- `access_status` (db) eq `ACTIVE`

**Then:**
- **transition_state** field: `access_status` from: `ACTIVE` to: `DEACT`
- **set_field** target: `deactivated_date` value: `today`
- **emit_event** event: `user_access.deactivated`

### Reactivate_access (Priority: 6) | Transaction: atomic

_Administrator reactivates a previously deactivated access, requiring re-verification_

**Given:**
- `action_code` (input) eq `R`
- `access_status` (db) eq `DEACT`

**Then:**
- **transition_state** field: `access_status` from: `DEACT` to: `UNVER`
- **emit_event** event: `user_access.reactivated`

### Reject_update_on_enquiry_only_function (Priority: 7) — Error: `ACCESS_UPDATE_NOT_PERMITTED`

_Update-level access requested against a function defined as enquiry-only_

**Given:**
- `update_option` (db) eq `E`
- `access_level` (input) eq `U`

**Then:**
- **emit_event** event: `user_access.denied`

### Runtime_function_invocation_check (Priority: 8)

_Runtime check when user attempts to invoke a function; access granted only when status is ACTIVE and level matches_

**Given:**
- `access_status` (db) eq `ACTIVE`
- `access_level` (db) gte `required_level`

**Then:**
- **call_service** target: `function_dispatcher`
- **emit_event** event: `user_access.enquiry`

### Enquire_access_by_user_or_function (Priority: 9)

_Authorised administrator lists all functions for a user or all users for a function_

**Given:**
- `query_type` (input) in `by_user,by_function`

**Then:**
- **call_service** target: `access_enquiry_service`
- **emit_event** event: `user_access.enquiry`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACCESS_USER_INVALID` | 400 | User ID is not recognised, please verify via user enquiry screen | No |
| `ACCESS_UNAUTHORISED_GRANTOR` | 403 | You are not authorised to grant access to this function | No |
| `ACCESS_BROKER_SCOPE_VIOLATION` | 403 | Broker users may only grant access to users within their own broker alpha | No |
| `ACCESS_UPDATE_NOT_PERMITTED` | 403 | Update access is not permitted for this function, enquiry only | No |
| `ACCESS_VERIFICATION_REQUIRED` | 409 | Access must be verified by a second authorised user before it can be used | No |
| `ACCESS_SELF_VERIFICATION_FORBIDDEN` | 403 | Verifier must hold a dedicated verification role | No |
| `ACCESS_INVALID_STATE_TRANSITION` | 409 | The requested action is not valid from the current access status | No |
| `ACCESS_FUNCTION_NOT_FOUND` | 404 | Function code is not defined in the security codes register | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `user_access.requested` |  | `user_id`, `function_code`, `access_level`, `requested_by`, `timestamp` |
| `user_access.granted` |  | `user_id`, `function_code`, `access_level`, `verified_by`, `timestamp` |
| `user_access.verified` |  | `user_id`, `function_code`, `verified_by`, `timestamp` |
| `user_access.deactivated` |  | `user_id`, `function_code`, `deactivated_by`, `change_reason`, `timestamp` |
| `user_access.reactivated` |  | `user_id`, `function_code`, `reactivated_by`, `timestamp` |
| `user_access.revoked` |  | `user_id`, `function_code`, `revoked_by`, `change_reason`, `timestamp` |
| `user_access.denied` |  | `user_id`, `function_code`, `reason`, `timestamp` |
| `user_access.enquiry` |  | `query_type`, `query_value`, `queried_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required |  |
| broker-client-account-maintenance | recommended |  |
| login | recommended |  |
| password-reset | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker User Access

User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and audit trail of access changes

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| grant_new_function_access | `autonomous` | - | - |
| reject_broker_scope_violation | `supervised` | - | - |
| verify_and_activate_access | `autonomous` | - | - |
| reject_unauthorised_verifier | `supervised` | - | - |
| deactivate_access | `autonomous` | - | - |
| reactivate_access | `autonomous` | - | - |
| reject_update_on_enquiry_only_function | `supervised` | - | - |
| runtime_function_invocation_check | `autonomous` | - | - |
| enquire_access_by_user_or_function | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  SECCD: Security codes maintenance (function code register, enquiry for members)
  SECUS: User maintenance enquiry (user ID and operator ID lookup)
  SECFN: Function allocation and verification
  SECIU: Function enquiry by user ID
  SECIF: Function enquiry by function code
verification_roles:
  BRNVR: Branch-scope access verifier
  BRKVR: Broker-scope access verifier
  JSEVR: Exchange-wide access verifier (central operator use only)
action_codes:
  N: New authorisation
  C: Change of authorisation
  D: Deactivate authorisation
  R: Reactivate authorisation
  V: Verify authorisation
access_levels:
  E: Enquiry only
  U: Update and enquiry
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker User Access Blueprint",
  "description": "User access management for back-office systems with screen-level and function-level security, role-based view/update permissions, dual-control verification, and",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, user-access, rbac, access-control, security, audit, segregation-of-duties"
}
</script>
