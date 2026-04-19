<!-- AUTO-GENERATED FROM broker-deal-management-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Deal Management Upload

> Fixed-width bulk upload of deal allocations, same-day allocations, deals, amendments and cancellations to back-office with settlement-cycle aware rules

**Category:** Trading · **Version:** 1.1.0 · **Tags:** back-office · broker · upload · deal-allocation · settlement · amendment · cancellation · fixed-width

## What this does

Fixed-width bulk upload of deal allocations, same-day allocations, deals, amendments and cancellations to back-office with settlement-cycle aware rules

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **record_type** *(text, required)* — Record Type
- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **transaction_code** *(select, required)* — Transaction Code
- **sequence_number** *(text, required)* — Sequence Number
- **upload_date** *(date, required)* — Upload Date
- **upload_time** *(text, optional)* — Upload Time
- **deal_reference** *(text, required)* — Deal Reference
- **order_reference** *(text, optional)* — Order Reference
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, optional)* — Settlement Date
- **settlement_cycle** *(select, optional)* — Settlement Cycle
- **buy_sell_indicator** *(select, required)* — Buy Sell Indicator
- **instrument_type** *(text, optional)* — Instrument Type
- **instrument_code** *(text, required)* — Instrument Code
- **isin** *(text, optional)* — ISIN
- **country_code** *(text, optional)* — Country Code
- **quantity** *(number, required)* — Quantity
- **price** *(number, required)* — Price
- **consideration** *(number, optional)* — Consideration
- **trade_time** *(text, optional)* — Trade Time
- **trade_capacity** *(select, optional)* — Trade Capacity
- **client_account** *(text, required)* — Client Account (internal)
- **allocation_account** *(text, optional)* — Allocation Account
- **external_account_code** *(text, optional)* — External Account Code
- **fund_code** *(text, optional)* — Fund Manager Code
- **commission_amount** *(number, optional)* — Commission Amount
- **charges_amount** *(number, optional)* — Charges Amount
- **vat_amount** *(number, optional)* — VAT Amount
- **stt_amount** *(number, optional)* — Securities Transfer Tax Amount
- **reference_page_no** *(text, optional)* — Reference Page Number
- **reference_line_no** *(text, optional)* — Reference Line Number
- **reference_order_number** *(text, optional)* — Reference Order Number
- **charge_structure_code** *(text, optional)* — Charge Structure Code
- **terms_input** *(text, optional)* — Terms Input
- **negotiated_commission** *(number, optional)* — Negotiated Commission
- **average_indicator** *(text, optional)* — Average Price Indicator
- **non_external_flag** *(select, optional)* — Non-External Flag
- **cancellation_reason** *(text, optional)* — Cancellation Reason
- **amendment_reason** *(text, optional)* — Amendment Reason
- **original_deal_reference** *(text, optional)* — Original Deal Reference (for amendments/cancellations)
- **new_price** *(number, optional)* — New Price (for price amendment)
- **new_consideration** *(number, optional)* — New Consideration (for consideration amendment)
- **pre_settlement_flag** *(boolean, optional)* — Pre-Settlement Amendment

## What must be true

