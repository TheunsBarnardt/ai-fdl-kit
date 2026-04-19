---
title: "Broker Deal Management Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Fixed-width bulk upload of deal allocations, same-day allocations, deals, amendments and cancellations to back-office with settlement-cycle aware rules. 44 fiel"
---

# Broker Deal Management Upload Blueprint

> Fixed-width bulk upload of deal allocations, same-day allocations, deals, amendments and cancellations to back-office with settlement-cycle aware rules

| | |
|---|---|
| **Feature** | `broker-deal-management-upload` |
| **Category** | Trading |
| **Version** | 1.1.0 |
| **Tags** | back-office, broker, upload, deal-allocation, settlement, amendment, cancellation, fixed-width |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-deal-management-upload.blueprint.yaml) |
| **JSON API** | [broker-deal-management-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-deal-management-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `broker_dealing_room` | Broker Dealing Room | human |  |
| `settlement_authority` | Settlement Authority | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `record_type` | text | Yes | Record Type |  |
| `card_code` | text | Yes | Card Code |  |
| `broker_code` | text | Yes | Broker Code |  |
| `transaction_code` | select | Yes | Transaction Code |  |
| `sequence_number` | text | Yes | Sequence Number |  |
| `upload_date` | date | Yes | Upload Date |  |
| `upload_time` | text | No | Upload Time |  |
| `deal_reference` | text | Yes | Deal Reference |  |
| `order_reference` | text | No | Order Reference |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | No | Settlement Date |  |
| `settlement_cycle` | select | No | Settlement Cycle |  |
| `buy_sell_indicator` | select | Yes | Buy Sell Indicator |  |
| `instrument_type` | text | No | Instrument Type |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `isin` | text | No | ISIN |  |
| `country_code` | text | No | Country Code |  |
| `quantity` | number | Yes | Quantity |  |
| `price` | number | Yes | Price |  |
| `consideration` | number | No | Consideration |  |
| `trade_time` | text | No | Trade Time |  |
| `trade_capacity` | select | No | Trade Capacity |  |
| `client_account` | text | Yes | Client Account (internal) |  |
| `allocation_account` | text | No | Allocation Account |  |
| `external_account_code` | text | No | External Account Code |  |
| `fund_code` | text | No | Fund Manager Code |  |
| `commission_amount` | number | No | Commission Amount |  |
| `charges_amount` | number | No | Charges Amount |  |
| `vat_amount` | number | No | VAT Amount |  |
| `stt_amount` | number | No | Securities Transfer Tax Amount |  |
| `reference_page_no` | text | No | Reference Page Number |  |
| `reference_line_no` | text | No | Reference Line Number |  |
| `reference_order_number` | text | No | Reference Order Number |  |
| `charge_structure_code` | text | No | Charge Structure Code |  |
| `terms_input` | text | No | Terms Input |  |
| `negotiated_commission` | number | No | Negotiated Commission |  |
| `average_indicator` | text | No | Average Price Indicator |  |
| `non_external_flag` | select | No | Non-External Flag |  |
| `cancellation_reason` | text | No | Cancellation Reason |  |
| `amendment_reason` | text | No | Amendment Reason |  |
| `original_deal_reference` | text | No | Original Deal Reference (for amendments/cancellations) |  |
| `new_price` | number | No | New Price (for price amendment) |  |
| `new_consideration` | number | No | New Consideration (for consideration amendment) |  |
| `pre_settlement_flag` | boolean | No | Pre-Settlement Amendment |  |

## Rules

- **submission_modes:** MUST: Support manual submission of deal allocations via FTP, MUST: Support automated submission of deal allocations via FTP, MUST: Support automated submission of same-day allocations, MUST: Support automated submission of deals upload, MUST: Support bulk amendment, cancellation, and reversal uploads
- **file_structure:** MUST: Every upload file starts with Header record (CARD-CODE 000) and ends with Trailer record (CARD-CODE 999), MUST: Header contains broker code, process date (CCYYMMDD), process time (HHMMSS), 'S' prefix and 7-char broker-controlled sequence, MUST: Trailer totals must equal the count of detail records; otherwise entire file is rejected, MUST: All fields are positional; mandatory or optional fields must be space or zero filled, MUST: Total detail record length is 150 bytes
- **setup:** MUST: Complete member FTP dataset configuration before first use, MUST: Configure up to 100 notification email addresses per process type
- **validation:** MUST: Validate external account code maps to an internal client account, MUST: Validate fund manager code is present when external account code is used, MUST: Validate buy/sell indicator is 'P' or 'S', MUST: Validate ISIN first 2 bytes match country code, MUST: Validate trade date is today or a previous business day, MUST: Reject unbalanced or incomplete allocation records, MUST: Records with the reserved broker comment code are treated as comment records (columns 4-80) and skipped during processing
- **transaction_codes:** MUST: Every detail record carries a CARD-CODE identifying the record layout (100, 101, 102, etc.), MUST: Transaction codes (DF/DP/DU/DC/ES/OM/RV/DA/SD) identify the business action
- **settlement:** MUST: Default settlement cycle is T+3 for standard equity trades, MUST: Support T+2 settlement for instruments operating on shorter cycle, MUST: Same-day allocation age_date must equal the online business date
- **amendment:** MUST: Pre-settlement amendments (trade_date to settlement_date - 1) allow price, consideration, account and quantity changes, MUST: Post-settlement amendments are restricted to consideration adjustments and require settlement-authority approval, MUST: Cancellation after settlement requires a reverse-settled-trade (RV) record, not a DC, MUST: All amendments must reference the original_deal_reference
- **duplicate_control:** MUST: Sequence numbers should not be reused; repeated sequence overwrites the previous response file, MUST: For the multi-file dataset variant, sequence number must be unique in perpetuity per broker

## Outcomes

### Header_validation (Priority: 1) — Error: `DEAL_UPLOAD_HEADER_MISSING`

_Validate header record presence and format_

**Given:**
- `card_code` (input) neq `000`

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Trailer_mismatch (Priority: 2) — Error: `DEAL_UPLOAD_TRAILER_MISMATCH`

_Reject entire file if trailer totals do not reconcile_

**Given:**
- `trailer_total_records` (input) neq `detail_record_count`

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Sequence_reuse_detected (Priority: 3) — Error: `DEAL_UPLOAD_SEQUENCE_REUSED`

_Multi-file dataset variant rejects reused sequence numbers_

**Given:**
- `sequence_number` (db) exists
- `dataset_variant` (input) eq `multi_file`

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Manual_deal_allocation_upload (Priority: 10)

_Broker manually submits deal allocations via FTP ALLOUP_

**Given:**
- `submission_mode` (input) eq `manual_ftp`

**Then:**
- **create_record**
- **emit_event** event: `broker.deal.upload.received`

### Automated_deal_allocation_upload (Priority: 11)

_Automated deal allocation upload via ALLUPO_

**Given:**
- `submission_mode` (input) eq `automated_ftp`

**Then:**
- **create_record**
- **emit_event** event: `broker.deal.upload.received`

### Same_day_allocation_upload (Priority: 12)

_Same-day allocation upload processed intraday_

**Given:**
- `transaction_code` (input) eq `SD`
- `submission_time` (system) lt `cutoff_time`

**Then:**
- **create_record**
- **emit_event** event: `broker.deal.upload.received`

### Deals_upload (Priority: 13)

_Automated deals upload via DLSUPL near-real-time_

**Given:**
- `transaction_code` (input) in `DF,DP`

**Then:**
- **create_record**
- **emit_event** event: `broker.deal.upload.received`

### Bulk_allocate_trades (Priority: 20) | Transaction: atomic

_Bulk allocate one or more booked trades to client accounts_

**Given:**
- `transaction_code` (input) eq `DA`
- `allocation_account` (input) exists

**Then:**
- **call_service** target: `external_account_mapper`
- **create_record**
- **emit_event** event: `broker.deal.allocated`

### Cancel_trade (Priority: 21) — Error: `DEAL_UPLOAD_ORIGINAL_DEAL_NOT_FOUND` | Transaction: atomic

_Cancel a pre-settlement trade via DC record_

**Given:**
- `transaction_code` (input) eq `DC`
- `pre_settlement_flag` (input) eq `true`

**Then:**
- **transition_state** field: `deal_status` from: `booked` to: `cancelled`
- **emit_event** event: `broker.deal.cancelled`

### Cancel_after_settlement_denied (Priority: 22) — Error: `DEAL_UPLOAD_CANCEL_AFTER_SETTLEMENT`

_Reject DC records against already-settled trades_

**Given:**
- `transaction_code` (input) eq `DC`
- `pre_settlement_flag` (input) eq `false`

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Amend_trade_price (Priority: 23) | Transaction: atomic

_Amend the price of a pre-settlement trade via DU record_

**Given:**
- `transaction_code` (input) eq `DU`
- `pre_settlement_flag` (input) eq `true`
- `new_price` (input) gt `0`

**Then:**
- **set_field** target: `price` value: `new_price`
- **emit_event** event: `broker.deal.amended`

### Amend_trade_consideration (Priority: 24) | Transaction: atomic

_Amend the consideration value of a trade (pre- or post-settlement with approval)_

**Given:**
- `transaction_code` (input) eq `DU`
- `new_consideration` (input) gt `0`

**Then:**
- **set_field** target: `consideration` value: `new_consideration`
- **emit_event** event: `broker.deal.amended`

### Post_settlement_amend_denied (Priority: 25) — Error: `DEAL_UPLOAD_POST_SETTLEMENT_AMEND_DENIED`

_Reject post-settlement amendments without settlement-authority approval_

**Given:**
- `transaction_code` (input) eq `DU`
- `pre_settlement_flag` (input) eq `false`
- `authority_approval` (input) not_exists

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Reverse_settled_trade (Priority: 26) | Transaction: atomic

_Reverse a settled trade via RV record with settlement-authority approval_

**Given:**
- `transaction_code` (input) eq `RV`
- `original_deal_reference` (input) exists

**Then:**
- **transition_state** field: `deal_status` from: `settled` to: `reversed`
- **emit_event** event: `broker.deal.reversed`

### Off_market_trade_upload (Priority: 27)

_Upload an off-market (OM) trade booked bilaterally_

**Given:**
- `transaction_code` (input) eq `OM`

**Then:**
- **create_record**
- **emit_event** event: `broker.deal.upload.received`

### External_account_mapping (Priority: 30)

_Map external account code to internal client account_

**Given:**
- `external_account_code` (input) exists

**Then:**
- **call_service** target: `external_account_mapper`

### Fund_code_required (Priority: 31) — Error: `DEAL_UPLOAD_FUND_CODE_MISSING`

_Reject external-account rows missing fund code_

**Given:**
- `external_account_code` (input) exists
- `fund_code` (input) not_exists

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

### Allocation_cutoff_exceeded (Priority: 32) — Error: `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED`

_Same-day allocations submitted after cutoff are rejected_

**Given:**
- `transaction_code` (input) eq `SD`
- `submission_time` (system) gte `cutoff_time`

**Then:**
- **emit_event** event: `broker.deal.upload.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT` | 422 | External account code cannot be mapped to a client account | No |
| `DEAL_UPLOAD_INVALID_TRADE_DATE` | 422 | Trade date is invalid or outside allowed window | No |
| `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND` | 422 | Referenced instrument does not exist | No |
| `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED` | 422 | Same-day allocation submitted after cutoff time | No |
| `DEAL_UPLOAD_DUPLICATE_DEAL` | 409 | Deal reference already exists | No |
| `DEAL_UPLOAD_TRAILER_MISMATCH` | 422 | Trailer record total does not match detail record count | No |
| `DEAL_UPLOAD_HEADER_MISSING` | 422 | Header record not received or malformed | No |
| `DEAL_UPLOAD_SEQUENCE_REUSED` | 409 | Sequence number has already been used for this broker | No |
| `DEAL_UPLOAD_POST_SETTLEMENT_AMEND_DENIED` | 403 | Amendment not permitted after settlement without authority approval | No |
| `DEAL_UPLOAD_ORIGINAL_DEAL_NOT_FOUND` | 404 | Original deal reference not found for amendment or cancellation | No |
| `DEAL_UPLOAD_CANCEL_AFTER_SETTLEMENT` | 422 | Settled trade must be reversed, not cancelled | No |
| `DEAL_UPLOAD_FUND_CODE_MISSING` | 422 | Fund manager code required when external account code supplied | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `broker.deal.upload.received` |  | `broker_code`, `sequence_number`, `record_count`, `upload_date` |
| `broker.deal.upload.accepted` |  | `broker_code`, `sequence_number`, `records_processed` |
| `broker.deal.upload.rejected` |  | `broker_code`, `sequence_number`, `records_rejected`, `error_codes` |
| `broker.deal.allocated` |  | `broker_code`, `deal_reference`, `allocation_account`, `quantity` |
| `broker.deal.cancelled` |  | `broker_code`, `deal_reference`, `cancellation_reason` |
| `broker.deal.amended` |  | `broker_code`, `original_deal_reference`, `amendment_reason`, `new_values` |
| `broker.deal.reversed` |  | `broker_code`, `original_deal_reference`, `settlement_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |
| broker-financial-data-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Deal Management Upload

Deliver accurate, auditable bulk deal management uploads honouring settlement-cycle amendment rules

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
- before any post-settlement amendment or reversal

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`
- `post_settlement_amendment_requested`

### Verification

**Invariants:**

- error messages never expose internal system details
- settled trades are never cancelled, only reversed
- trailer totals always reconcile with detail record count

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| manual_deal_allocation_upload | `autonomous` | - | - |
| automated_deal_allocation_upload | `autonomous` | - | - |
| same_day_allocation_upload | `autonomous` | - | - |
| deals_upload | `autonomous` | - | - |
| bulk_allocate_trades | `autonomous` | - | - |
| cancel_trade | `supervised` | - | - |
| amend_trade_price | `supervised` | - | - |
| amend_trade_consideration | `supervised` | - | - |
| reverse_settled_trade | `human_required` | - | - |
| off_market_trade_upload | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
transaction_codes:
  DF: Deal Final - booked trade confirmation
  DP: Deal Pending - awaiting confirmation
  DU: Deal Update - amendment to price, consideration, account or quantity
  DC: Deal Cancellation - pre-settlement cancellation only
  DA: Deal Allocation - allocate booked trade to client account(s)
  ES: External Settlement - settlement handled outside the back-office
  OM: Off-Market Trade - bilateral trade booked off-exchange
  RV: Reverse Settled Trade - unwind of a settled trade (post-settlement)
  SD: Same-Day Allocation - intraday allocation processed same business day
record_type_map:
  "100": Same Day Allocations Upload detail record (SDAYUP)
  "101": Deals Upload detail record (DLSUPL)
  "102": Automated Deal Allocations Upload detail record (ALLUPO)
  "999": Trailer record (end of every upload file)
  "000": Header record (start of every upload file)
upload_datasets:
  ALLOUP:
    description: Manual Submission Deal Allocations (scheduled via process request)
    dataset_pattern: BBAP.SPRD.{BROKER}.ALLOC
  ALLUPO:
    description: Automated Submission Deal Allocations
    dataset_pattern: BBAP.SPRD.UPLOAD.{BROKER}.ALLUPO
    response_pattern: BBAP.SPRD.UPLOAD.{BROKER}.ALLUPO.S{SEQUENCE}
  SDAYUP:
    description: Automated Same Day Allocations
    dataset_pattern: BBAP.SPRD.UPLOAD.{BROKER}.SDAYUP
    response_pattern: BBAP.SPRD.UPLOAD.{BROKER}.SDAYUP.S{SEQUENCE}
  DLSUPL:
    description: Automated Deals Upload (near real-time)
    dataset_pattern: BBAP.SPRD.UPLOAD.{BROKER}.DLSUPL
    response_pattern: BBAP.SPRD.UPLOAD.{BROKER}.DLSUPL.S{SEQUENCE}
    multi_file_variant: BBAP.SPRD.UPLOAD.{BROKER}.DLSUPL.G(+1)
settlement_cycles:
  T+0: Same-day settlement (intraday)
  T+2: Two business days post-trade
  T+3: Three business days post-trade (standard equity)
  T+5: Five business days post-trade (specific instruments)
amendment_rules:
  pre_settlement:
    window: trade_date to settlement_date - 1 business day
    permitted_changes:
      - price
      - consideration
      - client_account
      - allocation_account
      - quantity
      - commission
    record_types:
      - DU
      - DC
    approval_required: false
  post_settlement:
    window: settlement_date onwards
    permitted_changes:
      - consideration (narrow error correction only)
    record_types:
      - DU with authority_approval
      - RV
    approval_required: true
    approver: settlement_authority
  reversal:
    description: Settled trades cannot be cancelled; they must be reversed via RV
    record_type: RV
    approval_required: true
record_layouts:
  HEADER_000:
    card_code: "000"
    total_length: 150
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: date
        start: 7
        length: 8
        end: 14
        type: numeric
      - name: time
        start: 15
        length: 6
        end: 20
        type: numeric
      - name: prefix
        start: 21
        length: 1
        end: 21
        type: char
      - name: sequence
        start: 22
        length: 7
        end: 28
        type: alphanumeric
      - name: printer_id
        start: 29
        length: 4
        end: 32
        type: char
      - name: filler
        start: 33
        length: 118
        end: 150
        type: char
  ALLOUP_MANUAL:
    card_code: N/A
    description: Manual allocation upload flat file (no card code prefix, positional)
    total_length: 150
    fields:
      - name: broker_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: reference_page_no
        start: 4
        length: 10
        end: 13
        type: char
      - name: reference_line_no
        start: 14
        length: 2
        end: 15
        type: char
      - name: account_code
        start: 16
        length: 7
        end: 22
        type: numeric
      - name: purchase_sell_indicator
        start: 23
        length: 1
        end: 23
        type: char
      - name: price
        start: 24
        length: 11
        end: 34
        type: numeric
      - name: quantity
        start: 35
        length: 11
        end: 45
        type: numeric
      - name: charge_structure_code
        start: 46
        length: 2
        end: 47
        type: char
      - name: con_charge_indicator
        start: 48
        length: 1
        end: 48
        type: char
      - name: consolidate_note_indicator
        start: 49
        length: 2
        end: 50
        type: char
      - name: terms_input
        start: 51
        length: 8
        end: 58
        type: char
      - name: reference_alpha
        start: 59
        length: 2
        end: 60
        type: char
      - name: reference_order_number
        start: 61
        length: 7
        end: 67
        type: numeric
      - name: external_account_code
        start: 68
        length: 7
        end: 74
        type: char
      - name: instrument_type
        start: 75
        length: 1
        end: 75
        type: char
      - name: instrument_alpha
        start: 76
        length: 6
        end: 81
        type: char
      - name: other_account_code
        start: 82
        length: 7
        end: 88
        type: numeric
      - name: negotiated_commission
        start: 89
        length: 17
        end: 105
        type: numeric
      - name: negotiated_scale
        start: 106
        length: 3
        end: 108
        type: char
      - name: negotiated_percent_indicator
        start: 109
        length: 1
        end: 109
        type: char
      - name: trade_capacity
        start: 110
        length: 1
        end: 110
        type: char
      - name: average_indicator
        start: 111
        length: 1
        end: 111
        type: char
      - name: isin
        start: 112
        length: 12
        end: 123
        type: char
      - name: country_code
        start: 124
        length: 2
        end: 125
        type: char
      - name: fund_code
        start: 126
        length: 3
        end: 128
        type: char
      - name: non_external_flag
        start: 129
        length: 1
        end: 129
        type: char
      - name: filler
        start: 130
        length: 7
        end: 136
        type: char
      - name: process_date
        start: 137
        length: 8
        end: 144
        type: numeric
      - name: process_time
        start: 145
        length: 6
        end: 150
        type: numeric
  SDAYUP_100:
    card_code: "100"
    description: Same Day Allocations Upload detail record
    total_length: 150
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: reference_page_no
        start: 7
        length: 10
        end: 16
        type: char
      - name: reference_line_no
        start: 17
        length: 2
        end: 18
        type: char
      - name: account_code
        start: 19
        length: 7
        end: 25
        type: numeric
      - name: purchase_sell_indicator
        start: 26
        length: 1
        end: 26
        type: char
      - name: price
        start: 27
        length: 11
        end: 37
        type: numeric
      - name: quantity
        start: 38
        length: 11
        end: 48
        type: numeric
      - name: charge_structure_code
        start: 49
        length: 2
        end: 50
        type: char
      - name: con_charge_indicator
        start: 51
        length: 1
        end: 51
        type: char
      - name: consolidate_note_indicator
        start: 52
        length: 2
        end: 53
        type: char
      - name: terms_input
        start: 54
        length: 8
        end: 61
        type: char
      - name: reference_alpha
        start: 62
        length: 2
        end: 63
        type: char
      - name: reference_order_number
        start: 64
        length: 7
        end: 70
        type: numeric
      - name: external_account_code
        start: 71
        length: 7
        end: 77
        type: char
      - name: instrument_type
        start: 78
        length: 1
        end: 78
        type: char
      - name: instrument_alpha
        start: 79
        length: 6
        end: 84
        type: char
      - name: other_account_code
        start: 85
        length: 7
        end: 91
        type: numeric
      - name: negotiated_commission
        start: 92
        length: 17
        end: 108
        type: numeric
      - name: negotiated_scale
        start: 109
        length: 3
        end: 111
        type: char
      - name: negotiated_percent_indicator
        start: 112
        length: 1
        end: 112
        type: char
      - name: trade_capacity
        start: 113
        length: 1
        end: 113
        type: char
      - name: average_indicator
        start: 114
        length: 1
        end: 114
        type: char
      - name: isin
        start: 115
        length: 12
        end: 126
        type: char
      - name: country_code
        start: 127
        length: 2
        end: 128
        type: char
      - name: fund_code
        start: 129
        length: 3
        end: 131
        type: char
      - name: non_external_flag
        start: 132
        length: 1
        end: 132
        type: char
      - name: filler
        start: 133
        length: 18
        end: 150
        type: char
  DLSUPL_101:
    card_code: "101"
    description: Deals Upload detail record (near-real-time deals)
    total_length: 150
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: reference_page_no
        start: 7
        length: 10
        end: 16
        type: char
      - name: reference_line_no
        start: 17
        length: 2
        end: 18
        type: char
      - name: account_code
        start: 19
        length: 7
        end: 25
        type: numeric
      - name: purchase_sell_indicator
        start: 26
        length: 1
        end: 26
        type: char
      - name: price
        start: 27
        length: 11
        end: 37
        type: numeric
      - name: quantity
        start: 38
        length: 11
        end: 48
        type: numeric
      - name: charge_structure_code
        start: 49
        length: 2
        end: 50
        type: char
      - name: con_charge_indicator
        start: 51
        length: 1
        end: 51
        type: char
      - name: consolidate_note_indicator
        start: 52
        length: 2
        end: 53
        type: char
      - name: terms_input
        start: 54
        length: 8
        end: 61
        type: char
      - name: reference_alpha
        start: 62
        length: 2
        end: 63
        type: char
      - name: reference_order_number
        start: 64
        length: 7
        end: 70
        type: numeric
      - name: external_account_code
        start: 71
        length: 7
        end: 77
        type: char
      - name: instrument_type
        start: 78
        length: 1
        end: 78
        type: char
      - name: instrument_alpha
        start: 79
        length: 6
        end: 84
        type: char
      - name: other_account_code
        start: 85
        length: 7
        end: 91
        type: numeric
      - name: negotiated_commission
        start: 92
        length: 17
        end: 108
        type: numeric
      - name: negotiated_scale
        start: 109
        length: 3
        end: 111
        type: char
      - name: negotiated_percent_indicator
        start: 112
        length: 1
        end: 112
        type: char
      - name: trade_capacity
        start: 113
        length: 1
        end: 113
        type: char
      - name: average_indicator
        start: 114
        length: 1
        end: 114
        type: char
      - name: isin
        start: 115
        length: 12
        end: 126
        type: char
      - name: country_code
        start: 127
        length: 2
        end: 128
        type: char
      - name: fund_code
        start: 129
        length: 3
        end: 131
        type: char
      - name: non_external_flag
        start: 132
        length: 1
        end: 132
        type: char
      - name: trade_date
        start: 133
        length: 8
        end: 140
        type: numeric
      - name: filler
        start: 141
        length: 10
        end: 150
        type: char
  ALLUPO_102:
    card_code: "102"
    description: Automated Deal Allocations Upload detail record
    total_length: 150
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: reference_page_no
        start: 7
        length: 10
        end: 16
        type: char
      - name: reference_line_no
        start: 17
        length: 2
        end: 18
        type: char
      - name: account_code
        start: 19
        length: 7
        end: 25
        type: numeric
      - name: purchase_sell_indicator
        start: 26
        length: 1
        end: 26
        type: char
      - name: price
        start: 27
        length: 11
        end: 37
        type: numeric
      - name: quantity
        start: 38
        length: 11
        end: 48
        type: numeric
      - name: charge_structure_code
        start: 49
        length: 2
        end: 50
        type: char
      - name: con_charge_indicator
        start: 51
        length: 1
        end: 51
        type: char
      - name: consolidate_note_indicator
        start: 52
        length: 2
        end: 53
        type: char
      - name: terms_input
        start: 54
        length: 8
        end: 61
        type: char
      - name: reference_alpha
        start: 62
        length: 2
        end: 63
        type: char
      - name: reference_order_number
        start: 64
        length: 7
        end: 70
        type: numeric
      - name: external_account_code
        start: 71
        length: 7
        end: 77
        type: char
      - name: instrument_type
        start: 78
        length: 1
        end: 78
        type: char
      - name: instrument_alpha
        start: 79
        length: 6
        end: 84
        type: char
      - name: other_account_code
        start: 85
        length: 7
        end: 91
        type: numeric
      - name: negotiated_commission
        start: 92
        length: 17
        end: 108
        type: numeric
      - name: negotiated_scale
        start: 109
        length: 3
        end: 111
        type: char
      - name: negotiated_percent_indicator
        start: 112
        length: 1
        end: 112
        type: char
      - name: trade_capacity
        start: 113
        length: 1
        end: 113
        type: char
      - name: average_indicator
        start: 114
        length: 1
        end: 114
        type: char
      - name: isin
        start: 115
        length: 12
        end: 126
        type: char
      - name: country_code
        start: 127
        length: 2
        end: 128
        type: char
      - name: fund_code
        start: 129
        length: 3
        end: 131
        type: char
      - name: non_external_flag
        start: 132
        length: 1
        end: 132
        type: char
      - name: filler
        start: 133
        length: 18
        end: 150
        type: char
  TRAILER_999:
    card_code: "999"
    description: Trailer record reconciles detail counts
    total_length: 47
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: date
        start: 7
        length: 8
        end: 14
        type: numeric
      - name: time
        start: 15
        length: 6
        end: 20
        type: numeric
      - name: total_records
        start: 21
        length: 9
        end: 29
        type: numeric
      - name: records_processed
        start: 30
        length: 9
        end: 38
        type: numeric
      - name: records_rejected
        start: 39
        length: 9
        end: 47
        type: numeric
      - name: filler
        start: 48
        length: 3
        end: 50
        type: char
  RESPONSE_FILE:
    description: Response dataset written back per upload with per-line error details
    total_length: 700
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: broker_code
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: date
        start: 7
        length: 8
        end: 14
        type: numeric
      - name: time
        start: 15
        length: 6
        end: 20
        type: numeric
      - name: total_records
        start: 21
        length: 9
        end: 29
        type: numeric
      - name: records_processed
        start: 30
        length: 9
        end: 38
        type: numeric
      - name: records_rejected
        start: 39
        length: 9
        end: 47
        type: numeric
      - name: filler
        start: 48
        length: 600
        end: 647
        type: char
      - name: count_of_msgs_for_line
        start: 648
        length: 3
        end: 650
        type: numeric
      - name: error_message
        start: 651
        length: 50
        end: 700
        type: char
fund_manager_codes:
  description: Broker-facing fund manager codes attached to external account codes
  examples:
    - code: FM1
      label: Fund Manager 1
    - code: FM2
      label: Fund Manager 2
    - code: FM3
      label: Fund Manager 3
submission_workflow:
  - 1. Member FTP dataset configuration
  - 2. Notification email address set-up (up to 100)
  - 3. Build upload file per record layout with header (000) and trailer (999)
  - 4. FTP file to broker-specific dataset
  - 5. Back-office validates header/trailer/sequence and processes detail records
  - 6. Response dataset written per upload with per-line error messages
  - 7. Rejected records corrected and resubmitted (or captured manually)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Deal Management Upload Blueprint",
  "description": "Fixed-width bulk upload of deal allocations, same-day allocations, deals, amendments and cancellations to back-office with settlement-cycle aware rules. 44 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, deal-allocation, settlement, amendment, cancellation, fixed-width"
}
</script>
