---
title: "Portfolio Expected Return Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the expected return of a portfolio as the weighted average of the expected returns on its component securities using currency-weighted portfolio weights"
---

# Portfolio Expected Return Blueprint

> Compute the expected return of a portfolio as the weighted average of the expected returns on its component securities using currency-weighted portfolio weights

| | |
|---|---|
| **Feature** | `portfolio-expected-return` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, portfolio-mathematics, expected-return, portfolio-weights, modern-portfolio-theory, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-expected-return.blueprint.yaml) |
| **JSON API** | [portfolio-expected-return.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-expected-return.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_engine` | Portfolio Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `holdings` | json | Yes | Array of {asset_id, weight, expected_return} for each portfolio position |  |
| `weights_basis` | select | No | currency_value (default) \| shares \| equal_weight |  |

## Rules

- **core_formula:**
  - **expected_return:** E(Rp) = sum_{i=1..n}[ w_i * E(R_i) ]
  - **weight_definition:** w_i = market_value_of_asset_i / total_portfolio_value
- **weight_properties:**
  - **sum_to_one:** sum(w_i) = 1 for long-only portfolios
  - **negative_weights_allowed:** Short positions produce w_i < 0; long-short portfolios still require sum(w_i) = 1
- **interpretation:**
  - **weighted_average:** Portfolio expected return is a linear combination of asset expected returns — no diversification effect on return (unlike variance)
  - **forward_looking:** E(R_i) are forecast means, not historical sample means
- **worked_example:**
  - **assets:** {"asset":"S&P 500","weight":0.5,"expected_return":0.13}, {"asset":"US LT corporate bonds","weight":0.25,"expected_return":0.06}, {"asset":"MSCI EAFE","weight":0.25,"expected_return":0.15}
  - **portfolio_expected_return:** 0.1175
- **applications:**
  - **tactical_allocation:** Tilt weights toward higher-expected-return assets
  - **performance_attribution:** Decompose realized return into weight contributions
  - **benchmarking:** Compare active portfolio E(Rp) vs benchmark E(Rp)
- **validation:**
  - **weights_sum_to_one:** |sum(weights) - 1| <= 1e-6 for long-only
  - **non_empty:** holdings array must contain at least one asset
  - **returns_numeric:** All expected_return values must be numeric

## Outcomes

### Compute_expected_return (Priority: 1)

_Weighted average of component expected returns_

**Given:**
- `holdings` (input) exists
- `weights_valid` (computed) eq `true`

**Then:**
- **call_service** target: `portfolio_engine`
- **emit_event** event: `portfolio.expected_return_calculated`

### Weights_invalid (Priority: 10) — Error: `PORT_ER_WEIGHTS_INVALID`

_Weights do not sum to 1_

**Given:**
- `weights_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `portfolio.expected_return_rejected`

### Empty_portfolio (Priority: 11) — Error: `PORT_ER_EMPTY`

_No holdings provided_

**Given:**
- `holdings` (input) not_exists

**Then:**
- **emit_event** event: `portfolio.expected_return_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORT_ER_EMPTY` | 400 | Holdings array must not be empty | No |
| `PORT_ER_WEIGHTS_INVALID` | 400 | Portfolio weights must sum to 1 within tolerance | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `portfolio.expected_return_calculated` |  | `portfolio_id`, `expected_return`, `asset_count` |
| `portfolio.expected_return_rejected` |  | `portfolio_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| expected-value-variance | required |  |
| portfolio-variance-covariance | recommended |  |
| covariance-correlation | recommended |  |

## AGI Readiness

### Goals

#### Reliable Portfolio Expected Return

Compute the expected return of a portfolio as the weighted average of the expected returns on its component securities using currency-weighted portfolio weights

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
| `expected_value_variance` | expected-value-variance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_expected_return | `autonomous` | - | - |
| weights_invalid | `autonomous` | - | - |
| empty_portfolio | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
related_blueprints:
  - expected-value-variance
  - portfolio-variance-covariance
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Expected Return Blueprint",
  "description": "Compute the expected return of a portfolio as the weighted average of the expected returns on its component securities using currency-weighted portfolio weights",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, portfolio-mathematics, expected-return, portfolio-weights, modern-portfolio-theory, cfa-level-1"
}
</script>
