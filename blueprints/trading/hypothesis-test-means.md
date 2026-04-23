<!-- AUTO-GENERATED FROM hypothesis-test-means.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Hypothesis Test Means

> Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample dependence

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · hypothesis-testing · t-test · z-test · paired-comparisons · means-comparison · cfa-level-1

## What this does

Test hypotheses about one or two population means using z-tests and t-tests — including paired comparisons — selecting based on variance knowledge and sample dependence

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **scenario** *(select, required)* — single_mean_known_sigma | single_mean_unknown_sigma | two_means_pooled | two_means_unequal_var | paired_comparison
- **sample_1** *(json, optional)* — Observations (or summary stats x_bar, s, n) for sample 1
- **sample_2** *(json, optional)* — Observations or summary stats for sample 2 (two-sample tests)
- **paired_differences** *(json, optional)* — Array of d_i = x_i - y_i for paired comparison test
- **hypothesized_mean** *(number, optional)* — mu_0 (single-sample) or hypothesized mean difference (two-sample)

## What must be true

- **single_mean_known_sigma → statistic:** Z = (X_bar - mu_0) / (sigma / sqrt(n))
- **single_mean_known_sigma → distribution:** Standard normal N(0, 1)
- **single_mean_known_sigma → use_when:** Sigma known OR n is very large regardless of distribution
- **single_mean_unknown_sigma → statistic:** t = (X_bar - mu_0) / (s / sqrt(n))
- **single_mean_unknown_sigma → distribution:** t with n-1 degrees of freedom
- **single_mean_unknown_sigma → use_when:** Population approximately normal; sigma unknown (the usual case)
- **two_means_pooled → statistic:** t = (X_bar_1 - X_bar_2 - D_0) / sqrt(s_p^2 * (1/n_1 + 1/n_2))
- **two_means_pooled → pooled_variance:** s_p^2 = ((n_1 - 1)*s_1^2 + (n_2 - 1)*s_2^2) / (n_1 + n_2 - 2)
- **two_means_pooled → degrees_of_freedom:** n_1 + n_2 - 2
- **two_means_pooled → assumptions:** Independent samples; equal population variances; approximately normal
- **two_means_unequal_variance → statistic:** t = (X_bar_1 - X_bar_2 - D_0) / sqrt(s_1^2/n_1 + s_2^2/n_2)
- **two_means_unequal_variance → degrees_of_freedom:** Satterthwaite approximation
- **two_means_unequal_variance → use_when:** Independent samples; variances cannot be assumed equal
- **paired_comparisons → statistic:** t = (d_bar - D_0) / (s_d / sqrt(n))
- **paired_comparisons → where:** d_i = x_i - y_i (paired differences); s_d = std dev of d's
- **paired_comparisons → degrees_of_freedom:** n - 1 (n = number of pairs)
- **paired_comparisons → use_when:** Observations are naturally paired (before/after, matched samples)
- **decision_making → critical_values:** From z or t tables at alpha; two-sided uses alpha/2 per tail
- **decision_making → p_value:** Probability under null of observing as extreme a statistic
- **decision_making → reject_rule:** |statistic| > critical_value → reject H0
- **applications → fund_manager_skill:** t-test whether alpha > 0 over history
- **applications → strategy_comparison:** Two-sample t-test of returns for two trading systems
- **applications → event_studies:** Paired test pre/post news announcement
- **applications → backtesting:** Compare live vs simulated returns
- **validation → sample_size_adequate:** n >= 2 per sample (n >= 30 preferable for CLT)
- **validation → paired_lengths_match:** Paired samples must have equal length
- **validation → positive_variance:** Denominator std dev > 0

## Success & failure scenarios

**✅ Success paths**

- **Run Single Mean Test** — when scenario in ["single_mean_known_sigma","single_mean_unknown_sigma"]; sample_1 exists, then call service; emit inference.mean_test_completed. _Why: Z or t test for a single mean._
- **Run Two Sample Test** — when scenario in ["two_means_pooled","two_means_unequal_var"]; sample_1 exists; sample_2 exists, then call service; emit inference.mean_test_completed. _Why: Two-sample t-test (pooled or Welch)._
- **Run Paired Test** — when scenario eq "paired_comparison"; paired_differences exists, then call service; emit inference.mean_test_completed. _Why: Paired-comparison t-test._

**❌ Failure paths**

- **Invalid Scenario** — when scenario not_in ["single_mean_known_sigma","single_mean_unknown_sigma","two_means_pooled","two_means_unequal_var","paired_comparison"], then emit inference.mean_test_rejected. _Why: Unknown or unsupported scenario._ *(error: `MEAN_TEST_INVALID_SCENARIO`)*
- **Missing Inputs** — when sample_1 not_exists AND paired_differences not_exists, then emit inference.mean_test_rejected. _Why: Required samples missing for scenario._ *(error: `MEAN_TEST_MISSING_DATA`)*

## Errors it can return

- `MEAN_TEST_INVALID_SCENARIO` — Scenario must be one of the supported test types
- `MEAN_TEST_MISSING_DATA` — Sample data required for mean hypothesis test

## Events

**`inference.mean_test_completed`**
  Payload: `test_id`, `scenario`, `statistic`, `p_value`, `degrees_of_freedom`, `decision`

**`inference.mean_test_rejected`**
  Payload: `test_id`, `reason_code`

## Connects to

- **hypothesis-testing-framework** *(required)*
- **central-limit-theorem** *(required)*
- **hypothesis-test-variance** *(recommended)*

## Quality fitness 🟢 89/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/hypothesis-test-means/) · **Spec source:** [`hypothesis-test-means.blueprint.yaml`](./hypothesis-test-means.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
