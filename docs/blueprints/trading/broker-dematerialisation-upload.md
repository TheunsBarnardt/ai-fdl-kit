---
title: "Broker Dematerialisation Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response "
---

# Broker Dematerialisation Upload Blueprint

> Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response codes

| | |
|---|---|
| **Feature** | `broker-dematerialisation-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, upload, demat, dematerialisation, positions, card-codes, fixed-width |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-dematerialisation-upload.blueprint.yaml) |
| **JSON API** | [broker-dematerialisation-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-dematerialisation-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `csdp` | Central Security Depository Participant | external | CSDP holding dematerialised positions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes |  |  |
| `broker_code` | text | Yes |  |  |
| `upload_date` | date | Yes |  |  |
| `account_number` | text | Yes |  |  |
| `instrument_code` | text | Yes |  |  |
| `isin` | text | No |  |  |
| `demat_quantity` | number | Yes |  |  |
| `csdp_account_number` | text | No |  |  |
| `csdp_code` | text | No |  |  |
| `effective_date` | date | No |  |  |
| `reference_number` | text | No |  |  |
| `cost_value` | number | No |  |  |
| `market_value` | number | No |  |  |
| `position_type` | select | No |  |  |
| `pledge_indicator` | select | No |  |  |
| `restriction_indicator` | select | No |  |  |
| `record_count` | number | No |  |  |

## Rules

- **subscription:** MUST: Require broker subscription to DEMAT upload service before use
- **processing:** MUST: Apply defined processing rules to every uploaded record, MUST: Validate CSDP account and code references, MUST: Reject records with invalid instrument or account references
- **submission:** MUST: Support automated upload submission via FTP, MUST: Configure email addresses for response notifications, MUST: Provide error reporting via COMPR and PCOMPR functions, MUST: Generate response dataset with per-record status and response codes, MUST: Archive processed upload files
- **format:** MUST: Use fixed-width card code record format, MUST: Start file with Header Record (Card Code 000), MUST: End file with Trailer Record (Card Code 999), MUST: Use Card Code 030 for demat share position records

## Outcomes

### Automated_demat_upload (Priority: 1)

**Given:**
- `broker_subscribed` (db) eq `true`
- `email_configured` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `demat_upload.received`

### Not_subscribed (Priority: 2) — Error: `DEMAT_UPLOAD_NOT_SUBSCRIBED`

**Given:**
- `broker_subscribed` (db) eq `false`

**Then:**
- **emit_event** event: `demat_upload.not_subscribed`

### Validate_csdp_reference (Priority: 3)

**Given:**
- `card_code` (input) eq `030`

**Then:**
- **call_service** target: `csdp_validator`
- **emit_event** event: `demat_upload.csdp.validated`

### Generate_response_dataset (Priority: 4)

**Given:**
- upload processing complete

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `demat_upload.response.delivered`

### Archive_upload (Priority: 5)

**Given:**
- `processing_status` (system) eq `completed`

**Then:**
- **call_service** target: `archive_storage`
- **emit_event** event: `demat_upload.archived`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEMAT_UPLOAD_NOT_SUBSCRIBED` | 403 | Broker not subscribed to DEMAT upload service | No |
| `DEMAT_UPLOAD_INVALID_CSDP` | 422 | CSDP account or code is invalid | No |
| `DEMAT_UPLOAD_INSTRUMENT_NOT_FOUND` | 422 | Referenced instrument does not exist | No |
| `DEMAT_UPLOAD_ACCOUNT_NOT_FOUND` | 422 | Referenced client account does not exist | No |
| `DEMAT_UPLOAD_PROCESSING_FAILED` | 500 | DEMAT upload processing failed | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |
| broker-deal-management-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Dematerialisation Upload

Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response codes

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
| automated_demat_upload | `autonomous` | - | - |
| not_subscribed | `autonomous` | - | - |
| validate_csdp_reference | `autonomous` | - | - |
| generate_response_dataset | `autonomous` | - | - |
| archive_upload | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
card_codes:
  "999":
    name: Trailer Record
  "000":
    name: Header Record
  "030":
    name: Demat Share Upload
    purpose: Dematerialised share position records
workflow:
  - 1. Broker subscription to DEMAT upload service
  - 2. Email address set-up
  - 3. Upload file creation per Card Code 030
  - 4. FTP submission
  - 5. Processing with validation rules
  - 6. Response dataset with response codes
  - 7. Archiving
submission_methods:
  - Automated FTP upload
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Dematerialisation Upload Blueprint",
  "description": "Broker dematerialisation (DEMAT) position upload to central back-office via fixed-width card code file with automated submission, error reporting, and response ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, demat, dematerialisation, positions, card-codes, fixed-width"
}
</script>
