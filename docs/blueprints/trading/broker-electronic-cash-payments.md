---
title: "Broker Electronic Cash Payments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segrega"
---

# Broker Electronic Cash Payments Blueprint

> Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segregation of duties, and submits them to...

| | |
|---|---|
| **Feature** | `broker-electronic-cash-payments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | back-office, broker, payments, eft, batching, authorisation, dual-control, bank-integration, popia |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/broker-electronic-cash-payments.blueprint.yaml) |
| **JSON API** | [broker-electronic-cash-payments.json]({{ site.baseurl }}/api/blueprints/trading/broker-electronic-cash-payments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `payment_operator` | Payment Capture Operator | human | Captures cash payment entries and selects them into a batch |
| `payment_verifier` | Payment Verifier / Authoriser | human | Reviews selected entries and verifies the batch before release |
| `payment_releaser` | Payment Releaser (Approver) | human | One of two independent releasers required to send a verified batch |
| `bank_system` | Electronic Payment Bank Gateway | external | Generic bank electronic funds transfer interface that receives, processes, and acknowledges or rejects payment batches |
| `systems_administrator` | Systems Administrator | human | Maintains the list of supported bank gateways and profile configuration |
| `back_office_system` | Back-Office Payment System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `bank_process_code` | text | Yes | Electronic Bank Process Code |  |
| `bank_user_id` | text | Yes | Bank-Issued User ID |  |
| `user_reference` | text | Yes | Bank User Reference Owner |  |
| `batch_number` | number | Yes | Batch Number |  |
| `batch_limit` | number | Yes | Batch Monetary Limit |  |
| `credit_item_limit` | number | Yes | Credit Item Limit |  |
| `cut_off_time` | text | Yes | Daily Cut-Off Time HHMM |  |
| `cash_alpha` | text | Yes | Cash Alpha (Source Bank Account) |  |
| `payment_indicator` | select | Yes | Payment Method Indicator |  |
| `payee_name` | text | Yes | Payee Name |  |
| `payee_bank_branch` | text | Yes | Payee Bank Branch Code |  |
| `payee_bank_account` | text | Yes | Payee Bank Account Number |  |
| `payment_amount` | number | Yes | Payment Amount |  |
| `action_date` | date | Yes | Action Date |  |
| `age_date` | date | No | Age Date |  |
| `account_code` | text | Yes | Source Account Code |  |
| `balance_code` | text | Yes | Balance Code |  |
| `narrative` | text | No | Transaction Narrative |  |
| `select_user` | text | No | Selecting User ID |  |
| `verify_user` | text | No | Verifying User ID |  |
| `verify_timestamp` | datetime | No | Verification Timestamp |  |
| `releaser_1_user` | text | No | First Releaser User ID |  |
| `releaser_1_timestamp` | datetime | No | First Release Timestamp |  |
| `releaser_2_user` | text | No | Second Releaser User ID |  |
| `releaser_2_timestamp` | datetime | No | Second Release Timestamp |  |
| `payment_status` | select | Yes | Payment Status |  |
| `rejection_code` | text | No | Rejection Error Code |  |
| `rejection_description` | text | No | Rejection Description |  |
| `redirect_indicator` | select | No | Redirect or Unpaid Indicator |  |
| `interim_processed_at` | datetime | No | Interim Processed Timestamp |  |
| `final_audit_processed_at` | datetime | No | Final Audit Processed Timestamp |  |

## States

**State field:** `payment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `loaded` | Yes |  |
| `selected` |  |  |
| `verified` |  |  |
| `authorized` |  |  |
| `released` |  |  |
| `settled` |  | Yes |
| `rejected` |  | Yes |
| `deactivated` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `loaded` | `selected` | payment_operator |  |
|  | `selected` | `verified` | payment_verifier |  |
|  | `verified` | `authorized` | payment_releaser |  |
|  | `authorized` | `released` | payment_releaser |  |
|  | `released` | `settled` | bank_system |  |
|  | `released` | `rejected` | bank_system |  |
|  | `selected` | `loaded` | payment_operator |  |
|  | `loaded` | `deactivated` | payment_operator |  |

## Rules

- **authorisation:**
  - **three_eyes_minimum:** Payments require at least three distinct users: one selector, one verifier, and two releasers
  - **dual_release:** Two different user IDs must release each batch; identical releasers are rejected
  - **segregation_of_duties:** The selecting user may not verify their own selection; a releaser may not act as the other releaser on the same batch
  - **unrelease_authority:** A released record may only be unreleased by the same user who released it, prior to send
  - **cut_off_enforcement:** Releases after the configured cut-off time are blocked and deferred to the next business day
- **limits:**
  - **batch_limit_check:** Batch total must not exceed the bank-agreed batch limit configured on the bank profile
  - **credit_item_limit_check:** Individual credit items must not exceed the bank-agreed per-item credit limit
  - **limit_mismatch_rejection:** If batch or item limits do not match the bank's configured limits, the bank will reject the batch
