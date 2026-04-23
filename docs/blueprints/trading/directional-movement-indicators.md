---
title: "Directional Movement Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels"
---

# Directional Movement Indicators Blueprint

> A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels via Parabolic SAR

| | |
|---|---|
| **Feature** | `directional-movement-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, directional-movement, adx, aroon, parabolic-sar, trend-strength, ta-lib |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/directional-movement-indicators.blueprint.yaml) |
| **JSON API** | [directional-movement-indicators.json]({{ site.baseurl }}/api/blueprints/trading/directional-movement-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `high_prices` | json | Yes | High Prices (chronological double array) |  |
| `low_prices` | json | Yes | Low Prices (chronological double array) |  |
| `close_prices` | json | No | Close Prices (required for ADX, ADXR, DX, PLUS_DI, MINUS_DI) |  |
| `indicator_type` | select | Yes | Indicator to compute |  |
| `time_period` | number | No | Time Period (default 14 for ADX/ADXR/DX/DI/DM/AROON; range 2-100000) |  |
| `acceleration` | number | No | SAR Acceleration Factor initial value (default 0.02; range 0-TA_REAL_MAX; typically ≤ 0.20) |  |
| `maximum` | number | No | SAR Maximum Acceleration Factor (default 0.20; range 0-TA_REAL_MAX) |  |
| `start_value` | number | No | SAREXT Initial SAR value (0 = auto-detect; default 0) |  |
| `offset_on_reverse` | number | No | SAREXT Percentage offset applied to SAR on trend reversal (default 0) |  |
| `acceleration_init_long` | number | No | SAREXT Acceleration Factor initial value for long positions (default 0.02) |  |
| `acceleration_long` | number | No | SAREXT Acceleration Factor increment for long (default 0.02) |  |
| `acceleration_max_long` | number | No | SAREXT Maximum Acceleration Factor for long (default 0.20) |  |
| `acceleration_init_short` | number | No | SAREXT Acceleration Factor initial value for short (default 0.02) |  |
| `acceleration_short` | number | No | SAREXT Acceleration Factor increment for short (default 0.02) |  |
| `acceleration_max_short` | number | No | SAREXT Maximum Acceleration Factor for short (default 0.20) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Primary output (ADX, DX, PLUS_DI, MINUS_DI, PLUS_DM, MINUS_DM, AROONOSC, SAR values) |  |
| `out_aroon_down` | json | No | AROON Down line values (0-100) |  |
| `out_aroon_up` | json | No | AROON Up line values (0-100) |  |

## Rules

- **directional_movement_system:**
  - **plus_dm:** +DM = UpMove > DownMove and UpMove > 0 ? UpMove : 0  where UpMove = High - PrevHigh
  - **minus_dm:** -DM = DownMove > UpMove and DownMove > 0 ? DownMove : 0  where DownMove = PrevLow - Low
  - **true_range:** TR = max(High - Low, abs(High - PrevClose), abs(Low - PrevClose))
  - **smoothed:** +DI = Wilder_EMA(+DM, n) / Wilder_EMA(TR, n) * 100
  - **dx:** DX = abs(+DI - -DI) / (+DI + -DI) * 100
  - **adx:** ADX = Wilder_EMA(DX, n) — smoothed directional index
  - **adxr:** ADXR = (ADX[today] + ADX[today - n]) / 2 — ADX Rating (further smoothed)
  - **period_range:** 2 to 100000; default 14
  - **lookback:**
    - **dx:** 2 * timePeriod - 1
    - **adx:** 3 * timePeriod - 2 (plus unstable period)
    - **adxr:** 3 * timePeriod - 1
  - **interpretation:**
    - **strong_trend:** ADX > 25 indicates a strong trend in either direction
    - **very_strong:** ADX > 50 indicates a very strong trend
    - **no_trend:** ADX < 20 indicates a ranging/sideways market
    - **trend_direction:** +DI > -DI → uptrend; -DI > +DI → downtrend
    - **di_crossover:** Wilder's crossover rule: buy when +DI crosses above -DI while ADX > 25
  - **note:** ADX does NOT indicate trend direction — only strength. Use +DI/-DI comparison for direction.
- **aroon:**
  - **aroon_up:** ((timePeriod - periodsFromHigh) / timePeriod) * 100
  - **aroon_down:** ((timePeriod - periodsFromLow) / timePeriod) * 100
  - **aroonosc:** AroonUp - AroonDown
  - **inputs_required:** High, Low
  - **period_range:** 2 to 100000; default 14
  - **output_aroon:** 0 to 100 (for each line)
  - **output_aroonosc:** -100 to +100
  - **lookback:** timePeriod
  - **interpretation:**
    - **strong_uptrend:** AroonUp > 70 and AroonDown < 30
    - **strong_downtrend:** AroonDown > 70 and AroonUp < 30
    - **consolidation:** Both lines near 50
    - **bullish_signal:** AroonUp crosses above AroonDown
    - **bearish_signal:** AroonDown crosses above AroonUp
- **parabolic_sar:**
  - **formula:**
    - **rising:** SAR[i] = SAR[i-1] + AF * (EP - SAR[i-1])  where EP = highest high since entry, AF = acceleration factor
    - **falling:** SAR[i] = SAR[i-1] + AF * (EP - SAR[i-1])  where EP = lowest low since entry
  - **acceleration_default:** 0.02
  - **acceleration_increment:** Increases by initial acceleration value (0.02) each time new EP is set
  - **maximum_default:** 0.2
  - **maximum_range:** 0 to TA_REAL_MAX; exceeding maximum caps AF
  - **inputs_required:** High, Low
  - **lookback:** 1
  - **output:** SAR stop-and-reverse level for each bar (same price unit as input)
  - **reversal_rule:** When price crosses SAR, trend reverses and SAR flips to opposite side
  - **two_bar_rule:** SAR cannot be inside or beyond the two prior bars' price range (moves if needed)
  - **trade_signal:**
    - **long_exit:** Close falls below SAR → exit long / enter short
    - **short_exit:** Close rises above SAR → exit short / enter long
- **sarext:**
  - **additional_params:**
    - **start_value:** Initial SAR position (0 = auto-detect from first two bars)
    - **offset_on_reverse:** Percentage offset applied to price when trend reverses (smooths whipsaws)
    - **per_side_acceleration:** Independent acceleration init/increment/max for long vs short
  - **use_case:** Asymmetric volatility regimes where uptrend and downtrend have different momentum characteristics

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output; ADX especially requires 3×period bars — buffer accordingly

### Invalid_parameters (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- ANY: time_period < 2 OR acceleration < 0 and indicator_type in [SAR, SAREXT] OR acceleration > maximum and indicator_type == SAR

**Result:** Function returns error; validate before calling

### Compute_success (Priority: 10)

**Given:**
- input_length > lookback_period for selected indicator
- all required price arrays present
- parameters within valid ranges

**Then:**
- **set_field** target: `out_beg_idx` value: `first input index mapped to out[0]`
- **set_field** target: `out_nb_element` value: `input_length - lookback_period`
- **set_field** target: `out_values` value: `computed directional values`
- **emit_event** event: `indicator.computed`

**Result:** Directional series aligned to input via outBegIdx

### Aroon_computed (Priority: 10)

**Given:**
- indicator_type == AROON
- input_length > timePeriod

**Then:**
- **set_field** target: `out_aroon_down` value: `AroonDown values (0-100)`
- **set_field** target: `out_aroon_up` value: `AroonUp values (0-100)`

**Result:** Two arrays representing days-since-high and days-since-low as normalized percentages

### Sar_reversal (Priority: 10)

**Given:**
- indicator_type in [SAR, SAREXT]
- out_values[latest] crossed by close_price

**Then:**
- **emit_event** event: `indicator.sar_reversal`

**Result:** SAR flips to opposite side of price; emit trade signal for stop-and-reverse

### Strong_trend_detected (Priority: 10)

**Given:**
- indicator_type == ADX
- out_values[latest] > 25

**Then:**
- **emit_event** event: `indicator.trend_strength`

**Result:** Strong trend confirmed; momentum and trend-following signals are more reliable

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough historical bars. ADX requires approximately 3×period bars; AROON requires period+1. | No |
| `INVALID_PARAMETER` | 400 | A parameter is out of range (period < 2, SAR acceleration > maximum, etc.). | No |
| `MISSING_INPUT` | 400 | Close price array required for ADX, DX, +DI, -DI but not provided. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `indicator.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `indicator.sar_reversal` |  | `sar_value`, `close_price`, `direction` |
| `indicator.trend_strength` |  | `adx_value`, `threshold`, `di_plus`, `di_minus` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| volatility-band-indicators | recommended |  |
| moving-average-overlap-studies | recommended |  |
| market-data-feeds | required |  |

## AGI Readiness

### Goals

#### Reliable Directional Movement Indicators

A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels via Parabolic SAR

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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `market_data_feeds` | market-data-feeds | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_success | `autonomous` | - | - |
| aroon_computed | `autonomous` | - | - |
| sar_reversal | `autonomous` | - | - |
| strong_trend_detected | `autonomous` | - | - |
| insufficient_data | `autonomous` | - | - |
| invalid_parameters | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 11
wilder_smoothing_note: All DM system components use Wilder smoothing (EMA with
  alpha=1/n) — different from standard EMA (alpha=2/(n+1))
adx_lookback_table:
  period_14: lookback ≈ 40 bars
  period_20: lookback ≈ 58 bars
  period_7: lookback ≈ 19 bars
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Directional Movement Indicators Blueprint",
  "description": "A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, directional-movement, adx, aroon, parabolic-sar, trend-strength, ta-lib"
}
</script>
