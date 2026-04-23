---
title: "Broker Ca Election Upload Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.. 34 fields. 6 o"
---

# Broker Ca Election Upload Blueprint

> Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.

| | |
|---|---|
| **Feature** | `broker-ca-election-upload` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-actions, elections, upload, voluntary-events, broker |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-ca-election-upload.blueprint.yaml) |
| **JSON API** | [broker-ca-election-upload.json]({{ site.baseurl }}/api/blueprints/trading/broker-ca-election-upload.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker` | Broker / Member Firm | external | Submits the election upload file on behalf of clients. |
| `upload_processor` | Election Upload Processor | system | Parses and validates the upload, applies elections against the frozen file. |
| `corporate_actions_engine` | Corporate Actions Engine | system | Holds the frozen positions file and default election rules. |
| `customer_support` | Customer Support | human | Can grant exceptional cut-off extensions. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `broker_code` | text | Yes | Broker Code | Validations: pattern |
| `process_date` | date | Yes | Process Date |  |
| `process_time` | text | Yes | Process Time | Validations: pattern |
| `sequence` | text | Yes | Sequence Number | Validations: pattern |
| `process_type` | select | Yes | Event Process Type |  |
| `instrument_type` | text | Yes | Instrument Type | Validations: pattern |
| `instrument_alpha` | text | Yes | Instrument Alpha | Validations: pattern |
| `instrument_version` | text | Yes | Instrument Version | Validations: pattern |
| `ldr_date` | date | Yes | Last Date to Register |  |
| `process_sequence` | number | Yes | Process Sequence |  |
| `line_number` | number | Yes | Line Number |  |
| `section` | select | Yes | Section |  |
| `option_code` | text | No | Option Code | Validations: pattern |
| `account_code` | text | Yes | Account Code | Validations: pattern |
| `original_sign` | select | Yes | Original Quantity Sign |  |
| `original_quantity` | number | Yes | Original Quantity |  |
| `election_sign` | select | Yes | Election Quantity Sign |  |
| `election_quantity` | number | Yes | Election Quantity |  |
| `scrip_type` | text | No | Scrip Type |  |
| `registration_code` | text | No | Registration Code |  |
| `location_alpha` | text | No | Location Code |  |
| `deal_id` | text | No | Deal ID |  |
| `ps_indicator` | select | No | Purchase / Sale Indicator |  |
| `lender_account` | text | No | Lender Account |  |
| `borrower_account` | text | No | Borrower Account |  |
| `provider_account` | text | No | Collateral Provider Account |  |
| `receiver_account` | text | No | Collateral Receiver Account |  |
| `opposite_account` | text | No | Opposite Account |  |
| `opposite_lb_stock_account` | text | No | Opposite LB Stock Account |  |
| `total_records` | number | Yes | Total Records |  |
| `records_processed` | number | No | Records Processed |  |
| `records_rejected` | number | No | Records Rejected |  |
| `errors_per_line` | number | No | Errors Per Line |  |
| `response_description` | text | No | Response Description |  |

## Rules

- **general:**
  - **rule_1:** File must contain exactly one header (000), exactly one event (066), one or more account (067) records, and exactly one trailer (999).
  - **rule_2:** Whole file is rejected if the election cut-off time has passed (default 11:00 on election date, RD-2) unless customer support has authorised an extension.
  - **rule_3:** Whole file is rejected if broker code, instrument type/alpha/version, last date to register, process type, process sequence, or trailer record count is invalid.
  - **rule_4:** Only sections B (client holdings), G (SLB), and H (collateral) are supported; add / delete operations must be performed interactively.
  - **rule_5:** Upload may not add new positions or delete frozen positions; it only updates existing ones.
  - **rule_6:** Election quantity must never exceed the original quantity held on the frozen file for that position.
  - **rule_7:** A single option code per position is sufficient; the balance is automatically allocated to the alternate option (typically the default).
  - **rule_8:** For CD DRIP only reinvestment records should be submitted with the option code left blank; C or S option codes are ignored for CD DRIP.
  - **rule_9:** Deal entries require both the account code and the opposite account to be captured; demat entries against account 39008 are populated automatically.
  - **rule_10:** SLB elections (section G) require lender account, borrower account, and deal ID; the linked position must be confirmed.
  - **rule_11:** Collateral elections (section H) require provider account, receiver account, and deal ID; the linked position must be confirmed.
  - **rule_12:** Each line is validated independently; partial file processing is permitted and the response file returns only rejected records alongside the header, event, and trailer.
  - **rule_13:** Sequence numbers should be unique per broker per day; reusing a sequence appends to the existing response rather than overwriting it.
  - **rule_14:** Acknowledgement response file is produced with the same dataset name plus the sequence suffix and delivered back to the broker.
  - **rule_15:** Resubmission of a corrected file fully overrides any prior file for the same event.

## Flows

### Submit_election_upload

Broker submits an election upload file and receives an acknowledgement response.

1. **Transfer upload dataset containing header, event, account, and trailer records.** (broker)
1. **Validate header card code 000, broker code, and sequence; reject whole file on failure.** (upload_processor)
1. **Validate event detail card code 066 (process type, instrument, LDR); reject whole file on failure.** (upload_processor)
1. **For each account detail record (067), validate section, option code, and account against the frozen file.** (upload_processor)
1. **Apply election quantities and option codes to the frozen positions, calculating balance allocations automatically.** (corporate_actions_engine)
1. **Apply default election option to any unallocated balance or position where no election was submitted.** (corporate_actions_engine)
1. **Validate trailer card code 999 record counts; reject whole file if totals do not reconcile.** (upload_processor)
1. **Generate response dataset with sequence suffix containing rejected lines plus header, event, and trailer.** (upload_processor)
1. **Receive email acknowledgement and review response file for rejected records.** (broker)

## Outcomes

### Reject_past_deadline (Priority: 1) — Error: `ELECTION_PAST_CUT_OFF` | Transaction: atomic

_Entire file is rejected when received after the election cut-off with no extension granted._

**Given:**
- `cut_off_passed` (system) eq `true`
- `extension_granted` (system) eq `false`

**Then:**
- **set_field** target: `file.status` value: `rejected`
- **emit_event** event: `ca.election.file.rejected`
- **notify** target: `broker`

### Reject_insufficient_holdings (Priority: 3) — Error: `ELECTION_INSUFFICIENT_HOLDINGS`

_Election line is rejected when election quantity exceeds the frozen original quantity or when a required account is missing on the frozen file._

**Given:**
- ANY: `election_quantity` (input) gt `original_quantity` OR `account_code` (db) not_exists

**Then:**
- **set_field** target: `line.status` value: `rejected`
- **set_field** target: `line.errors_per_line` value: `1`
- **emit_event** event: `ca.election.rejected`

### Validate_against_frozen_file (Priority: 5)

_Election line is validated against the frozen positions file for account existence, instrument match, and holdings._

**Given:**
- `account_code` (input) exists
- `instrument_alpha` (input) exists

**Then:**
- **call_service** target: `corporate_actions_engine.lookup_frozen_position`
- **set_field** target: `line.validated` value: `true`

### Apply_default_election (Priority: 8)

_Default option code defined on the event is applied to any account position that has no explicit election or has an unallocated balance._

**Given:**
- `election_submitted` (computed) eq `false`

**Then:**
- **set_field** target: `frozen_position.option_code` value: `event.default_option_code`
- **emit_event** event: `ca.election.default.applied`

### Upload_election (Priority: 10) | Transaction: atomic

_Valid election line is applied to the frozen file for the account and event._

**Given:**
- `cut_off_passed` (system) eq `false`
- `broker_code` (db) exists
- `account_code` (db) exists
- `election_quantity` (input) lte `original_quantity`

**Then:**
- **set_field** target: `frozen_position.option_code` value: `input.option_code`
- **set_field** target: `frozen_position.election_quantity` value: `input.election_quantity`
- **emit_event** event: `ca.election.applied`

### Ack_received (Priority: 20)

_Acknowledgement response file with processed and rejected counts is produced and returned to the broker._

**Given:**
- `file.processing_complete` (system) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `ca.election.ack.generated`
- **notify** target: `broker`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ELECTION_PAST_CUT_OFF` | 410 | Election cut-off has passed; file rejected. | No |
| `ELECTION_INVALID_BROKER` | 403 | Broker code is not valid. | No |
| `ELECTION_INVALID_EVENT` | 422 | Corporate action event could not be matched for the broker. | No |
| `ELECTION_INVALID_INSTRUMENT` | 422 | Instrument type, alpha, or version is invalid. | No |
| `ELECTION_INVALID_PROCESS_TYPE` | 422 | Process type is not a supported elective event. | No |
| `ELECTION_INVALID_SECTION` | 422 | Section must be B, G, or H. | No |
| `ELECTION_INVALID_OPTION_CODE` | 422 | Option code not valid for this event type. | No |
| `ELECTION_ACCOUNT_NOT_FOUND` | 404 | Account code does not exist on the frozen file. | No |
| `ELECTION_INSUFFICIENT_HOLDINGS` | 422 | Election quantity exceeds holdings on the frozen file. | No |
| `ELECTION_MISSING_OPP_ACCOUNT` | 422 | Opposite account is required for deal entries. | No |
| `ELECTION_SLB_ACCOUNTS_REQUIRED` | 422 | Lender and borrower accounts plus deal ID required for section G. | No |
| `ELECTION_COLLATERAL_ACCOUNTS_REQUIRED` | 422 | Provider and receiver accounts plus deal ID required for section H. | No |
| `ELECTION_RECORD_COUNT_MISMATCH` | 422 | Trailer record count does not match records received; file rejected. | No |
| `ELECTION_MISSING_CARD_CODE` | 422 | Required header, event, or trailer card code missing; file rejected. | No |
| `ELECTION_POSITION_NOT_CONFIRMED` | 422 | Linked SLB or collateral deal position is not confirmed. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ca.election.upload.received` | Upload file received for processing. | `broker_code`, `sequence`, `process_date`, `process_time`, `total_records` |
| `ca.election.applied` | Election successfully applied to frozen position. | `broker_code`, `account_code`, `instrument_alpha`, `option_code`, `election_quantity` |
| `ca.election.rejected` | An election line was rejected. | `broker_code`, `line_number`, `account_code`, `response_description` |
| `ca.election.file.rejected` | Entire upload file rejected. | `broker_code`, `sequence`, `response_description` |
| `ca.election.default.applied` | Default election option applied where no explicit election submitted. | `account_code`, `instrument_alpha`, `option_code`, `election_quantity` |
| `ca.election.ack.generated` | Acknowledgement response file produced for the broker. | `broker_code`, `sequence`, `records_processed`, `records_rejected` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-ca-election-download | recommended | Sibling operation — download retrieves the election results file that completes this upload workflow |
| broker-client-account-maintenance | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Ca Election Upload

Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.

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
| upload_election | `autonomous` | - | - |
| validate_against_frozen_file | `autonomous` | - | - |
| reject_past_deadline | `supervised` | - | - |
| reject_insufficient_holdings | `supervised` | - | - |
| apply_default_election | `autonomous` | - | - |
| ack_received | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
cut_off:
  default_time: 11:00
  relative_to: election_date
  election_date_offset_days: -2
  extension_process: Broker contacts customer support to request an exceptional extension.
default_option_rules:
  TU:
    T: Take up
    " ": Lapse
  SC:
    S: Scrip
    C: Cash
    " ": Default as configured on entitlement event
  OL:
    S: Sell
    B: Buy
    " ": Retain
  CD:
    " ": Reinvest
  RI:
    " ": Reinvest
  IT:
    " ": Reinvest
dataset_naming:
  upload: BROKER.ELEC.UPLOAD.{BROKER_ALPHA}
  response: BROKER.ELEC.UPLOAD.{BROKER_ALPHA}.S{SEQUENCE}
record_type_map:
  "999": Trailer record
  "000": Header record
  "066": Event detail record
  "067": Account detail record
record_layouts:
  "999":
    total_length: 50
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: brk_cde
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: date
        start: 7
        length: 8
        end: 14
        type: numeric
      - name: time
        start: 15
        length: 6
        end: 20
        type: numeric
      - name: total_records
        start: 21
        length: 9
        end: 29
        type: numeric
      - name: records_processed
        start: 30
        length: 9
        end: 38
        type: numeric
      - name: records_rejected
        start: 39
        length: 9
        end: 47
        type: numeric
      - name: filler
        start: 48
        length: 3
        end: 50
        type: character
  "000":
    total_length: 30
    fields:
      - name: card_code
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: brk_cde
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: date
        start: 7
        length: 8
        end: 14
        type: numeric
      - name: time
        start: 15
        length: 6
        end: 20
        type: character
      - name: prefix
        start: 21
        length: 1
        end: 21
        type: character
      - name: sequence
        start: 22
        length: 7
        end: 28
        type: character
      - name: filler
        start: 29
        length: 2
        end: 30
        type: character
  "066":
    total_length: 160
    fields:
      - name: card_cde
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: brk_cde
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: process_type
        start: 7
        length: 2
        end: 8
        type: character
      - name: instr_typ
        start: 9
        length: 1
        end: 9
        type: character
      - name: instr_alpha
        start: 10
        length: 6
        end: 15
        type: character
      - name: instr_version
        start: 16
        length: 3
        end: 18
        type: character
      - name: ldr_dte
        start: 19
        length: 8
        end: 26
        type: numeric
      - name: proc_seq
        start: 27
        length: 3
        end: 29
        type: numeric
      - name: filler
        start: 30
        length: 78
        end: 107
        type: character
      - name: errors_per_line
        start: 108
        length: 3
        end: 110
        type: numeric
      - name: response
        start: 111
        length: 50
        end: 160
        type: character
  "067":
    total_length: 160
    fields:
      - name: card_cde
        start: 1
        length: 3
        end: 3
        type: numeric
      - name: brk_cde
        start: 4
        length: 3
        end: 6
        type: numeric
      - name: line
        start: 7
        length: 7
        end: 13
        type: numeric
      - name: section
        start: 14
        length: 1
        end: 14
        type: character
      - name: optn_cde
        start: 15
        length: 2
        end: 16
        type: character
      - name: acc_cde
        start: 17
        length: 7
        end: 23
        type: numeric
      - name: orig_sign
        start: 24
        length: 1
        end: 24
        type: character
      - name: orig_qty
        start: 25
        length: 13
        end: 37
        type: numeric
      - name: election_sign
        start: 38
        length: 1
        end: 38
        type: character
      - name: election_qty
        start: 39
        length: 13
        end: 51
        type: numeric
      - name: scrip_type
        start: 52
        length: 2
        end: 53
        type: character
      - name: reg_cde
        start: 54
        length: 2
        end: 55
        type: numeric
      - name: locn_alpha
        start: 56
        length: 2
        end: 57
        type: character
      - name: del_id
        start: 58
        length: 7
        end: 64
        type: numeric
      - name: ps_ind
        start: 65
        length: 1
        end: 65
        type: character
      - name: lender_acc
        start: 66
        length: 7
        end: 72
        type: numeric
      - name: borrower_acc
        start: 73
        length: 7
        end: 79
        type: numeric
      - name: provider_acc
        start: 80
        length: 7
        end: 86
        type: numeric
      - name: receiver_acc
        start: 87
        length: 7
        end: 93
        type: numeric
      - name: opp_account
        start: 94
        length: 7
        end: 100
        type: numeric
      - name: opp_lb_typ_stock_acc
        start: 101
        length: 7
        end: 107
        type: numeric
      - name: errors_per_line
        start: 108
        length: 3
        end: 110
        type: numeric
      - name: response
        start: 111
        length: 50
        end: 160
        type: character
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Ca Election Upload Blueprint",
  "description": "Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.. 34 fields. 6 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-actions, elections, upload, voluntary-events, broker"
}
</script>
