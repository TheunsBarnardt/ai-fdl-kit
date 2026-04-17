---
title: "Broker Deal Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Internal back-office deal management covering allocation, release, extensions, direct deals, pre-dated deals, deal adjustments, and contract note generation for"
---

# Broker Deal Management Blueprint

> Internal back-office deal management covering allocation, release, extensions, direct deals, pre-dated deals, deal adjustments, and contract note generation for equity trades

| | |
|---|---|
| **Feature** | `broker-deal-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, deal-allocation, trade-release, contract-notes, same-day-allocation, next-day-allocation, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-deal-management.blueprint.yaml) |
| **JSON API** | [broker-deal-management.json]({{ site.baseurl }}/api/blueprints/trading/broker-deal-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `trader` | Trader | human |  |
| `deal_supervisor` | Deal Supervisor | human |  |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `deal_reference` | text | Yes | Deal Reference Number |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `buy_sell_indicator` | select | Yes | Buy/Sell Indicator |  |
| `principal_agent_indicator` | select | Yes | Principal/Agent Indicator |  |
| `quantity` | number | Yes | Quantity |  |
| `price` | number | Yes | Price |  |
| `average_price` | number | No | Average Price |  |
| `consideration` | number | Yes | Consideration |  |
| `allocation_account` | text | Yes | Allocation Account Code |  |
| `client_account` | text | No | Client Account Code |  |
| `trading_account` | text | No | Trading Account |  |
| `ring_fenced_indicator` | boolean | No | Ring-Fenced Term Indicator |  |
| `rand_indicator` | boolean | No | Rand Indicator |  |
| `allocation_type` | select | Yes | Allocation Type |  |
| `override_price` | number | No | Override Price |  |
| `deal_status` | select | Yes | Deal Status |  |
| `adjustment_reason` | text | No | Adjustment Reason |  |
| `contract_note_number` | text | No | Contract Note Number |  |
| `released_by` | text | No | Released By Operator |  |
| `released_at` | datetime | No | Release Timestamp |  |
| `upload_batch_id` | text | No | Upload Batch Identifier |  |

## States

**State field:** `deal_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `captured` | Yes |  |
| `allocated` |  |  |
| `released` |  |  |
| `settled` |  | Yes |
| `adjusted` |  |  |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `captured` | `allocated` | broker_operator |  |
|  | `allocated` | `released` | broker_operator |  |
|  | `released` | `settled` | back_office_system |  |
|  | `allocated` | `adjusted` | deal_supervisor |  |
|  | `captured` | `rejected` | deal_supervisor |  |
|  | `adjusted` | `released` | broker_operator |  |

## Rules

- **data_integrity:**
  - **allocation_balance:** Allocation accounts must balance back to zero after all allocations are released on trade day
  - **ring_fenced_segregation:** Ring-fenced and non-ring-fenced batches must remain in balance; deal terms cannot be altered post-capture
  - **unique_deal_reference:** Deal reference must be unique within the broker firm and trade date
  - **audit_trail:** All deal changes logged with operator, timestamp, and pre/post values; retained for a minimum of 60 months for regulatory review
  - **upload_validation:** Uploaded allocations validated against market trades before acceptance
- **security:**
  - **access_control:** Screen-level access enforced via resource access control facility
  - **segregation_of_duties:** Deal adjustments require supervisor approval; operator cannot self-approve adjustments
  - **release_authority:** Real-time release restricted to authorised operators per trading desk
- **compliance:**
  - **popia:** Client identifying data on deals must satisfy POPIA lawful-basis and minimisation requirements
  - **exchange_reporting:** Deals must be reported to the exchange within regulatory timeframes
  - **contract_note_delivery:** Contract notes must be issued to clients per exchange rules and recordkeeping requirements
  - **default_account_cleanup:** Deals posted to a default account due to invalid allocation must be booked out to correct client account via pre-dated deals
- **business:**
  - **same_day_allocation:** Same-day allocation (SDALL) is only permitted on released market trades on allocation accounts; price computed as real-time average or operator override
  - **next_day_allocation:** Next-day allocation (NXTAL) processes open allocation-account positions the day after trade
  - **pre_dated_deals:** Pre-dated deals (DLPRE) are used to correct prior-day allocations and move positions between accounts
  - **deal_extensions:** Deal extensions (DLEXT) capture additional terms against an existing market trade without altering its reference
  - **direct_deals:** Direct deals (DLDIR) capture off-market or non-allocated trades; deal terms carried forward from trading system when accessed via allocation summary
  - **real_time_release:** Trades, allocations, and extensions may be released intraday via RTREL; unreleased items process in overnight batch
  - **deal_adjustments:** Deal adjustments (DLADJ) permit correction of captured terms prior to settlement and require a documented reason
  - **contract_notes:** Contract notes are generated per client per deal after allocation and release

## Outcomes

### Real_time_allocation_actual_price (Priority: 1) | Transaction: atomic

_Operator allocates a market trade at actual price via direct allocation summary_

**Given:**
- `deal_status` (db) eq `captured`
- `allocation_type` (input) eq `actual`

**Then:**
- **transition_state** field: `deal_status` from: `captured` to: `allocated`
- **emit_event** event: `deal.allocated`

### Real_time_allocation_average_price (Priority: 2) | Transaction: atomic

_Operator allocates grouped market trades at average price for same instrument and side_

**Given:**
- `allocation_type` (input) eq `average`

