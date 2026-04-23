<!-- AUTO-GENERATED FROM active-portfolio-management-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Active Portfolio Management L2

> Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, fixed-income and global equity strategies

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · active-management · information-ratio · fundamental-law · ic-br · cfa-level-2

## What this does

Analyse active portfolio management — value added, Sharpe and information ratio, fundamental law of active management (IC, BR, TC), optimal active portfolios, fixed-income and global equity strategies

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **portfolio_id** *(text, required)* — Portfolio identifier
- **analysis_type** *(select, required)* — value_added | sharpe_ir | fundamental_law | optimal_portfolio | strategy

## What must be true

- **value_added → definition:** Active return = portfolio return − benchmark return
- **value_added → benchmark_choice:** Determines what counts as active risk
- **value_added → decomposition:** Active return = Σ (active weight × security return)
- **sharpe_ratio → formula:** SR = (Rp − Rf) / σp
- **sharpe_ratio → benchmark_independence:** Measures total risk-adjusted return
- **sharpe_ratio → constraint:** Long-only constraint reduces achievable SR
- **information_ratio → formula:** IR = (Rp − Rb) / TE where TE = tracking error
- **information_ratio → interpretation:** Active return per unit of active risk
- **information_ratio → optimal_active_risk:** TE* = IR × σ_b / SR_b
- **information_ratio → limit:** Max achievable SR² = SR_b² + IR²
- **fundamental_law_basic → formula:** IR ≈ IC × √BR
- **fundamental_law_basic → ic:** Information coefficient — correlation of forecasts with outcomes; measure of skill
- **fundamental_law_basic → br:** Breadth — number of independent active bets per year
- **fundamental_law_basic → implication:** Skill amplified by many independent bets
- **full_fundamental_law → formula:** IR = TC × IC × √BR
- **full_fundamental_law → tc:** Transfer coefficient — correlation of active weights with optimal weights; 1.0 if unconstrained
- **full_fundamental_law → long_only_constraint:** Reduces TC; reduces effective IR
- **full_fundamental_law → ex_post:** Realised IR vs ex ante expected IR tests skill
- **active_security_returns → alpha:** True expected active return from information advantage
- **active_security_returns → source:** Private research, better models, superior judgement
- **constructing_optimal_portfolio → optimal_active_weights:** Proportional to alpha / (2 × λ × σ²)
- **constructing_optimal_portfolio → aggressiveness:** Scale by risk aversion λ
- **constructing_optimal_portfolio → constrained:** Long-only reduces weights; TC < 1
- **global_equity_strategy → country_allocation:** Factor in macro and valuation signals
- **global_equity_strategy → sector_allocation:** Industry cycle and relative valuation
- **global_equity_strategy → stock_selection:** Bottom-up fundamental signals
- **global_equity_strategy → breadth:** Country × sector × stock decisions multiply BR
- **fi_active_strategies → duration:** Curve positioning; term premium signals
- **fi_active_strategies → credit:** Sector rotation, issue selection
- **fi_active_strategies → currency:** FX overlay for international mandates
- **fi_active_strategies → breadth:** Many bonds; high BR in pure fixed income
- **practical_limitations → ex_ante_ic:** Hard to measure before outcomes
- **practical_limitations → independence:** Bets may be correlated within factors
- **practical_limitations → skill_persistence:** IC estimates from past may not persist
- **validation → portfolio_required:** portfolio_id present
- **validation → valid_analysis:** analysis_type in [value_added, sharpe_ir, fundamental_law, optimal_portfolio, strategy]

## Success & failure scenarios

**✅ Success paths**

- **Analyse Active Pm** — when portfolio_id exists; analysis_type in ["value_added","sharpe_ir","fundamental_law","optimal_portfolio","strategy"], then call service; emit active_pm.analysed. _Why: Analyse active portfolio management approach._

**❌ Failure paths**

- **Invalid Analysis** — when analysis_type not_in ["value_added","sharpe_ir","fundamental_law","optimal_portfolio","strategy"], then emit active_pm.rejected. _Why: Unsupported analysis type._ *(error: `ACTIVE_PM_INVALID_ANALYSIS`)*

## Errors it can return

- `ACTIVE_PM_INVALID_ANALYSIS` — analysis_type must be one of the supported types

## Events

**`active_pm.analysed`**
  Payload: `portfolio_id`, `analysis_type`, `ir`, `ic`, `br`, `tc`, `optimal_active_risk`

**`active_pm.rejected`**
  Payload: `portfolio_id`, `reason_code`

## Connects to

- **multifactor-models-l2** *(recommended)*
- **backtesting-simulation-l2** *(recommended)*

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/active-portfolio-management-l2/) · **Spec source:** [`active-portfolio-management-l2.blueprint.yaml`](./active-portfolio-management-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
