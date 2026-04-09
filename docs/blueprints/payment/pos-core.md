---
title: "Pos Core Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration. . 24"
---

# Pos Core Blueprint

> Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.


| | |
|---|---|
| **Feature** | `pos-core` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | point-of-sale, retail, cash-register, receipt, session-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/pos-core.blueprint.yaml) |
| **JSON API** | [pos-core.json]({{ site.baseurl }}/api/blueprints/payment/pos-core.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `cashier` | Cashier | human | Operates the POS terminal, processes sales, handles payments |
| `manager` | Store Manager | human | Opens/closes sessions, handles overrides, reviews reports |
| `customer` | Customer | human | Purchases products and receives receipts |
| `accounting_system` | Accounting System | system | Receives journal entries from closed sessions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `session_id` | text | Yes | Session ID |  |
| `session_state` | select | Yes | Session State |  |
| `opening_balance` | number | No | Opening Cash Balance |  |
| `closing_balance_expected` | number | No | Expected Closing Balance |  |
| `closing_balance_actual` | number | No | Actual Closing Balance |  |
| `cash_difference` | number | No | Cash Difference |  |
| `order_reference` | text | Yes | Order Reference |  |
| `order_state` | select | Yes | Order State |  |
| `order_lines` | json | Yes | Order Lines |  |
| `customer_id` | text | No | Customer |  |
| `is_refund` | boolean | No | Is Refund |  |
| `amount_total` | number | Yes | Total Amount |  |
| `amount_tax` | number | Yes | Tax Amount |  |
| `amount_paid` | number | Yes | Amount Paid |  |
| `amount_return` | number | No | Change Given |  |
| `payment_method` | select | Yes | Payment Method |  |
| `payment_amount` | number | Yes | Payment Amount |  |
| `payment_reference` | text | No | Payment Reference |  |
| `product_id` | text | Yes | Product |  |
| `quantity` | number | Yes | Quantity | Validations: min, max |
| `unit_price` | number | Yes | Unit Price |  |
| `discount_percent` | number | No | Discount % | Validations: min, max |
| `line_tax_ids` | json | No | Applicable Taxes |  |
| `line_total_incl` | number | Yes | Line Total (Tax Included) |  |

## States

**State field:** `session_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `opening_control` | Yes |  |
| `opened` |  |  |
| `closing_control` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `opening_control` | `opened` | cashier |  |
|  | `opened` | `closing_control` | cashier | All orders must be paid or cancelled |
|  | `closing_control` | `closed` | cashier |  |

## Rules

- **one_session_per_register:**
  - **description:** Only one active session allowed per POS configuration at a time
- **session_before_lock_date:**
  - **description:** Cannot open a session with a start date before the company accounting lock date
- **no_draft_orders_at_close:**
  - **description:** All orders must be in paid or cancelled state before a session can close
- **all_invoices_posted:**
  - **description:** All generated invoices must be posted before session can close
- **order_requires_session:**
  - **description:** An order can only be created within an active (opened) session
- **payment_fully_covers_total:**
  - **description:** Order can only transition to paid when total payments equal the order total (within cash rounding tolerance if enabled)

- **cash_rounding_tolerance:**
  - **description:** When cash rounding is enabled, payment difference must be within half the rounding increment (e.g., 0.025 for 0.05 rounding)

- **return_requires_cash_method:**
  - **description:** Cash change can only be given if a cash payment method is configured
- **payment_method_must_be_configured:**
  - **description:** Payment method used must be one of the methods enabled in the POS configuration
- **refund_same_order_only:**
  - **description:** A refund can only reference lines from a single original order
- **cannot_edit_paid_order:**
  - **description:** Once an order is paid, its lines and payments cannot be modified
- **cash_variance_accounts_required:**
  - **description:** If cash difference exists at closing, profit and loss accounts must be configured on the cash journal to record the variance


## Outcomes

### Session_opened (Priority: 1)

**Given:**
- manager or cashier initiates a new session
- no other session is active for this POS configuration
- `session_start_date` (system) gte `accounting_lock_date`

**Then:**
- **transition_state** field: `session_state` from: `opening_control` to: `opened`
- **set_field** target: `opening_balance` value: `previous_session_closing_balance` — Opening balance defaults to prior session's closing count
- **emit_event** event: `pos.session.opened`

**Result:** POS is ready to accept orders

### Session_close_blocked_draft_orders (Priority: 1) — Error: `POS_DRAFT_ORDERS_EXIST`

**Given:**
- cashier attempts to close the session
- one or more orders are still in draft state

**Then:**
- **notify** — Display list of draft orders that must be paid or cancelled

**Result:** Session remains open until all draft orders are resolved

### No_active_session (Priority: 1) — Error: `POS_NO_ACTIVE_SESSION`

**Given:**
- an order is submitted but no session is open for this POS

**Then:**
- **notify** — Prompt to open a new session

**Result:** Order cannot be processed until a session is opened

### Order_completed (Priority: 2)

**Given:**
- cashier scans or selects products and adds them to the order
- customer provides payment equal to or exceeding the order total

**Then:**
- **set_field** target: `amount_paid` value: `sum_of_payments`
- **set_field** target: `amount_return` value: `overpayment_amount` — Change given back for cash overpayment
- **transition_state** field: `order_state` from: `draft` to: `paid`
- **emit_event** event: `pos.order.paid`

**Result:** Order is marked as paid, receipt can be printed

### Payment_insufficient (Priority: 2) — Error: `POS_PAYMENT_INSUFFICIENT`

**Given:**
- cashier attempts to validate the order
- `amount_paid` (computed) lt `amount_total`

**Then:**
- **notify** — Show how much more payment is needed

**Result:** Order stays in draft, cashier must collect remaining payment

### Order_invoiced (Priority: 3)

**Given:**
- order is in paid state
- invoice generation is requested (customer needs formal invoice)
- invoice journal is configured in POS settings

**Then:**
- **create_record** target: `invoice` — Customer invoice or credit note created from the order
- **transition_state** field: `order_state` from: `paid` to: `done`
- **emit_event** event: `pos.order.invoiced`

**Result:** Invoice created and linked to the order

### Refund_processed (Priority: 4)

**Given:**
- cashier selects a previous paid or done order to refund
- an active session exists

**Then:**
- **create_record** target: `refund_order` — New order created with negative quantities referencing original lines
- **set_field** target: `is_refund` value: `true`
- **emit_event** event: `pos.order.refunded`

**Result:** Refund order created with negative amounts; payment processed back to customer

### Session_closed (Priority: 5)

**Given:**
- all orders are paid or cancelled
- all invoices are posted
- cashier has entered actual cash count

**Then:**
- **transition_state** field: `session_state` from: `closing_control` to: `closed`
- **create_record** target: `journal_entry` — Accounting journal entry created for all session transactions
- **emit_event** event: `pos.session.closed`

**Result:** Session finalized, all transactions posted to accounting

### Order_cancelled (Priority: 6)

**Given:**
- order is in draft state
- cashier cancels the order

**Then:**
- **transition_state** field: `order_state` from: `draft` to: `cancel`
- **emit_event** event: `pos.order.cancelled`

**Result:** Order is cancelled and excluded from session reporting

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POS_NO_ACTIVE_SESSION` | 400 | No active session found. Please open a new session to process orders. | No |
| `POS_PAYMENT_INSUFFICIENT` | 400 | The order is not fully paid. Please collect the remaining amount. | No |
| `POS_DRAFT_ORDERS_EXIST` | 400 | Cannot close session while draft orders exist. Please pay or cancel all pending orders. | No |
| `POS_DUPLICATE_SESSION` | 409 | Another session is already open for this register. | No |
| `POS_CANNOT_EDIT_PAID` | 403 | This order has already been paid and cannot be modified. | No |
| `POS_NO_CASH_METHOD` | 400 | No cash payment method configured. Unable to process cash change. | No |
| `POS_INVALID_PAYMENT_METHOD` | 400 | The selected payment method is not enabled for this register. | No |
| `POS_REFUND_MULTI_ORDER` | 400 | A refund can only include lines from a single original order. | No |
| `POS_CASH_VARIANCE_NO_ACCOUNT` | 500 | Cash variance detected but no profit/loss account is configured on the cash journal. | No |
| `POS_SESSION_BEFORE_LOCK` | 400 | Cannot open a session before the accounting lock date. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pos.session.opened` | Fired when a POS session is opened and ready for orders | `session_id`, `cashier_id`, `opening_balance` |
| `pos.session.closed` | Fired when a session is finalized and posted to accounting | `session_id`, `cash_difference`, `total_sales`, `total_returns` |
| `pos.order.paid` | Fired when an order is fully paid | `order_reference`, `amount_total`, `payment_method`, `customer_id` |
| `pos.order.invoiced` | Fired when an invoice is generated from a POS order | `order_reference`, `invoice_id`, `customer_id` |
| `pos.order.refunded` | Fired when a refund is processed against a previous order | `refund_order_reference`, `original_order_reference`, `refund_amount` |
| `pos.order.cancelled` | Fired when a draft order is cancelled | `order_reference` |
| `pos.order.synced` | Fired when order data is synchronized between terminals | `order_reference`, `session_id`, `device_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| self-order-kiosk | optional | Customer-facing self-ordering extends POS order creation |
| loyalty-coupons | optional | Loyalty programs apply rewards and discounts to POS orders |
| invoicing-payments | required | POS session closing posts journal entries to the accounting system |
| tax-engine | required | Tax computation applied to every order line |

## AGI Readiness

### Goals

#### Reliable Pos Core

Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.


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

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `invoicing_payments` | invoicing-payments | fail |
| `tax_engine` | tax-engine | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| session_opened | `autonomous` | - | - |
| order_completed | `autonomous` | - | - |
| order_invoiced | `autonomous` | - | - |
| refund_processed | `autonomous` | - | - |
| session_closed | `autonomous` | - | - |
| session_close_blocked_draft_orders | `human_required` | - | - |
| payment_insufficient | `autonomous` | - | - |
| no_active_session | `autonomous` | - | - |
| order_cancelled | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 45
  entry_points:
    - addons/point_of_sale/models/pos_order.py
    - addons/point_of_sale/models/pos_session.py
    - addons/point_of_sale/models/pos_config.py
    - addons/point_of_sale/models/pos_payment.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pos Core Blueprint",
  "description": "Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.\n. 24",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "point-of-sale, retail, cash-register, receipt, session-management"
}
</script>
