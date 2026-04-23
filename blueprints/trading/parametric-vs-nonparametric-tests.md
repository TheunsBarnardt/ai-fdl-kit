<!-- AUTO-GENERATED FROM parametric-vs-nonparametric-tests.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Parametric Vs Nonparametric Tests

> Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns a parameter

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · hypothesis-testing · nonparametric · parametric · rank-tests · robust-statistics · cfa-level-1

## What this does

Choose between parametric and nonparametric hypothesis tests based on distributional assumptions, outliers, rank-based data, and whether the hypothesis concerns a parameter

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **data_type** *(select, required)* — continuous | ordinal | nominal | ranked
- **distributional_assumption_met** *(boolean, optional)* — Whether parametric assumptions (normality, equal variance) are reasonable
- **contains_outliers** *(boolean, optional)* — Whether sample contains influential outliers
- **hypothesis_concerns_parameter** *(boolean, optional)* — True if H0 is about mean/variance/proportion; false for distributional shape / independence

## What must be true

- **parametric_tests → definition:** Hypothesis tests about a population parameter that assume a specific distribution (usually normal)
- **parametric_tests → examples:** z-test, t-test, chi-square variance test, F-test, ANOVA
- **parametric_tests → strengths:** More powerful when assumptions are met; closed-form sampling distributions
- **parametric_tests → weaknesses:** Sensitive to violations — non-normality, outliers, unequal variances
- **nonparametric_tests → definition:** Tests that either do not concern a parameter or make minimal distributional assumptions
- **nonparametric_tests → examples:** Sign test, Wilcoxon signed-rank, Mann-Whitney U, Kruskal-Wallis, Spearman rank correlation
- **nonparametric_tests → strengths:** Robust to outliers; work on ranks/ordinal data; distribution-free
- **nonparametric_tests → weaknesses:** Lower power when parametric assumptions DO hold; interpret results in terms of medians/distributions, not means
- **when_to_use_nonparametric → assumption_violations:** Data are clearly non-normal, especially with small n
- **when_to_use_nonparametric → outliers_present:** Influential outliers that cannot be removed
- **when_to_use_nonparametric → rank_data:** Data provided in ordinal form (e.g., analyst ratings)
- **when_to_use_nonparametric → non_parametric_hypothesis:** Testing distributional shape, independence, or randomness (e.g., chi-square of independence)
- **parametric_counterparts_mapping → one_sample_t → nonparametric:** Wilcoxon signed-rank test
- **parametric_counterparts_mapping → two_sample_t → nonparametric:** Mann-Whitney U test
- **parametric_counterparts_mapping → paired_t → nonparametric:** Wilcoxon signed-rank (on differences) or sign test
- **parametric_counterparts_mapping → anova → nonparametric:** Kruskal-Wallis test
- **parametric_counterparts_mapping → pearson_correlation → nonparametric:** Spearman rank correlation
- **investment_applications → manager_ranking:** Spearman rho between sample ranks and benchmark ranks
- **investment_applications → small_sample_performance:** Wilcoxon signed-rank to test whether alpha > 0 with n = 10
- **investment_applications → survey_analysis:** Kruskal-Wallis for ordinal investor-satisfaction scores
- **investment_applications → robust_event_studies:** Sign test of abnormal return direction around announcements
- **validation → appropriate_test_selected:** Parametric assumptions checked before parametric test use
- **validation → rank_ties_handled:** Nonparametric tests have tie-breaking rules (average ranks)

## Success & failure scenarios

**✅ Success paths**

- **Select Parametric** — when distributional_assumption_met eq true; contains_outliers eq false; hypothesis_concerns_parameter eq true, then call service; emit inference.parametric_selected. _Why: Parametric test applicable._
- **Select Nonparametric** — when distributional_assumption_met eq false OR contains_outliers eq true OR data_type in ["ordinal","ranked","nominal"] OR hypothesis_concerns_parameter eq false, then call service; emit inference.nonparametric_selected. _Why: Nonparametric test appropriate._

**❌ Failure paths**

- **Invalid Data Type** — when data_type not_in ["continuous","ordinal","nominal","ranked"], then emit inference.test_selection_rejected. _Why: Unsupported data type._ *(error: `TEST_INVALID_DATA_TYPE`)*

## Errors it can return

- `TEST_INVALID_DATA_TYPE` — Data type must be one of continuous, ordinal, nominal, ranked

## Events

**`inference.parametric_selected`**
  Payload: `decision_id`, `recommended_test`, `rationale`

**`inference.nonparametric_selected`**
  Payload: `decision_id`, `recommended_test`, `rationale`

**`inference.test_selection_rejected`**
  Payload: `decision_id`, `reason_code`

## Connects to

- **hypothesis-testing-framework** *(required)*
- **hypothesis-test-means** *(recommended)*
- **hypothesis-test-variance** *(recommended)*

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/parametric-vs-nonparametric-tests/) · **Spec source:** [`parametric-vs-nonparametric-tests.blueprint.yaml`](./parametric-vs-nonparametric-tests.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
