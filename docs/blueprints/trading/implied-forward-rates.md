---
title: "Implied Forward Rates Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Derive implied forward interest rates from the observed spot curve using cash flow additivity and the no-arbitrage condition. 6 fields. 3 outcomes. 2 error code"
---

# Implied Forward Rates Blueprint

> Derive implied forward interest rates from the observed spot curve using cash flow additivity and the no-arbitrage condition

| | |
|---|---|
| **Feature** | `implied-forward-rates` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, fixed-income, forward-rates, spot-curve, term-structure, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/implied-forward-rates.blueprint.yaml) |
| **JSON API** | [implied-forward-rates.json]({{ site.baseurl }}/api/blueprints/trading/implied-forward-rates.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `rates_engine` | Term Structure / Rates Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `short_spot_rate` | number | Yes | Spot rate for shorter maturity A (decimal, annualised) |  |
| `short_maturity` | number | Yes | Maturity of shorter spot in years (A) |  |
| `long_spot_rate` | number | Yes | Spot rate for longer maturity B (decimal, annualised) |  |
| `long_maturity` | number | Yes | Maturity of longer spot in years (B), where B > A |  |
| `compounding` | select | No | annual \| semiannual \| continuous (default annual) |  |
| `periods_per_year` | number | No | For non-annual compounding (default 1) |  |

## Rules

- **core_formula:**
  - **no_arbitrage:** (1 + S_A)^A * (1 + F_{A,B-A})^(B-A) = (1 + S_B)^B
  - **solved:** F_{A,B-A} = [ (1 + S_B)^B / (1 + S_A)^A ]^(1/(B-A)) - 1
  - **continuous_form:** F_{A,B-A} = (S_B * B - S_A * A) / (B - A)
- **interpretation:**
  - **forward_rate:** F_{A,B-A} is the rate that would apply to a loan beginning at time A and maturing at time B
  - **equivalence:** Investing at the long spot must equal investing at short spot then rolling into the forward
  - **break_even:** Forward rate is the market-implied break-even reinvestment rate — not a forecast
- **curve_shapes:**
  - **upward_sloping:** F > S_A when the spot curve is rising
  - **flat:** F = S when the curve is flat
  - **inverted:** F < S_A when the spot curve is falling
- **validation:**
  - **long_greater_than_short:** long_maturity > short_maturity
  - **positive_maturities:** both maturities > 0
  - **rates_above_negative_one:** spot rates > -1

## Outcomes

### Compute_implied_forward (Priority: 1)

_Solve implied forward from spot pair_

**Given:**
- `long_maturity` (input) gt `short_maturity`
- `short_spot_rate` (input) gt `-1`
- `long_spot_rate` (input) gt `-1`

**Then:**
- **call_service** target: `rates_engine`
- **emit_event** event: `rates.forward_calculated`

### Invalid_maturity_order (Priority: 10) — Error: `FORWARD_INVALID_MATURITY_ORDER`

_Long maturity not greater than short maturity_

**Given:**
- `long_maturity` (input) lte `short_maturity`

**Then:**
- **emit_event** event: `rates.forward_rejected`

### Invalid_rate (Priority: 11) — Error: `FORWARD_INVALID_RATE`

_A spot rate is at or below -100%_

**Given:**
- ANY: `short_spot_rate` (input) lte `-1` OR `long_spot_rate` (input) lte `-1`

**Then:**
- **emit_event** event: `rates.forward_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FORWARD_INVALID_MATURITY_ORDER` | 400 | Long maturity must be strictly greater than short maturity | No |
| `FORWARD_INVALID_RATE` | 400 | Spot rates must be strictly greater than -100% | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rates.forward_calculated` |  | `short_maturity`, `long_maturity`, `short_spot_rate`, `long_spot_rate`, `implied_forward_rate`, `forward_period` |
| `rates.forward_rejected` |  | `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-spot-forward-rates | recommended | Spot rates are the building blocks from which implied forward rates are derived |
| cash-flow-additivity | required |  |
| fixed-income-present-value | recommended |  |
| implied-return-fixed-income | recommended |  |
| forward-exchange-rate-no-arbitrage | recommended |  |

## AGI Readiness

### Goals

#### Reliable Implied Forward Rates

Derive implied forward interest rates from the observed spot curve using cash flow additivity and the no-arbitrage condition

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
| `cash_flow_additivity` | cash-flow-additivity | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_implied_forward | `autonomous` | - | - |
| invalid_maturity_order | `autonomous` | - | - |
| invalid_rate | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  scenario: 2-year spot 3%, 5-year spot 4%
  computation: "[(1.04)^5 / (1.03)^2]^(1/3) - 1 = 0.0467"
  implied_forward_2y3y: 0.0467
  interpretation: Market-implied 3-year rate beginning 2 years from now
continuous_example:
  scenario: S_A=0.03 (2y), S_B=0.04 (5y), continuous compounding
  formula: (0.04*5 - 0.03*2)/3 = 0.0467
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Implied Forward Rates Blueprint",
  "description": "Derive implied forward interest rates from the observed spot curve using cash flow additivity and the no-arbitrage condition. 6 fields. 3 outcomes. 2 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, fixed-income, forward-rates, spot-curve, term-structure, cfa-level-1"
}
</script>
