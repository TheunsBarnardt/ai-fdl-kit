<!-- AUTO-GENERATED FROM statistical-functions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Statistical Functions

> Linear regression and time-series forecast functions that fit a least-squares line to a rolling price window, extracting slope, intercept, endpoint, and one-bar-ahead forecast values

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · statistics · linear-regression · time-series-forecast · ta-lib · indicators

## What this does

Linear regression and time-series forecast functions that fit a least-squares line to a rolling price window, extracting slope, intercept, endpoint, and one-bar-ahead forecast values

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **real_prices** *(json, required)* — Price series (typically Close; chronological double array)
- **indicator_type** *(select, required)* — Statistical function to compute
- **time_period** *(number, optional)* — Time Period — rolling window length (default 14; range 2-100000)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Output array (double values; units depend on indicator_type)

## What must be true

- **lookback_model → lookback:** timePeriod - 1
- **lookback_model → formula:** valid_output_count = input_length - (timePeriod - 1)
- **linearreg → formula:** Least-squares line over the window [i-n+1 .. i]; output is the VALUE of that line at bar i
- **linearreg → default_period:** 14
- **linearreg → period_range:** 2 to 100000
- **linearreg → output_unit:** Same unit as input price
- **linearreg → use_case:** Dynamic trend line value; substitute for moving average with better fit to recent data
- **linearreg → interpretation → above_price:** Price above LINEARREG line indicates upward trend bias
- **linearreg → interpretation → slope_direction:** Direction of line shift indicates momentum
- **linearreg_angle → formula:** angle = atan(slope) * (180 / pi) — slope of the regression line converted to degrees
- **linearreg_angle → default_period:** 14
- **linearreg_angle → output_unit:** Degrees (-90 to +90)
- **linearreg_angle → output_range:** -90 to +90
- **linearreg_angle → interpretation → strong_uptrend:** Angle > 45° — steep upward slope
- **linearreg_angle → interpretation → strong_downtrend:** Angle < -45° — steep downward slope
- **linearreg_angle → interpretation → flat:** Angle near 0° — consolidation or sideways trend
- **linearreg_intercept → formula:** y-intercept of least-squares line for window ending at bar i (value at the start of the window)
- **linearreg_intercept → default_period:** 14
- **linearreg_intercept → output_unit:** Same unit as input price
- **linearreg_intercept → use_case:** Rarely used directly; building block for computing slope and regression line
- **linearreg_slope → formula:** slope = (n * sum(x*y) - sum(x) * sum(y)) / (n * sum(x^2) - sum(x)^2) where x = bar index, y = price
- **linearreg_slope → default_period:** 14
- **linearreg_slope → output_unit:** Price units per bar (e.g., $/bar)
- **linearreg_slope → output_range:** Unbounded
- **linearreg_slope → interpretation → positive:** Positive slope — price trending up over the window
- **linearreg_slope → interpretation → negative:** Negative slope — price trending down
- **linearreg_slope → interpretation → magnitude:** Larger absolute slope = steeper trend
- **tsf → formula:** TSF[i] = LINEARREG[i] + LINEARREG_SLOPE[i] — adds one more step to the endpoint
- **tsf → default_period:** 14
- **tsf → period_range:** 2 to 100000
- **tsf → output_unit:** Same unit as input price
- **tsf → use_case:** One-bar-ahead price forecast based on linear trend; used as a dynamic support/resistance level
- **tsf → note:** TSF leads LINEARREG by exactly one bar in trend direction; not a true predictive model
- **tsf → warning:** TSF assumes price continues on the current linear slope — fails at inflection points

## Success & failure scenarios

**✅ Success paths**

- **Compute Success** — when input_length > timePeriod - 1; real_prices present and non-empty; time_period >= 2, then Output array aligned to input via outBegIdx; caller must offset by timePeriod-1 bars.

**❌ Failure paths**

- **Insufficient Data** — when input_length <= timePeriod - 1, then No output; provide at least timePeriod bars. *(error: `INSUFFICIENT_DATA`)*
- **Invalid Period** — when time_period < 2, then Period must be at least 2 for a meaningful regression line. *(error: `INVALID_PARAMETER`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough bars. Provide at least timePeriod data points.
- `INVALID_PARAMETER` — time_period must be >= 2.

## Events

**`statfunc.computed`**
  Payload: `indicator_type`, `out_nb_element`, `out_beg_idx`

## Connects to

- **moving-average-overlap-studies** *(recommended)*
- **volatility-band-indicators** *(recommended)*
- **momentum-oscillators** *(optional)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/statistical-functions/) · **Spec source:** [`statistical-functions.blueprint.yaml`](./statistical-functions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
