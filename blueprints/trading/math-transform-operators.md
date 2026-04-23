<!-- AUTO-GENERATED FROM math-transform-operators.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Math Transform Operators

> Element-wise and rolling-window mathematical utility functions operating on price series — arithmetic operators, period extrema, rounding, logarithms, exponentials, and trigonometric transforms

**Category:** Trading · **Version:** 1.0.0 · **Tags:** technical-analysis · math · arithmetic · transform · trigonometry · ta-lib · utilities

## What this does

Element-wise and rolling-window mathematical utility functions operating on price series — arithmetic operators, period extrema, rounding, logarithms, exponentials, and trigonometric transforms

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **real0** *(json, optional)* — First input series (required for binary operators ADD, SUB, MULT, DIV and all single-array functions)
- **real1** *(json, optional)* — Second input series (required for binary operators ADD, SUB, MULT, DIV only)
- **function_type** *(select, required)* — Math function to apply
- **time_period** *(number, optional)* — Rolling window period (required for MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM; default 30; range 2-100000)
- **out_beg_idx** *(number, optional)* — Output Begin Index
- **out_nb_element** *(number, optional)* — Number of valid output elements
- **out_values** *(json, optional)* — Primary output array (arithmetic, transform, extremum values)
- **out_secondary** *(json, optional)* — Secondary output (MINMAX min array; MINMAXINDEX min-index array)

## What must be true

- **function_groups → binary_operators → functions:** ADD, SUB, MULT, DIV
- **function_groups → binary_operators → inputs:** Two equal-length price series (real0, real1)
- **function_groups → binary_operators → lookback:** 0
- **function_groups → binary_operators → output_length:** Same as input length (1-to-1 bar mapping)
- **function_groups → binary_operators → formulas → ADD:** real0[i] + real1[i]
- **function_groups → binary_operators → formulas → SUB:** real0[i] - real1[i]
- **function_groups → binary_operators → formulas → MULT:** real0[i] * real1[i]
- **function_groups → binary_operators → formulas → DIV:** real0[i] / real1[i]
- **function_groups → binary_operators → edge_case:** DIV: when real1[i] = 0, output is implementation-defined (typically 0 or ±Inf); caller must guard
- **function_groups → period_extrema → functions:** MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX
- **function_groups → period_extrema → inputs:** Single price series (real0)
- **function_groups → period_extrema → lookback:** timePeriod - 1
- **function_groups → period_extrema → period_range:** 2 to 100000; default 30
- **function_groups → period_extrema → formulas → MAX:** Maximum value of real0 over the last timePeriod bars
- **function_groups → period_extrema → formulas → MAXINDEX:** Index of the bar holding the maximum value over timePeriod
- **function_groups → period_extrema → formulas → MIN:** Minimum value of real0 over the last timePeriod bars
- **function_groups → period_extrema → formulas → MININDEX:** Index of the bar holding the minimum value over timePeriod
- **function_groups → period_extrema → formulas → MINMAX:** Both MAX and MIN in one call (out_values = max array, out_secondary = min array)
- **function_groups → period_extrema → formulas → MINMAXINDEX:** Both MAXINDEX and MININDEX in one call (out_values = maxindex, out_secondary = minindex)
- **function_groups → period_extrema → note:** MAXINDEX / MININDEX output absolute bar indices relative to the input array (not relative to the window)
- **function_groups → rolling_sum → functions:** SUM
- **function_groups → rolling_sum → inputs:** Single price series (real0)
- **function_groups → rolling_sum → lookback:** timePeriod - 1
- **function_groups → rolling_sum → period_range:** 2 to 100000; default 30
- **function_groups → rolling_sum → formula:** SUM[i] = sum(real0[i-n+1 .. i])
- **function_groups → rolling_sum → use_case:** Building block for manual SMA; cumulative position tracking; volume totals over period
- **function_groups → single_bar_transforms → functions:** CEIL, FLOOR, SQRT, LN, LOG10, EXP
- **function_groups → single_bar_transforms → inputs:** Single price series (real0)
- **function_groups → single_bar_transforms → lookback:** 0
- **function_groups → single_bar_transforms → output_length:** Same as input length
- **function_groups → single_bar_transforms → formulas → CEIL:** ceil(real0[i]) — next integer toward +∞
- **function_groups → single_bar_transforms → formulas → FLOOR:** floor(real0[i]) — next integer toward -∞
- **function_groups → single_bar_transforms → formulas → SQRT:** sqrt(real0[i]) — square root; domain: real0[i] >= 0
- **function_groups → single_bar_transforms → formulas → LN:** ln(real0[i]) — natural logarithm; domain: real0[i] > 0
- **function_groups → single_bar_transforms → formulas → LOG10:** log10(real0[i]) — base-10 logarithm; domain: real0[i] > 0
- **function_groups → single_bar_transforms → formulas → EXP:** exp(real0[i]) — e^real0[i]
- **function_groups → single_bar_transforms → domain_errors → SQRT:** Input < 0 produces NaN
- **function_groups → single_bar_transforms → domain_errors → LN:** Input <= 0 produces -Inf (0) or NaN (negative)
- **function_groups → single_bar_transforms → domain_errors → LOG10:** Input <= 0 produces -Inf (0) or NaN (negative)
- **function_groups → trigonometric → functions:** SIN, COS, TAN, ASIN, ACOS, ATAN, SINH, COSH, TANH
- **function_groups → trigonometric → inputs:** Single price series (real0)
- **function_groups → trigonometric → lookback:** 0
- **function_groups → trigonometric → output_length:** Same as input length
- **function_groups → trigonometric → input_unit:** Radians for all functions (not degrees)
- **function_groups → trigonometric → formulas → SIN:** sin(real0[i])
- **function_groups → trigonometric → formulas → COS:** cos(real0[i])
- **function_groups → trigonometric → formulas → TAN:** tan(real0[i]) — undefined at π/2 + nπ
- **function_groups → trigonometric → formulas → ASIN:** arcsin(real0[i]); domain: -1 to +1; output: -π/2 to +π/2
- **function_groups → trigonometric → formulas → ACOS:** arccos(real0[i]); domain: -1 to +1; output: 0 to π
- **function_groups → trigonometric → formulas → ATAN:** arctan(real0[i]); output: -π/2 to +π/2
- **function_groups → trigonometric → formulas → SINH:** hyperbolic sine of real0[i]
- **function_groups → trigonometric → formulas → COSH:** hyperbolic cosine of real0[i]
- **function_groups → trigonometric → formulas → TANH:** hyperbolic tangent; output: -1 to +1
- **function_groups → trigonometric → use_cases → price_cycles:** SIN/COS applied to normalized price for cycle analysis
- **function_groups → trigonometric → use_cases → angular_conversion:** Convert LINEARREG_ANGLE output (degrees) to radians before applying trig functions

