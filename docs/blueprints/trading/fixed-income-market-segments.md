---
title: "Fixed Income Market Segments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Map fixed-income market segments — sovereign, supranational, agency, corporate IG/HY, municipal, structured, emerging market — by currency, maturity, and credit"
---

# Fixed Income Market Segments Blueprint

> Map fixed-income market segments — sovereign, supranational, agency, corporate IG/HY, municipal, structured, emerging market — by currency, maturity, and credit characteristics

| | |
|---|---|
| **Feature** | `fixed-income-market-segments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, market-segments, sovereign-bonds, corporate-bonds, high-yield, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-market-segments.blueprint.yaml) |
| **JSON API** | [fixed-income-market-segments.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-market-segments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fi_segment` | Fixed-Income Segment Classifier | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `security_id` | text | Yes | Security identifier |  |
| `segment` | select | Yes | sovereign \| supranational \| agency \| corporate_ig \| corporate_hy \| municipal \| structured \| emerging |  |
| `currency` | text | No | ISO currency code |  |
| `rating_band` | select | No | AAA \| AA \| A \| BBB \| BB \| B \| CCC_or_below |  |

## Rules

- **sovereign:**
  - **local_currency:** Treasuries, gilts, JGBs — default risk very low for reserve currencies
  - **foreign_currency:** Emerging sovereigns; higher default risk
- **supranational:**
  - **examples:** World Bank, EIB, Asian Development Bank
  - **characteristics:** High credit quality; global investor base
- **agency:**
  - **examples:** Fannie Mae, Freddie Mac, Ginnie Mae
  - **implicit_explicit:** Some carry explicit government guarantee
- **corporate:**
  - **investment_grade:** BBB-/Baa3 or higher
  - **high_yield:** BB+/Ba1 or lower — speculative grade
- **municipal:**
  - **general_obligation:** Backed by taxing power
  - **revenue:** Backed by project cash flows
  - **tax_advantage:** US muni interest often federal tax-exempt
- **structured:**
  - **abs:** Backed by receivables
  - **mbs:** Backed by mortgages
  - **cdo:** Backed by pool of bonds/loans with tranches
- **emerging_market:**
  - **hard_currency:** USD/EUR denominated; sovereign or corporate
  - **local_currency:** Issuer local — currency and rate risk
- **tenors:**
  - **money_market:** Less than 1 year
  - **short_term:** 1-5 years
  - **medium_term:** 5-12 years
  - **long_term:** 12+ years
- **validation:**
  - **security_required:** security_id present
  - **valid_segment:** segment in allowed set

## Outcomes

### Classify_segment (Priority: 1)

_Classify a fixed-income security by segment and tenor_

**Given:**
- `security_id` (input) exists
- `segment` (input) in `sovereign,supranational,agency,corporate_ig,corporate_hy,municipal,structured,emerging`

**Then:**
- **call_service** target: `fi_segment`
- **emit_event** event: `fi_segment.classified`

### Invalid_segment (Priority: 10) — Error: `FI_SEG_INVALID`

_Unsupported segment_

**Given:**
- `segment` (input) not_in `sovereign,supranational,agency,corporate_ig,corporate_hy,municipal,structured,emerging`

**Then:**
- **emit_event** event: `fi_segment.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FI_SEG_INVALID` | 400 | segment must be one of the supported fixed-income segments | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fi_segment.classified` |  | `classification_id`, `security_id`, `segment`, `currency`, `rating_band` |
| `fi_segment.rejected` |  | `classification_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-issuance-trading | recommended |  |
| fixed-income-credit-analysis | recommended |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Market Segments Blueprint",
  "description": "Map fixed-income market segments — sovereign, supranational, agency, corporate IG/HY, municipal, structured, emerging market — by currency, maturity, and credit",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, market-segments, sovereign-bonds, corporate-bonds, high-yield, cfa-level-1"
}
</script>
