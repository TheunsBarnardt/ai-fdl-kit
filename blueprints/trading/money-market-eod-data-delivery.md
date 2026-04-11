<!-- AUTO-GENERATED FROM money-market-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Money Market Eod Data Delivery

> End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · money-market · isin · reference-data · ftp · dissemination · fixed-width · non-live

## What this does

End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **instrument_numeric_key** *(number, required)*
- **record_type** *(text, required)*
- **sub_type** *(text, required)*
- **continuation_sequence_number** *(number, required)*
- **run_date** *(date, required)*
- **isin** *(text, required)*
- **filler_header** *(text, optional)*
- **instrument_alpha_code** *(text, required)*
- **mmd01_isin** *(text, required)*
- **issuer_name** *(text, required)*
- **mmi_type** *(text, required)*
- **mmi_category** *(text, required)*
- **short_name** *(text, required)*
- **long_name** *(text, required)*
- **instrument_status** *(select, required)*
- **issued_amount** *(number, optional)*
- **issue_date** *(date, optional)*
- **coupon_rate** *(number, optional)*
- **coupon_frequency_interval** *(text, optional)*
- **coupon_payment_cycle** *(text, optional)*
- **isin_maturity_date** *(date, optional)*
- **isin_coupon_payment_day** *(number, optional)*
- **coupon_compounding_frequency** *(text, optional)*
- **coupon_reset_frequency** *(text, optional)*
- **coupon_reset_start_date** *(date, optional)*
- **coupon_source** *(text, optional)*
- **coupon_variance_from_source** *(number, optional)*
- **coupon_variance_unit** *(select, optional)*
- **currency** *(text, optional)*
- **floor_rate** *(number, optional)*
- **cap_rate** *(number, optional)*
- **mmd02_instrument_alpha_code** *(text, optional)*
- **reset_date** *(date, optional)*
- **reset_rate** *(number, optional)*
- **mmd03_instrument_alpha_code** *(text, optional)*
- **payment_date** *(date, optional)*

## What must be true

- **data_format → format:** fixed_width_flat_file
- **data_format → encoding:** ASCII
- **data_format → record_lengths → MMD_01:** 318
- **data_format → record_lengths → MMD_02:** up to 534 (variable, depends on number of reset date/rate pairs)
- **data_format → record_lengths → MMD_03:** up to 214 (variable, depends on number of payment dates)
- **delivery → channel:** FTP
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **nna_role → issues_isins:** true
- **nna_role → standard:** ISO 6166
- **nna_role → isin_format:** 12-character alpha-numerical code
- **mmi_categories → category_1:** Discount Based
- **mmi_categories → category_2:** Vanilla
- **mmi_categories → category_3:** Variable Coupon Rates
- **mmi_categories → category_4:** Structured Securities
- **matured_retention → retention_period:** 6 months after maturity or cancellation
- **coupon_date_rules → applicable_categories:** 2, 3
- **coupon_date_rules → conditional:** Only required when coupon payment frequency is ISDF (Issuer Defined)
- **coupon_date_rules → max_repetitions:** 120
- **coupon_date_rules → max_rows:** 6
- **coupon_date_rules → items_per_row:** 20
- **zaronia_note:** ZARONIA FRN coupon rate is optional — not required for NNA ISIN obligation

## Success & failure scenarios

**✅ Success paths**

- **Successful Eod Delivery** — when subscriber is licensed and provisioned; business day processing is complete, then subscriber receives complete money market instrument reference data.
- **Successful Intraday Delivery** — when subscriber is licensed and provisioned; variable coupon rate changes have been published for category 3 instruments, then subscriber receives intraday priority coupon rate updates.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department; license agreement is signed, then subscriber has working FTP access to money market data files.

## Errors it can return

- `DELIVERY_FAILED` — Money market data file delivery failed
- `INVALID_CREDENTIALS` — Authentication failed — contact Customer Services

## Connects to

- **bonds-eod-data-delivery** *(optional)* — Bonds market data covers related fixed-income instruments

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/money-market-eod-data-delivery/) · **Spec source:** [`money-market-eod-data-delivery.blueprint.yaml`](./money-market-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
