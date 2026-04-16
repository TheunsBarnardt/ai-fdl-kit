<!-- AUTO-GENERATED FROM bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bonds Reference Corporate Actions Eod Data Delivery

> Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable events, corporate action schedules, and co...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · reference-data · corporate-actions · bonds · debt-securities · csv · xls · isin · non-live

## What this does

Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable events, corporate action schedules, and co...

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **universal_instrument_master_id** *(text, required)* — Universal Instrument Master Id
- **jse_alpha_code** *(text, required)* — Jse Alpha Code
- **isin** *(text, required)* — Isin
- **issuer_name** *(text, required)* — Issuer Name
- **lei_code** *(text, optional)* — Lei Code
- **issue_type** *(select, required)* — Issue Type
- **cfi_code** *(text, optional)* — Cfi Code
- **fisn_code** *(text, optional)* — Fisn Code
- **issue_date** *(date, required)* — Issue Date
- **listed_unlisted_flag** *(boolean, required)* — Listed Unlisted Flag
- **instrument_status** *(select, required)* — Instrument Status
- **status_reason** *(text, optional)* — Status Reason
- **nominal_amount** *(number, required)* — Nominal Amount
- **amount_authorised** *(number, optional)* — Amount Authorised
- **issue_price_format** *(select, optional)* — Issue Price Format
- **issue_price** *(number, optional)* — Issue Price
- **maturity_date** *(date, required)* — Maturity Date
- **legal_final_maturity_date** *(date, optional)* — Legal Final Maturity Date
- **pricing_redemption_date** *(date, optional)* — Pricing Redemption Date
- **most_recent_redemption_date** *(date, optional)* — Most Recent Redemption Date
- **pricing_method** *(select, optional)* — Pricing Method
- **bond_calculator_indicator** *(boolean, optional)* — Bond Calculator Indicator
- **settlement_method** *(select, optional)* — Settlement Method
- **settlement_provider** *(select, optional)* — Settlement Provider
- **sa_bond_category** *(select, optional)* — Sa Bond Category
- **sub_sector** *(text, optional)* — Sub Sector
- **sector** *(text, optional)* — Sector
- **major_division** *(text, optional)* — Major Division
- **guarantee_ranking** *(select, optional)* — Guarantee Ranking
- **redemption_reimbursement_type** *(select, optional)* — Redemption Reimbursement Type
- **specified_denomination** *(number, optional)* — Specified Denomination
- **underlying_foreign_issuer_indicator** *(boolean, optional)* — Underlying Foreign Issuer Indicator
- **inward_listed** *(boolean, optional)* — Inward Listed
- **country_of_issuance** *(text, optional)* — Country Of Issuance
- **companion_bond_alpha_code** *(text, optional)* — Companion Bond Alpha Code
- **companion_bond_instrument_type** *(text, optional)* — Companion Bond Instrument Type
- **notes** *(rich_text, optional)* — Notes
- **aps_url_link** *(url, optional)* — Aps Url Link
- **pricing_class_code** *(select, optional)* — Pricing Class Code
- **foreign_issuer** *(boolean, optional)* — Foreign Issuer
- **compounded_calculated_coupon_rate** *(number, optional)* — Compounded Calculated Coupon Rate
- **coupon_rate** *(number, optional)* — Coupon Rate
- **coupon_currency** *(text, optional)* — Coupon Currency
- **coupon_withholding_tax** *(boolean, optional)* — Coupon Withholding Tax
- **business_day_convention** *(select, optional)* — Business Day Convention
- **coupon_frequency** *(select, optional)* — Coupon Frequency
- **coupon_payment_type** *(select, optional)* — Coupon Payment Type
- **reference_rate** *(select, optional)* — Reference Rate
- **basis_points** *(number, optional)* — Basis Points
- **over_under** *(select, optional)* — Over Under
- **rate_of_reference_rate** *(number, optional)* — Rate Of Reference Rate
- **books_closed_period** *(number, optional)* — Books Closed Period
- **coupon_rate_floor** *(number, optional)* — Coupon Rate Floor
- **coupon_rate_cap** *(number, optional)* — Coupon Rate Cap
- **customised_coupon** *(select, optional)* — Customised Coupon
- **day_count_convention** *(select, optional)* — Day Count Convention
- **first_accrual_date** *(date, optional)* — First Accrual Date
- **first_interest_coupon_date** *(date, optional)* — First Interest Coupon Date
- **first_books_close_date** *(date, optional)* — First Books Close Date
- **date_of_listing_reference_rate** *(date, optional)* — Date Of Listing Reference Rate
- **broken_first_coupon** *(boolean, optional)* — Broken First Coupon
- **last_day_to_register_for_maturity_amount** *(date, optional)* — Last Day To Register For Maturity Amount
- **base_cpi_ref** *(number, optional)* — Base Cpi Ref
- **linked_reference_index** *(select, optional)* — Linked Reference Index
- **previous_coupon_rate** *(number, optional)* — Previous Coupon Rate
- **previous_rate_of_reference_rate** *(number, optional)* — Previous Rate Of Reference Rate
- **previous_coupon_payment_date** *(date, optional)* — Previous Coupon Payment Date
- **lookback_period** *(text, optional)* — Lookback Period
- **interest_coupon_date** *(date, optional)* — Interest Coupon Date
- **actual_payment_date** *(date, optional)* — Actual Payment Date
- **last_day_to_register** *(date, optional)* — Last Day To Register
- **coupon_determination_date** *(date, optional)* — Coupon Determination Date
- **call_indicator** *(boolean, optional)* — Call Indicator
- **callable_step_up_date** *(date, optional)* — Callable Step Up Date
- **step_up_down_coupon_rate** *(number, optional)* — Step Up Down Coupon Rate
- **step_up_down_reference_rate** *(text, optional)* — Step Up Down Reference Rate
- **step_up_down_basis_points** *(number, optional)* — Step Up Down Basis Points
- **exchange** *(text, optional)* — Exchange
- **mic_code** *(text, optional)* — Mic Code
- **listing_date** *(date, optional)* — Listing Date
- **primary_market_indicator** *(boolean, optional)* — Primary Market Indicator
- **trading_currency** *(text, optional)* — Trading Currency
- **bond_etp_indicator** *(boolean, optional)* — Bond Etp Indicator
- **instrument_delisting_date** *(date, optional)* — Instrument Delisting Date
- **redemption_date** *(date, optional)* — Redemption Date
- **redemption_amount** *(number, optional)* — Redemption Amount
- **split_maturity_date** *(date, optional)* — Split Maturity Date
- **split_maturity_date_notes** *(rich_text, optional)* — Split Maturity Date Notes
- **index_code** *(text, optional)* — Index Code
- **reference_index_alpha_code** *(text, optional)* — Reference Index Alpha Code
- **instrument_name** *(text, optional)* — Instrument Name
- **instrument_type** *(text, optional)* — Instrument Type
- **mixed_rate_note_leg** *(text, optional)* — Mixed Rate Note Leg
- **reference_instrument_alpha_code** *(text, optional)* — Reference Instrument Alpha Code
- **reference_instrument_isin** *(text, optional)* — Reference Instrument Isin
- **institution_name** *(text, optional)* — Institution Name
- **guarantor_alpha_code** *(text, optional)* — Guarantor Alpha Code
- **entity_role_type** *(text, optional)* — Entity Role Type
- **leg_number** *(number, optional)* — Leg Number
- **leg_start_date** *(date, optional)* — Leg Start Date
- **leg_end_date** *(date, optional)* — Leg End Date
- **leg_coupon_frequency** *(select, optional)* — Leg Coupon Frequency
- **leg_business_day_convention** *(select, optional)* — Leg Business Day Convention
- **leg_coupon_rate** *(number, optional)* — Leg Coupon Rate
- **leg_coupon_payment_type** *(select, optional)* — Leg Coupon Payment Type
- **leg_basis_points** *(number, optional)* — Leg Basis Points
- **leg_over_under** *(select, optional)* — Leg Over Under
- **leg_reference_rate** *(text, optional)* — Leg Reference Rate
- **leg_books_closed_period** *(number, optional)* — Leg Books Closed Period
- **leg_day_count_convention** *(select, optional)* — Leg Day Count Convention
- **leg_customised_coupon** *(select, optional)* — Leg Customised Coupon
- **leg_underlying_index_code** *(text, optional)* — Leg Underlying Index Code
- **mixed_rate_conversion_determination_date** *(date, optional)* — Mixed Rate Conversion Determination Date

