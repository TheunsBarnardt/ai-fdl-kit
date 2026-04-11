<!-- AUTO-GENERATED FROM currency-derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Currency Derivatives Eod Data Delivery

> End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · currency-derivatives · forex · ftp · dissemination · fixed-width · non-live · mtm

## What this does

End-of-day currency derivatives data delivery via FTP — fixed-width flat files covering daily statistics, MTM, rates, close-out, and risk parameters

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
- **dcd05_contract_code** *(text, optional)*
- **dcd05_open_interest** *(number, optional)*
- **dcd05_contracts_traded** *(number, optional)*
- **interest_on_initial_margin_fxm** *(number, optional)*
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
- **delivery → channel:** FTP
- **delivery → primary_time:** 20:30
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **market_identification → market_number:** 6
- **market_identification → market_identifier:** FX
- **market_identification → market_name:** Currency Derivatives Market
- **contract_types → F:** Future
- **contract_types → Y:** Option
- **instrument_identifiers → contract_code:** Alphanumeric — e.g. 01DEC15 AUDZAR ANYDAY
- **instrument_identifiers → isin:** ZAF prefix for futures, ZAF<letter> for options
- **instrument_identifiers → instrument_id:** Unique number across all instruments in all markets

## Success & failure scenarios

**✅ Success paths**

- **Successful Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed, then subscriber receives complete end-of-day currency derivatives data.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department in writing; license agreement is signed, then subscriber has working FTP access to currency derivatives data files.

## Errors it can return

- `DELIVERY_FAILED` — End-of-day data file delivery failed
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services

## Connects to

- **equity-derivatives-eod-data-delivery** *(optional)* — Equity derivatives uses identical record structure with different prefixes
- **interest-rates-derivatives-eod-data-delivery** *(optional)* — Interest rates derivatives uses similar structure

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/currency-derivatives-eod-data-delivery/) · **Spec source:** [`currency-derivatives-eod-data-delivery.blueprint.yaml`](./currency-derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
