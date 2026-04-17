<!-- AUTO-GENERATED FROM broker-account-transfers-portfolio-moves.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Account Transfers Portfolio Moves

> Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination validation, supervisor approval, and...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · account-transfer · portfolio-move · settlement · dematerialised · csdp · equities

## What this does

Automates account-to-account transfers and bulk portfolio moves of dematerialised listed equity holdings between client accounts, including source/destination validation, supervisor approval, and...

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **transfer_reference** *(text, required)* — Transfer Reference
- **transfer_type** *(select, required)* — Transfer Type
- **transaction_code** *(text, required)* — Transaction Code
- **source_account_code** *(text, required)* — Source Account Code
- **destination_account_code** *(text, required)* — Destination Account Code
- **source_member_code** *(text, required)* — Source Member Code
- **destination_member_code** *(text, required)* — Destination Member Code
- **instrument_code** *(text, optional)* — Instrument Code
- **quantity** *(number, optional)* — Quantity to Transfer
- **available_holding** *(number, optional)* — Available Holding
- **settlement_date** *(date, required)* — Settlement Date
- **transfer_reason** *(select, required)* — Transfer Reason
- **change_of_beneficial_owner** *(boolean, required)* — Change of Beneficial Owner
- **controlled_source_flag** *(boolean, required)* — Source Is Controlled Account
- **controlled_destination_flag** *(boolean, required)* — Destination Is Controlled Account
- **non_resident_flag** *(boolean, optional)* — Non-Resident Client
- **portfolio_selection_mode** *(select, optional)* — Portfolio Selection Mode
- **linkage_key** *(text, optional)* — Branch/Partner/Advisor Linkage Key
- **swift_message_reference** *(text, optional)* — Settlement Message Reference
- **csd_commit_reference** *(text, optional)* — Central Securities Depository Commit Reference
- **transfer_status** *(select, required)* — Transfer Status
- **approval_notes** *(rich_text, optional)* — Approval Notes
- **created_by** *(text, required)* — Created By
- **approved_by** *(text, optional)* — Approved By

## What must be true

- **data_integrity → holding_sufficiency:** Transfer quantity must not exceed available holding on source account for the chosen instrument
- **data_integrity → settlement_date_floor:** Default settlement date is T+1, may be set to same-day or a future date but never a past date
- **data_integrity → unique_reference:** Transfer reference must be unique within the broker firm
- **data_integrity → paired_legs:** External transfers require matching delivery and receipt legs with identical quantity, instrument, and settlement date
- **data_integrity → scope_equities_only:** Functionality restricted to dematerialised listed equities; other instrument classes are rejected
- **security → screen_level_access:** Selection, delivery, receipt, and enquiry screens each have distinct access codes for segregation of duties
- **security → segregation_of_duties:** Operator who captures a transfer cannot approve it; a supervisor role is required
- **security → field_level_auth:** Settlement date and quantity are edit-restricted once a leg is approved
- **compliance → change_of_beneficial_owner_flag:** Every transfer must declare whether beneficial ownership changes, for tax and regulatory reporting
- **compliance → non_resident_segregation:** Non-resident controlled client holdings must remain in non-resident pools; mixing with resident balances is forbidden
- **compliance → non_controlled_destination:** Moves from controlled to non-controlled accounts remove the holding from the controlled balance without re-creating it on the non-controlled side
- **compliance → popia_consent:** Personal information displayed on transfer screens is subject to POPIA lawful-basis checks
- **compliance → audit_trail:** All state transitions, approvals, and message exchanges are logged with user, timestamp, and before/after values for at least 36 months
- **business → transaction_codes:** Each transfer type uses a distinct transaction code for downstream identification and reporting
- **business → internal_vs_external:** Internal transfers stay within one broker; external transfers pair with a counterparty broker
- **business → portfolio_scope:** Portfolio moves transfer all qualifying listed-equity holdings across one or many client accounts in a single instruction
- **business → portfolio_selection:** Accounts may be selected by branch, partner, or advisor linkage, or from an explicit account list
- **business → csd_coordination:** Registered-securities leg is coordinated with the central securities depository via standard settlement messages
- **business → dissemination:** Transfer confirmations are disseminated to clients via configured contract-note channels

## Success & failure scenarios

**✅ Success paths**

