---
title: "Trading Gateway Fix Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "FIX 5.0 SP2 order-entry gateway for submitting and managing trading orders. 9 fields. 4 outcomes. 3 error codes. rules: session, order_validation, risk. AGI: su"
---

# Trading Gateway Fix Blueprint

> FIX 5.0 SP2 order-entry gateway for submitting and managing trading orders

| | |
|---|---|
| **Feature** | `trading-gateway-fix` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix, order-entry, trading, gateway, real-time, electronic-communication |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/trading-gateway-fix.blueprint.yaml) |
| **JSON API** | [trading-gateway-fix.json]({{ site.baseurl }}/api/blueprints/trading/trading-gateway-fix.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `order_originator` | Order Originator (Trader/System) | human |  |
| `trading_system` | Trading System (Gateway) | system |  |
| `matching_engine` | Matching Engine | system |  |
| `risk_manager` | Risk Management System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_id` | text | Yes | Order ID (ClOrdID) |  |
| `symbol` | text | Yes | Symbol (SecurityID) |  |
| `side` | select | Yes | Side (Buy or Sell) |  |
| `order_type` | select | Yes | Order Type (Limit, Market, Iceberg) |  |
| `quantity` | number | Yes | Order Quantity |  |
| `price` | number | No | Limit Price |  |
| `time_in_force` | select | No | Time In Force (Day, GTC, IOC, FOK) |  |
| `currency` | text | No | Currency |  |
| `account_code` | text | Yes | Account Code |  |

## Rules

- **session:**
  - **logon_required:** Session must be authenticated via Logon message before order entry
  - **heartbeat:** Heartbeat required every 30 seconds or session disconnects
- **order_validation:**
  - **symbol_exists:** Symbol must exist in reference data and be trading
  - **quantity_minimum:** Order quantity must be positive and a valid multiple of contract size
- **risk:**
  - **pre_trade_check:** Risk system must validate against credit and exposure limits
  - **self_trade_prevention:** System rejects orders creating self-trades

## Outcomes

### Logon (Priority: 1)

_Client authenticates to gateway_

**Given:**
- `username` (input) exists

**Then:**
- **emit_event** event: `session.logon`

### New_order_single (Priority: 2) — Error: `ORDER_SUBMIT_FAILED` | Transaction: atomic

_Client submits single order for execution_

**Given:**
- `order_id` (input) exists
- `quantity` (input) gt `0`

**Then:**
- **call_service** target: `matching_engine`
- **emit_event** event: `order.submitted`

### Execution_report (Priority: 3)

_Matching engine reports execution result_

**Given:**
- `execution_status` (system) exists

**Then:**
- **emit_event** event: `order.executed`

### Order_rejected (Priority: 4) — Error: `ORDER_REJECTED_BY_EXCHANGE`

_Matching engine rejects order_

**Given:**
- `reject_reason` (system) exists

**Then:**
- **notify**
- **emit_event** event: `order.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_SUBMIT_FAILED` | 400 | Order submission failed validation | No |
| `ORDER_REJECTED_BY_EXCHANGE` | 409 | Exchange rejected the order | No |
| `SESSION_NOT_AUTHENTICATED` | 401 | Session not authenticated | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.logon` |  | `username`, `session_id`, `timestamp` |
| `order.submitted` |  | `order_id`, `symbol`, `quantity`, `price` |
| `order.executed` |  | `order_id`, `execution_id`, `fill_price`, `fill_quantity` |
| `order.rejected` |  | `order_id`, `reject_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| reference-data-management | required |  |

## AGI Readiness

### Goals

#### Reliable Trading Gateway Fix

FIX 5.0 SP2 order-entry gateway for submitting and managing trading orders

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
| `reference_data_management` | reference-data-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| logon | `autonomous` | - | - |
| new_order_single | `autonomous` | - | - |
| execution_report | `autonomous` | - | - |
| order_rejected | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
message_layouts:
  LOGON:
    - name: MsgType
      tag: 35
      offset: 0
      length: 1
      type: char
    - name: SenderCompID
      tag: 49
      offset: 1
      length: 20
      type: string
    - name: TargetCompID
      tag: 56
      offset: 21
      length: 20
      type: string
  NEW_ORDER_SINGLE:
    - name: MsgType
      tag: 35
      offset: 0
      length: 1
      type: char
    - name: ClOrdID
      tag: 11
      offset: 1
      length: 20
      type: string
    - name: Symbol
      tag: 55
      offset: 21
      length: 20
      type: string
    - name: Side
      tag: 54
      offset: 41
      length: 1
      type: char
    - name: OrderQty
      tag: 38
      offset: 42
      length: 10
      type: integer
    - name: Price
      tag: 44
      offset: 52
      length: 8
      type: decimal
  EXECUTION_REPORT:
    - name: MsgType
      tag: 35
      offset: 0
      length: 1
      type: char
    - name: ExecID
      tag: 17
      offset: 1
      length: 20
      type: string
    - name: ExecStatus
      tag: 150
      offset: 21
      length: 1
      type: char
order_types:
  - code: 1
    name: Market
  - code: 2
    name: Limit
  - code: 4
    name: MarketToLimit
tif_codes:
  - code: 0
    name: Day
  - code: 1
    name: GTC
  - code: 3
    name: IOC
  - code: 4
    name: FOK
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Trading Gateway Fix Blueprint",
  "description": "FIX 5.0 SP2 order-entry gateway for submitting and managing trading orders. 9 fields. 4 outcomes. 3 error codes. rules: session, order_validation, risk. AGI: su",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix, order-entry, trading, gateway, real-time, electronic-communication"
}
</script>
