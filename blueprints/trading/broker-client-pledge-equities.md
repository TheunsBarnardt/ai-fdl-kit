<!-- AUTO-GENERATED FROM broker-client-pledge-equities.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Client Pledge Equities

> Client pledge of electronically settled listed equities on controlled broker accounts, covering pledgee setup, pledge deposit and withdrawal, CSD reporting, and corporate action treatment

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · pledge · collateral · equities · csd · corporate-actions · segregation

## What this does

Client pledge of electronically settled listed equities on controlled broker accounts, covering pledgee setup, pledge deposit and withdrawal, CSD reporting, and corporate action treatment

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_code** *(text, required)* — Controlled Account Code
- **account_name** *(text, required)* — Account Name
- **instrument_code** *(text, required)* — Instrument Alpha Code
- **instrument_name** *(text, optional)* — Instrument Short Name
- **instrument_type** *(select, required)* — Instrument Type
- **isin** *(text, optional)* — ISIN
- **available_quantity** *(number, required)* — Available Quantity
- **available_value** *(number, optional)* — Available Value
- **pledge_quantity** *(number, required)* — Pledge Quantity
- **pledge_value** *(number, optional)* — Pledge Value
- **withdraw_quantity** *(number, optional)* — Withdraw Quantity
- **withdraw_value** *(number, optional)* — Withdraw Value
- **reference_number** *(text, required)* — Pledge Reference Number
- **pledgee_bank_code** *(text, optional)* — Pledgee Bank Code
- **pledgee_branch_number** *(text, optional)* — Pledgee Branch Number
- **pledgee_name** *(text, required)* — Pledgee Name
- **pledgee_branch** *(text, optional)* — Pledgee Branch
- **contact_name** *(text, optional)* — Pledgee Contact Name
- **contact_number** *(phone, optional)* — Pledgee Contact Number
- **reason** *(text, optional)* — Pledge or Withdrawal Reason
- **transaction_type** *(select, required)* — Transaction Type
- **transaction_code** *(select, required)* — Transaction Code
- **transaction_date** *(date, required)* — Transaction Date
- **transaction_time** *(datetime, optional)* — Transaction Time
- **user_code** *(text, required)* — Capturing User Code
- **amount_above** *(number, optional)* — Minimum Value Filter
- **up_to_amount** *(number, optional)* — Target Pledge Amount
- **pledge_status** *(select, required)* — Pledge Status
- **advice_note_printed** *(boolean, optional)* — Advice Note Printed Flag
- **unsettled_sales_quantity** *(number, optional)* — Unsettled Sales Reducing Availability
- **borrowing_collateral_quantity** *(number, optional)* — Outstanding Borrowing or Collateral
- **already_pledged_quantity** *(number, optional)* — Already Pledged Quantity

## What must be true

- **eligibility → electronic_settlement_only:** Only electronically settled equities qualify; paper-settled or unlisted instruments must be pledged outside the system
- **eligibility → controlled_account_only:** Pledgor account must be a controlled client account of eligible account type
- **eligibility → availability_calculation:** Available quantity = holding minus unsettled sales minus borrowing or collateral minus already pledged
- **data_integrity → pledge_quantity_cap:** Pledge quantity must not exceed available quantity for the instrument on the account
- **data_integrity → reference_uniqueness:** Each confirmed pledge receives a system-generated unique reference number used for all subsequent withdrawals
- **data_integrity → pledgee_identification:** Pledgee name is mandatory; bank code and branch optional but auto-populate pledgee name when provided
- **data_integrity → reason_length:** Reason field supports up to fifty characters; any entry is recorded against the transaction
- **workflow → confirmation_required:** No pledge or withdrawal is persisted until the update flag is explicitly confirmed by the operator
- **workflow → global_update_exclusivity:** Global update (all extracted) and line-level quantity selection are mutually exclusive on a single capture
- **workflow → withdrawal_by_reference:** Withdrawals must be matched against an existing pledge reference number and cannot exceed residual pledged quantity
- **segregation → pledged_not_available_for_settlement:** Pledged holdings are excluded from availability calculations for sale settlement
- **segregation → statement_disclosure:** Client statements must clearly reflect securities that are pledged versus unpledged
- **segregation → portfolio_consolidation:** For valuation and beneficiary disclosure, pledged and unpledged holdings consolidate into a single holding line
- **corporate_actions → action_on_client_account:** Corporate action processing occurs on the underlying client account, never on the pledgee
- **corporate_actions → no_pledgee_impact:** Pledgee entitlements are unaffected by corporate actions on pledged securities
- **reporting → advice_note_on_confirmation:** A pledge advice note is generated and released to the pledgee immediately upon confirmation of a deposit or withdrawal
- **reporting → csd_movement_report:** An intraday movement report of all pledge deposits and withdrawals is produced for submission to the broker CSD participant
- **reporting → csd_position_report:** An intraday position report of all client pledge positions is produced for submission to the broker CSD participant
- **reporting → audit_trail:** Every pledge transaction is queryable by account, instrument, date range, pledgee, branch, and reference number
- **security → segregation_of_duties:** Pledge confirmation and advice-note release are restricted to supervisor role
- **security → personal_data_protection:** Pledgor identifying data on advice notes must be handled per POPIA lawful basis requirements

## Success & failure scenarios

**✅ Success paths**

