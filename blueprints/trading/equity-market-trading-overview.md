<!-- AUTO-GENERATED FROM equity-market-trading-overview.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Equity Market Trading Overview

> Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** equity · market-operations · settlement · risk-management · circuit-breakers

## What this does

Equity market structure, participants, trading sessions, order settlement, risk management, and circuit breaker rules for spot equity trading.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_segment** *(select, required)* — Market Segment
- **trading_session_type** *(select, required)* — Trading Session Type
- **session_state** *(select, optional)* — Session State
- **trading_halt_reason** *(text, optional)* — Trading Halt Reason
- **circuit_breaker_level** *(number, optional)* — Circuit Breaker Level
- **halt_duration_minutes** *(number, optional)* — Halt Duration
- **settlement_cycle** *(text, optional)* — Settlement Cycle
- **issuer_code** *(text, optional)* — Issuer Code
- **opening_price** *(number, optional)* — Opening Price
- **reference_price** *(number, optional)* — Reference Price

## What must be true

- **trading_sessions → only_licensed_members_trade:** Only licensed trading members and their authorized traders may submit orders
- **trading_sessions → session_hours_enforced:** Trading can only occur during designated session hours
- **trading_sessions → one_continuous_session:** Main Board operates one continuous session
- **trading_sessions → session_isolation:** Each trading session maintains independent order book state
- **order_handling → all_orders_validated:** All orders must be validated for format, size, and member authorization
- **order_handling → order_routing:** Orders are routed through central order book and matched by price/time priority
- **order_handling → no_guaranteed_execution:** Order submission does not guarantee execution
- **order_handling → order_cancellation_allowed:** Orders may be cancelled before execution
- **settlement → settlement_mandatory:** All executed trades must settle within defined settlement cycle
- **settlement → three_party_settlement:** Settlement involves buyer, seller, and central settlement authority
- **settlement → free_of_payment_prohibition:** No trades settle without simultaneous exchange of cash and securities
- **settlement → settlement_fail_consequences:** Failed settlements incur penalties and member discipline
- **risk_controls → circuit_breakers_monitored:** Price-based circuit breakers halt trading on extreme movements
- **risk_controls → trading_halts_enforced:** Trading halts triggered by regulatory action or extreme price moves
- **risk_controls → position_limits_enforced:** Member position limits prevent excessive concentration risk
- **risk_controls → margin_requirements_checked:** Margin calls issued if member capital falls below minimum
- **conformance → rules_updated_regularly:** Trading rules updated and distributed to all members
- **conformance → member_education_required:** Members must educate traders on rules before authorization
- **conformance → compliance_monitoring:** Exchange monitors trades for manipulation and regulatory violations
- **conformance → reporting_to_regulator:** Exchange reports daily trading data and breaches to authorities

## Success & failure scenarios

**❌ Failure paths**

- **Session Opened** — when trading_session_type exists; session_state eq "closed", then move session_state closed → open; emit trading.session.opened. _Why: Trading session opens at designated time._ *(error: `SESSION_OPEN_FAILED`)*
- **Order Accepted** — when session_state eq "open"; trader_authorized eq true; order_valid eq true, then create_record; emit order.submitted. _Why: Valid order from authorized trader accepted into order book._ *(error: `ORDER_REJECTED`)*
- **Order Matched** — when buy_order_exists exists; sell_order_exists exists; price_match eq true, then create_record; emit trade.executed. _Why: Buy and sell orders matched at same price._ *(error: `MATCHING_FAILED`)*
- **Circuit Breaker Triggered** — when price_movement_percent gt "circuit_breaker_level", then move session_state open → halted; emit trading.halted; notify via system. _Why: Price movement exceeds threshold; trading halted._ *(error: `CIRCUIT_BREAKER_FAILED`)*
- **Trading Halt Resumed** — when halt_duration_elapsed eq true, then move session_state halted → open; emit trading.resumed. _Why: Trading resumes after halt duration expires._ *(error: `RESUMPTION_FAILED`)*
- **Trade Settlement Initiated** — when trade_executed eq true; settlement_cycle_day exists, then emit settlement.initiated. _Why: Executed trade sent to settlement system for clearing._ *(error: `SETTLEMENT_NOT_INITIATED`)*
- **Session Closed** — when session_state eq "open"; session_close_time_reached eq true, then move session_state open → closed; emit trading.session.closed; emit trading.session.statistics. _Why: Trading session ends at designated close time._ *(error: `SESSION_CLOSE_FAILED`)*

## Errors it can return

- `SESSION_OPEN_FAILED` — Unable to open trading session; contact market operations
- `ORDER_REJECTED` — Order rejected due to validation failure or market conditions
- `MATCHING_FAILED` — Order matching engine error; please resubmit order
- `CIRCUIT_BREAKER_FAILED` — Circuit breaker system failure; trading halted pending resolution
- `RESUMPTION_FAILED` — Unable to resume trading; contact market operations
- `SETTLEMENT_NOT_INITIATED` — Trade settlement could not be initiated; clearing unavailable
- `SESSION_CLOSE_FAILED` — Unable to close trading session; contact market operations
- `UNAUTHORIZED_TRADER` — Trader not authorized to submit orders
- `SESSION_NOT_OPEN` — Trading session is not currently open; orders cannot be submitted

## Events

**`trading.session.opened`**
  Payload: `trading_session_type`, `session_start_time`, `session_date`

**`trading.session.closed`**
  Payload: `session_end_time`, `final_price`, `total_volume`, `session_date`

**`trading.session.statistics`**
  Payload: `total_trades`, `total_volume`, `session_high`, `session_low`, `session_date`

**`order.submitted`**
  Payload: `order_id`, `trader_id`, `security_code`, `quantity`, `price`, `order_type`, `timestamp`

**`order.cancelled`**
  Payload: `order_id`, `trader_id`, `security_code`, `reason`, `timestamp`

**`trade.executed`**
  Payload: `trade_id`, `buy_order_id`, `sell_order_id`, `quantity`, `price`, `execution_time`

**`trading.halted`**
  Payload: `security_code`, `halt_reason`, `halt_start_time`, `expected_resumption`

**`trading.resumed`**
  Payload: `security_code`, `resumption_time`, `resumption_price`

**`settlement.initiated`**
  Payload: `trade_id`, `settlement_date`, `buyer_account`, `seller_account`, `quantity`, `value`

## Connects to

- **order-types-attributes-management** *(required)*
- **popia-compliance** *(required)*
- **trading-surveillance** *(recommended)*
- **member-risk-management** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/equity-market-trading-overview/) · **Spec source:** [`equity-market-trading-overview.blueprint.yaml`](./equity-market-trading-overview.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
