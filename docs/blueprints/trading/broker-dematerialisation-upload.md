---
title: "Broker Dematerialisation Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Bulk dematerialisation upload from broker to back-office via fixed-width card-code file, validating paper certificates against the register and routing holdings"
---

# Broker Dematerialisation Upload Blueprint

> Bulk dematerialisation upload from broker to back-office via fixed-width card-code file, validating paper certificates against the register and routing holdings to the central depository

| | |
|---|---|
| **Feature** | `broker-dematerialisation-upload` |
| **Category** | Trading |
| **Version** | 1.1.0 |
| **Tags** | back-office, broker, upload, demat, dematerialisation, positions, card-codes, fixed-width, certificate-register, central-depository |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-dematerialisation-upload.blueprint.yaml) |
| **JSON API** | [broker-dematerialisation-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-dematerialisation-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participating_broker` | Participating Broker | external |  |
| `back_office_system` | Back Office System | system |  |
| `central_depository` | Central Securities Depository | external |  |
| `certificate_registrar` | Physical Certificate Registrar | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `card_code` | text | Yes | Card Code |  |
| `broker_code` | text | Yes | Broker Code |  |
| `upload_date` | date | Yes | Upload Date |  |
| `upload_time` | text | Yes | Upload Time |  |
| `sequence_prefix` | text | Yes | Sequence Prefix |  |
| `sequence_number` | text | Yes | Sequence Number |  |
| `account_code` | text | Yes | Account Code |  |
| `account_type` | select | Yes | Account Type |  |
| `instrument_type` | select | Yes | Instrument Type |  |
| `instrument_alpha` | text | Yes | Instrument Alpha |  |
| `instrument_version` | text | Yes | Instrument Version |  |
| `share_quantity` | number | Yes | Share Quantity |  |
| `portfolio_cost` | number | No | Portfolio Cost (cents) |  |
| `demat_request_type` | select | Yes | Demat Request Type |  |
| `certificate_number` | text | No | Physical Certificate Number |  |
| `certificate_destroyed` | boolean | No | Physical Certificate Destruction Confirmed |  |
| `total_records` | number | Yes | Total Records |  |
| `records_processed` | number | No | Records Processed |  |
| `records_rejected` | number | No | Records Rejected |  |

## Rules

- **subscription:** MUST: Require broker subscription before enabling DEMAT upload service
- **processing:** MUST: Only accept positions on accounts of type C (controlled client), MUST: Only accept electronically settled instruments, MUST: Only create new positions (no closing of positions via upload), MUST: Exclude non-dematerialised scrip, MUST: Apply PFV cost only when provided (no actual/average calculation), MUST: Update position only when all field validations pass, MUST: Validate paper certificate numbers against the physical certificate register before deposit, MUST: Require confirmation of physical certificate destruction before electronic holding is created
- **submission:** MUST: Support automated FTP submission and auto-dispatch of processing batch, MUST: Allow up to 10 response e-mail addresses per broker, MUST: Produce a response dataset containing each input line annotated with response codes, MUST: Archive both upload and response files on a rolling cycle
- **format:** MUST: Use fixed-width card-code record format, total record length 100, MUST: Begin each file with Header Record (Card Code 000), MUST: End each file with Trailer Record (Card Code 999), MUST: Use Card Code 030 for DEMAT share upload records, MUST: Reject entire file if trailer record is missing, duplicated, or totals mismatch
- **audit:** MUST: Maintain immutable audit trail of every demat request, validation outcome and depository routing, MUST: Link each electronic holding back to the originating certificate number and destruction evidence

## Outcomes

### Not_subscribed (Priority: 1) — Error: `DEMAT_UPLOAD_NOT_SUBSCRIBED`

_Broker is not subscribed to the DEMAT upload service_

**Given:**
- `broker_subscribed` (db) eq `false`

**Then:**
- **emit_event** event: `demat_upload.not_subscribed`

### Automated_demat_upload (Priority: 2)

_Broker uploads a DEMAT file via automated FTP_

**Given:**
- `broker_subscribed` (db) eq `true`
- `email_configured` (db) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `demat_upload.received`

### Bulk_demat_deposit (Priority: 3)

_Bulk deposit of paper share certificates converted to electronic holdings_

**Given:**
- `card_code` (input) eq `030`
- `demat_request_type` (input) eq `D`
- `account_type` (db) eq `C`
- `instrument_type` (db) eq `E`

**Then:**
- **create_record**
- **call_service** target: `central_depository_router`
- **emit_event** event: `demat_upload.deposit.created`

### Demat_validation_against_cert_register (Priority: 4) — Error: `DEMAT_UPLOAD_CERT_NOT_IN_REGISTER`

_Validate the paper certificate against the physical certificate register before creating the electronic holding_

**Given:**
- `demat_request_type` (input) eq `D`
- `certificate_number` (input) exists

**Then:**
- **call_service** target: `certificate_register_validator`
- **set_field** target: `certificate_destroyed` value: `true`
- **emit_event** event: `demat_upload.certificate.validated`

### Demat_rejection_handling (Priority: 5) — Error: `DEMAT_UPLOAD_FILE_REJECTED`

_Record-level rejection with response code appended to the originating line_

**Given:**
- `record_valid` (computed) eq `false`

**Then:**
- **set_field** target: `records_rejected` value: `records_rejected_plus_1`
- **create_record**
- **notify**
- **emit_event** event: `demat_upload.record.rejected`

### Validate_depository_reference (Priority: 6)

_Validate central depository account and participant reference_

**Given:**
- `card_code` (input) eq `030`

**Then:**
- **call_service** target: `depository_reference_validator`
- **emit_event** event: `demat_upload.depository.validated`

### Generate_response_dataset (Priority: 7)

_Generate response dataset with per-record response codes and totals_

**Given:**
- `processing_status` (system) eq `completed`

**Then:**
- **create_record**
- **notify**
- **emit_event** event: `demat_upload.response.delivered`

### Archive_upload (Priority: 8)

_Archive processed DEMAT upload and response files on rolling cycle_

**Given:**
- `processing_status` (system) eq `completed`

**Then:**
- **call_service** target: `archive_storage`
- **emit_event** event: `demat_upload.archived`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEMAT_UPLOAD_NOT_SUBSCRIBED` | 403 | Broker not subscribed to DEMAT upload service | No |
| `DEMAT_UPLOAD_INVALID_DEPOSITORY_REF` | 422 | Central depository account or participant reference is invalid | No |
| `DEMAT_UPLOAD_INSTRUMENT_NOT_FOUND` | 422 | Referenced instrument does not exist or is not electronically settled | No |
| `DEMAT_UPLOAD_ACCOUNT_NOT_FOUND` | 422 | Referenced client account does not exist or is not type C | No |
| `DEMAT_UPLOAD_CERT_NOT_IN_REGISTER` | 422 | Physical certificate number not found in certificate register | No |
| `DEMAT_UPLOAD_CERT_NOT_DESTROYED` | 409 | Physical certificate destruction has not been confirmed | No |
| `DEMAT_UPLOAD_TRAILER_MISMATCH` | 422 | Trailer totals do not reconcile to records received | No |
| `DEMAT_UPLOAD_FILE_REJECTED` | 422 | Upload file rejected due to structural error | No |
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

Bulk dematerialisation upload with certificate-register validation, depository routing, and full audit trail

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |
| certificate_reconciliation_rate | 100% | Electronic holdings reconciled to destroyed paper certificates |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable
- **regulatory** (non-negotiable): No electronic holding created without confirmed destruction of paper certificate

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes
- before confirming physical certificate destruction

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`
- `certificate_register_mismatch`

### Verification

**Invariants:**

- error messages never expose internal system details
- no electronic holding exists without a matching destroyed certificate reference

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | dematerialisation is irreversible once paper certificates are destroyed |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| automated_demat_upload | `autonomous` | - | - |
| bulk_demat_deposit | `supervised` | - | - |
| demat_validation_against_cert_register | `supervised` | - | - |
| demat_rejection_handling | `autonomous` | - | - |
| generate_response_dataset | `autonomous` | - | - |
| archive_upload | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
demat_request_types:
  D:
    name: Deposit
    description: Paper share certificate lodged and converted to electronic holding
  W:
    name: Withdrawal
    description: Electronic holding converted back to paper certificate
  T:
    name: Transfer
    description: Holding transferred between central depository participants
card_codes:
  "999":
    name: Trailer Record
    purpose: File trailer - totals and reconciliation counts
  "000":
    name: Header Record
    purpose: File header - broker, date, time, sequence number
  "030":
    name: Demat Share Upload
    purpose: Dematerialised share position record (one per holding)
record_layouts:
  "999":
    description: Trailer Record (Card Code 999), total length 100
    fields:
      - name: card_code
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: broker_code
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: process_date
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: process_time
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: total_records
        start: 21
        length: 9
        type: numeric
        end: 29
      - name: records_processed
        start: 30
        length: 9
        type: numeric
        end: 38
      - name: records_rejected
        start: 39
        length: 9
        type: numeric
        end: 47
      - name: filler
        start: 48
        length: 53
        type: character
        end: 100
  "000":
    description: Header Record (Card Code 000), total length 100
    fields:
      - name: card_code
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: broker_code
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: upload_date
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: upload_time
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: sequence_prefix
        start: 21
        length: 1
        type: character
        end: 21
      - name: sequence_number
        start: 22
        length: 7
        type: character
        end: 28
      - name: filler
        start: 29
        length: 72
        type: character
        end: 100
  "030":
    description: Demat Share Upload Record (Card Code 030), total length 100
    fields:
      - name: card_code
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: broker_code
        start: 4
        length: 3
        type: character
        end: 6
      - name: account_code
        start: 7
        length: 7
        type: numeric
        end: 13
      - name: instrument_type
        start: 14
        length: 1
        type: character
        end: 14
      - name: instrument_alpha
        start: 15
        length: 6
        type: character
        end: 20
      - name: instrument_version
        start: 21
        length: 3
        type: numeric
        end: 23
      - name: share_quantity
        start: 24
        length: 11
        type: numeric
        end: 34
      - name: portfolio_cost
        start: 35
        length: 15
        type: numeric
        end: 49
      - name: filler
        start: 50
        length: 51
        type: character
        end: 100
  response:
    description: Response File Record Layout, total length 700
    fields:
      - name: card_code
        start: 1
        length: 3
        type: numeric
        end: 3
      - name: broker_code
        start: 4
        length: 3
        type: numeric
        end: 6
      - name: process_date
        start: 7
        length: 8
        type: numeric
        end: 14
      - name: process_time
        start: 15
        length: 6
        type: numeric
        end: 20
      - name: total_records
        start: 21
        length: 9
        type: numeric
        end: 29
      - name: records_processed
        start: 30
        length: 9
        type: numeric
        end: 38
      - name: records_rejected
        start: 39
        length: 9
        type: numeric
        end: 47
      - name: filler
        start: 48
        length: 653
        type: character
        end: 700
      - name: count_of_msgs_for_line
        start: 701
        length: 3
        type: numeric
        end: 703
      - name: error_message
        start: 704
        length: 50
        type: character
        end: 753
response_codes:
  "000": Successfully updated
  "001": Invalid Card Code Number
  "002": Card Code Number required
  "003": Invalid Broker Code
  "004": Broker Code required
  "005": Invalid Upload Type
  "006": Upload Type required
  "007": Invalid Account Code
  "008": Account Code required
  "009": Invalid Account Type - must be C only
  "010": Instrument Type required
  "011": Instrument Alpha required
  "012": Instrument Version required
  "013": Invalid Instrument Type
  "014": Invalid Instrument Alpha
  "015": Invalid Instrument Version
  "016": Invalid Share Qty
  "017": Share Qty required
  "018": Share Qty must be preceded by a valid sign
  "019": Invalid Portfolio Cost
  "020": Portfolio Cost must be preceded by a valid sign
  "021": Portfolio Cost must have valid decimals
  "022": Instrument not electronically settled
  "023": Member cannot process Controlled clients
  "024": No trailer record - file rejected
  "025": Technical error - no changes were applied
file_rejection_reasons:
  - RECORD RECEIVED AFTER TRAILER
  - DUPLICATE TRAILER RECEIVED
  - BRK CDE NOT SAME AS HDR
  - TRAILER REC TOTAL NOT SAME AS RECS SENT
  - TRAILER NOT RECEIVED
workflow:
  - 1. Broker subscription to DEMAT upload service
  - 2. Email address set-up (up to 10 addresses)
  - 3. Paper certificate lodged with registrar and listed on upload
  - 4. Fixed-width file built per Card Code 030 layout
  - 5. FTP submission triggers batch processing
  - 6. Validation against certificate register and depository reference data
  - 7. Confirmation of physical certificate destruction
  - 8. Electronic holding created and routed to central depository
  - 9. Response dataset generated with per-line response codes
  - 10. Archiving of upload and response files
submission_methods:
  - Automated FTP upload
audit_trail:
  - Every input record retained with response code annotation
  - Certificate register lookup logged with operator, timestamp and outcome
  - Destruction confirmation retained against the resulting electronic holding
  - Depository routing message id stored against the holding
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Dematerialisation Upload Blueprint",
  "description": "Bulk dematerialisation upload from broker to back-office via fixed-width card-code file, validating paper certificates against the register and routing holdings",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, upload, demat, dematerialisation, positions, card-codes, fixed-width, certificate-register, central-depository"
}
</script>
