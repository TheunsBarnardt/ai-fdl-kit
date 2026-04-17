---
title: "Money Weighted Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Calculate the money-weighted rate of return (internal rate of return) on a portfolio with external cash flows, reflecting both performance and investor timing. "
---

# Money Weighted Return Blueprint

> Calculate the money-weighted rate of return (internal rate of return) on a portfolio with external cash flows, reflecting both performance and investor timing

| | |
|---|---|
| **Feature** | `money-weighted-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, return-measures, irr, mwr, cash-flows, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/money-weighted-return.blueprint.yaml) |
| **JSON API** | [money-weighted-return.json]({{ site.baseurl }}/api/blueprints/trading/money-weighted-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `analyst` | Investment Analyst | human |  |
| `performance_engine` | Performance Measurement Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `cash_flows` | json | Yes | Array of signed cash flows, beginning with initial investment (negative outflow) at t=0 |  |
| `cash_flow_dates` | json | No | Optional dates aligned to cash_flows for irregular (XIRR) calculation |  |
| `periods_per_year` | number | No | Compounding frequency for annualization (default 1) |  |
| `initial_guess` | number | No | Initial IRR guess for numerical solver (default 0.10) |  |

## Rules

- **core_definition:**
  - **mwr:** Rate r such that NPV(cash_flows, r) = 0
  - **equation:** sum( CF_t / (1+r)^t ) = 0 for t = 0..T
- **solver_characteristics:**
  - **nonlinear:** Equation is polynomial in (1+r) of degree T; no closed form
  - **newton_raphson:** Preferred method; converges quickly from reasonable initial guess
  - **bisection_fallback:** Use when Newton-Raphson oscillates or diverges
  - **multiple_roots:** Descartes' rule — up to (sign changes in CF) real roots; choose economically meaningful (typically unique > -1)
- **sign_convention:**
  - **outflows:** Negative (investor pays in)
  - **inflows:** Positive (investor receives)
  - **terminal_value:** Positive (final portfolio value as liquidating inflow)
- **appropriate_use:**
  - **investor_perspective:** MWR measures return earned by the specific investor given their timing of cash flows
  - **not_comparable_across_managers:** Two managers with identical underlying performance can show different MWRs if their clients' cash flows differ — use TWR for manager comparison
- **validation:**
  - **min_two_flows:** At least two cash flows required (initial investment + terminal value)
  - **sign_change:** At least one sign change required for a meaningful IRR
  - **convergence_tolerance:** |NPV| <= 1e-8 within 100 iterations

## Outcomes

### Compute_mwr (Priority: 1)

_Solve for IRR when cash flow series valid_

**Given:**
- `cash_flows` (input) exists

**Then:**
- **call_service** target: `performance_engine`
- **emit_event** event: `return.mwr_calculated`

### Solver_non_convergence (Priority: 10) — Error: `MWR_SOLVER_NON_CONVERGENT`

_Numerical solver fails to converge_

**Given:**
- `cash_flows` (input) exists

**Then:**
- **emit_event** event: `return.mwr_failed`

### No_sign_change (Priority: 11) — Error: `MWR_NO_SIGN_CHANGE`

_All cash flows same sign (no IRR exists)_

**Given:**
- `cash_flows` (input) exists

**Then:**
- **emit_event** event: `return.mwr_failed`

### Insufficient_flows (Priority: 12) — Error: `MWR_INSUFFICIENT_CASHFLOWS`

_Fewer than two cash flows provided_

**Given:**
- `cash_flows` (input) not_exists

**Then:**
- **emit_event** event: `return.mwr_failed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MWR_SOLVER_NON_CONVERGENT` | 422 | Unable to converge to an IRR within tolerance; inspect cash flow sign pattern | No |
| `MWR_NO_SIGN_CHANGE` | 400 | IRR undefined — cash flows must include at least one sign change | No |
| `MWR_INSUFFICIENT_CASHFLOWS` | 400 | At least two cash flows (investment and terminal value) required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `return.mwr_calculated` |  | `portfolio_id`, `mwr`, `periodic_rate`, `annualized_rate`, `iterations`, `convergence_residual` |
| `return.mwr_failed` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| time-weighted-return | required |  |
| holding-period-return | required |  |
| annualized-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: "Year 0: buy 1 share @ 0; Year 1: receive  dividend, buy 1 more share
    @ 0; Year 2: receive  dividend, sell 2 shares @ 5 each"
  cash_flows:
    - -100
    - -198
    - 244
  computed_mwr: 0.0968
  interpretation: IRR ≈ 9.68% per year accounting for investor's purchase timing
solver_implementation:
  preferred_method: newton_raphson
  max_iterations: 100
  tolerance: 1e-8
  fallback_bounds:
    - -0.99
    - 10
comparison_to_twr:
  twr_ignores_timing: Time-weighted return neutralises cash flow timing — compares manager skill
  mwr_includes_timing: Money-weighted return measures what the investor actually earned
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Money Weighted Return Blueprint",
  "description": "Calculate the money-weighted rate of return (internal rate of return) on a portfolio with external cash flows, reflecting both performance and investor timing. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, return-measures, irr, mwr, cash-flows, cfa-level-1"
}
</script>
