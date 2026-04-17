<!-- AUTO-GENERATED FROM order-types-attributes-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Order Types Attributes Management

> Equity market order types (Market, Limit, Stop, Stop-Limit), order attributes, modifiers, lifecycle (submission to execution/cancellation), and execution rules.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** order-management · order-types · order-lifecycle · execution-rules · price-time-priority

## What this does

Equity market order types (Market, Limit, Stop, Stop-Limit), order attributes, modifiers, lifecycle (submission to execution/cancellation), and execution rules.

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_type** *(select, required)* — Order Type
- **side** *(select, required)* — Side
- **quantity** *(number, required)* — Quantity
- **limit_price** *(number, optional)* — Limit Price
- **stop_price** *(number, optional)* — Stop Price
- **time_in_force** *(select, required)* — Time-In-Force
- **order_validity_date** *(date, optional)* — Validity Date
- **iceberg_visible_quantity** *(number, optional)* — Iceberg Visible Quantity
- **all_or_none** *(boolean, optional)* — All-Or-None
- **minimum_execution_quantity** *(number, optional)* — Minimum Execution Quantity
- **order_status** *(select, optional)* — Order Status
- **filled_quantity** *(number, optional)* — Filled Quantity
- **average_fill_price** *(number, optional)* — Average Fill Price
- **order_submission_time** *(datetime, optional)* — Submission Time
- **order_acceptance_time** *(datetime, optional)* — Acceptance Time

## What must be true

- **order_submission → trader_authorization_required:** Trader must be authorized by trading member before submitting
- **order_submission → order_format_validation:** All orders validated for correct format, required fields, value ranges
- **order_submission → member_pre_validation:** Trading member system may pre-validate orders before market submission
- **order_submission → duplicate_order_allowed:** Duplicate orders permitted; exchange does not detect or prevent
- **order_types → market_order_fills_immediately:** Market order matches against best available; no price guarantee
- **order_types → limit_order_waits_for_price:** Limit order waits in book until matching price available
- **order_types → stop_order_inactive_until_triggered:** Stop order inactive until reference price triggers
- **order_types → stop_limit_combines_stops_and_limits:** Stop-Limit order becomes Limit when stop triggered
- **order_types → iceberg_reveals_progressively:** Iceberg order reveals disclosed quantity progressively
- **execution_rules → price_time_priority:** Orders matched by best price, then by time of submission
- **execution_rules → no_price_improvement:** Orders match at posted price; no price improvement beyond book
- **execution_rules → partial_execution_allowed:** Orders may execute partially over multiple trades
- **execution_rules → execution_as_available:** Execution occurs only if matching quantity available
- **time_in_force → day_expires_at_session_close:** Day orders automatically cancelled at session end
- **time_in_force → ioc_cancels_unmatched_immediately:** IOC orders cancel unfilled portion immediately
- **time_in_force → fok_all_or_nothing:** FOK orders reject if full quantity cannot match immediately
- **time_in_force → gtc_persists_until_cancelled:** GTC orders persist until explicitly cancelled
- **time_in_force → gtc_default_one_month:** GTC orders default to 30-day validity if not specified
- **order_attributes → aon_prevents_partial_fills:** All-Or-None orders reject if full quantity not available
- **order_attributes → meo_minimum_threshold:** Minimum Execution Quantity orders reject unless minimum filled
- **order_attributes → iceberg_not_shown_to_market:** Iceberg hidden quantity not visible in order book depth
- **order_attributes → disclosed_quantity_required:** Iceberg orders must specify disclosed quantity greater than zero
- **order_lifecycle → rejected_orders_not_in_book:** Rejected orders do not enter order book
- **order_lifecycle → cancelled_orders_removed_from_book:** Cancelled orders immediately removed from book
- **order_lifecycle → pending_orders_queued_for_acceptance:** Pending orders queued; not yet in live order book
- **order_lifecycle → filled_orders_removed_from_book:** Fully executed orders automatically removed from book
- **amendments_and_cancellations → amendment_not_supported:** Orders may not be amended; must cancel and resubmit
- **amendments_and_cancellations → cancellation_anytime_before_execution:** Orders may be cancelled before execution
- **amendments_and_cancellations → cancellation_immediate_effect:** Order cancellations take immediate effect
- **amendments_and_cancellations → cancel_reject_not_allowed:** Cancellation requests must succeed atomically

