<!-- AUTO-GENERATED FROM broker-derivatives.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Derivatives

> Nightly derivatives upload into the broker back-office producing automatic margin and mark-to-market journals, booking-fee and brokerage calculation, and position enquiry for futures and options

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · derivatives · futures · options · margin · mark-to-market · booking-fees · brokerage · positions

## What this does

Nightly derivatives upload into the broker back-office producing automatic margin and mark-to-market journals, booking-fee and brokerage calculation, and position enquiry for futures and options

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **broker_code** *(text, required)* — Broker Code
- **derivatives_broker_code** *(text, required)* — Derivatives Broker Code
- **derivatives_user_flag** *(boolean, required)* — Derivatives Upload Enabled Flag
- **account_code** *(text, required)* — Client Account Code
- **derivatives_account_code** *(text, required)* — Client Derivatives Account Code
- **rate_classification** *(text, required)* — Contract Rate Classification
- **instrument_code** *(text, required)* — Instrument Code
- **contract_type** *(select, required)* — Contract Type
- **option_type** *(select, optional)* — Option Type
- **contract_expiry_date** *(date, required)* — Contract Expiry Date
- **strike_price** *(number, optional)* — Strike Price
- **trade_price** *(number, required)* — Trade Price
- **contract_reference** *(text, required)* — Contract Reference
- **number_of_contracts** *(number, required)* — Number of Contracts
- **buy_sell_indicator** *(select, required)* — Buy or Sell Indicator
- **principal_agent_option** *(select, optional)* — Principal or Agent Option
- **rate_from_date** *(date, required)* — Rate Effective From Date
- **brokerage_rate** *(number, required)* — Brokerage Rate Per Contract
- **booking_fee** *(number, required)* — Booking Fee Per Contract Band
- **contract_count_band** *(number, required)* — Contract Count Band Ceiling
- **opening_position** *(number, required)* — Opening Position
- **buy_quantity** *(number, required)* — Buy Quantity
- **sell_quantity** *(number, required)* — Sell Quantity
- **closing_position** *(number, required)* — Closing Position
- **initial_margin_amount** *(number, optional)* — Initial Margin Amount
- **variation_margin_amount** *(number, optional)* — Variation Margin (Mark-to-Market) Amount
- **mark_to_market_price** *(number, optional)* — Mark-to-Market Closing Price
- **futures_balance** *(number, required)* — Futures Balance on Account
- **trading_balance** *(number, required)* — Trading Balance on Account
- **position_status** *(select, required)* — Position Status
- **upload_process_date** *(date, required)* — Nightly Upload Process Date
- **non_resident_flag** *(boolean, optional)* — Non-Resident Client Flag

## What must be true

- **upload → nightly_interface:** Derivatives contract file is uploaded from the exchange into the back-office once per business day, after market close
- **upload → idempotent_processing:** Each contract reference may only be booked once; duplicate references in a rerun are suppressed
- **upload → broker_flag_required:** Upload only processes for brokers flagged as derivatives users; other brokers are skipped
- **upload → prerequisite_setup:** Contract rate table must be loaded before client rate classification can be assigned
- **accounting → margin_journal:** Initial margin debits or credits the futures balance and sweeps funds to the clearing-house margin account
- **accounting → mtm_journal:** Daily mark-to-market gains and losses post to the futures balance with an equal-and-opposite clearing-house leg
- **accounting → booking_fee_journal:** Booking fees and brokerage are debited to the income balance with VAT calculated per jurisdiction rules
- **accounting → month_end_sweep:** Income balance is squared off at month-end by transfer from trading balance where account remains in debit
- **fees → rate_lookup:** Booking fee and brokerage are looked up by broker, classification, account, instrument, contract type, and effective date
- **fees → contract_count_banding:** Fee is charged per contract up to the banded ceiling; bands stack for higher contract counts
- **fees → principal_vs_agent:** Principal trades (A, B) and agent trades (C, D) may attract different rates
- **positions → daily_snapshot:** Positions are captured daily as opening, buys, sells, and closing per instrument and expiry
- **positions → close_calculation:** Closing position equals opening plus buys minus sells for each contract and expiry
- **positions → history_retention:** Derivative trade history is retained for at least 24 months for enquiry
- **non_resident → segregation:** Non-resident client funds must flow through the non-resident trust account and never mix with resident funds
- **non_resident → pre_funded_margin:** Margin requirement must be pre-funded to the futures balance before daily sweep to clearing house
- **security → access_control:** Rate table and derivative account maintenance are restricted by resource access control
- **security → segregation_of_duties:** Rate table changes require maintainer role; operators have enquiry only
- **compliance → popia_client_data:** Client personal information linked to a derivatives account must comply with POPIA lawful basis and minimisation
- **compliance → exchange_control:** Non-resident derivative trading must follow exchange-control regulations for financial rand accounts
- **compliance → audit_trail:** All journals, rate changes, and uploads are logged with user, timestamp, old/new values

## Success & failure scenarios

**✅ Success paths**