## What must be true

- **dissemination:** MUST: Publish Bonds Instrument Reference 3x daily (SLA 11:30, 13:30, 16:20 SAST), MUST: Publish New Bonds Listing 3x daily at the same SLA times, MUST: Retain daily files for rolling 40 business days with _yyyymmdd suffix, MUST: Replace entire file each time (no delta changes)
- **identification:** MUST: Generate ISIN per ISO 6166 (12 chars, 2-letter country + 9-char identifier + check digit), MUST: Use G in 3rd character of ISIN for debt securities, MUST: Assign alpha code as primary identifier (max 6 alphanumeric, uppercase)
- **lifecycle:** MUST: Include new instrument on Issue date with status Listed, MUST: Retain instrument until month-end of status change month for delisted/matured/called/redeemed/repurchased, MUST: Create Callable/Step Up events at least 4 days before effective date
- **formats:** MUST: Provide CSV (one file per section) and XLS (consolidated workbook) formats, MUST: Use comma delimiter for CSV and blank row separators between files
- **access_control:** MUST: Verify subscriber entitlement before file generation

## Success & failure scenarios

**✅ Success paths**

- **Generate New Bonds Listing Daily** — when scheduled dissemination time reached, then 13 CSV files + 1 consolidated XLS covering instruments in process of listing (status Draft Approved, Pre-Listed, Listed Pending Coupon, Cancelled); emit bonds_ref.new_listings.disseminated. _Why: New Bonds Listing file published 3 times per day (11:30, 13:30, 16:20)._
- **Generate Corporate Actions Schedule** — when end of day corporate actions processing complete, then create_record; emit bonds_ref.corporate_actions.disseminated. _Why: Bonds Corporate Actions Events Schedule disseminated daily._
- **Generate Coupon Rate Update** — when coupon reset date reached for floating rate instrument, then create_record; emit bonds_ref.coupon_rate_update.disseminated. _Why: Bonds Coupon Rate Update disseminated when floating rate notes reset._
- **Instrument Listed New** — when instrument_status eq "Listed"; issue_date eq "today", then set listed_flag = true; create_record; emit bonds_ref.instrument.listed. _Why: New instrument included on Issue date with status 'Listed'._
- **Instrument Delisted Or Matured** — when instrument_status in ["Delisted","Matured","Called","Redeemed","Repurchased"], then set maturity_date = "effective_date_of_status_change"; emit bonds_ref.instrument.retired. _Why: Instrument remains in file until month-end of status change month._
- **Callable Step Up Event Created** — when callable_step_up_date exists; days_until_effective gte 4, then create_record; emit bonds_ref.callable_step_up.created. _Why: Callable / Step Up event created at least 4 days before effective date._
- **Historical Retention 40 Days** — when file disseminated successfully, then set retention_days = 40; emit bonds_ref.file.archived. _Why: Daily files retained on IDP for rolling 40 business days with _yyyymmdd suffix._

