---
title: "Math Transform Operators Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Element-wise and rolling-window mathematical utility functions operating on price series — arithmetic operators, period extrema, rounding, logarithms, exponenti"
---

# Math Transform Operators Blueprint

> Element-wise and rolling-window mathematical utility functions operating on price series — arithmetic operators, period extrema, rounding, logarithms, exponentials, and trigonometric transforms

| | |
|---|---|
| **Feature** | `math-transform-operators` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | technical-analysis, math, arithmetic, transform, trigonometry, ta-lib, utilities |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/math-transform-operators.blueprint.yaml) |
| **JSON API** | [math-transform-operators.json]({{ site.baseurl }}/api/blueprints/trading/math-transform-operators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `quant_analyst` | Quantitative Analyst | human |  |
| `indicator_engine` | Technical Indicator Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `real0` | json | No | First input series (required for binary operators ADD, SUB, MULT, DIV and all single-array functions) |  |
| `real1` | json | No | Second input series (required for binary operators ADD, SUB, MULT, DIV only) |  |
| `function_type` | select | Yes | Math function to apply |  |
| `time_period` | number | No | Rolling window period (required for MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM; default 30; range 2-100000) |  |
| `out_beg_idx` | number | No | Output Begin Index |  |
| `out_nb_element` | number | No | Number of valid output elements |  |
| `out_values` | json | No | Primary output array (arithmetic, transform, extremum values) |  |
| `out_secondary` | json | No | Secondary output (MINMAX min array; MINMAXINDEX min-index array) |  |

## Rules

- **function_groups:**
  - **binary_operators:**
    - **functions:** ADD, SUB, MULT, DIV
    - **inputs:** Two equal-length price series (real0, real1)
    - **lookback:** 0
    - **output_length:** Same as input length (1-to-1 bar mapping)
    - **formulas:**
      - **ADD:** real0[i] + real1[i]
      - **SUB:** real0[i] - real1[i]
      - **MULT:** real0[i] * real1[i]
      - **DIV:** real0[i] / real1[i]
    - **edge_case:** DIV: when real1[i] = 0, output is implementation-defined (typically 0 or ±Inf); caller must guard
  - **period_extrema:**
    - **functions:** MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX
    - **inputs:** Single price series (real0)
    - **lookback:** timePeriod - 1
    - **period_range:** 2 to 100000; default 30
    - **formulas:**
      - **MAX:** Maximum value of real0 over the last timePeriod bars
      - **MAXINDEX:** Index of the bar holding the maximum value over timePeriod
      - **MIN:** Minimum value of real0 over the last timePeriod bars
      - **MININDEX:** Index of the bar holding the minimum value over timePeriod
      - **MINMAX:** Both MAX and MIN in one call (out_values = max array, out_secondary = min array)
      - **MINMAXINDEX:** Both MAXINDEX and MININDEX in one call (out_values = maxindex, out_secondary = minindex)
    - **note:** MAXINDEX / MININDEX output absolute bar indices relative to the input array (not relative to the window)
  - **rolling_sum:**
    - **functions:** SUM
    - **inputs:** Single price series (real0)
    - **lookback:** timePeriod - 1
    - **period_range:** 2 to 100000; default 30
    - **formula:** SUM[i] = sum(real0[i-n+1 .. i])
    - **use_case:** Building block for manual SMA; cumulative position tracking; volume totals over period
  - **single_bar_transforms:**
    - **functions:** CEIL, FLOOR, SQRT, LN, LOG10, EXP
    - **inputs:** Single price series (real0)
    - **lookback:** 0
    - **output_length:** Same as input length
    - **formulas:**
      - **CEIL:** ceil(real0[i]) — next integer toward +∞
      - **FLOOR:** floor(real0[i]) — next integer toward -∞
      - **SQRT:** sqrt(real0[i]) — square root; domain: real0[i] >= 0
      - **LN:** ln(real0[i]) — natural logarithm; domain: real0[i] > 0
      - **LOG10:** log10(real0[i]) — base-10 logarithm; domain: real0[i] > 0
      - **EXP:** exp(real0[i]) — e^real0[i]
    - **domain_errors:**
      - **SQRT:** Input < 0 produces NaN
      - **LN:** Input <= 0 produces -Inf (0) or NaN (negative)
      - **LOG10:** Input <= 0 produces -Inf (0) or NaN (negative)
  - **trigonometric:**
    - **functions:** SIN, COS, TAN, ASIN, ACOS, ATAN, SINH, COSH, TANH
    - **inputs:** Single price series (real0)
    - **lookback:** 0
    - **output_length:** Same as input length
    - **input_unit:** Radians for all functions (not degrees)
    - **formulas:**
      - **SIN:** sin(real0[i])
      - **COS:** cos(real0[i])
      - **TAN:** tan(real0[i]) — undefined at π/2 + nπ
      - **ASIN:** arcsin(real0[i]); domain: -1 to +1; output: -π/2 to +π/2
      - **ACOS:** arccos(real0[i]); domain: -1 to +1; output: 0 to π
      - **ATAN:** arctan(real0[i]); output: -π/2 to +π/2
      - **SINH:** hyperbolic sine of real0[i]
      - **COSH:** hyperbolic cosine of real0[i]
      - **TANH:** hyperbolic tangent; output: -1 to +1
    - **use_cases:**
      - **price_cycles:** SIN/COS applied to normalized price for cycle analysis
      - **angular_conversion:** Convert LINEARREG_ANGLE output (degrees) to radians before applying trig functions

## Outcomes

### Insufficient_data (Priority: 1) — Error: `INSUFFICIENT_DATA`

**Given:**
- function_type in [MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM]
- input_length <= timePeriod - 1

**Then:**
- **set_field** target: `out_nb_element` value: `0`

**Result:** No output; provide at least timePeriod bars

### Domain_error (Priority: 2) — Error: `INVALID_INPUT`

**Given:**
- ANY: function_type == SQRT and any real0[i] < 0 OR function_type in [LN, LOG10] and any real0[i] <= 0 OR function_type in [ASIN, ACOS] and any real0[i] outside [-1, 1] OR function_type == DIV and any real1[i] == 0

**Result:** Affected bars produce NaN or ±Inf; caller must validate domain constraints before calling

### Mismatched_arrays (Priority: 2) — Error: `INVALID_INPUT`

**Given:**
- function_type in [ADD, SUB, MULT, DIV]
- real0 and real1 differ in length

**Result:** Binary operators require equal-length input arrays

### Compute_success_zero_lookback (Priority: 10)

**Given:**
- function_type in [ADD, SUB, MULT, DIV, CEIL, FLOOR, SQRT, LN, LOG10, EXP, SIN, COS, TAN, ASIN, ACOS, ATAN, SINH, COSH, TANH]
- real0 present and non-empty
- for binary operators: real1 present and same length as real0

**Then:**
- **set_field** target: `out_beg_idx` value: `0`
- **set_field** target: `out_nb_element` value: `input_length`
- **set_field** target: `out_values` value: `element-wise transformed values`
- **emit_event** event: `math.computed`

**Result:** Full-length output array aligned 1-to-1 with input; no lookback offset

### Compute_success_period_based (Priority: 10)

**Given:**
- function_type in [MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM]
- input_length > timePeriod - 1
- time_period >= 2

**Then:**
- **set_field** target: `out_beg_idx` value: `timePeriod - 1`
- **set_field** target: `out_nb_element` value: `input_length - (timePeriod - 1)`
- **set_field** target: `out_values` value: `rolling extremum or sum values`
- **emit_event** event: `math.computed`

**Result:** Rolling output offset by timePeriod-1 bars; use outBegIdx to align with source data

### Minmax_computed (Priority: 10)

**Given:**
- function_type in [MINMAX, MINMAXINDEX]
- input_length > timePeriod - 1

**Then:**
- **set_field** target: `out_values` value: `MAX (or MAXINDEX) values`
- **set_field** target: `out_secondary` value: `MIN (or MININDEX) values`

**Result:** Two parallel output arrays — extremum pair computed in one pass (more efficient than two separate calls)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSUFFICIENT_DATA` | 422 | Not enough bars for rolling window operation. Provide at least timePeriod bars. | No |
| `INVALID_INPUT` | 400 | Input domain violation (e.g., negative input to SQRT, zero denominator in DIV, out-of-range input to ASIN/ACOS). | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `math.computed` |  | `function_type`, `out_nb_element`, `out_beg_idx` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| statistical-functions | recommended |  |
| moving-average-overlap-studies | recommended |  |
| volatility-band-indicators | optional |  |
| market-data-feeds | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C99
  bindings: Java, .NET, Rust, Python
  source_repo: https://github.com/TA-Lib/ta-lib
function_count: 26
lookback_summary:
  zero_lookback: ADD, SUB, MULT, DIV, CEIL, FLOOR, SQRT, LN, LOG10, EXP, SIN, COS,
    TAN, ASIN, ACOS, ATAN, SINH, COSH, TANH (19 functions)
  period_based: MAX, MAXINDEX, MIN, MININDEX, MINMAX, MINMAXINDEX, SUM (7
    functions; lookback = timePeriod - 1)
output_type: Double Array for all except MAXINDEX/MININDEX/MINMAXINDEX which
  return Integer Arrays
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Math Transform Operators Blueprint",
  "description": "Element-wise and rolling-window mathematical utility functions operating on price series — arithmetic operators, period extrema, rounding, logarithms, exponenti",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "technical-analysis, math, arithmetic, transform, trigonometry, ta-lib, utilities"
}
</script>
