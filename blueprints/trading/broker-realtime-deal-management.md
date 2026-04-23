<!-- AUTO-GENERATED FROM broker-realtime-deal-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Realtime Deal Management

> Intra-day release and management of market trades, allocations and deal extensions into the broker sub-ledger, with average-price calculation, electronic trade confirmations and SWIFT contract notes

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · trading · real-time · settlement · contract-notes · swift · etc · average-price

## What this does

Intra-day release and management of market trades, allocations and deal extensions into the broker sub-ledger, with average-price calculation, electronic trade confirmations and SWIFT contract notes

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **trade_reference** *(text, required)* — Trade Reference
- **instrument_code** *(text, required)* — Instrument Code
- **buy_sell_indicator** *(select, required)* — Buy/Sell Indicator
- **principal_agent_indicator** *(select, required)* — Principal/Agent Indicator
- **trading_account** *(text, required)* — Trading Account
- **allocation_account** *(text, optional)* — Allocation Account
- **client_account_code** *(text, optional)* — Client Account Code
- **trade_quantity** *(number, required)* — Trade Quantity
- **trade_price** *(number, required)* — Trade Price
- **average_price** *(number, optional)* — Calculated Average Price
- **override_price** *(number, optional)* — Override Allocation Price
- **rand_indicator** *(boolean, required)* — Rand Settlement Indicator
- **ring_fenced_term** *(text, optional)* — Ring-Fenced Term
- **trade_date** *(date, required)* — Trade Date
- **settlement_date** *(date, required)* — Settlement Date
- **release_status** *(select, required)* — Release Status
- **release_timestamp** *(datetime, optional)* — Release Timestamp
- **contract_note_number** *(text, optional)* — Contract Note Number
- **etc_status** *(select, optional)* — Electronic Trade Confirmation Status
- **swift_message_reference** *(text, optional)* — SWIFT Message Reference

## What must be true

- **real_time_processing → intra_day_release:** Market trades flow in from trading engine and must be released intra-day to update the sub-ledger before end-of-day batch
- **real_time_processing → same_day_allocation:** Same-day allocation is permitted only on allocation accounts and only after underlying market trades are released into the sub-ledger
- **real_time_processing → average_price_calculation:** Average price calculated across grouped market trades sharing broker, instrument, buy/sell, principal/agent, trading account, ring-fenced term and rand indicator
- **real_time_processing → override_price_allowed:** User may override the calculated average price at allocation time; override must be recorded with operator identity and timestamp
- **real_time_processing → unreleased_trades_fallback:** Trades not released intra-day are processed in the overnight batch without loss of data
- **data_integrity → grouping_keys:** Grouping for average-price aggregation must use all seven keys; mismatched keys produce separate groups
- **data_integrity → allocation_balance:** Allocation accounts must balance back to zero after all allocations are released on trade day
- **data_integrity → backdating_controls:** Pre-dated and back-dated deals require explicit facility and supervisor authorization
- **security → access_control:** Release and allocation screens require role-based authorization; operator cannot self-approve supervisor-gated actions
- **security → audit_trail:** Every release, override, adjustment and pre-date action logged with user, timestamp and before/after values
- **compliance → settlement_discipline:** Release deadlines align with clearing-cycle commitment to avoid margin penalties and reverse substitution
- **compliance → popia_compliance:** Client-linked trade data is personal information; processing and transmission must meet POPIA lawful-basis and security controls
- **compliance → contract_note_delivery:** Contract notes generated near-real-time in structured XML and SWIFT formats for client and counterparty delivery
- **business → etc_lifecycle:** Electronic Trade Confirmation messages flow between broker, custodian and counterparty; unmatched confirmations escalate to manual resolution
- **business → swift_adjustments:** Adjustment and history contract notes produced when released trades are later corrected; SWIFT messages reference original
- **business → upload_facilities:** Allocation and deal uploads accepted via batch files on trade day for bulk clients

## Success & failure scenarios

**✅ Success paths**

