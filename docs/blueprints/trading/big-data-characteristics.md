---
title: "Big Data Characteristics Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Classify and evaluate big data sources by the four V characteristics — volume, velocity, variety, and veracity — and distinguish structured, semi-structured, an"
---

# Big Data Characteristics Blueprint

> Classify and evaluate big data sources by the four V characteristics — volume, velocity, variety, and veracity — and distinguish structured, semi-structured, and unstructured data

| | |
|---|---|
| **Feature** | `big-data-characteristics` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, big-data, fintech, data-characterisation, alternative-data, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/big-data-characteristics.blueprint.yaml) |
| **JSON API** | [big-data-characteristics.json]({{ site.baseurl }}/api/blueprints/trading/big-data-characteristics.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_catalog` | Data Catalog Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `dataset_id` | text | Yes | Unique identifier for the dataset |  |
| `volume_bytes` | number | No | Approximate size in bytes |  |
| `velocity` | select | No | batch \| near_real_time \| streaming |  |
| `variety` | select | No | structured \| semi_structured \| unstructured \| mixed |  |
| `veracity_score` | number | No | Estimated data quality score 0-1 |  |
| `source_category` | select | No | traditional_market \| corporate_filings \| social_media \| satellite \| transactional \| iot_sensors \| other |  |

## Rules

- **four_vs:**
  - **volume:** Massive amount of data — petabyte-scale is common for modern alt data
  - **velocity:** Rate at which data arrive — batch vs near-real-time vs streaming
  - **variety:** Different forms and structures — numeric, text, image, audio, video, geospatial
  - **veracity:** Trustworthiness and quality — completeness, accuracy, timeliness
- **data_types:**
  - **structured:** Rows and columns, fits relational DB — e.g., price tables, financial statements
  - **semi_structured:** Tagged elements but not strict schema — e.g., JSON, XML, HTML
  - **unstructured:** No predefined data model — e.g., news text, earnings calls, satellite images, tweets
- **alternative_data_sources:**
  - **individuals:** Social media posts, online reviews, web searches, mobile app use
  - **business_processes:** Transaction data, point-of-sale, supply-chain logs, credit-card aggregates
  - **sensors:** Satellite imagery, IoT devices, geolocation, traffic cameras
- **evaluation_criteria:**
  - **relevance:** Does the data plausibly predict or explain the investment thesis?
  - **coverage:** Universe of firms/assets covered by the feed
  - **timeliness:** Delay between event and data availability
  - **look_ahead_bias:** Would historical data reflect what was actually knowable at the time?
  - **survivorship_bias:** Does the dataset exclude failed or delisted entities?
  - **quality:** Missing values, outliers, duplicate records
- **applications:**
  - **alpha_generation:** Satellite parking-lot counts to forecast retail revenue
  - **sentiment_analysis:** News/social media sentiment as short-horizon return predictor
  - **supply_chain:** Shipping and logistics data to forecast sales
  - **esg_scoring:** Unstructured text filings mined for ESG disclosures
- **validation:**
  - **valid_variety:** variety in {structured, semi_structured, unstructured, mixed}
  - **valid_velocity:** velocity in {batch, near_real_time, streaming}
  - **veracity_bounded:** 0 <= veracity_score <= 1

## Outcomes

### Catalog_dataset (Priority: 1)

_Register and classify a new data source_

**Given:**
- `dataset_id` (input) exists

**Then:**
- **call_service** target: `data_catalog`
- **emit_event** event: `data.dataset_catalogued`

### Quality_concern (Priority: 5)

_Veracity below threshold_

**Given:**
- `veracity_score` (input) lt `0.5`

**Then:**
- **emit_event** event: `data.quality_warning`

### Invalid_variety (Priority: 10) — Error: `BIGDATA_INVALID_VARIETY`

_Variety not supported_

**Given:**
- `variety` (input) not_in `structured,semi_structured,unstructured,mixed`

**Then:**
- **emit_event** event: `data.catalog_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BIGDATA_INVALID_VARIETY` | 400 | Variety must be structured, semi_structured, unstructured, or mixed | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `data.dataset_catalogued` |  | `dataset_id`, `volume_bytes`, `velocity`, `variety`, `veracity_score` |
| `data.quality_warning` |  | `dataset_id`, `veracity_score`, `warning_message` |
| `data.catalog_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fintech-investment-analysis | recommended |  |
| data-science-processing | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
example_sources:
  structured:
    - Bloomberg price feeds
    - EDGAR XBRL filings
    - CRSP returns database
  semi_structured:
    - SEC 10-K HTML
    - news article JSON feeds
  unstructured:
    - Earnings call transcripts
    - satellite imagery
    - Twitter firehose
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Big Data Characteristics Blueprint",
  "description": "Classify and evaluate big data sources by the four V characteristics — volume, velocity, variety, and veracity — and distinguish structured, semi-structured, an",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, big-data, fintech, data-characterisation, alternative-data, cfa-level-1"
}
</script>
