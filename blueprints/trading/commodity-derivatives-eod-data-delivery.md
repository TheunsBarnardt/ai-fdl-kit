<!-- AUTO-GENERATED FROM commodity-derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Commodity Derivatives Eod Data Delivery

> End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · commodity-derivatives · agricultural · ftp · dissemination · fixed-width · non-live

## What this does

End-of-day commodity derivatives data delivery via FTP — fixed-width flat files covering daily statistics, mark-to-market, and reference rates

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
- **volume** *(number, optional)* — Volume
- **value_traded** *(number, optional)* — Value Traded
- **open_interest** *(number, optional)* — Open Interest
- **volatility** *(number, optional)* — Volatility
- **traded_indicator** *(boolean, optional)* — Traded Indicator
- **total_contracts** *(number, optional)* — Total Contracts
- **total_deals** *(number, optional)* — Total Deals
- **total_value** *(number, optional)* — Total Value
- **total_open_interest** *(number, optional)* — Total Open Interest
- **total_margin_on_deposit** *(number, optional)* — Total Margin On Deposit
- **interest_on_initial_margin** *(number, optional)* — Interest On Initial Margin

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
- **delivery → schedule:** MUST deliver all products at 18:00 daily
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **market_identification → market_number:** 2
- **market_identification → market_identifier:** APM
- **market_identification → market_name:** Commodity Derivatives Market
- **contract_types → F:** Future
- **contract_types → Y:** Option
- **currency_note:** Records with Instrument type AFRCOMM are traded and cleared in USD

## Success & failure scenarios

**✅ Success paths**

- **Successful Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed, then subscriber receives complete end-of-day commodity derivatives data.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department in writing; license agreement is signed, then subscriber has working FTP access to commodity derivatives data files.

## Errors it can return

- `DELIVERY_FAILED` — End-of-day data file delivery failed
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services
- `DATASET_NOT_PROVISIONED` — Requested dataset has not been provisioned for this subscriber

## Events

**`data.delivery.completed`** — All subscribed commodity derivatives record types delivered for the day
  Payload: `run_date`, `record_types`, `file_name`

## Connects to

- **derivatives-eod-data-delivery** *(extends)* — Inherits shared FTP fixed-width EOD delivery specification
- **equities-eod-data-delivery** *(optional)* — Equities EOD data uses same FTP delivery infrastructure
- **interest-rates-derivatives-eod-data-delivery** *(optional)* — Interest rates derivatives uses identical record structure with different prefixes

## Quality fitness 🟡 67/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `█░░░░░░░░░` | 1/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+1** since baseline (66 → 67)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 31 fields
- `T4` **sequential-priority** — added priority to 2 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/commodity-derivatives-eod-data-delivery/) · **Spec source:** [`commodity-derivatives-eod-data-delivery.blueprint.yaml`](./commodity-derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
