<!-- AUTO-GENERATED FROM directional-movement-indicators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Directional Movement Indicators

> A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels via Parabolic SAR

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · directional-movement · adx · aroon · parabolic-sar · trend-strength · ta-lib

## What this does

A suite of directional movement and trend confirmation indicators for measuring trend strength, identifying trend direction, and generating trailing stop levels via Parabolic SAR

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **high_prices** *(json, required)* — High Prices (chronological double array)
- **low_prices** *(json, required)* — Low Prices (chronological double array)
- **close_prices** *(json, optional)* — Close Prices (required for ADX, ADXR, DX, PLUS_DI, MINUS_DI)
- **indicator_type** *(select, required)* — Indicator to compute
- **time_period** *(number, optional)* — Time Period (default 14 for ADX/ADXR/DX/DI/DM/AROON; range 2-100000)
- **acceleration** *(number, optional)* — SAR Acceleration Factor initial value (default 0.02; range 0-TA_REAL_MAX; typically ≤ 0.20)
- **maximum** *(number, optional)* — SAR Maximum Acceleration Factor (default 0.20; range 0-TA_REAL_MAX)
- **start_value** *(number, optional)* — SAREXT Initial SAR value (0 = auto-detect; default 0)
- **offset_on_reverse** *(number, optional)* — SAREXT Percentage offset applied to SAR on trend reversal (default 0)
- **acceleration_init_long** *(number, optional)* — SAREXT Acceleration Factor initial value for long positions (default 0.02)
- **acceleration_long** *(number, optional)* — SAREXT Acceleration Factor increment for long (default 0.02)
- **acceleration_max_long** *(number, optional)* — SAREXT Maximum Acceleration Factor for long (default 0.20)
- **acceleration_init_short** *(number, optional)* — SAREXT Acceleration Factor initial value for short (default 0.02)
- **acceleration_short** *(number, optional)* — SAREXT Acceleration Factor increment for short (default 0.02)
- **acceleration_max_short** *(number, optional)* — SAREXT Maximum Acceleration Factor for short (default 0.20)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Primary output (ADX, DX, PLUS_DI, MINUS_DI, PLUS_DM, MINUS_DM, AROONOSC, SAR values)
- **out_aroon_down** *(json, optional)* — AROON Down line values (0-100)
- **out_aroon_up** *(json, optional)* — AROON Up line values (0-100)

## What must be true

