---
title: "Volatility Band Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "A suite of volatility measurement and price band indicators for quantifying market risk, setting dynamic stop levels, and identifying breakout conditions across"
---

# Volatility Band Indicators Blueprint

> A suite of volatility measurement and price band indicators for quantifying market risk, setting dynamic stop levels, and identifying breakout conditions across financial time series

| | |
|---|---|
| **Feature** | `volatility-band-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, volatility, atr, bollinger-bands, stddev, risk, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/volatility-band-indicators.blueprint.yaml) |
| **JSON API** | [volatility-band-indicators.json]({{ site.baseurl }}/api/blueprints/trading/volatility-band-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `risk_engine` | Risk Management Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `real_prices` | json | No | Price series — typically Close (required for BBANDS, STDDEV, VAR, AVGDEV) |  |
| `high_prices` | json | No | High Prices (required for ATR, NATR, TRANGE, BETA-like range studies) |  |
| `low_prices` | json | No | Low Prices (required for ATR, NATR, TRANGE) |  |
| `close_prices` | json | No | Close Prices (required for ATR, NATR, TRANGE — previous close for True Range) |  |
| `real0` | json | No | First price series for BETA / CORREL (e.g., asset returns) |  |
| `real1` | json | No | Second price series for BETA / CORREL (e.g., benchmark returns) |  |
| `indicator_type` | select | Yes | Volatility indicator to compute |  |
| `time_period` | number | No | Time Period (default by indicator: ATR=14, NATR=14, BBANDS=5, STDDEV=5, VAR=5, AVGDEV=14, BETA=5, CORREL=30) |  |
| `nb_dev_up` | number | No | BBANDS Upper Band Deviation Multiplier (default 2.0; any real number) |  |
| `nb_dev_dn` | number | No | BBANDS Lower Band Deviation Multiplier (default 2.0; any real number) |  |
| `ma_type` | select | No | BBANDS Middle Band MA Type (default SMA) |  |
| `nb_dev` | number | No | Standard Deviation / Variance multiplier for STDDEV/VAR output scaling (default 1.0) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Primary output array (ATR, NATR, TRANGE, STDDEV, VAR, AVGDEV, BETA, CORREL values) |  |
| `out_upper_band` | json | No | BBANDS Upper Band values |  |
| `out_middle_band` | json | No | BBANDS Middle Band values (MA of price) |  |
| `out_lower_band` | json | No | BBANDS Lower Band values |  |

## Rules

- **true_range:**
  - **formula:** TR = max(High - Low, abs(High - PrevClose), abs(Low - PrevClose))
  - **lookback:** 1
  - **edge_case:** First bar has no PrevClose; TR = High - Low for bar[0]
  - **inputs_required:** High, Low, Close
- **atr:**
  - **formula:** ATR[0] = mean(TR[0..n-1]); ATR[i] = (ATR[i-1] * (n-1) + TR[i]) / n  (Wilder smoothing)
  - **default_period:** 14
  - **period_range:** 1 to 100000
  - **lookback:** timePeriod (plus unstable period)
  - **output_unit:** Same unit as price (not percentage-normalized)
  - **use_cases:**
    - **position_sizing:** Risk per trade = account_risk / ATR — position size adapts to volatility
    - **stop_loss:** Stop distance = N * ATR (Chandelier Exit, Keltner Channels)
    - **trailing_stop:** Trail by 2× or 3× ATR below highest close
  - **note:** Wilder smoothing is equivalent to EMA with alpha = 1/n (slower than standard EMA alpha 2/(n+1))
- **natr:**
  - **formula:** NATR[i] = ATR[i] / Close[i] * 100
  - **default_period:** 14
  - **period_range:** 1 to 100000
  - **output_unit:** Percentage (%)
  - **output_range:** > 0 (cannot be negative)
  - **advantage:** Cross-instrument comparable — NATR of 1.5% on a $10 stock and a $1000 stock are equivalent volatility
  - **edge_case:** If Close = 0, NATR is undefined (division by zero)
- **bbands:**
  - **formula:**
    - **middle:** MiddleBand = MA(price, n)
    - **upper:** UpperBand = MiddleBand + nbDevUp * StdDev(price, n)
    - **lower:** LowerBand = MiddleBand - nbDevDn * StdDev(price, n)
  - **defaults:** timePeriod=5, nbDevUp=2.0, nbDevDn=2.0, MAType=SMA
  - **period_range:** 2 to 100000
  - **outputs:** 3 arrays: upper, middle, lower bands
  - **band_width:** bandwidth = (UpperBand - LowerBand) / MiddleBand — normalized volatility measure
  - **percent_b:** %b = (price - LowerBand) / (UpperBand - LowerBand) — price position within bands
  - **interpretation:**
    - **squeeze:** Narrowing bands indicate low volatility / pre-breakout compression
    - **breakout:** Price closing above UpperBand or below LowerBand signals expansion
    - **walk_the_band:** Price can trend along a band; closure across does not automatically mean reversal
  - **statistical_basis:** With SMA and nbDev=2, ~95% of prices fall within bands under normal distribution
- **stddev:**
  - **formula:** STDDEV[i] = sqrt(sum((price[j] - mean(price, n))^2, j=i-n+1..i) / n) * nbDev
  - **default_period:** 5
  - **nb_dev_default:** 1
  - **period_range:** 2 to 100000
  - **output_unit:** Same unit as price
  - **use_cases:**
    - **volatility_filter:** High StdDev = noisy market; low StdDev = consolidation
    - **bbands_construction:** BBANDS internally calls STDDEV for band width calculation
- **variance:**
  - **formula:** VAR[i] = STDDEV[i]^2 / nbDev^2
  - **default_period:** 5
  - **nb_dev_default:** 1
  - **note:** Variance is STDDEV squared; use when downstream statistical models need variance (e.g., portfolio optimization)
- **avgdev:**
  - **formula:** AVGDEV[i] = sum(abs(price[j] - mean(price, n)), j=i-n+1..i) / n
  - **default_period:** 14
  - **note:** More robust than STDDEV to outliers; used internally by CCI's denominator
- **beta:**
  - **formula:** Uses slope of linear regression of real0 vs real1 over the period
  - **default_period:** 5
  - **period_range:** 1 to 100000
  - **inputs_required:** real0 (asset), real1 (benchmark)
  - **output:** Rolling beta coefficient (typically >1 = more volatile than benchmark)
  - **use_cases:** Portfolio risk decomposition; hedge ratio calculation
- **correl:**
  - **formula:** CORREL = cov(real0, real1, n) / (stddev(real0, n) * stddev(real1, n))
  - **default_period:** 30
  - **period_range:** 1 to 100000
  - **inputs_required:** real0, real1
  - **output_range:** -1 to +1
  - **use_cases:** Pair trading; portfolio diversification; asset correlation measurement

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No valid output; buffer more bars

### Invalid_parameters (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- ANY: time_period < 1 and indicator_type in [ATR, NATR] OR time_period < 2 and indicator_type in [BBANDS, STDDEV, VAR] OR nb_dev_up == 0 and nb_dev_dn == 0 and indicator_type == BBANDS

**Result:** Function returns error code; validate parameters before calling

### Natr_zero_close (Priority: 2) — Error: `INVALID_INPUT`

**Given:**
- indicator_type == NATR
- any close_prices value == 0

**Result:** NATR output undefined at that bar; caller must filter zero-price bars

### Compute_success (Priority: 10)

**Given:**
- input_length > lookback_period for selected indicator
- required price arrays present
- parameters within valid ranges

**Then:**
- **set_field** target: `out_beg_idx` value: `first input index mapped to out[0]`
- **set_field** target: `out_nb_element` value: `input_length - lookback_period`
- **set_field** target: `out_values` value: `computed volatility values`
- **emit_event** event: `volatility.computed`

**Result:** Volatility series aligned to input via outBegIdx

### Bbands_computed (Priority: 10)

**Given:**
- indicator_type == BBANDS
- input_length > (timePeriod - 1)

**Then:**
- **set_field** target: `out_upper_band` value: `upper band values`
- **set_field** target: `out_middle_band` value: `middle band values (MA)`
- **set_field** target: `out_lower_band` value: `lower band values`
- **emit_event** event: `volatility.computed`

**Result:** Three overlaid bands; bandwidth contraction (squeeze) precedes breakout

### Volatility_expansion (Priority: 10)

**Given:**
- indicator_type in [ATR, NATR]
- out_values[latest] > 1.5 * mean(out_values[-20:])

**Then:**
- **emit_event** event: `volatility.expansion`

**Result:** Volatility expansion signal — widen stops or reduce position size

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough historical bars. ATR requires at least timePeriod bars; BBANDS requires timePeriod. | No |
| `INVALID_PARAMETER` | 400 | A parameter is outside its valid range (period < 1 for ATR/NATR, < 2 for BBANDS/STDDEV). | No |
| `INVALID_INPUT` | 422 | A price value is zero or non-finite, causing division by zero in NATR. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `volatility.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `volatility.expansion` |  | `indicator_type`, `latest_value`, `expansion_ratio` |
| `volatility.squeeze` |  | `bandwidth`, `middle_band_value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| moving-average-overlap-studies | required |  |
| directional-movement-indicators | recommended |  |
| market-data-feeds | required |  |
| regulation-28-compliance | optional |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 9
atr_smoothing_note: Wilder smoothing alpha = 1/n is less responsive than EMA
  alpha = 2/(n+1); ATR period 14 with Wilder ≈ EMA period 27
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Volatility Band Indicators Blueprint",
  "description": "A suite of volatility measurement and price band indicators for quantifying market risk, setting dynamic stop levels, and identifying breakout conditions across",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, volatility, atr, bollinger-bands, stddev, risk, ta-lib, indicators"
}
</script>