- **submission_modes:** MUST: Support manual submission of deal allocations via FTP, MUST: Support automated submission of deal allocations via FTP, MUST: Support automated submission of same-day allocations, MUST: Support automated submission of deals upload, MUST: Support bulk amendment, cancellation, and reversal uploads
- **file_structure:** MUST: Every upload file starts with Header record (CARD-CODE 000) and ends with Trailer record (CARD-CODE 999), MUST: Header contains broker code, process date (CCYYMMDD), process time (HHMMSS), 'S' prefix and 7-char broker-controlled sequence, MUST: Trailer totals must equal the count of detail records; otherwise entire file is rejected, MUST: All fields are positional; mandatory or optional fields must be space or zero filled, MUST: Total detail record length is 150 bytes
- **setup:** MUST: Complete member FTP dataset configuration before first use, MUST: Configure up to 100 notification email addresses per process type
- **validation:** MUST: Validate external account code maps to an internal client account, MUST: Validate fund manager code is present when external account code is used, MUST: Validate buy/sell indicator is 'P' or 'S', MUST: Validate ISIN first 2 bytes match country code, MUST: Validate trade date is today or a previous business day, MUST: Reject unbalanced or incomplete allocation records, MUST: Records with the reserved broker comment code are treated as comment records (columns 4-80) and skipped during processing
- **transaction_codes:** MUST: Every detail record carries a CARD-CODE identifying the record layout (100, 101, 102, etc.), MUST: Transaction codes (DF/DP/DU/DC/ES/OM/RV/DA/SD) identify the business action
- **settlement:** MUST: Default settlement cycle is T+3 for standard equity trades, MUST: Support T+2 settlement for instruments operating on shorter cycle, MUST: Same-day allocation age_date must equal the online business date
- **amendment:** MUST: Pre-settlement amendments (trade_date to settlement_date - 1) allow price, consideration, account and quantity changes, MUST: Post-settlement amendments are restricted to consideration adjustments and require settlement-authority approval, MUST: Cancellation after settlement requires a reverse-settled-trade (RV) record, not a DC, MUST: All amendments must reference the original_deal_reference
- **duplicate_control:** MUST: Sequence numbers should not be reused; repeated sequence overwrites the previous response file, MUST: For the multi-file dataset variant, sequence number must be unique in perpetuity per broker

## Success & failure scenarios

**✅ Success paths**

- **Manual Deal Allocation Upload** — when submission_mode eq "manual_ftp", then create_record; emit broker.deal.upload.received. _Why: Broker manually submits deal allocations via FTP ALLOUP._
- **Automated Deal Allocation Upload** — when submission_mode eq "automated_ftp", then create_record; emit broker.deal.upload.received. _Why: Automated deal allocation upload via ALLUPO._
- **Same Day Allocation Upload** — when transaction_code eq "SD"; submission_time lt "cutoff_time", then create_record; emit broker.deal.upload.received. _Why: Same-day allocation upload processed intraday._
- **Deals Upload** — when transaction_code in ["DF","DP"], then create_record; emit broker.deal.upload.received. _Why: Automated deals upload via DLSUPL near-real-time._
- **Bulk Allocate Trades** — when transaction_code eq "DA"; allocation_account exists, then call service; create_record; emit broker.deal.allocated. _Why: Bulk allocate one or more booked trades to client accounts._
- **Amend Trade Price** — when transaction_code eq "DU"; pre_settlement_flag eq true; new_price gt 0, then set price = "new_price"; emit broker.deal.amended. _Why: Amend the price of a pre-settlement trade via DU record._
- **Amend Trade Consideration** — when transaction_code eq "DU"; new_consideration gt 0, then set consideration = "new_consideration"; emit broker.deal.amended. _Why: Amend the consideration value of a trade (pre- or post-settlement with approval)._
- **Reverse Settled Trade** — when transaction_code eq "RV"; original_deal_reference exists, then move deal_status settled → reversed; emit broker.deal.reversed. _Why: Reverse a settled trade via RV record with settlement-authority approval._
- **Off Market Trade Upload** — when transaction_code eq "OM", then create_record; emit broker.deal.upload.received. _Why: Upload an off-market (OM) trade booked bilaterally._
- **External Account Mapping** — when external_account_code exists, then call service. _Why: Map external account code to internal client account._

**❌ Failure paths**