- **directional_movement_system → plus_dm:** +DM = UpMove > DownMove and UpMove > 0 ? UpMove : 0 where UpMove = High - PrevHigh
- **directional_movement_system → minus_dm:** -DM = DownMove > UpMove and DownMove > 0 ? DownMove : 0 where DownMove = PrevLow - Low
- **directional_movement_system → true_range:** TR = max(High - Low, abs(High - PrevClose), abs(Low - PrevClose))
- **directional_movement_system → smoothed:** +DI = Wilder_EMA(+DM, n) / Wilder_EMA(TR, n) * 100
- **directional_movement_system → dx:** DX = abs(+DI - -DI) / (+DI + -DI) * 100
- **directional_movement_system → adx:** ADX = Wilder_EMA(DX, n) — smoothed directional index
- **directional_movement_system → adxr:** ADXR = (ADX[today] + ADX[today - n]) / 2 — ADX Rating (further smoothed)
- **directional_movement_system → period_range:** 2 to 100000; default 14
- **directional_movement_system → lookback → dx:** 2 * timePeriod - 1
- **directional_movement_system → lookback → adx:** 3 * timePeriod - 2 (plus unstable period)
- **directional_movement_system → lookback → adxr:** 3 * timePeriod - 1
- **directional_movement_system → interpretation → strong_trend:** ADX > 25 indicates a strong trend in either direction
- **directional_movement_system → interpretation → very_strong:** ADX > 50 indicates a very strong trend
- **directional_movement_system → interpretation → no_trend:** ADX < 20 indicates a ranging/sideways market
- **directional_movement_system → interpretation → trend_direction:** +DI > -DI → uptrend; -DI > +DI → downtrend
- **directional_movement_system → interpretation → di_crossover:** Wilder's crossover rule: buy when +DI crosses above -DI while ADX > 25
- **directional_movement_system → note:** ADX does NOT indicate trend direction — only strength. Use +DI/-DI comparison for direction.
- **aroon → aroon_up:** ((timePeriod - periodsFromHigh) / timePeriod) * 100
- **aroon → aroon_down:** ((timePeriod - periodsFromLow) / timePeriod) * 100
- **aroon → aroonosc:** AroonUp - AroonDown
- **aroon → inputs_required:** High, Low
- **aroon → period_range:** 2 to 100000; default 14
- **aroon → output_aroon:** 0 to 100 (for each line)
- **aroon → output_aroonosc:** -100 to +100
- **aroon → lookback:** timePeriod
- **aroon → interpretation → strong_uptrend:** AroonUp > 70 and AroonDown < 30
- **aroon → interpretation → strong_downtrend:** AroonDown > 70 and AroonUp < 30
- **aroon → interpretation → consolidation:** Both lines near 50
- **aroon → interpretation → bullish_signal:** AroonUp crosses above AroonDown
- **aroon → interpretation → bearish_signal:** AroonDown crosses above AroonUp
- **parabolic_sar → formula → rising:** SAR[i] = SAR[i-1] + AF * (EP - SAR[i-1]) where EP = highest high since entry, AF = acceleration factor
- **parabolic_sar → formula → falling:** SAR[i] = SAR[i-1] + AF * (EP - SAR[i-1]) where EP = lowest low since entry
- **parabolic_sar → acceleration_default:** 0.02
- **parabolic_sar → acceleration_increment:** Increases by initial acceleration value (0.02) each time new EP is set
- **parabolic_sar → maximum_default:** 0.2
- **parabolic_sar → maximum_range:** 0 to TA_REAL_MAX; exceeding maximum caps AF
- **parabolic_sar → inputs_required:** High, Low
- **parabolic_sar → lookback:** 1
- **parabolic_sar → output:** SAR stop-and-reverse level for each bar (same price unit as input)
- **parabolic_sar → reversal_rule:** When price crosses SAR, trend reverses and SAR flips to opposite side
- **parabolic_sar → two_bar_rule:** SAR cannot be inside or beyond the two prior bars' price range (moves if needed)
- **parabolic_sar → trade_signal → long_exit:** Close falls below SAR → exit long / enter short
- **parabolic_sar → trade_signal → short_exit:** Close rises above SAR → exit short / enter long
- **sarext → additional_params → start_value:** Initial SAR position (0 = auto-detect from first two bars)
- **sarext → additional_params → offset_on_reverse:** Percentage offset applied to price when trend reverses (smooths whipsaws)
- **sarext → additional_params → per_side_acceleration:** Independent acceleration init/increment/max for long vs short
- **sarext → use_case:** Asymmetric volatility regimes where uptrend and downtrend have different momentum characteristics

## Success & failure scenarios

**✅ Success paths**

- **Compute Success** — when input_length > lookback_period for selected indicator; all required price arrays present; parameters within valid ranges, then Directional series aligned to input via outBegIdx.
- **Aroon Computed** — when indicator_type == AROON; input_length > timePeriod, then Two arrays representing days-since-high and days-since-low as normalized percentages.
- **Sar Reversal** — when indicator_type in [SAR, SAREXT]; out_values[latest] crossed by close_price, then SAR flips to opposite side of price; emit trade signal for stop-and-reverse.
- **Strong Trend Detected** — when indicator_type == ADX; out_values[latest] > 25, then Strong trend confirmed; momentum and trend-following signals are more reliable.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period, then No output; ADX especially requires 3×period bars — buffer accordingly. *(error: `INSUFFICIENT_DATA`)*
- **Invalid Parameters** — when time_period < 2 OR acceleration < 0 and indicator_type in [SAR, SAREXT] OR acceleration > maximum and indicator_type == SAR, then Function returns error; validate before calling. *(error: `INVALID_PARAMETER`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough historical bars. ADX requires approximately 3×period bars; AROON requires period+1.
- `INVALID_PARAMETER` — A parameter is out of range (period < 2, SAR acceleration > maximum, etc.).
- `MISSING_INPUT` — Close price array required for ADX, DX, +DI, -DI but not provided.

## Events

**`indicator.computed`**
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`indicator.sar_reversal`**
  Payload: `sar_value`, `close_price`, `direction`

**`indicator.trend_strength`**
  Payload: `adx_value`, `threshold`, `di_plus`, `di_minus`

## Connects to

- **momentum-oscillators** *(recommended)*
- **volatility-band-indicators** *(recommended)*
- **moving-average-overlap-studies** *(recommended)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/directional-movement-indicators/) · **Spec source:** [`directional-movement-indicators.blueprint.yaml`](./directional-movement-indicators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
