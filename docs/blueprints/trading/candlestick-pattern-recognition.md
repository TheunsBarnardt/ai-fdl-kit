---
title: "Candlestick Pattern Recognition Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series. 9 fields. 6 "
---

# Candlestick Pattern Recognition Blueprint

> Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series

| | |
|---|---|
| **Feature** | `candlestick-pattern-recognition` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, candlestick, pattern-recognition, japanese-candlestick, reversal, continuation, ta-lib |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/candlestick-pattern-recognition.blueprint.yaml) |
| **JSON API** | [candlestick-pattern-recognition.json]({{ site.baseurl }}/api/blueprints/trading/candlestick-pattern-recognition.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `pattern_engine` | Candlestick Pattern Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `open_prices` | json | Yes | Open Prices (chronological double array) |  |
| `high_prices` | json | Yes | High Prices (chronological double array) |  |
| `low_prices` | json | Yes | Low Prices (chronological double array) |  |
| `close_prices` | json | Yes | Close Prices (chronological double array) |  |
| `pattern_type` | select | Yes | Candlestick pattern to detect |  |
| `penetration` | number | No | Penetration factor (0-1; used by CDLDARKCLOUDCOVER, CDLEVENINGSTAR, CDLEVENINGDOJISTAR, CDLMORNINGSTAR, CDLMORNINGDOJISTAR, CDLABANDONEDBABY, CDLMATHOLD; default 0.3) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_integer` | json | No | Signal output array — integer values (+100=bullish, -100=bearish, 0=no pattern) |  |

## Rules

- **output_convention:**
  - **values:**
    - **bullish:** +100 — bullish pattern detected on this bar (last bar of the pattern)
    - **bearish:** -100 — bearish pattern detected on this bar
    - **no_pattern:** 0 — no pattern detected
  - **alignment:** Signal is placed on the LAST bar of the pattern (e.g., for a 3-bar pattern, signal at bar index 2)
  - **note:** Most bars output 0 — pattern occurrences are relatively rare events in price data
- **lookback_by_bar_count:**
  - **single_bar_patterns:** lookback = 0 to 3 (body/shadow averaging period)
  - **two_bar_patterns:** lookback = 1 to 3
  - **three_bar_patterns:** lookback = 2 to 3
  - **five_bar_patterns:** lookback = 4 to 5 (CDLBREAKAWAY, CDLRISEFALL3METHODS, CDLMATHOLD)
  - **penetration_note:** Patterns with optInPenetration compare candle penetration depth against this threshold
- **penetration_patterns:**
  - **patterns:** CDLABANDONEDBABY, CDLDARKCLOUDCOVER, CDLEVENINGDOJISTAR, CDLEVENINGSTAR, CDLMATHOLD, CDLMORNINGDOJISTAR, CDLMORNINGSTAR
  - **default:** 0.3
  - **range:** 0 to 1
  - **meaning:** Minimum penetration into the prior bar's body required to qualify as the pattern (e.g., 0.3 = close must be at least 30% into prior body)
- **body_shadow_averaging:**
  - **implication:** Even single-bar patterns may have lookback > 0 due to body-size averaging
- **pattern_categories:**
  - **reversal_bullish:**
    - **description:** Signal potential upward price reversal after a downtrend
    - **patterns:** CDLHAMMER, CDLINVERTEDHAMMER, CDLMORNINGSTAR, CDLMORNINGDOJISTAR, CDLENGULFING(+), CDLPIERCING, CDLABANDONEDBABY(+), CDL3WHITESOLDIERS, CDL3INSIDE(+), CDL3OUTSIDE(+), CDLHOMINGPIGEON, CDLSTICKSANDWICH, CDLLADDERBOTTOM, CDLTRISTAR(+), CDLDRAGONFLYDOJI, CDLUNIQUE3RIVER, CDLCONCEALBABYSWALL, CDLBREAKAWAY(+)
  - **reversal_bearish:**
    - **description:** Signal potential downward price reversal after an uptrend
    - **patterns:** CDLHANGINGMAN, CDLSHOOTINGSTAR, CDLEVENINGSTAR, CDLEVENINGDOJISTAR, CDLENGULFING(-), CDLDARKCLOUDCOVER, CDLABANDONEDBABY(-), CDL3BLACKCROWS, CDL3INSIDE(-), CDL3OUTSIDE(-), CDLGRAVESTONEDOJI, CDL2CROWS, CDLUPSIDEGAP2CROWS, CDLADVANCEBLOCK, CDLSTALLEDPATTERN, CDLTRISTAR(-), CDLBREAKAWAY(-)
  - **continuation:**
    - **description:** Suggest the prior trend will continue
    - **patterns:** CDLRISEFALL3METHODS, CDLMATHOLD, CDLTASUKIGAP, CDLGAPSIDESIDEWHITE, CDLSEPARATINGLINES, CDLXSIDEGAP3METHODS, CDLHIKKAKE, CDLHIKKAKEMOD
  - **indecision:**
    - **description:** Indicate market equilibrium — no strong directional bias
    - **patterns:** CDLDOJI, CDLSPINNINGTOP, CDLHIGHWAVE, CDLRICKSHAWMAN, CDLLONGLEGGEDDOJI
- **reliability_notes:**
  - **context_dependent:** All patterns require trend context — Hammer is bullish ONLY in a downtrend; Hanging Man is bearish ONLY in an uptrend
  - **confirmation:** Candlestick patterns are more reliable when confirmed by the following bar's close
  - **volume_confirmation:** High-volume pattern bars increase reliability — combine with OBV or MFI
  - **false_signals:** In ranging markets, reversal patterns frequently fail — use ADX > 20 to filter for trend context

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No signal produced; buffer sufficient bars for the selected pattern's lookback

### Invalid_penetration (Priority: 2) — Error: `INVALID_PARAMETER`

**Given:**
- pattern_type in [CDLDARKCLOUDCOVER, CDLEVENINGSTAR, CDLMORNINGSTAR, CDLABANDONEDBABY, CDLMATHOLD, CDLMORNINGDOJISTAR, CDLEVENINGDOJISTAR]
- ANY: penetration < 0 OR penetration > 1

**Result:** Function returns error; default penetration of 0.3 is the standard value

### Pattern_detected_bullish (Priority: 10)

**Given:**
- input_length > lookback_period for selected pattern
- OHLC data satisfies all structural conditions of the pattern
- out_integer[latest] == +100

**Then:**
- **set_field** target: `out_integer` value: `+100 at the pattern completion bar`
- **emit_event** event: `pattern.bullish_detected`

**Result:** Bullish signal emitted; confirm with next bar close and volume before acting

### Pattern_detected_bearish (Priority: 10)

**Given:**
- input_length > lookback_period
- out_integer[latest] == -100

**Then:**
- **set_field** target: `out_integer` value: `-100 at the pattern completion bar`
- **emit_event** event: `pattern.bearish_detected`

**Result:** Bearish signal emitted; confirm before acting

### No_pattern (Priority: 10)

**Given:**
- out_integer[latest] == 0

**Result:** Output is 0 — most bars produce this result; pattern detection is event-driven

### Multi_pattern_scan (Priority: 10)

**Given:**
- multiple pattern_type values evaluated in sequence over the same input

**Then:**
- **emit_event** event: `pattern.scan_complete`

**Result:** Collection of signals; aggregate by signal value to find bars where multiple patterns agree

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough bars for this pattern. Multi-bar patterns (Morning Star, 3 Black Crows) need more history than single-bar patterns. | No |
| `INVALID_PARAMETER` | 400 | Penetration parameter must be between 0 and 1 for patterns that use it. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pattern.bullish_detected` |  | `pattern_type`, `bar_index`, `open`, `high`, `low`, `close` |
| `pattern.bearish_detected` |  | `pattern_type`, `bar_index`, `open`, `high`, `low`, `close` |
| `pattern.scan_complete` |  | `patterns_matched`, `bar_count`, `results_map` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| directional-movement-indicators | recommended |  |
| volume-flow-indicators | recommended |  |
| volatility-band-indicators | optional |  |
| market-data-feeds | required |  |

## AGI Readiness

### Goals

#### Reliable Candlestick Pattern Recognition

Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series

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
| pattern_detected_bullish | `autonomous` | - | - |
| pattern_detected_bearish | `autonomous` | - | - |
| no_pattern | `autonomous` | - | - |
| multi_pattern_scan | `autonomous` | - | - |
| insufficient_data | `autonomous` | - | - |
| invalid_penetration | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
pattern_count: 61
output_type: Integer Array (+100 / -100 / 0) — unlike price indicators which
  return Double Array
body_average_period: TA-Lib uses TA_CANDLE_AVGPERIOD (typically 14) for internal
  body/shadow classification
candle_settings:
  default_settings: Based on statistical norms from historical price data; can be
    tuned per instrument
  settings_types:
    - BodyDoji
    - BodyLong
    - BodyShort
    - BodyVeryLong
    - ShadowLong
    - ShadowVeryLong
    - ShadowShort
    - ShadowVeryShort
    - Near
    - Far
    - Equal
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Candlestick Pattern Recognition Blueprint",
  "description": "Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series. 9 fields. 6 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, candlestick, pattern-recognition, japanese-candlestick, reversal, continuation, ta-lib"
}
</script>
