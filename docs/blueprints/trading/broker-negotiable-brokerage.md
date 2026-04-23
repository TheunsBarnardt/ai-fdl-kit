---
title: "Broker Negotiable Brokerage Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokera"
---

# Broker Negotiable Brokerage Blueprint

> Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokerage scale tables keyed by instrument...

| | |
|---|---|
| **Feature** | `broker-negotiable-brokerage` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, brokerage, commission, rate-schedule, contract-note, pricing, trading |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-negotiable-brokerage.blueprint.yaml) |
| **JSON API** | [broker-negotiable-brokerage.json]({{ site.baseurl }}/api/blueprints/trading/broker-negotiable-brokerage.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `rate_administrator` | Rate Administrator | human | Loads and maintains brokerage scale tables |
| `account_supervisor` | Account Supervisor | human | Approves negotiated rates before activation |
| `compliance_officer` | Compliance Officer | human |  |
| `contract_note_engine` | Contract Note Engine | system | Applies the negotiated scale to trades at confirmation time |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scale_code` | text | Yes | Negotiated Brokerage Scale Code |  |
| `charge_structure_code` | text | Yes | Charge Structure Code |  |
| `charge_structure_description` | text | No | Charge Structure Description |  |
| `rate_type` | select | Yes | Percentage or Cents Indicator |  |
| `from_date` | date | Yes | Effective From Date |  |
| `to_date` | date | No | Expiry Date |  |
| `basic_charge` | number | No | Basic Charge |  |
| `scale_start` | number | Yes | Scale Lower Limit |  |
| `scale_end` | number | Yes | Scale Upper Limit |  |
| `commission_amount` | number | No | Commission Rate or Cents Per Share |  |
| `minimum_rand_amount` | number | No | Minimum Charge Amount |  |
| `rate_status` | select | Yes | Rate Lifecycle Status |  |
| `deactivated_flag` | boolean | No | Deactivated Flag |  |
| `client_account_code` | text | No | Client Account Code |  |
| `assigned_scale_code` | text | No | Client Assigned Scale Code |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `relationship_code` | text | No | Relationship Code |  |
| `approved_by` | text | No | Approver Identifier |  |
| `approved_at` | datetime | No | Approval Timestamp |  |
| `contract_note_override_rate` | number | No | Contract Note Override Rate |  |
| `override_reason` | text | No | Override Reason |  |

## States

**State field:** `rate_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `proposed` | Yes |  |
| `approved` |  |  |
| `active` |  |  |
| `archived` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `proposed` | `approved` | account_supervisor |  |
|  | `approved` | `active` | back_office_system |  |
|  | `active` | `archived` | rate_administrator |  |
|  | `proposed` | `archived` | rate_administrator |  |

## Rules

- **data_integrity:**
  - **scale_code_format:** Scale code is up to 3 alphanumeric characters, unique per broker
  - **complete_structure_coverage:** A scale must define an entry for every charge structure code to guarantee a rate exists for any instrument traded
  - **sliding_scale_terminator:** The final band in a sliding scale must terminate at a configured maximum ceiling (e.g. <id-number>.99)
  - **effective_date_future:** from_date must be greater than or equal to the system process date
  - **non_overlapping_bands:** Scale bands for a given scale_code and charge_structure_code must not overlap; scale_start of band N+1 must exceed scale_end of band N
  - **decimal_precision:** Commission rate carries up to 4 decimal places; basic_charge and minimum_rand_amount carry 2 decimal places
- **security:**
  - **rate_change_authorization:** New rate or rate change requires rate_administrator role
  - **segregation_of_duties:** Loader and approver must be different users
  - **bulk_assignment_window:** Bulk assignment to client accounts may only run after end-of-trading cut-off
  - **audit_trail:** All rate table and client assignment changes logged with user, timestamp, old and new values
- **compliance:**
  - **disclosure_on_contract_note:** Negotiated commission and basic charge must be itemised on the client contract note
  - **fair_treatment_of_customers:** Rate assignments documented in client mandate; no discriminatory pricing without mandate justification
  - **popia_personal_pricing:** Per-client rate records are personal information and must comply with POPIA lawful-basis and retention rules
- **business:**
  - **rate_calculation_types:** Rate type P applies a percentage to trade consideration; rate type C applies cents per share to traded volume
  - **minimum_charge_fallback:** Where minimum_rand_amount is configured, the calculated commission is the greater of computed commission and the minimum charge
  - **default_scale_fallback:** If a client has no assigned_scale_code, the default broker scale is used
  - **supersession_by_future_date:** Loading a new rate with a future from_date against the same scale_code and charge_structure_code auto-deactivates the prior rate on that date
  - **per_client_override:** Client assigned_scale_code overrides the default scale for all charge structures unless a specific contract note override is recorded
  - **contract_note_override:** A one-off contract-note override may be recorded with reason; overrides are logged and require supervisor approval
  - **bulk_assignment_scope:** Bulk assignment can target a branch, a branch-plus-partner combination, or an account-plus-relationship-code combination
  - **reduced_rate_instruments:** Specific instrument charge structures (e.g. alternative exchange equities) may carry a reduced rate via a dedicated scale entry

## Outcomes

### Propose_new_negotiable_scale (Priority: 1) | Transaction: atomic

_Rate administrator proposes a new negotiable brokerage scale entry_

**Given:**
- `user_role` (session) eq `rate_administrator`
- `scale_code` (input) exists
- `charge_structure_code` (input) exists
- `from_date` (input) gte `today`

**Then:**
- **create_record** target: `brokerage_scale`
- **set_field** target: `rate_status` value: `proposed`
- **emit_event** event: `rate.scale.proposed`

### Reject_past_dated_rate (Priority: 2) — Error: `RATE_INVALID_DATE`

_Reject a rate whose effective date is in the past_

**Given:**
- `from_date` (input) lt `today`

**Then:**
- **emit_event** event: `rate.scale.proposed`

### Reject_overlapping_bands (Priority: 3) — Error: `RATE_BANDS_OVERLAP`

_Reject scales whose bands overlap or leave gaps_

**Given:**
- `bands_contiguous` (computed) eq `false`

**Then:**
- **emit_event** event: `rate.scale.proposed`

### Approve_negotiable_scale (Priority: 4) | Transaction: atomic

_Supervisor approves a proposed scale, distinct from the loader_

**Given:**
- `user_role` (session) eq `account_supervisor`
- `rate_status` (db) eq `proposed`
- `approver_is_loader` (computed) eq `false`

**Then:**
- **transition_state** field: `rate_status` from: `proposed` to: `approved`
- **set_field** target: `approved_by` value: `current_user`
- **set_field** target: `approved_at` value: `now`
- **emit_event** event: `rate.scale.approved`

### Activate_on_effective_date (Priority: 5) | Transaction: atomic

_System activates an approved scale when its effective date is reached and archives the prior scale for the same key_

**Given:**
- `rate_status` (db) eq `approved`
- `from_date` (db) lte `today`

**Then:**
- **transition_state** field: `rate_status` from: `approved` to: `active`
- **emit_event** event: `rate.scale.activated`
- **emit_event** event: `rate.scale.superseded`

### Assign_scale_to_client (Priority: 6)

_Assign a negotiated scale code to a single client account_

**Given:**
- `client_account_code` (input) exists
- `assigned_scale_code` (input) exists

**Then:**
- **set_field** target: `assigned_scale_code` value: `input_value`
- **emit_event** event: `rate.client.assigned`

### Bulk_assign_scale (Priority: 7) | Transaction: atomic

_Bulk assignment of a scale code across a branch, partner, or related account set after end-of-trading cut-off_

**Given:**
- `scale_code` (input) exists
- ANY: `branch_code` (input) exists OR `relationship_code` (input) exists
- `end_of_trading_cutoff_passed` (system) eq `true`

**Then:**
- **call_service** target: `bulk_client_scale_update`
- **emit_event** event: `rate.client.bulk_assigned`

### Reject_bulk_assignment_in_trading_window (Priority: 8) — Error: `RATE_ASSIGNMENT_WINDOW`

_Block bulk assignment during the live trading window_

**Given:**
- `end_of_trading_cutoff_passed` (system) eq `false`

**Then:**
- **emit_event** event: `rate.client.bulk_assigned`

### Apply_contract_note_override (Priority: 9)

_Apply a one-off negotiated rate override to a specific contract note with documented reason and supervisor approval_

**Given:**
- `contract_note_override_rate` (input) exists
- `override_reason` (input) exists
- `approved_by` (input) exists

**Then:**
- **set_field** target: `contract_note_override_rate` value: `input_value`
- **emit_event** event: `rate.contract_note.override_applied`

### Reject_unjustified_override (Priority: 10) — Error: `RATE_OVERRIDE_UNJUSTIFIED`

_Reject contract note overrides lacking reason or approver_

**Given:**
- ANY: `override_reason` (input) not_exists OR `approved_by` (input) not_exists

**Then:**
- **emit_event** event: `rate.contract_note.override_applied`

### Apply_minimum_charge (Priority: 11)

_Contract note engine substitutes minimum charge when computed commission falls below configured minimum_

**Given:**
- `computed_commission` (computed) lt `minimum_rand_amount`

**Then:**
- **set_field** target: `commission_amount` value: `minimum_rand_amount`
- **emit_event** event: `rate.minimum.applied`

### Archive_superseded_scale (Priority: 12) | Transaction: atomic

_Archive a scale when a newer scale with later effective date activates_

**Given:**
- `rate_status` (db) eq `active`
- `superseded` (computed) eq `true`

**Then:**
- **transition_state** field: `rate_status` from: `active` to: `archived`
- **set_field** target: `deactivated_flag` value: `true`
- **emit_event** event: `rate.scale.archived`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RATE_SCALE_DUPLICATE` | 409 | Scale code already exists for this charge structure and effective date | No |
| `RATE_INVALID_DATE` | 400 | Effective date must be today or in the future | No |
| `RATE_BANDS_OVERLAP` | 422 | Scale bands overlap or leave gaps; bands must be contiguous and non-overlapping | No |
| `RATE_STRUCTURE_INCOMPLETE` | 422 | Scale must cover every required charge structure code | No |
| `RATE_UNAUTHORIZED` | 403 | Only a rate administrator may load or change negotiated scales | No |
| `RATE_APPROVAL_REQUIRED` | 409 | Rate cannot activate without supervisor approval | No |
| `RATE_ASSIGNMENT_WINDOW` | 409 | Bulk assignment may only run after end-of-trading cut-off | No |
| `RATE_OVERRIDE_UNJUSTIFIED` | 422 | Contract note override requires a documented reason and supervisor approval | No |
| `RATE_CLIENT_NOT_FOUND` | 404 | Client account does not exist for scale assignment | No |
| `RATE_MINIMUM_VIOLATION` | 422 | Computed commission is below the configured minimum charge | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rate.scale.proposed` |  | `scale_code`, `charge_structure_code`, `from_date`, `proposed_by`, `timestamp` |
| `rate.scale.approved` |  | `scale_code`, `charge_structure_code`, `approved_by`, `timestamp` |
| `rate.scale.activated` |  | `scale_code`, `charge_structure_code`, `from_date`, `timestamp` |
| `rate.scale.archived` |  | `scale_code`, `charge_structure_code`, `archived_by`, `timestamp` |
| `rate.scale.superseded` |  | `scale_code`, `charge_structure_code`, `new_from_date`, `timestamp` |
| `rate.client.assigned` |  | `client_account_code`, `assigned_scale_code`, `assigned_by`, `timestamp` |
| `rate.client.bulk_assigned` |  | `scale_code`, `branch_code`, `partner_code`, `account_code`, `relationship_code`, `count`, `assigned_by`, `timestamp` |
| `rate.contract_note.override_applied` |  | `client_account_code`, `trade_reference`, `override_rate`, `override_reason`, `approved_by`, `timestamp` |
| `rate.minimum.applied` |  | `client_account_code`, `trade_reference`, `computed_commission`, `minimum_rand_amount`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-client-data-upload | recommended |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Negotiable Brokerage

Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokerage scale tables keyed by instrument...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

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
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| propose_new_negotiable_scale | `autonomous` | - | - |
| reject_past_dated_rate | `supervised` | - | - |
| reject_overlapping_bands | `supervised` | - | - |
| approve_negotiable_scale | `supervised` | - | - |
| activate_on_effective_date | `autonomous` | - | - |
| assign_scale_to_client | `autonomous` | - | - |
| bulk_assign_scale | `autonomous` | - | - |
| reject_bulk_assignment_in_trading_window | `supervised` | - | - |
| apply_contract_note_override | `supervised` | - | - |
| reject_unjustified_override | `supervised` | - | - |
| apply_minimum_charge | `autonomous` | - | - |
| archive_superseded_scale | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  CHARGE_STRUCTURE_TABLE: Charge structure code master table covering all tradeable instrument classes
  BROKERAGE_SCALE_TABLE: Brokerage scale table keyed by scale_code and
    charge_structure_code with banded rates
  CLIENT_MAINTENANCE: Assigns a negotiated scale code to an individual client account
  BULK_SCALE_ASSIGNMENT: Bulk applies a scale code to many client accounts by
    branch, partner, or relationship code
  SCALE_ENQUIRY: Lists all client accounts currently assigned to a given negotiable scale code
rate_functions:
  N: New - load new negotiated scale
  C: Change - change existing negotiated scale
  M: Model - clone an existing scale as the basis for a new entry
  D: Deactivate - deactivate existing scale
  ENQUIRE: Enquire into an existing negotiated scale
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Negotiable Brokerage Blueprint",
  "description": "Negotiable brokerage configuration covering custom commission rate schedules, per-client rate assignments, contract-note overrides, minimum charges, and brokera",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, brokerage, commission, rate-schedule, contract-note, pricing, trading"
}
</script>
