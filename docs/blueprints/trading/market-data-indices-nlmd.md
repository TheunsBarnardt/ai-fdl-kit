---
title: "Market Data Indices Nlmd Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Non-live market data products for all index families (equity, sector, style, thematic, factor, fixed-income, multi-asset). 5 fields. 1 outcomes. 1 error codes. "
---

# Market Data Indices Nlmd Blueprint

> Non-live market data products for all index families (equity, sector, style, thematic, factor, fixed-income, multi-asset)

| | |
|---|---|
| **Feature** | `market-data-indices-nlmd` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | market-data, indices, nlmd, non-live, end-of-day, reference-data |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-data-indices-nlmd.blueprint.yaml) |
| **JSON API** | [market-data-indices-nlmd.json]({{ site.baseurl }}/api/blueprints/trading/market-data-indices-nlmd.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `index_code` | text | Yes | Index Code |  |
| `index_family` | select | Yes | Index Family |  |
| `data_type` | select | Yes | Data Type (Price, Return, Volatility, Earnings, NAV) |  |
| `distribution_date` | date | Yes | Distribution Date |  |
| `record_count` | number | No | Number of Data Records |  |

## Rules

- **data_delivery:**
  - **eod_publication:** Index data published end-of-day after market close
  - **file_format:** Delivered in fixed-width or delimited text format
  - **content_inclusion:** Includes opening, high, low, close, volume, and technical indicators

## Outcomes

### Publish_nlmd_index_data (Priority: 1)

_Publish non-live index market data file_

**Given:**
- `index_code` (input) exists

**Then:**
- **emit_event** event: `nlmd.published`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `NLMD_PUBLISH_FAILED` | 500 | Failed to publish index NLMD data | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `nlmd.published` |  | `index_code`, `publication_date`, `file_size` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| index-data-feeds | extends |  |
| reference-data-management | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
index_families:
  - family: Headline
    indices:
      - ALSI
      - TOP40
      - FINI
      - RAFI
  - family: African
    indices:
      - AllAfrica40USD
      - AllAfrica40ZAR
      - AllAfricaExSA30USD
      - AllAfricaExSA30ZAR
  - family: Capped
    indices:
      - CappedAllShare
      - CappedAllShareNetTRI
      - CappedIndustrial25
      - CappedSHARIATop40
      - CappedTop40
      - CappedTop40NetTRI
  - family: Core
    indices:
      - Core
      - CoreNetTRI
  - family: Factor
    indices:
      - DividendYield
      - LowVolatility
      - Quality
      - Momentum
      - Value
  - family: Style
    indices:
      - Growth
      - Value
  - family: Thematic
    indices:
      - GlobalInvestor
      - ResponsibleInvestment
      - SHARIAH
  - family: Sector
    indices:
      - Financial
      - Industrial
      - Resource
  - family: FixedIncome
    indices:
      - FTSEJSEFixedIncome
      - BondETP
      - BondMarketData
  - family: MultiAsset
    indices:
      - FTSEJSEMultiAsset
  - family: Technical
    indices:
      - EarningsYield
      - ValueAdded
      - IntraDaySnapshots
data_products:
  - product: Price
    description: Closing price and price changes
  - product: Return
    description: Total return including reinvested dividends
  - product: Volatility
    description: Historical volatility measures
  - product: Earnings
    description: Earnings yields and multiples
  - product: NAV
    description: Net asset value for index-linked funds
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Data Indices Nlmd Blueprint",
  "description": "Non-live market data products for all index families (equity, sector, style, thematic, factor, fixed-income, multi-asset). 5 fields. 1 outcomes. 1 error codes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "market-data, indices, nlmd, non-live, end-of-day, reference-data"
}
</script>
