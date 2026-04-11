<!-- AUTO-GENERATED FROM ecommerce-store.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Ecommerce Store

> Full online storefront with product catalog, category browsing, attribute filtering, shopping cart, multi-step checkout, payment integration, wishlist, and pricelist support.

**Category:** Ui · **Version:** 1.0.0 · **Tags:** ecommerce · online-store · shopping-cart · checkout · wishlist · product-comparison

## What this does

Full online storefront with product catalog, category browsing, attribute filtering, shopping cart, multi-step checkout, payment integration, wishlist, and pricelist support.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **product_name** *(text, required)* — Product Name
- **product_description** *(rich_text, optional)* — Product Description
- **product_price** *(number, required)* — Display Price
- **product_category** *(text, optional)* — Product Category
- **product_attributes** *(json, optional)* — Filterable Attributes
- **product_published** *(boolean, required)* — Published
- **product_images** *(json, optional)* — Product Images
- **product_ribbon** *(text, optional)* — Product Badge
- **cart_id** *(text, required)* — Cart ID
- **cart_lines** *(json, required)* — Cart Items
- **cart_quantity** *(number, required)* — Total Items
- **cart_total** *(number, required)* — Cart Total
- **delivery_amount** *(number, optional)* — Delivery Cost
- **add_to_cart_action** *(select, optional)* — After Add Action
- **billing_address** *(json, required)* — Billing Address
- **shipping_address** *(json, optional)* — Shipping Address
- **payment_method** *(text, required)* — Payment Method
- **tax_display_mode** *(select, optional)* — Tax Display
- **pricelist_id** *(text, optional)* — Active Pricelist
- **wishlist_items** *(json, optional)* — Wishlist Products
- **visitor_id** *(text, optional)* — Visitor ID
- **products_viewed** *(json, optional)* — Viewed Products

## What must be true

- **session_or_partner_cart:** Cart persists via browser session for anonymous users. When user logs in, session cart merges into their partner-linked cart.
- **pricelist_resolution_order:** Pricelist resolved in order: customer-specific > geo-IP based > website default. Prices update throughout the store when pricelist changes.
- **fiscal_position_from_address:** Tax computation adjusts based on the customer's billing/shipping address via fiscal position mapping.
- **wishlist_unique_per_customer:** A product can appear only once per customer's wishlist. Duplicate adds are silently ignored.
- **wishlist_session_migration:** Anonymous wishlist items (stored in session) are migrated to the customer's account on login. Session wishlists older than 5 weeks are garbage-collected.
- **product_must_be_published:** Only published products with purchasable flag are shown in the storefront
- **express_checkout_single_page:** Express checkout compresses address + payment into a single step for returning customers with saved addresses.
- **server_side_price_validation:** All prices displayed on the frontend are revalidated server-side at checkout to prevent price manipulation.

## Success & failure scenarios

**✅ Success paths**

- **Product Added To Cart** — when shopper clicks add-to-cart on a published product; product is in stock or available for backorder, then Product appears in cart, total updated.
- **Checkout Completed** — when shopper has items in cart; billing address provided; payment method selected and processed successfully, then Order confirmed, confirmation page shown, confirmation email sent.
- **Wishlist Item Added** — when shopper clicks add-to-wishlist on a product; product is not already in their wishlist, then Product saved to wishlist for later.
- **Products Compared** — when shopper selects two or more products for comparison, then Comparison table shows attribute differences across products.
- **Visitor Tracked** — when shopper views a product detail page, then Product view recorded for analytics and recommendations.

**❌ Failure paths**

- **Cart Empty Checkout Blocked** — when shopper attempts to proceed to checkout; cart has zero items, then Checkout blocked until shopper adds items. *(error: `ECOMMERCE_EMPTY_CART`)*
- **Payment Failed** — when payment processing returns an error, then Order not placed, shopper can retry. *(error: `ECOMMERCE_PAYMENT_FAILED`)*

## Errors it can return

- `ECOMMERCE_EMPTY_CART` — Your cart is empty. Add products before proceeding to checkout.
- `ECOMMERCE_PAYMENT_FAILED` — Payment could not be processed. Please try again or use a different method.
- `ECOMMERCE_PRODUCT_UNAVAILABLE` — One or more products in your cart are no longer available.
- `ECOMMERCE_ADDRESS_INVALID` — Please provide a valid billing address to proceed.

## Connects to

- **quotation-order-management** *(required)* — The shopping cart is a draft sales order, confirmed at checkout
- **product-configurator** *(optional)* — Configurable products use the attribute picker on product pages
- **loyalty-coupons** *(optional)* — Promo codes and loyalty rewards applied during checkout
- **invoicing-payments** *(required)* — Payment processing and invoice generation at checkout
- **tax-engine** *(required)* — Product prices and cart totals computed with applicable taxes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/ui/ecommerce-store/) · **Spec source:** [`ecommerce-store.blueprint.yaml`](./ecommerce-store.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
