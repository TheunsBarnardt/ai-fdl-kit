<!-- AUTO-GENERATED FROM momentum-oscillators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Momentum Oscillators

> A suite of momentum oscillators for identifying overbought/oversold conditions, trend reversal signals, and price momentum strength across financial time series data

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · momentum · oscillators · rsi · macd · stochastic · cci · ta-lib · indicators

## What this does

A suite of momentum oscillators for identifying overbought/oversold conditions, trend reversal signals, and price momentum strength across financial time series data

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **close_prices** *(json, required)* — Close Prices (chronological double array; minimum length = lookback + 1)
- **high_prices** *(json, optional)* — High Prices (required for CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI)
- **low_prices** *(json, optional)* — Low Prices (required for CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI)
- **open_prices** *(json, optional)* — Open Prices (required for BOP only)
- **volume** *(json, optional)* — Volume series (required for MFI only)
- **indicator_type** *(select, required)* — Oscillator to compute
- **time_period** *(number, optional)* — Time Period (default by indicator: RSI=14, CCI=14, WILLR=14, MOM=10, CMO=14, MFI=14, STOCHRSI=14; range 2-100000)
- **fast_period** *(number, optional)* — Fast MA Period (default 12; range 2-100000)
- **slow_period** *(number, optional)* — Slow MA Period (default 26; range 2-100000)
- **signal_period** *(number, optional)* — Signal Line Smoothing Period (default 9; range 1-100000)
- **ma_type** *(select, optional)* — Moving Average Type (SMA=0, EMA=1, WMA=2, DEMA=3, TEMA=4, TRIMA=5, KAMA=6, MAMA=7, T3=8; default SMA for APO/PPO)
- **fast_k_period** *(number, optional)* — Fast %K Lookback Period (default 5; range 1-100000)
- **slow_k_period** *(number, optional)* — Slow %K Smoothing Period (default 3; range 1-100000 — usually 3)
- **slow_k_ma_type** *(select, optional)* — Slow %K MA Type (default SMA)
- **slow_d_period** *(number, optional)* — Slow %D Smoothing Period (default 3; range 1-100000)
- **slow_d_ma_type** *(select, optional)* — Slow %D MA Type (default SMA)
- **fast_d_period** *(number, optional)* — StochRSI Fast %D Smoothing Period (default 3)
- **fast_d_ma_type** *(select, optional)* — StochRSI Fast %D MA Type (default SMA)
- **period1** *(number, optional)* — Ultimate Oscillator Period 1 (default 7; range 1-100000)
- **period2** *(number, optional)* — Ultimate Oscillator Period 2 (default 14; range 2-100000)
- **period3** *(number, optional)* — Ultimate Oscillator Period 3 (default 28; range 2-100000)
- **out_beg_idx** *(number, optional)* — Output Begin Index (first index in input that corresponds to first output value)
- **out_nb_element** *(number, optional)* — Number of output elements produced
- **out_values** *(json, optional)* — Primary output array (indicator values; double array)
- **out_signal** *(json, optional)* — Secondary output (MACD signal line, STOCH slowD, STOCHRSI fastD, AROON down line)
- **out_hist** *(json, optional)* — Tertiary output (MACD histogram, AROON up line)

## What must be true

