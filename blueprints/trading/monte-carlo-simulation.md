<!-- AUTO-GENERATED FROM monte-carlo-simulation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Monte Carlo Simulation

> Generate many random samples from specified probability distributions to estimate risk/return metrics, value complex securities, and test model sensitivities to distributional assumptions

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · simulation · monte-carlo · option-pricing · risk-modelling · random-sampling · cfa-level-1

## What this does

Generate many random samples from specified probability distributions to estimate risk/return metrics, value complex securities, and test model sensitivities to distributional assumptions

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **quantity_of_interest** *(text, required)* — The target metric (e.g., option value, portfolio VaR, terminal wealth)
- **risk_factors** *(json, required)* — Array of {name, distribution, parameters} describing underlying stochastic drivers
- **time_horizon** *(number, required)* — Total simulation horizon in calendar units
- **subperiods** *(number, required)* — Number of discretisation steps K (horizon / delta_t)
- **num_trials** *(number, required)* — Number of simulation trials I (typically 1,000-1,000,000)
- **model** *(text, required)* — Functional form mapping random draws to the quantity of interest
- **discount_rate** *(number, optional)* — Rate for discounting terminal payoffs to present

## What must be true

- **six_step_process → step_1:** Specify the quantity of interest and starting values of underlying variables
- **six_step_process → step_2:** Specify the time grid (K subperiods with delta_t = horizon / K)
- **six_step_process → step_3:** Specify the data-generating process and distributional assumptions for key risk factors
- **six_step_process → step_4:** Draw K random values per trial; convert to underlying variable paths
- **six_step_process → step_5:** Calculate the quantity of interest for the trial and discount to present
- **six_step_process → step_6:** Repeat steps 4-5 I times; aggregate as mean of trial results (Monte Carlo estimate)
- **core_principles → random_sampling:** Draws come from a specified (parametric) probability distribution
- **core_principles → law_of_large_numbers:** Estimate converges to true expectation as I -> infinity
- **core_principles → error_shrinks_as_sqrt_n:** Standard error of the MC estimate scales as 1/sqrt(I)
- **core_principles → distributional_control:** Analyst controls all inputs — sensitivity analysis is straightforward
- **strengths → complex_securities:** Prices instruments with path dependence, embedded options, or multi-asset payoffs that lack closed-form solutions
- **strengths → sensitivity_analysis:** Test how results change with distributional assumptions
- **strengths → multi_factor:** Naturally accommodates multiple correlated risk factors
- **limitations → statistical_only:** Provides estimates, not exact results
- **limitations → no_causal_insight:** Does not reveal cause-effect relationships the way analytical models do
- **limitations → computational_cost:** Convergence at sqrt(I) makes tight tolerance expensive
- **limitations → garbage_in_garbage_out:** Output quality is limited by distributional assumption quality
- **applications → option_valuation:** Price Asian options, lookback options, barrier options, American options via Longstaff-Schwartz
- **applications → var_cvar:** Simulate P&L distribution for risk measures
- **applications → liability_driven_investing:** Simulate asset-liability paths for pension planning
- **applications → retirement_planning:** Probability that wealth > required spending over horizon
- **comparison_to_bootstrap → monte_carlo:** Samples from assumed parametric distribution
- **comparison_to_bootstrap → bootstrap:** Resamples with replacement from observed empirical distribution
- **comparison_to_bootstrap → use_mc_when:** Distribution is theoretically motivated or historical data is sparse/unrepresentative
- **comparison_to_bootstrap → use_bootstrap_when:** Historical sample is rich and its features must be preserved
- **validation → num_trials_positive:** num_trials >= 1 (typically >= 1000 for stable estimates)
- **validation → subperiods_positive:** subperiods >= 1
- **validation → risk_factors_defined:** Every risk factor has a valid distribution and parameters
- **validation → horizon_positive:** time_horizon > 0

## Success & failure scenarios

**✅ Success paths**

- **Run Simulation** — when quantity_of_interest exists; risk_factors exists; num_trials gte 1, then call service; emit simulation.mc_completed. _Why: Execute the six-step Monte Carlo process and return the estimate._

**❌ Failure paths**

- **Insufficient Trials** — when num_trials lt 1, then emit simulation.mc_rejected. _Why: Trial count too low for stable estimate._ *(error: `MC_INSUFFICIENT_TRIALS`)*
- **Missing Inputs** — when quantity_of_interest not_exists OR risk_factors not_exists OR time_horizon not_exists, then emit simulation.mc_rejected. _Why: Required simulation inputs missing._ *(error: `MC_MISSING_INPUTS`)*

## Errors it can return

- `MC_INSUFFICIENT_TRIALS` — Number of trials must be at least 1 (recommended >= 1000)
- `MC_MISSING_INPUTS` — Quantity of interest, risk factors, and time horizon are required

## Events

**`simulation.mc_completed`**
  Payload: `simulation_id`, `estimate`, `standard_error`, `trials_run`, `trials_converged`

**`simulation.mc_rejected`**
  Payload: `simulation_id`, `reason_code`

## Connects to

- **bootstrap-resampling** *(recommended)*
- **lognormal-distribution-asset-prices** *(recommended)*
- **continuously-compounded-returns** *(recommended)*
- **expected-value-variance** *(recommended)*

## Quality fitness 🟢 87/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/monte-carlo-simulation/) · **Spec source:** [`monte-carlo-simulation.blueprint.yaml`](./monte-carlo-simulation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
