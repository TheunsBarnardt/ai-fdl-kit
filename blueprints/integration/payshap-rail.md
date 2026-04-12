<!-- AUTO-GENERATED FROM payshap-rail.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Payshap Rail

> Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling

**Category:** Integration · **Version:** 1.0.0 · **Tags:** payments · real-time · instant-payment · credit-push · proxy-resolution

## What this does

Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **transaction_id** *(token, required)* — Transaction ID
- **uetr** *(token, required)* — UETR
- **merchant_reference** *(text, required)* — Merchant Reference
- **source_proxy** *(text, required)* — Source Proxy
- **source_proxy_type** *(select, required)* — Source Proxy Type
- **destination_proxy** *(text, required)* — Destination Proxy
- **destination_proxy_type** *(select, required)* — Destination Proxy Type
- **amount** *(number, required)* — Amount
- **currency** *(text, required)* — Currency
- **status** *(select, required)* — Payment Status
- **initiated_at** *(datetime, required)* — Initiated At
- **settled_at** *(datetime, optional)* — Settled At
- **failure_reason** *(text, optional)* — Failure Reason
- **retry_count** *(number, optional)* — Retry Count

## What must be true

- **proxy_resolution → required_before_payment:** Proxy must be resolved to a valid account before submitting credit push
- **proxy_resolution → resolution_timeout:** Proxy resolution must complete within 3 seconds
- **sla → end_to_end_max:** 10 seconds from initiation to settlement confirmation
- **sla → retry_window:** Failed payments may be retried within 60 seconds
- **transaction_limits → single_transaction_max:** R5,000 per transaction
- **transaction_limits → daily_limit:** R25,000 per merchant per day
- **idempotency → duplicate_prevention:** Each transaction_id + uetr combination is unique — duplicate submissions return the original result
- **security → tls_required:** All communication must use TLS 1.2 or higher
- **security → oauth2_required:** API authentication via OAuth 2.0 bearer tokens
- **security → audit_trail:** Every transaction state change must be logged with timestamp and actor
- **currency → zar_only:** Only ZAR (South African Rand) is supported for domestic real-time payments

## Success & failure scenarios

**✅ Success paths**

- **Proxy Resolved** — when Payment request received with valid destination proxy; Destination proxy is provided, then Destination account resolved — ready to submit credit push.
- **Payment Submitted** — when Proxy has been resolved; Amount is within single-transaction limit, then Credit push submitted to clearing system — awaiting settlement confirmation.
- **Payment Settled** — when Payment has been submitted; Positive response received from clearing system, then Payment confirmed — funds transferred to destination account.
- **Payment Reversed** — when Payment was previously settled; Reversal is authorized by manager, then Payment reversed — funds returned to source account.

**❌ Failure paths**

- **Proxy Not Found** — when Destination proxy was provided; Proxy resolution returns no matching account, then Payment failed — destination proxy is not registered in the system. *(error: `PAYSHAP_PROXY_NOT_FOUND`)*
- **Insufficient Funds** — when Payment was submitted; Clearing system rejects due to insufficient funds, then Payment failed — insufficient funds in merchant account. *(error: `PAYSHAP_INSUFFICIENT_FUNDS`)*
- **Daily Limit Exceeded** — when Amount is valid; Merchant's daily transaction total plus this amount exceeds daily limit, then Payment blocked — merchant has exceeded their daily transaction limit. *(error: `PAYSHAP_DAILY_LIMIT_EXCEEDED`)*
- **Payment Timeout** — when status eq "pending" OR status eq "submitted"; No response received within SLA timeout (10 seconds), then Payment timed out — may be retried within the retry window. *(error: `PAYSHAP_TIMEOUT`)*

## Errors it can return

- `PAYSHAP_PROXY_NOT_FOUND` — Destination payment proxy is not registered
- `PAYSHAP_INSUFFICIENT_FUNDS` — Insufficient funds to process this payment
- `PAYSHAP_DAILY_LIMIT_EXCEEDED` — Daily transaction limit has been exceeded
- `PAYSHAP_TIMEOUT` — Payment timed out — please try again
- `PAYSHAP_AMOUNT_EXCEEDED` — Amount exceeds the single-transaction limit
- `PAYSHAP_DUPLICATE_TRANSACTION` — Duplicate transaction — original result returned
- `PAYSHAP_CLEARING_REJECTED` — Payment rejected by the clearing system
- `PAYSHAP_GATEWAY_ERROR` — Payment gateway returned an error
- `PAYSHAP_UNAUTHORIZED` — Authentication failed — invalid or expired credentials

## Connects to

- **clearing-house-outbound-payments** *(required)* — Credit push operations routed through clearing house outbound payment API
- **chp-request-to-pay** *(optional)* — Request-to-pay can be used as an alternative payment initiation method
- **palm-pay** *(recommended)* — Palm vein biometric resolves to a payment proxy for hands-free payment
- **payment-processing** *(recommended)* — General payment processing orchestration that may route to this rail

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/payshap-rail/) · **Spec source:** [`payshap-rail.blueprint.yaml`](./payshap-rail.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
