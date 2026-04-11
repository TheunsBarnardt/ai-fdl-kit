<!-- AUTO-GENERATED FROM market-data-feeds.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Market Data Feeds

> Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · feeds · real-time · pricing · indices · commodities · watchlist

## What this does

Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **instrument_code** *(text, required)* — Instrument Code
- **instrument_name** *(text, required)* — Instrument Name
- **current_price** *(number, required)* — Current Price
- **previous_close_price** *(number, required)* — Previous Close Price
- **price_movement** *(number, optional)* — Price Movement
- **price_movement_percentage** *(number, optional)* — Price Movement Percentage
- **bid_price** *(number, optional)* — Bid Price
- **ask_price** *(number, optional)* — Ask Price
- **last_trade_price** *(number, optional)* — Last Trade Price
- **last_trade_time** *(datetime, optional)* — Last Trade Time
- **volume** *(number, optional)* — Volume
- **volume_weighted_average_price** *(number, optional)* — Volume Weighted Average Price
- **quote_date** *(date, required)* — Quote Date
- **quote_time** *(datetime, optional)* — Quote Time
- **is_live_data** *(boolean, required)* — Is Live Data
- **data_source** *(text, required)* — Data Source
- **index_level** *(number, optional)* — Index Level
- **index_change** *(number, optional)* — Index Change
- **commodity_price** *(number, optional)* — Commodity Price
- **commodity_unit** *(text, optional)* — Commodity Unit
- **forex_rate** *(number, optional)* — Forex Rate
- **forex_pair** *(text, optional)* — Forex Pair
- **watchlist_id** *(number, required)* — Watchlist Id
- **watchlist_name** *(text, required)* — Watchlist Name
- **watchlist_owner_id** *(text, required)* — Watchlist Owner Id
- **created_date** *(datetime, required)* — Created Date
- **watchlist_description** *(text, optional)* — Watchlist Description
- **trade_id** *(text, required)* — Trade Id
- **trade_date** *(date, required)* — Trade Date
- **trade_time** *(datetime, required)* — Trade Time
- **instrument_code_traded** *(text, required)* — Instrument Code Traded
- **trade_quantity** *(number, required)* — Trade Quantity
- **trade_price** *(number, required)* — Trade Price
- **trade_type** *(text, required)* — Trade Type
- **trade_status** *(text, required)* — Trade Status
- **settlement_date** *(date, required)* — Settlement Date
- **trade_fees** *(number, optional)* — Trade Fees

## What must be true

- **security → authentication:** Watchlist operations require authentication, Market data endpoints are mostly public (caching allowed), User watchlists only accessible to owner
- **access:** Users can create personal watchlists, Users can only modify/delete their own watchlists, Market data is freely accessible (public)
- **business:** Price movement = current_price - previous_close_price, Movement percentage = (price_movement / previous_close_price) * 100, Real-time data = quote within 1 minute of trade, Delayed data = quote 15+ minutes old, If instrument has no trades today, use previous close price, Volume = 0 if no trades occurred, Trade settlement = trade_date + settlement_period (typically 3 business days), Market data caching prevents duplicate data provider calls

## Success & failure scenarios

**✅ Success paths**

- **Commodities Retrieved** — when user requests commodity prices, then List of commodities with current prices and movements.
- **Forex Retrieved** — when user requests exchange rates, then Exchange rates for major currency pairs.
- **Indices Retrieved** — when user requests index data; quote_date is provided, then Index levels and movements for the requested date.
- **Instrument Detail Retrieved** — when instrument_code is provided; quote_date is provided, then Detailed instrument quote including bid/ask spread and volume.
- **Instrument History Retrieved** — when instrument_code is provided; start_date is provided; end_date is provided; date_range <= 5 years, then Time series of historical prices for analysis/charting.
- **Instrument Lookup Completed** — when lookup string is provided (partial name/code), then Dropdown list of matching instruments.
- **Intraday Trades Retrieved** — when instrument_code is provided; quote_date is provided, then Tick-by-tick trades for the day.
- **Ticker Retrieved** — when user requests top movers, then Top 40 index components sorted by movement.
- **Watchlist Created** — when user is authenticated; watchlist_name is provided; watchlist_owner_id is current user, then Watchlist created and ready for instruments to be added.
- **Watchlist Instrument Added** — when watchlist_id is provided; instrument_code is provided; user owns watchlist; instrument already not in watchlist, then Instrument added to watchlist.
- **Watchlist Data Retrieved** — when watchlist_id is provided; quote_date is provided (optional, defaults to today), then Watchlist with current prices for all instruments.
- **Watchlist Removed** — when watchlist_id is provided; user owns watchlist, then Watchlist deleted.
- **Trade Received And Processed** — when TradeCIS sends async trade message; trade_id is unique, then Trade recorded and distributed to relevant systems.

**❌ Failure paths**

- **Instrument Not Found** — when instrument_code not_exists, then 404 Not Found - instrument not found. *(error: `MARKET_INSTRUMENT_NOT_FOUND`)*
- **Invalid Quote Date** — when quote_date gt "today", then 400 Bad Request - quote date cannot be in the future. *(error: `MARKET_INVALID_DATE`)*
- **Watchlist Unauthorized Access** — when user_id neq "watchlist_owner_id", then 403 Forbidden - you do not have permission to modify this watchlist. *(error: `MARKET_WATCHLIST_UNAUTHORIZED`)*
- **Trade Parse Failure** — when TradeCIS message cannot be parsed as JSON, then Trade rejected and logged for manual review. *(error: `MARKET_TRADE_INVALID_FORMAT`)*

## Errors it can return

- `MARKET_INSTRUMENT_NOT_FOUND` — The requested instrument could not be found. Please verify the instrument code.
- `MARKET_INVALID_DATE` — The requested date is invalid. Please provide a current or past date.
- `MARKET_WATCHLIST_UNAUTHORIZED` — You do not have permission to modify this watchlist.
- `MARKET_WATCHLIST_NOT_FOUND` — The requested watchlist could not be found.
- `MARKET_TRADE_INVALID_FORMAT` — The trade message format is invalid. Please verify the message structure.
- `MARKET_DATA_UNAVAILABLE` — Market data is temporarily unavailable. Please try again later.

## Connects to

- **portfolio-management** *(required)* — Provides pricing data for portfolio valuations
- **reference-data-lookup** *(recommended)* — Instrument classifications and corporate actions

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+4** since baseline (76 → 80)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 37 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/market-data-feeds/) · **Spec source:** [`market-data-feeds.blueprint.yaml`](./market-data-feeds.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
