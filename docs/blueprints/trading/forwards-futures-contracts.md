---
title: "Forwards Futures Contracts Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Compare forward and futures contracts on customisation, mark-to-market, margin, clearing, and basis, and compute settlement cash flows and mark-to-market variat"
---

# Forwards Futures Contracts Blueprint

> Compare forward and futures contracts on customisation, mark-to-market, margin, clearing, and basis, and compute settlement cash flows and mark-to-market variation margin

| | |
|---|---|
| **Feature** | `forwards-futures-contracts` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | derivatives, forwards, futures, margin, marking-to-market, basis-risk, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/forwards-futures-contracts.blueprint.yaml) |
| **JSON API** | [forwards-futures-contracts.json]({{ site.baseurl }}/api/blueprints/trading/forwards-futures-contracts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fwd_fut_engine` | Forward & Futures Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contract_id` | text | Yes | Contract identifier |  |
| `contract_type` | select | Yes | forward \| future |  |
| `contract_price` | number | Yes | Contracted price |  |
| `spot_price` | number | No | Current spot |  |
| `days_to_expiry` | number | Yes | Days to expiry |  |

## Rules

- **forward_characteristics:**
  - **custom:** Tailor maturity, size, underlying
  - **bilateral:** Counterparty risk unless collateralised
  - **settlement:** At expiry — physical or cash
  - **no_margin:** Typically no periodic margin; rising credit exposure
- **futures_characteristics:**
  - **standardised:** Exchange-specified underlying, size, delivery
  - **cleared:** CCP becomes counterparty — margin required
  - **marked_to_market:** Daily variation margin
  - **liquid:** Transparent pricing
- **margin_mechanics:**
  - **initial_margin:** Good-faith deposit at trade entry
  - **maintenance_margin:** Threshold below which call is triggered
  - **variation_margin:** Daily gains/losses posted in cash
- **basis_and_convergence:**
  - **basis:** Spot - futures
  - **convergence:** Basis tends to zero at expiry (for physically settled)
  - **basis_risk:** Hedging asset differs from deliverable grade/location
- **differences_impact:**
  - **valuation:** Forward value accumulates; futures reset daily
  - **pnl:** Cash P&L for futures is daily; forwards realised at settlement
  - **credit:** Forwards carry counterparty risk; futures carry clearinghouse risk
- **validation:**
  - **contract_required:** contract_id present
  - **valid_type:** contract_type in [forward, future]
  - **positive_days:** days_to_expiry > 0

## Outcomes

### Compute_settlement (Priority: 1)

_Compute settlement cash flow and accrued variation margin_

**Given:**
- `contract_id` (input) exists
- `contract_type` (input) in `forward,future`
- `days_to_expiry` (input) gt `0`

**Then:**
- **call_service** target: `fwd_fut_engine`
- **emit_event** event: `contract.settled`

### Invalid_type (Priority: 10) — Error: `FUT_INVALID_TYPE`

_Unsupported contract type_

**Given:**
- `contract_type` (input) not_in `forward,future`

**Then:**
- **emit_event** event: `contract.settlement_rejected`

### Invalid_expiry (Priority: 11) — Error: `FUT_INVALID_EXPIRY`

_Non-positive expiry_

**Given:**
- `days_to_expiry` (input) lte `0`

**Then:**
- **emit_event** event: `contract.settlement_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FUT_INVALID_TYPE` | 400 | contract_type must be forward or future | No |
| `FUT_INVALID_EXPIRY` | 400 | days_to_expiry must be positive | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `contract.settled` |  | `settlement_id`, `contract_id`, `contract_type`, `pnl`, `accrued_margin` |
| `contract.settlement_rejected` |  | `settlement_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| derivatives-instrument-features | required |  |
| forward-futures-pricing | required |  |

## AGI Readiness

### Goals

#### Reliable Forwards Futures Contracts

Compare forward and futures contracts on customisation, mark-to-market, margin, clearing, and basis, and compute settlement cash flows and mark-to-market variation margin

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
| `derivatives_instrument_features` | derivatives-instrument-features | fail |
| `forward_futures_pricing` | forward-futures-pricing | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| compute_settlement | `autonomous` | - | - |
| invalid_type | `autonomous` | - | - |
| invalid_expiry | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Forwards Futures Contracts Blueprint",
  "description": "Compare forward and futures contracts on customisation, mark-to-market, margin, clearing, and basis, and compute settlement cash flows and mark-to-market variat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "derivatives, forwards, futures, margin, marking-to-market, basis-risk, cfa-level-1"
}
</script>
