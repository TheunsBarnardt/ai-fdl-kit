---
title: "Moving Average Overlap Studies Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on "
---

# Moving Average Overlap Studies Blueprint

> A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on price charts

| | |
|---|---|
| **Feature** | `moving-average-overlap-studies` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, moving-averages, trend, overlap, sma, ema, bollinger, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/moving-average-overlap-studies.blueprint.yaml) |
| **JSON API** | [moving-average-overlap-studies.json]({{ site.baseurl }}/api/blueprints/trading/moving-average-overlap-studies.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `real_prices` | json | Yes | Price series (typically Close; chronological double array) |  |
| `high_prices` | json | No | High Prices (required for ACCBANDS, MIDPRICE) |  |
| `low_prices` | json | No | Low Prices (required for ACCBANDS, MIDPRICE) |  |
| `close_prices` | json | No | Close Prices (required for ACCBANDS when computing middle band) |  |
| `periods` | json | No | Variable period array (required for MAVP — one period value per input bar) |  |
| `indicator_type` | select | Yes | Moving average or overlap study to compute |  |
| `time_period` | number | No | Time Period (default by indicator: SMA/EMA/WMA/TRIMA/KAMA=30, DEMA/TEMA=30, T3=5, MIDPOINT=14, MIDPRICE=14, ACCBANDS=20) |  |
| `ma_type` | select | No | MA Type for generic MA function (SMA=0, EMA=1, WMA=2, DEMA=3, TEMA=4, TRIMA=5, KAMA=6, MAMA=7, T3=8) |  |
| `fast_limit` | number | No | MAMA Fast Limit — upper bound of adaptive alpha (default 0.5; range 0.01-0.99) |  |
| `slow_limit` | number | No | MAMA Slow Limit — lower bound of adaptive alpha (default 0.05; range 0.01-0.99) |  |
| `v_factor` | number | No | T3 Volume Factor — controls smoothness (default 0.7; range 0-1; 0=DEMA-like, 1=EMA) |  |
| `min_period` | number | No | MAVP Minimum Period (default 2; range 2-100000) |  |
| `max_period` | number | No | MAVP Maximum Period (default 30; range 2-100000) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Primary output array (trend/MA values; double array) |  |
| `out_upper_band` | json | No | Upper band (ACCBANDS only) |  |
| `out_middle_band` | json | No | Middle band (ACCBANDS only) |  |
| `out_lower_band` | json | No | Lower band (ACCBANDS only) |  |
| `out_mama` | json | No | MAMA output (MAMA indicator only) |  |
| `out_fama` | json | No | FAMA (Following Adaptive Moving Average) output (MAMA indicator only) |  |

## Rules

- **lookback_model:**
  - **constraint:** If input_length <= lookback, outNBElement = 0
- **sma:**
  - **formula:** SMA[i] = sum(price[i-n+1 .. i]) / n
  - **default_period:** 30
  - **period_range:** 2 to 100000
  - **lookback:** timePeriod - 1
  - **characteristic:** Gives equal weight to all periods; lags more than EMA
- **ema:**
  - **formula:** EMA[i] = price[i] * k + EMA[i-1] * (1 - k)  where k = 2 / (timePeriod + 1)
  - **default_period:** 30
  - **period_range:** 2 to 100000
  - **lookback:** timePeriod - 1 (plus unstable period for numerical stability)
  - **characteristic:** Exponential weighting reduces lag vs SMA; recent prices weighted more heavily
- **dema:**
  - **formula:** DEMA = 2 * EMA(price, n) - EMA(EMA(price, n), n)
  - **default_period:** 30
  - **lookback:** (timePeriod - 1) * 2
  - **characteristic:** Reduces EMA lag by removing trend component; more responsive than EMA
- **tema:**
  - **formula:** TEMA = 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
  - **default_period:** 30
  - **lookback:** (timePeriod - 1) * 3
  - **characteristic:** Further lag reduction vs DEMA; most responsive but noisier
- **wma:**
  - **formula:** WMA[i] = (n*price[i] + (n-1)*price[i-1] + ... + 1*price[i-n+1]) / (n*(n+1)/2)
  - **default_period:** 30
  - **period_range:** 2 to 100000
  - **lookback:** timePeriod - 1
  - **characteristic:** Linearly decreasing weights; more recent data emphasized, less lag than SMA
- **trima:**
  - **formula:** TRIMA = SMA(SMA(price, ceil(n/2)), floor(n/2) + 1) — double-smoothed SMA
  - **default_period:** 30
  - **period_range:** 2 to 100000
  - **characteristic:** Double-smoothed SMA; centermost data weighted most heavily; very smooth but high lag
- **kama:**
  - **formula:** ER = abs(close - close[n-1]) / sum(abs(close[i] - close[i-1]), n); SC = (ER * (fast-slow) + slow)^2; KAMA[i] = KAMA[i-1] + SC * (price - KAMA[i-1])
  - **default_period:** 10
  - **period_range:** 2 to 100000
  - **characteristic:** Adapts speed to market efficiency: fast in trending markets, slow in choppy markets
- **mama:**
  - **formula:** Uses Hilbert Transform cycle measurement to adapt EMA multiplier; FAMA = 0.5 * MAMA + 0.5 * FAMA[i-1]
  - **fast_limit_default:** 0.5
  - **slow_limit_default:** 0.05
  - **limit_range:** 0.01 to 0.99 for both limits
  - **outputs:** 2 arrays: MAMA and FAMA (Following Adaptive Moving Average)
  - **characteristic:** Adapts to dominant market cycle; MAMA/FAMA crossover generates buy/sell signals
- **t3:**
  - **formula:** Applies EMA six times with GD = EMA * (1 + vFactor) - EMA(EMA) * vFactor; T3 = GD(GD(GD))
  - **default_period:** 5
  - **v_factor_default:** 0.7
  - **v_factor_range:** 0 to 1
  - **lookback:** (timePeriod - 1) * 6
  - **characteristic:** Smoother than TEMA with less overshoot; vFactor controls smoothness-responsiveness tradeoff
- **ma_generic:**
  - **default_period:** 30
- **mavp:**
  - **min_period_default:** 2
  - **max_period_default:** 30
  - **characteristic:** Allows cycle-adaptive smoothing; each bar's period is dynamically supplied
- **accbands:**
  - **formula:** UpperBand = SMA(High * (1 + 4 * (High - Low) / (High + Low)), n); LowerBand = SMA(Low * (1 - 4 * (High - Low) / (High + Low)), n); MiddleBand = SMA(Close, n)
  - **default_period:** 20
  - **period_range:** 2 to 100000
  - **outputs:** 3 arrays: upper, middle, lower bands
  - **characteristic:** Bands expand during high volatility; price outside bands signals acceleration
- **midpoint:**
  - **formula:** MIDPOINT[i] = (max(price[i-n+1..i]) + min(price[i-n+1..i])) / 2
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **input:** Single price series (typically Close)
- **midprice:**
  - **formula:** MIDPRICE[i] = (max(High[i-n+1..i]) + min(Low[i-n+1..i])) / 2
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **inputs_required:** High, Low
- **ht_trendline:**
  - **lookback:** 63
  - **characteristic:** Zero-lag trend extraction; best in trending markets; noisy in ranging markets

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output produced; caller must buffer more bars

### Invalid_parameters (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- ANY: time_period < 2 OR fast_limit > slow_limit and indicator_type == MAMA OR v_factor < 0 or v_factor > 1 and indicator_type == T3 OR min_period > max_period and indicator_type == MAVP

**Result:** Function returns error; caller must supply valid parameter ranges

### Compute_success (Priority: 10)

**Given:**
- input_length > lookback_period for selected indicator
- required price arrays present
- parameters within valid ranges

**Then:**
- **set_field** target: `out_beg_idx` value: `first input index corresponding to out[0]`
- **set_field** target: `out_nb_element` value: `input_length - lookback_period`
- **set_field** target: `out_values` value: `smoothed price series`
- **emit_event** event: `indicator.computed`

**Result:** Smoothed trend series aligned to input via outBegIdx

### Accbands_computed (Priority: 10)

**Given:**
- indicator_type == ACCBANDS
- input_length > lookback_period

**Then:**
- **set_field** target: `out_upper_band` value: `upper band values`
- **set_field** target: `out_middle_band` value: `middle band values (SMA of Close)`
- **set_field** target: `out_lower_band` value: `lower band values`

**Result:** Three overlaid bands on price chart; breakout above upper signals acceleration

### Mama_computed (Priority: 10)

**Given:**
- indicator_type == MAMA
- input_length > 32 (MAMA lookback ~32)

**Then:**
- **set_field** target: `out_mama` value: `MAMA line values`
- **set_field** target: `out_fama` value: `FAMA line values`

**Result:** Two adaptive trend lines; MAMA/FAMA crossover signals trend change

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough historical bars. Provide at least lookback + 1 data points. | No |
| `INVALID_PARAMETER` | 400 | A parameter is outside its valid range (e.g., period < 2, MAMA fast_limit > slow_limit). | No |
| `MISSING_INPUT` | 400 | High or Low price array missing for ACCBANDS or MIDPRICE. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `indicator.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `indicator.crossover` |  | `indicator_type`, `direction`, `value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | required |  |
| volatility-band-indicators | recommended |  |
| directional-movement-indicators | recommended |  |
| market-data-feeds | required |  |

## AGI Readiness

### Goals

#### Reliable Moving Average Overlap Studies

A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on price charts

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
| `momentum_oscillators` | momentum-oscillators | fail |
| `market_data_feeds` | market-data-feeds | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_success | `autonomous` | - | - |
| accbands_computed | `autonomous` | - | - |
| mama_computed | `autonomous` | - | - |
| insufficient_data | `autonomous` | - | - |
| invalid_parameters | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 15
ma_type_enum:
  SMA: 0
  EMA: 1
  WMA: 2
  DEMA: 3
  TEMA: 4
  TRIMA: 5
  KAMA: 6
  MAMA: 7
  T3: 8
unstable_period:
  control: TA_SetUnstablePeriod(TA_FUNC_UNST_EMA, n) — default 0; increase for
    production systems
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Moving Average Overlap Studies Blueprint",
  "description": "A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, moving-averages, trend, overlap, sma, ema, bollinger, ta-lib, indicators"
}
</script>
