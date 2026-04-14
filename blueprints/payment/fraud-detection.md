<!-- AUTO-GENERATED FROM fraud-detection.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fraud Detection

> Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals

**Category:** Payment · **Version:** 1.0.0 · **Tags:** fraud · risk-scoring · security · velocity · anomaly-detection

## What this does

Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **risk_assessment_id** *(token, required)* — Risk Assessment ID
- **transaction_id** *(token, required)* — Transaction ID
- **terminal_id** *(text, required)* — Terminal ID
- **merchant_id** *(text, required)* — Merchant ID
- **payment_method** *(select, required)* — Payment Method
- **amount** *(number, required)* — Transaction Amount
- **risk_score** *(number, optional)* — Risk Score (0-100)
- **risk_verdict** *(select, required)* — Risk Verdict
- **risk_factors** *(json, optional)* — Risk Factors
- **velocity_window_minutes** *(number, required)* — Velocity Check Window (minutes)
- **velocity_max_count** *(number, required)* — Max Transactions in Window
- **velocity_max_amount** *(number, required)* — Max Amount in Window
- **auto_block_threshold** *(number, required)* — Auto-Block Risk Score Threshold
- **flag_threshold** *(number, required)* — Flag for Review Threshold
- **review_status** *(select, optional)* — Review Status
- **reviewer_id** *(text, optional)* — Reviewer ID
- **review_notes** *(text, optional)* — Review Notes
- **device_fingerprint** *(text, optional)* — Device Fingerprint

## What must be true

- **velocity_checks → transaction_count:** Block if more than velocity_max_count transactions from same proxy/card in velocity_window_minutes
- **velocity_checks → amount_total:** Block if total amount from same proxy/card in velocity_window_minutes exceeds velocity_max_amount
- **velocity_checks → terminal_velocity:** Flag if single terminal processes more than 30 transactions in 5 minutes
- **amount_anomaly → customer_average:** Flag if transaction amount exceeds 3x the customer's 30-day average
- **amount_anomaly → merchant_average:** Flag if transaction amount exceeds 5x the merchant's typical transaction size
- **amount_anomaly → round_number:** Add risk points for suspiciously round amounts (e.g., R1,000, R5,000)
- **device_trust → known_terminal:** Reduce risk score for transactions from registered, healthy terminals
- **device_trust → unknown_device:** Block transactions from unregistered terminal IDs
- **device_trust → tampered_device:** Auto-block transactions from terminals reporting tamper alerts
- **geographic → location_change:** Flag if same proxy/card used at terminals more than 100km apart within 30 minutes
- **geographic → known_location:** Reduce risk score for transactions at customer's usual locations
- **thresholds → auto_approve:** Risk score 0-59: approve without review
- **thresholds → flag_for_review:** Risk score 60-84: allow transaction but queue for analyst review
- **thresholds → auto_block:** Risk score 85-100: block transaction immediately
- **blacklist → proxy_blacklist:** Permanently block transactions from blacklisted PayShap proxies
- **blacklist → card_blacklist:** Permanently block transactions from blacklisted card fingerprints
- **blacklist → terminal_blacklist:** Permanently block transactions from blacklisted terminal IDs
- **whitelist → trusted_proxy:** Skip velocity checks for whitelisted proxies (e.g., corporate accounts)
- **whitelist → trusted_terminal:** Reduce risk score by 10 points for whitelisted terminals
- **palm_specific → failed_match_velocity:** 3 failed palm matches in 5 minutes triggers proxy suspension review
- **palm_specific → spoof_detection:** Liveness check failure adds 50 risk points

## Success & failure scenarios

**✅ Success paths**

- **Transaction Approved** — when Transaction submitted for risk assessment; Risk score below flag threshold, then Transaction approved — proceed to payment processing.
- **Transaction Flagged** — when Transaction submitted for risk assessment; Risk score at or above flag threshold; Risk score below auto-block threshold, then Transaction allowed but queued for analyst review.
- **Review Cleared** — when review_status eq "under_review"; Fraud analyst determines transaction is legitimate, then Transaction cleared after manual review.
- **Review Confirmed Fraud** — when review_status eq "under_review"; Fraud analyst confirms fraudulent activity, then Fraud confirmed — proxy/card suspended, investigation opened.

**❌ Failure paths**

- **Transaction Blocked** — when Transaction submitted for risk assessment; Risk score at or above auto-block threshold, then Transaction blocked — customer informed, analyst notified. *(error: `FRAUD_TRANSACTION_BLOCKED`)*
- **Velocity Exceeded** — when Transaction submitted for risk assessment; Transaction count or amount from same source exceeds velocity limits within window, then Transaction blocked — velocity limit exceeded. *(error: `FRAUD_VELOCITY_EXCEEDED`)*
- **Blacklisted Source** — when Transaction source (proxy, card, or terminal) is on the blacklist, then Transaction blocked — source is blacklisted. *(error: `FRAUD_BLACKLISTED`)*

## Errors it can return

- `FRAUD_TRANSACTION_BLOCKED` — Transaction blocked by fraud detection — contact support
- `FRAUD_VELOCITY_EXCEEDED` — Too many transactions in a short period — please wait and try again
- `FRAUD_BLACKLISTED` — This payment method has been blocked
- `FRAUD_DEVICE_UNTRUSTED` — Transaction from unrecognised terminal
- `FRAUD_SCORING_ERROR` — Risk scoring service unavailable — transaction held for review

## Events

**`fraud.transaction.approved`** — Transaction passed risk assessment
  Payload: `risk_assessment_id`, `transaction_id`, `risk_score`

**`fraud.transaction.flagged`** — Transaction allowed but flagged for review
  Payload: `risk_assessment_id`, `transaction_id`, `risk_score`, `risk_factors`

**`fraud.transaction.blocked`** — Transaction auto-blocked by risk engine
  Payload: `risk_assessment_id`, `transaction_id`, `risk_score`, `risk_factors`

**`fraud.velocity.exceeded`** — Velocity limit exceeded — transaction blocked
  Payload: `risk_assessment_id`, `transaction_id`, `velocity_window_minutes`

**`fraud.review.cleared`** — Flagged transaction cleared by analyst
  Payload: `risk_assessment_id`, `transaction_id`, `reviewer_id`

**`fraud.review.confirmed`** — Fraud confirmed by analyst
  Payload: `risk_assessment_id`, `transaction_id`, `reviewer_id`, `review_notes`

**`fraud.blacklist.hit`** — Transaction from blacklisted source
  Payload: `risk_assessment_id`, `transaction_id`

## Connects to

- **palm-pay** *(recommended)* — Palm pay transactions are scored for fraud before processing
- **terminal-payment-flow** *(required)* — Payment flow calls fraud detection before executing payment
- **payshap-rail** *(recommended)* — PayShap transactions scored before credit push
- **payment-gateway** *(recommended)* — Card transactions scored before authorisation
- **audit-logging** *(required)* — All fraud decisions must be logged in immutable audit trail

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/fraud-detection/) · **Spec source:** [`fraud-detection.blueprint.yaml`](./fraud-detection.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
