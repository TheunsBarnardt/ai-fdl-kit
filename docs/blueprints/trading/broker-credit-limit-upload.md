---
title: "Broker Credit Limit Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.. 13 fields. 5 ou"
---

# Broker Credit Limit Upload Blueprint

> Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.

| | |
|---|---|
| **Feature** | `broker-credit-limit-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | credit-limit, bulk-upload, risk, approval-workflow, audit |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-credit-limit-upload.blueprint.yaml) |
| **JSON API** | [broker-credit-limit-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-credit-limit-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_user` | Broker User | human |  |
| `supervisor` | Risk Supervisor | human |  |
| `upload_service` | Credit Limit Upload Service | system |  |
| `back_office_system` | Back-office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `upload_mode` | select | Yes | Upload Mode |  |
| `broker_code` | text | Yes | Broker Code | Validations: pattern |
| `batch_number` | number | Yes | Batch Number |  |
| `upload_name` | text | Yes | Upload Name |  |
| `run_date` | date | Yes | Run Date |  |
| `account_code` | text | Yes | Account Code | Validations: pattern |
| `credit_limit_type` | select | Yes | Credit Limit Type |  |
| `credit_limit_amount` | number | Yes | Credit Limit Amount |  |
| `currency` | select | Yes | Currency |  |
| `effective_date` | date | No | Effective Date |  |
| `record_count` | number | Yes | Number of Records |  |
| `approval_status` | select | Yes | Approval Status |  |
| `supervisor_id` | text | No | Approving Supervisor |  |

## States

