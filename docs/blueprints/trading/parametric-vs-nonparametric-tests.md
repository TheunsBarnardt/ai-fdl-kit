---
title: "Parametric Vs Nonparametric Tests Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns"
---

# Parametric Vs Nonparametric Tests Blueprint

> Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns a parameter

| | |
|---|---|
| **Feature** | `parametric-vs-nonparametric-tests` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, nonparametric, parametric, rank-tests, robust-statistics, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/parametric-vs-nonparametric-tests.blueprint.yaml) |
| **JSON API** | [parametric-vs-nonparametric-tests.json]({{ site.baseurl }}/api/blueprints/trading/parametric-vs-nonparametric-tests.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `data_type` | select | Yes | continuous \| ordinal \| nominal \| ranked |  |
| `distributional_assumption_met` | boolean | No | Whether parametric assumptions (normality, equal variance) are reasonable |  |
| `contains_outliers` | boolean | No | Whether sample contains influential outliers |  |
| `hypothesis_concerns_parameter` | boolean | No | True if H0 is about mean/variance/proportion; false for distributional shape / independence |  |

## Rules

- **parametric_tests:**
  - **definition:** Hypothesis tests about a population parameter that assume a specific distribution (usually normal)
  - **examples:** z-test, t-test, chi-square variance test, F-test, ANOVA
  - **strengths:** More powerful when assumptions are met; closed-form sampling distributions
  - **weaknesses:** Sensitive to violations — non-normality, outliers, unequal variances
- **nonparametric_tests:**
  - **definition:** Tests that either do not concern a parameter or make minimal distributional assumptions
  - **examples:** Sign test, Wilcoxon signed-rank, Mann-Whitney U, Kruskal-Wallis, Spearman rank correlation
  - **strengths:** Robust to outliers; work on ranks/ordinal data; distribution-free
  - **weaknesses:** Lower power when parametric assumptions DO hold; interpret results in terms of medians/distributions, not means
- **when_to_use_nonparametric:**
  - **assumption_violations:** Data are clearly non-normal, especially with small n
  - **outliers_present:** Influential outliers that cannot be removed
  - **rank_data:** Data provided in ordinal form (e.g., analyst ratings)
  - **non_parametric_hypothesis:** Testing distributional shape, independence, or randomness (e.g., chi-square of independence)
- **parametric_counterparts_mapping:**
  - **one_sample_t:**
    - **nonparametric:** Wilcoxon signed-rank test
  - **two_sample_t:**
    - **nonparametric:** Mann-Whitney U test
  - **paired_t:**
    - **nonparametric:** Wilcoxon signed-rank (on differences) or sign test
  - **anova:**
    - **nonparametric:** Kruskal-Wallis test
  - **pearson_correlation:**
    - **nonparametric:** Spearman rank correlation
- **investment_applications:**
  - **manager_ranking:** Spearman rho between sample ranks and benchmark ranks
  - **small_sample_performance:** Wilcoxon signed-rank to test whether alpha > 0 with n = 10
  - **survey_analysis:** Kruskal-Wallis for ordinal investor-satisfaction scores
  - **robust_event_studies:** Sign test of abnormal return direction around announcements
- **validation:**
  - **appropriate_test_selected:** Parametric assumptions checked before parametric test use
  - **rank_ties_handled:** Nonparametric tests have tie-breaking rules (average ranks)

## Outcomes

### Select_parametric (Priority: 1)

_Parametric test applicable_

**Given:**
- `distributional_assumption_met` (input) eq `true`
- `contains_outliers` (input) eq `false`
- `hypothesis_concerns_parameter` (input) eq `true`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.parametric_selected`

### Select_nonparametric (Priority: 2)

_Nonparametric test appropriate_

**Given:**
- ANY: `distributional_assumption_met` (input) eq `false` OR `contains_outliers` (input) eq `true` OR `data_type` (input) in `ordinal,ranked,nominal` OR `hypothesis_concerns_parameter` (input) eq `false`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.nonparametric_selected`

### Invalid_data_type (Priority: 10) — Error: `TEST_INVALID_DATA_TYPE`

_Unsupported data type_

**Given:**
- `data_type` (input) not_in `continuous,ordinal,nominal,ranked`

**Then:**
- **emit_event** event: `inference.test_selection_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TEST_INVALID_DATA_TYPE` | 400 | Data type must be one of continuous, ordinal, nominal, ranked | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.parametric_selected` |  | `decision_id`, `recommended_test`, `rationale` |
| `inference.nonparametric_selected` |  | `decision_id`, `recommended_test`, `rationale` |
| `inference.test_selection_rejected` |  | `decision_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hypothesis-testing-framework | required |  |
| hypothesis-test-means | recommended |  |
| hypothesis-test-variance | recommended |  |

## AGI Readiness

### Goals

#### Reliable Parametric Vs Nonparametric Tests

Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns a parameter

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
| `hypothesis_testing_framework` | hypothesis-testing-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| select_parametric | `autonomous` | - | - |
| select_nonparametric | `autonomous` | - | - |
| invalid_data_type | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
decision_guide:
  use_parametric_when: Large sample from approximately normal population; no
    extreme outliers; hypothesis about mu or sigma
  use_nonparametric_when: Small sample; clearly non-normal; ordinal/ranked data;
    hypothesis about independence or shape
test_cross_reference:
  location: tests_of_independence
  note: Chi-square test of independence is nonparametric and covered in
    parametric-nonparametric-tests-independence blueprint
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Parametric Vs Nonparametric Tests Blueprint",
  "description": "Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, nonparametric, parametric, rank-tests, robust-statistics, cfa-level-1"
}
</script>