- **data_integrity:**
  - **account_eligibility:** Only bank accounts of type Current with blank exchange-control indicator are eligible for electronic payment
  - **electronic_indicator:** Payment method indicator must be set explicitly to Electronic for a payment to enter the EFT flow
  - **batch_numbering:** Batch numbers auto-increment per bank process and are unique per release
  - **audit_trail:** All inserts, changes, deactivations, and reinstatements are logged with user, timestamp, and old/new values
- **security:**
  - **access_control:** Access to select-all, verify, and release functions is governed by role-based function permissions
  - **bank_user_id_scope:** Only one bank-issued user ID per electronic bank process per broker firm
  - **no_plaintext_credentials:** Bank credentials and tokens must never be persisted or logged in clear text
- **compliance:**
  - **popia:** Payee bank details are personal information under POPIA; protect with encryption at rest and in transit
  - **popia_breach_notification:** Compromise of payee banking details triggers regulator and data-subject notification under POPIA s.22
  - **reserve_bank_eft:** EFT submissions conform to the National Payments System clearing rules
  - **retention:** Payment audit records retained per financial-services recordkeeping requirements (minimum 5 years)
- **business:**
  - **rejection_handling:** Rejected entries surface on a rejection queue with options to generate a cash receipt, re-select, or take no action
  - **redirect_on_account_move:** If the bank reports a redirect, payee bank details are updated and require re-verification before reuse
  - **unpaid_on_closed_account:** Unpaid responses on closed accounts require alternate payment arrangements
  - **cheque_fallback:** A deactivated electronic payment may be re-issued as a cheque without reversing the underlying cash payment

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| cut_off_enforcement | same-business-day | Unreleased batches roll to the next business day and require re-authorisation |
| interim_acknowledgement | 15m | Missing interim acknowledgement after SLA triggers operations alert |

## Flows

### Capture_to_settlement

End-to-end electronic cash payment flow from capture to bank settlement

1. **Capture cash payment with electronic indicator on eligible source account** (payment_operator)
1. **Select loaded payments into a pending batch for a given action date** (payment_operator)
1. **Verify the selected batch group (must differ from selector)** (payment_verifier)
1. **First releaser authorises the verified batch** (payment_releaser)
1. **Second distinct releaser sends the batch before cut-off** (payment_releaser)
1. **Acknowledge interim receipt and return final audit result** (bank_system)
1. **Surface rejections and redirects for operator remediation** (back_office_system)

## Outcomes

### Load_electronic_payment (Priority: 1) | Transaction: atomic

_Operator captures a cash payment flagged as electronic, eligible source account only_

**Given:**
- `payment_indicator` (input) eq `electronic`
- `source_account_type` (db) eq `current`
- `exchange_control_indicator` (db) eq `blank`

**Then:**
- **create_record**
- **set_field** target: `payment_status` value: `loaded`
- **emit_event** event: `payment.loaded`

### Reject_ineligible_source_account (Priority: 2) — Error: `PAYMENT_INELIGIBLE_BANK_ACCOUNT`

_Block electronic payments from accounts that are not current or that have exchange-control flags set_

**Given:**
- ANY: `source_account_type` (db) neq `current` OR `exchange_control_indicator` (db) neq `blank`

**Then:**
- **emit_event** event: `payment.loaded`

### Select_payment_into_batch (Priority: 3) | Transaction: atomic

_Operator selects loaded payments into a pending batch grouped by selecting user_

**Given:**
- `payment_status` (db) eq `loaded`
- `action_date` (input) gte `today`

**Then:**
- **transition_state** field: `payment_status` from: `loaded` to: `selected`
- **set_field** target: `select_user` value: `current_user`
- **emit_event** event: `payment.selected`

### Verify_selected_batch (Priority: 4) | Transaction: atomic

_Verifier confirms the selected group; selector cannot self-verify_

**Given:**
- `payment_status` (db) eq `selected`
- `verify_user` (session) neq `select_user`

**Then:**
- **transition_state** field: `payment_status` from: `selected` to: `verified`
- **set_field** target: `verify_timestamp` value: `now`
- **emit_event** event: `payment.verified`

### Reject_self_verification (Priority: 5) — Error: `PAYMENT_SELF_VERIFY_FORBIDDEN`

_Prevent the selecting user from verifying or releasing their own selection_

**Given:**
- `acting_user` (session) eq `select_user`

**Then:**
- **emit_event** event: `payment.verified`

### Dual_release_send_batch (Priority: 6) | Transaction: atomic

_Two distinct releasers authorise and send a verified batch before the cut-off time_

**Given:**
- `payment_status` (db) eq `authorized`
- `releaser_2_user` (input) neq `releaser_1_user`
- `current_time` (system) lt `cut_off_time`
- `batch_total` (computed) lte `batch_limit`

**Then:**
- **transition_state** field: `payment_status` from: `authorized` to: `released`
- **call_service** target: `electronic_payment_bank`
- **emit_event** event: `payment.released`
- **emit_event** event: `payment.bank_submitted`

### Block_identical_releasers (Priority: 7) — Error: `PAYMENT_IDENTICAL_RELEASERS`

_Reject release attempts where releaser 1 and releaser 2 are the same user_

**Given:**
- `releaser_2_user` (input) eq `releaser_1_user`

**Then:**
- **emit_event** event: `payment.released`

