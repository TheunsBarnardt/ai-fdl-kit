<!-- AUTO-GENERATED FROM broker-back-office-dissemination.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Back Office Dissemination

> Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · dissemination · fixed-width · card-codes · accounts · deals · scrip · gl · sbl · elective-events · corporate-actions

## What this does

Back-office data dissemination from central broker administration to member firms via fixed-width card code records (accounts, balances, deals, scrip, GL, SLB, elective events)

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **card_code** *(text, required)* — Card Code
- **layout_number** *(text, required)* — Layout Number
- **broker_code** *(text, required)* — Broker Code
- **dissemination_date** *(date, required)* — Dissemination Date
- **record_count** *(number, optional)* — Record Count
- **account_number** *(text, required)* — Account Number
- **account_name** *(text, required)* — Account Name
- **branch_code** *(text, optional)* — Branch Code
- **partner_code** *(text, optional)* — Partner Code
- **portfolio_indicator** *(select, optional)* — Portfolio Indicator
- **date_deactivated** *(date, optional)* — Date Deactivated
- **dividend_advice_note_indicator** *(select, optional)* — Dividend Advice Note Indicator
- **it3b_exclusion** *(select, optional)* — It3b Exclusion
- **it3c_exclusion** *(select, optional)* — It3c Exclusion
- **fatca_status** *(text, optional)* — Fatca Status
- **ret_exempt_code** *(text, optional)* — Ret Exempt Code
- **wti_exempt_code** *(text, optional)* — Wti Exempt Code
- **undocumented_reason_code** *(text, optional)* — Undocumented Reason Code
- **general_compliance_reason_code** *(text, optional)* — General Compliance Reason Code
- **tax_identification_type_code** *(text, optional)* — Tax Identification Type Code
- **balance_amount** *(number, optional)* — Balance Amount
- **available_balance** *(number, optional)* — Available Balance
- **gl_account_code** *(text, optional)* — Gl Account Code
- **gl_balance** *(number, optional)* — Gl Balance
- **gl_designation_code** *(text, optional)* — Gl Designation Code
- **transaction_reference** *(text, optional)* — Transaction Reference
- **transaction_date** *(date, optional)* — Transaction Date
- **transaction_amount** *(number, optional)* — Transaction Amount
- **transaction_origin_user** *(text, optional)* — Transaction Origin User
- **reason_code** *(text, optional)* — Reason Code
- **time_stamp** *(datetime, optional)* — Time Stamp
- **instrument_code** *(text, optional)* — Instrument Code
- **isin** *(text, optional)* — Isin
- **quantity** *(number, optional)* — Quantity
- **portfolio_cost** *(number, optional)* — Portfolio Cost
- **charge_structure_code** *(text, optional)* — Charge Structure Code
- **instrument_name** *(text, optional)* — Instrument Name
- **icb_sector_code** *(text, optional)* — Icb Sector Code
- **instrument_type** *(text, optional)* — Instrument Type
- **bee_instrument_code** *(text, optional)* — Bee Instrument Code
- **bee_effective_date** *(date, optional)* — Bee Effective Date
- **slb_trade_date** *(date, optional)* — Slb Trade Date
- **slb_loan_reference** *(text, optional)* — Slb Loan Reference
- **collateral_reference** *(text, optional)* — Collateral Reference
- **freed_indicator** *(select, optional)* — Freed Indicator
- **dividend_declaration_date** *(date, optional)* — Dividend Declaration Date
- **ex_dividend_date** *(date, optional)* — Ex Dividend Date
- **dividend_amount** *(number, optional)* — Dividend Amount
- **withholding_tax_amount** *(number, optional)* — Withholding Tax Amount
- **communication_by_issuer** *(text, optional)* — Communication By Issuer
- **event_reference** *(text, optional)* — Event Reference
- **event_type_code** *(text, optional)* — Event Type Code
- **event_effective_date** *(date, optional)* — Event Effective Date

## What must be true

- **scheduling:** MUST: Allow broker users to schedule dissemination via online request process function, MUST: Support multiple scheduled requests per day per broker, MUST: Allow filtering by branch code, partner code, portfolio indicator, and FATCA flags, MUST: Support download of full daily data set or changes-only (delta) mode depending on data type
- **grouping:** MUST: Group related data into distinct Card Codes to isolate business domains, MUST: Allocate General Ledger data to separate dataset from other disseminated data, MUST: Allow end users to select which card codes to download per dataset
- **format:** MUST: Use fixed-width card code record format, MUST: Start every dissemination file with Header record (Card Code 000), MUST: End every dissemination file with Trailer record (Card Code 999), MUST: Include layout version number in each record
- **access_control:** MUST: Verify user has relevant access before scheduling dissemination, MUST: Allow dissemination to member firms and authorized service providers
- **frozen_file:** MUST: Support frozen elective event file download via online request process, MUST: Require email address setup before frozen file access, MUST: Provide Header (000), Event Detail (071), Account Detail (072), and Trailer (999) records in frozen file

## Success & failure scenarios

**✅ Success paths**

- **Download Full Vs Changes** — when download_mode in ["full","changes"], then set delta_mode = "changes"; emit broker_dissem.mode.selected.
- **Download Elective Frozen File** — when email_configured eq true; dataset_access eq true, then create_record; emit broker_dissem.frozen_file.delivered.

**❌ Failure paths**

- **Schedule Dissemination Request** — when user_has_access eq true; schedule_parameters exists, then create_record; emit broker_dissem.schedule.created. *(error: `DISSEM_INVALID_SCHEDULE`)*
- **Generate Eod Dissemination File** — when EOD batch process triggered; scheduled dissemination request exists, then create_record; call service; emit broker_dissem.file.generated. *(error: `DISSEM_FROZEN_FILE_UNAVAILABLE`)*
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

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 53 fields
- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-back-office-dissemination/) · **Spec source:** [`broker-back-office-dissemination.blueprint.yaml`](./broker-back-office-dissemination.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
