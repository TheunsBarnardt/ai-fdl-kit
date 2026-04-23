---
title: "Equity Market Trading Overview Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading. . 10 fields. 7 ou"
---

# Equity Market Trading Overview Blueprint

> Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading.


| | |
|---|---|
| **Feature** | `equity-market-trading-overview` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | equity, market-operations, settlement, risk-management, circuit-breakers |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/equity-market-trading-overview.blueprint.yaml) |
| **JSON API** | [equity-market-trading-overview.json]({{ site.baseurl }}/api/blueprints/trading/equity-market-trading-overview.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trading_member` | Trading Member | human |  |
| `trader` | Trader | human |  |
| `settlement_participant` | Settlement Participant | human |  |
| `market_operations` | Market Operations | system |  |
| `risk_management_system` | Risk Management System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `market_segment` | select | Yes | Market Segment |  |
| `trading_session_type` | select | Yes | Trading Session Type |  |
| `session_state` | select | No | Session State |  |
| `trading_halt_reason` | text | No | Trading Halt Reason |  |
| `circuit_breaker_level` | number | No | Circuit Breaker Level |  |
| `halt_duration_minutes` | number | No | Halt Duration |  |
| `settlement_cycle` | text | No | Settlement Cycle |  |
| `issuer_code` | text | No | Issuer Code |  |
| `opening_price` | number | No | Opening Price |  |
| `reference_price` | number | No | Reference Price |  |

## States

**State field:** `undefined`

## Rules

- **trading_sessions:**
  - **only_licensed_members_trade:** Only licensed trading members and their authorized traders may submit orders
  - **session_hours_enforced:** Trading can only occur during designated session hours
  - **one_continuous_session:** Main Board operates one continuous session
  - **session_isolation:** Each trading session maintains independent order book state
- **order_handling:**
  - **all_orders_validated:** All orders must be validated for format, size, and member authorization
  - **order_routing:** Orders are routed through central order book and matched by price/time priority
  - **no_guaranteed_execution:** Order submission does not guarantee execution
  - **order_cancellation_allowed:** Orders may be cancelled before execution
- **settlement:**
  - **settlement_mandatory:** All executed trades must settle within defined settlement cycle
  - **three_party_settlement:** Settlement involves buyer, seller, and central settlement authority
  - **free_of_payment_prohibition:** No trades settle without simultaneous exchange of cash and securities
  - **settlement_fail_consequences:** Failed settlements incur penalties and member discipline
- **risk_controls:**
  - **circuit_breakers_monitored:** Price-based circuit breakers halt trading on extreme movements
  - **trading_halts_enforced:** Trading halts triggered by regulatory action or extreme price moves
  - **position_limits_enforced:** Member position limits prevent excessive concentration risk
  - **margin_requirements_checked:** Margin calls issued if member capital falls below minimum
- **conformance:**
  - **rules_updated_regularly:** Trading rules updated and distributed to all members
  - **member_education_required:** Members must educate traders on rules before authorization
  - **compliance_monitoring:** Exchange monitors trades for manipulation and regulatory violations
  - **reporting_to_regulator:** Exchange reports daily trading data and breaches to authorities

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| settlement_initiation | 30s |  |
| trading_resumption | 5m |  |

## Outcomes

### Session_opened (Priority: 1) — Error: `SESSION_OPEN_FAILED`

_Trading session opens at designated time_

**Given:**
- `trading_session_type` (system) exists
- `session_state` (system) eq `closed`

**Then:**
- **transition_state** field: `session_state` from: `closed` to: `open`
- **emit_event** event: `trading.session.opened`

### Order_accepted (Priority: 2) — Error: `ORDER_REJECTED`

_Valid order from authorized trader accepted into order book_

**Given:**
- `session_state` (system) eq `open`
- `trader_authorized` (db) eq `true`
- `order_valid` (system) eq `true`

**Then:**
- **create_record** target: `orders`
- **emit_event** event: `order.submitted`

### Order_matched (Priority: 3) — Error: `MATCHING_FAILED`

_Buy and sell orders matched at same price_

**Given:**
- `buy_order_exists` (system) exists
- `sell_order_exists` (system) exists
- `price_match` (computed) eq `true`

**Then:**
- **create_record** target: `trades`
- **emit_event** event: `trade.executed`

### Circuit_breaker_triggered (Priority: 4) — Error: `CIRCUIT_BREAKER_FAILED`

_Price movement exceeds threshold; trading halted_

**Given:**
- `price_movement_percent` (computed) gt `circuit_breaker_level`

**Then:**
- **transition_state** field: `session_state` from: `open` to: `halted`
- **emit_event** event: `trading.halted`
- **notify**

### Trading_halt_resumed (Priority: 5) — Error: `RESUMPTION_FAILED`

_Trading resumes after halt duration expires_

**Given:**
- `halt_duration_elapsed` (system) eq `true`

**Then:**
- **transition_state** field: `session_state` from: `halted` to: `open`
- **emit_event** event: `trading.resumed`

### Trade_settlement_initiated (Priority: 6) — Error: `SETTLEMENT_NOT_INITIATED`

_Executed trade sent to settlement system for clearing_

**Given:**
- `trade_executed` (db) eq `true`
- `settlement_cycle_day` (system) exists

**Then:**
- **emit_event** event: `settlement.initiated`

### Session_closed (Priority: 10) — Error: `SESSION_CLOSE_FAILED`

_Trading session ends at designated close time_

**Given:**
- `session_state` (system) eq `open`
- `session_close_time_reached` (system) eq `true`

**Then:**
- **transition_state** field: `session_state` from: `open` to: `closed`
- **emit_event** event: `trading.session.closed`
- **emit_event** event: `trading.session.statistics`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SESSION_OPEN_FAILED` | 500 | Unable to open trading session; contact market operations | No |
| `ORDER_REJECTED` | 422 | Order rejected due to validation failure or market conditions | No |
| `MATCHING_FAILED` | 500 | Order matching engine error; please resubmit order | No |
| `CIRCUIT_BREAKER_FAILED` | 503 | Circuit breaker system failure; trading halted pending resolution | No |
| `RESUMPTION_FAILED` | 500 | Unable to resume trading; contact market operations | No |
| `SETTLEMENT_NOT_INITIATED` | 500 | Trade settlement could not be initiated; clearing unavailable | No |
| `SESSION_CLOSE_FAILED` | 500 | Unable to close trading session; contact market operations | No |
| `UNAUTHORIZED_TRADER` | 403 | Trader not authorized to submit orders | No |
| `SESSION_NOT_OPEN` | 409 | Trading session is not currently open; orders cannot be submitted | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trading.session.opened` |  | `trading_session_type`, `session_start_time`, `session_date` |
| `trading.session.closed` |  | `session_end_time`, `final_price`, `total_volume`, `session_date` |
| `trading.session.statistics` |  | `total_trades`, `total_volume`, `session_high`, `session_low`, `session_date` |
| `order.submitted` |  | `order_id`, `trader_id`, `security_code`, `quantity`, `price`, `order_type`, `timestamp` |
| `order.cancelled` |  | `order_id`, `trader_id`, `security_code`, `reason`, `timestamp` |
| `trade.executed` |  | `trade_id`, `buy_order_id`, `sell_order_id`, `quantity`, `price`, `execution_time` |
| `trading.halted` |  | `security_code`, `halt_reason`, `halt_start_time`, `expected_resumption` |
| `trading.resumed` |  | `security_code`, `resumption_time`, `resumption_price` |
| `settlement.initiated` |  | `trade_id`, `settlement_date`, `buyer_account`, `seller_account`, `quantity`, `value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-types-attributes-management | required |  |
| popia-compliance | required |  |
| trading-surveillance | recommended |  |
| member-risk-management | recommended |  |

## AGI Readiness

### Goals

#### Reliable Equity Market Trading Overview

Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading.


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
| `order_types_attributes_management` | order-types-attributes-management | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| session_opened | `autonomous` | - | - |
| order_accepted | `autonomous` | - | - |
| order_matched | `autonomous` | - | - |
| circuit_breaker_triggered | `autonomous` | - | - |
| trading_halt_resumed | `autonomous` | - | - |
| trade_settlement_initiated | `autonomous` | - | - |
| session_closed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
market_segments:
  main_board: Primary listing segment for established securities
  altx: Alternative exchange segment for emerging growth securities
  fledgling: Development segment for emerging companies
trading_session_types:
  pre_open: Early session for order entry and discovery
  opening_auction: Opening auction to establish opening price
  continuous: Main continuous trading session with live price discovery
  closing_auction: Final auction to establish closing price
  post_close: After-hours trading session for limited participants
circuit_breaker_levels:
  level_1: 5% price movement triggers 10-minute trading halt
  level_2: 10% price movement triggers 20-minute trading halt
  level_3: 15% price movement triggers end-of-day trading halt
halt_reasons:
  price_circuit_breaker: Trading halted due to circuit breaker threshold
  regulatory_halt: Trading halted by regulatory authority
  news_event: Trading halted pending news release or announcement
  technical_issue: Trading halted due to technical system failure
  market_wide_halt: Market-wide trading suspension
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Equity Market Trading Overview Blueprint",
  "description": "Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading.\n. 10 fields. 7 ou",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "equity, market-operations, settlement, risk-management, circuit-breakers"
}
</script>
