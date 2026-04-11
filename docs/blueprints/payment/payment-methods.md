---
title: "Payment Methods Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.. 13 fields. 8 outcomes. 6 "
---

# Payment Methods Blueprint

> Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.

| | |
|---|---|
| **Feature** | `payment-methods` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | payment-methods, tokenization, pci-dss, cards, wallets, apple-pay, google-pay |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/payment-methods.blueprint.yaml) |
| **JSON API** | [payment-methods.json]({{ site.baseurl }}/api/blueprints/payment/payment-methods.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `method_id` | text | Yes | Payment Method ID | Validations: pattern |
| `customer_id` | text | Yes | Customer ID |  |
| `type` | select | Yes | Payment Method Type |  |
| `last_four` | text | Yes | Last Four Digits | Validations: pattern |
| `brand` | select | No | Card Brand |  |
| `exp_month` | number | No | Expiration Month | Validations: min, max |
| `exp_year` | number | No | Expiration Year | Validations: min |
| `is_default` | boolean | Yes | Default Payment Method |  |
| `billing_address` | json | No | Billing Address |  |
| `token` | token | Yes | Payment Provider Token |  |
| `wallet_type` | select | No | Wallet Type |  |
| `fingerprint` | text | No | Card Fingerprint |  |
| `status` | select | Yes | Method Status |  |

## Rules

- **never_store_raw_card_data:**
  - **description:** Raw card numbers (PAN), CVV, and magnetic stripe data must never be stored, logged, or transmitted through the application. All card data is tokenized by the payment provider before reaching the server. PCI DSS Level 1 compliance required.

- **luhn_check:**
  - **description:** Card numbers are validated client-side using the Luhn algorithm before submission to the payment provider for tokenization.

- **one_default_per_customer:**
  - **description:** Each customer may have exactly one default payment method. Setting a new default automatically unsets the previous one.

- **duplicate_detection:**
  - **description:** Duplicate cards are detected using the card fingerprint (hash of card number). Adding a card with the same fingerprint is rejected.

- **expiry_monitoring:**
  - **description:** Cards expiring within 30 days trigger a notification to the customer. Expired cards are marked with status "expired" and cannot be used for new charges.

- **secure_deletion:**
  - **description:** Removing a payment method revokes the token with the payment provider and deletes the local record. Token revocation is confirmed before local deletion.

- **wallet_verification:**
  - **description:** Digital wallet payment methods (Apple Pay, Google Pay) are verified through the wallet provider's authentication flow. Device-specific tokens are used for charges.

- **max_payment_methods:**
  - **description:** A customer may store a maximum of 10 payment methods. Attempting to add beyond this limit returns an error.


## Outcomes

### Payment_method_added (Priority: 1) — Error: `PAYMENT_METHOD_INVALID_CARD`

**Given:**
- customer submits card details via secure form
- card passes Luhn validation
- payment provider returns a valid token
- card fingerprint is not a duplicate

**Then:**
- **create_record** target: `payment_method` — Payment method stored with token, last four, brand, and expiry
- **set_field** target: `is_default` value: `true` when: `existing_method_count == 0`
- **emit_event** event: `payment_method.added`

**Result:** Payment method tokenized and saved securely

### Duplicate_card (Priority: 1) — Error: `PAYMENT_METHOD_DUPLICATE`

**Given:**
- customer adds a card
- card fingerprint matches an existing active payment method

**Then:**
- **notify** — Inform customer this card is already on file

**Result:** Duplicate card rejected

### Wallet_added (Priority: 2)

**Given:**
- customer initiates wallet setup (Apple Pay, Google Pay)
- wallet provider authentication succeeds
- device token received

**Then:**
- **create_record** target: `payment_method` — Wallet payment method created with device token
- **emit_event** event: `payment_method.added`

**Result:** Digital wallet linked as payment method

### Method_limit_reached (Priority: 2) — Error: `PAYMENT_METHOD_LIMIT_REACHED`

**Given:**
- customer attempts to add a payment method
- customer already has 10 active payment methods

**Then:**
- **notify** — Inform customer of the payment method limit

**Result:** Cannot add more payment methods, limit reached

### Payment_method_removed (Priority: 3) — Error: `PAYMENT_METHOD_EXPIRED`

**Given:**
- customer requests removal of a payment method
- payment method is not the sole method on an active subscription

**Then:**
- **call_service** target: `payment_provider` — Revoke token with payment provider
- **delete_record** target: `payment_method` — Local record removed after token revocation confirmed
- **emit_event** event: `payment_method.removed`

**Result:** Payment method removed and token revoked

### Default_changed (Priority: 4)

**Given:**
- customer sets a different payment method as default
- target payment method is active and not expired

**Then:**
- **set_field** target: `is_default` value: `false` — Previous default unset
- **set_field** target: `is_default` value: `true` — New default set
- **emit_event** event: `payment_method.default_changed`

**Result:** Default payment method updated

### Expiring_card_notification (Priority: 5)

**Given:**
- `type` eq `card`
- card expires within 30 days

**Then:**
- **emit_event** event: `payment_method.expiring`
- **notify** — Notify customer to update their expiring card

**Result:** Customer notified of upcoming card expiration

### Card_expired (Priority: 6)

**Given:**
- `type` eq `card`
- current date is past card expiry

**Then:**
- **set_field** target: `status` value: `expired`
- **set_field** target: `is_default` value: `false` when: `is_default == true` — Expired card cannot remain as default

**Result:** Card marked as expired, removed from default if applicable

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAYMENT_METHOD_DUPLICATE` | 409 | This card is already saved to your account. | No |
| `PAYMENT_METHOD_LIMIT_REACHED` | 400 | You have reached the maximum number of saved payment methods (10). | No |
| `PAYMENT_METHOD_INVALID_CARD` | 400 | The card number is invalid. Please check and try again. | No |
| `PAYMENT_METHOD_EXPIRED` | 400 | This payment method has expired and cannot be used for charges. | No |
| `PAYMENT_METHOD_TOKENIZATION_FAILED` | 500 | Unable to securely process this payment method. Please try again. | No |
| `PAYMENT_METHOD_REMOVAL_BLOCKED` | 409 | This payment method cannot be removed because it is linked to an active subscription. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payment_method.added` | New payment method saved to customer account | `method_id`, `customer_id`, `type`, `brand`, `last_four` |
| `payment_method.removed` | Payment method removed and token revoked | `method_id`, `customer_id`, `type` |
| `payment_method.default_changed` | Customer changed their default payment method | `method_id`, `customer_id`, `previous_default_id` |
| `payment_method.expiring` | Payment method expiring within 30 days | `method_id`, `customer_id`, `exp_month`, `exp_year` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| subscription-billing | required | Subscriptions charge against saved payment methods |
| cart-checkout | required | Checkout uses saved or new payment methods |
| refunds-returns | optional | Refunds issued to original payment method |
| invoicing-payments | optional | Invoice payments may use saved methods |

## AGI Readiness

### Goals

#### Reliable Payment Methods

Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `subscription_billing` | subscription-billing | fail |
| `cart_checkout` | cart-checkout | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| payment_method_added | `autonomous` | - | - |
| wallet_added | `autonomous` | - | - |
| payment_method_removed | `human_required` | - | - |
| default_changed | `supervised` | - | - |
| expiring_card_notification | `autonomous` | - | - |
| card_expired | `autonomous` | - | - |
| duplicate_card | `autonomous` | - | - |
| method_limit_reached | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Payment Methods Blueprint",
  "description": "Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support.. 13 fields. 8 outcomes. 6 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "payment-methods, tokenization, pci-dss, cards, wallets, apple-pay, google-pay"
}
</script>
