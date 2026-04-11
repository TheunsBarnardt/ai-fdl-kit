<!-- AUTO-GENERATED FROM equity-derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Equity Derivatives Eod Data Delivery

> End-of-day equity derivatives data delivery via FTP — fixed-width flat files covering daily/weekly/monthly statistics, MTM, rates, and risk parameters

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · equity-derivatives · ftp · dissemination · fixed-width · non-live · mtm · risk-parameters

## What this does

End-of-day equity derivatives data delivery via FTP — fixed-width flat files covering daily/weekly/monthly statistics, MTM, rates, and risk parameters

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
- **volume_traded** *(number, optional)*
- **value_traded** *(number, optional)*
- **open_interest** *(number, optional)*
- **volatility** *(number, optional)*
- **isin** *(text, optional)*
- **instrument_id** *(number, optional)*
- **derivatives_instrument_type** *(text, optional)*
- **contract_code** *(text, optional)*
- **call_put_future** *(text, optional)*
- **deals** *(number, optional)*
- **contracts_traded** *(number, optional)*
- **nominal_value** *(number, optional)*
- **delta_value** *(number, optional)*
- **delta_value_sign** *(text, optional)*
- **premium_value** *(number, optional)*
- **ded05_contract_code** *(text, optional)*
- **ded05_open_interest** *(number, optional)*
- **ded05_contract_traded** *(number, optional)*
- **total_contracts** *(number, optional)*
- **total_deals** *(number, optional)*
- **total_value** *(number, optional)*
- **total_open_interest** *(number, optional)*
- **total_margin_on_deposit** *(number, optional)*
- **interest_on_initial_margin** *(number, optional)*
- **jibar_one_month_yield** *(number, optional)*
- **jibar_three_month_yield** *(number, optional)*
- **jibar_six_month_yield** *(number, optional)*
- **jibar_nine_month_yield** *(number, optional)*
- **jibar_twelve_month_yield** *(number, optional)*
- **prime_rate** *(number, optional)*
- **cpi** *(number, optional)*

## What must be true

- **data_format → format:** fixed_width_flat_file
- **data_format → encoding:** ASCII
- **data_format → field_types → A:** Alpha only
- **data_format → field_types → N:** Numeric only (integer shown as N(I))
- **data_format → field_types → AN:** Alphanumeric
- **data_format → field_types → DATE:** 8-byte date CCYYMMDD
- **data_format → field_types → B:** Boolean — T for True, F for False
- **delivery → channel:** FTP
- **delivery → primary_time:** 20:30
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **market_identification → market_number:** 3
- **market_identification → market_identifier:** EDM
- **market_identification → market_name:** Equity Derivatives Market
- **contract_types → F:** Future
- **contract_types → Y:** Option
- **instrument_identifiers → contract_code:** Alphanumeric field describing expiry, underlying, settlement type
- **instrument_identifiers → isin:** ZAD prefix for futures, ZAD<letter> for options
- **instrument_identifiers → instrument_id:** Unique number across all instruments in all markets

## Success & failure scenarios

**✅ Success paths**

- **Successful Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed, then subscriber receives complete end-of-day equity derivatives data.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department in writing; license agreement is signed, then subscriber has working FTP access to equity derivatives data files.

## Errors it can return

- `DELIVERY_FAILED` — End-of-day data file delivery failed
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services
- `DATASET_NOT_PROVISIONED` — Requested dataset has not been provisioned for this subscriber

## Connects to

- **equities-eod-data-delivery** *(optional)* — Equities EOD data uses same FTP delivery infrastructure
- **interest-rates-derivatives-eod-data-delivery** *(optional)* — Interest rates derivatives uses similar record structure
- **currency-derivatives-eod-data-delivery** *(optional)* — Currency derivatives uses identical record structure with different prefixes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/equity-derivatives-eod-data-delivery/) · **Spec source:** [`equity-derivatives-eod-data-delivery.blueprint.yaml`](./equity-derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
