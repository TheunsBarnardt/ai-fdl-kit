<!-- AUTO-GENERATED FROM private-wealth-topics-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Private Wealth Topics L3

> Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfer

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · private-wealth · tax-management · asset-location · concentrated-positions · estate-planning · charitable-giving · generational-wealth · cfa-level-3

## What this does

Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfer

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, required)* — Client identifier
- **topic_type** *(select, required)* — tax_management | asset_location | concentrated_position | estate_planning | charitable | generational

## What must be true

- **tax_components → interest_income:** Taxed as ordinary income; highest marginal rate
- **tax_components → dividend_income:** Qualified dividends taxed at lower capital gains rate
- **tax_components → capital_gains:** Short-term (<1yr) at ordinary rates; long-term at preferential rates
- **tax_components → account_type:** Taxable vs tax-deferred (pension, 401k) vs tax-exempt (Roth, ISA)
- **measuring_tax_efficiency → after_tax_return:** Pre-tax return × (1 − effective tax rate)
- **measuring_tax_efficiency → tax_drag:** Loss of compounding from annual tax payments on income/gains
- **measuring_tax_efficiency → turnover:** High-turnover strategies realize gains frequently; high tax drag
- **measuring_tax_efficiency → asset_class_efficiency:** Equities (buy-hold): efficient; bonds: inefficient; REITs: inefficient
- **asset_location → principle:** Place tax-inefficient assets in tax-deferred; tax-efficient in taxable
- **asset_location → tax_deferred:** Bonds, REITs, active equity with high turnover
- **asset_location → taxable:** Index equity funds, municipal bonds, tax-managed funds
- **asset_location → optimization:** After-tax asset location can add 50-100 bps per year vs naive allocation
- **decumulation → withdrawal_order:** Draw from taxable first, tax-deferred second, tax-exempt last (general rule)
- **decumulation → roth_conversion:** Convert to Roth in low-income years; tax-free growth thereafter
- **decumulation → required_distributions:** RMDs from tax-deferred accounts at 72+ (US); must plan for tax impact
- **basic_tax_strategies → loss_harvesting:** Realize capital losses to offset gains; reinvest in similar (not identical) security
- **basic_tax_strategies → gain_deferral:** Hold appreciated positions; defer realized gains to future years or death
- **basic_tax_strategies → location_optimization:** Match asset class to most tax-efficient account type
- **basic_tax_strategies → charitable_gifts:** Donate appreciated securities; deduct FMV; avoid capital gains
- **concentrated_positions → risks:** Undiversified; single-stock risk; liquidity risk; potential tax liability on exit
- **concentrated_positions → retention_reasons:** Low cost basis; restricted stock; emotional attachment; control
- **concentrated_positions → staged_diversification:** Sell shares over multiple years; defer tax liability
- **concentrated_positions → completion_portfolio:** Hold underweights to all other sectors vs concentrated stock; diversify without selling
- **concentrated_positions → monetization:** Borrow against position (margin); variable prepaid forward; exchange fund
- **concentrated_positions → collar:** Buy put, sell call; limit downside; may be treated as constructive sale depending on terms
- **concentrated_positions → exchange_fund:** Contribute concentrated stock to fund; receive diversified interest; defer tax (7-year lock-up)
- **concentrated_positions → charitable_remainder_trust:** Transfer appreciated stock; CRT sells; no immediate CGT; income stream to donor
- **private_business_and_real_estate → personal_credit:** Borrow against business equity; retain ownership; access liquidity
- **private_business_and_real_estate → leveraged_recap:** Business borrows; distributes cash to owner; retains control
- **private_business_and_real_estate → esop:** Sell shares to employee ownership plan; tax-advantaged; retain employees
- **private_business_and_real_estate → real_estate_monetization:** Mortgage financing; installment sale; 1031 exchange
- **private_business_and_real_estate → opportunity_zone:** Defer and reduce gains via qualified opportunity zone investment
- **estate_planning → will:** Legal document distributing estate; probate process; validity requirements
- **estate_planning → trust:** Legal structure holding assets; avoids probate; flexibility in distribution
- **estate_planning → legal_systems:** Common law (separate property default); civil law (community property default)
- **estate_planning → lifetime_gifts:** Transfer wealth during lifetime; may use annual gift tax exclusion
- **estate_planning → testamentary_bequest:** Transfer at death; included in taxable estate
- **estate_planning → gift_efficiency:** Lifetime gift more efficient if post-gift appreciation escapes estate tax
- **estate_planning_tools → irrevocable_trust:** Remove from taxable estate; loss of control; irrevocable
- **estate_planning_tools → grantor_retained_annuity:** GRAT; transfer appreciation to heirs; grantor retains annuity
- **estate_planning_tools → family_limited_partnership:** FLP; discount for lack of control/marketability; estate tax saving
- **estate_planning_tools → charitable_lead_trust:** CLT; charity gets income stream; heirs get remainder; reduces estate
- **estate_planning_tools → dynasty_trust:** Multi-generational; avoids estate tax at each generation transfer
- **generational_wealth → family_governance:** Mission, values, decision-making; reduce conflict; preserve cohesion
- **generational_wealth → conflict_resolution:** Formal family council; independent trustee; pre-agreed dispute mechanism
- **generational_wealth → business_exit:** Succession planning; buyout; IPO; sale to third party
- **generational_wealth → unexpected:** Powers of attorney; healthcare directives; incapacity plan; divorce pre-nup
- **validation → client_required:** client_id present
- **validation → valid_topic:** topic_type in [tax_management, asset_location, concentrated_position, estate_planning, charitable, generational]

## Success & failure scenarios

**✅ Success paths**

- **Address Private Wealth Topic** — when client_id exists; topic_type in ["tax_management","asset_location","concentrated_position","estate_planning","charitable","generational"], then call service; emit private_wealth.topic.addressed. _Why: Address advanced private wealth management topic for client._

**❌ Failure paths**

- **Invalid Topic** — when topic_type not_in ["tax_management","asset_location","concentrated_position","estate_planning","charitable","generational"], then emit private_wealth.topic.rejected. _Why: Unsupported topic type._ *(error: `PWM_TOPIC_INVALID`)*

## Errors it can return

- `PWM_TOPIC_INVALID` — topic_type must be one of tax_management, asset_location, concentrated_position, estate_planning, charitable, generational

## Events

**`private_wealth.topic.addressed`**
  Payload: `client_id`, `topic_type`, `tax_impact`, `estate_value`, `strategy_summary`

**`private_wealth.topic.rejected`**
  Payload: `client_id`, `reason_code`

## Connects to

- **private-wealth-management-overview-l3** *(required)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/private-wealth-topics-l3/) · **Spec source:** [`private-wealth-topics-l3.blueprint.yaml`](./private-wealth-topics-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
