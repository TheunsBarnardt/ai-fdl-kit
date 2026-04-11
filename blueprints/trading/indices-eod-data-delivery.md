<!-- AUTO-GENERATED FROM indices-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Indices Eod Data Delivery

> End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · indices · ftse · index-data · constituents · valuations · tracker · fixed-width · non-live · ftp

## What this does

End-of-day FTSE-JSE indices market data delivery via FTP — fixed-width flat files covering 30+ index families with valuations data, constituents data, index-level tracker data, stock-level weightin...

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_number** *(text, required)* — Market Number
- **contract_type** *(text, required)* — Contract Type
- **instrument_type** *(text, required)* — Instrument Type
- **record_type** *(text, required)* — Record Type
- **record_sub_type** *(text, required)* — Record Sub Type
- **sequence_number** *(text, required)* — Sequence Number
- **run_date** *(date, required)* — Run Date
- **filler** *(text, optional)* — Filler
- **index_code** *(text, optional)* — Index Code
- **index_name** *(text, optional)* — Index Name
- **index_value_prior** *(number, optional)* — Index Value Prior
- **index_value_current** *(number, optional)* — Index Value Current
- **index_change** *(number, optional)* — Index Change
- **index_change_percentage** *(number, optional)* — Index Change Percentage
- **index_high** *(number, optional)* — Index High
- **index_low** *(number, optional)* — Index Low
- **index_ytd_change** *(number, optional)* — Index Ytd Change
- **index_divisor** *(number, optional)* — Index Divisor
- **index_capital_value** *(number, optional)* — Index Capital Value
- **index_total_return** *(number, optional)* — Index Total Return
- **total_return_index_value** *(number, optional)* — Total Return Index Value
- **price_return_index_value** *(number, optional)* — Price Return Index Value
- **net_total_return_index_value** *(number, optional)* — Net Total Return Index Value
- **instrument_alpha_code** *(text, optional)* — Instrument Alpha Code
- **instrument_isin** *(text, optional)* — Instrument Isin
- **instrument_short_name** *(text, optional)* — Instrument Short Name
- **number_of_shares_in_issue** *(number, optional)* — Number Of Shares In Issue
- **free_float_factor** *(number, optional)* — Free Float Factor
- **capping_factor** *(number, optional)* — Capping Factor
- **investability_weight** *(number, optional)* — Investability Weight
- **sector_code** *(text, optional)* — Sector Code
- **sub_sector_code** *(text, optional)* — Sub Sector Code
- **icb_industry** *(text, optional)* — Icb Industry
- **icb_supersector** *(text, optional)* — Icb Supersector
- **icb_sector** *(text, optional)* — Icb Sector
- **icb_subsector** *(text, optional)* — Icb Subsector
- **constituent_weight** *(number, optional)* — Constituent Weight
- **constituent_index_weight** *(number, optional)* — Constituent Index Weight
- **closing_price** *(number, optional)* — Closing Price
- **market_cap** *(number, optional)* — Market Cap
- **free_float_market_cap** *(number, optional)* — Free Float Market Cap
- **tracker_index_code** *(text, optional)* — Tracker Index Code
- **tracker_date** *(date, optional)* — Tracker Date
- **opening_index_value** *(number, optional)* — Opening Index Value
- **closing_index_value** *(number, optional)* — Closing Index Value
- **index_level_change** *(number, optional)* — Index Level Change
- **total_return_index_level** *(number, optional)* — Total Return Index Level
- **amendment_effective_date** *(date, optional)* — Amendment Effective Date
- **amendment_type** *(text, optional)* — Amendment Type
- **old_shares_in_issue** *(number, optional)* — Old Shares In Issue
- **new_shares_in_issue** *(number, optional)* — New Shares In Issue
- **old_free_float** *(number, optional)* — Old Free Float
- **new_free_float** *(number, optional)* — New Free Float
- **old_capping_factor** *(number, optional)* — Old Capping Factor
- **new_capping_factor** *(number, optional)* — New Capping Factor
- **amendment_reason** *(text, optional)* — Amendment Reason
- **ex_dividend_date** *(date, optional)* — Ex Dividend Date
- **dividend_amount** *(number, optional)* — Dividend Amount
- **dividend_currency** *(text, optional)* — Dividend Currency
- **dividend_type** *(select, optional)* — Dividend Type
- **dividend_withholding_tax** *(number, optional)* — Dividend Withholding Tax
- **opening_shares** *(number, optional)* — Opening Shares
- **opening_free_float** *(number, optional)* — Opening Free Float
- **opening_capping** *(number, optional)* — Opening Capping
- **opening_price** *(number, optional)* — Opening Price
- **five_day_amendment_date** *(date, optional)* — Five Day Amendment Date
- **five_day_effective_date** *(date, optional)* — Five Day Effective Date
- **five_day_amendment_description** *(text, optional)* — Five Day Amendment Description

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

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `██░░░` | 2/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (71 → 75)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 68 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/indices-eod-data-delivery/) · **Spec source:** [`indices-eod-data-delivery.blueprint.yaml`](./indices-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
