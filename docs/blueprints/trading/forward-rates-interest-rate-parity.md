---
title: "Forward Rates Interest Rate Parity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price FX forward rates using covered interest rate parity, interpret forward points, and evaluate covered vs uncovered IRP implications for carry trades. 5 fiel"
---

# Forward Rates Interest Rate Parity Blueprint

> Price FX forward rates using covered interest rate parity, interpret forward points, and evaluate covered vs uncovered IRP implications for carry trades

| | |
|---|---|
| **Feature** | `forward-rates-interest-rate-parity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | economics, foreign-exchange, forward-rate, interest-rate-parity, carry-trade, covered-irp, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/forward-rates-interest-rate-parity.blueprint.yaml) |
| **JSON API** | [forward-rates-interest-rate-parity.json]({{ site.baseurl }}/api/blueprints/trading/forward-rates-interest-rate-parity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fx_forward_engine` | FX Forward Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pair` | text | Yes | Currency pair (base/quote) |  |
| `spot` | number | Yes | Spot exchange rate |  |
| `base_rate` | number | Yes | Base currency interest rate (decimal) |  |
| `quote_rate` | number | Yes | Quote currency interest rate (decimal) |  |
| `tenor_days` | number | Yes | Tenor in days |  |

## Rules

- **covered_interest_rate_parity:**
  - **formula:** F = S * (1 + r_quote * t/360) / (1 + r_base * t/360)
  - **interpretation:** No-arbitrage forward rate such that hedged returns equalise across currencies
- **forward_premium_discount:**
  - **premium:** Base currency forward > spot when base interest rate < quote rate
  - **discount:** Base currency forward < spot when base rate > quote rate
- **forward_points:**
  - **definition:** F - S, typically quoted in pips
  - **scaling:** Points scale with tenor and rate differential
- **uncovered_interest_rate_parity:**
  - **claim:** Expected spot = forward -> high-yield currency expected to depreciate
  - **evidence:** Empirically weak at short horizons — the forward puzzle / carry premium
- **carry_trade:**
  - **mechanism:** Borrow low-yield, invest high-yield, absorb FX risk
  - **risk:** Crashes during risk-off episodes; skewed return distribution
- **day_count:**
  - **money_market:** Actual/360 for most currencies; Actual/365 for GBP, AUD, NZD
- **validation:**
  - **tenor_positive:** tenor_days > 0
  - **spot_positive:** spot > 0
  - **pair_required:** pair present

## Outcomes

### Compute_forward (Priority: 1)

_Compute arbitrage-free forward rate_

**Given:**
- `pair` (input) exists
- `spot` (input) gt `0`
- `tenor_days` (input) gt `0`

**Then:**
- **call_service** target: `fx_forward_engine`
- **emit_event** event: `fx.forward_computed`

### Invalid_tenor (Priority: 10) — Error: `FWD_INVALID_TENOR`

_Non-positive tenor_

**Given:**
- `tenor_days` (input) lte `0`

**Then:**
- **emit_event** event: `fx.forward_rejected`

### Invalid_spot (Priority: 11) — Error: `FWD_INVALID_SPOT`

_Non-positive spot_

**Given:**
- `spot` (input) lte `0`

**Then:**
- **emit_event** event: `fx.forward_rejected`

### Missing_pair (Priority: 12) — Error: `FWD_PAIR_MISSING`

_Pair missing_

**Given:**
- `pair` (input) not_exists

**Then:**
- **emit_event** event: `fx.forward_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FWD_INVALID_TENOR` | 400 | tenor_days must be positive | No |
| `FWD_INVALID_SPOT` | 400 | spot must be positive | No |
| `FWD_PAIR_MISSING` | 400 | pair is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fx.forward_computed` |  | `forward_id`, `pair`, `spot`, `forward`, `forward_points`, `premium_or_discount` |
| `fx.forward_rejected` |  | `forward_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fx-quotes-cross-rates | required |  |
| exchange-rate-regimes | recommended |  |

## AGI Readiness

### Goals

#### Reliable Forward Rates Interest Rate Parity

Price FX forward rates using covered interest rate parity, interpret forward points, and evaluate covered vs uncovered IRP implications for carry trades

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
| `fx_quotes_cross_rates` | fx-quotes-cross-rates | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_forward | `autonomous` | - | - |
| invalid_tenor | `autonomous` | - | - |
| invalid_spot | `autonomous` | - | - |
| missing_pair | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Forward Rates Interest Rate Parity Blueprint",
  "description": "Price FX forward rates using covered interest rate parity, interpret forward points, and evaluate covered vs uncovered IRP implications for carry trades. 5 fiel",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "economics, foreign-exchange, forward-rate, interest-rate-parity, carry-trade, covered-irp, cfa-level-1"
}
</script>
