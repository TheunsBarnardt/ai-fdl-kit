---
title: "Palm Pay Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments. 12 fields. 9 outcomes. 7 error codes. rules: enrollment, pa"
---

# Palm Pay Blueprint

> Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments

| | |
|---|---|
| **Feature** | `palm-pay` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | biometric, palm-vein, contactless, hands-free, real-time-payment |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/palm-pay.blueprint.yaml) |
| **JSON API** | [palm-pay.json]({{ site.baseurl }}/api/blueprints/payment/palm-pay.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Person who enrolls their palm and pays by scanning |
| `terminal_app` | Terminal Application | system | Android terminal app that scans palm and initiates payment |
| `palm_scanner` | Biometric Scanner | external | Built-in palm vein scanning hardware on the terminal |
| `payment_backend` | Payment Backend | system | Server-side system managing palm-to-proxy links and payment routing |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `palm_pay_id` | token | Yes | Palm Pay Link ID |  |
| `user_id` | text | Yes | User ID |  |
| `palm_template_ref` | text | Yes | Palm Template Reference |  |
| `palm_hand` | select | No | Enrolled Hand |  |
| `payshap_proxy` | text | Yes | Payment Proxy | Validations: required |
| `proxy_type` | select | Yes | Proxy Type |  |
| `link_status` | select | Yes | Link Status |  |
| `linked_at` | datetime | No | Linked At |  |
| `verified_at` | datetime | No | Verified At |  |
| `daily_limit` | number | Yes | Daily Spending Limit | Validations: min |
| `daily_spent` | number | No | Daily Amount Spent |  |
| `transaction_limit` | number | Yes | Per-Transaction Limit | Validations: min |

## States

**State field:** `link_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending_verification` | Yes |  |
| `active` |  |  |
| `suspended` |  |  |
| `revoked` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending_verification` | `active` | payment_backend |  |
|  | `active` | `suspended` | payment_backend |  |
|  | `suspended` | `active` | payment_backend |  |
|  | `active` | `revoked` | customer |  |
|  | `suspended` | `revoked` | payment_backend |  |
|  | `pending_verification` | `revoked` | payment_backend |  |

## Rules

- **enrollment:**
  - **one_proxy_per_palm:** Each palm template can be linked to exactly one payment proxy
  - **two_palms_per_user:** A user may enroll up to 2 palms (left and right)
  - **verification_required:** Proxy ownership must be verified via OTP before link becomes active
  - **verification_expiry:** Unverified links expire after 24 hours
- **payment:**
  - **active_link_required:** Palm payment only works when link_status is active
  - **amount_check:** Each transaction amount must be within per-transaction limit
  - **daily_limit_check:** Daily spent + transaction amount must not exceed daily limit
  - **daily_reset:** Daily spent counter resets at midnight local time
- **security:**
  - **template_never_transmitted:** Palm vein template data never leaves the terminal — only the template reference is sent to backend
  - **anti_spoofing:** Liveness detection must pass before template matching
  - **fraud_suspension:** 3 failed matches in 5 minutes triggers temporary suspension review
  - **biometric_pii:** All biometric data is PII — encryption at rest and access logging required
- **matching:**
  - **confidence_threshold:** Palm match must exceed configured confidence threshold (default 95%)
  - **fallback_to_card:** If palm match fails, terminal should offer card payment as fallback

## Outcomes

### Palm_link_created (Priority: 1) | Transaction: atomic

**Given:**
- Customer has completed palm enrollment (template registered)
- `payshap_proxy` (input) exists
- `proxy_type` (input) in `phone,account`

**Then:**
- **create_record** target: `palm_pay_links` — Create palm-to-proxy link in pending verification state
- **transition_state** field: `link_status` to: `pending_verification`
- **call_service** target: `verification.send_otp` — Send OTP to the provided phone number or linked contact
- **emit_event** event: `palm_pay.link.created`

**Result:** Palm-to-proxy link created — OTP sent for verification

### Palm_link_verified (Priority: 2) | Transaction: atomic

**Given:**
- `link_status` (db) eq `pending_verification`
- Customer enters correct OTP

**Then:**
- **transition_state** field: `link_status` from: `pending_verification` to: `active`
- **set_field** target: `verified_at` value: `current timestamp`
- **set_field** target: `linked_at` value: `current timestamp`
- **emit_event** event: `palm_pay.link.verified`

**Result:** Palm-to-proxy link verified and active — customer can pay by palm

### Palm_payment_resolved (Priority: 3)

**Given:**
- Customer scans palm at terminal
- Palm vein feature extracted and matched against stored templates
- `link_status` (db) eq `active`
- `daily_spent` (computed) lt `daily_limit`

**Then:**
- **set_field** target: `payshap_proxy` value: `resolved from matched template` — Retrieve the linked payment proxy for this palm
- **emit_event** event: `palm_pay.payment.resolved`

**Result:** Palm matched and payment proxy resolved — ready to initiate payment

### Palm_payment_completed (Priority: 4) | Transaction: atomic

**Given:**
- Payment proxy resolved from palm scan
- `amount` (input) lte `transaction_limit`

**Then:**
- **call_service** target: `payshap_rail.initiate_payment` — Initiate real-time credit push via payment rail
- **set_field** target: `daily_spent` value: `daily_spent + amount`
- **emit_event** event: `palm_pay.payment.completed`

**Result:** Payment completed via palm scan — funds transferred

### Palm_not_registered (Priority: 5) — Error: `PALM_PAY_NOT_REGISTERED`

**Given:**
- Customer scans palm at terminal
- Palm vein feature does not match any stored template

**Then:**
- **emit_event** event: `palm_pay.palm.not_registered`

**Result:** Palm not recognized — customer should use card or enroll first

### Palm_link_inactive (Priority: 6) — Error: `PALM_PAY_LINK_INACTIVE`

**Given:**
- Palm matched to a stored template
- `link_status` (db) neq `active`

**Then:**
- **emit_event** event: `palm_pay.link.inactive`

**Result:** Palm recognized but payment link is not active — customer should use card

### Daily_limit_exceeded (Priority: 7) — Error: `PALM_PAY_DAILY_LIMIT`

**Given:**
- Palm matched and link is active
- `daily_spent` (computed) gte `daily_limit`

**Then:**
- **emit_event** event: `palm_pay.limit.exceeded`

**Result:** Daily palm pay limit reached — customer should use card

### Transaction_limit_exceeded (Priority: 8) — Error: `PALM_PAY_TRANSACTION_LIMIT`

**Given:**
- Palm matched and link is active
- `amount` (input) gt `transaction_limit`

**Then:**
- **emit_event** event: `palm_pay.transaction_limit.exceeded`

**Result:** Transaction amount exceeds palm pay limit — customer should use card

### Palm_link_revoked (Priority: 9)

**Given:**
- Customer or admin requests revocation
- `link_status` (db) in `active,suspended`

**Then:**
- **transition_state** field: `link_status` from: `active` to: `revoked`
- **emit_event** event: `palm_pay.link.revoked`

**Result:** Palm-to-proxy link permanently revoked

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PALM_PAY_NOT_REGISTERED` | 404 | Palm not recognized — please enroll or use a card | No |
| `PALM_PAY_LINK_INACTIVE` | 403 | Palm payment link is not active | No |
| `PALM_PAY_DAILY_LIMIT` | 429 | Daily palm payment limit reached — please use a card | No |
| `PALM_PAY_TRANSACTION_LIMIT` | 400 | Amount exceeds per-transaction palm payment limit | No |
| `PALM_PAY_VERIFICATION_EXPIRED` | 410 | Verification link has expired — please re-enroll | No |
| `PALM_PAY_DUPLICATE_PALM` | 409 | This palm is already linked to a payment proxy | No |
| `PALM_PAY_SPOOF_DETECTED` | 403 | Liveness check failed — biometric verification rejected | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `palm_pay.link.created` | Palm-to-proxy link created, pending verification | `palm_pay_id`, `user_id`, `proxy_type` |
| `palm_pay.link.verified` | Palm-to-proxy link verified and active | `palm_pay_id`, `user_id`, `payshap_proxy` |
| `palm_pay.payment.resolved` | Palm scanned and payment proxy resolved | `palm_pay_id`, `user_id`, `payshap_proxy`, `proxy_type` |
| `palm_pay.payment.completed` | Payment completed via palm scan | `palm_pay_id`, `user_id`, `amount`, `payshap_proxy` |
| `palm_pay.palm.not_registered` | Palm scan did not match any registered template | `terminal_id` |
| `palm_pay.link.inactive` | Matched palm has inactive payment link | `palm_pay_id`, `user_id`, `link_status` |
| `palm_pay.limit.exceeded` | Daily spending limit exceeded | `palm_pay_id`, `user_id`, `daily_spent`, `daily_limit` |
| `palm_pay.transaction_limit.exceeded` | Per-transaction limit exceeded | `palm_pay_id`, `user_id`, `amount`, `transaction_limit` |
| `palm_pay.link.revoked` | Palm-to-proxy link permanently revoked | `palm_pay_id`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| biometric-auth | required | Palm enrollment and authentication powers the biometric side of palm pay |
| palm-vein | required | Hardware SDK integration for palm vein scanning |
| payshap-rail | required | Real-time payment rail for executing credit push payments |
| terminal-enrollment | recommended | At-terminal enrollment flow for walk-up palm registration |
| payment-processing | recommended | General payment processing that routes palm payments |

## AGI Readiness

### Goals

#### Reliable Palm Pay

Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments

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
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | financial transactions must be precise and auditable |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `biometric_auth` | biometric-auth | fail |
| `palm_vein` | palm-vein | fail |
| `payshap_rail` | payshap-rail | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| palm_link_created | `supervised` | - | - |
| palm_link_verified | `autonomous` | - | - |
| palm_payment_resolved | `autonomous` | - | - |
| palm_payment_completed | `autonomous` | - | - |
| palm_not_registered | `autonomous` | - | - |
| palm_link_inactive | `autonomous` | - | - |
| daily_limit_exceeded | `autonomous` | - | - |
| transaction_limit_exceeded | `autonomous` | - | - |
| palm_link_revoked | `human_required` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Palm Pay Blueprint",
  "description": "Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments. 12 fields. 9 outcomes. 7 error codes. rules: enrollment, pa",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "biometric, palm-vein, contactless, hands-free, real-time-payment"
}
</script>
