---
title: "Market Data All Classes Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Comprehensive market data products across all asset classes (equities, derivatives, fixed-income, indices, commodities, currencies). 4 fields. 1 outcomes. 1 err"
---

# Market Data All Classes Blueprint

> Comprehensive market data products across all asset classes (equities, derivatives, fixed-income, indices, commodities, currencies)

| | |
|---|---|
| **Feature** | `market-data-all-classes` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, eod, nlmd, all-classes, comprehensive |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-data-all-classes.blueprint.yaml) |
| **JSON API** | [market-data-all-classes.json]({{ site.baseurl }}/api/blueprints/trading/market-data-all-classes.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_class` | select | Yes | Asset Class |  |
| `product_code` | text | Yes | Product Code |  |
| `distribution_date` | date | Yes | Distribution Date |  |
| `record_format` | select | No | Format (FixedWidth, Delimited, Binary) |  |

## Rules

- **coverage:**
  - **data_completeness:** All markets publish EOD data for all trading instruments
  - **historical_retention:** Minimum 5-year retention for regulatory compliance
  - **format_standardization:** All products use exchange-standard formats

## Outcomes

### Publish_market_data_eod (Priority: 1)

_Publish EOD market data across all asset classes_

**Given:**
- `asset_class` (input) exists

**Then:**
- **emit_event** event: `market_data.published`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MARKET_DATA_PUBLISH_FAILED` | 500 | Market data publication failed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market_data.published` |  | `asset_class`, `product_code`, `publication_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| index-data-feeds | extends |  |
| reference-data-management | required |  |
| bond-pricing-models | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
asset_classes:
  equity:
    products:
      - Price Data
      - Volume Data
      - Corporate Actions
      - Dividends
      - Technical Indicators
    indices:
      - ALSI
      - TOP40
      - FINI
      - Sector Indices
      - Style Indices
      - Thematic Indices
  derivatives:
    products:
      - Options Data
      - Futures Data
      - Greeks
      - Open Interest
    types:
      - Equity Derivatives
      - Commodity Derivatives
      - Currency Derivatives
      - Interest-Rate Derivatives
  fixed_income:
    products:
      - Bond Data
      - Yield Data
      - Valuation
      - Reference Data
      - Corporate Actions
    segments:
      - Government Bonds
      - Corporate Bonds
      - Floating-Rate Notes
      - Bond ETPs
  indices:
    families:
      - Headline
      - African
      - Capped
      - Core
      - Factor
      - Style
      - Thematic
      - Sector
      - Fixed-Income
      - Multi-Asset
  currencies:
    products:
      - Exchange Rates
      - FX Derivatives
      - Historical Rates
  commodities:
    products:
      - Commodity Futures Data
      - Reference Data
data_products_by_class:
  equity:
    - OpenPrice
    - HighPrice
    - LowPrice
    - ClosePrice
    - Volume
    - TurnOver
    - VolumeWeightedPrice
  derivatives:
    - OpenPrice
    - HighPrice
    - LowPrice
    - SettlementPrice
    - Volume
    - OpenInterest
    - ImpliedVol
    - Greeks
  bonds:
    - YieldToMaturity
    - Duration
    - Convexity
    - CleanPrice
    - DirtyPrice
    - AccruedInterest
  indices:
    - OpenLevel
    - HighLevel
    - LowLevel
    - CloseLevel
    - Change
    - ChangePercent
    - DividendYield
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data All Classes Blueprint",
  "description": "Comprehensive market data products across all asset classes (equities, derivatives, fixed-income, indices, commodities, currencies). 4 fields. 1 outcomes. 1 err",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, eod, nlmd, all-classes, comprehensive"
}
</script>
