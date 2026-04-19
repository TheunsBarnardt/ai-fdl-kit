---
title: "Order Management Execution Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Order management and execution system staging, routing via FIX 4.4, tracking fills, and handling T+3 settlement across brokers. 11 fields. 8 outcomes. 3 error c"
---

# Order Management Execution Blueprint

> Order management and execution system staging, routing via FIX 4.4, tracking fills, and handling T+3 settlement across brokers

| | |
|---|---|
| **Feature** | `order-management-execution` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | oms, ems, fix, execution, routing, settlement, order-lifecycle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/order-management-execution.blueprint.yaml) |
| **JSON API** | [order-management-execution.json]({{ site.baseurl }}/api/blueprints/trading/order-management-execution.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trader` | Trader | human | Authorizes and monitors orders |
| `portfolio_manager` | Portfolio Manager | human | Owns the investment decision |
| `broker` | Executing Broker | external | Executes orders on venue |
| `settlement_system` | Settlement System | system | Processes T+3 settlement |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Order Identifier |  |
| `portfolio_id` | text | Yes | Portfolio Identifier |  |
| `symbol` | text | Yes | Instrument Symbol |  |
| `side` | select | Yes | Side |  |
| `order_type` | select | Yes | Order Type |  |
| `quantity` | number | Yes | Quantity |  |
| `limit_price` | number | No | Limit Price |  |
| `broker_id` | text | No | Broker Identifier |  |
| `filled_qty` | number | No | Filled Quantity |  |
| `avg_fill_price` | number | No | Average Fill Price |  |
| `status` | select | Yes | Order Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `staged` | Yes |  |
| `authorized` |  |  |
| `sent` |  |  |
| `partially_filled` |  |  |
| `filled` |  |  |
| `settled` |  | Yes |
| `cancelled` |  | Yes |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `staged` | `authorized` | trader |  |
|  | `authorized` | `sent` | broker |  |
|  | `sent` | `partially_filled` | broker |  |
|  | `sent` | `filled` | broker |  |
|  | `partially_filled` | `filled` | broker |  |
|  | `filled` | `settled` | settlement_system |  |
|  | `staged` | `cancelled` | trader |  |
|  | `sent` | `rejected` | broker |  |

## Rules

- **staging:**
  - **description:** MUST: Every order is staged before routing; passes pre-trade compliance gate
  - **requires_pretrade_pass:** true
- **authorization:**
  - **description:** MUST: Orders above threshold require trader or PM authorization
  - **threshold_zar:** 1000000
- **fix_protocol:**
  - **description:** MUST: FIX 4.4 for broker connectivity; session heartbeats every 30s; sequence-number recovery
  - **version:** FIX.4.4
  - **heartbeat_seconds:** 30
- **routing:**
  - **description:** MUST: Route to broker per smart-order-routing rules (best execution, cost, venue reliability)
  - **best_execution:** true
- **fill_tracking:**
  - **description:** MUST: Apply each ExecutionReport (35=8) atomically; track partial fills; reconcile totals
- **settlement:**
  - **description:** MUST: T+3 settlement for JSE equities; track settlement status and trigger follow-up on fails
  - **cycle:** T+3
- **cancel_replace:**
  - **description:** MUST: Support cancel/replace (35=G); maintain original order lineage
- **kill_switch:**
  - **description:** MUST: Trader-accessible kill switch halts all outbound orders within 1 second
  - **max_latency_seconds:** 1

## Outcomes

### Settlement_failed (Priority: 1) — Error: `OMS_SETTLEMENT_FAILED`

_T+3 settlement did not complete successfully_

**Given:**
- settlement_system reported a settlement fail

**Then:**
- **notify** target: `settlement_ops`
- **emit_event** event: `order.settlement_failed`

**Result:** Settlement ops investigates

### Broker_rejected (Priority: 2) — Error: `OMS_BROKER_REJECTED`

_Broker rejected the order_

**Given:**
- broker returned ExecutionReport with ExecType=Rejected

**Then:**
- **transition_state** field: `status` from: `authorized` to: `rejected`
- **emit_event** event: `order.rejected`

**Result:** Trader reviews reject reason

### Order_cancelled (Priority: 5)

_Order cancelled before full fill_

**Given:**
- trader requested cancel and broker confirmed

**Then:**
- **transition_state** field: `status` from: `sent` to: `cancelled`
- **emit_event** event: `order.cancelled`

**Result:** Order cancelled

### Order_staged (Priority: 10) | Transaction: atomic

_Order validated and staged awaiting authorization_

**Given:**
- `symbol` (input) exists
- `quantity` (input) gt `0`
- pre-trade compliance gate passed

**Then:**
- **create_record** target: `oms`
- **emit_event** event: `order.staged`

**Result:** Order staged

### Order_authorized (Priority: 10)

_Trader or PM authorized the order for routing_

**Given:**
- authorizer has trader or portfolio_manager role

**Then:**
- **transition_state** field: `status` from: `staged` to: `authorized`
- **emit_event** event: `order.authorized`

**Result:** Ready to send

### Order_sent_successfully (Priority: 10) | Transaction: atomic

_FIX NewOrderSingle transmitted and acknowledged by broker_

**Given:**
- broker returned ExecutionReport with ExecType=New

**Then:**
- **transition_state** field: `status` from: `authorized` to: `sent`
- **emit_event** event: `order.sent`

**Result:** Order live at broker

### Fill_received (Priority: 10)

_Partial fill ExecutionReport applied_

**Given:**
- broker returned ExecutionReport with ExecType=Trade and LastShares < LeavesQty

**Then:**
- **set_field** target: `filled_qty` value: `incremented`
- **transition_state** field: `status` from: `sent` to: `partially_filled`
- **emit_event** event: `order.fill_received`

**Result:** Partial fill applied

### Order_fully_filled (Priority: 10) | Transaction: atomic

_Cumulative fills equal order quantity_

**Given:**
- filled_qty equals quantity

**Then:**
- **transition_state** field: `status` from: `partially_filled` to: `filled`
- **emit_event** event: `order.filled`

**Result:** Order fully filled; awaiting settlement

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OMS_BROKER_REJECTED` | 422 | Broker rejected the order. | Yes |
| `OMS_SETTLEMENT_FAILED` | 500 | Order failed to settle. | No |
| `OMS_KILL_SWITCH_ACTIVE` | 503 | Trading is currently halted. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.staged` | Order staged | `order_id`, `portfolio_id`, `symbol` |
| `order.authorized` | Order authorized | `order_id` |
| `order.sent` | Order transmitted to broker | `order_id`, `broker_id` |
| `order.fill_received` | Partial fill received | `order_id`, `last_shares`, `last_px` |
| `order.filled` | Order fully filled | `order_id`, `avg_fill_price` |
| `order.cancelled` | Order cancelled | `order_id` |
| `order.rejected` | Order rejected by broker | `order_id`, `reject_reason` |
| `order.settlement_failed` | Settlement failed | `order_id`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pre-trade-compliance-checks | required | All orders must pass the gate before staging |
| fund-custodian-reconciliation | required | Filled orders reconcile against custodian statements |
| market-data-ingestion | recommended | Pricing feeds smart-order-routing decisions |
| immutable-audit-log | required | Order lifecycle events must be auditable |

## AGI Readiness

### Goals

#### Reliable Execution

Route authorized orders to brokers with best execution and complete lifecycle tracking

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| order_accept_rate | >= 99.5% | Fraction of authorized orders accepted by broker on first attempt |
| settlement_success_rate | >= 99.9% | Fraction of filled orders settled on T+3 |

**Constraints:**

- **performance** (non-negotiable): Order-to-broker latency p99 < 200ms
- **regulatory** (non-negotiable): Best execution evidence retained 7 years

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- order authorization above threshold
- kill switch engagement

**Escalation Triggers:**

- `settlement_failed`
- `broker_rejected`

### Verification

**Invariants:**

- filled_qty <= quantity
- no outbound order without authorization
- status transitions follow the defined state machine

### Coordination

**Protocol:** `orchestrated`

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| order_staged | `autonomous` | - | - |
| order_authorized | `human_required` | - | - |
| order_sent_successfully | `autonomous` | - | - |
| fill_received | `autonomous` | - | - |
| order_fully_filled | `autonomous` | - | - |
| settlement_failed | `supervised` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Management Execution Blueprint",
  "description": "Order management and execution system staging, routing via FIX 4.4, tracking fills, and handling T+3 settlement across brokers. 11 fields. 8 outcomes. 3 error c",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "oms, ems, fix, execution, routing, settlement, order-lifecycle"
}
</script>
