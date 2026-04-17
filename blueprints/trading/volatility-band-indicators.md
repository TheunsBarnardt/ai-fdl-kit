<!-- AUTO-GENERATED FROM volatility-band-indicators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Volatility Band Indicators

> A suite of volatility measurement and price band indicators for quantifying market risk, setting dynamic stop levels, and identifying breakout conditions across financial time series

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · volatility · atr · bollinger-bands · stddev · risk · ta-lib · indicators

## What this does

A suite of volatility measurement and price band indicators for quantifying market risk, setting dynamic stop levels, and identifying breakout conditions across financial time series

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **real_prices** *(json, optional)* — Price series — typically Close (required for BBANDS, STDDEV, VAR, AVGDEV)
- **high_prices** *(json, optional)* — High Prices (required for ATR, NATR, TRANGE, BETA-like range studies)
- **low_prices** *(json, optional)* — Low Prices (required for ATR, NATR, TRANGE)
- **close_prices** *(json, optional)* — Close Prices (required for ATR, NATR, TRANGE — previous close for True Range)
- **real0** *(json, optional)* — First price series for BETA / CORREL (e.g., asset returns)
- **real1** *(json, optional)* — Second price series for BETA / CORREL (e.g., benchmark returns)
- **indicator_type** *(select, required)* — Volatility indicator to compute
- **time_period** *(number, optional)* — Time Period (default by indicator: ATR=14, NATR=14, BBANDS=5, STDDEV=5, VAR=5, AVGDEV=14, BETA=5, CORREL=30)
- **nb_dev_up** *(number, optional)* — BBANDS Upper Band Deviation Multiplier (default 2.0; any real number)
- **nb_dev_dn** *(number, optional)* — BBANDS Lower Band Deviation Multiplier (default 2.0; any real number)
- **ma_type** *(select, optional)* — BBANDS Middle Band MA Type (default SMA)
- **nb_dev** *(number, optional)* — Standard Deviation / Variance multiplier for STDDEV/VAR output scaling (default 1.0)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Primary output array (ATR, NATR, TRANGE, STDDEV, VAR, AVGDEV, BETA, CORREL values)
- **out_upper_band** *(json, optional)* — BBANDS Upper Band values
- **out_middle_band** *(json, optional)* — BBANDS Middle Band values (MA of price)
- **out_lower_band** *(json, optional)* — BBANDS Lower Band values

## What must be true

- **true_range:** True Range captures overnight gaps by comparing to previous close, not just intraday High-Low spread
- **true_range → formula:** TR = max(High - Low, abs(High - PrevClose), abs(Low - PrevClose))
- **true_range → lookback:** 1
- **true_range → edge_case:** First bar has no PrevClose; TR = High - Low for bar[0]
- **true_range → inputs_required:** High, Low, Close
- **atr → formula:** ATR[0] = mean(TR[0..n-1]); ATR[i] = (ATR[i-1] * (n-1) + TR[i]) / n (Wilder smoothing)
- **atr → default_period:** 14
- **atr → period_range:** 1 to 100000
- **atr → lookback:** timePeriod (plus unstable period)
- **atr → output_unit:** Same unit as price (not percentage-normalized)
- **atr → use_cases → position_sizing:** Risk per trade = account_risk / ATR — position size adapts to volatility
- **atr → use_cases → stop_loss:** Stop distance = N * ATR (Chandelier Exit, Keltner Channels)
- **atr → use_cases → trailing_stop:** Trail by 2× or 3× ATR below highest close
- **atr → note:** Wilder smoothing is equivalent to EMA with alpha = 1/n (slower than standard EMA alpha 2/(n+1))
- **natr → formula:** NATR[i] = ATR[i] / Close[i] * 100
- **natr → default_period:** 14
- **natr → period_range:** 1 to 100000
- **natr → output_unit:** Percentage (%)
- **natr → output_range:** > 0 (cannot be negative)
- **natr → advantage:** Cross-instrument comparable — NATR of 1.5% on a $10 stock and a $1000 stock are equivalent volatility
- **natr → edge_case:** If Close = 0, NATR is undefined (division by zero)
- **bbands → formula → middle:** MiddleBand = MA(price, n)
- **bbands → formula → upper:** UpperBand = MiddleBand + nbDevUp * StdDev(price, n)
- **bbands → formula → lower:** LowerBand = MiddleBand - nbDevDn * StdDev(price, n)
- **bbands → defaults:** timePeriod=5, nbDevUp=2.0, nbDevDn=2.0, MAType=SMA
- **bbands → period_range:** 2 to 100000
- **bbands → outputs:** 3 arrays: upper, middle, lower bands
- **bbands → band_width:** bandwidth = (UpperBand - LowerBand) / MiddleBand — normalized volatility measure
- **bbands → percent_b:** %b = (price - LowerBand) / (UpperBand - LowerBand) — price position within bands
- **bbands → interpretation → squeeze:** Narrowing bands indicate low volatility / pre-breakout compression
- **bbands → interpretation → breakout:** Price closing above UpperBand or below LowerBand signals expansion
- **bbands → interpretation → walk_the_band:** Price can trend along a band; closure across does not automatically mean reversal
- **bbands → statistical_basis:** With SMA and nbDev=2, ~95% of prices fall within bands under normal distribution
- **stddev → formula:** STDDEV[i] = sqrt(sum((price[j] - mean(price, n))^2, j=i-n+1..i) / n) * nbDev
- **stddev → default_period:** 5
- **stddev → nb_dev_default:** 1
- **stddev → period_range:** 2 to 100000
- **stddev → output_unit:** Same unit as price
- **stddev → use_cases → volatility_filter:** High StdDev = noisy market; low StdDev = consolidation
- **stddev → use_cases → bbands_construction:** BBANDS internally calls STDDEV for band width calculation
- **variance → formula:** VAR[i] = STDDEV[i]^2 / nbDev^2
- **variance → default_period:** 5
- **variance → nb_dev_default:** 1
- **variance → note:** Variance is STDDEV squared; use when downstream statistical models need variance (e.g., portfolio optimization)
- **avgdev → formula:** AVGDEV[i] = sum(abs(price[j] - mean(price, n)), j=i-n+1..i) / n
- **avgdev → default_period:** 14
- **avgdev → note:** More robust than STDDEV to outliers; used internally by CCI's denominator
- **beta → formula:** Uses slope of linear regression of real0 vs real1 over the period
- **beta → default_period:** 5
- **beta → period_range:** 1 to 100000
- **beta → inputs_required:** real0 (asset), real1 (benchmark)
- **beta → output:** Rolling beta coefficient (typically >1 = more volatile than benchmark)
- **beta → use_cases:** Portfolio risk decomposition; hedge ratio calculation
- **correl → formula:** CORREL = cov(real0, real1, n) / (stddev(real0, n) * stddev(real1, n))
- **correl → default_period:** 30
- **correl → period_range:** 1 to 100000
- **correl → inputs_required:** real0, real1
- **correl → output_range:** -1 to +1
- **correl → use_cases:** Pair trading; portfolio diversification; asset correlation measurement

