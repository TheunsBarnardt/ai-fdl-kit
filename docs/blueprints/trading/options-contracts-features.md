---
title: "Options Contracts Features Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Characterise call and put options by style (American, European, Bermudan), moneyness, intrinsic and time value, and compute payoff and profit diagrams at expiry"
---

# Options Contracts Features Blueprint

> Characterise call and put options by style (American, European, Bermudan), moneyness, intrinsic and time value, and compute payoff and profit diagrams at expiry

| | |
|---|---|
| **Feature** | `options-contracts-features` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, options, call, put, moneyness, payoff, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/options-contracts-features.blueprint.yaml) |
| **JSON API** | [options-contracts-features.json]({{ site.baseurl }}/api/blueprints/trading/options-contracts-features.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `option_engine` | Options Analytics Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `option_id` | text | Yes | Option identifier |  |
| `option_type` | select | Yes | call \| put |  |
| `exercise_style` | select | Yes | american \| european \| bermudan |  |
| `strike` | number | Yes | Strike price |  |
| `spot_price` | number | No | Current spot price |  |
| `premium` | number | No | Option premium |  |

## Rules

- **basic_payoffs:**
  - **call_at_expiry:** max(0, S - K)
  - **put_at_expiry:** max(0, K - S)
- **profit_diagrams:**
  - **long_call:** Limited loss to premium; unlimited upside
  - **short_call:** Limited gain to premium; unlimited loss
  - **long_put:** Limited loss to premium; downside gain capped at strike
  - **short_put:** Limited gain to premium; loss if spot falls
- **moneyness:**
  - **itm:** In-the-money: call S>K; put K>S
  - **atm:** At-the-money: S close to K
  - **otm:** Out-of-the-money: call S<K; put K<S
- **intrinsic_time_value:**
  - **intrinsic:** Max(0, S-K) for call; max(0, K-S) for put
  - **time_value:** Premium - intrinsic value
  - **decay:** Time value erodes toward expiry (theta)
- **exercise_styles:**
  - **european:** Exercise only at expiry
  - **american:** Exercise any time before expiry
  - **bermudan:** Exercise at specified dates
- **option_strategies:**
  - **covered_call:** Long stock + short call
  - **protective_put:** Long stock + long put
  - **collar:** Long stock + long put + short call
  - **bull_call_spread:** Long lower-strike call + short higher-strike call
  - **straddle:** Long call + long put same strike
- **validation:**
  - **option_required:** option_id present
  - **valid_type:** option_type in [call, put]
  - **valid_style:** exercise_style in [american, european, bermudan]
  - **positive_strike:** strike > 0

## Outcomes

### Compute_payoff (Priority: 1)

_Compute payoff, intrinsic value, and profit at given spot_

**Given:**
- `option_id` (input) exists
- `option_type` (input) in `call,put`
- `exercise_style` (input) in `american,european,bermudan`
- `strike` (input) gt `0`

**Then:**
- **call_service** target: `option_engine`
- **emit_event** event: `option.computed`

### Invalid_type (Priority: 10) — Error: `OPT_INVALID_TYPE`

_Unsupported option type_

**Given:**
- `option_type` (input) not_in `call,put`

**Then:**
- **emit_event** event: `option.computation_rejected`

### Invalid_strike (Priority: 11) — Error: `OPT_INVALID_STRIKE`

_Non-positive strike_

**Given:**
- `strike` (input) lte `0`

**Then:**
- **emit_event** event: `option.computation_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OPT_INVALID_TYPE` | 400 | option_type must be call or put | No |
| `OPT_INVALID_STRIKE` | 400 | strike must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `option.computed` |  | `computation_id`, `option_id`, `payoff`, `intrinsic_value`, `time_value` |
| `option.computation_rejected` |  | `computation_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| options-put-call-parity | required |  |
| binomial-option-pricing | recommended |  |

## AGI Readiness

### Goals

#### Reliable Options Contracts Features

Characterise call and put options by style (American, European, Bermudan), moneyness, intrinsic and time value, and compute payoff and profit diagrams at expiry

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
| `options_put_call_parity` | options-put-call-parity | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_payoff | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |
| invalid_strike | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Options Contracts Features Blueprint",
  "description": "Characterise call and put options by style (American, European, Bermudan), moneyness, intrinsic and time value, and compute payoff and profit diagrams at expiry",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, options, call, put, moneyness, payoff, cfa-level-1"
}
</script>
