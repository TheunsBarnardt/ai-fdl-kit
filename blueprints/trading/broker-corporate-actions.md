<!-- AUTO-GENERATED FROM broker-corporate-actions.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Corporate Actions

> Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or share elections, and loan/collateral...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · corporate-actions · entitlements · dividends · rights-issues · elections · popia

## What this does

Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or share elections, and loan/collateral...

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **event_code** *(text, required)* — Corporate Action Event Code
- **event_type** *(select, required)* — Event Type
- **instrument_code** *(text, required)* — Instrument Code
- **announcement_date** *(date, required)* — Announcement Date
- **last_day_to_trade** *(date, required)* — Last Day to Trade (LDT)
- **ex_dividend_date** *(date, required)* — Ex-Dividend Date (XD)
- **record_date** *(date, required)* — Record Date (RD)
- **payment_date** *(date, optional)* — Payment or Distribution Date
- **dividend_rate** *(number, optional)* — Dividend Rate Per Share
- **ratio_numerator** *(number, optional)* — Entitlement Ratio Numerator
- **ratio_denominator** *(number, optional)* — Entitlement Ratio Denominator
- **election_type** *(select, optional)* — Election Type (Cash or Shares)
- **election_deadline** *(datetime, optional)* — Election Deadline
- **client_account_code** *(text, required)* — Client Account Code
- **entitled_quantity** *(number, required)* — Entitled Quantity
- **frozen_position_flag** *(boolean, required)* — Frozen Position Flag
- **loan_position_flag** *(boolean, optional)* — Loan Position Flag
- **collateral_position_flag** *(boolean, optional)* — Collateral Position Flag
- **event_status** *(select, required)* — Event Lifecycle Status
- **withholding_tax_rate** *(number, optional)* — Dividends Tax Withholding Rate

## What must be true

- **lifecycle → ldt_freeze:** At LDT close, back-office system freezes entitled positions into a frozen file; no further trades affect this event's entitlement
- **lifecycle → record_date_processing:** On RD, client entitlements are computed from frozen positions against the official ratio or rate
- **lifecycle → ex_dividend_marking:** Instruments trade ex-dividend from XD; pricing systems must flag and adjust accordingly
- **entitlements → cash_dividends:** Cash dividend events compute gross amount = holding x rate, net amount = gross minus dividends withholding tax
- **entitlements → capitalisation_issues:** Capitalisation issues allocate bonus shares at the declared ratio, with fractional entitlements settled in cash
- **entitlements → rights_issues:** Rights issues offer entitled holders the right to subscribe for new shares at the offer price by the election deadline
- **entitlements → dividend_reinvestment:** Dividend reinvestment plans convert cash dividend into additional shares at the reinvestment price when elected
- **elections → election_capture:** Cash-or-shares elections captured per client account before the election deadline; defaults apply if no election received
- **elections → election_validation:** Election quantity cannot exceed entitled quantity; excess applications queued for allocation at issuer discretion
- **elections → election_messages:** Elections transmitted to the central securities depository via standard ISO 15022 MT565 messages
- **loan_collateral → loans_processed_separately:** Stock-lending positions generate manufactured dividends or substitute entitlements paid by the borrower
- **loan_collateral → collateral_handling:** Collateral positions retain entitlements for the pledgor unless title has transferred
- **loan_collateral → oddlot_offer_segregation:** Oddlot offers processed separately for loan and collateral positions to preserve audit trail
- **compliance → popia_compliance:** Client entitlement data contains personal financial information; POPIA lawful basis required
- **compliance → tax_certificates:** Dividends tax withheld and reported via IT3b certificates at year-end
- **compliance → audit_retention:** All event records, elections, and frozen files retained for at least 5 years

## Success & failure scenarios

**✅ Success paths**

