---
title: "Broker Securities Funds Availability Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement acros"
---

# Broker Securities Funds Availability Blueprint

> Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement across proprietary and controlled accounts

| | |
|---|---|
| **Feature** | `broker-securities-funds-availability` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, settlement, clearing, pre-trade, risk, availability, trading-limits |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-securities-funds-availability.blueprint.yaml) |
| **JSON API** | [broker-securities-funds-availability.json]({{ site.baseurl }}/api/blueprints/trading/broker-securities-funds-availability.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `settlements_officer` | Settlements Officer | human |  |
| `risk_officer` | Risk Officer | human |  |
| `back_office_system` | Back-Office System | system |  |
| `clearing_system` | Equity Clearing System | external |  |
| `trading_platform` | Trading Platform | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `batch_date` | date | Yes | Batch Date |  |
| `source_indicator` | select | Yes | Source (Batch or Intraday) |  |
| `account_group` | select | Yes | Account Group (BOA / Controlled / Proprietary) |  |
| `purchase_sale_indicator` | select | Yes | Purchase or Sale Indicator |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `instrument_code` | text | No | Instrument Code |  |
| `account_code` | text | Yes | Account Code |  |
| `account_type` | text | Yes | Account Type |  |
| `branch_code` | text | No | Branch Code |  |
| `partner_code` | text | No | Partner Code |  |
| `deal_id` | text | No | Deal Identifier |  |
| `trade_type` | text | No | Trade Type |  |
| `foreign_indicator` | boolean | No | Foreign Currency Settlement Flag |  |
| `sale_quantity` | number | No | Sale Quantity |  |
| `quantity_short` | number | No | Quantity Short |  |
| `demat_scrip_available` | number | No | Dematerialised Scrip Available |  |
| `purchase_qty_on_suspense` | number | No | Purchase Quantity on Suspense Account |  |
| `slb_collateral_qty_due` | number | No | Stock Lending and Collateral Quantity Due |  |
| `entitlements_qty_due` | number | No | Entitlements Quantity Due |  |
| `purchase_qty_due` | number | No | Purchase Quantity Due |  |
| `qty_allocated_to_sales` | number | No | Quantity Allocated to Sales |  |
| `purchase_amount` | number | No | Purchase Amount |  |
| `amount_short` | number | No | Amount Short |  |
| `total_amount_short` | number | No | Total Amount Short |  |
| `entitlement_amount_due` | number | No | Entitlement Amount Due |  |
| `sale_amount_due` | number | No | Sale Amount Due |  |
| `amount_allocated_to_purchases` | number | No | Amount Allocated to Purchases |  |
| `cash_balance` | number | No | Available Cash Balance |  |
| `securities_holding_qty` | number | No | Securities Holding Quantity |  |
| `trading_limit` | number | No | Account Trading Limit |  |
| `limit_utilisation` | number | No | Current Trading Limit Utilisation |  |
| `availability_status` | select | Yes | Availability Check Status |  |

## States

**State field:** `availability_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `passed` |  |  |
| `failed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `passed` | back_office_system |  |
|  | `pending` | `failed` | back_office_system |  |

## Rules

- **data_integrity:**
  - **batch_calculation_schedule:** Batch availability calculations run on T, T+1, T+2 and T+3 evenings; intraday run at 12h00 for T+4 deals
  - **proprietary_aggregation:** Proprietary availability is calculated across ALL proprietary accounts aggregated, not per individual account
  - **controlled_client_scope:** Controlled client calculations are produced daily T to T+3 and intraday on T+4
  - **proprietary_scope:** Proprietary account calculations are produced on T+2 and T+3
  - **display_freshness:** Displayed data is as at the specified batch or intraday time, and is NOT real-time allocation
- **availability_formulas:**
  - **quantity_short:** quantity_short = sale_quantity + (demat_scrip_available + purchase_qty_on_suspense + slb_collateral_qty_due + entitlements_qty_due + purchase_qty_due - qty_allocated_to_sales)
  - **amount_short:** amount_short = purchase_amount - (entitlement_amount_due + sale_amount_due - amount_allocated_to_purchases)
  - **allocation_order:** Allocate available securities to sales and available funds to purchases from smallest to largest, as a running total until exhausted
- **pre_trade:**
  - **cash_sufficiency:** Purchase orders require cash_balance >= purchase_amount + projected settlement obligations
  - **securities_sufficiency:** Sale orders require securities_holding_qty >= sale_quantity net of pending allocations
  - **trading_limit_enforcement:** Order value + limit_utilisation must not exceed trading_limit for the account
  - **real_time_lookup:** Real-time position lookup must reflect intraday deals and allocations, not only the last batch
- **account_groupings:**
  - **boa:** Broker Own Accounts — accounts with institution type BOA, typically account type C
  - **controlled:** Controlled client accounts — account types C, B, CB, CL, CS, LL, A, AB, AF, AL, AN, AS, Q, QL, QN, QS
  - **proprietary:** Proprietary accounts — account types S, DA, N, EC, ER, EN, ES, LB, LK, LP, QD, RS, PT, D, OB
- **security:**
  - **access_control:** Screen and API access controlled per role; view permissions distinct from override permissions
  - **segregation_of_duties:** Overriding a failed availability check requires risk officer role
- **compliance:**
  - **popia_alignment:** Account and client data touched during availability checks follows POPIA protections defined in the popia-compliance blueprint
  - **audit_trail:** Every availability check and any override are logged with user, timestamp, inputs and result
- **business:**
  - **failed_trade_prevention:** Availability messages feed the clearing system so loan requirements, margins and penalties can be computed for potential failed trades
  - **short_sale_flagging:** Sales with quantity_short > 0 are flagged for stock borrow or corrective action before settlement
  - **purchase_funding_flagging:** Purchases with amount_short > 0 are flagged for funding before settlement

## Outcomes

### Pre_trade_cash_sufficient (Priority: 1) | Transaction: atomic

_Purchase order passes pre-trade funds availability check_

**Given:**
- `purchase_sale_indicator` (input) eq `P`
- `cash_balance` (db) gte `purchase_amount`
- `limit_utilisation` (computed) lte `trading_limit`

**Then:**
- **set_field** target: `availability_status` value: `passed`
- **transition_state** field: `availability_status` from: `pending` to: `passed`
- **emit_event** event: `availability.check.passed`

### Pre_trade_insufficient_funds (Priority: 2) — Error: `SFA_INSUFFICIENT_FUNDS`

_Purchase order fails because available cash does not cover the purchase amount_

**Given:**
- `purchase_sale_indicator` (input) eq `P`
- `cash_balance` (db) lt `purchase_amount`

**Then:**
- **set_field** target: `availability_status` value: `failed`
- **transition_state** field: `availability_status` from: `pending` to: `failed`
- **emit_event** event: `availability.check.failed`
- **emit_event** event: `availability.funding_shortfall_detected`

### Pre_trade_securities_sufficient (Priority: 3) | Transaction: atomic

_Sale order passes pre-trade securities availability check_

**Given:**
- `purchase_sale_indicator` (input) eq `S`
- `securities_holding_qty` (db) gte `sale_quantity`

**Then:**
- **set_field** target: `availability_status` value: `passed`
- **transition_state** field: `availability_status` from: `pending` to: `passed`
- **emit_event** event: `availability.check.passed`

### Pre_trade_insufficient_securities (Priority: 4) — Error: `SFA_INSUFFICIENT_SECURITIES`

_Sale order fails because available securities do not cover the sale quantity_

**Given:**
- `purchase_sale_indicator` (input) eq `S`
- `securities_holding_qty` (db) lt `sale_quantity`

**Then:**
- **set_field** target: `availability_status` value: `failed`
- **transition_state** field: `availability_status` from: `pending` to: `failed`
- **emit_event** event: `availability.check.failed`
- **emit_event** event: `availability.short_position_detected`

### Trading_limit_exceeded (Priority: 5) — Error: `SFA_TRADING_LIMIT_EXCEEDED`

_Order is rejected because it would breach the account trading limit_

**Given:**
- `limit_utilisation` (computed) gt `trading_limit`

**Then:**
- **set_field** target: `availability_status` value: `failed`
- **transition_state** field: `availability_status` from: `pending` to: `failed`
- **emit_event** event: `availability.trading_limit_breached`
- **emit_event** event: `availability.check.failed`

### Real_time_position_lookup (Priority: 6)

_Back-office system returns real-time aggregated position for an account and instrument_

**Given:**
- `account_code` (input) exists
- `instrument_code` (input) exists

**Then:**
- **call_service** target: `position_service`
- **emit_event** event: `availability.check.requested`

### Settlement_cycle_batch_run (Priority: 7) | Transaction: atomic

_Scheduled batch extracts availability for open allocations to feed the clearing system_

**Given:**
- `batch_date` (system) exists
- `source_indicator` (input) in `B,I`

**Then:**
- **call_service** target: `availability_batch_job`
- **emit_event** event: `availability.batch_completed`

### Override_failed_check (Priority: 8)

_Risk officer overrides a failed availability check with documented reason_

**Given:**
- `user_role` (session) eq `risk_officer`
- `availability_status` (db) eq `failed`

**Then:**
- **emit_event** event: `availability.override_applied`

### Reject_non_risk_override (Priority: 9) — Error: `SFA_OVERRIDE_FORBIDDEN`

_Prevent non-risk-officer roles from overriding a failed availability check_

**Given:**
- `user_role` (session) neq `risk_officer`

**Then:**
- **emit_event** event: `availability.check.failed`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SFA_INSUFFICIENT_SECURITIES` | 409 | Insufficient securities available to cover the sale | No |
| `SFA_INSUFFICIENT_FUNDS` | 409 | Insufficient funds available to cover the purchase | No |
| `SFA_TRADING_LIMIT_EXCEEDED` | 409 | Order exceeds the account trading limit | No |
| `SFA_INVALID_BATCH_DATE` | 400 | Batch date must align with a valid settlement cycle run | No |
| `SFA_INVALID_ACCOUNT_GROUP` | 400 | Account group is not supported for this enquiry | No |
| `SFA_OVERRIDE_FORBIDDEN` | 403 | Only a risk officer role may override a failed availability check | No |
| `SFA_POSITION_LOOKUP_FAILED` | 503 | Real-time position lookup is temporarily unavailable | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `availability.check.requested` |  | `account_code`, `instrument_code`, `purchase_sale_indicator`, `quantity`, `timestamp` |
| `availability.check.passed` |  | `account_code`, `instrument_code`, `deal_id`, `timestamp` |
| `availability.check.failed` |  | `account_code`, `instrument_code`, `deal_id`, `reason`, `quantity_short`, `amount_short`, `timestamp` |
| `availability.short_position_detected` |  | `account_code`, `instrument_code`, `settlement_date`, `quantity_short`, `timestamp` |
| `availability.funding_shortfall_detected` |  | `account_code`, `settlement_date`, `amount_short`, `timestamp` |
| `availability.trading_limit_breached` |  | `account_code`, `trading_limit`, `limit_utilisation`, `attempted_amount`, `timestamp` |
| `availability.override_applied` |  | `account_code`, `deal_id`, `overridden_by`, `reason`, `timestamp` |
| `availability.batch_completed` |  | `batch_date`, `source_indicator`, `account_group`, `records_processed`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| broker-client-data-upload | recommended |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Securities Funds Availability

Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement across proprietary and controlled accounts

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
| pre_trade_cash_sufficient | `autonomous` | - | - |
| pre_trade_insufficient_funds | `autonomous` | - | - |
| pre_trade_securities_sufficient | `autonomous` | - | - |
| pre_trade_insufficient_securities | `autonomous` | - | - |
| trading_limit_exceeded | `autonomous` | - | - |
| real_time_position_lookup | `autonomous` | - | - |
| settlement_cycle_batch_run | `autonomous` | - | - |
| override_failed_check | `supervised` | - | - |
| reject_non_risk_override | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  SFENQ: SFA Selection Enquiry
  SFPSS: SFA Proprietary Sales (Allocation View)
  SFPSA: SFA Proprietary Sales (Availability View)
  SFPPS: SFA Proprietary Purchases (Allocation View)
  SFPPA: SFA Proprietary Purchases (Availability View)
batch_schedule:
  controlled_batch: Daily evening batch on T, T+1, T+2, T+3
  controlled_intraday: Intraday run at 12h00 for T+4 deals
  proprietary_batch: Evening batch on T+2 and T+3
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Securities Funds Availability Blueprint",
  "description": "Pre-trade and settlement-cycle availability checks for securities holdings and cash balances, with real-time position lookup and trading limit enforcement acros",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, settlement, clearing, pre-trade, risk, availability, trading-limits"
}
</script>
