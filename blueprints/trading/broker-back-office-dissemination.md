<!-- AUTO-GENERATED FROM broker-back-office-dissemination.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Back Office Dissemination

> Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · dissemination · fixed-width · card-codes · accounts · deals · scrip · gl · sbl · elective-events · corporate-actions

## What this does

Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)*
- **layout_number** *(text, required)*
- **broker_code** *(text, required)*
- **dissemination_date** *(date, required)*
- **record_count** *(number, optional)*
- **account_number** *(text, required)*
- **account_name** *(text, required)*
- **branch_code** *(text, optional)*
- **partner_code** *(text, optional)*
- **portfolio_indicator** *(select, optional)*
- **date_deactivated** *(date, optional)*
- **dividend_advice_note_indicator** *(select, optional)*
- **it3b_exclusion** *(select, optional)*
- **it3c_exclusion** *(select, optional)*
- **fatca_status** *(text, optional)*
- **ret_exempt_code** *(text, optional)*
- **wti_exempt_code** *(text, optional)*
- **undocumented_reason_code** *(text, optional)*
- **general_compliance_reason_code** *(text, optional)*
- **tax_identification_type_code** *(text, optional)*
- **balance_amount** *(number, optional)*
- **available_balance** *(number, optional)*
- **gl_account_code** *(text, optional)*
- **gl_balance** *(number, optional)*
- **gl_designation_code** *(text, optional)*
- **transaction_reference** *(text, optional)*
- **transaction_date** *(date, optional)*
- **transaction_amount** *(number, optional)*
- **transaction_origin_user** *(text, optional)*
- **reason_code** *(text, optional)*
- **time_stamp** *(datetime, optional)*
- **instrument_code** *(text, optional)*
- **isin** *(text, optional)*
- **quantity** *(number, optional)*
- **portfolio_cost** *(number, optional)*
- **charge_structure_code** *(text, optional)*
- **instrument_name** *(text, optional)*
- **icb_sector_code** *(text, optional)*
- **instrument_type** *(text, optional)*
- **bee_instrument_code** *(text, optional)*
- **bee_effective_date** *(date, optional)*
- **slb_trade_date** *(date, optional)*
- **slb_loan_reference** *(text, optional)*
- **collateral_reference** *(text, optional)*
- **freed_indicator** *(select, optional)*
- **dividend_declaration_date** *(date, optional)*
- **ex_dividend_date** *(date, optional)*
- **dividend_amount** *(number, optional)*
- **withholding_tax_amount** *(number, optional)*
- **communication_by_issuer** *(text, optional)*
- **event_reference** *(text, optional)*
- **event_type_code** *(text, optional)*
- **event_effective_date** *(date, optional)*

## What must be true

- **scheduling:** MUST: Allow broker users to schedule dissemination via online request process function, MUST: Support multiple scheduled requests per day per broker, MUST: Allow filtering by branch code, partner code, portfolio indicator, and FATCA flags, MUST: Support download of full daily data set or changes-only (delta) mode depending on data type
- **grouping:** MUST: Group related data into distinct Card Codes to isolate business domains, MUST: Allocate General Ledger data to separate dataset from other disseminated data, MUST: Allow end users to select which card codes to download per dataset
- **format:** MUST: Use fixed-width card code record format, MUST: Start every dissemination file with Header record (Card Code 000), MUST: End every dissemination file with Trailer record (Card Code 999), MUST: Include layout version number in each record
- **access_control:** MUST: Verify user has relevant access before scheduling dissemination, MUST: Allow dissemination to member firms and authorized service providers
- **frozen_file:** MUST: Support frozen elective event file download via online request process, MUST: Require email address setup before frozen file access, MUST: Provide Header (000), Event Detail (071), Account Detail (072), and Trailer (999) records in frozen file

## Success & failure scenarios

**✅ Success paths**

- **Schedule Dissemination Request** — when user_has_access eq true; schedule_parameters exists, then create_record; emit broker_dissem.schedule.created.
- **Generate Eod Dissemination File** — when EOD batch process triggered; scheduled dissemination request exists, then create_record; call service; emit broker_dissem.file.generated.
- **Download Full Vs Changes** — when download_mode in ["full","changes"], then set delta_mode = "changes"; emit broker_dissem.mode.selected.
- **Download Elective Frozen File** — when email_configured eq true; dataset_access eq true, then create_record; emit broker_dissem.frozen_file.delivered.

**❌ Failure paths**

- **Scheduling Access Denied** — when user_has_access eq false, then emit broker_dissem.access_denied. *(error: `DISSEM_ACCESS_DENIED`)*
- **File Generation Failure** — when generation_status eq "failed", then notify via operations; emit broker_dissem.generation.failed. *(error: `DISSEM_FILE_GENERATION_FAILED`)*

## Errors it can return

- `DISSEM_ACCESS_DENIED` — User does not have access to schedule dissemination
- `DISSEM_INVALID_SCHEDULE` — Invalid dissemination schedule parameters
- `DISSEM_DATASET_NOT_FOUND` — Requested dataset is not available or not configured
- `DISSEM_FROZEN_FILE_UNAVAILABLE` — Elective event frozen file not available for requested date
- `DISSEM_FILE_GENERATION_FAILED` — Failed to generate dissemination file

## Connects to

- **broker-client-data-upload** *(recommended)*
- **broker-financial-data-upload** *(recommended)*
- **broker-deal-management-upload** *(recommended)*
- **broker-dematerialisation-upload** *(optional)*
- **broker-securities-lending-borrowing-upload** *(recommended)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-back-office-dissemination/) · **Spec source:** [`broker-back-office-dissemination.blueprint.yaml`](./broker-back-office-dissemination.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
