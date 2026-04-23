---
title: "Broker Money Market Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated i"
---

# Broker Money Market Blueprint

> Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated interest capitalisation and reinvestment

| | |
|---|---|
| **Feature** | `broker-money-market` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, money-market, call-loan, fixed-term-deposit, deposit-taking-institution, interest-capitalisation, pooled-funds |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-money-market.blueprint.yaml) |
| **JSON API** | [broker-money-market.json]({{ site.baseurl }}/api/blueprints/trading/broker-money-market.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `money_market_supervisor` | Money Market Supervisor | human |  |
| `back_office_system` | Back-Office System | system |  |
| `deposit_taking_institution` | Deposit-Taking Institution | external |  |
| `client` | Broker Client (Beneficial Owner of Funds) | external |  |
| `compliance_officer` | Compliance Officer | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `investment_id` | text | Yes | Investment Identifier |  |
| `client_account_code` | text | Yes | Client Account Code |  |
| `borrower_account_code` | text | Yes | Borrower (Deposit-Taking Institution) Account Code |  |
| `investment_type` | select | Yes | Investment Type |  |
| `balance_code` | text | Yes | Money Market Balance Code |  |
| `interest_code` | text | Yes | Interest Code |  |
| `interest_rate` | number | Yes | Negotiated Interest Rate Percentage |  |
| `original_capital_amount` | number | Yes | Original Capital Amount |  |
| `current_balance` | number | Yes | Current Balance Including Capitalised Interest |  |
| `effective_date` | date | Yes | Effective Date |  |
| `maturity_date` | date | No | Maturity Date |  |
| `auto_reinvest_flag` | boolean | Yes | Auto-Reinvestment Enabled |  |
| `mandate_signed_date` | date | Yes | Client Money Market Mandate Signed Date |  |
| `pooled_flag` | boolean | Yes | Funds Pooled with Other Clients |  |
| `withdrawal_instruction` | boolean | No | Withdrawal Instruction Received |  |
| `investment_status` | select | Yes | Investment Status |  |
| `capitalisation_frequency` | select | Yes | Interest Capitalisation Frequency |  |
| `last_capitalised_date` | date | No | Last Interest Capitalisation Date |  |

## States

**State field:** `investment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `invested` |  |  |
| `active` |  |  |
| `matured` |  |  |
| `withdrawn` |  | Yes |
| `closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `invested` | broker_operator |  |
|  | `invested` | `active` | back_office_system |  |
|  | `active` | `matured` | back_office_system |  |
|  | `matured` | `active` | back_office_system |  |
|  | `matured` | `withdrawn` | broker_operator |  |
|  | `active` | `withdrawn` | broker_operator |  |
|  | `withdrawn` | `closed` | back_office_system |  |

## Rules

- **regulatory:**
  - **agent_capacity:** Broker acts as agent pooling client funds on clients' behalf; broker is not the principal lender
  - **mandate_required:** Client must sign a money market mandate before any funds are invested on their behalf
  - **segregation_of_funds:** Pooled client money market funds must be segregated from broker house funds
  - **popia_compliance:** Client personal and account information handled under POPIA lawful-basis requirements
- **interest:**
  - **call_capitalisation:** Daily call investments capitalise interest at calendar month end
  - **fixed_term_capitalisation:** Fixed-term investments capitalise interest at maturity date
  - **auto_reinvestment:** On maturity, capital plus capitalised interest automatically reinvests at the prevailing rates unless a withdrawal has been instructed
  - **rate_sourcing:** Interest rate is negotiated with the deposit-taking institution per interest code and effective date range
  - **call_rate_validity:** Call interest codes carry an open-ended validity (no fixed end date)
- **financial:**
  - **balance_code_required:** All money market debits and credits use specific money market balance codes on the client balance ledger
  - **borrower_balance_code:** Borrower balance code must exist on the balance table before funds can be deposited
  - **pooled_allocation:** Pooled interest is allocated across participating client accounts in proportion to capital and holding period
- **data_integrity:**
  - **investment_uniqueness:** Investment identifier must be unique within the broker firm
  - **borrower_type:** Borrower accounts must be loaded with account type representing a deposit-taking institution before investments can be made against them
  - **audit_trail:** All capital movements, rate changes, and status transitions are logged with actor and timestamp
- **security:**
  - **rate_change_authorisation:** Changes to interest rates require supervisor authorisation
  - **segregation_of_duties:** Operator who loaded an investment cannot self-authorise rate changes against it

## Outcomes

### Create_call_investment (Priority: 1) | Transaction: atomic

_Broker operator loads a new daily call investment against a deposit-taking institution after confirming the client mandate is on file_

**Given:**
- `mandate_signed_date` (db) exists
- `investment_type` (input) eq `call`
- `borrower_account_code` (db) exists

**Then:**
- **create_record**
- **set_field** target: `capitalisation_frequency` value: `monthly`
- **set_field** target: `investment_status` value: `invested`
- **emit_event** event: `money_market.investment_created`

### Create_fixed_term_investment (Priority: 2) | Transaction: atomic

_Broker operator loads a fixed-term deposit with a negotiated rate and maturity date_

**Given:**
- `investment_type` (input) eq `fixed_term`
- `maturity_date` (input) exists
- `mandate_signed_date` (db) exists

**Then:**
- **create_record**
- **set_field** target: `capitalisation_frequency` value: `at_maturity`
- **set_field** target: `investment_status` value: `invested`
- **emit_event** event: `money_market.investment_created`

### Reject_missing_mandate (Priority: 3) — Error: `MM_MANDATE_MISSING`

_Block investment creation if the client has not signed a money market mandate_

**Given:**
- `mandate_signed_date` (db) not_exists

**Then:**
- **emit_event** event: `money_market.investment_created`

### Capitalise_call_interest_month_end (Priority: 4) | Transaction: atomic

_Month-end calendar run capitalises accrued interest on all active daily call investments_

**Given:**
- `investment_type` (db) eq `call`
- `investment_status` (db) eq `active`

**Then:**
- **set_field** target: `current_balance` value: `computed`
- **set_field** target: `last_capitalised_date` value: `computed`
- **emit_event** event: `money_market.interest_capitalised`

### Capitalise_and_mature_fixed_term (Priority: 5) | Transaction: atomic

_On maturity date, capitalise accrued interest and transition fixed-term investment to matured_

**Given:**
- `investment_type` (db) eq `fixed_term`
- `maturity_date` (db) lte `today`

**Then:**
- **set_field** target: `current_balance` value: `computed`
- **transition_state** field: `investment_status` from: `active` to: `matured`
- **emit_event** event: `money_market.interest_capitalised`
- **emit_event** event: `money_market.investment_matured`

### Auto_reinvest_matured_investment (Priority: 6) | Transaction: atomic

_Automatically reinvest capital plus capitalised interest at prevailing rates unless a withdrawal was instructed_

**Given:**
- `investment_status` (db) eq `matured`
- `withdrawal_instruction` (db) neq `true`
- `auto_reinvest_flag` (db) eq `true`

**Then:**
- **transition_state** field: `investment_status` from: `matured` to: `active`
- **emit_event** event: `money_market.auto_reinvested`

### Block_reinvestment_on_withdrawal (Priority: 7) — Error: `MM_REINVEST_BLOCKED`

_Prevent auto-reinvestment when the client has lodged a withdrawal instruction_

**Given:**
- `withdrawal_instruction` (db) eq `true`

**Then:**
- **emit_event** event: `money_market.withdrawal_processed`

### Process_client_withdrawal (Priority: 8) | Transaction: atomic

_Process a client withdrawal, debiting the money market balance code and crediting the client account_

**Given:**
- `withdrawal_instruction` (input) eq `true`
- `current_balance` (db) gt `0`

**Then:**
- **transition_state** field: `investment_status` from: `active` to: `withdrawn`
- **emit_event** event: `money_market.withdrawal_processed`

### Reject_unauthorised_rate_change (Priority: 9) — Error: `MM_RATE_UNAUTHORISED`

_Only a money market supervisor may change negotiated interest rates_

**Given:**
- `user_role` (session) neq `money_market_supervisor`

**Then:**
- **emit_event** event: `money_market.rate_changed`

### Reject_unknown_balance_code (Priority: 10) — Error: `MM_BALANCE_CODE_UNKNOWN`

_Reject investments that reference a balance code not on the balance table_

**Given:**
- `balance_code` (db) not_exists

**Then:**
- **emit_event** event: `money_market.investment_created`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MM_MANDATE_MISSING` | 422 | Client money market mandate is not on file | No |
| `MM_BORROWER_INVALID` | 400 | Borrower account is not a registered deposit-taking institution | No |
| `MM_BALANCE_CODE_UNKNOWN` | 400 | Balance code is not defined on the balance table | No |
| `MM_RATE_UNAUTHORISED` | 403 | Only a supervisor may change money market interest rates | No |
| `MM_REINVEST_BLOCKED` | 409 | Auto-reinvestment blocked because a withdrawal instruction is pending | No |
| `MM_MATURITY_INVALID` | 400 | Maturity date is required for fixed-term investments and must be after the effective date | No |
| `MM_WITHDRAWAL_INSUFFICIENT` | 409 | Requested withdrawal exceeds available balance | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `money_market.investment_created` |  | `investment_id`, `client_account_code`, `borrower_account_code`, `investment_type`, `original_capital_amount`, `effective_date` |
| `money_market.investment_activated` |  | `investment_id`, `activated_by`, `timestamp` |
| `money_market.interest_capitalised` |  | `investment_id`, `period`, `interest_amount`, `new_balance`, `capitalised_at` |
| `money_market.investment_matured` |  | `investment_id`, `maturity_date`, `final_balance` |
| `money_market.auto_reinvested` |  | `investment_id`, `previous_balance`, `new_capital`, `new_rate`, `new_maturity_date` |
| `money_market.withdrawal_processed` |  | `investment_id`, `client_account_code`, `amount`, `processed_by`, `timestamp` |
| `money_market.rate_changed` |  | `interest_code`, `old_rate`, `new_rate`, `effective_date`, `changed_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Money Market

Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated interest capitalisation and reinvestment

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
| create_call_investment | `supervised` | - | - |
| create_fixed_term_investment | `supervised` | - | - |
| reject_missing_mandate | `supervised` | - | - |
| capitalise_call_interest_month_end | `autonomous` | - | - |
| capitalise_and_mature_fixed_term | `autonomous` | - | - |
| auto_reinvest_matured_investment | `autonomous` | - | - |
| block_reinvestment_on_withdrawal | `human_required` | - | - |
| process_client_withdrawal | `autonomous` | - | - |
| reject_unauthorised_rate_change | `supervised` | - | - |
| reject_unknown_balance_code | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  MMACI: Money Market Account Enquiry
  MMALA: Money Market Allocation Audit Enquiry
  MMALI: Money Market Allocation Enquiry
  MMCTL: Money Market Control Parameters
  MMINT: Interest Rates Maintenance
  MMINQ: Interest Rates Enquiry
  MMINV: Investment Maintenance
  MMIVI: Investment via Interest Code
  MMIVQ: Investment Enquiry
  MMRTE: Money Market Rate Enquiry
  MMTRI: Money Market Turn History
  MMTRQ: Turn Rates Enquiry
  MMTUR: Turn Rates
  TBINV: Investment Type Table
reports:
  - Money Market Upload Discrepancies
  - Money Market Balances Report
  - Balances with No Investments
  - Deal Settlements with Money Market Balances
  - Money Market Interest Earned Report
  - Money Market Mandates Report
  - Money Market Call Interest Report
  - List of Lenders per Borrower
  - List of Borrowers per Lender
  - Daily Reconciliation
  - Money Market Daily Confirmation
  - Money Market Fixed Term Confirmation
  - Income Tax Letter
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Money Market Blueprint",
  "description": "Broker-managed money market facility for investing pooled client funds in daily call and fixed-term deposits with a deposit-taking institution, with automated i",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, money-market, call-loan, fixed-term-deposit, deposit-taking-institution, interest-capitalisation, pooled-funds"
}
</script>
