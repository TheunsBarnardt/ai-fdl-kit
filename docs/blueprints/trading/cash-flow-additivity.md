---
title: "Cash Flow Additivity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Apply the cash flow additivity principle — the value of combined cash flow streams equals the sum of their present values, underpinning the no-arbitrage conditi"
---

# Cash Flow Additivity Blueprint

> Apply the cash flow additivity principle — the value of combined cash flow streams equals the sum of their present values, underpinning the no-arbitrage condition in asset pricing

| | |
|---|---|
| **Feature** | `cash-flow-additivity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, time-value-of-money, no-arbitrage, cash-flow-additivity, replication, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/cash-flow-additivity.blueprint.yaml) |
| **JSON API** | [cash-flow-additivity.json]({{ site.baseurl }}/api/blueprints/trading/cash-flow-additivity.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `pricing_engine` | Pricing / Valuation Engine | system |  |
| `arbitrage_monitor` | Arbitrage Detection Service | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `cash_flow_streams` | json | Yes | Array of cash flow streams; each stream is an array of {period, amount} |  |
| `discount_rate` | number | Yes | Common discount rate (or term structure) used to evaluate each stream |  |
| `evaluation_date` | date | No | Common evaluation point (defaults to t=0) |  |
| `tolerance` | number | No | Absolute tolerance for no-arbitrage comparison (default 1e-6) |  |

## Rules

- **core_principle:**
  - **statement:** If two portfolios produce the same cash flows at the same times, they must have the same value today — otherwise arbitrage exists
  - **mathematical:** PV(A + B) = PV(A) + PV(B) when evaluated at same time with same discount function
- **no_arbitrage_condition:**
  - **rule:** Price(Portfolio_1) == Price(Portfolio_2) if cash flows are identical in amount and timing
  - **violation_implies_arbitrage:** Any price difference is a risk-free profit opportunity; arbitrage forces prices back into line
- **applications:** {"name":"Implied forward rates","mechanism":"Long-dated bond = rolling sequence of shorter bonds"}, {"name":"Forward exchange rates","mechanism":"Covered interest parity — two currencies, two rates"}, {"name":"Option pricing","mechanism":"Replicating portfolio of bond + underlying yields option payoff"}, {"name":"Bond stripping","mechanism":"Coupon bond = portfolio of zero-coupon bonds"}
- **preconditions:**
  - **same_timing:** Cash flows must occur at identical dates to be directly additive
  - **same_discount_function:** All streams must be discounted using a consistent term structure
  - **frictionless_markets:** No transaction costs, no bid-ask spread, unlimited borrowing at risk-free rate
- **violation_detection:**
  - **arbitrage_flag:** |PV(stream_1) - PV(stream_2)| > tolerance → arbitrage present
  - **triangulation:** Combine three instruments to detect cross-market mispricing
- **validation:**
  - **non_empty_streams:** cash_flow_streams must contain at least two streams
  - **aligned_periods:** Cash flow dates must be representable as comparable periods

## Outcomes

### Evaluate_streams (Priority: 1)

_Compute PV of each stream and the combined PV_

**Given:**
- `cash_flow_streams` (input) exists
- `discount_rate` (input) exists

**Then:**
- **call_service** target: `pricing_engine`
- **emit_event** event: `pricing.additivity_calculated`

### Detect_arbitrage (Priority: 2)

_Compare PV of two economically equivalent streams_

**Given:**
- `arbitrage_check` (input) eq `true`

**Then:**
- **call_service** target: `arbitrage_monitor`
- **emit_event** event: `pricing.arbitrage_evaluated`

### Arbitrage_detected (Priority: 3)

_PVs differ beyond tolerance_

**Given:**
- `pv_delta` (computed) gt `tolerance`

**Then:**
- **emit_event** event: `pricing.arbitrage_detected`

### Missing_streams (Priority: 10) — Error: `ADDITIVITY_MISSING_STREAMS`

_Insufficient streams supplied_

**Given:**
- `cash_flow_streams` (input) not_exists

**Then:**
- **emit_event** event: `pricing.additivity_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ADDITIVITY_MISSING_STREAMS` | 400 | At least one cash flow stream must be provided | No |
| `ADDITIVITY_INCOMPATIBLE_DATES` | 400 | Cash flow dates cannot be aligned to a common schedule | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing.additivity_calculated` |  | `evaluation_date`, `stream_count`, `total_pv`, `individual_pvs` |
| `pricing.arbitrage_evaluated` |  | `stream_1_pv`, `stream_2_pv`, `pv_delta`, `arbitrage_present` |
| `pricing.arbitrage_detected` |  | `stream_1_pv`, `stream_2_pv`, `pv_delta`, `recommended_action` |
| `pricing.additivity_rejected` |  | `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fixed-income-present-value | required |  |
| implied-forward-rates | recommended |  |
| forward-exchange-rate-no-arbitrage | recommended |  |
| option-pricing-cash-flow-additivity | recommended |  |

## AGI Readiness

### Goals

#### Reliable Cash Flow Additivity

Apply the cash flow additivity principle — the value of combined cash flow streams equals the sum of their present values, underpinning the no-arbitrage condition in asset pricing

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
| `fixed_income_present_value` | fixed-income-present-value | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| evaluate_streams | `autonomous` | - | - |
| detect_arbitrage | `autonomous` | - | - |
| arbitrage_detected | `autonomous` | - | - |
| missing_streams | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example_stripping:
  scenario: 3-year annual 5% coupon, FV=100, r=5% → PV = 100
  equivalence: Sum of PVs of 5, 5, 5, 100 discounted at 5% = 100
  interpretation: Coupon bond = portfolio of zero-coupon bonds
worked_example_arbitrage:
  scenario: Bond A prices at 102, synthetic replication via strips prices at 101
  action: Buy synthetic (101), sell bond (102), lock in 1.00 risk-free
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cash Flow Additivity Blueprint",
  "description": "Apply the cash flow additivity principle — the value of combined cash flow streams equals the sum of their present values, underpinning the no-arbitrage conditi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, time-value-of-money, no-arbitrage, cash-flow-additivity, replication, cfa-level-1"
}
</script>
