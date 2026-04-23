---
title: "Currency Management Intro L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy. 2 fie"
---

# Currency Management Intro L3 Blueprint

> Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy

| | |
|---|---|
| **Feature** | `currency-management-intro-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, currency-management, fx-hedging, currency-risk, return-decomposition, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/currency-management-intro-l3.blueprint.yaml) |
| **JSON API** | [currency-management-intro-l3.json]({{ site.baseurl }}/api/blueprints/trading/currency-management-intro-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `portfolio_manager` | Portfolio Manager | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `mandate_id` | text | Yes | Currency mandate identifier |  |
| `hedge_approach` | select | Yes | passive \| discretionary \| active \| overlay |  |

## Rules

- **fx_market_structure:**
  - **spot_market:** Immediate delivery (T+2); most liquid; driven by supply and demand
  - **forward_market:** Agreement to exchange currencies at future date at today's forward rate
  - **fx_swap:** Simultaneous spot sale and forward purchase; used to roll hedges; not a currency swap
  - **currency_options:** Right to buy/sell currency; provides asymmetric protection; costs premium
- **return_decomposition:**
  - **total_return:** R_total = R_local + R_FX (in portfolio currency)
  - **r_fx:** Percentage change in value of foreign currency vs domestic currency
  - **volatility_decomp:** σ²_total ≈ σ²_local + σ²_FX + 2·ρ·σ_local·σ_FX
  - **correlation_effect:** When ρ(local, FX) > 0: FX amplifies volatility; when ρ < 0: FX dampens volatility
- **portfolio_optimization:**
  - **strategic_currency:** Optimal currency exposure depends on return, risk, and correlation of FX with asset
  - **hedging_decision:** Hedge if FX risk adds more volatility than return; consider carry cost
  - **carry:** Interest rate differential = forward premium/discount; cost/benefit of hedging
- **hedging_spectrum:**
  - **passive:** Fully hedge all FX exposure back to domestic currency; no active currency bets
  - **discretionary:** Partial hedge with manager discretion to vary hedge ratio within policy bands
  - **active:** Currency managed as separate alpha source; may take positions beyond underlying exposure
  - **overlay:** Specialist currency manager overlaid on physical portfolio; manages FX separately
- **ips_currency_policy:**
  - **strategic_benchmark:** Define benchmark hedge ratio (0%, 50%, 100%) in IPS
  - **hedge_ratio_tolerance:** Allowable deviation bands around benchmark hedge ratio
  - **currency_rebalancing:** When to rebalance hedge as underlying FX exposure changes
  - **permissible_instruments:** Define which FX instruments (forwards, options, NDFs) are permitted
- **factors_affecting_hedge_decision:**
  - **transaction_costs:** Bid-ask spread on forward contracts; higher for exotic currencies
  - **correlation_with_portfolio:** Negative correlation → natural hedge; reduces need for explicit hedging
  - **investor_horizon:** Short-horizon investors more concerned with FX volatility than long-horizon
  - **carry_cost:** High interest rate differentials increase cost of hedging high-yielding currencies
  - **currency_alpha:** Active currency managers may add alpha; assess manager skill vs hedging cost
- **validation:**
  - **mandate_required:** mandate_id present
  - **valid_approach:** hedge_approach in [passive, discretionary, active, overlay]

## Outcomes

### Establish_currency_mandate (Priority: 1)

_Establish currency management approach for international portfolio_

**Given:**
- `mandate_id` (input) exists
- `hedge_approach` (input) in `passive,discretionary,active,overlay`

**Then:**
- **call_service** target: `portfolio_manager`
- **emit_event** event: `currency.mandate.established`

### Invalid_approach (Priority: 10) — Error: `CURRENCY_INVALID_APPROACH`

_Unsupported hedge approach_

**Given:**
- `hedge_approach` (input) not_in `passive,discretionary,active,overlay`

**Then:**
- **emit_event** event: `currency.mandate.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CURRENCY_INVALID_APPROACH` | 400 | hedge_approach must be one of passive, discretionary, active, overlay | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `currency.mandate.established` |  | `mandate_id`, `hedge_approach`, `benchmark_hedge_ratio`, `permitted_instruments` |
| `currency.mandate.rejected` |  | `mandate_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| currency-management-program-l3 | recommended |  |
| swaps-forwards-futures-strategies-l3 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Currency Management Intro L3

Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| establish_currency_mandate | `autonomous` | - | - |
| invalid_approach | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Currency Management Intro L3 Blueprint",
  "description": "Currency risk management fundamentals — FX market structure, return decomposition, passive/discretionary/active hedging spectrum, and IPS currency policy. 2 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, currency-management, fx-hedging, currency-risk, return-decomposition, cfa-level-3"
}
</script>
