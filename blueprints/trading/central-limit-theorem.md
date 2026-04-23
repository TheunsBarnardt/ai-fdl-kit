<!-- AUTO-GENERATED FROM central-limit-theorem.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Central Limit Theorem

> Apply the Central Limit Theorem — the sampling distribution of the sample mean is approximately normal with mean mu and variance sigma^2 / n for large n, regardless of population shape

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · clt · central-limit-theorem · sampling-distribution · standard-error · inference · cfa-level-1

## What this does

Apply the Central Limit Theorem — the sampling distribution of the sample mean is approximately normal with mean mu and variance sigma^2 / n for large n, regardless of population shape

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **sample_mean** *(number, optional)* — Observed sample mean x_bar
- **sample_std_dev** *(number, optional)* — Sample standard deviation s
- **population_std_dev** *(number, optional)* — Population standard deviation sigma (if known)
- **sample_size** *(number, required)* — n - sample size
- **compute** *(select, optional)* — standard_error | sampling_distribution | z_statistic | confidence_interval

## What must be true

- **core_theorem → statement:** Given population with mean mu and finite variance sigma^2, the sampling distribution of X_bar from random samples of size n is approximately Normal(mu, sigma^2 / n) for large n
- **core_theorem → distributional_assumption:** No distributional assumption on the population — only finite variance
- **core_theorem → large_n_threshold:** Typically n >= 30 is considered sufficient for CLT to apply (convention, not theorem)
- **sampling_distribution_properties → mean_of_sample_mean:** E(X_bar) = mu (unbiased)
- **sampling_distribution_properties → variance_of_sample_mean:** Var(X_bar) = sigma^2 / n
- **sampling_distribution_properties → standard_error:** SE(X_bar) = sigma / sqrt(n) — known sigma; s / sqrt(n) when estimated
- **sampling_distribution_properties → convergence_rate:** Standard error shrinks as 1/sqrt(n); halving error requires 4x sample size
- **implications → consistent_estimator:** X_bar converges to mu as n -> infinity
- **implications → normal_approximation:** Allows z-statistic inference for large n even if population is non-normal
- **implications → finite_variance_caveat:** CLT fails if population variance is infinite (e.g., Cauchy distribution)
- **z_statistic → known_sigma:** Z = (X_bar - mu) / (sigma / sqrt(n)) ~ N(0, 1)
- **z_statistic → unknown_sigma_large_n:** Z_approx = (X_bar - mu) / (s / sqrt(n)) ~ N(0, 1) when n is large
- **investment_applications → return_forecasting:** Average realized return has SE = sigma / sqrt(T); tighter for longer history
- **investment_applications → performance_attribution:** Test whether manager alpha differs from zero
- **investment_applications → risk_factor_testing:** Large-sample inference on factor premia
- **validation → sample_size_large_enough:** n >= 30 for reliable CLT approximation; smaller n requires known normality
- **validation → variance_finite:** Population must have finite variance
- **validation → independence:** Observations must be independent (or at least uncorrelated)

## Success & failure scenarios

**✅ Success paths**

- **Compute Standard Error** — when sample_size exists; sample_std_dev exists OR population_std_dev exists, then call service; emit inference.standard_error_calculated. _Why: SE = sigma/sqrt(n) or s/sqrt(n)._
- **Apply Clt Approximation** — when sample_size gte 30, then call service; emit inference.clt_applied. _Why: Construct sampling distribution under CLT._
- **Small Sample Warning** — when sample_size lt 30, then emit inference.small_sample_warned. _Why: n < 30 — CLT may not hold; flag for t-distribution or distributional check._

**❌ Failure paths**

- **Insufficient Sample** — when sample_size lt 2, then emit inference.clt_rejected. _Why: n < 2 — sampling distribution undefined._ *(error: `CLT_INSUFFICIENT_SAMPLE`)*
- **Missing Inputs** — when sample_size not_exists, then emit inference.clt_rejected. _Why: Required inputs missing._ *(error: `CLT_MISSING_INPUTS`)*

## Errors it can return

- `CLT_INSUFFICIENT_SAMPLE` — Sample size must be at least 2 for the CLT to be applicable
- `CLT_MISSING_INPUTS` — Sample size is required; std dev (population or sample) needed for standard error

## Events

**`inference.standard_error_calculated`**
  Payload: `sample_id`, `standard_error`, `sample_size`, `std_dev_source`

**`inference.clt_applied`**
  Payload: `sample_id`, `sample_mean`, `standard_error`, `sampling_distribution_mean`, `sampling_distribution_variance`

**`inference.small_sample_warned`**
  Payload: `sample_id`, `sample_size`, `warning`

**`inference.clt_rejected`**
  Payload: `sample_id`, `reason_code`

## Connects to

- **standard-error-sample-mean** *(recommended)*
- **sampling-methods** *(recommended)*
- **bootstrap-resampling** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/central-limit-theorem/) · **Spec source:** [`central-limit-theorem.blueprint.yaml`](./central-limit-theorem.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