- **Capture Pledge Deposit** — when account_type_eligible eq true; instrument_type eq "electronic_equity"; pledge_quantity lte "available_quantity"; pledgee_name exists, then create_record; set pledge_status = "requested"; emit pledge.requested. _Why: Operator captures a pledge deposit of available listed equities against a pledgee._
- **Confirm Pledge And Issue Reference** — when user_role eq "broker_supervisor"; update_confirmed eq true, then move pledge_status requested → active; set reference_number = "system_generated"; emit pledge.confirmed; emit pledge.advice_note_generated. _Why: Supervisor confirms the pledge, system allocates a reference number and generates an advice note._
- **Withdraw Pledge By Reference** — when reference_number exists; withdraw_quantity lte "pledged_residual_quantity"; update_confirmed eq true, then move pledge_status active → partially_released; emit pledge.partially_released; emit pledge.advice_note_generated. _Why: Operator withdraws all or part of a previously confirmed pledge against its reference number._
- **Release Pledge Fully** — when withdraw_quantity eq "pledged_residual_quantity", then move pledge_status active → released; emit pledge.released; emit pledge.advice_note_generated. _Why: Full outstanding pledged quantity is withdrawn and the pledge reaches terminal released state._
- **Report Movements To Csd** — when report_requested eq "pledge_movement", then call service; emit pledge.csd_movement_reported. _Why: Intraday movement report of pledge deposits and withdrawals is produced for the broker CSD participant._
- **Report Positions To Csd** — when report_requested eq "pledge_position", then call service; emit pledge.csd_position_reported. _Why: Intraday position report of outstanding client pledges is produced for the broker CSD participant._
- **Process Corporate Action On Client Account** — when corporate_action_event exists; pledge_status eq "active", then call service; emit pledge.corporate_action_processed. _Why: Corporate action on a pledged instrument is processed against the pledgor client account and does not affect the pledgee._
- **Exclude Pledged From Settlement Availability** — when pledge_status in ["active","partially_released"], then set available_for_settlement = false; emit pledge.confirmed. _Why: Pledged holdings are excluded from availability used by settlement and sale matching._

**❌ Failure paths**

- **Reject Pledge Exceeding Availability** — when pledge_quantity gt "available_quantity", then emit pledge.requested. _Why: Prevent pledge quantities that exceed availability after unsettled sales, borrowing, and existing pledges._ *(error: `PLEDGE_QUANTITY_EXCEEDS_AVAILABLE`)*
- **Reject Ineligible Instrument** — when instrument_type neq "electronic_equity", then emit pledge.requested. _Why: Block pledge attempts on instruments that are not electronically settled listed equities._ *(error: `PLEDGE_INSTRUMENT_NOT_ELIGIBLE`)*

## Errors it can return

- `PLEDGE_INSTRUMENT_NOT_ELIGIBLE` — Only electronically settled listed equities may be pledged through this function
- `PLEDGE_ACCOUNT_INELIGIBLE` — Account is not a controlled client account of an eligible type
- `PLEDGE_QUANTITY_EXCEEDS_AVAILABLE` — Pledge quantity exceeds available quantity after unsettled sales, borrowing, and existing pledges
- `PLEDGE_REFERENCE_NOT_FOUND` — Pledge reference number does not exist for the specified account and instrument
- `PLEDGE_WITHDRAW_EXCEEDS_PLEDGED` — Withdrawal quantity exceeds residual pledged quantity for this reference
- `PLEDGE_NOT_CONFIRMED` — Pledge capture not confirmed; update flag must be set explicitly before persistence
- `PLEDGE_PLEDGEE_NAME_REQUIRED` — Pledgee name is mandatory when the pledgee is not a registered bank
- `PLEDGE_CONFLICTING_UPDATE` — Global update and per-line quantity selection cannot be used on the same capture
- `PLEDGE_AUTHORISATION_REQUIRED` — Pledge confirmation requires a supervisor role

## Events

**`pledge.requested`**
  Payload: `account_code`, `instrument_code`, `pledge_quantity`, `pledgee_name`, `requested_by`, `timestamp`

**`pledge.confirmed`**
  Payload: `account_code`, `instrument_code`, `pledge_quantity`, `reference_number`, `pledgee_name`, `confirmed_by`, `timestamp`

**`pledge.released`**
  Payload: `account_code`, `instrument_code`, `withdraw_quantity`, `reference_number`, `released_by`, `timestamp`

**`pledge.partially_released`**
  Payload: `account_code`, `instrument_code`, `withdraw_quantity`, `residual_quantity`, `reference_number`, `released_by`, `timestamp`

**`pledge.advice_note_generated`**
  Payload: `reference_number`, `pledgee_name`, `transaction_type`, `generated_by`, `timestamp`

**`pledge.csd_movement_reported`**
  Payload: `reference_number`, `account_code`, `instrument_code`, `isin`, `net_quantity`, `report_date`

**`pledge.csd_position_reported`**
  Payload: `account_code`, `instrument_code`, `isin`, `pledged_quantity`, `market_value`, `report_date`

**`pledge.corporate_action_processed`**
  Payload: `account_code`, `instrument_code`, `reference_number`, `corporate_action_type`, `timestamp`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-client-pledge-equities/) · **Spec source:** [`broker-client-pledge-equities.blueprint.yaml`](./broker-client-pledge-equities.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
