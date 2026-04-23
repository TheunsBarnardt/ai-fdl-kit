<!-- AUTO-GENERATED FROM broker-ca-election-upload.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Ca Election Upload

> Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** corporate-actions · elections · upload · voluntary-events · broker

## What this does

Broker upload of client elections for voluntary corporate action events, validated against a frozen positions file before the election deadline.

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **broker_code** *(text, required)* — Broker Code
- **process_date** *(date, required)* — Process Date
- **process_time** *(text, required)* — Process Time
- **sequence** *(text, required)* — Sequence Number
- **process_type** *(select, required)* — Event Process Type
- **instrument_type** *(text, required)* — Instrument Type
- **instrument_alpha** *(text, required)* — Instrument Alpha
- **instrument_version** *(text, required)* — Instrument Version
- **ldr_date** *(date, required)* — Last Date to Register
- **process_sequence** *(number, required)* — Process Sequence
- **line_number** *(number, required)* — Line Number
- **section** *(select, required)* — Section
- **option_code** *(text, optional)* — Option Code
- **account_code** *(text, required)* — Account Code
- **original_sign** *(select, required)* — Original Quantity Sign
- **original_quantity** *(number, required)* — Original Quantity
- **election_sign** *(select, required)* — Election Quantity Sign
- **election_quantity** *(number, required)* — Election Quantity
- **scrip_type** *(text, optional)* — Scrip Type
- **registration_code** *(text, optional)* — Registration Code
- **location_alpha** *(text, optional)* — Location Code
- **deal_id** *(text, optional)* — Deal ID
- **ps_indicator** *(select, optional)* — Purchase / Sale Indicator
- **lender_account** *(text, optional)* — Lender Account
- **borrower_account** *(text, optional)* — Borrower Account
- **provider_account** *(text, optional)* — Collateral Provider Account
- **receiver_account** *(text, optional)* — Collateral Receiver Account
- **opposite_account** *(text, optional)* — Opposite Account
- **opposite_lb_stock_account** *(text, optional)* — Opposite LB Stock Account
- **total_records** *(number, required)* — Total Records
- **records_processed** *(number, optional)* — Records Processed
- **records_rejected** *(number, optional)* — Records Rejected
- **errors_per_line** *(number, optional)* — Errors Per Line
- **response_description** *(text, optional)* — Response Description

## What must be true

- **general → rule_1:** File must contain exactly one header (000), exactly one event (066), one or more account (067) records, and exactly one trailer (999).
- **general → rule_2:** Whole file is rejected if the election cut-off time has passed (default 11:00 on election date, RD-2) unless customer support has authorised an extension.
- **general → rule_3:** Whole file is rejected if broker code, instrument type/alpha/version, last date to register, process type, process sequence, or trailer record count is invalid.
- **general → rule_4:** Only sections B (client holdings), G (SLB), and H (collateral) are supported; add / delete operations must be performed interactively.
- **general → rule_5:** Upload may not add new positions or delete frozen positions; it only updates existing ones.
- **general → rule_6:** Election quantity must never exceed the original quantity held on the frozen file for that position.
- **general → rule_7:** A single option code per position is sufficient; the balance is automatically allocated to the alternate option (typically the default).
- **general → rule_8:** For CD DRIP only reinvestment records should be submitted with the option code left blank; C or S option codes are ignored for CD DRIP.
- **general → rule_9:** Deal entries require both the account code and the opposite account to be captured; demat entries against account 39008 are populated automatically.
- **general → rule_10:** SLB elections (section G) require lender account, borrower account, and deal ID; the linked position must be confirmed.
- **general → rule_11:** Collateral elections (section H) require provider account, receiver account, and deal ID; the linked position must be confirmed.
- **general → rule_12:** Each line is validated independently; partial file processing is permitted and the response file returns only rejected records alongside the header, event, and trailer.
- **general → rule_13:** Sequence numbers should be unique per broker per day; reusing a sequence appends to the existing response rather than overwriting it.
- **general → rule_14:** Acknowledgement response file is produced with the same dataset name plus the sequence suffix and delivered back to the broker.
- **general → rule_15:** Resubmission of a corrected file fully overrides any prior file for the same event.

## Success & failure scenarios

**✅ Success paths**

- **Validate Against Frozen File** — when account_code exists; instrument_alpha exists, then call service; set line.validated = true. _Why: Election line is validated against the frozen positions file for account existence, instrument match, and holdings._
- **Apply Default Election** — when election_submitted eq false, then set frozen_position.option_code = "event.default_option_code"; emit ca.election.default.applied. _Why: Default option code defined on the event is applied to any account position that has no explicit election or has an unallocated balance._
- **Upload Election** — when cut_off_passed eq false; broker_code exists; account_code exists; election_quantity lte "original_quantity", then set frozen_position.option_code = "input.option_code"; set frozen_position.election_quantity = "input.election_quantity"; emit ca.election.applied. _Why: Valid election line is applied to the frozen file for the account and event._
- **Ack Received** — when file.processing_complete eq true, then create_record; emit ca.election.ack.generated; notify via email. _Why: Acknowledgement response file with processed and rejected counts is produced and returned to the broker._

