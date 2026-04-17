<!-- AUTO-GENERATED FROM candlestick-pattern-recognition.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Candlestick Pattern Recognition

> Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · candlestick · pattern-recognition · japanese-candlestick · reversal · continuation · ta-lib

## What this does

Recognizes 61 Japanese candlestick patterns from OHLC price bars, returning +100 (bullish), -100 (bearish), or 0 (none) for each bar in the series

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **open_prices** *(json, required)* — Open Prices (chronological double array)
- **high_prices** *(json, required)* — High Prices (chronological double array)
- **low_prices** *(json, required)* — Low Prices (chronological double array)
- **close_prices** *(json, required)* — Close Prices (chronological double array)
- **pattern_type** *(select, required)* — Candlestick pattern to detect
- **penetration** *(number, optional)* — Penetration factor (0-1; used by CDLDARKCLOUDCOVER, CDLEVENINGSTAR, CDLEVENINGDOJISTAR, CDLMORNINGSTAR, CDLMORNINGDOJISTAR, CDLABANDONEDBABY, CDLMATHOLD; default 0.3)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_integer** *(json, optional)* — Signal output array — integer values (+100=bullish, -100=bearish, 0=no pattern)

## What must be true

- **output_convention → values → bullish:** +100 — bullish pattern detected on this bar (last bar of the pattern)
- **output_convention → values → bearish:** -100 — bearish pattern detected on this bar
- **output_convention → values → no_pattern:** 0 — no pattern detected
- **output_convention → alignment:** Signal is placed on the LAST bar of the pattern (e.g., for a 3-bar pattern, signal at bar index 2)
- **output_convention → note:** Most bars output 0 — pattern occurrences are relatively rare events in price data
- **lookback_by_bar_count → single_bar_patterns:** lookback = 0 to 3 (body/shadow averaging period)
- **lookback_by_bar_count → two_bar_patterns:** lookback = 1 to 3
- **lookback_by_bar_count → three_bar_patterns:** lookback = 2 to 3
- **lookback_by_bar_count → five_bar_patterns:** lookback = 4 to 5 (CDLBREAKAWAY, CDLRISEFALL3METHODS, CDLMATHOLD)
- **lookback_by_bar_count → penetration_note:** Patterns with optInPenetration compare candle penetration depth against this threshold
- **penetration_patterns → patterns:** CDLABANDONEDBABY, CDLDARKCLOUDCOVER, CDLEVENINGDOJISTAR, CDLEVENINGSTAR, CDLMATHOLD, CDLMORNINGDOJISTAR, CDLMORNINGSTAR
- **penetration_patterns → default:** 0.3
- **penetration_patterns → range:** 0 to 1
- **penetration_patterns → meaning:** Minimum penetration into the prior bar's body required to qualify as the pattern (e.g., 0.3 = close must be at least 30% into prior body)
- **body_shadow_averaging → implication:** Even single-bar patterns may have lookback > 0 due to body-size averaging
- **pattern_categories → reversal_bullish:** Signal potential upward price reversal after a downtrend
- **pattern_categories → reversal_bullish → patterns:** CDLHAMMER, CDLINVERTEDHAMMER, CDLMORNINGSTAR, CDLMORNINGDOJISTAR, CDLENGULFING(+), CDLPIERCING, CDLABANDONEDBABY(+), CDL3WHITESOLDIERS, CDL3INSIDE(+), CDL3OUTSIDE(+), CDLHOMINGPIGEON, CDLSTICKSANDWICH, CDLLADDERBOTTOM, CDLTRISTAR(+), CDLDRAGONFLYDOJI, CDLUNIQUE3RIVER, CDLCONCEALBABYSWALL, CDLBREAKAWAY(+)
- **pattern_categories → reversal_bearish:** Signal potential downward price reversal after an uptrend
- **pattern_categories → reversal_bearish → patterns:** CDLHANGINGMAN, CDLSHOOTINGSTAR, CDLEVENINGSTAR, CDLEVENINGDOJISTAR, CDLENGULFING(-), CDLDARKCLOUDCOVER, CDLABANDONEDBABY(-), CDL3BLACKCROWS, CDL3INSIDE(-), CDL3OUTSIDE(-), CDLGRAVESTONEDOJI, CDL2CROWS, CDLUPSIDEGAP2CROWS, CDLADVANCEBLOCK, CDLSTALLEDPATTERN, CDLTRISTAR(-), CDLBREAKAWAY(-)
- **pattern_categories → continuation:** Suggest the prior trend will continue
- **pattern_categories → continuation → patterns:** CDLRISEFALL3METHODS, CDLMATHOLD, CDLTASUKIGAP, CDLGAPSIDESIDEWHITE, CDLSEPARATINGLINES, CDLXSIDEGAP3METHODS, CDLHIKKAKE, CDLHIKKAKEMOD
- **pattern_categories → indecision:** Indicate market equilibrium — no strong directional bias
- **pattern_categories → indecision → patterns:** CDLDOJI, CDLSPINNINGTOP, CDLHIGHWAVE, CDLRICKSHAWMAN, CDLLONGLEGGEDDOJI
- **reliability_notes → context_dependent:** All patterns require trend context — Hammer is bullish ONLY in a downtrend; Hanging Man is bearish ONLY in an uptrend
- **reliability_notes → confirmation:** Candlestick patterns are more reliable when confirmed by the following bar's close
- **reliability_notes → volume_confirmation:** High-volume pattern bars increase reliability — combine with OBV or MFI
- **reliability_notes → false_signals:** In ranging markets, reversal patterns frequently fail — use ADX > 20 to filter for trend context

