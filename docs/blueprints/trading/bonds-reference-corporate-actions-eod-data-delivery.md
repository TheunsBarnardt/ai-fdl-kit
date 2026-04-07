---
title: "Bonds Reference Corporate Actions Eod Data Delivery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable event"
---

# Bonds Reference Corporate Actions Eod Data Delivery Blueprint

> Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable events, corporate action schedules, and co...

| | |
|---|---|
| **Feature** | `bonds-reference-corporate-actions-eod-data-delivery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, reference-data, corporate-actions, bonds, debt-securities, csv, xls, isin, non-live |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bonds-reference-corporate-actions-eod-data-delivery.blueprint.yaml) |
| **JSON API** | [bonds-reference-corporate-actions-eod-data-delivery.json]({{ site.baseurl }}/api/blueprints/trading/bonds-reference-corporate-actions-eod-data-delivery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subscriber` | Data Subscriber | human | Licensed recipient of bonds reference data |
| `exchange_operations` | Exchange Operations | system |  |
| `issuer_regulation` | Issuer Regulation | human | Team maintaining sector/sub-sector classification hierarchy |
| `national_numbering_agency` | National Numbering Agency | system | Accredited ISIN issuer for South African instruments |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `universal_instrument_master_id` | text | Yes |  |  |
| `jse_alpha_code` | text | Yes |  |  |
| `isin` | text | Yes |  |  |
| `issuer_name` | text | Yes |  |  |
| `lei_code` | text | No |  |  |
| `issue_type` | select | Yes |  |  |
| `cfi_code` | text | No |  |  |
| `fisn_code` | text | No |  |  |
| `issue_date` | date | Yes |  |  |
| `listed_unlisted_flag` | boolean | Yes |  |  |
| `instrument_status` | select | Yes |  |  |
| `status_reason` | text | No |  |  |
| `nominal_amount` | number | Yes |  |  |
| `amount_authorised` | number | No |  |  |
| `issue_price_format` | select | No |  |  |
| `issue_price` | number | No |  |  |
| `maturity_date` | date | Yes |  |  |
| `legal_final_maturity_date` | date | No |  |  |
| `pricing_redemption_date` | date | No |  |  |
| `most_recent_redemption_date` | date | No |  |  |
| `pricing_method` | select | No |  |  |
| `bond_calculator_indicator` | boolean | No |  |  |
| `settlement_method` | select | No |  |  |
| `settlement_provider` | select | No |  |  |
| `sa_bond_category` | select | No |  |  |
| `sub_sector` | text | No |  |  |
| `sector` | text | No |  |  |
| `major_division` | text | No |  |  |
| `guarantee_ranking` | select | No |  |  |
| `redemption_reimbursement_type` | select | No |  |  |
| `specified_denomination` | number | No |  |  |
| `underlying_foreign_issuer_indicator` | boolean | No |  |  |
| `inward_listed` | boolean | No |  |  |
| `country_of_issuance` | text | No |  |  |
| `companion_bond_alpha_code` | text | No |  |  |
| `companion_bond_instrument_type` | text | No |  |  |
| `notes` | rich_text | No |  |  |
| `aps_url_link` | url | No |  |  |
| `pricing_class_code` | select | No |  |  |
| `foreign_issuer` | boolean | No |  |  |
| `compounded_calculated_coupon_rate` | number | No |  |  |
| `coupon_rate` | number | No |  |  |
| `coupon_currency` | text | No |  |  |
| `coupon_withholding_tax` | boolean | No |  |  |
| `business_day_convention` | select | No |  |  |
| `coupon_frequency` | select | No |  |  |
| `coupon_payment_type` | select | No |  |  |
| `reference_rate` | select | No |  |  |
| `basis_points` | number | No |  |  |
| `over_under` | select | No |  |  |
| `rate_of_reference_rate` | number | No |  |  |
| `books_closed_period` | number | No |  |  |
| `coupon_rate_floor` | number | No |  |  |
| `coupon_rate_cap` | number | No |  |  |
| `customised_coupon` | select | No |  |  |
| `day_count_convention` | select | No |  |  |
| `first_accrual_date` | date | No |  |  |
| `first_interest_coupon_date` | date | No |  |  |
| `first_books_close_date` | date | No |  |  |
| `date_of_listing_reference_rate` | date | No |  |  |
| `broken_first_coupon` | boolean | No |  |  |
| `last_day_to_register_for_maturity_amount` | date | No |  |  |
| `base_cpi_ref` | number | No |  |  |
| `linked_reference_index` | select | No |  |  |
| `previous_coupon_rate` | number | No |  |  |
| `previous_rate_of_reference_rate` | number | No |  |  |
| `previous_coupon_payment_date` | date | No |  |  |
| `lookback_period` | text | No |  |  |
| `interest_coupon_date` | date | No |  |  |
| `actual_payment_date` | date | No |  |  |
| `last_day_to_register` | date | No |  |  |
| `coupon_determination_date` | date | No |  |  |
| `call_indicator` | boolean | No |  |  |
| `callable_step_up_date` | date | No |  |  |
| `step_up_down_coupon_rate` | number | No |  |  |
| `step_up_down_reference_rate` | text | No |  |  |
| `step_up_down_basis_points` | number | No |  |  |
| `exchange` | text | No |  |  |
| `mic_code` | text | No |  |  |
| `listing_date` | date | No |  |  |
| `primary_market_indicator` | boolean | No |  |  |
| `trading_currency` | text | No |  |  |
| `bond_etp_indicator` | boolean | No |  |  |
| `instrument_delisting_date` | date | No |  |  |
| `redemption_date` | date | No |  |  |
| `redemption_amount` | number | No |  |  |
| `split_maturity_date` | date | No |  |  |
| `split_maturity_date_notes` | rich_text | No |  |  |
| `index_code` | text | No |  |  |
| `reference_index_alpha_code` | text | No |  |  |
| `instrument_name` | text | No |  |  |
| `instrument_type` | text | No |  |  |
| `mixed_rate_note_leg` | text | No |  |  |
| `reference_instrument_alpha_code` | text | No |  |  |
| `reference_instrument_isin` | text | No |  |  |
| `institution_name` | text | No |  |  |
| `guarantor_alpha_code` | text | No |  |  |
| `entity_role_type` | text | No |  |  |
| `leg_number` | number | No |  |  |
| `leg_start_date` | date | No |  |  |
| `leg_end_date` | date | No |  |  |
| `leg_coupon_frequency` | select | No |  |  |
| `leg_business_day_convention` | select | No |  |  |
| `leg_coupon_rate` | number | No |  |  |
| `leg_coupon_payment_type` | select | No |  |  |
| `leg_basis_points` | number | No |  |  |
| `leg_over_under` | select | No |  |  |
| `leg_reference_rate` | text | No |  |  |
| `leg_books_closed_period` | number | No |  |  |
| `leg_day_count_convention` | select | No |  |  |
| `leg_customised_coupon` | select | No |  |  |
| `leg_underlying_index_code` | text | No |  |  |
| `mixed_rate_conversion_determination_date` | date | No |  |  |

