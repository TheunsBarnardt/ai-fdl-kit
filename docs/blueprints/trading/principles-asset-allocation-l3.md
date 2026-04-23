---
title: "Principles Asset Allocation L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics."
---

# Principles Asset Allocation L3 Blueprint

> Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics

| | |
|---|---|
| **Feature** | `principles-asset-allocation-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, asset-allocation, mean-variance-optimization, black-litterman, liability-relative, goals-based, risk-parity, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/principles-asset-allocation-l3.blueprint.yaml) |
| **JSON API** | [principles-asset-allocation-l3.json]({{ site.baseurl }}/api/blueprints/trading/principles-asset-allocation-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |
| `investment_committee` | Investment Committee | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `allocation_id` | text | Yes | Allocation identifier |  |
| `method` | select | Yes | mvo \| black_litterman \| liability_relative \| goals_based \| risk_parity \| factor_based |  |

## Rules

- **mvo_overview:**
  - **definition:** Select portfolio with highest expected return for given risk (or lowest risk for given return)
  - **efficient_frontier:** Set of portfolios not dominated on both risk and return dimensions
  - **inputs:** Expected returns, standard deviations, correlations for all asset classes
  - **corner_solutions:** Unconstrained MVO tends to produce extreme/concentrated portfolios
- **mvo_criticisms:**
  - **input_sensitivity:** Small changes in expected returns → large weight changes; garbage-in garbage-out
  - **estimation_error:** Expected return estimates are noisy; error-maximization problem
  - **non_normality:** Fat tails and skew not captured by mean and variance alone
  - **single_period:** Ignores multi-period rebalancing and changing opportunity set
- **mvo_improvements:**
  - **reverse_optimization:** Back-solve for expected returns implied by market cap weights; more stable starting point
  - **black_litterman:** Blend reverse-optimized equilibrium returns with analyst views weighted by confidence
  - **resampled_mvo:** Average optimal weights over many draws of inputs; reduces sensitivity
  - **constraints:** Add asset class bounds, factor constraints, turnover limits to stabilize
- **monte_carlo:**
  - **purpose:** Simulate multi-period wealth paths; assess probability of meeting goals under uncertainty
  - **advantages:** Captures path dependency, rebalancing effects, changing liabilities, non-normal returns
  - **use_case:** Complement MVO; especially useful for goals-based and glide-path analysis
- **liability_relative:**
  - **surplus_optimization:** Treat surplus (assets − liabilities) as the objective; minimize surplus volatility for given expected surplus return
  - **hedging_portfolio:** Replicates liability cash flows; typically long-duration bonds; zero surplus risk
  - **return_seeking_portfolio:** Growth allocation above hedging portfolio; earns excess return
  - **integrated_approach:** Jointly optimize assets and liabilities in single framework; most theoretically correct
  - **comparing_approaches:** Surplus optimization simplest; hedging/return-seeking clearest; integrated most complete
  - **factor_modeling:** Model liabilities as function of interest rate, inflation, credit factors; hedge with matching factors
- **goals_based:**
  - **sub_portfolios:** Each goal gets dedicated sub-portfolio sized by PV of goal and success probability
  - **goal_hierarchy:** Survival goals (highest priority) → maintenance → aspirational (lowest)
  - **module_process:** Identify goals → set horizons and success probabilities → select sub-portfolio → aggregate
  - **overall_portfolio:** Combine sub-portfolios; aggregate weights determine total asset allocation
  - **issues:** Sub-portfolios may overlap; correlation benefits partially lost; monitoring complex
- **heuristics:**
  - **rule_120:** Equity allocation = 120 minus age; rough lifecycle glide path
  - **sixty_forty:** 60% equity / 40% bonds; classic balanced; simple but ignores liabilities and goals
  - **endowment_model:** Heavy alternatives allocation; requires long horizon and illiquidity tolerance
  - **risk_parity:** Equal risk contribution from each asset class; typically bonds-heavy; lever up for return
  - **one_over_n:** Equal-weight all asset classes; naive but robust to estimation error
- **factor_based:**
  - **premise:** Asset class returns driven by underlying factors (economic growth, inflation, rates, credit)
  - **advantage:** Avoids artificial asset class boundaries; captures true risk sources
  - **implementation:** Allocate to factor exposures; manage factor risk budget
- **rebalancing_practice:**
  - **calendar:** Rebalance on fixed schedule regardless of drift
  - **threshold:** Rebalance when any weight exceeds corridor; more responsive
  - **trade_off:** Frequent rebalancing → lower drift risk but higher costs; optimize corridor width
  - **tax_considerations:** Harvest losses; defer gains; use cash flows to rebalance before trading
- **validation:**
  - **allocation_required:** allocation_id present
  - **valid_method:** method in [mvo, black_litterman, liability_relative, goals_based, risk_parity, factor_based]

## Outcomes

### Develop_allocation (Priority: 1)

_Develop asset allocation using specified method_

**Given:**
- `allocation_id` (input) exists
- `method` (input) in `mvo,black_litterman,liability_relative,goals_based,risk_parity,factor_based`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `allocation.developed`

### Invalid_method (Priority: 10) — Error: `ALLOCATION_INVALID_METHOD`

_Unsupported allocation method_

**Given:**
- `method` (input) not_in `mvo,black_litterman,liability_relative,goals_based,risk_parity,factor_based`

**Then:**
- **emit_event** event: `allocation.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ALLOCATION_INVALID_METHOD` | 400 | method must be one of the supported allocation methods | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `allocation.developed` |  | `allocation_id`, `method`, `asset_class_weights`, `surplus_return`, `surplus_risk` |
| `allocation.rejected` |  | `allocation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| overview-asset-allocation-l3 | required |  |
| capital-market-expectations-asset-class-l3 | required |  |
| asset-allocation-constraints-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Principles Asset Allocation L3

Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics

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
| `overview_asset_allocation_l3` | overview-asset-allocation-l3 | fail |
| `capital_market_expectations_asset_class_l3` | capital-market-expectations-asset-class-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| develop_allocation | `autonomous` | - | - |
| invalid_method | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Principles Asset Allocation L3 Blueprint",
  "description": "Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, asset-allocation, mean-variance-optimization, black-litterman, liability-relative, goals-based, risk-parity, cfa-level-3"
}
</script>