- **Header Validation** — when card_code neq "000", then emit broker.deal.upload.rejected. _Why: Validate header record presence and format._ *(error: `DEAL_UPLOAD_HEADER_MISSING`)*
- **Trailer Mismatch** — when trailer_total_records neq "detail_record_count", then emit broker.deal.upload.rejected. _Why: Reject entire file if trailer totals do not reconcile._ *(error: `DEAL_UPLOAD_TRAILER_MISMATCH`)*
- **Sequence Reuse Detected** — when sequence_number exists; dataset_variant eq "multi_file", then emit broker.deal.upload.rejected. _Why: Multi-file dataset variant rejects reused sequence numbers._ *(error: `DEAL_UPLOAD_SEQUENCE_REUSED`)*
- **Cancel Trade** — when transaction_code eq "DC"; pre_settlement_flag eq true, then move deal_status booked → cancelled; emit broker.deal.cancelled. _Why: Cancel a pre-settlement trade via DC record._ *(error: `DEAL_UPLOAD_ORIGINAL_DEAL_NOT_FOUND`)*
- **Cancel After Settlement Denied** — when transaction_code eq "DC"; pre_settlement_flag eq false, then emit broker.deal.upload.rejected. _Why: Reject DC records against already-settled trades._ *(error: `DEAL_UPLOAD_CANCEL_AFTER_SETTLEMENT`)*
- **Post Settlement Amend Denied** — when transaction_code eq "DU"; pre_settlement_flag eq false; authority_approval not_exists, then emit broker.deal.upload.rejected. _Why: Reject post-settlement amendments without settlement-authority approval._ *(error: `DEAL_UPLOAD_POST_SETTLEMENT_AMEND_DENIED`)*
- **Fund Code Required** — when external_account_code exists; fund_code not_exists, then emit broker.deal.upload.rejected. _Why: Reject external-account rows missing fund code._ *(error: `DEAL_UPLOAD_FUND_CODE_MISSING`)*
- **Allocation Cutoff Exceeded** — when transaction_code eq "SD"; submission_time gte "cutoff_time", then emit broker.deal.upload.rejected. _Why: Same-day allocations submitted after cutoff are rejected._ *(error: `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED`)*

## Errors it can return

- `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT` — External account code cannot be mapped to a client account
- `DEAL_UPLOAD_INVALID_TRADE_DATE` — Trade date is invalid or outside allowed window
- `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND` — Referenced instrument does not exist
- `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED` — Same-day allocation submitted after cutoff time
- `DEAL_UPLOAD_DUPLICATE_DEAL` — Deal reference already exists
- `DEAL_UPLOAD_TRAILER_MISMATCH` — Trailer record total does not match detail record count
- `DEAL_UPLOAD_HEADER_MISSING` — Header record not received or malformed
- `DEAL_UPLOAD_SEQUENCE_REUSED` — Sequence number has already been used for this broker
- `DEAL_UPLOAD_POST_SETTLEMENT_AMEND_DENIED` — Amendment not permitted after settlement without authority approval
- `DEAL_UPLOAD_ORIGINAL_DEAL_NOT_FOUND` — Original deal reference not found for amendment or cancellation
- `DEAL_UPLOAD_CANCEL_AFTER_SETTLEMENT` — Settled trade must be reversed, not cancelled
- `DEAL_UPLOAD_FUND_CODE_MISSING` — Fund manager code required when external account code supplied

## Events

**`broker.deal.upload.received`**
  Payload: `broker_code`, `sequence_number`, `record_count`, `upload_date`

**`broker.deal.upload.accepted`**
  Payload: `broker_code`, `sequence_number`, `records_processed`

**`broker.deal.upload.rejected`**
  Payload: `broker_code`, `sequence_number`, `records_rejected`, `error_codes`

**`broker.deal.allocated`**
  Payload: `broker_code`, `deal_reference`, `allocation_account`, `quantity`

**`broker.deal.cancelled`**
  Payload: `broker_code`, `deal_reference`, `cancellation_reason`

**`broker.deal.amended`**
  Payload: `broker_code`, `original_deal_reference`, `amendment_reason`, `new_values`

**`broker.deal.reversed`**
  Payload: `broker_code`, `original_deal_reference`, `settlement_date`

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*
- **broker-financial-data-upload** *(optional)*

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (81 → 85)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 30 fields
- `T5` **bind-orphan-errors** — bound 3 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-deal-management-upload/) · **Spec source:** [`broker-deal-management-upload.blueprint.yaml`](./broker-deal-management-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