- **Request Internal Transfer** — when transfer_type eq "internal"; source_member_code eq "destination_member_code"; quantity lte "available_holding", then create_record; set transfer_status = "requested"; emit transfer.requested. _Why: Operator captures an internal account-to-account transfer within the same broker._
- **Approve Transfer** — when user_role eq "transfer_supervisor"; transfer_status eq "requested"; created_by neq "current_user", then move transfer_status requested → approved; set approved_by = "current_user"; emit transfer.approved. _Why: Supervisor approves a requested delivery or receipt leg._
- **Execute Approved Transfer** — when transfer_status eq "approved", then call service; move transfer_status approved → executed; emit transfer.executed. _Why: Back-office system posts book entries and dispatches settlement message to the central securities depository._
- **Settle On Csd Confirmation** — when transfer_status eq "executed"; swift_message_reference exists, then move transfer_status executed → settled; emit transfer.settled. _Why: Mark transfer settled when the central securities depository confirms the registered leg._
- **Request Portfolio Move By Linkage** — when transfer_type eq "portfolio_move"; portfolio_selection_mode in ["branch","partner","advisor","account_list"]; linkage_key exists, then create_record; set transfer_status = "requested"; emit portfolio_move.requested. _Why: Operator selects a set of client accounts by branch, partner, or advisor linkage and initiates a bulk portfolio move._

**❌ Failure paths**

- **Reject Insufficient Holding** — when quantity gt "available_holding", then emit transfer.rejected. _Why: Prevent transfer when source holding is smaller than requested quantity._ *(error: `TRANSFER_INSUFFICIENT_HOLDING`)*
- **Reject Past Settlement Date** — when settlement_date lt "today", then emit transfer.rejected. _Why: Block instructions with a settlement date in the past._ *(error: `TRANSFER_SETTLEMENT_DATE_INVALID`)*
- **Block Self Approval** — when created_by eq "current_user", then emit transfer.rejected. _Why: Prevent the capturing operator from approving their own transfer._ *(error: `TRANSFER_SELF_APPROVAL_BLOCKED`)*
- **Reject Non Equity Instrument** — when instrument_code not_in ["listed_equity_dematerialised"], then emit transfer.rejected. _Why: Reject transfers of anything other than dematerialised listed equities._ *(error: `TRANSFER_INVALID_INSTRUMENT`)*
- **Handle Csd Rejection** — when csd_response_code eq "rejected", then move transfer_status executed → rejected; emit transfer.rejected. _Why: Roll back execution when the central securities depository rejects the settlement message._ *(error: `TRANSFER_CSD_REJECT`)*

## Errors it can return

- `TRANSFER_INSUFFICIENT_HOLDING` — Source account does not hold the requested quantity
- `TRANSFER_INVALID_ACCOUNT` — Source or destination account code is unknown or inactive
- `TRANSFER_INVALID_INSTRUMENT` — Instrument is not a dematerialised listed equity
- `TRANSFER_SETTLEMENT_DATE_INVALID` — Settlement date must be today or in the future
- `TRANSFER_DUPLICATE_REFERENCE` — Transfer reference already exists for this broker
- `TRANSFER_APPROVAL_FORBIDDEN` — Only a supervisor role may approve a transfer
- `TRANSFER_SELF_APPROVAL_BLOCKED` — Transfer creator may not approve their own instruction
- `TRANSFER_NON_RESIDENT_VIOLATION` — Non-resident holdings cannot be mixed with resident balances
- `TRANSFER_CSD_REJECT` — Central securities depository rejected the settlement message
- `TRANSFER_STATE_INVALID` — Requested state transition is not allowed from current status

## Events

**`transfer.requested`**
  Payload: `transfer_reference`, `transfer_type`, `source_account_code`, `destination_account_code`, `quantity`, `created_by`, `timestamp`

**`transfer.approved`**
  Payload: `transfer_reference`, `approved_by`, `timestamp`

**`transfer.rejected`**
  Payload: `transfer_reference`, `rejected_by`, `reason`, `timestamp`

**`transfer.executed`**
  Payload: `transfer_reference`, `executed_by`, `csd_commit_reference`, `timestamp`

**`transfer.settled`**
  Payload: `transfer_reference`, `swift_message_reference`, `settled_at`

**`transfer.cancelled`**
  Payload: `transfer_reference`, `cancelled_by`, `timestamp`

**`portfolio_move.requested`**
  Payload: `transfer_reference`, `source_accounts`, `destination_accounts`, `linkage_key`, `created_by`, `timestamp`

**`portfolio_move.executed`**
  Payload: `transfer_reference`, `instrument_count`, `executed_by`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-account-transfers-portfolio-moves/) · **Spec source:** [`broker-account-transfers-portfolio-moves.blueprint.yaml`](./broker-account-transfers-portfolio-moves.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
