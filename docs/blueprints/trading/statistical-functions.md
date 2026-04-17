---
title: "Statistical Functions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Linear regression and time-series forecast functions that fit a least-squares line to a rolling price window, extracting slope, intercept, endpoint, and one-bar"
---

# Statistical Functions Blueprint

> Linear regression and time-series forecast functions that fit a least-squares line to a rolling price window, extracting slope, intercept, endpoint, and one-bar-ahead forecast values

| | |
|---|---|
| **Feature** | `statistical-functions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, statistics, linear-regression, time-series-forecast, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/statistical-functions.blueprint.yaml) |
| **JSON API** | [statistical-functions.json]({{ site.baseurl }}/api/blueprints/trading/statistical-functions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `real_prices` | json | Yes | Price series (typically Close; chronological double array) |  |
| `indicator_type` | select | Yes | Statistical function to compute |  |
| `time_period` | number | No | Time Period — rolling window length (default 14; range 2-100000) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Output array (double values; units depend on indicator_type) |  |

## Rules

- **lookback_model:**
  - **lookback:** timePeriod - 1
  - **formula:** valid_output_count = input_length - (timePeriod - 1)
- **linearreg:**
  - **formula:** Least-squares line over the window [i-n+1 .. i]; output is the VALUE of that line at bar i
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_unit:** Same unit as input price
  - **use_case:** Dynamic trend line value; substitute for moving average with better fit to recent data
  - **interpretation:**
    - **above_price:** Price above LINEARREG line indicates upward trend bias
    - **slope_direction:** Direction of line shift indicates momentum
- **linearreg_angle:**
  - **formula:** angle = atan(slope) * (180 / pi) — slope of the regression line converted to degrees
  - **default_period:** 14
  - **output_unit:** Degrees (-90 to +90)
  - **output_range:** -90 to +90
  - **interpretation:**
    - **strong_uptrend:** Angle > 45° — steep upward slope
    - **strong_downtrend:** Angle < -45° — steep downward slope
    - **flat:** Angle near 0° — consolidation or sideways trend
- **linearreg_intercept:**
  - **formula:** y-intercept of least-squares line for window ending at bar i (value at the start of the window)
  - **default_period:** 14
  - **output_unit:** Same unit as input price
  - **use_case:** Rarely used directly; building block for computing slope and regression line
- **linearreg_slope:**
  - **formula:** slope = (n * sum(x*y) - sum(x) * sum(y)) / (n * sum(x^2) - sum(x)^2)  where x = bar index, y = price
  - **default_period:** 14
  - **output_unit:** Price units per bar (e.g., $/bar)
  - **output_range:** Unbounded
  - **interpretation:**
    - **positive:** Positive slope — price trending up over the window
    - **negative:** Negative slope — price trending down
    - **magnitude:** Larger absolute slope = steeper trend
- **tsf:**
  - **formula:** TSF[i] = LINEARREG[i] + LINEARREG_SLOPE[i]  — adds one more step to the endpoint
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_unit:** Same unit as input price
  - **use_case:** One-bar-ahead price forecast based on linear trend; used as a dynamic support/resistance level
  - **note:** TSF leads LINEARREG by exactly one bar in trend direction; not a true predictive model
  - **warning:** TSF assumes price continues on the current linear slope — fails at inflection points

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= timePeriod - 1

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output; provide at least timePeriod bars

### Invalid_period (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- time_period < 2

**Result:** Period must be at least 2 for a meaningful regression line

### Compute_success (Priority: 10)

**Given:**
- input_length > timePeriod - 1
- real_prices present and non-empty
- time_period >= 2

**Then:**
- **set_field** target: `out_beg_idx` value: `timePeriod - 1`
- **set_field** target: `out_nb_element` value: `input_length - (timePeriod - 1)`
- **set_field** target: `out_values` value: `computed regression or forecast values`
- **emit_event** event: `statfunc.computed`

**Result:** Output array aligned to input via outBegIdx; caller must offset by timePeriod-1 bars

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough bars. Provide at least timePeriod data points. | No |
| `INVALID_PARAMETER` | 400 | time_period must be >= 2. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `statfunc.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| moving-average-overlap-studies | recommended |  |
| volatility-band-indicators | recommended |  |
| momentum-oscillators | optional |  |
| market-data-feeds | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 5
output_type: Double Array — same price unit as input (except LINEARREG_ANGLE
  which outputs degrees)
common_lookback_formula: timePeriod - 1 for all five functions
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Statistical Functions Blueprint",
  "description": "Linear regression and time-series forecast functions that fit a least-squares line to a rolling price window, extracting slope, intercept, endpoint, and one-bar",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, statistics, linear-regression, time-series-forecast, ta-lib, indicators"
}
</script>
