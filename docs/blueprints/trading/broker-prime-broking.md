---
title: "Broker Prime Broking Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Prime brokerage workflow covering executing-broker and prime-broker relationship, trade give-ups, consolidated settlement, and client reporting across multiple "
---

# Broker Prime Broking Blueprint

> Prime brokerage workflow covering executing-broker and prime-broker relationship, trade give-ups, consolidated settlement, and client reporting across multiple executing brokers

| | |
|---|---|
| **Feature** | `broker-prime-broking` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, prime-broking, give-up, settlement, clearing, custody, reporting |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-prime-broking.blueprint.yaml) |
| **JSON API** | [broker-prime-broking.json]({{ site.baseurl }}/api/blueprints/trading/broker-prime-broking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client` | Prime Brokerage Client | human | Underlying investor whose trades are executed by one or more executing brokers and cleared through a single prime broker |
| `executing_broker` | Executing Broker | external | Broker firm that executes trades on the exchange on behalf of the client and gives them up to the prime broker |
| `prime_broker` | Prime Broker | system | Broker firm that accepts give-ups, finances positions, settles trades, holds custody, and issues consolidated reporting |
| `back_office_operator` | Back-Office Operator | human | Operations staff at either executing or prime broker who maintains accounts and processes give-up workflows |
| `csdp` | Central Securities Depository Participant | external | Custodian settling scrip and funds on behalf of the prime broker |
| `clearing_house` | Clearing House | external | Exchange clearing authority that nets and settles obligations |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `prime_account_code` | text | Yes | Prime Account Code |  |
| `client_code` | text | Yes | Underlying Client Code |  |
| `executing_broker_code` | text | Yes | Executing Broker Code |  |
| `prime_broker_code` | text | Yes | Prime Broker Code |  |
| `account_type` | select | Yes | Account Type |  |
| `controlled_flag` | boolean | Yes | Controlled Account Flag |  |
| `csdp_bp_id` | text | Yes | CSDP BP Identifier |  |
| `csdp_safekeeping_account` | text | Yes | CSDP Safekeeping Account |  |
| `prime_agreement_reference` | text | Yes | Prime Brokerage Agreement Reference |  |
| `give_up_reference` | text | Yes | Give-Up Reference |  |
| `deal_number` | text | Yes | Executing Broker Deal Number |  |
| `prime_deal_number` | text | No | Prime Broker Deal Number |  |
| `instrument_code` | text | Yes | Instrument Code |  |
| `trade_date` | date | Yes | Trade Date |  |
| `settlement_date` | date | Yes | Settlement Date |  |
| `quantity` | number | Yes | Trade Quantity |  |
| `price` | number | Yes | Trade Price |  |
| `consideration` | number | Yes | Consideration |  |
| `trade_side` | select | Yes | Buy or Sell |  |
| `give_up_status` | select | Yes | Give-Up Status |  |
| `rejection_reason` | text | No | Rejection Reason |  |
| `netting_group` | text | No | Clearing Netting Group |  |
| `commission_split` | json | No | Commission Split Between Brokers |  |
| `client_statement_flag` | boolean | No | Include on Consolidated Client Statement |  |

## States

**State field:** `give_up_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `give_up_requested` |  |  |
| `accepted` |  |  |
| `rejected` |  | Yes |
| `settled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `give_up_requested` | executing_broker |  |
|  | `give_up_requested` | `accepted` | prime_broker |  |
|  | `give_up_requested` | `rejected` | prime_broker |  |
|  | `accepted` | `settled` | prime_broker |  |

## Rules

- **data_integrity:**
  - **prime_account_uniqueness:** Prime account code unique per prime broker; links to exactly one underlying client
  - **give_up_matching:** Give-up records must match executing-broker deal on instrument, quantity, price, trade date, and side
  - **deal_immutability:** Once settled, deal records cannot be amended; adjustments must be booked as reversals
  - **audit_trail_retention:** All account changes and give-up state transitions retained with user/timestamp for at least 5 years
- **security:**
  - **segregation_of_duties:** Account setup and verification performed by different operator roles
  - **resource_access_control:** Executing broker may view own deals only; prime broker may view all give-ups routed to them
  - **mandate_verification:** Prime broker must hold signed prime brokerage agreement before accepting give-ups
- **compliance:**
  - **popia_personal_information:** Underlying client personal information protected under POPIA; sharing between executing and prime broker requires documented lawful basis
  - **exchange_control:** Cross-border give-ups must respect exchange-control segregation of resident and non-resident funds
  - **market_conduct:** Trade give-ups reported to exchange within regulated cut-off windows
  - **best_execution:** Executing broker retains best-execution obligation to underlying client regardless of give-up
- **business:**
  - **account_types:** Non-controlled prime accounts held at prime broker; executing broker maintains mirror account for routing
  - **csdp_details:** Prime broker CSDP details disseminated to executing brokers on account verification
  - **consolidated_reporting:** Client receives single consolidated statement from prime broker covering trades from all executing brokers
  - **netting:** Prime broker nets obligations per instrument per settlement date across all give-ups
  - **financing:** Prime broker may finance controlled client positions; interest accrues on outstanding balances
  - **commission_handling:** Executing broker retains execution commission; prime broker charges separate prime-brokerage fee

## Outcomes

### Load_prime_account_at_executing_broker (Priority: 1) | Transaction: atomic

_Executing broker sets up a non-controlled prime account pointing at the prime broker_

**Given:**
- `account_type` (input) eq `prime`
- `prime_broker_code` (input) exists
- `prime_agreement_reference` (input) exists

**Then:**
- **create_record**
- **set_field** target: `give_up_status` value: `pending`
- **emit_event** event: `prime.account.created`

### Verify_prime_account_at_prime_broker (Priority: 2) | Transaction: atomic

_Prime broker verifies the prime account and disseminates CSDP details to the executing broker_

**Given:**
- `user_role` (session) eq `prime_broker`
- `prime_agreement_reference` (db) exists
- `csdp_bp_id` (db) exists

**Then:**
- **set_field** target: `account_status` value: `verified`
- **call_service** target: `broker_dissemination`
- **emit_event** event: `prime.account.verified`

### Reject_account_without_mandate (Priority: 3) — Error: `PRIME_MANDATE_MISSING`

_Block account verification when no prime brokerage agreement exists_

**Given:**
- `prime_agreement_reference` (db) not_exists

**Then:**
- **emit_event** event: `prime.give_up.rejected`

### Request_trade_give_up (Priority: 4) | Transaction: atomic

_Executing broker submits a give-up to the prime broker after trade execution_

**Given:**
- `deal_number` (input) exists
- `prime_broker_code` (input) exists
- `give_up_status` (db) eq `pending`

**Then:**
- **transition_state** field: `give_up_status` from: `pending` to: `give_up_requested`
- **emit_event** event: `prime.give_up.requested`

### Accept_give_up (Priority: 5) | Transaction: atomic

_Prime broker accepts matching give-up and assumes settlement responsibility_

**Given:**
- `user_role` (session) eq `prime_broker`
- `give_up_status` (db) eq `give_up_requested`
- `prime_account_code` (db) exists

**Then:**
- **transition_state** field: `give_up_status` from: `give_up_requested` to: `accepted`
- **create_record**
- **emit_event** event: `prime.give_up.accepted`

### Reject_mismatched_give_up (Priority: 6) — Error: `GIVE_UP_MISMATCH`

_Reject give-up when quantity, price, instrument, or trade date do not match executing-broker deal_

**Given:**
- ANY: `quantity` (input) neq `db_quantity` OR `price` (input) neq `db_price` OR `instrument_code` (input) neq `db_instrument`

**Then:**
- **transition_state** field: `give_up_status` from: `give_up_requested` to: `rejected`
- **emit_event** event: `prime.give_up.rejected`

### Consolidated_settlement (Priority: 7) | Transaction: atomic

_Prime broker nets accepted give-ups per instrument per settlement date and settles via CSDP_

**Given:**
- `give_up_status` (db) eq `accepted`
- `settlement_date` (db) eq `today`

**Then:**
- **call_service** target: `csdp_settlement`
- **transition_state** field: `give_up_status` from: `accepted` to: `settled`
- **emit_event** event: `prime.settlement.completed`

### Issue_consolidated_client_statement (Priority: 8)

_Prime broker issues single consolidated statement covering all executing brokers for the period_

**Given:**
- `client_statement_flag` (db) eq `true`

**Then:**
- **create_record**
- **notify** target: `client`
- **emit_event** event: `prime.statement.issued`

### Block_cross_prime_view (Priority: 9) — Error: `PRIME_UNAUTHORISED_VIEW`

_Prevent an executing broker from viewing give-ups routed to a different prime broker_

**Given:**
- `user_prime_broker_code` (session) neq `deal_prime_broker_code`

**Then:**
- **emit_event** event: `prime.give_up.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRIME_ACCOUNT_NOT_FOUND` | 404 | Prime account does not exist at prime broker | No |
| `PRIME_MANDATE_MISSING` | 409 | No active prime brokerage agreement between client and prime broker | No |
| `GIVE_UP_MISMATCH` | 422 | Give-up details do not match executing-broker deal | No |
| `GIVE_UP_DUPLICATE` | 409 | Give-up already recorded for this deal | No |
| `GIVE_UP_REJECTED` | 409 | Prime broker rejected the give-up | No |
| `CSDP_DETAILS_INVALID` | 400 | CSDP participant or safekeeping account invalid | No |
| `PRIME_SETTLEMENT_FAILED` | 500 | Consolidated settlement instruction failed at custodian | No |
| `PRIME_UNAUTHORISED_VIEW` | 403 | User not authorised to view deals routed to a different prime broker | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `prime.account.created` |  | `prime_account_code`, `client_code`, `executing_broker_code`, `prime_broker_code`, `created_by`, `timestamp` |
| `prime.account.verified` |  | `prime_account_code`, `verified_by`, `csdp_bp_id`, `timestamp` |
| `prime.give_up.requested` |  | `give_up_reference`, `deal_number`, `executing_broker_code`, `prime_broker_code`, `instrument_code`, `quantity`, `price`, `timestamp` |
| `prime.give_up.accepted` |  | `give_up_reference`, `prime_deal_number`, `accepted_by`, `timestamp` |
| `prime.give_up.rejected` |  | `give_up_reference`, `rejection_reason`, `rejected_by`, `timestamp` |
| `prime.settlement.completed` |  | `prime_deal_number`, `settlement_date`, `netting_group`, `timestamp` |
| `prime.statement.issued` |  | `client_code`, `statement_period`, `statement_reference`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |
| broker-client-data-upload | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  CLMNT: Client Account Maintenance (prime account setup)
  AGMNT: Agent Account Maintenance (executing broker mirror)
  PBACV: Prime Broker Account Verification
  EBENQ: Executing Broker Enquiry
  SECFN: User and Function Maintenance
  CLVER: Client Account Verification
  BDDISSEM: Broker Dissemination
  BDDISINS: Institutional Dissemination
  DLPRE: Pre-Dated Deals
  DLADJ: Deal Adjustments
  DLREV: Deal Reversals
  CSREVS: Controlled Client Sales Reverse Substitution
  RSREV: Non-Controlled Reverse Substitution
  SHDLS: Deals and Scrip by Instrument
  ACDLS: Open Deals by Share
  AFINH: Account Financial History
reports:
  daily_deals_by_share: Daily print of deals data in share sequence
  daily_rolling_settlement: Daily rolling settlement report
  daily_settlement_by_share: Daily rolling settlement in share sequence
  daily_settlement: Daily settlement report
  funds_availability_controlled: Funds availability for controlled clients
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Prime Broking Blueprint",
  "description": "Prime brokerage workflow covering executing-broker and prime-broker relationship, trade give-ups, consolidated settlement, and client reporting across multiple ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, prime-broking, give-up, settlement, clearing, custody, reporting"
}
</script>
