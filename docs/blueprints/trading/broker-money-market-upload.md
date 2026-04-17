---
title: "Broker Money Market Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Daily bulk upload of money market investments, cash movements, journals and memo transactions from external broker systems via fixed-width card-code records.. 2"
---

# Broker Money Market Upload Blueprint

> Daily bulk upload of money market investments, cash movements, journals and memo transactions from external broker systems via fixed-width card-code records.

| | |
|---|---|
| **Feature** | `broker-money-market-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | money-market, bulk-upload, fixed-width, investments, ncd, deposits, back-office |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-money-market-upload.blueprint.yaml) |
| **JSON API** | [broker-money-market-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-money-market-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `upload_broker` | Upload Broker | external | Broker running an external money-market system submitting daily batch files. |
| `back_office_system` | Back-Office Settlement System | system | Downstream ledger that consumes validated money-market transactions. |
| `business_support` | Business Support | human | Operations team resolving rejected transactions and reconciliation breaks. |
| `upload_engine` | Upload Processor | system | Validation, processing and reporting module for money-market batches. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `broker_code` | text | Yes | Broker Code | Validations: pattern |
| `processing_date` | date | Yes | Processing Date |  |
| `machine_date` | datetime | Yes | File Generation Date |  |
| `system_id` | text | Yes | Broker System Identifier |  |
| `card_code` | select | Yes | Record Card Code |  |
| `instrument_type` | select | No | Money Market Instrument Type |  |
| `investment_type` | select | No | Investment Type |  |
| `invest_no` | text | No | Broker Unique Investment Number | Validations: pattern |
| `account_code` | text | Yes | Client Account Code | Validations: pattern |
| `balance_code` | text | Yes | Balance Code | Validations: pattern |
| `notional_amount` | number | No | Notional / Capital Amount |  |
| `balance` | number | No | Investment Balance |  |
| `bank_rate` | number | No | Bank Quoted Rate (Yield) |  |
| `turn_rate` | number | No | Turn Rate |  |
| `client_rate` | number | No | Net Client Rate |  |
| `term_days` | number | No | Term in Days |  |
| `effective_date` | date | No | Effective Date |  |
| `maturity_date` | date | No | Maturity Date |  |
| `counterparty_account` | text | No | Borrower / Counterparty Account |  |
| `cash_alpha` | text | No | Money Market Cash Alpha |  |
| `narrative` | text | No | Statement Narrative |  |
| `record_count` | number | No | Trailer Record Count |  |
| `journal_balance` | number | No | Trailer Journal Balance |  |
| `batch_id` | text | No | Upload Batch Identifier |  |
| `day_count_convention` | select | No | Day Count Convention |  |
| `settlement_basis` | select | No | Settlement Basis |  |

## Rules

- **general:**
  - **rule_1:** Every batch must begin with a card-code 70 header and end with a card-code 99 trailer; missing either rejects the whole file.
  - **rule_2:** Header processing date must equal the run date of the back-office system or the entire batch is rejected.
  - **rule_3:** Trailer record count must equal the number of data records between header and trailer; mismatches reject the batch.
  - **rule_4:** Trailer journal balance must sum to zero; non-zero balances are accepted but flagged on the exception report.
  - **rule_5:** All fields use display format only — packed data, HIGH values and LOW values are prohibited.
  - **rule_6:** Unused alphanumeric fields must contain spaces; unused numeric fields must contain zeros.
  - **rule_7:** A header and trailer must be sent every business day even when there are no transactions in between.
  - **rule_8:** Money-market transactions must be loaded on a separate data set from any other financial upload stream.
  - **rule_9:** Transactions against lender ('C') or borrower ('CB') account types may only affect money-market balance codes.
  - **rule_10:** Broker code, client account codes, balance codes and GL account codes must be pre-loaded before upload.
  - **rule_11:** Fixed deposits submitted more than once before maturity, or with capital differing from balance, are flagged as possible early terminations.
  - **rule_12:** Investments must be uploaded daily with end-of-day status for any instrument that changed during the day; take-on uploads include all instruments regardless of movement.
  - **rule_13:** Memo transactions (MR/MD/MT/MF/MM) carry a zero amount; the narrative conveys the change detail.
  - **rule_14:** Interest accrues on actual/365 day count for call and fixed deposits unless the spec overrides at instrument level.
  - **rule_15:** Yield is quoted as bank rate; net client rate equals bank rate minus turn rate.
  - **rule_16:** Maturity value for discount instruments (NCD, CD, TB, BA) is computed from notional, yield and term; repos settle at agreed repurchase price.
  - **rule_17:** Day-end investment snapshots are retained in an audit store for regulatory reconstruction.
  - **rule_18:** Rejected transactions remain the broker's responsibility to correct and resubmit the next business day.

## Outcomes

### Upload_mm_trade_batch (Priority: 1)

_Broker submits a daily money-market batch file and the upload engine validates header/trailer then queues records for processing._

**Given:**
- `card_code` (input) eq `70`
- `broker_code` (input) exists
- `processing_date` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `mm.upload.batch.received`

### Validate_mm_trade (Priority: 2) — Error: `MM_UPLOAD_BATCH_REJECTED`

_Each record is validated against broker/account/balance masters and format rules; bad records are routed to the rejection report._

**Given:**
- ANY: `broker_code` (db) not_exists OR `account_code` (db) not_exists OR `balance_code` (db) not_exists

**Then:**
- **emit_event** event: `mm.upload.transaction.rejected`
- **create_record**

### Calculate_yield (Priority: 3)

_For each investment record (card 72) derive net client rate from bank rate minus turn rate using the configured day-count convention._

**Given:**
- `card_code` (input) eq `72`
- `bank_rate` (input) exists

**Then:**
- **set_field** target: `client_rate` value: `computed_bank_minus_turn`
- **emit_event** event: `mm.upload.yield.calculated`

### Calculate_maturity_value (Priority: 4)

_Compute maturity value for discount instruments (NCD, CD, TB, BA) and repurchase price for repos using notional, yield and term days on actual/365._

**Given:**
- `card_code` (input) eq `72`
- `maturity_date` (input) exists
- `notional_amount` (input) gt `0`

**Then:**
- **set_field** target: `maturity_value` value: `computed_from_notional_rate_term`
- **emit_event** event: `mm.upload.investment.booked`

### Schedule_maturity_processing (Priority: 5)

_Register a maturity event so the back office auto-processes redemption, interest accrual and capital return on the maturity date._

**Given:**
- `maturity_date` (input) gte `processing_date`

**Then:**
- **create_record**
- **emit_event** event: `mm.upload.maturity.scheduled`

### Reconcile_against_back_office (Priority: 6) — Error: `MM_UPLOAD_RECON_BREAK`

_Trailer journal balance and per-investment balances are reconciled with the back-office ledger; discrepancies raise exception reports._

**Given:**
- `journal_balance` (input) neq `0`

**Then:**
- **notify** target: `business_support`
- **emit_event** event: `mm.upload.reconciliation.break`
- **create_record**

### Process_accepted_batch (Priority: 7)

_Validated batches feed the cash-receipt, cash-payment and journal functions; investments are written to the MM investment store and day-end snapshot retained in audit._

**Given:**
- `batch_id` (db) exists
- `record_count` (input) gte `0`

**Then:**
- **call_service** target: `back_office_post_cash_and_journals`
- **create_record**
- **emit_event** event: `mm.upload.batch.validated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MM_UPLOAD_HEADER_MISSING` | 422 | Upload batch is missing the required header record. | No |
| `MM_UPLOAD_TRAILER_MISSING` | 422 | Upload batch is missing the required trailer record. | No |
| `MM_UPLOAD_PROCESSING_DATE_MISMATCH` | 422 | Header processing date does not match the current run date. | No |
| `MM_UPLOAD_RECORD_COUNT_MISMATCH` | 422 | Trailer record count does not match the number of data records in the batch. | No |
| `MM_UPLOAD_INVALID_BROKER` | 403 | Broker code is not registered for money-market upload. | No |
| `MM_UPLOAD_INVALID_ACCOUNT` | 422 | Client account code is not loaded for this broker. | No |
| `MM_UPLOAD_INVALID_BALANCE_CODE` | 422 | Balance code is not valid for the supplied account type. | No |
| `MM_UPLOAD_BAD_FORMAT` | 422 | Record contains packed data, HIGH values, LOW values or malformed fields. | No |
| `MM_UPLOAD_DUPLICATE_FIXED_DEPOSIT` | 409 | Fixed deposit submitted more than once before maturity. | No |
| `MM_UPLOAD_CAPITAL_MISMATCH` | 409 | Fixed deposit balance differs from original capital amount. | No |
| `MM_UPLOAD_JOURNAL_IMBALANCE` | 422 | Journal entries do not comply with double-entry rules. | No |
| `MM_UPLOAD_BATCH_REJECTED` | 422 | Upload batch rejected during validation; see exception report. | No |
| `MM_UPLOAD_RECON_BREAK` | 409 | Reconciliation break detected between broker and back-office balances. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mm.upload.batch.received` |  | `batch_id`, `broker_code`, `processing_date`, `record_count` |
| `mm.upload.batch.validated` |  | `batch_id`, `broker_code`, `processing_date`, `record_count` |
| `mm.upload.batch.rejected` |  | `batch_id`, `broker_code`, `processing_date`, `reason` |
| `mm.upload.transaction.accepted` |  | `batch_id`, `card_code`, `account_code`, `invest_no` |
| `mm.upload.transaction.rejected` |  | `batch_id`, `card_code`, `account_code`, `reason` |
| `mm.upload.investment.booked` |  | `invest_no`, `account_code`, `instrument_type`, `notional_amount`, `maturity_date` |
| `mm.upload.yield.calculated` |  | `invest_no`, `bank_rate`, `turn_rate`, `client_rate` |
| `mm.upload.maturity.scheduled` |  | `invest_no`, `account_code`, `maturity_date`, `maturity_value` |
| `mm.upload.reconciliation.break` |  | `batch_id`, `broker_code`, `journal_balance` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-money-market | extends |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
day_count:
  default: ACT_365
  supported:
    - ACT_365
    - ACT_360
