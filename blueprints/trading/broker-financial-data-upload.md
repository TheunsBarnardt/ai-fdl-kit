<!-- AUTO-GENERATED FROM broker-financial-data-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Financial Data Upload

> Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules

**Category:** Trading · **Version:** 1.1.0 · **Tags:** back-office · broker · upload · financial-data · cash-book · journal · gl · fixed-width · double-entry

## What this does

Fixed-width bulk GL and financial upload - cash receipts, cash payments and journal entries - with double-entry validation, GL account checks and reversal rules

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **layout_number** *(text, required)* — Layout Number
- **broker_code** *(text, required)* — Broker Code
- **process_date** *(date, required)* — Process Date
- **age_date** *(date, optional)* — Age Date
- **account_code** *(text, optional)* — GL Account Code
- **balance_code** *(text, optional)* — Balance Code
- **designation_code** *(text, optional)* — Designation Code
- **amount_sign** *(text, optional)* — Amount Sign
- **amount** *(number, optional)* — Amount (2 implied decimals)
- **narrative** *(text, optional)* — Narrative
- **cheque_number** *(text, optional)* — Cheque Number
- **cash_alpha_code** *(text, optional)* — Cash Alpha Code
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **general_analysis_code** *(text, optional)* — General Analysis Code
- **registration_code** *(text, optional)* — Nominee Registration Code
- **payee** *(text, optional)* — Payee Name
- **electronic_payment_indicator** *(text, optional)* — Electronic Payment Indicator
- **reference_number** *(text, optional)* — Journal Reference Number
- **sequence** *(text, optional)* — Header Sequence
- **records_total** *(number, optional)* — Trailer Total Records
- **records_processed** *(number, optional)* — Records Processed
- **records_rejected** *(number, optional)* — Records Rejected
- **financial_entry_type** *(select, optional)* — Financial Entry Type
- **currency_code** *(text, optional)* — Transaction Currency
- **fx_rate** *(number, optional)* — FX Conversion Rate
- **reversal_flag** *(boolean, optional)* — Reversal Flag

## What must be true

- **submission:** MUST: Support FTP automated submission, MUST: Support online automated upload, MUST: Support online manual upload via release function, MUST: Support batch upload mode, MUST: Configure response email addresses before allowing upload, MUST: Limit manual online uploads to 500 entries per file
- **validation:** MUST: Report errors via common error enquiry console per record, MUST: Generate response dataset with per-record status and error messages, MUST: Reject the whole file on trailer errors (missing, duplicate, mismatched broker, total mismatch), MUST: Zero-fill numeric fields when no value is present (never leave empty), MUST: Validate process date equals run date for each record, MUST: Validate broker code on each record equals header broker code
- **format:** MUST: Use non-delimited fixed-length record format, MUST: Every record is exactly 173 characters, MUST: Start with Header Record (Layout 000) for online uploads, MUST: End with Trailer Record (Layout 999) for online uploads, MUST: Use Layout 063 for cash book receipts, MUST: Use Layout 064 for cash book payments, MUST: Use Layout 065 for general journal entries, MUST: Amount fields carry 2 implied decimals (no decimal point in wire format)
- **gl_accounts:** MUST: Validate referenced GL account code exists and is active, MUST: Validate balance code is permitted for the account, MUST: Validate designation code combination against account rules, MUST: Reject postings to closed or suspended GL accounts
- **double_entry:** MUST: Every journal batch debits must equal credits to two-decimal precision, MUST: Cash receipt posts debit to bank/cash account, credit to client/GL account, MUST: Cash payment posts credit to bank/cash account, debit to client/GL account, MUST: Reject any journal where aggregate debit-credit difference is non-zero
- **currency:** MUST: Convert foreign currency amounts to base currency at official FX rate, MUST: Round converted amounts to 2 decimals using half-up rounding, MUST: Record the FX rate and original currency on every converted posting
- **reversal:** MUST: Reverse a cash receipt by posting an equal and opposite cash payment, MUST: Reverse a cash payment by posting an equal and opposite cash receipt, MUST: Allow same-day (T+0) reversal without additional approval, MUST: Require finance supervisor approval to reverse an entry posted on a prior date, MUST: Prohibit reversal once the period has been closed

## Success & failure scenarios

**✅ Success paths**

