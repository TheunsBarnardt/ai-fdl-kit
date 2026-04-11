<!-- AUTO-GENERATED FROM payment-gateway.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payment Gateway

> Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates

**Category:** Integration · **Version:** 1.0.0 · **Tags:** payments · gateway · transactions · pci · financial

## What this does

Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **amount** *(number, required)* — Payment amount in smallest currency unit (e.g., cents)
- **currency** *(text, required)* — ISO 4217 currency code (e.g., USD, EUR, GBP)
- **payment_method_token** *(token, required)* — Tokenized payment method (never raw card data)
- **description** *(text, optional)* — Human-readable payment description
- **metadata** *(json, optional)* — Arbitrary key-value metadata attached to the payment
- **idempotency_key** *(text, required)* — Unique key to prevent duplicate charges
- **status** *(select, optional)* — Current payment status
- **provider_transaction_id** *(text, optional)* — Transaction ID from the payment provider
- **failure_code** *(text, optional)* — Provider-specific failure code
- **failure_message** *(text, optional)* — Human-readable failure description
- **three_d_secure_status** *(select, optional)* — 3D Secure authentication status
- **refund_amount** *(number, optional)* — Amount to refund (partial or full)

## What must be true

- **idempotency:** Every mutation (charge, capture, void, refund) must include an idempotency_key, Duplicate requests with same idempotency_key return the original response without re-processing, Idempotency keys expire after 24 hours
- **pci_compliance:** Raw card numbers, CVV, and magnetic stripe data must never be logged, stored, or transmitted, Only tokenized payment methods (payment_method_token) are accepted, All payment API communication occurs over TLS 1.2+
- **three_d_secure:** 3D Secure authentication required for card-not-present transactions when mandated by issuer, If 3D Secure fails, payment may proceed at merchant's risk (liability shift)
- **webhook_verification:** All provider webhook payloads must be verified via HMAC signature before processing, Webhook events update payment status asynchronously
- **amounts:** Amount must be a positive integer in smallest currency unit (cents, pence, etc.), Refund amount must not exceed original captured amount, Partial refunds allowed; total refunds must not exceed captured amount
- **authorization:** Authorization holds expire after 7 days if not captured, Voiding releases the hold immediately; only authorized (uncaptured) payments can be voided

## Success & failure scenarios

**✅ Success paths**

- **Payment Authorized** — when amount gt 0; payment_method_token exists; idempotency_key exists, then Payment authorized; funds held on customer payment method pending capture.
- **Payment Captured** — when status eq "authorized"; Capture request received within authorization hold period, then Payment captured; funds transferred from customer to merchant.
- **Payment Voided** — when status eq "authorized"; Void request received before capture, then Authorization voided; hold released on customer payment method.
- **Payment Refunded** — when status in ["captured","partially_refunded"]; refund_amount gt 0, then Refund processed; funds returned to customer payment method within 5-10 business days.
- **Duplicate Request** — when Request with same idempotency_key already processed, then Original response returned without re-processing the payment.

**❌ Failure paths**

- **Payment Failed Declined** — when Payment provider declines the transaction (insufficient funds, fraud, expired card), then Payment declined; failure code and message returned to caller. *(error: `PAYMENT_DECLINED`)*
- **Payment Failed 3ds** — when three_d_secure_status eq "failed", then 3D Secure authentication failed; payment not processed. *(error: `THREE_D_SECURE_FAILED`)*
- **Payment Failed Invalid Token** — when payment_method_token is expired, revoked, or does not exist, then Payment rejected; customer must provide a new payment method. *(error: `INVALID_PAYMENT_TOKEN`)*
- **Refund Exceeds Captured** — when Refund amount exceeds remaining captured amount, then Refund rejected; amount exceeds what is available to refund. *(error: `REFUND_EXCEEDS_AMOUNT`)*

## Errors it can return

- `PAYMENT_DECLINED` — Payment was declined by the issuer. Try a different payment method.
- `THREE_D_SECURE_FAILED` — 3D Secure authentication failed. Payment cannot be processed.
- `INVALID_PAYMENT_TOKEN` — Payment method token is invalid or expired. Provide a new payment method.
- `REFUND_EXCEEDS_AMOUNT` — Refund amount exceeds the captured payment amount.
- `AUTHORIZATION_EXPIRED` — Authorization hold has expired. Create a new payment authorization.
- `VOID_NOT_ALLOWED` — Payment cannot be voided. Only authorized (uncaptured) payments can be voided.
- `WEBHOOK_SIGNATURE_INVALID` — Webhook signature verification failed. Payload may have been tampered with.

## Connects to

- **webhook-ingestion** *(required)* — Receive async payment status updates from provider webhooks
- **api-gateway** *(recommended)* — Route payment API requests through gateway with rate limiting

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/payment-gateway/) · **Spec source:** [`payment-gateway.blueprint.yaml`](./payment-gateway.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
