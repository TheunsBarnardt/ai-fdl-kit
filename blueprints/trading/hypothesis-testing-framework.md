<!-- AUTO-GENERATED FROM hypothesis-testing-framework.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Hypothesis Testing Framework

> Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule, computing, and concluding

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · hypothesis-testing · statistical-inference · type-i-error · type-ii-error · power · p-value · cfa-level-1

## What this does

Conduct statistical hypothesis tests through the standard six-step framework — stating hypotheses, selecting test statistic, setting significance, deciding rule, computing, and concluding

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **null_hypothesis** *(text, required)* — H0 — statement to test, typically equality or status quo
- **alternative_hypothesis** *(text, required)* — Ha — the inequality (one-sided or two-sided) the analyst wishes to demonstrate
- **significance_level** *(number, required)* — alpha — probability of Type I error (commonly 0.01, 0.05, 0.10)
- **test_statistic_value** *(number, optional)* — Computed test statistic from sample
- **p_value** *(number, optional)* — Probability of observing a test statistic at least as extreme as observed under H0
- **test_type** *(select, optional)* — two_sided | one_sided_upper | one_sided_lower

## What must be true

- **six_step_process → step_1:** State the null (H0) and alternative (Ha) hypotheses — mutually exclusive and collectively exhaustive
- **six_step_process → step_2:** Identify the appropriate test statistic and its sampling distribution
- **six_step_process → step_3:** Specify the significance level (alpha)
- **six_step_process → step_4:** State the decision rule (critical value region)
- **six_step_process → step_5:** Collect data and calculate the test statistic
- **six_step_process → step_6:** Make a decision: reject or fail to reject H0
- **error_types → type_i:** Rejecting H0 when H0 is true (false positive); probability = alpha
- **error_types → type_ii:** Failing to reject H0 when H0 is false (false negative); probability = beta
- **error_types → power:** Probability of correctly rejecting a false H0; power = 1 - beta
- **significance_and_decision → critical_value_approach:** Reject H0 if |test_statistic| > critical_value_at_alpha
- **significance_and_decision → p_value_approach:** Reject H0 if p_value < alpha
- **significance_and_decision → equivalence:** Both approaches yield the same decision at a given alpha
- **hypothesis_structure → two_sided:** H0: theta = theta_0 vs Ha: theta != theta_0
- **hypothesis_structure → one_sided_upper:** H0: theta <= theta_0 vs Ha: theta > theta_0
- **hypothesis_structure → one_sided_lower:** H0: theta >= theta_0 vs Ha: theta < theta_0
- **hypothesis_structure → null_contains_equality:** H0 always includes the equality; Ha never does
- **practical_guidance → alpha_selection:** 0.05 is convention; tighter alpha for costlier Type I, looser for costlier Type II
- **practical_guidance → sample_size:** Larger n increases power at fixed alpha
- **practical_guidance → effect_size:** Statistical significance != practical significance; always report magnitude
- **applications → manager_skill:** Test whether alpha != 0 (two-sided) or alpha > 0 (one-sided)
- **applications → risk_model_validation:** Test whether realized VaR breaches match predicted
- **applications → policy_changes:** Test whether mean returns differ pre/post policy announcement
- **validation → alpha_in_range:** 0 < alpha < 1 (typically 0.001 <= alpha <= 0.20)
- **validation → hypotheses_mutually_exclusive:** H0 and Ha must not overlap
- **validation → test_type_defined:** Two-sided vs one-sided must be declared BEFORE seeing data

## Success & failure scenarios

**✅ Success paths**

- **Reject Null Critical Value** — when test_statistic_exceeds_critical eq true, then call service; emit inference.null_rejected. _Why: Test statistic exceeds critical value — reject H0._
- **Reject Null P Value** — when p_value lt "significance_level", then call service; emit inference.null_rejected. _Why: p-value below alpha — reject H0._
- **Fail To Reject** — when p_value gte "significance_level", then emit inference.null_not_rejected. _Why: Insufficient evidence — fail to reject H0._

**❌ Failure paths**

- **Invalid Significance Level** — when significance_level lte 0 OR significance_level gte 1, then emit inference.test_rejected. _Why: alpha outside (0, 1)._ *(error: `HYP_INVALID_ALPHA`)*
- **Missing Hypotheses** — when null_hypothesis not_exists OR alternative_hypothesis not_exists, then emit inference.test_rejected. _Why: Null or alternative missing._ *(error: `HYP_MISSING_HYPOTHESES`)*

## Errors it can return

- `HYP_INVALID_ALPHA` — Significance level alpha must be strictly between 0 and 1
- `HYP_MISSING_HYPOTHESES` — Both null and alternative hypotheses must be specified

## Events

**`inference.null_rejected`**
  Payload: `test_id`, `test_statistic`, `p_value`, `significance_level`, `decision`

**`inference.null_not_rejected`**
  Payload: `test_id`, `test_statistic`, `p_value`, `significance_level`, `decision`

**`inference.test_rejected`**
  Payload: `test_id`, `reason_code`

## Connects to

- **hypothesis-test-means** *(recommended)*
- **hypothesis-test-variance** *(recommended)*
- **parametric-vs-nonparametric-tests** *(recommended)*
- **central-limit-theorem** *(recommended)*

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/hypothesis-testing-framework/) · **Spec source:** [`hypothesis-testing-framework.blueprint.yaml`](./hypothesis-testing-framework.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
