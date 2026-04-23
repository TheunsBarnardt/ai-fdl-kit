---
title: "Broker Financial Data Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules"
---

# Broker Financial Data Upload Blueprint

> Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules

| | |
|---|---|
| **Feature** | `broker-financial-data-upload` |
| **Category** | Trading |
| **Version** | 1.1.0 |
| **Tags** | back-office, broker, upload, financial-data, cash-book, journal, gl, fixed-width, double-entry |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-financial-data-upload.blueprint.yaml) |
| **JSON API** | [broker-financial-data-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-financial-data-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `broker_finance_user` | Broker Finance User | human |  |
| `gl_engine` | General Ledger Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `layout_number` | text | Yes | Layout Number | Validations: pattern |
| `broker_code` | text | Yes | Broker Code |  |
| `process_date` | date | Yes | Process Date |  |
| `age_date` | date | No | Age Date |  |
| `account_code` | text | No | GL Account Code |  |
| `balance_code` | text | No | Balance Code |  |
| `designation_code` | text | No | Designation Code |  |
| `amount_sign` | text | No | Amount Sign | Validations: pattern |
| `amount` | number | No | Amount (2 implied decimals) |  |
| `narrative` | text | No | Narrative |  |
| `cheque_number` | text | No | Cheque Number |  |
| `cash_alpha_code` | text | No | Cash Alpha Code |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `general_analysis_code` | text | No | General Analysis Code |  |
| `registration_code` | text | No | Nominee Registration Code |  |
| `payee` | text | No | Payee Name |  |
| `electronic_payment_indicator` | text | No | Electronic Payment Indicator |  |
| `reference_number` | text | No | Journal Reference Number |  |
| `sequence` | text | No | Header Sequence |  |
| `records_total` | number | No | Trailer Total Records |  |
| `records_processed` | number | No | Records Processed |  |
| `records_rejected` | number | No | Records Rejected |  |
| `financial_entry_type` | select | No | Financial Entry Type |  |
| `currency_code` | text | No | Transaction Currency |  |
| `fx_rate` | number | No | FX Conversion Rate |  |
| `reversal_flag` | boolean | No | Reversal Flag |  |

## Rules

- **submission:** MUST: Support FTP automated submission, MUST: Support online automated upload, MUST: Support online manual upload via release function, MUST: Support batch upload mode, MUST: Configure response email addresses before allowing upload, MUST: Limit manual online uploads to 500 entries per file
- **validation:** MUST: Report errors via common error enquiry console per record, MUST: Generate response dataset with per-record status and error messages, MUST: Reject the whole file on trailer errors (missing, duplicate, mismatched broker, total mismatch), MUST: Zero-fill numeric fields when no value is present (never leave empty), MUST: Validate process date equals run date for each record, MUST: Validate broker code on each record equals header broker code
- **format:** MUST: Use non-delimited fixed-length record format, MUST: Every record is exactly 173 characters, MUST: Start with Header Record (Layout 000) for online uploads, MUST: End with Trailer Record (Layout 999) for online uploads, MUST: Use Layout 063 for cash book receipts, MUST: Use Layout 064 for cash book payments, MUST: Use Layout 065 for general journal entries, MUST: Amount fields carry 2 implied decimals (no decimal point in wire format)
- **gl_accounts:** MUST: Validate referenced GL account code exists and is active, MUST: Validate balance code is permitted for the account, MUST: Validate designation code combination against account rules, MUST: Reject postings to closed or suspended GL accounts
- **double_entry:** MUST: Every journal batch debits must equal credits to two-decimal precision, MUST: Cash receipt posts debit to bank/cash account, credit to client/GL account, MUST: Cash payment posts credit to bank/cash account, debit to client/GL account, MUST: Reject any journal where aggregate debit-credit difference is non-zero
- **currency:** MUST: Convert foreign currency amounts to base currency at official FX rate, MUST: Round converted amounts to 2 decimals using half-up rounding, MUST: Record the FX rate and original currency on every converted posting
- **reversal:** MUST: Reverse a cash receipt by posting an equal and opposite cash payment, MUST: Reverse a cash payment by posting an equal and opposite cash receipt, MUST: Allow same-day (T+0) reversal without additional approval, MUST: Require finance supervisor approval to reverse an entry posted on a prior date, MUST: Prohibit reversal once the period has been closed

## Outcomes

### Automated_ftp_upload (Priority: 1)

_Broker submits financial data via FTP and it is processed automatically_

**Given:**
- `upload_method` (input) eq `ftp`
- `email_configured` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.received`

### Manual_online_upload (Priority: 2)

_Broker uploads financial data via online manual interface with header and trailer_

**Given:**
- `upload_method` (input) eq `online_manual`
- `record_count` (input) lte `500`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.manual_received`

### Bulk_gl_entry_upload (Priority: 3)

_Accept a bulk file of GL entries (XOP, GL, fees, refunds) and dispatch to the ledger engine_

**Given:**
- `layout_number` (input) in `063,064,065`
- `record_count` (input) gt `0`

**Then:**
- **call_service** target: `gl_entry_parser`
- **emit_event** event: `fin_upload.bulk_gl.received`
- **create_record**

### Gl_account_validation (Priority: 4)

_Validate every referenced GL account exists, is active and accepts the balance code_

**Given:**
- `account_code` (input) exists

**Then:**
- **call_service** target: `gl_account_validator`
- **emit_event** event: `fin_upload.account.validated`

### Gl_account_invalid (Priority: 5) — Error: `FIN_UPLOAD_INVALID_ACCOUNT`

_Referenced GL account is unknown, closed or suspended_

**Given:**
- `account_status` (db) in `unknown,closed,suspended`

**Then:**
- **emit_event** event: `fin_upload.account.rejected`

### Double_entry_validation (Priority: 6)

_Each cash and journal posting generates a matched debit and credit leg_

**Given:**
- `layout_number` (input) in `063,064,065`

**Then:**
- **call_service** target: `double_entry_poster`
- **emit_event** event: `fin_upload.double_entry.posted`

### Debit_credit_balancing (Priority: 7)

_Aggregate debits and credits across a journal batch must balance to zero_

**Given:**
- `debit_total` (computed) exists
- `credit_total` (computed) exists

**Then:**
- **call_service** target: `batch_balancer`
- **emit_event** event: `fin_upload.batch.balanced`

### Unbalanced_journal (Priority: 8) — Error: `FIN_UPLOAD_UNBALANCED_JOURNAL`

_Debit and credit totals differ for the batch_

**Given:**
- `debit_credit_diff` (computed) neq `0`

**Then:**
- **emit_event** event: `fin_upload.journal.unbalanced`

### Currency_conversion_rounding (Priority: 9)

_Convert foreign-currency amounts to base currency and round to 2 decimals half-up_

**Given:**
- `currency_code` (input) neq `base`
- `fx_rate` (input) gt `0`

**Then:**
- **set_field** target: `amount_base_ccy` value: `computed_rounded`
- **emit_event** event: `fin_upload.currency.converted`

### Same_day_reversal (Priority: 10)

_Allow T+0 reversal by posting an equal and opposite entry without additional approval_

**Given:**
- `reversal_flag` (input) eq `true`
- `original_post_date` (db) eq `today`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.reversal.same_day`

### Prior_date_reversal (Priority: 11)

_Reversal of an entry posted on a prior date requires supervisor approval and open period_

**Given:**
- `reversal_flag` (input) eq `true`
- `original_post_date` (db) lt `today`
- `supervisor_approved` (input) eq `true`
- `period_status` (db) eq `open`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.reversal.prior_date`

### Reversal_period_closed (Priority: 12) — Error: `FIN_UPLOAD_PERIOD_CLOSED`

_Reversal attempted against a closed accounting period_

**Given:**
- `period_status` (db) eq `closed`

**Then:**
- **emit_event** event: `fin_upload.reversal.blocked`

### Trailer_mismatch (Priority: 13) — Error: `FIN_UPLOAD_TRAILER_MISMATCH`

_Trailer totals do not match the records actually received_

**Given:**
- `trailer_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `fin_upload.trailer.rejected`

### Generate_response_dataset (Priority: 20)

_Generate response dataset with per-record error lines and notify configured addresses_

**Given:**
- `processing_complete` (computed) eq `true`

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `fin_upload.response.delivered`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FIN_UPLOAD_INVALID_LAYOUT` | 400 | Financial data upload file has invalid layout structure | No |
| `FIN_UPLOAD_UNBALANCED_JOURNAL` | 422 | Journal entry debits do not equal credits | No |
| `FIN_UPLOAD_INVALID_ACCOUNT` | 422 | Referenced GL account does not exist or is not active | No |
| `FIN_UPLOAD_DUPLICATE_REFERENCE` | 409 | Transaction reference already exists | No |
| `FIN_UPLOAD_TRAILER_MISMATCH` | 422 | Trailer record total does not match records submitted | No |
| `FIN_UPLOAD_CURRENCY_INVALID` | 422 | Currency code not recognised or no FX rate available | No |
| `FIN_UPLOAD_REVERSAL_NOT_ALLOWED` | 403 | Reversal of prior-period entry requires supervisor approval | No |
| `FIN_UPLOAD_PERIOD_CLOSED` | 423 | Accounting period is closed - reversal not permitted | No |
| `FIN_UPLOAD_PROCESSING_FAILED` | 500 | Financial upload processing failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fin_upload.received` |  | `broker_code`, `layout_number`, `process_date` |
| `fin_upload.manual_received` |  | `broker_code`, `sequence`, `record_count` |
| `fin_upload.bulk_gl.received` |  | `broker_code`, `record_count`, `layout_number` |
| `fin_upload.account.validated` |  | `account_code`, `balance_code` |
| `fin_upload.account.rejected` |  | `account_code`, `reason` |
| `fin_upload.double_entry.posted` |  | `reference_number`, `debit_total`, `credit_total` |
| `fin_upload.batch.balanced` |  | `reference_number`, `debit_total`, `credit_total` |
| `fin_upload.journal.unbalanced` |  | `reference_number`, `debit_credit_diff` |
| `fin_upload.currency.converted` |  | `currency_code`, `fx_rate`, `amount`, `amount_base_ccy` |
| `fin_upload.reversal.same_day` |  | `reference_number`, `broker_code` |
| `fin_upload.reversal.prior_date` |  | `reference_number`, `broker_code`, `original_post_date` |
| `fin_upload.reversal.blocked` |  | `reference_number`, `period_status` |
| `fin_upload.trailer.rejected` |  | `broker_code`, `records_total`, `records_received` |
| `fin_upload.response.delivered` |  | `broker_code`, `sequence`, `records_processed`, `records_rejected` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Financial Data Upload

Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules

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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| automated_ftp_upload | `autonomous` | - | - |
| manual_online_upload | `autonomous` | - | - |
| bulk_gl_entry_upload | `autonomous` | - | - |
| gl_account_validation | `autonomous` | - | - |
| gl_account_invalid | `autonomous` | - | - |
| double_entry_validation | `autonomous` | - | - |
| debit_credit_balancing | `autonomous` | - | - |
| unbalanced_journal | `autonomous` | - | - |
| currency_conversion_rounding | `autonomous` | - | - |
| same_day_reversal | `autonomous` | - | - |
| prior_date_reversal | `autonomous` | - | - |
| reversal_period_closed | `autonomous` | - | - |
| trailer_mismatch | `autonomous` | - | - |
| generate_response_dataset | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
financial_entry_types:
  XOP:
    name: Cross Operation
    description: Inter-account transfer between two broker-held accounts
    layouts:
      - "065"
  GL:
    name: General Ledger Journal
    description: Standalone ledger posting not tied to a cash movement
    layouts:
      - "065"
  CR:
    name: Cash Receipt
    description: Inbound cash movement debiting the bank/cash ledger
    layouts:
      - "063"
  CP:
    name: Cash Payment
    description: Outbound cash movement crediting the bank/cash ledger
    layouts:
      - "064"
  FEE:
    name: Fee Charge
    description: Fee posted against a client or internal account
    layouts:
      - "065"
      - "064"
  REF:
    name: Refund
    description: Refund posted as reversal of a prior fee or receipt
    layouts:
      - "063"
      - "064"
record_type_map:
  "999": Trailer Record
  "000": Header Record
  "063": Cash Book Receipts
  "064": Cash Book Payments
  "065": Journal Record
record_layouts:
  HEADER_000:
    total_length: 173
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: procs_tme
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: prefix
        start: 21
        length: 1
        type: char
        end: 21
      - name: sequence
        start: 22
        length: 7
        type: char
        end: 28
      - name: filler
        start: 29
        length: 145
        type: char
        end: 173
  CASH_RECEIPT_063:
    total_length: 173
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: chq_no
        start: 15
        length: 7
        type: numeric
        end: 21
      - name: cash_alpha
        start: 22
        length: 2
        type: char
        end: 23
      - name: age_dte
        start: 24
        length: 8
        type: numeric
        end: 31
      - name: acc_cde
        start: 32
        length: 7
        type: numeric
        end: 38
      - name: bal_cde
        start: 39
        length: 2
        type: char
        end: 40
      - name: des_cde
        start: 41
        length: 2
        type: char
        end: 42
      - name: amt_sign
        start: 43
        length: 1
        type: char
        end: 43
      - name: amt
        start: 44
        length: 13
        type: numeric
        end: 56
      - name: narrative
        start: 57
        length: 40
        type: char
        end: 96
      - name: brn_cde
        start: 97
        length: 2
        type: char
        end: 98
      - name: partner_cde
        start: 99
        length: 2
        type: char
        end: 100
      - name: genl_anal
        start: 101
        length: 9
        type: char
        end: 109
      - name: reg_cde
        start: 110
        length: 2
        type: numeric
        end: 111
      - name: filler
        start: 112
        length: 62
        type: char
        end: 173
  CASH_PAYMENT_064:
    total_length: 173
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: chq_no
        start: 15
        length: 7
        type: numeric
        end: 21
      - name: cash_alpha
        start: 22
        length: 2
        type: char
        end: 23
      - name: age_dte
        start: 24
        length: 8
        type: numeric
        end: 31
      - name: acc_cde
        start: 32
        length: 7
        type: numeric
        end: 38
      - name: bal_cde
        start: 39
        length: 2
        type: char
        end: 40
      - name: des_cde
        start: 41
        length: 2
        type: char
        end: 42
      - name: amt_sign
        start: 43
        length: 1
        type: char
        end: 43
      - name: amt
        start: 44
        length: 13
        type: numeric
        end: 56
      - name: narrative
        start: 57
        length: 40
        type: char
        end: 96
      - name: brn_cde
        start: 97
        length: 2
        type: char
        end: 98
      - name: partner_cde
        start: 99
        length: 2
        type: char
        end: 100
      - name: genl_anal
        start: 101
        length: 9
        type: char
        end: 109
      - name: reg_cde
        start: 110
        length: 2
        type: numeric
        end: 111
      - name: payee
        start: 112
        length: 40
        type: char
        end: 151
      - name: el_pay_ind
        start: 152
        length: 1
        type: char
        end: 152
      - name: filler
        start: 153
        length: 21
        type: char
        end: 173
  JOURNAL_065:
    total_length: 173
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: age_dte
        start: 15
        length: 8
        type: numeric
        end: 22
      - name: ref_no
        start: 23
        length: 6
        type: char
        end: 28
      - name: acc_cde
        start: 29
        length: 7
        type: numeric
        end: 35
      - name: bal_cde
        start: 36
        length: 2
        type: char
        end: 37
      - name: des_cde
        start: 38
        length: 2
        type: char
        end: 39
      - name: amt_sign
        start: 40
        length: 1
        type: char
        end: 40
      - name: amt
        start: 41
        length: 13
        type: numeric
        end: 53
      - name: narrative
        start: 54
        length: 40
        type: char
        end: 93
      - name: brn_cde
        start: 94
        length: 2
        type: char
        end: 95
      - name: partner_cde
        start: 96
        length: 2
        type: char
        end: 97
      - name: genl_anal
        start: 98
        length: 9
        type: char
        end: 106
      - name: reg_cde
        start: 107
        length: 2
        type: numeric
        end: 108
      - name: filler
        start: 109
        length: 65
        type: char
        end: 173
  TRAILER_999:
    total_length: 173
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: procs_tme
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: recs_tot
        start: 21
        length: 9
        type: numeric
        end: 29
      - name: recs_proc
        start: 30
        length: 9
        type: numeric
        end: 38
      - name: recs_rej
        start: 39
        length: 9
        type: numeric
        end: 47
      - name: filler
        start: 48
        length: 126
        type: char
        end: 173
  RESPONSE_RECORD:
    total_length: 700
    fields:
      - name: card_cde
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: brk_cde
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: procs_dte
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: procs_tme
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: total_records
        start: 21
        length: 9
        type: numeric
        end: 29
      - name: records_processed
        start: 30
        length: 9
        type: numeric
        end: 38
      - name: records_rejected
        start: 39
        length: 9
        type: numeric
        end: 47
      - name: filler
        start: 48
        length: 653
        type: char
        end: 700
      - name: count_of_msgs
        start: 701
        length: 3
        type: numeric
        end: 703
      - name: error_message
        start: 704
        length: 50
        type: char
        end: 753
submission_methods:
  - Automated FTP upload
  - Online automated upload
  - Online manual upload (release via back-office console)
  - Batch upload
workflow:
  - 1. Email address setup
  - 2. File submission
  - 3. Error reporting via common error enquiry console
  - 4. Response dataset generation
  - 5. Edit opportunity before final processing
reversal_matrix:
  same_day:
    approval: none
    allowed: true
  prior_date_open_period:
    approval: finance_supervisor
    allowed: true
  prior_date_closed_period:
    approval: not_applicable
    allowed: false
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Financial Data Upload Blueprint",
  "description": "Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, financial-data, cash-book, journal, gl, fixed-width, double-entry"
}
</script>
