---
title: "Economic Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify and interpret leading, coincident, and lagging economic indicators — including composite indices and nowcasting — to track and forecast the business cy"
---

# Economic Indicators Blueprint

> Classify and interpret leading, coincident, and lagging economic indicators — including composite indices and nowcasting — to track and forecast the business cycle

| | |
|---|---|
| **Feature** | `economic-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, macroeconomics, leading-indicators, coincident-indicators, lagging-indicators, nowcasting, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/economic-indicators.blueprint.yaml) |
| **JSON API** | [economic-indicators.json]({{ site.baseurl }}/api/blueprints/trading/economic-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `indicator_tracker` | Economic Indicator Tracker | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `indicator_name` | text | Yes | Indicator name or code |  |
| `category` | select | Yes | leading \| coincident \| lagging |  |
| `value` | number | No | Latest observation |  |
| `release_date` | datetime | No | Observation release timestamp |  |

## Rules

- **leading_indicators:**
  - **definition:** Turn before the business cycle — useful for forecasting
  - **examples:** Average weekly hours, manufacturing, New orders for capital goods, Building permits, Stock prices (S&P 500), Interest rate spread (10y minus 3m), Consumer expectations
- **coincident_indicators:**
  - **definition:** Move contemporaneously with the cycle — identify current state
  - **examples:** Employees on nonfarm payrolls, Personal income less transfer payments, Industrial production, Manufacturing and trade sales
- **lagging_indicators:**
  - **definition:** Change after the cycle — confirm prior turns
  - **examples:** Average duration of unemployment, Inventory-to-sales ratio, Change in labour cost per unit of output, Average prime rate, Commercial and industrial loans, Consumer debt to income, CPI services
- **composite_indices:**
  - **leading_economic_index:** LEI aggregates 10 leading series
  - **coincident_index:** CEI aggregates 4 coincident series
  - **lagging_index:** LAG combines 7 lagging series
  - **signal_rules:** Three consecutive declines in LEI traditionally flag recession risk
- **surveys:**
  - **ism_pmi:** Purchasing Managers Index — 50 is expansion/contraction boundary
  - **consumer_confidence:** Sentiment surveys supplement hard data
  - **senior_loan_officer:** Gauge of lending standards
- **nowcasting:**
  - **definition:** Real-time estimation of current-quarter GDP using high-frequency data
  - **example:** Atlanta Fed GDPNow updates each data release
  - **benefits:** Reduce information lag between release and decision
- **applications:**
  - **asset_allocation:** Overweight cyclicals when LEI is rising
  - **interest_rate_forecasting:** Yield-curve shape is a tested recession predictor
  - **sector_rotation:** Building permits lead housing and construction equities
- **validation:**
  - **valid_category:** category in {leading, coincident, lagging}
  - **indicator_name_present:** indicator_name required

## Outcomes

### Register_indicator_reading (Priority: 1)

_Record a new reading and update composite indices_

**Given:**
- `indicator_name` (input) exists
- `category` (input) in `leading,coincident,lagging`

**Then:**
- **call_service** target: `indicator_tracker`
- **emit_event** event: `macro.indicator_updated`

### Invalid_category (Priority: 10) — Error: `INDICATOR_INVALID_CATEGORY`

_Unsupported category_

**Given:**
- `category` (input) not_in `leading,coincident,lagging`

**Then:**
- **emit_event** event: `macro.indicator_rejected`

### Missing_indicator_name (Priority: 11) — Error: `INDICATOR_NAME_MISSING`

_Indicator name missing_

**Given:**
- `indicator_name` (input) not_exists

**Then:**
- **emit_event** event: `macro.indicator_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INDICATOR_INVALID_CATEGORY` | 400 | category must be leading, coincident, or lagging | No |
| `INDICATOR_NAME_MISSING` | 400 | indicator_name is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `macro.indicator_updated` |  | `indicator_name`, `category`, `value`, `release_date`, `composite_change` |
| `macro.indicator_rejected` |  | `indicator_name`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| business-cycle-phases | required |  |
| credit-cycles | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
us_composite_leading_components:
  - Average weekly hours, manufacturing
  - Average weekly initial claims for unemployment
  - Manufacturers' new orders, consumer goods
  - ISM New Orders index
  - Manufacturers' new orders, non-defense capital goods ex aircraft
  - Building permits, private housing
  - Stock prices, S&P 500
  - Leading credit index
  - Interest rate spread, 10y minus federal funds
  - Average consumer expectations
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Economic Indicators Blueprint",
  "description": "Classify and interpret leading, coincident, and lagging economic indicators — including composite indices and nowcasting — to track and forecast the business cy",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, macroeconomics, leading-indicators, coincident-indicators, lagging-indicators, nowcasting, cfa-level-1"
}
</script>
