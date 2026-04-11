<!-- AUTO-GENERATED FROM pos-core.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Pos Core

> Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** point-of-sale · retail · cash-register · receipt · session-management

## What this does

Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **session_id** *(text, required)* — Session ID
- **session_state** *(select, required)* — Session State
- **opening_balance** *(number, optional)* — Opening Cash Balance
- **closing_balance_expected** *(number, optional)* — Expected Closing Balance
- **closing_balance_actual** *(number, optional)* — Actual Closing Balance
- **cash_difference** *(number, optional)* — Cash Difference
- **order_reference** *(text, required)* — Order Reference
- **order_state** *(select, required)* — Order State
- **order_lines** *(json, required)* — Order Lines
- **customer_id** *(text, optional)* — Customer
- **is_refund** *(boolean, optional)* — Is Refund
- **amount_total** *(number, required)* — Total Amount
- **amount_tax** *(number, required)* — Tax Amount
- **amount_paid** *(number, required)* — Amount Paid
- **amount_return** *(number, optional)* — Change Given
- **payment_method** *(select, required)* — Payment Method
- **payment_amount** *(number, required)* — Payment Amount
- **payment_reference** *(text, optional)* — Payment Reference
- **product_id** *(text, required)* — Product
- **quantity** *(number, required)* — Quantity
- **unit_price** *(number, required)* — Unit Price
- **discount_percent** *(number, optional)* — Discount %
- **line_tax_ids** *(json, optional)* — Applicable Taxes
- **line_total_incl** *(number, required)* — Line Total (Tax Included)

## What must be true

- **one_session_per_register:** Only one active session allowed per POS configuration at a time
- **session_before_lock_date:** Cannot open a session with a start date before the company accounting lock date
- **no_draft_orders_at_close:** All orders must be in paid or cancelled state before a session can close
- **all_invoices_posted:** All generated invoices must be posted before session can close
- **order_requires_session:** An order can only be created within an active (opened) session
- **payment_fully_covers_total:** Order can only transition to paid when total payments equal the order total (within cash rounding tolerance if enabled)
- **cash_rounding_tolerance:** When cash rounding is enabled, payment difference must be within half the rounding increment (e.g., 0.025 for 0.05 rounding)
- **return_requires_cash_method:** Cash change can only be given if a cash payment method is configured
- **payment_method_must_be_configured:** Payment method used must be one of the methods enabled in the POS configuration
- **refund_same_order_only:** A refund can only reference lines from a single original order
- **cannot_edit_paid_order:** Once an order is paid, its lines and payments cannot be modified
- **cash_variance_accounts_required:** If cash difference exists at closing, profit and loss accounts must be configured on the cash journal to record the variance

## Success & failure scenarios

**✅ Success paths**

- **Session Opened** — when manager or cashier initiates a new session; no other session is active for this POS configuration; Session start date is after accounting lock date, then POS is ready to accept orders.
- **Order Completed** — when cashier scans or selects products and adds them to the order; customer provides payment equal to or exceeding the order total, then Order is marked as paid, receipt can be printed.
- **Order Invoiced** — when order is in paid state; invoice generation is requested (customer needs formal invoice); invoice journal is configured in POS settings, then Invoice created and linked to the order.
- **Refund Processed** — when cashier selects a previous paid or done order to refund; an active session exists, then Refund order created with negative amounts; payment processed back to customer.
- **Session Closed** — when all orders are paid or cancelled; all invoices are posted; cashier has entered actual cash count, then Session finalized, all transactions posted to accounting.
- **Order Cancelled** — when order is in draft state; cashier cancels the order, then Order is cancelled and excluded from session reporting.

**❌ Failure paths**

- **Session Close Blocked Draft Orders** — when cashier attempts to close the session; one or more orders are still in draft state, then Session remains open until all draft orders are resolved. *(error: `POS_DRAFT_ORDERS_EXIST`)*
- **No Active Session** — when an order is submitted but no session is open for this POS, then Order cannot be processed until a session is opened. *(error: `POS_NO_ACTIVE_SESSION`)*
- **Payment Insufficient** — when cashier attempts to validate the order; Total payments are less than the order total, then Order stays in draft, cashier must collect remaining payment. *(error: `POS_PAYMENT_INSUFFICIENT`)*

## Errors it can return

- `POS_NO_ACTIVE_SESSION` — No active session found. Please open a new session to process orders.
- `POS_PAYMENT_INSUFFICIENT` — The order is not fully paid. Please collect the remaining amount.
- `POS_DRAFT_ORDERS_EXIST` — Cannot close session while draft orders exist. Please pay or cancel all pending orders.
- `POS_DUPLICATE_SESSION` — Another session is already open for this register.
- `POS_CANNOT_EDIT_PAID` — This order has already been paid and cannot be modified.
- `POS_NO_CASH_METHOD` — No cash payment method configured. Unable to process cash change.
- `POS_INVALID_PAYMENT_METHOD` — The selected payment method is not enabled for this register.
- `POS_REFUND_MULTI_ORDER` — A refund can only include lines from a single original order.
- `POS_CASH_VARIANCE_NO_ACCOUNT` — Cash variance detected but no profit/loss account is configured on the cash journal.
- `POS_SESSION_BEFORE_LOCK` — Cannot open a session before the accounting lock date.

## Connects to

- **self-order-kiosk** *(optional)* — Customer-facing self-ordering extends POS order creation
- **loyalty-coupons** *(optional)* — Loyalty programs apply rewards and discounts to POS orders
- **invoicing-payments** *(required)* — POS session closing posts journal entries to the accounting system
- **tax-engine** *(required)* — Tax computation applied to every order line

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/pos-core/) · **Spec source:** [`pos-core.blueprint.yaml`](./pos-core.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