settlement:
  default: T0
  supported:
    - T0
    - T1
interest_accrual:
  basis: actual_365
  posting: daily
  capitalisation: at_maturity_for_fixed
mm_instrument_types:
  NCD: Negotiable Certificate of Deposit (discount)
  CD: Certificate of Deposit (interest-bearing)
  TB: Treasury Bill (discount)
  BA: Banker's Acceptance (discount)
  REPO: Repurchase Agreement (sell and buy back)
  RREPO: Reverse Repurchase Agreement (buy and sell back)
  CALL: Call Deposit (variable rate, on demand)
  FIX: Fixed Deposit (term, fixed rate)
record_type_map:
  "70": Header
  "72": Investment
  "73": Cash Receipt (CR)
  "74": Cash Payment (CP)
  "75": Journal (J / IM for interest payable)
  "76": Memo - Interest Rate Change (MR)
  "77": Memo - DTI Change (MD)
  "78": Memo - Turn Percentage (MT)
  "79": Memo - Total Management Fee (MF)
  "80": Memo - Maturity Date Change (MM)
  "99": Trailer
record_layouts:
  "70":
    description: Header record - first record in every batch.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: FILLER_1
        start: 3
        length: 1
        end: 3
        type: alpha
      - name: BRK_CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: FILLER_2
        start: 7
        length: 1
        end: 7
        type: alpha
      - name: MACHINE_DTE
        start: 8
        length: 8
        end: 15
        type: numeric
      - name: FILLER_3
        start: 16
        length: 1
        end: 16
        type: alpha
      - name: MACHINE_TME
        start: 17
        length: 8
        end: 24
        type: numeric
      - name: FILLER_4
        start: 25
        length: 1
        end: 25
        type: alpha
      - name: DATE
        start: 26
        length: 8
        end: 33
        type: numeric
      - name: FILLER_5
        start: 34
        length: 1
        end: 34
        type: alpha
      - name: SYSTEM_ID
        start: 35
        length: 4
        end: 38
        type: alpha
      - name: FILLER_6
        start: 39
        length: 212
        end: 250
        type: alpha
  "72":
    description: Investment record - one end-of-day snapshot per changed investment.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: EFF_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: MAT_DET
        start: 29
        length: 8
        end: 36
        type: numeric
      - name: ACC_CDE
        start: 37
        length: 7
        end: 43
        type: numeric
      - name: BRK_ACC
        start: 44
        length: 7
        end: 50
        type: alpha
      - name: REF_NO
        start: 51
        length: 17
        end: 67
        type: alpha
      - name: BAL_CDE
        start: 68
        length: 2
        end: 69
        type: alpha
      - name: INV_TYP
        start: 70
        length: 2
        end: 71
        type: alpha
      - name: INT_RATE
        start: 72
        length: 9
        end: 80
        type: numeric
      - name: TRN_RATE
        start: 81
        length: 9
        end: 89
        type: numeric
      - name: CLNT_RATE
        start: 90
        length: 9
        end: 98
        type: numeric
      - name: CAP_AMT
        start: 99
        length: 15
        end: 113
        type: numeric
      - name: SIGN_BAL
        start: 114
        length: 1
        end: 114
        type: alpha
      - name: BALANCE
        start: 115
        length: 15
        end: 129
        type: numeric
      - name: BRW_ACC_CDE
        start: 130
        length: 7
        end: 136
        type: numeric
      - name: BRW_BAL_CDE
        start: 137
        length: 2
        end: 138
        type: alpha
      - name: INV_NO
        start: 139
        length: 9
        end: 147
        type: alpha
      - name: NARRATIVE
        start: 148
        length: 40
        end: 187
        type: alpha
      - name: FILLER
        start: 188
        length: 63
        end: 250
        type: alpha
  "73":
    description: Cash Receipt (CR) - funds received from client or DTI, including
      interest received.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: DEP_NO
        start: 21
        length: 7
        end: 27
        type: numeric
      - name: CASH_ALPHA
        start: 28
        length: 2
        end: 29
        type: alpha
      - name: AGE_DATE
        start: 30
        length: 8
        end: 37
        type: numeric
      - name: ACC_CDE
        start: 38
        length: 7
        end: 44
        type: numeric
      - name: BAL_CDE
        start: 45
        length: 2
        end: 46
        type: alpha
      - name: DES_CDE
        start: 47
        length: 2
        end: 48
        type: alpha
      - name: AMOUNT
        start: 49
        length: 13
        end: 61
        type: numeric
      - name: NARRATIVE
        start: 62
        length: 40
        end: 101
        type: alpha
      - name: BRN_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: PAR_CDE
        start: 104
        length: 2
        end: 105
        type: alpha
      - name: INVEST_NO
        start: 106
        length: 9
        end: 114
        type: alpha
      - name: RG_CDE
        start: 115
        length: 2
        end: 116
        type: alpha
      - name: FILLER
        start: 117
        length: 134
        end: 250
        type: alpha
  "74":
    description: Cash Payment (CP) - funds paid by broker to client or DTI.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: CHEQ_NO
        start: 21
        length: 7
        end: 27
        type: numeric
      - name: CASH_ALPHA
        start: 28
        length: 2
        end: 29
        type: alpha
      - name: AGE_DATE
        start: 30
        length: 8
        end: 37
        type: numeric
      - name: ACC_CDE
        start: 38
        length: 7
        end: 44
        type: numeric
      - name: BAL_CDE
        start: 45
        length: 2
        end: 46
        type: alpha
      - name: DES_CDE
        start: 47
        length: 2
        end: 48
        type: alpha
      - name: AMOUNT
        start: 49
        length: 13
        end: 61
        type: numeric
      - name: NARRATIVE
        start: 62
        length: 40
        end: 101
        type: alpha
      - name: BRN_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: PAR_CDE
        start: 104
        length: 2
        end: 105
        type: alpha
      - name: INVEST_NO
        start: 106
        length: 9
        end: 114
        type: alpha
      - name: RG_CDE
        start: 115
        length: 2
        end: 116
        type: alpha
      - name: PAYEE
        start: 117
        length: 40
        end: 156
        type: alpha
      - name: FILLER
        start: 157
        length: 94
        end: 250
        type: alpha
  "75":
    description: Journal (J / IM) - double-entry journal including interest payable
      journals.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "76":
    description: Memo - Interest Rate Change (MR). Zero amount; narrative carries new rate.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "77":
    description: Memo - DTI Change (MD). Same layout as 76; narrative = 'yy/mm/dd
      funds trf to xxx'.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "78":
    description: Memo - Turn Percentage (MT). Narrative = 'Average (or actual) turn 99.99'.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "79":
    description: Memo - Total Management Fee (MF). Narrative = 'Total Management Fee
      9(13).99'.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "80":
    description: Memo - Maturity Date Change (MM). Narrative = 'New Maturity Date yy/mm/dd'.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: BRK_CDE
        start: 3
        length: 3
        end: 5
        type: numeric
      - name: DATE
        start: 6
        length: 8
        end: 13
        type: numeric
      - name: SEQ_NO
        start: 14
        length: 7
        end: 20
        type: numeric
      - name: AGE_DATE
        start: 21
        length: 8
        end: 28
        type: numeric
      - name: REF_NO
        start: 29
        length: 6
        end: 34
        type: alpha
      - name: ACC_CDE
        start: 35
        length: 7
        end: 41
        type: numeric
      - name: BAL_CDE
        start: 42
        length: 2
        end: 43
        type: numeric
      - name: DES_CDE
        start: 44
        length: 2
        end: 45
        type: alpha
      - name: SIGN
        start: 46
        length: 1
        end: 46
        type: alpha
      - name: AMOUNT
        start: 47
        length: 13
        end: 59
        type: numeric
      - name: NARRATIVE
        start: 60
        length: 40
        end: 99
        type: alpha
      - name: BRN_CDE
        start: 100
        length: 2
        end: 101
        type: alpha
      - name: PAR_CDE
        start: 102
        length: 2
        end: 103
        type: alpha
      - name: INVEST_NO
        start: 104
        length: 9
        end: 112
        type: alpha
      - name: RG_CDE
        start: 113
        length: 2
        end: 114
        type: alpha
      - name: FILLER
        start: 115
        length: 136
        end: 250
        type: alpha
  "99":
    description: Trailer record - last record in every batch with control totals.
    fields:
      - name: CARD_CDE
        start: 1
        length: 2
        end: 2
        type: numeric
      - name: FILLER_1
        start: 3
        length: 1
        end: 3
        type: alpha
      - name: BRK_CDE
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: FILLER_2
        start: 7
        length: 1
        end: 7
        type: alpha
      - name: MACHINE_DTE
        start: 8
        length: 8
        end: 15
        type: numeric
      - name: FILLER_3
        start: 16
        length: 1
        end: 16
        type: alpha
      - name: MACHINE_TME
        start: 17
        length: 8
        end: 24
        type: numeric
      - name: FILLER_4
        start: 25
        length: 1
        end: 25
        type: alpha
      - name: REC_CNT
        start: 26
        length: 7
        end: 32
        type: numeric
      - name: FILLER_5
        start: 33
        length: 1
        end: 33
        type: alpha
      - name: JNL_SIGN
        start: 34
        length: 1
        end: 34
        type: alpha
      - name: FILLER_6
        start: 35
        length: 1
        end: 35
        type: alpha
      - name: JNL_BAL
        start: 36
        length: 13
        end: 48
        type: numeric
      - name: FILLER_7
        start: 49
        length: 202
        end: 250
        type: alpha
