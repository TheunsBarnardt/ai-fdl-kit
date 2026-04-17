<!-- AUTO-GENERATED FROM sampling-methods.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sampling Methods

> Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading representativeness against cost and speed

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · sampling · probability-sampling · stratified-sampling · cluster-sampling · sampling-error · cfa-level-1

## What this does

Select a sample from a population using probability (simple random, stratified, cluster) or non-probability (convenience, judgmental) methods, trading representativeness against cost and speed

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **population_size** *(number, optional)* — Total size of the population (N)
- **sample_size** *(number, required)* — Desired sample size (n)
- **method** *(select, required)* — simple_random | stratified_random | cluster | convenience | judgmental
- **strata_definitions** *(json, optional)* — Array of {stratum_id, population_share, sample_share} for stratified designs
- **clusters** *(json, optional)* — Array of cluster IDs with member counts for cluster sampling

## What must be true

- **probability_methods → simple_random:** Each member of the population has equal probability of selection; gold standard for representativeness
- **probability_methods → stratified_random:** Population divided into mutually exclusive subgroups (strata); random samples drawn from each stratum proportionally
- **probability_methods → cluster_sampling:** Population divided into clusters; a random subset of CLUSTERS selected, all members of selected clusters measured
- **non_probability_methods → convenience:** Selection based on accessibility; fast and cheap but prone to selection bias
- **non_probability_methods → judgmental:** Expert selects what is believed to be representative; useful for small populations with clear criteria
- **sampling_error → definition:** Difference between sample statistic and the true population parameter it estimates
- **sampling_error → decomposition:** Random (unbiased) error decreases with n; systematic (bias) error does not
- **stratified_advantages → precision:** Lower variance than simple random for same n if strata are internally homogeneous
- **stratified_advantages → subgroup_inference:** Guaranteed representation of each stratum
- **cluster_tradeoffs → cost:** Lower field cost when clusters are geographically compact
- **cluster_tradeoffs → precision:** Higher sampling error than simple random of same size if clusters are heterogeneous
- **investment_applications → index_construction:** Stratified sampling across sectors/countries to mirror a benchmark with fewer holdings
- **investment_applications → survey_research:** Investor surveys stratified by wealth tier
- **investment_applications → credit_portfolio_audits:** Cluster sampling by branch for loan file audits
- **investment_applications → alternative_data:** Convenience samples from web scraping — always flag selection bias
- **validation → sample_size_positive:** sample_size >= 1
- **validation → method_supported:** method in {simple_random, stratified_random, cluster, convenience, judgmental}
- **validation → strata_sum_to_population:** Sum of stratum population_shares = 1 (or counts sum to N)

## Success & failure scenarios

**✅ Success paths**

- **Draw Simple Random** — when method eq "simple_random", then call service; emit sampling.sample_drawn. _Why: Random selection with equal probability._
- **Draw Stratified** — when method eq "stratified_random"; strata_definitions exists, then call service; emit sampling.sample_drawn. _Why: Proportional allocation across strata._
- **Draw Cluster** — when method eq "cluster"; clusters exists, then call service; emit sampling.sample_drawn. _Why: Select clusters then enumerate._

**❌ Failure paths**

- **Missing Strata** — when method eq "stratified_random"; strata_definitions not_exists, then emit sampling.sample_rejected. _Why: Stratified design missing strata definitions._ *(error: `SAMPLE_STRATA_MISSING`)*
- **Invalid Method** — when method_supported eq false, then emit sampling.sample_rejected. _Why: Unsupported sampling method._ *(error: `SAMPLE_METHOD_INVALID`)*

## Errors it can return

- `SAMPLE_STRATA_MISSING` — Stratified sampling requires strata definitions with population shares
- `SAMPLE_METHOD_INVALID` — Sampling method must be one of simple_random, stratified_random, cluster, convenience, judgmental

## Events

**`sampling.sample_drawn`**
  Payload: `sample_id`, `method`, `sample_size`, `strata_count`, `estimated_sampling_error`

**`sampling.sample_rejected`**
  Payload: `sample_id`, `reason_code`

## Connects to

- **central-limit-theorem** *(recommended)*
- **bootstrap-resampling** *(recommended)*

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/sampling-methods/) · **Spec source:** [`sampling-methods.blueprint.yaml`](./sampling-methods.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
