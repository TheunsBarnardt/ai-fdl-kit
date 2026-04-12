<!-- AUTO-GENERATED FROM dispute-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dispute Management

> Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions

**Category:** Payment · **Version:** 1.0.0 · **Tags:** dispute · chargeback · resolution · evidence · payment-protection

## What this does

Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **dispute_id** *(token, required)* — Dispute ID
- **original_transaction_id** *(token, required)* — Original Transaction ID
- **original_uetr** *(token, optional)* — Original UETR
- **dispute_type** *(select, required)* — Dispute Type
- **payment_method** *(select, required)* — Original Payment Method
- **dispute_amount** *(number, required)* — Disputed Amount
- **dispute_status** *(select, required)* — Dispute Status
- **reason_description** *(text, required)* — Dispute Reason
- **evidence_documents** *(json, optional)* — Evidence Documents
- **resolution_notes** *(text, optional)* — Resolution Notes
- **resolved_in_favour_of** *(select, optional)* — Resolved In Favour Of
- **refund_initiated** *(boolean, optional)* — Refund Initiated
- **opened_at** *(datetime, required)* — Opened At
- **evidence_deadline** *(datetime, optional)* — Evidence Submission Deadline
- **resolution_deadline** *(datetime, optional)* — Resolution Deadline
- **analyst_id** *(text, optional)* — Assigned Analyst

## What must be true

- **time_limits → customer_filing:** Customer must raise dispute within 120 days of transaction (card) or 30 days (PayShap)
- **time_limits → evidence_deadline:** Merchant has 10 business days to submit evidence after request
- **time_limits → resolution_target:** Dispute should be resolved within 30 calendar days of opening
- **time_limits → escalation_deadline:** If unresolved after 30 days, automatically escalated to payment scheme
- **payshap_disputes → refund_via_api:** PayShap refunds initiated via POST /transactions/outbound/refund-initiation
- **payshap_disputes → uetr_required:** Refund must reference original PAID transaction via UETR
- **payshap_disputes → new_uetr:** Refund requires a new UETR — cannot reuse original
- **payshap_disputes → amount_limit:** Refund amount must be less than or equal to original transaction amount
- **card_disputes → chargeback_lifecycle:** First chargeback → representment → pre-arbitration → arbitration
- **card_disputes → reason_codes:** Mapped to card scheme reason codes (Visa, Mastercard)
- **card_disputes → provisional_credit:** Customer receives provisional credit upon dispute opening
- **evidence_requirements → merchant_evidence:** Transaction receipt, delivery proof, customer signature, CCTV, communication records
- **evidence_requirements → palm_evidence:** Palm match confirmation log, terminal ID, timestamp, risk score at time of transaction
- **evidence_requirements → auto_resolve:** If merchant provides no evidence by deadline, dispute auto-resolves in customer's favour
- **notification → customer_updates:** Customer notified at each status change via SMS/email
- **notification → merchant_alerts:** Merchant notified immediately when dispute opened and when evidence requested

## Success & failure scenarios

**✅ Success paths**

- **Dispute Opened** — when Customer raises a dispute against a transaction; Original transaction reference provided; Dispute type selected, then Dispute opened — merchant notified.
- **Evidence Requested** — when dispute_status eq "opened"; Analyst assigns dispute and requests merchant evidence, then Evidence requested from merchant — 10 business day deadline.
- **Resolved For Customer** — when dispute_status in ["under_investigation","evidence_requested","escalated"]; Decision made in favour of customer, then Dispute resolved for customer — refund initiated.
- **Resolved For Merchant** — when dispute_status in ["under_investigation","escalated"]; Decision made in favour of merchant — evidence supports transaction, then Dispute resolved for merchant — no refund.
- **Dispute Escalated** — when dispute_status eq "under_investigation"; Analyst cannot resolve — escalation to payment scheme required, then Dispute escalated to payment scheme for arbitration.
- **Evidence Deadline Expired** — when dispute_status eq "evidence_requested"; Merchant has not submitted evidence by deadline, then Merchant failed to submit evidence — auto-resolved for customer.

**❌ Failure paths**

- **Filing Deadline Exceeded** — when Customer attempts to raise dispute; Transaction date exceeds filing deadline (120 days card, 30 days PayShap), then Cannot raise dispute — filing deadline has passed. *(error: `DISPUTE_FILING_EXPIRED`)*

## Errors it can return

- `DISPUTE_FILING_EXPIRED` — Dispute filing deadline has passed for this transaction
- `DISPUTE_ALREADY_EXISTS` — A dispute already exists for this transaction
- `DISPUTE_TRANSACTION_NOT_FOUND` — Original transaction not found
- `DISPUTE_INVALID_AMOUNT` — Disputed amount exceeds original transaction amount
- `DISPUTE_EVIDENCE_TOO_LARGE` — Evidence file exceeds maximum upload size

## Connects to

- **payshap-rail** *(required)* — PayShap refunds via POST /transactions/outbound/refund-initiation
- **payment-gateway** *(required)* — Card chargebacks processed via payment gateway
- **refunds-returns** *(required)* — Refund processing when dispute resolved for customer
- **terminal-payment-flow** *(recommended)* — Original transactions come from terminal payment flow
- **audit-logging** *(required)* — All dispute actions logged in immutable audit trail

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/dispute-management/) · **Spec source:** [`dispute-management.blueprint.yaml`](./dispute-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
