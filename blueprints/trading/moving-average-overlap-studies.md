<!-- AUTO-GENERATED FROM moving-average-overlap-studies.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Moving Average Overlap Studies

> A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on price charts

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · moving-averages · trend · overlap · sma · ema · bollinger · ta-lib · indicators

## What this does

A comprehensive suite of moving average and trend overlay indicators that smooth price series, identify trend direction, and generate overlap bands overlaid on price charts

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **real_prices** *(json, required)* — Price series (typically Close; chronological double array)
- **high_prices** *(json, optional)* — High Prices (required for ACCBANDS, MIDPRICE)
- **low_prices** *(json, optional)* — Low Prices (required for ACCBANDS, MIDPRICE)
- **close_prices** *(json, optional)* — Close Prices (required for ACCBANDS when computing middle band)
- **periods** *(json, optional)* — Variable period array (required for MAVP — one period value per input bar)
- **indicator_type** *(select, required)* — Moving average or overlap study to compute
- **time_period** *(number, optional)* — Time Period (default by indicator: SMA/EMA/WMA/TRIMA/KAMA=30, DEMA/TEMA=30, T3=5, MIDPOINT=14, MIDPRICE=14, ACCBANDS=20)
- **ma_type** *(select, optional)* — MA Type for generic MA function (SMA=0, EMA=1, WMA=2, DEMA=3, TEMA=4, TRIMA=5, KAMA=6, MAMA=7, T3=8)
- **fast_limit** *(number, optional)* — MAMA Fast Limit — upper bound of adaptive alpha (default 0.5; range 0.01-0.99)
- **slow_limit** *(number, optional)* — MAMA Slow Limit — lower bound of adaptive alpha (default 0.05; range 0.01-0.99)
- **v_factor** *(number, optional)* — T3 Volume Factor — controls smoothness (default 0.7; range 0-1; 0=DEMA-like, 1=EMA)
- **min_period** *(number, optional)* — MAVP Minimum Period (default 2; range 2-100000)
- **max_period** *(number, optional)* — MAVP Maximum Period (default 30; range 2-100000)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Primary output array (trend/MA values; double array)
- **out_upper_band** *(json, optional)* — Upper band (ACCBANDS only)
- **out_middle_band** *(json, optional)* — Middle band (ACCBANDS only)
- **out_lower_band** *(json, optional)* — Lower band (ACCBANDS only)
- **out_mama** *(json, optional)* — MAMA output (MAMA indicator only)
- **out_fama** *(json, optional)* — FAMA (Following Adaptive Moving Average) output (MAMA indicator only)

## What must be true

