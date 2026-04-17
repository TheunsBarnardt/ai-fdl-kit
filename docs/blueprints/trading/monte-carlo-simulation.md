---
title: "Monte Carlo Simulation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Generate many random samples from specified probability distributions to estimate risk/return metrics, value complex securities, and test model sensitivities to"
---

# Monte Carlo Simulation Blueprint

> Generate many random samples from specified probability distributions to estimate risk/return metrics, value complex securities, and test model sensitivities to distributional assumptions

| | |
|---|---|
| **Feature** | `monte-carlo-simulation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, simulation, monte-carlo, option-pricing, risk-modelling, random-sampling, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/monte-carlo-simulation.blueprint.yaml) |
| **JSON API** | [monte-carlo-simulation.json]({{ site.baseurl }}/api/blueprints/trading/monte-carlo-simulation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `simulation_engine` | Monte Carlo Simulation Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `quantity_of_interest` | text | Yes | The target metric (e.g., option value, portfolio VaR, terminal wealth) |  |
| `risk_factors` | json | Yes | Array of {name, distribution, parameters} describing underlying stochastic drivers |  |
| `time_horizon` | number | Yes | Total simulation horizon in calendar units |  |
| `subperiods` | number | Yes | Number of discretisation steps K (horizon / delta_t) |  |
| `num_trials` | number | Yes | Number of simulation trials I (typically 1,000-1,000,000) |  |
| `model` | text | Yes | Functional form mapping random draws to the quantity of interest |  |
| `discount_rate` | number | No | Rate for discounting terminal payoffs to present |  |

## Rules

- **six_step_process:**
  - **step_1:** Specify the quantity of interest and starting values of underlying variables
  - **step_2:** Specify the time grid (K subperiods with delta_t = horizon / K)
  - **step_3:** Specify the data-generating process and distributional assumptions for key risk factors
  - **step_4:** Draw K random values per trial; convert to underlying variable paths
  - **step_5:** Calculate the quantity of interest for the trial and discount to present
  - **step_6:** Repeat steps 4-5 I times; aggregate as mean of trial results (Monte Carlo estimate)
- **core_principles:**
  - **random_sampling:** Draws come from a specified (parametric) probability distribution
  - **law_of_large_numbers:** Estimate converges to true expectation as I -> infinity
  - **error_shrinks_as_sqrt_n:** Standard error of the MC estimate scales as 1/sqrt(I)
  - **distributional_control:** Analyst controls all inputs — sensitivity analysis is straightforward
- **strengths:**
  - **complex_securities:** Prices instruments with path dependence, embedded options, or multi-asset payoffs that lack closed-form solutions
  - **sensitivity_analysis:** Test how results change with distributional assumptions
  - **multi_factor:** Naturally accommodates multiple correlated risk factors
- **limitations:**
  - **statistical_only:** Provides estimates, not exact results
  - **no_causal_insight:** Does not reveal cause-effect relationships the way analytical models do
  - **computational_cost:** Convergence at sqrt(I) makes tight tolerance expensive
  - **garbage_in_garbage_out:** Output quality is limited by distributional assumption quality
- **applications:**
  - **option_valuation:** Price Asian options, lookback options, barrier options, American options via Longstaff-Schwartz
  - **var_cvar:** Simulate P&L distribution for risk measures
  - **liability_driven_investing:** Simulate asset-liability paths for pension planning
  - **retirement_planning:** Probability that wealth > required spending over horizon
- **comparison_to_bootstrap:**
  - **monte_carlo:** Samples from assumed parametric distribution
  - **bootstrap:** Resamples with replacement from observed empirical distribution
  - **use_mc_when:** Distribution is theoretically motivated or historical data is sparse/unrepresentative
  - **use_bootstrap_when:** Historical sample is rich and its features must be preserved
- **validation:**
  - **num_trials_positive:** num_trials >= 1 (typically >= 1000 for stable estimates)
  - **subperiods_positive:** subperiods >= 1
  - **risk_factors_defined:** Every risk factor has a valid distribution and parameters
  - **horizon_positive:** time_horizon > 0

## Outcomes

### Run_simulation (Priority: 1)

_Execute the six-step Monte Carlo process and return the estimate_

**Given:**
- `quantity_of_interest` (input) exists
- `risk_factors` (input) exists
- `num_trials` (input) gte `1`

**Then:**
- **call_service** target: `simulation_engine`
- **emit_event** event: `simulation.mc_completed`

### Insufficient_trials (Priority: 10) — Error: `MC_INSUFFICIENT_TRIALS`

_Trial count too low for stable estimate_

**Given:**
- `num_trials` (input) lt `1`

**Then:**
- **emit_event** event: `simulation.mc_rejected`

### Missing_inputs (Priority: 11) — Error: `MC_MISSING_INPUTS`

_Required simulation inputs missing_

**Given:**
- ANY: `quantity_of_interest` (input) not_exists OR `risk_factors` (input) not_exists OR `time_horizon` (input) not_exists

**Then:**
- **emit_event** event: `simulation.mc_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MC_INSUFFICIENT_TRIALS` | 400 | Number of trials must be at least 1 (recommended >= 1000) | No |
| `MC_MISSING_INPUTS` | 400 | Quantity of interest, risk factors, and time horizon are required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `simulation.mc_completed` |  | `simulation_id`, `estimate`, `standard_error`, `trials_run`, `trials_converged` |
| `simulation.mc_rejected` |  | `simulation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bootstrap-resampling | recommended |  |
| lognormal-distribution-asset-prices | recommended |  |
| continuously-compounded-returns | recommended |  |
| expected-value-variance | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: "Asian-style contingent claim: payoff = max(S_T - mean(S), 0)"
  num_trials: 1000
  subperiods: 12
  time_horizon: 1
  stock_model: delta_S = mu * S * delta_t + sigma * S * Z_k
  outcome: In 654 trials payoff = 0; in 346 trials payoff > 0 (max 11); MC value =
    discounted mean across trials
var_application:
  process: Simulate portfolio P&L 10,000 times; report the 1st percentile as 99%
    1-day VaR
  key_point: Captures non-linear instruments (options) that delta-normal VaR cannot
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Monte Carlo Simulation Blueprint",
  "description": "Generate many random samples from specified probability distributions to estimate risk/return metrics, value complex securities, and test model sensitivities to",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, simulation, monte-carlo, option-pricing, risk-modelling, random-sampling, cfa-level-1"
}
</script>
