<!-- AUTO-GENERATED FROM self-order-kiosk.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Self Order Kiosk

> Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time order status updates.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** self-service · kiosk · qr-code · mobile-ordering · restaurant

## What this does

Customer self-ordering system supporting kiosk terminals and mobile QR-code ordering, with menu browsing, cart management, payment processing, and real-time order status updates.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **ordering_mode** *(select, required)* — Ordering Mode
- **service_mode** *(select, required)* — Service Mode
- **pay_after** *(select, required)* — Payment Timing
- **table_identifier** *(text, optional)* — Table Identifier
- **order_source** *(select, required)* — Order Source
- **customer_name** *(text, optional)* — Customer Name
- **customer_email** *(email, optional)* — Customer Email
- **customer_phone** *(phone, optional)* — Customer Phone
- **selected_language** *(select, optional)* — Display Language
- **cart_items** *(json, required)* — Cart Items
- **cart_total** *(number, required)* — Cart Total
- **customer_note** *(text, optional)* — Special Instructions
- **preset_type** *(select, optional)* — Service Preset
- **access_token** *(token, required)* — Access Token
- **order_access_token** *(token, required)* — Order Access Token

## What must be true

- **kiosk_no_cash:** Kiosk mode only allows card and digital payment methods — no cash
- **mobile_table_requires_identifier:** Mobile ordering with table service requires a valid table identifier from QR code
- **pay_each_for_counter:** Counter service mode forces immediate payment per order
- **pay_meal_requires_table:** Pay-after-meal option only available with table service mode
- **category_operating_hours:** Product categories can have operating hour restrictions (e.g., lunch menu 11:00-14:00). Products outside their category's hours are hidden.
- **overnight_hours_support:** Operating hours where start > end (e.g., 22:00-02:00) are treated as overnight and span across midnight.
- **product_must_be_self_order_enabled:** Only products explicitly marked as available for self-ordering are shown
- **server_side_price_recomputation:** All prices are recomputed server-side on order submission — frontend prices are display-only and cannot be manipulated.
- **active_session_required:** Self-ordering is only available when a POS session is active
- **constant_time_token_check:** Access tokens are compared using constant-time comparison to prevent timing attacks
- **kiosk_inactivity_timeout:** Kiosk resets to landing page after 30 seconds of inactivity on confirmation screen

## Success & failure scenarios

**✅ Success paths**

- **Kiosk Order With Payment** — when customer uses kiosk terminal to select products; customer initiates payment via card or digital method; payment is processed successfully, then Order confirmed, receipt printed, kiosk resets after timeout.
- **Item Unavailable During Browse** — when customer has items in cart; one or more items become unavailable (out of stock or outside operating hours), then Customer sees which items were removed and can adjust their order.
- **Order Cancelled By Customer** — when customer decides to cancel before payment; order is still in draft state, then Order removed, customer returns to landing page.

**❌ Failure paths**

- **Mobile Order Placed** — when customer scans table QR code containing table identifier and access token; an active POS session exists; customer selects products from the available menu, then Order appears on POS terminal and is sent to kitchen. *(error: `SELF_ORDER_ORDER_NOT_FOUND`)*
- **Session Closed During Ordering** — when POS operator closes the session while customers are ordering, then Customer cannot submit orders until a new session opens. *(error: `SELF_ORDER_SESSION_CLOSED`)*
- **Invalid Access Token** — when request contains an invalid or expired access token, then Request rejected, no order data exposed. *(error: `SELF_ORDER_UNAUTHORIZED`)*
- **Payment Failed** — when customer initiates payment on kiosk; payment provider returns failure, then Customer can retry payment or cancel the order. *(error: `SELF_ORDER_PAYMENT_FAILED`)*

## Errors it can return

- `SELF_ORDER_SESSION_CLOSED` — We're currently closed. Please try again later.
- `SELF_ORDER_UNAUTHORIZED` — Unauthorized access. Please scan the QR code again.
- `SELF_ORDER_PAYMENT_FAILED` — Payment could not be processed. Please try again or use a different method.
- `SELF_ORDER_TABLE_NOT_FOUND` — Table not found. Please scan the QR code at your table.
- `SELF_ORDER_ORDER_NOT_FOUND` — Your order does not exist or has been removed.
- `SELF_ORDER_PRODUCT_UNAVAILABLE` — One or more selected products are no longer available.

## Connects to

- **pos-core** *(required)* — Self-orders create POS orders within an active session
- **loyalty-coupons** *(optional)* — Customers can apply loyalty rewards during self-ordering

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

📈 **+1** since baseline (78 → 79)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/self-order-kiosk/) · **Spec source:** [`self-order-kiosk.blueprint.yaml`](./self-order-kiosk.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
