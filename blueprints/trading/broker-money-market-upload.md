<!-- AUTO-GENERATED FROM broker-money-market-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Money Market Upload

> Daily bulk upload of money market investments, cash movements, journals and memo transactions from external broker systems via fixed-width card-code records.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** money-market · bulk-upload · fixed-width · investments · ncd · deposits · back-office

## What this does

Daily bulk upload of money market investments, cash movements, journals and memo transactions from external broker systems via fixed-width card-code records.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **broker_code** *(text, required)* — Broker Code
- **processing_date** *(date, required)* — Processing Date
- **machine_date** *(datetime, required)* — File Generation Date
- **system_id** *(text, required)* — Broker System Identifier
- **card_code** *(select, required)* — Record Card Code
- **instrument_type** *(select, optional)* — Money Market Instrument Type
- **investment_type** *(select, optional)* — Investment Type
- **invest_no** *(text, optional)* — Broker Unique Investment Number
- **account_code** *(text, required)* — Client Account Code
- **balance_code** *(text, required)* — Balance Code
- **notional_amount** *(number, optional)* — Notional / Capital Amount
- **balance** *(number, optional)* — Investment Balance
- **bank_rate** *(number, optional)* — Bank Quoted Rate (Yield)
- **turn_rate** *(number, optional)* — Turn Rate
- **client_rate** *(number, optional)* — Net Client Rate
- **term_days** *(number, optional)* — Term in Days
- **effective_date** *(date, optional)* — Effective Date
- **maturity_date** *(date, optional)* — Maturity Date
- **counterparty_account** *(text, optional)* — Borrower / Counterparty Account
- **cash_alpha** *(text, optional)* — Money Market Cash Alpha
- **narrative** *(text, optional)* — Statement Narrative
- **record_count** *(number, optional)* — Trailer Record Count
- **journal_balance** *(number, optional)* — Trailer Journal Balance
- **batch_id** *(text, optional)* — Upload Batch Identifier
- **day_count_convention** *(select, optional)* — Day Count Convention
- **settlement_basis** *(select, optional)* — Settlement Basis

## What must be true

- **general → rule_1:** Every batch must begin with a card-code 70 header and end with a card-code 99 trailer; missing either rejects the whole file.
- **general → rule_2:** Header processing date must equal the run date of the back-office system or the entire batch is rejected.
- **general → rule_3:** Trailer record count must equal the number of data records between header and trailer; mismatches reject the batch.
- **general → rule_4:** Trailer journal balance must sum to zero; non-zero balances are accepted but flagged on the exception report.
- **general → rule_5:** All fields use display format only — packed data, HIGH values and LOW values are prohibited.
- **general → rule_6:** Unused alphanumeric fields must contain spaces; unused numeric fields must contain zeros.
- **general → rule_7:** A header and trailer must be sent every business day even when there are no transactions in between.
- **general → rule_8:** Money-market transactions must be loaded on a separate data set from any other financial upload stream.
- **general → rule_9:** Transactions against lender ('C') or borrower ('CB') account types may only affect money-market balance codes.
- **general → rule_10:** Broker code, client account codes, balance codes and GL account codes must be pre-loaded before upload.
- **general → rule_11:** Fixed deposits submitted more than once before maturity, or with capital differing from balance, are flagged as possible early terminations.
- **general → rule_12:** Investments must be uploaded daily with end-of-day status for any instrument that changed during the day; take-on uploads include all instruments regardless of movement.
- **general → rule_13:** Memo transactions (MR/MD/MT/MF/MM) carry a zero amount; the narrative conveys the change detail.
- **general → rule_14:** Interest accrues on actual/365 day count for call and fixed deposits unless the spec overrides at instrument level.
- **general → rule_15:** Yield is quoted as bank rate; net client rate equals bank rate minus turn rate.
- **general → rule_16:** Maturity value for discount instruments (NCD, CD, TB, BA) is computed from notional, yield and term; repos settle at agreed repurchase price.
- **general → rule_17:** Day-end investment snapshots are retained in an audit store for regulatory reconstruction.
- **general → rule_18:** Rejected transactions remain the broker's responsibility to correct and resubmit the next business day.

## Success & failure scenarios

**✅ Success paths**

