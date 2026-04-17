---
title: "Equity Present Value Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the present value of an equity instrument via the Dividend Discount Model — supporting no-growth, constant growth (Gordon), and multi-stage (changing gr"
---

# Equity Present Value Blueprint

> Compute the present value of an equity instrument via the Dividend Discount Model — supporting no-growth, constant growth (Gordon), and multi-stage (changing growth) variants

| | |
|---|---|
| **Feature** | `equity-present-value` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, equity, ddm, gordon-growth, dividend-discount-model, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-present-value.blueprint.yaml) |
| **JSON API** | [equity-present-value.json]({{ site.baseurl }}/api/blueprints/trading/equity-present-value.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Equity Valuation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `growth_pattern` | select | Yes | no_growth \| constant_growth \| multi_stage |  |
| `current_dividend` | number | No | Most recent dividend D0 |  |
| `next_dividend` | number | No | Expected next-period dividend D1 |  |
| `required_return` | number | Yes | Required rate of return r (decimal) |  |
| `growth_rate` | number | No | Constant long-term growth rate g (decimal) |  |
| `dividend_schedule` | json | No | Array of {period, dividend, growth} for multi-stage DDM |  |
| `terminal_growth` | number | No | Terminal steady-state growth rate for multi-stage model |  |
| `terminal_period` | number | No | Period at which terminal value is computed |  |
| `earnings_per_share` | number | No | Earnings per share (for P/E justification) |  |
| `payout_ratio` | number | No | Dividend payout ratio b (decimal) |  |

## Rules

- **core_formulas:**
  - **no_growth:** PV = D / r
  - **gordon_constant:** PV = D1 / (r - g), requires r > g
  - **gordon_from_d0:** PV = D0 * (1 + g) / (r - g)
  - **multi_stage:** PV = sum_{t=1..N}[ Dt / (1+r)^t ] + TV_N / (1+r)^N; TV_N = D_{N+1} / (r - g_terminal)
  - **justified_forward_pe:** P/E1 = payout_ratio / (r - g)
- **growth_assumption_types:**
  - **no_growth:** Preferred share; perpetual flat dividend
  - **constant:** Mature company with stable payout
  - **multi_stage:** High-growth company transitioning to steady state
- **required_return_components:**
  - **formula:** r = dividend_yield + capital_gain_yield = D1/P + g
- **validation:**
  - **r_gt_g:** required_return > growth_rate for constant-growth DDM (else PV undefined)
  - **non_negative_dividends:** current_dividend >= 0, next_dividend >= 0
  - **terminal_rgtG:** required_return > terminal_growth for multi-stage
  - **payout_in_range:** 0 <= payout_ratio <= 1

## Outcomes

### Price_no_growth (Priority: 1)

_Zero-growth perpetuity (preferred share)_

**Given:**
- `growth_pattern` (input) eq `no_growth`
- `next_dividend` (input) gt `0`
- `required_return` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_pv_calculated`

### Price_constant_growth (Priority: 2)

_Constant-growth (Gordon) DDM_

**Given:**
- `growth_pattern` (input) eq `constant_growth`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_pv_calculated`

### Price_multi_stage (Priority: 3)

_Multi-stage (changing growth) DDM_

**Given:**
- `growth_pattern` (input) eq `multi_stage`
- `dividend_schedule` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_pv_calculated`

### Growth_meets_or_exceeds_return (Priority: 10) — Error: `EQUITY_PV_G_GE_R`

_Growth rate at or above required return — PV undefined_

**Given:**
- ALL: `growth_pattern` (input) eq `constant_growth` AND `growth_rate` (input) gte `required_return`

**Then:**
- **emit_event** event: `pricing.equity_pv_rejected`

### Negative_dividend (Priority: 11) — Error: `EQUITY_PV_NEGATIVE_DIVIDEND`

_Dividend is negative_

**Given:**
- ANY: `current_dividend` (input) lt `0` OR `next_dividend` (input) lt `0`

**Then:**
- **emit_event** event: `pricing.equity_pv_rejected`

### Missing_inputs (Priority: 12) — Error: `EQUITY_PV_MISSING_INPUTS`

_Required inputs missing_

**Given:**
- ANY: `growth_pattern` (input) not_exists OR `required_return` (input) not_exists

**Then:**
- **emit_event** event: `pricing.equity_pv_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EQUITY_PV_G_GE_R` | 400 | Growth rate must be strictly less than required return for Gordon model | No |
| `EQUITY_PV_NEGATIVE_DIVIDEND` | 400 | Dividends must be non-negative | No |
| `EQUITY_PV_MISSING_INPUTS` | 400 | growth_pattern and required_return are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.equity_pv_calculated` |  | `instrument_id`, `growth_pattern`, `present_value`, `required_return`, `growth_rate` |
| `pricing.equity_pv_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-present-value | recommended |  |
| implied-return-implied-growth-equity | recommended |  |
| holding-period-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_gordon:
  scenario: D1 = GBP1.50, r = 8%, g = 3.5%
  computation: 1.50 / (0.08 - 0.035) = 33.33
  pv: 33.33
worked_example_justified_pe:
  scenario: payout = 0.70, r = 9%, g = 4.5%
  forward_pe: 0.70 / (0.09 - 0.045) = 15.56
multi_stage_example:
  scenario: "Stage 1: 10% growth for 3 years; Stage 2: 4% terminal"
  formula: Sum year-1 to year-3 PVs + TV_3 = D_4 / (r - 0.04), discount TV to today
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Present Value Blueprint",
  "description": "Compute the present value of an equity instrument via the Dividend Discount Model — supporting no-growth, constant growth (Gordon), and multi-stage (changing gr",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, equity, ddm, gordon-growth, dividend-discount-model, cfa-level-1"
}
</script>
