---
title: "Cart Checkout Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement.. 15 fields. 10 outcomes. 6"
---

# Cart Checkout Blueprint

> Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement.

| | |
|---|---|
| **Feature** | `cart-checkout` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | cart, checkout, e-commerce, orders, stock-reservation, promo-codes |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/cart-checkout.blueprint.yaml) |
| **JSON API** | [cart-checkout.json]({{ site.baseurl }}/api/blueprints/payment/cart-checkout.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `cart_id` | text | Yes | Cart ID | Validations: pattern |
| `customer_id` | text | No | Customer ID |  |
| `items` | json | Yes | Cart Items |  |
| `subtotal` | number | Yes | Subtotal | Validations: min |
| `tax` | number | Yes | Tax Amount | Validations: min |
| `shipping_cost` | number | Yes | Shipping Cost | Validations: min |
| `discount` | number | No | Discount Amount | Validations: min |
| `total` | number | Yes | Order Total | Validations: min |
| `promo_code` | text | No | Promo Code |  |
| `checkout_step` | select | Yes | Checkout Step |  |
| `shipping_address` | json | No | Shipping Address |  |
| `billing_address` | json | No | Billing Address |  |
| `shipping_method` | text | No | Shipping Method |  |
| `payment_method_id` | text | No | Payment Method |  |
| `order_id` | text | No | Order ID |  |

## States

**State field:** `checkout_step`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `cart` | Yes |  |
| `address` |  |  |
| `shipping` |  |  |
| `payment` |  |  |
| `review` |  |  |
| `confirmed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `cart` | `address` | customer | Cart has at least one item and all items are in stock |
|  | `address` | `shipping` | customer | All required address fields populated |
|  | `shipping` | `payment` | customer | Valid shipping method selected for destination |
|  | `payment` | `review` | customer | Valid payment method provided |
|  | `review` | `confirmed` | customer | Payment authorized, stock confirmed |
|  | `address,shipping,payment,review` | `cart` | customer |  |

## Rules

- **stock_reservation:**
  - **description:** When an item is added to cart, inventory is soft-reserved for 15 minutes. Reservation refreshes on cart activity. If the cart is inactive for 15 minutes, reservations are released.

- **cart_expiry:**
  - **description:** Abandoned carts expire after 30 days. Guest carts expire after 7 days. Expiry releases all stock reservations.

- **guest_cart_merge:**
  - **description:** When a guest user logs in, their guest cart merges into their account cart. Duplicate items have quantities summed. Conflicts (e.g., stock limits) are resolved in favor of the newest item.

- **quantity_validation:**
  - **description:** Item quantity must be at least 1 and cannot exceed available stock. Attempting to add more than available stock shows the maximum available quantity.

- **total_calculation:**
  - **description:** Order total = subtotal + tax + shipping_cost - discount. Recalculated on every cart or checkout modification.

- **promo_code_validation:**
  - **description:** Promo codes are validated against active promotions. A code may be percentage-based or fixed-amount. Only one promo code per order. Invalid or expired codes return an error.

- **tax_calculation:**
  - **description:** Tax calculated based on shipping destination, product tax category, and applicable tax rules. Recalculated when address or items change.


## Outcomes

### Item_added_to_cart (Priority: 1)

**Given:**
- customer adds a product to cart
- product is in stock
- requested quantity is available

**Then:**
- **set_field** target: `items` — Product added to items array or quantity incremented
- **set_field** target: `subtotal` — Recalculated from item line totals
- **emit_event** event: `cart.item_added`

**Result:** Item added to cart, subtotal updated, stock reserved for 15 minutes

### Cart_empty (Priority: 1) — Error: `CART_EMPTY`

**Given:**
- customer attempts to checkout
- `items` not_exists

**Then:**
- **notify** — Inform customer that cart is empty

**Result:** Cannot proceed to checkout with an empty cart

### Item_removed_from_cart (Priority: 2)

**Given:**
- customer removes an item from cart
- item exists in cart

**Then:**
- **set_field** target: `items` — Item removed from items array
- **set_field** target: `subtotal` — Recalculated from remaining items
- **emit_event** event: `cart.item_removed`

**Result:** Item removed from cart, stock reservation released, totals recalculated

### Item_out_of_stock (Priority: 2) — Error: `CART_ITEM_OUT_OF_STOCK`

**Given:**
- customer adds an item to cart
- requested quantity exceeds available stock

**Then:**
- **notify** — Show available stock quantity

**Result:** Item cannot be added, insufficient stock

### Item_quantity_updated (Priority: 3)

**Given:**
- customer updates item quantity in cart
- new quantity is between 1 and available stock

**Then:**
- **set_field** target: `items` — Quantity updated for the specified item
- **set_field** target: `subtotal` — Recalculated with new quantity

**Result:** Cart item quantity updated, totals recalculated

### Promo_code_invalid (Priority: 3) — Error: `CART_PROMO_INVALID`

**Given:**
- customer enters a promo code
- code is invalid, expired, or already used

**Then:**
- **notify** — Inform customer the promo code is not valid

**Result:** Promo code rejected

### Promo_code_applied (Priority: 4)

**Given:**
- customer enters a promo code
- promo code is valid and active
- cart meets minimum requirements for the promotion

**Then:**
- **set_field** target: `promo_code` — Promo code stored on cart
- **set_field** target: `discount` — Discount calculated from promo rules
- **set_field** target: `total` — Recalculated with discount applied

**Result:** Promo code applied, discount reflected in order total

### Checkout_started (Priority: 5)

**Given:**
- customer proceeds from cart to checkout
- cart has at least one item

**Then:**
- **transition_state** field: `checkout_step` from: `cart` to: `address`
- **emit_event** event: `checkout.started`

**Result:** Checkout flow initiated, customer enters address step

### Order_placed (Priority: 6) | Transaction: atomic

**Given:**
- `checkout_step` eq `review`
- payment is authorized
- all items are in stock

**Then:**
- **transition_state** field: `checkout_step` from: `review` to: `confirmed`
- **create_record** target: `order` — Order record created from cart data
- **set_field** target: `order_id` — Generated order ID assigned
- **emit_event** event: `checkout.completed`
- **emit_event** event: `order.placed`

**Result:** Order placed, payment captured, stock committed, confirmation sent

### Guest_cart_merged (Priority: 7)

**Given:**
- guest user logs in
- guest cart has items
- user has an existing account cart

**Then:**
- **set_field** target: `items` — Guest items merged into account cart
- **set_field** target: `subtotal` — Recalculated from merged items

**Result:** Guest cart merged into account cart, duplicates consolidated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CART_EMPTY` | 400 | Your cart is empty. Add items before proceeding to checkout. | No |
| `CART_ITEM_OUT_OF_STOCK` | 409 | The requested quantity is not available. Please reduce the quantity or choose a different item. | No |
| `CART_PROMO_INVALID` | 400 | The promo code is invalid, expired, or has already been used. | No |
| `CART_STOCK_RESERVATION_EXPIRED` | 409 | Stock reservation has expired. Please verify item availability. | No |
| `CHECKOUT_PAYMENT_FAILED` | 422 | Payment could not be authorized. Please try a different payment method. | No |
| `CHECKOUT_ADDRESS_INVALID` | 400 | The shipping address is incomplete or invalid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `cart.item_added` | Item added to shopping cart | `cart_id`, `product_id`, `quantity`, `unit_price` |
| `cart.item_removed` | Item removed from shopping cart | `cart_id`, `product_id`, `quantity_released` |
| `checkout.started` | Customer initiated checkout flow | `cart_id`, `customer_id`, `item_count`, `subtotal` |
| `checkout.completed` | Checkout completed and order placed | `cart_id`, `order_id`, `total` |
| `order.placed` | New order created from cart | `order_id`, `customer_id`, `items`, `total`, `shipping_method` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payment-methods | required | Checkout requires a payment method for order placement |
| shipping-calculation | required | Shipping rates calculated during checkout |
| currency-conversion | optional | Multi-currency cart display and checkout |
| refunds-returns | optional | Post-purchase returns and refunds for placed orders |
| subscription-billing | optional | Cart may include subscription products |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Cart Checkout Blueprint",
  "description": "Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement.. 15 fields. 10 outcomes. 6",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "cart, checkout, e-commerce, orders, stock-reservation, promo-codes"
}
</script>
