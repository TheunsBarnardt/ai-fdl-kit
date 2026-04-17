<!-- AUTO-GENERATED FROM measures-of-dispersion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Measures Of Dispersion

> Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of observations around their mean

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · descriptive-statistics · dispersion · variance · standard-deviation · mad · coefficient-of-variation · volatility · cfa-level-1

## What this does

Compute measures of dispersion — range, mean absolute deviation (MAD), variance, standard deviation, and coefficient of variation — to describe variability of observations around their mean

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **observations** *(json, required)* — Array of numeric observations
- **measure** *(select, required)* — range | mad | variance | std_dev | cv
- **population_or_sample** *(select, optional)* — sample (default, uses n-1) | population (uses N)
- **annualise** *(boolean, optional)* — Annualise std_dev by multiplying by sqrt(periods_per_year)
- **periods_per_year** *(number, optional)* — For annualisation (252 trading days, 12 months, 4 quarters)

## What must be true

- **core_formulas → range:** max(X) - min(X)
- **core_formulas → mad:** MAD = (1/n) * sum(|X_i - X_bar|)
- **core_formulas → sample_variance:** s^2 = (1/(n-1)) * sum((X_i - X_bar)^2)
- **core_formulas → population_variance:** sigma^2 = (1/N) * sum((X_i - mu)^2)
- **core_formulas → sample_std_dev:** s = sqrt(s^2)
- **core_formulas → coefficient_of_variation:** CV = s / X_bar
- **core_formulas → annualisation:** sigma_annual = sigma_period * sqrt(periods_per_year)
- **bessel_correction → rule:** Sample variance uses n-1 (Bessel's correction) to produce an unbiased estimator; population variance uses N
- **bessel_correction → why:** Using n biases variance downward because X_bar is itself estimated from the sample
- **properties → units → variance:** Square of the data units (e.g., return² )
- **properties → units → std_dev:** Same units as the data (e.g., decimal return)
- **properties → units → mad:** Same units as the data
- **properties → units → cv:** Unit-free (scale-invariant)
- **properties → relationships → sd_gte_mad:** Standard deviation >= MAD for any dataset
- **properties → relationships → cv_comparison:** CV allows comparison of dispersion across different-magnitude datasets
- **applications → volatility:** Annualised standard deviation is the industry-standard volatility measure
- **applications → risk_adjusted_return:** CV of returns compares risk per unit of return; lower = more efficient
- **validation → non_empty:** observations array must be non-empty
- **validation → sufficient_for_sample:** n >= 2 for sample variance (n-1 denominator)
- **validation → cv_mean_nonzero:** Mean must be non-zero (and typically positive) for CV to be meaningful

## Success & failure scenarios

**✅ Success paths**

- **Compute Range** — when measure eq "range", then call service; emit stats.dispersion_calculated. _Why: Range._
- **Compute Mad** — when measure eq "mad", then call service; emit stats.dispersion_calculated. _Why: Mean absolute deviation._
- **Compute Variance** — when measure eq "variance", then call service; emit stats.dispersion_calculated. _Why: Variance (sample or population)._
- **Compute Std Dev** — when measure eq "std_dev", then call service; emit stats.dispersion_calculated. _Why: Standard deviation (optionally annualised)._
- **Compute Cv** — when measure eq "cv", then call service; emit stats.dispersion_calculated. _Why: Coefficient of variation._

**❌ Failure paths**

- **Insufficient Sample** — when measure in ["variance","std_dev"] AND sample_size lt 2, then emit stats.dispersion_rejected. _Why: Fewer than 2 observations for sample variance._ *(error: `DISPERSION_INSUFFICIENT_SAMPLE`)*
- **Cv Mean Zero** — when measure eq "cv" AND mean eq 0, then emit stats.dispersion_rejected. _Why: CV undefined when mean is zero._ *(error: `DISPERSION_CV_MEAN_ZERO`)*
- **Empty Observations** — when observations not_exists, then emit stats.dispersion_rejected. _Why: Empty dataset._ *(error: `DISPERSION_EMPTY`)*

## Errors it can return

- `DISPERSION_EMPTY` — Observations array must not be empty
- `DISPERSION_INSUFFICIENT_SAMPLE` — Sample variance requires at least 2 observations
- `DISPERSION_CV_MEAN_ZERO` — Coefficient of variation is undefined when the mean is zero

## Events

**`stats.dispersion_calculated`**
  Payload: `dataset_id`, `measure`, `value`, `sample_size`, `annualised`

**`stats.dispersion_rejected`**
  Payload: `dataset_id`, `reason_code`

## Connects to

- **measures-of-central-tendency** *(recommended)*
- **target-downside-deviation** *(recommended)*
- **skewness** *(recommended)*
- **kurtosis** *(recommended)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/measures-of-dispersion/) · **Spec source:** [`measures-of-dispersion.blueprint.yaml`](./measures-of-dispersion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