## Rules

- **dissemination:** MUST: Publish Bonds Instrument Reference 3x daily (SLA 11:30, 13:30, 16:20 SAST), MUST: Publish New Bonds Listing 3x daily at the same SLA times, MUST: Retain daily files for rolling 40 business days with _yyyymmdd suffix, MUST: Replace entire file each time (no delta changes)
- **identification:** MUST: Generate ISIN per ISO 6166 (12 chars, 2-letter country + 9-char identifier + check digit), MUST: Use G in 3rd character of ISIN for debt securities, MUST: Assign alpha code as primary identifier (max 6 alphanumeric, uppercase)
- **lifecycle:** MUST: Include new instrument on Issue date with status Listed, MUST: Retain instrument until month-end of status change month for delisted/matured/called/redeemed/repurchased, MUST: Create Callable/Step Up events at least 4 days before effective date
- **formats:** MUST: Provide CSV (one file per section) and XLS (consolidated workbook) formats, MUST: Use comma delimiter for CSV and blank row separators between files
- **access_control:** MUST: Verify subscriber entitlement before file generation

## Outcomes

### Generate_bonds_instrument_reference_daily (Priority: 1)

**Given:**
- scheduled dissemination time reached

**Then:**
- **create_record** — Generate 12 CSV files + 1 consolidated XLS workbook with General, Redemption Schedule, Coupon General, Coupon Schedule, Callable Step Up, Market Listing, Split Maturity, Reference Index, Reference Instrument, Reference Entities, Guarantor, Mixed Rate sheets
- **call_service** target: `idp_ftp_dissemination`
- **emit_event** event: `bonds_ref.instrument_reference.disseminated`