- **Announce New Event** — when event_code exists; instrument_code exists; last_day_to_trade exists; record_date exists, then create_record; set event_status = "announced"; emit ca.event.announced. _Why: Load a newly announced corporate action with mandatory lifecycle dates._
- **Freeze Positions At Ldt** — when event_status eq "announced"; last_day_to_trade lte "now", then move event_status announced → ldt_frozen; emit ca.ldt.frozen. _Why: At LDT close, snapshot entitled positions into the frozen file._
- **Process Record Date** — when event_status eq "ldt_frozen"; record_date lte "now", then move event_status ldt_frozen → rd_processed; emit ca.record_date.processed. _Why: On record date, compute entitlements from the frozen file._
- **Capture Client Election** — when event_status eq "rd_processed"; election_deadline gt "now"; election_type in ["cash","shares"], then set event_status = "elections_captured"; emit ca.election.captured. _Why: Capture client cash-or-shares election before the election deadline._
- **Settle Entitlements** — when event_status in ["rd_processed","elections_captured"]; payment_date lte "now", then move event_status elections_captured → settled; emit ca.entitlement.settled. _Why: Settle cash or share entitlements to client accounts on payment date._
- **Process Loan Manufactured Payment** — when loan_position_flag eq true; event_type eq "cash_dividend", then call service; emit ca.loan.manufactured_payment. _Why: Generate manufactured dividend payments for open stock-lending positions._

**❌ Failure paths**

- **Reject Duplicate Event** — when event_code exists, then emit ca.event.updated. _Why: Prevent duplicate event codes for the same instrument._ *(error: `CA_EVENT_DUPLICATE`)*
- **Reject Rd Without Frozen File** — when frozen_file_available eq false, then emit ca.event.updated. _Why: Block record date processing when the frozen file is absent._ *(error: `CA_FROZEN_FILE_MISSING`)*
- **Reject Late Election** — when election_deadline lte "now", then emit ca.event.updated. _Why: Reject elections submitted after the deadline._ *(error: `CA_ELECTION_DEADLINE_PASSED`)*
- **Reject Over Election** — when election_quantity gt "entitled_quantity", then emit ca.event.updated. _Why: Reject elections that exceed the entitled quantity._ *(error: `CA_ELECTION_EXCEEDS_ENTITLEMENT`)*

## Errors it can return

- `CA_EVENT_DUPLICATE` — Corporate action event code already exists for this instrument
- `CA_LDT_PASSED` — Cannot modify event entitlement, last day to trade has passed
- `CA_ELECTION_DEADLINE_PASSED` — Election deadline has passed, no further elections accepted
- `CA_ELECTION_EXCEEDS_ENTITLEMENT` — Election quantity exceeds entitled quantity
- `CA_FROZEN_FILE_MISSING` — Frozen file not available, record date processing cannot proceed
- `CA_INVALID_RATIO` — Entitlement ratio must specify both numerator and denominator
- `CA_POPIA_VIOLATION` — Entitlement data processing failed POPIA lawful-basis check

## Events

**`ca.event.announced`**
  Payload: `event_code`, `event_type`, `instrument_code`, `announcement_date`, `ldt`, `record_date`

**`ca.ldt.frozen`**
  Payload: `event_code`, `instrument_code`, `frozen_at`, `position_count`

**`ca.record_date.processed`**
  Payload: `event_code`, `record_date`, `entitled_accounts`, `total_entitlement`

**`ca.election.captured`**
  Payload: `event_code`, `client_account_code`, `election_type`, `quantity`, `captured_by`

**`ca.entitlement.settled`**
  Payload: `event_code`, `client_account_code`, `settled_amount`, `settled_quantity`, `settlement_date`

**`ca.loan.manufactured_payment`**
  Payload: `event_code`, `loan_reference`, `manufactured_amount`, `borrower`

**`ca.event.updated`**
  Payload: `event_code`, `field_name`, `old_value`, `new_value`, `updated_by`

## Connects to

- **popia-compliance** *(required)*
- **broker-client-account-maintenance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-corporate-actions/) · **Spec source:** [`broker-corporate-actions.blueprint.yaml`](./broker-corporate-actions.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
