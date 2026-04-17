---
title: "Broker Securities Lending Borrowing Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker securities lending and borrowing upload via fixed-width card-code records for loan open, collateral pledge, confirmation, return, mark-to-market, and mar"
---

# Broker Securities Lending Borrowing Upload Blueprint

> Broker securities lending and borrowing upload via fixed-width card-code records for loan open, collateral pledge, confirmation, return, mark-to-market, and margin calls

| | |
|---|---|
| **Feature** | `broker-securities-lending-borrowing-upload` |
| **Category** | Trading |
| **Version** | 1.1.0 |
| **Tags** | back-office, broker, upload, slb, securities-lending, borrowing, collateral, fixed-width, card-codes, mark-to-market, margin-call |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-securities-lending-borrowing-upload.blueprint.yaml) |
| **JSON API** | [broker-securities-lending-borrowing-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-securities-lending-borrowing-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `slb_counterparty` | SLB Counterparty | external |  |
| `lending_desk` | Lending Desk | human |  |
| `risk_controller` | Risk Controller | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes | Card Code |  |
| `broker_code` | text | Yes | Broker Code |  |
| `upload_date` | date | Yes | Upload Date |  |
| `upload_type` | select | Yes | Upload Type |  |
| `lender_account_code` | text | No | Lender Account Code |  |
| `borrower_account_code` | text | No | Borrower Account Code |  |
| `loan_deal_id` | text | No | Loan Deal Id |  |
| `loan_quantity` | number | No | Loan Quantity |  |
| `loan_rate` | number | No | Loan Rate Percent |  |
| `borrow_rate` | number | No | Borrower Rate Percent |  |
| `loan_collateral_value` | number | No | Loan Collateral Value |  |
| `collateral_type` | select | No | Collateral Type |  |
| `collateral_quantity` | number | No | Collateral Quantity |  |
| `instrument_type` | text | No | Instrument Type |  |
| `instrument_alpha` | text | No | Instrument Alpha |  |
| `instrument_version` | number | No | Instrument Version |  |
| `receive_date` | date | No | Receive Date |  |
| `return_date` | date | No | Return Date |  |
| `provide_date` | date | No | Provide Date |  |
| `trade_date` | date | No | Trade Date |  |
| `return_cash_collateral` | select | No | Return Cash Collateral |  |
| `create_swift_message` | select | No | Create Swift Message |  |
| `accrued_fee` | number | No | Accrued Lending Fee |  |
| `mark_price` | number | No | Mark-to-Market Price |  |
| `margin_shortfall` | number | No | Margin Shortfall |  |

## Rules

- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses before allowing upload, MUST: Provide error reporting via common error enquiry functions, MUST: Generate response dataset with per-record response codes, MUST: Archive processed upload files in a retention cycle
- **validation:** MUST: Reject entire file if trailer record missing or mismatched, MUST: Reject entire file if broker code on detail differs from header, MUST: Validate loan and collateral deal id uniqueness, MUST: Link collateral records to existing loan deal ids, MUST: Validate counterparty account exists and is active, MUST: Enforce return date not before receive/provide date, MUST: Reject loan rate outside 0-999.99 percent
- **format:** MUST: Use fixed-width non-delimited record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Layout 025 for loan upload (total length 400), MUST: Use Layout 026 for collateral upload (total length 400), MUST: Use Layout 027 for loan confirmation/return (total length 400), MUST: Use Layout 028 for collateral confirmation/return (total length 400), MUST: Zero-fill numeric fields when value is absent
- **lifecycle:** MUST: Support open-ended and fixed-term loan types, MUST: Allow partial or full return of loans and collateral, MUST: Mark collateral to market and raise margin calls, MUST: Accrue lending fee daily as rate * value * days / 365, MUST: Force-close loans on counterparty default or contractual breach

## Outcomes

### Header_validation (Priority: 1) — Error: `SLB_INVALID_CARD_CODE`

_Validate header record (Card Code 000)_

**Given:**
- `card_code` (input) eq `000`

**Then:**
- **set_field** target: `header_validated` value: `true`
- **emit_event** event: `slb.upload.response_delivered`

### Open_securities_loan (Priority: 2) — Error: `SLB_INVALID_LOAN_QUANTITY` | Transaction: atomic

_Open a new securities loan (Layout 025 with upload type N)_

**Given:**
- `card_code` (input) eq `025`
- `upload_type` (input) eq `N`
- `loan_quantity` (input) gt `0`

**Then:**
- **create_record**
- **set_field** target: `loan_status` value: `open`
- **emit_event** event: `slb.loan.opened`

### Pledge_collateral (Priority: 3) — Error: `SLB_COLLATERAL_UNLINKED` | Transaction: atomic

_Pledge cash or securities collateral against a loan (Layout 026)_

**Given:**
- `card_code` (input) eq `026`
- `upload_type` (input) eq `N`

**Then:**
- **create_record**
- **set_field** target: `collateral_status` value: `posted`
- **emit_event** event: `slb.collateral.pledged`

### Return_securities_loan (Priority: 4) | Transaction: atomic

_Confirm or return an open securities loan (Layout 027)_

**Given:**
- `card_code` (input) eq `027`
- `upload_type` (input) in `C,R`

**Then:**
- **transition_state** field: `loan_status` from: `open` to: `returned`
- **emit_event** event: `slb.loan.returned`

### Release_collateral (Priority: 5) | Transaction: atomic

_Confirm or release collateral (Layout 028)_

**Given:**
- `card_code` (input) eq `028`
- `upload_type` (input) in `C,R`

**Then:**
- **transition_state** field: `collateral_status` from: `posted` to: `released`
- **emit_event** event: `slb.collateral.released`

### Mark_to_market_collateral (Priority: 6)

_Revalue collateral at current mark price and compute exposure_

**Given:**
- `loan_status` (db) eq `open`
- `mark_price` (input) gt `0`

**Then:**
- **set_field** target: `collateral_value` value: `mark_price_times_quantity`
- **emit_event** event: `slb.collateral.marked`

### Margin_call (Priority: 7) — Error: `SLB_MARGIN_CALL_REQUIRED`

_Raise margin call when collateral value falls below required threshold_

**Given:**
- `collateral_value` (computed) lt `required_margin`

**Then:**
- **set_field** target: `margin_call_raised` value: `true`
- **notify**
- **emit_event** event: `slb.margin.call`

### Accrue_lending_fee (Priority: 8)

_Daily fee accrual as loan_rate * loan_value * days / 365_

**Given:**
- `loan_status` (db) eq `open`

**Then:**
- **set_field** target: `accrued_fee` value: `loan_rate_times_value_times_days_over_365`
- **emit_event** event: `slb.fee.accrued`

### Force_close_loan (Priority: 9) — Error: `SLB_FORCE_CLOSE_REQUIRED` | Transaction: atomic

_Force close loan on counterparty default or unmet margin call_

**Given:**
- ANY: `margin_call_unmet` (db) eq `true` OR `counterparty_default` (db) eq `true`

**Then:**
- **transition_state** field: `loan_status` from: `open` to: `force_closed`
- **notify**
- **emit_event** event: `slb.loan.force_closed`

### Trailer_validation (Priority: 10) — Error: `SLB_TRAILER_COUNT_MISMATCH`

_Validate trailer record counts against records sent_

**Given:**
- `card_code` (input) eq `999`

**Then:**
- **emit_event** event: `slb.upload.response_delivered`

### Generate_response_dataset (Priority: 11)

_Generate SLB upload response dataset with per-record codes_

**Given:**
- `processing_complete` (computed) eq `true`

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `slb.upload.response_delivered`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SLB_INVALID_CARD_CODE` | 422 | Card code is invalid | No |
| `SLB_INVALID_BROKER_CODE` | 422 | Broker code is invalid or inactive | No |
| `SLB_INVALID_UPLOAD_TYPE` | 422 | Upload type must be N, U, R, C | No |
| `SLB_INVALID_ACCOUNT_CODE` | 422 | Account code is invalid or not permitted | No |
| `SLB_INVALID_DEAL_ID` | 422 | Deal id is invalid for upload type | No |
| `SLB_INVALID_INSTRUMENT` | 422 | Instrument code not loaded or not electronically settled | No |
| `SLB_INVALID_LOAN_QUANTITY` | 422 | Loan quantity out of range | No |
| `SLB_INVALID_LOAN_RATE` | 422 | Loan rate must be between 0 and 999.99 percent | No |
| `SLB_INVALID_COLLATERAL_TYPE` | 422 | Collateral type must be S, C or blank | No |
| `SLB_RETURN_DATE_BEFORE_RECEIVE` | 422 | Return date may not be before receive date | No |
| `SLB_TRAILER_MISSING` | 422 | Trailer record not found | No |
| `SLB_TRAILER_COUNT_MISMATCH` | 422 | Trailer total not same as records sent | No |
| `SLB_DETAIL_BROKER_MISMATCH` | 422 | Detail broker code not same as header broker code | No |
| `SLB_RECORD_AFTER_TRAILER` | 422 | Record received after trailer | No |
| `SLB_DUPLICATE_TRAILER` | 422 | Duplicate trailer received | No |
| `SLB_COLLATERAL_UNLINKED` | 422 | Collateral record references non-existent loan | No |
| `SLB_MARGIN_CALL_REQUIRED` | 422 | Collateral value below required margin threshold | No |
| `SLB_FORCE_CLOSE_REQUIRED` | 409 | Loan must be force-closed due to default or breach | No |
| `SLB_PROCESSING_FAILED` | 500 | SLB upload processing failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `slb.loan.opened` |  | `broker_code`, `loan_deal_id`, `lender_account_code`, `borrower_account_code`, `loan_quantity`, `loan_rate` |
| `slb.loan.returned` |  | `broker_code`, `loan_deal_id`, `return_date`, `return_quantity` |
| `slb.collateral.pledged` |  | `broker_code`, `loan_deal_id`, `collateral_type`, `collateral_quantity`, `collateral_value` |
| `slb.collateral.released` |  | `broker_code`, `loan_deal_id`, `collateral_quantity` |
| `slb.collateral.marked` |  | `loan_deal_id`, `mark_price`, `collateral_value` |
| `slb.margin.call` |  | `loan_deal_id`, `margin_shortfall` |
| `slb.loan.force_closed` |  | `loan_deal_id`, `reason` |
| `slb.fee.accrued` |  | `loan_deal_id`, `accrued_fee`, `accrual_date` |
| `slb.upload.response_delivered` |  | `broker_code`, `sequence_number`, `records_processed`, `records_rejected` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-deal-management-upload | optional |  |
| broker-client-data-upload | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_layouts:
  HEADER_000:
    total_length: 30
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: upload_date
        start: 7
        end: 14
        length: 8
        type: numeric
      - name: upload_time
        start: 15
        end: 20
        length: 6
        type: numeric
      - name: prefix
        start: 21
        end: 21
        length: 1
        type: character
      - name: sequence_number
        start: 22
        end: 28
        length: 7
        type: numeric
      - name: filler
        start: 29
        end: 30
        length: 2
        type: character
  TRAILER_999:
    total_length: 50
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: process_date
        start: 7
        end: 14
        length: 8
        type: numeric
      - name: process_time
        start: 15
        end: 20
        length: 6
        type: numeric
      - name: total_records
        start: 21
        end: 29
        length: 9
        type: numeric
      - name: records_processed
        start: 30
        end: 38
        length: 9
        type: numeric
      - name: records_rejected
        start: 39
        end: 47
        length: 9
        type: numeric
      - name: filler
        start: 48
        end: 50
        length: 3
        type: character
  LOAN_UPLOAD_025:
    total_length: 400
    purpose: Create, update or reverse a securities loan
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: upload_type
        start: 7
        end: 7
        length: 1
        type: character
      - name: lender_account_code
        start: 8
        end: 14
        length: 7
        type: numeric
      - name: deal_id
        start: 15
        end: 21
        length: 7
        type: numeric
      - name: external_reference
        start: 22
        end: 32
        length: 11
        type: character
      - name: create_message
        start: 33
        end: 33
        length: 1
        type: character
      - name: borrower_message_reference
        start: 34
        end: 49
        length: 16
        type: character
      - name: borrower_message_status
        start: 50
        end: 58
        length: 9
        type: character
      - name: collateral_type
        start: 59
        end: 59
        length: 1
        type: character
      - name: return_cash_collateral
        start: 60
        end: 60
        length: 1
        type: character
      - name: borrower_account_code
        start: 61
        end: 67
        length: 7
        type: numeric
      - name: borrower_deal_id
        start: 68
        end: 74
        length: 7
        type: numeric
      - name: receive_date
        start: 75
        end: 82
        length: 8
        type: numeric
      - name: receive_status
        start: 83
        end: 83
        length: 1
        type: character
      - name: return_date
        start: 84
        end: 91
        length: 8
        type: numeric
      - name: return_status
        start: 92
        end: 92
        length: 1
        type: character
      - name: instrument_type
        start: 93
        end: 93
        length: 1
        type: character
      - name: instrument_alpha
        start: 94
        end: 99
        length: 6
        type: character
      - name: instrument_version
        start: 100
        end: 102
        length: 3
        type: numeric
      - name: price
        start: 103
        end: 109
        length: 7
        type: numeric
      - name: loan_quantity
        start: 110
        end: 120
        length: 11
        type: numeric
      - name: loan_rate
        start: 121
        end: 125
        length: 5
        type: numeric
      - name: borrow_rate
        start: 126
        end: 130
        length: 5
        type: numeric
      - name: loan_collateral
        start: 131
        end: 145
        length: 15
        type: numeric
      - name: borrow_collateral
        start: 146
        end: 160
        length: 15
        type: numeric
      - name: provider_balance_code
        start: 161
        end: 162
        length: 2
        type: character
      - name: provider_interest_code
        start: 163
        end: 164
        length: 2
        type: character
      - name: provider_turn_code
        start: 165
        end: 166
        length: 2
        type: character
      - name: broker_balance_code
        start: 167
        end: 168
        length: 2
        type: character
      - name: broker_interest_code
        start: 169
        end: 170
        length: 2
        type: character
      - name: broker_turn_code
        start: 171
        end: 172
        length: 2
        type: character
      - name: trade_date
        start: 173
        end: 180
        length: 8
        type: numeric
      - name: filler
        start: 181
        end: 400
        length: 220
        type: character
  COLLATERAL_UPLOAD_026:
    total_length: 400
    purpose: Pledge collateral (securities or cash) against a loan
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: upload_type
        start: 7
        end: 7
        length: 1
        type: character
      - name: provider_account_code
        start: 8
        end: 14
        length: 7
        type: numeric
      - name: deal_id
        start: 15
        end: 21
        length: 7
        type: numeric
      - name: collateral_reference
        start: 22
        end: 32
        length: 11
        type: character
      - name: create_message
        start: 33
        end: 33
        length: 1
        type: character
      - name: borrower_message_reference
        start: 34
        end: 49
        length: 16
        type: character
      - name: borrower_message_status
        start: 50
        end: 58
        length: 9
        type: character
      - name: provide_date
        start: 59
        end: 66
        length: 8
        type: numeric
      - name: provide_status
        start: 67
        end: 67
        length: 1
        type: character
      - name: return_date
        start: 68
        end: 75
        length: 8
        type: numeric
      - name: return_status
        start: 76
        end: 76
        length: 1
        type: character
      - name: receiver_account_code
        start: 77
        end: 83
        length: 7
        type: numeric
      - name: instrument_type
        start: 84
        end: 84
        length: 1
        type: character
      - name: instrument_alpha
        start: 85
        end: 90
        length: 6
        type: character
      - name: instrument_version
        start: 91
        end: 93
        length: 3
        type: numeric
      - name: price
        start: 94
        end: 100
        length: 7
        type: numeric
      - name: collateral_quantity
        start: 101
        end: 111
        length: 11
        type: numeric
      - name: trade_date
        start: 112
        end: 119
        length: 8
        type: numeric
      - name: filler
        start: 120
        end: 400
        length: 281
        type: character
  LOAN_CONFIRM_RETURN_027:
    total_length: 400
    purpose: Confirm or return an existing securities loan
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: upload_type
        start: 7
        end: 7
        length: 1
        type: character
      - name: lender_account_code
        start: 8
        end: 14
        length: 7
        type: numeric
      - name: deal_id
        start: 15
        end: 21
        length: 7
        type: numeric
      - name: return_cash_collateral
        start: 22
        end: 22
        length: 1
        type: character
      - name: borrower_account_code
        start: 23
        end: 29
        length: 7
        type: numeric
      - name: instrument_type
        start: 30
        end: 30
        length: 1
        type: character
      - name: instrument_alpha
        start: 31
        end: 36
        length: 6
        type: character
      - name: instrument_version
        start: 37
        end: 39
        length: 3
        type: numeric
      - name: loan_quantity
        start: 40
        end: 50
        length: 11
        type: numeric
      - name: receive_date
        start: 51
        end: 58
        length: 8
        type: numeric
      - name: receive_status
        start: 59
        end: 59
        length: 1
        type: character
      - name: return_date
        start: 60
        end: 67
        length: 8
        type: numeric
      - name: return_status
        start: 68
        end: 68
        length: 1
        type: character
      - name: create_message
        start: 69
        end: 69
        length: 1
        type: character
      - name: filler
        start: 70
        end: 400
        length: 331
        type: character
  COLLATERAL_CONFIRM_RETURN_028:
    total_length: 400
    purpose: Confirm or release posted collateral
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: upload_type
        start: 7
        end: 7
        length: 1
        type: character
      - name: provider_account_code
        start: 8
        end: 14
        length: 7
        type: numeric
      - name: deal_id
        start: 15
        end: 21
        length: 7
        type: numeric
      - name: receiver_account_code
        start: 22
        end: 28
        length: 7
        type: numeric
      - name: instrument_type
        start: 29
        end: 29
        length: 1
        type: character
      - name: instrument_alpha
        start: 30
        end: 35
        length: 6
        type: character
      - name: instrument_version
        start: 36
        end: 38
        length: 3
        type: numeric
      - name: collateral_quantity
        start: 39
        end: 49
        length: 11
        type: numeric
      - name: provide_date
        start: 50
        end: 57
        length: 8
        type: numeric
      - name: provide_status
        start: 58
        end: 58
        length: 1
        type: character
      - name: return_date
        start: 59
        end: 66
        length: 8
        type: numeric
      - name: return_status
        start: 67
        end: 67
        length: 1
        type: character
      - name: create_message
        start: 68
        end: 68
        length: 1
        type: character
      - name: filler
        start: 69
        end: 400
        length: 332
        type: character
  RESPONSE_DATASET:
    total_length: 700
    purpose: Per-record processing response written back to broker
    fields:
      - name: card_code
        start: 1
        end: 3
        length: 3
        type: numeric
      - name: broker_code
        start: 4
        end: 6
        length: 3
        type: numeric
      - name: process_date
        start: 7
        end: 14
        length: 8
        type: numeric
      - name: process_time
        start: 15
        end: 20
        length: 6
        type: numeric
      - name: total_records
        start: 21
        end: 29
        length: 9
        type: numeric
      - name: records_processed
        start: 30
        end: 38
        length: 9
        type: numeric
      - name: records_rejected
        start: 39
        end: 47
        length: 9
        type: numeric
      - name: filler
        start: 48
        end: 700
        length: 653
        type: character
      - name: count_of_messages_for_line
        start: 648
        end: 650
        length: 3
        type: numeric
      - name: error_message
        start: 651
        end: 700
        length: 50
        type: character
record_type_map:
  "999": Trailer Record
  "000": Header Record
  "025": Loan Upload Record
  "026": Collateral Upload Record
  "027": Loan Confirmation/Return Record
  "028": Collateral Confirmation/Return Record
slb_transaction_codes:
  upload_type:
    N: New
    U: Update
    R: Reverse
    C: Confirm
  collateral_type:
    S: Securities
    C: Cash
    " ": None
  create_message:
    Y: Immediate Swift message
    N: No Swift message
    L: Later Swift message
  return_cash_collateral:
    Y: Return cash collateral on loan return
    N: Do not return cash collateral
    " ": Not applicable (no cash collateral)
  instrument_type:
    E: Equity (electronically settled)
  account_types_permitted:
    - A
    - AB
    - AF
    - AL
    - AN
    - AS
    - Q
    - QL
    - QN
    - QS
    - B
    - C
    - LB
    - LL
response_codes:
  "000": SUCCESSFULLY UPDATED
  S01: INVALID CARD CODE NUMBER
  S03: INVALID BROKER CODE
  S05: INVALID UPLOAD TYPE
  S07: INVALID ACCOUNT CODE
  S09: INVALID DEAL ID
  S11: INVALID ACCOUNT TYPE/ROLL COMBINATION
  S12: INVALID RECEIVE DATE
  S14: INVALID RETURN DATE
  S16: INVALID INSTRUMENT TYPE
  S18: INVALID INSTRUMENT
  S20: INVALID INSTRUMENT VERSION
  S22: INVALID PRICE FORMAT
  S23: INVALID LOAN QUANTITY
  S25: INVALID LOAN RATE
  S27: INVALID BORROW RATE
  S42: INVALID COLLATERAL QUANTITY
  S44: INVALID HEADER RECORD
  S48: TRAILER RECORD NOT FOUND
  S49: INVALID TRAILER RECORD
  S55: INSTRUMENT NOT ELECTRONIC SETTLED
  S57: QTY MAY NOT BE < 0 OR > 99999999
  S58: RETURN DATE MAY NOT BE < PROVIDE DATE
  S75: RATE MAY NOT BE < 0 OR > 999.99
  S81: RETURN DATE MAY NOT BE < RECEIVE DATE
  S86: LOAN CLTRL > BORROW CLTRL
  S90: INVALID COLLATERAL TYPE
  S91: INVALID CREATE-MSG - MUST BE Y OR N OR L
  S93: LOAN TYPE INVALID - ONLY B OR L
  S94: ACCOUNT TYPE INVALID
balance_codes:
  AK: Cash Collateral AK
  BK: Cash Collateral BK
  CA: Cash Collateral CA
  CB: Cash Collateral CB
  CC: Cash Collateral CC
  CD: Cash Collateral CD
  CE: Cash Collateral CE
  CF: Cash Collateral CF
  CG: Cash Collateral CG
  CH: Cash Collateral CH
  CI: Cash Collateral CI
  CJ: Cash Collateral CJ
  CK: Cash Collateral CK
  CL: Cash Collateral CL
  CM: Cash Collateral CM
  CN: Cash Collateral CN
  CO: Cash Collateral CO
  CP: Cash Collateral CP
  DK: Cash Collateral DK
  EK: Cash Collateral EK
  FK: Cash Collateral FK
  GK: Cash Collateral GK
  IK: Cash Collateral IK
  JC: Margin Call
  JK: Cash Collateral JK
  K: Cash Collateral
  KA: Cash Collateral 10
  KB: Cash Collateral 11
  KC: Cash Collateral 12
  KD: Cash Collateral 13
  KE: Cash Collateral 14
  KF: Cash Collateral 15
  KG: Cash Collateral 16
  KH: Cash Collateral 17
  KI: Cash Collateral 18
  KJ: Cash Collateral 19
  KK: Cash Collateral 20
collateral_types:
  - cash
  - securities
loan_types:
  - open
  - term
  - call
lifecycle_states:
  loan:
    - open
    - confirmed
    - returned
    - force_closed
    - cancelled
  collateral:
    - posted
    - confirmed
    - marked
    - margin_call
    - released
    - cancelled
fee_calculation:
  formula: loan_rate * loan_value * days / 365
  accrual: daily
  day_count: ACT/365
file_structure:
  - Header Record (Card Code 000)
  - Detail Records (025, 026, 027, 028)
  - Trailer Record (Card Code 999)
fatal_file_errors:
  - RECORD RECEIVED AFTER TRAILER
  - DUPLICATE TRAILER RECEIVED
  - BRK CDE NOT SAME AS HDR
  - TRAILER REC TOTAL NOT SAME AS RECS SENT
  - TRAILER NOT RECEIVED
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Securities Lending Borrowing Upload Blueprint",
  "description": "Broker securities lending and borrowing upload via fixed-width card-code records for loan open, collateral pledge, confirmation, return, mark-to-market, and mar",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, slb, securities-lending, borrowing, collateral, fixed-width, card-codes, mark-to-market, margin-call"
}
</script>
