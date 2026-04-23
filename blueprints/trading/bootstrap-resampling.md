<!-- AUTO-GENERATED FROM bootstrap-resampling.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bootstrap Resampling

> Construct a sampling distribution by repeatedly drawing with-replacement resamples from the observed data — a nonparametric approach to inference that requires no distributional assumption

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · simulation · bootstrap · resampling · nonparametric · sampling-distribution · statistical-inference · cfa-level-1

## What this does

Construct a sampling distribution by repeatedly drawing with-replacement resamples from the observed data — a nonparametric approach to inference that requires no distributional assumption

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **observed_sample** *(json, required)* — Array of observed data points — treated as the empirical distribution
- **num_resamples** *(number, required)* — Number of bootstrap replicates B (typically 1,000-10,000)
- **statistic** *(select, required)* — mean | median | variance | std_dev | quantile | correlation | custom
- **confidence_level** *(number, optional)* — Confidence level for percentile / BCa interval (e.g., 0.95)

## What must be true

- **core_principle → treat_sample_as_population:** The observed sample is treated as if it were the population; resamples mimic repeated draws from that population
- **core_principle → with_replacement:** Each bootstrap resample is drawn WITH replacement, same size n as original
- **core_principle → items_may_repeat:** An observation can appear multiple times in a resample; others may not appear at all
- **process → step_1:** Treat observed sample as the empirical distribution F_hat
- **process → step_2:** Draw a bootstrap resample of size n WITH replacement from F_hat
- **process → step_3:** Compute the statistic on the resample
- **process → step_4:** Repeat steps 2-3 B times (typically B >= 1,000)
- **process → step_5:** Use the B replicate statistics as an approximation to the true sampling distribution
- **inference_outputs → standard_error:** Bootstrap SE = sample std dev of the B replicate statistics
- **inference_outputs → bias_estimate:** Bias_hat = mean(replicates) - statistic(original_sample)
- **inference_outputs → percentile_ci:** (alpha/2, 1-alpha/2) percentiles of the replicate distribution
- **inference_outputs → bca_ci:** Bias-corrected and accelerated CI improves coverage for skewed statistics
- **key_differences_vs_monte_carlo → source_of_randomness → monte_carlo:** Random draws from a SPECIFIED parametric distribution
- **key_differences_vs_monte_carlo → source_of_randomness → bootstrap:** Random draws from the OBSERVED empirical distribution (no parametric assumption)
- **key_differences_vs_monte_carlo → when_to_use_each → use_bootstrap:** Historical sample is rich and representative; no good parametric model
- **key_differences_vs_monte_carlo → when_to_use_each → use_monte_carlo:** Parametric model is theoretically justified or empirical data is sparse
- **strengths → distribution_free:** No normality or other parametric assumption required
- **strengths → handles_arbitrary_statistics:** Works for statistics (median, quantiles, ratios) where analytic SEs are difficult
- **strengths → simple_to_implement:** Requires only resampling and evaluating the statistic
- **limitations → sample_dependent:** Resamples inherit any bias or incompleteness of the original sample
- **limitations → poor_tail_estimation:** Cannot extrapolate beyond observed range — tail events absent from the sample stay absent
- **limitations → iid_assumption:** Standard bootstrap assumes i.i.d. observations; time series need block bootstrap
- **limitations → statistical_estimate_only:** Provides estimates, not exact results
- **applications → standard_errors:** SE of median, Sharpe ratio, max drawdown, and other complex statistics
- **applications → hypothesis_tests:** Permutation tests via bootstrap under the null
- **applications → confidence_intervals:** Percentile / BCa intervals for performance metrics
- **applications → portfolio_backtesting:** Bootstrap historical returns to assess strategy robustness
- **validation → sample_non_empty:** length(observed_sample) >= 2
- **validation → resamples_sufficient:** num_resamples >= 100 (recommended >= 1000)

## Success & failure scenarios

**✅ Success paths**

- **Run Bootstrap** — when observed_sample exists; num_resamples gte 100, then call service; emit simulation.bootstrap_completed. _Why: Execute B resamples and return the bootstrap sampling distribution._
- **Compute Confidence Interval** — when confidence_level exists, then call service; emit simulation.bootstrap_ci_calculated. _Why: Derive percentile or BCa CI from the bootstrap distribution._

**❌ Failure paths**

- **Insufficient Resamples** — when num_resamples lt 100, then emit simulation.bootstrap_rejected. _Why: num_resamples too low._ *(error: `BOOTSTRAP_INSUFFICIENT_RESAMPLES`)*
- **Empty Sample** — when observed_sample not_exists OR sample_size lt 2, then emit simulation.bootstrap_rejected. _Why: Observed sample missing or too small._ *(error: `BOOTSTRAP_SAMPLE_TOO_SMALL`)*

## Errors it can return

- `BOOTSTRAP_INSUFFICIENT_RESAMPLES` — Number of resamples must be at least 100 (recommended >= 1000)
- `BOOTSTRAP_SAMPLE_TOO_SMALL` — Observed sample must contain at least 2 observations

## Events

**`simulation.bootstrap_completed`**
  Payload: `bootstrap_id`, `statistic_value`, `standard_error`, `bias`, `num_resamples`

**`simulation.bootstrap_ci_calculated`**
  Payload: `bootstrap_id`, `confidence_level`, `lower_bound`, `upper_bound`, `method`

**`simulation.bootstrap_rejected`**
  Payload: `bootstrap_id`, `reason_code`

## Connects to

- **monte-carlo-simulation** *(recommended)*
- **continuously-compounded-returns** *(recommended)*
- **expected-value-variance** *(recommended)*
- **measures-of-dispersion** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bootstrap-resampling/) · **Spec source:** [`bootstrap-resampling.blueprint.yaml`](./bootstrap-resampling.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