## Success & failure scenarios

**✅ Success paths**

- **Compute Success Zero Lookback** — when function_type in [ADD, SUB, MULT, DIV, CEIL, FLOOR, SQRT, LN, LOG10, EXP, SIN, COS, TAN, ASIN, ACOS, ATAN, SINH, COSH, TANH]; real0 present and non-empty; for binary operators: real1 present and same length as real0, then Full-length output array aligned 1-to-1 with input; no lookback offset.
- **Compute Success Period Based** — when function_type in [MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM]; input_length > timePeriod - 1; time_period >= 2, then Rolling output offset by timePeriod-1 bars; use outBegIdx to align with source data.
- **Minmax Computed** — when function_type in [MINMAX, MINMAXINDEX]; input_length > timePeriod - 1, then Two parallel output arrays — extremum pair computed in one pass (more efficient than two separate calls).

**❌ Failure paths**

- **Insufficient Data** — when function_type in [MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM]; input_length <= timePeriod - 1, then No output; provide at least timePeriod bars. *(error: `INSUFFICIENT_DATA`)*
- **Domain Error** — when function_type == SQRT and any real0[i] < 0 OR function_type in [LN, LOG10] and any real0[i] <= 0 OR function_type in [ASIN, ACOS] and any real0[i] outside [-1, 1] OR function_type == DIV and any real1[i] == 0, then Affected bars produce NaN or ±Inf; caller must validate domain constraints before calling. *(error: `INVALID_INPUT`)*
- **Mismatched Arrays** — when function_type in [ADD, SUB, MULT, DIV]; real0 and real1 differ in length, then Binary operators require equal-length input arrays. *(error: `INVALID_INPUT`)*

## Errors it can return

- `INSUFFICIENT_DATA` — Not enough bars for rolling window operation. Provide at least timePeriod bars.
- `INVALID_INPUT` — Input domain violation (e.g., negative input to SQRT, zero denominator in DIV, out-of-range input to ASIN/ACOS).

## Events

**`math.computed`**
  Payload: `function_type`, `out_nb_element`, `out_beg_idx`

## Connects to

- **statistical-functions** *(recommended)*
- **moving-average-overlap-studies** *(recommended)*
- **volatility-band-indicators** *(optional)*
- **market-data-feeds** *(required)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/math-transform-operators/) · **Spec source:** [`math-transform-operators.blueprint.yaml`](./math-transform-operators.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
