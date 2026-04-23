---
title: "Correlation Significance Test Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Test whether a population correlation coefficient differs from zero using the t-statistic for Pearson correlation or the analogous test for Spearman rank correl"
---

# Correlation Significance Test Blueprint

> Test whether a population correlation coefficient differs from zero using the t-statistic for Pearson correlation or the analogous test for Spearman rank correlation

| | |
|---|---|
| **Feature** | `correlation-significance-test` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, correlation, pearson, spearman, rank-correlation, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/correlation-significance-test.blueprint.yaml) |
| **JSON API** | [correlation-significance-test.json]({{ site.baseurl }}/api/blueprints/trading/correlation-significance-test.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sample_correlation` | number | Yes | Observed sample correlation r (Pearson or Spearman) |  |
| `sample_size` | number | Yes | n — number of paired observations |  |
| `test_variant` | select | No | pearson (default) \| spearman |  |
| `alternative` | select | No | two_sided (default) \| greater \| less |  |

## Rules

- **pearson_test_statistic:**
  - **statistic:** t = r * sqrt(n - 2) / sqrt(1 - r^2)
  - **distribution:** t with n - 2 degrees of freedom
  - **assumptions:** Both variables normally distributed
- **spearman_rank_correlation:**
  - **statistic_for_large_n:** Same t-formula with r = r_s (rank correlation)
  - **alternative_small_n:** Compare r_s directly to tabulated critical values
  - **use_when:** Data are ordinal, ranked, or non-normal
- **sample_size_sensitivity:**
  - **observation:** The same r can be insignificant at n=12 yet significant at n=32
  - **power_growth:** Large-n tests detect tiny correlations with statistical significance that may not be economically meaningful
  - **recommendation:** Always report both r and its confidence interval, not just the p-value
- **hypothesis_forms:**
  - **two_sided:** H0: rho = 0 vs Ha: rho != 0
  - **one_sided_upper:** H0: rho <= 0 vs Ha: rho > 0
  - **one_sided_lower:** H0: rho >= 0 vs Ha: rho < 0
- **applications:**
  - **factor_selection:** Test correlation between candidate factor and forward returns
  - **portfolio_hedges:** Verify that hedge asset has significant negative correlation
  - **analyst_accuracy:** Spearman test between forecast ranks and realised ranks
  - **signal_generation:** Validate that a technical signal correlates with next-period returns
- **validation:**
  - **correlation_in_range:** -1 <= r <= 1
  - **sample_size_adequate:** n >= 3 (need n - 2 > 0)
  - **test_variant_known:** test_variant in {pearson, spearman}

## Outcomes

### Run_pearson_test (Priority: 1)

_t-test on Pearson r_

**Given:**
- `test_variant` (input) eq `pearson`
- `sample_correlation` (input) exists
- `sample_size` (input) gte `3`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.correlation_test_completed`

### Run_spearman_test (Priority: 2)

_Rank correlation test_

**Given:**
- `test_variant` (input) eq `spearman`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.correlation_test_completed`

### Insufficient_n (Priority: 10) — Error: `CORR_TEST_INSUFFICIENT_N`

_Sample size too small_

**Given:**
- `sample_size` (input) lt `3`

**Then:**
- **emit_event** event: `inference.correlation_test_rejected`

### Invalid_r (Priority: 11) — Error: `CORR_TEST_INVALID_R`

_Correlation outside [-1, 1]_

**Given:**
- ANY: `sample_correlation` (input) lt `-1` OR `sample_correlation` (input) gt `1`

**Then:**
- **emit_event** event: `inference.correlation_test_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CORR_TEST_INSUFFICIENT_N` | 400 | At least 3 observations required (need n - 2 > 0) | No |
| `CORR_TEST_INVALID_R` | 400 | Correlation must lie in [-1, 1] | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.correlation_test_completed` |  | `test_id`, `test_variant`, `t_statistic`, `p_value`, `degrees_of_freedom`, `decision` |
| `inference.correlation_test_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| covariance-correlation | required |  |
| hypothesis-testing-framework | required |  |
| parametric-vs-nonparametric-tests | recommended |  |

## AGI Readiness

### Goals

#### Reliable Correlation Significance Test

Test whether a population correlation coefficient differs from zero using the t-statistic for Pearson correlation or the analogous test for Spearman rank correlation

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
| `covariance_correlation` | covariance-correlation | fail |
| `hypothesis_testing_framework` | hypothesis-testing-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| run_pearson_test | `autonomous` | - | - |
| run_spearman_test | `autonomous` | - | - |
| insufficient_n | `autonomous` | - | - |
| invalid_r | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  r: 0.35
  n_small: 12
  t_small: 0.35 * sqrt(10) / sqrt(1 - 0.1225) = 1.182
  decision_small: Fail to reject at alpha=0.05 (t_crit = 2.228)
  n_large: 32
  t_large: 0.35 * sqrt(30) / sqrt(1 - 0.1225) = 2.046
  decision_large: Reject at alpha=0.05 (t_crit = 2.042)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Correlation Significance Test Blueprint",
  "description": "Test whether a population correlation coefficient differs from zero using the t-statistic for Pearson correlation or the analogous test for Spearman rank correl",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, correlation, pearson, spearman, rank-correlation, cfa-level-1"
}
</script>
