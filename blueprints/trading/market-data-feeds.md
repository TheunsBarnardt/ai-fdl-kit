<!-- AUTO-GENERATED FROM market-data-feeds.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Market Data Feeds

> Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · feeds · real-time · pricing · indices · commodities · watchlist

## What this does

Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **instrument_code** *(text, required)*
- **instrument_name** *(text, required)*
- **current_price** *(number, required)*
- **previous_close_price** *(number, required)*
- **price_movement** *(number, optional)*
- **price_movement_percentage** *(number, optional)*
- **bid_price** *(number, optional)*
- **ask_price** *(number, optional)*
- **last_trade_price** *(number, optional)*
- **last_trade_time** *(datetime, optional)*
- **volume** *(number, optional)*
- **volume_weighted_average_price** *(number, optional)*
- **quote_date** *(date, required)*
- **quote_time** *(datetime, optional)*
- **is_live_data** *(boolean, required)*
- **data_source** *(text, required)*
- **index_level** *(number, optional)*
- **index_change** *(number, optional)*
- **commodity_price** *(number, optional)*
- **commodity_unit** *(text, optional)*
- **forex_rate** *(number, optional)*
- **forex_pair** *(text, optional)*
- **watchlist_id** *(number, required)*
- **watchlist_name** *(text, required)*
- **watchlist_owner_id** *(text, required)*
- **created_date** *(datetime, required)*
- **watchlist_description** *(text, optional)*
- **trade_id** *(text, required)*
- **trade_date** *(date, required)*
- **trade_time** *(datetime, required)*
- **instrument_code_traded** *(text, required)*
- **trade_quantity** *(number, required)*
- **trade_price** *(number, required)*
- **trade_type** *(text, required)*
- **trade_status** *(text, required)*
- **settlement_date** *(date, required)*
- **trade_fees** *(number, optional)*

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

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/market-data-feeds/) · **Spec source:** [`market-data-feeds.blueprint.yaml`](./market-data-feeds.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
