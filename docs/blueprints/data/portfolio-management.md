---
title: "Portfolio Management Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history. 35 fields. 11 outcomes. 6 error codes. rules: sec"
---

# Portfolio Management Blueprint

> Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history

| | |
|---|---|
| **Feature** | `portfolio-management` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | portfolio, holdings, valuations, wealth-management, positions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/portfolio-management.blueprint.yaml) |
| **JSON API** | [portfolio-management.json]({{ site.baseurl }}/api/blueprints/data/portfolio-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `investor` | Investment Client | human | End user viewing their portfolio data |
| `financial_advisor` | Financial Advisor | human | Advisor managing client portfolios |
| `market_data_system` | Market Data Provider | external | Market data provider systems offering valuations and pricing |
| `crm_system` | CRM System | external | CRM system storing account and client relationships |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_number` | text | Yes |  |  |
| `market_value` | number | Yes |  |  |
| `valuation_date` | date | Yes |  |  |
| `previous_market_value` | number | No |  |  |
| `previous_valuation_date` | date | No |  |  |
| `portfolio_movement` | number | No |  |  |
| `total_cash` | number | Yes |  |  |
| `unsettled_positions` | number | No |  |  |
| `reporting_currency` | text | Yes |  |  |
| `last_update_date` | datetime | Yes |  |  |
| `valuation_message` | text | No |  |  |
| `instrument_code` | text | Yes |  |  |
| `instrument_name` | text | Yes |  |  |
| `instrument_type` | text | Yes |  |  |
| `instrument_isin` | text | No |  |  |
| `quantity` | number | Yes |  |  |
| `instrument_price` | number | Yes |  |  |
| `cost_price` | number | Yes |  |  |
| `position_market_value` | number | Yes |  |  |
| `position_weighting` | number | Yes |  |  |
| `unrealised_pnl` | number | Yes |  |  |
| `asset_class` | text | No |  |  |
| `sector` | text | No |  |  |
| `sub_sector` | text | No |  |  |
| `currency` | text | Yes |  |  |
| `fx_rate` | number | Yes |  |  |
| `reporting_market_value` | number | Yes |  |  |
| `share_traded_today` | boolean | No |  |  |
| `is_live_data` | boolean | No |  |  |
| `feed_source` | text | No |  |  |
| `external_account` | text | No |  |  |
| `transaction_date` | date | Yes |  |  |
| `transaction_type` | text | Yes |  |  |
| `transaction_amount` | number | Yes |  |  |
| `transaction_quantity` | number | No |  |  |

## States

**State field:** `portfolio_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `inactive` |  |  |
| `pending_valuation` |  |  |

## Rules

- **security:**
  - **authentication:** All portfolio endpoints require JWT authentication via [Authorize] decorator, User must be authenticated to view portfolio data
- **access:** User can only view portfolios linked to their CRM account, CRM relationship determines which accounts are visible to which advisors/clients
- **business:** Valuation date must be a valid business day (no future dates), Market value must equal sum of all position values (quality check), Position weighting must sum to approximately 100% (accounting for cash), Unrealised PnL = position_market_value - cost_price (validation rule), If share_traded_today = false, use delayed pricing (not real-time), Unsettled positions excluded from main portfolio movement calculation, Cash holdings included in total market value, Currency conversion uses FX rate as of valuation_date

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| portfolio_valuation_staleness | 24h |  |
| dashboard_load_time | 5s |  |

## Outcomes

### Dashboard_retrieved (Priority: 1)

**Given:**
- user is authenticated
- user has an active CRM relationship

**Then:**
- **fetch_record**

**Result:** Dashboard displays summary metrics: total value, movement, cash, last update time

### Access_denied (Priority: 1) — Error: `PORTFOLIO_ACCESS_DENIED`

**Given:**
- `user_id` (session) not_exists

**Result:** 401 Unauthorized - user must authenticate first

### Portfolio_retrieved (Priority: 2)

**Given:**
- user is authenticated
- account_number is provided
- account belongs to authenticated user

**Then:**
- **fetch_record**
- **compute_field** field: `position_weighting`
- **compute_field** field: `unrealised_pnl`
- **set_field** target: `last_update_date` value: `current_timestamp`

**Result:** Client receives list of holdings with current valuations, weightings, and P&L

### Account_not_found (Priority: 2) — Error: `PORTFOLIO_ACCOUNT_NOT_FOUND`

**Given:**
- `account_number` (input) not_exists

**Result:** 404 Not Found - account does not exist

### Portfolio_exported_to_excel (Priority: 3)

**Given:**
- user is authenticated
- portfolio_retrieved outcome succeeded

**Then:**
- **export_data**
- **emit_event** event: `portfolio.exported`

**Result:** Excel file generated and ready for download

### Portfolio_data_stale (Priority: 3)

**Given:**
- `last_update_date` (db) lt `now - 24h`

**Then:**
- **set_field** target: `valuation_message` value: `Data is delayed. Last update: {last_update_date}`

**Result:** Portfolio returned with warning message about data freshness

### Mobile_portfolio_retrieved (Priority: 4)

**Given:**
- user is authenticated
- client is accessing from mobile app
- account_number is provided
- currency is provided (mobile clients can select currency)

**Then:**
- **fetch_record**
- **filter_field** field: `position_market_value`

**Result:** Optimized mobile view with essential position data only

### Invalid_valuation_date (Priority: 4) — Error: `PORTFOLIO_FUTURE_DATE_INVALID`

**Given:**
- `valuation_date` (input) gt `today`

**Result:** 400 Bad Request - valuation date cannot be in the future

### Transaction_history_retrieved (Priority: 5)

**Given:**
- user is authenticated
- account_number is provided
- start_date and end_date are provided
- date_range <= 5 years

**Then:**
- **fetch_record**
- **sort_data**

**Result:** Chronological transaction list for the requested period

### Date_range_too_large (Priority: 5) — Error: `PORTFOLIO_DATE_RANGE_EXCEEDED`

**Given:**
- `date_range` (computed) gt `5 years`

**Result:** 400 Bad Request - transaction history limited to 5-year lookback

### Market_values_updated (Priority: 6)

**Given:**
- market_data_system has new pricing
- end-of-day valuation cycle triggered

**Then:**
- **set_field** target: `instrument_price`
- **compute_field** field: `position_market_value`
- **compute_field** field: `market_value`
- **compute_field** field: `portfolio_movement`
- **set_field** target: `last_update_date` value: `current_timestamp`
- **emit_event** event: `portfolio.valuation_updated`

**Result:** All portfolios updated with latest market prices

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORTFOLIO_ACCESS_DENIED` | 401 | You do not have permission to view this portfolio. Please verify the account number and your access rights. | No |
| `PORTFOLIO_ACCOUNT_NOT_FOUND` | 404 | The requested account could not be found. Please verify the account number. | No |
| `PORTFOLIO_FUTURE_DATE_INVALID` | 400 | Valuation date cannot be in the future. Please provide a current or past date. | No |
| `PORTFOLIO_DATE_RANGE_EXCEEDED` | 400 | Transaction history is limited to a 5-year lookback period. Please adjust your date range. | No |
| `PORTFOLIO_VALUATION_FAILURE` | 500 | Unable to retrieve current portfolio valuation. Please try again later. | No |
| `PORTFOLIO_EXPORT_FAILURE` | 500 | Unable to export portfolio to Excel. Please try again later. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.dashboard_viewed` | User viewed dashboard summary | `account_number`, `user_id`, `view_date`, `device_type` |
| `portfolio.positions_retrieved` | Full position list retrieved | `account_number`, `position_count`, `total_value`, `retrieval_date` |
| `portfolio.exported` | Portfolio exported to Excel | `account_number`, `export_date`, `export_user_id`, `file_size` |
| `portfolio.valuation_updated` | Portfolio valuation refreshed with new market prices | `account_number`, `market_value`, `valuation_date`, `portfolio_movement`, `position_count` |
| `portfolio.transaction_retrieved` | Transaction history retrieved | `account_number`, `start_date`, `end_date`, `transaction_count` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| market-data-feeds | required | Requires real-time and EOD pricing data |
| reference-data-lookup | recommended | Instrument classification and corporate action data |

## AGI Readiness

### Goals

#### Reliable Portfolio Management

Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `market_data_feeds` | market-data-feeds | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| dashboard_retrieved | `autonomous` | - | - |
| portfolio_retrieved | `autonomous` | - | - |
| portfolio_exported_to_excel | `autonomous` | - | - |
| mobile_portfolio_retrieved | `autonomous` | - | - |
| transaction_history_retrieved | `autonomous` | - | - |
| market_values_updated | `supervised` | - | - |
| access_denied | `autonomous` | - | - |
| account_not_found | `autonomous` | - | - |
| portfolio_data_stale | `autonomous` | - | - |
| invalid_valuation_date | `autonomous` | - | - |
| date_range_too_large | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C#
  framework: ASP.NET Core 5+
  database: SQL Server (market data provider schemas)
  orm: Entity Framework Core
source:
  repo: Reference implementation
  project: Wealth Management Platform
  entry_points:
    - Wealth.Api/Controllers/PortfolioController.cs
    - Framework/Entities/PortfolioResult.cs
    - Framework/Entities/PositionResult.cs
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Management Blueprint",
  "description": "Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history. 35 fields. 11 outcomes. 6 error codes. rules: sec",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio, holdings, valuations, wealth-management, positions"
}
</script>
