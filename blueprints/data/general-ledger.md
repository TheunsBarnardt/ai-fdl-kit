<!-- AUTO-GENERATED FROM general-ledger.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# General Ledger

> Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting

**Category:** Data · **Version:** 1.0.0 · **Tags:** accounting · general-ledger · chart-of-accounts · double-entry · erp · cost-center

## What this does

Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **account_name** *(text, required)*
- **account_number** *(text, optional)*
- **parent_account** *(text, optional)*
- **is_group** *(boolean, required)*
- **account_type** *(select, optional)*
- **root_type** *(select, required)*
- **account_currency** *(text, required)*
- **disabled** *(boolean, optional)*
- **freeze_account** *(boolean, optional)*
- **account** *(text, required)*
- **debit** *(number, required)*
- **credit** *(number, required)*
- **posting_date** *(date, required)*
- **voucher_type** *(text, required)*
- **voucher_no** *(text, required)*
- **party_type** *(select, optional)*
- **party** *(text, optional)*
- **cost_center** *(text, optional)*

## What must be true

- **hierarchical_chart:** Chart of accounts is hierarchical. Accounts are organized in a nested tree structure with group and leaf nodes. Group accounts cannot have direct GL entries.
- **balanced_entries:** Total debit must equal total credit for every GL entry set (voucher). Unbalanced entries are rejected.
- **cost_center_required:** Profit and Loss accounts (Income and Expense root types) require a cost center to be specified for dimensional reporting.
- **party_required:** Receivable and Payable account types require party_type and party to be specified for sub-ledger tracking.
- **frozen_account_protection:** Frozen accounts block all debit and credit modifications unless the user has freeze override permission.
- **period_closing:** Closed accounting periods block GL posting. No entries are allowed in a closed period.
- **disabled_account:** Disabled accounts cannot be used in new transactions.
- **account_deletion:** Deleting an account is only allowed when it has zero GL entries.

## Success & failure scenarios

**✅ Success paths**

- **Create Account** — when Account name is provided; Valid root type is selected, then New account is created in the chart of accounts under the specified parent.
- **Reverse Gl Entries** — when Voucher number to reverse is specified; original GL entries exist for the specified voucher, then Original GL entries are reversed with offsetting debit and credit entries.
- **Freeze Account** — when Account to freeze is specified; user has account freeze permission, then Account is frozen and no further GL entries can be posted to it without override permission.

**❌ Failure paths**

- **Post Gl Entry** — when Target account is specified; account is not frozen and not disabled; posting date falls within an open accounting period, then GL entries are posted with balanced debit and credit totals. *(error: `GL_BALANCE_MISMATCH`)*
- **Create Journal Entry** — when at least two account lines are provided; total debit equals total credit across all lines; all referenced accounts are active and not frozen, then Journal entry is created and GL entries are posted for all account lines. *(error: `GL_BALANCE_MISMATCH`)*

## Errors it can return

- `GL_BALANCE_MISMATCH` — Total debit does not equal total credit for this entry.
- `GL_ACCOUNT_FROZEN` — Cannot post to a frozen account without freeze override permission.
- `GL_PERIOD_CLOSED` — Cannot post GL entries in a closed accounting period.
- `GL_COST_CENTER_REQUIRED` — Cost center is required for profit and loss accounts.

## Connects to

- **sales-purchase-invoicing** *(required)* — Invoice submission posts GL entries
- **payment-processing** *(required)* — Payment submission posts GL entries

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/general-ledger/) · **Spec source:** [`general-ledger.blueprint.yaml`](./general-ledger.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
