<!-- AUTO-GENERATED FROM broker-dematerialisation-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Dematerialisation Upload

> Bulk dematerialisation upload from broker to back-office via fixed-width card-code file, validating paper certificates against the register and routing holdings to the central depository

**Category:** Trading · **Version:** 1.1.0 · **Tags:** back-office · broker · upload · demat · dematerialisation · positions · card-codes · fixed-width · certificate-register · central-depository

## What this does

Bulk dematerialisation upload from broker to back-office via fixed-width card-code file, validating paper certificates against the register and routing holdings to the central depository

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **upload_time** *(text, required)* — Upload Time
- **sequence_prefix** *(text, required)* — Sequence Prefix
- **sequence_number** *(text, required)* — Sequence Number
- **account_code** *(text, required)* — Account Code
- **account_type** *(select, required)* — Account Type
- **instrument_type** *(select, required)* — Instrument Type
- **instrument_alpha** *(text, required)* — Instrument Alpha
- **instrument_version** *(text, required)* — Instrument Version
- **share_quantity** *(number, required)* — Share Quantity
- **portfolio_cost** *(number, optional)* — Portfolio Cost (cents)
- **demat_request_type** *(select, required)* — Demat Request Type
- **certificate_number** *(text, optional)* — Physical Certificate Number
- **certificate_destroyed** *(boolean, optional)* — Physical Certificate Destruction Confirmed
- **total_records** *(number, required)* — Total Records
- **records_processed** *(number, optional)* — Records Processed
- **records_rejected** *(number, optional)* — Records Rejected

## What must be true

- **subscription:** MUST: Require broker subscription before enabling DEMAT upload service
- **processing:** MUST: Only accept positions on accounts of type C (controlled client), MUST: Only accept electronically settled instruments, MUST: Only create new positions (no closing of positions via upload), MUST: Exclude non-dematerialised scrip, MUST: Apply PFV cost only when provided (no actual/average calculation), MUST: Update position only when all field validations pass, MUST: Validate paper certificate numbers against the physical certificate register before deposit, MUST: Require confirmation of physical certificate destruction before electronic holding is created
- **submission:** MUST: Support automated FTP submission and auto-dispatch of processing batch, MUST: Allow up to 10 response e-mail addresses per broker, MUST: Produce a response dataset containing each input line annotated with response codes, MUST: Archive both upload and response files on a rolling cycle
- **format:** MUST: Use fixed-width card-code record format, total record length 100, MUST: Begin each file with Header Record (Card Code 000), MUST: End each file with Trailer Record (Card Code 999), MUST: Use Card Code 030 for DEMAT share upload records, MUST: Reject entire file if trailer record is missing, duplicated, or totals mismatch
- **audit:** MUST: Maintain immutable audit trail of every demat request, validation outcome and depository routing, MUST: Link each electronic holding back to the originating certificate number and destruction evidence

## Success & failure scenarios

**✅ Success paths**

- **Automated Demat Upload** — when broker_subscribed eq true; email_configured eq true, then create_record; emit demat_upload.received. _Why: Broker uploads a DEMAT file via automated FTP._
- **Bulk Demat Deposit** — when card_code eq "030"; demat_request_type eq "D"; account_type eq "C"; instrument_type eq "E", then create_record; call service; emit demat_upload.deposit.created. _Why: Bulk deposit of paper share certificates converted to electronic holdings._
- **Validate Depository Reference** — when card_code eq "030", then call service; emit demat_upload.depository.validated. _Why: Validate central depository account and participant reference._
- **Generate Response Dataset** — when processing_status eq "completed", then create_record; notify via email; emit demat_upload.response.delivered. _Why: Generate response dataset with per-record response codes and totals._
- **Archive Upload** — when processing_status eq "completed", then call service; emit demat_upload.archived. _Why: Archive processed DEMAT upload and response files on rolling cycle._

**❌ Failure paths**

- **Not Subscribed** — when broker_subscribed eq false, then emit demat_upload.not_subscribed. _Why: Broker is not subscribed to the DEMAT upload service._ *(error: `DEMAT_UPLOAD_NOT_SUBSCRIBED`)*
- **Demat Validation Against Cert Register** — when demat_request_type eq "D"; certificate_number exists, then call service; set certificate_destroyed = true; emit demat_upload.certificate.validated. _Why: Validate the paper certificate against the physical certificate register before creating the electronic holding._ *(error: `DEMAT_UPLOAD_CERT_NOT_IN_REGISTER`)*
- **Demat Rejection Handling** — when record_valid eq false, then set records_rejected = "records_rejected_plus_1"; create_record; notify via email; emit demat_upload.record.rejected. _Why: Record-level rejection with response code appended to the originating line._ *(error: `DEMAT_UPLOAD_FILE_REJECTED`)*

## Errors it can return

- `DEMAT_UPLOAD_NOT_SUBSCRIBED` — Broker not subscribed to DEMAT upload service
- `DEMAT_UPLOAD_INVALID_DEPOSITORY_REF` — Central depository account or participant reference is invalid
- `DEMAT_UPLOAD_INSTRUMENT_NOT_FOUND` — Referenced instrument does not exist or is not electronically settled
- `DEMAT_UPLOAD_ACCOUNT_NOT_FOUND` — Referenced client account does not exist or is not type C
- `DEMAT_UPLOAD_CERT_NOT_IN_REGISTER` — Physical certificate number not found in certificate register
- `DEMAT_UPLOAD_CERT_NOT_DESTROYED` — Physical certificate destruction has not been confirmed
- `DEMAT_UPLOAD_TRAILER_MISMATCH` — Trailer totals do not reconcile to records received
- `DEMAT_UPLOAD_FILE_REJECTED` — Upload file rejected due to structural error
- `DEMAT_UPLOAD_PROCESSING_FAILED` — DEMAT upload processing failed

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*
- **broker-deal-management-upload** *(optional)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+1** since baseline (77 → 78)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 17 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-dematerialisation-upload/) · **Spec source:** [`broker-dematerialisation-upload.blueprint.yaml`](./broker-dematerialisation-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
