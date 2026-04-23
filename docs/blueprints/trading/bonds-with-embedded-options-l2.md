---
title: "Bonds With Embedded Options L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided"
---

# Bonds With Embedded Options L2 Blueprint

> Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided durations, key rate durations

| | |
|---|---|
| **Feature** | `bonds-with-embedded-options-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, callable-bonds, putable-bonds, convertible-bonds, oas, effective-duration, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/bonds-with-embedded-options-l2.blueprint.yaml) |
| **JSON API** | [bonds-with-embedded-options-l2.json]({{ site.baseurl }}/api/blueprints/trading/bonds-with-embedded-options-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `embedded_options_valuator` | Embedded Options Bond Valuator | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bond_id` | text | Yes | Bond identifier |  |
| `option_type` | select | Yes | callable \| putable \| convertible \| capped_floater \| floored_floater |  |

## Rules

- **embedded_option_basics:**
  - **callable:** Issuer right to redeem early at call price
  - **putable:** Holder right to sell back at put price
  - **convertible:** Holder right to convert into equity
  - **relationships:** Callable = straight − call; Putable = straight + put
- **valuation_no_volatility:**
  - **method:** Discount cash flows treating optimal exercise deterministically
  - **limitation:** Ignores time value of optionality
- **effect_of_interest_rate_volatility:**
  - **higher_vol_more_value_to_holder:** Putable and convertible benefit
  - **higher_vol_more_value_to_issuer_short_call:** Callable price falls
  - **yield_curve_shape:** Steep curve increases call probability
- **valuing_default_free_with_volatility:**
  - **callable:** Backward induction; at each node take min(continue, call)
  - **putable:** max(continue, put)
  - **process:** Use calibrated binomial tree; compare with straight bond
- **valuing_risky:**
  - **method:** Add credit spread or use OAS
  - **binomial_with_credit:** Apply spread to discount rates at each node
- **option_adjusted_spread:**
  - **definition:** Constant spread added to risk-free tree that prices bond
  - **interpretation:** Removes the embedded option value; isolates credit + liquidity
  - **higher_vol_lower_oas_for_callable:** Higher vol raises call value, lowers OAS
- **effective_duration:**
  - **definition:** (P_- − P_+) / (2 × P_0 × ΔY); recompute via tree shifts
  - **callable_lower_than_straight:** Cap on upside as rates fall limits price gains
  - **putable_lower_than_straight_at_high_yields:** Floor protects holder
- **one_sided_durations:**
  - **use_when:** Asymmetric price response near call or put strike
  - **method:** Separate up- and down-shift sensitivities
- **key_rate_durations:**
  - **purpose:** Decompose curve risk by maturity bucket
  - **application:** Important for callable bonds where call timing depends on long rates
- **effective_convexity:**
  - **callable:** Negative near call boundary
  - **putable:** Greater positive than straight
  - **formula:** (P_+ + P_- − 2P_0) / (P_0 × ΔY^2)
- **capped_floored_floaters:**
  - **capped_floater:** Periodic cap reduces value vs uncapped (issuer short cap)
  - **floored_floater:** Floor adds value (holder long floor)
- **convertible_bonds:**
  - **components:** Straight bond + call option on equity
  - **conversion_value:** Shares × stock price
  - **conversion_premium:** Bond price − conversion value
  - **minimum_value:** Max(straight bond value, conversion value)
  - **risk_return:** Hybrid; equity-sensitive when in-the-money, debt-sensitive otherwise
- **validation:**
  - **bond_required:** bond_id present
  - **valid_option:** option_type in allowed set

## Outcomes

### Value_embedded_option (Priority: 1)

_Value bond with embedded option_

**Given:**
- `bond_id` (input) exists
- `option_type` (input) in `callable,putable,convertible,capped_floater,floored_floater`

**Then:**
- **call_service** target: `embedded_options_valuator`
- **emit_event** event: `embedded_option.valued`

### Invalid_option (Priority: 10) — Error: `EMBEDDED_OPTION_INVALID_TYPE`

_Unsupported embedded option type_

**Given:**
- `option_type` (input) not_in `callable,putable,convertible,capped_floater,floored_floater`

**Then:**
- **emit_event** event: `embedded_option.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EMBEDDED_OPTION_INVALID_TYPE` | 400 | option_type must be one of the supported types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `embedded_option.valued` |  | `bond_id`, `option_type`, `value`, `oas`, `effective_duration`, `effective_convexity` |
| `embedded_option.rejected` |  | `bond_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| arbitrage-free-valuation-framework-l2 | required |  |

## AGI Readiness

### Goals

#### Reliable Bonds With Embedded Options L2

Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided durations, key rate durations

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `arbitrage_free_valuation_framework_l2` | arbitrage-free-valuation-framework-l2 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| value_embedded_option | `autonomous` | - | - |
| invalid_option | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Bonds With Embedded Options L2 Blueprint",
  "description": "Value bonds with embedded options — callable, putable, convertible, capped/floored floaters; option-adjusted spread, effective duration and convexity, one-sided",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, callable-bonds, putable-bonds, convertible-bonds, oas, effective-duration, cfa-level-2"
}
</script>
