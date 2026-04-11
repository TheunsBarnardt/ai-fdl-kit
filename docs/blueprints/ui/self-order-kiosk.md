---
title: "Self Order Kiosk Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time ord"
---

# Self Order Kiosk Blueprint

> Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time order status updates.


| | |
|---|---|
| **Feature** | `self-order-kiosk` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | self-service, kiosk, qr-code, mobile-ordering, restaurant |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/self-order-kiosk.blueprint.yaml) |
| **JSON API** | [self-order-kiosk.json]({{ site.baseurl }}/api/blueprints/ui/self-order-kiosk.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Browses menu, places order, and pays via kiosk or mobile device |
| `kitchen` | Kitchen Staff | human | Receives and prepares ordered items |
| `pos_operator` | POS Operator | human | Manages configuration, monitors orders, marks items ready |
| `system` | Order System | system | Validates orders, processes payments, sends notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ordering_mode` | select | Yes | Ordering Mode |  |
| `service_mode` | select | Yes | Service Mode |  |
| `pay_after` | select | Yes | Payment Timing |  |
| `table_identifier` | text | No | Table Identifier |  |
| `order_source` | select | Yes | Order Source |  |
| `customer_name` | text | No | Customer Name |  |
| `customer_email` | email | No | Customer Email |  |
| `customer_phone` | phone | No | Customer Phone |  |
| `selected_language` | select | No | Display Language |  |
| `cart_items` | json | Yes | Cart Items |  |
| `cart_total` | number | Yes | Cart Total |  |
| `customer_note` | text | No | Special Instructions |  |
| `preset_type` | select | No | Service Preset |  |
| `access_token` | token | Yes | Access Token |  |
| `order_access_token` | token | Yes | Order Access Token |  |

## States

**State field:** `order_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `browsing` | Yes |  |
| `cart_review` |  |  |
| `payment_pending` |  |  |
| `confirmed` |  |  |
| `preparing` |  |  |
| `ready` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `browsing` | `cart_review` | customer |  |
|  | `cart_review` | `browsing` | customer |  |
|  | `cart_review` | `payment_pending` | customer |  |
|  | `payment_pending` | `confirmed` | system |  |
|  | `confirmed` | `preparing` | kitchen |  |
|  | `preparing` | `ready` | kitchen |  |
|  | `cart_review` | `cancelled` | customer | Order must still be in draft (unpaid) state |

## Rules

- **kiosk_no_cash:**
  - **description:** Kiosk mode only allows card and digital payment methods — no cash
- **mobile_table_requires_identifier:**
  - **description:** Mobile ordering with table service requires a valid table identifier from QR code
- **pay_each_for_counter:**
  - **description:** Counter service mode forces immediate payment per order
- **pay_meal_requires_table:**
  - **description:** Pay-after-meal option only available with table service mode
- **category_operating_hours:**
  - **description:** Product categories can have operating hour restrictions (e.g., lunch menu 11:00-14:00). Products outside their category's hours are hidden.

- **overnight_hours_support:**
  - **description:** Operating hours where start > end (e.g., 22:00-02:00) are treated as overnight and span across midnight.

- **product_must_be_self_order_enabled:**
  - **description:** Only products explicitly marked as available for self-ordering are shown
- **server_side_price_recomputation:**
  - **description:** All prices are recomputed server-side on order submission — frontend prices are display-only and cannot be manipulated.

- **active_session_required:**
  - **description:** Self-ordering is only available when a POS session is active
- **constant_time_token_check:**
  - **description:** Access tokens are compared using constant-time comparison to prevent timing attacks
- **kiosk_inactivity_timeout:**
  - **description:** Kiosk resets to landing page after 30 seconds of inactivity on confirmation screen

## Outcomes

### Mobile_order_placed (Priority: 1) — Error: `SELF_ORDER_ORDER_NOT_FOUND`

**Given:**
- customer scans table QR code containing table identifier and access token
- an active POS session exists
- customer selects products from the available menu

**Then:**
- **create_record** target: `order` — Order created in draft state linked to the table
- **emit_event** event: `self_order.order.submitted`
- **notify** — POS operator notified of new order

**Result:** Order appears on POS terminal and is sent to kitchen

### Session_closed_during_ordering (Priority: 1) — Error: `SELF_ORDER_SESSION_CLOSED`

**Given:**
- POS operator closes the session while customers are ordering

**Then:**
- **notify** — Display closed message, disable ordering

**Result:** Customer cannot submit orders until a new session opens

### Invalid_access_token (Priority: 1) — Error: `SELF_ORDER_UNAUTHORIZED`

**Given:**
- request contains an invalid or expired access token

**Then:**
- **notify** — Generic unauthorized error displayed

**Result:** Request rejected, no order data exposed

### Kiosk_order_with_payment (Priority: 2)

**Given:**
- customer uses kiosk terminal to select products
- customer initiates payment via card or digital method
- payment is processed successfully

**Then:**
- **transition_state** field: `order_status` from: `payment_pending` to: `confirmed`
- **emit_event** event: `self_order.payment.completed`
- **notify** — Kitchen receives the confirmed order

**Result:** Order confirmed, receipt printed, kiosk resets after timeout

### Payment_failed (Priority: 2) — Error: `SELF_ORDER_PAYMENT_FAILED`

**Given:**
- customer initiates payment on kiosk
- payment provider returns failure

**Then:**
- **notify** — Payment error shown with retry option

**Result:** Customer can retry payment or cancel the order

### Item_unavailable_during_browse (Priority: 3)

**Given:**
- customer has items in cart
- one or more items become unavailable (out of stock or outside operating hours)

**Then:**
- **notify** — Show dialog listing removed items
- **set_field** target: `cart_items` — Unavailable items removed from cart

**Result:** Customer sees which items were removed and can adjust their order

### Order_cancelled_by_customer (Priority: 4)

**Given:**
- customer decides to cancel before payment
- order is still in draft state

**Then:**
- **transition_state** field: `order_status` from: `cart_review` to: `cancelled`
- **emit_event** event: `self_order.order.cancelled`

**Result:** Order removed, customer returns to landing page

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SELF_ORDER_SESSION_CLOSED` | 500 | We're currently closed. Please try again later. | No |
| `SELF_ORDER_UNAUTHORIZED` | 401 | Unauthorized access. Please scan the QR code again. | No |
| `SELF_ORDER_PAYMENT_FAILED` | 400 | Payment could not be processed. Please try again or use a different method. | No |
| `SELF_ORDER_TABLE_NOT_FOUND` | 404 | Table not found. Please scan the QR code at your table. | No |
| `SELF_ORDER_ORDER_NOT_FOUND` | 404 | Your order does not exist or has been removed. | No |
| `SELF_ORDER_PRODUCT_UNAVAILABLE` | 400 | One or more selected products are no longer available. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `self_order.order.submitted` | Customer submitted an order from mobile or kiosk | `order_id`, `table_id`, `order_source`, `cart_items` |
| `self_order.payment.completed` | Payment successfully processed for a self-order | `order_id`, `payment_method`, `amount` |
| `self_order.order.cancelled` | Customer cancelled their self-order | `order_id`, `order_source` |
| `self_order.order.ready` | Kitchen marks the order as ready for pickup/delivery | `order_id`, `table_id` |
| `self_order.product.unavailable` | A product became unavailable while customers are browsing | `product_id`, `reason` |
| `self_order.session.status_changed` | POS session status changed (opened/closed) affecting self-ordering availability | `session_id`, `new_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pos-core | required | Self-orders create POS orders within an active session |
| loyalty-coupons | optional | Customers can apply loyalty rewards during self-ordering |

## AGI Readiness

### Goals

#### Reliable Self Order Kiosk

Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time order status updates.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accessibility | aesthetics | UI must be usable by all users including those with disabilities |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `pos_core` | pos-core | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| mobile_order_placed | `autonomous` | - | - |
| kiosk_order_with_payment | `autonomous` | - | - |
| item_unavailable_during_browse | `autonomous` | - | - |
| order_cancelled_by_customer | `supervised` | - | - |
| session_closed_during_ordering | `autonomous` | - | - |
| invalid_access_token | `autonomous` | - | - |
| payment_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 30
  entry_points:
    - addons/pos_self_order/controllers/orders.py
    - addons/pos_self_order/models/pos_config.py
    - addons/pos_self_order/models/pos_order.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Self Order Kiosk Blueprint",
  "description": "Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time ord",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "self-service, kiosk, qr-code, mobile-ordering, restaurant"
}
</script>
