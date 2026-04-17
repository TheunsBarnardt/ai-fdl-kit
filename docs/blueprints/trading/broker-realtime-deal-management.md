---
title: "Broker Realtime Deal Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Intra-day release and management of market trades, allocations and deal extensions into the broker sub-ledger, with average-price calculation, electronic trade "
---

# Broker Realtime Deal Management Blueprint

> Intra-day release and management of market trades, allocations and deal extensions into the broker sub-ledger, with average-price calculation, electronic trade confirmations and SWIFT contract notes

| | |
|---|---|
| **Feature** | `broker-realtime-deal-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, trading, real-time, settlement, contract-notes, swift, etc, average-price |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-realtime-deal-management.blueprint.yaml) |
| **JSON API** | [broker-realtime-deal-management.json]({{ site.baseurl }}/api/blueprints/trading/broker-realtime-deal-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `dealing_desk` | Dealing Desk Trader | human |  |
| `trade_supervisor` | Trade Release Supervisor | human |  |
| `back_office_system` | Back-Office Sub-Ledger System | system |  |
| `trading_engine` | Market Trading Engine | external |  |
| `clearing_system` | Central Clearing Solution | external |  |
| `swift_gateway` | SWIFT Messaging Gateway | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `trade_reference` | text | Yes | Trade Reference |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `buy_sell_indicator` | select | Yes | Buy/Sell Indicator |  |
| `principal_agent_indicator` | select | Yes | Principal/Agent Indicator |  |
| `trading_account` | text | Yes | Trading Account |  |
| `allocation_account` | text | No | Allocation Account |  |
| `client_account_code` | text | No | Client Account Code |  |
| `trade_quantity` | number | Yes | Trade Quantity |  |
| `trade_price` | number | Yes | Trade Price |  |
| `average_price` | number | No | Calculated Average Price |  |
| `override_price` | number | No | Override Allocation Price |  |
| `rand_indicator` | boolean | Yes | Rand Settlement Indicator |  |
| `ring_fenced_term` | text | No | Ring-Fenced Term |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `release_status` | select | Yes | Release Status |  |
| `release_timestamp` | datetime | No | Release Timestamp |  |
| `contract_note_number` | text | No | Contract Note Number |  |
| `etc_status` | select | No | Electronic Trade Confirmation Status |  |
| `swift_message_reference` | text | No | SWIFT Message Reference |  |

## States

**State field:** `release_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `matched` | Yes |  |
| `allocated` |  |  |
| `released` |  |  |
| `confirmed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `matched` | `allocated` | dealing_desk |  |
|  | `allocated` | `released` | broker_operator |  |
|  | `released` | `confirmed` | back_office_system |  |

## Rules

- **real_time_processing:**
  - **intra_day_release:** Market trades flow in from trading engine and must be released intra-day to update the sub-ledger before end-of-day batch
  - **same_day_allocation:** Same-day allocation is permitted only on allocation accounts and only after underlying market trades are released into the sub-ledger
  - **average_price_calculation:** Average price calculated across grouped market trades sharing broker, instrument, buy/sell, principal/agent, trading account, ring-fenced term and rand indicator
  - **override_price_allowed:** User may override the calculated average price at allocation time; override must be recorded with operator identity and timestamp
  - **unreleased_trades_fallback:** Trades not released intra-day are processed in the overnight batch without loss of data
- **data_integrity:**
  - **grouping_keys:** Grouping for average-price aggregation must use all seven keys; mismatched keys produce separate groups
  - **allocation_balance:** Allocation accounts must balance back to zero after all allocations are released on trade day
  - **backdating_controls:** Pre-dated and back-dated deals require explicit facility and supervisor authorization
- **security:**
  - **access_control:** Release and allocation screens require role-based authorization; operator cannot self-approve supervisor-gated actions
  - **audit_trail:** Every release, override, adjustment and pre-date action logged with user, timestamp and before/after values
- **compliance:**
  - **settlement_discipline:** Release deadlines align with clearing-cycle commitment to avoid margin penalties and reverse substitution
  - **popia_compliance:** Client-linked trade data is personal information; processing and transmission must meet POPIA lawful-basis and security controls
  - **contract_note_delivery:** Contract notes generated near-real-time in structured XML and SWIFT formats for client and counterparty delivery
- **business:**
  - **etc_lifecycle:** Electronic Trade Confirmation messages flow between broker, custodian and counterparty; unmatched confirmations escalate to manual resolution
  - **swift_adjustments:** Adjustment and history contract notes produced when released trades are later corrected; SWIFT messages reference original
  - **upload_facilities:** Allocation and deal uploads accepted via batch files on trade day for bulk clients

## Outcomes

### Release_trade_intraday (Priority: 1) | Transaction: atomic

_Operator releases a matched and allocated trade via the real-time trade release screen_

**Given:**
- `release_status` (db) eq `allocated`
- `user_role` (session) in `broker_operator,trade_supervisor`

**Then:**
- **transition_state** field: `release_status` from: `allocated` to: `released`
- **set_field** target: `release_timestamp` value: `now`
- **emit_event** event: `trade.released`

### Reject_duplicate_release (Priority: 2) — Error: `TRADE_ALREADY_RELEASED`

_Prevent release of a trade that has already been released_

**Given:**
- `release_status` (db) in `released,confirmed`

**Then:**
- **emit_event** event: `trade.release_failed`

### Calculate_average_price (Priority: 3) | Transaction: atomic

_Compute average price across a grouped set of market trades for allocation_

**Given:**
- `trade_group_complete` (computed) eq `true`

**Then:**
- **set_field** target: `average_price` value: `computed`
- **emit_event** event: `trade.allocated`

### Same_day_allocation_at_average (Priority: 4) | Transaction: atomic

_Allocate released market trades on allocation accounts at the real-time average price_

**Given:**
- `allocation_account` (input) exists
- `release_status` (db) eq `released`

**Then:**
- **create_record**
- **emit_event** event: `trade.allocated`

### Block_allocation_when_underlying_unreleased (Priority: 5) — Error: `ALLOCATION_ACCOUNT_UNRELEASED`

_Block same-day allocation when underlying market trades have not yet been released_

**Given:**
- `release_status` (db) neq `released`

**Then:**
- **emit_event** event: `trade.release_failed`

### Generate_realtime_contract_note (Priority: 6) | Transaction: atomic

_Generate a structured contract note shortly after trade release and dispatch via SWIFT_

**Given:**
- `release_status` (db) eq `released`

**Then:**
- **create_record**
- **emit_event** event: `contract_note.generated`
- **call_service** target: `swift_gateway`
- **emit_event** event: `contract_note.swift_dispatched`

### Confirm_electronic_trade_confirmation (Priority: 7) | Transaction: atomic

_Match electronic trade confirmation response from counterparty and mark trade confirmed_

**Given:**
- `etc_response` (system) eq `matched`

**Then:**
- **transition_state** field: `release_status` from: `released` to: `confirmed`
- **emit_event** event: `etc.confirmed`

### Flag_etc_mismatch (Priority: 8) — Error: `ETC_MISMATCH`

_Counterparty ETC did not match, escalate for manual resolution_

**Given:**
- `etc_response` (system) eq `mismatched`

**Then:**
- **emit_event** event: `etc.mismatched`

### Verify_allocation_balance (Priority: 9)

_Confirm allocation account balances to zero at end of trade-day processing_

**Given:**
- `allocation_account_balance` (computed) eq `0`

**Then:**
- **emit_event** event: `allocation.balanced`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TRADE_RELEASE_FORBIDDEN` | 403 | User role cannot release trades on this screen | No |
| `TRADE_ALREADY_RELEASED` | 409 | Trade has already been released and cannot be re-released | No |
| `ALLOCATION_ACCOUNT_UNRELEASED` | 409 | Same-day allocation blocked, underlying market trades not yet released | No |
| `ALLOCATION_BALANCE_NONZERO` | 422 | Allocation account does not balance to zero after release | No |
| `AVERAGE_PRICE_UNAVAILABLE` | 422 | Average price cannot be calculated, trade group incomplete | No |
| `OVERRIDE_PRICE_INVALID` | 400 | Override price failed validation or tolerance check | No |
| `CONTRACT_NOTE_GENERATION_FAILED` | 500 | Contract note generation failed, trade flagged for review | No |
| `SWIFT_DISPATCH_FAILED` | 503 | SWIFT gateway did not acknowledge contract note message | No |
| `ETC_MISMATCH` | 409 | Electronic trade confirmation did not match counterparty response | No |
| `BACKDATE_NOT_AUTHORIZED` | 403 | Backdating of trade requires supervisor authorization | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `trade.matched` |  | `trade_reference`, `instrument_code`, `trade_quantity`, `trade_price`, `timestamp` |
| `trade.allocated` |  | `trade_reference`, `allocation_account`, `client_account_code`, `average_price`, `allocated_by` |
| `trade.released` |  | `trade_reference`, `release_timestamp`, `released_by` |
| `trade.release_failed` |  | `trade_reference`, `error_code`, `timestamp` |
| `contract_note.generated` |  | `trade_reference`, `contract_note_number`, `format`, `timestamp` |
| `contract_note.swift_dispatched` |  | `contract_note_number`, `swift_message_reference`, `timestamp` |
| `etc.confirmed` |  | `trade_reference`, `counterparty`, `timestamp` |
| `etc.mismatched` |  | `trade_reference`, `counterparty`, `reason`, `timestamp` |
| `allocation.balanced` |  | `allocation_account`, `trade_date`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-deal-management | recommended |  |
| broker-client-account-maintenance | recommended |  |
| popia-compliance | required |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  RTREL: Real-time Trade Release
  RTMON: Real-time Release Monitoring Enquiry
  TRELT: Trades Released Today
  TRADS: Online Trades Display
  DIRAL: Summary Online Trades
  DCLOP: New Deals Previous Day
  PRAVG: Price Average Display
  PRAVP: Post Release Average Price Summary
  RTNTE: Real-time Contract Note Display
  SDALL: Same Day Allocations
  ALDLS: List of Open Deals on Allocation Accounts
  DLPRE: Pre-dated Direct Deals
  DLADJ: Deal Adjustments
  PDSETL: Settlement Details Report
uploads:
  same_day_allocation_upload: Batch upload of same-day allocations
  deals_upload: Batch upload of deals
contract_note_formats:
  - XML
  - SWIFT
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Realtime Deal Management Blueprint",
  "description": "Intra-day release and management of market trades, allocations and deal extensions into the broker sub-ledger, with average-price calculation, electronic trade ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, trading, real-time, settlement, contract-notes, swift, etc, average-price"
}
</script>