- **Automated Ftp Upload** — when upload_method eq "ftp"; email_configured eq true, then create_record; emit fin_upload.received. _Why: Broker submits financial data via FTP and it is processed automatically._
- **Manual Online Upload** — when upload_method eq "online_manual"; record_count lte 500, then create_record; emit fin_upload.manual_received. _Why: Broker uploads financial data via online manual interface with header and trailer._
- **Bulk Gl Entry Upload** — when layout_number in ["063","064","065"]; record_count gt 0, then call service; emit fin_upload.bulk_gl.received; create_record. _Why: Accept a bulk file of GL entries (XOP, GL, fees, refunds) and dispatch to the ledger engine._
- **Gl Account Validation** — when account_code exists, then call service; emit fin_upload.account.validated. _Why: Validate every referenced GL account exists, is active and accepts the balance code._
- **Double Entry Validation** — when layout_number in ["063","064","065"], then call service; emit fin_upload.double_entry.posted. _Why: Each cash and journal posting generates a matched debit and credit leg._
- **Debit Credit Balancing** — when debit_total exists; credit_total exists, then call service; emit fin_upload.batch.balanced. _Why: Aggregate debits and credits across a journal batch must balance to zero._
- **Currency Conversion Rounding** — when currency_code neq "base"; fx_rate gt 0, then set amount_base_ccy = "computed_rounded"; emit fin_upload.currency.converted. _Why: Convert foreign-currency amounts to base currency and round to 2 decimals half-up._
- **Same Day Reversal** — when reversal_flag eq true; original_post_date eq "today", then create_record; emit fin_upload.reversal.same_day. _Why: Allow T+0 reversal by posting an equal and opposite entry without additional approval._
- **Prior Date Reversal** — when reversal_flag eq true; original_post_date lt "today"; supervisor_approved eq true; period_status eq "open", then create_record; emit fin_upload.reversal.prior_date. _Why: Reversal of an entry posted on a prior date requires supervisor approval and open period._
- **Generate Response Dataset** — when processing_complete eq true, then create_record; notify via email; emit fin_upload.response.delivered. _Why: Generate response dataset with per-record error lines and notify configured addresses._

**❌ Failure paths**

- **Gl Account Invalid** — when account_status in ["unknown","closed","suspended"], then emit fin_upload.account.rejected. _Why: Referenced GL account is unknown, closed or suspended._ *(error: `FIN_UPLOAD_INVALID_ACCOUNT`)*
- **Unbalanced Journal** — when debit_credit_diff neq 0, then emit fin_upload.journal.unbalanced. _Why: Debit and credit totals differ for the batch._ *(error: `FIN_UPLOAD_UNBALANCED_JOURNAL`)*
- **Reversal Period Closed** — when period_status eq "closed", then emit fin_upload.reversal.blocked. _Why: Reversal attempted against a closed accounting period._ *(error: `FIN_UPLOAD_PERIOD_CLOSED`)*
- **Trailer Mismatch** — when trailer_valid eq false, then emit fin_upload.trailer.rejected. _Why: Trailer totals do not match the records actually received._ *(error: `FIN_UPLOAD_TRAILER_MISMATCH`)*

## Errors it can return

- `FIN_UPLOAD_INVALID_LAYOUT` — Financial data upload file has invalid layout structure
- `FIN_UPLOAD_UNBALANCED_JOURNAL` — Journal entry debits do not equal credits
- `FIN_UPLOAD_INVALID_ACCOUNT` — Referenced GL account does not exist or is not active
- `FIN_UPLOAD_DUPLICATE_REFERENCE` — Transaction reference already exists
- `FIN_UPLOAD_TRAILER_MISMATCH` — Trailer record total does not match records submitted
- `FIN_UPLOAD_CURRENCY_INVALID` — Currency code not recognised or no FX rate available
- `FIN_UPLOAD_REVERSAL_NOT_ALLOWED` — Reversal of prior-period entry requires supervisor approval
- `FIN_UPLOAD_PERIOD_CLOSED` — Accounting period is closed - reversal not permitted
- `FIN_UPLOAD_PROCESSING_FAILED` — Financial upload processing failed

## Events

**`fin_upload.received`**
  Payload: `broker_code`, `layout_number`, `process_date`

**`fin_upload.manual_received`**
  Payload: `broker_code`, `sequence`, `record_count`

**`fin_upload.bulk_gl.received`**
  Payload: `broker_code`, `record_count`, `layout_number`

**`fin_upload.account.validated`**
  Payload: `account_code`, `balance_code`

**`fin_upload.account.rejected`**
  Payload: `account_code`, `reason`

**`fin_upload.double_entry.posted`**
  Payload: `reference_number`, `debit_total`, `credit_total`

**`fin_upload.batch.balanced`**
  Payload: `reference_number`, `debit_total`, `credit_total`

**`fin_upload.journal.unbalanced`**
  Payload: `reference_number`, `debit_credit_diff`

**`fin_upload.currency.converted`**
  Payload: `currency_code`, `fx_rate`, `amount`, `amount_base_ccy`

**`fin_upload.reversal.same_day`**
  Payload: `reference_number`, `broker_code`

**`fin_upload.reversal.prior_date`**
  Payload: `reference_number`, `broker_code`, `original_post_date`

**`fin_upload.reversal.blocked`**
  Payload: `reference_number`, `period_status`

**`fin_upload.trailer.rejected`**
  Payload: `broker_code`, `records_total`, `records_received`

**`fin_upload.response.delivered`**
  Payload: `broker_code`, `sequence`, `records_processed`, `records_rejected`

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(optional)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+9** since baseline (74 → 83)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 25 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-financial-data-upload/) · **Spec source:** [`broker-financial-data-upload.blueprint.yaml`](./broker-financial-data-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
