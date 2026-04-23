---
title: "Transactions Console Blueprint"
layout: default
parent: "Admin"
grand_parent: Blueprint Catalog
description: "Admin web UI — live transaction explorer with drill-down, refund/dispute initiation, reconciliation state, and CSV/JSON export; every admin action is audited. 6"
---

# Transactions Console Blueprint

> Admin web UI — live transaction explorer with drill-down, refund/dispute initiation, reconciliation state, and CSV/JSON export; every admin action is audited

| | |
|---|---|
| **Feature** | `transactions-console` |
| **Category** | Admin |
| **Version** | 1.0.0 |
| **Tags** | admin, console, transactions, refund, dispute, audit, reconciliation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/admin/transactions-console.blueprint.yaml) |
| **JSON API** | [transactions-console.json]({{ site.baseurl }}/api/blueprints/admin/transactions-console.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ops_operator` | Operations operator | human | Investigates payments, issues refunds, initiates disputes |
| `pgw` | Payments Gateway | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `from_date` | datetime | No | Filter: from timestamp |  |
| `to_date` | datetime | No |  |  |
| `merchant_id` | text | No |  |  |
| `rail_id` | text | No |  |  |
| `status` | select | No |  |  |
| `cursor` | token | No | Pagination cursor |  |

## Rules

- **security:** MUST: operator must hold `ops` role; MFA required, MUST: every view and action is written to the audit log with operator id + reason
- **privacy:** MUST: PAN is displayed only as last-4; full PAN never exposed to operators
- **ux:** SHOULD: drill-down shows rail leg, fraud score, EMV outcome, and POPIA consent snapshot

## Outcomes

### Unauthorized (Priority: 1) — Error: `ADMIN_UNAUTHORIZED`

**Given:**
- no admin session

**Result:** 401

### Forbidden (Priority: 2) — Error: `ADMIN_FORBIDDEN`

**Given:**
- operator lacks ops role

**Result:** 403

### Listed (Priority: 100)

**Given:**
- operator authenticated with ops role

**Then:**
- **emit_event** event: `admin.transactions.listed`

**Result:** Page of transactions returned

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ADMIN_UNAUTHORIZED` | 401 | Sign in required | No |
| `ADMIN_FORBIDDEN` | 403 | You do not have permission | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `admin.transactions.listed` |  |  |
| `admin.refund.initiated` |  |  |
| `admin.dispute.initiated` |  |  |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required | Displays personal information to operators — consent & minimisation rules apply |
| payments-gateway-api | required | Backed by PGW transaction queries |
| refunds-returns | required | Refund initiation flow |
| dispute-management | required | Dispute initiation flow |

## AGI Readiness

### Goals

#### Reliable Transactions Console

Admin web UI — live transaction explorer with drill-down, refund/dispute initiation, reconciliation state, and CSV/JSON export; every admin action is audited

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `popia_compliance` | popia-compliance | degrade |
| `payments_gateway_api` | payments-gateway-api | degrade |
| `refunds_returns` | refunds-returns | degrade |
| `dispute_management` | dispute-management | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| listed | `autonomous` | - | - |
| unauthorized | `autonomous` | - | - |
| forbidden | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Transactions Console Blueprint",
  "description": "Admin web UI — live transaction explorer with drill-down, refund/dispute initiation, reconciliation state, and CSV/JSON export; every admin action is audited. 6",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "admin, console, transactions, refund, dispute, audit, reconciliation"
}
</script>
