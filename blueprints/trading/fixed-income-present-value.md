<!-- AUTO-GENERATED FROM fixed-income-present-value.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fixed Income Present Value

> Compute the present value of a fixed-income instrument (discount bond, coupon bond, level-payment/annuity loan) given its promised cash flows and market discount rate

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · time-value-of-money · fixed-income · bond-pricing · present-value · cfa-level-1

## What this does

Compute the present value of a fixed-income instrument (discount bond, coupon bond, level-payment/annuity loan) given its promised cash flows and market discount rate

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **bond_type** *(select, required)* — discount | coupon | level_payment (annuity) | perpetuity
- **face_value** *(number, optional)* — Face / par value (FV) — required for discount and coupon bonds
- **coupon_payment** *(number, optional)* — Periodic coupon PMT — required for coupon bonds
- **level_payment** *(number, optional)* — Level periodic payment A — required for level-payment loans
- **periods** *(number, optional)* — Number of compounding periods t (integer) — not required for perpetuity
- **discount_rate** *(number, required)* — Market discount rate per period (decimal)
- **periodicity** *(select, optional)* — annual | semiannual | quarterly | monthly (default annual)
- **compounding** *(select, optional)* — discrete | continuous (default discrete)

## What must be true

- **core_formulas → future_to_present_discrete:** PV = FV / (1 + r)^t
- **core_formulas → future_to_present_continuous:** PV = FV * e^(-r*t)
- **core_formulas → discount_bond:** PV = FV / (1 + r)^t
- **core_formulas → coupon_bond:** PV = sum_{i=1..N}[ PMT / (1+r)^i ] + FV / (1+r)^N
- **core_formulas → level_payment_loan:** PV = A * [1 - (1+r)^(-t)] / r
- **core_formulas → perpetuity:** PV = PMT / r
- **core_formulas → growing_perpetuity:** PV = PMT1 / (r - g), requires r > g
- **periodicity_adjustment → rule:** Periodic rate = annual_ytm / periods_per_year; number of periods = years * periods_per_year
- **periodicity_adjustment → example:** 5% semi-annual YTM, 4-year bond: r_period = 0.025, t = 8
- **price_yield_inverse → principle:** Bond price and YTM move inversely; higher r reduces PV
- **premium_discount_par → par:** PV = FV when coupon rate = market discount rate
- **premium_discount_par → premium:** PV > FV when coupon rate > market discount rate
- **premium_discount_par → discount:** PV < FV when coupon rate < market discount rate
- **accretion_pull_to_par → rule:** If interest rate is positive, PV accretes toward FV as time passes (t → 0)
- **validation → non_negative_face:** face_value >= 0
- **validation → positive_periods:** periods > 0 (except perpetuity)
- **validation → rate_above_negative_one:** discount_rate > -1
- **validation → perpetuity_positive_rate:** discount_rate > 0 for perpetuity (else PV unbounded)

## Success & failure scenarios

**✅ Success paths**

- **Price Discount Bond** — when bond_type eq "discount"; face_value gt 0; periods gt 0, then call service; emit pricing.fi_pv_calculated. _Why: Discount (zero-coupon) bond present value._
- **Price Coupon Bond** — when bond_type eq "coupon"; coupon_payment gte 0; periods gt 0, then call service; emit pricing.fi_pv_calculated. _Why: Coupon bond present value._
- **Price Level Payment** — when bond_type eq "level_payment"; level_payment gt 0; periods gt 0, then call service; emit pricing.fi_pv_calculated. _Why: Level-payment (amortising) loan present value._
- **Price Perpetuity** — when bond_type eq "perpetuity"; coupon_payment gt 0; discount_rate gt 0, then call service; emit pricing.fi_pv_calculated. _Why: Perpetuity present value._

**❌ Failure paths**

- **Invalid Rate** — when discount_rate lte -1, then emit pricing.fi_pv_rejected. _Why: Discount rate <= -100%._ *(error: `FI_PV_INVALID_RATE`)*
- **Missing Inputs** — when bond_type not_exists OR discount_rate not_exists, then emit pricing.fi_pv_rejected. _Why: Required inputs missing for bond type._ *(error: `FI_PV_MISSING_INPUTS`)*

## Errors it can return

- `FI_PV_INVALID_RATE` — Discount rate must be greater than -100%
- `FI_PV_MISSING_INPUTS` — Bond type and discount rate are required
- `FI_PV_INVALID_BOND_TYPE` — Unknown bond_type; must be discount, coupon, level_payment, or perpetuity

## Events

**`pricing.fi_pv_calculated`**
  Payload: `instrument_id`, `bond_type`, `face_value`, `coupon_payment`, `periods`, `discount_rate`, `present_value`

**`pricing.fi_pv_rejected`**
  Payload: `instrument_id`, `reason_code`

## Connects to

- **equity-present-value** *(recommended)*
- **implied-return-fixed-income** *(recommended)*
- **holding-period-return** *(recommended)*
- **bond-pricing-models** *(recommended)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fixed-income-present-value/) · **Spec source:** [`fixed-income-present-value.blueprint.yaml`](./fixed-income-present-value.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
