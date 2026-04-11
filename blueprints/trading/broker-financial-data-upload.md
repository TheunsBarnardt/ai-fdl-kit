<!-- AUTO-GENERATED FROM broker-financial-data-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Financial Data Upload

> Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, online and batch submission modes

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · financial-data · cash-book · journal · gl · fixed-width

## What this does

Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, online and batch submission modes

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **layout_number** *(text, required)*
- **broker_code** *(text, required)*
- **upload_date** *(date, required)*
- **record_count** *(number, optional)*
- **receipt_reference** *(text, optional)*
- **receipt_date** *(date, optional)*
- **receipt_account** *(text, optional)*
- **receipt_amount** *(number, optional)*
- **receipt_description** *(text, optional)*
- **receipt_bank_account** *(text, optional)*
- **receipt_currency** *(text, optional)*
- **payment_reference** *(text, optional)*
- **payment_date** *(date, optional)*
- **payment_account** *(text, optional)*
- **payment_amount** *(number, optional)*
- **payment_description** *(text, optional)*
- **payment_bank_account** *(text, optional)*
- **payment_currency** *(text, optional)*
- **journal_reference** *(text, optional)*
- **journal_date** *(date, optional)*
- **journal_debit_account** *(text, optional)*
- **journal_credit_account** *(text, optional)*
- **journal_amount** *(number, optional)*
- **journal_description** *(text, optional)*
- **journal_vat_code** *(text, optional)*

## What must be true

- **submission:** MUST: Support FTP automated submission, MUST: Support online automated upload, MUST: Support online manual upload, MUST: Support batch upload mode, MUST: Configure email address before allowing upload
- **validation:** MUST: Report errors via COMPR and PCOMPR error reporting, MUST: Generate response dataset with per-record status, MUST: Allow editing of uploaded data before processing completion
- **format:** MUST: Use fixed-width layout format, MUST: Start with Header Record (Layout 000), MUST: End with Trailer Record (Layout 999), MUST: Use Layout 063 for cash book receipts, MUST: Use Layout 064 for cash book payments, MUST: Use Layout 065 for general journal entries
- **balancing:** MUST: Ensure journal debits equal credits for each journal entry, MUST: Balance cash book entries against bank account movements

## Success & failure scenarios

**✅ Success paths**

- **Automated Ftp Upload** — when upload_method eq "ftp"; email_configured eq true, then create_record; emit fin_upload.received.
- **Manual Online Upload** — when upload_method eq "online_manual", then create_record; emit fin_upload.manual_received.
- **Validate Journal Balance** — when layout_number eq "065", then call service; emit fin_upload.journal.validated.
- **Generate Response Dataset** — when upload processing complete, then create_record; notify via email; emit fin_upload.response.delivered.

**❌ Failure paths**

- **Unbalanced Journal** — when debit_credit_diff neq 0, then emit fin_upload.journal.unbalanced. *(error: `FIN_UPLOAD_UNBALANCED_JOURNAL`)*

## Errors it can return

- `FIN_UPLOAD_INVALID_LAYOUT` — Financial data upload file has invalid layout structure
- `FIN_UPLOAD_UNBALANCED_JOURNAL` — Journal entry debits do not equal credits
- `FIN_UPLOAD_INVALID_ACCOUNT` — Referenced account does not exist
- `FIN_UPLOAD_DUPLICATE_REFERENCE` — Transaction reference already exists
- `FIN_UPLOAD_PROCESSING_FAILED` — Financial upload processing failed

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-financial-data-upload/) · **Spec source:** [`broker-financial-data-upload.blueprint.yaml`](./broker-financial-data-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
