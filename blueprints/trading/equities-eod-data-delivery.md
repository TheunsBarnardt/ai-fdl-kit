<!-- AUTO-GENERATED FROM equities-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Equities Eod Data Delivery

> End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions for listed securities

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · equities · ftp · dissemination · fixed-width · non-live · corporate-actions

## What this does

End-of-day equity market data delivery via FTP file dissemination — fixed-width flat files covering daily, weekly, and monthly statistics and corporate actions for listed securities

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **sector_code** *(text, required)* — Sector Code
- **instrument_alpha_code** *(text, required)* — Instrument Alpha Code
- **record_type** *(text, required)* — Record Type
- **sub_type** *(text, required)* — Sub Type
- **continuation_sequence_number** *(number, required)* — Continuation Sequence Number
- **run_date** *(date, required)* — Run Date
- **board** *(text, required)* — Board
- **market** *(text, required)* — Market
- **exchange** *(text, required)* — Exchange
- **instrument_numeric_code** *(number, required)* — Instrument Numeric Code
- **traded_indicator** *(boolean, optional)* — Traded Indicator
- **closing_price** *(number, optional)* — Closing Price
- **volume_traded** *(number, optional)* — Volume Traded
- **high_trade_price** *(number, optional)* — High Trade Price
- **low_trade_price** *(number, optional)* — Low Trade Price
- **dividend_yield** *(number, optional)* — Dividend Yield
- **earnings_yield** *(number, optional)* — Earnings Yield
- **last_best_bid** *(number, optional)* — Last Best Bid
- **last_best_offer** *(number, optional)* — Last Best Offer
- **closing_price_change_cents** *(number, optional)* — Closing Price Change Cents
- **closing_price_change_pct** *(number, optional)* — Closing Price Change Pct
- **gain_loss_indicator** *(text, optional)* — Gain Loss Indicator
- **share_price_type** *(select, optional)* — Share Price Type
- **index_constituent** *(boolean, optional)* — Index Constituent
- **instrument_status** *(text, optional)* — Instrument Status
- **instrument_type_code** *(text, optional)* — Instrument Type Code
- **earnings_yield_sign** *(text, optional)* — Earnings Yield Sign
- **interest_payment_yield** *(number, optional)* — Interest Payment Yield
- **capital_payment_yield** *(number, optional)* — Capital Payment Yield
- **reit_distribution_yield** *(number, optional)* — Reit Distribution Yield
- **value_traded** *(number, optional)* — Value Traded
- **value_traded_with_decimals** *(number, optional)* — Value Traded With Decimals
- **price_earnings_ratio** *(number, optional)* — Price Earnings Ratio
- **last_traded_price** *(number, optional)* — Last Traded Price
- **number_of_trades** *(number, optional)* — Number Of Trades
- **last_deal_traded_price** *(number, optional)* — Last Deal Traded Price
- **opening_trade_price** *(number, optional)* — Opening Trade Price
- **moving_12m_high_price** *(number, optional)* — Moving 12m High Price
- **moving_12m_high_price_date** *(date, optional)* — Moving 12m High Price Date
- **moving_12m_low_price** *(number, optional)* — Moving 12m Low Price
- **moving_12m_low_price_date** *(date, optional)* — Moving 12m Low Price Date
- **ex_dividend_indicator** *(boolean, optional)* — Ex Dividend Indicator
- **dividend_yield_indicator** *(text, optional)* — Dividend Yield Indicator
- **tradability_indicator_alpha** *(select, optional)* — Tradability Indicator Alpha
- **tradability_indicator_numeric** *(select, optional)* — Tradability Indicator Numeric
- **price_earnings_ratio_sign** *(text, optional)* — Price Earnings Ratio Sign
- **market_capitalisation** *(number, optional)* — Market Capitalisation
- **dividend_cover** *(number, optional)* — Dividend Cover
- **new_high_indicator** *(boolean, optional)* — New High Indicator
- **new_low_indicator** *(boolean, optional)* — New Low Indicator
- **avg_value_traded_12m** *(number, optional)* — Avg Value Traded 12m
- **avg_days_traded_12m** *(number, optional)* — Avg Days Traded 12m
- **avg_volume_traded_12m** *(number, optional)* — Avg Volume Traded 12m
- **closing_price_year_ago** *(number, optional)* — Closing Price Year Ago
- **closing_price_3m_ago** *(number, optional)* — Closing Price 3m Ago
- **total_shares_listed** *(number, optional)* — Total Shares Listed
- **dividend_cover_sign** *(text, optional)* — Dividend Cover Sign
- **delivery_channel** *(select, required)* — Delivery Channel
- **dataset_name** *(text, required)* — Dataset Name
- **user_id** *(text, required)* — User Id

## What must be true