### Generate_new_bonds_listing_daily (Priority: 2)

**Given:**
- scheduled dissemination time reached

**Then:**
- **create_record** — 13 CSV files + 1 consolidated XLS covering instruments in process of listing (status Draft Approved, Pre-Listed, Listed Pending Coupon, Cancelled)
- **emit_event** event: `bonds_ref.new_listings.disseminated`

### Generate_corporate_actions_schedule (Priority: 3)

**Given:**
- end of day corporate actions processing complete

**Then:**
- **create_record**
- **emit_event** event: `bonds_ref.corporate_actions.disseminated`

### Generate_coupon_rate_update (Priority: 4)

**Given:**
- coupon reset date reached for floating rate instrument

**Then:**
- **create_record**
- **emit_event** event: `bonds_ref.coupon_rate_update.disseminated`

### Instrument_listed_new (Priority: 5)

**Given:**
- `instrument_status` (input) eq `Listed`
- `issue_date` (input) eq `today`

**Then:**
- **set_field** target: `listed_flag` value: `true`
- **create_record**
- **emit_event** event: `bonds_ref.instrument.listed`

### Instrument_delisted_or_matured (Priority: 6)

**Given:**
- `instrument_status` (input) in `Delisted,Matured,Called,Redeemed,Repurchased`

**Then:**
- **set_field** target: `maturity_date` value: `effective_date_of_status_change`
- **emit_event** event: `bonds_ref.instrument.retired`

### Isin_generation_fails (Priority: 7) — Error: `BONDS_REF_INVALID_ISIN`

**Given:**
- ANY: `isin` (computed) matches `^.{0,11}$` OR `isin_third_character` (computed) neq `G`

**Then:**
- **notify** target: `national_numbering_agency`
- **emit_event** event: `bonds_ref.isin.generation_failed`

### Callable_step_up_event_created (Priority: 8)

**Given:**
- `callable_step_up_date` (input) exists
- `days_until_effective` (computed) gte `4`

**Then:**
- **create_record**
- **emit_event** event: `bonds_ref.callable_step_up.created`

### Historical_retention_40_days (Priority: 9)

**Given:**
- file disseminated successfully

