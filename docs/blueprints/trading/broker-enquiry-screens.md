---
title: "Broker Enquiry Screens Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics"
---

# Broker Enquiry Screens Blueprint

> Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics, and portfolio holdings

| | |
|---|---|
| **Feature** | `broker-enquiry-screens` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, enquiry, read-only, client-positions, balances, financial-history, portfolio, trade-statistics |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-enquiry-screens.blueprint.yaml) |
| **JSON API** | [broker-enquiry-screens.json]({{ site.baseurl }}/api/blueprints/trading/broker-enquiry-screens.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_user` | Broker Back-Office User | human |  |
| `broker_supervisor` | Broker Supervisor | human |  |
| `back_office_system` | Back-Office Deal-Accounting System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `account_code` | text | Yes | Account Code |  |
| `instrument_code` | text | No | Instrument / Share Code |  |
| `deal_number` | text | No | Deal Number |  |
| `trade_date_from` | date | No | Trade Date From |  |
| `trade_date_to` | date | No | Trade Date To |  |
| `enquiry_screen` | select | Yes | Enquiry Screen Code |  |
| `buy_sell_indicator` | select | No | Buy / Sell Indicator |  |
| `quantity` | number | No | Quantity |  |
| `price` | number | No | Price |  |
| `consideration` | number | No | Consideration |  |
| `settlement_date` | date | No | Settlement Date |  |
| `balance_type` | select | No | Balance Type |  |
| `currency_code` | text | No | Currency Code |  |
| `transfer_from_account` | text | No | Transfer From Account |  |
| `transfer_to_account` | text | No | Transfer To Account |  |
| `transfer_amount` | number | No | Transfer Amount |  |
| `portfolio_as_at_date` | date | No | Portfolio Valuation Date |  |
| `average_price` | number | No | Average Price |  |
| `charges_total` | number | No | Charges Total |  |
| `trade_statistics_period` | select | No | Trade Statistics Period |  |

## States

**State field:** `enquiry_session_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `open` | Yes |  |
| `filtered` |  |  |
| `drilled_down` |  |  |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `open` | `filtered` | broker_user |  |
|  | `filtered` | `drilled_down` | broker_user |  |
|  | `drilled_down` | `filtered` | broker_user |  |
|  | `filtered` | `closed` | broker_user |  |

## Rules

- **data_integrity:**
  - **read_consistency:** Enquiry screens reflect ledger state as at last completed batch; intraday deals shown with pending flag
  - **drill_down_linkage:** Summary lines must resolve to a single underlying deal, scrip movement, or financial entry record
  - **balance_reconciliation:** Cash and scrip balances across enquiry screens must tie back to the general ledger control totals
- **security:**
  - **access_control:** Screen-level and account-level access controlled by back-office resource access facility
  - **account_scope:** Users may only query accounts within their assigned branch, partner, or advisor scope
  - **supervisor_override:** Cross-scope enquiries require supervisor role and are audit-logged
  - **transfer_dual_control:** Balance transfer actions require operator capture plus supervisor release
- **compliance:**
  - **popia_minimum_necessary:** Enquiry responses must mask personal information not needed for the operational task
  - **audit_trail:** Every enquiry logged with user, account queried, screen, timestamp, and IP for regulatory inspection
  - **data_retention:** Enquiry access logs retained for at least 36 months
- **business:**
  - **open_positions_view:** Open deals, open scrip, and settlement obligations surfaced on a single positions-and-history menu
  - **deal_summary_drilldown:** Deal summaries drill down to specified deal and specified scrip records for full audit detail
  - **portfolio_valuation:** Securities positions valued using post-release average price and current market price
  - **balance_transfer:** Intra-account balance transfers permitted on the balance screen, inter-account transfers blocked and routed to cash management
  - **trade_statistics:** Charge and trade statistics aggregated by instrument, period, and account

## Outcomes

### View_open_positions_and_history (Priority: 1)

_User opens the positions-and-history menu for a valid in-scope account_

**Given:**
- `account_code` (input) exists
- `account_in_scope` (session) eq `true`

**Then:**
- **call_service** target: `open_positions_service`
- **emit_event** event: `enquiry.executed`

### Reject_out_of_scope_enquiry (Priority: 2) — Error: `ENQUIRY_FORBIDDEN_SCOPE`

_Block enquiries on accounts outside the user's branch or advisor scope_

**Given:**
- `account_in_scope` (session) eq `false`

**Then:**
- **emit_event** event: `enquiry.scope_violation`

### Drill_into_specified_deal (Priority: 3)

_User drills from open-deals summary into a specified deal record_

**Given:**
- `deal_number` (input) exists

**Then:**
- **call_service** target: `specified_deal_service`
- **emit_event** event: `enquiry.drilldown`

### View_account_balance (Priority: 4)

_User displays current cash and scrip balance for the account_

**Given:**
- `enquiry_screen` (input) eq `ACBAL`

**Then:**
- **call_service** target: `account_balance_service`
- **emit_event** event: `enquiry.executed`

### Capture_balance_transfer (Priority: 5) | Transaction: atomic

_Operator captures an intra-account balance transfer for supervisor release_

**Given:**
- `enquiry_screen` (input) eq `ACBAL`
- `transfer_amount` (input) gt `0`
- `available_balance` (db) gte `0`

**Then:**
- **create_record**
- **emit_event** event: `balance.transfer_captured`

### Reject_unreleased_transfer (Priority: 6) — Error: `BALANCE_TRANSFER_FORBIDDEN`

_Block balance transfer posting without supervisor release_

**Given:**
- `user_role` (session) neq `broker_supervisor`
- `transfer_released` (input) eq `true`

**Then:**
- **emit_event** event: `balance.transfer_captured`

### View_portfolio_valuation (Priority: 7)

_User views securities positions valued at post-release average and market price_

**Given:**
- `portfolio_as_at_date` (input) exists

**Then:**
- **call_service** target: `portfolio_valuation_service`
- **emit_event** event: `portfolio.valuation_viewed`

### View_financial_history (Priority: 8)

_User queries deal and financial history over a date range_

**Given:**
- `trade_date_from` (input) exists
- `trade_date_to` (input) exists

**Then:**
- **call_service** target: `financial_history_service`
- **emit_event** event: `enquiry.executed`

### View_trade_statistics (Priority: 9)

_User views charge and trade statistics aggregated by period_

**Given:**
- `trade_statistics_period` (input) exists

**Then:**
- **call_service** target: `trade_statistics_service`
- **emit_event** event: `trade_statistics.viewed`

### Reject_invalid_date_range (Priority: 10) — Error: `ENQUIRY_INVALID_DATE_RANGE`

_Reject enquiries where date range is inverted or exceeds maximum window_

**Given:**
- `trade_date_from` (input) gt `trade_date_to`

**Then:**
- **emit_event** event: `enquiry.executed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ENQUIRY_ACCOUNT_NOT_FOUND` | 404 | Account does not exist or is not within your access scope | No |
| `ENQUIRY_FORBIDDEN_SCOPE` | 403 | Access denied, account outside your branch or advisor scope | No |
| `ENQUIRY_INVALID_DATE_RANGE` | 400 | Trade date range is invalid or exceeds maximum permitted window | No |
| `ENQUIRY_DATA_STALE` | 409 | Enquiry data temporarily unavailable, ledger batch in progress | No |
| `BALANCE_TRANSFER_FORBIDDEN` | 403 | Balance transfer requires supervisor release | No |
| `BALANCE_TRANSFER_INSUFFICIENT` | 422 | Insufficient available balance for requested transfer | No |
| `ENQUIRY_POPIA_MASK_REQUIRED` | 422 | Response suppressed, personal information masking rules not satisfied | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `enquiry.executed` |  | `user_id`, `account_code`, `enquiry_screen`, `timestamp` |
| `enquiry.drilldown` |  | `user_id`, `account_code`, `deal_number`, `from_screen`, `to_screen`, `timestamp` |
| `enquiry.scope_violation` |  | `user_id`, `account_code`, `enquiry_screen`, `timestamp` |
| `balance.transfer_captured` |  | `account_code`, `transfer_amount`, `balance_type`, `captured_by`, `timestamp` |
| `balance.transfer_released` |  | `account_code`, `transfer_amount`, `released_by`, `timestamp` |
| `portfolio.valuation_viewed` |  | `user_id`, `account_code`, `portfolio_as_at_date`, `timestamp` |
| `trade_statistics.viewed` |  | `user_id`, `account_code`, `trade_statistics_period`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | optional |  |

## AGI Readiness

### Goals

#### Reliable Broker Enquiry Screens

Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics, and portfolio holdings

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
| `broker_client_account_maintenance` | broker-client-account-maintenance | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| view_open_positions_and_history | `autonomous` | - | - |
| reject_out_of_scope_enquiry | `supervised` | - | - |
| drill_into_specified_deal | `autonomous` | - | - |
| view_account_balance | `autonomous` | - | - |
| capture_balance_transfer | `autonomous` | - | - |
| reject_unreleased_transfer | `supervised` | - | - |
| view_portfolio_valuation | `autonomous` | - | - |
| view_financial_history | `autonomous` | - | - |
| view_trade_statistics | `autonomous` | - | - |
| reject_invalid_date_range | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  MENUK: Open Positions and History Menu
  ACDLS: Open Deals By Share Display
  SPDEL: Specified Deal Record
  SPSCR: Specified Scrip Record
  SHDLS: Deals and Scrip by Instrument
  AFINH: Account Deal and Financial History
  ASAFH: Account Safex History
  ASAFP: Safex Positions
  ACBAL: Account Balance
  ASHRH: Account Share History
  CSEXD: Controlled Account Transactions
  PRAVP: Post Release Average Price Summary
  PRAVG: Equity Average Price Summary
  SFENQ: Securities and Funds Availability Selection Enquiry
  SFPSS: Securities and Funds Availability Proprietary Sales
  SFPPS: Securities and Funds Availability Proprietary Purchases
  TRELT: Trades Released Today
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Enquiry Screens Blueprint",
  "description": "Online enquiry facilities for broker back-office users to view client balances, open deals, securities positions, financial history, charge and trade statistics",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, enquiry, read-only, client-positions, balances, financial-history, portfolio, trade-statistics"
}
</script>
