---
title: "Broker Financial Processing Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-ac"
---

# Broker Financial Processing Blueprint

> Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-account provider integration, and...

| | |
|---|---|
| **Feature** | `broker-financial-processing` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, finance, general-ledger, cash-management, journals, interest, eft, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-financial-processing.blueprint.yaml) |
| **JSON API** | [broker-financial-processing.json]({{ site.baseurl }}/api/blueprints/trading/broker-financial-processing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `finance_operator` | Finance Operator | human |  |
| `finance_supervisor` | Finance Supervisor | human |  |
| `treasurer` | Treasurer | human |  |
| `back_office_system` | Back-Office System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `entry_reference` | text | Yes | Entry Reference |  |
| `entry_type` | select | Yes | Entry Type |  |
| `ledger_code` | text | Yes | General Ledger Code |  |
| `account_code` | text | Yes | Client Account Code |  |
| `counter_ledger_code` | text | No | Contra Ledger Code |  |
| `amount` | number | Yes | Amount |  |
| `currency_code` | select | Yes | Currency Code |  |
| `value_date` | date | Yes | Value Date |  |
| `posting_date` | date | Yes | Posting Date |  |
| `narration` | text | Yes | Narration |  |
| `debit_credit_indicator` | select | Yes | Debit or Credit Indicator |  |
| `batch_number` | text | No | Batch Number |  |
| `source_module` | select | Yes | Source Module |  |
| `payment_method` | select | No | Payment Method |  |
| `bank_reference` | text | No | Bank Reference |  |
| `beneficiary_account_number` | text | No | Beneficiary Bank Account Number |  |
| `beneficiary_branch_code` | text | No | Beneficiary Branch Code |  |
| `trust_account_flag` | boolean | Yes | Trust Account Flag |  |
| `interest_rate` | number | No | Interest Rate |  |
| `interest_accrual_from` | date | No | Interest Accrual Start |  |
| `interest_accrual_to` | date | No | Interest Accrual End |  |
| `backdated_flag` | boolean | No | Backdated Entry Flag |  |
| `postdated_flag` | boolean | No | Postdated Entry Flag |  |
| `entry_status` | select | Yes | Entry Status |  |
| `captured_by` | text | Yes | Captured By |  |
| `verified_by` | text | No | Verified By |  |
| `released_by` | text | No | Released By |  |

## States

**State field:** `entry_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `captured` | Yes |  |
| `verified` |  |  |
| `released` |  |  |
| `posted` |  | Yes |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `captured` | `verified` | finance_supervisor |  |
|  | `verified` | `released` | treasurer |  |
|  | `released` | `posted` | back_office_system |  |
|  | `captured` | `rejected` | finance_supervisor |  |
|  | `verified` | `rejected` | treasurer |  |

## Rules

- **data_integrity:**
  - **double_entry_balance:** Every journal must balance to zero across debits and credits before release
  - **entry_uniqueness:** Entry reference must be unique within posting date and source module
  - **referential_integrity:** Posted entries cannot be deleted; reversals required via contra journal
  - **audit_trail_retention:** All captures, verifications, releases, and postings retained for at least 60 months
- **security:**
  - **segregation_of_duties:** Capture, verification, and release must be performed by three distinct users
  - **access_control:** Finance screens controlled at the screen and ledger-code level via resource access control
  - **dual_control_over_threshold:** Entries above the configured threshold require both supervisor verification and treasurer release
- **compliance:**
  - **popia_protection:** Beneficiary banking details and account references are personal information and must be encrypted at rest and masked in logs
  - **trust_segregation:** Client trust balances must be swept to the trust-account-provider daily and never commingled with firm funds
  - **exchange_control:** Cross-border payments require exchange-control reference and must not pass through resident-only ledgers
  - **sars_reporting:** Debit and credit interest amounts must feed IT3B tax-certificate generation
- **business:**
  - **backdated_entries:** Backdated entries allowed within the current financial period and require supervisor reason code
  - **postdated_entries:** Postdated entries queued until value date then auto-released by the back-office system
  - **interest_calculation:** Daily debit and credit interest calculated on cleared balances using prevailing rate tables
  - **eft_routing:** Electronic funds transfers routed to electronic-funds-transfer-bank gateway using standardised ACB file format
  - **cash_receipt_allocation:** Unallocated receipts parked in suspense ledger until matched to a client account within five business days

## Outcomes

### Capture_journal_entry (Priority: 1) | Transaction: atomic

_Finance operator captures a journal entry with balanced debits and credits_

**Given:**
- `entry_type` (input) in `journal,cash_payment,cash_receipt`
- `amount` (input) gt `0`
- `ledger_code` (input) exists

**Then:**
- **create_record**
- **set_field** target: `entry_status` value: `captured`
- **emit_event** event: `entry.captured`

### Reject_unbalanced_entry (Priority: 2) — Error: `ENTRY_UNBALANCED`

_Prevent release of journals that do not balance_

**Given:**
- `debits_equal_credits` (computed) eq `false`

**Then:**
- **emit_event** event: `entry.rejected`

### Verify_entry_by_supervisor (Priority: 3) | Transaction: atomic

_Supervisor verifies captured entry, enforcing segregation of duties_

**Given:**
- `entry_status` (db) eq `captured`
- `user_role` (session) eq `finance_supervisor`
- `captured_by` (db) neq `current_user`

**Then:**
- **transition_state** field: `entry_status` from: `captured` to: `verified`
- **emit_event** event: `entry.verified`

### Reject_self_release (Priority: 4) — Error: `ENTRY_RELEASE_FORBIDDEN`

_Block the capturing user from also verifying or releasing_

**Given:**
- `captured_by` (db) eq `current_user`

**Then:**
- **emit_event** event: `entry.rejected`

### Release_and_post_entry (Priority: 5) | Transaction: atomic

_Treasurer releases verified entry and back-office system posts to general ledger_

**Given:**
- `entry_status` (db) eq `verified`
- `user_role` (session) eq `treasurer`

**Then:**
- **transition_state** field: `entry_status` from: `verified` to: `released`
- **emit_event** event: `entry.released`
- **transition_state** field: `entry_status` from: `released` to: `posted`
- **emit_event** event: `entry.posted`

### Dispatch_eft_payment (Priority: 6) | Transaction: atomic

_Back-office system dispatches released cash payment to the bank gateway_

**Given:**
- `entry_type` (db) eq `cash_payment`
- `entry_status` (db) eq `released`
- `beneficiary_account_number` (db) exists

**Then:**
- **call_service** target: `electronic-funds-transfer-bank`
- **emit_event** event: `cash.payment_dispatched`

### Calculate_daily_interest (Priority: 7) | Transaction: atomic

_Back-office system accrues debit and credit interest on cleared balances_

**Given:**
- `posting_date` (system) exists

**Then:**
- **create_record**
- **emit_event** event: `interest.calculated`

### Sweep_trust_balances (Priority: 8) | Transaction: atomic

_Daily sweep of client trust balances to the trust-account-provider_

**Given:**
- `trust_account_flag` (db) eq `true`

**Then:**
- **call_service** target: `trust-account-provider`
- **emit_event** event: `trust.sweep_executed`

### Block_backdate_outside_period (Priority: 9) — Error: `ENTRY_BACKDATE_BLOCKED`

_Reject backdated entries that fall outside the open financial period_

**Given:**
- `backdated_flag` (input) eq `true`
- `period_is_open` (computed) eq `false`

**Then:**
- **emit_event** event: `entry.rejected`

### Queue_postdated_entry (Priority: 10)

_Hold postdated entries until their value date then auto-release_

**Given:**
- `postdated_flag` (input) eq `true`
- `value_date` (input) gt `today`

**Then:**
- **set_field** target: `entry_status` value: `captured`
- **emit_event** event: `entry.captured`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ENTRY_UNBALANCED` | 422 | Journal entries must balance before release | No |
| `ENTRY_DUPLICATE_REFERENCE` | 409 | Entry reference already exists for this posting date | No |
| `ENTRY_RELEASE_FORBIDDEN` | 403 | Capture user may not verify or release the same entry | No |
| `ENTRY_BACKDATE_BLOCKED` | 422 | Backdated entry falls outside the open financial period | No |
| `ENTRY_TRUST_COMMINGLING` | 422 | Trust account entry cannot post against a firm ledger code | No |
| `ENTRY_EFT_INVALID_BENEFICIARY` | 422 | Beneficiary bank details failed validation | No |
| `ENTRY_POPIA_VIOLATION` | 422 | Personal or banking information failed POPIA protection check | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `entry.captured` |  | `entry_reference`, `entry_type`, `amount`, `currency_code`, `captured_by`, `timestamp` |
| `entry.verified` |  | `entry_reference`, `verified_by`, `timestamp` |
| `entry.released` |  | `entry_reference`, `released_by`, `timestamp` |
| `entry.posted` |  | `entry_reference`, `ledger_code`, `posting_date`, `timestamp` |
| `entry.rejected` |  | `entry_reference`, `reason`, `rejected_by`, `timestamp` |
| `cash.receipt_allocated` |  | `entry_reference`, `account_code`, `amount`, `allocated_by` |
| `cash.payment_dispatched` |  | `entry_reference`, `beneficiary_account_number`, `amount`, `bank_reference` |
| `interest.calculated` |  | `account_code`, `interest_rate`, `interest_accrual_from`, `interest_accrual_to`, `amount` |
| `trust.sweep_executed` |  | `sweep_date`, `total_amount`, `currency_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| broker-client-account-maintenance | required |  |
| popia-compliance | required |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Financial Processing

Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-account provider integration, and...

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
| capture_journal_entry | `autonomous` | - | - |
| reject_unbalanced_entry | `supervised` | - | - |
| verify_entry_by_supervisor | `autonomous` | - | - |
| reject_self_release | `supervised` | - | - |
| release_and_post_entry | `autonomous` | - | - |
| dispatch_eft_payment | `autonomous` | - | - |
| calculate_daily_interest | `autonomous` | - | - |
| sweep_trust_balances | `autonomous` | - | - |
| block_backdate_outside_period | `human_required` | - | - |
| queue_postdated_entry | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  GLENT: General Ledger Entry Capture
  CPAYM: Cash Payment Capture
  CRCPT: Cash Receipt Capture
  JRNLC: Journal Entry Capture
  JRNLV: Journal Verification
  JRNLR: Journal Release
  INTCL: Interest Calculation Run
  TRSWP: Trust Account Sweep
  EFTGW: EFT Gateway Dispatch
  BKDTE: Backdated Entry Authorisation
  PDPQU: Postdated Entry Queue
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Financial Processing Blueprint",
  "description": "Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-ac",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, finance, general-ledger, cash-management, journals, interest, eft, popia"
}
</script>
