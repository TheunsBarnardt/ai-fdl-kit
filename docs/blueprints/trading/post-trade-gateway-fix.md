---
title: "Post Trade Gateway Fix Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "FIX 5.0 SP2 post-trade gateway for trade reporting, allocations, confirmations and give-ups. 5 fields. 3 outcomes. 2 error codes. rules: reporting, settlement. "
---

# Post Trade Gateway Fix Blueprint

> FIX 5.0 SP2 post-trade gateway for trade reporting, allocations, confirmations and give-ups

| | |
|---|---|
| **Feature** | `post-trade-gateway-fix` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix, post-trade, trade-reporting, allocation, confirmation, settlement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/post-trade-gateway-fix.blueprint.yaml) |
| **JSON API** | [post-trade-gateway-fix.json]({{ site.baseurl }}/api/blueprints/trading/post-trade-gateway-fix.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sell_side` | Sell-Side (Broker) | human |  |
| `buy_side` | Buy-Side (Fund Manager) | human |  |
| `clearing_house` | Clearing House | system |  |
| `settlement_system` | Settlement System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_id` | text | Yes | Trade ID |  |
| `counterparty` | text | Yes | Counterparty |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | Yes | Settlement Date (T+n) |  |
| `allocation_type` | select | No | Allocation Type (Normal, GiveUp, TakeUp) |  |

## Rules

- **reporting:**
  - **trade_capture_timeline:** Trade must be reported within regulatory timeline (T+0 or T+1 per market)
  - **allocation_matching:** Allocation must match original trade in quantity and price
- **settlement:**
  - **settlement_date_validation:** Settlement date must be valid trading day
  - **counterparty_verification:** Counterparty must be valid and have settlement capability

## Outcomes

### Trade_capture_report (Priority: 1) — Error: `TRADE_CAPTURE_FAILED`

_Broker submits trade capture report (TradeCaptureReport)_

**Given:**
- `trade_id` (input) exists

**Then:**
- **call_service** target: `clearing_house`
- **emit_event** event: `trade.captured`

### Allocation_instruction (Priority: 2)

_Sell-side sends allocation to clear a block trade to multiple accounts_

**Given:**
- `allocation_type` (input) eq `normal`

**Then:**
- **call_service** target: `clearing_house`
- **emit_event** event: `allocation.instructed`

### Confirmation (Priority: 3)

_Buy-side confirms trade details_

**Given:**
- `trade_id` (input) exists

**Then:**
- **call_service** target: `settlement_system`
- **emit_event** event: `trade.confirmed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRADE_CAPTURE_FAILED` | 400 | Trade capture validation failed | No |
| `ALLOCATION_MISMATCH` | 409 | Allocation does not match trade | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trade.captured` |  | `trade_id`, `trade_date`, `settlement_date` |
| `allocation.instructed` |  | `trade_id`, `allocation_type`, `quantity` |
| `trade.confirmed` |  | `trade_id`, `counterparty` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| trading-gateway-fix | recommended |  |
| clearing-settlement-integration | required |  |

## AGI Readiness

### Goals

#### Reliable Post Trade Gateway Fix

FIX 5.0 SP2 post-trade gateway for trade reporting, allocations, confirmations and give-ups

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
| `clearing_settlement_integration` | clearing-settlement-integration | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| trade_capture_report | `autonomous` | - | - |
| allocation_instruction | `autonomous` | - | - |
| confirmation | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
message_layouts:
  TRADE_CAPTURE_REPORT:
    - name: MsgType
      tag: 35
      offset: 0
      length: 1
      type: char
    - name: TradeID
      tag: 1003
      offset: 1
      length: 20
      type: string
    - name: TradeDate
      tag: 75
      offset: 21
      length: 8
      type: date
    - name: SettlDate
      tag: 64
      offset: 29
      length: 8
      type: date
  ALLOCATION_INSTRUCTION:
    - name: MsgType
      tag: 35
      offset: 0
      length: 1
      type: char
    - name: AllocationID
      tag: 70
      offset: 1
      length: 20
      type: string
    - name: TradeID
      tag: 1003
      offset: 21
      length: 20
      type: string
    - name: AllocType
      tag: 626
      offset: 41
      length: 1
      type: char
allocation_states:
  - code: 0
    name: Received
  - code: 1
    name: Pending
  - code: 2
    name: Accepted
  - code: 3
    name: Rejected
trade_capture_status_codes:
  - code: 0
    name: Accepted
  - code: 1
    name: Rejected
  - code: 4
    name: Pending
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Post Trade Gateway Fix Blueprint",
  "description": "FIX 5.0 SP2 post-trade gateway for trade reporting, allocations, confirmations and give-ups. 5 fields. 3 outcomes. 2 error codes. rules: reporting, settlement. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix, post-trade, trade-reporting, allocation, confirmation, settlement"
}
</script>
