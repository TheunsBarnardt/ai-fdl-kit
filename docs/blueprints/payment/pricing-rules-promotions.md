---
title: "Pricing Rules Promotions Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Define and apply pricing rules, discount schemes, and promotional offers with priority-based conflict resolution, cumulative tracking, and free item support. 21"
---

# Pricing Rules Promotions Blueprint

> Define and apply pricing rules, discount schemes, and promotional offers with priority-based conflict resolution, cumulative tracking, and free item support

| | |
|---|---|
| **Feature** | `pricing-rules-promotions` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | pricing, discounts, promotions, coupons, erp, sales, purchase |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/pricing-rules-promotions.blueprint.yaml) |
| **JSON API** | [pricing-rules-promotions.json]({{ site.baseurl }}/api/blueprints/payment/pricing-rules-promotions.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `title` | text | Yes | Title | Validations: minLength, maxLength |
| `apply_on` | select | Yes | Apply On |  |
| `rate_or_discount` | select | Yes | Rate Or Discount |  |
| `rate` | number | No | Rate | Validations: min |
| `discount_percentage` | number | No | Discount Percentage | Validations: min, max |
| `discount_amount` | number | No | Discount Amount | Validations: min |
| `min_qty` | number | No | Min Qty | Validations: min |
| `max_qty` | number | No | Max Qty | Validations: min |
| `min_amt` | number | No | Min Amt | Validations: min |
| `max_amt` | number | No | Max Amt | Validations: min |
| `valid_from` | date | No | Valid From |  |
| `valid_upto` | date | No | Valid Upto |  |
| `priority` | number | Yes | Priority | Validations: min |
| `price_or_product_discount` | select | Yes | Price Or Product Discount |  |
| `free_item` | text | No | Free Item |  |
| `free_qty` | number | No | Free Qty | Validations: min |
| `is_cumulative` | boolean | No | Is Cumulative |  |
| `coupon_code_based` | boolean | No | Coupon Code Based |  |
| `condition` | text | No | Condition |  |
| `selling` | boolean | No | Selling |  |
| `buying` | boolean | No | Buying |  |

## Rules

- **direction_required:**
  - **description:** Either selling or buying flag must be enabled. A pricing rule must apply to at least one transaction direction.

- **priority_order:**
  - **description:** Priority determines evaluation order. Lower priority number is evaluated first and takes precedence when multiple rules match.

- **max_discount_enforcement:**
  - **description:** Discount percentage cannot exceed the item maximum discount if one is configured on the item master.

- **cumulative_tracking:**
  - **description:** Cumulative rules track total quantity or amount across transactions within the defined validity period.

- **recursive_free_item:**
  - **description:** Free item quantity is calculated recursively when is_recursive is enabled. For example, buy 3 get 1 free applied to qty 12 gives 3 free items.

- **coupon_validation:**
  - **description:** Coupon-code-based rules are only applied when a valid coupon code is provided at transaction time.

- **date_bound:**
  - **description:** Date-bound rules are only active between valid_from and valid_upto dates inclusive. Rules outside this range are skipped.

- **transaction_level:**
  - **description:** Transaction-level rules apply to the entire document total rather than individual line items.

- **conflict_resolution:**
  - **description:** When multiple rules match, highest priority rule wins. Ties are resolved by the most specific match (item code beats item group beats brand beats transaction).


## Outcomes

### Apply_price_discount (Priority: 10)

**Given:**
- `price_or_product_discount` eq `price`
- transaction line matches the rule criteria
- quantity and amount fall within min/max thresholds
- current date is within validity period

**Then:**
- **set_field** target: `item_rate_or_discount` — Apply calculated rate, discount percentage, or discount amount per rule type
- **emit_event** event: `pricing_rule.applied`

**Result:** Price discount is applied to the matching line items or transaction total

### Apply_product_discount (Priority: 11)

**Given:**
- `price_or_product_discount` eq `product`
- `free_item` exists
- transaction line meets quantity or amount thresholds

**Then:**
- **create_record** target: `free_item_row` — Add free item row to the transaction with calculated free quantity
- **emit_event** event: `pricing_rule.applied`

**Result:** Free item is added to the transaction with the calculated quantity

### Apply_margin (Priority: 12)

**Given:**
- rule specifies a margin type (percentage or amount)
- transaction line matches rule criteria

**Then:**
- **set_field** target: `margin_rate_or_amount` — Apply calculated margin based on rule type
- **emit_event** event: `pricing_rule.applied`

**Result:** Margin is applied to the item rate on the matching transaction lines

### Resolve_conflicts (Priority: 13) — Error: `PRICING_RULE_CONFLICT`

**Given:**
- multiple pricing rules match the same transaction or line item

**Then:**
- **call_service** target: `pricing_rule_resolver` — Select highest priority rule; if tied, select most specific match
- **emit_event** event: `pricing_rule.conflict`

**Result:** Single winning pricing rule is selected and applied; other conflicting rules are skipped

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRICING_RULE_CONFLICT` | 409 | Multiple pricing rules conflict and cannot be resolved automatically. | No |
| `PRICING_MAX_DISCOUNT_EXCEEDED` | 400 | Discount exceeds the maximum allowed discount for this item. | No |
| `PRICING_INVALID_CONDITION` | 400 | Pricing rule condition expression is invalid or references unknown fields. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pricing_rule.applied` | A pricing rule is successfully applied to a transaction | `rule_id`, `title`, `apply_on`, `discount_type`, `discount_value`, `transaction_id` |
| `pricing_rule.conflict` | Multiple rules match and conflict resolution is triggered | `conflicting_rule_ids`, `winning_rule_id`, `transaction_id` |
| `promotion.activated` | A promotional pricing rule becomes active based on its validity dates | `rule_id`, `title`, `valid_from`, `valid_upto` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-purchase-invoicing | recommended | Pricing rules are applied to invoice line items |
| sales-order-lifecycle | recommended | Pricing rules are applied during order creation |

## AGI Readiness

### Goals

#### Reliable Pricing Rules Promotions

Define and apply pricing rules, discount schemes, and promotional offers with priority-based conflict resolution, cumulative tracking, and free item support

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
| apply_price_discount | `autonomous` | - | - |
| apply_product_discount | `autonomous` | - | - |
| apply_margin | `autonomous` | - | - |
| resolve_conflicts | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python, Frappe Framework, MariaDB/PostgreSQL
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pricing Rules Promotions Blueprint",
  "description": "Define and apply pricing rules, discount schemes, and promotional offers with priority-based conflict resolution, cumulative tracking, and free item support. 21",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "pricing, discounts, promotions, coupons, erp, sales, purchase"
}
</script>
