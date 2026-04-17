---
title: "Momentum Oscillators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "A suite of momentum oscillators for identifying overbought/oversold conditions, trend reversal signals, and price momentum strength across financial time series"
---

# Momentum Oscillators Blueprint

> A suite of momentum oscillators for identifying overbought/oversold conditions, trend reversal signals, and price momentum strength across financial time series data

| | |
|---|---|
| **Feature** | `momentum-oscillators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, momentum, oscillators, rsi, macd, stochastic, cci, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/momentum-oscillators.blueprint.yaml) |
| **JSON API** | [momentum-oscillators.json]({{ site.baseurl }}/api/blueprints/trading/momentum-oscillators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `close_prices` | json | Yes | Close Prices (chronological double array; minimum length = lookback + 1) |  |
| `high_prices` | json | No | High Prices (required for CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI) |  |
| `low_prices` | json | No | Low Prices (required for CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI) |  |
| `open_prices` | json | No | Open Prices (required for BOP only) |  |
| `volume` | json | No | Volume series (required for MFI only) |  |
| `indicator_type` | select | Yes | Oscillator to compute |  |
| `time_period` | number | No | Time Period (default by indicator: RSI=14, CCI=14, WILLR=14, MOM=10, CMO=14, MFI=14, STOCHRSI=14; range 2-100000) |  |
| `fast_period` | number | No | Fast MA Period (default 12; range 2-100000) |  |
| `slow_period` | number | No | Slow MA Period (default 26; range 2-100000) |  |
| `signal_period` | number | No | Signal Line Smoothing Period (default 9; range 1-100000) |  |
| `ma_type` | select | No | Moving Average Type (SMA=0, EMA=1, WMA=2, DEMA=3, TEMA=4, TRIMA=5, KAMA=6, MAMA=7, T3=8; default SMA for APO/PPO) |  |
| `fast_k_period` | number | No | Fast %K Lookback Period (default 5; range 1-100000) |  |
| `slow_k_period` | number | No | Slow %K Smoothing Period (default 3; range 1-100000 — usually 3) |  |
| `slow_k_ma_type` | select | No | Slow %K MA Type (default SMA) |  |
| `slow_d_period` | number | No | Slow %D Smoothing Period (default 3; range 1-100000) |  |
| `slow_d_ma_type` | select | No | Slow %D MA Type (default SMA) |  |
| `fast_d_period` | number | No | StochRSI Fast %D Smoothing Period (default 3) |  |
| `fast_d_ma_type` | select | No | StochRSI Fast %D MA Type (default SMA) |  |
| `period1` | number | No | Ultimate Oscillator Period 1 (default 7; range 1-100000) |  |
| `period2` | number | No | Ultimate Oscillator Period 2 (default 14; range 2-100000) |  |
| `period3` | number | No | Ultimate Oscillator Period 3 (default 28; range 2-100000) |  |
| `out_beg_idx` | number | No | Output Begin Index (first index in input that corresponds to first output value) |  |
| `out_nb_element` | number | No | Number of output elements produced |  |
| `out_values` | json | No | Primary output array (indicator values; double array) |  |
| `out_signal` | json | No | Secondary output (MACD signal line, STOCH slowD, STOCHRSI fastD, AROON down line) |  |
| `out_hist` | json | No | Tertiary output (MACD histogram, AROON up line) |  |

## Rules

- **lookback_model:**
  - **formula:** valid_output_count = input_length - lookback_period
  - **constraint:** If input_length <= lookback_period, outNBElement = 0 (no valid output)
- **rsi:**
  - **formula:** RS = avgGain / avgLoss (Wilder smoothing); RSI = 100 - 100 / (1 + RS)
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_range:** 0 to 100
  - **lookback:** timePeriod + unstable_period (configurable via TA_SetUnstablePeriod)
  - **interpretation:**
    - **overbought:** > 70 (conventional threshold)
    - **oversold:** < 30 (conventional threshold)
  - **edge_case:** When avgLoss = 0, RSI = 100 (no losing periods)
- **macd:**
  - **formula:** MACD_line = EMA(close, fast) - EMA(close, slow); Signal = EMA(MACD_line, signal); Histogram = MACD_line - Signal
  - **defaults:** fast=12, slow=26, signal=9
  - **period_range:** fast/slow 2-100000; signal 1-100000
  - **outputs:** 3 arrays: macd_line, signal_line, histogram
  - **swap_rule:** If slow < fast, periods are automatically swapped to ensure slow >= fast
  - **macdfix:** MACDFIX hardcodes fast=12 slow=26; only signal period is configurable
  - **macdext:** MACDEXT allows custom MA types for fast, slow, and signal lines
  - **interpretation:**
    - **bullish_crossover:** MACD line crosses above signal line
    - **bearish_crossover:** MACD line crosses below signal line
    - **zero_cross:** MACD line crossing zero confirms trend direction
- **stochastic:**
  - **stoch_formula:** RawK = (Close - LowestLow(fastK)) / (HighestHigh(fastK) - LowestLow(fastK)) * 100; SlowK = MA(RawK, slowK); SlowD = MA(SlowK, slowD)
  - **stochf_formula:** FastK = RawK; FastD = MA(FastK, fastD)
  - **stochrsi_formula:** RSI_val computed first; StochRSI = (RSI - lowestRSI) / (highestRSI - lowestRSI)
  - **defaults:** fastK=5, slowK=3, slowD=3, MA type=SMA
  - **output_range:** 0 to 100
  - **interpretation:**
    - **overbought:** > 80
    - **oversold:** < 20
    - **signal:** K line crossing D line
  - **edge_case:** When highestHigh - lowestLow = 0, output is 0 (no range)
- **cci:**
  - **formula:** TypPrice = (High + Low + Close) / 3; CCI = (TypPrice - SMA(TypPrice, n)) / (0.015 * MeanDeviation(TypPrice, n))
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_range:** unbounded (typically -300 to +300)
  - **interpretation:**
    - **overbought:** > +100
    - **oversold:** < -100
  - **constant:** 0.015 ensures ~70-80% of values fall within ±100
- **williams_r:**
  - **formula:** WILLR = (HighestHigh(n) - Close) / (HighestHigh(n) - LowestLow(n)) * -100
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_range:** -100 to 0
  - **interpretation:**
    - **overbought:** > -20 (near 0)
    - **oversold:** < -80 (near -100)
  - **note:** Inverse of Fast Stochastic %K — multiply by -1 for equivalent
- **momentum_mom:**
  - **formula:** MOM = Close[i] - Close[i - n]
  - **default_period:** 10
  - **period_range:** 1 to 100000
  - **output_range:** unbounded (raw price difference)
  - **note:** No normalization — magnitude is price-unit dependent
- **cmo:**
  - **formula:** CMO = (SumUp - SumDown) / (SumUp + SumDown) * 100
  - **default_period:** 14
  - **output_range:** -100 to +100
  - **interpretation:**
    - **strong_uptrend:** > +50
    - **strong_downtrend:** < -50
- **bop:**
  - **formula:** BOP = (Close - Open) / (High - Low)
  - **inputs_required:** Open, High, Low, Close
  - **output_range:** -1 to +1
  - **edge_case:** When High == Low, output = 0 (no candle range)
- **apo_ppo:**
  - **apo_formula:** APO = MA(close, fast) - MA(close, slow)
  - **ppo_formula:** PPO = (MA(close, fast) - MA(close, slow)) / MA(close, slow) * 100
  - **defaults:** fast=12, slow=26, MA type=SMA
  - **ppo_advantage:** PPO is normalized as percentage, comparable across different price levels
- **ultosc:**
  - **formula:** BuyingPressure = Close - min(Low, PrevClose); TrueRange = max(High, PrevClose) - min(Low, PrevClose); BP1/TR1 averaged over period1, BP2/TR2 over period2, BP3/TR3 over period3; UltOsc = 100 * (4*avg1 + 2*avg2 + avg3) / 7
  - **defaults:** period1=7, period2=14, period3=28
  - **output_range:** 0 to 100
  - **interpretation:**
    - **overbought:** > 70
    - **oversold:** < 30
- **mfi:**
  - **formula:** TypicalPrice = (High + Low + Close) / 3; RawMoneyFlow = TP * Volume; PositiveMF if TP > PrevTP else NegativeMF; MFI = 100 - 100 / (1 + PosMF/NegMF)
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **output_range:** 0 to 100
  - **inputs_required:** High, Low, Close, Volume
  - **interpretation:**
    - **overbought:** > 80
    - **oversold:** < 20
- **roc:**
  - **roc_formula:** ROC = ((Close[i] - Close[i-n]) / Close[i-n]) * 100  — percentage rate of change
  - **rocp_formula:** ROCP = (Close[i] - Close[i-n]) / Close[i-n]  — decimal fraction (no ×100)
  - **rocr_formula:** ROCR = Close[i] / Close[i-n]  — ratio (1.0 = no change)
  - **rocr100_formula:** ROCR100 = ROCR * 100  — ratio expressed as percentage of prior price
  - **period_range:** 1 to 100000; default 10
  - **lookback:** timePeriod (one bar consumed per period)
  - **output_range:**
    - **roc:** unbounded (percentage; 0 = no change)
    - **rocp:** unbounded (fraction; 0.0 = no change)
    - **rocr:** unbounded (ratio; 1.0 = no change)
    - **rocr100:** unbounded (ratio ×100; 100 = no change)
  - **note:** All four measure the same concept at different scales — choose based on downstream normalization needs
- **trix:**
  - **formula:** EMA1 = EMA(Close, n); EMA2 = EMA(EMA1, n); EMA3 = EMA(EMA2, n); TRIX = 1-period ROC of EMA3 × 100
  - **default_period:** 30
  - **period_range:** 1 to 100000
  - **lookback:** (timePeriod - 1) * 3 + 1 (three EMA passes plus one ROC bar)
  - **output_range:** unbounded (typically small percentage values near zero)
  - **interpretation:**
    - **bullish:** TRIX > 0 and rising — upward momentum in triple-smoothed trend
    - **bearish:** TRIX < 0 and falling — downward momentum
    - **signal_crossover:** TRIX crossing 9-bar signal line (user-computed) generates buy/sell
  - **advantage:** Triple smoothing eliminates most noise; TRIX only responds to genuine multi-bar trend shifts
- **aroon:**
  - **aroon_up_formula:** ((period - periodsFromHigh) / period) * 100
  - **aroon_down_formula:** ((period - periodsFromLow) / period) * 100
  - **aroonosc_formula:** AroonUp - AroonDown
  - **default_period:** 14
  - **output_range:** 0 to 100 (AROON); -100 to +100 (AROONOSC)
  - **inputs_required:** High, Low
  - **outputs:** 2 arrays for AROON (AroonDown, AroonUp); 1 array for AROONOSC

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period for selected indicator

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** outNBElement = 0; caller must provide more bars before meaningful output is available

### Invalid_parameters (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- ANY: time_period < 2 and indicator_type in [RSI, CCI, WILLR, CMO, MFI, STOCH] OR fast_period < 2 and indicator_type in [MACD, APO, PPO] OR slow_period < fast_period and indicator_type == MACD OR period1 < 1 or period2 < 2 or period3 < 2 and indicator_type == ULTOSC

**Result:** Function returns error code; caller must validate parameters before calling

### Missing_required_inputs (Priority: 2) — Error: `MISSING_INPUT`

**Given:**
- ANY: high_prices is null and indicator_type in [CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI, AROON, AROONOSC] OR volume is null and indicator_type == MFI OR open_prices is null and indicator_type == BOP

**Result:** Invalid output; ensure all required price arrays are supplied

### Range_clamp_edge (Priority: 3)

**Given:**
- ANY: High == Low for all bars in period and indicator_type in [WILLR, STOCH, BOP] OR SumUp + SumDown == 0 and indicator_type == CMO OR PosMF + NegMF == 0 and indicator_type == MFI

**Then:**
- **set_field** target: `out_values` value: `0 (BOP/WILLR) or boundary value per indicator spec`

**Result:** Output clamped to boundary — indicates flat market with no price movement

### Compute_success (Priority: 10)

**Given:**
- input_length > lookback_period for selected indicator
- all required price arrays present and of equal length
- all optional parameters within valid ranges

**Then:**
- **set_field** target: `out_beg_idx` value: `first input index that maps to out[0]`
- **set_field** target: `out_nb_element` value: `input_length - lookback_period`
- **set_field** target: `out_values` value: `computed indicator values array`
- **emit_event** event: `indicator.computed`

**Result:** out_values contains valid oscillator readings; caller aligns output to input using outBegIdx

### Macd_computed (Priority: 10)

**Given:**
- indicator_type in [MACD, MACDEXT, MACDFIX]
- input_length > lookback_period

**Then:**
- **set_field** target: `out_values` value: `MACD line values`
- **set_field** target: `out_signal` value: `Signal line values`
- **set_field** target: `out_hist` value: `Histogram values (MACD - Signal)`
- **emit_event** event: `indicator.computed`

**Result:** Three aligned output arrays; histogram crossing zero indicates signal crossover

### Aroon_computed (Priority: 10)

**Given:**
- indicator_type == AROON
- input_length > lookback_period

**Then:**
- **set_field** target: `out_signal` value: `AroonDown values (0-100)`
- **set_field** target: `out_hist` value: `AroonUp values (0-100)`

**Result:** Two arrays: AroonDown and AroonUp, both in range [0,100]

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough historical bars to compute indicator. Provide at least lookback + 1 data points. | No |
| `INVALID_PARAMETER` | 400 | One or more parameters are outside their valid range. Check period constraints. | No |
| `MISSING_INPUT` | 400 | Required price series (High, Low, Volume, Open) not provided for the selected indicator. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `indicator.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `indicator.overbought` |  | `indicator_type`, `value`, `threshold` |
| `indicator.oversold` |  | `indicator_type`, `value`, `threshold` |
| `indicator.crossover` |  | `indicator_type`, `direction`, `value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| moving-average-overlap-studies | required |  |
| volatility-band-indicators | recommended |  |
| directional-movement-indicators | recommended |  |
| volume-flow-indicators | recommended |  |
| candlestick-pattern-recognition | optional |  |
| market-data-feeds | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET (Managed C++), Rust, Python (via ta-lib wrapper)
  build_system: Autoconf / CMake
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 23
output_type: All outputs are double-precision floating-point arrays
unstable_period:
  control: TA_SetUnstablePeriod(TA_FUNC_UNST_RSI, n) — default 0
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
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Momentum Oscillators Blueprint",
  "description": "A suite of momentum oscillators for identifying overbought/oversold conditions, trend reversal signals, and price momentum strength across financial time series",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, momentum, oscillators, rsi, macd, stochastic, cci, ta-lib, indicators"
}
</script>
