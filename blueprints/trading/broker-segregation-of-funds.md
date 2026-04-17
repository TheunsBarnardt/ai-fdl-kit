<!-- AUTO-GENERATED FROM broker-segregation-of-funds.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Segregation Of Funds

> Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handling, and bank transfer instructions

**Category:** Trading · **Version:** 1.0.0 · **Tags:** back-office · broker · segregation-of-funds · trust-account · sweeps · exchange-control · non-resident · reconciliation

## What this does

Segregation of client funds from member funds via trust banking accounts with daily sweeps to a central trust-account provider, resident vs non-resident handling, and bank transfer instructions

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **member_code** *(text, required)* — Member Code
- **cash_alpha_code** *(text, required)* — Cash Alpha Code
- **bank_account_number** *(text, required)* — Bank Account Number
- **bank_branch_code** *(text, required)* — Bank Branch Code
- **bank_bic_code** *(text, optional)* — Bank BIC / SWIFT Code
- **account_type** *(select, required)* — Account Type
- **related_cash_alpha** *(text, optional)* — Related Current Account Cash Alpha
- **exchange_control_indicator** *(select, required)* — Exchange Control Indicator
- **gl_control_account_resident** *(text, required)* — GL Control Account — Resident Funds
- **gl_control_account_non_resident** *(text, required)* — GL Control Account — Non-Resident Funds
- **sweep_date** *(date, required)* — Sweep Age Date
- **sweep_amount** *(number, required)* — Sweep Amount
- **sweep_direction** *(select, required)* — Sweep Direction
- **sweep_status** *(select, required)* — Sweep Status
- **unpaid_sweep_reason** *(text, optional)* — Unpaid Sweep Reason
- **interest_rate** *(number, optional)* — Base Interest Rate
- **minimum_interest_debit** *(number, optional)* — Minimum Interest Amount Debit
- **minimum_interest_credit** *(number, optional)* — Minimum Interest Amount Credit
- **non_resident_cutoff_time** *(text, optional)* — Non-Resident Payment Cut-off Time
- **transfer_instruction_reference** *(text, optional)* — Bank Transfer Instruction Reference

## What must be true

- **segregation → trust_account_required:** Every member must operate a resident trust banking account and, if serving non-residents, a non-resident trust banking account
- **segregation → client_funds_protection:** Client assets must be held separately from member assets at all times to protect investors on member default
- **segregation → deposit_routing:** Client deposits must be made into the member's trust account, never the member's operating current account
- **segregation → daily_sweep:** Credit balances on controlled-client accounts are swept to the central trust-account provider on a daily basis
- **segregation → same_day_value:** Sweeps must settle for same-day value, even if the transfer instruction is delivered to the bank the following morning (retro back-dating)
- **segregation → approved_banks_only:** Trust banking accounts may only be held at the set of approved commercial banks recognised by the trust-account provider
- **exchange_control → resident_blank_indicator:** Accounts belonging to residents carry a blank or 'resident' exchange control indicator and funds are non-transferable offshore without authority approval
- **exchange_control → non_resident_indicator:** Non-resident accounts carry an 'F' / non_resident indicator and funds are transferable out of the country
- **exchange_control → blocked_funds_indicator:** 'B' / blocked funds indicator identifies emigrated-person residual funds, strictly controlled and held only by authorised dealers
- **exchange_control → non_resident_no_overdraft:** Non-resident bank accounts may never go into overdraft; deliberate overdraft is a contravention that may trigger licence revocation and regulator audit
- **exchange_control → deposit_default_routing:** Deposits from accounts flagged non-resident default to the non-resident trust account regardless of cash alpha supplied
- **exchange_control → non_resident_cutoff:** Non-resident payments must respect the regulator cut-off time; funds must be loaded the day before to allow sweep settlement
- **reconciliation → daily_balance_check:** Member must confirm daily that balances due to or from the trust-account provider reconcile; any differences addressed promptly
- **reconciliation → unpaid_sweep_follow_up:** Unpaid sweeps on current accounts require immediate investigation and resolution
- **reconciliation → gl_control_accounts:** Resident and non-resident sweeps must post to distinct general ledger control accounts
- **reconciliation → audit_trail:** All sweep transactions and bank transfer instructions logged and retained for regulatory inspection
- **interest → interest_payment_cycle:** Market-related interest on pooled trust funds is paid by the trust-account provider to the member monthly and credited to client accounts at month-end
- **interest → administration_fee:** Member may deduct a disclosed administration fee from interest before crediting clients
- **interest → minimum_interest_thresholds:** Minimum debit and credit interest amounts configurable separately for managed and non-managed clients
- **security → bank_file_integrity:** Bank transfer instruction files must be digitally signed or transmitted over authenticated channels
- **security → segregation_of_duties:** Authoriser of non-resident payments must be distinct from the operator who captured the instruction

