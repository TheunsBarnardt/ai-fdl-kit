---
title: "Implied Return Implied Growth Equity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Invert the dividend discount model — solve for the implied required return or implied dividend growth rate embedded in a stock's market price. 8 fields. 5 outco"
---

# Implied Return Implied Growth Equity Blueprint

> Invert the dividend discount model — solve for the implied required return or implied dividend growth rate embedded in a stock's market price

| | |
|---|---|
| **Feature** | `implied-return-implied-growth-equity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, equity, implied-return, implied-growth, ddm-inverse, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/implied-return-implied-growth-equity.blueprint.yaml) |
| **JSON API** | [implied-return-implied-growth-equity.json]({{ site.baseurl }}/api/blueprints/trading/implied-return-implied-growth-equity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Equity Valuation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `solve_for` | select | Yes | required_return \| growth_rate |  |
| `current_price` | number | Yes | Observed market price (P0) |  |
| `next_dividend` | number | No | Expected next-period dividend D1 |  |
| `current_dividend` | number | No | Most recent dividend D0 |  |
| `growth_rate` | number | No | Assumed growth rate (supply if solving for required_return) |  |
| `required_return` | number | No | Assumed required return (supply if solving for growth_rate) |  |
| `forward_pe` | number | No | Forward price-to-earnings ratio (alternative input path) |  |
| `payout_ratio` | number | No | Dividend payout ratio b (decimal) |  |

## Rules

- **core_formulas:**
  - **implied_return_constant_growth:** r = D1 / P0 + g
  - **implied_growth_constant_growth:** g = r - D1 / P0
  - **implied_from_pe:** r - g = payout_ratio / forward_pe
  - **dividend_yield:** D1 / P0
  - **capital_gain_yield:** g (equal to dividend growth under Gordon)
- **interpretation:**
  - **return_decomposition:** Required return decomposes into dividend yield + long-term growth
  - **market_implied_view:** The solved g or r is the market's consensus expectation embedded in price
- **validation:**
  - **positive_price:** current_price > 0
  - **non_negative_dividend:** next_dividend >= 0
  - **g_less_than_r:** Derived growth must be strictly less than required return (else Gordon undefined)
  - **payout_range:** 0 < payout_ratio <= 1

## Outcomes

### Solve_required_return (Priority: 1)

_Solve r given price, D1, and growth_

**Given:**
- `solve_for` (input) eq `required_return`
- `current_price` (input) gt `0`
- `growth_rate` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_implied_r_calculated`

### Solve_implied_growth (Priority: 2)

_Solve g given price, D1, and required return_

**Given:**
- `solve_for` (input) eq `growth_rate`
- `current_price` (input) gt `0`
- `required_return` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_implied_g_calculated`

### Solve_via_pe (Priority: 3)

_Derive r-g spread from forward P/E and payout_

**Given:**
- `forward_pe` (input) gt `0`
- `payout_ratio` (input) gt `0`

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.equity_implied_r_calculated`

### Derived_g_ge_r (Priority: 10) — Error: `EQUITY_IMPLIED_G_GE_R`

_Implied g exceeds r — violates Gordon assumption_

**Given:**
- `solver_status` (computed) eq `g_ge_r`

**Then:**
- **emit_event** event: `pricing.equity_implied_rejected`

### Missing_inputs (Priority: 11) — Error: `EQUITY_IMPLIED_MISSING_INPUTS`

_Required inputs missing_

**Given:**
- ANY: `solve_for` (input) not_exists OR `current_price` (input) lte `0`

**Then:**
- **emit_event** event: `pricing.equity_implied_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EQUITY_IMPLIED_G_GE_R` | 422 | Implied growth rate meets or exceeds required return — DDM assumption violated | No |
| `EQUITY_IMPLIED_MISSING_INPUTS` | 400 | solve_for target and current_price are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.equity_implied_r_calculated` |  | `instrument_id`, `current_price`, `implied_required_return`, `dividend_yield`, `growth_assumption` |
| `pricing.equity_implied_g_calculated` |  | `instrument_id`, `current_price`, `implied_growth_rate`, `dividend_yield`, `required_return_assumption` |
| `pricing.equity_implied_rejected` |  | `instrument_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-present-value | required |  |
| implied-return-fixed-income | recommended |  |

## AGI Readiness

### Goals

#### Reliable Implied Return Implied Growth Equity

Invert the dividend discount model — solve for the implied required return or implied dividend growth rate embedded in a stock's market price

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `equity_present_value` | equity-present-value | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| solve_required_return | `autonomous` | - | - |
| solve_implied_growth | `autonomous` | - | - |
| solve_via_pe | `autonomous` | - | - |
| derived_g_ge_r | `autonomous` | - | - |
| missing_inputs | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_r:
  scenario: P0 = USD120, D1 = USD4.00, g = 5%
  computation: 4/120 + 0.05 = 0.0333 + 0.05 = 0.0833
  implied_return: 0.0833
worked_example_g:
  scenario: P0 = USD50, D1 = USD2.00, r = 10%
  computation: 0.10 - 2/50 = 0.10 - 0.04 = 0.06
  implied_growth: 0.06
worked_example_pe:
  scenario: Forward P/E 28, payout 70%
  r_minus_g: 0.70 / 28 = 0.025 = 2.5%
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Implied Return Implied Growth Equity Blueprint",
  "description": "Invert the dividend discount model — solve for the implied required return or implied dividend growth rate embedded in a stock's market price. 8 fields. 5 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, equity, implied-return, implied-growth, ddm-inverse, cfa-level-1"
}
</script>
