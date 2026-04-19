<!-- AUTO-GENERATED FROM real-estate-investment-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Real Estate Investment L2

> Analyse real estate investments — property types, risk factors, appraisal vs transaction indexes, REIT structures, NAV per share, FFO/AFFO multiples, private vs public comparison

**Category:** Trading · **Version:** 1.0.0 · **Tags:** alternative-investments · real-estate · reits · nav · ffo · affo · cfa-level-2

## What this does

Analyse real estate investments — property types, risk factors, appraisal vs transaction indexes, REIT structures, NAV per share, FFO/AFFO multiples, private vs public comparison

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **property_id** *(text, required)* — Property or REIT identifier
- **valuation_approach** *(select, required)* — nav | income | multiples | comparables

## What must be true

- **basic_forms → direct_ownership:** Physical property; illiquid; large lot size
- **basic_forms → mortgage:** Debt secured by real estate
- **basic_forms → pooled:** REOC, REIT, commingled funds
- **characteristics → heterogeneous:** No two properties identical
- **characteristics → illiquid:** High transaction costs, long time to sell
- **characteristics → income_producing:** Rent provides predictable cash flow
- **characteristics → leverage:** Debt commonly used to enhance return
- **risk_factors → business_risk:** Tenant concentration, vacancy
- **risk_factors → financial_risk:** Leverage amplifies volatility
- **risk_factors → liquidity_risk:** Illiquidity in private markets
- **risk_factors → inflation_risk:** Leases may lag CPI
- **risk_factors → environmental:** Regulatory, remediation liabilities
- **property_types → office:** Long leases, cyclical demand
- **property_types → retail:** Shopping malls; disrupted by e-commerce
- **property_types → industrial:** Warehouses; benefiting from logistics growth
- **property_types → residential:** Multifamily apartments; recession-resilient
- **property_types → hotel:** Short-term; high operating leverage
- **property_types → healthcare:** Long lease; government reimbursement risk
- **economic_value_drivers → gdp_employment:** Drive office and industrial demand
- **economic_value_drivers → demographics:** Drive residential and healthcare
- **economic_value_drivers → interest_rates:** Cap rate expansion = price decline
- **economic_value_drivers → construction_pipeline:** New supply constrains rent growth
- **indexes → appraisal_based:** NCREIF; lagged, smoothed; understates volatility
- **indexes → transaction_based:** Hedonic regression on actual sales; better accuracy
- **indexes → real_estate_security:** REIT indexes; liquid but equity-correlated
- **reit_structures → equity_reit:** Own and operate properties
- **reit_structures → mortgage_reit:** Invest in mortgages or MBS; interest income
- **reit_structures → hybrid:** Both property and mortgage
- **reit_structures → us_requirements:** 90% taxable income distributed; tax-transparent
- **reit_valuation_nav → nav_calculation:** Estimate market value of properties less liabilities
- **reit_valuation_nav → navps:** NAV ÷ shares outstanding
- **reit_valuation_nav → accounting:** REIT books investment property at cost or FV depending on GAAP/IFRS
- **reit_valuation_nav → premium_discount:** REIT trades at premium when market expects growth above NAV
- **reit_valuation_multiples → ffo:** Net income + D&A − gains on sales
- **reit_valuation_multiples → affo:** FFO − capex maintenance; better cash proxy
- **reit_valuation_multiples → p_ffo:** Price ÷ FFO; main relative metric
- **reit_valuation_multiples → p_affo:** Price ÷ AFFO; sustainability check
- **reit_valuation_multiples → advantages:** Removes non-cash and one-off distortions
- **private_vs_public → private:** Core, value-add, opportunistic; illiquid; lower correlation to equities
- **private_vs_public → public:** Highly liquid; correlated with equities short-term; daily pricing
- **validation → property_required:** property_id present
- **validation → valid_approach:** valuation_approach in [nav, income, multiples, comparables]

## Success & failure scenarios

**✅ Success paths**

- **Analyse Real Estate** — when property_id exists; valuation_approach in ["nav","income","multiples","comparables"], then call service; emit real_estate.analysed. _Why: Analyse real estate investment._

**❌ Failure paths**

- **Invalid Approach** — when valuation_approach not_in ["nav","income","multiples","comparables"], then emit real_estate.rejected. _Why: Unsupported valuation approach._ *(error: `RE_INVALID_APPROACH`)*

## Errors it can return

- `RE_INVALID_APPROACH` — valuation_approach must be one of the supported approaches

## Events

**`real_estate.analysed`**
  Payload: `property_id`, `valuation_approach`, `navps`, `p_ffo`, `p_affo`, `implied_cap_rate`

**`real_estate.rejected`**
  Payload: `property_id`, `reason_code`

## Connects to

- **private-company-valuation-l2** *(recommended)*

## Quality fitness 🟢 82/100

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
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/real-estate-investment-l2/) · **Spec source:** [`real-estate-investment-l2.blueprint.yaml`](./real-estate-investment-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
