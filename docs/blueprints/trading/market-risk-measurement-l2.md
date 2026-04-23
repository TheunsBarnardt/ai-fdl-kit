---
title: "Market Risk Measurement L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position"
---

# Market Risk Measurement L2 Blueprint

> Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position and stop-loss limits

| | |
|---|---|
| **Feature** | `market-risk-measurement-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, risk-management, var, expected-shortfall, risk-budgeting, scenario-analysis, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/market-risk-measurement-l2.blueprint.yaml) |
| **JSON API** | [market-risk-measurement-l2.json]({{ site.baseurl }}/api/blueprints/trading/market-risk-measurement-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `risk_manager` | Market Risk Manager | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `measure_type` | select | Yes | var_parametric \| var_historical \| var_mc \| expected_shortfall \| scenario \| sensitivity |  |

## Rules

- **var_definition:**
  - **statement:** Maximum loss not exceeded with probability (1−α) over horizon T
  - **parameters:** Confidence level (95%, 99%), horizon (1-day, 10-day)
  - **formula:** VaR = −(μ × T − z_α × σ × √T)
- **parametric_var:**
  - **assumptions:** Normal distribution; constant correlations
  - **advantages:** Fast; analytical; scalable
  - **limitations:** Fat tails; correlation breakdown in stress
- **historical_simulation_var:**
  - **method:** Use actual historical return distribution; apply to current portfolio
  - **advantages:** No distributional assumption; captures fat tails
  - **limitations:** Depends on history length; doesn't adapt quickly to regime changes
- **monte_carlo_var:**
  - **method:** Simulate many scenarios from factor model; compute portfolio P&L
  - **advantages:** Flexible; handles non-linearity; path-dependent instruments
  - **limitations:** Computationally intensive; model-dependent
- **advantages_var:**
  - **simple:** Easy to communicate to management
  - **aggregation:** Portfolio-level measure
  - **regulation:** Basel III links capital to VaR
- **limitations_var:**
  - **non_subadditive:** Doesn't always reward diversification
  - **no_tail_shape:** Silent on magnitude beyond threshold
  - **trending:** Portfolio may stay under daily VaR while accumulating losses
- **expected_shortfall:**
  - **definition:** Average loss in the tail beyond VaR; aka CVaR
  - **advantage:** Coherent risk measure; subadditive; reveals tail severity
  - **regulation:** Basel IV moving to ES from VaR
- **sensitivity_measures:**
  - **duration:** Bond price sensitivity to yield
  - **beta:** Equity sensitivity to market
  - **delta_gamma:** Option price sensitivity to spot
  - **dv01:** Dollar value of 1bp move
- **scenario_measures:**
  - **historical:** 2008 GFC, 2020 COVID, 1994 rate shock
  - **hypothetical:** User-defined extreme events
  - **reverse_scenario:** What scenario would produce loss X?
- **risk_budgeting:**
  - **definition:** Allocate risk (VaR or TE) to strategies/desks
  - **marginal_var:** Incremental VaR from adding one unit of position
  - **component_var:** Contribution of each position to portfolio VaR
- **constraints:**
  - **position_limits:** Max notional by issuer/sector/currency
  - **scenario_limits:** Max loss under defined scenario
  - **stop_loss:** Mandatory reduction if cumulative loss exceeds threshold
- **market_participants:**
  - **banks:** VaR for trading book; economic capital; stress testing
  - **asset_managers:** Tracking error; factor risk; drawdown
  - **pension_funds:** Surplus at risk; ALM
  - **insurers:** Value-at-risk with liability sensitivity
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_measure:** measure_type in allowed set

## Outcomes

### Measure_market_risk (Priority: 1)

_Measure market risk of portfolio_

**Given:**
- `portfolio_id` (input) exists
- `measure_type` (input) in `var_parametric,var_historical,var_mc,expected_shortfall,scenario,sensitivity`

**Then:**
- **call_service** target: `risk_manager`
- **emit_event** event: `market_risk.measured`

### Invalid_measure (Priority: 10) — Error: `RISK_INVALID_MEASURE`

_Unsupported risk measure type_

**Given:**
- `measure_type` (input) not_in `var_parametric,var_historical,var_mc,expected_shortfall,scenario,sensitivity`

**Then:**
- **emit_event** event: `market_risk.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RISK_INVALID_MEASURE` | 400 | measure_type must be one of the supported risk measures | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `market_risk.measured` |  | `portfolio_id`, `measure_type`, `var_amount`, `expected_shortfall`, `scenario_loss` |
| `market_risk.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| backtesting-simulation-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Market Risk Measurement L2

Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position and stop-loss limits

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
| `backtesting_simulation_l2` | backtesting-simulation-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| measure_market_risk | `autonomous` | - | - |
| invalid_measure | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Market Risk Measurement L2 Blueprint",
  "description": "Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, risk-management, var, expected-shortfall, risk-budgeting, scenario-analysis, cfa-level-2"
}
</script>
