<!-- AUTO-GENERATED FROM bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bonds Reference Corporate Actions Eod Data Delivery

> Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable events, corporate action schedules, and co...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · reference-data · corporate-actions · bonds · debt-securities · csv · xls · isin · non-live

## What this does

Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable events, corporate action schedules, and co...

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **universal_instrument_master_id** *(text, required)*
- **jse_alpha_code** *(text, required)*
- **isin** *(text, required)*
- **issuer_name** *(text, required)*
- **lei_code** *(text, optional)*
- **issue_type** *(select, required)*
- **cfi_code** *(text, optional)*
- **fisn_code** *(text, optional)*
- **issue_date** *(date, required)*
- **listed_unlisted_flag** *(boolean, required)*
- **instrument_status** *(select, required)*
- **status_reason** *(text, optional)*
- **nominal_amount** *(number, required)*
- **amount_authorised** *(number, optional)*
- **issue_price_format** *(select, optional)*
- **issue_price** *(number, optional)*
- **maturity_date** *(date, required)*
- **legal_final_maturity_date** *(date, optional)*
- **pricing_redemption_date** *(date, optional)*
- **most_recent_redemption_date** *(date, optional)*
- **pricing_method** *(select, optional)*
- **bond_calculator_indicator** *(boolean, optional)*
- **settlement_method** *(select, optional)*
- **settlement_provider** *(select, optional)*
- **sa_bond_category** *(select, optional)*
- **sub_sector** *(text, optional)*
- **sector** *(text, optional)*
- **major_division** *(text, optional)*
- **guarantee_ranking** *(select, optional)*
- **redemption_reimbursement_type** *(select, optional)*
- **specified_denomination** *(number, optional)*
- **underlying_foreign_issuer_indicator** *(boolean, optional)*
- **inward_listed** *(boolean, optional)*
- **country_of_issuance** *(text, optional)*
- **companion_bond_alpha_code** *(text, optional)*
- **companion_bond_instrument_type** *(text, optional)*
- **notes** *(rich_text, optional)*
- **aps_url_link** *(url, optional)*
- **pricing_class_code** *(select, optional)*
- **foreign_issuer** *(boolean, optional)*
- **compounded_calculated_coupon_rate** *(number, optional)*
- **coupon_rate** *(number, optional)*
- **coupon_currency** *(text, optional)*
- **coupon_withholding_tax** *(boolean, optional)*
- **business_day_convention** *(select, optional)*
- **coupon_frequency** *(select, optional)*
- **coupon_payment_type** *(select, optional)*
- **reference_rate** *(select, optional)*
- **basis_points** *(number, optional)*
- **over_under** *(select, optional)*
- **rate_of_reference_rate** *(number, optional)*
- **books_closed_period** *(number, optional)*
- **coupon_rate_floor** *(number, optional)*
- **coupon_rate_cap** *(number, optional)*
- **customised_coupon** *(select, optional)*
- **day_count_convention** *(select, optional)*
- **first_accrual_date** *(date, optional)*
- **first_interest_coupon_date** *(date, optional)*
- **first_books_close_date** *(date, optional)*
- **date_of_listing_reference_rate** *(date, optional)*
- **broken_first_coupon** *(boolean, optional)*
- **last_day_to_register_for_maturity_amount** *(date, optional)*
- **base_cpi_ref** *(number, optional)*
- **linked_reference_index** *(select, optional)*
- **previous_coupon_rate** *(number, optional)*
- **previous_rate_of_reference_rate** *(number, optional)*
- **previous_coupon_payment_date** *(date, optional)*
- **lookback_period** *(text, optional)*
- **interest_coupon_date** *(date, optional)*
- **actual_payment_date** *(date, optional)*
- **last_day_to_register** *(date, optional)*
- **coupon_determination_date** *(date, optional)*
- **call_indicator** *(boolean, optional)*
- **callable_step_up_date** *(date, optional)*
- **step_up_down_coupon_rate** *(number, optional)*
- **step_up_down_reference_rate** *(text, optional)*
- **step_up_down_basis_points** *(number, optional)*
- **exchange** *(text, optional)*
- **mic_code** *(text, optional)*
- **listing_date** *(date, optional)*
- **primary_market_indicator** *(boolean, optional)*
- **trading_currency** *(text, optional)*
- **bond_etp_indicator** *(boolean, optional)*
- **instrument_delisting_date** *(date, optional)*
- **redemption_date** *(date, optional)*
- **redemption_amount** *(number, optional)*
- **split_maturity_date** *(date, optional)*
- **split_maturity_date_notes** *(rich_text, optional)*
- **index_code** *(text, optional)*
- **reference_index_alpha_code** *(text, optional)*
- **instrument_name** *(text, optional)*
- **instrument_type** *(text, optional)*
- **mixed_rate_note_leg** *(text, optional)*
- **reference_instrument_alpha_code** *(text, optional)*
- **reference_instrument_isin** *(text, optional)*
- **institution_name** *(text, optional)*
- **guarantor_alpha_code** *(text, optional)*
- **entity_role_type** *(text, optional)*
- **leg_number** *(number, optional)*
- **leg_start_date** *(date, optional)*
- **leg_end_date** *(date, optional)*
- **leg_coupon_frequency** *(select, optional)*
- **leg_business_day_convention** *(select, optional)*
- **leg_coupon_rate** *(number, optional)*
- **leg_coupon_payment_type** *(select, optional)*
- **leg_basis_points** *(number, optional)*
- **leg_over_under** *(select, optional)*
- **leg_reference_rate** *(text, optional)*
- **leg_books_closed_period** *(number, optional)*
- **leg_day_count_convention** *(select, optional)*
- **leg_customised_coupon** *(select, optional)*
- **leg_underlying_index_code** *(text, optional)*
- **mixed_rate_conversion_determination_date** *(date, optional)*

