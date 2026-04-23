<!-- AUTO-GENERATED FROM broker-securities-lending-borrowing-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Securities Lending Borrowing Upload

> Broker securities lending and borrowing upload via fixed-width card-code records for loan open, collateral pledge, confirmation, return, mark-to-market, and margin calls

**Category:** Trading · **Version:** 1.1.0 · **Tags:** back-office · broker · upload · slb · securities-lending · borrowing · collateral · fixed-width · card-codes · mark-to-market · margin-call

## What this does

Broker securities lending and borrowing upload via fixed-width card-code records for loan open, collateral pledge, confirmation, return, mark-to-market, and margin calls

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **upload_type** *(select, required)* — Upload Type
- **lender_account_code** *(text, optional)* — Lender Account Code
- **borrower_account_code** *(text, optional)* — Borrower Account Code
- **loan_deal_id** *(text, optional)* — Loan Deal Id
- **loan_quantity** *(number, optional)* — Loan Quantity
- **loan_rate** *(number, optional)* — Loan Rate Percent
- **borrow_rate** *(number, optional)* — Borrower Rate Percent
- **loan_collateral_value** *(number, optional)* — Loan Collateral Value
- **collateral_type** *(select, optional)* — Collateral Type
- **collateral_quantity** *(number, optional)* — Collateral Quantity
- **instrument_type** *(text, optional)* — Instrument Type
- **instrument_alpha** *(text, optional)* — Instrument Alpha
- **instrument_version** *(number, optional)* — Instrument Version
- **receive_date** *(date, optional)* — Receive Date
- **return_date** *(date, optional)* — Return Date
- **provide_date** *(date, optional)* — Provide Date
- **trade_date** *(date, optional)* — Trade Date
- **return_cash_collateral** *(select, optional)* — Return Cash Collateral
- **create_swift_message** *(select, optional)* — Create Swift Message
- **accrued_fee** *(number, optional)* — Accrued Lending Fee
- **mark_price** *(number, optional)* — Mark-to-Market Price
- **margin_shortfall** *(number, optional)* — Margin Shortfall

## What must be true

- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses before allowing upload, MUST: Provide error reporting via common error enquiry functions, MUST: Generate response dataset with per-record response codes, MUST: Archive processed upload files in a retention cycle
- **validation:** MUST: Reject entire file if trailer record missing or mismatched, MUST: Reject entire file if broker code on detail differs from header, MUST: Validate loan and collateral deal id uniqueness, MUST: Link collateral records to existing loan deal ids, MUST: Validate counterparty account exists and is active, MUST: Enforce return date not before receive/provide date, MUST: Reject loan rate outside 0-999.99 percent
- **format:** MUST: Use fixed-width non-delimited record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Layout 025 for loan upload (total length 400), MUST: Use Layout 026 for collateral upload (total length 400), MUST: Use Layout 027 for loan confirmation/return (total length 400), MUST: Use Layout 028 for collateral confirmation/return (total length 400), MUST: Zero-fill numeric fields when value is absent
- **lifecycle:** MUST: Support open-ended and fixed-term loan types, MUST: Allow partial or full return of loans and collateral, MUST: Mark collateral to market and raise margin calls, MUST: Accrue lending fee daily as rate * value * days / 365, MUST: Force-close loans on counterparty default or contractual breach

## Success & failure scenarios

**✅ Success paths**

- **Return Securities Loan** — when card_code eq "027"; upload_type in ["C","R"], then move loan_status open → returned; emit slb.loan.returned. _Why: Confirm or return an open securities loan (Layout 027)._
- **Release Collateral** — when card_code eq "028"; upload_type in ["C","R"], then move collateral_status posted → released; emit slb.collateral.released. _Why: Confirm or release collateral (Layout 028)._
- **Mark To Market Collateral** — when loan_status eq "open"; mark_price gt 0, then set collateral_value = "mark_price_times_quantity"; emit slb.collateral.marked. _Why: Revalue collateral at current mark price and compute exposure._
- **Accrue Lending Fee** — when loan_status eq "open", then set accrued_fee = "loan_rate_times_value_times_days_over_365"; emit slb.fee.accrued. _Why: Daily fee accrual as loan_rate * loan_value * days / 365._
- **Generate Response Dataset** — when processing_complete eq true, then create_record; notify via email; emit slb.upload.response_delivered. _Why: Generate SLB upload response dataset with per-record codes._

**❌ Failure paths**

