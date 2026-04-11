<!-- AUTO-GENERATED FROM interest-rates-derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Interest Rates Derivatives Eod Data Delivery

> End-of-day interest rate derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · interest-rates · derivatives · ftp · dissemination · fixed-width · non-live

## What this does

End-of-day interest rate derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_number** *(number, required)*
- **contract_type** *(text, required)*
- **instrument_type** *(text, required)*
- **record_type** *(text, required)*
- **record_sub_type** *(text, required)*
- **run_date** *(date, required)*
- **filler_header** *(text, optional)*
- **instrument** *(text, optional)*
- **date** *(date, optional)*
- **strike_price** *(number, optional)*
- **option_type** *(text, optional)*
- **spot_price** *(number, optional)*
- **closing_bid** *(number, optional)*
- **closing_offer** *(number, optional)*
- **mtm** *(number, optional)*
- **first_price** *(number, optional)*
- **last_price** *(number, optional)*
- **high_price** *(number, optional)*
- **low_price** *(number, optional)*
- **number_of_deals** *(number, optional)*
- **volume** *(number, optional)*
- **value_traded** *(number, optional)*
- **open_interest** *(number, optional)*
- **volatility** *(number, optional)*
- **traded_indicator** *(boolean, optional)*
- **total_contracts** *(number, optional)*
- **total_deals** *(number, optional)*
- **total_value** *(number, optional)*
- **total_open_interest** *(number, optional)*
- **total_margin_on_deposit** *(number, optional)*
- **interest_on_initial_margin** *(number, optional)*

## What must be true

- **data_format → format:** fixed_width_flat_file
- **data_format → encoding:** ASCII
- **data_format → field_types → A:** Alpha only
- **data_format → field_types → N:** Numeric only (integer shown as N(I))
- **data_format → field_types → AN:** Alphanumeric
- **data_format → field_types → DATE:** 8-byte date CCYYMMDD
- **data_format → field_types → B:** Boolean — T for True, F for False
- **data_format → padding → alpha:** space (ASCII 32) right-padded
- **data_format → padding → numeric:** decimal point consumes 1 byte, fixed position
- **data_format → filler:** space characters (ASCII 32) reserved for future expansion
- **delivery → channel:** FTP
- **delivery → schedule:** MUST deliver all products at 20:00 daily
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **market_identification → market_number:** 3
- **market_identification → market_identifier:** IR
- **market_identification → market_name:** Interest Rate
- **contract_types → F:** Future
- **contract_types → Y:** Option
- **contract_types → S:** Spot

## Success & failure scenarios

**✅ Success paths**

- **Successful Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed, then subscriber receives complete end-of-day interest rate derivatives data.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department in writing; license agreement is signed, then subscriber has working FTP access to interest rate derivatives data files.

## Errors it can return

- `DELIVERY_FAILED` — End-of-day data file delivery failed
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services
- `DATASET_NOT_PROVISIONED` — Requested dataset has not been provisioned for this subscriber

## Connects to

- **equities-eod-data-delivery** *(optional)* — Equities EOD data uses same FTP delivery infrastructure

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/interest-rates-derivatives-eod-data-delivery/) · **Spec source:** [`interest-rates-derivatives-eod-data-delivery.blueprint.yaml`](./interest-rates-derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
