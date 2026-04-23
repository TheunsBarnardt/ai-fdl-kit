---
title: "Options Put Call Parity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply put-call parity on non-dividend, dividend-paying, and forward-style options to derive synthetic positions, arbitrage, and lower/upper option-value bounds."
---

# Options Put Call Parity Blueprint

> Apply put-call parity on non-dividend, dividend-paying, and forward-style options to derive synthetic positions, arbitrage, and lower/upper option-value bounds

| | |
|---|---|
| **Feature** | `options-put-call-parity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, options, put-call-parity, synthetic-position, arbitrage, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/options-put-call-parity.blueprint.yaml) |
| **JSON API** | [options-put-call-parity.json]({{ site.baseurl }}/api/blueprints/trading/options-put-call-parity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `parity_engine` | Put-Call Parity Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pricing_id` | text | Yes | Pricing identifier |  |
| `parity_form` | select | Yes | european_no_div \| european_div \| forward_based |  |
| `spot_price` | number | Yes | Current spot |  |
| `strike` | number | Yes | Strike |  |
| `time_to_expiry` | number | Yes | Time to expiry in years |  |

## Rules

- **put_call_parity:**
  - **european_no_div:** c + K * e^(-rT) = p + S
  - **european_div:** c + K * e^(-rT) = p + S - PV(dividends)
  - **forward_based:** c + PV(K) = p + PV(F)
- **synthetic_positions:**
  - **synthetic_call:** c = p + S - PV(K)
  - **synthetic_put:** p = c - S + PV(K)
  - **synthetic_stock:** S = c - p + PV(K)
  - **synthetic_zero_coupon:** PV(K) = p - c + S
- **option_bounds:**
  - **call_upper:** c <= S
  - **call_lower_european:** c >= max(0, S - PV(K))
  - **put_upper_european:** p <= PV(K)
  - **put_lower_european:** p >= max(0, PV(K) - S)
- **arbitrage_from_parity:**
  - **detection:** Any violation of parity equation implies arbitrage
  - **construction:** Sell overpriced leg, buy underpriced; lock risk-free profit
- **european_vs_american:**
  - **american_calls_no_div:** Equal value to European (no benefit to early exercise)
  - **american_calls_div:** May exceed European; early exercise can be optimal just before dividend
  - **american_puts:** Generally exceed European; early exercise beneficial when deep ITM
- **validation:**
  - **pricing_required:** pricing_id present
  - **valid_form:** parity_form in allowed set
  - **positive_strike:** strike > 0
  - **positive_time:** time_to_expiry > 0

## Outcomes

### Apply_put_call_parity (Priority: 1)

_Apply put-call parity and return implied prices or bounds_

**Given:**
- `pricing_id` (input) exists
- `parity_form` (input) in `european_no_div,european_div,forward_based`
- `strike` (input) gt `0`
- `time_to_expiry` (input) gt `0`

**Then:**
- **call_service** target: `parity_engine`
- **emit_event** event: `parity.applied`

### Invalid_form (Priority: 10) — Error: `PARITY_INVALID_FORM`

_Unsupported parity form_

**Given:**
- `parity_form` (input) not_in `european_no_div,european_div,forward_based`

**Then:**
- **emit_event** event: `parity.application_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PARITY_INVALID_FORM` | 400 | parity_form must be european_no_div, european_div, or forward_based | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `parity.applied` |  | `pricing_id`, `implied_call`, `implied_put`, `arbitrage_detected` |
| `parity.application_rejected` |  | `pricing_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| options-contracts-features | required |  |
| binomial-option-pricing | required |  |

## AGI Readiness

### Goals

#### Reliable Options Put Call Parity

Apply put-call parity on non-dividend, dividend-paying, and forward-style options to derive synthetic positions, arbitrage, and lower/upper option-value bounds

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
| `options_contracts_features` | options-contracts-features | fail |
| `binomial_option_pricing` | binomial-option-pricing | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| apply_put_call_parity | `autonomous` | - | - |
| invalid_form | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Options Put Call Parity Blueprint",
  "description": "Apply put-call parity on non-dividend, dividend-paying, and forward-style options to derive synthetic positions, arbitrage, and lower/upper option-value bounds.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, options, put-call-parity, synthetic-position, arbitrage, cfa-level-1"
}
</script>
