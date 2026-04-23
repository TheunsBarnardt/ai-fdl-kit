---
title: "Hypothesis Testing Framework Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule"
---

# Hypothesis Testing Framework Blueprint

> Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule, computing, and concluding

| | |
|---|---|
| **Feature** | `hypothesis-testing-framework` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, statistical-inference, type-i-error, type-ii-error, power, p-value, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/hypothesis-testing-framework.blueprint.yaml) |
| **JSON API** | [hypothesis-testing-framework.json]({{ site.baseurl }}/api/blueprints/trading/hypothesis-testing-framework.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `null_hypothesis` | text | Yes | H0 — statement to test, typically equality or status quo |  |
| `alternative_hypothesis` | text | Yes | Ha — the inequality (one-sided or two-sided) the analyst wishes to demonstrate |  |
| `significance_level` | number | Yes | alpha — probability of Type I error (commonly 0.01, 0.05, 0.10) |  |
| `test_statistic_value` | number | No | Computed test statistic from sample |  |
| `p_value` | number | No | Probability of observing a test statistic at least as extreme as observed under H0 |  |
| `test_type` | select | No | two_sided \| one_sided_upper \| one_sided_lower |  |

## Rules

- **six_step_process:**
  - **step_1:** State the null (H0) and alternative (Ha) hypotheses — mutually exclusive and collectively exhaustive
  - **step_2:** Identify the appropriate test statistic and its sampling distribution
  - **step_3:** Specify the significance level (alpha)
  - **step_4:** State the decision rule (critical value region)
  - **step_5:** Collect data and calculate the test statistic
  - **step_6:** Make a decision: reject or fail to reject H0
- **error_types:**
  - **type_i:** Rejecting H0 when H0 is true (false positive); probability = alpha
  - **type_ii:** Failing to reject H0 when H0 is false (false negative); probability = beta
  - **power:** Probability of correctly rejecting a false H0; power = 1 - beta
- **significance_and_decision:**
  - **critical_value_approach:** Reject H0 if |test_statistic| > critical_value_at_alpha
  - **p_value_approach:** Reject H0 if p_value < alpha
  - **equivalence:** Both approaches yield the same decision at a given alpha
- **hypothesis_structure:**
  - **two_sided:** H0: theta = theta_0 vs Ha: theta != theta_0
  - **one_sided_upper:** H0: theta <= theta_0 vs Ha: theta > theta_0
  - **one_sided_lower:** H0: theta >= theta_0 vs Ha: theta < theta_0
  - **null_contains_equality:** H0 always includes the equality; Ha never does
- **practical_guidance:**
  - **alpha_selection:** 0.05 is convention; tighter alpha for costlier Type I, looser for costlier Type II
  - **sample_size:** Larger n increases power at fixed alpha
  - **effect_size:** Statistical significance != practical significance; always report magnitude
- **applications:**
  - **manager_skill:** Test whether alpha != 0 (two-sided) or alpha > 0 (one-sided)
  - **risk_model_validation:** Test whether realized VaR breaches match predicted
  - **policy_changes:** Test whether mean returns differ pre/post policy announcement
- **validation:**
  - **alpha_in_range:** 0 < alpha < 1 (typically 0.001 <= alpha <= 0.20)
  - **hypotheses_mutually_exclusive:** H0 and Ha must not overlap
  - **test_type_defined:** Two-sided vs one-sided must be declared BEFORE seeing data

## Outcomes

### Reject_null_critical_value (Priority: 1)

_Test statistic exceeds critical value — reject H0_

**Given:**
- `test_statistic_exceeds_critical` (computed) eq `true`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.null_rejected`

### Reject_null_p_value (Priority: 2)

_p-value below alpha — reject H0_

**Given:**
- `p_value` (input) lt `significance_level`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.null_rejected`

### Fail_to_reject (Priority: 3)

_Insufficient evidence — fail to reject H0_

**Given:**
- `p_value` (input) gte `significance_level`

**Then:**
- **emit_event** event: `inference.null_not_rejected`

### Invalid_significance_level (Priority: 10) — Error: `HYP_INVALID_ALPHA`

_alpha outside (0, 1)_

**Given:**
- ANY: `significance_level` (input) lte `0` OR `significance_level` (input) gte `1`

**Then:**
- **emit_event** event: `inference.test_rejected`

### Missing_hypotheses (Priority: 11) — Error: `HYP_MISSING_HYPOTHESES`

_Null or alternative missing_

**Given:**
- ANY: `null_hypothesis` (input) not_exists OR `alternative_hypothesis` (input) not_exists

**Then:**
- **emit_event** event: `inference.test_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `HYP_INVALID_ALPHA` | 400 | Significance level alpha must be strictly between 0 and 1 | No |
| `HYP_MISSING_HYPOTHESES` | 400 | Both null and alternative hypotheses must be specified | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.null_rejected` |  | `test_id`, `test_statistic`, `p_value`, `significance_level`, `decision` |
| `inference.null_not_rejected` |  | `test_id`, `test_statistic`, `p_value`, `significance_level`, `decision` |
| `inference.test_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hypothesis-test-means | recommended |  |
| hypothesis-test-variance | recommended |  |
| parametric-vs-nonparametric-tests | recommended |  |
| central-limit-theorem | recommended |  |

## AGI Readiness

### Goals

#### Reliable Hypothesis Testing Framework

Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule, computing, and concluding

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
| reject_null_critical_value | `supervised` | - | - |
| reject_null_p_value | `supervised` | - | - |
| fail_to_reject | `supervised` | - | - |
| invalid_significance_level | `autonomous` | - | - |
| missing_hypotheses | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
confusion_matrix:
  reject_true_null: Type I error (probability alpha)
  reject_false_null: Correct decision (probability 1 - beta = power)
  fail_true_null: Correct decision (probability 1 - alpha = confidence)
  fail_false_null: Type II error (probability beta)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Hypothesis Testing Framework Blueprint",
  "description": "Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, statistical-inference, type-i-error, type-ii-error, power, p-value, cfa-level-1"
}
</script>
