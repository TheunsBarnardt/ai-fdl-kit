<!-- AUTO-GENERATED FROM broker-electronic-cash-payments.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Electronic Cash Payments

> Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segregation of duties, and submits them to...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · payments · eft · batching · authorisation · dual-control · bank-integration · popia

## What this does

Back-office electronic funds transfer interface that loads cash payments into authorised batches, applies multi-level verification and dual release with segregation of duties, and submits them to...

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **bank_process_code** *(text, required)* — Electronic Bank Process Code
- **bank_user_id** *(text, required)* — Bank-Issued User ID
- **user_reference** *(text, required)* — Bank User Reference Owner
- **batch_number** *(number, required)* — Batch Number
- **batch_limit** *(number, required)* — Batch Monetary Limit
- **credit_item_limit** *(number, required)* — Credit Item Limit
- **cut_off_time** *(text, required)* — Daily Cut-Off Time HHMM
- **cash_alpha** *(text, required)* — Cash Alpha (Source Bank Account)
- **payment_indicator** *(select, required)* — Payment Method Indicator
- **payee_name** *(text, required)* — Payee Name
- **payee_bank_branch** *(text, required)* — Payee Bank Branch Code
- **payee_bank_account** *(text, required)* — Payee Bank Account Number
- **payment_amount** *(number, required)* — Payment Amount
- **action_date** *(date, required)* — Action Date
- **age_date** *(date, optional)* — Age Date
- **account_code** *(text, required)* — Source Account Code
- **balance_code** *(text, required)* — Balance Code
- **narrative** *(text, optional)* — Transaction Narrative
- **select_user** *(text, optional)* — Selecting User ID
- **verify_user** *(text, optional)* — Verifying User ID
- **verify_timestamp** *(datetime, optional)* — Verification Timestamp
- **releaser_1_user** *(text, optional)* — First Releaser User ID
- **releaser_1_timestamp** *(datetime, optional)* — First Release Timestamp
- **releaser_2_user** *(text, optional)* — Second Releaser User ID
- **releaser_2_timestamp** *(datetime, optional)* — Second Release Timestamp
- **payment_status** *(select, required)* — Payment Status
- **rejection_code** *(text, optional)* — Rejection Error Code
- **rejection_description** *(text, optional)* — Rejection Description
- **redirect_indicator** *(select, optional)* — Redirect or Unpaid Indicator
- **interim_processed_at** *(datetime, optional)* — Interim Processed Timestamp
- **final_audit_processed_at** *(datetime, optional)* — Final Audit Processed Timestamp

## What must be true

- **authorisation → three_eyes_minimum:** Payments require at least three distinct users: one selector, one verifier, and two releasers
- **authorisation → dual_release:** Two different user IDs must release each batch; identical releasers are rejected
- **authorisation → segregation_of_duties:** The selecting user may not verify their own selection; a releaser may not act as the other releaser on the same batch
- **authorisation → unrelease_authority:** A released record may only be unreleased by the same user who released it, prior to send
- **authorisation → cut_off_enforcement:** Releases after the configured cut-off time are blocked and deferred to the next business day
- **limits → batch_limit_check:** Batch total must not exceed the bank-agreed batch limit configured on the bank profile
- **limits → credit_item_limit_check:** Individual credit items must not exceed the bank-agreed per-item credit limit
- **limits → limit_mismatch_rejection:** If batch or item limits do not match the bank's configured limits, the bank will reject the batch
- **data_integrity → account_eligibility:** Only bank accounts of type Current with blank exchange-control indicator are eligible for electronic payment
- **data_integrity → electronic_indicator:** Payment method indicator must be set explicitly to Electronic for a payment to enter the EFT flow
- **data_integrity → batch_numbering:** Batch numbers auto-increment per bank process and are unique per release
- **data_integrity → audit_trail:** All inserts, changes, deactivations, and reinstatements are logged with user, timestamp, and old/new values
- **security → access_control:** Access to select-all, verify, and release functions is governed by role-based function permissions
- **security → bank_user_id_scope:** Only one bank-issued user ID per electronic bank process per broker firm
- **security → no_plaintext_credentials:** Bank credentials and tokens must never be persisted or logged in clear text
- **compliance → popia:** Payee bank details are personal information under POPIA; protect with encryption at rest and in transit
- **compliance → popia_breach_notification:** Compromise of payee banking details triggers regulator and data-subject notification under POPIA s.22
- **compliance → reserve_bank_eft:** EFT submissions conform to the National Payments System clearing rules
- **compliance → retention:** Payment audit records retained per financial-services recordkeeping requirements (minimum 5 years)
- **business → rejection_handling:** Rejected entries surface on a rejection queue with options to generate a cash receipt, re-select, or take no action
- **business → redirect_on_account_move:** If the bank reports a redirect, payee bank details are updated and require re-verification before reuse
- **business → unpaid_on_closed_account:** Unpaid responses on closed accounts require alternate payment arrangements
- **business → cheque_fallback:** A deactivated electronic payment may be re-issued as a cheque without reversing the underlying cash payment

## Success & failure scenarios

**✅ Success paths**

