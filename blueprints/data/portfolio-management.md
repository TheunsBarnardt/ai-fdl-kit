<!-- AUTO-GENERATED FROM portfolio-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Portfolio Management

> Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history

**Category:** Data · **Version:** 1.0.0 · **Tags:** portfolio · holdings · valuations · wealth-management · positions

## What this does

Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_number** *(text, required)*
- **market_value** *(number, required)*
- **valuation_date** *(date, required)*
- **previous_market_value** *(number, optional)*
- **previous_valuation_date** *(date, optional)*
- **portfolio_movement** *(number, optional)*
- **total_cash** *(number, required)*
- **unsettled_positions** *(number, optional)*
- **reporting_currency** *(text, required)*
- **last_update_date** *(datetime, required)*
- **valuation_message** *(text, optional)*
- **instrument_code** *(text, required)*
- **instrument_name** *(text, required)*
- **instrument_type** *(text, required)*
- **instrument_isin** *(text, optional)*
- **quantity** *(number, required)*
- **instrument_price** *(number, required)*
- **cost_price** *(number, required)*
- **position_market_value** *(number, required)*
- **position_weighting** *(number, required)*
- **unrealised_pnl** *(number, required)*
- **asset_class** *(text, optional)*
- **sector** *(text, optional)*
- **sub_sector** *(text, optional)*
- **currency** *(text, required)*
- **fx_rate** *(number, required)*
- **reporting_market_value** *(number, required)*
- **share_traded_today** *(boolean, optional)*
- **is_live_data** *(boolean, optional)*
- **feed_source** *(text, optional)*
- **external_account** *(text, optional)*
- **transaction_date** *(date, required)*
- **transaction_type** *(text, required)*
- **transaction_amount** *(number, required)*
- **transaction_quantity** *(number, optional)*

## What must be true

- **security → authentication:** All portfolio endpoints require JWT authentication via [Authorize] decorator, User must be authenticated to view portfolio data
- **access:** User can only view portfolios linked to their CRM account, CRM relationship determines which accounts are visible to which advisors/clients
- **business:** Valuation date must be a valid business day (no future dates), Market value must equal sum of all position values (quality check), Position weighting must sum to approximately 100% (accounting for cash), Unrealised PnL = position_market_value - cost_price (validation rule), If share_traded_today = false, use delayed pricing (not real-time), Unsettled positions excluded from main portfolio movement calculation, Cash holdings included in total market value, Currency conversion uses FX rate as of valuation_date

## Success & failure scenarios

**✅ Success paths**

- **Dashboard Retrieved** — when user is authenticated; user has an active CRM relationship, then Dashboard displays summary metrics: total value, movement, cash, last update time.
- **Portfolio Retrieved** — when user is authenticated; account_number is provided; account belongs to authenticated user, then Client receives list of holdings with current valuations, weightings, and P&L.
- **Portfolio Exported To Excel** — when user is authenticated; portfolio_retrieved outcome succeeded, then Excel file generated and ready for download.
- **Portfolio Data Stale** — when last_update_date lt "now - 24h", then Portfolio returned with warning message about data freshness.
- **Mobile Portfolio Retrieved** — when user is authenticated; client is accessing from mobile app; account_number is provided; currency is provided (mobile clients can select currency), then Optimized mobile view with essential position data only.
- **Transaction History Retrieved** — when user is authenticated; account_number is provided; start_date and end_date are provided; date_range <= 5 years, then Chronological transaction list for the requested period.
- **Market Values Updated** — when market_data_system has new pricing; end-of-day valuation cycle triggered, then All portfolios updated with latest market prices.

**❌ Failure paths**

- **Access Denied** — when user_id not_exists, then 401 Unauthorized - user must authenticate first. *(error: `PORTFOLIO_ACCESS_DENIED`)*
- **Account Not Found** — when account_number not_exists, then 404 Not Found - account does not exist. *(error: `PORTFOLIO_ACCOUNT_NOT_FOUND`)*
- **Invalid Valuation Date** — when valuation_date gt "today", then 400 Bad Request - valuation date cannot be in the future. *(error: `PORTFOLIO_FUTURE_DATE_INVALID`)*
- **Date Range Too Large** — when date_range gt "5 years", then 400 Bad Request - transaction history limited to 5-year lookback. *(error: `PORTFOLIO_DATE_RANGE_EXCEEDED`)*

## Errors it can return

- `PORTFOLIO_ACCESS_DENIED` — You do not have permission to view this portfolio. Please verify the account number and your access rights.
- `PORTFOLIO_ACCOUNT_NOT_FOUND` — The requested account could not be found. Please verify the account number.
- `PORTFOLIO_FUTURE_DATE_INVALID` — Valuation date cannot be in the future. Please provide a current or past date.
- `PORTFOLIO_DATE_RANGE_EXCEEDED` — Transaction history is limited to a 5-year lookback period. Please adjust your date range.
- `PORTFOLIO_VALUATION_FAILURE` — Unable to retrieve current portfolio valuation. Please try again later.
- `PORTFOLIO_EXPORT_FAILURE` — Unable to export portfolio to Excel. Please try again later.

## Connects to

- **market-data-feeds** *(required)* — Requires real-time and EOD pricing data
- **reference-data-lookup** *(recommended)* — Instrument classification and corporate action data

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/portfolio-management/) · **Spec source:** [`portfolio-management.blueprint.yaml`](./portfolio-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