## Success & failure scenarios

**✅ Success paths**

- **Configure Trust Account** — when account_type in ["trust","non_resident_trust"]; bank_account_number exists; cash_alpha_code exists, then create_record; emit trust_account.configured. _Why: Customer support loads a trust banking account with cash alpha and bank details._
- **Calculate Daily Sweep** — when batch_phase eq "overnight"; controlled_client_balance_changed eq true, then create_record; set sweep_status = "pending"; emit sweep.calculated. _Why: Overnight batch calculates required sweep to or from the trust-account provider per bank._
- **Issue Bank Transfer Instruction** — when sweep_status eq "pending", then call service; move sweep_status pending → instructed; emit sweep.instruction_issued. _Why: Back-office system issues same-day-value transfer instruction to the member's bank._
- **Route Non Resident Deposit** — when client_exchange_control_indicator eq "non_resident", then set cash_alpha_code = "non_resident_default"; emit sweep.calculated. _Why: Auto-route deposits from non-resident-flagged clients to the non-resident trust account regardless of supplied cash alpha._
- **Reconcile Trust Provider Balance** — when reconciliation_period_closed eq true, then emit sweep.reconciled. _Why: Finance reconciles member ledger against trust-account provider statements for the period._
- **Credit Monthly Interest** — when period_end eq "month_end", then set client_balance = "updated"; emit interest.credited. _Why: Monthly interest received from trust-account provider credited to client balances net of administration fee._

**❌ Failure paths**

- **Reject Unapproved Bank** — when bank_code not_in ["approved_bank_1","approved_bank_2","approved_bank_3","approved_bank_4"], then emit trust_account.configured. _Why: Block creation of trust accounts at banks outside the approved list._ *(error: `SOF_UNAPPROVED_BANK`)*
- **Reject Non Resident Overdraft** — when account_type eq "non_resident_trust"; projected_balance lt 0, then emit sweep.unpaid. _Why: Block any instruction that would send the non-resident trust account into overdraft._ *(error: `SOF_NON_RESIDENT_OVERDRAFT`)*
- **Enforce Non Resident Cutoff** — when account_type eq "non_resident_trust"; submission_time gt "non_resident_cutoff_time", then emit sweep.unpaid. _Why: Reject non-resident payment submitted after the regulator cut-off time._ *(error: `SOF_CUTOFF_EXCEEDED`)*
- **Record Unpaid Sweep** — when bank_settlement_status eq "failed", then move sweep_status instructed → unpaid; emit sweep.unpaid. _Why: Bank reports a sweep was not settled; record reason and flag for investigation._ *(error: `SOF_SWEEP_UNPAID`)*

## Errors it can return

- `SOF_SWEEP_UNPAID` — Sweep instruction was not settled by the bank
- `SOF_NON_RESIDENT_OVERDRAFT` — Non-resident bank account cannot go into overdraft
- `SOF_TRUST_ACCOUNT_MISSING` — Required trust banking account has not been configured for this member
- `SOF_UNAPPROVED_BANK` — Bank is not on the list of approved trust-account providers
- `SOF_CUTOFF_EXCEEDED` — Non-resident payment submitted after regulator cut-off time
- `SOF_EXCHANGE_CONTROL_MISMATCH` — Exchange control indicator on account does not match trust account type
- `SOF_RECONCILIATION_DIFFERENCE` — Trust-account provider balance does not reconcile with member ledger

## Events

**`sweep.calculated`**
  Payload: `member_code`, `sweep_date`, `sweep_amount`, `sweep_direction`, `gl_control_account`

**`sweep.instruction_issued`**
  Payload: `member_code`, `bank_account_number`, `transfer_instruction_reference`, `sweep_amount`, `sweep_date`

**`sweep.settled`**
  Payload: `member_code`, `sweep_date`, `sweep_amount`, `transfer_instruction_reference`

**`sweep.unpaid`**
  Payload: `member_code`, `sweep_date`, `sweep_amount`, `unpaid_sweep_reason`

**`sweep.reconciled`**
  Payload: `member_code`, `sweep_date`, `reconciled_by`

**`trust_account.configured`**
  Payload: `member_code`, `cash_alpha_code`, `bank_account_number`, `account_type`, `exchange_control_indicator`

**`interest.credited`**
  Payload: `member_code`, `period`, `total_interest`, `administration_fee`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **foreign-exchange-control** *(required)*
- **popia-compliance** *(required)*
- **broker-client-data-upload** *(recommended)*

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-segregation-of-funds/) · **Spec source:** [`broker-segregation-of-funds.blueprint.yaml`](./broker-segregation-of-funds.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
