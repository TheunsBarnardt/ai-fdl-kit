<!-- AUTO-GENERATED FROM payment-methods.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payment Methods

> Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.

**Category:** Payment · **Version:** 1.0.0 · **Tags:** payment-methods · tokenization · pci-dss · cards · wallets · apple-pay · google-pay

## What this does

Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **method_id** *(text, required)* — Payment Method ID
- **customer_id** *(text, required)* — Customer ID
- **type** *(select, required)* — Payment Method Type
- **last_four** *(text, required)* — Last Four Digits
- **brand** *(select, optional)* — Card Brand
- **exp_month** *(number, optional)* — Expiration Month
- **exp_year** *(number, optional)* — Expiration Year
- **is_default** *(boolean, required)* — Default Payment Method
- **billing_address** *(json, optional)* — Billing Address
- **token** *(token, required)* — Payment Provider Token
- **wallet_type** *(select, optional)* — Wallet Type
- **fingerprint** *(text, optional)* — Card Fingerprint
- **status** *(select, required)* — Method Status

## What must be true

- **never_store_raw_card_data:** Raw card numbers (PAN), CVV, and magnetic stripe data must never be stored, logged, or transmitted through the application. All card data is tokenized by the payment provider before reaching the server. PCI DSS Level 1 compliance required.
- **luhn_check:** Card numbers are validated client-side using the Luhn algorithm before submission to the payment provider for tokenization.
- **one_default_per_customer:** Each customer may have exactly one default payment method. Setting a new default automatically unsets the previous one.
- **duplicate_detection:** Duplicate cards are detected using the card fingerprint (hash of card number). Adding a card with the same fingerprint is rejected.
- **expiry_monitoring:** Cards expiring within 30 days trigger a notification to the customer. Expired cards are marked with status "expired" and cannot be used for new charges.
- **secure_deletion:** Removing a payment method revokes the token with the payment provider and deletes the local record. Token revocation is confirmed before local deletion.
- **wallet_verification:** Digital wallet payment methods (Apple Pay, Google Pay) are verified through the wallet provider's authentication flow. Device-specific tokens are used for charges.
- **max_payment_methods:** A customer may store a maximum of 10 payment methods. Attempting to add beyond this limit returns an error.

## Success & failure scenarios

**✅ Success paths**

- **Payment Method Added** — when customer submits card details via secure form; card passes Luhn validation; payment provider returns a valid token; card fingerprint is not a duplicate, then Payment method tokenized and saved securely.
- **Wallet Added** — when customer initiates wallet setup (Apple Pay, Google Pay); wallet provider authentication succeeds; device token received, then Digital wallet linked as payment method.
- **Payment Method Removed** — when customer requests removal of a payment method; payment method is not the sole method on an active subscription, then Payment method removed and token revoked.
- **Default Changed** — when customer sets a different payment method as default; target payment method is active and not expired, then Default payment method updated.
- **Expiring Card Notification** — when type eq "card"; card expires within 30 days, then Customer notified of upcoming card expiration.
- **Card Expired** — when type eq "card"; current date is past card expiry, then Card marked as expired, removed from default if applicable.

**❌ Failure paths**

- **Duplicate Card** — when customer adds a card; card fingerprint matches an existing active payment method, then Duplicate card rejected. *(error: `PAYMENT_METHOD_DUPLICATE`)*
- **Method Limit Reached** — when customer attempts to add a payment method; customer already has 10 active payment methods, then Cannot add more payment methods, limit reached. *(error: `PAYMENT_METHOD_LIMIT_REACHED`)*

## Errors it can return

- `PAYMENT_METHOD_DUPLICATE` — This card is already saved to your account.
- `PAYMENT_METHOD_LIMIT_REACHED` — You have reached the maximum number of saved payment methods (10).
- `PAYMENT_METHOD_INVALID_CARD` — The card number is invalid. Please check and try again.
- `PAYMENT_METHOD_EXPIRED` — This payment method has expired and cannot be used for charges.
- `PAYMENT_METHOD_TOKENIZATION_FAILED` — Unable to securely process this payment method. Please try again.
- `PAYMENT_METHOD_REMOVAL_BLOCKED` — This payment method cannot be removed because it is linked to an active subscription.

## Connects to

- **subscription-billing** *(required)* — Subscriptions charge against saved payment methods
- **cart-checkout** *(required)* — Checkout uses saved or new payment methods
- **refunds-returns** *(optional)* — Refunds issued to original payment method
- **invoicing-payments** *(optional)* — Invoice payments may use saved methods

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/payment-methods/) · **Spec source:** [`payment-methods.blueprint.yaml`](./payment-methods.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
