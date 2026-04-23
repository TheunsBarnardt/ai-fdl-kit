---
title: "Broker Segregation Of Funds Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handlin"
---

# Broker Segregation Of Funds Blueprint

> Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handling, and bank transfer instructions

| | |
|---|---|
| **Feature** | `broker-segregation-of-funds` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, segregation-of-funds, trust-account, sweeps, exchange-control, non-resident, reconciliation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-segregation-of-funds.blueprint.yaml) |
| **JSON API** | [broker-segregation-of-funds.json]({{ site.baseurl }}/api/blueprints/trading/broker-segregation-of-funds.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `broker_operator` | Broker Back-Office Operator | human |  |
| `finance_officer` | Member Finance Officer | human |  |
| `trust_account_provider` | Central Trust Account Provider | external | Central entity holding pooled controlled-client funds on behalf of members |
| `commercial_bank` | Commercial Bank | external | One of the approved banks holding member trust and non-resident trust accounts |
| `exchange_control_authority` | Foreign Exchange Control Authority | external |  |
| `back_office_system` | Back-Office Accounting System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `member_code` | text | Yes | Member Code |  |
| `cash_alpha_code` | text | Yes | Cash Alpha Code |  |
| `bank_account_number` | text | Yes | Bank Account Number |  |
| `bank_branch_code` | text | Yes | Bank Branch Code |  |
| `bank_bic_code` | text | No | Bank BIC / SWIFT Code |  |
| `account_type` | select | Yes | Account Type |  |
| `related_cash_alpha` | text | No | Related Current Account Cash Alpha |  |
| `exchange_control_indicator` | select | Yes | Exchange Control Indicator |  |
| `gl_control_account_resident` | text | Yes | GL Control Account — Resident Funds |  |
| `gl_control_account_non_resident` | text | Yes | GL Control Account — Non-Resident Funds |  |
| `sweep_date` | date | Yes | Sweep Age Date |  |
| `sweep_amount` | number | Yes | Sweep Amount |  |
| `sweep_direction` | select | Yes | Sweep Direction |  |
| `sweep_status` | select | Yes | Sweep Status |  |
| `unpaid_sweep_reason` | text | No | Unpaid Sweep Reason |  |
| `interest_rate` | number | No | Base Interest Rate |  |
| `minimum_interest_debit` | number | No | Minimum Interest Amount Debit |  |
| `minimum_interest_credit` | number | No | Minimum Interest Amount Credit |  |
| `non_resident_cutoff_time` | text | No | Non-Resident Payment Cut-off Time |  |
| `transfer_instruction_reference` | text | No | Bank Transfer Instruction Reference |  |

## States

**State field:** `sweep_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `instructed` |  |  |
| `settled` |  | Yes |
| `unpaid` |  |  |
| `investigated` |  |  |
| `resolved` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `instructed` | back_office_system |  |
|  | `instructed` | `settled` | commercial_bank |  |
|  | `instructed` | `unpaid` | commercial_bank |  |
|  | `unpaid` | `investigated` | finance_officer |  |
|  | `investigated` | `resolved` | finance_officer |  |

## Rules

- **segregation:**
  - **trust_account_required:** Every member must operate a resident trust banking account and, if serving non-residents, a non-resident trust banking account
  - **client_funds_protection:** Client assets must be held separately from member assets at all times to protect investors on member default
  - **deposit_routing:** Client deposits must be made into the member's trust account, never the member's operating current account
  - **daily_sweep:** Credit balances on controlled-client accounts are swept to the central trust-account provider on a daily basis
  - **same_day_value:** Sweeps must settle for same-day value, even if the transfer instruction is delivered to the bank the following morning (retro back-dating)
  - **approved_banks_only:** Trust banking accounts may only be held at the set of approved commercial banks recognised by the trust-account provider
- **exchange_control:**
  - **resident_blank_indicator:** Accounts belonging to residents carry a blank or 'resident' exchange control indicator and funds are non-transferable offshore without authority approval
  - **non_resident_indicator:** Non-resident accounts carry an 'F' / non_resident indicator and funds are transferable out of the country
  - **blocked_funds_indicator:** 'B' / blocked funds indicator identifies emigrated-person residual funds, strictly controlled and held only by authorised dealers
  - **non_resident_no_overdraft:** Non-resident bank accounts may never go into overdraft; deliberate overdraft is a contravention that may trigger licence revocation and regulator audit
  - **deposit_default_routing:** Deposits from accounts flagged non-resident default to the non-resident trust account regardless of cash alpha supplied
  - **non_resident_cutoff:** Non-resident payments must respect the regulator cut-off time; funds must be loaded the day before to allow sweep settlement
- **reconciliation:**
  - **daily_balance_check:** Member must confirm daily that balances due to or from the trust-account provider reconcile; any differences addressed promptly
  - **unpaid_sweep_follow_up:** Unpaid sweeps on current accounts require immediate investigation and resolution
  - **gl_control_accounts:** Resident and non-resident sweeps must post to distinct general ledger control accounts
  - **audit_trail:** All sweep transactions and bank transfer instructions logged and retained for regulatory inspection
- **interest:**
  - **interest_payment_cycle:** Market-related interest on pooled trust funds is paid by the trust-account provider to the member monthly and credited to client accounts at month-end
  - **administration_fee:** Member may deduct a disclosed administration fee from interest before crediting clients
  - **minimum_interest_thresholds:** Minimum debit and credit interest amounts configurable separately for managed and non-managed clients
- **security:**
  - **bank_file_integrity:** Bank transfer instruction files must be digitally signed or transmitted over authenticated channels
  - **segregation_of_duties:** Authoriser of non-resident payments must be distinct from the operator who captured the instruction

## Outcomes

### Configure_trust_account (Priority: 1) | Transaction: atomic

_Customer support loads a trust banking account with cash alpha and bank details_

**Given:**
- `account_type` (input) in `trust,non_resident_trust`
- `bank_account_number` (input) exists
- `cash_alpha_code` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `trust_account.configured`

### Reject_unapproved_bank (Priority: 2) — Error: `SOF_UNAPPROVED_BANK`

_Block creation of trust accounts at banks outside the approved list_

**Given:**
- `bank_code` (input) not_in `approved_bank_1,approved_bank_2,approved_bank_3,approved_bank_4`

**Then:**
- **emit_event** event: `trust_account.configured`

### Calculate_daily_sweep (Priority: 3) | Transaction: atomic

_Overnight batch calculates required sweep to or from the trust-account provider per bank_

**Given:**
- `batch_phase` (system) eq `overnight`
- `controlled_client_balance_changed` (computed) eq `true`

**Then:**
- **create_record**
- **set_field** target: `sweep_status` value: `pending`
- **emit_event** event: `sweep.calculated`

### Issue_bank_transfer_instruction (Priority: 4) | Transaction: atomic

_Back-office system issues same-day-value transfer instruction to the member's bank_

**Given:**
- `sweep_status` (db) eq `pending`

**Then:**
- **call_service** target: `bank_transfer_interface`
- **transition_state** field: `sweep_status` from: `pending` to: `instructed`
- **emit_event** event: `sweep.instruction_issued`

### Reject_non_resident_overdraft (Priority: 5) — Error: `SOF_NON_RESIDENT_OVERDRAFT`

_Block any instruction that would send the non-resident trust account into overdraft_

**Given:**
- `account_type` (db) eq `non_resident_trust`
- `projected_balance` (computed) lt `0`

**Then:**
- **emit_event** event: `sweep.unpaid`

### Enforce_non_resident_cutoff (Priority: 6) — Error: `SOF_CUTOFF_EXCEEDED`

_Reject non-resident payment submitted after the regulator cut-off time_

**Given:**
- `account_type` (db) eq `non_resident_trust`
- `submission_time` (request) gt `non_resident_cutoff_time`

**Then:**
- **emit_event** event: `sweep.unpaid`

### Route_non_resident_deposit (Priority: 7)

_Auto-route deposits from non-resident-flagged clients to the non-resident trust account regardless of supplied cash alpha_

**Given:**
- `client_exchange_control_indicator` (db) eq `non_resident`

**Then:**
- **set_field** target: `cash_alpha_code` value: `non_resident_default`
- **emit_event** event: `sweep.calculated`

### Record_unpaid_sweep (Priority: 8) — Error: `SOF_SWEEP_UNPAID` | Transaction: atomic

_Bank reports a sweep was not settled; record reason and flag for investigation_

**Given:**
- `bank_settlement_status` (input) eq `failed`

**Then:**
- **transition_state** field: `sweep_status` from: `instructed` to: `unpaid`
- **emit_event** event: `sweep.unpaid`

### Reconcile_trust_provider_balance (Priority: 9) | Transaction: atomic

_Finance reconciles member ledger against trust-account provider statements for the period_

**Given:**
- `reconciliation_period_closed` (system) eq `true`

**Then:**
- **emit_event** event: `sweep.reconciled`

### Credit_monthly_interest (Priority: 10) | Transaction: atomic

_Monthly interest received from trust-account provider credited to client balances net of administration fee_

**Given:**
- `period_end` (system) eq `month_end`

**Then:**
- **set_field** target: `client_balance` value: `updated`
- **emit_event** event: `interest.credited`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SOF_SWEEP_UNPAID` | 409 | Sweep instruction was not settled by the bank | No |
| `SOF_NON_RESIDENT_OVERDRAFT` | 422 | Non-resident bank account cannot go into overdraft | No |
| `SOF_TRUST_ACCOUNT_MISSING` | 409 | Required trust banking account has not been configured for this member | No |
| `SOF_UNAPPROVED_BANK` | 422 | Bank is not on the list of approved trust-account providers | No |
| `SOF_CUTOFF_EXCEEDED` | 422 | Non-resident payment submitted after regulator cut-off time | No |
| `SOF_EXCHANGE_CONTROL_MISMATCH` | 422 | Exchange control indicator on account does not match trust account type | No |
| `SOF_RECONCILIATION_DIFFERENCE` | 409 | Trust-account provider balance does not reconcile with member ledger | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sweep.calculated` |  | `member_code`, `sweep_date`, `sweep_amount`, `sweep_direction`, `gl_control_account` |
| `sweep.instruction_issued` |  | `member_code`, `bank_account_number`, `transfer_instruction_reference`, `sweep_amount`, `sweep_date` |
| `sweep.settled` |  | `member_code`, `sweep_date`, `sweep_amount`, `transfer_instruction_reference` |
| `sweep.unpaid` |  | `member_code`, `sweep_date`, `sweep_amount`, `unpaid_sweep_reason` |
| `sweep.reconciled` |  | `member_code`, `sweep_date`, `reconciled_by` |
| `trust_account.configured` |  | `member_code`, `cash_alpha_code`, `bank_account_number`, `account_type`, `exchange_control_indicator` |
| `interest.credited` |  | `member_code`, `period`, `total_interest`, `administration_fee` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| foreign-exchange-control | required |  |
| popia-compliance | required |  |
| broker-client-data-upload | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Segregation Of Funds

Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handling, and bank transfer instructions

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
| `foreign_exchange_control` | foreign-exchange-control | fail |
| `popia_compliance` | popia-compliance | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| configure_trust_account | `autonomous` | - | - |
| reject_unapproved_bank | `supervised` | - | - |
| calculate_daily_sweep | `autonomous` | - | - |
| issue_bank_transfer_instruction | `autonomous` | - | - |
| reject_non_resident_overdraft | `supervised` | - | - |
| enforce_non_resident_cutoff | `autonomous` | - | - |
| route_non_resident_deposit | `autonomous` | - | - |
| record_unpaid_sweep | `autonomous` | - | - |
| reconcile_trust_provider_balance | `autonomous` | - | - |
| credit_monthly_interest | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  BROKM: Broker Maintenance
  T_GL_CSH: Cash Alpha Codes Table
  T_BOP: Broker Options
  T_INT: Base Interest Rates Table
  CSHRT: Cash Receipts
  CSHPT: Cash Payments
  CSHMN: Cashflow Management
reports:
  PAUDSW: List of Sweep Transactions with bank transfer instructions
  PJSETB: Trust-Account Provider Client Balances
  PSWEEP: Daily sweep report per bank
  PCOMPR: Common Error Report from overnight processing
  PFINTR: Journal and Cash Book Listings
  PTRBAL: Trial Balance with resident and non-resident totals
  PBALSA: Financial Account Balances per balance type
gl_accounts:
  resident_funds_control: Resident funds sweep control account
  non_resident_funds_control: Non-resident funds sweep control account
  crossover_account: Settlement crossover account for securities-settlement sweeps
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Segregation Of Funds Blueprint",
  "description": "Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handlin",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, segregation-of-funds, trust-account, sweeps, exchange-control, non-resident, reconciliation"
}
</script>