- **Upload Mm Trade Batch** — when card_code eq "70"; broker_code exists; processing_date exists, then create_record; emit mm.upload.batch.received. _Why: Broker submits a daily money-market batch file and the upload engine validates header/trailer then queues records for processing._
- **Calculate Yield** — when card_code eq "72"; bank_rate exists, then set client_rate = "computed_bank_minus_turn"; emit mm.upload.yield.calculated. _Why: For each investment record (card 72) derive net client rate from bank rate minus turn rate using the configured day-count convention._
- **Calculate Maturity Value** — when card_code eq "72"; maturity_date exists; notional_amount gt 0, then set maturity_value = "computed_from_notional_rate_term"; emit mm.upload.investment.booked. _Why: Compute maturity value for discount instruments (NCD, CD, TB, BA) and repurchase price for repos using notional, yield and term days on actual/365._
- **Schedule Maturity Processing** — when maturity_date gte "processing_date", then create_record; emit mm.upload.maturity.scheduled. _Why: Register a maturity event so the back office auto-processes redemption, interest accrual and capital return on the maturity date._
- **Process Accepted Batch** — when batch_id exists; record_count gte 0, then call service; create_record; emit mm.upload.batch.validated. _Why: Validated batches feed the cash-receipt, cash-payment and journal functions; investments are written to the MM investment store and day-end snapshot retained in audit._

**❌ Failure paths**

- **Validate Mm Trade** — when broker_code not_exists OR account_code not_exists OR balance_code not_exists, then emit mm.upload.transaction.rejected; create_record. _Why: Each record is validated against broker/account/balance masters and format rules; bad records are routed to the rejection report._ *(error: `MM_UPLOAD_BATCH_REJECTED`)*
- **Reconcile Against Back Office** — when journal_balance neq 0, then notify via email; emit mm.upload.reconciliation.break; create_record. _Why: Trailer journal balance and per-investment balances are reconciled with the back-office ledger; discrepancies raise exception reports._ *(error: `MM_UPLOAD_RECON_BREAK`)*

## Errors it can return

- `MM_UPLOAD_HEADER_MISSING` — Upload batch is missing the required header record.
- `MM_UPLOAD_TRAILER_MISSING` — Upload batch is missing the required trailer record.
- `MM_UPLOAD_PROCESSING_DATE_MISMATCH` — Header processing date does not match the current run date.
- `MM_UPLOAD_RECORD_COUNT_MISMATCH` — Trailer record count does not match the number of data records in the batch.
- `MM_UPLOAD_INVALID_BROKER` — Broker code is not registered for money-market upload.
- `MM_UPLOAD_INVALID_ACCOUNT` — Client account code is not loaded for this broker.
- `MM_UPLOAD_INVALID_BALANCE_CODE` — Balance code is not valid for the supplied account type.
- `MM_UPLOAD_BAD_FORMAT` — Record contains packed data, HIGH values, LOW values or malformed fields.
- `MM_UPLOAD_DUPLICATE_FIXED_DEPOSIT` — Fixed deposit submitted more than once before maturity.
- `MM_UPLOAD_CAPITAL_MISMATCH` — Fixed deposit balance differs from original capital amount.
- `MM_UPLOAD_JOURNAL_IMBALANCE` — Journal entries do not comply with double-entry rules.
- `MM_UPLOAD_BATCH_REJECTED` — Upload batch rejected during validation; see exception report.
- `MM_UPLOAD_RECON_BREAK` — Reconciliation break detected between broker and back-office balances.

## Events

**`mm.upload.batch.received`**
  Payload: `batch_id`, `broker_code`, `processing_date`, `record_count`

**`mm.upload.batch.validated`**
  Payload: `batch_id`, `broker_code`, `processing_date`, `record_count`

**`mm.upload.batch.rejected`**
  Payload: `batch_id`, `broker_code`, `processing_date`, `reason`

**`mm.upload.transaction.accepted`**
  Payload: `batch_id`, `card_code`, `account_code`, `invest_no`

**`mm.upload.transaction.rejected`**
  Payload: `batch_id`, `card_code`, `account_code`, `reason`

**`mm.upload.investment.booked`**
  Payload: `invest_no`, `account_code`, `instrument_type`, `notional_amount`, `maturity_date`

**`mm.upload.yield.calculated`**
  Payload: `invest_no`, `bank_rate`, `turn_rate`, `client_rate`

**`mm.upload.maturity.scheduled`**
  Payload: `invest_no`, `account_code`, `maturity_date`, `maturity_value`

**`mm.upload.reconciliation.break`**
  Payload: `batch_id`, `broker_code`, `journal_balance`

## Connects to

- **broker-money-market** *(extends)*

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-money-market-upload/) · **Spec source:** [`broker-money-market-upload.blueprint.yaml`](./broker-money-market-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