## Success & failure scenarios

**❌ Failure paths**

- **Order Submitted** — when order_type exists; trader_authorized eq true; quantity gt 0, then create_record; emit order.submitted. _Why: Trader submits valid order to exchange._ *(error: `ORDER_SUBMISSION_FAILED`)*
- **Order Accepted** — when order_valid eq true; session_state eq "open", then set order_status = "active"; set order_acceptance_time = "current_timestamp"; emit order.accepted. _Why: Order passes validation and enters order book._ *(error: `ORDER_ACCEPTANCE_FAILED`)*
- **Market Order Executed** — when order_type eq "market"; matching_quantity gte "order_quantity", then create_record; set order_status = "filled"; set filled_quantity = "order_quantity"; emit order.filled. _Why: Market order immediately matched against best available orders._ *(error: `MARKET_ORDER_REJECTED`)*
- **Limit Order Queued** — when order_type eq "limit"; limit_price exists, then emit order.queued. _Why: Limit order placed in book awaiting matching price._ *(error: `LIMIT_ORDER_REJECTED`)*
- **Limit Order Partially Filled** — when order_type eq "limit"; matching_quantity gt 0; matching_quantity lt "remaining_quantity", then set filled_quantity = "filled_quantity + matching_quantity"; emit order.partially_filled. _Why: Limit order executes against multiple trades._ *(error: `PARTIAL_FILL_FAILED`)*
- **Stop Order Triggered** — when order_type eq "stop"; reference_price exists, then move order_status pending → active; emit order.triggered. _Why: Stop order activated when reference price reaches stop price._ *(error: `STOP_ORDER_TRIGGER_FAILED`)*
- **Stop Limit Order Activated** — when order_type eq "stop_limit"; reference_price exists, then move order_status pending → active; emit order.activated_as_limit. _Why: Stop-Limit order becomes limit order when stop price triggered._ *(error: `STOP_LIMIT_ACTIVATION_FAILED`)*
- **Iceberg Order Refreshed** — when order_type eq "iceberg"; disclosed_quantity_filled eq true; remaining_hidden_quantity gt 0, then emit order.batch_revealed. _Why: Iceberg order reveals next batch when displayed quantity filled._ *(error: `ICEBERG_REFRESH_FAILED`)*
- **Order Cancelled** — when order_status eq "pending" OR order_status eq "active" OR order_status eq "partially_filled"; cancellation_request exists, then move order_status active → cancelled; emit order.cancelled. _Why: Trader or trading member cancels open order._ *(error: `CANCELLATION_FAILED`)*
- **Order Expired** — when time_in_force eq "gtc"; expiration_date exists; current_date gt "expiration_date", then move order_status active → cancelled; emit order.expired. _Why: GTC order reaches expiration date and is automatically removed._ *(error: `EXPIRATION_FAILED`)*
- **Day Order Cancelled At Close** — when time_in_force eq "day"; session_state eq "closed"; order_status eq "pending" OR order_status eq "active" OR order_status eq "partially_filled", then move order_status active → cancelled; emit order.cancelled. _Why: Day orders automatically cancelled at trading session end._ *(error: `DAY_ORDER_CANCELLATION_FAILED`)*
- **Ioc Order Cancelled** — when time_in_force eq "ioc"; matching_complete eq true, then emit order.cancelled. _Why: IOC order cancels unfilled portion immediately after matching._ *(error: `IOC_CANCELLATION_FAILED`)*
- **Fok Order Rejected** — when time_in_force eq "fok"; matching_quantity lt "order_quantity", then set order_status = "rejected"; emit order.rejected. _Why: FOK order rejected if full quantity not immediately available._ *(error: `FOK_REJECTION_FAILED`)*
- **Aon Order Rejected** — when all_or_none eq true; matching_quantity lt "order_quantity", then set order_status = "rejected"; emit order.rejected. _Why: All-Or-None order rejected if full quantity not available._ *(error: `AON_REJECTION_FAILED`)*

