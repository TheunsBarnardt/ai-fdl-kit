<!-- AUTO-GENERATED FROM broker-deal-management-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Deal Management Upload

> Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · deal-allocation · t+3 · trades · fixed-width

## What this does

Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **record_type** *(text, required)*
- **broker_code** *(text, required)*
- **upload_date** *(date, required)*
- **deal_reference** *(text, required)*
- **order_reference** *(text, optional)*
- **trade_date** *(date, required)*
- **settlement_date** *(date, optional)*
- **buy_sell_indicator** *(select, required)*
- **instrument_code** *(text, required)*
- **isin** *(text, optional)*
- **quantity** *(number, required)*
- **price** *(number, required)*
- **consideration** *(number, optional)*
- **trade_time** *(text, optional)*
- **client_account** *(text, required)*
- **external_account_code** *(text, optional)*
- **commission_amount** *(number, optional)*
- **charges_amount** *(number, optional)*
- **vat_amount** *(number, optional)*
- **stt_amount** *(number, optional)*
- **allocation_reference** *(text, optional)*
- **partner_code** *(text, optional)*
- **branch_code** *(text, optional)*
- **portfolio_code** *(text, optional)*
- **dealer_code** *(text, optional)*
- **trade_type** *(select, optional)*
- **execution_venue** *(text, optional)*
- **counter_party_code** *(text, optional)*
- **principal_indicator** *(select, optional)*
- **cancellation_indicator** *(select, optional)*

## What must be true

- **submission_modes:** MUST: Support manual submission of deal allocations via FTP process, MUST: Support automated submission of deal allocations via FTP, MUST: Support automated submission of same-day allocations, MUST: Support automated submission of deals upload
- **setup:** MUST: Complete member setup and FTP process configuration before use, MUST: Set up email addresses for notifications
- **validation:** MUST: Validate external account code mapping to internal client account, MUST: Validate trade date, settlement date, and T+3 settlement rules, MUST: Validate buy/sell indicator is B or S, MUST: Reject unbalanced or incomplete allocation records
- **timing:** MUST: Process same-day allocations within business day cutoff, MUST: Process T+3 deal allocations before settlement cutoff, MUST: Support T+2 settlement where applicable per market rules
- **format:** MUST: Use fixed-width upload file format, MUST: Include Header and Trailer records in every upload

## Success & failure scenarios

**✅ Success paths**

- **Manual Deal Allocation Upload** — when submission_mode eq "manual_ftp", then create_record; emit deal_upload.manual.received.
- **Automated Deal Allocation Upload** — when submission_mode eq "automated_ftp", then create_record; emit deal_upload.automated.received.
- **Same Day Allocation Upload** — when allocation_type eq "same_day"; submission_time lt "cutoff_time", then create_record; emit deal_upload.same_day.received.
- **Deals Upload** — when upload_type eq "deals", then create_record; emit deal_upload.deals.received.
- **External Account Mapping** — when external_account_code exists, then call service; emit deal_upload.external_account.mapped.

**❌ Failure paths**

- **Allocation Cutoff Exceeded** — when allocation_type eq "same_day"; submission_time gte "cutoff_time", then emit deal_upload.cutoff_exceeded. *(error: `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED`)*

## Errors it can return

- `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT` — External account code cannot be mapped to a client account
- `DEAL_UPLOAD_INVALID_TRADE_DATE` — Trade date is invalid or outside allowed window
- `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND` — Referenced instrument does not exist
- `DEAL_UPLOAD_ALLOCATION_CUTOFF_EXCEEDED` — Same-day allocation submitted after cutoff time
- `DEAL_UPLOAD_DUPLICATE_DEAL` — Deal reference already exists

## Connects to

- **broker-back-office-dissemination** *(recommended)*
- **broker-client-data-upload** *(recommended)*
- **broker-financial-data-upload** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-deal-management-upload/) · **Spec source:** [`broker-deal-management-upload.blueprint.yaml`](./broker-deal-management-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
