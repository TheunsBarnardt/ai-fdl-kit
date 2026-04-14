<!-- AUTO-GENERATED FROM loyalty-coupons.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Loyalty Coupons

> Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** loyalty · coupons · gift-cards · promotions · rewards · discounts

## What this does

Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **program_type** *(select, required)* — Program Type
- **program_name** *(text, required)* — Program Name
- **program_active** *(boolean, required)* — Active
- **earning_mode** *(select, required)* — Earning Mode
- **points_per_trigger** *(number, required)* — Points Earned
- **trigger_mode** *(select, required)* — Trigger Mode
- **promo_code** *(text, optional)* — Promotion Code
- **minimum_quantity** *(number, optional)* — Minimum Quantity
- **minimum_amount** *(number, optional)* — Minimum Purchase Amount
- **eligible_products** *(json, optional)* — Eligible Products
- **reward_type** *(select, required)* — Reward Type
- **discount_mode** *(select, optional)* — Discount Mode
- **discount_value** *(number, optional)* — Discount Value
- **discount_applicability** *(select, optional)* — Applies To
- **reward_product_id** *(text, optional)* — Free Product
- **reward_product_qty** *(number, optional)* — Free Product Quantity
- **required_points** *(number, required)* — Points Required
- **card_code** *(text, required)* — Card/Coupon Code
- **card_points_balance** *(number, required)* — Points Balance
- **card_partner_id** *(text, optional)* — Card Holder

## What must be true

- **code_uniqueness:** Promotion codes must be unique across all active rules and loyalty cards
- **reward_points_positive:** Required points for redemption must be greater than zero
- **discount_value_positive:** Discount amount or percentage must be a positive number
- **reward_qty_positive:** Free product reward quantity must be at least 1
- **points_earned_positive:** Points earned per trigger must be a positive number
- **nominative_no_split:** Nominative programs (loyalty, e-wallet) cannot split earned points across multiple cards — all points go to the customer's single card
- **minimum_threshold_check:** Earning rules only trigger when the order meets the minimum quantity and/or minimum purchase amount thresholds
- **auto_vs_code_trigger:** Auto-triggered promotions apply at checkout without customer action. Code-triggered promotions require the customer to enter a valid code.
- **gift_card_balance_sufficient:** Gift card redemption cannot exceed the card's remaining balance
- **ewallet_balance_sufficient:** E-wallet payment cannot exceed the wallet's available balance

## Success & failure scenarios

**✅ Success paths**

- **Points Earned** — when customer completes a qualifying purchase; a loyalty program with matching earning rules exists; program trigger mode is auto OR customer entered the correct promo code, then Customer's loyalty balance increases by the earned amount.
- **Reward Redeemed Discount** — when customer has sufficient points on their loyalty card; customer applies reward at checkout; reward_type eq "discount", then Discount applied to order, points deducted from card.
- **Reward Redeemed Product** — when customer has sufficient points on their loyalty card; reward_type eq "product", then Free product added to order, points deducted.
- **Coupon Applied** — when customer enters a coupon code at checkout; coupon code matches an active coupon or promo code; order meets the minimum quantity and amount requirements, then Coupon discount reflected on the order total.

**❌ Failure paths**

- **Insufficient Points** — when customer attempts to redeem a reward; card_points_balance lt "required_points", then Reward not applied, customer informed of points needed. *(error: `LOYALTY_INSUFFICIENT_POINTS`)*
- **Invalid Promo Code** — when customer enters a promo code that does not match any active program, then No discount applied. *(error: `LOYALTY_INVALID_CODE`)*
- **Minimum Not Met** — when order does not meet the minimum quantity or amount for the promotion, then Promotion not applied until order meets thresholds. *(error: `LOYALTY_MINIMUM_NOT_MET`)*
- **Gift Card Redeemed** — when customer enters a gift card code; gift card has sufficient remaining balance, then Gift card balance applied as payment toward the order. *(error: `LOYALTY_GIFT_CARD_EMPTY`)*

## Errors it can return

- `LOYALTY_INSUFFICIENT_POINTS` — You don't have enough points for this reward.
- `LOYALTY_INVALID_CODE` — The code you entered is not valid or has expired.
- `LOYALTY_MINIMUM_NOT_MET` — Your order does not meet the minimum requirements for this promotion.
- `LOYALTY_GIFT_CARD_EMPTY` — This gift card has no remaining balance.
- `LOYALTY_CODE_ALREADY_USED` — This coupon has already been used.
- `LOYALTY_DUPLICATE_CODE` — A program with this code already exists.

## Events

**`loyalty.points.earned`** — Customer earned loyalty points from a purchase
  Payload: `card_code`, `program_type`, `points_earned`, `order_id`

**`loyalty.reward.redeemed`** — Customer redeemed a reward (discount or free product)
  Payload: `card_code`, `reward_type`, `value`, `order_id`

**`loyalty.coupon.applied`** — Coupon or promo code successfully applied to an order
  Payload: `card_code`, `program_type`, `discount_value`, `order_id`

**`loyalty.gift_card.redeemed`** — Gift card balance used for payment
  Payload: `card_code`, `amount_used`, `remaining_balance`

**`loyalty.card.created`** — New loyalty card or coupon generated
  Payload: `card_code`, `program_type`, `partner_id`

## Connects to

- **pos-core** *(optional)* — Loyalty rewards applied at point-of-sale checkout
- **quotation-order-management** *(optional)* — Loyalty rewards applied to online/portal sales orders
- **ecommerce-store** *(optional)* — Promo codes and loyalty applied during online checkout

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/loyalty-coupons/) · **Spec source:** [`loyalty-coupons.blueprint.yaml`](./loyalty-coupons.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