**❌ Failure paths**

- **Reject Past Deadline** — when cut_off_passed eq true; extension_granted eq false, then set file.status = "rejected"; emit ca.election.file.rejected; notify via email. _Why: Entire file is rejected when received after the election cut-off with no extension granted._ *(error: `ELECTION_PAST_CUT_OFF`)*
- **Reject Insufficient Holdings** — when election_quantity gt "original_quantity" OR account_code not_exists, then set line.status = "rejected"; set line.errors_per_line = 1; emit ca.election.rejected. _Why: Election line is rejected when election quantity exceeds the frozen original quantity or when a required account is missing on the frozen file._ *(error: `ELECTION_INSUFFICIENT_HOLDINGS`)*

## Business flows

**Submit Election Upload** — Broker submits an election upload file and receives an acknowledgement response.

1. **Transfer upload dataset containing header, event, account, and trailer records.** *(broker)*
1. **Validate header card code 000, broker code, and sequence; reject whole file on failure.** *(upload_processor)*
1. **Validate event detail card code 066 (process type, instrument, LDR); reject whole file on failure.** *(upload_processor)*
1. **For each account detail record (067), validate section, option code, and account against the frozen file.** *(upload_processor)*
1. **Apply election quantities and option codes to the frozen positions, calculating balance allocations automatically.** *(corporate_actions_engine)*
1. **Apply default election option to any unallocated balance or position where no election was submitted.** *(corporate_actions_engine)*
1. **Validate trailer card code 999 record counts; reject whole file if totals do not reconcile.** *(upload_processor)*
1. **Generate response dataset with sequence suffix containing rejected lines plus header, event, and trailer.** *(upload_processor)*
1. **Receive email acknowledgement and review response file for rejected records.** *(broker)*

## Errors it can return

- `ELECTION_PAST_CUT_OFF` — Election cut-off has passed; file rejected.
- `ELECTION_INVALID_BROKER` — Broker code is not valid.
- `ELECTION_INVALID_EVENT` — Corporate action event could not be matched for the broker.
- `ELECTION_INVALID_INSTRUMENT` — Instrument type, alpha, or version is invalid.
- `ELECTION_INVALID_PROCESS_TYPE` — Process type is not a supported elective event.
- `ELECTION_INVALID_SECTION` — Section must be B, G, or H.
- `ELECTION_INVALID_OPTION_CODE` — Option code not valid for this event type.
- `ELECTION_ACCOUNT_NOT_FOUND` — Account code does not exist on the frozen file.
- `ELECTION_INSUFFICIENT_HOLDINGS` — Election quantity exceeds holdings on the frozen file.
- `ELECTION_MISSING_OPP_ACCOUNT` — Opposite account is required for deal entries.
- `ELECTION_SLB_ACCOUNTS_REQUIRED` — Lender and borrower accounts plus deal ID required for section G.
- `ELECTION_COLLATERAL_ACCOUNTS_REQUIRED` — Provider and receiver accounts plus deal ID required for section H.
- `ELECTION_RECORD_COUNT_MISMATCH` — Trailer record count does not match records received; file rejected.
- `ELECTION_MISSING_CARD_CODE` — Required header, event, or trailer card code missing; file rejected.
- `ELECTION_POSITION_NOT_CONFIRMED` — Linked SLB or collateral deal position is not confirmed.

## Events

**`ca.election.upload.received`** — Upload file received for processing.
  Payload: `broker_code`, `sequence`, `process_date`, `process_time`, `total_records`

**`ca.election.applied`** — Election successfully applied to frozen position.
  Payload: `broker_code`, `account_code`, `instrument_alpha`, `option_code`, `election_quantity`

**`ca.election.rejected`** — An election line was rejected.
  Payload: `broker_code`, `line_number`, `account_code`, `response_description`

**`ca.election.file.rejected`** — Entire upload file rejected.
  Payload: `broker_code`, `sequence`, `response_description`

**`ca.election.default.applied`** — Default election option applied where no explicit election submitted.
  Payload: `account_code`, `instrument_alpha`, `option_code`, `election_quantity`

**`ca.election.ack.generated`** — Acknowledgement response file produced for the broker.
  Payload: `broker_code`, `sequence`, `records_processed`, `records_rejected`

## Connects to

- **broker-ca-election-download** *(recommended)* — Sibling operation — download retrieves the election results file that completes this upload workflow
- **broker-client-account-maintenance** *(recommended)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-ca-election-upload/) · **Spec source:** [`broker-ca-election-upload.blueprint.yaml`](./broker-ca-election-upload.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
