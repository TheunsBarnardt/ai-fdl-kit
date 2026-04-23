---
title: "Volume Flow Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging "
---

# Volume Flow Indicators Blueprint

> Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging from price trend signals

| | |
|---|---|
| **Feature** | `volume-flow-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, volume, obv, accumulation-distribution, money-flow, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/volume-flow-indicators.blueprint.yaml) |
| **JSON API** | [volume-flow-indicators.json]({{ site.baseurl }}/api/blueprints/trading/volume-flow-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `close_prices` | json | Yes | Close Prices (chronological double array) |  |
| `high_prices` | json | No | High Prices (required for AD, ADOSC, MFI) |  |
| `low_prices` | json | No | Low Prices (required for AD, ADOSC, MFI) |  |
| `volume` | json | Yes | Volume series (chronological double array; required for all four indicators) |  |
| `indicator_type` | select | Yes | Volume indicator to compute |  |
| `fast_period` | number | No | ADOSC Fast EMA Period (default 3; range 2-100000) |  |
| `slow_period` | number | No | ADOSC Slow EMA Period (default 10; range 2-100000) |  |
| `time_period` | number | No | MFI Time Period (default 14; range 2-100000) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Indicator output array (double values; unbounded for OBV/AD/ADOSC; 0-100 for MFI) |  |

## Rules

- **obv:**
  - **formula:** OBV[0] = Volume[0]; OBV[i] = OBV[i-1] + Volume[i] if Close[i] > Close[i-1] else OBV[i-1] - Volume[i] if Close[i] < Close[i-1] else OBV[i-1]
  - **inputs_required:** Close, Volume
  - **lookback:** 0
  - **output_unit:** Cumulative volume (no price normalization)
  - **output_range:** Unbounded (can be very large; sign is directional)
  - **divergence_rule:** Price making new high while OBV fails to confirm → bearish divergence
  - **note:** OBV starting value depends on the first bar in the dataset; absolute level is arbitrary — only trend and divergence matter
- **ad:**
  - **formula:**
    - **clv:** CLV = ((Close - Low) - (High - Close)) / (High - Low)  [Close Location Value, -1 to +1]
    - **mf:** MoneyFlow = CLV * Volume
    - **ad:** AD[i] = AD[i-1] + MoneyFlow[i]
  - **inputs_required:** High, Low, Close, Volume
  - **lookback:** 0
  - **output_unit:** Cumulative volume-weighted money flow
  - **output_range:** Unbounded
  - **edge_case:** When High == Low, CLV = 0 (no price range) → no money flow added
  - **divergence_rule:** Price rising while AD falling → distribution (bearish divergence)
  - **advantage_over_obv:** AD uses CLV to weight volume by position of close within the day's range, not just direction of close vs. previous close
- **adosc:**
  - **formula:** ADOSC = EMA(AD, fast) - EMA(AD, slow)
  - **inputs_required:** High, Low, Close, Volume
  - **defaults:** fast=3, slow=10
  - **period_range:** 2 to 100000 for both
  - **lookback:** slow_period - 1
  - **output_unit:** Rate of change in money flow (derivative of AD)
  - **output_range:** Unbounded (oscillates around zero)
  - **interpretation:**
    - **positive:** ADOSC > 0 → accumulation dominant (buying pressure)
    - **negative:** ADOSC < 0 → distribution dominant (selling pressure)
    - **zero_cross:** ADOSC crossing zero signals potential trend change in money flow
- **mfi:**
  - **formula:**
    - **typical_price:** TP = (High + Low + Close) / 3
    - **raw_money_flow:** RMF = TP * Volume
    - **classification:** Positive MF if TP > PrevTP; Negative MF if TP < PrevTP; unchanged if TP == PrevTP
    - **mfi:** MFI = 100 - 100 / (1 + PosMF_sum / NegMF_sum)  over n periods
  - **inputs_required:** High, Low, Close, Volume
  - **default_period:** 14
  - **period_range:** 2 to 100000
  - **lookback:** timePeriod
  - **output_range:** 0 to 100
  - **interpretation:**
    - **overbought:** > 80
    - **oversold:** < 20
  - **edge_case:** When NegMF_sum = 0, MFI = 100 (all positive money flow in period)

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= lookback_period

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output produced

### Missing_volume (Priority: 2) — Error: `MISSING_INPUT`

**Given:**
- volume is null or empty

**Result:** Cannot compute any volume flow indicator without volume data

### Flat_bar_edge (Priority: 3)

**Given:**
- indicator_type in [AD, ADOSC]
- any bar has High == Low

**Then:**
- **set_field** target: `out_values` value: `0 money flow added for affected bars (CLV = 0)`

**Result:** Flat bars contribute zero to AD accumulation — no error, handled gracefully

### Compute_success (Priority: 10)

**Given:**
- input_length > lookback_period for selected indicator
- close_prices, volume, and required OHLC arrays present and equal length

**Then:**
- **set_field** target: `out_beg_idx` value: `first input index mapped to out[0]`
- **set_field** target: `out_nb_element` value: `input_length - lookback_period`
- **set_field** target: `out_values` value: `volume flow values`
- **emit_event** event: `volume.computed`

**Result:** Volume-weighted flow series aligned to input; divergence analysis against price trend

### Bullish_divergence (Priority: 10)

**Given:**
- indicator_type in [OBV, AD]
- close_prices makes new n-bar low
- out_values does not make new n-bar low

**Then:**
- **emit_event** event: `volume.bullish_divergence`

**Result:** Bullish divergence signal — potential price reversal to the upside

### Bearish_divergence (Priority: 10)

**Given:**
- indicator_type in [OBV, AD]
- close_prices makes new n-bar high
- out_values does not make new n-bar high

**Then:**
- **emit_event** event: `volume.bearish_divergence`

**Result:** Bearish divergence signal — potential price reversal to the downside

### Mfi_overbought (Priority: 10)

**Given:**
- indicator_type == MFI
- out_values[latest] > 80

**Then:**
- **emit_event** event: `volume.overbought`

**Result:** Volume-confirmed overbought — higher confidence reversal signal than RSI alone

### Mfi_oversold (Priority: 10)

**Given:**
- indicator_type == MFI
- out_values[latest] < 20

**Then:**
- **emit_event** event: `volume.oversold`

**Result:** Volume-confirmed oversold — higher confidence reversal signal than RSI alone

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough bars. ADOSC requires slow_period bars minimum; MFI requires time_period bars. | No |
| `MISSING_INPUT` | 400 | Volume array is required for all volume flow indicators. High and Low are required for AD, ADOSC, and MFI. | No |
| `INVALID_PARAMETER` | 400 | Period parameter out of range (MFI period < 2, or ADOSC slow < fast). | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `volume.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `volume.bullish_divergence` |  | `indicator_type`, `price_low`, `indicator_value` |
| `volume.bearish_divergence` |  | `indicator_type`, `price_high`, `indicator_value` |
| `volume.overbought` |  | `indicator_type`, `value`, `threshold` |
| `volume.oversold` |  | `indicator_type`, `value`, `threshold` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| directional-movement-indicators | recommended |  |
| volatility-band-indicators | optional |  |
| candlestick-pattern-recognition | optional |  |
| market-data-feeds | required |  |

## AGI Readiness

### Goals

#### Reliable Volume Flow Indicators

Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging from price trend signals

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
| bullish_divergence | `autonomous` | - | - |
| bearish_divergence | `autonomous` | - | - |
| mfi_overbought | `autonomous` | - | - |
| mfi_oversold | `autonomous` | - | - |
| insufficient_data | `autonomous` | - | - |
| missing_volume | `autonomous` | - | - |
| flat_bar_edge | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 4
obv_note: OBV lookback = 0 means all bars produce output including the first bar
ad_note: AD lookback = 0; the initial AD value depends on the first bar's CLV × Volume
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Volume Flow Indicators Blueprint",
  "description": "Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, volume, obv, accumulation-distribution, money-flow, ta-lib, indicators"
}
</script>
