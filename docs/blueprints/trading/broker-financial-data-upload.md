---
title: "Broker Financial Data Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, onli"
---

# Broker Financial Data Upload Blueprint

> Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, online and batch submission modes

| | |
|---|---|
| **Feature** | `broker-financial-data-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, upload, financial-data, cash-book, journal, gl, fixed-width |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-financial-data-upload.blueprint.yaml) |
| **JSON API** | [broker-financial-data-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-financial-data-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `broker_finance_user` | Broker Finance User | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `layout_number` | text | Yes | Layout Number |  |
| `broker_code` | text | Yes | Broker Code |  |
| `upload_date` | date | Yes | Upload Date |  |
| `record_count` | number | No | Record Count |  |
| `receipt_reference` | text | No | Receipt Reference |  |
| `receipt_date` | date | No | Receipt Date |  |
| `receipt_account` | text | No | Receipt Account |  |
| `receipt_amount` | number | No | Receipt Amount |  |
| `receipt_description` | text | No | Receipt Description |  |
| `receipt_bank_account` | text | No | Receipt Bank Account |  |
| `receipt_currency` | text | No | Receipt Currency |  |
| `payment_reference` | text | No | Payment Reference |  |
| `payment_date` | date | No | Payment Date |  |
| `payment_account` | text | No | Payment Account |  |
| `payment_amount` | number | No | Payment Amount |  |
| `payment_description` | text | No | Payment Description |  |
| `payment_bank_account` | text | No | Payment Bank Account |  |
| `payment_currency` | text | No | Payment Currency |  |
| `journal_reference` | text | No | Journal Reference |  |
| `journal_date` | date | No | Journal Date |  |
| `journal_debit_account` | text | No | Journal Debit Account |  |
| `journal_credit_account` | text | No | Journal Credit Account |  |
| `journal_amount` | number | No | Journal Amount |  |
| `journal_description` | text | No | Journal Description |  |
| `journal_vat_code` | text | No | Journal Vat Code |  |

## Rules

- **submission:** MUST: Support FTP automated submission, MUST: Support online automated upload, MUST: Support online manual upload, MUST: Support batch upload mode, MUST: Configure email address before allowing upload
- **validation:** MUST: Report errors via COMPR and PCOMPR error reporting, MUST: Generate response dataset with per-record status, MUST: Allow editing of uploaded data before processing completion
- **format:** MUST: Use fixed-width layout format, MUST: Start with Header Record (Layout 000), MUST: End with Trailer Record (Layout 999), MUST: Use Layout 063 for cash book receipts, MUST: Use Layout 064 for cash book payments, MUST: Use Layout 065 for general journal entries
- **balancing:** MUST: Ensure journal debits equal credits for each journal entry, MUST: Balance cash book entries against bank account movements

## Outcomes

### Automated_ftp_upload (Priority: 1)

_Broker submits financial data via FTP_

**Given:**
- `upload_method` (input) eq `ftp`
- `email_configured` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.received`

### Manual_online_upload (Priority: 2)

_Broker uploads financial data via online manual interface_

**Given:**
- `upload_method` (input) eq `online_manual`

**Then:**
- **create_record**
- **emit_event** event: `fin_upload.manual_received`

### Validate_journal_balance (Priority: 3)

_Validate journal debits equal credits_

**Given:**
- `layout_number` (input) eq `065`

**Then:**
- **call_service** target: `journal_validator`
- **emit_event** event: `fin_upload.journal.validated`

### Unbalanced_journal (Priority: 4) — Error: `FIN_UPLOAD_UNBALANCED_JOURNAL`

**Given:**
- `debit_credit_diff` (computed) neq `0`

**Then:**
- **emit_event** event: `fin_upload.journal.unbalanced`

### Generate_response_dataset (Priority: 5)

_Generate response dataset for financial upload_

**Given:**
- upload processing complete

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `fin_upload.response.delivered`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FIN_UPLOAD_INVALID_LAYOUT` | 400 | Financial data upload file has invalid layout structure | No |
| `FIN_UPLOAD_UNBALANCED_JOURNAL` | 422 | Journal entry debits do not equal credits | No |
| `FIN_UPLOAD_INVALID_ACCOUNT` | 422 | Referenced account does not exist | No |
| `FIN_UPLOAD_DUPLICATE_REFERENCE` | 409 | Transaction reference already exists | No |
| `FIN_UPLOAD_PROCESSING_FAILED` | 500 | Financial upload processing failed | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Financial Data Upload

Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, online and batch submission modes

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

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| automated_ftp_upload | `autonomous` | - | - |
| manual_online_upload | `autonomous` | - | - |
| validate_journal_balance | `autonomous` | - | - |
| unbalanced_journal | `autonomous` | - | - |
| generate_response_dataset | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
layouts:
  "999":
    name: Trailer Record
  "000":
    name: Header Record
  "063":
    name: Cash Book Receipts
  "064":
    name: Cash Book Payments
  "065":
    name: Journal Record
submission_methods:
  - Automated FTP upload
  - Online automated upload
  - Online manual upload
  - Batch upload
workflow:
  - 1. Email address setup
  - 2. File submission
  - 3. Error reporting via COMPR/PCOMPR
  - 4. Response dataset
  - 5. Edit opportunity before final processing
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Financial Data Upload Blueprint",
  "description": "Broker financial data upload to central back-office via fixed-width layouts - cash book receipts, cash book payments, and general journal records with FTP, onli",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, financial-data, cash-book, journal, gl, fixed-width"
}
</script>
