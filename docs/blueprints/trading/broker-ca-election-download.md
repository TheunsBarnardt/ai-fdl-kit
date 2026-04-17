---
title: "Broker Ca Election Download Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Download frozen-file corporate-action election positions to brokers per account for voluntary events, supporting live or batch delivery via email or SFTP.. 30 f"
---

# Broker Ca Election Download Blueprint

> Download frozen-file corporate-action election positions to brokers per account for voluntary events, supporting live or batch delivery via email or SFTP.

| | |
|---|---|
| **Feature** | `broker-ca-election-download` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | corporate-actions, elections, voluntary-events, dissemination, frozen-file |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-ca-election-download.blueprint.yaml) |
| **JSON API** | [broker-ca-election-download.json]({{ site.baseurl }}/api/blueprints/trading/broker-ca-election-download.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_member` | Broker Member | external |  |
| `back_office_system` | Back-Office System | system |  |
| `registrar` | Registrar / Issuer Agent | external |  |
| `central_depository` | Central Depository | external |  |
| `operations_user` | Corporate Actions Operations User | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `broker_code` | text | Yes | Broker Numeric Code | Validations: pattern |
| `process_code` | select | Yes | Process Code |  |
| `process_type` | select | Yes | Event Process Type |  |
| `instrument_alpha` | text | Yes | Instrument Alpha Code | Validations: pattern |
| `instrument_version` | text | Yes | Instrument Version | Validations: pattern |
| `instrument_type` | select | Yes | Instrument Type |  |
| `record_date` | date | Yes | Record Date / Last Day to Register |  |
| `election_deadline` | datetime | Yes | Election Deadline (cut-off) |  |
| `payment_date` | date | No | Payment / Distribution Date |  |
| `process_sequence` | text | Yes | Process Sequence | Validations: pattern |
| `run_frequency` | select | Yes | Run Frequency |  |
| `delivery_channel` | multiselect | Yes | Delivery Channel |  |
| `email_addresses` | json | No | Response Email Addresses |  |
| `dataset_name` | text | No | Output Dataset Name Pattern |  |
| `is_frozen` | boolean | Yes | Frozen File Flag |  |
| `is_first_download` | boolean | Yes | First Download for Event |  |
| `section` | select | Yes | Holdings Section |  |
| `account_code` | text | Yes | Client Account Code | Validations: pattern |
| `option_code` | select | No | Elected Option Code |  |
| `original_quantity` | number | Yes | Original Holding Quantity |  |
| `election_quantity` | number | No | Elected Quantity |  |
| `scrip_type` | text | No | Scrip Type (demat) |  |
| `registration_code` | text | No | Registration Code |  |
| `location_alpha` | text | No | Location Alpha Code |  |
| `deal_id` | text | No | Deal ID |  |
| `purchase_sale_indicator` | select | No | Purchase/Sale Indicator |  |
| `lender_account` | text | No | Lender Account |  |
| `borrower_account` | text | No | Borrower Account |  |
| `provider_account` | text | No | Collateral Provider Account |  |
| `receiver_account` | text | No | Collateral Receiver Account |  |

## Rules

- **general:**
  - **rule_1:** Frozen file contains all client, loan and collateral positions as at record date for the event.
  - **rule_2:** First download per event returns all accounts; subsequent downloads return only amended positions (delta).
  - **rule_3:** Downloads are available from LDT+1 until end-of-day LDR (election deadline).
  - **rule_4:** Requests are ad-hoc and serviced immediately; only one request at a time per broker.
  - **rule_5:** Email addresses must be pre-registered for process types ELECDN (download) and ELECUP (upload); up to 999 addresses supported.
  - **rule_6:** Dataset name follows a deterministic pattern keyed on broker alpha code, e.g. secure.download.{broker_alpha}.ELEC
  - **rule_7:** File layout is strictly fixed-width card-coded records: 000 header, 071 event detail, 072 account detail, 999 trailer.
  - **rule_8:** Option codes are event-specific: SC/RE accept C or S; TU accepts T or blank; OL accepts S or blank; DRIP events (CD, RI, IT) populate reinvestment quantity.
  - **rule_9:** Sections B (client), G (lending), H (collateral) are all disseminated; only confirmed SLB and collateral loans are included.
  - **rule_10:** ORIG-SIGN must match the ORIG-QTY polarity; mismatches reject on upload and downloaded frozen quantity remains authoritative.
  - **rule_11:** After election deadline, no further elections accepted; unelected holdings default per event terms.
  - **rule_12:** Response email is sent on every request — both success and failure — stating records read and processed.

## Outcomes

### Download_election_frozen_file (Priority: 1)

_Generate frozen-file election download for a requested voluntary event._

**Given:**
- `process_code` (input) eq `ELECDN`
- `instrument_alpha` (input) exists
- `process_type` (input) in `SC,TU,OL,CD,RE,RI,IT`
- `record_date` (computed) lte `today`

**Then:**
- **call_service** target: `freeze_positions_as_of_record_date`
- **create_record**
- **set_field** target: `is_frozen` value: `true`
- **emit_event** event: `election.download.generated`

### Deliver_via_email (Priority: 2)

_Notify broker via registered email addresses when download file is ready._

**Given:**
- `delivery_channel` (input) in `email`
- `email_addresses` (db) exists

**Then:**
- **notify** target: `email_addresses`
- **emit_event** event: `election.download.notified`

### Deliver_via_sftp (Priority: 3)

_Publish download file to the broker's SFTP dataset location for retrieval._

**Given:**
- `delivery_channel` (input) in `sftp`

**Then:**
- **call_service** target: `publish_to_sftp_dataset`
- **emit_event** event: `election.download.published`

### Election_deadline_reminder (Priority: 4)

_Remind broker of approaching election deadline before cut-off._

**Given:**
- `election_deadline` (computed) gt `now`
- `election_deadline` (computed) lte `now_plus_24h`

**Then:**
- **notify** target: `email_addresses`
- **emit_event** event: `election.deadline.reminder`

### Default_election_application (Priority: 5)

_Apply default election (lapse or retain) when no instruction received by deadline._

**Given:**
- `election_deadline` (computed) lt `now`
- `option_code` (db) not_exists

**Then:**
- **set_field** target: `option_code` value: ` `
- **transition_state** field: `election_status` from: `awaiting_instruction` to: `defaulted`
- **emit_event** event: `election.default.applied`

### Reject_after_cutoff (Priority: 6) — Error: `CA_ELECTION_CUTOFF_REACHED`

_Reject download request received after the election cut-off window._

**Given:**
- `election_deadline` (db) lt `now`

**Then:**
- **emit_event** event: `election.download.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CA_ELECTION_INVALID_INSTRUMENT` | 422 | Invalid instrument details for election download. | No |
| `CA_ELECTION_INVALID_LDR_DATE` | 422 | Invalid last-day-to-register date. | No |
| `CA_ELECTION_INVALID_ACCOUNT` | 422 | Account code is not valid for this broker or event. | No |
| `CA_ELECTION_INVALID_OPTION_CODE` | 422 | Option code is not valid for the event process type. | No |
| `CA_ELECTION_INVALID_PROCESS_TYPE` | 422 | Process type not recognised. | No |
| `CA_ELECTION_INVALID_PROCESS_SEQ` | 422 | Process sequence invalid for instrument. | No |
| `CA_ELECTION_CUTOFF_REACHED` | 409 | Election cut-off time reached; request cannot be serviced. | No |
| `CA_ELECTION_NO_HEADER` | 422 | File rejected — missing header record. | No |
| `CA_ELECTION_NO_EVENT_DETAIL` | 422 | File rejected — missing event detail record. | No |
| `CA_ELECTION_NO_ACCOUNT_DETAIL` | 422 | File rejected — missing account detail record. | No |
| `CA_ELECTION_NO_TRAILER` | 422 | File rejected — missing trailer record. | No |
| `CA_ELECTION_RECORD_COUNT_MISMATCH` | 422 | Record count does not match trailer totals. | No |
| `CA_ELECTION_TECHNICAL_ERROR` | 500 | Technical error — no changes applied; contact support. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `election.download.generated` |  | `broker_code`, `process_type`, `instrument_alpha`, `record_date`, `dataset_name` |
| `election.download.notified` |  | `broker_code`, `dataset_name`, `email_addresses` |
| `election.download.published` |  | `broker_code`, `dataset_name` |
| `election.download.rejected` |  | `broker_code`, `process_type`, `instrument_alpha` |
| `election.deadline.reminder` |  | `broker_code`, `instrument_alpha`, `election_deadline` |
| `election.default.applied` |  | `broker_code`, `account_code`, `instrument_alpha`, `process_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-ca-election-upload | recommended |  |
| broker-client-account-maintenance | required |  |
| broker-corporate-actions-feed | recommended |  |
| broker-dissemination-download | recommended |  |
| popia-compliance | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
record_type_map:
  "999": Trailer Record — record counts, processed and rejected totals
  "000": Header Record — file origin, broker code, upload date/time
  "071": Event Detail Record — process type, instrument, record date, sequence
  "072": Account Detail Record — per-account holding and election option
download_response_codes:
  "99999": Technical error — no changes applied
  "000": Successfully updated
  "001": Invalid Instrument details
  "002": Invalid LDR date
  "003": Invalid account
  "004": Invalid Option Code
  "005": Invalid election qty
  "006": Invalid SCRIP type
  "007": Invalid REG code
  "008": Invalid LOCN Alpha
  "009": Invalid DEL ID
  "010": Invalid DEAL Opposite account
  "011": Invalid electronic pledge Opposite account
  "012": Invalid SLB type
  "013": Invalid SLB STOCK account
  "014": Duplicate account
  "015": OPTION CDE not selected
  "016": Warning — no details to change
  "017": Insufficient Holdings for Opposite Account
  "018": Insufficient Holdings for LB Stock account
  "019": Invalid Opposite account for Electronic pledge
  "020": Deal positions not confirmed
  "021": Cannot change protected account
  "022": Cannot change after LDR
  "023": Cut-off Time reached — no changes applied
  "024": Invalid Section — only B,G,H allowed
  "025": Section dtls do not match dtls passed
  "026": Invalid LINE number — possible duplicate
  "027": Invalid process type
  "028": Full quantity elected already
  "029": ORIG-QTY mismatch to Frozen file; frozen file used
  "030": No header record — file rejected
  "031": No event detail record — file rejected
  "032": No account/trailer record — file rejected
  "033": Incorrect number of detail records — file rejected
event_option_matrix:
  SC:
    - C
    - S
  TU:
    - T
    - " "
  OL:
    - S
    - " "
  RE:
    - C
    - S
  CD:
    - DRIP reinvestment quantity
  RI:
    - DRIP reinvestment quantity
  IT:
    - DRIP reinvestment quantity
record_layouts:
  "999":
    description: Trailer Record — Card Code 999, total length 50
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
    description: Header Record — Card Code 000, total length 30
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
        type: numeric
      - name: filler
        start: 21
        length: 10
        end: 30
        type: character
  "071":
    description: Event Detail Record — Card Code 071, total length 100
    total_length: 100
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
        length: 71
        end: 100
        type: character
  "072":
    description: Account Detail Record — Card Code 072, total length 100
    total_length: 100
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
      - name: section
        start: 7
        length: 1
        end: 7
        type: character
      - name: optn_cde
        start: 8
        length: 2
        end: 9
        type: character
      - name: acc_cde
        start: 10
        length: 7
        end: 16
        type: numeric
      - name: orig_sign
        start: 17
        length: 1
        end: 17
        type: character
      - name: orig_qty
        start: 18
        length: 13
        end: 30
        type: numeric
      - name: election_sign
        start: 31
        length: 1
        end: 31
        type: character
      - name: election_qty
        start: 32
        length: 13
        end: 44
        type: numeric
      - name: scrip_ty
        start: 45
        length: 2
        end: 46
        type: character
      - name: reg_cde
        start: 47
        length: 2
        end: 48
        type: numeric
      - name: locn_alpha
        start: 49
        length: 2
        end: 50
        type: character
      - name: del_id
        start: 51
        length: 7
        end: 57
        type: numeric
      - name: ps_ind
        start: 58
        length: 1
        end: 58
        type: character
      - name: lender_acc
        start: 59
        length: 7
        end: 65
        type: numeric
      - name: borrower_acc
        start: 66
        length: 7
        end: 72
        type: numeric
      - name: provider_acc
        start: 73
        length: 7
        end: 79
        type: numeric
      - name: receiver_acc
        start: 80
        length: 7
        end: 86
        type: numeric
      - name: filler
        start: 87
        length: 14
        end: 100
        type: character
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Ca Election Download Blueprint",
  "description": "Download frozen-file corporate-action election positions to brokers per account for voluntary events, supporting live or batch delivery via email or SFTP.. 30 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "corporate-actions, elections, voluntary-events, dissemination, frozen-file"
}
</script>
