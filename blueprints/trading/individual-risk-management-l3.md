<!-- AUTO-GENERATED FROM individual-risk-management-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Individual Risk Management L3

> Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk management strategy

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · private-wealth · human-capital · life-insurance · annuities · individual-risk · longevity-risk · premature-death-risk · cfa-level-3

## What this does

Individual risk management — human and financial capital, economic net worth, life insurance types, annuities, individual risk exposures, and optimal risk management strategy

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client identifier
- **risk_type** *(select, required)* — earnings | premature_death | longevity | property | liability | health

## What must be true

- **human_capital → definition:** PV of expected future labor income; largest asset for most working-age individuals
- **human_capital → bond_like:** Stable employment (civil servant, academic) → bond-like HC; less equity in financial portfolio
- **human_capital → equity_like:** Variable income (entrepreneur, salesperson) → equity-like HC; more bonds needed
- **human_capital → declining:** HC declines as individual ages; financial capital must grow to replace
- **human_capital → geographic:** HC illiquid and concentrated in one job market; financial portfolio should diversify
- **financial_capital → definition:** Total value of financial assets (savings, investments, pension, real estate)
- **financial_capital → relationship:** FC = accumulated savings from HC over time; retirement FC = sufficient to fund withdrawals
- **economic_net_worth → definition:** Human capital + financial capital − PV of consumption goals − financial liabilities
- **economic_net_worth → holistic_balance_sheet:** Include HC, pension rights, insurance on asset side; spending obligations on liability side
- **economic_net_worth → change_drivers:** Wealth creation (saving) − consumption − risk events
- **risk_management_framework → risk_identification:** Identify all material individual risk exposures
- **risk_management_framework → risk_assessment:** Quantify exposure; frequency and severity
- **risk_management_framework → risk_mitigation:** Insurance, diversification, reserves, avoidance
- **risk_management_framework → risk_monitoring:** Annual review; update as life stage changes
- **financial_stages_of_life → education:** Negative HC realization; pre-earning stage; low financial capital
- **financial_stages_of_life → early_career:** High HC, low FC; maximize savings; need life insurance for dependents
- **financial_stages_of_life → mid_career:** Peak earnings; accumulation; reduce insurance need as FC grows
- **financial_stages_of_life → pre_retirement:** Peak FC; HC declining; shift portfolio to lower risk; long-term care planning
- **financial_stages_of_life → retirement:** HC zero; draw down FC; longevity risk primary; annuities may be suitable
- **individual_risk_exposures → earnings_risk:** Job loss, disability; income stream interrupted; hedge with disability insurance
- **individual_risk_exposures → premature_death:** Dependents lose future HC; hedge with life insurance; amount = PV of future support
- **individual_risk_exposures → longevity_risk:** Outlive assets; hedge with annuities; increases with health improvements
- **individual_risk_exposures → property_risk:** Loss of physical assets; hedge with property/casualty insurance
- **individual_risk_exposures → liability_risk:** Legal claims; hedge with liability insurance; umbrella policy
- **individual_risk_exposures → health_risk:** Medical costs; hedge with health insurance; long-term care insurance
- **life_insurance → term:** Pays death benefit only during policy term; no cash value; cheapest; pure insurance
- **life_insurance → whole_life:** Permanent; builds cash value; expensive; guaranteed premiums
- **life_insurance → universal_life:** Flexible premiums; adjustable death benefit; cash value linked to crediting rate
- **life_insurance → variable_life:** Death benefit and cash value linked to investment performance; market risk
- **life_insurance → insurance_need:** Human capital of deceased + outstanding liabilities − financial capital of survivor
- **life_insurance → net_premium:** PV of expected death benefit payments; actuarially fair premium
- **life_insurance → gross_premium:** Net premium + expense loading; actual premium charged
- **annuities → definition:** Contract providing periodic payments; hedge against longevity risk
- **annuities → fixed_annuity:** Guaranteed payments; no market risk; inflation risk
- **annuities → variable_annuity:** Payments linked to investment portfolio; market risk borne by annuitant
- **annuities → immediate:** Payments begin immediately; lump sum purchase
- **annuities → deferred:** Accumulation phase then payout; tax-deferred growth
- **annuities → classification:** Life annuity, period certain, joint-and-survivor; determines payout duration
- **annuities → appropriateness:** Most suitable for individuals with longevity risk and no bequest motive; less for those wanting estate
- **risk_management_implementation → optimal_strategy:** Balance risk reduction benefit against cost (premium, lost flexibility)
- **risk_management_implementation → human_capital_effect:** As HC declines (approaching retirement), need for life insurance falls; longevity insurance rises
- **risk_management_implementation → asset_allocation:** Human capital type affects optimal financial portfolio; bond-like HC → more equity
- **risk_management_implementation → insurance_program:** Integrate all insurance coverages; avoid gaps and overlap
- **validation → client_required:** client_id present
- **validation → valid_risk:** risk_type in [earnings, premature_death, longevity, property, liability, health]

## Success & failure scenarios

**✅ Success paths**

- **Manage Individual Risk** — when client_id exists; risk_type in ["earnings","premature_death","longevity","property","liability","health"], then call service; emit individual_risk.managed. _Why: Develop risk management strategy for individual client risk exposure._

**❌ Failure paths**

- **Invalid Risk** — when risk_type not_in ["earnings","premature_death","longevity","property","liability","health"], then emit individual_risk.rejected. _Why: Unsupported individual risk type._ *(error: `INDIVIDUAL_RISK_INVALID_TYPE`)*

## Errors it can return

- `INDIVIDUAL_RISK_INVALID_TYPE` — risk_type must be one of earnings, premature_death, longevity, property, liability, health

## Events

**`individual_risk.managed`**
  Payload: `client_id`, `risk_type`, `insurance_amount`, `annuity_amount`, `expected_economic_net_worth`

**`individual_risk.rejected`**
  Payload: `client_id`, `reason_code`

## Connects to

- **private-wealth-management-overview-l3** *(required)*
- **private-wealth-topics-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/individual-risk-management-l3/) · **Spec source:** [`individual-risk-management-l3.blueprint.yaml`](./individual-risk-management-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
