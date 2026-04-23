<!-- AUTO-GENERATED FROM institutional-portfolio-management-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Institutional Portfolio Management L3

> Institutional investor portfolio management — pension funds, SWFs, endowments, foundations, banks, and insurers — objectives, constraints, liabilities, risk, and asset allocation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · institutional-investors · pension-fund · sovereign-wealth-fund · endowment · insurance · asset-liability-management · cfa-level-3

## What this does

Institutional investor portfolio management — pension funds, SWFs, endowments, foundations, banks, and insurers — objectives, constraints, liabilities, risk, and asset allocation

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **institution_id** *(text, required)* — Institution identifier
- **institution_type** *(select, required)* — defined_benefit_pension | defined_contribution_pension | sovereign_wealth_fund | endowment | foundation | bank | insurer

## What must be true

- **common_characteristics → fiduciary:** All institutional investors have fiduciary duty to beneficiaries
- **common_characteristics → return_objective:** Must achieve return sufficient to meet obligations and spending
- **common_characteristics → risk_tolerance:** Constrained by liabilities, regulatory capital, stakeholder expectations
- **common_characteristics → long_horizon:** Most institutional investors have long (10+ year) investment horizons
- **common_characteristics → governance:** Investment committee, IPS, annual review; clear delegation of authority
- **defined_benefit_pension → liabilities:** PV of promised pension payments; driven by discount rate and actuarial assumptions
- **defined_benefit_pension → stakeholders:** Plan sponsor, active members, retirees, regulator, PBGC/guarantor
- **defined_benefit_pension → investment_horizon:** Long; some obligations decades away; must consider mortality improvements
- **defined_benefit_pension → liquidity:** Ongoing benefit payments; contributions reduce need; net CF may be positive or negative
- **defined_benefit_pension → regulatory:** Funding ratio requirements; minimum contribution rules; investment restrictions
- **defined_benefit_pension → risk:** Funded status risk; interest rate risk (liability duration > asset duration typical)
- **defined_benefit_pension → objective:** Match liability duration; earn excess return above liability discount rate
- **defined_benefit_pension → asset_allocation:** LDI core (bonds) + return-seeking (equities, alternatives)
- **defined_contribution_pension → liabilities:** No defined liability; member bears investment risk
- **defined_contribution_pension → objective:** Maximize long-term risk-adjusted return; appropriate glide path
- **defined_contribution_pension → governance:** Offer menu of appropriate funds; default option should be diversified and age-appropriate
- **sovereign_wealth_fund → types:** Stabilization, savings, reserve investment, development, pension reserve
- **sovereign_wealth_fund → stakeholders:** Government, citizens, future generations
- **sovereign_wealth_fund → horizon:** Very long (perpetual); intergenerational equity
- **sovereign_wealth_fund → liquidity:** Stabilization funds: high liquidity; savings funds: low liquidity
- **sovereign_wealth_fund → regulatory:** Often exempt from domestic regulation; political governance oversight
- **sovereign_wealth_fund → objective:** Preserve real value of national wealth; generate returns for government spending
- **sovereign_wealth_fund → asset_allocation:** Diversified; significant alternatives; long-horizon illiquidity premium
- **university_endowment → liabilities:** Perpetual institution; spending rule (typically 5% annually)
- **university_endowment → horizon:** Perpetual; support institution in perpetuity
- **university_endowment → liquidity:** Annual spending needs; capital campaigns; building projects
- **university_endowment → regulatory:** Tax-exempt; payout requirements vary by jurisdiction
- **university_endowment → objective:** Real return > spending rate + inflation; preserve purchasing power
- **university_endowment → asset_allocation:** Endowment model: heavy alternatives (PE, real assets, HF); low bonds
- **private_foundation → liabilities:** Mandatory distribution (5% of assets/yr in US); grant-making obligations
- **private_foundation → horizon:** Perpetual; some spend-down foundations have finite horizon
- **private_foundation → liquidity:** Annual grant payments; must maintain liquidity for distributions
- **private_foundation → regulatory:** IRS rules (US); payout floors; prohibited transactions
- **private_foundation → objective:** Cover distributions + real return; maintain mission indefinitely
- **bank → liabilities:** Deposits (short duration); wholesale funding; primarily floating rate
- **bank → objective:** ALM: manage net interest margin; earn spread between assets and funding cost
- **bank → regulatory:** Basel capital requirements; liquidity coverage ratio (LCR); net stable funding ratio
- **bank → portfolio_role:** Investment portfolio supplements loan book; liquidity buffer (HQLA)
- **bank → risk:** Interest rate risk; credit risk; funding/liquidity risk
- **insurer → liabilities:** P&C: short duration, uncertain amounts; Life: long duration, more predictable
- **insurer → objective:** Match liability duration and cash flows; maintain regulatory surplus
- **insurer → regulatory:** Solvency II (EU); RBC capital requirements (US); investment grade requirements
- **insurer → pc_insurer:** Short-duration liabilities; shorter asset duration; more equity possible if surplus large
- **insurer → life_insurer:** Long-duration liabilities; must match duration precisely; bonds dominant
- **validation → institution_required:** institution_id present
- **validation → valid_type:** institution_type in [defined_benefit_pension, defined_contribution_pension, sovereign_wealth_fund, endowment, foundation, bank, insurer]

## Success & failure scenarios

**✅ Success paths**

- **Manage Institutional Portfolio** — when institution_id exists; institution_type in ["defined_benefit_pension","defined_contribution_pension","sovereign_wealth_fund","endowment","foundation","bank","insurer"], then call service; emit institutional.portfolio.managed. _Why: Develop portfolio management framework for specified institution type._

**❌ Failure paths**

- **Invalid Type** — when institution_type not_in ["defined_benefit_pension","defined_contribution_pension","sovereign_wealth_fund","endowment","foundation","bank","insurer"], then emit institutional.portfolio.rejected. _Why: Unsupported institution type._ *(error: `INSTITUTIONAL_INVALID_TYPE`)*

## Errors it can return

- `INSTITUTIONAL_INVALID_TYPE` — institution_type must be one of the supported institutional investor types

## Events

**`institutional.portfolio.managed`**
  Payload: `institution_id`, `institution_type`, `asset_allocation`, `funded_ratio`, `expected_return`

**`institutional.portfolio.rejected`**
  Payload: `institution_id`, `reason_code`

## Connects to

- **overview-asset-allocation-l3** *(required)*
- **asset-allocation-alternatives-l3** *(recommended)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/institutional-portfolio-management-l3/) · **Spec source:** [`institutional-portfolio-management-l3.blueprint.yaml`](./institutional-portfolio-management-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
