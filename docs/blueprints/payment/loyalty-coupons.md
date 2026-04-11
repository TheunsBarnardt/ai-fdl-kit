---
title: "Loyalty Coupons Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards. . 20 fields. 8 outco"
---

# Loyalty Coupons Blueprint

> Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.


| | |
|---|---|
| **Feature** | `loyalty-coupons` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | loyalty, coupons, gift-cards, promotions, rewards, discounts |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/loyalty-coupons.blueprint.yaml) |
| **JSON API** | [loyalty-coupons.json]({{ site.baseurl }}/api/blueprints/payment/loyalty-coupons.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Earns points, redeems rewards, applies coupon codes |
| `marketing_manager` | Marketing Manager | human | Creates and manages loyalty programs and promotion campaigns |
| `system` | Loyalty Engine | system | Evaluates earning rules, validates redemption, tracks balances |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `program_type` | select | Yes | Program Type |  |
| `program_name` | text | Yes | Program Name |  |
| `program_active` | boolean | Yes | Active |  |
| `earning_mode` | select | Yes | Earning Mode |  |
| `points_per_trigger` | number | Yes | Points Earned | Validations: min |
| `trigger_mode` | select | Yes | Trigger Mode |  |
| `promo_code` | text | No | Promotion Code |  |
| `minimum_quantity` | number | No | Minimum Quantity |  |
| `minimum_amount` | number | No | Minimum Purchase Amount |  |
| `eligible_products` | json | No | Eligible Products |  |
| `reward_type` | select | Yes | Reward Type |  |
| `discount_mode` | select | No | Discount Mode |  |
| `discount_value` | number | No | Discount Value | Validations: min |
| `discount_applicability` | select | No | Applies To |  |
| `reward_product_id` | text | No | Free Product |  |
| `reward_product_qty` | number | No | Free Product Quantity | Validations: min |
| `required_points` | number | Yes | Points Required | Validations: min |
| `card_code` | text | Yes | Card/Coupon Code |  |
| `card_points_balance` | number | Yes | Points Balance |  |
| `card_partner_id` | text | No | Card Holder |  |

## Rules

- **code_uniqueness:**
  - **description:** Promotion codes must be unique across all active rules and loyalty cards
- **reward_points_positive:**
  - **description:** Required points for redemption must be greater than zero
- **discount_value_positive:**
  - **description:** Discount amount or percentage must be a positive number
- **reward_qty_positive:**
  - **description:** Free product reward quantity must be at least 1
- **points_earned_positive:**
  - **description:** Points earned per trigger must be a positive number
- **nominative_no_split:**
  - **description:** Nominative programs (loyalty, e-wallet) cannot split earned points across multiple cards — all points go to the customer's single card

- **minimum_threshold_check:**
  - **description:** Earning rules only trigger when the order meets the minimum quantity and/or minimum purchase amount thresholds

- **auto_vs_code_trigger:**
  - **description:** Auto-triggered promotions apply at checkout without customer action. Code-triggered promotions require the customer to enter a valid code.

- **gift_card_balance_sufficient:**
  - **description:** Gift card redemption cannot exceed the card's remaining balance
- **ewallet_balance_sufficient:**
  - **description:** E-wallet payment cannot exceed the wallet's available balance

## Outcomes

### Points_earned (Priority: 1)

**Given:**
- customer completes a qualifying purchase
- a loyalty program with matching earning rules exists
- ANY: program trigger mode is auto OR customer entered the correct promo code

**Then:**
- **set_field** target: `card_points_balance` — Points added to customer's loyalty card based on earning rules
- **create_record** target: `loyalty_history` — History entry records points issued for this transaction
- **emit_event** event: `loyalty.points.earned`

**Result:** Customer's loyalty balance increases by the earned amount

### Insufficient_points (Priority: 1) — Error: `LOYALTY_INSUFFICIENT_POINTS`

**Given:**
- customer attempts to redeem a reward
- `card_points_balance` (db) lt `required_points`

**Then:**
- **notify** — Show current balance and required points

**Result:** Reward not applied, customer informed of points needed

### Reward_redeemed_discount (Priority: 2)

**Given:**
- customer has sufficient points on their loyalty card
- customer applies reward at checkout
- `reward_type` (input) eq `discount`

**Then:**
- **set_field** target: `card_points_balance` — Required points deducted from card balance
- **create_record** target: `discount_line` — Discount line added to the order based on reward configuration
- **create_record** target: `loyalty_history` — History entry records points used for this redemption
- **emit_event** event: `loyalty.reward.redeemed`

**Result:** Discount applied to order, points deducted from card

### Invalid_promo_code (Priority: 2) — Error: `LOYALTY_INVALID_CODE`

**Given:**
- customer enters a promo code that does not match any active program

**Then:**
- **notify** — Code not recognized message

**Result:** No discount applied

### Reward_redeemed_product (Priority: 3)

**Given:**
- customer has sufficient points on their loyalty card
- `reward_type` (input) eq `product`

**Then:**
- **set_field** target: `card_points_balance` — Required points deducted from card balance
- **create_record** target: `free_product_line` — Free product added to the order at zero cost
- **emit_event** event: `loyalty.reward.redeemed`

**Result:** Free product added to order, points deducted

### Minimum_not_met (Priority: 3) — Error: `LOYALTY_MINIMUM_NOT_MET`

**Given:**
- order does not meet the minimum quantity or amount for the promotion

**Then:**
- **notify** — Show minimum requirements

**Result:** Promotion not applied until order meets thresholds

### Coupon_applied (Priority: 4)

**Given:**
- customer enters a coupon code at checkout
- coupon code matches an active coupon or promo code
- order meets the minimum quantity and amount requirements

**Then:**
- **create_record** target: `discount_line` — Coupon discount applied to the order
- **emit_event** event: `loyalty.coupon.applied`

**Result:** Coupon discount reflected on the order total

### Gift_card_redeemed (Priority: 5) — Error: `LOYALTY_GIFT_CARD_EMPTY`

**Given:**
- customer enters a gift card code
- gift card has sufficient remaining balance

**Then:**
- **set_field** target: `card_points_balance` — Gift card balance reduced by the applied amount
- **create_record** target: `payment_line` — Gift card payment applied to the order
- **emit_event** event: `loyalty.gift_card.redeemed`

**Result:** Gift card balance applied as payment toward the order

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LOYALTY_INSUFFICIENT_POINTS` | 400 | You don't have enough points for this reward. | No |
| `LOYALTY_INVALID_CODE` | 400 | The code you entered is not valid or has expired. | No |
| `LOYALTY_MINIMUM_NOT_MET` | 400 | Your order does not meet the minimum requirements for this promotion. | No |
| `LOYALTY_GIFT_CARD_EMPTY` | 400 | This gift card has no remaining balance. | No |
| `LOYALTY_CODE_ALREADY_USED` | 400 | This coupon has already been used. | No |
| `LOYALTY_DUPLICATE_CODE` | 409 | A program with this code already exists. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `loyalty.points.earned` | Customer earned loyalty points from a purchase | `card_code`, `program_type`, `points_earned`, `order_id` |
| `loyalty.reward.redeemed` | Customer redeemed a reward (discount or free product) | `card_code`, `reward_type`, `value`, `order_id` |
| `loyalty.coupon.applied` | Coupon or promo code successfully applied to an order | `card_code`, `program_type`, `discount_value`, `order_id` |
| `loyalty.gift_card.redeemed` | Gift card balance used for payment | `card_code`, `amount_used`, `remaining_balance` |
| `loyalty.card.created` | New loyalty card or coupon generated | `card_code`, `program_type`, `partner_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| pos-core | optional | Loyalty rewards applied at point-of-sale checkout |
| quotation-order-management | optional | Loyalty rewards applied to online/portal sales orders |
| ecommerce-store | optional | Promo codes and loyalty applied during online checkout |

## AGI Readiness

### Goals

#### Reliable Loyalty Coupons

Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.


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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| points_earned | `autonomous` | - | - |
| reward_redeemed_discount | `autonomous` | - | - |
| reward_redeemed_product | `autonomous` | - | - |
| coupon_applied | `autonomous` | - | - |
| gift_card_redeemed | `autonomous` | - | - |
| insufficient_points | `autonomous` | - | - |
| invalid_promo_code | `autonomous` | - | - |
| minimum_not_met | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: Odoo
  tech_stack: Python + JavaScript/OWL
  files_traced: 25
  entry_points:
    - addons/loyalty/models/loyalty_program.py
    - addons/loyalty/models/loyalty_rule.py
    - addons/loyalty/models/loyalty_reward.py
    - addons/sale_loyalty/models/sale_order.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Loyalty Coupons Blueprint",
  "description": "Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.\n. 20 fields. 8 outco",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "loyalty, coupons, gift-cards, promotions, rewards, discounts"
}
</script>
