<!-- AUTO-GENERATED FROM cart-checkout.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cart Checkout

> Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** cart · checkout · e-commerce · orders · stock-reservation · promo-codes

## What this does

Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **cart_id** *(text, required)* — Cart ID
- **customer_id** *(text, optional)* — Customer ID
- **items** *(json, required)* — Cart Items
- **subtotal** *(number, required)* — Subtotal
- **tax** *(number, required)* — Tax Amount
- **shipping_cost** *(number, required)* — Shipping Cost
- **discount** *(number, optional)* — Discount Amount
- **total** *(number, required)* — Order Total
- **promo_code** *(text, optional)* — Promo Code
- **checkout_step** *(select, required)* — Checkout Step
- **shipping_address** *(json, optional)* — Shipping Address
- **billing_address** *(json, optional)* — Billing Address
- **shipping_method** *(text, optional)* — Shipping Method
- **payment_method_id** *(text, optional)* — Payment Method
- **order_id** *(text, optional)* — Order ID

## What must be true

- **stock_reservation:** When an item is added to cart, inventory is soft-reserved for 15 minutes. Reservation refreshes on cart activity. If the cart is inactive for 15 minutes, reservations are released.
- **cart_expiry:** Abandoned carts expire after 30 days. Guest carts expire after 7 days. Expiry releases all stock reservations.
- **guest_cart_merge:** When a guest user logs in, their guest cart merges into their account cart. Duplicate items have quantities summed. Conflicts (e.g., stock limits) are resolved in favor of the newest item.
- **quantity_validation:** Item quantity must be at least 1 and cannot exceed available stock. Attempting to add more than available stock shows the maximum available quantity.
- **total_calculation:** Order total = subtotal + tax + shipping_cost - discount. Recalculated on every cart or checkout modification.
- **promo_code_validation:** Promo codes are validated against active promotions. A code may be percentage-based or fixed-amount. Only one promo code per order. Invalid or expired codes return an error.
- **tax_calculation:** Tax calculated based on shipping destination, product tax category, and applicable tax rules. Recalculated when address or items change.

## Success & failure scenarios

**✅ Success paths**

- **Item Removed From Cart** — when customer removes an item from cart; item exists in cart, then Item removed from cart, stock reservation released, totals recalculated.
- **Item Quantity Updated** — when customer updates item quantity in cart; new quantity is between 1 and available stock, then Cart item quantity updated, totals recalculated.
- **Promo Code Applied** — when customer enters a promo code; promo code is valid and active; cart meets minimum requirements for the promotion, then Promo code applied, discount reflected in order total.
- **Checkout Started** — when customer proceeds from cart to checkout; cart has at least one item, then Checkout flow initiated, customer enters address step.
- **Order Placed** — when checkout_step eq "review"; payment is authorized; all items are in stock, then Order placed, payment captured, stock committed, confirmation sent.
- **Guest Cart Merged** — when guest user logs in; guest cart has items; user has an existing account cart, then Guest cart merged into account cart, duplicates consolidated.

**❌ Failure paths**

- **Item Added To Cart** — when customer adds a product to cart; product is in stock; requested quantity is available, then Item added to cart, subtotal updated, stock reserved for 15 minutes. *(error: `CART_STOCK_RESERVATION_EXPIRED`)*
- **Cart Empty** — when customer attempts to checkout; items not_exists, then Cannot proceed to checkout with an empty cart. *(error: `CART_EMPTY`)*
- **Item Out Of Stock** — when customer adds an item to cart; requested quantity exceeds available stock, then Item cannot be added, insufficient stock. *(error: `CART_ITEM_OUT_OF_STOCK`)*
- **Promo Code Invalid** — when customer enters a promo code; code is invalid, expired, or already used, then Promo code rejected. *(error: `CART_PROMO_INVALID`)*

## Errors it can return

- `CART_EMPTY` — Your cart is empty. Add items before proceeding to checkout.
- `CART_ITEM_OUT_OF_STOCK` — The requested quantity is not available. Please reduce the quantity or choose a different item.
- `CART_PROMO_INVALID` — The promo code is invalid, expired, or has already been used.
- `CART_STOCK_RESERVATION_EXPIRED` — Stock reservation has expired. Please verify item availability.
- `CHECKOUT_PAYMENT_FAILED` — Payment could not be authorized. Please try a different payment method.
- `CHECKOUT_ADDRESS_INVALID` — The shipping address is incomplete or invalid.

## Connects to

- **payment-methods** *(required)* — Checkout requires a payment method for order placement
- **shipping-calculation** *(required)* — Shipping rates calculated during checkout
- **currency-conversion** *(optional)* — Multi-currency cart display and checkout
- **refunds-returns** *(optional)* — Post-purchase returns and refunds for placed orders
- **subscription-billing** *(optional)* — Cart may include subscription products

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/cart-checkout/) · **Spec source:** [`cart-checkout.blueprint.yaml`](./cart-checkout.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