**❌ Failure paths**

- **Generate Bonds Instrument Reference Daily** — when scheduled dissemination time reached, then Generate 12 CSV files + 1 consolidated XLS workbook with General, Redemption Schedule, Coupon General, Coupon Schedule, Callable Step Up, Market Listing, Split Maturity, Reference Index, Reference Instrument, Reference Entities, Guarantor, Mixed Rate sheets; call service; emit bonds_ref.instrument_reference.disseminated. _Why: Daily Bonds Instrument Reference file published 3 times per day (SLA 11:30, 13:30, 16:20)._ *(error: `BONDS_REF_SUBSCRIBER_NOT_PROVISIONED`)*
- **Isin Generation Fails** — when isin matches "^.{0,11}$" OR isin_third_character neq "G", then notify via operations; emit bonds_ref.isin.generation_failed. _Why: ISIN validation fails (must be 12 chars, G in 3rd position for debt)._ *(error: `BONDS_REF_INVALID_ISIN`)*

## Errors it can return

- `BONDS_REF_SUBSCRIBER_NOT_PROVISIONED` — Subscriber not provisioned for bonds reference data products
- `BONDS_REF_FILE_GENERATION_FAILED` — Failed to generate bonds reference data file
- `BONDS_REF_INVALID_ISIN` — Generated ISIN does not conform to ISO 6166
- `BONDS_REF_MISSING_REQUIRED_FIELD` — Required reference field missing for listed instrument

## Connects to

- **bonds-eod-data-delivery** *(recommended)*
- **bond-etp-eod-data-delivery** *(recommended)*
- **equities-eod-data-delivery** *(optional)*

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 113 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bonds-reference-corporate-actions-eod-data-delivery/) · **Spec source:** [`bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml`](./bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
