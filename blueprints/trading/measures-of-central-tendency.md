<!-- AUTO-GENERATED FROM measures-of-central-tendency.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Measures Of Central Tendency

> Compute measures of central tendency — arithmetic mean, weighted mean, median, mode, trimmed mean, and winsorized mean — to summarise where a return distribution is centred

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · descriptive-statistics · central-tendency · mean · median · mode · trimmed-mean · winsorized-mean · cfa-level-1

## What this does

Compute measures of central tendency — arithmetic mean, weighted mean, median, mode, trimmed mean, and winsorized mean — to summarise where a return distribution is centred

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **observations** *(json, required)* — Array of numeric observations (returns or values)
- **measure** *(select, required)* — mean | weighted_mean | median | mode | trimmed_mean | winsorized_mean
- **weights** *(json, optional)* — Array of weights for weighted_mean (must match length and sum to 1)
- **trim_percentage** *(number, optional)* — Percentage trimmed from each tail for trimmed_mean (e.g., 0.025 = 5% trimmed)
- **winsorize_percentage** *(number, optional)* — Percentage winsorized from each tail for winsorized_mean

## What must be true

- **core_formulas → sample_mean:** X_bar = (1/n) * sum(X_i)
- **core_formulas → population_mean:** mu = (1/N) * sum(X_i)
- **core_formulas → weighted_mean:** X_bar_w = sum(w_i * X_i), where sum(w_i) = 1
- **core_formulas → median_odd_n:** Middle value after sorting when n is odd
- **core_formulas → median_even_n:** Average of two middle values when n is even
- **core_formulas → mode:** Most frequently occurring value; may be unimodal, bimodal, or multimodal
- **core_formulas → trimmed_mean:** Arithmetic mean after removing lowest and highest p% of observations
- **core_formulas → winsorized_mean:** Arithmetic mean after replacing lowest p% with p-th percentile and highest p% with (100-p)-th percentile
- **properties → mean_deviations_sum_to_zero:** sum(X_i - X_bar) = 0
- **properties → median_minimises_MAD:** Median minimises sum of absolute deviations
- **properties → mean_minimises_SSD:** Mean minimises sum of squared deviations
- **when_to_use → arithmetic_mean:** Symmetric distributions; default measure when outliers are not a concern
- **when_to_use → weighted_mean:** Portfolio returns where weights represent asset allocation
- **when_to_use → median:** Skewed distributions; robust to outliers (e.g., CEO pay, home prices)
- **when_to_use → mode:** Categorical/nominal data or identifying most common outcome
- **when_to_use → trimmed_mean:** Distributions with suspected data errors in tails
- **when_to_use → winsorized_mean:** Capping tail values without discarding observations
- **validation → non_empty:** observations array must be non-empty
- **validation → weights_match_length:** weights array length equals observations length
- **validation → weights_sum_to_one:** |sum(weights) - 1| < 1e-8 tolerance
- **validation → trim_range:** 0 < trim_percentage < 0.5

## Success & failure scenarios

**✅ Success paths**

- **Compute Mean** — when measure eq "mean"; observations exists, then call service; emit stats.central_tendency_calculated. _Why: Arithmetic mean._
- **Compute Weighted Mean** — when measure eq "weighted_mean"; weights exists, then call service; emit stats.central_tendency_calculated. _Why: Weighted mean._
- **Compute Median** — when measure eq "median", then call service; emit stats.central_tendency_calculated. _Why: Median._
- **Compute Mode** — when measure eq "mode", then call service; emit stats.central_tendency_calculated. _Why: Mode (may be multimodal)._
- **Compute Trimmed** — when measure eq "trimmed_mean"; trim_percentage gt 0, then call service; emit stats.central_tendency_calculated. _Why: Trimmed mean._
- **Compute Winsorized** — when measure eq "winsorized_mean", then call service; emit stats.central_tendency_calculated. _Why: Winsorized mean._

**❌ Failure paths**

- **Empty Observations** — when observations not_exists, then emit stats.central_tendency_rejected. _Why: Empty observations._ *(error: `CENTRAL_TENDENCY_EMPTY`)*
- **Invalid Weights** — when weights_valid eq false, then emit stats.central_tendency_rejected. _Why: Weights do not sum to 1 or wrong length._ *(error: `CENTRAL_TENDENCY_INVALID_WEIGHTS`)*

## Errors it can return

- `CENTRAL_TENDENCY_EMPTY` — Observations array must not be empty
- `CENTRAL_TENDENCY_INVALID_WEIGHTS` — Weights must match observations length and sum to 1
- `CENTRAL_TENDENCY_INVALID_TRIM` — Trim/winsorize percentage must be in (0, 0.5)

## Events

**`stats.central_tendency_calculated`**
  Payload: `dataset_id`, `measure`, `value`, `sample_size`

**`stats.central_tendency_rejected`**
  Payload: `dataset_id`, `reason_code`

## Connects to

- **arithmetic-mean-return** *(recommended)*
- **geometric-mean-return** *(recommended)*
- **quantiles-and-location** *(recommended)*
- **measures-of-dispersion** *(recommended)*

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/measures-of-central-tendency/) · **Spec source:** [`measures-of-central-tendency.blueprint.yaml`](./measures-of-central-tendency.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
