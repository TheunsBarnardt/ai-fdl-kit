<!-- AUTO-GENERATED FROM asset-allocation-alternatives-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Asset Allocation Alternatives L3

> Asset allocation to alternative investments — role in portfolios, risk-based classification, return expectations, liquidity planning, mean-CVaR optimization, and monitoring

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · alternative-investments · private-equity · real-assets · hedge-funds · liquidity-planning · mean-cvar · risk-based-classification · cfa-level-3

## What this does

Asset allocation to alternative investments — role in portfolios, risk-based classification, return expectations, liquidity planning, mean-CVaR optimization, and monitoring

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **allocation_id** *(text, required)* — Allocation identifier
- **alternatives_type** *(select, required)* — private_equity | real_assets | hedge_funds | private_credit | commodities

## What must be true

- **role_of_alternatives → equity_diversification:** Low correlation to public equities reduces total portfolio volatility
- **role_of_alternatives → short_horizon_vol:** Some alternatives reduce short-run volatility (hedge funds, private credit)
- **role_of_alternatives → long_horizon_goals:** Private equity and real assets improve probability of meeting long-run goals
- **role_of_alternatives → illiquidity_premium:** Compensation for locking up capital; typically 150-400 bps over public equivalents
- **asset_classification → traditional:** Equities, bonds, cash; separated by legal form and return characteristics
- **asset_classification → risk_based:** Classify by underlying risk factors: equity risk, rate risk, inflation risk, illiquidity risk
- **asset_classification → risk_factors_approach:** Alternatives often load on the same factors as traditional assets — classify accordingly
- **asset_classification → benefit:** Risk-based classification reveals true diversification benefit; avoids false diversification
- **risk_considerations → illiquidity:** Cannot exit at will; capital called and distributed over years; J-curve effect
- **risk_considerations → leverage:** PE funds often use leverage; amplifies both returns and losses
- **risk_considerations → complexity:** Valuation subjective; documentation complex; governance requirements
- **risk_considerations → concentration:** Limited partnerships are concentrated; must build diversified vintages
- **return_expectations → private_equity:** IRR target 15-25%; net of fees; requires sustained economic growth and exit markets
- **return_expectations → private_credit:** Floating rate; 6-12% yield; less liquid than public credit
- **return_expectations → real_assets:** Infrastructure: 7-10% (regulated); real estate: cap rate + NOI growth
- **return_expectations → hedge_funds:** Absolute return; Sharpe > 0.5 net of fees; less correlated to equities
- **return_expectations → commodities:** Primarily inflation hedge; spot return + roll yield + collateral yield
- **investment_vehicles → limited_partnership:** Typical PE/real estate structure; committed capital; 10-year life
- **investment_vehicles → fund_of_funds:** Diversification; easier access; second layer of fees; J-curve smoothed
- **investment_vehicles → co_investment:** Direct investment alongside GP; lower fees; requires underwriting capability
- **investment_vehicles → listed_alternatives:** REITs, BDCs, listed PE; liquid; trade at premium/discount to NAV
- **liquidity_planning → capital_call_risk:** Commitments called over 3-5 years; must maintain liquid reserves to fund calls
- **liquidity_planning → distribution_timing:** Distributions irregular; may not match investor spending needs
- **liquidity_planning → stress_scenario:** Liquidity crunch: capital calls accelerate, distributions stop; model worst case
- **liquidity_planning → liquidity_buffer:** Hold 15-25% in liquid assets vs expected peak annual capital calls
- **statistical_challenges → smoothed_returns:** Appraisal-based returns understate volatility and correlation
- **statistical_challenges → fat_tails:** Illiquid alternatives exhibit negative skew and excess kurtosis
- **statistical_challenges → short_history:** Limited vintage years; historical returns may not be representative
- **statistical_challenges → selection_bias:** Top-quartile access claims are overstated; regression to mean is real
- **optimization_approaches → mvo:** Mean-variance; underweights alternatives due to smoothed (lower) risk estimates
- **optimization_approaches → mean_cvar:** Mean-CVaR; accounts for fat tails; more realistic for illiquid alternatives
- **optimization_approaches → risk_factor_opt:** Allocate to underlying risk factors; avoids double-counting correlated alternatives
- **optimization_approaches → monte_carlo:** Simulate path of wealth over long horizon; assess probability of meeting goals
- **monitoring → investment_program:** Monitor total portfolio exposure by factor and vehicle type
- **monitoring → firm_process:** Track manager team stability, strategy adherence, compliance
- **monitoring → performance_eval:** IRR, TVPI, DPI, RVPI vs benchmark; PME (Public Market Equivalent)
- **suitability → investment_horizon:** Minimum 7-10 years for PE/real assets; shorter for HF
- **suitability → expertise:** Requires specialist due diligence and monitoring capability
- **suitability → governance:** Robust governance to evaluate complex mandates and manage commitment pacing
- **suitability → transparency:** Limited reporting frequency; accept lower transparency than public markets
- **validation → allocation_required:** allocation_id present
- **validation → valid_type:** alternatives_type in [private_equity, real_assets, hedge_funds, private_credit, commodities]

## Success & failure scenarios

**✅ Success paths**

- **Allocate To Alternatives** — when allocation_id exists; alternatives_type in ["private_equity","real_assets","hedge_funds","private_credit","commodities"], then call service; emit alternatives.allocated. _Why: Develop asset allocation to specified alternative investment type._

**❌ Failure paths**

- **Invalid Type** — when alternatives_type not_in ["private_equity","real_assets","hedge_funds","private_credit","commodities"], then emit alternatives.rejected. _Why: Unsupported alternatives type._ *(error: `ALTERNATIVES_INVALID_TYPE`)*

## Errors it can return

- `ALTERNATIVES_INVALID_TYPE` — alternatives_type must be one of private_equity, real_assets, hedge_funds, private_credit, commodities

## Events

**`alternatives.allocated`**
  Payload: `allocation_id`, `alternatives_type`, `target_weight`, `expected_irr`, `liquidity_buffer`

**`alternatives.rejected`**
  Payload: `allocation_id`, `reason_code`

## Connects to

- **hedge-fund-strategies-l3** *(recommended)*
- **principles-asset-allocation-l3** *(required)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/asset-allocation-alternatives-l3/) · **Spec source:** [`asset-allocation-alternatives-l3.blueprint.yaml`](./asset-allocation-alternatives-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