- **Nightly Upload Success** — when derivatives_user_flag eq true; upload_file_valid eq true, then emit derivatives.upload.started; create_record; move position_status opened → marked_to_market; emit derivatives.upload.completed. _Why: Nightly derivatives file is received, validated, and applied producing contracts, positions, and journals._
- **Calculate Booking Fee And Brokerage** — when rate_classification exists; instrument_code exists; contract_type in ["F","O"], then call service; set booking_fee = "computed"; set brokerage_rate = "computed"; emit derivatives.fees.calculated. _Why: Look up the contract rate table and compute fees, contract banding, and VAT per contract._
- **Post Initial Margin Journal** — when position_status eq "opened"; initial_margin_amount exists, then set futures_balance = "adjusted"; emit derivatives.margin.journal_posted. _Why: Debit or credit the futures balance with initial margin on a newly opened position._
- **Post Mark To Market Journal** — when position_status in ["opened","marked_to_market"]; variation_margin_amount exists, then set mark_to_market_price = "updated"; set futures_balance = "adjusted"; move position_status opened → marked_to_market; emit derivatives.mtm.journal_posted. _Why: Post daily variation margin reflecting price movement on open positions._
- **Close Position On Offset** — when closing_position eq 0, then move position_status marked_to_market → closed; emit derivatives.position.closed. _Why: When buys and sells offset, or on expiry, transition the position to closed._
- **Position Enquiry Snapshot** — when enquiry_date exists, then call service. _Why: Return daily positions snapshot by account or broker as at an enquiry date._

**❌ Failure paths**

- **Reject Upload Broker Not Enabled** — when derivatives_user_flag eq false, then emit derivatives.upload.failed. _Why: Skip upload for brokers not flagged as derivatives users._ *(error: `DERIV_BROKER_NOT_ENABLED`)*
- **Reject Duplicate Contract** — when contract_reference exists, then emit derivatives.upload.failed. _Why: Suppress duplicate contract references on rerun._ *(error: `DERIV_DUPLICATE_CONTRACT`)*
- **Reject Missing Rate** — when rate_lookup_result not_exists, then emit derivatives.upload.failed. _Why: No active rate matches the broker, classification, instrument, type, and effective date._ *(error: `DERIV_RATE_NOT_FOUND`)*
- **Reject Non Resident Mixing** — when non_resident_flag eq true; funds_source neq "non_resident_trust", then emit derivatives.upload.failed. _Why: Prevent non-resident derivative activity from mixing with resident trust funds._ *(error: `DERIV_NON_RESIDENT_TRUST_VIOLATION`)*

## Errors it can return

- `DERIV_BROKER_NOT_ENABLED` — Broker is not flagged as a derivatives user, upload skipped
- `DERIV_RATE_NOT_FOUND` — No active contract rate found for broker, classification, instrument, and date
- `DERIV_DUPLICATE_CONTRACT` — Contract reference has already been booked
- `DERIV_ACCOUNT_MISSING_CODE` — Client account is missing derivatives account code or rate classification
- `DERIV_MARGIN_UNDERFUNDED` — Futures balance is insufficient to cover initial margin requirement
- `DERIV_NON_RESIDENT_TRUST_VIOLATION` — Non-resident client funds must flow through the non-resident trust account
- `DERIV_RATE_TABLE_NOT_LOADED` — Contract rate table must be loaded before rate classification can be assigned
- `DERIV_UPLOAD_FILE_INVALID` — Derivatives upload file failed schema or checksum validation
- `DERIV_POSITION_RECONCILIATION_FAIL` — Computed closing position does not match exchange-reported closing position

## Events

**`derivatives.upload.started`**
  Payload: `broker_code`, `upload_process_date`, `file_reference`, `timestamp`

**`derivatives.upload.completed`**
  Payload: `broker_code`, `upload_process_date`, `contracts_loaded`, `journals_posted`, `timestamp`

**`derivatives.upload.failed`**
  Payload: `broker_code`, `upload_process_date`, `error_code`, `timestamp`

**`derivatives.contract.booked`**
  Payload: `account_code`, `contract_reference`, `instrument_code`, `contract_type`, `number_of_contracts`, `trade_price`, `timestamp`

**`derivatives.position.opened`**
  Payload: `account_code`, `contract_reference`, `instrument_code`, `number_of_contracts`, `timestamp`

**`derivatives.position.marked_to_market`**
  Payload: `account_code`, `contract_reference`, `variation_margin_amount`, `mark_to_market_price`, `upload_process_date`

**`derivatives.position.closed`**
  Payload: `account_code`, `contract_reference`, `closing_position`, `timestamp`

**`derivatives.margin.journal_posted`**
  Payload: `account_code`, `initial_margin_amount`, `futures_balance`, `upload_process_date`

**`derivatives.mtm.journal_posted`**
  Payload: `account_code`, `variation_margin_amount`, `futures_balance`, `upload_process_date`

**`derivatives.fees.calculated`**
  Payload: `account_code`, `contract_reference`, `brokerage_amount`, `booking_fee_amount`, `vat_amount`

**`derivatives.rate_table.updated`**
  Payload: `broker_code`, `rate_classification`, `instrument_code`, `contract_type`, `rate_from_date`, `updated_by`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-client-data-upload** *(recommended)*

## Quality fitness 🟢 85/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-derivatives/) · **Spec source:** [`broker-derivatives.blueprint.yaml`](./broker-derivatives.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