### Enforce_cut_off_time (Priority: 8) — Error: `PAYMENT_CUT_OFF_EXCEEDED`

_Block releases submitted after the configured bank cut-off time_

**Given:**
- `current_time` (system) gte `cut_off_time`

**Then:**
- **emit_event** event: `payment.released`

### Process_bank_acknowledgement (Priority: 9) | Transaction: atomic

_Record interim and final bank acknowledgements and settle the batch_

**Given:**
- `payment_status` (db) eq `released`
- `final_audit_processed_at` (input) exists

**Then:**
- **transition_state** field: `payment_status` from: `released` to: `settled`
- **set_field** target: `final_audit_processed_at` value: `bank_timestamp`
- **emit_event** event: `payment.settled`

### Handle_bank_rejection (Priority: 10) — Error: `PAYMENT_BANK_REJECTED`

_Bank rejects all or part of the batch; surface rejections for reprocessing_

**Given:**
- `bank_response` (input) eq `rejected`

**Then:**
- **transition_state** field: `payment_status` from: `released` to: `rejected`
- **set_field** target: `rejection_code` value: `bank_error_code`
- **emit_event** event: `payment.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PAYMENT_IDENTICAL_RELEASERS` | 409 | The two releasers must be different users | No |
| `PAYMENT_CUT_OFF_EXCEEDED` | 409 | Bank cut-off time has passed; release deferred to next business day | No |
| `PAYMENT_BATCH_LIMIT_EXCEEDED` | 422 | Batch total exceeds the configured bank batch limit | No |
| `PAYMENT_CREDIT_ITEM_LIMIT_EXCEEDED` | 422 | Individual payment amount exceeds the configured credit item limit | No |
| `PAYMENT_SELF_VERIFY_FORBIDDEN` | 403 | Selector may not verify or release their own payments | No |
| `PAYMENT_INELIGIBLE_BANK_ACCOUNT` | 422 | Source bank account is not configured for electronic payments | No |
| `PAYMENT_BANK_REJECTED` | 503 | Bank gateway rejected all or part of the batch | No |
| `PAYMENT_BATCH_NOT_VERIFIED` | 409 | Batch must be verified before release | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `payment.loaded` |  | `payment_id`, `account_code`, `amount`, `cash_alpha`, `bank_process_code`, `created_by`, `timestamp` |
| `payment.selected` |  | `payment_id`, `batch_number`, `selected_by`, `timestamp` |
| `payment.verified` |  | `batch_number`, `select_user`, `verify_user`, `total_amount`, `timestamp` |
| `payment.authorized` |  | `batch_number`, `releaser_1_user`, `timestamp` |
| `payment.released` |  | `batch_number`, `releaser_2_user`, `total_amount`, `action_date`, `timestamp` |
| `payment.bank_submitted` |  | `batch_number`, `bank_process_code`, `sent_at`, `debit_count`, `credit_count` |
| `payment.bank_acknowledged` |  | `batch_number`, `interim_processed_at` |
| `payment.settled` |  | `batch_number`, `final_audit_processed_at` |
| `payment.rejected` |  | `batch_number`, `payment_id`, `rejection_code`, `rejection_description` |
| `payment.redirected` |  | `payment_id`, `new_bank_branch`, `new_bank_account`, `redirect_source` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| popia-compliance | required |  |
| broker-client-account-maintenance | recommended |  |
| broker-back-office-dissemination | recommended |  |

## AGI Readiness

### Goals

#### Reliable Broker Electronic Cash Payments

Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segregation of duties, and submits them to...

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

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| load_electronic_payment | `autonomous` | - | - |
| reject_ineligible_source_account | `supervised` | - | - |
| select_payment_into_batch | `autonomous` | - | - |
| verify_selected_batch | `autonomous` | - | - |
| reject_self_verification | `supervised` | - | - |
| dual_release_send_batch | `autonomous` | - | - |
| block_identical_releasers | `human_required` | - | - |
| enforce_cut_off_time | `autonomous` | - | - |
| process_bank_acknowledgement | `autonomous` | - | - |
| handle_bank_rejection | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
screens:
  T_ELB: Electronic Transfer Banks Table
  BNKPF: Electronic Bank Profile
  ELCAS: Electronic Transfer Cash Alphas
  T_GL_CSH: Cash Alpha Codes with Electronic Pay Indicator
  CSHPT: Cash Payments Capture
  MTHPT: Monthly Cash Payments
  BNKOV: Bank Crossovers
  DLCHQ: Cheques / Payment for Scrip Received
  ELPAY: Select Electronic Cash Payments
  ELPNQ: Electronic Cash Payments Enquiry
  VERPT: Verify Payments
  RELPT: Release Payments
  XFMON: Transfer Process Monitoring
  XFBTS: Transfer Process Batch Totals
  ELXFA: Electronic Transfer Audit Enquiry
  ELXFD: Electronic Transfer Audit Detail
  ELREJ: Process Rejected Payments
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Broker Electronic Cash Payments Blueprint",
  "description": "Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segrega",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "back-office, broker, payments, eft, batching, authorisation, dual-control, bank-integration, popia"
}
</script>
