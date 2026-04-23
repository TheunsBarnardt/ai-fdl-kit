---
title: "Active Portfolio Management L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, f"
---

# Active Portfolio Management L2 Blueprint

> Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, fixed-income and global equity strategies

| | |
|---|---|
| **Feature** | `active-portfolio-management-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, active-management, information-ratio, fundamental-law, ic-br, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/active-portfolio-management-l2.blueprint.yaml) |
| **JSON API** | [active-portfolio-management-l2.json]({{ site.baseurl }}/api/blueprints/trading/active-portfolio-management-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `active_pm_analyst` | Active Portfolio Management Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `portfolio_id` | text | Yes | Portfolio identifier |  |
| `analysis_type` | select | Yes | value_added \| sharpe_ir \| fundamental_law \| optimal_portfolio \| strategy |  |

## Rules

- **value_added:**
  - **definition:** Active return = portfolio return − benchmark return
  - **benchmark_choice:** Determines what counts as active risk
  - **decomposition:** Active return = Σ (active weight × security return)
- **sharpe_ratio:**
  - **formula:** SR = (Rp − Rf) / σp
  - **benchmark_independence:** Measures total risk-adjusted return
  - **constraint:** Long-only constraint reduces achievable SR
- **information_ratio:**
  - **formula:** IR = (Rp − Rb) / TE where TE = tracking error
  - **interpretation:** Active return per unit of active risk
  - **optimal_active_risk:** TE* = IR × σ_b / SR_b
  - **limit:** Max achievable SR² = SR_b² + IR²
- **fundamental_law_basic:**
  - **formula:** IR ≈ IC × √BR
  - **ic:** Information coefficient — correlation of forecasts with outcomes; measure of skill
  - **br:** Breadth — number of independent active bets per year
  - **implication:** Skill amplified by many independent bets
- **full_fundamental_law:**
  - **formula:** IR = TC × IC × √BR
  - **tc:** Transfer coefficient — correlation of active weights with optimal weights; 1.0 if unconstrained
  - **long_only_constraint:** Reduces TC; reduces effective IR
  - **ex_post:** Realised IR vs ex ante expected IR tests skill
- **active_security_returns:**
  - **alpha:** True expected active return from information advantage
  - **source:** Private research, better models, superior judgement
- **constructing_optimal_portfolio:**
  - **optimal_active_weights:** Proportional to alpha / (2 × λ × σ²)
  - **aggressiveness:** Scale by risk aversion λ
  - **constrained:** Long-only reduces weights; TC < 1
- **global_equity_strategy:**
  - **country_allocation:** Factor in macro and valuation signals
  - **sector_allocation:** Industry cycle and relative valuation
  - **stock_selection:** Bottom-up fundamental signals
  - **breadth:** Country × sector × stock decisions multiply BR
- **fi_active_strategies:**
  - **duration:** Curve positioning; term premium signals
  - **credit:** Sector rotation, issue selection
  - **currency:** FX overlay for international mandates
  - **breadth:** Many bonds; high BR in pure fixed income
- **practical_limitations:**
  - **ex_ante_ic:** Hard to measure before outcomes
  - **independence:** Bets may be correlated within factors
  - **skill_persistence:** IC estimates from past may not persist
- **validation:**
  - **portfolio_required:** portfolio_id present
  - **valid_analysis:** analysis_type in [value_added, sharpe_ir, fundamental_law, optimal_portfolio, strategy]

## Outcomes

### Analyse_active_pm (Priority: 1)

_Analyse active portfolio management approach_

**Given:**
- `portfolio_id` (input) exists
- `analysis_type` (input) in `value_added,sharpe_ir,fundamental_law,optimal_portfolio,strategy`

**Then:**
- **call_service** target: `active_pm_analyst`
- **emit_event** event: `active_pm.analysed`

### Invalid_analysis (Priority: 10) — Error: `ACTIVE_PM_INVALID_ANALYSIS`

_Unsupported analysis type_

**Given:**
- `analysis_type` (input) not_in `value_added,sharpe_ir,fundamental_law,optimal_portfolio,strategy`

**Then:**
- **emit_event** event: `active_pm.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ACTIVE_PM_INVALID_ANALYSIS` | 400 | analysis_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `active_pm.analysed` |  | `portfolio_id`, `analysis_type`, `ir`, `ic`, `br`, `tc`, `optimal_active_risk` |
| `active_pm.rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multifactor-models-l2 | recommended |  |
| backtesting-simulation-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Active Portfolio Management L2

Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, fixed-income and global equity strategies

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| analyse_active_pm | `autonomous` | - | - |
| invalid_analysis | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Active Portfolio Management L2 Blueprint",
  "description": "Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, active-management, information-ratio, fundamental-law, ic-br, cfa-level-2"
}
</script>
