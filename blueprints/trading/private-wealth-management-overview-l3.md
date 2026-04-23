<!-- AUTO-GENERATED FROM private-wealth-management-overview-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Private Wealth Management Overview L3

> Private wealth management framework — client profiling, goal setting, risk tolerance, capital sufficiency analysis, IPS design, portfolio construction, and reporting for private clients

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · private-wealth · wealth-management · investment-policy-statement · capital-sufficiency · risk-tolerance · retirement-planning · cfa-level-3

## What this does

Private wealth management framework — client profiling, goal setting, risk tolerance, capital sufficiency analysis, IPS design, portfolio construction, and reporting for private clients

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client identifier
- **service_type** *(select, required)* — goal_setting | ips_design | capital_sufficiency | portfolio_construction | reporting

## What must be true

- **private_vs_institutional → private:** Individuals and families; emotional, behavioral, tax, estate considerations; heterogeneous
- **private_vs_institutional → institutional:** Endowments, pensions, insurers; defined governance; more homogeneous objectives
- **private_vs_institutional → key_differences:** Private clients: mortality risk, human capital, taxes, estate planning, behavioral biases
- **client_information → financial_info:** Balance sheet, income, expenses, liabilities, tax situation
- **client_information → non_financial:** Goals, time horizons, family situation, lifestyle needs, risk attitudes
- **client_information → personal:** Age, health, employment, family structure, inheritance expectations
- **client_goals → planned:** Retirement income, education funding, home purchase, wealth transfer
- **client_goals → unplanned:** Medical emergency, job loss, legal liability — require contingency reserves
- **client_goals → goal_hierarchy:** Essential (survival) > lifestyle > aspirational; prioritize funding order
- **risk_tolerance → questionnaire:** Standardized scoring of risk attitudes; anchors formal risk profile
- **risk_tolerance → conversation:** Qualitative discussion; reveals emotional reactions and experience with losses
- **risk_tolerance → multiple_goals:** Different goals may have different risk tolerances; sub-portfolio approach
- **risk_tolerance → ability_vs_willingness:** Ability: financial capacity to bear risk; willingness: emotional comfort
- **technical_soft_skills → technical:** Portfolio theory, tax, estate planning, insurance, retirement projections
- **technical_soft_skills → soft:** Communication, empathy, active listening, behavioral coaching, client education
- **capital_sufficiency → definition:** Will assets sustain withdrawals throughout the client's life and goals?
- **capital_sufficiency → deterministic:** Single-scenario projection; simple but ignores variability
- **capital_sufficiency → monte_carlo:** Simulate 1000s of return paths; probability of goal success
- **capital_sufficiency → safe_withdrawal_rate:** ~4% rule (30-year horizon); adjust for longer life expectancy and portfolio mix
- **retirement_planning → accumulation:** Build assets; take risk; maximize human capital and savings rate
- **retirement_planning → distribution:** Draw down assets; reduce risk; manage sequence-of-returns risk
- **retirement_planning → db_vs_dc:** Defined benefit pension: certain income; defined contribution: market risk borne by individual
- **retirement_planning → sequence_risk:** Early retirement drawdown in bear market permanently impairs wealth
- **ips_components → return_objective:** Required return to meet goals; absolute or relative to benchmark
- **ips_components → risk_objective:** Volatility tolerance; maximum drawdown; downside threshold
- **ips_components → time_horizon:** Retirement age; life expectancy; bequest horizon
- **ips_components → liquidity:** Short-term cash needs; emergency fund; liquidity events
- **ips_components → tax:** Tax status; jurisdiction; account types
- **ips_components → legal_regulatory:** Trusts, wills, power of attorney; regulatory restrictions
- **ips_components → unique_circumstances:** Concentrated positions, restricted stock, legacy assets, ESG
- **portfolio_construction → total_portfolio_approach:** Include human capital, real estate, business interest in economic balance sheet
- **portfolio_construction → asset_location:** Tax-inefficient assets in tax-deferred; tax-efficient in taxable
- **portfolio_construction → lifecycle_glide_path:** Reduce equity, increase fixed income as approaching retirement
- **reporting → portfolio_reporting:** Performance vs benchmark; attribution; holdings; risk metrics
- **reporting → portfolio_review:** Periodic review of objectives, constraints, IPS; rebalancing assessment
- **reporting → success_evaluation:** Goal achievement, process consistency, net performance vs benchmark
- **client_segments → mass_affluent:** $100K-$1M investable; standardized solutions; digital tools
- **client_segments → high_net_worth:** $1M-$10M; customized portfolios; financial planning
- **client_segments → very_high_net_worth:** $10M-$30M; multi-generational planning; alternatives access
- **client_segments → ultra_high_net_worth:** >$30M; family office; complex estate; philanthropy; direct investments
- **validation → client_required:** client_id present
- **validation → valid_service:** service_type in [goal_setting, ips_design, capital_sufficiency, portfolio_construction, reporting]

## Success & failure scenarios

**✅ Success paths**

- **Advise Private Client** — when client_id exists; service_type in ["goal_setting","ips_design","capital_sufficiency","portfolio_construction","reporting"], then call service; emit private_client.advised. _Why: Provide private wealth management service for specified client need._

**❌ Failure paths**

- **Invalid Service** — when service_type not_in ["goal_setting","ips_design","capital_sufficiency","portfolio_construction","reporting"], then emit private_client.rejected. _Why: Unsupported wealth management service type._ *(error: `PWM_INVALID_SERVICE`)*

## Errors it can return

- `PWM_INVALID_SERVICE` — service_type must be one of goal_setting, ips_design, capital_sufficiency, portfolio_construction, reporting

## Events

**`private_client.advised`**
  Payload: `client_id`, `service_type`, `recommended_return_objective`, `risk_profile`, `goal_success_probability`

**`private_client.rejected`**
  Payload: `client_id`, `reason_code`

## Connects to

- **private-wealth-topics-l3** *(recommended)*
- **asset-allocation-constraints-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/private-wealth-management-overview-l3/) · **Spec source:** [`private-wealth-management-overview-l3.blueprint.yaml`](./private-wealth-management-overview-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
