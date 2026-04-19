<!-- AUTO-GENERATED FROM principles-asset-allocation-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Principles Asset Allocation L3

> Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · asset-allocation · mean-variance-optimization · black-litterman · liability-relative · goals-based · risk-parity · cfa-level-3

## What this does

Asset allocation methods — MVO, Monte Carlo, Black-Litterman, liability-relative, goals-based sub-portfolios, risk parity, factor-based, rebalancing heuristics

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **allocation_id** *(text, required)* — Allocation identifier
- **method** *(select, required)* — mvo | black_litterman | liability_relative | goals_based | risk_parity | factor_based

## What must be true

- **mvo_overview → definition:** Select portfolio with highest expected return for given risk (or lowest risk for given return)
- **mvo_overview → efficient_frontier:** Set of portfolios not dominated on both risk and return dimensions
- **mvo_overview → inputs:** Expected returns, standard deviations, correlations for all asset classes
- **mvo_overview → corner_solutions:** Unconstrained MVO tends to produce extreme/concentrated portfolios
- **mvo_criticisms → input_sensitivity:** Small changes in expected returns → large weight changes; garbage-in garbage-out
- **mvo_criticisms → estimation_error:** Expected return estimates are noisy; error-maximization problem
- **mvo_criticisms → non_normality:** Fat tails and skew not captured by mean and variance alone
- **mvo_criticisms → single_period:** Ignores multi-period rebalancing and changing opportunity set
- **mvo_improvements → reverse_optimization:** Back-solve for expected returns implied by market cap weights; more stable starting point
- **mvo_improvements → black_litterman:** Blend reverse-optimized equilibrium returns with analyst views weighted by confidence
- **mvo_improvements → resampled_mvo:** Average optimal weights over many draws of inputs; reduces sensitivity
- **mvo_improvements → constraints:** Add asset class bounds, factor constraints, turnover limits to stabilize
- **monte_carlo → purpose:** Simulate multi-period wealth paths; assess probability of meeting goals under uncertainty
- **monte_carlo → advantages:** Captures path dependency, rebalancing effects, changing liabilities, non-normal returns
- **monte_carlo → use_case:** Complement MVO; especially useful for goals-based and glide-path analysis
- **liability_relative → surplus_optimization:** Treat surplus (assets − liabilities) as the objective; minimize surplus volatility for given expected surplus return
- **liability_relative → hedging_portfolio:** Replicates liability cash flows; typically long-duration bonds; zero surplus risk
- **liability_relative → return_seeking_portfolio:** Growth allocation above hedging portfolio; earns excess return
- **liability_relative → integrated_approach:** Jointly optimize assets and liabilities in single framework; most theoretically correct
- **liability_relative → comparing_approaches:** Surplus optimization simplest; hedging/return-seeking clearest; integrated most complete
- **liability_relative → factor_modeling:** Model liabilities as function of interest rate, inflation, credit factors; hedge with matching factors
- **goals_based → sub_portfolios:** Each goal gets dedicated sub-portfolio sized by PV of goal and success probability
- **goals_based → goal_hierarchy:** Survival goals (highest priority) → maintenance → aspirational (lowest)
- **goals_based → module_process:** Identify goals → set horizons and success probabilities → select sub-portfolio → aggregate
- **goals_based → overall_portfolio:** Combine sub-portfolios; aggregate weights determine total asset allocation
- **goals_based → issues:** Sub-portfolios may overlap; correlation benefits partially lost; monitoring complex
- **heuristics → rule_120:** Equity allocation = 120 minus age; rough lifecycle glide path
- **heuristics → sixty_forty:** 60% equity / 40% bonds; classic balanced; simple but ignores liabilities and goals
- **heuristics → endowment_model:** Heavy alternatives allocation; requires long horizon and illiquidity tolerance
- **heuristics → risk_parity:** Equal risk contribution from each asset class; typically bonds-heavy; lever up for return
- **heuristics → one_over_n:** Equal-weight all asset classes; naive but robust to estimation error
- **factor_based → premise:** Asset class returns driven by underlying factors (economic growth, inflation, rates, credit)
- **factor_based → advantage:** Avoids artificial asset class boundaries; captures true risk sources
- **factor_based → implementation:** Allocate to factor exposures; manage factor risk budget
- **rebalancing_practice → calendar:** Rebalance on fixed schedule regardless of drift
- **rebalancing_practice → threshold:** Rebalance when any weight exceeds corridor; more responsive
- **rebalancing_practice → trade_off:** Frequent rebalancing → lower drift risk but higher costs; optimize corridor width
- **rebalancing_practice → tax_considerations:** Harvest losses; defer gains; use cash flows to rebalance before trading
- **validation → allocation_required:** allocation_id present
- **validation → valid_method:** method in [mvo, black_litterman, liability_relative, goals_based, risk_parity, factor_based]

## Success & failure scenarios

**✅ Success paths**

- **Develop Allocation** — when allocation_id exists; method in ["mvo","black_litterman","liability_relative","goals_based","risk_parity","factor_based"], then call service; emit allocation.developed. _Why: Develop asset allocation using specified method._

**❌ Failure paths**

- **Invalid Method** — when method not_in ["mvo","black_litterman","liability_relative","goals_based","risk_parity","factor_based"], then emit allocation.rejected. _Why: Unsupported allocation method._ *(error: `ALLOCATION_INVALID_METHOD`)*

## Errors it can return

- `ALLOCATION_INVALID_METHOD` — method must be one of the supported allocation methods

## Events

**`allocation.developed`**
  Payload: `allocation_id`, `method`, `asset_class_weights`, `surplus_return`, `surplus_risk`

**`allocation.rejected`**
  Payload: `allocation_id`, `reason_code`

## Connects to

- **overview-asset-allocation-l3** *(required)*
- **capital-market-expectations-asset-class-l3** *(required)*
- **asset-allocation-constraints-l3** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/principles-asset-allocation-l3/) · **Spec source:** [`principles-asset-allocation-l3.blueprint.yaml`](./principles-asset-allocation-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