- **identification:** MUST: Use instrument_numeric_code as the permanent instrument identifier in all systems, MUST NOT: Use instrument_alpha_code as a permanent key — it MAY be reused after delisting, SHOULD: Store both alpha and numeric codes, but key all joins on numeric code
- **delivery:** MUST: Authenticate with user_id, password, and dataset_name before accessing FTP, SHOULD: Test FTP access as soon as credentials are received from Customer Services, MUST: Subscribe to required record types in writing before go-live, SHOULD: Select only record types relevant to the subscriber's use case to minimise processing overhead
- **file_format:** MUST: Parse the 41-char leading record header before interpreting any data payload, MUST: Use continuation_sequence_number to reconstruct multi-record payloads, SHOULD: Handle filler fields (reserved for future use) by ignoring content, MUST: Interpret run_date using CCYYMMDD format
- **statistics:** MUST: New trades (on-book and published off-book) increment volume, value, and number_of_trades for trade date T, MUST: Same-day cancellations decrement volume, value, and number_of_trades for T, MUST: Next-day cancellations decrement volume, value, and number_of_trades for T-1, MUST: On-book trades and NX trades affect high/low price; off-book published trades do NOT affect high/low price, MAY: Apply statistical rules only to on-book and published off-book trade types — exclude internal/private off-book trades
- **sectors:** SHOULD: Use ICB (Industry Classification Benchmark) sector codes for instrument classification, MAY: Use DS05 record print sequence numbers for media-layout ordering of sectors and instruments
- **corporate_actions:** SHOULD: Process CA 01 records for dividend, rights offer, share split, and conversion events, SHOULD: Process CA 02 records for meeting diary (annual general meetings, etc.), MUST: Apply withholding tax percentage and foreign tax fields when processing dividend payments
- **dummy_lines:** SHOULD: Detect dummy lines by checking for 'DUMMY' in the ISIN field of EN/ENE records, MAY: Include dummy line instruments in index replication calculations as instructed by index provider

## Success & failure scenarios

**✅ Success paths**

- **Subscriber Provisioned** — when subscription agreement is in place; subscriber has requested specific record types in writing, then Subscriber receives credentials and begins receiving daily EOD files.
- **Eod File Delivered** — when trading day has ended; exchange dissemination run has completed, then EOD file (E.Zip or EE.Zip) available on FTP for all active subscribers.
- **File Parsed Successfully** — when subscriber downloads EOD ZIP file; file is not corrupted, then All records extracted and stored for downstream processing.
- **Instrument Stats Processed** — when record_type is DE or DEE; sub_type is 01 through 07, then Daily instrument statistics stored and available for query.
- **Corporate Action Processed** — when record_type is CA; sub_type is 01 or 02, then Corporate action stored and flagged for portfolio adjustment.

**❌ Failure paths**

- **Authentication Failed** — when user_id not_exists, then FTP authentication rejected — credentials not recognised. *(error: `EOD_AUTH_FAILED`)*
- **File Not Available** — when requested run_date file has not yet been generated, then File not available — check delivery schedule and retry after scheduled delivery time. *(error: `EOD_FILE_NOT_READY`)*
- **Invalid Record Format** — when record does not match expected fixed-width layout for record_type + sub_type, then Record rejected and logged for investigation. *(error: `EOD_RECORD_PARSE_ERROR`)*

## Errors it can return

- `EOD_AUTH_FAILED` — Authentication failed. Please verify your credentials with your account manager.
- `EOD_FILE_NOT_READY` — The requested data file is not yet available. Please check the delivery schedule and retry.
- `EOD_RECORD_PARSE_ERROR` — A record could not be parsed. Please check the record layout specification for the record type.
- `EOD_UNKNOWN_RECORD_TYPE` — An unrecognised record type was encountered. Please verify you are using the current specification version.
- `EOD_SUBSCRIPTION_INACTIVE` — Your data subscription is not active. Please contact your account manager.

## Events

**`eod_data.subscriber_activated`** — New subscriber provisioned and go-live confirmed
  Payload: `user_id`, `dataset_name`, `go_live_date`

**`eod_data.file_available`** — EOD dissemination file posted to FTP
  Payload: `file_name`, `run_date`, `delivery_channel`

**`eod_data.file_parsed`** — Subscriber successfully parsed an EOD file
  Payload: `run_date`, `record_count`, `record_types_found`

**`eod_data.instrument_stats_stored`** — Daily instrument statistics record processed and stored
  Payload: `run_date`, `instrument_numeric_code`, `closing_price`

**`eod_data.corporate_action_received`** — Corporate action record processed for an instrument
  Payload: `instrument_numeric_code`, `action_type`, `effective_date`

**`eod_data.parse_error`** — A record failed to parse — logged for investigation
  Payload: `run_date`, `record_type`, `sub_type`, `error_detail`

## Connects to

- **market-data-feeds** *(recommended)* — Complements real-time feeds — EOD delivery provides closing prices, statistics, and corporate actions for batch processing and historical analysis
- **fix-message-persistence** *(optional)* — FIX persistence patterns apply to EOD flat-file storage — same append-only, sequence-keyed storage model
- **data-import-export** *(recommended)* — EOD ZIP files require structured import pipeline matching fixed-width record layouts

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 60 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/equities-eod-data-delivery/) · **Spec source:** [`equities-eod-data-delivery.blueprint.yaml`](./equities-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