- **lookback_model:** The first `lookback` input bars produce no output. outBegIdx tells the caller which input index maps to out[0]. outNBElement is the count of valid output values.
- **lookback_model → formula:** valid_output_count = input_length - lookback_period
- **lookback_model → constraint:** If input_length <= lookback_period, outNBElement = 0 (no valid output)
- **rsi → formula:** RS = avgGain / avgLoss (Wilder smoothing); RSI = 100 - 100 / (1 + RS)
- **rsi → default_period:** 14
- **rsi → period_range:** 2 to 100000
- **rsi → output_range:** 0 to 100
- **rsi → lookback:** timePeriod + unstable_period (configurable via TA_SetUnstablePeriod)
- **rsi → interpretation → overbought:** > 70 (conventional threshold)
- **rsi → interpretation → oversold:** < 30 (conventional threshold)
- **rsi → edge_case:** When avgLoss = 0, RSI = 100 (no losing periods)
- **macd → formula:** MACD_line = EMA(close, fast) - EMA(close, slow); Signal = EMA(MACD_line, signal); Histogram = MACD_line - Signal
- **macd → defaults:** fast=12, slow=26, signal=9
- **macd → period_range:** fast/slow 2-100000; signal 1-100000
- **macd → outputs:** 3 arrays: macd_line, signal_line, histogram
- **macd → swap_rule:** If slow < fast, periods are automatically swapped to ensure slow >= fast
- **macd → macdfix:** MACDFIX hardcodes fast=12 slow=26; only signal period is configurable
- **macd → macdext:** MACDEXT allows custom MA types for fast, slow, and signal lines
- **macd → interpretation → bullish_crossover:** MACD line crosses above signal line
- **macd → interpretation → bearish_crossover:** MACD line crosses below signal line
- **macd → interpretation → zero_cross:** MACD line crossing zero confirms trend direction
- **stochastic → stoch_formula:** RawK = (Close - LowestLow(fastK)) / (HighestHigh(fastK) - LowestLow(fastK)) * 100; SlowK = MA(RawK, slowK); SlowD = MA(SlowK, slowD)
- **stochastic → stochf_formula:** FastK = RawK; FastD = MA(FastK, fastD)
- **stochastic → stochrsi_formula:** RSI_val computed first; StochRSI = (RSI - lowestRSI) / (highestRSI - lowestRSI)
- **stochastic → defaults:** fastK=5, slowK=3, slowD=3, MA type=SMA
- **stochastic → output_range:** 0 to 100
- **stochastic → interpretation → overbought:** > 80
- **stochastic → interpretation → oversold:** < 20
- **stochastic → interpretation → signal:** K line crossing D line
- **stochastic → edge_case:** When highestHigh - lowestLow = 0, output is 0 (no range)
- **cci → formula:** TypPrice = (High + Low + Close) / 3; CCI = (TypPrice - SMA(TypPrice, n)) / (0.015 * MeanDeviation(TypPrice, n))
- **cci → default_period:** 14
- **cci → period_range:** 2 to 100000
- **cci → output_range:** unbounded (typically -300 to +300)
- **cci → interpretation → overbought:** > +100
- **cci → interpretation → oversold:** < -100
- **cci → constant:** 0.015 ensures ~70-80% of values fall within ±100
- **williams_r → formula:** WILLR = (HighestHigh(n) - Close) / (HighestHigh(n) - LowestLow(n)) * -100
- **williams_r → default_period:** 14
- **williams_r → period_range:** 2 to 100000
- **williams_r → output_range:** -100 to 0
- **williams_r → interpretation → overbought:** > -20 (near 0)
- **williams_r → interpretation → oversold:** < -80 (near -100)
- **williams_r → note:** Inverse of Fast Stochastic %K — multiply by -1 for equivalent
- **momentum_mom → formula:** MOM = Close[i] - Close[i - n]
- **momentum_mom → default_period:** 10
- **momentum_mom → period_range:** 1 to 100000
- **momentum_mom → output_range:** unbounded (raw price difference)
- **momentum_mom → note:** No normalization — magnitude is price-unit dependent
- **cmo → formula:** CMO = (SumUp - SumDown) / (SumUp + SumDown) * 100
- **cmo → default_period:** 14
- **cmo → output_range:** -100 to +100
- **cmo → interpretation → strong_uptrend:** > +50
- **cmo → interpretation → strong_downtrend:** < -50
- **bop → formula:** BOP = (Close - Open) / (High - Low)
- **bop → inputs_required:** Open, High, Low, Close
- **bop → output_range:** -1 to +1
- **bop → edge_case:** When High == Low, output = 0 (no candle range)
- **apo_ppo → apo_formula:** APO = MA(close, fast) - MA(close, slow)
- **apo_ppo → ppo_formula:** PPO = (MA(close, fast) - MA(close, slow)) / MA(close, slow) * 100
- **apo_ppo → defaults:** fast=12, slow=26, MA type=SMA
- **apo_ppo → ppo_advantage:** PPO is normalized as percentage, comparable across different price levels
- **ultosc → formula:** BuyingPressure = Close - min(Low, PrevClose); TrueRange = max(High, PrevClose) - min(Low, PrevClose); BP1/TR1 averaged over period1, BP2/TR2 over period2, BP3/TR3 over period3; UltOsc = 100 * (4*avg1 + 2*avg2 + avg3) / 7
- **ultosc → defaults:** period1=7, period2=14, period3=28
- **ultosc → output_range:** 0 to 100
- **ultosc → interpretation → overbought:** > 70
- **ultosc → interpretation → oversold:** < 30
- **mfi → formula:** TypicalPrice = (High + Low + Close) / 3; RawMoneyFlow = TP * Volume; PositiveMF if TP > PrevTP else NegativeMF; MFI = 100 - 100 / (1 + PosMF/NegMF)
- **mfi → default_period:** 14
- **mfi → period_range:** 2 to 100000
- **mfi → output_range:** 0 to 100
- **mfi → inputs_required:** High, Low, Close, Volume
- **mfi → interpretation → overbought:** > 80
- **mfi → interpretation → oversold:** < 20
- **aroon → aroon_up_formula:** ((period - periodsFromHigh) / period) * 100
- **aroon → aroon_down_formula:** ((period - periodsFromLow) / period) * 100
- **aroon → aroonosc_formula:** AroonUp - AroonDown
- **aroon → default_period:** 14
- **aroon → output_range:** 0 to 100 (AROON); -100 to +100 (AROONOSC)
- **aroon → inputs_required:** High, Low
- **aroon → outputs:** 2 arrays for AROON (AroonDown, AroonUp); 1 array for AROONOSC