**Then:**
- **set_field** target: `price` value: `average_price`
- **transition_state** field: `deal_status` from: `captured` to: `allocated`
- **emit_event** event: `deal.allocated`

### Release_trade_real_time (Priority: 3) | Transaction: atomic

_Operator releases allocated deals intraday so they post to the ledger before overnight batch_

**Given:**
- `deal_status` (db) eq `allocated`
- `user_role` (session) in `broker_operator,deal_supervisor`

**Then:**
- **transition_state** field: `deal_status` from: `allocated` to: `released`
- **set_field** target: `released_at` value: `now`
- **emit_event** event: `deal.released`

### Reject_unbalanced_release (Priority: 4) — Error: `DEAL_ALLOCATION_UNBALANCED`

_Prevent release when the allocation account does not balance to zero_

**Given:**
- `allocation_balance` (computed) neq `0`

**Then:**
- **emit_event** event: `deal.rejected`

### Same_day_allocation (Priority: 5) | Transaction: atomic

_Calculate real-time average on released allocation-account trades and allocate at average or override price_

**Given:**
- `allocation_account_type` (db) eq `DA`
- `market_trades_released` (db) eq `true`

**Then:**
- **call_service** target: `same_day_average_calculator`
- **transition_state** field: `deal_status` from: `captured` to: `allocated`
- **emit_event** event: `deal.allocated`

### Next_day_allocation (Priority: 6)

_Process open allocation-account positions the next trading day_

**Given:**
- `allocation_account_type` (db) eq `DA`
- `open_positions` (db) exists

**Then:**
- **create_record**
- **emit_event** event: `deal.allocated`

### Pre_dated_deal_correction (Priority: 7) | Transaction: atomic

_Book out positions from default account to correct client account via pre-dated deal_

**Given:**
- `user_role` (session) eq `broker_operator`
- `original_trade_date` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `deal.pre_dated_created`

### Deal_adjustment (Priority: 8) | Transaction: atomic

_Supervisor adjusts a captured deal with a documented reason prior to settlement_

**Given:**
- `user_role` (session) eq `deal_supervisor`
- `adjustment_reason` (input) exists

**Then:**
- **transition_state** field: `deal_status` from: `allocated` to: `adjusted`
- **emit_event** event: `deal.adjusted`

### Reject_operator_adjustment (Priority: 9) — Error: `DEAL_ADJUSTMENT_REQUIRES_SUPERVISOR`

_Prevent non-supervisor users from adjusting deals_

**Given:**
- `user_role` (session) neq `deal_supervisor`

**Then:**
- **emit_event** event: `deal.rejected`

### Generate_contract_notes (Priority: 10)

_Generate contract notes for each client account after deal release_

**Given:**
- `deal_status` (db) eq `released`

**Then:**
- **create_record**
- **emit_event** event: `deal.contract_note_generated`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEAL_ALLOCATION_UNBALANCED` | 422 | Allocation account does not balance to zero after release | No |
| `DEAL_REFERENCE_DUPLICATE` | 409 | Deal reference already exists for this trade date | No |
| `DEAL_RELEASE_FORBIDDEN` | 403 | Operator not authorised to release trades for this desk | No |
| `DEAL_ADJUSTMENT_REQUIRES_SUPERVISOR` | 403 | Deal adjustment requires supervisor approval | No |
| `DEAL_TERMS_IMMUTABLE` | 409 | Deal terms carried from trading system cannot be modified | No |
| `DEAL_INVALID_ALLOCATION_ACCOUNT` | 422 | Allocation account is invalid or deactivated | No |
| `DEAL_PRE_DATED_FORBIDDEN` | 403 | Pre-dated deal outside permitted backdating window | No |
| `DEAL_UPLOAD_VALIDATION_FAILED` | 422 | Uploaded allocation failed validation against market trades | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `deal.captured` |  | `deal_reference`, `trade_date`, `instrument_code`, `quantity`, `price`, `captured_by` |
| `deal.allocated` |  | `deal_reference`, `allocation_account`, `client_account`, `quantity`, `allocated_by`, `timestamp` |
| `deal.released` |  | `deal_reference`, `released_by`, `released_at` |
| `deal.extension_added` |  | `deal_reference`, `extension_terms`, `added_by`, `timestamp` |
| `deal.adjusted` |  | `deal_reference`, `adjustment_reason`, `adjusted_by`, `timestamp` |
| `deal.pre_dated_created` |  | `deal_reference`, `original_trade_date`, `new_allocation_account`, `created_by` |
| `deal.contract_note_generated` |  | `deal_reference`, `contract_note_number`, `client_account`, `generated_at` |
| `deal.rejected` |  | `deal_reference`, `rejection_reason`, `rejected_by`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  TRADS: Online Trades Display
  DIRAL: Online Trade Summary and Direct Allocations
  DLDIR: Direct Deals Capture
  DLEXT: Deal Extensions
  RTREL: Real-Time Trade Release
  SDALL: Same Day Allocation
  NXTAL: Next Day Allocation
  DLPRE: Pre-Dated Deals
  DLADJ: Deal Adjustments
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Deal Management Blueprint",
  "description": "Internal back-office deal management covering allocation, release, extensions, direct deals, pre-dated deals, deal adjustments, and contract note generation for",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, deal-allocation, trade-release, contract-notes, same-day-allocation, next-day-allocation, popia"
}
</script>
