<!-- AUTO-GENERATED FROM order-management-execution.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Order Management Execution

> Order management and execution system staging, routing via FIX 4.4, tracking fills, and handling T+3 settlement across brokers

**Category:** Trading · **Version:** 1.0.0 · **Tags:** oms · ems · fix · execution · routing · settlement · order-lifecycle

## What this does

Order management and execution system staging, routing via FIX 4.4, tracking fills, and handling T+3 settlement across brokers

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_id** *(text, required)* — Order Identifier
- **portfolio_id** *(text, required)* — Portfolio Identifier
- **symbol** *(text, required)* — Instrument Symbol
- **side** *(select, required)* — Side
- **order_type** *(select, required)* — Order Type
- **quantity** *(number, required)* — Quantity
- **limit_price** *(number, optional)* — Limit Price
- **broker_id** *(text, optional)* — Broker Identifier
- **filled_qty** *(number, optional)* — Filled Quantity
- **avg_fill_price** *(number, optional)* — Average Fill Price
- **status** *(select, required)* — Order Status

## What must be true

- **staging:** MUST: Every order is staged before routing; passes pre-trade compliance gate
- **staging → requires_pretrade_pass:** true
- **authorization:** MUST: Orders above threshold require trader or PM authorization
- **authorization → threshold_zar:** 1000000
- **fix_protocol:** MUST: FIX 4.4 for broker connectivity; session heartbeats every 30s; sequence-number recovery
- **fix_protocol → version:** FIX.4.4
- **fix_protocol → heartbeat_seconds:** 30
- **routing:** MUST: Route to broker per smart-order-routing rules (best execution, cost, venue reliability)
- **routing → best_execution:** true
- **fill_tracking:** MUST: Apply each ExecutionReport (35=8) atomically; track partial fills; reconcile totals
- **settlement:** MUST: T+3 settlement for JSE equities; track settlement status and trigger follow-up on fails
- **settlement → cycle:** T+3
- **cancel_replace:** MUST: Support cancel/replace (35=G); maintain original order lineage
- **kill_switch:** MUST: Trader-accessible kill switch halts all outbound orders within 1 second
- **kill_switch → max_latency_seconds:** 1

## Success & failure scenarios

**✅ Success paths**

- **Order Cancelled** — when trader requested cancel and broker confirmed, then Order cancelled. _Why: Order cancelled before full fill._
- **Order Staged** — when symbol exists; quantity gt 0; pre-trade compliance gate passed, then Order staged. _Why: Order validated and staged awaiting authorization._
- **Order Authorized** — when authorizer has trader or portfolio_manager role, then Ready to send. _Why: Trader or PM authorized the order for routing._
- **Order Sent Successfully** — when broker returned ExecutionReport with ExecType=New, then Order live at broker. _Why: FIX NewOrderSingle transmitted and acknowledged by broker._
- **Fill Received** — when broker returned ExecutionReport with ExecType=Trade and LastShares < LeavesQty, then Partial fill applied. _Why: Partial fill ExecutionReport applied._
- **Order Fully Filled** — when filled_qty equals quantity, then Order fully filled; awaiting settlement. _Why: Cumulative fills equal order quantity._

**❌ Failure paths**

- **Settlement Failed** — when settlement_system reported a settlement fail, then Settlement ops investigates. _Why: T+3 settlement did not complete successfully._ *(error: `OMS_SETTLEMENT_FAILED`)*
- **Broker Rejected** — when broker returned ExecutionReport with ExecType=Rejected, then Trader reviews reject reason. _Why: Broker rejected the order._ *(error: `OMS_BROKER_REJECTED`)*

## Errors it can return

- `OMS_BROKER_REJECTED` — Broker rejected the order.
- `OMS_SETTLEMENT_FAILED` — Order failed to settle.
- `OMS_KILL_SWITCH_ACTIVE` — Trading is currently halted.

## Events

**`order.staged`** — Order staged
  Payload: `order_id`, `portfolio_id`, `symbol`

**`order.authorized`** — Order authorized
  Payload: `order_id`

**`order.sent`** — Order transmitted to broker
  Payload: `order_id`, `broker_id`

**`order.fill_received`** — Partial fill received
  Payload: `order_id`, `last_shares`, `last_px`

**`order.filled`** — Order fully filled
  Payload: `order_id`, `avg_fill_price`

**`order.cancelled`** — Order cancelled
  Payload: `order_id`

**`order.rejected`** — Order rejected by broker
  Payload: `order_id`, `reject_reason`

**`order.settlement_failed`** — Settlement failed
  Payload: `order_id`, `reason`

## Connects to

- **pre-trade-compliance-checks** *(required)* — All orders must pass the gate before staging
- **fund-custodian-reconciliation** *(required)* — Filled orders reconcile against custodian statements
- **market-data-ingestion** *(recommended)* — Pricing feeds smart-order-routing decisions
- **immutable-audit-log** *(required)* — Order lifecycle events must be auditable

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/order-management-execution/) · **Spec source:** [`order-management-execution.blueprint.yaml`](./order-management-execution.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
