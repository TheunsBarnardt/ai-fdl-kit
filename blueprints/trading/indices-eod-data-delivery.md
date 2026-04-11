<!-- AUTO-GENERATED FROM indices-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Indices Eod Data Delivery

> End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · indices · ftse · index-data · constituents · valuations · tracker · fixed-width · non-live · ftp

## What this does

End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_number** *(text, required)*
- **contract_type** *(text, required)*
- **instrument_type** *(text, required)*
- **record_type** *(text, required)*
- **record_sub_type** *(text, required)*
- **sequence_number** *(text, required)*
- **run_date** *(date, required)*
- **filler** *(text, optional)*
- **index_code** *(text, optional)*
- **index_name** *(text, optional)*
- **index_value_prior** *(number, optional)*
- **index_value_current** *(number, optional)*
- **index_change** *(number, optional)*
- **index_change_percentage** *(number, optional)*
- **index_high** *(number, optional)*
- **index_low** *(number, optional)*
- **index_ytd_change** *(number, optional)*
- **index_divisor** *(number, optional)*
- **index_capital_value** *(number, optional)*
- **index_total_return** *(number, optional)*
- **total_return_index_value** *(number, optional)*
- **price_return_index_value** *(number, optional)*
- **net_total_return_index_value** *(number, optional)*
- **instrument_alpha_code** *(text, optional)*
- **instrument_isin** *(text, optional)*
- **instrument_short_name** *(text, optional)*
- **number_of_shares_in_issue** *(number, optional)*
- **free_float_factor** *(number, optional)*
- **capping_factor** *(number, optional)*
- **investability_weight** *(number, optional)*
- **sector_code** *(text, optional)*
- **sub_sector_code** *(text, optional)*
- **icb_industry** *(text, optional)*
- **icb_supersector** *(text, optional)*
- **icb_sector** *(text, optional)*
- **icb_subsector** *(text, optional)*
- **constituent_weight** *(number, optional)*
- **constituent_index_weight** *(number, optional)*
- **closing_price** *(number, optional)*
- **market_cap** *(number, optional)*
- **free_float_market_cap** *(number, optional)*
- **tracker_index_code** *(text, optional)*
- **tracker_date** *(date, optional)*
- **opening_index_value** *(number, optional)*
- **closing_index_value** *(number, optional)*
- **index_level_change** *(number, optional)*
- **total_return_index_level** *(number, optional)*
- **amendment_effective_date** *(date, optional)*
- **amendment_type** *(text, optional)*
- **old_shares_in_issue** *(number, optional)*
- **new_shares_in_issue** *(number, optional)*
- **old_free_float** *(number, optional)*
- **new_free_float** *(number, optional)*
- **old_capping_factor** *(number, optional)*
- **new_capping_factor** *(number, optional)*
- **amendment_reason** *(text, optional)*
- **ex_dividend_date** *(date, optional)*
- **dividend_amount** *(number, optional)*
- **dividend_currency** *(text, optional)*
- **dividend_type** *(select, optional)*
- **dividend_withholding_tax** *(number, optional)*
- **opening_shares** *(number, optional)*
- **opening_free_float** *(number, optional)*
- **opening_capping** *(number, optional)*
- **opening_price** *(number, optional)*
- **five_day_amendment_date** *(date, optional)*
- **five_day_effective_date** *(date, optional)*
- **five_day_amendment_description** *(text, optional)*

## What must be true

- **format:** MUST: Use fixed-width flat file format for all indices records, MUST: Include Leading Record header on every record (market_number, record_type, sub_type, sequence, run_date), MUST: Use 3-character record_type (D + family letter + file type letter), MUST: Use 2-character record_sub_type (01=Constituents, 02=Valuations, 03=Tracker1, 04=Tracker2, 05/07=Tracker3, 11=Opening, 14=FiveDay)
- **dissemination:** MUST: Generate Valuations, Constituents, and Tracker files at end of each trading day, MUST: Generate Opening Constituents file at start of each trading day, MUST: Generate Five-Day Tracker files for upcoming weighting amendments, MUST: Deliver all files via IDP FTP to entitled subscribers only
- **identification:** MUST: Use unique record_type per index family + file type combination, MUST: Use sequence numbers 01-04 for multi-row records, 01-99 for Tracker 3
- **data_integrity:** MUST: Include all constituents in Constituents file with weightings that sum correctly, MUST: Include weighting amendment reason in Tracker 2 records, MUST: Include ex-dividend details in Tracker 3 records
- **access_control:** MUST: Verify subscriber entitlement before file generation

## Success & failure scenarios

**✅ Success paths**

- **Generate Valuations Eod** — when end of trading day reached; all index calculations complete, then Fixed-width file with Leading Record + Sub Type 02 records; call service; emit indices.valuations.disseminated.
- **Generate Constituents Eod** — when end of trading day reached, then Fixed-width file with Sub Type 01 records (sequences 01-04); emit indices.constituents.disseminated.
- **Generate Tracker 1 Index Level** — when end of trading day reached, then Fixed-width file with Sub Type 03 records; emit indices.tracker_1.disseminated.
- **Generate Tracker 2 Weighting Amendments** — when constituent_shares_changed eq true OR free_float_changed eq true OR capping_factor_changed eq true, then Fixed-width file with Sub Type 04 records; emit indices.tracker_2.disseminated.
- **Generate Tracker 3 Ex Dividend** — when ex_dividend_events_present eq true, then Fixed-width file with Sub Type 05/07 and 06/08 records; emit indices.tracker_3.disseminated.
- **Generate Opening Constituents** — when start of trading day reached, then Fixed-width file with Sub Type 11 records; emit indices.opening_constituents.disseminated.
- **Generate Five Day Tracker** — when end of trading day reached; amendments scheduled within next 5 business days, then Fixed-width file with Sub Type 14 records; emit indices.five_day_tracker.disseminated.

**❌ Failure paths**

- **Dissemination Failure** — when ftp_transfer_status eq "failed", then notify via operations; emit indices.dissemination.failed. *(error: `INDICES_FILE_GENERATION_FAILED`)*
- **Subscriber Not Provisioned** — when subscriber_entitled eq false, then emit indices.access_denied. *(error: `INDICES_SUBSCRIBER_NOT_PROVISIONED`)*

## Errors it can return

- `INDICES_SUBSCRIBER_NOT_PROVISIONED` — Subscriber not provisioned for FTSE-JSE indices data
- `INDICES_FILE_GENERATION_FAILED` — Failed to generate indices EOD data file
- `INDICES_INVALID_RECORD_TYPE` — Record type code does not match any known index family
- `INDICES_MISSING_CONSTITUENTS` — Constituents data missing for index family

## Connects to

- **equities-eod-data-delivery** *(recommended)*
- **equity-derivatives-eod-data-delivery** *(optional)*
- **currency-derivatives-eod-data-delivery** *(optional)*

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/indices-eod-data-delivery/) · **Spec source:** [`indices-eod-data-delivery.blueprint.yaml`](./indices-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
