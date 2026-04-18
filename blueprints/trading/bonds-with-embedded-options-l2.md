<!-- AUTO-GENERATED FROM bonds-with-embedded-options-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bonds With Embedded Options L2

> Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided durations, key rate durations

**Category:** Trading · **Version:** 1.0.0 · **Tags:** fixed-income · callable-bonds · putable-bonds · convertible-bonds · oas · effective-duration · cfa-level-2

## What this does

Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided durations, key rate durations

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **bond_id** *(text, required)* — Bond identifier
- **option_type** *(select, required)* — callable | putable | convertible | capped_floater | floored_floater

## What must be true

- **embedded_option_basics → callable:** Issuer right to redeem early at call price
- **embedded_option_basics → putable:** Holder right to sell back at put price
- **embedded_option_basics → convertible:** Holder right to convert into equity
- **embedded_option_basics → relationships:** Callable = straight − call; Putable = straight + put
- **valuation_no_volatility → method:** Discount cash flows treating optimal exercise deterministically
- **valuation_no_volatility → limitation:** Ignores time value of optionality
- **effect_of_interest_rate_volatility → higher_vol_more_value_to_holder:** Putable and convertible benefit
- **effect_of_interest_rate_volatility → higher_vol_more_value_to_issuer_short_call:** Callable price falls
- **effect_of_interest_rate_volatility → yield_curve_shape:** Steep curve increases call probability
- **valuing_default_free_with_volatility → callable:** Backward induction; at each node take min(continue, call)
- **valuing_default_free_with_volatility → putable:** max(continue, put)
- **valuing_default_free_with_volatility → process:** Use calibrated binomial tree; compare with straight bond
- **valuing_risky → method:** Add credit spread or use OAS
- **valuing_risky → binomial_with_credit:** Apply spread to discount rates at each node
- **option_adjusted_spread → definition:** Constant spread added to risk-free tree that prices bond
- **option_adjusted_spread → interpretation:** Removes the embedded option value; isolates credit + liquidity
- **option_adjusted_spread → higher_vol_lower_oas_for_callable:** Higher vol raises call value, lowers OAS
- **effective_duration → definition:** (P_- − P_+) / (2 × P_0 × ΔY); recompute via tree shifts
- **effective_duration → callable_lower_than_straight:** Cap on upside as rates fall limits price gains
- **effective_duration → putable_lower_than_straight_at_high_yields:** Floor protects holder
- **one_sided_durations → use_when:** Asymmetric price response near call or put strike
- **one_sided_durations → method:** Separate up- and down-shift sensitivities
- **key_rate_durations → purpose:** Decompose curve risk by maturity bucket
- **key_rate_durations → application:** Important for callable bonds where call timing depends on long rates
- **effective_convexity → callable:** Negative near call boundary
- **effective_convexity → putable:** Greater positive than straight
- **effective_convexity → formula:** (P_+ + P_- − 2P_0) / (P_0 × ΔY^2)
- **capped_floored_floaters → capped_floater:** Periodic cap reduces value vs uncapped (issuer short cap)
- **capped_floored_floaters → floored_floater:** Floor adds value (holder long floor)
- **convertible_bonds → components:** Straight bond + call option on equity
- **convertible_bonds → conversion_value:** Shares × stock price
- **convertible_bonds → conversion_premium:** Bond price − conversion value
- **convertible_bonds → minimum_value:** Max(straight bond value, conversion value)
- **convertible_bonds → risk_return:** Hybrid; equity-sensitive when in-the-money, debt-sensitive otherwise
- **validation → bond_required:** bond_id present
- **validation → valid_option:** option_type in allowed set

## Success & failure scenarios

**✅ Success paths**

- **Value Embedded Option** — when bond_id exists; option_type in ["callable","putable","convertible","capped_floater","floored_floater"], then call service; emit embedded_option.valued. _Why: Value bond with embedded option._

**❌ Failure paths**

- **Invalid Option** — when option_type not_in ["callable","putable","convertible","capped_floater","floored_floater"], then emit embedded_option.rejected. _Why: Unsupported embedded option type._ *(error: `EMBEDDED_OPTION_INVALID_TYPE`)*

## Errors it can return

- `EMBEDDED_OPTION_INVALID_TYPE` — option_type must be one of the supported types

## Events

**`embedded_option.valued`**
  Payload: `bond_id`, `option_type`, `value`, `oas`, `effective_duration`, `effective_convexity`

**`embedded_option.rejected`**
  Payload: `bond_id`, `reason_code`

## Connects to

- **arbitrage-free-valuation-framework-l2** *(required)*

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

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bonds-with-embedded-options-l2/) · **Spec source:** [`bonds-with-embedded-options-l2.blueprint.yaml`](./bonds-with-embedded-options-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
