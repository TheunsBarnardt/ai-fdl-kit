<!-- AUTO-GENERATED FROM total-probability-rule.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Total Probability Rule

> Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclusive, exhaustive scenarios

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · probability · total-probability · law-of-total-expectation · scenario-analysis · cfa-level-1

## What this does

Apply the total probability rule and law of total expectation — decomposing an unconditional probability or expectation into a weighted sum over mutually exclusive, exhaustive scenarios

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **scenarios** *(json, required)* — Array of {id, probability} representing mutually exclusive and exhaustive scenarios
- **conditional_probabilities** *(json, optional)* — Array of {scenario_id, P(A|S)} for computing P(A)
- **conditional_expectations** *(json, optional)* — Array of {scenario_id, E(X|S)} for computing E(X)
- **compute** *(select, required)* — unconditional_probability | unconditional_expectation | unconditional_variance

## What must be true

- **core_formulas → total_probability:** P(A) = sum_{i=1..n}[ P(A | S_i) * P(S_i) ]
- **core_formulas → total_expectation:** E(X) = sum_{i=1..n}[ E(X | S_i) * P(S_i) ]
- **core_formulas → total_variance:** Var(X) = sum_{i=1..n}[ P(S_i) * (E(X | S_i) - E(X))^2 ] + sum_{i=1..n}[ P(S_i) * Var(X | S_i) ]
- **scenario_requirements → mutually_exclusive:** No two scenarios can occur simultaneously
- **scenario_requirements → exhaustive:** Scenarios span the entire event space; sum(P(S_i)) = 1
- **interpretation → total_probability:** Unconditional P(A) is the probability-weighted average of scenario-conditional P(A|S_i)
- **interpretation → total_expectation:** Unconditional E(X) is the probability-weighted average of scenario-conditional E(X|S_i)
- **interpretation → variance_decomposition:** Total variance = between-scenario variance + within-scenario variance (Law of Total Variance)
- **investment_applications → scenario_analysis:** Combine bull/base/bear conditional expectations into a single unconditional forecast
- **investment_applications → stress_testing:** Decompose portfolio risk into crisis vs non-crisis regimes
- **investment_applications → macro_overlay:** Forecast earnings as recession-weighted + expansion-weighted components
- **relation_to_bayes → denominator:** Total probability rule provides the denominator (unconditional) in Bayes' formula
- **validation → scenarios_exhaustive:** |sum(P(S_i)) - 1| <= 1e-8
- **validation → conditionals_provided:** At least one of conditional_probabilities or conditional_expectations must match compute choice
- **validation → scenarios_align:** Every scenario_id in conditionals must exist in scenarios

## Success & failure scenarios

**✅ Success paths**

- **Compute Unconditional Probability** — when compute eq "unconditional_probability"; conditional_probabilities exists, then call service; emit probability.total_probability_calculated. _Why: P(A) via total probability._
- **Compute Unconditional Expectation** — when compute eq "unconditional_expectation"; conditional_expectations exists, then call service; emit probability.total_expectation_calculated. _Why: E(X) via total expectation._
- **Compute Unconditional Variance** — when compute eq "unconditional_variance", then call service; emit probability.total_variance_calculated. _Why: Var(X) via law of total variance._

**❌ Failure paths**

- **Scenarios Not Exhaustive** — when scenarios_exhaustive eq false, then emit probability.total_rejected. _Why: Scenario probabilities do not sum to 1._ *(error: `TOTAL_PROB_NOT_EXHAUSTIVE`)*
- **Missing Conditionals** — when scenarios not_exists OR compute not_exists, then emit probability.total_rejected. _Why: Required conditional inputs missing._ *(error: `TOTAL_PROB_MISSING_INPUTS`)*

## Errors it can return

- `TOTAL_PROB_NOT_EXHAUSTIVE` — Scenarios must be mutually exclusive and exhaustive; probabilities must sum to 1
- `TOTAL_PROB_MISSING_INPUTS` — Scenarios and compute target are required

## Events

**`probability.total_probability_calculated`**
  Payload: `dataset_id`, `unconditional_probability`, `scenario_count`

**`probability.total_expectation_calculated`**
  Payload: `dataset_id`, `unconditional_expectation`, `scenario_count`

**`probability.total_variance_calculated`**
  Payload: `dataset_id`, `unconditional_variance`, `between_variance`, `within_variance`

**`probability.total_rejected`**
  Payload: `dataset_id`, `reason_code`

## Connects to

- **expected-value-variance** *(required)*
- **probability-tree-conditional-expectation** *(required)*
- **bayes-formula** *(recommended)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/total-probability-rule/) · **Spec source:** [`total-probability-rule.blueprint.yaml`](./total-probability-rule.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
