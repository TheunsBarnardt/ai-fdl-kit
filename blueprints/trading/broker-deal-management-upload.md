<!-- AUTO-GENERATED FROM broker-deal-management-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Deal Management Upload

> Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · upload · deal-allocation · t+3 · trades · fixed-width

## What this does

Broker deal management upload to central back-office - deal allocations, same-day allocations, and deals uploads with manual and automated FTP submission modes, external account code mapping

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **record_type** *(text, required)* — Record Type
- **broker_code** *(text, required)* — Broker Code
- **upload_date** *(date, required)* — Upload Date
- **deal_reference** *(text, required)* — Deal Reference
- **order_reference** *(text, optional)* — Order Reference
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, optional)* — Settlement Date
- **buy_sell_indicator** *(select, required)* — Buy Sell Indicator
- **instrument_code** *(text, required)* — Instrument Code
- **isin** *(text, optional)* — Isin
- **quantity** *(number, required)* — Quantity
- **price** *(number, required)* — Price
- **consideration** *(number, optional)* — Consideration
- **trade_time** *(text, optional)* — Trade Time
- **client_account** *(text, required)* — Client Account
- **external_account_code** *(text, optional)* — External Account Code
- **commission_amount** *(number, optional)* — Commission Amount
- **charges_amount** *(number, optional)* — Charges Amount
- **vat_amount** *(number, optional)* — Vat Amount
- **stt_amount** *(number, optional)* — Stt Amount
- **allocation_reference** *(text, optional)* — Allocation Reference
- **partner_code** *(text, optional)* — Partner Code
- **branch_code** *(text, optional)* — Branch Code
- **portfolio_code** *(text, optional)* — Portfolio Code
- **dealer_code** *(text, optional)* — Dealer Code
- **trade_type** *(select, optional)* — Trade Type
- **execution_venue** *(text, optional)* — Execution Venue
- **counter_party_code** *(text, optional)* — Counter Party Code
- **principal_indicator** *(select, optional)* — Principal Indicator
- **cancellation_indicator** *(select, optional)* — Cancellation Indicator

## What must be true

- **submission_modes:** MUST: Support manual submission of deal allocations via FTP process, MUST: Support automated submission of deal allocations via FTP, MUST: Support automated submission of same-day allocations, MUST: Support automated submission of deals upload
- **setup:** MUST: Complete member setup and FTP process configuration before use, MUST: Set up email addresses for notifications
- **validation:** MUST: Validate external account code mapping to internal client account, MUST: Validate trade date, settlement date, and T+3 settlement rules, MUST: Validate buy/sell indicator is B or S, MUST: Reject unbalanced or incomplete allocation records
- **timing:** MUST: Process same-day allocations within business day cutoff, MUST: Process T+3 deal allocations before settlement cutoff, MUST: Support T+2 settlement where applicable per market rules
- **format:** MUST: Use fixed-width upload file format, MUST: Include Header and Trailer records in every upload

## Success & failure scenarios

**✅ Success paths**

- **Same Day Allocation Upload** — when allocation_type eq "same_day"; submission_time lt "cutoff_time", then create_record; emit deal_upload.same_day.received.
- **External Account Mapping** — when external_account_code exists, then call service; emit deal_upload.external_account.mapped.

**❌ Failure paths**

- **Manual Deal Allocation Upload** — when submission_mode eq "manual_ftp", then create_record; emit deal_upload.manual.received. *(error: `DEAL_UPLOAD_INVALID_EXTERNAL_ACCOUNT`)*
- **Automated Deal Allocation Upload** — when submission_mode eq "automated_ftp", then create_record; emit deal_upload.automated.received. *(error: `DEAL_UPLOAD_INVALID_TRADE_DATE`)*
- **Deals Upload** — when upload_type eq "deals", then create_record; emit deal_upload.deals.received. *(error: `DEAL_UPLOAD_INSTRUMENT_NOT_FOUND`)*
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

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 30 fields
- `T5` **bind-orphan-errors** — bound 3 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-deal-management-upload/) · **Spec source:** [`broker-deal-management-upload.blueprint.yaml`](./broker-deal-management-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