**State field:** `approval_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `approved` |  |  |
| `rejected` |  | Yes |
| `applied` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `approved` | supervisor |  |
|  | `pending` | `rejected` | supervisor |  |
|  | `approved` | `applied` | upload_service |  |

## Rules

- **general:**
  - **rule_1:** Maximum 1000 detail records per upload (1002 including header and trailer).
  - **rule_2:** Header record type must be H, detail D, trailer T.
  - **rule_3:** Batch number must be unique per broker and never reprocessed.
  - **rule_4:** Credit limit amount must be greater than 0 unless limit type is PF.
  - **rule_5:** When limit type is PF, credit limit amount MUST be zero.
  - **rule_6:** Currency codes must be ISO 4217 valid codes.
  - **rule_7:** Every limit change requires supervisor approval before it takes effect.
  - **rule_8:** Effective date cannot be in the past; defaults to next business day if omitted.
  - **rule_9:** Full refresh mode replaces all existing limits for the broker; delta mode updates only supplied accounts.
  - **rule_10:** Every accepted or rejected record must be written to the audit trail with before/after values.
  - **rule_11:** Failed records must not block successful records in the same batch.
  - **rule_12:** A processing report must be produced detailing changes applied and errors encountered.

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| max_duration | 24h |  |
| escalation | Escalate to senior risk officer if supervisor approval is outstanding beyond 24 hours. |  |

## Outcomes

### Upload_limits_bulk (Priority: 1)

_Broker submits a bulk credit limit upload file for processing._

**Given:**
- `upload_name` (input) eq `UPLKB1`
- `record_count` (input) lte `1002`
- `batch_number` (input) exists

**Then:**
- **create_record**
- **set_field** target: `approval_status` value: `pending`
- **emit_event** event: `credit.limit.upload.received`

### Validate_limit (Priority: 2) — Error: `CREDIT_LIMIT_INVALID`

_Each detail record is validated for limit type, amount, and currency before acceptance._

**Given:**
- ANY: `credit_limit_amount` (input) lte `0` OR `currency` (input) not_in `ZAR,USD,EUR,GBP` OR `credit_limit_type` (input) not_in `UP,ST,PF`

**Then:**
- **emit_event** event: `credit.limit.record.rejected`

### Supervisor_approval_required (Priority: 3)

_Validated batch is routed to a risk supervisor for approval before any limit change is applied._

**Given:**
- `approval_status` (db) eq `pending`

**Then:**
- **notify** target: `supervisor`
- **emit_event** event: `credit.limit.approval.requested`

### Schedule_effective_date (Priority: 4) | Transaction: atomic

_Approved limit changes are scheduled to take effect on the requested effective date._

**Given:**
- `approval_status` (db) eq `approved`
- `effective_date` (input) gte `today`

**Then:**
- **transition_state** field: `approval_status` from: `approved` to: `applied`
- **emit_event** event: `credit.limit.scheduled`

### Audit_trail (Priority: 5)

_Every limit change, approval, rejection, or error writes an immutable audit entry with before/after values._

**Given:**
- `batch_number` (db) exists

**Then:**
- **create_record**
- **emit_event** event: `credit.limit.audit.written`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CREDIT_LIMIT_INVALID` | 422 | Credit limit record failed validation. | No |
| `CREDIT_LIMIT_BATCH_DUPLICATE` | 409 | Batch number has already been processed. | No |
| `CREDIT_LIMIT_COUNT_EXCEEDED` | 413 | Upload exceeds maximum record count. | No |
| `CREDIT_LIMIT_HEADER_INVALID` | 422 | Upload header is invalid or missing required fields. | No |
| `CREDIT_LIMIT_TRAILER_MISMATCH` | 422 | Trailer record count does not match detail records. | No |
| `CREDIT_LIMIT_APPROVAL_REQUIRED` | 403 | Supervisor approval required before applying limit changes. | No |
| `CREDIT_LIMIT_EFFECTIVE_DATE_INVALID` | 422 | Effective date must not be in the past. | No |
| `CREDIT_LIMIT_CURRENCY_INVALID` | 422 | Currency code is not a recognised ISO 4217 value. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `credit.limit.upload.received` |  | `broker_code`, `batch_number`, `record_count`, `upload_mode` |
| `credit.limit.record.rejected` |  | `broker_code`, `account_code`, `credit_limit_amount`, `currency` |
| `credit.limit.approval.requested` |  | `broker_code`, `batch_number`, `record_count` |
| `credit.limit.approval.granted` |  | `broker_code`, `batch_number`, `supervisor_id` |
| `credit.limit.approval.rejected` |  | `broker_code`, `batch_number`, `supervisor_id` |
| `credit.limit.scheduled` |  | `broker_code`, `account_code`, `credit_limit_amount`, `effective_date` |
| `credit.limit.applied` |  | `broker_code`, `account_code`, `credit_limit_amount`, `effective_date` |
| `credit.limit.audit.written` |  | `broker_code`, `account_code`, `batch_number`, `approval_status`, `supervisor_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |

## AGI Readiness

### Goals

#### Reliable Broker Credit Limit Upload

Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| upload_limits_bulk | `autonomous` | - | - |
| validate_limit | `autonomous` | - | - |
| supervisor_approval_required | `supervised` | - | - |
| schedule_effective_date | `autonomous` | - | - |
| audit_trail | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_type_map:
  H: Header record (one per file)
  D: Detail record (one per account limit)
  T: Trailer record (one per file)
  UP: Intraday limit valid for one day
  ST: Standing limit valid indefinitely
  PF: Portfolio-calculated limit (amount must be zero)
record_layouts:
  CC_HEADER:
    length: 173
    fields:
      - name: record_type
        start: 1
        length: 1
        end: 1
        type: char
      - name: broker_code
        start: 2
        length: 3
        end: 4
        type: char
      - name: upload_name
        start: 5
        length: 6
        end: 10
        type: char
      - name: run_date
        start: 11
        length: 8
        end: 18
        type: numeric
      - name: batch_number
        start: 19
        length: 9
        end: 27
        type: numeric
      - name: filler
        start: 28
        length: 146
        end: 173
        type: char
  CC_DETAIL:
    length: 173
    fields:
      - name: record_type
        start: 1
        length: 1
        end: 1
        type: char
      - name: broker_code
        start: 2
        length: 3
        end: 4
        type: char
      - name: account_code
        start: 5
        length: 7
        end: 11
        type: char
      - name: credit_limit_amount_code
        start: 12
        length: 2
        end: 13
        type: char
      - name: credit_limit_amount
        start: 14
        length: 15
        end: 28
        type: numeric
      - name: filler
        start: 29
        length: 145
        end: 173
        type: char
  CC_TRAILER:
    length: 173
    fields:
      - name: record_type
        start: 1
        length: 1
        end: 1
        type: char
      - name: broker_code
        start: 2
        length: 3
        end: 4
        type: char
      - name: number_of_records
        start: 5
        length: 4
        end: 8
        type: numeric
      - name: filler
        start: 9
        length: 165
        end: 173
        type: char
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Credit Limit Upload Blueprint",
  "description": "Bulk upload or update of per-account credit limits by brokers with validation, supervisor approval, effective-date scheduling, and audit trail.. 13 fields. 5 ou",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "credit-limit, bulk-upload, risk, approval-workflow, audit"
}
</script>
