---
title: "Hypothesis Test Variance Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Test hypotheses about population variances using the chi-square test for a single variance and the F-test for the ratio of two independent variances. 4 fields. "
---

# Hypothesis Test Variance Blueprint

> Test hypotheses about population variances using the chi-square test for a single variance and the F-test for the ratio of two independent variances

| | |
|---|---|
| **Feature** | `hypothesis-test-variance` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, chi-square-test, f-test, variance-test, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/hypothesis-test-variance.blueprint.yaml) |
| **JSON API** | [hypothesis-test-variance.json]({{ site.baseurl }}/api/blueprints/trading/hypothesis-test-variance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scenario` | select | Yes | single_variance \| two_variance_ratio |  |
| `sample_1` | json | Yes | Observations or summary stats (s^2, n) for sample 1 |  |
| `sample_2` | json | No | Sample 2 for variance ratio test |  |
| `hypothesized_variance` | number | No | sigma_0^2 for single-variance test |  |

## Rules

- **single_variance_test:**
  - **statistic:** chi_square = (n - 1) * s^2 / sigma_0^2
  - **distribution:** Chi-square with n-1 degrees of freedom
  - **assumptions:** Population is normally distributed
  - **two_sided_rule:** Reject H0 if chi_square < chi_{1-alpha/2, n-1} OR chi_square > chi_{alpha/2, n-1}
- **two_variance_ratio_test:**
  - **statistic:** F = s_1^2 / s_2^2 (with s_1^2 >= s_2^2 by convention)
  - **distribution:** F-distribution with (n_1 - 1, n_2 - 1) degrees of freedom
  - **assumptions:** Samples from normally distributed populations; independent samples
  - **convention:** Place larger sample variance in numerator to ensure F >= 1; use right-tail critical value
- **interpretation:**
  - **chi_square_sensitivity:** Chi-square test is sensitive to departures from normality
  - **f_test_sensitivity:** F-test is also sensitive to non-normality; Levene's test is a robust alternative
  - **non_symmetric_distributions:** Both chi-square and F are right-skewed; two-sided tests use asymmetric critical values
- **applications:**
  - **volatility_regime_change:** Test whether volatility in period 2 differs from period 1 (F-test)
  - **risk_model_validation:** Chi-square test of whether realised variance equals model-implied variance
  - **manager_risk_control:** Test whether fund stdev exceeds stated mandate
  - **strategy_comparison:** F-test for equal risk between two trading strategies
- **validation:**
  - **sample_size:** n >= 2 per sample (n - 1 > 0)
  - **variance_positive:** Sample variances must be strictly positive
  - **normality_check:** Warn if data fail normality tests — test results unreliable

## Outcomes

### Run_chi_square_test (Priority: 1)

_Chi-square test for a single variance_

**Given:**
- `scenario` (input) eq `single_variance`
- `hypothesized_variance` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.variance_test_completed`

### Run_f_test (Priority: 2)

_F-test for ratio of two variances_

**Given:**
- `scenario` (input) eq `two_variance_ratio`
- `sample_2` (input) exists

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.variance_test_completed`

### Invalid_scenario (Priority: 10) — Error: `VAR_TEST_INVALID_SCENARIO`

_Unsupported variance test scenario_

**Given:**
- `scenario` (input) not_in `single_variance,two_variance_ratio`

**Then:**
- **emit_event** event: `inference.variance_test_rejected`

### Insufficient_data (Priority: 11) — Error: `VAR_TEST_INSUFFICIENT_DATA`

_Sample data missing or sample size too small_

**Given:**
- ANY: `sample_1` (input) not_exists OR `sample_size_1` (computed) lt `2`

**Then:**
- **emit_event** event: `inference.variance_test_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `VAR_TEST_INVALID_SCENARIO` | 400 | Scenario must be single_variance or two_variance_ratio | No |
| `VAR_TEST_INSUFFICIENT_DATA` | 400 | Each sample requires at least 2 observations | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.variance_test_completed` |  | `test_id`, `scenario`, `statistic`, `degrees_of_freedom`, `p_value`, `decision` |
| `inference.variance_test_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hypothesis-testing-framework | required |  |
| hypothesis-test-means | recommended |  |
| measures-of-dispersion | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
chi_square_example:
  hypothesized_variance: 0.04
  sample_variance: 0.0625
  n: 25
  chi_square: (25 - 1) * 0.0625 / 0.04 = 37.5
  df: 24
  critical_chi_upper_0_025: 39.364
  decision: Fail to reject H0 at alpha = 0.05 two-sided
f_test_example:
  sample_1:
    s2: 0.09
    n: 30
  sample_2:
    s2: 0.04
    n: 25
  f_stat: 0.09 / 0.04 = 2.25
  df:
    - 29
    - 24
  critical_f_0_025: 2.22
  decision: Reject H0 of equal variances at alpha = 0.05
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Hypothesis Test Variance Blueprint",
  "description": "Test hypotheses about population variances using the chi-square test for a single variance and the F-test for the ratio of two independent variances. 4 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, chi-square-test, f-test, variance-test, cfa-level-1"
}
</script>
