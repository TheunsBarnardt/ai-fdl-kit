---
title: "Broker Client Pledge Equities Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Client pledge of electronically settled listed equities on controlled broker accounts, covering pledgee setup, pledge deposit and withdrawal, CSD reporting, and"
---

# Broker Client Pledge Equities Blueprint

> Client pledge of electronically settled listed equities on controlled broker accounts, covering pledgee setup, pledge deposit and withdrawal, CSD reporting, and corporate action treatment

| | |
|---|---|
| **Feature** | `broker-client-pledge-equities` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, pledge, collateral, equities, csd, corporate-actions, segregation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-client-pledge-equities.blueprint.yaml) |
| **JSON API** | [broker-client-pledge-equities.json]({{ site.baseurl }}/api/blueprints/trading/broker-client-pledge-equities.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pledgor` | Client (Pledgor) | human | Beneficial owner of the equities whose holdings are pledged as security |
| `pledgee` | Pledgee (Bank or Counterparty) | external | Party to whom the equities are pledged, typically a bank |
| `broker_operator` | Broker Back-Office Operator | human | Captures pledge deposit and withdrawal transactions on behalf of the client |
| `broker_supervisor` | Broker Supervisor | human | Authorises pledge movements and advice-note release |
| `central_securities_depository` | Central Securities Depository Participant | external | Receives pledge movement and position reports from the broker |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_code` | text | Yes | Controlled Account Code |  |
| `account_name` | text | Yes | Account Name |  |
| `instrument_code` | text | Yes | Instrument Alpha Code |  |
| `instrument_name` | text | No | Instrument Short Name |  |
| `instrument_type` | select | Yes | Instrument Type |  |
| `isin` | text | No | ISIN |  |
| `available_quantity` | number | Yes | Available Quantity |  |
| `available_value` | number | No | Available Value |  |
| `pledge_quantity` | number | Yes | Pledge Quantity |  |
| `pledge_value` | number | No | Pledge Value |  |
| `withdraw_quantity` | number | No | Withdraw Quantity |  |
| `withdraw_value` | number | No | Withdraw Value |  |
| `reference_number` | text | Yes | Pledge Reference Number |  |
| `pledgee_bank_code` | text | No | Pledgee Bank Code |  |
| `pledgee_branch_number` | text | No | Pledgee Branch Number |  |
| `pledgee_name` | text | Yes | Pledgee Name |  |
| `pledgee_branch` | text | No | Pledgee Branch |  |
| `contact_name` | text | No | Pledgee Contact Name |  |
| `contact_number` | phone | No | Pledgee Contact Number |  |
| `reason` | text | No | Pledge or Withdrawal Reason |  |
| `transaction_type` | select | Yes | Transaction Type |  |
| `transaction_code` | select | Yes | Transaction Code |  |
| `transaction_date` | date | Yes | Transaction Date |  |
| `transaction_time` | datetime | No | Transaction Time |  |
| `user_code` | text | Yes | Capturing User Code |  |
| `amount_above` | number | No | Minimum Value Filter |  |
| `up_to_amount` | number | No | Target Pledge Amount |  |
| `pledge_status` | select | Yes | Pledge Status |  |
| `advice_note_printed` | boolean | No | Advice Note Printed Flag |  |
| `unsettled_sales_quantity` | number | No | Unsettled Sales Reducing Availability |  |
| `borrowing_collateral_quantity` | number | No | Outstanding Borrowing or Collateral |  |
| `already_pledged_quantity` | number | No | Already Pledged Quantity |  |

## States

**State field:** `pledge_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `requested` | Yes |  |
| `active` |  |  |
| `partially_released` |  |  |
| `released` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `requested` | `active` | broker_supervisor |  |
|  | `active` | `partially_released` | broker_operator |  |
|  | `partially_released` | `active` | broker_operator |  |
|  | `active` | `released` | broker_operator |  |
|  | `partially_released` | `released` | broker_operator |  |
|  | `requested` | `cancelled` | broker_supervisor |  |

## Rules

- **eligibility:**
  - **electronic_settlement_only:** Only electronically settled equities qualify; paper-settled or unlisted instruments must be pledged outside the system
  - **controlled_account_only:** Pledgor account must be a controlled client account of eligible account type
  - **availability_calculation:** Available quantity = holding minus unsettled sales minus borrowing or collateral minus already pledged
- **data_integrity:**
  - **pledge_quantity_cap:** Pledge quantity must not exceed available quantity for the instrument on the account
  - **reference_uniqueness:** Each confirmed pledge receives a system-generated unique reference number used for all subsequent withdrawals
  - **pledgee_identification:** Pledgee name is mandatory; bank code and branch optional but auto-populate pledgee name when provided
  - **reason_length:** Reason field supports up to fifty characters; any entry is recorded against the transaction
- **workflow:**
  - **confirmation_required:** No pledge or withdrawal is persisted until the update flag is explicitly confirmed by the operator
  - **global_update_exclusivity:** Global update (all extracted) and line-level quantity selection are mutually exclusive on a single capture
  - **withdrawal_by_reference:** Withdrawals must be matched against an existing pledge reference number and cannot exceed residual pledged quantity
- **segregation:**
  - **pledged_not_available_for_settlement:** Pledged holdings are excluded from availability calculations for sale settlement
  - **statement_disclosure:** Client statements must clearly reflect securities that are pledged versus unpledged
  - **portfolio_consolidation:** For valuation and beneficiary disclosure, pledged and unpledged holdings consolidate into a single holding line
- **corporate_actions:**
  - **action_on_client_account:** Corporate action processing occurs on the underlying client account, never on the pledgee
  - **no_pledgee_impact:** Pledgee entitlements are unaffected by corporate actions on pledged securities
- **reporting:**
  - **advice_note_on_confirmation:** A pledge advice note is generated and released to the pledgee immediately upon confirmation of a deposit or withdrawal
  - **csd_movement_report:** An intraday movement report of all pledge deposits and withdrawals is produced for submission to the broker CSD participant
  - **csd_position_report:** An intraday position report of all client pledge positions is produced for submission to the broker CSD participant
  - **audit_trail:** Every pledge transaction is queryable by account, instrument, date range, pledgee, branch, and reference number
- **security:**
  - **segregation_of_duties:** Pledge confirmation and advice-note release are restricted to supervisor role
  - **personal_data_protection:** Pledgor identifying data on advice notes must be handled per POPIA lawful basis requirements

## Outcomes

### Capture_pledge_deposit (Priority: 1) | Transaction: atomic

_Operator captures a pledge deposit of available listed equities against a pledgee_

**Given:**
- `account_type_eligible` (db) eq `true`
- `instrument_type` (input) eq `electronic_equity`
- `pledge_quantity` (input) lte `available_quantity`
- `pledgee_name` (input) exists

**Then:**
- **create_record**
- **set_field** target: `pledge_status` value: `requested`
- **emit_event** event: `pledge.requested`

### Confirm_pledge_and_issue_reference (Priority: 2) | Transaction: atomic

_Supervisor confirms the pledge, system allocates a reference number and generates an advice note_

**Given:**
- `user_role` (session) eq `broker_supervisor`
- `update_confirmed` (input) eq `true`

**Then:**
- **transition_state** field: `pledge_status` from: `requested` to: `active`
- **set_field** target: `reference_number` value: `system_generated`
- **emit_event** event: `pledge.confirmed`
- **emit_event** event: `pledge.advice_note_generated`

### Reject_pledge_exceeding_availability (Priority: 3) — Error: `PLEDGE_QUANTITY_EXCEEDS_AVAILABLE`

_Prevent pledge quantities that exceed availability after unsettled sales, borrowing, and existing pledges_

**Given:**
- `pledge_quantity` (input) gt `available_quantity`

**Then:**
- **emit_event** event: `pledge.requested`

### Reject_ineligible_instrument (Priority: 4) — Error: `PLEDGE_INSTRUMENT_NOT_ELIGIBLE`

_Block pledge attempts on instruments that are not electronically settled listed equities_

**Given:**
- `instrument_type` (input) neq `electronic_equity`

**Then:**
- **emit_event** event: `pledge.requested`

### Withdraw_pledge_by_reference (Priority: 5) | Transaction: atomic

_Operator withdraws all or part of a previously confirmed pledge against its reference number_

**Given:**
- `reference_number` (input) exists
- `withdraw_quantity` (input) lte `pledged_residual_quantity`
- `update_confirmed` (input) eq `true`

**Then:**
- **transition_state** field: `pledge_status` from: `active` to: `partially_released`
- **emit_event** event: `pledge.partially_released`
- **emit_event** event: `pledge.advice_note_generated`

### Release_pledge_fully (Priority: 6) | Transaction: atomic

_Full outstanding pledged quantity is withdrawn and the pledge reaches terminal released state_

**Given:**
- `withdraw_quantity` (input) eq `pledged_residual_quantity`

**Then:**
- **transition_state** field: `pledge_status` from: `active` to: `released`
- **emit_event** event: `pledge.released`
- **emit_event** event: `pledge.advice_note_generated`

### Report_movements_to_csd (Priority: 7)

_Intraday movement report of pledge deposits and withdrawals is produced for the broker CSD participant_

**Given:**
- `report_requested` (input) eq `pledge_movement`

**Then:**
- **call_service** target: `csd_movement_report_generator`
- **emit_event** event: `pledge.csd_movement_reported`

### Report_positions_to_csd (Priority: 8)

_Intraday position report of outstanding client pledges is produced for the broker CSD participant_

**Given:**
- `report_requested` (input) eq `pledge_position`

**Then:**
- **call_service** target: `csd_position_report_generator`
- **emit_event** event: `pledge.csd_position_reported`

### Process_corporate_action_on_client_account (Priority: 9)

_Corporate action on a pledged instrument is processed against the pledgor client account and does not affect the pledgee_

**Given:**
- `corporate_action_event` (system) exists
- `pledge_status` (db) eq `active`

**Then:**
- **call_service** target: `corporate_action_processor`
- **emit_event** event: `pledge.corporate_action_processed`

### Exclude_pledged_from_settlement_availability (Priority: 10)

_Pledged holdings are excluded from availability used by settlement and sale matching_

**Given:**
- `pledge_status` (db) in `active,partially_released`

**Then:**
- **set_field** target: `available_for_settlement` value: `false`
- **emit_event** event: `pledge.confirmed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PLEDGE_INSTRUMENT_NOT_ELIGIBLE` | 422 | Only electronically settled listed equities may be pledged through this function | No |
| `PLEDGE_ACCOUNT_INELIGIBLE` | 422 | Account is not a controlled client account of an eligible type | No |
| `PLEDGE_QUANTITY_EXCEEDS_AVAILABLE` | 409 | Pledge quantity exceeds available quantity after unsettled sales, borrowing, and existing pledges | No |
| `PLEDGE_REFERENCE_NOT_FOUND` | 404 | Pledge reference number does not exist for the specified account and instrument | No |
| `PLEDGE_WITHDRAW_EXCEEDS_PLEDGED` | 409 | Withdrawal quantity exceeds residual pledged quantity for this reference | No |
| `PLEDGE_NOT_CONFIRMED` | 400 | Pledge capture not confirmed; update flag must be set explicitly before persistence | No |
| `PLEDGE_PLEDGEE_NAME_REQUIRED` | 400 | Pledgee name is mandatory when the pledgee is not a registered bank | No |
| `PLEDGE_CONFLICTING_UPDATE` | 400 | Global update and per-line quantity selection cannot be used on the same capture | No |
| `PLEDGE_AUTHORISATION_REQUIRED` | 403 | Pledge confirmation requires a supervisor role | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pledge.requested` |  | `account_code`, `instrument_code`, `pledge_quantity`, `pledgee_name`, `requested_by`, `timestamp` |
| `pledge.confirmed` |  | `account_code`, `instrument_code`, `pledge_quantity`, `reference_number`, `pledgee_name`, `confirmed_by`, `timestamp` |
| `pledge.released` |  | `account_code`, `instrument_code`, `withdraw_quantity`, `reference_number`, `released_by`, `timestamp` |
| `pledge.partially_released` |  | `account_code`, `instrument_code`, `withdraw_quantity`, `residual_quantity`, `reference_number`, `released_by`, `timestamp` |
| `pledge.advice_note_generated` |  | `reference_number`, `pledgee_name`, `transaction_type`, `generated_by`, `timestamp` |
| `pledge.csd_movement_reported` |  | `reference_number`, `account_code`, `instrument_code`, `isin`, `net_quantity`, `report_date` |
| `pledge.csd_position_reported` |  | `account_code`, `instrument_code`, `isin`, `pledged_quantity`, `market_value`, `report_date` |
| `pledge.corporate_action_processed` |  | `account_code`, `instrument_code`, `reference_number`, `corporate_action_type`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
transaction_codes:
  S3: Client pledge delivered
  S4: Scrip deposited to client pledge
  S6: Scrip withdrawn from client pledge
  S7: Client pledge returned
screens:
  MENUT: Client pledge menu
  USTCP: Update securities to client pledge
  USXCP: Update securities ex client pledge
  CPENQ: Client pledge enquiry
  CPDET: Client pledge detail
reports:
  CPADV: Client pledge advice note to pledgee
  PCPMOV: Client pledge movement report to CSD participant
  PCPPOS: Client pledge position report to CSD participant
dissemination:
  portfolio_layout: Holdings record layout extended with pledge quantity and sign indicator
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Client Pledge Equities Blueprint",
  "description": "Client pledge of electronically settled listed equities on controlled broker accounts, covering pledgee setup, pledge deposit and withdrawal, CSD reporting, and",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, pledge, collateral, equities, csd, corporate-actions, segregation"
}
</script>
