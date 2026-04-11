<!-- AUTO-GENERATED FROM subscription-billing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Subscription Billing

> Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** subscriptions · recurring-billing · plans · trials · dunning · proration · saas

## What this does

Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling.

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **subscription_id** *(text, required)* — Subscription ID
- **customer_id** *(text, required)* — Customer ID
- **plan_id** *(select, required)* — Plan
- **billing_cycle** *(select, required)* — Billing Cycle
- **trial_ends_at** *(datetime, optional)* — Trial End Date
- **current_period_start** *(datetime, required)* — Current Period Start
- **current_period_end** *(datetime, required)* — Current Period End
- **status** *(select, required)* — Subscription Status
- **cancel_at_period_end** *(boolean, optional)* — Cancel at Period End
- **payment_method_id** *(text, optional)* — Payment Method
- **dunning_attempts** *(number, optional)* — Failed Payment Retry Count

## What must be true

- **trial_default_duration:** Free trial defaults to 14 days from subscription creation. Trial can be skipped if customer opts out or plan does not offer trials.
- **proration_on_plan_change:** When upgrading or downgrading mid-cycle, prorate the charge based on remaining days in the current billing period. Upgrades charge the difference immediately; downgrades credit toward next invoice.
- **dunning_retry_schedule:** Failed payments are retried 3 times over 7 days (day 1, day 3, day 7). Each retry sends an email notification to the customer.
- **grace_period:** After entering past_due status, the customer retains access for the remainder of the dunning window (7 days) before suspension.
- **cancellation_modes:** Immediate cancellation revokes access at once. End-of-period cancellation sets cancel_at_period_end to true and revokes access when the current billing period expires.
- **annual_discount:** Annual billing cycle applies a discount (typically 16-20% off the equivalent monthly rate). The exact discount is configured per plan.
- **one_subscription_per_customer:** A customer may hold only one active subscription at a time. Upgrading or downgrading modifies the existing subscription.

## Success & failure scenarios

**✅ Success paths**

- **Subscription Created** — when customer selects a plan and billing cycle; customer provides a valid payment method, then Subscription created, trial period begins (or active if no trial).
- **Trial Converted** — when status eq "trialing"; trial_ends_at has passed; valid payment method on file, then Trial converts to paid subscription, first charge processed.
- **Subscription Upgraded** — when status eq "active"; customer selects a higher-tier plan, then Plan upgraded, prorated charge applied immediately.
- **Subscription Downgraded** — when status eq "active"; customer selects a lower-tier plan, then Downgrade scheduled for next billing period, credit applied.
- **Subscription Renewed** — when status eq "active"; current_period_end has passed; payment charge succeeds, then Subscription renewed for a new billing period.
- **Payment Failed** — when status eq "active"; recurring payment charge fails, then Subscription enters past_due, dunning process begins.
- **Dunning Retry Succeeded** — when status eq "past_due"; payment retry succeeds within dunning window, then Payment recovered, subscription reactivated.
- **Trial Ending Notification** — when status eq "trialing"; trial_ends_at is within 3 days, then Customer notified of upcoming trial expiration.

**❌ Failure paths**

- **No Payment Method** — when customer attempts to subscribe to a paid plan; payment_method_id not_exists, then Subscription cannot proceed without a valid payment method. *(error: `SUBSCRIPTION_NO_PAYMENT_METHOD`)*
- **Dunning Exhausted** — when status eq "past_due"; dunning_attempts gte 3, then All retry attempts failed, subscription suspended. *(error: `SUBSCRIPTION_DUNNING_EXHAUSTED`)*
- **Subscription Canceled** — when customer requests cancellation; status eq "active" OR status eq "trialing", then Subscription marked for cancellation. *(error: `SUBSCRIPTION_CANCELED`)*

## Errors it can return

- `SUBSCRIPTION_NO_PAYMENT_METHOD` — A valid payment method is required to subscribe to a paid plan.
- `SUBSCRIPTION_DUNNING_EXHAUSTED` — All payment retry attempts have been exhausted. Please update your payment method.
- `SUBSCRIPTION_ALREADY_ACTIVE` — An active subscription already exists. Please modify or cancel the current subscription.
- `SUBSCRIPTION_PLAN_INVALID` — The selected plan is not available for this account.
- `SUBSCRIPTION_CANCELED` — This subscription has been canceled and cannot be modified.

## Connects to

- **payment-methods** *(required)* — Subscription billing requires a saved payment method for recurring charges
- **invoicing-payments** *(required)* — Each billing cycle generates an invoice
- **currency-conversion** *(optional)* — Multi-currency subscription pricing
- **refunds-returns** *(optional)* — Prorated refunds on mid-cycle cancellations

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/subscription-billing/) · **Spec source:** [`subscription-billing.blueprint.yaml`](./subscription-billing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
