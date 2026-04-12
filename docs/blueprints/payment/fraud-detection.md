---
title: "Fraud Detection Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals. 18 fields. 7 outcomes. 5 e"
---

# Fraud Detection Blueprint

> Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals

| | |
|---|---|
| **Feature** | `fraud-detection` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | fraud, risk-scoring, security, velocity, anomaly-detection |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/fraud-detection.blueprint.yaml) |
| **JSON API** | [fraud-detection.json]({{ site.baseurl }}/api/blueprints/payment/fraud-detection.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `terminal_app` | Terminal Application | system | Submits transactions for risk scoring before processing |
| `risk_engine` | Risk Engine | system | Evaluates transactions against fraud rules and ML models |
| `fraud_analyst` | Fraud Analyst | human | Reviews flagged transactions and makes final decisions |
| `fleet_admin` | Fleet Administrator | human | Manages whitelists, blacklists, and risk thresholds |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `risk_assessment_id` | token | Yes | Risk Assessment ID |  |
| `transaction_id` | token | Yes | Transaction ID |  |
| `terminal_id` | text | Yes | Terminal ID |  |
| `merchant_id` | text | Yes | Merchant ID |  |
| `payment_method` | select | Yes | Payment Method |  |
| `amount` | number | Yes | Transaction Amount | Validations: min |
| `risk_score` | number | No | Risk Score (0-100) | Validations: min, max |
| `risk_verdict` | select | Yes | Risk Verdict |  |
| `risk_factors` | json | No | Risk Factors |  |
| `velocity_window_minutes` | number | Yes | Velocity Check Window (minutes) |  |
| `velocity_max_count` | number | Yes | Max Transactions in Window |  |
| `velocity_max_amount` | number | Yes | Max Amount in Window |  |
| `auto_block_threshold` | number | Yes | Auto-Block Risk Score Threshold |  |
| `flag_threshold` | number | Yes | Flag for Review Threshold |  |
| `review_status` | select | No | Review Status |  |
| `reviewer_id` | text | No | Reviewer ID |  |
| `review_notes` | text | No | Review Notes |  |
| `device_fingerprint` | text | No | Device Fingerprint |  |

## States

**State field:** `review_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `scoring` | Yes |  |
| `approved` |  | Yes |
| `flagged` |  |  |
| `blocked` |  | Yes |
| `under_review` |  |  |
| `cleared` |  | Yes |
| `confirmed_fraud` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `scoring` | `approved` | risk_engine |  |
|  | `scoring` | `flagged` | risk_engine |  |
|  | `scoring` | `blocked` | risk_engine |  |
|  | `flagged` | `under_review` | fraud_analyst |  |
|  | `under_review` | `cleared` | fraud_analyst |  |
|  | `under_review` | `confirmed_fraud` | fraud_analyst |  |
|  | `blocked` | `under_review` | fraud_analyst |  |

## Rules

- **velocity_checks:**
  - **transaction_count:** Block if more than velocity_max_count transactions from same proxy/card in velocity_window_minutes
  - **amount_total:** Block if total amount from same proxy/card in velocity_window_minutes exceeds velocity_max_amount
  - **terminal_velocity:** Flag if single terminal processes more than 30 transactions in 5 minutes
- **amount_anomaly:**
  - **customer_average:** Flag if transaction amount exceeds 3x the customer's 30-day average
  - **merchant_average:** Flag if transaction amount exceeds 5x the merchant's typical transaction size
  - **round_number:** Add risk points for suspiciously round amounts (e.g., R1,000, R5,000)
- **device_trust:**
  - **known_terminal:** Reduce risk score for transactions from registered, healthy terminals
  - **unknown_device:** Block transactions from unregistered terminal IDs
  - **tampered_device:** Auto-block transactions from terminals reporting tamper alerts
- **geographic:**
  - **location_change:** Flag if same proxy/card used at terminals more than 100km apart within 30 minutes
  - **known_location:** Reduce risk score for transactions at customer's usual locations
- **thresholds:**
  - **auto_approve:** Risk score 0-59: approve without review
  - **flag_for_review:** Risk score 60-84: allow transaction but queue for analyst review
  - **auto_block:** Risk score 85-100: block transaction immediately
- **blacklist:**
  - **proxy_blacklist:** Permanently block transactions from blacklisted PayShap proxies
  - **card_blacklist:** Permanently block transactions from blacklisted card fingerprints
  - **terminal_blacklist:** Permanently block transactions from blacklisted terminal IDs
- **whitelist:**
  - **trusted_proxy:** Skip velocity checks for whitelisted proxies (e.g., corporate accounts)
  - **trusted_terminal:** Reduce risk score by 10 points for whitelisted terminals
- **palm_specific:**
  - **failed_match_velocity:** 3 failed palm matches in 5 minutes triggers proxy suspension review
  - **spoof_detection:** Liveness check failure adds 50 risk points

## Outcomes

### Transaction_approved (Priority: 1)

**Given:**
- Transaction submitted for risk assessment
- `risk_score` (computed) lt `60`

**Then:**
- **set_field** target: `risk_verdict` value: `approved`
- **transition_state** field: `review_status` from: `scoring` to: `approved`
- **emit_event** event: `fraud.transaction.approved`

**Result:** Transaction approved — proceed to payment processing

### Transaction_flagged (Priority: 2)

**Given:**
- Transaction submitted for risk assessment
- `risk_score` (computed) gte `60`
- `risk_score` (computed) lt `85`

**Then:**
- **set_field** target: `risk_verdict` value: `flagged`
- **transition_state** field: `review_status` from: `scoring` to: `flagged`
- **notify** — Add to fraud analyst review queue
- **emit_event** event: `fraud.transaction.flagged`

**Result:** Transaction allowed but queued for analyst review

### Transaction_blocked (Priority: 3) — Error: `FRAUD_TRANSACTION_BLOCKED`

**Given:**
- Transaction submitted for risk assessment
- `risk_score` (computed) gte `85`

**Then:**
- **set_field** target: `risk_verdict` value: `blocked`
- **transition_state** field: `review_status` from: `scoring` to: `blocked`
- **notify** — Alert fraud team of blocked transaction
- **emit_event** event: `fraud.transaction.blocked`

**Result:** Transaction blocked — customer informed, analyst notified

### Velocity_exceeded (Priority: 4) — Error: `FRAUD_VELOCITY_EXCEEDED`

**Given:**
- Transaction submitted for risk assessment
- Transaction count or amount from same source exceeds velocity limits within window

**Then:**
- **set_field** target: `risk_verdict` value: `blocked`
- **set_field** target: `risk_score` value: `95`
- **transition_state** field: `review_status` from: `scoring` to: `blocked`
- **emit_event** event: `fraud.velocity.exceeded`

**Result:** Transaction blocked — velocity limit exceeded

### Review_cleared (Priority: 5)

**Given:**
- `review_status` (db) eq `under_review`
- Fraud analyst determines transaction is legitimate

**Then:**
- **transition_state** field: `review_status` from: `under_review` to: `cleared`
- **emit_event** event: `fraud.review.cleared`

**Result:** Transaction cleared after manual review

### Review_confirmed_fraud (Priority: 6) | Transaction: atomic

**Given:**
- `review_status` (db) eq `under_review`
- Fraud analyst confirms fraudulent activity

**Then:**
- **transition_state** field: `review_status` from: `under_review` to: `confirmed_fraud`
- **call_service** target: `palm_pay.suspend_link` — Suspend the palm-pay link if palm payment
- **emit_event** event: `fraud.review.confirmed`

**Result:** Fraud confirmed — proxy/card suspended, investigation opened

### Blacklisted_source (Priority: 7) — Error: `FRAUD_BLACKLISTED`

**Given:**
- Transaction source (proxy, card, or terminal) is on the blacklist

**Then:**
- **set_field** target: `risk_score` value: `100`
- **set_field** target: `risk_verdict` value: `blocked`
- **transition_state** field: `review_status` from: `scoring` to: `blocked`
- **emit_event** event: `fraud.blacklist.hit`

**Result:** Transaction blocked — source is blacklisted

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FRAUD_TRANSACTION_BLOCKED` | 403 | Transaction blocked by fraud detection — contact support | No |
| `FRAUD_VELOCITY_EXCEEDED` | 429 | Too many transactions in a short period — please wait and try again | No |
| `FRAUD_BLACKLISTED` | 403 | This payment method has been blocked | No |
| `FRAUD_DEVICE_UNTRUSTED` | 403 | Transaction from unrecognised terminal | No |
| `FRAUD_SCORING_ERROR` | 500 | Risk scoring service unavailable — transaction held for review | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fraud.transaction.approved` | Transaction passed risk assessment | `risk_assessment_id`, `transaction_id`, `risk_score` |
| `fraud.transaction.flagged` | Transaction allowed but flagged for review | `risk_assessment_id`, `transaction_id`, `risk_score`, `risk_factors` |
| `fraud.transaction.blocked` | Transaction auto-blocked by risk engine | `risk_assessment_id`, `transaction_id`, `risk_score`, `risk_factors` |
| `fraud.velocity.exceeded` | Velocity limit exceeded — transaction blocked | `risk_assessment_id`, `transaction_id`, `velocity_window_minutes` |
| `fraud.review.cleared` | Flagged transaction cleared by analyst | `risk_assessment_id`, `transaction_id`, `reviewer_id` |
| `fraud.review.confirmed` | Fraud confirmed by analyst | `risk_assessment_id`, `transaction_id`, `reviewer_id`, `review_notes` |
| `fraud.blacklist.hit` | Transaction from blacklisted source | `risk_assessment_id`, `transaction_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| palm-pay | recommended | Palm pay transactions are scored for fraud before processing |
| terminal-payment-flow | required | Payment flow calls fraud detection before executing payment |
| payshap-rail | recommended | PayShap transactions scored before credit push |
| payment-gateway | recommended | Card transactions scored before authorisation |
| audit-logging | required | All fraud decisions must be logged in immutable audit trail |

## AGI Readiness

### Goals

#### Reliable Fraud Detection

Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals

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
| `terminal_payment_flow` | terminal-payment-flow | fail |
| `audit_logging` | audit-logging | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| transaction_approved | `supervised` | - | - |
| transaction_flagged | `autonomous` | - | - |
| transaction_blocked | `human_required` | - | - |
| velocity_exceeded | `autonomous` | - | - |
| review_cleared | `autonomous` | - | - |
| review_confirmed_fraud | `autonomous` | - | - |
| blacklisted_source | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fraud Detection Blueprint",
  "description": "Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals. 18 fields. 7 outcomes. 5 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fraud, risk-scoring, security, velocity, anomaly-detection"
}
</script>