## Success & failure scenarios

**✅ Success paths**

- **Range Clamp Edge** — when High == Low for all bars in period and indicator_type in [WILLR, STOCH, BOP] OR SumUp + SumDown == 0 and indicator_type == CMO OR PosMF + NegMF == 0 and indicator_type == MFI, then Output clamped to boundary — indicates flat market with no price movement. _Why: Edge case where denominator is zero (flat price bar or zero volume period)._
- **Compute Success** — when input_length > lookback_period for selected indicator; all required price arrays present and of equal length; all optional parameters within valid ranges, then out_values contains valid oscillator readings; caller aligns output to input using outBegIdx. _Why: Sufficient data and valid parameters — indicator computed, output arrays populated._
- **Macd Computed** — when indicator_type in [MACD, MACDEXT, MACDFIX]; input_length > lookback_period, then Three aligned output arrays; histogram crossing zero indicates signal crossover. _Why: MACD / MACDEXT / MACDFIX computed with all three output lines._
- **Aroon Computed** — when indicator_type == AROON; input_length > lookback_period, then Two arrays: AroonDown and AroonUp, both in range [0,100]. _Why: AROON returns two output lines (AroonDown + AroonUp)._

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period for selected indicator, then outNBElement = 0; caller must provide more bars before meaningful output is available. _Why: Input series shorter than required lookback — no output produced._ *(error: `INSUFFICIENT_DATA`)*
- **Invalid Parameters** — when time_period < 2 and indicator_type in [RSI, CCI, WILLR, CMO, MFI, STOCH] OR fast_period < 2 and indicator_type in [MACD, APO, PPO] OR slow_period < fast_period and indicator_type == MACD OR period1 < 1 or period2 < 2 or period3 < 2 and indicator_type == ULTOSC, then Function returns error code; caller must validate parameters before calling. _Why: A required parameter is outside its valid range._ *(error: `INVALID_PARAMETER`)*
- **Missing Required Inputs** — when high_prices is null and indicator_type in [CCI, WILLR, STOCH, STOCHF, STOCHRSI, ULTOSC, MFI, AROON, AROONOSC] OR volume is null and indicator_type == MFI OR open_prices is null and indicator_type == BOP, then Invalid output; ensure all required price arrays are supplied. _Why: High/Low/Volume arrays absent when required by the selected indicator._ *(error: `MISSING_INPUT`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough historical bars to compute indicator. Provide at least lookback + 1 data points.
- `INVALID_PARAMETER` — One or more parameters are outside their valid range. Check period constraints.
- `MISSING_INPUT` — Required price series (High, Low, Volume, Open) not provided for the selected indicator.

## Events

**`indicator.computed`** — Emitted when an oscillator computation completes with valid output
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`indicator.overbought`** — Emitted when the latest value exceeds the conventional overbought threshold (RSI>70, MFI>80, etc.)
  Payload: `indicator_type`, `value`, `threshold`

**`indicator.oversold`** — Emitted when the latest value falls below the conventional oversold threshold
  Payload: `indicator_type`, `value`, `threshold`

**`indicator.crossover`** — Emitted when MACD or Stochastic K/D lines cross (signal confirmation)
  Payload: `indicator_type`, `direction`, `value`

## Connects to

- **moving-average-overlap-studies**
- **volatility-band-indicators**
- **directional-movement-indicators**
- **volume-flow-indicators**
- **candlestick-pattern-recognition**
- **market-data-feeds**

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/momentum-oscillators/) · **Spec source:** [`momentum-oscillators.blueprint.yaml`](./momentum-oscillators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
