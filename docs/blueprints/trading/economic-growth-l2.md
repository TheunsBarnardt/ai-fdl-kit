---
title: "Economic Growth L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Analyse drivers of economic growth — production function, growth accounting, capital deepening vs technology, classical/neoclassical/endogenous growth theories,"
---

# Economic Growth L2 Blueprint

> Analyse drivers of economic growth — production function, growth accounting, capital deepening vs technology, classical/neoclassical/endogenous growth theories, convergence

| | |
|---|---|
| **Feature** | `economic-growth-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, growth, production-function, solow-model, convergence, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/economic-growth-l2.blueprint.yaml) |
| **JSON API** | [economic-growth-l2.json]({{ site.baseurl }}/api/blueprints/trading/economic-growth-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `growth_analyst` | Growth Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `economy_id` | text | Yes | Economy identifier |  |
| `growth_model` | select | Yes | classical \| neoclassical \| endogenous |  |

## Rules

- **factors_favouring_growth:**
  - **financial_markets:** Channel savings to productive investment
  - **political_stability_law:** Property rights enforce contracts
  - **education_health:** Human capital accumulation
  - **tax_regulatory:** Predictable regimes encourage capital formation
  - **free_trade_capital:** Specialisation gains, tech transfer
- **potential_growth_importance:**
  - **investor_implication:** Equity returns ≈ EPS growth ≈ GDP growth long-term
  - **monetary_policy:** Output gap = actual − potential
- **production_function:**
  - **cobb_douglas:** Y = A * K^α * L^(1-α)
  - **diminishing_returns_capital:** Marginal product of capital declines as K rises
- **growth_accounting:**
  - **decomposition:** %ΔY ≈ %ΔA + α*%ΔK + (1-α)*%ΔL
  - **tfp_residual:** Solow residual = output growth not explained by factor inputs
- **capital_deepening_vs_tech:**
  - **capital_deepening:** Rising K/L; subject to diminishing returns
  - **technological_progress:** Shifts production function up; only sustainable source of long-run per-capita growth
- **classical_model:**
  - **malthusian:** Population growth absorbs output gains; living standards stagnate
- **neoclassical_solow:**
  - **steady_state:** All economies converge to per-capita growth rate equal to TFP growth
  - **convergence:** Poorer countries grow faster (β-convergence) given same fundamentals
- **endogenous_growth:**
  - **constant_returns_capital_broad:** Including human capital and R&D investment
  - **no_steady_state_decline:** Policy can permanently raise growth via R&D incentives
- **convergence_types:**
  - **absolute:** All economies converge regardless of starting point
  - **conditional:** Convergence only among economies with similar fundamentals
  - **club:** Convergence within groups sharing institutions
- **validation:**
  - **economy_required:** economy_id present
  - **valid_model:** growth_model in [classical, neoclassical, endogenous]

## Outcomes

### Decompose_growth (Priority: 1)

_Decompose economic growth_

**Given:**
- `economy_id` (input) exists
- `growth_model` (input) in `classical,neoclassical,endogenous`

**Then:**
- **call_service** target: `growth_analyst`
- **emit_event** event: `growth.decomposed`

### Invalid_model (Priority: 10) — Error: `GROWTH_INVALID_MODEL`

_Unsupported growth model_

**Given:**
- `growth_model` (input) not_in `classical,neoclassical,endogenous`

**Then:**
- **emit_event** event: `growth.decomposition_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GROWTH_INVALID_MODEL` | 400 | growth_model must be classical, neoclassical, or endogenous | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `growth.decomposed` |  | `economy_id`, `growth_model`, `capital_contribution`, `labour_contribution`, `tfp_contribution` |
| `growth.decomposition_rejected` |  | `economy_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| economic-indicators | recommended |  |

## AGI Readiness

### Goals

#### Reliable Economic Growth L2

Analyse drivers of economic growth — production function, growth accounting, capital deepening vs technology, classical/neoclassical/endogenous growth theories, convergence

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
| decompose_growth | `autonomous` | - | - |
| invalid_model | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Economic Growth L2 Blueprint",
  "description": "Analyse drivers of economic growth — production function, growth accounting, capital deepening vs technology, classical/neoclassical/endogenous growth theories,",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, growth, production-function, solow-model, convergence, cfa-level-2"
}
</script>