## Errors it can return

- `ORDER_SUBMISSION_FAILED` — Order submission failed validation; check order type, quantity, and prices
- `ORDER_ACCEPTANCE_FAILED` — Order book system unavailable; order could not be accepted
- `MARKET_ORDER_REJECTED` — Market order rejected; insufficient matching quantity available
- `LIMIT_ORDER_REJECTED` — Limit order rejected; limit price outside acceptable range
- `PARTIAL_FILL_FAILED` — Partial fill processing error; please contact market operations
- `STOP_ORDER_TRIGGER_FAILED` — Stop order trigger system error; order may not activate as expected
- `STOP_LIMIT_ACTIVATION_FAILED` — Stop-Limit order activation failed; order not converted to limit order
- `ICEBERG_REFRESH_FAILED` — Iceberg order batch reveal failed; next quantity not displayed
- `CANCELLATION_FAILED` — Order cancellation could not be processed; please try again
- `EXPIRATION_FAILED` — GTC order expiration processing failed
- `DAY_ORDER_CANCELLATION_FAILED` — Day order end-of-session cancellation failed
- `IOC_CANCELLATION_FAILED` — IOC order immediate cancellation failed
- `FOK_REJECTION_FAILED` — FOK order all-or-nothing check failed
- `AON_REJECTION_FAILED` — All-Or-None order validation failed
- `TRADER_NOT_AUTHORIZED` — Trader not authorized to submit orders
- `INVALID_ORDER_TYPE` — Order type not recognized; use Market, Limit, Stop, Stop-Limit, or Iceberg
- `INVALID_TIME_IN_FORCE` — Time-In-Force not recognized; use Day, IOC, FOK, or GTC

## Events

**`order.submitted`**
  Payload: `order_id`, `trader_id`, `security_code`, `quantity`, `order_type`, `limit_price`, `stop_price`, `time_in_force`

**`order.accepted`**
  Payload: `order_id`, `order_acceptance_time`, `queue_position`, `security_code`

**`order.queued`**
  Payload: `order_id`, `limit_price`, `position_in_queue`, `time_in_queue`

**`order.triggered`**
  Payload: `order_id`, `trigger_price`, `activated_as_market_order`, `trigger_time`

**`order.activated_as_limit`**
  Payload: `order_id`, `stop_price`, `limit_price`, `activation_time`

**`order.batch_revealed`**
  Payload: `order_id`, `new_displayed_quantity`, `remaining_hidden_quantity`

**`order.filled`**
  Payload: `order_id`, `execution_price`, `filled_quantity`, `execution_time`, `average_fill_price`

**`order.partially_filled`**
  Payload: `order_id`, `filled_quantity`, `remaining_quantity`, `execution_price`, `partial_fill_time`

**`order.cancelled`**
  Payload: `order_id`, `cancelled_quantity`, `cancellation_time`, `cancellation_reason`, `user_id`

**`order.expired`**
  Payload: `order_id`, `expiration_date`, `remaining_quantity`, `expiration_time`

**`order.rejected`**
  Payload: `order_id`, `rejection_reason`, `rejected_time`, `detail_message`

## Connects to

- **equity-market-trading-overview** *(required)*
- **popia-compliance** *(required)*
- **trading-surveillance** *(recommended)*
- **member-risk-management** *(recommended)*

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/order-types-attributes-management/) · **Spec source:** [`order-types-attributes-management.blueprint.yaml`](./order-types-attributes-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
