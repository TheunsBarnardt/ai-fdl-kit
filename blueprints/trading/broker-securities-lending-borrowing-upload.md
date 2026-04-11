<!-- AUTO-GENERATED FROM broker-securities-lending-borrowing-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Securities Lending Borrowing Upload

> Broker securities lending and borrowing (SLB) upload to central back-office via fixed-width records for loan, collateral, loan confirmation/return, and collateral confirmation/return

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · slb · securities-lending · borrowing · collateral · fixed-width · card-codes

## What this does

Broker securities lending and borrowing (SLB) upload to central back-office via fixed-width records for loan, collateral, loan confirmation/return, and collateral confirmation/return

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **loan_reference** *(text, optional)* — Loan Reference
- **loan_trade_date** *(date, optional)* — Loan Trade Date
- **loan_start_date** *(date, optional)* — Loan Start Date
- **loan_end_date** *(date, optional)* — Loan End Date
- **loan_account_code** *(text, optional)* — Loan Account Code
- **loan_instrument_code** *(text, optional)* — Loan Instrument Code
- **loan_isin** *(text, optional)* — Loan Isin
- **loan_quantity** *(number, optional)* — Loan Quantity
- **loan_rate** *(number, optional)* — Loan Rate
- **loan_fee** *(number, optional)* — Loan Fee
- **loan_counterparty** *(text, optional)* — Loan Counterparty
- **loan_type** *(select, optional)* — Loan Type
- **loan_direction** *(select, optional)* — Loan Direction
- **collateral_reference** *(text, optional)* — Collateral Reference
- **collateral_trade_date** *(date, optional)* — Collateral Trade Date
- **collateral_type** *(select, optional)* — Collateral Type
- **collateral_instrument** *(text, optional)* — Collateral Instrument
- **collateral_quantity** *(number, optional)* — Collateral Quantity
- **collateral_value** *(number, optional)* — Collateral Value
- **collateral_currency** *(text, optional)* — Collateral Currency
- **collateral_haircut** *(number, optional)* — Collateral Haircut
- **collateral_linked_loan_reference** *(text, optional)* — Collateral Linked Loan Reference
- **confirmation_type** *(select, optional)* — Confirmation Type
- **confirmation_date** *(date, optional)* — Confirmation Date
- **return_quantity** *(number, optional)* — Return Quantity
- **return_amount** *(number, optional)* — Return Amount
- **collateral_confirmation_type** *(select, optional)* — Collateral Confirmation Type
- **collateral_return_quantity** *(number, optional)* — Collateral Return Quantity
- **collateral_return_value** *(number, optional)* — Collateral Return Value

## What must be true

- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses before allowing upload, MUST: Provide error reporting via COMPR and PCOMPR functions, MUST: Generate response dataset with per-record response codes, MUST: Archive processed upload files
- **validation:** MUST: Validate loan and collateral reference uniqueness, MUST: Link collateral records to existing loan references, MUST: Validate trade date is within acceptable window, MUST: Validate counterparty exists in master data
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Layout 025 for loan upload, MUST: Use Layout 026 for collateral upload, MUST: Use Layout 027 for loan confirmation/return, MUST: Use Layout 028 for collateral confirmation/return
- **lifecycle:** MUST: Support open-ended and fixed-term loan types, MUST: Allow partial or full return of loans and collateral, MUST: Update loan status on confirmation and return

## Success & failure scenarios

**✅ Success paths**

- **Loan Confirmation Return** — when card_code eq "027", then move loan_status open → confirmed_or_returned; emit slb_upload.loan.confirmed.
- **Collateral Confirmation Return** — when card_code eq "028", then move collateral_status posted → confirmed_or_returned; emit slb_upload.collateral.confirmed.
- **Validate Collateral Link** — when card_code eq "026"; collateral_linked_loan_exists eq false, then emit slb_upload.collateral.unlinked.
- **Generate Response Dataset** — when upload processing complete, then create_record; notify via email; emit slb_upload.response.delivered.

**❌ Failure paths**

- **Automated Loan Upload** — when card_code eq "025"; email_configured eq true, then create_record; emit slb_upload.loan.received. *(error: `SLB_UPLOAD_INVALID_LOAN_REF`)*
- **Automated Collateral Upload** — when card_code eq "026", then create_record; emit slb_upload.collateral.received. *(error: `SLB_UPLOAD_COLLATERAL_NOT_LINKED`)*

## Errors it can return

- `SLB_UPLOAD_INVALID_LOAN_REF` — Loan reference is invalid or duplicate
- `SLB_UPLOAD_COLLATERAL_NOT_LINKED` — Collateral record references non-existent loan
- `SLB_UPLOAD_INVALID_COUNTERPARTY` — SLB counterparty not found in master data
- `SLB_UPLOAD_INSTRUMENT_NOT_FOUND` — Referenced instrument does not exist
- `SLB_UPLOAD_PROCESSING_FAILED` — SLB upload processing failed

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-deal-management-upload** *(optional)*
- **broker-client-data-upload** *(optional)*

## Quality fitness 🟢 78/100

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
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+8** since baseline (70 → 78)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 32 fields
- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-securities-lending-borrowing-upload/) · **Spec source:** [`broker-securities-lending-borrowing-upload.blueprint.yaml`](./broker-securities-lending-borrowing-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
