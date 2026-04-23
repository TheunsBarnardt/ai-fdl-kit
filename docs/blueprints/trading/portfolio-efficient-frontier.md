---
title: "Portfolio Efficient Frontier Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Construct the minimum-variance frontier and efficient frontier of risky assets, identify the minimum-variance portfolio, and locate the optimal risky portfolio "
---

# Portfolio Efficient Frontier Blueprint

> Construct the minimum-variance frontier and efficient frontier of risky assets, identify the minimum-variance portfolio, and locate the optimal risky portfolio given a risk-free asset

| | |
|---|---|
| **Feature** | `portfolio-efficient-frontier` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, efficient-frontier, markowitz, mvp, optimal-portfolio, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-efficient-frontier.blueprint.yaml) |
| **JSON API** | [portfolio-efficient-frontier.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-efficient-frontier.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `frontier_engine` | Efficient Frontier Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `frontier_id` | text | Yes | Frontier identifier |  |
| `asset_count` | number | Yes | Number of assets |  |
| `risk_free_rate` | number | No | Risk-free rate (decimal) |  |

## Rules

- **minimum_variance_frontier:**
  - **definition:** Set of portfolios with lowest variance for each level of expected return
  - **construction:** Quadratic programming: minimise w^T Sigma w subject to w^T E(R) = target and sum(w) = 1
- **minimum_variance_portfolio:**
  - **mvp:** Lowest-variance portfolio on the frontier; leftmost point
- **efficient_frontier:**
  - **definition:** Upper portion of minimum-variance frontier from MVP upward
  - **rule:** Dominant — for a given risk offers highest return
- **optimal_risky_portfolio:**
  - **rule:** With risk-free asset, tangency portfolio on efficient frontier maximises Sharpe ratio
  - **construction:** Line from Rf tangent to efficient frontier — the Capital Allocation Line
- **investor_optimum:**
  - **selection:** Along CAL, investor picks mix of Rf and tangency based on risk aversion
- **validation:**
  - **frontier_required:** frontier_id present
  - **positive_asset_count:** asset_count > 1

## Outcomes

### Compute_frontier (Priority: 1)

_Compute efficient frontier_

**Given:**
- `frontier_id` (input) exists
- `asset_count` (input) gt `1`

**Then:**
- **call_service** target: `frontier_engine`
- **emit_event** event: `frontier.computed`

### Insufficient_assets (Priority: 10) — Error: `FRONTIER_INSUFFICIENT_ASSETS`

_Need at least 2 assets_

**Given:**
- `asset_count` (input) lte `1`

**Then:**
- **emit_event** event: `frontier.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FRONTIER_INSUFFICIENT_ASSETS` | 400 | asset_count must be greater than 1 | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `frontier.computed` |  | `frontier_id`, `mvp_weights`, `tangency_weights`, `max_sharpe` |
| `frontier.computation_rejected` |  | `frontier_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| portfolio-expected-return-variance | required |  |
| capital-market-line-theory | required |  |

## AGI Readiness

### Goals

#### Reliable Portfolio Efficient Frontier

Construct the minimum-variance frontier and efficient frontier of risky assets, identify the minimum-variance portfolio, and locate the optimal risky portfolio given a risk-free asset

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
| `portfolio_expected_return_variance` | portfolio-expected-return-variance | fail |
| `capital_market_line_theory` | capital-market-line-theory | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_frontier | `autonomous` | - | - |
| insufficient_assets | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Efficient Frontier Blueprint",
  "description": "Construct the minimum-variance frontier and efficient frontier of risky assets, identify the minimum-variance portfolio, and locate the optimal risky portfolio ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, efficient-frontier, markowitz, mvp, optimal-portfolio, cfa-level-1"
}
</script>
