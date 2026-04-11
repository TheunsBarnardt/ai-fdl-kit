---
title: "Expense Approval Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment proce"
---

# Expense Approval Blueprint

> Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment processing.


| | |
|---|---|
| **Feature** | `expense-approval` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | expenses, approval-workflow, reimbursement, employee-expenses, accounting-integration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/odoo-expense-approval.blueprint.yaml) |
| **JSON API** | [expense-approval.json]({{ site.baseurl }}/api/blueprints/workflow/expense-approval.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `employee` | Employee | human | Submits expense reports for approval and reimbursement |
| `expense_manager` | Expense Approver | human | Reviews and approves or rejects expense submissions |
| `accountant` | Accountant | human | Posts approved expenses to accounting and processes payment |
| `system` | Expense System | system | Computes amounts, generates journal entries, tracks payment state |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `expense_description` | text | Yes | Description |  |
| `employee_id` | text | Yes | Employee |  |
| `expense_date` | date | Yes | Expense Date |  |
| `product_id` | text | Yes | Expense Category |  |
| `total_amount` | number | Yes | Total Amount |  |
| `currency_id` | text | Yes | Currency |  |
| `quantity` | number | Yes | Quantity | Validations: min |
| `unit_price` | number | Yes | Unit Price |  |
| `tax_ids` | json | No | Taxes |  |
| `tax_amount` | number | No | Tax Amount |  |
| `untaxed_amount` | number | No | Untaxed Amount |  |
| `payment_mode` | select | Yes | Payment Mode |  |
| `approval_state` | select | Yes | Approval Status |  |
| `expense_state` | select | Yes | Overall State |  |
| `account_id` | text | No | Expense Account |  |
| `journal_entry_id` | text | No | Journal Entry |  |
| `amount_residual` | number | No | Outstanding Balance |  |
| `approval_date` | datetime | No | Approval Date |  |
| `receipt_attachment` | file | No | Receipt |  |

## States

**State field:** `expense_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `approved` |  |  |
| `refused` |  | Yes |
| `posted` |  |  |
| `in_payment` |  |  |
| `paid` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` | employee |  |
|  | `submitted` | `approved` | expense_manager | Approver must be the employee's manager, expense manager, or department manager. Cannot approve own expenses.  |
|  | `submitted` | `refused` | expense_manager |  |
|  | `approved` | `posted` | accountant |  |
|  | `posted` | `in_payment` | accountant |  |
|  | `in_payment` | `paid` | system |  |

## Rules

- **cannot_approve_own_expenses:**
  - **description:** An employee cannot approve their own expenses, regardless of their role. A different authorized approver must review.

- **approver_authorization_levels:**
  - **description:** Three authorization levels for expense approval: (1) direct manager of the employee, (2) designated expense manager, (3) department manager. At least one must approve.

- **editable_until_posted:**
  - **description:** Expenses are editable in draft, submitted, and approved states by authorized users. Once posted to accounting, they cannot be modified.

- **one_payment_per_expense:**
  - **description:** Each expense generates at most one payment record for reimbursement
- **account_derived_from_category:**
  - **description:** The expense account is automatically determined from the expense category (product). Can be overridden manually.

- **currency_conversion_at_expense_date:**
  - **description:** Multi-currency expenses are converted to company currency at the exchange rate on the expense date.

- **duplicate_detection:**
  - **description:** System detects potential duplicate expenses based on similar amount, date, and description, and warns the approver.


## Outcomes

### Expense_submitted (Priority: 1)

**Given:**
- employee has a draft expense with valid details
- employee clicks submit

**Then:**
- **transition_state** field: `expense_state` from: `draft` to: `submitted`
- **set_field** target: `approval_state` value: `submitted`
- **notify** — Activity created for the employee's manager to review
- **emit_event** event: `expense.submitted`

**Result:** Expense appears in approver's queue

### Self_approval_blocked (Priority: 1) — Error: `EXPENSE_SELF_APPROVAL`

**Given:**
- user attempts to approve their own expense

**Then:**
- **notify** — Show error that self-approval is not allowed

**Result:** Approval rejected, different approver required

### Expense_approved (Priority: 2)

**Given:**
- expense is in submitted state
- authorized approver reviews and approves

**Then:**
- **transition_state** field: `expense_state` from: `submitted` to: `approved`
- **set_field** target: `approval_date` — Timestamp of approval recorded
- **emit_event** event: `expense.approved`

**Result:** Expense approved, ready for accounting posting

### Expense_refused (Priority: 3)

**Given:**
- expense is in submitted state
- authorized approver refuses the expense

**Then:**
- **transition_state** field: `expense_state` from: `submitted` to: `refused`
- **set_field** target: `approval_date` — Refusal timestamp recorded
- **notify** — Employee notified of refusal
- **emit_event** event: `expense.refused`

**Result:** Expense rejected, employee notified

### Expense_posted (Priority: 4) — Error: `EXPENSE_ALREADY_POSTED`

**Given:**
- expense is approved
- accountant posts to accounting

**Then:**
- **create_record** target: `journal_entry` — Journal entry created with debit to expense account and credit to payable account (own_account) or vendor account (company_account)

- **transition_state** field: `expense_state` from: `approved` to: `posted`
- **emit_event** event: `expense.posted`

**Result:** Expense recorded in accounting, payment can proceed

### Expense_paid (Priority: 5)

**Given:**
- expense is posted
- reimbursement payment is processed and reconciled

**Then:**
- **transition_state** field: `expense_state` from: `in_payment` to: `paid`
- **set_field** target: `amount_residual` value: `0`
- **emit_event** event: `expense.paid`

**Result:** Employee fully reimbursed, expense cycle complete

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EXPENSE_SELF_APPROVAL` | 403 | You cannot approve your own expenses. Please ask another authorized approver. | No |
| `EXPENSE_NOT_AUTHORIZED` | 403 | You are not authorized to approve expenses for this employee. | No |
| `EXPENSE_ALREADY_POSTED` | 403 | This expense has been posted to accounting and cannot be edited. | No |
| `EXPENSE_DUPLICATE_DETECTED` | 400 | A similar expense already exists. Please verify this is not a duplicate. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `expense.submitted` | Employee submitted an expense for approval | `expense_id`, `employee_id`, `total_amount` |
| `expense.approved` | Expense approved by manager | `expense_id`, `approver_id`, `total_amount` |
| `expense.refused` | Expense refused by manager | `expense_id`, `approver_id`, `reason` |
| `expense.posted` | Expense posted to accounting | `expense_id`, `journal_entry_id` |
| `expense.paid` | Employee reimbursement completed | `expense_id`, `payment_id`, `amount` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| invoicing-payments | required | Expense posting creates journal entries in the accounting system |
| automation-rules | optional | Automate expense routing (e.g., auto-approve under threshold) |

## AGI Readiness

### Goals

#### Reliable Expense Approval

Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment processing.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `invoicing_payments` | invoicing-payments | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| expense_submitted | `autonomous` | - | - |
| expense_approved | `supervised` | - | - |
| expense_refused | `autonomous` | - | - |
| expense_posted | `autonomous` | - | - |
| expense_paid | `autonomous` | - | - |
| self_approval_blocked | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/odoo/odoo.git
  project: ERP system
  tech_stack: Python + JavaScript/OWL
  files_traced: 15
  entry_points:
    - addons/hr_expense/models/hr_expense.py
    - addons/hr_expense/models/hr_expense_sheet.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Expense Approval Blueprint",
  "description": "Employee expense submission and approval workflow with multi-level authorization, reimbursement tracking, accounting journal entry generation, and payment proce",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "expenses, approval-workflow, reimbursement, employee-expenses, accounting-integration"
}
</script>
