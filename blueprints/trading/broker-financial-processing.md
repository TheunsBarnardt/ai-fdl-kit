<!-- AUTO-GENERATED FROM broker-financial-processing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Financial Processing

> Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-account provider integration, and...

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · finance · general-ledger · cash-management · journals · interest · eft · popia

## What this does

Internal back-office financial processing covering general ledger, cash payments and receipts, journal entries, debit and credit interest calculations, trust-account provider integration, and...

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **entry_reference** *(text, required)* — Entry Reference
- **entry_type** *(select, required)* — Entry Type
- **ledger_code** *(text, required)* — General Ledger Code
- **account_code** *(text, required)* — Client Account Code
- **counter_ledger_code** *(text, optional)* — Contra Ledger Code
- **amount** *(number, required)* — Amount
- **currency_code** *(select, required)* — Currency Code
- **value_date** *(date, required)* — Value Date
- **posting_date** *(date, required)* — Posting Date
- **narration** *(text, required)* — Narration
- **debit_credit_indicator** *(select, required)* — Debit or Credit Indicator
- **batch_number** *(text, optional)* — Batch Number
- **source_module** *(select, required)* — Source Module
- **payment_method** *(select, optional)* — Payment Method
- **bank_reference** *(text, optional)* — Bank Reference
- **beneficiary_account_number** *(text, optional)* — Beneficiary Bank Account Number
- **beneficiary_branch_code** *(text, optional)* — Beneficiary Branch Code
- **trust_account_flag** *(boolean, required)* — Trust Account Flag
- **interest_rate** *(number, optional)* — Interest Rate
- **interest_accrual_from** *(date, optional)* — Interest Accrual Start
- **interest_accrual_to** *(date, optional)* — Interest Accrual End
- **backdated_flag** *(boolean, optional)* — Backdated Entry Flag
- **postdated_flag** *(boolean, optional)* — Postdated Entry Flag
- **entry_status** *(select, required)* — Entry Status
- **captured_by** *(text, required)* — Captured By
- **verified_by** *(text, optional)* — Verified By
- **released_by** *(text, optional)* — Released By

## What must be true

- **data_integrity → double_entry_balance:** Every journal must balance to zero across debits and credits before release
- **data_integrity → entry_uniqueness:** Entry reference must be unique within posting date and source module
- **data_integrity → referential_integrity:** Posted entries cannot be deleted; reversals required via contra journal
- **data_integrity → audit_trail_retention:** All captures, verifications, releases, and postings retained for at least 60 months
- **security → segregation_of_duties:** Capture, verification, and release must be performed by three distinct users
- **security → access_control:** Finance screens controlled at the screen and ledger-code level via resource access control
- **security → dual_control_over_threshold:** Entries above the configured threshold require both supervisor verification and treasurer release
- **compliance → popia_protection:** Beneficiary banking details and account references are personal information and must be encrypted at rest and masked in logs
- **compliance → trust_segregation:** Client trust balances must be swept to the trust-account-provider daily and never commingled with firm funds
- **compliance → exchange_control:** Cross-border payments require exchange-control reference and must not pass through resident-only ledgers
- **compliance → sars_reporting:** Debit and credit interest amounts must feed IT3B tax-certificate generation
- **business → backdated_entries:** Backdated entries allowed within the current financial period and require supervisor reason code
- **business → postdated_entries:** Postdated entries queued until value date then auto-released by the back-office system
- **business → interest_calculation:** Daily debit and credit interest calculated on cleared balances using prevailing rate tables
- **business → eft_routing:** Electronic funds transfers routed to electronic-funds-transfer-bank gateway using standardised ACB file format
- **business → cash_receipt_allocation:** Unallocated receipts parked in suspense ledger until matched to a client account within five business days

## Success & failure scenarios

**✅ Success paths**