- **lookback_model → constraint:** If input_length <= lookback, outNBElement = 0
- **sma → formula:** SMA[i] = sum(price[i-n+1 .. i]) / n
- **sma → default_period:** 30
- **sma → period_range:** 2 to 100000
- **sma → lookback:** timePeriod - 1
- **sma → characteristic:** Gives equal weight to all periods; lags more than EMA
- **ema → formula:** EMA[i] = price[i] * k + EMA[i-1] * (1 - k) where k = 2 / (timePeriod + 1)
- **ema → default_period:** 30
- **ema → period_range:** 2 to 100000
- **ema → lookback:** timePeriod - 1 (plus unstable period for numerical stability)
- **ema → characteristic:** Exponential weighting reduces lag vs SMA; recent prices weighted more heavily
- **dema → formula:** DEMA = 2 * EMA(price, n) - EMA(EMA(price, n), n)
- **dema → default_period:** 30
- **dema → lookback:** (timePeriod - 1) * 2
- **dema → characteristic:** Reduces EMA lag by removing trend component; more responsive than EMA
- **tema → formula:** TEMA = 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
- **tema → default_period:** 30
- **tema → lookback:** (timePeriod - 1) * 3
- **tema → characteristic:** Further lag reduction vs DEMA; most responsive but noisier
- **wma → formula:** WMA[i] = (n*price[i] + (n-1)*price[i-1] + ... + 1*price[i-n+1]) / (n*(n+1)/2)
- **wma → default_period:** 30
- **wma → period_range:** 2 to 100000
- **wma → lookback:** timePeriod - 1
- **wma → characteristic:** Linearly decreasing weights; more recent data emphasized, less lag than SMA
- **trima → formula:** TRIMA = SMA(SMA(price, ceil(n/2)), floor(n/2) + 1) — double-smoothed SMA
- **trima → default_period:** 30
- **trima → period_range:** 2 to 100000
- **trima → characteristic:** Double-smoothed SMA; centermost data weighted most heavily; very smooth but high lag
- **kama → formula:** ER = abs(close - close[n-1]) / sum(abs(close[i] - close[i-1]), n); SC = (ER * (fast-slow) + slow)^2; KAMA[i] = KAMA[i-1] + SC * (price - KAMA[i-1])
- **kama → default_period:** 10
- **kama → period_range:** 2 to 100000
- **kama → characteristic:** Adapts speed to market efficiency: fast in trending markets, slow in choppy markets
- **mama → formula:** Uses Hilbert Transform cycle measurement to adapt EMA multiplier; FAMA = 0.5 * MAMA + 0.5 * FAMA[i-1]
- **mama → fast_limit_default:** 0.5
- **mama → slow_limit_default:** 0.05
- **mama → limit_range:** 0.01 to 0.99 for both limits
- **mama → outputs:** 2 arrays: MAMA and FAMA (Following Adaptive Moving Average)
- **mama → characteristic:** Adapts to dominant market cycle; MAMA/FAMA crossover generates buy/sell signals
- **t3 → formula:** Applies EMA six times with GD = EMA * (1 + vFactor) - EMA(EMA) * vFactor; T3 = GD(GD(GD))
- **t3 → default_period:** 5
- **t3 → v_factor_default:** 0.7
- **t3 → v_factor_range:** 0 to 1
- **t3 → lookback:** (timePeriod - 1) * 6
- **t3 → characteristic:** Smoother than TEMA with less overshoot; vFactor controls smoothness-responsiveness tradeoff
- **ma_generic → default_period:** 30
- **mavp → min_period_default:** 2
- **mavp → max_period_default:** 30
- **mavp → characteristic:** Allows cycle-adaptive smoothing; each bar's period is dynamically supplied
- **accbands → formula:** UpperBand = SMA(High * (1 + 4 * (High - Low) / (High + Low)), n); LowerBand = SMA(Low * (1 - 4 * (High - Low) / (High + Low)), n); MiddleBand = SMA(Close, n)
- **accbands → default_period:** 20
- **accbands → period_range:** 2 to 100000
- **accbands → outputs:** 3 arrays: upper, middle, lower bands
- **accbands → characteristic:** Bands expand during high volatility; price outside bands signals acceleration
- **midpoint → formula:** MIDPOINT[i] = (max(price[i-n+1..i]) + min(price[i-n+1..i])) / 2
- **midpoint → default_period:** 14
- **midpoint → period_range:** 2 to 100000
- **midpoint → input:** Single price series (typically Close)
- **midprice → formula:** MIDPRICE[i] = (max(High[i-n+1..i]) + min(Low[i-n+1..i])) / 2
- **midprice → default_period:** 14
- **midprice → period_range:** 2 to 100000
- **midprice → inputs_required:** High, Low
- **ht_trendline → lookback:** 63
- **ht_trendline → characteristic:** Zero-lag trend extraction; best in trending markets; noisy in ranging markets

## Success & failure scenarios

**✅ Success paths**

- **Compute Success** — when input_length > lookback_period for selected indicator; required price arrays present; parameters within valid ranges, then Smoothed trend series aligned to input via outBegIdx.
- **Accbands Computed** — when indicator_type == ACCBANDS; input_length > lookback_period, then Three overlaid bands on price chart; breakout above upper signals acceleration.
- **Mama Computed** — when indicator_type == MAMA; input_length > 32 (MAMA lookback ~32), then Two adaptive trend lines; MAMA/FAMA crossover signals trend change.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period, then No output produced; caller must buffer more bars. *(error: `INSUFFICIENT_DATA`)*
- **Invalid Parameters** — when time_period < 2 OR fast_limit > slow_limit and indicator_type == MAMA OR v_factor < 0 or v_factor > 1 and indicator_type == T3 OR min_period > max_period and indicator_type == MAVP, then Function returns error; caller must supply valid parameter ranges. *(error: `INVALID_PARAMETER`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough historical bars. Provide at least lookback + 1 data points.
- `INVALID_PARAMETER` — A parameter is outside its valid range (e.g., period < 2, MAMA fast_limit > slow_limit).
- `MISSING_INPUT` — High or Low price array missing for ACCBANDS or MIDPRICE.

## Events

**`indicator.computed`**
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`indicator.crossover`**
  Payload: `indicator_type`, `direction`, `value`

## Connects to

- **momentum-oscillators** *(required)*
- **volatility-band-indicators** *(recommended)*
- **directional-movement-indicators** *(recommended)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/moving-average-overlap-studies/) · **Spec source:** [`moving-average-overlap-studies.blueprint.yaml`](./moving-average-overlap-studies.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
