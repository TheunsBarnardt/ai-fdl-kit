---
title: "Broker Derivatives Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Nightly derivatives upload into the broker back-office producing automatic margin and mark-to-market journals, booking-fee and brokerage calculation, and positi"
---

# Broker Derivatives Blueprint

> Nightly derivatives upload into the broker back-office producing automatic margin and mark-to-market journals, booking-fee and brokerage calculation, and position enquiry for futures and options

| | |
|---|---|
| **Feature** | `broker-derivatives` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, derivatives, futures, options, margin, mark-to-market, booking-fees, brokerage, positions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-derivatives.blueprint.yaml) |
| **JSON API** | [broker-derivatives.json]({{ site.baseurl }}/api/blueprints/trading/broker-derivatives.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `derivatives_clerk` | Derivatives Clerk | human | Loads and maintains contract rate table and derivative account codes |
| `account_supervisor` | Account Supervisor | human |  |
| `back_office_system` | Back-Office Accounting System | system |  |
| `derivatives_exchange` | Derivatives Exchange | external | Upstream derivatives trading system supplying nightly contract files |
| `clearing_house` | Clearing House | external | Initial and variation margin counterparty |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `broker_code` | text | Yes | Broker Code |  |
| `derivatives_broker_code` | text | Yes | Derivatives Broker Code |  |
| `derivatives_user_flag` | boolean | Yes | Derivatives Upload Enabled Flag |  |
| `account_code` | text | Yes | Client Account Code |  |
| `derivatives_account_code` | text | Yes | Client Derivatives Account Code |  |
| `rate_classification` | text | Yes | Contract Rate Classification |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `contract_type` | select | Yes | Contract Type |  |
| `option_type` | select | No | Option Type |  |
| `contract_expiry_date` | date | Yes | Contract Expiry Date |  |
| `strike_price` | number | No | Strike Price |  |
| `trade_price` | number | Yes | Trade Price |  |
| `contract_reference` | text | Yes | Contract Reference |  |
| `number_of_contracts` | number | Yes | Number of Contracts |  |
| `buy_sell_indicator` | select | Yes | Buy or Sell Indicator |  |
| `principal_agent_option` | select | No | Principal or Agent Option |  |
| `rate_from_date` | date | Yes | Rate Effective From Date |  |
| `brokerage_rate` | number | Yes | Brokerage Rate Per Contract |  |
| `booking_fee` | number | Yes | Booking Fee Per Contract Band |  |
| `contract_count_band` | number | Yes | Contract Count Band Ceiling |  |
| `opening_position` | number | Yes | Opening Position |  |
| `buy_quantity` | number | Yes | Buy Quantity |  |
| `sell_quantity` | number | Yes | Sell Quantity |  |
| `closing_position` | number | Yes | Closing Position |  |
| `initial_margin_amount` | number | No | Initial Margin Amount |  |
| `variation_margin_amount` | number | No | Variation Margin (Mark-to-Market) Amount |  |
| `mark_to_market_price` | number | No | Mark-to-Market Closing Price |  |
| `futures_balance` | number | Yes | Futures Balance on Account |  |
| `trading_balance` | number | Yes | Trading Balance on Account |  |
| `position_status` | select | Yes | Position Status |  |
| `upload_process_date` | date | Yes | Nightly Upload Process Date |  |
| `non_resident_flag` | boolean | No | Non-Resident Client Flag |  |

## States

**State field:** `position_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `opened` | Yes |  |
| `marked_to_market` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `opened` | `marked_to_market` | back_office_system |  |
|  | `marked_to_market` | `marked_to_market` | back_office_system |  |
|  | `marked_to_market` | `closed` | back_office_system |  |
|  | `opened` | `closed` | back_office_system |  |

## Rules

- **upload:**
  - **nightly_interface:** Derivatives contract file is uploaded from the exchange into the back-office once per business day, after market close
  - **idempotent_processing:** Each contract reference may only be booked once; duplicate references in a rerun are suppressed
  - **broker_flag_required:** Upload only processes for brokers flagged as derivatives users; other brokers are skipped
  - **prerequisite_setup:** Contract rate table must be loaded before client rate classification can be assigned
- **accounting:**
  - **margin_journal:** Initial margin debits or credits the futures balance and sweeps funds to the clearing-house margin account
  - **mtm_journal:** Daily mark-to-market gains and losses post to the futures balance with an equal-and-opposite clearing-house leg
  - **booking_fee_journal:** Booking fees and brokerage are debited to the income balance with VAT calculated per jurisdiction rules
  - **month_end_sweep:** Income balance is squared off at month-end by transfer from trading balance where account remains in debit
- **fees:**
  - **rate_lookup:** Booking fee and brokerage are looked up by broker, classification, account, instrument, contract type, and effective date
  - **contract_count_banding:** Fee is charged per contract up to the banded ceiling; bands stack for higher contract counts
  - **principal_vs_agent:** Principal trades (A, B) and agent trades (C, D) may attract different rates
- **positions:**
  - **daily_snapshot:** Positions are captured daily as opening, buys, sells, and closing per instrument and expiry
  - **close_calculation:** Closing position equals opening plus buys minus sells for each contract and expiry
  - **history_retention:** Derivative trade history is retained for at least 24 months for enquiry
- **non_resident:**
  - **segregation:** Non-resident client funds must flow through the non-resident trust account and never mix with resident funds
  - **pre_funded_margin:** Margin requirement must be pre-funded to the futures balance before daily sweep to clearing house
- **security:**
  - **access_control:** Rate table and derivative account maintenance are restricted by resource access control
  - **segregation_of_duties:** Rate table changes require maintainer role; operators have enquiry only
- **compliance:**
  - **popia_client_data:** Client personal information linked to a derivatives account must comply with POPIA lawful basis and minimisation
  - **exchange_control:** Non-resident derivative trading must follow exchange-control regulations for financial rand accounts
  - **audit_trail:** All journals, rate changes, and uploads are logged with user, timestamp, old/new values

## Outcomes

### Nightly_upload_success (Priority: 1) | Transaction: atomic

_Nightly derivatives file is received, validated, and applied producing contracts, positions, and journals_

**Given:**
- `derivatives_user_flag` (db) eq `true`
- `upload_file_valid` (input) eq `true`

**Then:**
- **emit_event** event: `derivatives.upload.started`
- **create_record**
- **transition_state** field: `position_status` from: `opened` to: `marked_to_market`
- **emit_event** event: `derivatives.upload.completed`

### Reject_upload_broker_not_enabled (Priority: 2) — Error: `DERIV_BROKER_NOT_ENABLED`

_Skip upload for brokers not flagged as derivatives users_

**Given:**
- `derivatives_user_flag` (db) eq `false`

**Then:**
- **emit_event** event: `derivatives.upload.failed`

### Reject_duplicate_contract (Priority: 3) — Error: `DERIV_DUPLICATE_CONTRACT`

_Suppress duplicate contract references on rerun_

**Given:**
- `contract_reference` (db) exists

**Then:**
- **emit_event** event: `derivatives.upload.failed`

### Calculate_booking_fee_and_brokerage (Priority: 4) | Transaction: atomic

_Look up the contract rate table and compute fees, contract banding, and VAT per contract_

**Given:**
- `rate_classification` (db) exists
- `instrument_code` (input) exists
- `contract_type` (input) in `F,O`

**Then:**
- **call_service** target: `rate_table_lookup`
- **set_field** target: `booking_fee` value: `computed`
- **set_field** target: `brokerage_rate` value: `computed`
- **emit_event** event: `derivatives.fees.calculated`

### Reject_missing_rate (Priority: 5) — Error: `DERIV_RATE_NOT_FOUND`

_No active rate matches the broker, classification, instrument, type, and effective date_

**Given:**
- `rate_lookup_result` (computed) not_exists

**Then:**
- **emit_event** event: `derivatives.upload.failed`

### Post_initial_margin_journal (Priority: 6) | Transaction: atomic

_Debit or credit the futures balance with initial margin on a newly opened position_

**Given:**
- `position_status` (db) eq `opened`
- `initial_margin_amount` (input) exists

**Then:**
- **set_field** target: `futures_balance` value: `adjusted`
- **emit_event** event: `derivatives.margin.journal_posted`

### Post_mark_to_market_journal (Priority: 7) | Transaction: atomic

_Post daily variation margin reflecting price movement on open positions_

**Given:**
- `position_status` (db) in `opened,marked_to_market`
- `variation_margin_amount` (input) exists

**Then:**
- **set_field** target: `mark_to_market_price` value: `updated`
- **set_field** target: `futures_balance` value: `adjusted`
- **transition_state** field: `position_status` from: `opened` to: `marked_to_market`
- **emit_event** event: `derivatives.mtm.journal_posted`

### Close_position_on_offset (Priority: 8)

_When buys and sells offset, or on expiry, transition the position to closed_

**Given:**
- `closing_position` (computed) eq `0`

**Then:**
- **transition_state** field: `position_status` from: `marked_to_market` to: `closed`
- **emit_event** event: `derivatives.position.closed`

### Reject_non_resident_mixing (Priority: 9) — Error: `DERIV_NON_RESIDENT_TRUST_VIOLATION`

_Prevent non-resident derivative activity from mixing with resident trust funds_

**Given:**
- `non_resident_flag` (db) eq `true`
- `funds_source` (input) neq `non_resident_trust`

**Then:**
- **emit_event** event: `derivatives.upload.failed`

### Position_enquiry_snapshot (Priority: 10)

_Return daily positions snapshot by account or broker as at an enquiry date_

**Given:**
- `enquiry_date` (input) exists

**Then:**
- **call_service** target: `positions_snapshot`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DERIV_BROKER_NOT_ENABLED` | 409 | Broker is not flagged as a derivatives user, upload skipped | No |
| `DERIV_RATE_NOT_FOUND` | 404 | No active contract rate found for broker, classification, instrument, and date | No |
| `DERIV_DUPLICATE_CONTRACT` | 409 | Contract reference has already been booked | No |
| `DERIV_ACCOUNT_MISSING_CODE` | 422 | Client account is missing derivatives account code or rate classification | No |
| `DERIV_MARGIN_UNDERFUNDED` | 409 | Futures balance is insufficient to cover initial margin requirement | No |
| `DERIV_NON_RESIDENT_TRUST_VIOLATION` | 422 | Non-resident client funds must flow through the non-resident trust account | No |
| `DERIV_RATE_TABLE_NOT_LOADED` | 409 | Contract rate table must be loaded before rate classification can be assigned | No |
| `DERIV_UPLOAD_FILE_INVALID` | 422 | Derivatives upload file failed schema or checksum validation | No |
| `DERIV_POSITION_RECONCILIATION_FAIL` | 409 | Computed closing position does not match exchange-reported closing position | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `derivatives.upload.started` |  | `broker_code`, `upload_process_date`, `file_reference`, `timestamp` |
| `derivatives.upload.completed` |  | `broker_code`, `upload_process_date`, `contracts_loaded`, `journals_posted`, `timestamp` |
| `derivatives.upload.failed` |  | `broker_code`, `upload_process_date`, `error_code`, `timestamp` |
| `derivatives.contract.booked` |  | `account_code`, `contract_reference`, `instrument_code`, `contract_type`, `number_of_contracts`, `trade_price`, `timestamp` |
| `derivatives.position.opened` |  | `account_code`, `contract_reference`, `instrument_code`, `number_of_contracts`, `timestamp` |
| `derivatives.position.marked_to_market` |  | `account_code`, `contract_reference`, `variation_margin_amount`, `mark_to_market_price`, `upload_process_date` |
| `derivatives.position.closed` |  | `account_code`, `contract_reference`, `closing_position`, `timestamp` |
| `derivatives.margin.journal_posted` |  | `account_code`, `initial_margin_amount`, `futures_balance`, `upload_process_date` |
| `derivatives.mtm.journal_posted` |  | `account_code`, `variation_margin_amount`, `futures_balance`, `upload_process_date` |
| `derivatives.fees.calculated` |  | `account_code`, `contract_reference`, `brokerage_amount`, `booking_fee_amount`, `vat_amount` |
| `derivatives.rate_table.updated` |  | `broker_code`, `rate_classification`, `instrument_code`, `contract_type`, `rate_from_date`, `updated_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-client-data-upload | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  BROKM: Broker Maintenance — derivatives broker code and upload flag
  T.BKF: Contract Rate Table — booking fees and brokerage by broker, class,
    instrument, type, date
  CLMNT: Client Account Maintenance — derivatives account code and rate classification
  AGMNT: Agent Account Maintenance — derivatives account code and rate classification
  ASAFH: Account Derivatives History — per-account contract history by balance
    code and date
  ASAFP: Derivative Positions — opening, buys, sells, closing positions as at
    enquiry date
contract_types:
  F: Future
  O: Option
option_types:
  C: Call
  P: Put
principal_agent_options:
  A: Dealt as principal
  B: Dealt as principal
  C: Dealt as agent
  D: Dealt as agent
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Derivatives Blueprint",
  "description": "Nightly derivatives upload into the broker back-office producing automatic margin and mark-to-market journals, booking-fee and brokerage calculation, and positi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, derivatives, futures, options, margin, mark-to-market, booking-fees, brokerage, positions"
}
</script>
