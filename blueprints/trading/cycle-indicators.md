<!-- AUTO-GENERATED FROM cycle-indicators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cycle Indicators

> Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniques

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · cycle · hilbert-transform · dominant-cycle · phasor · sine-wave · ta-lib · indicators

## What this does

Hilbert Transform cycle-analysis indicators that decompose price into dominant cycle period, phase, and trend/cycle mode using digital signal processing techniques

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **real_prices** *(json, required)* — Price series (typically Close; chronological double array)
- **indicator_type** *(select, required)* — Hilbert Transform cycle function to compute
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Primary output (HT_DCPERIOD period values; HT_DCPHASE degrees; HT_TRENDMODE 0/1 integer)
- **out_secondary** *(json, optional)* — Secondary output (HT_PHASOR Quadrature array; HT_SINE LeadSine array)

## What must be true

- **lookback_model → lookback:** 32
- **lookback_model → note:** 32-bar fixed warm-up period applies regardless of input size; first 32 bars consume the Hilbert Transform initialisation
- **ht_dcperiod → formula:** Uses Homodyne Discriminator method to estimate the dominant cycle period in price data
- **ht_dcperiod → inputs_required:** price
- **ht_dcperiod → output_unit:** Bars (e.g., output of 20 means a 20-bar dominant cycle)
- **ht_dcperiod → output_range:** 6 to 50 bars (clamped internally)
- **ht_dcperiod → interpretation → short_cycle:** Period < 10 — fast, short-term cycle dominant
- **ht_dcperiod → interpretation → medium_cycle:** Period 10-20 — typical short-term swing cycle
- **ht_dcperiod → interpretation → long_cycle:** Period > 30 — slower, longer-duration cycle dominant
- **ht_dcperiod → use_case:** Adaptive period selection — use HT_DCPERIOD output to dynamically set STOCH or RSI period
- **ht_dcphase → formula:** Instantaneous phase of the dominant cycle; derived from InPhase and Quadrature components
- **ht_dcphase → inputs_required:** price
- **ht_dcphase → output_unit:** Degrees (0 to 360)
- **ht_dcphase → output_range:** -180 to +180 (wraps at cycle boundaries)
- **ht_dcphase → interpretation → zero_crossing:** Phase crosses 0° → potential buy signal (start of new cycle)
- **ht_dcphase → interpretation → peak:** Phase near +90° → cycle peak
- **ht_dcphase → interpretation → trough:** Phase near -90° → cycle trough
- **ht_dcphase → use_case:** Cycle timing — identify where in the current cycle price resides
- **ht_phasor → formula:** InPhase = real component of the analytic signal; Quadrature = imaginary component (90° ahead)
- **ht_phasor → inputs_required:** price
- **ht_phasor → outputs:** 2 arrays: InPhase (out_values) and Quadrature (out_secondary)
- **ht_phasor → output_unit:** Normalized price units
- **ht_phasor → use_case:** Building block for computing HT_DCPHASE and HT_TRENDMODE; rarely used directly in strategies
- **ht_phasor → note:** InPhase and Quadrature are the I/Q components of the Hilbert Transform analytic signal
- **ht_sine → formula:** SineWave = sin(phase); LeadSine = sin(phase + 45°) — lead signal 45° ahead of main sine
- **ht_sine → inputs_required:** price
- **ht_sine → outputs:** 2 arrays: SineWave (out_values) and LeadSine (out_secondary)
- **ht_sine → output_range:** -1 to +1 for both
- **ht_sine → interpretation → buy_signal:** LeadSine crosses above SineWave from below
- **ht_sine → interpretation → sell_signal:** LeadSine crosses below SineWave from above
- **ht_sine → use_case:** Cycle-timing buy/sell signals without needing to interpret raw phase degrees
- **ht_trendmode → formula:** Returns 1 when price is trending (not cycling), 0 when in cycle mode
- **ht_trendmode → inputs_required:** price
- **ht_trendmode → output_type:** Integer (0 or 1)
- **ht_trendmode → interpretation → trending:** Output = 1 — apply trend-following indicators (MACD, ADX, moving average crossovers)
- **ht_trendmode → interpretation → cycling:** Output = 0 — apply cycle oscillators (Stochastic, RSI with tighter bands)
- **ht_trendmode → use_case:** Regime filter — switch indicator set based on whether price is trending or oscillating

## Success & failure scenarios

**✅ Success paths**

- **Compute Success** — when input_length > 32; real_prices present and non-empty, then Output aligned to input via outBegIdx=32; caller must skip first 32 input bars.
- **Phasor Computed** — when indicator_type == HT_PHASOR; input_length > 32, then Two synchronized arrays: InPhase and Quadrature — combine to derive phase angle.
- **Sine Computed** — when indicator_type == HT_SINE; input_length > 32, then LeadSine crossover above/below SineWave generates buy/sell signals.
- **Trendmode Switch** — when indicator_type == HT_TRENDMODE; out_values[latest] changed value (0→1 or 1→0), then Regime change detected — caller should switch active indicator set.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= 32, then No output; all Hilbert Transform functions require at least 33 bars. *(error: `INSUFFICIENT_DATA`)*

## Errors it can return

- `INSUFFICIENT_DATA` — All Hilbert Transform indicators require at least 33 bars (32-bar warm-up + 1 output bar).

## Events

**`cycle.computed`**
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`cycle.regime_change`**
  Payload: `new_mode`, `previous_mode`, `bar_index`

## Connects to

- **momentum-oscillators** *(recommended)*
- **moving-average-overlap-studies** *(recommended)*
- **directional-movement-indicators** *(recommended)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/cycle-indicators/) · **Spec source:** [`cycle-indicators.blueprint.yaml`](./cycle-indicators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