- **Release Trade Intraday** — when release_status eq "allocated"; user_role in ["broker_operator","trade_supervisor"], then move release_status allocated → released; set release_timestamp = "now"; emit trade.released. _Why: Operator releases a matched and allocated trade via the real-time trade release screen._
- **Calculate Average Price** — when trade_group_complete eq true, then set average_price = "computed"; emit trade.allocated. _Why: Compute average price across a grouped set of market trades for allocation._
- **Same Day Allocation At Average** — when allocation_account exists; release_status eq "released", then create_record; emit trade.allocated. _Why: Allocate released market trades on allocation accounts at the real-time average price._
- **Generate Realtime Contract Note** — when release_status eq "released", then create_record; emit contract_note.generated; call service; emit contract_note.swift_dispatched. _Why: Generate a structured contract note shortly after trade release and dispatch via SWIFT._
- **Confirm Electronic Trade Confirmation** — when etc_response eq "matched", then move release_status released → confirmed; emit etc.confirmed. _Why: Match electronic trade confirmation response from counterparty and mark trade confirmed._
- **Verify Allocation Balance** — when allocation_account_balance eq 0, then emit allocation.balanced. _Why: Confirm allocation account balances to zero at end of trade-day processing._

**❌ Failure paths**

- **Reject Duplicate Release** — when release_status in ["released","confirmed"], then emit trade.release_failed. _Why: Prevent release of a trade that has already been released._ *(error: `TRADE_ALREADY_RELEASED`)*
- **Block Allocation When Underlying Unreleased** — when release_status neq "released", then emit trade.release_failed. _Why: Block same-day allocation when underlying market trades have not yet been released._ *(error: `ALLOCATION_ACCOUNT_UNRELEASED`)*
- **Flag Etc Mismatch** — when etc_response eq "mismatched", then emit etc.mismatched. _Why: Counterparty ETC did not match, escalate for manual resolution._ *(error: `ETC_MISMATCH`)*

## Errors it can return

- `TRADE_RELEASE_FORBIDDEN` — User role cannot release trades on this screen
- `TRADE_ALREADY_RELEASED` — Trade has already been released and cannot be re-released
- `ALLOCATION_ACCOUNT_UNRELEASED` — Same-day allocation blocked, underlying market trades not yet released
- `ALLOCATION_BALANCE_NONZERO` — Allocation account does not balance to zero after release
- `AVERAGE_PRICE_UNAVAILABLE` — Average price cannot be calculated, trade group incomplete
- `OVERRIDE_PRICE_INVALID` — Override price failed validation or tolerance check
- `CONTRACT_NOTE_GENERATION_FAILED` — Contract note generation failed, trade flagged for review
- `SWIFT_DISPATCH_FAILED` — SWIFT gateway did not acknowledge contract note message
- `ETC_MISMATCH` — Electronic trade confirmation did not match counterparty response
- `BACKDATE_NOT_AUTHORIZED` — Backdating of trade requires supervisor authorization

## Events

**`trade.matched`**
  Payload: `trade_reference`, `instrument_code`, `trade_quantity`, `trade_price`, `timestamp`

**`trade.allocated`**
  Payload: `trade_reference`, `allocation_account`, `client_account_code`, `average_price`, `allocated_by`

**`trade.released`**
  Payload: `trade_reference`, `release_timestamp`, `released_by`

**`trade.release_failed`**
  Payload: `trade_reference`, `error_code`, `timestamp`

**`contract_note.generated`**
  Payload: `trade_reference`, `contract_note_number`, `format`, `timestamp`

**`contract_note.swift_dispatched`**
  Payload: `contract_note_number`, `swift_message_reference`, `timestamp`

**`etc.confirmed`**
  Payload: `trade_reference`, `counterparty`, `timestamp`

**`etc.mismatched`**
  Payload: `trade_reference`, `counterparty`, `reason`, `timestamp`

**`allocation.balanced`**
  Payload: `allocation_account`, `trade_date`, `timestamp`

## Connects to

- **broker-deal-management** *(recommended)*
- **broker-client-account-maintenance** *(recommended)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-realtime-deal-management/) · **Spec source:** [`broker-realtime-deal-management.blueprint.yaml`](./broker-realtime-deal-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
