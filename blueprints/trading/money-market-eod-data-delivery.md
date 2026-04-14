<!-- AUTO-GENERATED FROM money-market-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Money Market Eod Data Delivery

> End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · money-market · isin · reference-data · ftp · dissemination · fixed-width · non-live

## What this does

End-of-day money market instrument reference data delivery via FTP — ISIN reference, coupon resets, payment dates, and intraday priority updates

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **instrument_numeric_key** *(number, required)* — Instrument Numeric Key
- **record_type** *(text, required)* — Record Type
- **sub_type** *(text, required)* — Sub Type
- **continuation_sequence_number** *(number, required)* — Continuation Sequence Number
- **run_date** *(date, required)* — Run Date
- **isin** *(text, required)* — Isin
- **filler_header** *(text, optional)* — Filler Header
- **instrument_alpha_code** *(text, required)* — Instrument Alpha Code
- **mmd01_isin** *(text, required)* — Mmd01 Isin
- **issuer_name** *(text, required)* — Issuer Name
- **mmi_type** *(text, required)* — Mmi Type
- **mmi_category** *(text, required)* — Mmi Category
- **short_name** *(text, required)* — Short Name
- **long_name** *(text, required)* — Long Name
- **instrument_status** *(select, required)* — Instrument Status
- **issued_amount** *(number, optional)* — Issued Amount
- **issue_date** *(date, optional)* — Issue Date
- **coupon_rate** *(number, optional)* — Coupon Rate
- **coupon_frequency_interval** *(text, optional)* — Coupon Frequency Interval
- **coupon_payment_cycle** *(text, optional)* — Coupon Payment Cycle
- **isin_maturity_date** *(date, optional)* — Isin Maturity Date
- **isin_coupon_payment_day** *(number, optional)* — Isin Coupon Payment Day
- **coupon_compounding_frequency** *(text, optional)* — Coupon Compounding Frequency
- **coupon_reset_frequency** *(text, optional)* — Coupon Reset Frequency
- **coupon_reset_start_date** *(date, optional)* — Coupon Reset Start Date
- **coupon_source** *(text, optional)* — Coupon Source
- **coupon_variance_from_source** *(number, optional)* — Coupon Variance From Source
- **coupon_variance_unit** *(select, optional)* — Coupon Variance Unit
- **currency** *(text, optional)* — Currency
- **floor_rate** *(number, optional)* — Floor Rate
- **cap_rate** *(number, optional)* — Cap Rate
- **mmd02_instrument_alpha_code** *(text, optional)* — Mmd02 Instrument Alpha Code
- **reset_date** *(date, optional)* — Reset Date
- **reset_rate** *(number, optional)* — Reset Rate
- **mmd03_instrument_alpha_code** *(text, optional)* — Mmd03 Instrument Alpha Code
- **payment_date** *(date, optional)* — Payment Date

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

## Events

**`data.delivery.completed`** — Money market data files delivered for the day
  Payload: `run_date`, `file_name`, `instrument_count`

**`data.intraday.published`** — Intraday priority coupon rate update published
  Payload: `run_date`, `instrument_count`, `timestamp`

## Connects to

- **bonds-eod-data-delivery** *(optional)* — Bonds market data covers related fixed-income instruments

## Quality fitness 🟡 68/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█░░░░░░░░░` | 1/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 36 fields
- `T4` **sequential-priority** — added priority to 3 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/money-market-eod-data-delivery/) · **Spec source:** [`money-market-eod-data-delivery.blueprint.yaml`](./money-market-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
