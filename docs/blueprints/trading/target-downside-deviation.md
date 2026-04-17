---
title: "Target Downside Deviation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compute the target downside deviation (target semideviation) — the square root of the average squared deviations below a target return — a risk measure for inve"
---

# Target Downside Deviation Blueprint

> Compute the target downside deviation (target semideviation) — the square root of the average squared deviations below a target return — a risk measure for investors asymmetrically averse to losses

| | |
|---|---|
| **Feature** | `target-downside-deviation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, descriptive-statistics, downside-risk, semideviation, target-return, post-modern-portfolio-theory, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/target-downside-deviation.blueprint.yaml) |
| **JSON API** | [target-downside-deviation.json]({{ site.baseurl }}/api/blueprints/trading/target-downside-deviation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `risk_engine` | Downside Risk Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `observations` | json | Yes | Array of returns |  |
| `target_return` | number | Yes | Minimum acceptable return (MAR) or target (decimal) — e.g., 0 for loss aversion, risk-free rate for Sortino |  |
| `population_or_sample` | select | No | sample (default, uses n-1) \| population (uses N) |  |

## Rules

- **core_formula:**
  - **target_semideviation:** s_target = sqrt( sum_{X_i < target}[ (X_i - target)^2 ] / (n - 1) )
  - **denominator_note:** Per CFA convention: divide by n-1 of the full sample, even though only below-target squared deviations are summed
- **comparison_with_std_dev:**
  - **std_dev:** Treats upside and downside deviations symmetrically
  - **target_semideviation:** Penalises only below-target outcomes; aligns with investor loss aversion
- **applications:**
  - **sortino_ratio:** (R_portfolio - R_target) / target_semideviation; Sortino's refinement of Sharpe
  - **liability_driven:** Pension funds use MAR as the liability rate; target_semideviation quantifies shortfall risk
  - **post_modern_portfolio_theory:** Replaces variance with downside risk in optimisation
- **interpretation:**
  - **lower_is_better:** Lower target_semideviation means smaller expected shortfall below target
  - **zero:** A portfolio never underperforming the target produces zero target_semideviation
- **validation:**
  - **non_empty:** observations array must be non-empty
  - **sufficient_sample:** n >= 2

## Outcomes

### Compute_target_semideviation (Priority: 1)

_Target downside deviation_

**Given:**
- `observations` (input) exists
- `target_return` (input) exists

**Then:**
- **call_service** target: `risk_engine`
- **emit_event** event: `risk.target_semideviation_calculated`

### Empty_observations (Priority: 10) — Error: `SEMI_DEV_EMPTY`

_Empty dataset_

**Given:**
- `observations` (input) not_exists

**Then:**
- **emit_event** event: `risk.target_semideviation_rejected`

### Insufficient_sample (Priority: 11) — Error: `SEMI_DEV_INSUFFICIENT_SAMPLE`

_Fewer than 2 observations_

**Given:**
- `sample_size` (computed) lt `2`

**Then:**
- **emit_event** event: `risk.target_semideviation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SEMI_DEV_EMPTY` | 400 | Observations array must not be empty | No |
| `SEMI_DEV_INSUFFICIENT_SAMPLE` | 400 | At least 2 observations required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `risk.target_semideviation_calculated` |  | `dataset_id`, `target_return`, `target_semideviation`, `below_target_count`, `sample_size` |
| `risk.target_semideviation_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| measures-of-dispersion | recommended |  |
| holding-period-return | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: Monthly returns, target = 0%
  returns:
    - 0.02
    - -0.01
    - 0.03
    - -0.005
    - 0.015
    - -0.02
  below_target_squared_sum: 0.000525
  n_minus_1: 5
  target_semideviation: 0.01025
sortino_example:
  formula: Sortino = (R_portfolio - R_target) / target_semideviation
  rationale: Penalises only 'bad' volatility (below target)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Target Downside Deviation Blueprint",
  "description": "Compute the target downside deviation (target semideviation) — the square root of the average squared deviations below a target return — a risk measure for inve",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, descriptive-statistics, downside-risk, semideviation, target-return, post-modern-portfolio-theory, cfa-level-1"
}
</script>
