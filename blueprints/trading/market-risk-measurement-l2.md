<!-- AUTO-GENERATED FROM market-risk-measurement-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Market Risk Measurement L2

> Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position and stop-loss limits

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · risk-management · var · expected-shortfall · risk-budgeting · scenario-analysis · cfa-level-2

## What this does

Measure and manage market risk — VaR (parametric, historical, Monte Carlo), expected shortfall, sensitivity and scenario risk measures, risk budgeting, position and stop-loss limits

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **measure_type** *(select, required)* — var_parametric | var_historical | var_mc | expected_shortfall | scenario | sensitivity

## What must be true

- **var_definition → statement:** Maximum loss not exceeded with probability (1−α) over horizon T
- **var_definition → parameters:** Confidence level (95%, 99%), horizon (1-day, 10-day)
- **var_definition → formula:** VaR = −(μ × T − z_α × σ × √T)
- **parametric_var → assumptions:** Normal distribution; constant correlations
- **parametric_var → advantages:** Fast; analytical; scalable
- **parametric_var → limitations:** Fat tails; correlation breakdown in stress
- **historical_simulation_var → method:** Use actual historical return distribution; apply to current portfolio
- **historical_simulation_var → advantages:** No distributional assumption; captures fat tails
- **historical_simulation_var → limitations:** Depends on history length; doesn't adapt quickly to regime changes
- **monte_carlo_var → method:** Simulate many scenarios from factor model; compute portfolio P&L
- **monte_carlo_var → advantages:** Flexible; handles non-linearity; path-dependent instruments
- **monte_carlo_var → limitations:** Computationally intensive; model-dependent
- **advantages_var → simple:** Easy to communicate to management
- **advantages_var → aggregation:** Portfolio-level measure
- **advantages_var → regulation:** Basel III links capital to VaR
- **limitations_var → non_subadditive:** Doesn't always reward diversification
- **limitations_var → no_tail_shape:** Silent on magnitude beyond threshold
- **limitations_var → trending:** Portfolio may stay under daily VaR while accumulating losses
- **expected_shortfall → definition:** Average loss in the tail beyond VaR; aka CVaR
- **expected_shortfall → advantage:** Coherent risk measure; subadditive; reveals tail severity
- **expected_shortfall → regulation:** Basel IV moving to ES from VaR
- **sensitivity_measures → duration:** Bond price sensitivity to yield
- **sensitivity_measures → beta:** Equity sensitivity to market
- **sensitivity_measures → delta_gamma:** Option price sensitivity to spot
- **sensitivity_measures → dv01:** Dollar value of 1bp move
- **scenario_measures → historical:** 2008 GFC, 2020 COVID, 1994 rate shock
- **scenario_measures → hypothetical:** User-defined extreme events
- **scenario_measures → reverse_scenario:** What scenario would produce loss X?
- **risk_budgeting → definition:** Allocate risk (VaR or TE) to strategies/desks
- **risk_budgeting → marginal_var:** Incremental VaR from adding one unit of position
- **risk_budgeting → component_var:** Contribution of each position to portfolio VaR
- **constraints → position_limits:** Max notional by issuer/sector/currency
- **constraints → scenario_limits:** Max loss under defined scenario
- **constraints → stop_loss:** Mandatory reduction if cumulative loss exceeds threshold
- **market_participants → banks:** VaR for trading book; economic capital; stress testing
- **market_participants → asset_managers:** Tracking error; factor risk; drawdown
- **market_participants → pension_funds:** Surplus at risk; ALM
- **market_participants → insurers:** Value-at-risk with liability sensitivity
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_measure:** measure_type in allowed set

## Success & failure scenarios

**✅ Success paths**

- **Measure Market Risk** — when portfolio_id exists; measure_type in ["var_parametric","var_historical","var_mc","expected_shortfall","scenario","sensitivity"], then call service; emit market_risk.measured. _Why: Measure market risk of portfolio._

**❌ Failure paths**

- **Invalid Measure** — when measure_type not_in ["var_parametric","var_historical","var_mc","expected_shortfall","scenario","sensitivity"], then emit market_risk.rejected. _Why: Unsupported risk measure type._ *(error: `RISK_INVALID_MEASURE`)*

## Errors it can return

- `RISK_INVALID_MEASURE` — measure_type must be one of the supported risk measures

## Events

**`market_risk.measured`**
  Payload: `portfolio_id`, `measure_type`, `var_amount`, `expected_shortfall`, `scenario_loss`

**`market_risk.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **backtesting-simulation-l2** *(required)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/market-risk-measurement-l2/) · **Spec source:** [`market-risk-measurement-l2.blueprint.yaml`](./market-risk-measurement-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
