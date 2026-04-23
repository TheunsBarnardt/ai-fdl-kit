---
title: "Hypothesis Test Means Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample de"
---

# Hypothesis Test Means Blueprint

> Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample dependence

| | |
|---|---|
| **Feature** | `hypothesis-test-means` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, t-test, z-test, paired-comparisons, means-comparison, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/hypothesis-test-means.blueprint.yaml) |
| **JSON API** | [hypothesis-test-means.json]({{ site.baseurl }}/api/blueprints/trading/hypothesis-test-means.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario` | select | Yes | single_mean_known_sigma \| single_mean_unknown_sigma \| two_means_pooled \| two_means_unequal_var \| paired_comparison |  |
| `sample_1` | json | No | Observations (or summary stats x_bar, s, n) for sample 1 |  |
| `sample_2` | json | No | Observations or summary stats for sample 2 (two-sample tests) |  |
| `paired_differences` | json | No | Array of d_i = x_i - y_i for paired comparison test |  |
| `hypothesized_mean` | number | No | mu_0 (single-sample) or hypothesized mean difference (two-sample) |  |

## Rules

- **single_mean_known_sigma:**
  - **statistic:** Z = (X_bar - mu_0) / (sigma / sqrt(n))
  - **distribution:** Standard normal N(0, 1)
  - **use_when:** Sigma known OR n is very large regardless of distribution
- **single_mean_unknown_sigma:**
  - **statistic:** t = (X_bar - mu_0) / (s / sqrt(n))
  - **distribution:** t with n-1 degrees of freedom
  - **use_when:** Population approximately normal; sigma unknown (the usual case)
- **two_means_pooled:**
  - **statistic:** t = (X_bar_1 - X_bar_2 - D_0) / sqrt(s_p^2 * (1/n_1 + 1/n_2))
  - **pooled_variance:** s_p^2 = ((n_1 - 1)*s_1^2 + (n_2 - 1)*s_2^2) / (n_1 + n_2 - 2)
  - **degrees_of_freedom:** n_1 + n_2 - 2
  - **assumptions:** Independent samples; equal population variances; approximately normal
- **two_means_unequal_variance:**
  - **statistic:** t = (X_bar_1 - X_bar_2 - D_0) / sqrt(s_1^2/n_1 + s_2^2/n_2)
  - **degrees_of_freedom:** Satterthwaite approximation
  - **use_when:** Independent samples; variances cannot be assumed equal
- **paired_comparisons:**
  - **statistic:** t = (d_bar - D_0) / (s_d / sqrt(n))
  - **where:** d_i = x_i - y_i (paired differences); s_d = std dev of d's
  - **degrees_of_freedom:** n - 1 (n = number of pairs)
  - **use_when:** Observations are naturally paired (before/after, matched samples)
- **decision_making:**
  - **critical_values:** From z or t tables at alpha; two-sided uses alpha/2 per tail
  - **p_value:** Probability under null of observing as extreme a statistic
  - **reject_rule:** |statistic| > critical_value → reject H0
- **applications:**
  - **fund_manager_skill:** t-test whether alpha > 0 over history
  - **strategy_comparison:** Two-sample t-test of returns for two trading systems
  - **event_studies:** Paired test pre/post news announcement
  - **backtesting:** Compare live vs simulated returns
- **validation:**
  - **sample_size_adequate:** n >= 2 per sample (n >= 30 preferable for CLT)
  - **paired_lengths_match:** Paired samples must have equal length
  - **positive_variance:** Denominator std dev > 0

## Outcomes

### Run_single_mean_test (Priority: 1)

_Z or t test for a single mean_

**Given:**
- `scenario` (input) in `single_mean_known_sigma,single_mean_unknown_sigma`
- `sample_1` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.mean_test_completed`

### Run_two_sample_test (Priority: 2)

_Two-sample t-test (pooled or Welch)_

**Given:**
- `scenario` (input) in `two_means_pooled,two_means_unequal_var`
- `sample_1` (input) exists
- `sample_2` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.mean_test_completed`

### Run_paired_test (Priority: 3)

_Paired-comparison t-test_

**Given:**
- `scenario` (input) eq `paired_comparison`
- `paired_differences` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.mean_test_completed`

### Invalid_scenario (Priority: 10) — Error: `MEAN_TEST_INVALID_SCENARIO`

_Unknown or unsupported scenario_

**Given:**
- `scenario` (input) not_in `single_mean_known_sigma,single_mean_unknown_sigma,two_means_pooled,two_means_unequal_var,paired_comparison`

**Then:**
- **emit_event** event: `inference.mean_test_rejected`

### Missing_inputs (Priority: 11) — Error: `MEAN_TEST_MISSING_DATA`

_Required samples missing for scenario_

**Given:**
- ALL: `sample_1` (input) not_exists AND `paired_differences` (input) not_exists

**Then:**
- **emit_event** event: `inference.mean_test_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MEAN_TEST_INVALID_SCENARIO` | 400 | Scenario must be one of the supported test types | No |
| `MEAN_TEST_MISSING_DATA` | 400 | Sample data required for mean hypothesis test | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.mean_test_completed` |  | `test_id`, `scenario`, `statistic`, `p_value`, `degrees_of_freedom`, `decision` |
| `inference.mean_test_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hypothesis-testing-framework | required |  |
| central-limit-theorem | required |  |
| hypothesis-test-variance | recommended |  |

## AGI Readiness

### Goals

#### Reliable Hypothesis Test Means

Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample dependence

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
| `central_limit_theorem` | central-limit-theorem | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| run_single_mean_test | `autonomous` | - | - |
| run_two_sample_test | `autonomous` | - | - |
| run_paired_test | `autonomous` | - | - |
| invalid_scenario | `autonomous` | - | - |
| missing_inputs | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: single_mean_unknown_sigma
  hypothesized_mean: 0.1
  x_bar: 0.12
  s: 0.18
  n: 50
  t_statistic: (0.12 - 0.10) / (0.18 / sqrt(50)) = 0.786
  degrees_of_freedom: 49
  critical_t_0_025: 2.01
  decision: Fail to reject H0 at alpha=0.05
paired_example:
  scenario: paired_comparison
  setup: n=30 fund-benchmark return pairs
  d_bar: 0.015
  s_d: 0.04
  t_statistic: 0.015 / (0.04 / sqrt(30)) = 2.053
  decision: Reject H0 of no outperformance at alpha=0.05 (t_crit = 2.045)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Hypothesis Test Means Blueprint",
  "description": "Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample de",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, t-test, z-test, paired-comparisons, means-comparison, cfa-level-1"
}
</script>