- **Header Validation** — when card_code eq "000", then set header_validated = true; emit slb.upload.response_delivered. _Why: Validate header record (Card Code 000)._ *(error: `SLB_INVALID_CARD_CODE`)*
- **Open Securities Loan** — when card_code eq "025"; upload_type eq "N"; loan_quantity gt 0, then create_record; set loan_status = "open"; emit slb.loan.opened. _Why: Open a new securities loan (Layout 025 with upload type N)._ *(error: `SLB_INVALID_LOAN_QUANTITY`)*
- **Pledge Collateral** — when card_code eq "026"; upload_type eq "N", then create_record; set collateral_status = "posted"; emit slb.collateral.pledged. _Why: Pledge cash or securities collateral against a loan (Layout 026)._ *(error: `SLB_COLLATERAL_UNLINKED`)*
- **Margin Call** — when collateral_value lt "required_margin", then set margin_call_raised = true; notify via email; emit slb.margin.call. _Why: Raise margin call when collateral value falls below required threshold._ *(error: `SLB_MARGIN_CALL_REQUIRED`)*
- **Force Close Loan** — when margin_call_unmet eq true OR counterparty_default eq true, then move loan_status open → force_closed; notify via email; emit slb.loan.force_closed. _Why: Force close loan on counterparty default or unmet margin call._ *(error: `SLB_FORCE_CLOSE_REQUIRED`)*
- **Trailer Validation** — when card_code eq "999", then emit slb.upload.response_delivered. _Why: Validate trailer record counts against records sent._ *(error: `SLB_TRAILER_COUNT_MISMATCH`)*

## Errors it can return

- `SLB_INVALID_CARD_CODE` — Card code is invalid
- `SLB_INVALID_BROKER_CODE` — Broker code is invalid or inactive
- `SLB_INVALID_UPLOAD_TYPE` — Upload type must be N, U, R, C
- `SLB_INVALID_ACCOUNT_CODE` — Account code is invalid or not permitted
- `SLB_INVALID_DEAL_ID` — Deal id is invalid for upload type
- `SLB_INVALID_INSTRUMENT` — Instrument code not loaded or not electronically settled
- `SLB_INVALID_LOAN_QUANTITY` — Loan quantity out of range
- `SLB_INVALID_LOAN_RATE` — Loan rate must be between 0 and 999.99 percent
- `SLB_INVALID_COLLATERAL_TYPE` — Collateral type must be S, C or blank
- `SLB_RETURN_DATE_BEFORE_RECEIVE` — Return date may not be before receive date
- `SLB_TRAILER_MISSING` — Trailer record not found
- `SLB_TRAILER_COUNT_MISMATCH` — Trailer total not same as records sent
- `SLB_DETAIL_BROKER_MISMATCH` — Detail broker code not same as header broker code
- `SLB_RECORD_AFTER_TRAILER` — Record received after trailer
- `SLB_DUPLICATE_TRAILER` — Duplicate trailer received
- `SLB_COLLATERAL_UNLINKED` — Collateral record references non-existent loan
- `SLB_MARGIN_CALL_REQUIRED` — Collateral value below required margin threshold
- `SLB_FORCE_CLOSE_REQUIRED` — Loan must be force-closed due to default or breach
- `SLB_PROCESSING_FAILED` — SLB upload processing failed

## Events

**`slb.loan.opened`**
  Payload: `broker_code`, `loan_deal_id`, `lender_account_code`, `borrower_account_code`, `loan_quantity`, `loan_rate`

**`slb.loan.returned`**
  Payload: `broker_code`, `loan_deal_id`, `return_date`, `return_quantity`

**`slb.collateral.pledged`**
  Payload: `broker_code`, `loan_deal_id`, `collateral_type`, `collateral_quantity`, `collateral_value`

**`slb.collateral.released`**
  Payload: `broker_code`, `loan_deal_id`, `collateral_quantity`

**`slb.collateral.marked`**
  Payload: `loan_deal_id`, `mark_price`, `collateral_value`

**`slb.margin.call`**
  Payload: `loan_deal_id`, `margin_shortfall`

**`slb.loan.force_closed`**
  Payload: `loan_deal_id`, `reason`

**`slb.fee.accrued`**
  Payload: `loan_deal_id`, `accrued_fee`, `accrual_date`

**`slb.upload.response_delivered`**
  Payload: `broker_code`, `sequence_number`, `records_processed`, `records_rejected`

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-deal-management-upload** *(optional)*
- **broker-client-data-upload** *(optional)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+3** since baseline (78 → 81)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 32 fields
- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-securities-lending-borrowing-upload/) · **Spec source:** [`broker-securities-lending-borrowing-upload.blueprint.yaml`](./broker-securities-lending-borrowing-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
