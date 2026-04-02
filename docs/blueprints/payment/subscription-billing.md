---
title: "Subscription Billing Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling.. 11 fields. 11 outcomes. 5 erro"
---

# Subscription Billing Blueprint

> Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling.

| | |
|---|---|
| **Feature** | `subscription-billing` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | subscriptions, recurring-billing, plans, trials, dunning, proration, saas |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/payment/subscription-billing.blueprint.yaml) |
| **JSON API** | [subscription-billing.json]({{ site.baseurl }}/api/blueprints/payment/subscription-billing.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `subscription_id` | text | Yes | Subscription ID | Validations: pattern |
| `customer_id` | text | Yes | Customer ID |  |
| `plan_id` | select | Yes | Plan |  |
| `billing_cycle` | select | Yes | Billing Cycle |  |
| `trial_ends_at` | datetime | No | Trial End Date |  |
| `current_period_start` | datetime | Yes | Current Period Start |  |
| `current_period_end` | datetime | Yes | Current Period End |  |
| `status` | select | Yes | Subscription Status |  |
| `cancel_at_period_end` | boolean | No | Cancel at Period End |  |
| `payment_method_id` | text | No | Payment Method |  |
| `dunning_attempts` | number | No | Failed Payment Retry Count | Validations: max |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `trialing` | Yes |  |
| `active` |  |  |
| `past_due` |  |  |
| `canceled` |  | Yes |
| `unpaid` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `trialing` | `active` | system | Valid payment method on file and charge succeeds |
|  | `trialing` | `canceled` | customer |  |
|  | `active` | `past_due` | system | Payment charge returns a failure |
|  | `past_due` | `active` | system | Payment retry succeeds within 3 attempts over 7 days |
|  | `past_due` | `unpaid` | system | 3 retries failed over 7-day window |
|  | `active` | `canceled` | customer |  |
|  | `unpaid` | `active` | system |  |

## Rules

- **trial_default_duration:**
  - **description:** Free trial defaults to 14 days from subscription creation. Trial can be skipped if customer opts out or plan does not offer trials.

- **proration_on_plan_change:**
  - **description:** When upgrading or downgrading mid-cycle, prorate the charge based on remaining days in the current billing period. Upgrades charge the difference immediately; downgrades credit toward next invoice.

- **dunning_retry_schedule:**
  - **description:** Failed payments are retried 3 times over 7 days (day 1, day 3, day 7). Each retry sends an email notification to the customer.

- **grace_period:**
  - **description:** After entering past_due status, the customer retains access for the remainder of the dunning window (7 days) before suspension.

- **cancellation_modes:**
  - **description:** Immediate cancellation revokes access at once. End-of-period cancellation sets cancel_at_period_end to true and revokes access when the current billing period expires.

- **annual_discount:**
  - **description:** Annual billing cycle applies a discount (typically 16-20% off the equivalent monthly rate). The exact discount is configured per plan.

- **one_subscription_per_customer:**
  - **description:** A customer may hold only one active subscription at a time. Upgrading or downgrading modifies the existing subscription.


## Outcomes

### Subscription_created (Priority: 1)

**Given:**
- customer selects a plan and billing cycle
- customer provides a valid payment method

**Then:**
- **create_record** target: `subscription` — New subscription record created with trial or active status
- **set_field** target: `status` value: `trialing` when: `plan_id != "free"`
- **set_field** target: `trial_ends_at` — Set to 14 days from now
- **emit_event** event: `subscription.created`

**Result:** Subscription created, trial period begins (or active if no trial)

### No_payment_method (Priority: 1) — Error: `SUBSCRIPTION_NO_PAYMENT_METHOD`

**Given:**
- customer attempts to subscribe to a paid plan
- `payment_method_id` not_exists

**Then:**
- **notify** — Prompt customer to add a payment method

**Result:** Subscription cannot proceed without a valid payment method

### Trial_converted (Priority: 2)

**Given:**
- `status` eq `trialing`
- trial_ends_at has passed
- valid payment method on file

**Then:**
- **transition_state** field: `status` from: `trialing` to: `active`
- **set_field** target: `current_period_start` — Set to trial end date
- **emit_event** event: `subscription.renewed`

**Result:** Trial converts to paid subscription, first charge processed

### Subscription_upgraded (Priority: 3)

**Given:**
- `status` eq `active`
- customer selects a higher-tier plan

**Then:**
- **set_field** target: `plan_id` — Updated to new plan
- **set_field** target: `proration_amount` — Calculated based on remaining days in current period
- **emit_event** event: `subscription.upgraded`

**Result:** Plan upgraded, prorated charge applied immediately

### Subscription_downgraded (Priority: 4)

**Given:**
- `status` eq `active`
- customer selects a lower-tier plan

**Then:**
- **set_field** target: `plan_id` — Scheduled to change at next billing period
- **emit_event** event: `subscription.downgraded`

**Result:** Downgrade scheduled for next billing period, credit applied

### Subscription_renewed (Priority: 5)

**Given:**
- `status` eq `active`
- current_period_end has passed
- payment charge succeeds

**Then:**
- **set_field** target: `current_period_start` — Set to previous period end
- **set_field** target: `current_period_end` — Advanced by one billing cycle
- **emit_event** event: `subscription.renewed`

**Result:** Subscription renewed for a new billing period

### Payment_failed (Priority: 6)

**Given:**
- `status` eq `active`
- recurring payment charge fails

**Then:**
- **transition_state** field: `status` from: `active` to: `past_due`
- **set_field** target: `dunning_attempts` value: `1`
- **emit_event** event: `subscription.payment_failed`
- **notify** — Notify customer of failed payment and upcoming retry

**Result:** Subscription enters past_due, dunning process begins

### Dunning_retry_succeeded (Priority: 7)

**Given:**
- `status` eq `past_due`
- payment retry succeeds within dunning window

**Then:**
- **transition_state** field: `status` from: `past_due` to: `active`
- **set_field** target: `dunning_attempts` value: `0`
- **emit_event** event: `subscription.renewed`

**Result:** Payment recovered, subscription reactivated

### Dunning_exhausted (Priority: 8) — Error: `SUBSCRIPTION_DUNNING_EXHAUSTED`

**Given:**
- `status` eq `past_due`
- `dunning_attempts` gte `3`

**Then:**
- **transition_state** field: `status` from: `past_due` to: `unpaid`
- **emit_event** event: `subscription.payment_failed`
- **notify** — Final notice that subscription is suspended

**Result:** All retry attempts failed, subscription suspended

### Subscription_canceled (Priority: 9)

**Given:**
- customer requests cancellation
- ANY: `status` eq `active` OR `status` eq `trialing`

**Then:**
- **set_field** target: `cancel_at_period_end` value: `true` — For end-of-period cancellation
- **emit_event** event: `subscription.canceled`

**Result:** Subscription marked for cancellation

### Trial_ending_notification (Priority: 10)

**Given:**
- `status` eq `trialing`
- trial_ends_at is within 3 days

**Then:**
- **emit_event** event: `subscription.trial_ending`
- **notify** — Remind customer that trial is ending soon

**Result:** Customer notified of upcoming trial expiration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SUBSCRIPTION_NO_PAYMENT_METHOD` | 400 | A valid payment method is required to subscribe to a paid plan. | No |
| `SUBSCRIPTION_DUNNING_EXHAUSTED` | 422 | All payment retry attempts have been exhausted. Please update your payment method. | No |
| `SUBSCRIPTION_ALREADY_ACTIVE` | 409 | An active subscription already exists. Please modify or cancel the current subscription. | No |
| `SUBSCRIPTION_PLAN_INVALID` | 400 | The selected plan is not available for this account. | No |
| `SUBSCRIPTION_CANCELED` | 403 | This subscription has been canceled and cannot be modified. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `subscription.created` | New subscription created | `subscription_id`, `customer_id`, `plan_id`, `billing_cycle`, `status` |
| `subscription.upgraded` | Subscription plan upgraded to a higher tier | `subscription_id`, `old_plan`, `new_plan`, `proration_amount` |
| `subscription.downgraded` | Subscription plan downgraded to a lower tier | `subscription_id`, `old_plan`, `new_plan`, `effective_date` |
| `subscription.canceled` | Subscription cancellation initiated | `subscription_id`, `customer_id`, `effective_date`, `cancel_mode` |
| `subscription.renewed` | Subscription successfully renewed for a new period | `subscription_id`, `plan_id`, `amount_charged` |
| `subscription.payment_failed` | Recurring payment failed, dunning process initiated or continued | `subscription_id`, `customer_id`, `attempt_number`, `next_retry_date` |
| `subscription.trial_ending` | Trial period ending within 3 days | `subscription_id`, `customer_id`, `trial_ends_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payment-methods | required | Subscription billing requires a saved payment method for recurring charges |
| invoicing-payments | required | Each billing cycle generates an invoice |
| currency-conversion | optional | Multi-currency subscription pricing |
| refunds-returns | optional | Prorated refunds on mid-cycle cancellations |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Subscription Billing Blueprint",
  "description": "Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling.. 11 fields. 11 outcomes. 5 erro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "subscriptions, recurring-billing, plans, trials, dunning, proration, saas"
}
</script>
