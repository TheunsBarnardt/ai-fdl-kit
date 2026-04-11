---
title: "Market Data Feeds Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers. 37 fields. 17 "
---

# Market Data Feeds Blueprint

> Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

| | |
|---|---|
| **Feature** | `market-data-feeds` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, feeds, real-time, pricing, indices, commodities, watchlist |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-data-feeds.blueprint.yaml) |
| **JSON API** | [market-data-feeds.json]({{ site.baseurl }}/api/blueprints/trading/market-data-feeds.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `market_participant` | Market Data Consumer | human | Client accessing market prices, indices, and research data |
| `financial_advisor` | Advisor | human | Advisor building watchlists and monitoring market data |
| `market_data_provider` | Market Data Provider | external | Market data provider systems offering quotes, indices, commodities, forex |
| `trade_feed_system` | Trade Feed System | external | Asynchronous trade feed providing trade confirmations and updates |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `instrument_code` | text | Yes | Instrument Code |  |
| `instrument_name` | text | Yes | Instrument Name |  |
| `current_price` | number | Yes | Current Price |  |
| `previous_close_price` | number | Yes | Previous Close Price |  |
| `price_movement` | number | No | Price Movement |  |
| `price_movement_percentage` | number | No | Price Movement Percentage |  |
| `bid_price` | number | No | Bid Price |  |
| `ask_price` | number | No | Ask Price |  |
| `last_trade_price` | number | No | Last Trade Price |  |
| `last_trade_time` | datetime | No | Last Trade Time |  |
| `volume` | number | No | Volume |  |
| `volume_weighted_average_price` | number | No | Volume Weighted Average Price |  |
| `quote_date` | date | Yes | Quote Date |  |
| `quote_time` | datetime | No | Quote Time |  |
| `is_live_data` | boolean | Yes | Is Live Data |  |
| `data_source` | text | Yes | Data Source |  |
| `index_level` | number | No | Index Level |  |
| `index_change` | number | No | Index Change |  |
| `commodity_price` | number | No | Commodity Price |  |
| `commodity_unit` | text | No | Commodity Unit |  |
| `forex_rate` | number | No | Forex Rate |  |
| `forex_pair` | text | No | Forex Pair |  |
| `watchlist_id` | number | Yes | Watchlist Id |  |
| `watchlist_name` | text | Yes | Watchlist Name |  |
| `watchlist_owner_id` | text | Yes | Watchlist Owner Id |  |
| `created_date` | datetime | Yes | Created Date |  |
| `watchlist_description` | text | No | Watchlist Description |  |
| `trade_id` | text | Yes | Trade Id |  |
| `trade_date` | date | Yes | Trade Date |  |
| `trade_time` | datetime | Yes | Trade Time |  |
| `instrument_code_traded` | text | Yes | Instrument Code Traded |  |
| `trade_quantity` | number | Yes | Trade Quantity |  |
| `trade_price` | number | Yes | Trade Price |  |
| `trade_type` | text | Yes | Trade Type |  |
| `trade_status` | text | Yes | Trade Status |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `trade_fees` | number | No | Trade Fees |  |

## States

**State field:** `data_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `real_time` | Yes |  |
| `delayed` |  |  |
| `stale` |  |  |
| `unavailable` |  |  |

## Rules

- **security:**
  - **authentication:** Watchlist operations require authentication, Market data endpoints are mostly public (caching allowed), User watchlists only accessible to owner
- **access:** Users can create personal watchlists, Users can only modify/delete their own watchlists, Market data is freely accessible (public)
- **business:** Price movement = current_price - previous_close_price, Movement percentage = (price_movement / previous_close_price) * 100, Real-time data = quote within 1 minute of trade, Delayed data = quote 15+ minutes old, If instrument has no trades today, use previous close price, Volume = 0 if no trades occurred, Trade settlement = trade_date + settlement_period (typically 3 business days), Market data caching prevents duplicate data provider calls

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| quote_freshness | 1m |  |
| data_provider_latency | 2s |  |
| watchlist_responsiveness | 5s |  |
| trade_feed_ingestion | 15s |  |

## Outcomes

### Commodities_retrieved (Priority: 1)

**Given:**
- user requests commodity prices

**Then:**
- **fetch_record**
- **emit_event** event: `market.commodities_fetched`

**Result:** List of commodities with current prices and movements

### Instrument_not_found (Priority: 1) — Error: `MARKET_INSTRUMENT_NOT_FOUND`

**Given:**
- `instrument_code` (input) not_exists

**Result:** 404 Not Found - instrument not found

### Forex_retrieved (Priority: 2)

**Given:**
- user requests exchange rates

**Then:**
- **fetch_record**
- **emit_event** event: `market.forex_fetched`

**Result:** Exchange rates for major currency pairs

### Invalid_quote_date (Priority: 2) — Error: `MARKET_INVALID_DATE`

**Given:**
- `quote_date` (input) gt `today`

**Result:** 400 Bad Request - quote date cannot be in the future

### Indices_retrieved (Priority: 3)

**Given:**
- user requests index data
- quote_date is provided

**Then:**
- **fetch_record**
- **compute_field** field: `price_movement_percentage`
- **emit_event** event: `market.indices_fetched`

**Result:** Index levels and movements for the requested date

### Watchlist_unauthorized_access (Priority: 3) — Error: `MARKET_WATCHLIST_UNAUTHORIZED`

**Given:**
- `user_id` (session) neq `watchlist_owner_id`

**Result:** 403 Forbidden - you do not have permission to modify this watchlist

### Instrument_detail_retrieved (Priority: 4)

**Given:**
- instrument_code is provided
- quote_date is provided

**Then:**
- **fetch_record**
- **set_field** target: `data_source` value: `source of data`

**Result:** Detailed instrument quote including bid/ask spread and volume

### Trade_parse_failure (Priority: 4) — Error: `MARKET_TRADE_INVALID_FORMAT`

**Given:**
- TradeCIS message cannot be parsed as JSON

**Then:**
- **emit_event** event: `market.trade_failed`

**Result:** Trade rejected and logged for manual review

### Instrument_history_retrieved (Priority: 5)

**Given:**
- instrument_code is provided
- start_date is provided
- end_date is provided
- date_range <= 5 years

**Then:**
- **fetch_record**
- **sort_data**

**Result:** Time series of historical prices for analysis/charting

### Instrument_lookup_completed (Priority: 6)

**Given:**
- lookup string is provided (partial name/code)

**Then:**
- **search_data** field: `instrument_name` value: `lookup string`
- **limit_results**

**Result:** Dropdown list of matching instruments

### Intraday_trades_retrieved (Priority: 7)

**Given:**
- instrument_code is provided
- quote_date is provided

**Then:**
- **fetch_record**

**Result:** Tick-by-tick trades for the day

### Ticker_retrieved (Priority: 8)

**Given:**
- user requests top movers

**Then:**
- **fetch_record**
- **sort_data**
- **limit_results**

**Result:** Top 40 index components sorted by movement

### Watchlist_created (Priority: 9)

**Given:**
- user is authenticated
- watchlist_name is provided
- watchlist_owner_id is current user

**Then:**
- **create_record**
- **emit_event** event: `market.watchlist_created`

**Result:** Watchlist record persisted; client receives watchlist_id and created_date; no instruments assigned yet.

### Watchlist_instrument_added (Priority: 10)

**Given:**
- watchlist_id is provided
- instrument_code is provided
- user owns watchlist
- instrument already not in watchlist

**Then:**
- **create_record**
- **emit_event** event: `market.watchlist_instrument_added`

**Result:** Instrument added to watchlist

### Watchlist_data_retrieved (Priority: 11)

**Given:**
- watchlist_id is provided
- quote_date is provided (optional, defaults to today)

**Then:**
- **fetch_record**
- **fetch_record**

**Result:** Watchlist with current prices for all instruments

### Watchlist_removed (Priority: 12)

**Given:**
- watchlist_id is provided
- user owns watchlist

**Then:**
- **delete_record**
- **emit_event** event: `market.watchlist_deleted`

**Result:** Watchlist deleted

### Trade_received_and_processed (Priority: 13) | Transaction: atomic

**Given:**
- TradeCIS sends async trade message
- trade_id is unique

**Then:**
- **parse_data**
- **validate_data**
- **create_record**
- **emit_event** event: `market.trade_executed`

**Result:** Trade recorded and distributed to relevant systems

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKET_INSTRUMENT_NOT_FOUND` | 404 | The requested instrument could not be found. Please verify the instrument code. | No |
| `MARKET_INVALID_DATE` | 400 | The requested date is invalid. Please provide a current or past date. | No |
| `MARKET_WATCHLIST_UNAUTHORIZED` | 403 | You do not have permission to modify this watchlist. | No |
| `MARKET_WATCHLIST_NOT_FOUND` | 404 | The requested watchlist could not be found. | No |
| `MARKET_TRADE_INVALID_FORMAT` | 400 | The trade message format is invalid. Please verify the message structure. | No |
| `MARKET_DATA_UNAVAILABLE` | 503 | Market data is temporarily unavailable. Please try again later. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market.commodities_fetched` | Commodity prices retrieved | `quote_date`, `commodity_count`, `data_source` |
| `market.forex_fetched` | Forex rates retrieved | `quote_date`, `pair_count` |
| `market.indices_fetched` | Index data retrieved | `quote_date`, `index_count` |
| `market.watchlist_created` | User created new watchlist | `watchlist_id`, `watchlist_owner_id`, `created_date` |
| `market.watchlist_instrument_added` | Instrument added to watchlist | `watchlist_id`, `instrument_code` |
| `market.watchlist_deleted` | Watchlist deleted | `watchlist_id`, `watchlist_owner_id` |
| `market.trade_executed` | Trade received and processed from feed | `trade_id`, `instrument_code_traded`, `trade_quantity`, `trade_price`, `settlement_date` |
| `market.trade_failed` | Trade failed to process | `raw_message`, `error_details`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-management | required | Provides pricing data for portfolio valuations |
| reference-data-lookup | recommended | Instrument classifications and corporate actions |

## AGI Readiness

### Goals

#### Reliable Market Data Feeds

Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `portfolio_management` | portfolio-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| commodities_retrieved | `autonomous` | - | - |
| forex_retrieved | `autonomous` | - | - |
| indices_retrieved | `autonomous` | - | - |
| instrument_detail_retrieved | `autonomous` | - | - |
| instrument_history_retrieved | `autonomous` | - | - |
| instrument_lookup_completed | `autonomous` | - | - |
| intraday_trades_retrieved | `autonomous` | - | - |
| ticker_retrieved | `autonomous` | - | - |
| watchlist_created | `supervised` | - | - |
| watchlist_instrument_added | `autonomous` | - | - |
| watchlist_data_retrieved | `autonomous` | - | - |
| watchlist_removed | `human_required` | - | - |
| trade_received_and_processed | `autonomous` | - | - |
| instrument_not_found | `autonomous` | - | - |
| invalid_quote_date | `autonomous` | - | - |
| watchlist_unauthorized_access | `autonomous` | - | - |
| trade_parse_failure | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C#
  framework: ASP.NET Core 5+
  database: SQL Server (Iress, Marble schemas)
  cache: In-memory caching with configurable TTL (1min-1440min)
source:
  repo: C:\Work\Sasfin.Wealth.Api
  project: Sasfin Wealth Management Platform
  entry_points:
    - Wealth.Api/Controllers/MarketController.cs
    - Wealth.Api/Controllers/FeedController.cs
    - Sasfin.Wealth.Framework/Entities/MarketDataResult.cs
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data Feeds Blueprint",
  "description": "Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers. 37 fields. 17 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, feeds, real-time, pricing, indices, commodities, watchlist"
}
</script>
