---
title: "Dispute Management Blueprint"
layout: default
parent: "Payment"
grand_parent: Blueprint Catalog
description: "Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions. 16 fields. 7 outcom"
---

# Dispute Management Blueprint

> Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions

| | |
|---|---|
| **Feature** | `dispute-management` |
| **Category** | Payment |
| **Version** | 1.0.0 |
| **Tags** | dispute, chargeback, resolution, evidence, payment-protection |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/payment/dispute-management.blueprint.yaml) |
| **JSON API** | [dispute-management.json]({{ site.baseurl }}/api/blueprints/payment/dispute-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `customer` | Customer | human | Raises a dispute against a transaction |
| `merchant` | Merchant | human | Responds to disputes with evidence |
| `dispute_analyst` | Dispute Analyst | human | Investigates and resolves disputes |
| `payment_scheme` | Payment Scheme | external | PayShap or card network that arbitrates unresolved disputes |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `dispute_id` | token | Yes | Dispute ID |  |
| `original_transaction_id` | token | Yes | Original Transaction ID |  |
| `original_uetr` | token | No | Original UETR |  |
| `dispute_type` | select | Yes | Dispute Type |  |
| `payment_method` | select | Yes | Original Payment Method |  |
| `dispute_amount` | number | Yes | Disputed Amount | Validations: min |
| `dispute_status` | select | Yes | Dispute Status |  |
| `reason_description` | text | Yes | Dispute Reason |  |
| `evidence_documents` | json | No | Evidence Documents |  |
| `resolution_notes` | text | No | Resolution Notes |  |
| `resolved_in_favour_of` | select | No | Resolved In Favour Of |  |
| `refund_initiated` | boolean | No | Refund Initiated |  |
| `opened_at` | datetime | Yes | Opened At |  |
| `evidence_deadline` | datetime | No | Evidence Submission Deadline |  |
| `resolution_deadline` | datetime | No | Resolution Deadline |  |
| `analyst_id` | text | No | Assigned Analyst |  |

## States

**State field:** `dispute_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `opened` | Yes |  |
| `evidence_requested` |  |  |
| `under_investigation` |  |  |
| `resolved_customer` |  | Yes |
| `resolved_merchant` |  | Yes |
| `escalated` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `opened` | `evidence_requested` | dispute_analyst |  |
|  | `evidence_requested` | `under_investigation` | dispute_analyst |  |
|  | `evidence_requested` | `resolved_customer` | dispute_analyst | Current date exceeds evidence_deadline |
|  | `under_investigation` | `resolved_customer` | dispute_analyst |  |
|  | `under_investigation` | `resolved_merchant` | dispute_analyst |  |
|  | `under_investigation` | `escalated` | dispute_analyst |  |
|  | `escalated` | `resolved_customer` | payment_scheme |  |
|  | `escalated` | `resolved_merchant` | payment_scheme |  |
|  | `resolved_customer` | `closed` | dispute_analyst |  |
|  | `resolved_merchant` | `closed` | dispute_analyst |  |

## Rules

- **time_limits:**
  - **customer_filing:** Customer must raise dispute within 120 days of transaction (card) or 30 days (PayShap)
  - **evidence_deadline:** Merchant has 10 business days to submit evidence after request
  - **resolution_target:** Dispute should be resolved within 30 calendar days of opening
  - **escalation_deadline:** If unresolved after 30 days, automatically escalated to payment scheme
- **payshap_disputes:**
  - **refund_via_api:** PayShap refunds initiated via POST /transactions/outbound/refund-initiation
  - **uetr_required:** Refund must reference original PAID transaction via UETR
  - **new_uetr:** Refund requires a new UETR — cannot reuse original
  - **amount_limit:** Refund amount must be less than or equal to original transaction amount
- **card_disputes:**
  - **chargeback_lifecycle:** First chargeback → representment → pre-arbitration → arbitration
  - **reason_codes:** Mapped to card scheme reason codes (Visa, Mastercard)
  - **provisional_credit:** Customer receives provisional credit upon dispute opening
- **evidence_requirements:**
  - **merchant_evidence:** Transaction receipt, delivery proof, customer signature, CCTV, communication records
  - **palm_evidence:** Palm match confirmation log, terminal ID, timestamp, risk score at time of transaction
  - **auto_resolve:** If merchant provides no evidence by deadline, dispute auto-resolves in customer's favour
- **notification:**
  - **customer_updates:** Customer notified at each status change via SMS/email
  - **merchant_alerts:** Merchant notified immediately when dispute opened and when evidence requested

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| first_response | 48h |  |
| resolution | 30d | Auto-escalate to payment scheme |
| evidence_window | 10 business days |  |

## Outcomes

### Dispute_opened (Priority: 1)

**Given:**
- Customer raises a dispute against a transaction
- `original_transaction_id` (input) exists
- `dispute_type` (input) exists

**Then:**
- **create_record** target: `disputes` — Create dispute record
- **set_field** target: `opened_at` value: `current timestamp`
- **set_field** target: `resolution_deadline` value: `opened_at + 30 days`
- **notify** — Notify merchant of dispute
- **emit_event** event: `dispute.opened`

**Result:** Dispute opened — merchant notified

### Evidence_requested (Priority: 2)

**Given:**
- `dispute_status` (db) eq `opened`
- Analyst assigns dispute and requests merchant evidence

**Then:**
- **transition_state** field: `dispute_status` from: `opened` to: `evidence_requested`
- **set_field** target: `evidence_deadline` value: `current timestamp + 10 business days`
- **notify** — Request evidence from merchant with deadline
- **emit_event** event: `dispute.evidence_requested`

**Result:** Evidence requested from merchant — 10 business day deadline

### Resolved_for_customer (Priority: 3) | Transaction: atomic

**Given:**
- `dispute_status` (db) in `under_investigation,evidence_requested,escalated`
- Decision made in favour of customer

**Then:**
- **transition_state** field: `dispute_status` from: `under_investigation` to: `resolved_customer`
- **set_field** target: `resolved_in_favour_of` value: `customer`
- **set_field** target: `refund_initiated` value: `true`
- **call_service** target: `payment_backend.process_refund` — Initiate refund via original payment method
- **notify** — Notify customer of resolution and refund
- **emit_event** event: `dispute.resolved`

**Result:** Dispute resolved for customer — refund initiated

### Resolved_for_merchant (Priority: 4)

**Given:**
- `dispute_status` (db) in `under_investigation,escalated`
- Decision made in favour of merchant — evidence supports transaction

**Then:**
- **transition_state** field: `dispute_status` from: `under_investigation` to: `resolved_merchant`
- **set_field** target: `resolved_in_favour_of` value: `merchant`
- **notify** — Notify customer that dispute was not upheld
- **emit_event** event: `dispute.resolved`

**Result:** Dispute resolved for merchant — no refund

### Dispute_escalated (Priority: 5)

**Given:**
- `dispute_status` (db) eq `under_investigation`
- Analyst cannot resolve — escalation to payment scheme required

**Then:**
- **transition_state** field: `dispute_status` from: `under_investigation` to: `escalated`
- **notify** — Submit dispute to scheme for arbitration
- **emit_event** event: `dispute.escalated`

**Result:** Dispute escalated to payment scheme for arbitration

### Filing_deadline_exceeded (Priority: 6) — Error: `DISPUTE_FILING_EXPIRED`

**Given:**
- Customer attempts to raise dispute
- Transaction date exceeds filing deadline (120 days card, 30 days PayShap)

**Then:**
- **emit_event** event: `dispute.filing_expired`

**Result:** Cannot raise dispute — filing deadline has passed

### Evidence_deadline_expired (Priority: 7) | Transaction: atomic

**Given:**
- `dispute_status` (db) eq `evidence_requested`
- Merchant has not submitted evidence by deadline

**Then:**
- **transition_state** field: `dispute_status` from: `evidence_requested` to: `resolved_customer`
- **set_field** target: `resolved_in_favour_of` value: `customer`
- **set_field** target: `refund_initiated` value: `true`
- **emit_event** event: `dispute.auto_resolved`

**Result:** Merchant failed to submit evidence — auto-resolved for customer

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISPUTE_FILING_EXPIRED` | 410 | Dispute filing deadline has passed for this transaction | No |
| `DISPUTE_ALREADY_EXISTS` | 409 | A dispute already exists for this transaction | No |
| `DISPUTE_TRANSACTION_NOT_FOUND` | 404 | Original transaction not found | No |
| `DISPUTE_INVALID_AMOUNT` | 400 | Disputed amount exceeds original transaction amount | No |
| `DISPUTE_EVIDENCE_TOO_LARGE` | 413 | Evidence file exceeds maximum upload size | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `dispute.opened` | New dispute raised against a transaction | `dispute_id`, `original_transaction_id`, `dispute_type`, `dispute_amount` |
| `dispute.evidence_requested` | Evidence requested from merchant | `dispute_id`, `evidence_deadline` |
| `dispute.resolved` | Dispute resolved | `dispute_id`, `resolved_in_favour_of`, `dispute_amount` |
| `dispute.escalated` | Dispute escalated to payment scheme | `dispute_id`, `payment_method` |
| `dispute.auto_resolved` | Dispute auto-resolved due to evidence deadline expiry | `dispute_id`, `resolved_in_favour_of` |
| `dispute.filing_expired` | Dispute filing rejected — deadline passed | `original_transaction_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| payshap-rail | required | PayShap refunds via POST /transactions/outbound/refund-initiation |
| payment-gateway | required | Card chargebacks processed via payment gateway |
| refunds-returns | required | Refund processing when dispute resolved for customer |
| terminal-payment-flow | recommended | Original transactions come from terminal payment flow |
| audit-logging | required | All dispute actions logged in immutable audit trail |

## AGI Readiness

### Goals

#### Reliable Dispute Management

Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions

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
| `payshap_rail` | payshap-rail | fail |
| `payment_gateway` | payment-gateway | fail |
| `refunds_returns` | refunds-returns | fail |
| `audit_logging` | audit-logging | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| dispute_opened | `autonomous` | - | - |
| evidence_requested | `autonomous` | - | - |
| resolved_for_customer | `autonomous` | - | - |
| resolved_for_merchant | `autonomous` | - | - |
| dispute_escalated | `autonomous` | - | - |
| filing_deadline_exceeded | `autonomous` | - | - |
| evidence_deadline_expired | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Dispute Management Blueprint",
  "description": "Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions. 16 fields. 7 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "dispute, chargeback, resolution, evidence, payment-protection"
}
</script>
