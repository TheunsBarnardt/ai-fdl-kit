<!-- AUTO-GENERATED FROM volume-flow-indicators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Volume Flow Indicators

> Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging from price trend signals

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · volume · obv · accumulation-distribution · money-flow · ta-lib · indicators

## What this does

Volume-based flow indicators that track accumulation, distribution, and buying/selling pressure by weighting price action with volume — confirming or diverging from price trend signals

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **close_prices** *(json, required)* — Close Prices (chronological double array)
- **high_prices** *(json, optional)* — High Prices (required for AD, ADOSC, MFI)
- **low_prices** *(json, optional)* — Low Prices (required for AD, ADOSC, MFI)
- **volume** *(json, required)* — Volume series (chronological double array; required for all four indicators)
- **indicator_type** *(select, required)* — Volume indicator to compute
- **fast_period** *(number, optional)* — ADOSC Fast EMA Period (default 3; range 2-100000)
- **slow_period** *(number, optional)* — ADOSC Slow EMA Period (default 10; range 2-100000)
- **time_period** *(number, optional)* — MFI Time Period (default 14; range 2-100000)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Indicator output array (double values; unbounded for OBV/AD/ADOSC; 0-100 for MFI)

## What must be true

- **obv → formula:** OBV[0] = Volume[0]; OBV[i] = OBV[i-1] + Volume[i] if Close[i] > Close[i-1] else OBV[i-1] - Volume[i] if Close[i] < Close[i-1] else OBV[i-1]
- **obv → inputs_required:** Close, Volume
- **obv → lookback:** 0
- **obv → output_unit:** Cumulative volume (no price normalization)
- **obv → output_range:** Unbounded (can be very large; sign is directional)
- **obv → divergence_rule:** Price making new high while OBV fails to confirm → bearish divergence
- **obv → note:** OBV starting value depends on the first bar in the dataset; absolute level is arbitrary — only trend and divergence matter
- **ad → formula → clv:** CLV = ((Close - Low) - (High - Close)) / (High - Low) [Close Location Value, -1 to +1]
- **ad → formula → mf:** MoneyFlow = CLV * Volume
- **ad → formula → ad:** AD[i] = AD[i-1] + MoneyFlow[i]
- **ad → inputs_required:** High, Low, Close, Volume
- **ad → lookback:** 0
- **ad → output_unit:** Cumulative volume-weighted money flow
- **ad → output_range:** Unbounded
- **ad → edge_case:** When High == Low, CLV = 0 (no price range) → no money flow added
- **ad → divergence_rule:** Price rising while AD falling → distribution (bearish divergence)
- **ad → advantage_over_obv:** AD uses CLV to weight volume by position of close within the day's range, not just direction of close vs. previous close
- **adosc → formula:** ADOSC = EMA(AD, fast) - EMA(AD, slow)
- **adosc → inputs_required:** High, Low, Close, Volume
- **adosc → defaults:** fast=3, slow=10
- **adosc → period_range:** 2 to 100000 for both
- **adosc → lookback:** slow_period - 1
- **adosc → output_unit:** Rate of change in money flow (derivative of AD)
- **adosc → output_range:** Unbounded (oscillates around zero)
- **adosc → interpretation → positive:** ADOSC > 0 → accumulation dominant (buying pressure)
- **adosc → interpretation → negative:** ADOSC < 0 → distribution dominant (selling pressure)
- **adosc → interpretation → zero_cross:** ADOSC crossing zero signals potential trend change in money flow
- **mfi → formula → typical_price:** TP = (High + Low + Close) / 3
- **mfi → formula → raw_money_flow:** RMF = TP * Volume
- **mfi → formula → classification:** Positive MF if TP > PrevTP; Negative MF if TP < PrevTP; unchanged if TP == PrevTP
- **mfi → formula → mfi:** MFI = 100 - 100 / (1 + PosMF_sum / NegMF_sum) over n periods
- **mfi → inputs_required:** High, Low, Close, Volume
- **mfi → default_period:** 14
- **mfi → period_range:** 2 to 100000
- **mfi → lookback:** timePeriod
- **mfi → output_range:** 0 to 100
- **mfi → interpretation → overbought:** > 80
- **mfi → interpretation → oversold:** < 20
- **mfi → edge_case:** When NegMF_sum = 0, MFI = 100 (all positive money flow in period)

## Success & failure scenarios

**✅ Success paths**

- **Flat Bar Edge** — when indicator_type in [AD, ADOSC]; any bar has High == Low, then Flat bars contribute zero to AD accumulation — no error, handled gracefully.
- **Compute Success** — when input_length > lookback_period for selected indicator; close_prices, volume, and required OHLC arrays present and equal length, then Volume-weighted flow series aligned to input; divergence analysis against price trend.
- **Bullish Divergence** — when indicator_type in [OBV, AD]; close_prices makes new n-bar low; out_values does not make new n-bar low, then Bullish divergence signal — potential price reversal to the upside.
- **Bearish Divergence** — when indicator_type in [OBV, AD]; close_prices makes new n-bar high; out_values does not make new n-bar high, then Bearish divergence signal — potential price reversal to the downside.
- **Mfi Overbought** — when indicator_type == MFI; out_values[latest] > 80, then Volume-confirmed overbought — higher confidence reversal signal than RSI alone.
- **Mfi Oversold** — when indicator_type == MFI; out_values[latest] < 20, then Volume-confirmed oversold — higher confidence reversal signal than RSI alone.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= lookback_period, then No output produced. *(error: `INSUFFICIENT_DATA`)*
- **Missing Volume** — when volume is null or empty, then Cannot compute any volume flow indicator without volume data. *(error: `MISSING_INPUT`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough bars. ADOSC requires slow_period bars minimum; MFI requires time_period bars.
- `MISSING_INPUT` — Volume array is required for all volume flow indicators. High and Low are required for AD, ADOSC, and MFI.
- `INVALID_PARAMETER` — Period parameter out of range (MFI period < 2, or ADOSC slow < fast).

## Events

**`volume.computed`**
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

**`volume.bullish_divergence`**
  Payload: `indicator_type`, `price_low`, `indicator_value`

**`volume.bearish_divergence`**
  Payload: `indicator_type`, `price_high`, `indicator_value`

**`volume.overbought`**
  Payload: `indicator_type`, `value`, `threshold`

**`volume.oversold`**
  Payload: `indicator_type`, `value`, `threshold`

## Connects to

- **momentum-oscillators** *(recommended)*
- **directional-movement-indicators** *(recommended)*
- **volatility-band-indicators** *(optional)*
- **candlestick-pattern-recognition** *(optional)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/volume-flow-indicators/) · **Spec source:** [`volume-flow-indicators.blueprint.yaml`](./volume-flow-indicators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
