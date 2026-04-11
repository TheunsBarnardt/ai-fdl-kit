<!-- AUTO-GENERATED FROM broker-dematerialisation-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Dematerialisation Upload

> Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response codes

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · demat · dematerialisation · positions · card-codes · fixed-width

## What this does

Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response codes

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)*
- **broker_code** *(text, required)*
- **upload_date** *(date, required)*
- **account_number** *(text, required)*
- **instrument_code** *(text, required)*
- **isin** *(text, optional)*
- **demat_quantity** *(number, required)*
- **csdp_account_number** *(text, optional)*
- **csdp_code** *(text, optional)*
- **effective_date** *(date, optional)*
- **reference_number** *(text, optional)*
- **cost_value** *(number, optional)*
- **market_value** *(number, optional)*
- **position_type** *(select, optional)*
- **pledge_indicator** *(select, optional)*
- **restriction_indicator** *(select, optional)*
- **record_count** *(number, optional)*

## What must be true

- **subscription:** MUST: Require broker subscription to DEMAT upload service before use
- **processing:** MUST: Apply defined processing rules to every uploaded record, MUST: Validate CSDP account and code references, MUST: Reject records with invalid instrument or account references
- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses for response notifications, MUST: Provide error reporting via COMPR and PCOMPR functions, MUST: Generate response dataset with per-record status and response codes, MUST: Archive processed upload files
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Card Code 030 for demat share position records

## Success & failure scenarios

**✅ Success paths**

- **Automated Demat Upload** — when broker_subscribed eq true; email_configured eq true, then create_record; emit demat_upload.received.
- **Validate Csdp Reference** — when card_code eq "030", then call service; emit demat_upload.csdp.validated.
- **Generate Response Dataset** — when upload processing complete, then create_record; notify via email; emit demat_upload.response.delivered.
- **Archive Upload** — when processing_status eq "completed", then call service; emit demat_upload.archived.

**❌ Failure paths**

- **Not Subscribed** — when broker_subscribed eq false, then emit demat_upload.not_subscribed. *(error: `DEMAT_UPLOAD_NOT_SUBSCRIBED`)*

## Errors it can return

- `DEMAT_UPLOAD_NOT_SUBSCRIBED` — Broker not subscribed to DEMAT upload service
- `DEMAT_UPLOAD_INVALID_CSDP` — CSDP account or code is invalid
- `DEMAT_UPLOAD_INSTRUMENT_NOT_FOUND` — Referenced instrument does not exist
- `DEMAT_UPLOAD_ACCOUNT_NOT_FOUND` — Referenced client account does not exist
- `DEMAT_UPLOAD_PROCESSING_FAILED` — DEMAT upload processing failed

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*
- **broker-deal-management-upload** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-dematerialisation-upload/) · **Spec source:** [`broker-dematerialisation-upload.blueprint.yaml`](./broker-dematerialisation-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
