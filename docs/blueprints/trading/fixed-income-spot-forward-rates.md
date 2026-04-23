---
title: "Fixed Income Spot Forward Rates Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Derive spot rates via bootstrapping, compute forward rates under no-arbitrage, and interpret the term structure of interest rates for pricing and curve strategi"
---

# Fixed Income Spot Forward Rates Blueprint

> Derive spot rates via bootstrapping, compute forward rates under no-arbitrage, and interpret the term structure of interest rates for pricing and curve strategies

| | |
|---|---|
| **Feature** | `fixed-income-spot-forward-rates` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fixed-income, spot-rate, forward-rate, bootstrapping, yield-curve, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fixed-income-spot-forward-rates.blueprint.yaml) |
| **JSON API** | [fixed-income-spot-forward-rates.json]({{ site.baseurl }}/api/blueprints/trading/fixed-income-spot-forward-rates.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `curve_engine` | Term-Structure Curve Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `curve_id` | text | Yes | Curve identifier |  |
| `curve_type` | select | Yes | par \| spot \| forward |  |
| `tenor_years` | number | No | Target tenor in years |  |
| `as_of_date` | date | Yes | Curve as-of date |  |

## Rules

- **par_curve:**
  - **definition:** Yields on coupon bonds priced at par at each tenor
  - **source:** Observable YTMs on benchmark issues
- **spot_curve:**
  - **definition:** Zero-coupon yields implied by no-arbitrage
  - **bootstrapping:** Strip par coupons from short tenors to long sequentially
- **forward_rate:**
  - **formula:** (1 + z_n)^n / (1 + z_m)^m - 1 for period from m to n
  - **notation:** f(m,n-m) — forward rate starting m years ahead for (n-m) years
  - **no_arbitrage:** Implied forwards make investors indifferent between rolling vs locking in
- **curve_shapes:**
  - **upward:** Normal; reflects term premium and growth expectations
  - **downward:** Inverted; often signals tightening or recession
  - **humped:** Short and long low, middle high
- **discounting_with_spot:**
  - **benefit:** Consistent with no-arbitrage; identifies rich/cheap bonds
- **yield_curve_strategies:**
  - **riding:** Rolling down the curve to capture yield as it ages
  - **steepener:** Long short-maturity, short long-maturity for curve steepening
  - **flattener:** Opposite of steepener
  - **butterfly:** Long wings, short belly or vice versa
- **validation:**
  - **curve_required:** curve_id present
  - **valid_type:** curve_type in allowed set
  - **date_required:** as_of_date present

## Outcomes

### Build_curve (Priority: 1)

_Construct par, spot, or forward curve on as-of date_

**Given:**
- `curve_id` (input) exists
- `curve_type` (input) in `par,spot,forward`
- `as_of_date` (input) exists

**Then:**
- **call_service** target: `curve_engine`
- **emit_event** event: `curve.built`

### Invalid_type (Priority: 10) — Error: `CURVE_INVALID_TYPE`

_Unsupported curve type_

**Given:**
- `curve_type` (input) not_in `par,spot,forward`

**Then:**
- **emit_event** event: `curve.build_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURVE_INVALID_TYPE` | 400 | curve_type must be par, spot, or forward | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `curve.built` |  | `curve_id`, `curve_type`, `as_of_date`, `points` |
| `curve.build_rejected` |  | `curve_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| implied-forward-rates | recommended | Implied forward rates are calculated directly from the spot rate term structure defined here |
| fixed-income-bond-pricing | required |  |
| fixed-income-yield-spreads | recommended |  |

## AGI Readiness

### Goals

#### Reliable Fixed Income Spot Forward Rates

Derive spot rates via bootstrapping, compute forward rates under no-arbitrage, and interpret the term structure of interest rates for pricing and curve strategies

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
| `fixed_income_bond_pricing` | fixed-income-bond-pricing | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| build_curve | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fixed Income Spot Forward Rates Blueprint",
  "description": "Derive spot rates via bootstrapping, compute forward rates under no-arbitrage, and interpret the term structure of interest rates for pricing and curve strategi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fixed-income, spot-rate, forward-rate, bootstrapping, yield-curve, cfa-level-1"
}
</script>