- **Capture Journal Entry** — when entry_type in ["journal","cash_payment","cash_receipt"]; amount gt 0; ledger_code exists, then create_record; set entry_status = "captured"; emit entry.captured. _Why: Finance operator captures a journal entry with balanced debits and credits._
- **Verify Entry By Supervisor** — when entry_status eq "captured"; user_role eq "finance_supervisor"; captured_by neq "current_user", then move entry_status captured → verified; emit entry.verified. _Why: Supervisor verifies captured entry, enforcing segregation of duties._
- **Release And Post Entry** — when entry_status eq "verified"; user_role eq "treasurer", then move entry_status verified → released; emit entry.released; move entry_status released → posted; emit entry.posted. _Why: Treasurer releases verified entry and back-office system posts to general ledger._
- **Dispatch Eft Payment** — when entry_type eq "cash_payment"; entry_status eq "released"; beneficiary_account_number exists, then call service; emit cash.payment_dispatched. _Why: Back-office system dispatches released cash payment to the bank gateway._
- **Calculate Daily Interest** — when posting_date exists, then create_record; emit interest.calculated. _Why: Back-office system accrues debit and credit interest on cleared balances._
- **Sweep Trust Balances** — when trust_account_flag eq true, then call service; emit trust.sweep_executed. _Why: Daily sweep of client trust balances to the trust-account-provider._
- **Queue Postdated Entry** — when postdated_flag eq true; value_date gt "today", then set entry_status = "captured"; emit entry.captured. _Why: Hold postdated entries until their value date then auto-release._

**❌ Failure paths**

- **Reject Unbalanced Entry** — when debits_equal_credits eq false, then emit entry.rejected. _Why: Prevent release of journals that do not balance._ *(error: `ENTRY_UNBALANCED`)*
- **Reject Self Release** — when captured_by eq "current_user", then emit entry.rejected. _Why: Block the capturing user from also verifying or releasing._ *(error: `ENTRY_RELEASE_FORBIDDEN`)*
- **Block Backdate Outside Period** — when backdated_flag eq true; period_is_open eq false, then emit entry.rejected. _Why: Reject backdated entries that fall outside the open financial period._ *(error: `ENTRY_BACKDATE_BLOCKED`)*

## Errors it can return

- `ENTRY_UNBALANCED` — Journal entries must balance before release
- `ENTRY_DUPLICATE_REFERENCE` — Entry reference already exists for this posting date
- `ENTRY_RELEASE_FORBIDDEN` — Capture user may not verify or release the same entry
- `ENTRY_BACKDATE_BLOCKED` — Backdated entry falls outside the open financial period
- `ENTRY_TRUST_COMMINGLING` — Trust account entry cannot post against a firm ledger code
- `ENTRY_EFT_INVALID_BENEFICIARY` — Beneficiary bank details failed validation
- `ENTRY_POPIA_VIOLATION` — Personal or banking information failed POPIA protection check

## Events

**`entry.captured`**
  Payload: `entry_reference`, `entry_type`, `amount`, `currency_code`, `captured_by`, `timestamp`

**`entry.verified`**
  Payload: `entry_reference`, `verified_by`, `timestamp`

**`entry.released`**
  Payload: `entry_reference`, `released_by`, `timestamp`

**`entry.posted`**
  Payload: `entry_reference`, `ledger_code`, `posting_date`, `timestamp`

**`entry.rejected`**
  Payload: `entry_reference`, `reason`, `rejected_by`, `timestamp`

**`cash.receipt_allocated`**
  Payload: `entry_reference`, `account_code`, `amount`, `allocated_by`

**`cash.payment_dispatched`**
  Payload: `entry_reference`, `beneficiary_account_number`, `amount`, `bank_reference`

**`interest.calculated`**
  Payload: `account_code`, `interest_rate`, `interest_accrual_from`, `interest_accrual_to`, `amount`

**`trust.sweep_executed`**
  Payload: `sweep_date`, `total_amount`, `currency_code`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*
- **broker-back-office-dissemination** *(recommended)*

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-financial-processing/) · **Spec source:** [`broker-financial-processing.blueprint.yaml`](./broker-financial-processing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