## What must be true

- **dissemination:** MUST: Publish Bonds Instrument Reference 3x daily (SLA 11:30, 13:30, 16:20 SAST), MUST: Publish New Bonds Listing 3x daily at the same SLA times, MUST: Retain daily files for rolling 40 business days with _yyyymmdd suffix, MUST: Replace entire file each time (no delta changes)
- **identification:** MUST: Generate ISIN per ISO 6166 (12 chars, 2-letter country + 9-char identifier + check digit), MUST: Use G in 3rd character of ISIN for debt securities, MUST: Assign alpha code as primary identifier (max 6 alphanumeric, uppercase)
- **lifecycle:** MUST: Include new instrument on Issue date with status Listed, MUST: Retain instrument until month-end of status change month for delisted/matured/called/redeemed/repurchased, MUST: Create Callable/Step Up events at least 4 days before effective date
- **formats:** MUST: Provide CSV (one file per section) and XLS (consolidated workbook) formats, MUST: Use comma delimiter for CSV and blank row separators between files
- **access_control:** MUST: Verify subscriber entitlement before file generation

## Success & failure scenarios

**✅ Success paths**

- **Generate Bonds Instrument Reference Daily** — when scheduled dissemination time reached, then Generate 12 CSV files + 1 consolidated XLS workbook with General, Redemption Schedule, Coupon General, Coupon Schedule, Callable Step Up, Market Listing, Split Maturity, Reference Index, Reference Instrument, Reference Entities, Guarantor, Mixed Rate sheets; call service; emit bonds_ref.instrument_reference.disseminated.
- **Generate New Bonds Listing Daily** — when scheduled dissemination time reached, then 13 CSV files + 1 consolidated XLS covering instruments in process of listing (status Draft Approved, Pre-Listed, Listed Pending Coupon, Cancelled); emit bonds_ref.new_listings.disseminated.
- **Generate Corporate Actions Schedule** — when end of day corporate actions processing complete, then create_record; emit bonds_ref.corporate_actions.disseminated.
- **Generate Coupon Rate Update** — when coupon reset date reached for floating rate instrument, then create_record; emit bonds_ref.coupon_rate_update.disseminated.
- **Instrument Listed New** — when instrument_status eq "Listed"; issue_date eq "today", then set listed_flag = true; create_record; emit bonds_ref.instrument.listed.
- **Instrument Delisted Or Matured** — when instrument_status in ["Delisted","Matured","Called","Redeemed","Repurchased"], then set maturity_date = "effective_date_of_status_change"; emit bonds_ref.instrument.retired.
- **Callable Step Up Event Created** — when callable_step_up_date exists; days_until_effective gte 4, then create_record; emit bonds_ref.callable_step_up.created.
- **Historical Retention 40 Days** — when file disseminated successfully, then set retention_days = 40; emit bonds_ref.file.archived.

**❌ Failure paths**

- **Isin Generation Fails** — when isin matches "^.{0,11}$" OR isin_third_character neq "G", then notify via operations; emit bonds_ref.isin.generation_failed. *(error: `BONDS_REF_INVALID_ISIN`)*

## Errors it can return

- `BONDS_REF_SUBSCRIBER_NOT_PROVISIONED` — Subscriber not provisioned for bonds reference data products
- `BONDS_REF_FILE_GENERATION_FAILED` — Failed to generate bonds reference data file
- `BONDS_REF_INVALID_ISIN` — Generated ISIN does not conform to ISO 6166
- `BONDS_REF_MISSING_REQUIRED_FIELD` — Required reference field missing for listed instrument

## Connects to

- **bonds-eod-data-delivery** *(recommended)*
- **bond-etp-eod-data-delivery** *(recommended)*
- **equities-eod-data-delivery** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bonds-reference-corporate-actions-eod-data-delivery/) · **Spec source:** [`bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml`](./bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
