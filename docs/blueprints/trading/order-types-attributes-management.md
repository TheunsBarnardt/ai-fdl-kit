---
title: "Order Types Attributes Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Equity market order types (Market, Limit, Stop, Stop-Limit), order attributes, modifiers, lifecycle (submission to execution/cancellation), and execution rules."
---

# Order Types Attributes Management Blueprint

> Equity market order types (Market, Limit, Stop, Stop-Limit), order attributes, modifiers, lifecycle (submission to execution/cancellation), and execution rules.


| | |
|---|---|
| **Feature** | `order-types-attributes-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | order-management, order-types, order-lifecycle, execution-rules, price-time-priority |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/order-types-attributes-management.blueprint.yaml) |
| **JSON API** | [order-types-attributes-management.json]({{ site.baseurl }}/api/blueprints/trading/order-types-attributes-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `trader` | Trader | human |  |
| `trading_member` | Trading Member | human |  |
| `order_book_engine` | Order Book Engine | system |  |
| `market_operations` | Market Operations | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `order_type` | select | Yes | Order Type |  |
| `side` | select | Yes | Side |  |
| `quantity` | number | Yes | Quantity |  |
| `limit_price` | number | No | Limit Price |  |
| `stop_price` | number | No | Stop Price |  |
| `time_in_force` | select | Yes | Time-In-Force |  |
| `order_validity_date` | date | No | Validity Date |  |
| `iceberg_visible_quantity` | number | No | Iceberg Visible Quantity |  |
| `all_or_none` | boolean | No | All-Or-None |  |
| `minimum_execution_quantity` | number | No | Minimum Execution Quantity |  |
| `order_status` | select | No | Order Status |  |
| `filled_quantity` | number | No | Filled Quantity |  |
| `average_fill_price` | number | No | Average Fill Price |  |
| `order_submission_time` | datetime | No | Submission Time |  |
| `order_acceptance_time` | datetime | No | Acceptance Time |  |

## Rules

- **order_submission:**
  - **trader_authorization_required:** Trader must be authorized by trading member before submitting
  - **order_format_validation:** All orders validated for correct format, required fields, value ranges
  - **member_pre_validation:** Trading member system may pre-validate orders before market submission
  - **duplicate_order_allowed:** Duplicate orders permitted; exchange does not detect or prevent
- **order_types:**
  - **market_order_fills_immediately:** Market order matches against best available; no price guarantee
  - **limit_order_waits_for_price:** Limit order waits in book until matching price available
  - **stop_order_inactive_until_triggered:** Stop order inactive until reference price triggers
  - **stop_limit_combines_stops_and_limits:** Stop-Limit order becomes Limit when stop triggered
  - **iceberg_reveals_progressively:** Iceberg order reveals disclosed quantity progressively
- **execution_rules:**
  - **price_time_priority:** Orders matched by best price, then by time of submission
  - **no_price_improvement:** Orders match at posted price; no price improvement beyond book
  - **partial_execution_allowed:** Orders may execute partially over multiple trades
  - **execution_as_available:** Execution occurs only if matching quantity available
- **time_in_force:**
  - **day_expires_at_session_close:** Day orders automatically cancelled at session end
  - **ioc_cancels_unmatched_immediately:** IOC orders cancel unfilled portion immediately
  - **fok_all_or_nothing:** FOK orders reject if full quantity cannot match immediately
  - **gtc_persists_until_cancelled:** GTC orders persist until explicitly cancelled
  - **gtc_default_one_month:** GTC orders default to 30-day validity if not specified
- **order_attributes:**
  - **aon_prevents_partial_fills:** All-Or-None orders reject if full quantity not available
  - **meo_minimum_threshold:** Minimum Execution Quantity orders reject unless minimum filled
  - **iceberg_not_shown_to_market:** Iceberg hidden quantity not visible in order book depth
  - **disclosed_quantity_required:** Iceberg orders must specify disclosed quantity greater than zero
- **order_lifecycle:**
  - **rejected_orders_not_in_book:** Rejected orders do not enter order book
  - **cancelled_orders_removed_from_book:** Cancelled orders immediately removed from book
  - **pending_orders_queued_for_acceptance:** Pending orders queued; not yet in live order book
  - **filled_orders_removed_from_book:** Fully executed orders automatically removed from book
- **amendments_and_cancellations:**
  - **amendment_not_supported:** Orders may not be amended; must cancel and resubmit
  - **cancellation_anytime_before_execution:** Orders may be cancelled before execution
  - **cancellation_immediate_effect:** Order cancellations take immediate effect
  - **cancel_reject_not_allowed:** Cancellation requests must succeed atomically

## Outcomes

### Order_submitted (Priority: 1) — Error: `ORDER_SUBMISSION_FAILED`

_Trader submits valid order to exchange_

**Given:**
- `order_type` (input) exists
- `trader_authorized` (db) eq `true`
- `quantity` (input) gt `0`

**Then:**
- **create_record** target: `orders`
- **emit_event** event: `order.submitted`

### Order_accepted (Priority: 2) — Error: `ORDER_ACCEPTANCE_FAILED`

_Order passes validation and enters order book_

**Given:**
- `order_valid` (system) eq `true`
- `session_state` (db) eq `open`

**Then:**
- **set_field** target: `order_status` value: `active`
- **set_field** target: `order_acceptance_time` value: `current_timestamp`
- **emit_event** event: `order.accepted`

### Market_order_executed (Priority: 3) — Error: `MARKET_ORDER_REJECTED`

_Market order immediately matched against best available orders_

**Given:**
- `order_type` (db) eq `market`
- `matching_quantity` (system) gte `order_quantity`

**Then:**
- **create_record** target: `trades`
- **set_field** target: `order_status` value: `filled`
- **set_field** target: `filled_quantity` value: `order_quantity`
- **emit_event** event: `order.filled`

### Limit_order_queued (Priority: 4) — Error: `LIMIT_ORDER_REJECTED`

_Limit order placed in book awaiting matching price_

**Given:**
- `order_type` (db) eq `limit`
- `limit_price` (input) exists

**Then:**
- **emit_event** event: `order.queued`

### Limit_order_partially_filled (Priority: 5) — Error: `PARTIAL_FILL_FAILED`

_Limit order executes against multiple trades_

**Given:**
- `order_type` (db) eq `limit`
- `matching_quantity` (system) gt `0`
- `matching_quantity` (system) lt `remaining_quantity`

**Then:**
- **set_field** target: `filled_quantity` value: `filled_quantity + matching_quantity`
- **emit_event** event: `order.partially_filled`

### Stop_order_triggered (Priority: 6) — Error: `STOP_ORDER_TRIGGER_FAILED`

_Stop order activated when reference price reaches stop price_

**Given:**
- `order_type` (db) eq `stop`
- `reference_price` (system) exists

**Then:**
- **transition_state** field: `order_status` from: `pending` to: `active`
- **emit_event** event: `order.triggered`

### Stop_limit_order_activated (Priority: 7) — Error: `STOP_LIMIT_ACTIVATION_FAILED`

_Stop-Limit order becomes limit order when stop price triggered_

**Given:**
- `order_type` (db) eq `stop_limit`
- `reference_price` (system) exists

**Then:**
- **transition_state** field: `order_status` from: `pending` to: `active`
- **emit_event** event: `order.activated_as_limit`

### Iceberg_order_refreshed (Priority: 8) — Error: `ICEBERG_REFRESH_FAILED`

_Iceberg order reveals next batch when displayed quantity filled_

**Given:**
- `order_type` (db) eq `iceberg`
- `disclosed_quantity_filled` (system) eq `true`
- `remaining_hidden_quantity` (system) gt `0`

**Then:**
- **emit_event** event: `order.batch_revealed`

### Order_cancelled (Priority: 9) — Error: `CANCELLATION_FAILED`

_Trader or trading member cancels open order_

**Given:**
- ANY: `order_status` (db) eq `pending` OR `order_status` (db) eq `active` OR `order_status` (db) eq `partially_filled`
- `cancellation_request` (input) exists

**Then:**
- **transition_state** field: `order_status` from: `active` to: `cancelled`
- **emit_event** event: `order.cancelled`

### Order_expired (Priority: 10) — Error: `EXPIRATION_FAILED`

_GTC order reaches expiration date and is automatically removed_

**Given:**
- `time_in_force` (db) eq `gtc`
- `expiration_date` (db) exists
- `current_date` (system) gt `expiration_date`

**Then:**
- **transition_state** field: `order_status` from: `active` to: `cancelled`
- **emit_event** event: `order.expired`

### Day_order_cancelled_at_close (Priority: 11) — Error: `DAY_ORDER_CANCELLATION_FAILED`

_Day orders automatically cancelled at trading session end_

**Given:**
- `time_in_force` (db) eq `day`
- `session_state` (system) eq `closed`
- ANY: `order_status` (db) eq `pending` OR `order_status` (db) eq `active` OR `order_status` (db) eq `partially_filled`

**Then:**
- **transition_state** field: `order_status` from: `active` to: `cancelled`
- **emit_event** event: `order.cancelled`

### Ioc_order_cancelled (Priority: 12) — Error: `IOC_CANCELLATION_FAILED`

_IOC order cancels unfilled portion immediately after matching_

**Given:**
- `time_in_force` (db) eq `ioc`
- `matching_complete` (system) eq `true`

**Then:**
- **emit_event** event: `order.cancelled`

### Fok_order_rejected (Priority: 13) — Error: `FOK_REJECTION_FAILED`

_FOK order rejected if full quantity not immediately available_

**Given:**
- `time_in_force` (db) eq `fok`
- `matching_quantity` (system) lt `order_quantity`

**Then:**
- **set_field** target: `order_status` value: `rejected`
- **emit_event** event: `order.rejected`

### Aon_order_rejected (Priority: 14) — Error: `AON_REJECTION_FAILED`

_All-Or-None order rejected if full quantity not available_

**Given:**
- `all_or_none` (db) eq `true`
- `matching_quantity` (system) lt `order_quantity`

**Then:**
- **set_field** target: `order_status` value: `rejected`
- **emit_event** event: `order.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ORDER_SUBMISSION_FAILED` | 422 | Order submission failed validation; check order type, quantity, and prices | No |
| `ORDER_ACCEPTANCE_FAILED` | 503 | Order book system unavailable; order could not be accepted | No |
| `MARKET_ORDER_REJECTED` | 422 | Market order rejected; insufficient matching quantity available | No |
| `LIMIT_ORDER_REJECTED` | 422 | Limit order rejected; limit price outside acceptable range | No |
| `PARTIAL_FILL_FAILED` | 500 | Partial fill processing error; please contact market operations | No |
| `STOP_ORDER_TRIGGER_FAILED` | 500 | Stop order trigger system error; order may not activate as expected | No |
| `STOP_LIMIT_ACTIVATION_FAILED` | 500 | Stop-Limit order activation failed; order not converted to limit order | No |
| `ICEBERG_REFRESH_FAILED` | 500 | Iceberg order batch reveal failed; next quantity not displayed | No |
| `CANCELLATION_FAILED` | 500 | Order cancellation could not be processed; please try again | No |
| `EXPIRATION_FAILED` | 500 | GTC order expiration processing failed | No |
| `DAY_ORDER_CANCELLATION_FAILED` | 500 | Day order end-of-session cancellation failed | No |
| `IOC_CANCELLATION_FAILED` | 500 | IOC order immediate cancellation failed | No |
| `FOK_REJECTION_FAILED` | 500 | FOK order all-or-nothing check failed | No |
| `AON_REJECTION_FAILED` | 500 | All-Or-None order validation failed | No |
| `TRADER_NOT_AUTHORIZED` | 403 | Trader not authorized to submit orders | No |
| `INVALID_ORDER_TYPE` | 400 | Order type not recognized; use Market, Limit, Stop, Stop-Limit, or Iceberg | No |
| `INVALID_TIME_IN_FORCE` | 400 | Time-In-Force not recognized; use Day, IOC, FOK, or GTC | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.submitted` |  | `order_id`, `trader_id`, `security_code`, `quantity`, `order_type`, `limit_price`, `stop_price`, `time_in_force` |
| `order.accepted` |  | `order_id`, `order_acceptance_time`, `queue_position`, `security_code` |
| `order.queued` |  | `order_id`, `limit_price`, `position_in_queue`, `time_in_queue` |
| `order.triggered` |  | `order_id`, `trigger_price`, `activated_as_market_order`, `trigger_time` |
| `order.activated_as_limit` |  | `order_id`, `stop_price`, `limit_price`, `activation_time` |
| `order.batch_revealed` |  | `order_id`, `new_displayed_quantity`, `remaining_hidden_quantity` |
| `order.filled` |  | `order_id`, `execution_price`, `filled_quantity`, `execution_time`, `average_fill_price` |
| `order.partially_filled` |  | `order_id`, `filled_quantity`, `remaining_quantity`, `execution_price`, `partial_fill_time` |
| `order.cancelled` |  | `order_id`, `cancelled_quantity`, `cancellation_time`, `cancellation_reason`, `user_id` |
| `order.expired` |  | `order_id`, `expiration_date`, `remaining_quantity`, `expiration_time` |
| `order.rejected` |  | `order_id`, `rejection_reason`, `rejected_time`, `detail_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| equity-market-trading-overview | required |  |
| popia-compliance | required |  |
| trading-surveillance | recommended |  |
| member-risk-management | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
order_types:
  market: Immediate execution at best available market price
  limit: Execution only at specified price or better
  stop: Inactive until price reaches stop; then executes as market
  stop_limit: Inactive until stop price reached; then becomes limit
  iceberg: Large order displayed in batches; hidden quantity revealed progressively
time_in_force_options:
  day: Valid only during current session; auto-cancelled at close
  ioc: "Immediate-Or-Cancel: executes immediately or cancels unfilled"
  fok: "Fill-Or-Kill: entire order must fill immediately or entire order rejected"
  gtc: "Good-Till-Cancel: persists until cancelled or reaches expiration"
order_attributes:
  all_or_none: Order can only execute if entire quantity fills
  minimum_execution_quantity: Order only executes if minimum quantity can be filled
  iceberg: Hidden order revealed in disclosed batches as trades execute
  reserve: Disclosed quantity displayed; additional hidden reserve
order_statuses:
  pending: Order submitted; awaiting acceptance
  active: Order in order book; eligible for matching
  partially_filled: Order partially executed; remainder waiting
  filled: Order completely executed
  cancelled: Order cancelled; no further matching
  rejected: Order rejected; never entered order book
  expired: GTC order reached expiration date
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Order Types Attributes Management Blueprint",
  "description": "Equity market order types (Market, Limit, Stop, Stop-Limit), order attributes, modifiers, lifecycle (submission to execution/cancellation), and execution rules.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "order-management, order-types, order-lifecycle, execution-rules, price-time-priority"
}
</script>
