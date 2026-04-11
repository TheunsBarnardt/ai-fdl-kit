<!-- AUTO-GENERATED FROM odoo-expense-approval.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Expense Approval

> Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment processing.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** expenses · approval-workflow · reimbursement · employee-expenses · accounting-integration

## What this does

Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment processing.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **expense_description** *(text, required)* — Description
- **employee_id** *(text, required)* — Employee
- **expense_date** *(date, required)* — Expense Date
- **product_id** *(text, required)* — Expense Category
- **total_amount** *(number, required)* — Total Amount
- **currency_id** *(text, required)* — Currency
- **quantity** *(number, required)* — Quantity
- **unit_price** *(number, required)* — Unit Price
- **tax_ids** *(json, optional)* — Taxes
- **tax_amount** *(number, optional)* — Tax Amount
- **untaxed_amount** *(number, optional)* — Untaxed Amount
- **payment_mode** *(select, required)* — Payment Mode
- **approval_state** *(select, required)* — Approval Status
- **expense_state** *(select, required)* — Overall State
- **account_id** *(text, optional)* — Expense Account
- **journal_entry_id** *(text, optional)* — Journal Entry
- **amount_residual** *(number, optional)* — Outstanding Balance
- **approval_date** *(datetime, optional)* — Approval Date
- **receipt_attachment** *(file, optional)* — Receipt

## What must be true

- **cannot_approve_own_expenses:** An employee cannot approve their own expenses, regardless of their role. A different authorized approver must review.
- **approver_authorization_levels:** Three authorization levels for expense approval: (1) direct manager of the employee, (2) designated expense manager, (3) department manager. At least one must approve.
- **editable_until_posted:** Expenses are editable in draft, submitted, and approved states by authorized users. Once posted to accounting, they cannot be modified.
- **one_payment_per_expense:** Each expense generates at most one payment record for reimbursement
- **account_derived_from_category:** The expense account is automatically determined from the expense category (product). Can be overridden manually.
- **currency_conversion_at_expense_date:** Multi-currency expenses are converted to company currency at the exchange rate on the expense date.
- **duplicate_detection:** System detects potential duplicate expenses based on similar amount, date, and description, and warns the approver.

## Success & failure scenarios

**✅ Success paths**

- **Expense Submitted** — when employee has a draft expense with valid details; employee clicks submit, then Expense appears in approver's queue.
- **Expense Approved** — when expense is in submitted state; authorized approver reviews and approves, then Expense approved, ready for accounting posting.
- **Expense Refused** — when expense is in submitted state; authorized approver refuses the expense, then Expense rejected, employee notified.
- **Expense Posted** — when expense is approved; accountant posts to accounting, then Expense recorded in accounting, payment can proceed.
- **Expense Paid** — when expense is posted; reimbursement payment is processed and reconciled, then Employee fully reimbursed, expense cycle complete.

**❌ Failure paths**

- **Self Approval Blocked** — when user attempts to approve their own expense, then Approval rejected, different approver required. *(error: `EXPENSE_SELF_APPROVAL`)*

## Errors it can return

- `EXPENSE_SELF_APPROVAL` — You cannot approve your own expenses. Please ask another authorized approver.
- `EXPENSE_NOT_AUTHORIZED` — You are not authorized to approve expenses for this employee.
- `EXPENSE_ALREADY_POSTED` — This expense has been posted to accounting and cannot be edited.
- `EXPENSE_DUPLICATE_DETECTED` — A similar expense already exists. Please verify this is not a duplicate.

## Connects to

- **invoicing-payments** *(required)* — Expense posting creates journal entries in the accounting system
- **automation-rules** *(optional)* — Automate expense routing (e.g., auto-approve under threshold)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/expense-approval/) · **Spec source:** [`expense-approval.blueprint.yaml`](./expense-approval.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
