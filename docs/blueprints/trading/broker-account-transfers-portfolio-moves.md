---
title: "Broker Account Transfers Portfolio Moves Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination v"
---

# Broker Account Transfers Portfolio Moves Blueprint

> Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination validation, supervisor approval, and...

| | |
|---|---|
| **Feature** | `broker-account-transfers-portfolio-moves` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, account-transfer, portfolio-move, settlement, dematerialised, csdp, equities |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-account-transfers-portfolio-moves.blueprint.yaml) |
| **JSON API** | [broker-account-transfers-portfolio-moves.json]({{ site.baseurl }}/api/blueprints/trading/broker-account-transfers-portfolio-moves.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human | Initiates and captures transfer or portfolio move instructions |
| `transfer_supervisor` | Transfer Supervisor | human | Approves delivering and receiving legs of a transfer |
| `back_office_system` | Back-Office System | system | Executes bookkeeping entries and position updates |
| `central_securities_depository` | Central Securities Depository | external | External registry that coordinates the registered-securities leg via settlement messages |
| `counterparty_broker` | Counterparty Broker | external | Receiving or delivering broker in an external transfer |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `transfer_reference` | text | Yes | Transfer Reference |  |
| `transfer_type` | select | Yes | Transfer Type |  |
| `transaction_code` | text | Yes | Transaction Code |  |
| `source_account_code` | text | Yes | Source Account Code |  |
| `destination_account_code` | text | Yes | Destination Account Code |  |
| `source_member_code` | text | Yes | Source Member Code |  |
| `destination_member_code` | text | Yes | Destination Member Code |  |
| `instrument_code` | text | No | Instrument Code |  |
| `quantity` | number | No | Quantity to Transfer |  |
| `available_holding` | number | No | Available Holding |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `transfer_reason` | select | Yes | Transfer Reason |  |
| `change_of_beneficial_owner` | boolean | Yes | Change of Beneficial Owner |  |
| `controlled_source_flag` | boolean | Yes | Source Is Controlled Account |  |
| `controlled_destination_flag` | boolean | Yes | Destination Is Controlled Account |  |
| `non_resident_flag` | boolean | No | Non-Resident Client |  |
| `portfolio_selection_mode` | select | No | Portfolio Selection Mode |  |
| `linkage_key` | text | No | Branch/Partner/Advisor Linkage Key |  |
| `swift_message_reference` | text | No | Settlement Message Reference |  |
| `csd_commit_reference` | text | No | Central Securities Depository Commit Reference |  |
| `transfer_status` | select | Yes | Transfer Status |  |
| `approval_notes` | rich_text | No | Approval Notes |  |
| `created_by` | text | Yes | Created By |  |
| `approved_by` | text | No | Approved By |  |

## States

**State field:** `transfer_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `approved` |  |  |
| `executed` |  |  |
| `settled` |  | Yes |
| `rejected` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `approved` | transfer_supervisor |  |
|  | `requested` | `rejected` | transfer_supervisor |  |
|  | `approved` | `executed` | back_office_system |  |
|  | `executed` | `settled` | central_securities_depository |  |
|  | `requested` | `cancelled` | broker_operator |  |
|  | `approved` | `cancelled` | transfer_supervisor |  |

## Rules

- **data_integrity:**
  - **holding_sufficiency:** Transfer quantity must not exceed available holding on source account for the chosen instrument
  - **settlement_date_floor:** Default settlement date is T+1, may be set to same-day or a future date but never a past date
  - **unique_reference:** Transfer reference must be unique within the broker firm
  - **paired_legs:** External transfers require matching delivery and receipt legs with identical quantity, instrument, and settlement date
  - **scope_equities_only:** Functionality restricted to dematerialised listed equities; other instrument classes are rejected
- **security:**
  - **screen_level_access:** Selection, delivery, receipt, and enquiry screens each have distinct access codes for segregation of duties
  - **segregation_of_duties:** Operator who captures a transfer cannot approve it; a supervisor role is required
  - **field_level_auth:** Settlement date and quantity are edit-restricted once a leg is approved
- **compliance:**
  - **change_of_beneficial_owner_flag:** Every transfer must declare whether beneficial ownership changes, for tax and regulatory reporting
  - **non_resident_segregation:** Non-resident controlled client holdings must remain in non-resident pools; mixing with resident balances is forbidden
  - **non_controlled_destination:** Moves from controlled to non-controlled accounts remove the holding from the controlled balance without re-creating it on the non-controlled side
  - **popia_consent:** Personal information displayed on transfer screens is subject to POPIA lawful-basis checks
  - **audit_trail:** All state transitions, approvals, and message exchanges are logged with user, timestamp, and before/after values for at least 36 months
- **business:**
  - **transaction_codes:** Each transfer type uses a distinct transaction code for downstream identification and reporting
  - **internal_vs_external:** Internal transfers stay within one broker; external transfers pair with a counterparty broker
  - **portfolio_scope:** Portfolio moves transfer all qualifying listed-equity holdings across one or many client accounts in a single instruction
  - **portfolio_selection:** Accounts may be selected by branch, partner, or advisor linkage, or from an explicit account list
  - **csd_coordination:** Registered-securities leg is coordinated with the central securities depository via standard settlement messages
  - **dissemination:** Transfer confirmations are disseminated to clients via configured contract-note channels

## Outcomes

### Request_internal_transfer (Priority: 1) | Transaction: atomic

_Operator captures an internal account-to-account transfer within the same broker_

**Given:**
- `transfer_type` (input) eq `internal`
- `source_member_code` (input) eq `destination_member_code`
- `quantity` (input) lte `available_holding`

**Then:**
- **create_record**
- **set_field** target: `transfer_status` value: `requested`
- **emit_event** event: `transfer.requested`

### Reject_insufficient_holding (Priority: 2) — Error: `TRANSFER_INSUFFICIENT_HOLDING`

_Prevent transfer when source holding is smaller than requested quantity_

**Given:**
- `quantity` (input) gt `available_holding`

**Then:**
- **emit_event** event: `transfer.rejected`

### Reject_past_settlement_date (Priority: 3) — Error: `TRANSFER_SETTLEMENT_DATE_INVALID`

_Block instructions with a settlement date in the past_

**Given:**
- `settlement_date` (input) lt `today`

**Then:**
- **emit_event** event: `transfer.rejected`

### Approve_transfer (Priority: 4) | Transaction: atomic

_Supervisor approves a requested delivery or receipt leg_

**Given:**
- `user_role` (session) eq `transfer_supervisor`
- `transfer_status` (db) eq `requested`
- `created_by` (db) neq `current_user`

**Then:**
- **transition_state** field: `transfer_status` from: `requested` to: `approved`
- **set_field** target: `approved_by` value: `current_user`
- **emit_event** event: `transfer.approved`

### Block_self_approval (Priority: 5) — Error: `TRANSFER_SELF_APPROVAL_BLOCKED`

_Prevent the capturing operator from approving their own transfer_

**Given:**
- `created_by` (db) eq `current_user`

**Then:**
- **emit_event** event: `transfer.rejected`

### Execute_approved_transfer (Priority: 6) | Transaction: atomic

_Back-office system posts book entries and dispatches settlement message to the central securities depository_

**Given:**
- `transfer_status` (db) eq `approved`

**Then:**
- **call_service** target: `csd_settlement_gateway`
- **transition_state** field: `transfer_status` from: `approved` to: `executed`
- **emit_event** event: `transfer.executed`

### Settle_on_csd_confirmation (Priority: 7) | Transaction: atomic

_Mark transfer settled when the central securities depository confirms the registered leg_

**Given:**
- `transfer_status` (db) eq `executed`
- `swift_message_reference` (input) exists

**Then:**
- **transition_state** field: `transfer_status` from: `executed` to: `settled`
- **emit_event** event: `transfer.settled`

### Request_portfolio_move_by_linkage (Priority: 8) | Transaction: atomic

_Operator selects a set of client accounts by branch, partner, or advisor linkage and initiates a bulk portfolio move_

**Given:**
- `transfer_type` (input) eq `portfolio_move`
- `portfolio_selection_mode` (input) in `branch,partner,advisor,account_list`
- `linkage_key` (input) exists

**Then:**
- **create_record**
- **set_field** target: `transfer_status` value: `requested`
- **emit_event** event: `portfolio_move.requested`

### Reject_non_equity_instrument (Priority: 9) — Error: `TRANSFER_INVALID_INSTRUMENT`

_Reject transfers of anything other than dematerialised listed equities_

**Given:**
- `instrument_code` (db) not_in `listed_equity_dematerialised`

**Then:**
- **emit_event** event: `transfer.rejected`

### Handle_csd_rejection (Priority: 10) — Error: `TRANSFER_CSD_REJECT` | Transaction: atomic

_Roll back execution when the central securities depository rejects the settlement message_

**Given:**
- `csd_response_code` (input) eq `rejected`

**Then:**
- **transition_state** field: `transfer_status` from: `executed` to: `rejected`
- **emit_event** event: `transfer.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRANSFER_INSUFFICIENT_HOLDING` | 409 | Source account does not hold the requested quantity | No |
| `TRANSFER_INVALID_ACCOUNT` | 400 | Source or destination account code is unknown or inactive | No |
| `TRANSFER_INVALID_INSTRUMENT` | 400 | Instrument is not a dematerialised listed equity | No |
| `TRANSFER_SETTLEMENT_DATE_INVALID` | 400 | Settlement date must be today or in the future | No |
| `TRANSFER_DUPLICATE_REFERENCE` | 409 | Transfer reference already exists for this broker | No |
| `TRANSFER_APPROVAL_FORBIDDEN` | 403 | Only a supervisor role may approve a transfer | No |
| `TRANSFER_SELF_APPROVAL_BLOCKED` | 403 | Transfer creator may not approve their own instruction | No |
| `TRANSFER_NON_RESIDENT_VIOLATION` | 422 | Non-resident holdings cannot be mixed with resident balances | No |
| `TRANSFER_CSD_REJECT` | 503 | Central securities depository rejected the settlement message | No |
| `TRANSFER_STATE_INVALID` | 409 | Requested state transition is not allowed from current status | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `transfer.requested` |  | `transfer_reference`, `transfer_type`, `source_account_code`, `destination_account_code`, `quantity`, `created_by`, `timestamp` |
| `transfer.approved` |  | `transfer_reference`, `approved_by`, `timestamp` |
| `transfer.rejected` |  | `transfer_reference`, `rejected_by`, `reason`, `timestamp` |
| `transfer.executed` |  | `transfer_reference`, `executed_by`, `csd_commit_reference`, `timestamp` |
| `transfer.settled` |  | `transfer_reference`, `swift_message_reference`, `settled_at` |
| `transfer.cancelled` |  | `transfer_reference`, `cancelled_by`, `timestamp` |
| `portfolio_move.requested` |  | `transfer_reference`, `source_accounts`, `destination_accounts`, `linkage_key`, `created_by`, `timestamp` |
| `portfolio_move.executed` |  | `transfer_reference`, `instrument_count`, `executed_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Account Transfers Portfolio Moves

Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination validation, supervisor approval, and...

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
| request_internal_transfer | `autonomous` | - | - |
| reject_insufficient_holding | `supervised` | - | - |
| reject_past_settlement_date | `supervised` | - | - |
| approve_transfer | `supervised` | - | - |
| block_self_approval | `human_required` | - | - |
| execute_approved_transfer | `supervised` | - | - |
| settle_on_csd_confirmation | `autonomous` | - | - |
| request_portfolio_move_by_linkage | `autonomous` | - | - |
| reject_non_equity_instrument | `supervised` | - | - |
| handle_csd_rejection | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  ATSEL: Account Transfer Select
  ATDLV: Account Transfer Delivery
  ATREC: Account Transfer Receipt
  ATENQ: Account Transfer Enquiry
  ATDET: Account Transfer Detail
  PMSEL: Portfolio Move Selection
  PMDLV: Portfolio Move Delivery
  PMREC: Portfolio Move Receipt
  PMENQ: Portfolio Move Enquiry
  PMDET: Portfolio Move Detail
notes:
  scope: Dematerialised listed equities only
  default_settlement: T+1, adjustable to same-day or future date
  csd_messaging: Standard settlement messages coordinate the registered-securities leg
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Account Transfers Portfolio Moves Blueprint",
  "description": "Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination v",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, account-transfer, portfolio-move, settlement, dematerialised, csdp, equities"
}
</script>