## Success & failure scenarios

**✅ Success paths**

- **Pattern Detected Bullish** — when input_length > lookback_period for selected pattern; OHLC data satisfies all structural conditions of the pattern; out_integer[latest] == +100, then Bullish signal emitted; confirm with next bar close and volume before acting.
- **Pattern Detected Bearish** — when input_length > lookback_period; out_integer[latest] == -100, then Bearish signal emitted; confirm before acting.
- **No Pattern** — when out_integer[latest] == 0, then Output is 0 — most bars produce this result; pattern detection is event-driven.
- **Multi Pattern Scan** — when multiple pattern_type values evaluated in sequence over the same input, then Collection of signals; aggregate by signal value to find bars where multiple patterns agree.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period, then No signal produced; buffer sufficient bars for the selected pattern's lookback. *(error: `INSUFFICIENT_DATA`)*
- **Invalid Penetration** — when pattern_type in [CDLDARKCLOUDCOVER, CDLEVENINGSTAR, CDLMORNINGSTAR, CDLABANDONEDBABY, CDLMATHOLD, CDLMORNINGDOJISTAR, CDLEVENINGDOJISTAR]; penetration < 0 OR penetration > 1, then Function returns error; default penetration of 0.3 is the standard value. *(error: `INVALID_PARAMETER`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough bars for this pattern. Multi-bar patterns (Morning Star, 3 Black Crows) need more history than single-bar patterns.
- `INVALID_PARAMETER` — Penetration parameter must be between 0 and 1 for patterns that use it.

## Events

**`pattern.bullish_detected`**
  Payload: `pattern_type`, `bar_index`, `open`, `high`, `low`, `close`

**`pattern.bearish_detected`**
  Payload: `pattern_type`, `bar_index`, `open`, `high`, `low`, `close`

**`pattern.scan_complete`**
  Payload: `patterns_matched`, `bar_count`, `results_map`

## Connects to

- **momentum-oscillators** *(recommended)*
- **directional-movement-indicators** *(recommended)*
- **volume-flow-indicators** *(recommended)*
- **volatility-band-indicators** *(optional)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/candlestick-pattern-recognition/) · **Spec source:** [`candlestick-pattern-recognition.blueprint.yaml`](./candlestick-pattern-recognition.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