transaction_code_map:
  "72":
    trans_code: INV
    desig_code: null
    description: Investment
  "73":
    trans_code: CR
    desig_code: null
    description: Cash receipt
  "74":
    trans_code: CP
    desig_code: null
    description: Cash payment
  "76":
    trans_code: MR
    desig_code: null
    description: Interest rate change
  "77":
    trans_code: MD
    desig_code: null
    description: DTI change
  "78":
    trans_code: MT
    desig_code: null
    description: Turn rate
  "79":
    trans_code: MF
    desig_code: null
    description: Total management fee
  "80":
    trans_code: MM
    desig_code: null
    description: Maturity date change
  75_IM:
    trans_code: J
    desig_code: IM
    description: Interest payable journal
  75_J:
    trans_code: J
    desig_code: null
    description: Any other journal
reports:
  upload_summary: Daily report showing closing balance per investment plus all
    accepted transactions.
  rejection_report: Daily report (PCOMPR equivalent) listing rejected transactions
    for broker resubmission.
  statements:
    types:
      - all_transactions
      - balance_only
      - consolidated
    disclosure_options:
      - rand
      - rate
      - message
      - balance_only
pre_requisites:
  - Broker MM indicator set to 'U' for upload brokers on broker master.
  - Account type 'CB' loaded for borrower accounts.
  - Lender ('C') and borrower ('CB') accounts created with MM indicator 'Y' and
    mandate date recorded.
  - Money-market balance codes loaded (one per investment for lenders; fixed and
    call minimum for borrowers).
  - Money-market cash alpha banking account configured with a system default.
  - Money-market GL accounts configured for interest paid, client control,
    borrower control, MM turn and VAT on MM fee.
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Money Market Upload Blueprint",
  "description": "Daily bulk upload of money market investments, cash movements, journals and memo transactions from external broker systems via fixed-width card-code records.. 2",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "money-market, bulk-upload, fixed-width, investments, ncd, deposits, back-office"
}
</script>
