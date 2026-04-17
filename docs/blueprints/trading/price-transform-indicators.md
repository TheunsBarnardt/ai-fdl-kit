---
title: "Price Transform Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Single-bar OHLC price transformation functions that synthesize a representative scalar price from open, high, low, and close without any time-period smoothing. "
---

# Price Transform Indicators Blueprint

> Single-bar OHLC price transformation functions that synthesize a representative scalar price from open, high, low, and close without any time-period smoothing

| | |
|---|---|
| **Feature** | `price-transform-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, price-transform, avgprice, medprice, typprice, wclprice, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/price-transform-indicators.blueprint.yaml) |
| **JSON API** | [price-transform-indicators.json]({{ site.baseurl }}/api/blueprints/trading/price-transform-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `open_prices` | json | No | Open Prices (required for AVGPRICE only) |  |
| `high_prices` | json | Yes | High Prices (chronological double array) |  |
| `low_prices` | json | Yes | Low Prices (chronological double array) |  |
| `close_prices` | json | Yes | Close Prices (chronological double array) |  |
| `indicator_type` | select | Yes | Price transform to compute |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Transformed price output array (double values; same unit as input prices) |  |

## Rules

- **lookback_model:**
  - **lookback:** 0
  - **output_length:** input_length (1-to-1 bar mapping)
- **avgprice:**
  - **formula:** AVGPRICE = (Open + High + Low + Close) / 4
  - **inputs_required:** Open, High, Low, Close
  - **output_unit:** Same price unit as inputs
  - **use_case:** Equal-weight price that considers session direction (Open) as well as range
- **medprice:**
  - **formula:** MEDPRICE = (High + Low) / 2
  - **inputs_required:** High, Low
  - **output_unit:** Same price unit as inputs
  - **use_case:** Midpoint of the day's range; ignores open and close; simpler than typical price
- **typprice:**
  - **formula:** TYPPRICE = (High + Low + Close) / 3
  - **inputs_required:** High, Low, Close
  - **output_unit:** Same price unit as inputs
  - **use_case:** Standard representative price for volume-weighting (CCI, MFI, On Balance Volume variants)
  - **note:** Equal weight to high, low, and close — downplays opening gaps
- **wclprice:**
  - **formula:** WCLPRICE = (High + Low + (Close * 2)) / 4
  - **inputs_required:** High, Low, Close
  - **output_unit:** Same price unit as inputs
  - **use_case:** Close-biased representative price; close receives double weighting relative to high and low
  - **note:** Useful when closing price is considered most significant (e.g., for daily settlement)

## Outcomes

### Missing_open (Priority: 2) — Error: `MISSING_INPUT`

**Given:**
- indicator_type == AVGPRICE
- open_prices is null or empty

**Result:** AVGPRICE requires Open prices; supply the open_prices array

### Mismatched_lengths (Priority: 2) — Error: `INVALID_INPUT`

**Given:**
- open_prices, high_prices, low_prices, close_prices arrays differ in length

**Result:** All supplied OHLC arrays must have the same number of elements

### Compute_success (Priority: 10)

**Given:**
- input_length >= 1
- all required OHLC arrays present and equal length

**Then:**
- **set_field** target: `out_beg_idx` value: `0`
- **set_field** target: `out_nb_element` value: `input_length`
- **set_field** target: `out_values` value: `transformed price values (one per input bar)`
- **emit_event** event: `price_transform.computed`

**Result:** Output array aligned 1-to-1 with input bars; no lookback offset required

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MISSING_INPUT` | 400 | Open prices are required for AVGPRICE. High, Low, Close required for all transforms. | No |
| `INVALID_INPUT` | 400 | Input price arrays must be the same length. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `price_transform.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| volume-flow-indicators | recommended |  |
| moving-average-overlap-studies | recommended |  |
| market-data-feeds | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 4
lookback: 0
output_type: Double Array — same price scale as input
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Price Transform Indicators Blueprint",
  "description": "Single-bar OHLC price transformation functions that synthesize a representative scalar price from open, high, low, and close without any time-period smoothing. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, price-transform, avgprice, medprice, typprice, wclprice, ta-lib, indicators"
}
</script>
