---
title: "Ecommerce Store Blueprint"
layout: default
parent: "UI"
grand_parent: Blueprint Catalog
description: "Full online storefront with product catalog, category browsing, attribute filtering, shopping cart, multi-step checkout, payment integration, wishlist, and pric"
---

# Ecommerce Store Blueprint

> Full online storefront with product catalog, category browsing, attribute filtering, shopping cart, multi-step checkout, payment integration, wishlist, and pricelist support.


| | |
|---|---|
| **Feature** | `ecommerce-store` |
| **Category** | UI |
| **Version** | 1.0.0 |
| **Tags** | ecommerce, online-store, shopping-cart, checkout, wishlist, product-comparison |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/ui/ecommerce-store.blueprint.yaml) |
| **JSON API** | [ecommerce-store.json]({{ site.baseurl }}/api/blueprints/ui/ecommerce-store.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `shopper` | Shopper | human | Browses products, adds to cart, completes checkout |
| `store_admin` | Store Administrator | human | Manages catalog, pricing, categories, and store settings |
| `system` | eCommerce Engine | system | Handles cart, pricing, checkout flow, visitor tracking |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `product_name` | text | Yes | Product Name |  |
| `product_description` | rich_text | No | Product Description |  |
| `product_price` | number | Yes | Display Price |  |
| `product_category` | text | No | Product Category |  |
| `product_attributes` | json | No | Filterable Attributes |  |
| `product_published` | boolean | Yes | Published |  |
| `product_images` | json | No | Product Images |  |
| `product_ribbon` | text | No | Product Badge |  |
| `cart_id` | text | Yes | Cart ID |  |
| `cart_lines` | json | Yes | Cart Items |  |
| `cart_quantity` | number | Yes | Total Items |  |
| `cart_total` | number | Yes | Cart Total |  |
| `delivery_amount` | number | No | Delivery Cost |  |
| `add_to_cart_action` | select | No | After Add Action |  |
| `billing_address` | json | Yes | Billing Address |  |
| `shipping_address` | json | No | Shipping Address |  |
| `payment_method` | text | Yes | Payment Method |  |
| `tax_display_mode` | select | No | Tax Display |  |
| `pricelist_id` | text | No | Active Pricelist |  |
| `wishlist_items` | json | No | Wishlist Products |  |
| `visitor_id` | text | No | Visitor ID |  |
| `products_viewed` | json | No | Viewed Products |  |

## States

**State field:** `checkout_stage`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `browsing` | Yes |  |
| `cart` |  |  |
| `address` |  |  |
| `payment` |  |  |
| `confirmation` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `browsing` | `cart` | shopper |  |
|  | `cart` | `address` | shopper | Cart must have at least one item |
|  | `address` | `payment` | shopper |  |
|  | `payment` | `confirmation` | system |  |

## Rules

- **session_or_partner_cart:**
  - **description:** Cart persists via browser session for anonymous users. When user logs in, session cart merges into their partner-linked cart.

- **pricelist_resolution_order:**
  - **description:** Pricelist resolved in order: customer-specific > geo-IP based > website default. Prices update throughout the store when pricelist changes.

- **fiscal_position_from_address:**
  - **description:** Tax computation adjusts based on the customer's billing/shipping address via fiscal position mapping.

- **wishlist_unique_per_customer:**
  - **description:** A product can appear only once per customer's wishlist. Duplicate adds are silently ignored.

- **wishlist_session_migration:**
  - **description:** Anonymous wishlist items (stored in session) are migrated to the customer's account on login. Session wishlists older than 5 weeks are garbage-collected.

- **product_must_be_published:**
  - **description:** Only published products with purchasable flag are shown in the storefront
- **express_checkout_single_page:**
  - **description:** Express checkout compresses address + payment into a single step for returning customers with saved addresses.

- **server_side_price_validation:**
  - **description:** All prices displayed on the frontend are revalidated server-side at checkout to prevent price manipulation.


## Outcomes

### Product_added_to_cart (Priority: 1)

**Given:**
- shopper clicks add-to-cart on a published product
- product is in stock or available for backorder

**Then:**
- **create_record** target: `cart_line` — Product added to cart with quantity and computed price
- **set_field** target: `cart_quantity` — Total cart item count updated
- **emit_event** event: `ecommerce.cart.item_added`

**Result:** Product appears in cart, total updated

### Cart_empty_checkout_blocked (Priority: 1) — Error: `ECOMMERCE_EMPTY_CART`

**Given:**
- shopper attempts to proceed to checkout
- cart has zero items

**Then:**
- **notify** — Redirect back to shop with message

**Result:** Checkout blocked until shopper adds items

### Checkout_completed (Priority: 2)

**Given:**
- shopper has items in cart
- billing address provided
- payment method selected and processed successfully

**Then:**
- **transition_state** field: `checkout_stage` from: `payment` to: `confirmation`
- **emit_event** event: `ecommerce.order.placed`

**Result:** Order confirmed, confirmation page shown, confirmation email sent

### Payment_failed (Priority: 2) — Error: `ECOMMERCE_PAYMENT_FAILED`

**Given:**
- payment processing returns an error

**Then:**
- **notify** — Payment error shown with option to retry or change method

**Result:** Order not placed, shopper can retry

### Wishlist_item_added (Priority: 3)

**Given:**
- shopper clicks add-to-wishlist on a product
- product is not already in their wishlist

**Then:**
- **create_record** target: `wishlist_item` — Product saved to wishlist with current price snapshot
- **emit_event** event: `ecommerce.wishlist.item_added`

**Result:** Product saved to wishlist for later

### Products_compared (Priority: 4)

**Given:**
- shopper selects two or more products for comparison

**Then:**
- **call_service** target: `comparison_engine` — Attribute values grouped by category across selected products. Side-by-side comparison table generated.


**Result:** Comparison table shows attribute differences across products

### Visitor_tracked (Priority: 5)

**Given:**
- shopper views a product detail page

**Then:**
- **set_field** target: `products_viewed` — Product added to visitor's viewed history

**Result:** Product view recorded for analytics and recommendations

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ECOMMERCE_EMPTY_CART` | 400 | Your cart is empty. Add products before proceeding to checkout. | No |
| `ECOMMERCE_PAYMENT_FAILED` | 422 | Payment could not be processed. Please try again or use a different method. | No |
| `ECOMMERCE_PRODUCT_UNAVAILABLE` | 400 | One or more products in your cart are no longer available. | No |
| `ECOMMERCE_ADDRESS_INVALID` | 400 | Please provide a valid billing address to proceed. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ecommerce.cart.item_added` | Product added to shopping cart | `cart_id`, `product_id`, `quantity`, `price` |
| `ecommerce.cart.updated` | Cart quantities or items changed | `cart_id`, `cart_total`, `cart_quantity` |
| `ecommerce.order.placed` | Order successfully placed after payment | `order_id`, `customer_id`, `amount_total`, `payment_method` |
| `ecommerce.wishlist.item_added` | Product saved to wishlist | `product_id`, `shopper_id` |
| `ecommerce.visitor.product_viewed` | Product detail page viewed by visitor | `visitor_id`, `product_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| quotation-order-management | required | The shopping cart is a draft sales order, confirmed at checkout |
| product-configurator | optional | Configurable products use the attribute picker on product pages |
| loyalty-coupons | optional | Promo codes and loyalty rewards applied during checkout |
| invoicing-payments | required | Payment processing and invoice generation at checkout |
| tax-engine | required | Product prices and cart totals computed with applicable taxes |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 50
  entry_points:
    - addons/website_sale/controllers/main.py
    - addons/website_sale/models/sale_order.py
    - addons/website_sale_wishlist/models/product_wishlist.py
    - addons/website_sale_comparison/models/product_product.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ecommerce Store Blueprint",
  "description": "Full online storefront with product catalog, category browsing, attribute filtering, shopping cart, multi-step checkout, payment integration, wishlist, and pric",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ecommerce, online-store, shopping-cart, checkout, wishlist, product-comparison"
}
</script>
