<!-- AUTO-GENERATED FROM equity-derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Equity Derivatives Eod Data Delivery

> End-of-day equity derivatives data delivery via FTP — fixed-width flat files covering daily/weekly/monthly statistics, MTM, rates, and risk parameters

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · equity-derivatives · ftp · dissemination · fixed-width · non-live · mtm · risk-parameters

## What this does

End-of-day equity derivatives data delivery via FTP — fixed-width flat files covering daily/weekly/monthly statistics, MTM, rates, and risk parameters

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_number** *(number, required)* — Market Number
- **contract_type** *(text, required)* — Contract Type
- **instrument_type** *(text, required)* — Instrument Type
- **record_type** *(text, required)* — Record Type
- **record_sub_type** *(text, required)* — Record Sub Type
- **run_date** *(date, required)* — Run Date
- **filler_header** *(text, optional)* — Filler Header
- **instrument** *(text, optional)* — Instrument
- **date** *(date, optional)* — Date
- **strike_price** *(number, optional)* — Strike Price
- **option_type** *(text, optional)* — Option Type
- **spot_price** *(number, optional)* — Spot Price
- **closing_bid** *(number, optional)* — Closing Bid
- **closing_offer** *(number, optional)* — Closing Offer
- **mtm** *(number, optional)* — Mtm
- **first_price** *(number, optional)* — First Price
- **last_price** *(number, optional)* — Last Price
- **high_price** *(number, optional)* — High Price
- **low_price** *(number, optional)* — Low Price
- **number_of_deals** *(number, optional)* — Number Of Deals
- **volume_traded** *(number, optional)* — Volume Traded
- **value_traded** *(number, optional)* — Value Traded
- **open_interest** *(number, optional)* — Open Interest
- **volatility** *(number, optional)* — Volatility
- **isin** *(text, optional)* — Isin
- **instrument_id** *(number, optional)* — Instrument Id
- **derivatives_instrument_type** *(text, optional)* — Derivatives Instrument Type
- **contract_code** *(text, optional)* — Contract Code
- **call_put_future** *(text, optional)* — Call Put Future
- **deals** *(number, optional)* — Deals
- **contracts_traded** *(number, optional)* — Contracts Traded
- **nominal_value** *(number, optional)* — Nominal Value
- **delta_value** *(number, optional)* — Delta Value
- **delta_value_sign** *(text, optional)* — Delta Value Sign
- **premium_value** *(number, optional)* — Premium Value
- **ded05_contract_code** *(text, optional)* — Ded05 Contract Code
- **ded05_open_interest** *(number, optional)* — Ded05 Open Interest
- **ded05_contract_traded** *(number, optional)* — Ded05 Contract Traded
- **total_contracts** *(number, optional)* — Total Contracts
- **total_deals** *(number, optional)* — Total Deals
- **total_value** *(number, optional)* — Total Value
- **total_open_interest** *(number, optional)* — Total Open Interest
- **total_margin_on_deposit** *(number, optional)* — Total Margin On Deposit
- **interest_on_initial_margin** *(number, optional)* — Interest On Initial Margin
- **jibar_one_month_yield** *(number, optional)* — Jibar One Month Yield
- **jibar_three_month_yield** *(number, optional)* — Jibar Three Month Yield
- **jibar_six_month_yield** *(number, optional)* — Jibar Six Month Yield
- **jibar_nine_month_yield** *(number, optional)* — Jibar Nine Month Yield
- **jibar_twelve_month_yield** *(number, optional)* — Jibar Twelve Month Yield
- **prime_rate** *(number, optional)* — Prime Rate
- **cpi** *(number, optional)* — Cpi

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

## Quality fitness 🟡 68/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `█░░░░░░░░░` | 1/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 51 fields
- `T4` **sequential-priority** — added priority to 2 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/equity-derivatives-eod-data-delivery/) · **Spec source:** [`equity-derivatives-eod-data-delivery.blueprint.yaml`](./equity-derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
