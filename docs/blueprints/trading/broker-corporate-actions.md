---
title: "Broker Corporate Actions Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or s"
---

# Broker Corporate Actions Blueprint

> Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or share elections, and loan/collateral...

| | |
|---|---|
| **Feature** | `broker-corporate-actions` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, corporate-actions, entitlements, dividends, rights-issues, elections, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-corporate-actions.blueprint.yaml) |
| **JSON API** | [broker-corporate-actions.json]({{ site.baseurl }}/api/blueprints/trading/broker-corporate-actions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ca_operator` | Corporate Actions Operator | human |  |
| `ca_supervisor` | Corporate Actions Supervisor | human |  |
| `back_office_system` | Back-Office System | system |  |
| `exchange` | Stock Exchange | external |  |
| `central_securities_depository` | Central Securities Depository | external |  |
| `client` | Client Account Holder | external |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `event_code` | text | Yes | Corporate Action Event Code |  |
| `event_type` | select | Yes | Event Type |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `announcement_date` | date | Yes | Announcement Date |  |
| `last_day_to_trade` | date | Yes | Last Day to Trade (LDT) |  |
| `ex_dividend_date` | date | Yes | Ex-Dividend Date (XD) |  |
| `record_date` | date | Yes | Record Date (RD) |  |
| `payment_date` | date | No | Payment or Distribution Date |  |
| `dividend_rate` | number | No | Dividend Rate Per Share |  |
| `ratio_numerator` | number | No | Entitlement Ratio Numerator |  |
| `ratio_denominator` | number | No | Entitlement Ratio Denominator |  |
| `election_type` | select | No | Election Type (Cash or Shares) |  |
| `election_deadline` | datetime | No | Election Deadline |  |
| `client_account_code` | text | Yes | Client Account Code |  |
| `entitled_quantity` | number | Yes | Entitled Quantity |  |
| `frozen_position_flag` | boolean | Yes | Frozen Position Flag |  |
| `loan_position_flag` | boolean | No | Loan Position Flag |  |
| `collateral_position_flag` | boolean | No | Collateral Position Flag |  |
| `event_status` | select | Yes | Event Lifecycle Status |  |
| `withholding_tax_rate` | number | No | Dividends Tax Withholding Rate |  |

## States

**State field:** `event_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `announced` | Yes |  |
| `ldt_frozen` |  |  |
| `rd_processed` |  |  |
| `elections_captured` |  |  |
| `settled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `announced` | `ldt_frozen` | back_office_system |  |
|  | `ldt_frozen` | `rd_processed` | back_office_system |  |
|  | `rd_processed` | `elections_captured` | ca_operator |  |
|  | `elections_captured` | `settled` | ca_supervisor |  |
|  | `rd_processed` | `settled` | ca_supervisor |  |

## Rules

- **lifecycle:**
  - **ldt_freeze:** At LDT close, back-office system freezes entitled positions into a frozen file; no further trades affect this event's entitlement
  - **record_date_processing:** On RD, client entitlements are computed from frozen positions against the official ratio or rate
  - **ex_dividend_marking:** Instruments trade ex-dividend from XD; pricing systems must flag and adjust accordingly
- **entitlements:**
  - **cash_dividends:** Cash dividend events compute gross amount = holding x rate, net amount = gross minus dividends withholding tax
  - **capitalisation_issues:** Capitalisation issues allocate bonus shares at the declared ratio, with fractional entitlements settled in cash
  - **rights_issues:** Rights issues offer entitled holders the right to subscribe for new shares at the offer price by the election deadline
  - **dividend_reinvestment:** Dividend reinvestment plans convert cash dividend into additional shares at the reinvestment price when elected
- **elections:**
  - **election_capture:** Cash-or-shares elections captured per client account before the election deadline; defaults apply if no election received
  - **election_validation:** Election quantity cannot exceed entitled quantity; excess applications queued for allocation at issuer discretion
  - **election_messages:** Elections transmitted to the central securities depository via standard ISO 15022 MT565 messages
- **loan_collateral:**
  - **loans_processed_separately:** Stock-lending positions generate manufactured dividends or substitute entitlements paid by the borrower
  - **collateral_handling:** Collateral positions retain entitlements for the pledgor unless title has transferred
  - **oddlot_offer_segregation:** Oddlot offers processed separately for loan and collateral positions to preserve audit trail
- **compliance:**
  - **popia_compliance:** Client entitlement data contains personal financial information; POPIA lawful basis required
  - **tax_certificates:** Dividends tax withheld and reported via IT3b certificates at year-end
  - **audit_retention:** All event records, elections, and frozen files retained for at least 5 years

## Outcomes

### Announce_new_event (Priority: 1) | Transaction: atomic

_Load a newly announced corporate action with mandatory lifecycle dates_

**Given:**
- `event_code` (input) exists
- `instrument_code` (input) exists
- `last_day_to_trade` (input) exists
- `record_date` (input) exists

**Then:**
- **create_record**
- **set_field** target: `event_status` value: `announced`
- **emit_event** event: `ca.event.announced`

### Reject_duplicate_event (Priority: 2) — Error: `CA_EVENT_DUPLICATE`

_Prevent duplicate event codes for the same instrument_

**Given:**
- `event_code` (db) exists

**Then:**
- **emit_event** event: `ca.event.updated`

### Freeze_positions_at_ldt (Priority: 3) | Transaction: atomic

_At LDT close, snapshot entitled positions into the frozen file_

**Given:**
- `event_status` (db) eq `announced`
- `last_day_to_trade` (system) lte `now`

**Then:**
- **transition_state** field: `event_status` from: `announced` to: `ldt_frozen`
- **emit_event** event: `ca.ldt.frozen`

### Process_record_date (Priority: 4) | Transaction: atomic

_On record date, compute entitlements from the frozen file_

**Given:**
- `event_status` (db) eq `ldt_frozen`
- `record_date` (system) lte `now`

**Then:**
- **transition_state** field: `event_status` from: `ldt_frozen` to: `rd_processed`
- **emit_event** event: `ca.record_date.processed`

### Reject_rd_without_frozen_file (Priority: 5) — Error: `CA_FROZEN_FILE_MISSING`

_Block record date processing when the frozen file is absent_

**Given:**
- `frozen_file_available` (db) eq `false`

**Then:**
- **emit_event** event: `ca.event.updated`

### Capture_client_election (Priority: 6) | Transaction: atomic

_Capture client cash-or-shares election before the election deadline_

**Given:**
- `event_status` (db) eq `rd_processed`
- `election_deadline` (db) gt `now`
- `election_type` (input) in `cash,shares`

**Then:**
- **set_field** target: `event_status` value: `elections_captured`
- **emit_event** event: `ca.election.captured`

### Reject_late_election (Priority: 7) — Error: `CA_ELECTION_DEADLINE_PASSED`

_Reject elections submitted after the deadline_

**Given:**
- `election_deadline` (db) lte `now`

**Then:**
- **emit_event** event: `ca.event.updated`

### Reject_over_election (Priority: 8) — Error: `CA_ELECTION_EXCEEDS_ENTITLEMENT`

_Reject elections that exceed the entitled quantity_

**Given:**
- `election_quantity` (input) gt `entitled_quantity`

**Then:**
- **emit_event** event: `ca.event.updated`

### Settle_entitlements (Priority: 9) | Transaction: atomic

_Settle cash or share entitlements to client accounts on payment date_

**Given:**
- `event_status` (db) in `rd_processed,elections_captured`
- `payment_date` (system) lte `now`

**Then:**
- **transition_state** field: `event_status` from: `elections_captured` to: `settled`
- **emit_event** event: `ca.entitlement.settled`

### Process_loan_manufactured_payment (Priority: 10)

_Generate manufactured dividend payments for open stock-lending positions_

**Given:**
- `loan_position_flag` (db) eq `true`
- `event_type` (db) eq `cash_dividend`

**Then:**
- **call_service** target: `stock_lending_manufactured_payment`
- **emit_event** event: `ca.loan.manufactured_payment`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CA_EVENT_DUPLICATE` | 409 | Corporate action event code already exists for this instrument | No |
| `CA_LDT_PASSED` | 409 | Cannot modify event entitlement, last day to trade has passed | No |
| `CA_ELECTION_DEADLINE_PASSED` | 409 | Election deadline has passed, no further elections accepted | No |
| `CA_ELECTION_EXCEEDS_ENTITLEMENT` | 422 | Election quantity exceeds entitled quantity | No |
| `CA_FROZEN_FILE_MISSING` | 409 | Frozen file not available, record date processing cannot proceed | No |
| `CA_INVALID_RATIO` | 400 | Entitlement ratio must specify both numerator and denominator | No |
| `CA_POPIA_VIOLATION` | 422 | Entitlement data processing failed POPIA lawful-basis check | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ca.event.announced` |  | `event_code`, `event_type`, `instrument_code`, `announcement_date`, `ldt`, `record_date` |
| `ca.ldt.frozen` |  | `event_code`, `instrument_code`, `frozen_at`, `position_count` |
| `ca.record_date.processed` |  | `event_code`, `record_date`, `entitled_accounts`, `total_entitlement` |
| `ca.election.captured` |  | `event_code`, `client_account_code`, `election_type`, `quantity`, `captured_by` |
| `ca.entitlement.settled` |  | `event_code`, `client_account_code`, `settled_amount`, `settled_quantity`, `settlement_date` |
| `ca.loan.manufactured_payment` |  | `event_code`, `loan_reference`, `manufactured_amount`, `borrower` |
| `ca.event.updated` |  | `event_code`, `field_name`, `old_value`, `new_value`, `updated_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required |  |
| broker-client-account-maintenance | required |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Corporate Actions

Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or share elections, and loan/collateral...

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

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `popia_compliance` | popia-compliance | fail |
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| announce_new_event | `autonomous` | - | - |
| reject_duplicate_event | `supervised` | - | - |
| freeze_positions_at_ldt | `autonomous` | - | - |
| process_record_date | `autonomous` | - | - |
| reject_rd_without_frozen_file | `supervised` | - | - |
| capture_client_election | `autonomous` | - | - |
| reject_late_election | `supervised` | - | - |
| reject_over_election | `supervised` | - | - |
| settle_entitlements | `autonomous` | - | - |
| process_loan_manufactured_payment | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  MENUE: Election Positions and Results Menu
  MENUL: Entitlement Data Menu
  ENLDR: Entitlements Due By RD or Last Date of Rights
  ENLDT: Entitlements Due By Last Day to Trade
  ENREL: Entitlements Due By Release Date
  ICFRZ: Consolidated Frozen Positions
  IEFRZ: Entitlement Election Results
  ODSLB: Oddlot Offers on Loans
  ODCOL: Oddlot Offers on Collateral
  RTSLB: Rights Take-Up Maintenance on Loans
  RTCOL: Rights Take-Up Maintenance on Collateral
  TDFRA: Detail Frozen Position Maintenance
  TDSLB: Detail Frozen Position Maintenance on Loans
  TDCOL: Detail Frozen Position Maintenance on Collateral
  RESLB: Excess Rights on Loans
  RECOL: Excess Rights on Collateral
  ENDRP: Dividend Reinvestment
  ENTDU: Entitlements Due
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Corporate Actions Blueprint",
  "description": "Back-office corporate actions processing covering event announcement, last-day-to-trade and record-date lifecycle, client entitlements, rights issues, cash or s",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, corporate-actions, entitlements, dividends, rights-issues, elections, popia"
}
</script>
