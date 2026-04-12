<!-- AUTO-GENERATED FROM palm-pay.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Palm Pay

> Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments

**Category:** Payment · **Version:** 1.0.0 · **Tags:** biometric · palm-vein · contactless · hands-free · real-time-payment

## What this does

Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **palm_pay_id** *(token, required)* — Palm Pay Link ID
- **user_id** *(text, required)* — User ID
- **palm_template_ref** *(text, required)* — Palm Template Reference
- **palm_hand** *(select, optional)* — Enrolled Hand
- **payshap_proxy** *(text, required)* — Payment Proxy
- **proxy_type** *(select, required)* — Proxy Type
- **link_status** *(select, required)* — Link Status
- **linked_at** *(datetime, optional)* — Linked At
- **verified_at** *(datetime, optional)* — Verified At
- **daily_limit** *(number, required)* — Daily Spending Limit
- **daily_spent** *(number, optional)* — Daily Amount Spent
- **transaction_limit** *(number, required)* — Per-Transaction Limit

## What must be true

- **enrollment → one_proxy_per_palm:** Each palm template can be linked to exactly one payment proxy
- **enrollment → two_palms_per_user:** A user may enroll up to 2 palms (left and right)
- **enrollment → verification_required:** Proxy ownership must be verified via OTP before link becomes active
- **enrollment → verification_expiry:** Unverified links expire after 24 hours
- **payment → active_link_required:** Palm payment only works when link_status is active
- **payment → amount_check:** Each transaction amount must be within per-transaction limit
- **payment → daily_limit_check:** Daily spent + transaction amount must not exceed daily limit
- **payment → daily_reset:** Daily spent counter resets at midnight local time
- **security → template_never_transmitted:** Palm vein template data never leaves the terminal — only the template reference is sent to backend
- **security → anti_spoofing:** Liveness detection must pass before template matching
- **security → fraud_suspension:** 3 failed matches in 5 minutes triggers temporary suspension review
- **security → biometric_pii:** All biometric data is PII — encryption at rest and access logging required
- **matching → confidence_threshold:** Palm match must exceed configured confidence threshold (default 95%)
- **matching → fallback_to_card:** If palm match fails, terminal should offer card payment as fallback

## Success & failure scenarios

**✅ Success paths**

- **Palm Link Created** — when Customer has completed palm enrollment (template registered); Customer provides a payment proxy; Valid proxy type selected, then Palm-to-proxy link created — OTP sent for verification.
- **Palm Link Verified** — when Link is pending verification; Customer enters correct OTP, then Palm-to-proxy link verified and active — customer can pay by palm.
- **Palm Payment Resolved** — when Customer scans palm at terminal; Palm vein feature extracted and matched against stored templates; Matched palm has an active payment link; Daily spending limit not yet reached, then Palm matched and payment proxy resolved — ready to initiate payment.
- **Palm Payment Completed** — when Payment proxy resolved from palm scan; Amount within per-transaction limit, then Payment completed via palm scan — funds transferred.
- **Palm Link Revoked** — when Customer or admin requests revocation; Link is currently active or suspended, then Palm-to-proxy link permanently revoked.

**❌ Failure paths**

- **Palm Not Registered** — when Customer scans palm at terminal; Palm vein feature does not match any stored template, then Palm not recognized — customer should use card or enroll first. *(error: `PALM_PAY_NOT_REGISTERED`)*
- **Palm Link Inactive** — when Palm matched to a stored template; Palm-to-proxy link is not active, then Palm recognized but payment link is not active — customer should use card. *(error: `PALM_PAY_LINK_INACTIVE`)*
- **Daily Limit Exceeded** — when Palm matched and link is active; Daily spending limit reached, then Daily palm pay limit reached — customer should use card. *(error: `PALM_PAY_DAILY_LIMIT`)*
- **Transaction Limit Exceeded** — when Palm matched and link is active; Amount exceeds per-transaction limit, then Transaction amount exceeds palm pay limit — customer should use card. *(error: `PALM_PAY_TRANSACTION_LIMIT`)*

## Errors it can return

- `PALM_PAY_NOT_REGISTERED` — Palm not recognized — please enroll or use a card
- `PALM_PAY_LINK_INACTIVE` — Palm payment link is not active
- `PALM_PAY_DAILY_LIMIT` — Daily palm payment limit reached — please use a card
- `PALM_PAY_TRANSACTION_LIMIT` — Amount exceeds per-transaction palm payment limit
- `PALM_PAY_VERIFICATION_EXPIRED` — Verification link has expired — please re-enroll
- `PALM_PAY_DUPLICATE_PALM` — This palm is already linked to a payment proxy
- `PALM_PAY_SPOOF_DETECTED` — Liveness check failed — biometric verification rejected

## Connects to

- **biometric-auth** *(required)* — Palm enrollment and authentication powers the biometric side of palm pay
- **palm-vein** *(required)* — Hardware SDK integration for palm vein scanning
- **payshap-rail** *(required)* — Real-time payment rail for executing credit push payments
- **terminal-enrollment** *(recommended)* — At-terminal enrollment flow for walk-up palm registration
- **payment-processing** *(recommended)* — General payment processing that routes palm payments

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/palm-pay/) · **Spec source:** [`palm-pay.blueprint.yaml`](./palm-pay.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
