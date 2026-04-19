---
title: "Portfolio Rebalancing Engine Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Computes drift vs model, proposes trades to restore target weights, minimizes turnover, respects Reg 28, and requires human authorization. 8 fields. 6 outcomes."
---

# Portfolio Rebalancing Engine Blueprint

> Computes drift vs model, proposes trades to restore target weights, minimizes turnover, respects Reg 28, and requires human authorization

| | |
|---|---|
| **Feature** | `portfolio-rebalancing-engine` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | rebalancing, drift, turnover, tax-lot, cgt, reg28, optimization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/portfolio-rebalancing-engine.blueprint.yaml) |
| **JSON API** | [portfolio-rebalancing-engine.json]({{ site.baseurl }}/api/blueprints/trading/portfolio-rebalancing-engine.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `proposal_id` | text | Yes | Proposal Identifier |  |
| `portfolio_id` | text | Yes | Portfolio Identifier |  |
| `model_id` | text | Yes | Target Model |  |
| `drift_snapshot` | json | Yes | Drift vs Target |  |
| `proposed_trades` | json | No | Proposed Trades |  |
| `estimated_turnover` | number | No | Estimated Turnover (ZAR) |  |
| `estimated_cgt` | number | No | Estimated CGT Impact (ZAR) |  |
| `status` | select | Yes | Proposal Status |  |

## Rules

- **drift_calculation:**
  - **description:** MUST: Compute drift per asset class and per position; only propose trades where drift exceeds tolerance band
  - **source:** model_portfolio.tolerance_bands
- **turnover_minimization:**
  - **description:** MUST: Minimize turnover subject to drift correction, prefer HIFO tax lots to reduce CGT, respect min trade size
  - **min_trade_size_zar:** 10000
  - **lot_selection:** hifo
- **reg28_respect:**
  - **description:** MUST: Proposed post-trade state must satisfy Regulation 28 limits
  - **validate_post_trade:** true
- **cgt_harvest:**
  - **description:** SHOULD: Harvest losses when beneficial; do not trigger wash sales
- **human_authorization:**
  - **description:** MUST: No proposal executes without explicit human authorization by portfolio manager
  - **mandatory:** true
- **proposal_ttl:**
  - **description:** MUST: Proposals expire after 24 hours to avoid stale pricing
  - **ttl_hours:** 24
- **execution:**
  - **description:** MUST: On authorization, send orders to OMS in atomic batch; rollback proposal state on failure

## Outcomes

### Computation_failed (Priority: 1) — Error: `REBALANCE_COMPUTATION_FAILED`

_Optimizer failed to produce a feasible proposal_

**Given:**
- optimizer did not converge or no feasible solution respects all constraints

**Then:**
- **notify** target: `portfolio_manager`
- **emit_event** event: `rebalance.computation_failed`

**Result:** Portfolio manager investigates manually

### Proposal_rejected (Priority: 4) — Error: `REBALANCE_PROPOSAL_REJECTED`

_Portfolio manager rejected the proposal_

**Given:**
- authorizer rejected the proposal

**Then:**
- **transition_state** field: `status` from: `pending_authorization` to: `rejected`
- **emit_event** event: `rebalance.proposal_rejected`

**Result:** Proposal archived; no trades sent

### Drift_below_threshold (Priority: 5)

_No asset class exceeds tolerance; no action needed_

**Given:**
- every asset class drift is within tolerance band

**Then:**
- **emit_event** event: `rebalance.no_action_needed`

**Result:** No proposal generated

### Rebalance_proposal_generated (Priority: 10) | Transaction: atomic

_Engine produced a valid proposal respecting all constraints_

**Given:**
- drift exceeds tolerance on at least one asset class
- proposed trades satisfy Reg 28 post-trade

**Then:**
- **create_record** target: `proposals`
- **transition_state** field: `status` from: `draft` to: `pending_authorization`
- **emit_event** event: `rebalance.proposal_generated`

**Result:** Proposal awaiting authorization

### Proposal_authorized (Priority: 10) | Transaction: atomic

_Portfolio manager authorized the proposal_

**Given:**
- authorizer has portfolio_manager role
- proposal is not expired

**Then:**
- **transition_state** field: `status` from: `pending_authorization` to: `authorized`
- **emit_event** event: `rebalance.proposal_authorized`

**Result:** Ready for execution

### Rebalance_executed_successfully (Priority: 10) | Transaction: atomic

_All orders from an authorized proposal were accepted by OMS_

**Given:**
- all proposed orders acknowledged by OMS

**Then:**
- **transition_state** field: `status` from: `authorized` to: `executed`
- **emit_event** event: `rebalance.executed`

**Result:** Rebalance complete; orders in flight to brokers

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REBALANCE_PROPOSAL_REJECTED` | 409 | Rebalance proposal was rejected. | Yes |
| `REBALANCE_COMPUTATION_FAILED` | 500 | Could not produce a feasible rebalance proposal. | Yes |
| `REBALANCE_PROPOSAL_EXPIRED` | 410 | Proposal has expired; regenerate from current prices. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rebalance.proposal_generated` | Rebalance proposal produced | `proposal_id`, `portfolio_id`, `estimated_turnover` |
| `rebalance.proposal_authorized` | Proposal authorized by PM | `proposal_id`, `authorizer_id` |
| `rebalance.executed` | Proposal orders sent to OMS | `proposal_id`, `portfolio_id`, `order_ids` |
| `rebalance.no_action_needed` | Drift within tolerance | `portfolio_id` |
| `rebalance.proposal_rejected` | Proposal rejected | `proposal_id`, `reason` |
| `rebalance.computation_failed` | Optimizer failure | `portfolio_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| model-portfolio | required | Models supply target weights and tolerance bands |
| regulation-28-compliance | required | Post-trade state must remain compliant |
| pre-trade-compliance-checks | required | Individual rebalance orders pass through the pre-trade gate |
| order-management-execution | required | OMS receives authorized orders |

## AGI Readiness

### Goals

#### Efficient Rebalance

Keep portfolios within drift tolerance with minimum turnover and tax impact

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| tracking_error | < 0.5% | Annualized tracking error vs model |
| turnover_ratio | < 30% | Annual turnover as percent of AUM |

**Constraints:**

- **regulatory** (non-negotiable): Reg 28 compliance must be preserved
- **cost** (negotiable): Minimize trading costs and tax drag

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- proposal authorization
- any manual override

**Escalation Triggers:**

- `computation_failed`
- `estimated_turnover > 10% of aum`

### Verification

**Invariants:**

- no execution without authorized proposal
- post-trade projection respects Reg 28
- proposal timestamps within TTL

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rebalance_proposal_generated | `autonomous` | - | - |
| proposal_authorized | `human_required` | - | - |
| rebalance_executed_successfully | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Portfolio Rebalancing Engine Blueprint",
  "description": "Computes drift vs model, proposes trades to restore target weights, minimizes turnover, respects Reg 28, and requires human authorization. 8 fields. 6 outcomes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rebalancing, drift, turnover, tax-lot, cgt, reg28, optimization"
}
</script>