**Then:**
- **set_field** target: `retention_days` value: `40`
- **emit_event** event: `bonds_ref.file.archived`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BONDS_REF_SUBSCRIBER_NOT_PROVISIONED` | 403 | Subscriber not provisioned for bonds reference data products | No |
| `BONDS_REF_FILE_GENERATION_FAILED` | 500 | Failed to generate bonds reference data file | No |
| `BONDS_REF_INVALID_ISIN` | 400 | Generated ISIN does not conform to ISO 6166 | No |
| `BONDS_REF_MISSING_REQUIRED_FIELD` | 422 | Required reference field missing for listed instrument | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bonds-eod-data-delivery | recommended |  |
| bond-etp-eod-data-delivery | recommended |  |
| equities-eod-data-delivery | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
data_products:
  bonds_instrument_reference:
    description: Reference data for all listed debt securities
    frequency: 3x daily (SLA 11:30, 13:30, 16:20 SAST)
    data_sections:
      - Bonds Instrument General (39 columns)
      - Bonds Instrument Redemption Schedule (3 columns)
      - Bonds Instrument Coupon General (24 columns)
      - Bonds Instrument Coupon Schedule (5 columns)
      - Bonds Instrument Callable Step Up (7 columns)
      - Bonds Instrument Market Listings (8 columns)
      - Bonds Instrument Split Maturity (3 columns)
      - Bonds Instrument Reference Index (6 columns)
      - Bonds Instrument Reference Instrument (5 columns)
      - Bonds Instrument Reference Entities (6 columns)
      - Bonds Instrument Reference Guarantor (5 columns)
      - Bonds Instrument Reference Mixed Rate (23 columns)
    csv_files: 12
    xls_workbook: Bond Instrument Reference_YYYYMMDD.xls
    idp_location: DISTRIBUTION/Bonds Market Prod/Market Data/Instrument Reference/
    retention: 40 rolling business days with _yyyymmdd suffix
  new_bonds_listing:
    description: Debt securities in listing process (not yet fully listed)
    frequency: 3x daily
    data_sections:
      - New Bonds Listing General
      - New Bonds Listing Redemption Schedule
      - New Bonds Listing Coupon General
      - New Bonds Listing Coupon Schedule
      - New Bonds Listing Callable Step Up
      - New Bonds Listing Market Listing
      - New Bonds Listing Split Maturity Schedule
      - New Bonds Listing Reference Index
      - New Bonds Listing Reference Instrument
      - New Bonds Listing Reference Entities
      - New Bonds Listing Guarantor
      - New Bonds Listing Mixed Rate
    statuses:
      - Draft_Approved
      - Pre_Listed
      - Listed_Pending_Coupon
      - Cancelled
    idp_location: DISTRIBUTION/Bonds Market Prod/Market Data/New Bonds Listing/
  corporate_actions_events_schedule:
    description: Schedule of corporate action events for listed bonds
    frequency: Daily
  coupon_rate_update:
    description: Rate update notifications for floating rate notes
    frequency: On reset date
issue_types:
  - code: FXRN
    name: Fixed Rate Note
  - code: FLRN
    name: Floating Rate Note
  - code: MXRN
    name: Mixed Rate Note
  - code: IDXLN
    name: Index Linked Notes
  - code: CRLN
    name: Credit Linked Notes
  - code: STNT
    name: Structured Note
  - code: ZCNT
    name: Zero Coupon Note
pricing_class_codes:
  - code: AFRN
    name: Amortising Floating Rate Note
  - code: AI
    name: Amortising Instruments
  - code: CI
    name: Customised Instruments
  - code: CP
    name: Commercial Paper
  - code: CPI
    name: Inflation linked
  - code: ESN
    name: Equity Structured Note
  - code: F
    name: Fixed
  - code: FC
    name: Fixed Coupon Quarterly
  - code: FRN
    name: Floating Rate Note
  - code: P
    name: Perpetuity
  - code: V
    name: Vanilla Fixed
bond_categories:
  - id: 1
    name: Zero/discounted instruments
  - id: 2
    name: Fixed Coupon Rate with fixed maturity date
  - id: 3
    name: Variable rate, fixed maturity date
  - id: 4
    name: All others/Flexi
isin_rules:
  standard: ISO 6166
  length: 12
  structure: 2-letter country code + 9-char alphanumerical identifier + check digit
  jse_debt_marker: G in 3rd character (e.g. ZAG...)
  issuer: JSE as accredited National Numbering Agency for South Africa
file_formats:
  - CSV
  - XLS
delivery_channel: IDP FTP (Information Delivery Portal)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bonds Reference Corporate Actions Eod Data Delivery Blueprint",
  "description": "Bonds reference data and corporate actions delivery via FTP — CSV/XLS dissemination of debt security master data, new listings, coupon schedules, callable event",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, reference-data, corporate-actions, bonds, debt-securities, csv, xls, isin, non-live"
}
</script>
