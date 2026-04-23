<!-- AUTO-GENERATED FROM broker-ca-election-download.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Ca Election Download

> Download frozen-file corporate-action election positions to brokers per account for voluntary events, supporting live or batch delivery via email or SFTP.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** corporate-actions · elections · voluntary-events · dissemination · frozen-file

## What this does

Download frozen-file corporate-action election positions to brokers per account for voluntary events, supporting live or batch delivery via email or SFTP.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **broker_code** *(text, required)* — Broker Numeric Code
- **process_code** *(select, required)* — Process Code
- **process_type** *(select, required)* — Event Process Type
- **instrument_alpha** *(text, required)* — Instrument Alpha Code
- **instrument_version** *(text, required)* — Instrument Version
- **instrument_type** *(select, required)* — Instrument Type
- **record_date** *(date, required)* — Record Date / Last Day to Register
- **election_deadline** *(datetime, required)* — Election Deadline (cut-off)
- **payment_date** *(date, optional)* — Payment / Distribution Date
- **process_sequence** *(text, required)* — Process Sequence
- **run_frequency** *(select, required)* — Run Frequency
- **delivery_channel** *(multiselect, required)* — Delivery Channel
- **email_addresses** *(json, optional)* — Response Email Addresses
- **dataset_name** *(text, optional)* — Output Dataset Name Pattern
- **is_frozen** *(boolean, required)* — Frozen File Flag
- **is_first_download** *(boolean, required)* — First Download for Event
- **section** *(select, required)* — Holdings Section
- **account_code** *(text, required)* — Client Account Code
- **option_code** *(select, optional)* — Elected Option Code
- **original_quantity** *(number, required)* — Original Holding Quantity
- **election_quantity** *(number, optional)* — Elected Quantity
- **scrip_type** *(text, optional)* — Scrip Type (demat)
- **registration_code** *(text, optional)* — Registration Code
- **location_alpha** *(text, optional)* — Location Alpha Code
- **deal_id** *(text, optional)* — Deal ID
- **purchase_sale_indicator** *(select, optional)* — Purchase/Sale Indicator
- **lender_account** *(text, optional)* — Lender Account
- **borrower_account** *(text, optional)* — Borrower Account
- **provider_account** *(text, optional)* — Collateral Provider Account
- **receiver_account** *(text, optional)* — Collateral Receiver Account

## What must be true

- **general → rule_1:** Frozen file contains all client, loan and collateral positions as at record date for the event.
- **general → rule_2:** First download per event returns all accounts; subsequent downloads return only amended positions (delta).
- **general → rule_3:** Downloads are available from LDT+1 until end-of-day LDR (election deadline).
- **general → rule_4:** Requests are ad-hoc and serviced immediately; only one request at a time per broker.
- **general → rule_5:** Email addresses must be pre-registered for process types ELECDN (download) and ELECUP (upload); up to 999 addresses supported.
- **general → rule_6:** Dataset name follows a deterministic pattern keyed on broker alpha code, e.g. secure.download.{broker_alpha}.ELEC
- **general → rule_7:** File layout is strictly fixed-width card-coded records: 000 header, 071 event detail, 072 account detail, 999 trailer.
- **general → rule_8:** Option codes are event-specific: SC/RE accept C or S; TU accepts T or blank; OL accepts S or blank; DRIP events (CD, RI, IT) populate reinvestment quantity.
- **general → rule_9:** Sections B (client), G (lending), H (collateral) are all disseminated; only confirmed SLB and collateral loans are included.
- **general → rule_10:** ORIG-SIGN must match the ORIG-QTY polarity; mismatches reject on upload and downloaded frozen quantity remains authoritative.
- **general → rule_11:** After election deadline, no further elections accepted; unelected holdings default per event terms.
- **general → rule_12:** Response email is sent on every request — both success and failure — stating records read and processed.

## Success & failure scenarios

**✅ Success paths**

- **Download Election Frozen File** — when process_code eq "ELECDN"; instrument_alpha exists; process_type in ["SC","TU","OL","CD","RE","RI","IT"]; record_date lte "today", then call service; create_record; set is_frozen = true; emit election.download.generated. _Why: Generate frozen-file election download for a requested voluntary event._
- **Deliver Via Email** — when delivery_channel in ["email"]; email_addresses exists, then notify via email; emit election.download.notified. _Why: Notify broker via registered email addresses when download file is ready._
- **Deliver Via Sftp** — when delivery_channel in ["sftp"], then call service; emit election.download.published. _Why: Publish download file to the broker's SFTP dataset location for retrieval._
- **Election Deadline Reminder** — when election_deadline gt "now"; election_deadline lte "now_plus_24h", then notify via email; emit election.deadline.reminder. _Why: Remind broker of approaching election deadline before cut-off._
- **Default Election Application** — when election_deadline lt "now"; option_code not_exists, then set option_code = " "; move election_status awaiting_instruction → defaulted; emit election.default.applied. _Why: Apply default election (lapse or retain) when no instruction received by deadline._

**❌ Failure paths**

- **Reject After Cutoff** — when election_deadline lt "now", then emit election.download.rejected. _Why: Reject download request received after the election cut-off window._ *(error: `CA_ELECTION_CUTOFF_REACHED`)*

## Errors it can return

- `CA_ELECTION_INVALID_INSTRUMENT` — Invalid instrument details for election download.
- `CA_ELECTION_INVALID_LDR_DATE` — Invalid last-day-to-register date.
- `CA_ELECTION_INVALID_ACCOUNT` — Account code is not valid for this broker or event.
- `CA_ELECTION_INVALID_OPTION_CODE` — Option code is not valid for the event process type.
- `CA_ELECTION_INVALID_PROCESS_TYPE` — Process type not recognised.
- `CA_ELECTION_INVALID_PROCESS_SEQ` — Process sequence invalid for instrument.
- `CA_ELECTION_CUTOFF_REACHED` — Election cut-off time reached; request cannot be serviced.
- `CA_ELECTION_NO_HEADER` — File rejected — missing header record.
- `CA_ELECTION_NO_EVENT_DETAIL` — File rejected — missing event detail record.
- `CA_ELECTION_NO_ACCOUNT_DETAIL` — File rejected — missing account detail record.
- `CA_ELECTION_NO_TRAILER` — File rejected — missing trailer record.
- `CA_ELECTION_RECORD_COUNT_MISMATCH` — Record count does not match trailer totals.
- `CA_ELECTION_TECHNICAL_ERROR` — Technical error — no changes applied; contact support.

## Events

**`election.download.generated`**
  Payload: `broker_code`, `process_type`, `instrument_alpha`, `record_date`, `dataset_name`

**`election.download.notified`**
  Payload: `broker_code`, `dataset_name`, `email_addresses`

**`election.download.published`**
  Payload: `broker_code`, `dataset_name`

**`election.download.rejected`**
  Payload: `broker_code`, `process_type`, `instrument_alpha`

**`election.deadline.reminder`**
  Payload: `broker_code`, `instrument_alpha`, `election_deadline`

**`election.default.applied`**
  Payload: `broker_code`, `account_code`, `instrument_alpha`, `process_type`

## Connects to

- **broker-ca-election-upload** *(recommended)*
- **broker-client-account-maintenance** *(required)*
- **broker-corporate-actions-feed** *(recommended)*
- **broker-dissemination-download** *(recommended)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████░░░░░░░` | 18/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-ca-election-download/) · **Spec source:** [`broker-ca-election-download.blueprint.yaml`](./broker-ca-election-download.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