- **Load Electronic Payment** — when payment_indicator eq "electronic"; source_account_type eq "current"; exchange_control_indicator eq "blank", then create_record; set payment_status = "loaded"; emit payment.loaded. _Why: Operator captures a cash payment flagged as electronic, eligible source account only._
- **Select Payment Into Batch** — when payment_status eq "loaded"; action_date gte "today", then move payment_status loaded → selected; set select_user = "current_user"; emit payment.selected. _Why: Operator selects loaded payments into a pending batch grouped by selecting user._
- **Verify Selected Batch** — when payment_status eq "selected"; verify_user neq "select_user", then move payment_status selected → verified; set verify_timestamp = "now"; emit payment.verified. _Why: Verifier confirms the selected group; selector cannot self-verify._
- **Dual Release Send Batch** — when payment_status eq "authorized"; releaser_2_user neq "releaser_1_user"; current_time lt "cut_off_time"; batch_total lte "batch_limit", then move payment_status authorized → released; call service; emit payment.released; emit payment.bank_submitted. _Why: Two distinct releasers authorise and send a verified batch before the cut-off time._
- **Process Bank Acknowledgement** — when payment_status eq "released"; final_audit_processed_at exists, then move payment_status released → settled; set final_audit_processed_at = "bank_timestamp"; emit payment.settled. _Why: Record interim and final bank acknowledgements and settle the batch._

**❌ Failure paths**

- **Reject Ineligible Source Account** — when source_account_type neq "current" OR exchange_control_indicator neq "blank", then emit payment.loaded. _Why: Block electronic payments from accounts that are not current or that have exchange-control flags set._ *(error: `PAYMENT_INELIGIBLE_BANK_ACCOUNT`)*
- **Reject Self Verification** — when acting_user eq "select_user", then emit payment.verified. _Why: Prevent the selecting user from verifying or releasing their own selection._ *(error: `PAYMENT_SELF_VERIFY_FORBIDDEN`)*
- **Block Identical Releasers** — when releaser_2_user eq "releaser_1_user", then emit payment.released. _Why: Reject release attempts where releaser 1 and releaser 2 are the same user._ *(error: `PAYMENT_IDENTICAL_RELEASERS`)*
- **Enforce Cut Off Time** — when current_time gte "cut_off_time", then emit payment.released. _Why: Block releases submitted after the configured bank cut-off time._ *(error: `PAYMENT_CUT_OFF_EXCEEDED`)*
- **Handle Bank Rejection** — when bank_response eq "rejected", then move payment_status released → rejected; set rejection_code = "bank_error_code"; emit payment.rejected. _Why: Bank rejects all or part of the batch; surface rejections for reprocessing._ *(error: `PAYMENT_BANK_REJECTED`)*

## Business flows

**Capture To Settlement** — End-to-end electronic cash payment flow from capture to bank settlement

1. **Capture cash payment with electronic indicator on eligible source account** *(payment_operator)*
1. **Select loaded payments into a pending batch for a given action date** *(payment_operator)*
1. **Verify the selected batch group (must differ from selector)** *(payment_verifier)*
1. **First releaser authorises the verified batch** *(payment_releaser)*
1. **Second distinct releaser sends the batch before cut-off** *(payment_releaser)*
1. **Acknowledge interim receipt and return final audit result** *(bank_system)*
1. **Surface rejections and redirects for operator remediation** *(back_office_system)*

## Errors it can return

- `PAYMENT_IDENTICAL_RELEASERS` — The two releasers must be different users
- `PAYMENT_CUT_OFF_EXCEEDED` — Bank cut-off time has passed; release deferred to next business day
- `PAYMENT_BATCH_LIMIT_EXCEEDED` — Batch total exceeds the configured bank batch limit
- `PAYMENT_CREDIT_ITEM_LIMIT_EXCEEDED` — Individual payment amount exceeds the configured credit item limit
- `PAYMENT_SELF_VERIFY_FORBIDDEN` — Selector may not verify or release their own payments
- `PAYMENT_INELIGIBLE_BANK_ACCOUNT` — Source bank account is not configured for electronic payments
- `PAYMENT_BANK_REJECTED` — Bank gateway rejected all or part of the batch
- `PAYMENT_BATCH_NOT_VERIFIED` — Batch must be verified before release

## Events

**`payment.loaded`**
  Payload: `payment_id`, `account_code`, `amount`, `cash_alpha`, `bank_process_code`, `created_by`, `timestamp`

**`payment.selected`**
  Payload: `payment_id`, `batch_number`, `selected_by`, `timestamp`

**`payment.verified`**
  Payload: `batch_number`, `select_user`, `verify_user`, `total_amount`, `timestamp`

**`payment.authorized`**
  Payload: `batch_number`, `releaser_1_user`, `timestamp`

**`payment.released`**
  Payload: `batch_number`, `releaser_2_user`, `total_amount`, `action_date`, `timestamp`

**`payment.bank_submitted`**
  Payload: `batch_number`, `bank_process_code`, `sent_at`, `debit_count`, `credit_count`

**`payment.bank_acknowledged`**
  Payload: `batch_number`, `interim_processed_at`

**`payment.settled`**
  Payload: `batch_number`, `final_audit_processed_at`

**`payment.rejected`**
  Payload: `batch_number`, `payment_id`, `rejection_code`, `rejection_description`

**`payment.redirected`**
  Payload: `payment_id`, `new_bank_branch`, `new_bank_account`, `redirect_source`

## Connects to

- **popia-compliance** *(required)*
- **broker-client-account-maintenance** *(recommended)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-electronic-cash-payments/) · **Spec source:** [`broker-electronic-cash-payments.blueprint.yaml`](./broker-electronic-cash-payments.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
