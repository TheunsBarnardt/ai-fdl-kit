---
title: "Total Probability Rule Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclus"
---

# Total Probability Rule Blueprint

> Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclusive, exhaustive scenarios

| | |
|---|---|
| **Feature** | `total-probability-rule` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, probability, total-probability, law-of-total-expectation, scenario-analysis, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/total-probability-rule.blueprint.yaml) |
| **JSON API** | [total-probability-rule.json]({{ site.baseurl }}/api/blueprints/trading/total-probability-rule.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `probability_engine` | Probability / Forecasting Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenarios` | json | Yes | Array of {id, probability} representing mutually exclusive and exhaustive scenarios |  |
| `conditional_probabilities` | json | No | Array of {scenario_id, P(A\|S)} for computing P(A) |  |
| `conditional_expectations` | json | No | Array of {scenario_id, E(X\|S)} for computing E(X) |  |
| `compute` | select | Yes | unconditional_probability \| unconditional_expectation \| unconditional_variance |  |

## Rules

- **core_formulas:**
  - **total_probability:** P(A) = sum_{i=1..n}[ P(A | S_i) * P(S_i) ]
  - **total_expectation:** E(X) = sum_{i=1..n}[ E(X | S_i) * P(S_i) ]
  - **total_variance:** Var(X) = sum_{i=1..n}[ P(S_i) * (E(X | S_i) - E(X))^2 ] + sum_{i=1..n}[ P(S_i) * Var(X | S_i) ]
- **scenario_requirements:**
  - **mutually_exclusive:** No two scenarios can occur simultaneously
  - **exhaustive:** Scenarios span the entire event space; sum(P(S_i)) = 1
- **interpretation:**
  - **total_probability:** Unconditional P(A) is the probability-weighted average of scenario-conditional P(A|S_i)
  - **total_expectation:** Unconditional E(X) is the probability-weighted average of scenario-conditional E(X|S_i)
  - **variance_decomposition:** Total variance = between-scenario variance + within-scenario variance (Law of Total Variance)
- **investment_applications:**
  - **scenario_analysis:** Combine bull/base/bear conditional expectations into a single unconditional forecast
  - **stress_testing:** Decompose portfolio risk into crisis vs non-crisis regimes
  - **macro_overlay:** Forecast earnings as recession-weighted + expansion-weighted components
- **relation_to_bayes:**
  - **denominator:** Total probability rule provides the denominator (unconditional) in Bayes' formula
- **validation:**
  - **scenarios_exhaustive:** |sum(P(S_i)) - 1| <= 1e-8
  - **conditionals_provided:** At least one of conditional_probabilities or conditional_expectations must match compute choice
  - **scenarios_align:** Every scenario_id in conditionals must exist in scenarios

## Outcomes

### Compute_unconditional_probability (Priority: 1)

_P(A) via total probability_

**Given:**
- `compute` (input) eq `unconditional_probability`
- `conditional_probabilities` (input) exists

**Then:**
- **call_service** target: `probability_engine`
- **emit_event** event: `probability.total_probability_calculated`

### Compute_unconditional_expectation (Priority: 2)

_E(X) via total expectation_

**Given:**
- `compute` (input) eq `unconditional_expectation`
- `conditional_expectations` (input) exists

**Then:**
- **call_service** target: `probability_engine`
- **emit_event** event: `probability.total_expectation_calculated`

### Compute_unconditional_variance (Priority: 3)

_Var(X) via law of total variance_

**Given:**
- `compute` (input) eq `unconditional_variance`

**Then:**
- **call_service** target: `probability_engine`
- **emit_event** event: `probability.total_variance_calculated`

### Scenarios_not_exhaustive (Priority: 10) — Error: `TOTAL_PROB_NOT_EXHAUSTIVE`

_Scenario probabilities do not sum to 1_

**Given:**
- `scenarios_exhaustive` (computed) eq `false`

**Then:**
- **emit_event** event: `probability.total_rejected`

### Missing_conditionals (Priority: 11) — Error: `TOTAL_PROB_MISSING_INPUTS`

_Required conditional inputs missing_

**Given:**
- ANY: `scenarios` (input) not_exists OR `compute` (input) not_exists

**Then:**
- **emit_event** event: `probability.total_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TOTAL_PROB_NOT_EXHAUSTIVE` | 400 | Scenarios must be mutually exclusive and exhaustive; probabilities must sum to 1 | No |
| `TOTAL_PROB_MISSING_INPUTS` | 400 | Scenarios and compute target are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `probability.total_probability_calculated` |  | `dataset_id`, `unconditional_probability`, `scenario_count` |
| `probability.total_expectation_calculated` |  | `dataset_id`, `unconditional_expectation`, `scenario_count` |
| `probability.total_variance_calculated` |  | `dataset_id`, `unconditional_variance`, `between_variance`, `within_variance` |
| `probability.total_rejected` |  | `dataset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| expected-value-variance | required |  |
| probability-tree-conditional-expectation | required |  |
| bayes-formula | recommended |  |

## AGI Readiness

### Goals

#### Reliable Total Probability Rule

Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclusive, exhaustive scenarios

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
| `probability_tree_conditional_expectation` | probability-tree-conditional-expectation | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_unconditional_probability | `autonomous` | - | - |
| compute_unconditional_expectation | `autonomous` | - | - |
| compute_unconditional_variance | `autonomous` | - | - |
| scenarios_not_exhaustive | `autonomous` | - | - |
| missing_conditionals | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenarios:
    - id: good
      probability: 0.6
    - id: poor
      probability: 0.4
  conditional_expectations:
    - scenario_id: good
      value: 2.4875
    - scenario_id: poor
      value: 2.12
  unconditional_expectation: 0.60 * 2.4875 + 0.40 * 2.12 = 2.3405
stress_scenario_example:
  scenarios:
    - id: recession
      probability: 0.2
      e_return: -0.15
    - id: normal
      probability: 0.65
      e_return: 0.08
    - id: boom
      probability: 0.15
      e_return: 0.2
  expected_return: 0.20*(-0.15) + 0.65*0.08 + 0.15*0.20 = 0.052
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Total Probability Rule Blueprint",
  "description": "Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclus",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, probability, total-probability, law-of-total-expectation, scenario-analysis, cfa-level-1"
}
</script>
