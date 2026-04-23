---
title: "Cycle Indicators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniq"
---

# Cycle Indicators Blueprint

> Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniques

| | |
|---|---|
| **Feature** | `cycle-indicators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, cycle, hilbert-transform, dominant-cycle, phasor, sine-wave, ta-lib, indicators |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cycle-indicators.blueprint.yaml) |
| **JSON API** | [cycle-indicators.json]({{ site.baseurl }}/api/blueprints/trading/cycle-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `real_prices` | json | Yes | Price series (typically Close; chronological double array) |  |
| `indicator_type` | select | Yes | Hilbert Transform cycle function to compute |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Primary output (HT_DCPERIOD period values; HT_DCPHASE degrees; HT_TRENDMODE 0/1 integer) |  |
| `out_secondary` | json | No | Secondary output (HT_PHASOR Quadrature array; HT_SINE LeadSine array) |  |

## Rules

- **lookback_model:**
  - **lookback:** 32
  - **note:** 32-bar fixed warm-up period applies regardless of input size; first 32 bars consume the Hilbert Transform initialisation
- **ht_dcperiod:**
  - **formula:** Uses Homodyne Discriminator method to estimate the dominant cycle period in price data
  - **inputs_required:** price
  - **output_unit:** Bars (e.g., output of 20 means a 20-bar dominant cycle)
  - **output_range:** 6 to 50 bars (clamped internally)
  - **interpretation:**
    - **short_cycle:** Period < 10 — fast, short-term cycle dominant
    - **medium_cycle:** Period 10-20 — typical short-term swing cycle
    - **long_cycle:** Period > 30 — slower, longer-duration cycle dominant
  - **use_case:** Adaptive period selection — use HT_DCPERIOD output to dynamically set STOCH or RSI period
- **ht_dcphase:**
  - **formula:** Instantaneous phase of the dominant cycle; derived from InPhase and Quadrature components
  - **inputs_required:** price
  - **output_unit:** Degrees (0 to 360)
  - **output_range:** -180 to +180 (wraps at cycle boundaries)
  - **interpretation:**
    - **zero_crossing:** Phase crosses 0° → potential buy signal (start of new cycle)
    - **peak:** Phase near +90° → cycle peak
    - **trough:** Phase near -90° → cycle trough
  - **use_case:** Cycle timing — identify where in the current cycle price resides
- **ht_phasor:**
  - **formula:** InPhase = real component of the analytic signal; Quadrature = imaginary component (90° ahead)
  - **inputs_required:** price
  - **outputs:** 2 arrays: InPhase (out_values) and Quadrature (out_secondary)
  - **output_unit:** Normalized price units
  - **use_case:** Building block for computing HT_DCPHASE and HT_TRENDMODE; rarely used directly in strategies
  - **note:** InPhase and Quadrature are the I/Q components of the Hilbert Transform analytic signal
- **ht_sine:**
  - **formula:** SineWave = sin(phase); LeadSine = sin(phase + 45°) — lead signal 45° ahead of main sine
  - **inputs_required:** price
  - **outputs:** 2 arrays: SineWave (out_values) and LeadSine (out_secondary)
  - **output_range:** -1 to +1 for both
  - **interpretation:**
    - **buy_signal:** LeadSine crosses above SineWave from below
    - **sell_signal:** LeadSine crosses below SineWave from above
  - **use_case:** Cycle-timing buy/sell signals without needing to interpret raw phase degrees
- **ht_trendmode:**
  - **formula:** Returns 1 when price is trending (not cycling), 0 when in cycle mode
  - **inputs_required:** price
  - **output_type:** Integer (0 or 1)
  - **interpretation:**
    - **trending:** Output = 1 — apply trend-following indicators (MACD, ADX, moving average crossovers)
    - **cycling:** Output = 0 — apply cycle oscillators (Stochastic, RSI with tighter bands)
  - **use_case:** Regime filter — switch indicator set based on whether price is trending or oscillating

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- input_length <= 32

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output; all Hilbert Transform functions require at least 33 bars

### Compute_success (Priority: 10)

**Given:**
- input_length > 32
- real_prices present and non-empty

**Then:**
- **set_field** target: `out_beg_idx` value: `32`
- **set_field** target: `out_nb_element` value: `input_length - 32`
- **set_field** target: `out_values` value: `computed Hilbert Transform values`
- **emit_event** event: `cycle.computed`

**Result:** Output aligned to input via outBegIdx=32; caller must skip first 32 input bars

### Phasor_computed (Priority: 10)

**Given:**
- indicator_type == HT_PHASOR
- input_length > 32

**Then:**
- **set_field** target: `out_values` value: `InPhase component values`
- **set_field** target: `out_secondary` value: `Quadrature component values`

**Result:** Two synchronized arrays: InPhase and Quadrature — combine to derive phase angle

### Sine_computed (Priority: 10)

**Given:**
- indicator_type == HT_SINE
- input_length > 32

**Then:**
- **set_field** target: `out_values` value: `SineWave values (-1 to +1)`
- **set_field** target: `out_secondary` value: `LeadSine values (-1 to +1, 45° phase advance)`

**Result:** LeadSine crossover above/below SineWave generates buy/sell signals

### Trendmode_switch (Priority: 10)

**Given:**
- indicator_type == HT_TRENDMODE
- out_values[latest] changed value (0→1 or 1→0)

**Then:**
- **emit_event** event: `cycle.regime_change`

**Result:** Regime change detected — caller should switch active indicator set

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | All Hilbert Transform indicators require at least 33 bars (32-bar warm-up + 1 output bar). | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cycle.computed` |  | `indicator_type`, `out_nb_element`, `out_beg_idx` |
| `cycle.regime_change` |  | `new_mode`, `previous_mode`, `bar_index` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| momentum-oscillators | recommended |  |
| moving-average-overlap-studies | recommended |  |
| directional-movement-indicators | recommended |  |
| market-data-feeds | required |  |

## AGI Readiness

### Goals

#### Reliable Cycle Indicators

Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniques

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
| phasor_computed | `autonomous` | - | - |
| sine_computed | `autonomous` | - | - |
| trendmode_switch | `autonomous` | - | - |
| insufficient_data | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
indicator_count: 5
fixed_lookback: 32
theory: John Ehlers — MESA and Trading Market Cycles (1992); Cybernetic Analysis
  for Stocks and Futures (2004)
output_types:
  HT_DCPERIOD: Double Array (bars)
  HT_DCPHASE: Double Array (degrees)
  HT_PHASOR: Two Double Arrays (InPhase, Quadrature)
  HT_SINE: Two Double Arrays (SineWave, LeadSine)
  HT_TRENDMODE: Integer Array (0 or 1)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cycle Indicators Blueprint",
  "description": "Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniq",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, cycle, hilbert-transform, dominant-cycle, phasor, sine-wave, ta-lib, indicators"
}
</script>
