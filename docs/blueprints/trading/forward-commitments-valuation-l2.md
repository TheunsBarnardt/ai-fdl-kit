---
title: "Forward Commitments Valuation L2 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Price and value forward commitments — arbitrage-free carry model, equity/IR/FX/fixed-income forwards, interest rate and currency swaps, equity swap pricing and "
---

# Forward Commitments Valuation L2 Blueprint

> Price and value forward commitments — arbitrage-free carry model, equity/IR/FX/fixed-income forwards, interest rate and currency swaps, equity swap pricing and valuation

| | |
|---|---|
| **Feature** | `forward-commitments-valuation-l2` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, forwards, futures, swaps, carry-arbitrage, cfa-level-2 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/forward-commitments-valuation-l2.blueprint.yaml) |
| **JSON API** | [forward-commitments-valuation-l2.json]({{ site.baseurl }}/api/blueprints/trading/forward-commitments-valuation-l2.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `derivatives_pricer` | Derivatives Pricer | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contract_id` | text | Yes | Contract identifier |  |
| `contract_type` | select | Yes | equity_forward \| ir_forward \| fx_forward \| fi_forward \| ir_swap \| fx_swap \| equity_swap |  |

## Rules

- **arbitrage_free_principle:**
  - **law_of_one_price:** Forward price set so no riskless profit exists
  - **replication:** Long forward = leveraged long spot minus carry costs
- **carry_arbitrage_no_cash_flows:**
  - **formula:** F0 = S0 × (1+r)^T
  - **interpretation:** Future value of spot at risk-free rate
- **carry_arbitrage_with_cash_flows:**
  - **formula:** F0 = (S0 − PV_cashflows) × (1+r)^T
  - **cash_flows:** Dividends, coupons, storage costs, convenience yield
- **equity_forwards_futures:**
  - **continuous:** F0 = S0 × e^{(r−q)T}
  - **dividend_adjusted:** Subtract PV of dividends from spot
  - **index_futures:** Use continuously compounded dividend yield
- **ir_forwards_fra:**
  - **fra_payoff:** Notional × (MRR − FRA rate) × period / (1 + MRR × period)
  - **settlement:** Discounted at MRR; paid at start of reference period
- **fi_forward:**
  - **formula:** F0 = (B0 − PV_coupon) × (1+r)^T
  - **conversion_factor:** Treasury futures use cheapest-to-deliver bond
- **forward_vs_futures:**
  - **marking_to_market:** Futures marked daily; T-bills as margin
  - **convexity_adjustment:** IR futures priced below equivalent forwards
- **ir_swap:**
  - **fixed_rate:** Set so swap has zero value at inception
  - **value_after_inception:** PV of remaining fixed − PV of remaining floating
  - **pricing:** Derived from spot LIBOR/term rates
- **fx_swap:**
  - **pricing:** Based on covered interest rate parity
  - **value:** Difference in PV of fixed legs in two currencies
- **equity_swap:**
  - **pay_fixed_receive_equity:** Value = equity leg value − fixed annuity value
  - **pricing:** Fixed rate = equity expected return minus funding spread; equilibrium sets zero value
- **validation:**
  - **contract_required:** contract_id present
  - **valid_type:** contract_type in allowed set

## Outcomes

### Price_forward_commitment (Priority: 1)

_Price or value forward commitment contract_

**Given:**
- `contract_id` (input) exists
- `contract_type` (input) in `equity_forward,ir_forward,fx_forward,fi_forward,ir_swap,fx_swap,equity_swap`

**Then:**
- **call_service** target: `derivatives_pricer`
- **emit_event** event: `forward.priced`

### Invalid_type (Priority: 10) — Error: `FORWARD_INVALID_TYPE`

_Unsupported contract type_

**Given:**
- `contract_type` (input) not_in `equity_forward,ir_forward,fx_forward,fi_forward,ir_swap,fx_swap,equity_swap`

**Then:**
- **emit_event** event: `forward.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FORWARD_INVALID_TYPE` | 400 | contract_type must be one of the supported forward commitment types | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `forward.priced` |  | `contract_id`, `contract_type`, `forward_price`, `current_value` |
| `forward.rejected` |  | `contract_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| contingent-claims-valuation-l2 | recommended |  |

## AGI Readiness

### Goals

#### Reliable Forward Commitments Valuation L2

Price and value forward commitments — arbitrage-free carry model, equity/IR/FX/fixed-income forwards, interest rate and currency swaps, equity swap pricing and valuation

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
| price_forward_commitment | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Forward Commitments Valuation L2 Blueprint",
  "description": "Price and value forward commitments — arbitrage-free carry model, equity/IR/FX/fixed-income forwards, interest rate and currency swaps, equity swap pricing and ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, forwards, futures, swaps, carry-arbitrage, cfa-level-2"
}
</script>