## Success & failure scenarios

**✅ Success paths**

- **Compute Success** — when input_length > lookback_period for selected indicator; required price arrays present; parameters within valid ranges, then Volatility series aligned to input via outBegIdx. _Why: Valid data and parameters — volatility metric computed._
- **Bbands Computed** — when indicator_type == BBANDS; input_length > (timePeriod - 1), then Three overlaid bands; bandwidth contraction (squeeze) precedes breakout. _Why: Bollinger Bands returns three aligned band arrays._
- **Volatility Expansion** — when indicator_type in [ATR, NATR]; out_values[latest] > 1.5 * mean(out_values[-20:]), then Volatility expansion signal — widen stops or reduce position size. _Why: ATR or NATR shows significant increase relative to recent average — potential breakout._

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period, then No valid output; buffer more bars. _Why: Input series shorter than required lookback._ *(error: `INSUFFICIENT_DATA`)*
- **Invalid Parameters** — when time_period < 1 and indicator_type in [ATR, NATR] OR time_period < 2 and indicator_type in [BBANDS, STDDEV, VAR] OR nb_dev_up == 0 and nb_dev_dn == 0 and indicator_type == BBANDS, then Function returns error code; validate parameters before calling. _Why: A period or deviation multiplier parameter is out of range._ *(error: `INVALID_PARAMETER`)*
- **Natr Zero Close** — when indicator_type == NATR; any close_prices value == 0, then NATR output undefined at that bar; caller must filter zero-price bars. _Why: Close price is zero — NATR denominator undefined._ *(error: `INVALID_INPUT`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough historical bars. ATR requires at least timePeriod bars; BBANDS requires timePeriod.
- `INVALID_PARAMETER` — A parameter is outside its valid range (period < 1 for ATR/NATR, < 2 for BBANDS/STDDEV).
- `INVALID_INPUT` — A price value is zero or non-finite, causing division by zero in NATR.

## Events

**`volatility.computed`** — Emitted when a volatility indicator computation completes
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`volatility.expansion`** — Emitted when ATR or NATR increases significantly above its recent average
  Payload: `indicator_type`, `latest_value`, `expansion_ratio`

**`volatility.squeeze`** — Emitted when BBANDS bandwidth contracts below a configurable threshold
  Payload: `bandwidth`, `middle_band_value`

## Connects to

- **momentum-oscillators**
- **moving-average-overlap-studies**
- **directional-movement-indicators**
- **market-data-feeds**
- **regulation-28-compliance**

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/volatility-band-indicators/) · **Spec source:** [`volatility-band-indicators.blueprint.yaml`](./volatility-band-indicators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
