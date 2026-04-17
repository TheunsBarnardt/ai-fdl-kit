<!-- AUTO-GENERATED FROM jackknife-resampling.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Jackknife Resampling

> Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statistic without parametric assumptions

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · resampling · jackknife · leave-one-out · bias-correction · standard-error · cfa-level-1

## What this does

Apply the jackknife leave-one-out resampling technique — systematically excluding one observation at a time to estimate the bias and standard error of a statistic without parametric assumptions

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **observed_sample** *(json, required)* — Array of n observations
- **statistic** *(select, required)* — mean | median | variance | std_dev | correlation | custom
- **compute** *(select, optional)* — bias | standard_error | confidence_interval | all

## What must be true

- **core_mechanics → process:** Construct n leave-one-out subsamples by omitting each observation in turn; compute the statistic on each
- **core_mechanics → without_replacement:** Each jackknife subsample has size n-1 with one unique observation removed (NOT random resampling)
- **core_mechanics → deterministic:** Unlike bootstrap, jackknife produces the same result every run for a given sample
- **key_formulas → jackknife_replicates:** theta_hat_(i) = statistic applied to sample with observation i removed
- **key_formulas → jackknife_mean:** theta_hat_mean = (1/n) * sum_i theta_hat_(i)
- **key_formulas → bias_estimate:** bias_jack = (n - 1) * (theta_hat_mean - theta_hat_full)
- **key_formulas → bias_corrected:** theta_hat_BC = theta_hat_full - bias_jack = n*theta_hat_full - (n-1)*theta_hat_mean
- **key_formulas → jackknife_variance:** Var_jack = ((n-1)/n) * sum_i (theta_hat_(i) - theta_hat_mean)^2
- **key_formulas → jackknife_se:** SE_jack = sqrt(Var_jack)
- **differences_vs_bootstrap → sampling → bootstrap:** Random sampling WITH replacement; produces B random resamples
- **differences_vs_bootstrap → sampling → jackknife:** Deterministic leave-one-out; produces exactly n subsamples
- **differences_vs_bootstrap → coverage → bootstrap:** Samples entire subset space stochastically
- **differences_vs_bootstrap → coverage → jackknife:** Visits only n of the 2^n possible subsets
- **differences_vs_bootstrap → purpose → bootstrap:** Sampling distribution approximation; complex CIs
- **differences_vs_bootstrap → purpose → jackknife:** Simple bias and variance estimation; computationally cheap
- **strengths → bias_reduction:** Directly targets and removes the leading-order bias of the estimator
- **strengths → computational_efficiency:** Only n evaluations required vs thousands for bootstrap
- **strengths → deterministic_reproducibility:** Identical output each run; no random seeds
- **limitations → statistic_smoothness:** Fails for non-smooth statistics such as the median or quantiles
- **limitations → less_accurate_se:** Typically less accurate standard errors than bootstrap
- **limitations → assumes_small_perturbation:** Leave-one-out approximates infinitesimal perturbation; breaks down for influential observations
- **applications → factor_model_bias:** Jackknife alpha/beta estimates across holdings
- **applications → sharpe_ratio_uncertainty:** Jackknife SE of Sharpe ratio using historical returns
- **applications → credit_model_validation:** Leave-one-firm-out stability testing of scoring models
- **applications → outlier_diagnosis:** Large theta_hat_(i) - theta_hat_full indicates influential observation i
- **validation → sample_size:** n >= 3 (need at least one observation to remove and still estimate)
- **validation → statistic_smoothness:** Warn if statistic is known to be non-smooth (e.g., median)

## Success & failure scenarios

**✅ Success paths**

- **Run Jackknife** — when observed_sample exists; sample_size gte 3, then call service; emit simulation.jackknife_completed. _Why: Execute n leave-one-out replicates and aggregate._
- **Compute Bias Correction** — when compute in ["bias","all"], then call service; emit simulation.jackknife_bias_corrected. _Why: Apply jackknife bias correction to the full-sample statistic._
- **Non Smooth Statistic** — when statistic in ["median","quantile"], then emit simulation.jackknife_warning. _Why: Statistic is known to be non-smooth; jackknife unreliable._

**❌ Failure paths**

- **Small Sample** — when sample_size lt 3, then emit simulation.jackknife_rejected. _Why: n < 3 — jackknife undefined._ *(error: `JACKKNIFE_SAMPLE_TOO_SMALL`)*

## Errors it can return

- `JACKKNIFE_SAMPLE_TOO_SMALL` — Jackknife requires at least 3 observations

## Events

**`simulation.jackknife_completed`**
  Payload: `jackknife_id`, `statistic_value`, `bias_estimate`, `standard_error`, `n`

**`simulation.jackknife_bias_corrected`**
  Payload: `jackknife_id`, `original_estimate`, `bias_correction`, `corrected_estimate`

**`simulation.jackknife_warning`**
  Payload: `jackknife_id`, `warning_message`

**`simulation.jackknife_rejected`**
  Payload: `jackknife_id`, `reason_code`

## Connects to

- **bootstrap-resampling** *(required)*
- **standard-error-sample-mean** *(recommended)*
- **central-limit-theorem** *(recommended)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/jackknife-resampling/) · **Spec source:** [`jackknife-resampling.blueprint.yaml`](./jackknife-resampling.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
